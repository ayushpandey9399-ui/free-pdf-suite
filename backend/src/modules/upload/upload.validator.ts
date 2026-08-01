/**
 * Upload validation gates.
 * Responsibility: hold every rule an inbound file must satisfy in one auditable place:
 * file count, byte ceiling and accepted binary format. It is a pure class so the rules
 * can be unit tested without a running server or a real multipart request.
 *
 * Architecture Notes
 * Validation is separated from the Upload Manager because the manager owns streaming
 * mechanics (buffering, hashing, destination lifecycle) while these rules are policy.
 * Policy changes far more often than mechanics, and mixing the two is how upload paths
 * historically grow unreviewable branches.
 */
import { AppError, ErrorCode, errors } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { DetectedFormat, UploadLimits } from './upload.types.js';

export class UploadValidator {
  private readonly limits: UploadLimits;

  constructor(limits: UploadLimits) {
    this.limits = limits;
  }

  /** Reject a request that carries more parts than the tool allows. */
  public assertFileCount(count: number): void {
    if (count > this.limits.maxFiles) {
      throw new AppError(`At most ${this.limits.maxFiles} file(s) may be uploaded per request`, {
        code: ErrorCode.E_VALIDATION,
        status: HttpStatus.BAD_REQUEST,
        details: { maxFiles: this.limits.maxFiles, received: count },
      });
    }
  }

  /** Reject a stream that has already written more bytes than allowed. */
  public assertWithinSizeLimit(bytesSoFar: number): void {
    if (bytesSoFar > this.limits.maxFileBytes) {
      throw errors.payloadTooLarge(
        `File is larger than the ${this.limits.maxFileBytes} byte limit`,
      );
    }
  }

  /** Reject an empty file, which is never a valid document. */
  public assertNotEmpty(bytes: number): void {
    if (bytes === 0) {
      throw new AppError('Uploaded file is empty', {
        code: ErrorCode.E_VALIDATION,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  /** Reject a format the sniffer did not recognise or the tool does not accept. */
  public assertAcceptedFormat(format: DetectedFormat): void {
    if (format === 'unknown') {
      throw errors.unsupportedInput('The uploaded file is not a recognised document or image');
    }
    const accepted = this.limits.acceptedFormats;
    if (accepted.length > 0 && !accepted.includes(format)) {
      throw errors.unsupportedInput(`Files of type ${format} are not accepted by this tool`);
    }
  }

  /** Effective limits, exposed for diagnostics and for building HTTP error details. */
  public describe(): UploadLimits {
    return this.limits;
  }
}
