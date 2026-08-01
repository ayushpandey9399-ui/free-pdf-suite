/**
 * Poppler engine adapter.
 * Responsibility: implement the EngineAdapter contract for Poppler: report health, validate a
 * rasterisation request against the installed build, plan the pdftoppm invocation, and turn a
 * finished run into a verified list of output files.
 *
 * Architecture Notes
 * This is the first real adapter and it sets the pattern the rest follow. It never spawns a
 * process itself, so its argument vectors are unit testable without Poppler present; it
 * verifies artefacts on disk instead of trusting an exit code, because pdftoppm can exit zero
 * having written nothing; and it validates against detected build capabilities so an option a
 * given build lacks fails as a clear unsupported operation rather than a usage error surfaced
 * mid request.
 */
import { EngineError, EngineErrorCode } from '../engine.errors.js';
import type {
  EngineAdapter,
  EngineCapabilityId,
  EngineHealth,
  EngineId,
} from '../engine.types.js';
import type { ProcessRunRequest, ProcessRunResult, ProcessRunner } from '../../process/process.types.js';
import { PopplerBinaryLocator } from './poppler.binary.js';
import { POPPLER_CAPABILITIES, supportsFormat } from './poppler.capabilities.js';
import type { PopplerCapabilities } from './poppler.capabilities.js';
import { PopplerHealthProbe } from './poppler.health.js';
import type { PopplerHealthReport } from './poppler.health.js';
import {
  buildInfoRunRequest,
  buildRasterRunRequest,
  validateRasterRequest,
} from './poppler.execution.js';
import type { PopplerRasterRequest } from './poppler.execution.js';
import {
  collectRasterOutput,
  parseDocumentInfo,
} from './poppler.parser.js';
import type { PopplerDocumentInfo, PopplerRasterOutput } from './poppler.parser.js';
import { emptyOutputError, toPopplerError } from './poppler.errors.js';

export interface PopplerAdapterOptions {
  readonly locator?: PopplerBinaryLocator;
  readonly healthProbe?: PopplerHealthProbe;
  /** Runner used by health() and by the document inspection helper. */
  readonly runner?: ProcessRunner;
}

export class PopplerAdapter implements EngineAdapter<PopplerRasterRequest, PopplerRasterOutput> {
  public readonly id: EngineId = 'poppler';
  public readonly capabilities: readonly EngineCapabilityId[] = POPPLER_CAPABILITIES;

  private readonly locator: PopplerBinaryLocator;
  private readonly healthProbe: PopplerHealthProbe;
  private readonly defaultRunner: ProcessRunner | undefined;

  constructor(options: PopplerAdapterOptions = {}) {
    this.locator = options.locator ?? new PopplerBinaryLocator();
    this.healthProbe =
      options.healthProbe ?? new PopplerHealthProbe({ locator: this.locator });
    this.defaultRunner = options.runner;
  }

  /** Health of the installation. Resolves even when Poppler is absent. */
  public async health(): Promise<EngineHealth> {
    const runner = this.defaultRunner;
    if (runner === undefined) {
      const binaries = await this.locator.findAll();
      return {
        engineId: this.id,
        installed: false,
        version: '',
        binaries,
        capabilities: [],
        lastCheckedMs: Date.now(),
        detail: 'No process runner is configured, so the installation could not be probed',
      };
    }
    return this.healthProbe.check(runner);
  }

  /** Structural validation only. Build specific checks happen in plan(). */
  public validate(request: PopplerRasterRequest): void {
    validateRasterRequest(request);
  }

  /** Build the pdftoppm invocation, after confirming the build supports the request. */
  public async plan(request: PopplerRasterRequest): Promise<ProcessRunRequest> {
    this.validate(request);
    const binary = await this.locator.require('pdftoppm');
    const build = await this.buildCapabilities();
    if (build !== undefined) this.assertBuildSupports(request, build);
    return buildRasterRunRequest(binary, request);
  }

  /** Verify the artefacts a finished run produced. */
  public async parse(
    result: ProcessRunResult,
    request: PopplerRasterRequest,
  ): Promise<PopplerRasterOutput> {
    if (result.outcome !== 'completed' || (result.exitCode ?? 1) !== 0) {
      throw toPopplerError(result);
    }

    const output = await collectRasterOutput({
      outputDir: request.outputDir,
      outputPrefix: request.outputPrefix,
      format: request.format,
      expectedPages: expectedPages(request),
    });

    if (output.pageCount === 0 || output.totalBytes === 0) throw emptyOutputError();
    if (output.missingPages.length > 0) {
      throw new EngineError('Poppler did not produce every requested page', {
        engineId: this.id,
        code: EngineErrorCode.INPUT_PAGE_OUT_OF_RANGE,
        exitCode: result.exitCode,
      });
    }
    return output;
  }

  /** validate, plan, run, parse. */
  public async execute(
    request: PopplerRasterRequest,
    runner: ProcessRunner,
  ): Promise<PopplerRasterOutput> {
    const runRequest = await this.plan(request);
    const result = await runner.run(runRequest);
    return this.parse(result, request);
  }

  /** Read document metadata with pdfinfo. Used for page counts and encryption checks. */
  public async inspect(
    input: {
      readonly inputPath: string;
      readonly cwd: string;
      readonly timeoutMs: number;
      readonly password?: string;
    },
    runner: ProcessRunner,
  ): Promise<PopplerDocumentInfo> {
    const binary = await this.locator.require('pdfinfo');
    const result = await runner.run(buildInfoRunRequest(binary, input));
    if (result.outcome !== 'completed' || (result.exitCode ?? 1) !== 0) {
      throw toPopplerError(result);
    }
    const info = parseDocumentInfo(result.stdout);
    if (info.pages <= 0) {
      throw new EngineError('The PDF reports no pages', {
        engineId: this.id,
        code: EngineErrorCode.INPUT_CORRUPT,
        exitCode: result.exitCode,
      });
    }
    return info;
  }

  /** Detected build flags, or undefined when they could not be probed. */
  private async buildCapabilities(): Promise<PopplerCapabilities | undefined> {
    const runner = this.defaultRunner;
    if (runner === undefined) return undefined;
    const report = (await this.healthProbe.check(runner)) as PopplerHealthReport;
    return report.installed ? report.build : undefined;
  }

  private assertBuildSupports(
    request: PopplerRasterRequest,
    build: PopplerCapabilities,
  ): void {
    const unsupported = (what: string): EngineError =>
      new EngineError(`The installed Poppler build does not support ${what}`, {
        engineId: this.id,
        code: EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION,
      });

    if (!supportsFormat(build, request.format)) throw unsupported(`${request.format} output`);
    if (!build.resolution) throw unsupported('resolution selection');
    if ((request.firstPage !== undefined || request.lastPage !== undefined) && !build.pageSelection) {
      throw unsupported('page range selection');
    }
    if (request.grayscale === true && !build.grayscale) throw unsupported('grayscale output');
    if (request.monochrome === true && !build.monochrome) throw unsupported('monochrome output');
    if (request.crop !== undefined && !build.cropping) throw unsupported('cropping');
    if (request.password !== undefined && request.password.length > 0 && !build.password) {
      throw unsupported('password protected documents');
    }
  }
}

/** Pages the request explicitly asked for, when the range is fully bounded. */
function expectedPages(request: PopplerRasterRequest): readonly number[] | undefined {
  const { firstPage, lastPage } = request;
  if (firstPage === undefined || lastPage === undefined) return undefined;
  const pages: number[] = [];
  for (let page = firstPage; page <= lastPage; page += 1) pages.push(page);
  return pages;
}
