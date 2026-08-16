import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, AlertTriangle } from "lucide-react";
import { loadJSZip } from "@/lib/lazyLibs";
import { saveAs } from "@/lib/saveFile";
import { guardDecodedSize, isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Mode = "pixels" | "percent";
type Fmt = "jpg" | "png" | "webp";

type Row = {
  id: string;
  file: File;
  status: "pending" | "processing" | "done" | "error";
  origW?: number;
  origH?: number;
  origSize: number;
  outBlob?: Blob;
  outName?: string;
  outW?: number;
  outH?: number;
  outSize?: number;
  previewUrl?: string;
  error?: string;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const PRESETS: { label: string; w: number; h: number }[] = [
  { label: "Passport 413x531", w: 413, h: 531 },
  { label: "Signature 140x60", w: 140, h: 60 },
  { label: "640x480", w: 640, h: 480 },
  { label: "800x600", w: 800, h: 600 },
  { label: "1280x720 (HD)", w: 1280, h: 720 },
  { label: "1920x1080 (FHD)", w: 1920, h: 1080 },
];

function isSupported(f: File): boolean {
  const t = f.type;
  const n = f.name.toLowerCase();
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") return true;
  return /\.(jpe?g|png|webp)$/i.test(n);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
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

async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

/** Stepped half-downscale for high-quality shrink. Draws src to target w/h. */
function drawResized(src: ImageBitmap, tw: number, th: number, fillWhite: boolean): HTMLCanvasElement {
  let cw = src.width;
  let ch = src.height;
  let source: CanvasImageSource = src;
  // If shrinking a lot, halve iteratively to keep edges sharp.
  while (cw > tw * 2 && ch > th * 2) {
    const nw = Math.max(tw, Math.floor(cw / 2));
    const nh = Math.max(th, Math.floor(ch / 2));
    const step = document.createElement("canvas");
    step.width = nw;
    step.height = nh;
    const sctx = step.getContext("2d");
    if (!sctx) throw new Error("Canvas not supported");
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(source, 0, 0, nw, nh);
    source = step;
    cw = nw;
    ch = nh;
  }
  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, tw, th);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, tw, th);
  return out;
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

export function ImageResizeTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("pixels");
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [lockAspect, setLockAspect] = useState(true);
  const [percent, setPercent] = useState(50);
  const [quality, setQuality] = useState(0.9);
  const [alsoCompress, setAlsoCompress] = useState(false);
  const [targetKb, setTargetKb] = useState(100);
  const idRef = useRef(0);

  const refAspect = rows[0] && rows[0].origW && rows[0].origH
    ? rows[0].origW / rows[0].origH
    : 16 / 9;

  const anyUpscale = (() => {
    if (mode !== "pixels") return false;
    return rows.some(
      (r) => r.origW && r.origH && (width > r.origW || height > r.origH),
    );
  })();

  const addFiles = useCallback((incoming: FileList | File[]) => {
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
    const newRows: Row[] = list.map((f) => ({
      id: `${++idRef.current}-${f.name}`,
      file: f,
      origSize: f.size,
      status: "pending" as const,
    }));
    setRows((prev) => [...prev, ...newRows]);
    // Read dimensions asynchronously.
    newRows.forEach(async (r) => {
      try {
        const bmp = await decodeBitmap(r.file);
        setRows((prev) =>
          prev.map((x) =>
            x.id === r.id ? { ...x, origW: bmp.width, origH: bmp.height } : x,
          ),
        );
        bmp.close?.();
      } catch {
        // leave dims undefined; we'll error during processing
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      rows.forEach((r) => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWidth = (v: number) => {
    setWidth(v);
    if (lockAspect && refAspect) {
      setHeight(Math.max(1, Math.round(v / refAspect)));
    }
  };
  const onHeight = (v: number) => {
    setHeight(v);
    if (lockAspect && refAspect) {
      setWidth(Math.max(1, Math.round(v * refAspect)));
    }
  };
  const applyPreset = (w: number, h: number) => {
    setMode("pixels");
    setLockAspect(false);
    setWidth(w);
    setHeight(h);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const r = prev.find((x) => x.id === id);
      if (r?.previewUrl) URL.revokeObjectURL(r.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const clearAll = () => {
    rows.forEach((r) => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
    setRows([]);
  };

  const processOne = async (row: Row): Promise<void> => {
    const bmp = await decodeBitmap(row.file);
    try {
      guardDecodedSize(bmp.width, bmp.height);
      let tw: number;
      let th: number;
      if (mode === "pixels") {
        tw = Math.max(1, Math.floor(width));
        th = Math.max(1, Math.floor(height));
      } else {
        const p = Math.max(1, Math.min(400, percent)) / 100;
        tw = Math.max(1, Math.round(bmp.width * p));
        th = Math.max(1, Math.round(bmp.height * p));
      }
      const fmt = fmtOf(row.file);
      const fillWhite = fmt === "jpg"; // PNG/WebP keep transparency
      const canvas = drawResized(bmp, tw, th, fillWhite);
      const q = fmt === "png" ? undefined : quality;
      let blob = await canvasToBlob(canvas, mimeOf(fmt), q);

      if (alsoCompress) {
        const kb = Math.max(5, Math.floor(targetKb));
        // Wrap the resized canvas back into a File so browser-image-compression
        // sees the correct MIME and keeps iterating quality/dimensions.
        const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
        const stagedName = `${base}-resized.${extOf(fmt)}`;
        const stagedFile = new File([blob], stagedName, { type: mimeOf(fmt) });
        try {
          const { default: imageCompression } = await import(
            "browser-image-compression"
          );
          const outFile = await imageCompression(stagedFile, {
            useWebWorker: true,
            fileType: mimeOf(fmt),
            maxSizeMB: kb / 1024,
          } as never);
          if (outFile.size <= blob.size) blob = outFile;
        } catch {
          // keep resized-only blob if compression fails
        }
      }

      const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
      const outName = `${base}-${tw}x${th}.${extOf(fmt)}`;
      const previewUrl = URL.createObjectURL(blob);
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== row.id) return r;
          if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
          return {
            ...r,
            status: "done",
            outBlob: blob,
            outName,
            outW: tw,
            outH: th,
            outSize: blob.size,
            previewUrl,
          };
        }),
      );
    } finally {
      bmp.close?.();
    }
  };

  const resizeAll = async () => {
    if (!rows.length) return;
    if (mode === "pixels" && (width < 1 || height < 1)) {
      toast.error("Enter width and height");
      return;
    }
    setRunning(true);
    for (const row of rows) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "processing" } : r)),
      );
      try {
        await processOne(row);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Resize failed";
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, status: "error", error: msg } : r,
          ),
        );
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Resize finished");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob || !row.outName) return;
    saveAs(row.outBlob, row.outName);
  };

  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (!done.length) {
      toast.error("Resize some files first");
      return;
    }
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) {
      zip.file(uniqueZipName(used, r.outName!), r.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "resized-images.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <UploadDropzone
        accept={ACCEPT}
        multiple
        buttonLabel="Select images"
        onFiles={addFiles}
        accent="#e5322d"
      />

      {rows.length > 0 && (
        <>
          <div className="mt-6 space-y-4 rounded-xl border border-[#ececef] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#33333c]">Mode:</span>
              <label className="inline-flex items-center gap-1.5 text-[13px] text-[#33333c]">
                <input
                  type="radio"
                  name="rmode"
                  className="accent-[#e5322d]"
                  checked={mode === "pixels"}
                  onChange={() => setMode("pixels")}
                />
                By pixels
              </label>
              <label className="inline-flex items-center gap-1.5 text-[13px] text-[#33333c]">
                <input
                  type="radio"
                  name="rmode"
                  className="accent-[#e5322d]"
                  checked={mode === "percent"}
                  onChange={() => setMode("percent")}
                />
                By percent
              </label>
            </div>

            {mode === "pixels" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5a5a66]">
                  <label className="inline-flex items-center gap-2">
                    <span className="font-semibold text-[#33333c]">Width</span>
                    <input
                      type="number"
                      min={1}
                      value={width}
                      onChange={(e) => onWidth(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[13px]"
                    />
                    <span>px</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <span className="font-semibold text-[#33333c]">Height</span>
                    <input
                      type="number"
                      min={1}
                      value={height}
                      onChange={(e) => onHeight(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[13px]"
                    />
                    <span>px</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      className="accent-[#e5322d]"
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                    />
                    Lock aspect ratio
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="font-semibold text-[#33333c]">Presets:</span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.w, p.h)}
                      className="rounded-full border border-[#ececef] px-2.5 py-0.5 text-[#5a5a66] hover:bg-[#f9fafb]"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-[13px] text-[#5a5a66]">
                  <span className="whitespace-nowrap font-semibold text-[#33333c]">
                    Scale: {percent}%
                  </span>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={5}
                    value={percent}
                    onChange={(e) => setPercent(parseInt(e.target.value) || 100)}
                    className="w-full accent-[#e5322d]"
                  />
                </label>
                <div className="flex flex-wrap gap-1 text-[12px]">
                  {[25, 50, 75].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPercent(v)}
                      className={`rounded-full border px-2.5 py-0.5 ${
                        percent === v
                          ? "border-[#e5322d] bg-[#fff6f5] text-[#e5322d]"
                          : "border-[#ececef] text-[#5a5a66] hover:bg-[#f9fafb]"
                      }`}
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex items-center gap-3 text-[13px] text-[#5a5a66]">
              <span className="whitespace-nowrap font-semibold text-[#33333c]">
                JPG/WebP quality: {Math.round(quality * 100)}
              </span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-[#e5322d]"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5a5a66]">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  className="accent-[#e5322d]"
                  checked={alsoCompress}
                  onChange={(e) => setAlsoCompress(e.target.checked)}
                />
                <span className="font-semibold text-[#33333c]">Also compress to target KB</span>
              </label>
              {alsoCompress && (
                <label className="inline-flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    step={10}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Math.max(5, parseInt(e.target.value) || 0))}
                    className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[13px]"
                  />
                  <span>KB</span>
                </label>
              )}
            </div>

            {anyUpscale && (
              <div className="flex items-start gap-2 rounded-md border border-[#fde68a] bg-[#fffbeb] p-2.5 text-[12px] text-[#92400e]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  This will enlarge one or more images beyond their original size and may look soft. Resizing cannot add real detail.
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={resizeAll}
                disabled={running || !rows.length}
                className="inline-flex items-center gap-2 rounded-lg bg-[#e5322d] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {running ? "Resizing…" : "Resize all"}
              </button>
              <button
                type="button"
                onClick={downloadZip}
                disabled={!doneCount}
                className="inline-flex items-center gap-2 rounded-lg border border-[#ececef] bg-white px-5 py-2.5 text-[14px] font-semibold text-[#33333c] disabled:opacity-50"
              >
                <Download className="h-4 w-4" /> Download all as ZIP
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={running}
                className="inline-flex items-center rounded-lg px-3 py-2.5 text-[14px] text-[#5a5a66] hover:bg-[#f6f4f9] disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="relative overflow-hidden rounded-xl border border-[#ececef] bg-white"
              >
                <div className="grid aspect-square place-items-center bg-[#f6f4f9]">
                  {r.previewUrl ? (
                    <img
                      src={r.previewUrl}
                      alt={`Resized preview of ${r.file.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : r.status === "processing" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#e5322d]" />
                  ) : r.status === "error" ? (
                    <span className="px-2 text-center text-[12px] text-[#c72620]">
                      {r.error ?? "Failed"}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#5a5a66]">Ready</span>
                  )}
                </div>
                <div className="px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-medium text-[#33333c]" title={r.file.name}>
                      {r.file.name}
                    </span>
                    {r.status === "done" ? (
                      <button
                        type="button"
                        onClick={() => downloadOne(r)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#e5322d] hover:bg-[#fdeceb]"
                        aria-label={`Download ${r.outName}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[11px] text-[#5a5a66]">
                    {r.origW && r.origH ? (
                      <>
                        {r.origW}x{r.origH}, {formatBytes(r.origSize)}
                      </>
                    ) : (
                      formatBytes(r.origSize)
                    )}
                    {r.status === "done" && r.outW && r.outH && r.outSize != null ? (
                      <>
                        {" → "}
                        <span className="font-semibold text-[#33333c]">
                          {r.outW}x{r.outH}, {formatBytes(r.outSize)}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(r.id)}
                  className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-[#5a5a66] hover:text-[#e5322d]"
                  aria-label={`Remove ${r.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ImageResizeTool;
