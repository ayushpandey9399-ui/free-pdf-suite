import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, X, AlertTriangle, Download, FileImage } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { loadJSZip } from "@/lib/lazyLibs";
import { saveAs } from "@/lib/saveFile";
import { isSvgFile, uniqueZipName, singleZipEntry } from "@/lib/imageSafety";
import { cn } from "@/lib/utils";

/**
 * Architecture Notes
 *
 * WHY this exists: HEIC/HEIF is the default camera format on iPhones but is not
 * decodable by most desktop browsers or by common document pipelines. This tool
 * turns those files into universally readable JPGs entirely inside the browser,
 * so private photos never leave the user's device.
 *
 * WHY the 4-screen shape (Upload -> Workspace -> Processing -> Success): it is the
 * shared pattern every other converter on the site uses, so users learn one flow.
 * The workspace step matters here specifically because HEIC cannot be previewed
 * before decoding, so the user needs an explicit place to confirm the queue and
 * pick quality/resize settings before paying the decode cost.
 *
 * WHY per-file failure isolation: heic2any throws on a single malformed frame.
 * A batch of holiday photos must not be lost because one file is corrupt, so each
 * row carries its own status and the batch always runs to completion.
 */

type RowStatus = "pending" | "done" | "error";

interface Row {
  id: string;
  file: File;
  status: RowStatus;
  blob?: Blob;
  outName?: string;
  outSize?: number;
  previewUrl?: string;
  error?: string;
}

type MaxWidth = "original" | "1920" | "1280" | "800";

const ACCEPT = ".heic,.heif,image/heic,image/heif";

