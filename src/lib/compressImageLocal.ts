/**
 * Architecture Notes
 * Compress Image runs entirely in the browser so files never leave the
 * visitor's device. JPG and WebP are re-encoded through a canvas at the
 * chosen quality, PNG is re-encoded losslessly (so only resizing shrinks it
 * much), and SVG is minified as text. If the result is not smaller than the
 * original, the original bytes are returned so the tool never makes a file
 * bigger.
 */

export type LocalCompressOptions = {
  /** 0.1 to 1.0, used for JPG and WebP. */
  quality: number;
  /** Longest allowed width in pixels; 0 means keep the original width. */
  maxWidth: number;
};

export type LocalCompressResult = {
  blob: Blob;
  keptOriginal: boolean;
  width?: number;
  height?: number;
};

export function minifySvg(text: string): string {
  return text
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function targetSize(w: number, h: number, maxWidth: number) {
  if (!maxWidth || w <= maxWidth) return { width: w, height: h };
  return { width: maxWidth, height: Math.max(1, Math.round((h * maxWidth) / w)) };
}

function outputType(file: File): "image/jpeg" | "image/png" | "image/webp" {
  const n = file.name.toLowerCase();
  if (file.type === "image/png" || n.endsWith(".png")) return "image/png";
  if (file.type === "image/webp" || n.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function compressImageLocal(
  file: File,
  opts: LocalCompressOptions,
): Promise<LocalCompressResult> {
  const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
  if (isSvg) {
    const min = minifySvg(await file.text());
    const blob = new Blob([min], { type: "image/svg+xml" });
    return blob.size < file.size ? { blob, keptOriginal: false } : { blob: file, keptOriginal: true };
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image could not be read. It may be damaged.");
  });
  const { width, height } = targetSize(bitmap.width, bitmap.height, opts.maxWidth);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create a drawing surface.");
  const type = outputType(file);
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, type === "image/png" ? undefined : opts.quality),
  );
  if (!blob || blob.size === 0) throw new Error("Compression produced an empty file.");
  if (blob.size >= file.size) return { blob: file, keptOriginal: true, width, height };
  return { blob, keptOriginal: false, width, height };
}
