// Pure helpers used by the image-tools silo. Kept dependency-free and free
// of DOM/browser types so they can be unit-tested headlessly with `bun test`.

export type ImageExt = "jpg" | "png" | "webp";

/** Extract the extension we should use for the compressor's output file. */
export function outExtension(filename: string): ImageExt {
  const n = filename.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  return "jpg";
}

/** Map an extension to the canonical mime type. */
export function mimeFromExt(ext: ImageExt): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/** Format a byte count as B / KB / MB. */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Percent saved after compression. Positive when the output is smaller.
 * Returns 0 for empty inputs. Rounded to the nearest integer.
 */
export function computeSavedPct(originalSize: number, outSize: number): number {
  if (!originalSize || originalSize <= 0) return 0;
  return Math.round(((originalSize - outSize) / originalSize) * 100);
}

/**
 * True when the compressor produced a file at least as big as the input,
 * so callers should fall back to the original bytes ("never inflate").
 */
export function shouldKeepOriginal(originalSize: number, outSize: number): boolean {
  return outSize >= originalSize;
}

/** Clamp a user-entered target-KB value to a safe minimum. */
export function clampTargetKb(v: number): number {
  if (!Number.isFinite(v)) return 5;
  return Math.max(5, Math.floor(v));
}

/** Strip a known raster extension from a filename base. */
export function stripKnownExt(name: string): string {
  return name.replace(/\.(jpe?g|png|webp)$/i, "");
}
