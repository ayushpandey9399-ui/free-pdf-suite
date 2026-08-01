/**
 * PDF to Images dispatcher.
 * Responsibility: run one accepted job to completion: resolve the engine for the capability
 * the tool manifest requires, plan and execute the rasterisation through the engine adapter
 * and the Process Runner, normalise the produced file names inside the workspace, verify the
 * artefacts, and report metrics.
 *
 * Architecture Notes
 * This class is the only place in the tool that knows an engine exists, and it never names
 * one: the engine is whichever registered adapter provides the capability the manifest asks
 * for, so replacing the rasteriser is a registry change rather than a tool rewrite. It never
 * builds a command line and never spawns anything itself, because the adapter owns argument
 * vectors and the Process Runner owns process lifetime, signals and the kill of a whole
 * process tree. Every path it touches is derived from the Workspace Manager, so an untrusted
 * document cannot influence where bytes are written, and the output names it produces carry no
 * trace of the uploaded file name. Page selections that are not contiguous need one engine run
 * per interval, since a single pdftoppm invocation accepts exactly one range, and the time
 * budget of the manifest is shared across those runs so a request cannot exceed it by splitting
 * itself into many.
 */
import { rename, stat } from 'node:fs/promises';
import path from 'node:path';
import { AppError, isAppError } from '../../core/errors.js';
import { isEngineError } from '../../platform/engines/engine.errors.js';
import type { EngineAdapter, EngineCapabilityId } from '../../platform/engines/engine.types.js';
import type { EngineRegistry } from '../../platform/engines/engine.registry.js';
import type {
  PopplerRasterOutput,
  PopplerRasterRequest,
} from '../../platform/engines/poppler/index.js';
import type { ProcessRunner } from '../../platform/process/process.types.js';
import type { ToolManifest, ToolRegistry } from '../registry/registry.types.js';
import type { WorkspaceManager } from '../workspace/workspace.manager.js';
import { pdfToImagesErrors } from './pdf-to-images.errors.js';
import { PDF_TO_IMAGES_SLUG } from './pdf-to-images.schema.js';
import {
  ALLOWED_DPI,
  ALLOWED_FORMATS,
  ALLOWED_QUALITY,
  type AllowedFormat,
  type PageInterval,
} from './pdf-to-images.types.js';
import {
  conversionErrors,
  mapEngineError,
  type ConversionImage,
  type ConversionRequest,
  type ConversionResult,
} from './pdf-to-images.conversion.js';
import type { PdfToImagesLogger } from './pdf-to-images.service.js';

/** Scope every produced image is written into. Never outside the workspace. */
const OUTPUT_SCOPE = 'outputs' as const;
/** Digits used by the public file names, so page-0001 sorts lexically. */
const NAME_DIGITS = 4;
/** File extension the public names use, per format. */
const PUBLIC_EXTENSION: Readonly<Record<AllowedFormat, string>> = Object.freeze({
  png: '.png',
  jpeg: '.jpg',
});
/** Extensions the engine may legitimately produce, per format. */
const ACCEPTED_EXTENSIONS: Readonly<Record<AllowedFormat, readonly string[]>> = Object.freeze({
  png: ['.png'],
  jpeg: ['.jpg', '.jpeg'],
});

/** Engine facing view of a rasterising adapter. */
type RasterAdapter = EngineAdapter<PopplerRasterRequest, PopplerRasterOutput>;

export interface PdfToImagesDispatcherOptions {
  readonly registry: ToolRegistry;
  readonly engines: EngineRegistry;
  readonly workspaces: WorkspaceManager;
  readonly runner: ProcessRunner;
  readonly logger?: PdfToImagesLogger;
  /** Injected for deterministic duration assertions in tests. */
  readonly now?: () => number;
}

export class PdfToImagesDispatcher {
  private readonly registry: ToolRegistry;
  private readonly engines: EngineRegistry;
  private readonly workspaces: WorkspaceManager;
  private readonly runner: ProcessRunner;
  private readonly logger?: PdfToImagesLogger;
  private readonly now: () => number;

  constructor(options: PdfToImagesDispatcherOptions) {
    this.registry = options.registry;
    this.engines = options.engines;
    this.workspaces = options.workspaces;
    this.runner = options.runner;
    this.logger = options.logger;
    this.now = options.now ?? Date.now;
  }

