import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, Plus, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { loadJSZip } from "@/lib/lazyLibs";
import { saveAs } from "@/lib/saveFile";
import { isSvgFile, uniqueZipName } from "@/lib/imageSafety";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { requestCompressImage, fetchCompressImageResult, type CompressImageProgress } from "@/lib/compressImage";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";

type Row = {
  id: string;
  file: File;
  originalSize: number;
  status: "pending" | "uploading" | "converting" | "downloading" | "done" | "error";
  percent: number | null;
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  savedPct?: number;
  previewUrl?: string;
  error?: string;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,.svg,.gif,image/jpeg,image/png,image/webp,image/svg+xml,image/gif";

function isSupported(f: File): boolean {
  const t = f.type;
  const n = f.name.toLowerCase();
  const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
  if (supportedTypes.includes(t)) return true;
  return /\.(jpe?g|png|webp|svg|gif)$/i.test(n);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function CompressImageTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const idRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => {
      if (!isSupported(f)) {
        toast.error(`"${f.name}" is not a supported image format`);
        return false;
      }
      return true;
    });
    if (!list.length) return;
    
    const newRows = list.map((f) => {
      const previewUrl = URL.createObjectURL(f);
      return {
        id: `${++idRef.current}-${f.name}`,
        file: f,
        originalSize: f.size,
        status: "pending" as const,
        percent: null,
        previewUrl,
      };
    });

    setRows((prev) => [...prev, ...newRows]);
    setSuccess(false);
  }, []);

  const removeRow = (id: string) => {
    setRows((prev) => {
      const r = prev.find((x) => x.id === id);
      if (r?.previewUrl) URL.revokeObjectURL(r.previewUrl);
      return prev.filter((x) => x.id !== id);
    });
  };

  const compressAll = async () => {
    if (!rows.length || running) return;
    
    setRunning(true);
    
    // UI: Navigate/Transition to a dedicated processing overlay or state
    // We keep the ToolWorkspace but override visual state for a dedicated "Processing" view
    
    abortControllerRef.current = new AbortController();
    
    try {
      // Process all files in parallel with proper backend orchestration
      await Promise.all(rows.map(async (row) => {
        if (row.status === "done") return;

        setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "uploading", percent: 0 } : r));

        try {
          const ready = await requestCompressImage(
            { file: row.file },
            {
              signal: abortControllerRef.current!.signal,
              onProgress: (p) => {
                setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: p.phase, percent: p.percent } : r));
              }
            }
          );

          setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "downloading", percent: 0 } : r));

          const blob = await fetchCompressImageResult(ready, {
            signal: abortControllerRef.current!.signal,
            onProgress: (pct) => {
              setRows(prev => prev.map(r => r.id === row.id ? { ...r, percent: pct } : r));
            }
          });

          const savedPct = row.originalSize
            ? Math.round(((row.originalSize - blob.size) / row.originalSize) * 100)
            : 0;

          const outName = row.file.name.replace(/\.[^.]+$/, "") + "-compressed" + 
            (row.file.name.match(/\.[^.]+$/)?.[0] || "");

          const previewUrl = URL.createObjectURL(blob);
          
          setRows(prev => prev.map(r => {
            if (r.id !== row.id) return r;
            if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
            return {
              ...r,
              status: "done",
              percent: 100,
              outBlob: blob,
              outName,
              outSize: blob.size,
              savedPct,
              previewUrl,
            };
          }));
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          
          setRows(prev => prev.map(r => 
            r.id === row.id ? { ...r, status: "error", error: err.message || "Failed" } : r
          ));
        }
      }));

      if (rows.every(r => r.status === "done")) {
        setSuccess(true);
        toast.success("All images compressed successfully!");
      } else {
        toast.error("Some images failed to compress.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info("Compression cancelled");
      } else {
        console.error("Compression loop error:", err);
      }
    } finally {
      setRunning(false);
      abortControllerRef.current = null;
    }
  };

  const handleDownloadAll = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (done.length === 1) {
      saveAs(done[0].outBlob!, done[0].outName!);
      return;
    }
    
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) {
      zip.file(uniqueZipName(used, r.outName!), r.outBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "compressed-images.zip");
  };

  if (success) {
    const totalOriginal = rows.reduce((acc, r) => acc + r.originalSize, 0);
    const totalCompressed = rows.reduce((acc, r) => acc + (r.outSize || r.originalSize), 0);
    const savedPct = Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100);

    return (
      <ToolSuccessScreen
        heading="Images Compressed!"
        subheading={`You saved ${formatBytes(totalOriginal - totalCompressed)} (${savedPct}% smaller).`}
        onDownload={handleDownloadAll}
        onReset={() => {
          rows.forEach(r => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
          setRows([]);
          setSuccess(false);
        }}
        downloadLabel={rows.length > 1 ? "Download All (ZIP)" : "Download Image"}
        suggestedSlugs={["resize-image", "crop-image", "webp-to-jpg"]}
        trustBadge={
          <div
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold"
            style={{ backgroundColor: "#eef4ff", color: "#254a9e" }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Your images were professionally compressed using our high-performance cloud engine.
          </div>
        }
      />
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <UploadDropzone
          accept={ACCEPT}
          multiple
          buttonLabel="Select images"
          hint="or drop JPG, PNG, WEBP, SVG or GIF images here"
          onFiles={addFiles}
          accent="#e5322d"
        />
      </div>
    );
  }

  return (
    <ToolWorkspace
      title="Compress images"
      actionLabel={running ? "Compressing..." : "Compress IMAGES"}
      onAction={compressAll}
      actionDisabled={running || rows.every(r => r.status === 'done')}
      loading={running}
      sidebar={
        <div className="space-y-6">
          <InfoTip>
            All images will be compressed while maintaining the best possible quality and file-size ratio.
          </InfoTip>
          
          <div className="rounded-xl border border-[#ececef] bg-[#f9fafb] p-4">
            <h3 className="text-sm font-semibold text-[#33333c] mb-2">Compression Info</h3>
            <ul className="space-y-2 text-xs text-[#5a5a66]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>Smart lossy compression for JPG/WEBP</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>Alpha transparency preserved for PNG</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span>Optimized SVG path data</span>
              </li>
            </ul>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="group relative flex flex-col rounded-xl border border-[#ececef] bg-white transition-all hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-xl bg-[#f6f4f9]">
                {r.previewUrl ? (
                  <img
                    src={r.previewUrl}
                    alt={r.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#e5322d]" />
                  </div>
                )}
                
                {/* Status Overlay */}
                {r.status !== "pending" && r.status !== "done" && r.status !== "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white">
                    <Loader2 className="mb-2 h-6 w-6 animate-spin" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {r.status}... {r.percent ? `${Math.round(r.percent)}%` : ""}
                    </span>
                  </div>
                )}

                {r.status === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                    <div className="rounded-full bg-green-500 p-1.5 text-white shadow-lg">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>
                )}

                {r.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 p-2 text-center">
                    <AlertCircle className="mb-1 h-6 w-6 text-red-500" />
                    <span className="text-[10px] font-medium text-red-600 line-clamp-2">
                      {r.error}
                    </span>
                  </div>
                )}

                {/* Remove button */}
                {!running && (
                  <button
                    onClick={() => removeRow(r.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#5a5a66] shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 lg:opacity-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              
              <div className="p-2.5">
                <p className="truncate text-[11px] font-semibold text-[#33333c]" title={r.file.name}>
                  {r.file.name}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-[#8a8a93]">
                  <span>{formatBytes(r.originalSize)}</span>
                  <span className="uppercase">{r.file.name.split('.').pop()}</span>
                </div>
                {r.status === "done" && r.outSize && (
                  <div className="mt-1.5 flex items-center justify-between border-t border-[#ececef] pt-1.5">
                    <span className="text-[10px] font-bold text-[#33333c]">
                      {formatBytes(r.outSize)}
                    </span>
                    <span className="rounded bg-green-100 px-1 py-0.5 text-[9px] font-bold text-green-700">
                      -{r.savedPct}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Add more button */}
          {!running && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d7d7dc] bg-[#f9fafb] transition-colors hover:border-[#e5322d] hover:bg-[#fff6f5]">
              <input
                type="file"
                className="hidden"
                multiple
                accept={ACCEPT}
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md">
                <Plus className="h-6 w-6" />
              </div>
              <span className="mt-2 text-[11px] font-bold text-[#5a5a66]">Add More</span>
            </label>
          )}
        </div>
      </div>
    </ToolWorkspace>
  );
}

export default CompressImageTool;
