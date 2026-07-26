import { UploadDropzone } from "@/components/UploadDropzone";
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
};

const ACCEPT = ".webp,image/webp";

function isWebp(f: File): boolean {
  const n = f.name.toLowerCase();
  return n.endsWith(".webp") || f.type === "image/webp";
}

async function decodeToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      try {
        return await createImageBitmap(file);
      } catch {
        // fall through to <img> path
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
      reject(new Error("Could not decode WebP (browser may not support it)"));
    };
    img.src = url;
  });
}

async function webpToJpg(file: File, quality: number): Promise<Blob> {
  const src = await decodeToBitmap(file);
  const w = (src as ImageBitmap).width;
  const h = (src as ImageBitmap).height;
  guardDecodedSize(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  // CRITICAL: JPG has no alpha channel. WebP can be transparent, so fill
  // the canvas with solid white first, then draw. Transparent pixels
  // become white (not black).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(src as CanvasImageSource, 0, 0);
  if ("close" in src && typeof (src as ImageBitmap).close === "function") {
    (src as ImageBitmap).close();
  }
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("JPG encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}

export function WebpToJpgTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const idRef = useRef(0);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (isSvgFile(f)) {
        toast.error(`"${f.name}" is an SVG, not supported`);
        return false;
      }
      if (!isWebp(f)) {
        toast.error(`"${f.name}" is not a WebP file`);
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
        prev.map((r) =>
          r.id === row.id ? { ...r, status: "converting" } : r,
        ),
      );
      try {
        const blob = await webpToJpg(row.file, quality);
        const base = row.file.name.replace(/\.webp$/i, "");
        const outName = `${base}.jpg`;
        const previewUrl = URL.createObjectURL(blob);
        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== row.id) return r;
            if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
            return { ...r, status: "done", outBlob: blob, previewUrl, outName };
          }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Conversion failed";
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, status: "error", error: msg } : r,
          ),
        );
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Conversion finished");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob) return;
    const base = row.file.name.replace(/\.webp$/i, "");
    saveAs(row.outBlob, `${base}.jpg`);
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
      const base = r.file.name.replace(/\.webp$/i, "");
      zip.file(uniqueZipName(used, `${base}.jpg`), r.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "webp-to-jpg.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <UploadDropzone
        accept={ACCEPT}
        multiple
        buttonLabel="Select WebP files"
        hint="or drop .webp images here"
        onFiles={addFiles}
        accent="#e5322d"
      />

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
            {rows.map((r) => (
              <li
                key={r.id}
                className="relative overflow-hidden rounded-xl border border-[#ececef] bg-white"
              >
                <div className="grid aspect-square place-items-center bg-[#f6f4f9]">
                  {r.previewUrl ? (
                    <img
                      src={r.previewUrl}
                      alt={`Converted JPG preview of ${r.file.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : r.status === "converting" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#e5322d]" />
                  ) : r.status === "error" ? (
                    <span className="px-2 text-center text-[12px] text-[#c72620]">
                      {r.error ?? "Failed"}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#5a5a66]">WebP</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="truncate text-[12px] text-[#33333c]" title={r.file.name}>
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

export default WebpToJpgTool;
