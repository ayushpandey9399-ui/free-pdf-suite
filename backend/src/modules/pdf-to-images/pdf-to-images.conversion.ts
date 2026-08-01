/**
 * PDF to Images conversion contracts and error mapping.
 * Responsibility: describe what a conversion run is asked to do, what it reports back, and
 * how an engine level failure becomes a stable platform error. No process, no file system and
 * no HTTP knowledge lives here.
 *
 * Architecture Notes
 * The execution pipeline needs a vocabulary that is independent of Poppler, because the
 * engine behind the "pdf.raster" capability is a registry decision and may change without the
 * tool changing. Keeping the request, the result, the metrics and the error translation in one
 * contracts file is what lets the dispatcher be reviewed as orchestration only. The mapping
 * table is deliberately total over EngineErrorCode: every engine failure has exactly one
 * client facing reason, so no Linux message, stderr fragment, stack or binary path can reach a
 * response by accident.
 */
import { AppError, ErrorCode, type ErrorCodeValue } from '../../core/errors.js';
import { HttpStatus, type HttpStatusValue } from '../../shared/http-status.js';
import { EngineErrorCode, type EngineError } from '../../platform/engines/engine.errors.js';
import type { AllowedDpi, AllowedFormat, PdfToImagesOptions } from './pdf-to-images.types.js';

/** One conversion job, addressed by workspace and file rather than by path. */
export interface ConversionRequest {
  /** Correlation id of the originating HTTP request. */
  readonly requestId: string;
  readonly workspaceId: string;
  /** Workspace file id of the uploaded PDF. */
  readonly fileId: string;
  readonly options: PdfToImagesOptions;
  /** Caller controlled cancellation, honoured down to the process tree. */
  readonly signal?: AbortSignal;
}

/** One produced image, named relative to the workspace output directory. */
export interface ConversionImage {
  /** Final file name, for example page-0001.png. Never the original file name. */
  readonly name: string;
  /** Sequential index of the image in the result, one based. */
  readonly index: number;
  /** Source page number in the document. */
  readonly page: number;
  readonly sizeBytes: number;
}

/** Numbers worth recording for every run, safe to log and to expose. */
export interface ConversionMetrics {
  readonly durationMs: number;
  readonly imageCount: number;
  readonly outputBytes: number;
  readonly pagesConverted: number;
  readonly dpi: AllowedDpi;
  readonly format: AllowedFormat;
  /** Number of engine invocations, one per contiguous page interval. */
  readonly runCount: number;
}

export interface ConversionResult {
  readonly workspaceId: string;
  /** Engine that produced the images, resolved from the registry by capability. */
  readonly engineId: string;
  readonly format: AllowedFormat;
  readonly dpi: AllowedDpi;
  readonly images: readonly ConversionImage[];
  readonly metrics: ConversionMetrics;
}

/** Stable reasons the execution pipeline can return. */
export const ConversionError = {
  ENGINE_UNAVAILABLE: 'ENGINE_UNAVAILABLE',
  INVALID_OPTIONS: 'INVALID_OPTIONS',
  INVALID_PDF: 'INVALID_PDF',
  INVALID_PAGE_RANGE: 'INVALID_PAGE_RANGE',
  PASSWORD_INCORRECT: 'PASSWORD_INCORRECT',
  CONVERSION_TIMEOUT: 'CONVERSION_TIMEOUT',
  CONVERSION_CANCELLED: 'CONVERSION_CANCELLED',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  OUTPUT_EMPTY: 'OUTPUT_EMPTY',
  OUTPUT_INVALID: 'OUTPUT_INVALID',
  RESOURCE_EXHAUSTED: 'RESOURCE_EXHAUSTED',
} as const;

export type ConversionErrorReason = (typeof ConversionError)[keyof typeof ConversionError];

function build(
  reason: ConversionErrorReason,
  message: string,
  code: ErrorCodeValue,
  status: HttpStatusValue,
  cause?: unknown,
): AppError {
  return new AppError(message, {
    code,
    status,
    details: { reason },
    cause,
    expected: code !== ErrorCode.E_INTERNAL,
  });
}

