import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "@/lib/saveFile";
import { guardDecodedSize, isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Fmt = "jpg" | "png" | "webp";

type Xform = {
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  flipV: boolean;
};

type Row = {
  id: string;
  file: File;
  fmt: Fmt;
  origW: number;
  origH: number;
  bitmap: ImageBitmap; // orientation-corrected bitmap
  xform: Xform;
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  status: "ready" | "processing" | "done" | "error";
  error?: string;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const IDENTITY: Xform = { rotation: 0, flipH: false, flipV: false };

function isSupported(f: File): boolean {
  const t = f.type;
  const n = f.name.toLowerCase();
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") return true;
  return /\.(jpe?g|png|webp)$/i.test(n);
}
function fmtOf(file: File): Fmt {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png") || file.type === "image/png") return "png";
  if (n.endsWith(".webp") || file.type === "image/webp") return "webp";
  return "jpg";
}
function mimeOf(f: Fmt): string {
  if (f === "png") return "image/png";
  if (f === "webp") return "image/webp";
  return "image/jpeg";
}
function extOf(f: Fmt): string {
  return f;
}
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}
function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      mime,
      quality,
    );
  });
}

/**
 * Render an oriented+flipped bitmap into `canvas` at destination dimensions
 * (swapped when the rotation is 90 or 270 so nothing is cropped).
 * Draw order: rotate first, then flip.
 */
function drawTransformed(
  canvas: HTMLCanvasElement,
  bmp: ImageBitmap | HTMLCanvasElement,
  srcW: number,
  srcH: number,
  x: Xform,
  fill?: string,
) {
  const swap = x.rotation === 90 || x.rotation === 270;
  const outW = swap ? srcH : srcW;
  const outH = swap ? srcW : srcH;
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, outW, outH);
  }
  ctx.save();
  // move to center of output
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((x.rotation * Math.PI) / 180);
  ctx.scale(x.flipH ? -1 : 1, x.flipV ? -1 : 1);
  ctx.drawImage(bmp, -srcW / 2, -srcH / 2, srcW, srcH);
  ctx.restore();
}

/** Composition helpers so cumulative rotations + flips stay consistent. */
function rotate(x: Xform, deg: 90 | 180 | 270): Xform {
  return { ...x, rotation: (((x.rotation + deg) % 360) as Xform["rotation"]) };
}
function flipH(x: Xform): Xform {
  return { ...x, flipH: !x.flipH };
}
function flipV(x: Xform): Xform {
  return { ...x, flipV: !x.flipV };
}

function ThumbPreview({ row }: { row: Row }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // Render preview at a capped size for perf.
    const maxDim = 320;
    const swap = row.xform.rotation === 90 || row.xform.rotation === 270;
    const w = swap ? row.origH : row.origW;
    const h = swap ? row.origW : row.origH;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const dw = Math.max(1, Math.round(w * scale));
    const dh = Math.max(1, Math.round(h * scale));
    // Draw a small scaled version to keep memory light.
    const scratch = document.createElement("canvas");
    drawTransformed(scratch, row.bitmap, row.origW, row.origH, row.xform, row.fmt === "jpg" ? "#ffffff" : undefined);
    c.width = dw;
    c.height = dh;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (row.fmt === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, dw, dh);
    }
    ctx.drawImage(scratch, 0, 0, dw, dh);
  }, [row]);
  return (
    <div className="flex items-center justify-center rounded-lg border border-[#ececef] bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)_50%/16px_16px] p-2">
      <canvas ref={ref} className="max-h-[220px] max-w-full" />
    </div>
  );
}

