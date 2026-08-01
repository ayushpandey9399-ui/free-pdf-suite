/**
 * Poppler error normalisation.
 * Responsibility: translate a finished pdftoppm or pdfinfo run into the shared engine error
 * vocabulary, so no Poppler stderr text ever travels further up the stack.
 *
 * Architecture Notes
 * Poppler writes human prose to stderr and reuses exit code 1 for almost everything, so the
 * exit code alone cannot distinguish an encrypted document from a corrupt one. Matching on a
 * small, ordered list of stable phrases is the only reliable classifier, and keeping that list
 * in one file makes it the single place to update when a Poppler release changes wording.
 */
import { EngineError, EngineErrorCode } from '../engine.errors.js';
import type { EngineErrorCodeValue } from '../engine.errors.js';
import type { ProcessRunResult } from '../../process/process.types.js';

interface Rule {
  readonly match: RegExp;
  readonly code: EngineErrorCodeValue;
  readonly message: string;
}

/**
 * Ordered classification rules. Encryption is checked before corruption because Poppler often
 * reports both for the same document and the password is the actionable cause.
 */
const RULES: readonly Rule[] = Object.freeze([
  {
    match: /incorrect password|encrypted|command not allowed|copying of text/i,
    code: EngineErrorCode.INPUT_ENCRYPTED,
    message: 'The PDF is password protected and could not be opened',
  },
  {
    match: /may not be a pdf file|not a pdf|couldn'?t read xref|invalid header/i,
    code: EngineErrorCode.INPUT_NOT_SUPPORTED,
    message: 'The file is not a readable PDF document',
  },
  {
    match: /damaged|couldn'?t find trailer|couldn'?t find (the )?catalog|syntax error|illegal|missing or invalid/i,
    code: EngineErrorCode.INPUT_CORRUPT,
    message: 'The PDF is damaged and could not be processed',
  },
  {
    match: /wrong page range|page (number )?\d+ (does not exist|is out of range)|no pages/i,
    code: EngineErrorCode.INPUT_PAGE_OUT_OF_RANGE,
    message: 'The requested page range does not exist in this document',
  },
  {
    match: /out of memory|cannot allocate|no space left|bad alloc/i,
    code: EngineErrorCode.ENGINE_RESOURCE_EXHAUSTED,
    message: 'The document needs more memory or disk than the limits allow',
  },
  {
    match: /unrecognized option|unknown option|usage: pdf/i,
    code: EngineErrorCode.ENGINE_UNSUPPORTED_OPERATION,
    message: 'The installed Poppler build does not support the requested option',
  },
  {
    match: /permission denied|error opening|couldn'?t open/i,
    code: EngineErrorCode.ENGINE_FAILED,
    message: 'Poppler could not read the input file',
  },
]);

/** Classify stderr text alone. Exposed for direct testing. */
export function classifyPopplerStderr(stderr: string): Rule | undefined {
  return RULES.find((rule) => rule.match.test(stderr));
}

/**
 * Build the EngineError for a failed run.
 * Callers must only invoke this when the run did not succeed.
 */
export function toPopplerError(result: ProcessRunResult): EngineError {
  if (result.outcome === 'timeout') {
    return new EngineError('Poppler exceeded its time budget for this document', {
      engineId: 'poppler',
      code: EngineErrorCode.ENGINE_TIMEOUT,
      exitCode: result.exitCode,
    });
  }
  if (result.outcome === 'aborted') {
    return new EngineError('The Poppler run was cancelled', {
      engineId: 'poppler',
      code: EngineErrorCode.ENGINE_ABORTED,
      exitCode: result.exitCode,
    });
  }

  const rule = classifyPopplerStderr(result.stderr);
  if (rule !== undefined) {
    return new EngineError(rule.message, {
      engineId: 'poppler',
      code: rule.code,
      exitCode: result.exitCode,
    });
  }

  return new EngineError('Poppler failed to process the document', {
    engineId: 'poppler',
    code: EngineErrorCode.ENGINE_FAILED,
    exitCode: result.exitCode,
  });
}

/** Error used when the process succeeded but produced no artefacts. */
export function emptyOutputError(): EngineError {
  return new EngineError('Poppler completed without producing any images', {
    engineId: 'poppler',
    code: EngineErrorCode.ENGINE_EMPTY_OUTPUT,
  });
}
