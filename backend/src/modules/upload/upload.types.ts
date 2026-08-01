/**
 * Upload contracts.
 * Responsibility: describe an inbound file exactly as the platform is allowed to see it,
 * a declared name that is untrusted display data, a sniffed binary format that is the
 * only trusted type signal, a size and a content hash.
 * Nothing here touches disk. The Upload Manager streams bytes into an injected
 * destination so the same manager works over local workspaces or object storage.
 */

/** Formats the platform is able to recognise from binary signatures. */
export type DetectedFormat = 'pdf' | 'png' | 'jpeg' | 'tiff' | 'webp' | 'gif' | 'heic' | 'unknown';

/** Result of sniffing the leading bytes of a stream. */
export interface SignatureMatch {
  readonly format: DetectedFormat;
  /** Canonical content type for the detected format, never the client supplied one. */
  readonly contentType: string;
}

export interface UploadLimits {
  /** Hard ceiling per file. Exceeding it aborts the stream mid flight. */
  readonly maxFileBytes: number;
  /** Hard ceiling on file count for one request. */
  readonly maxFiles: number;
  /** Formats accepted for this request. Empty means every recognised format. */
  readonly acceptedFormats: readonly DetectedFormat[];
}

/** One multipart part handed to the manager, still unvalidated. */
export interface UploadSource {
  readonly fieldName: string;
  /** Client supplied file name. Untrusted, only used for display after sanitising. */
  readonly declaredName: string;
  /** Client supplied content type. Untrusted, recorded for diagnostics only. */
  readonly declaredContentType: string;
  readonly stream: AsyncIterable<Uint8Array>;
}

/**
 * Byte destination the manager writes into.
 * Kept minimal on purpose so the Upload Manager never learns about file systems.
 */
export interface UploadDestination {
  /** Opaque key of the object being written, echoed back on the accepted upload. */
  readonly key: string;
  write(chunk: Uint8Array): Promise<void>;
  /** Called exactly once on success. */
  commit(): Promise<void>;
  /** Called exactly once on any failure. Must be idempotent and must not throw. */
  discard(): Promise<void>;
}

/** Factory that allocates a destination once a part is known to be worth storing. */
export type UploadDestinationFactory = (context: {
  readonly uploadId: string;
  readonly declaredName: string;
  readonly detectedFormat: DetectedFormat;
}) => Promise<UploadDestination>;

/** A file that passed every validation gate and is fully persisted. */
export interface AcceptedUpload {
  readonly id: string;
  readonly key: string;
  readonly fieldName: string;
  /** Sanitised name, safe to log and to echo back. */
  readonly declaredName: string;
  readonly declaredContentType: string;
  readonly detectedFormat: DetectedFormat;
  readonly contentType: string;
  readonly sizeBytes: number;
  /** Lowercase hex SHA-256 of the stored bytes, computed while streaming. */
  readonly sha256: string;
  readonly receivedAtMs: number;
}
