/**
 * Poppler request types and execution planning.
 * Responsibility: turn a typed rasterisation request into the exact argument vector for
 * pdftoppm, and nothing else. This module starts no process and touches no file.
 *
 * Architecture Notes
 * Planning is separated from running so the argument vector for any request is assertable in
 * a unit test without Poppler installed, which is the only practical way to keep flag order,
 * page selection and password handling under regression control. The password is passed as an
 * argument value and never included in a label, so diagnostics built from the label cannot
 * leak it.
 */
import path from 'node:path';
import { EngineError, EngineErrorCode } from '../engine.errors.js';
import type { PopplerImageFormat } from './poppler.capabilities.js';
import type { ProcessRunRequest } from '../../process/process.types.js';

export interface PopplerCropBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PopplerRasterRequest {
  /** Absolute path of the input PDF, always a workspace file. */
  readonly inputPath: string;
  /** Absolute directory the images are written into, always a workspace scope. */
  readonly outputDir: string;
  /** File name prefix, without directory and without extension. */
  readonly outputPrefix: string;
  readonly format: PopplerImageFormat;
  readonly dpi: number;
  /** First page, one based. Defaults to the first page of the document. */
  readonly firstPage?: number;
  /** Last page, one based and inclusive. */
  readonly lastPage?: number;
  readonly grayscale?: boolean;
  readonly monochrome?: boolean;
  /** JPEG quality, only meaningful for the jpeg format. */
  readonly jpegQuality?: number;
  readonly crop?: PopplerCropBox;
  /** User password for an encrypted document. Never logged. */
  readonly password?: string;
  readonly timeoutMs: number;
  readonly signal?: AbortSignal;
}

const MIN_DPI = 18;
const MAX_DPI = 600;
const MAX_PREFIX_LENGTH = 64;
const PREFIX_PATTERN = /^[A-Za-z0-9_-]+$/;

function invalid(message: string): EngineError {
  return new EngineError(message, {
    engineId: 'poppler',
    code: EngineErrorCode.ENGINE_INVALID_REQUEST,
  });
}

/** Validate a rasterisation request. Pure, runs before any process exists. */
export function validateRasterRequest(request: PopplerRasterRequest): void {
  if (!path.isAbsolute(request.inputPath)) throw invalid('inputPath must be absolute');
  if (!path.isAbsolute(request.outputDir)) throw invalid('outputDir must be absolute');
  if (!PREFIX_PATTERN.test(request.outputPrefix) || request.outputPrefix.length > MAX_PREFIX_LENGTH) {
    throw invalid('outputPrefix must be a short alphanumeric token');
  }
  if (!Number.isInteger(request.dpi) || request.dpi < MIN_DPI || request.dpi > MAX_DPI) {
    throw invalid(`dpi must be an integer between ${MIN_DPI} and ${MAX_DPI}`);
  }
  if (request.firstPage !== undefined && (!Number.isInteger(request.firstPage) || request.firstPage < 1)) {
    throw invalid('firstPage must be a positive integer');
  }
  if (request.lastPage !== undefined && (!Number.isInteger(request.lastPage) || request.lastPage < 1)) {
    throw invalid('lastPage must be a positive integer');
  }
  if (
    request.firstPage !== undefined &&
    request.lastPage !== undefined &&
    request.lastPage < request.firstPage
  ) {
    throw invalid('lastPage must not be smaller than firstPage');
  }
  if (request.grayscale === true && request.monochrome === true) {
    throw invalid('grayscale and monochrome are mutually exclusive');
  }
  if (
    request.jpegQuality !== undefined &&
    (!Number.isInteger(request.jpegQuality) || request.jpegQuality < 1 || request.jpegQuality > 100)
  ) {
    throw invalid('jpegQuality must be an integer between 1 and 100');
  }
  if (request.crop !== undefined) {
    const { x, y, width, height } = request.crop;
    for (const [name, value] of Object.entries({ x, y, width, height })) {
      if (!Number.isInteger(value) || value < 0) throw invalid(`crop.${name} must be a non negative integer`);
    }
    if (width === 0 || height === 0) throw invalid('crop width and height must be positive');
  }
  if (!Number.isInteger(request.timeoutMs) || request.timeoutMs <= 0) {
    throw invalid('timeoutMs must be a positive integer');
  }
  if (request.password !== undefined && request.password.includes('\0')) {
    throw invalid('password must not contain a null byte');
  }
}

/** Format flag for pdftoppm. */
function formatFlag(format: PopplerImageFormat): string {
  switch (format) {
    case 'png':
      return '-png';
    case 'jpeg':
      return '-jpeg';
    case 'tiff':
      return '-tiff';
  }
}

/** Build the argument vector, in a fixed and therefore testable order. */
export function buildRasterArgs(request: PopplerRasterRequest): string[] {
  const args: string[] = [formatFlag(request.format), '-r', String(request.dpi)];

  if (request.firstPage !== undefined) args.push('-f', String(request.firstPage));
  if (request.lastPage !== undefined) args.push('-l', String(request.lastPage));
  if (request.grayscale === true) args.push('-gray');
  if (request.monochrome === true) args.push('-mono');
  if (request.format === 'jpeg' && request.jpegQuality !== undefined) {
    args.push('-jpegopt', `quality=${request.jpegQuality}`);
  }
  if (request.crop !== undefined) {
    args.push(
      '-x',
      String(request.crop.x),
      '-y',
      String(request.crop.y),
      '-W',
      String(request.crop.width),
      '-H',
      String(request.crop.height),
    );
  }
  if (request.password !== undefined && request.password.length > 0) {
    args.push('-upw', request.password);
  }

  args.push(request.inputPath, path.join(request.outputDir, request.outputPrefix));
  return args;
}

/** Assemble the full run request for the Process Runner. */
export function buildRasterRunRequest(
  binary: string,
  request: PopplerRasterRequest,
): ProcessRunRequest {
  return {
    binary,
    args: buildRasterArgs(request),
    cwd: request.outputDir,
    timeoutMs: request.timeoutMs,
    killGraceMs: 2_000,
    // Poppler needs no environment. An empty one removes locale and font path surprises.
    env: {},
    maxStdoutBytes: 65_536,
    maxStderrBytes: 65_536,
    ...(request.signal === undefined ? {} : { signal: request.signal }),
    label: 'poppler.pdftoppm',
  };
}

/** Argument vector for a pdfinfo document inspection. */
export function buildInfoRunRequest(
  binary: string,
  input: { readonly inputPath: string; readonly cwd: string; readonly timeoutMs: number; readonly password?: string },
): ProcessRunRequest {
  if (!path.isAbsolute(input.inputPath)) throw invalid('inputPath must be absolute');
  const args: string[] = [];
  if (input.password !== undefined && input.password.length > 0) args.push('-upw', input.password);
  args.push(input.inputPath);
  return {
    binary,
    args,
    cwd: input.cwd,
    timeoutMs: input.timeoutMs,
    env: {},
    maxStdoutBytes: 65_536,
    maxStderrBytes: 65_536,
    label: 'poppler.pdfinfo',
  };
}