export const conversionErrors = {
  engineUnavailable: (capability: string, cause?: unknown): AppError =>
    new AppError('No conversion engine is available on this instance', {
      code: ErrorCode.E_UNAVAILABLE,
      status: HttpStatus.SERVICE_UNAVAILABLE,
      details: { reason: ConversionError.ENGINE_UNAVAILABLE, capability },
      cause,
    }),

  invalidOptions: (detail: string): AppError =>
    build(
      ConversionError.INVALID_OPTIONS,
      `The conversion options are not supported: ${detail}`,
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
    ),

  invalidPdf: (cause?: unknown): AppError =>
    build(
      ConversionError.INVALID_PDF,
      'The PDF could not be read and may be damaged',
      ErrorCode.E_UNSUPPORTED_INPUT,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      cause,
    ),

  invalidPageRange: (cause?: unknown): AppError =>
    build(
      ConversionError.INVALID_PAGE_RANGE,
      'The requested pages do not exist in this document',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      cause,
    ),

  passwordIncorrect: (cause?: unknown): AppError =>
    build(
      ConversionError.PASSWORD_INCORRECT,
      'The password for this PDF is missing or incorrect',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      cause,
    ),

  timeout: (cause?: unknown): AppError =>
    build(
      ConversionError.CONVERSION_TIMEOUT,
      'The conversion took longer than the time budget for this tool',
      ErrorCode.E_UNAVAILABLE,
      HttpStatus.SERVICE_UNAVAILABLE,
      cause,
    ),

  cancelled: (cause?: unknown): AppError =>
    build(
      ConversionError.CONVERSION_CANCELLED,
      'The conversion was cancelled',
      ErrorCode.E_BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      cause,
    ),

  resourceExhausted: (cause?: unknown): AppError =>
    build(
      ConversionError.RESOURCE_EXHAUSTED,
      'The document needs more resources than this instance allows',
      ErrorCode.E_UNAVAILABLE,
      HttpStatus.SERVICE_UNAVAILABLE,
      cause,
    ),

  emptyOutput: (cause?: unknown): AppError =>
    build(
      ConversionError.OUTPUT_EMPTY,
      'The conversion produced no images',
      ErrorCode.E_INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
      cause,
    ),

  invalidOutput: (detail: string): AppError =>
    new AppError('The conversion produced an unexpected result', {
      code: ErrorCode.E_INTERNAL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      details: { reason: ConversionError.OUTPUT_INVALID, detail },
      expected: false,
    }),

  failed: (cause?: unknown): AppError =>
    build(
      ConversionError.CONVERSION_FAILED,
      'The PDF could not be converted to images',
      ErrorCode.E_INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
      cause,
    ),
};

/**
 * Translate an engine failure into a platform error.
 * The engine error itself travels only as the cause, so it reaches logs and never a client.
 */
export function mapEngineError(error: EngineError): AppError {
  switch (error.code) {
    case EngineErrorCode.INPUT_ENCRYPTED:
      return conversionErrors.passwordIncorrect(error);
    case EngineErrorCode.INPUT_CORRUPT:
    case EngineErrorCode.INPUT_NOT_SUPPORTED:
      return conversionErrors.invalidPdf(error);
    case EngineErrorCode.INPUT_PAGE_OUT_OF_RANGE:
      return conversionErrors.invalidPageRange(error);
    case EngineErrorCode.ENGINE_TIMEOUT:
      return conversionErrors.timeout(error);
    case EngineErrorCode.ENGINE_ABORTED:
      return conversionErrors.cancelled(error);
    case EngineErrorCode.ENGINE_RESOURCE_EXHAUSTED:
      return conversionErrors.resourceExhausted(error);
    case EngineErrorCode.ENGINE_EMPTY_OUTPUT:
      return conversionErrors.emptyOutput(error);
    case EngineErrorCode.ENGINE_NOT_INSTALLED:
    case EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION:
      return conversionErrors.engineUnavailable(error.engineId, error);
    case EngineErrorCode.ENGINE_INVALID_REQUEST:
    case EngineErrorCode.ENGINE_FAILED:
    default:
      return conversionErrors.failed(error);
  }
}
