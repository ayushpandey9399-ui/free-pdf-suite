/**
 * Upload Manager.
 * Responsibility: consume a multipart part as a stream and turn it into a persisted,
 * validated, hashed file record, or into nothing at all. It buffers only the leading
 * bytes needed for signature sniffing, allocates a destination once the format is known
 * to be acceptable, and guarantees the destination is discarded on every failure path.
 *
 * Architecture Notes
 * This class exists so no route, tool or engine ever touches raw client bytes. Uploads
 * are the single most attacked surface of a document API: forged content types, zip
 * bombs, traversal names and truncated files all arrive here. Concentrating the streaming
 * mechanics in one manager means those defences are written once and reviewed once, and a
 * new tool inherits them by construction rather than by discipline.
 */
import { v7 as uuidv7 } from 'uuid';
import { AppError, ErrorCode, isAppError } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import { createStreamHasher } from './upload.hash.js';
import { sanitizeFileName } from './upload.filename.js';
import { SIGNATURE_PROBE_BYTES, sniffSignature } from './upload.signature.js';
import type {
  AcceptedUpload,
  UploadDestination,
  UploadDestinationFactory,
  UploadSource,
} from './upload.types.js';
import type { UploadValidator } from './upload.validator.js';

export interface UploadManagerOptions {
  readonly validator: UploadValidator;
  readonly destinationFactory: UploadDestinationFactory;
  /** Injected for deterministic tests. */
  readonly now?: () => number;
}

export class UploadManager {
  private readonly validator: UploadValidator;
  private readonly destinationFactory: UploadDestinationFactory;
  private readonly now: () => number;
  private acceptedCount = 0;

  constructor(options: UploadManagerOptions) {
    this.validator = options.validator;
    this.destinationFactory = options.destinationFactory;
    this.now = options.now ?? Date.now;
  }

  /** Number of parts accepted by this manager instance so far. */
  public get count(): number {
    return this.acceptedCount;
  }

  /** Consume every part of a request in order. */
  public async acceptAll(sources: AsyncIterable<UploadSource>): Promise<AcceptedUpload[]> {
    const accepted: AcceptedUpload[] = [];
    for await (const source of sources) {
      accepted.push(await this.accept(source));
    }
    return accepted;
  }

  /**
   * Consume one part.
   * Ordering is deliberate: count check, then sniff on buffered head, then destination
   * allocation, then streaming write with a running size check and running hash.
   */
  public async accept(source: UploadSource): Promise<AcceptedUpload> {
    this.validator.assertFileCount(this.acceptedCount + 1);

    const uploadId = uuidv7();
    const declaredName = sanitizeFileName(source.declaredName);
    const hasher = createStreamHasher();

    let destination: UploadDestination | undefined;
    let head = new Uint8Array(0);
    let sniffed = false;
    let format: AcceptedUpload['detectedFormat'] = 'unknown';
    let contentType = 'application/octet-stream';
    let sizeBytes = 0;

    try {
      for await (const rawChunk of source.stream) {
        const chunk = toUint8Array(rawChunk);
        if (chunk.length === 0) continue;

        sizeBytes += chunk.length;
        this.validator.assertWithinSizeLimit(sizeBytes);
        hasher.update(chunk);

        if (!sniffed) {
          head = concat(head, chunk);
          if (head.length < SIGNATURE_PROBE_BYTES) {
            // Not enough evidence yet, keep buffering before allocating storage.
            continue;
          }
          ({ format, contentType, destination } = await this.resolveDestination(
            uploadId,
            declaredName,
            head,
          ));
          sniffed = true;
          await destination.write(head);
          continue;
        }

        if (destination === undefined) {
          throw new AppError('Upload destination was not allocated', {
            code: ErrorCode.E_INTERNAL,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            expected: false,
          });
        }
        await destination.write(chunk);
      }

      // Files smaller than the probe window still need sniffing and a single write.
      if (!sniffed) {
        this.validator.assertNotEmpty(sizeBytes);
        ({ format, contentType, destination } = await this.resolveDestination(
          uploadId,
          declaredName,
          head,
        ));
        await destination.write(head);
      }

      this.validator.assertNotEmpty(sizeBytes);
      if (destination === undefined) {
        throw new AppError('Upload destination was not allocated', {
          code: ErrorCode.E_INTERNAL,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          expected: false,
        });
      }

      await destination.commit();
      this.acceptedCount += 1;

      return {
        id: uploadId,
        key: destination.key,
        fieldName: source.fieldName,
        declaredName,
        declaredContentType: source.declaredContentType,
        detectedFormat: format,
        contentType,
        sizeBytes,
        sha256: hasher.digest(),
        receivedAtMs: this.now(),
      };
    } catch (error) {
      if (destination !== undefined) {
        await destination.discard().catch(() => undefined);
      }
      throw isAppError(error)
        ? error
        : new AppError('Upload failed while reading the request body', {
            code: ErrorCode.E_INTERNAL,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            cause: error,
            expected: false,
          });
    }
  }

  /** Sniff the buffered head, enforce the format gate, then allocate storage. */
  private async resolveDestination(
    uploadId: string,
    declaredName: string,
    head: Uint8Array,
  ): Promise<{
    format: AcceptedUpload['detectedFormat'];
    contentType: string;
    destination: UploadDestination;
  }> {
    const match = sniffSignature(head);
    this.validator.assertAcceptedFormat(match.format);
    const destination = await this.destinationFactory({
      uploadId,
      declaredName,
      detectedFormat: match.format,
    });
    return { format: match.format, contentType: match.contentType, destination };
  }
}

function toUint8Array(chunk: Uint8Array): Uint8Array {
  return chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
}

function concat(left: Uint8Array, right: Uint8Array): Uint8Array<ArrayBuffer> {
  const merged = new Uint8Array(new ArrayBuffer(left.length + right.length));
  merged.set(left, 0);
  merged.set(right, left.length);
  return merged;
}
