// Shared safety helpers for the image-tools silo. Kept intentionally
// scoped: these are used ONLY by /image-tools/* and never by any PDF tool.

// Cap on decoded pixel area. 100 MP covers a 10000x10000 photo and blocks
// pathological decompression bombs (e.g. tiny files declaring 100000x100000).
export const MAX_IMAGE_PIXELS = 100_000_000;

/** Throws if the decoded image is missing or exceeds the pixel cap. */
export function guardDecodedSize(w: number, h: number): void {
  if (!w || !h) throw new Error("Empty image");
  if (w * h > MAX_IMAGE_PIXELS) {
    throw new Error(
      `Image is too large (${w}x${h}). Max is ${MAX_IMAGE_PIXELS.toLocaleString()} pixels.`,
    );
  }
}

/** True if the file looks like an SVG. SVG can contain scripts, we never render or convert it. */
export function isSvgFile(f: File): boolean {
  const n = f.name.toLowerCase();
  return (
    f.type === "image/svg+xml" ||
    f.type === "image/svg" ||
    n.endsWith(".svg") ||
    n.endsWith(".svgz")
  );
}

/** Strip path segments and unsafe characters from a filename before putting it in a ZIP. */
export function safeZipName(name: string): string {
  // Drop directories, drop control chars, keep the leaf name only.
  const leaf = name.replace(/\\/g, "/").split("/").pop() || "file";
  return leaf.replace(/[\x00-\x1f]/g, "").slice(0, 200) || "file";
}

/**
 * Returns a name that is unique within `used`. Mutates `used` by adding the
 * chosen name. `photo.jpg` used twice becomes `photo.jpg`, then `photo-1.jpg`.
 */
export function uniqueZipName(used: Set<string>, name: string): string {
  const safe = safeZipName(name);
  if (!used.has(safe)) {
    used.add(safe);
    return safe;
  }
  const dot = safe.lastIndexOf(".");
  const base = dot > 0 ? safe.slice(0, dot) : safe;
  const ext = dot > 0 ? safe.slice(dot) : "";
  let i = 1;
  let candidate = `${base}-${i}${ext}`;
  while (used.has(candidate)) {
    i += 1;
    candidate = `${base}-${i}${ext}`;
  }
  used.add(candidate);
  return candidate;
}
