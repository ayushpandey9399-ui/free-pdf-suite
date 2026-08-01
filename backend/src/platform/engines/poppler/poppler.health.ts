/**
 * Poppler health probe.
 * Responsibility: answer whether Poppler is usable, at which version, from which paths, and
 * with which capabilities, without ever exposing raw binary output.
 *
 * Architecture Notes
 * Health is probed through the injected Process Runner rather than a direct spawn, so the
 * probe obeys the same timeout, output ceiling and process group rules as real work. The
 * result is cached for a short window because readiness endpoints are polled frequently and a
 * version probe is a process spawn, which is far too expensive to repeat per request.
 */
import { EMPTY_POPPLER_CAPABILITIES, POPPLER_CAPABILITIES, detectPopplerCapabilities } from './poppler.capabilities.js';
import type { PopplerCapabilities } from './poppler.capabilities.js';
import { PopplerBinaryLocator } from './poppler.binary.js';
import type { EngineHealth } from '../engine.types.js';
import type { ProcessRunner } from '../../process/process.types.js';

/** Version probes are cheap to cache and expensive to repeat. */
export const POPPLER_HEALTH_CACHE_MS = 60_000;

const PROBE_TIMEOUT_MS = 5_000;
const VERSION_PATTERN = /(\d+(?:\.\d+)+)/;

export interface PopplerHealthReport extends EngineHealth {
  readonly engineId: 'poppler';
  /** Detected build capabilities, empty when the engine is not installed. */
  readonly build: PopplerCapabilities;
}

export interface PopplerHealthProbeOptions {
  readonly locator?: PopplerBinaryLocator;
  readonly cacheMs?: number;
  readonly now?: () => number;
}

export class PopplerHealthProbe {
  private readonly locator: PopplerBinaryLocator;
  private readonly cacheMs: number;
  private readonly now: () => number;
  private cached?: PopplerHealthReport;

  constructor(options: PopplerHealthProbeOptions = {}) {
    this.locator = options.locator ?? new PopplerBinaryLocator();
    this.cacheMs = options.cacheMs ?? POPPLER_HEALTH_CACHE_MS;
    this.now = options.now ?? Date.now;
  }

  /** Cached report when fresh, a new probe otherwise. Never throws. */
  public async check(runner: ProcessRunner): Promise<PopplerHealthReport> {
    const cached = this.cached;
    if (cached !== undefined && this.now() - cached.lastCheckedMs < this.cacheMs) {
      return cached;
    }
    const report = await this.probe(runner);
    this.cached = report;
    return report;
  }

  /** Drop the cache, forcing the next check to probe. */
  public reset(): void {
    this.cached = undefined;
    this.locator.reset();
  }

  private async probe(runner: ProcessRunner): Promise<PopplerHealthReport> {
    const binaries = await this.locator.findAll();
    const raster = binaries['pdftoppm'];
    if (raster === undefined) {
      return this.unusable(binaries, 'pdftoppm was not found in PATH or the standard directories');
    }

    let version = '';
    let build = EMPTY_POPPLER_CAPABILITIES;
    try {
      const versionRun = await runner.run({
        binary: raster,
        args: ['-v'],
        cwd: '/',
        timeoutMs: PROBE_TIMEOUT_MS,
        env: {},
        maxStdoutBytes: 16_384,
        maxStderrBytes: 16_384,
        label: 'poppler.version',
      });
      version = extractVersion(`${versionRun.stdout}\n${versionRun.stderr}`);

      const helpRun = await runner.run({
        binary: raster,
        args: ['-h'],
        cwd: '/',
        timeoutMs: PROBE_TIMEOUT_MS,
        env: {},
        maxStdoutBytes: 65_536,
        maxStderrBytes: 65_536,
        label: 'poppler.help',
      });
      build = detectPopplerCapabilities(`${helpRun.stdout}\n${helpRun.stderr}`);
    } catch {
      return this.unusable(binaries, 'pdftoppm was found but did not answer a version probe');
    }

    if (version === '' || build.formats.length === 0) {
      return this.unusable(binaries, 'pdftoppm answered but reported no usable raster format');
    }

    return {
      engineId: 'poppler',
      installed: true,
      version,
      binaries: Object.freeze({ ...binaries }),
      capabilities: POPPLER_CAPABILITIES,
      lastCheckedMs: this.now(),
      build,
    };
  }

  private unusable(binaries: Record<string, string>, detail: string): PopplerHealthReport {
    return {
      engineId: 'poppler',
      installed: false,
      version: '',
      binaries: Object.freeze({ ...binaries }),
      capabilities: [],
      lastCheckedMs: this.now(),
      detail,
      build: EMPTY_POPPLER_CAPABILITIES,
    };
  }
}

/**
 * Pull a dotted numeric version out of probe output.
 * Only digits and dots are ever returned, so build banners and paths cannot leak.
 */
export function extractVersion(output: string): string {
  const match = VERSION_PATTERN.exec(output);
  return match?.[1] ?? '';
}