  /** Manifest of this tool, always read from the registry. */
  public manifest(): ToolManifest {
    const manifest = this.registry.get(PDF_TO_IMAGES_SLUG);
    if (manifest === undefined) throw pdfToImagesErrors.toolNotRegistered();
    if (!manifest.enabled) throw pdfToImagesErrors.toolDisabled();
    return manifest;
  }

  /** Convert the uploaded PDF of one workspace into images. */
  public async convert(request: ConversionRequest): Promise<ConversionResult> {
    const manifest = this.manifest();
    this.assertSupportedOptions(request);

    const capability = requiredCapability(manifest);
    const engine = await this.resolveEngine(capability);

    const inputPath = this.workspaces.pathOf(request.fileId);
    const outputDir = this.workspaces.scopePathOf(request.workspaceId, OUTPUT_SCOPE);
    const budgetMs = manifest.limits.timeoutMs;
    const startedAtMs = this.now();
    const format = request.options.format;

    const runs = this.plannedRuns(request.options.pages.intervals);
    const produced: { readonly page: number; readonly path: string; readonly name: string }[] = [];

    try {
      for (const [index, interval] of runs.entries()) {
        this.assertNotCancelled(request.signal);
        const remainingMs = budgetMs - (this.now() - startedAtMs);
        if (remainingMs <= 0) throw conversionErrors.timeout();

        const rasterRequest: PopplerRasterRequest = {
          inputPath,
          outputDir,
          outputPrefix: runPrefix(index),
          format,
          dpi: request.options.dpi,
          timeoutMs: Math.floor(remainingMs),
          ...(interval === undefined ? {} : { firstPage: interval.start, lastPage: interval.end }),
          ...(format === 'jpeg' ? { jpegQuality: request.options.quality } : {}),
          ...(request.options.password === undefined
            ? {}
            : { password: request.options.password }),
          ...(request.signal === undefined ? {} : { signal: request.signal }),
        };

        const output = await engine.adapter.execute(rasterRequest, this.runner);
        for (const file of output.files) {
          if (file.page === undefined) {
            throw conversionErrors.invalidOutput('an image has no page number');
          }
          produced.push({ page: file.page, path: file.path, name: file.name });
        }
      }

      const images = await this.publishOutputs(produced, format, outputDir);
      const durationMs = Math.max(0, this.now() - startedAtMs);
      const outputBytes = images.reduce((total, image) => total + image.sizeBytes, 0);

      this.logger?.info(
        {
          tool: PDF_TO_IMAGES_SLUG,
          requestId: request.requestId,
          workspaceId: request.workspaceId,
          engine: engine.id,
          durationMs,
          pages: images.map((image) => image.page).join(','),
          pagesConverted: images.length,
          imageCount: images.length,
          outputBytes,
          dpi: request.options.dpi,
          format,
          runCount: runs.length,
        },
        'pdf-to-images conversion completed',
      );

      return {
        workspaceId: request.workspaceId,
        engineId: engine.id,
        format,
        dpi: request.options.dpi,
        images: Object.freeze(images),
        metrics: Object.freeze({
          durationMs,
          imageCount: images.length,
          outputBytes,
          pagesConverted: images.length,
          dpi: request.options.dpi,
          format,
          runCount: runs.length,
        }),
      };
    } catch (error) {
      const mapped = this.normalise(error);
      this.logger?.warn(
        {
          tool: PDF_TO_IMAGES_SLUG,
          requestId: request.requestId,
          workspaceId: request.workspaceId,
          engine: engine.id,
          durationMs: Math.max(0, this.now() - startedAtMs),
          dpi: request.options.dpi,
          format,
          code: mapped.code,
        },
        'pdf-to-images conversion failed',
      );
      throw mapped;
    }
  }

  /** Options are validated again here, because a dispatcher may be driven by a queue. */
  private assertSupportedOptions(request: ConversionRequest): void {
    const { dpi, format, quality, pages } = request.options;
    if (!ALLOWED_DPI.includes(dpi)) {
      throw conversionErrors.invalidOptions(`dpi ${String(dpi)} is not allowed`);
    }
    if (!ALLOWED_FORMATS.includes(format)) {
      throw conversionErrors.invalidOptions('the output format is not allowed');
    }
    if (format === 'jpeg' && !ALLOWED_QUALITY.includes(quality)) {
      throw conversionErrors.invalidOptions('the JPEG quality is not allowed');
    }
    if (!pages.allPages && pages.intervals.length === 0) {
      throw conversionErrors.invalidOptions('the page selection is empty');
    }
  }