export function RotateImageTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [quality, setQuality] = useState<number>(0.9);
  const [running, setRunning] = useState(false);
  const idRef = useRef(0);

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (isSvgFile(f)) {
        toast.error(`"${f.name}" is an SVG, not supported`);
        return false;
      }
      if (!isSupported(f)) {
        toast.error(`"${f.name}" is not a JPG, PNG, or WebP`);
        return false;
      }
      return true;
    });
    if (!list.length) return;
    const added: Row[] = [];
    for (const f of list) {
      try {
        const bmp = await decodeBitmap(f);
        guardDecodedSize(bmp.width, bmp.height);
        added.push({
          id: `${++idRef.current}-${f.name}`,
          file: f,
          fmt: fmtOf(f),
          origW: bmp.width,
          origH: bmp.height,
          bitmap: bmp,
          xform: { ...IDENTITY },
          status: "ready",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not read image";
        toast.error(`"${f.name}": ${msg}`);
      }
    }
    if (added.length) setRows((prev) => [...prev, ...added]);
  }, []);

  useEffect(() => {
    return () => {
      rows.forEach((r) => r.bitmap.close?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateOne = (id: string, fn: (x: Xform) => Xform) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, xform: fn(r.xform), status: "ready", outBlob: undefined, outName: undefined, outSize: undefined } : r)));
  };
  const updateAll = (fn: (x: Xform) => Xform) => {
    setRows((prev) => prev.map((r) => ({ ...r, xform: fn(r.xform), status: "ready", outBlob: undefined, outName: undefined, outSize: undefined })));
  };
  const resetOne = (id: string) => updateOne(id, () => ({ ...IDENTITY }));
  const resetAll = () => updateAll(() => ({ ...IDENTITY }));

  const removeRow = (id: string) => {
    setRows((prev) => {
      const r = prev.find((x) => x.id === id);
      r?.bitmap.close?.();
      return prev.filter((x) => x.id !== id);
    });
  };
  const clearAll = () => {
    rows.forEach((r) => r.bitmap.close?.());
    setRows([]);
  };

  const applyOne = async (row: Row): Promise<Row> => {
    const canvas = document.createElement("canvas");
    drawTransformed(canvas, row.bitmap, row.origW, row.origH, row.xform, row.fmt === "jpg" ? "#ffffff" : undefined);
    const q = row.fmt === "png" ? undefined : quality;
    const blob = await canvasToBlob(canvas, mimeOf(row.fmt), q);
    const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const outName = `${base}-rotated.${extOf(row.fmt)}`;
    return { ...row, status: "done", outBlob: blob, outName, outSize: blob.size };
  };

  const runAll = async () => {
    if (!rows.length) return;
    // Skip files whose transform is identity (nothing to do) — user can still
    // download the original if they want; we simply don't produce a copy.
    const targets = rows.filter(
      (r) => !(r.xform.rotation === 0 && !r.xform.flipH && !r.xform.flipV),
    );
    if (!targets.length) {
      toast.error("Rotate or flip at least one image first");
      return;
    }
    setRunning(true);
    for (const row of targets) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "processing" } : r)));
      try {
        const next = await applyOne(row);
        setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Rotate failed";
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "error", error: msg } : r)));
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Done");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob || !row.outName) return;
    saveAs(row.outBlob, row.outName);
  };
  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (!done.length) {
      toast.error("Apply changes first");
      return;
    }
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) zip.file(uniqueZipName(used, r.outName!), r.outBlob!);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "rotated-images.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <UploadDropzone
        accept={ACCEPT}
        multiple
        buttonLabel="Select images"
        hint="or drop JPG, PNG, or WebP images here"
        onFiles={addFiles}
        accent="#14B8A6"
      />

      {rows.length > 0 && (
        <>
          {/* Apply-to-all bar */}
          <div className="mt-6 rounded-xl border border-[#ececef] bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#33333c]">Apply to all:</span>
              <button type="button" onClick={() => updateAll((x) => rotate(x, 270))} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                <RotateCcw className="h-3.5 w-3.5" /> 90 left
              </button>
              <button type="button" onClick={() => updateAll((x) => rotate(x, 90))} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                <RotateCw className="h-3.5 w-3.5" /> 90 right
              </button>
              <button type="button" onClick={() => updateAll((x) => rotate(x, 180))} className="rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                180
              </button>
              <button type="button" onClick={() => updateAll(flipH)} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                <FlipHorizontal2 className="h-3.5 w-3.5" /> Mirror
              </button>
              <button type="button" onClick={() => updateAll(flipV)} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                <FlipVertical2 className="h-3.5 w-3.5" /> Flip vertical
              </button>
              <button type="button" onClick={resetAll} className="ml-auto rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                Reset all
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[#ececef] pt-3">
              <label className="flex items-center gap-2 text-[12px] text-[#33333c]">
                JPG/WebP quality
                <input
                  type="range"
                  min={0.3}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="align-middle"
                />
                <span className="w-8 text-right font-mono">{quality.toFixed(2)}</span>
              </label>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={runAll}
                  disabled={running}
                  className="inline-flex h-[42px] items-center justify-center rounded-xl bg-[#14B8A6] px-5 text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {running ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                    </>
                  ) : (
                    "Apply and export"
                  )}
                </button>
                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={doneCount === 0}
                  className="inline-flex h-[42px] items-center justify-center rounded-xl border border-[#ececef] bg-white px-4 text-[14px] font-semibold text-[#33333c] hover:bg-[#f9fafb] disabled:opacity-60"
                >
                  <Download className="mr-2 h-4 w-4" /> ZIP
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-[42px] items-center justify-center rounded-xl border border-[#ececef] bg-white px-3 text-[14px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Per-file cards */}
          <ul className="mt-4 space-y-4">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl border border-[#ececef] bg-white p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="md:w-[280px] md:flex-shrink-0">
                    <ThumbPreview row={r} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-semibold text-[#1F2937]" title={r.file.name}>
                          {r.file.name}
                        </div>
                        <div className="mt-0.5 text-[12px] text-[#6B7280]">
                          {r.origW}x{r.origH} - {formatBytes(r.file.size)} - {r.fmt.toUpperCase()}
                        </div>
                        <div className="mt-1 text-[12px] text-[#6B7280]">
                          Rotation {r.xform.rotation}°
                          {r.xform.flipH ? ", mirrored" : ""}
                          {r.xform.flipV ? ", flipped vertical" : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        className="rounded p-1 text-[#8a8a95] hover:bg-[#f9fafb] hover:text-[#e5322d]"
                        aria-label={`Remove ${r.file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => updateOne(r.id, (x) => rotate(x, 270))} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        <RotateCcw className="h-3.5 w-3.5" /> 90 left
                      </button>
                      <button type="button" onClick={() => updateOne(r.id, (x) => rotate(x, 90))} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        <RotateCw className="h-3.5 w-3.5" /> 90 right
                      </button>
                      <button type="button" onClick={() => updateOne(r.id, (x) => rotate(x, 180))} className="rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        180
                      </button>
                      <button type="button" onClick={() => updateOne(r.id, flipH)} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        <FlipHorizontal2 className="h-3.5 w-3.5" /> Mirror
                      </button>
                      <button type="button" onClick={() => updateOne(r.id, flipV)} className="inline-flex items-center gap-1 rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        <FlipVertical2 className="h-3.5 w-3.5" /> Flip vertical
                      </button>
                      <button type="button" onClick={() => resetOne(r.id)} className="rounded-full border border-[#ececef] bg-white px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]">
                        Reset
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[12px] text-[#6B7280]">
                      {r.status === "done" && r.outSize ? (
                        <>
                          <span className="rounded-full bg-[#ecfdf5] px-2 py-0.5 font-semibold text-[#047857]">
                            Ready {formatBytes(r.outSize)}
                          </span>
                          <button
                            type="button"
                            onClick={() => downloadOne(r)}
                            className="inline-flex items-center gap-1 text-[#14B8A6] hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                        </>
                      ) : r.status === "processing" ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                        </span>
                      ) : r.status === "error" ? (
                        <span className="text-[#b91c1c]">{r.error || "Failed"}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
