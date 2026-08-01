/**
 * Download error vocabulary.
 * Responsibility: turn every reason a download can be refused into an AppError carrying a
 * stable reason, an HTTP status and no internal detail.
 *
 * Architecture Notes
 * A download endpoint is the one part of the platform an attacker can poke at without
 * uploading anything, so its failures are enumerated in one place and each one says as little
 * as possible: a forged token and a tampered token describe themselves only as "this link is
 * not valid", because distinguishing them any further would tell a prober which check rejected
 * them. Expiry is separated from invalidity only because a real user needs to be told to run
 * the conversion again rather than to doubt the link they copied.
 */
import { AppError, ErrorCode, type ErrorCodeValue } from '../../core/errors.js';
import { HttpStatus, type HttpStatusValue } from '../../shared/http-status.js';

export const DownloadError = {
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  ARTIFACT_GONE: 'ARTIFACT_GONE',
  ARTIFACT_INVALID: 'ARTIFACT_INVALID',
} as const;

export type DownloadErrorReason = (typeof DownloadError)[keyof typeof DownloadError];

function build(
  reason: DownloadErrorReason,
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

export const downloadErrors = {
  invalidToken: (cause?: unknown): AppError =>
    build(
      DownloadError.INVALID_TOKEN,
      'This download link is not valid',
      ErrorCode.E_VALIDATION,
      HttpStatus.BAD_REQUEST,
      cause,
    ),

  expiredToken: (): AppError =>
    build(
      DownloadError.EXPIRED_TOKEN,
      'This download link has expired, please convert the file again',
      ErrorCode.E_NOT_FOUND,
      HttpStatus.GONE,
    ),

  artifactGone: (): AppError =>
    build(
      DownloadError.ARTIFACT_GONE,
      'This file is no longer available, please convert it again',
      ErrorCode.E_NOT_FOUND,
      HttpStatus.GONE,
    ),

  artifactInvalid: (cause?: unknown): AppError =>
    build(
      DownloadError.ARTIFACT_INVALID,
      'This file could not be read',
      ErrorCode.E_INTERNAL,
      HttpStatus.INTERNAL_SERVER_ERROR,
      cause,
    ),
};
