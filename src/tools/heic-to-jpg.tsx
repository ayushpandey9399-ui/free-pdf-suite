import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, Upload } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Row = {
  id: string;
  file: File;
  status: "pending" | "converting" | "done" | "error";
  outBlobs?: Blob[];
  previewUrl?: string;
  outName?: string;
  error?: string;
};

const ACCEPT = ".heic,.heif,image/heic,image/heif";

function isHeic(f: File): boolean {
  const n = f.name.toLowerCase();
  return (
    n.endsWith(".heic") ||
    n.endsWith(".heif") ||
    f.type === "image/heic" ||
    f.type === "image/heif" ||
    // Some OSes give an empty type; accept and try.
    f.type === ""
  );
}

export function HeicToJpgTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [quality, setQuality] = useState(0.9);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (isSvgFile(f)) {
        toast.error(`"${f.name}" is an SVG, not supported`);
        return false;
      }
      if (!isHeic(f)) {
        toast.error(`"${f.name}" is not a HEIC/HEIF file`);
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
    const heic2any = (await import("heic2any")).default;

    for (const row of rows) {
      if (row.status === "done") continue;
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "converting" } : r)),
      );
      try {
        const result = await heic2any({
          blob: row.file,
          toType: "image/jpeg",
          quality,
        });
        const blobs = Array.isArray(result) ? result : [result];
        const base = row.file.name.replace(/\.(heic|heif)$/i, "");
        const outName =
          blobs.length === 1 ? `${base}.jpg` : `${base}-1.jpg`;
        const previewUrl = URL.createObjectURL(blobs[0]);
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? { ...r, status: "done", outBlobs: blobs, previewUrl, outName }
              : r,
          ),
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
    if (!row.outBlobs?.length) return;
    const base = row.file.name.replace(/\.(heic|heif)$/i, "");
    row.outBlobs.forEach((b, i) => {
      const name = row.outBlobs!.length === 1 ? `${base}.jpg` : `${base}-${i + 1}.jpg`;
      saveAs(b, name);
    });
  };

  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlobs?.length);
    if (!done.length) {
      toast.error("Convert some files first");
      return;
    }
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) {
      const base = r.file.name.replace(/\.(heic|heif)$/i, "");
      r.outBlobs!.forEach((b, i) => {
        const rawName = r.outBlobs!.length === 1 ? `${base}.jpg` : `${base}-${i + 1}.jpg`;
        zip.file(uniqueZipName(used, rawName), b);
      });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "heic-to-jpg.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Dropzone */}
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
          Select HEIC files
        </button>
        <p className="mt-3 text-[13px] text-[#5a5a66]">
          or drop .heic / .heif photos here
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
          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[#ececef] bg-white p-4">
            <label className="flex items-center gap-3 text-[14px] text-[#33333c]">
              <span className="font-semibold">Quality</span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-40"
                disabled={running}
              />
              <span className="w-10 tabular-nums text-[#5a5a66]">
                {Math.round(quality * 100)}%
              </span>
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

          {/* File grid */}
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
                      alt={r.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : r.status === "converting" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#e5322d]" />
                  ) : r.status === "error" ? (
                    <span className="px-2 text-center text-[12px] text-[#c72620]">
                      {r.error ?? "Failed"}
                    </span>
                  ) : (
                    <span className="text-[12px] text-[#5a5a66]">HEIC</span>
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

export default HeicToJpgTool;
