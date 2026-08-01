/**
 * Poppler binary locator.
 * Responsibility: resolve the absolute path of a Poppler binary by searching PATH and the
 * standard install directories, rejecting anything that is not a real executable file.
 *
 * Architecture Notes
 * The Process Runner refuses relative binaries by design, so something must turn the name
 * "pdftoppm" into an absolute path. Doing it here, with an explicit allowlist of names and a
 * stat plus executable bit check, means a poisoned PATH entry or a directory named like a
 * binary cannot become an execution target. Results are cached because the filesystem of a
 * container image does not change while the process runs.
 */
import { constants } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import path from 'node:path';
import { EngineError, EngineErrorCode } from '../engine.errors.js';

/** Poppler binaries the platform is allowed to execute. */
export const POPPLER_BINARIES = Object.freeze(['pdftoppm', 'pdftocairo', 'pdfinfo'] as const);

export type PopplerBinaryName = (typeof POPPLER_BINARIES)[number];

/** Directories searched after PATH, covering the common distribution layouts. */
const FALLBACK_DIRECTORIES = Object.freeze(['/usr/bin', '/usr/local/bin', '/opt/homebrew/bin']);

export class PopplerBinaryLocator {
  private readonly cache = new Map<PopplerBinaryName, string>();
  private readonly pathValue: string;

  constructor(pathValue: string = process.env['PATH'] ?? '') {
    this.pathValue = pathValue;
  }

  /** Resolve a binary, returning undefined when it is not installed. */
  public async find(name: PopplerBinaryName): Promise<string | undefined> {
    const cached = this.cache.get(name);
    if (cached !== undefined) return cached;

    for (const directory of this.searchDirectories()) {
      const candidate = path.join(directory, name);
      if (!(await isExecutableFile(candidate))) continue;
      if (path.basename(candidate) !== name) continue;
      this.cache.set(name, candidate);
      return candidate;
    }
    return undefined;
  }

  /** Resolve a binary or throw ENGINE_NOT_INSTALLED. */
  public async require(name: PopplerBinaryName): Promise<string> {
    const found = await this.find(name);
    if (found === undefined) {
      throw new EngineError(`Poppler binary "${name}" is not installed`, {
        engineId: 'poppler',
        code: EngineErrorCode.ENGINE_NOT_INSTALLED,
      });
    }
    return found;
  }

  /** Resolve every known binary, omitting the ones that are missing. */
  public async findAll(): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {};
    for (const name of POPPLER_BINARIES) {
      const found = await this.find(name);
      if (found !== undefined) resolved[name] = found;
    }
    return resolved;
  }

  /** Drop the cache. Used by tests and after an image level change. */
  public reset(): void {
    this.cache.clear();
  }

  /** Absolute, de duplicated search directories in priority order. */
  private searchDirectories(): string[] {
    const fromPath = this.pathValue
      .split(path.delimiter)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0 && !entry.includes('\0') && path.isAbsolute(entry));
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const directory of [...fromPath, ...FALLBACK_DIRECTORIES]) {
      const normalized = path.normalize(directory);
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      ordered.push(normalized);
    }
    return ordered;
  }
}

async function isExecutableFile(candidate: string): Promise<boolean> {
  if (candidate.includes('\0')) return false;
  try {
    const info = await stat(candidate);
    if (!info.isFile()) return false;
    await access(candidate, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
