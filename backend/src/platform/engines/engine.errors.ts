/**
 * Engine error model.
 * Responsibility: define the stable, engine agnostic vocabulary of failures that any
 * external binary may produce, so a tool can react to "the document is encrypted" without
 * knowing whether Poppler, QPDF or Ghostscript said it.
 *
 * Architecture Notes
 * Engine stderr is a leaky, version dependent, sometimes locale dependent dialect, and it
 * regularly contains file paths. Mapping it to these codes at the adapter boundary is what
 * keeps that text out of API responses and out of client branching logic. Adding a code is a
 * contract change; changing a mapping is not.
 */

export const EngineErrorCode = {
  /** The engine binary is missing, unreadable or not executable. */
  ENGINE_NOT_INSTALLED: 'ENGINE_NOT_INSTALLED',
  /** The engine exists but does not support what was asked of it. */
  ENGINE_UNSUPPORTED_OPERATION: 'ENGINE_UNSUPPORTED_OPERATION',
  /** The request is malformed before any process is started. */
  ENGINE_INVALID_REQUEST: 'ENGINE_INVALID_REQUEST',
  /** The input file is not the format the engine expected. */
  INPUT_NOT_SUPPORTED: 'INPUT_NOT_SUPPORTED',
  /** The input file is structurally broken. */
  INPUT_CORRUPT: 'INPUT_CORRUPT',
  /** The input is password protected and no usable password was supplied. */
  INPUT_ENCRYPTED: 'INPUT_ENCRYPTED',
  /** The requested page or range does not exist in the document. */
  INPUT_PAGE_OUT_OF_RANGE: 'INPUT_PAGE_OUT_OF_RANGE',
  /** The engine ran out of its wall clock budget. */
  ENGINE_TIMEOUT: 'ENGINE_TIMEOUT',
  /** The run was cancelled by the caller. */
  ENGINE_ABORTED: 'ENGINE_ABORTED',
  /** The engine exhausted memory or disk. */
  ENGINE_RESOURCE_EXHAUSTED: 'ENGINE_RESOURCE_EXHAUSTED',
  /** The engine produced nothing usable. */
  ENGINE_EMPTY_OUTPUT: 'ENGINE_EMPTY_OUTPUT',
  /** Anything the mapper could not classify. */
  ENGINE_FAILED: 'ENGINE_FAILED',
} as const;

export type EngineErrorCodeValue = (typeof EngineErrorCode)[keyof typeof EngineErrorCode];

export interface EngineErrorOptions {
  readonly engineId: string;
  readonly code: EngineErrorCodeValue;
  /** Exit code of the underlying process, when there was one. */
  readonly exitCode?: number | null;
  /** Kept for logs only. Never serialized to a client. */
  readonly cause?: unknown;
}

/** The only error type an engine adapter is allowed to throw. */
export class EngineError extends Error {
  public readonly engineId: string;
  public readonly code: EngineErrorCodeValue;
  public readonly exitCode: number | null;

  constructor(message: string, options: EngineErrorOptions) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'EngineError';
    this.engineId = options.engineId;
    this.code = options.code;
    this.exitCode = options.exitCode ?? null;
    Error.captureStackTrace?.(this, EngineError);
  }
}

/** Narrowing helper for callers that translate engine failures into HTTP errors. */
export function isEngineError(value: unknown): value is EngineError {
  return value instanceof EngineError;
}
