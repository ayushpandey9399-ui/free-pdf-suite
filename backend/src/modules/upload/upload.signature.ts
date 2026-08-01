/**
 * Binary signature sniffing.
 * Responsibility: decide what a file actually is by reading its leading bytes, because a
 * client supplied content type is trivially forged and a file extension is not evidence.
 * Every downstream decision (accepted format, engine routing) uses this result only.
 */
import type { DetectedFormat, SignatureMatch } from './upload.types.js';

/** Number of leading bytes buffered before a verdict is possible. */
export const SIGNATURE_PROBE_BYTES = 64;

const CONTENT_TYPES: Readonly<Record<DetectedFormat, string>> = Object.freeze({
  pdf: 'application/pdf',
  png: 'image/png',
  jpeg: 'image/jpeg',
  tiff: 'image/tiff',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  unknown: 'application/octet-stream',
});

/** Canonical content type for a detected format. */
export function contentTypeForFormat(format: DetectedFormat): string {
  return CONTENT_TYPES[format];
}

function startsWith(bytes: Uint8Array, pattern: readonly number[], offset = 0): boolean {
  if (bytes.length < offset + pattern.length) return false;
  for (let index = 0; index < pattern.length; index += 1) {
    if (bytes[offset + index] !== pattern[index]) return false;
  }
  return true;
}

function asciiAt(bytes: Uint8Array, offset: number, text: string): boolean {
  const pattern = [...text].map((character) => character.charCodeAt(0));
  return startsWith(bytes, pattern, offset);
}

/**
 * Inspect the leading bytes of a stream.
 * Returns "unknown" rather than guessing, so callers fail closed.
 */
export function sniffSignature(head: Uint8Array): SignatureMatch {
  const format = detectFormat(head);
  return { format, contentType: contentTypeForFormat(format) };
}

function detectFormat(head: Uint8Array): DetectedFormat {
  // %PDF-
  if (asciiAt(head, 0, '%PDF-')) return 'pdf';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  // JPEG: FF D8 FF
  if (startsWith(head, [0xff, 0xd8, 0xff])) return 'jpeg';
  // TIFF little and big endian
  if (startsWith(head, [0x49, 0x49, 0x2a, 0x00]) || startsWith(head, [0x4d, 0x4d, 0x00, 0x2a])) {
    return 'tiff';
  }
  // GIF87a / GIF89a
  if (asciiAt(head, 0, 'GIF87a') || asciiAt(head, 0, 'GIF89a')) return 'gif';
  // RIFF....WEBP
  if (asciiAt(head, 0, 'RIFF') && asciiAt(head, 8, 'WEBP')) return 'webp';
  // ISO base media container with a HEIF brand
  if (asciiAt(head, 4, 'ftyp')) {
    const brands = ['heic', 'heix', 'heif', 'hevc', 'mif1', 'msf1'];
    if (brands.some((brand) => asciiAt(head, 8, brand))) return 'heic';
  }
  return 'unknown';
}