function isHeic(f: File): boolean {
  const n = f.name.toLowerCase();
  return (
    n.endsWith(".heic") ||
    n.endsWith(".heif") ||
    f.type === "image/heic" ||
    f.type === "image/heif" 
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

/** Downscale a decoded JPEG blob so its longest edge fits maxW, re-encoding at quality. */
async function resizeBlob(blob: Blob, maxW: number, quality: number): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = url;
    });
    if (img.naturalWidth <= maxW) return blob;
    const scale = maxW / img.naturalWidth;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", quality),
    );
    return out ?? blob;
  } catch {
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function HeicToJpgTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [quality, setQuality] = useState(0.9);
  const [maxWidth, setMaxWidth] = useState<MaxWidth>("original");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentName, setCurrentName] = useState("");
  const [finished, setFinished] = useState(false);
  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const resetAll = () => {
    rows.forEach((r) => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
    setRows([]);
    setFinished(false);
    setProgress(0);
    setCurrentName("");
  };

  const outName = (file: File, index: number) => {
    const base = file.name.replace(/\.(heic|heif)$/i, "");
    const clean = prefix.trim().replace(/[\\/:*?"<>|]/g, "");
    return clean ? `${clean}-${index + 1}.jpg` : `${base}.jpg`;
  };

  const run = async () => {
    if (!rows.length) return;
    setLoading(true);
    setProgress(0);

    let heic2any: typeof import("heic2any").default;
    try {
      heic2any = (await import("heic2any")).default;
    } catch {
      toast.error("Could not load the HEIC decoder. Check your connection and retry.");
      setLoading(false);
      return;
    }

    const next: Row[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setCurrentName(row.file.name);
      try {
        const result = await heic2any({
          blob: row.file,
          toType: "image/jpeg",
          quality,
        });
        let blob = Array.isArray(result) ? result[0] : result;
        if (maxWidth !== "original") {
          blob = await resizeBlob(blob, parseInt(maxWidth, 10), quality);
        }
        next.push({
          ...row,
          status: "done",
          blob,
          outName: outName(row.file, i),
          outSize: blob.size,
          previewUrl: URL.createObjectURL(blob),
        });
      } catch (err) {
        next.push({
          ...row,
          status: "error",
          error: err instanceof Error ? err.message : "Could not decode this file",
        });
      }
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }

    setRows(next);
    setLoading(false);
    setCurrentName("");

    const okCount = next.filter((r) => r.status === "done").length;
    if (!okCount) {
      toast.error("None of the files could be converted.");
      return;
    }
    if (okCount < next.length) {
      toast.warning(`${okCount} of ${next.length} files converted. The rest could not be decoded.`);
    } else {
      toast.success("Conversion complete!");
    }
    setFinished(true);
  };

  const done = useMemo(() => rows.filter((r) => r.status === "done" && r.blob), [rows]);
  const failed = useMemo(() => rows.filter((r) => r.status === "error"), [rows]);
  const inputBytes = useMemo(() => done.reduce((s, r) => s + r.file.size, 0), [done]);
  const outputBytes = useMemo(() => done.reduce((s, r) => s + (r.outSize ?? 0), 0), [done]);

  const downloadZip = async () => {
    if (!done.length) return;
    if (done.length === 1) {
      saveAs(done[0].blob!, done[0].outName!);
      return;
    }
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const used = new Set<string>();
    done.forEach((r) => zip.file(uniqueZipName(used, r.outName!), r.blob!));
    const single = await singleZipEntry(zip);
    if (single) {
      saveAs(single.blob, single.name);
      return;
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "heic-to-jpg.zip");
  };

  /* ---------------- Screen 4: Success ---------------- */
  if (finished) {
    return (
      <ToolSuccessScreen
        heading={done.length === 1 ? "Your JPG is ready!" : "Your JPG images are ready!"}
        subheading={
          failed.length
            ? `${done.length} of ${rows.length} files converted. ${failed.length} could not be decoded.`
            : `${done.length} HEIC ${done.length === 1 ? "file" : "files"} converted to JPG on your device.`
        }
        downloadLabel={done.length === 1 ? "Download JPG" : "Download ZIP"}
        onDownload={downloadZip}
        onReset={resetAll}
        resetLabel="Convert more files"
        suggestedSlugs={TOOL_SUGGESTIONS["heic-to-jpg"] ?? TOOL_SUGGESTIONS["images-to-pdf"]}
      >
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#ececef" }}>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">Original</p>
              <p className="mt-1 text-[18px] font-bold text-[#33333c]">{formatBytes(inputBytes)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">JPG output</p>
              <p className="mt-1 text-[18px] font-bold text-[#33333c]">{formatBytes(outputBytes)}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">Files</p>
              <p className="mt-1 text-[18px] font-bold text-[#33333c]">{done.length}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-2">
            {done.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl border px-3 py-2"
                style={{ borderColor: "#ececef" }}
              >
                {r.previewUrl ? (
                  <img
                    src={r.previewUrl}
                    alt={r.outName}
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#f6f4f9]">
                    <FileImage className="h-4 w-4 text-[#8a8a93]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#33333c]">{r.outName}</p>
                  <p className="text-[12px] text-[#5a5a66]">{formatBytes(r.outSize ?? 0)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => saveAs(r.blob!, r.outName!)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#e5322d] hover:bg-[#fdeceb]"
                  aria-label={`Download ${r.outName}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          {failed.length > 0 && (
            <ul className="mt-4 space-y-2">
              {failed.map((r) => (
                <li
                  key={r.id}
                  className="flex items-start gap-2 rounded-xl px-3 py-2 text-[12px]"
                  style={{ backgroundColor: "#fdeceb", color: "#c72620" }}
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0">
                    <strong className="font-semibold">{r.file.name}</strong> could not be converted.
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ToolSuccessScreen>
    );
  }

  /* ---------------- Screen 3: Processing ---------------- */
  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center rounded-2xl border border-[#ececef] bg-[#F7F7F8] p-8 text-center">
        <div className="mb-6 h-3 w-64 overflow-hidden rounded-full bg-[#ececef]">
          <div
            className="h-full bg-[#e5322d] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2 className="text-[24px] font-bold text-[#33333c]">
          Converting {Math.min(rows.length, Math.max(1, Math.ceil((progress / 100) * rows.length)))} of{" "}
          {rows.length} files...
        </h2>
        <p className="mt-2 max-w-md truncate text-[16px] text-[#8a8a93]">
          {currentName || "Decoding HEIC images..."}
        </p>
      </div>
    );
  }

  /* ---------------- Screen 1: Upload ---------------- */
  if (rows.length === 0) {
    return (
      <FileDropzone
        accept={ACCEPT}
        multiple
        files={[]}
        onFilesChange={addFiles}
        buttonLabel="Select HEIC files"
        hint="or drop HEIC / HEIF files here"
      />
    );
  }

  /* ---------------- Screen 2: Workspace ---------------- */
  return (
    <ToolWorkspace
      title="Options"
      actionLabel="Convert to JPG"
      loadingLabel="Converting..."
      onAction={run}
      loading={loading}
      progress={loading ? progress : null}
      actionDisabled={!rows.length}
      extraSidebarButton={
        <div className="mt-2 text-center">
          <p className="text-[11px] italic text-[#8a8a93]">
            {rows.length === 1
              ? "1 file will be converted to JPG"
              : `${rows.length} files will be converted and packed into a ZIP`}
          </p>
        </div>
      }
      sidebar={
        <div className="space-y-6">
          <section>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">
              Output format
            </label>
            <div className="mt-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold text-[#33333c]" style={{ borderColor: "#ececef", backgroundColor: "#f7f7f8" }}>
              JPG (.jpg)
            </div>
          </section>

          <section>
            <label
              htmlFor="heic-quality"
              className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]"
            >
              Quality
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                id="heic-quality"
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-[#e5322d]"
              />
              <span className="w-11 shrink-0 text-right text-[13px] tabular-nums text-[#5a5a66]">
                {Math.round(quality * 100)}%
              </span>
            </div>
          </section>

          <section>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">
              Resize
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["original", "1920", "1280", "800"] as MaxWidth[]).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setMaxWidth(w)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[13px] font-semibold transition-all",
                    maxWidth === w
                      ? "border-[#e5322d] bg-[#fdeceb] text-[#c72620]"
                      : "border-[#ececef] bg-white text-[#5a5a66] hover:border-[#d7d7dc]",
                  )}
                >
                  {w === "original" ? "Original" : `${w}px`}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label
              htmlFor="heic-prefix"
              className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]"
            >
              Filename prefix
            </label>
            <input
              id="heic-prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder="Keep original names"
              className="mt-2 w-full rounded-xl border px-3 py-2.5 text-[13px] text-[#33333c] outline-none focus:border-[#e5322d]"
              style={{ borderColor: "#ececef" }}
            />
          </section>
        </div>
      }
    >
      <div className="rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "#ececef" }}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[16px] font-bold text-[#33333c]">
            {rows.length} {rows.length === 1 ? "file" : "files"} ready
          </h2>
          <button
            type="button"
            onClick={resetAll}
            className="text-[13px] font-semibold text-[#5a5a66] hover:text-[#e5322d]"
          >
            Clear all
          </button>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="group relative overflow-hidden rounded-xl border bg-white"
              style={{ borderColor: "#ececef" }}
            >
              <div className="grid aspect-square place-items-center bg-[#f6f4f9]">
                <div className="text-center">
                  <FileImage className="mx-auto h-6 w-6 text-[#b9b9c2]" />
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">
                    HEIC
                  </span>
                </div>
              </div>
              <div className="px-2.5 py-2">
                <p className="truncate text-[12px] font-medium text-[#33333c]" title={r.file.name}>
                  {r.file.name}
                </p>
                <p className="text-[11px] text-[#8a8a93]">{formatBytes(r.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-[#5a5a66] shadow-sm hover:text-[#e5322d]"
                aria-label={`Remove ${r.file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}

          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold text-[#8a8a93] transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
              style={{ borderColor: "#d7d7dc" }}
            >
              <Plus className="h-5 w-5" />
              Add more
            </button>
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
          </li>
        </ul>
      </div>
    </ToolWorkspace>
  );
}

export default HeicToJpgTool;
