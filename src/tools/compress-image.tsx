import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, Upload } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Mode = "quality" | "target";

type Row = {
  id: string;
  file: File;
  originalSize: number;
  status: "pending" | "converting" | "done" | "error";
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  savedPct?: number;
  previewUrl?: string;
  error?: string;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

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

function outExtension(file: File): string {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  return "jpg";
}

export function CompressImageTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<Mode>("quality");
  const [quality, setQuality] = useState(0.8);
  const [targetKb, setTargetKb] = useState(200);
  const [maxDim, setMaxDim] = useState(0); // 0 = off
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (!isSupported(f)) {
        toast.error(`"${f.name}" is not a JPG, PNG, or WebP`);
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
        originalSize: f.size,
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

  const compressAll = async () => {
    if (!rows.length) return;
    setRunning(true);
    const { default: imageCompression } = await import("browser-image-compression");

    for (const row of rows) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "converting" } : r)),
      );
      try {
        const opts: Record<string, unknown> = {
          useWebWorker: true,
          fileType: row.file.type || undefined,
        };
        if (mode === "quality") {
          opts.initialQuality = quality;
          // Large ceiling so quality drives the result
          opts.maxSizeMB = 50;
        } else {
          const kb = Math.max(5, Math.floor(targetKb));
          opts.maxSizeMB = kb / 1024;
        }
        if (maxDim && maxDim >= 100) {
          opts.maxWidthOrHeight = maxDim;
        }

        const outFile = await imageCompression(row.file, opts as never);
        const outBlob: Blob = outFile;
        const ext = outExtension(row.file);
        const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
        const outName = `${base}-compressed.${ext}`;
        const previewUrl = URL.createObjectURL(outBlob);
        const savedPct = row.originalSize
          ? Math.round(((row.originalSize - outBlob.size) / row.originalSize) * 100)
          : 0;
        setRows((prev) =>
          prev.map((r) => {
            if (r.id !== row.id) return r;
            if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
            return {
              ...r,
              status: "done",
              outBlob,
              outName,
              outSize: outBlob.size,
              savedPct,
              previewUrl,
            };
          }),
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Compression failed";
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, status: "error", error: msg } : r,
          ),
        );
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Compression finished");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob || !row.outName) return;
    saveAs(row.outBlob, row.outName);
  };

  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (!done.length) {
      toast.error("Compress some files first");
      return;
    }
    const zip = new JSZip();
    for (const r of done) {
      zip.file(r.outName!, r.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "compressed-images.zip");
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
          Select images
        </button>
        <p className="mt-3 text-[13px] text-[#5a5a66]">
          or drop JPG, PNG, or WebP images here
        </p>
        <p className="mt-1 text-[12px] text-[#5a5a66]">
          Your files never leave your device.
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
          <div className="mt-6 space-y-4 rounded-xl border border-[#ececef] bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#33333c]">Mode:</span>
              <label className="inline-flex items-center gap-1.5 text-[13px] text-[#33333c]">
                <input
                  type="radio"
                  name="mode"
                  className="accent-[#e5322d]"
                  checked={mode === "quality"}
                  onChange={() => setMode("quality")}
                />
                Quality
              </label>
              <label className="inline-flex items-center gap-1.5 text-[13px] text-[#33333c]">
                <input
                  type="radio"
                  name="mode"
                  className="accent-[#e5322d]"
                  checked={mode === "target"}
                  onChange={() => setMode("target")}
                />
                Target size
              </label>
            </div>

            {mode === "quality" ? (
              <label className="flex items-center gap-3 text-[13px] text-[#5a5a66]">
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
            ) : (
              <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#5a5a66]">
                <label className="inline-flex items-center gap-2">
                  <span className="whitespace-nowrap font-semibold text-[#33333c]">
                    Target size (KB):
                  </span>
                  <input
                    type="number"
                    min={5}
                    step={10}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Math.max(5, parseInt(e.target.value) || 0))}
                    className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[13px]"
                  />
                </label>
                <div className="flex flex-wrap gap-1">
                  {[20, 50, 100, 200, 500].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setTargetKb(v)}
                      className={`rounded-full border px-2.5 py-0.5 text-[12px] ${
                        targetKb === v
                          ? "border-[#e5322d] bg-[#fff6f5] text-[#e5322d]"
                          : "border-[#ececef] text-[#5a5a66] hover:bg-[#f9fafb]"
                      }`}
                    >
                      {v} KB
                    </button>
                  ))}
                </div>
                <p className="basis-full text-[12px] text-[#5a5a66]">
                  Result will be at or under the target when possible.
                </p>
              </div>
            )}

            <label className="flex items-center gap-2 text-[13px] text-[#5a5a66]">
              <span className="whitespace-nowrap font-semibold text-[#33333c]">
                Max width or height (px, optional):
              </span>
              <input
                type="number"
                min={0}
                step={50}
                value={maxDim || ""}
                placeholder="off"
                onChange={(e) => setMaxDim(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[13px]"
              />
            </label>

            <p className="text-[12px] text-[#5a5a66]">
              PNG compression stays lossless-friendly and may shrink less than JPG or WebP. For PNG photos, converting to JPG can save more; try the{" "}
              <a href="/image-tools/png-to-jpg" className="text-[#e5322d] underline">
                PNG to JPG tool
              </a>
              .
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={compressAll}
                disabled={running || !rows.length}
                className="inline-flex items-center gap-2 rounded-lg bg-[#e5322d] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-50"
              >
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {running ? "Compressing…" : "Compress all"}
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
                      alt={`Compressed preview of ${r.file.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : r.status === "converting" ? (
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
                    {formatBytes(r.originalSize)}
                    {r.status === "done" && r.outSize != null ? (
                      <>
                        {" → "}
                        <span className="font-semibold text-[#33333c]">
                          {formatBytes(r.outSize)}
                        </span>
                        {r.savedPct != null ? (
                          <span
                            className={`ml-1 ${
                              r.savedPct > 0 ? "text-[#047857]" : "text-[#c72620]"
                            }`}
                          >
                            ({r.savedPct > 0 ? "-" : "+"}
                            {Math.abs(r.savedPct)}%)
                          </span>
                        ) : null}
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

export default CompressImageTool;
