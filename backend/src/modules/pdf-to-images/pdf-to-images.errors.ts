/**
 * PDF to Images error vocabulary.
 * Responsibility: turn every rejection reason of this tool into an AppError that carries a
 * stable, machine readable reason plus a platform error code and HTTP status.
 *
 * Architecture Notes
 * The platform error codes are intentionally coarse (validation, unsupported input, payload
 * too large) because clients branch on them generically. A tool still needs a precise reason
 * so a UI can point at the field that is wrong, so the reason travels in the safe details
 * payload rather than as a new top level code. Every constructor here returns a message that
 * mentions only client supplied concepts: no path, no stderr, no stack, ever.
 */
import { AppError, ErrorCode, type ErrorCodeValue } from '../../core/errors.js';
import { HttpStatus, type HttpStatusValue } from '../../shared/http-status.js';

/** Stable reasons returned in the error details payload. */
export const PdfToImagesError = {
  INVALID_FILE: 'INVALID_FILE',
  INVALID_PDF: 'INVALID_PDF',
  INVALID_DPI: 'INVALID_DPI',
  INVALID_PAGE_RANGE: 'INVALID_PAGE_RANGE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_QUALITY: 'INVALID_QUALITY',
  PASSWORD_REQUIRED: 'PASSWORD_REQUIRED',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  WORKSPACE_FAILED: 'WORKSPACE_FAILED',
  TOOL_DISABLED: 'TOOL_DISABLED',
  TOOL_NOT_REGISTERED: 'TOOL_NOT_REGISTERED',
} as const;

export type PdfToImagesErrorReason = (typeof PdfToImagesError)[keyof typeof PdfToImagesError];

function build(
  reason: PdfToImagesErrorReason,
  message: string,
  code: ErrorCodeValue,
  status: HttpStatusValue,
  extra?: Record<string, unknown>,
  cause?: unknown,
): AppError {
  return new AppError(message, {
    code,
    status,
    details: { reason, ...(extra ?? {}) },
    cause,
    expected: code !== ErrorCode.E_INTERNAL,
  });
}

export const pdfToImagesErrors = {
  missingFile: (): AppError =>
    build(
      PdfToImagesError.INVALID_FILE,
      'A PDF file is required in the "file" field',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
    ),

  tooManyFiles: (): AppError =>
    build(
      PdfToImagesError.INVALID_FILE,
      'Only one PDF file may be converted per request',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
    ),

  unexpectedField: (fieldName: string): AppError =>
    build(
      PdfToImagesError.INVALID_FILE,
      'The uploaded file must be sent in the "file" field',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      { field: fieldName.slice(0, 64) },
    ),

  notPdf: (): AppError =>
    build(
      PdfToImagesError.INVALID_PDF,
      'The uploaded file is not a valid PDF document',
      ErrorCode.E_UNSUPPORTED_INPUT,
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    ),

  invalidDpi: (allowed: readonly number[]): AppError =>
    build(
      PdfToImagesError.INVALID_DPI,
      'The requested dpi is not supported',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      { allowed: [...allowed] },
    ),

  invalidFormat: (allowed: readonly string[]): AppError =>
    build(
      PdfToImagesError.INVALID_FORMAT,
      'The requested output format is not supported',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      { allowed: [...allowed] },
    ),

  invalidQuality: (allowed: readonly number[]): AppError =>
    build(
      PdfToImagesError.INVALID_QUALITY,
      'The requested JPEG quality is not supported',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      { allowed: [...allowed] },
    ),

  invalidPageRange: (detail: string): AppError =>
    build(
      PdfToImagesError.INVALID_PAGE_RANGE,
      `The page range is not valid: ${detail}`,
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
    ),

  passwordRequired: (): AppError =>
    build(
      PdfToImagesError.PASSWORD_REQUIRED,
      'This PDF is password protected, supply the password to continue',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
    ),

  uploadFailed: (cause?: unknown): AppError =>
    build(
      PdfToImagesError.UPLOAD_FAILED,
      'The upload could not be completed',
      ErrorCode.E_INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      cause,
    ),

  workspaceFailed: (cause?: unknown): AppError =>
    build(
      PdfToImagesError.WORKSPACE_FAILED,
      'The conversion workspace could not be prepared',
      ErrorCode.E_INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
      undefined,
      cause,
    ),

  toolDisabled: (): AppError =>
    build(
      PdfToImagesError.TOOL_DISABLED,
      'This tool is temporarily disabled',
      ErrorCode.E_UNAVAILABLE,
      HttpStatus.SERVICE_UNAVAILABLE,
    ),

  toolNotRegistered: (): AppError =>
    build(
      PdfToImagesError.TOOL_NOT_REGISTERED,
      'This tool is not available on this instance',
      ErrorCode.E_UNAVAILABLE,
      HttpStatus.SERVICE_UNAVAILABLE,
    ),
};
