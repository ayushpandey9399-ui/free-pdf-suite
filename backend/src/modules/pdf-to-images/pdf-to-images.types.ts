/**
 * PDF to Images contracts.
 * Responsibility: describe the request this tool accepts and the receipt it returns,
 * without knowing anything about HTTP, multipart parsing, rasterisation or Poppler.
 * This phase stops at "accepted": conversion belongs to a later phase.
 */

/** Rasterisation densities the tool is willing to plan for. */
export const ALLOWED_DPI = [72, 150, 300, 600] as const;
export type AllowedDpi = (typeof ALLOWED_DPI)[number];

/** Output image encodings the tool is willing to plan for. */
export const ALLOWED_FORMATS = ['png', 'jpeg'] as const;
export type AllowedFormat = (typeof ALLOWED_FORMATS)[number];

/** JPEG quality steps, deliberately a closed set instead of a free range. */
export const ALLOWED_QUALITY = [70, 80, 90, 95] as const;
export type AllowedQuality = (typeof ALLOWED_QUALITY)[number];

export const DEFAULT_DPI: AllowedDpi = 300;
export const DEFAULT_FORMAT: AllowedFormat = 'png';
export const DEFAULT_QUALITY: AllowedQuality = 90;

/** One inclusive, one based page interval. */
export interface PageInterval {
  readonly start: number;
  readonly end: number;
}

/** A page selection. An empty interval list means every page of the document. */
export interface PageSelection {
  /** Original client expression, kept for logging and for echoing back. */
  readonly expression: string;
  readonly intervals: readonly PageInterval[];
  readonly allPages: boolean;
}

/** Validated conversion options. Every field is resolved, nothing is optional. */
export interface PdfToImagesOptions {
  readonly dpi: AllowedDpi;
  readonly format: AllowedFormat;
  readonly quality: AllowedQuality;
  readonly pages: PageSelection;
  /** Present only when the client supplied one. Never logged, never echoed. */
  readonly password?: string;
}

/**
 * One inbound multipart part, normalised.
 * The route adapts the HTTP layer onto this shape so the service stays transport free.
 */
export type IncomingPart =
  | { readonly kind: 'field'; readonly name: string; readonly value: string }
  | {
      readonly kind: 'file';
      readonly fieldName: string;
      readonly declaredName: string;
      readonly declaredContentType: string;
      readonly stream: AsyncIterable<Uint8Array>;
    };

export interface AcceptRequestInput {
  /** Correlation id of the HTTP request, used for logs and workspace ownership. */
  readonly requestId: string;
  readonly parts: AsyncIterable<IncomingPart>;
}

/** Everything the route needs to answer, and nothing that reveals the file system. */
export interface AcceptedJob {
  readonly workspaceId: string;
  readonly fileId: string;
  readonly declaredName: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly options: PdfToImagesOptions;
}
