/**
 * Error model.
 * Responsibility: define the single error type the whole API throws, with a stable
 * public error code, an HTTP status and an optional safe detail payload.
 * Engines and tools arrive in later phases and must map their failures onto these codes,
 * so the public contract never leaks internals.
 */
import { HttpStatus, type HttpStatusValue } from '../shared/http-status.js';

/** Stable, machine readable error codes. Clients branch on these, never on messages. */
export const ErrorCode = {
  E_VALIDATION: 'E_VALIDATION',
  E_BAD_REQUEST: 'E_BAD_REQUEST',
  E_UNAUTHORIZED: 'E_UNAUTHORIZED',
  E_FORBIDDEN: 'E_FORBIDDEN',
  E_NOT_FOUND: 'E_NOT_FOUND',
  E_ROUTE_NOT_FOUND: 'E_ROUTE_NOT_FOUND',
  E_PAYLOAD_TOO_LARGE: 'E_PAYLOAD_TOO_LARGE',
  E_UNSUPPORTED_INPUT: 'E_UNSUPPORTED_INPUT',
  E_RATE_LIMITED: 'E_RATE_LIMITED',
  E_NOT_IMPLEMENTED: 'E_NOT_IMPLEMENTED',
  E_INTERNAL: 'E_INTERNAL',
  E_UNAVAILABLE: 'E_UNAVAILABLE',
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface AppErrorOptions {
  /** Machine readable code returned to the client. */
  code?: ErrorCodeValue;
  /** HTTP status to respond with. */
  status?: HttpStatusValue;
  /** Structured, already safe details (no file names, no user content). */
  details?: unknown;
  /** Original error kept for logs only, never serialized to the client. */
  cause?: unknown;
  /** false marks unexpected faults that deserve an error level log. */
  expected?: boolean;
}

/** The only error class thrown deliberately by application code. */
export class AppError extends Error {
  public readonly code: ErrorCodeValue;
  public readonly status: HttpStatusValue;
  public readonly details?: unknown;
  public readonly expected: boolean;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code ?? ErrorCode.E_INTERNAL;
    this.status = options.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    this.details = options.details;
    this.expected = options.expected ?? true;
    Error.captureStackTrace?.(this, AppError);
  }

  /** Shape sent on the wire. Deliberately minimal and free of internals. */
  public toPayload(requestId: string): {
    error: { code: ErrorCodeValue; message: string; details?: unknown; requestId: string };
  } {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details === undefined ? {} : { details: this.details }),
        requestId,
      },
    };
  }
}

/** Convenience constructors keep call sites short and statuses consistent. */
export const errors = {
  validation: (message = 'Request validation failed', details?: unknown): AppError =>
    new AppError(message, { code: ErrorCode.E_VALIDATION, status: HttpStatus.BAD_REQUEST, details }),

  badRequest: (message = 'Bad request'): AppError =>
    new AppError(message, { code: ErrorCode.E_BAD_REQUEST, status: HttpStatus.BAD_REQUEST }),

  notFound: (message = 'Resource not found'): AppError =>
    new AppError(message, { code: ErrorCode.E_NOT_FOUND, status: HttpStatus.NOT_FOUND }),

  routeNotFound: (method: string, url: string): AppError =>
    new AppError(`Route ${method} ${url} does not exist`, {
      code: ErrorCode.E_ROUTE_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
    }),

  payloadTooLarge: (message = 'Uploaded file is larger than the allowed limit'): AppError =>
    new AppError(message, {
      code: ErrorCode.E_PAYLOAD_TOO_LARGE,
      status: HttpStatus.PAYLOAD_TOO_LARGE,
    }),

  unsupportedInput: (message = 'This file type is not supported'): AppError =>
    new AppError(message, {
      code: ErrorCode.E_UNSUPPORTED_INPUT,
      status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    }),

  rateLimited: (message = 'Too many requests, please slow down'): AppError =>
    new AppError(message, { code: ErrorCode.E_RATE_LIMITED, status: HttpStatus.TOO_MANY_REQUESTS }),

  notImplemented: (message = 'This capability is not available yet'): AppError =>
    new AppError(message, { code: ErrorCode.E_NOT_IMPLEMENTED, status: HttpStatus.NOT_IMPLEMENTED }),

  unavailable: (message = 'Service temporarily unavailable'): AppError =>
    new AppError(message, { code: ErrorCode.E_UNAVAILABLE, status: HttpStatus.SERVICE_UNAVAILABLE }),

  internal: (message = 'Something went wrong on our side', cause?: unknown): AppError =>
    new AppError(message, {
      code: ErrorCode.E_INTERNAL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      cause,
      expected: false,
    }),
};

/** Narrowing helper for the error handler. */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
