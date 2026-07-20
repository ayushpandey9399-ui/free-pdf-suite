import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, Upload } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { guardDecodedSize, isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Row = {
  id: string;
  file: File;
  status: "pending" | "converting" | "done" | "error";
  outBlob?: Blob;
  previewUrl?: string;
  outName?: string;
  error?: string;
  originalSize: number;
  outSize?: number;
};

const ACCEPT = ".png,image/png";

function isPng(f: File): boolean {
  const n = f.name.toLowerCase();
  return n.endsWith(".png") || f.type === "image/png";
}

function formatBytes(n: number): string {
  if (!n || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function decodeToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, {
        imageOrientation: "from-image",
        premultiplyAlpha: "none",
      });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // fall through
      }
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode PNG"));
    };
    img.src = url;
  });
}

// Lazy WASM WebP encoder (Safari + older Firefox lack canvas WebP encoding).
// @jsquash/webp encodes an ImageData with its alpha channel intact.
let wasmEncoder: ((data: ImageData, opts?: { quality: number }) => Promise<ArrayBuffer>) | null = null;
async function getWasmEncoder() {
  if (wasmEncoder) return wasmEncoder;
  const mod = await import("@jsquash/webp");
  wasmEncoder = mod.encode;
  return wasmEncoder;
}

async function canvasEncodeWebp(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", quality);
  });
}

async function pngToWebp(file: File, quality: number): Promise<Blob> {
  const src = await decodeToBitmap(file);
  const w = (src as ImageBitmap).width;
  const h = (src as ImageBitmap).height;
  guardDecodedSize(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  // Alpha MUST stay. Do NOT pass { alpha: false } and do NOT fill any
  // background. A transparent PNG must produce a transparent WebP.
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(src as CanvasImageSource, 0, 0);
  if ("close" in src && typeof (src as ImageBitmap).close === "function") {
    (src as ImageBitmap).close();
  }

  // Native canvas WebP first.
  const nativeBlob = await canvasEncodeWebp(canvas, quality);
  if (nativeBlob && nativeBlob.type === "image/webp") {
    return nativeBlob;
  }

  // WASM fallback (Safari, some Firefox). Alpha is preserved end to end.
  const encode = await getWasmEncoder();
  const imageData = ctx.getImageData(0, 0, w, h);
  const buf = await encode(imageData, { quality: Math.round(quality * 100) });
  return new Blob([buf], { type: "image/webp" });
}

export function PngToWebpTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [quality, setQuality] = useState(0.85);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (isSvgFile(f)) {
        toast.error(`"${f.name}" is an SVG, not supported`);
        return false;
      }
      if (!isPng(f)) {
        toast.error(`"${f.name}" is not a PNG file`);
        return false;
      }
      return true;
    });
    if (!list.length) return;
    setRows((prev) => [
      ...prev,
      ...list.map((f) => ({
        id: `${++idRef.current}-${f.name}`,
        file: f,
        status: "pending" as const,
        originalSize: f.size,
      })),
    ]);
  }, []);

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

  const convertAll = async () => {
    if (!rows.length) return;
    setRunning(true);

    for (const row of rows) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "converting" } : r)),
      );
      try {
        const blob = await pngToWebp(row.file, quality);
        const base = row.file.name.replace(/\.png$/i, "");
        const outName = `${base}.webp`;
        const previewUrl = URL.createObjectURL(blob);
        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== row.id) return r;
            if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
            return {
              ...r,
              status: "done",
              outBlob: blob,
              previewUrl,
              outName,
              outSize: blob.size,
            };
          }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Conversion failed";
        setRows((prev) =>
          prev.map((r) => (r.id === row.id ? { ...r, status: "error", error: msg } : r)),
        );
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Conversion finished");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob) return;
    const base = row.file.name.replace(/\.png$/i, "");
    saveAs(row.outBlob, `${base}.webp`);
  };

  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob);
    if (!done.length) {
      toast.error("Convert some files first");
      return;
    }
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) {
      const base = r.file.name.replace(/\.png$/i, "");
      zip.file(uniqueZipName(used, `${base}.webp`), r.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "png-to-webp.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
          dragging ? "border-[#e5322d] bg-[#fff6f5]" : "border-[#ececef] bg-white"
        }`}
      >
        <Upload className="mb-3 h-8 w-8 text-[#e5322d]" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-[54px] items-center justify-center rounded-xl bg-[#e5322d] px-8 text-[16px] font-semibold text-white shadow-[0_10px_28px_rgba(229,50,45,0.28)] transition-transform hover:-translate-y-0.5"
        >
          Select PNG files
        </button>
        <p className="mt-3 text-[13px] text-[#5a5a66]">or drop .png images here</p>
        <p className="mt-1 text-[12px] text-[#5a5a66]">
          Your files never leave your device. Transparency is preserved.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {rows.length > 0 && (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#ececef] bg-white p-4">
            <label className="flex flex-1 min-w-[220px] items-center gap-3 text-[13px] text-[#5a5a66]">
              <span className="whitespace-nowrap font-semibold text-[#33333c]">
                Quality: {Math.round(quality * 100)}
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
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={convertAll}
                disabled={running || !rows.length}
                className="inline-flex items-center gap-2 rounded-lg bg-[#e5322d] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {running ? "Converting…" : "Convert all"}
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
            {rows.map((r) => {
              const saved =
                r.outSize && r.originalSize
                  ? Math.round(((r.originalSize - r.outSize) / r.originalSize) * 100)
                  : null;
              return (
                <li
                  key={r.id}
                  className="relative overflow-hidden rounded-xl border border-[#ececef] bg-white"
                >
                  <div
                    className="grid aspect-square place-items-center"
                    style={{
                      // Checkerboard so preserved transparency is visible in the WebP result.
                      backgroundImage:
                        "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    {r.previewUrl ? (
                      <img
                        src={r.previewUrl}
                        alt={`Converted WebP preview of ${r.file.name} (transparency preserved)`}
                        className="h-full w-full object-contain"
                      />
                    ) : r.status === "converting" ? (
                      <Loader2 className="h-6 w-6 animate-spin text-[#e5322d]" />
                    ) : r.status === "error" ? (
                      <span className="px-2 text-center text-[12px] text-[#c72620]">
                        {r.error ?? "Failed"}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#5a5a66]">PNG</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                    <span
                      className="truncate text-[12px] text-[#33333c]"
                      title={r.file.name}
                    >
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
                  <div className="px-2.5 pb-2 text-[11px] text-[#5a5a66]">
                    {formatBytes(r.originalSize)}
                    {r.outSize ? (
                      <>
                        {" "}
                        , {formatBytes(r.outSize)}
                        {saved !== null && saved > 0 ? (
                          <span className="ml-1 font-semibold text-[#047857]">
                            ,{saved}% smaller
                          </span>
                        ) : null}
                      </>
                    ) : null}
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
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

export default PngToWebpTool;