  /**
   * One planned run per contiguous interval, or a single unbounded run for the whole document.
   * undefined means "no page bounds", which is how the engine expresses every page.
   */
  private plannedRuns(
    intervals: readonly PageInterval[],
  ): readonly (PageInterval | undefined)[] {
    if (intervals.length === 0) return [undefined];
    return intervals;
  }

  /** Resolve the first installed engine that provides the capability the manifest requires. */
  private async resolveEngine(
    capability: EngineCapabilityId,
  ): Promise<{ readonly id: string; readonly adapter: RasterAdapter }> {
    const providers = this.engines.providersOf(capability);
    if (providers.length === 0) throw conversionErrors.engineUnavailable(capability);

    let lastDetail: unknown;
    for (const provider of providers) {
      try {
        const health = await provider.health();
        if (!health.installed) {
          lastDetail = health.detail;
          continue;
        }
        return { id: provider.id, adapter: provider as unknown as RasterAdapter };
      } catch (error) {
        lastDetail = error;
      }
    }
    throw conversionErrors.engineUnavailable(capability, lastDetail);
  }

  private assertNotCancelled(signal: AbortSignal | undefined): void {
    if (signal?.aborted === true) throw conversionErrors.cancelled();
  }

  /**
   * Give every produced image its public name.
   * Engine names carry the engine's own padding and a run prefix, so they are renamed inside
   * the same workspace directory to a stable, zero padded, sequential scheme.
   */
  private async publishOutputs(
    produced: readonly { readonly page: number; readonly path: string; readonly name: string }[],
    format: AllowedFormat,
    outputDir: string,
  ): Promise<ConversionImage[]> {
    if (produced.length === 0) throw conversionErrors.emptyOutput();

    const accepted = ACCEPTED_EXTENSIONS[format];
    const ordered = [...produced].sort((a, b) => a.page - b.page);
    const images: ConversionImage[] = [];

    for (const [offset, file] of ordered.entries()) {
      const extension = path.extname(file.name).toLowerCase();
      if (!accepted.includes(extension)) {
        throw conversionErrors.invalidOutput('an image has an unexpected format');
      }
      const index = offset + 1;
      const name = `page-${String(index).padStart(NAME_DIGITS, '0')}${PUBLIC_EXTENSION[format]}`;
      const target = path.join(outputDir, name);
      if (!isInside(outputDir, target) || !isInside(outputDir, file.path)) {
        throw conversionErrors.invalidOutput('an image resolved outside the workspace');
      }
      if (target !== file.path) await rename(file.path, target);

      const info = await stat(target);
      if (!info.isFile() || info.size === 0) {
        throw conversionErrors.invalidOutput('an image is empty');
      }
      images.push({ name, index, page: file.page, sizeBytes: info.size });
    }

    assertSequential(images);
    return images;
  }

  /** Every thrown value becomes an AppError with a stable reason. */
  private normalise(error: unknown): AppError {
    if (isAppError(error)) return error;
    if (isEngineError(error)) return mapEngineError(error);
    return conversionErrors.failed(error);
  }
}

/** Capability the manifest requires, which is what the registry routes on. */
function requiredCapability(manifest: ToolManifest): EngineCapabilityId {
  const capability = manifest.requires[0];
  if (capability === undefined) {
    throw conversionErrors.invalidOptions('the tool declares no engine capability');
  }
  return capability;
}

/** Unique, non overlapping prefix for one engine run inside a shared output directory. */
function runPrefix(index: number): string {
  return `raw${String(index + 1).padStart(3, '0')}`;
}

function isInside(directory: string, candidate: string): boolean {
  const resolved = path.resolve(candidate);
  return resolved === path.resolve(directory) || resolved.startsWith(path.resolve(directory) + path.sep);
}

/** The published names must be 1..N with no gap, which is what a client relies on. */
function assertSequential(images: readonly ConversionImage[]): void {
  images.forEach((image, offset) => {
    if (image.index !== offset + 1) {
      throw conversionErrors.invalidOutput('the image numbering is not sequential');
    }
  });
}
