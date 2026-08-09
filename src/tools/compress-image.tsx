import { UploadDropzone } from "@/components/UploadDropzone";
import { Link } from "@tanstack/react-router";
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
    
    // UI: Transition to a dedicated processing overlay
    abortControllerRef.current = new AbortController();
    
    try {
      // Process all files sequentially to ensure progress UI reflects each stage correctly
      const results: Row[] = [];
      
      for (const row of rows) {
        if (row.status === "done") {
          results.push(row);
          continue;
        }

        setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "uploading" as const, percent: 0 } : r));

        try {
          const ready = await requestCompressImage(
            { file: row.file },
            {
              signal: abortControllerRef.current.signal,
              onProgress: (p) => {
                setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: p.phase, percent: p.percent } : r));
              }
            }
          );

          setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: "downloading" as const, percent: 0 } : r));

          const blob = await fetchCompressImageResult(ready, {
            signal: abortControllerRef.current.signal,
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
          
          let updatedRow: Row | undefined;
          setRows(prev => {
            const updated = prev.map(r => {
              if (r.id !== row.id) return r;
              if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
              return {
                ...r,
                status: "done" as const,
                percent: 100,
                outBlob: blob,
                outName,
                outSize: blob.size,
                savedPct,
                previewUrl,
              };
            });
            updatedRow = updated.find(x => x.id === row.id);
            return updated;
          });
          if (updatedRow) results.push(updatedRow);
        } catch (err: any) {
          if (err.name === 'AbortError') throw err;
          
          let erroredRow: Row | undefined;
          setRows(prev => {
            const updated = prev.map(r => 
              r.id === row.id ? { ...r, status: "error" as const, error: err.message || "Failed" } : r
            );
            erroredRow = updated.find(x => x.id === row.id);
            return updated;
          });
          if (erroredRow) results.push(erroredRow);
        }
      }

      if (results.every(r => r.status === "done")) {
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
        toast.error("An unexpected error occurred. Please try again.");
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
    const doneRows = rows.filter(r => r.status === 'done' && r.outBlob);

    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3 text-green-600 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-extrabold text-[#1c1c26] sm:text-4xl">
            Your images have been compressed!
          </h1>
          <p className="text-lg text-[#5a5a66]">
            Every kilobyte counts. We've optimized your images for the web.
          </p>
        </div>

        {/* Summary Card */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#ececef] bg-white shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-y divide-[#ececef] sm:grid-cols-4 sm:divide-y-0">
            <div className="p-6 text-center">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#8a8a93]">Files</span>
              <span className="mt-1 block text-2xl font-extrabold text-[#1c1c26]">{doneRows.length}</span>
            </div>
            <div className="p-6 text-center">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#8a8a93]">Original</span>
              <span className="mt-1 block text-2xl font-extrabold text-[#1c1c26]">{formatBytes(totalOriginal)}</span>
            </div>
            <div className="p-6 text-center">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#8a8a93]">Compressed</span>
              <span className="mt-1 block text-2xl font-extrabold text-[#1c1c26]">{formatBytes(totalCompressed)}</span>
            </div>
            <div className="p-6 text-center bg-[#f0f9ff]">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#0369a1]">Saved</span>
              <span className="mt-1 block text-2xl font-extrabold text-[#0369a1]">{savedPct}%</span>
            </div>
          </div>
          <div className="border-t border-[#ececef] bg-[#f9fafb] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#5a5a66]">
              <Info className="h-4 w-4 text-[#2563EB]" />
              Total savings: <span className="font-bold text-[#1c1c26]">{formatBytes(totalOriginal - totalCompressed)}</span>
            </div>
            <button
              onClick={handleDownloadAll}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-[#1d4ed8] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-5 w-5" />
              {doneRows.length > 1 ? "Download compressed IMAGES (ZIP)" : "Download compressed IMAGE"}
            </button>
          </div>
        </div>

        {/* Individual Result Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {doneRows.map((r) => (
            <div key={r.id} className="group relative overflow-hidden rounded-xl border border-[#ececef] bg-white transition-all hover:shadow-md hover:border-[#2563EB]/30">
              <div className="relative aspect-video overflow-hidden bg-[#f6f4f9]">
                {r.previewUrl && (
                  <img src={r.previewUrl} alt={r.file.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                )}
                <div className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold text-[#2563EB] shadow-sm backdrop-blur-sm">
                  -{r.savedPct}%
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <p className="truncate text-sm font-bold text-[#1c1c26]" title={r.file.name}>{r.file.name}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#8a8a93]">
                    <span>{formatBytes(r.originalSize)}</span>
                    <span className="flex items-center gap-1 font-bold text-[#059669]">
                      <CheckCircle2 className="h-3 w-3" />
                      {formatBytes(r.outSize || 0)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => r.outBlob && r.outName && saveAs(r.outBlob, r.outName)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#ececef] py-2 text-xs font-bold text-[#33333c] transition-colors hover:bg-gray-50 hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col items-center justify-center gap-8 pt-6 border-t border-[#ececef]">
          <button
            onClick={() => {
              rows.forEach(r => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
              setRows([]);
              setSuccess(false);
            }}
            className="text-sm font-bold text-[#5a5a66] transition-colors hover:text-[#2563EB] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Compress more images
          </button>

          <div className="w-full">
            <h3 className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-[#8a8a93]">Continue to...</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: 'Resize IMAGE', slug: 'resize-image' },
                { label: 'Crop IMAGE', slug: 'crop-image' },
                { label: 'Rotate IMAGE', slug: 'rotate-image' },
                { label: 'Convert to JPG', slug: 'jpg-to-png' },
                { label: 'Watermark IMAGE', slug: 'watermark-image' }
              ].map(tool => (
                <Link
                  key={tool.slug}
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="flex flex-col items-center justify-center rounded-xl border border-[#ececef] bg-white p-4 text-center transition-all hover:shadow-md hover:border-[#2563EB]/20 hover:-translate-y-1"
                >
                  <span className="text-[11px] font-bold text-[#33333c]">{tool.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
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

  if (running) {
    const total = rows.length;
    const done = rows.filter(r => r.status === 'done').length;
    const active = rows.find(r => ['uploading', 'converting', 'downloading'].includes(r.status));
    const activeName = active?.file.name || '';
    const activePhase = active?.status === 'uploading' ? 'Uploading' : 
                       active?.status === 'converting' ? 'Optimizing' : 
                       active?.status === 'downloading' ? 'Downloading' : 'Processing';
    const activePercent = active?.percent ?? null;
    const isIndeterminate = active?.status === 'converting' || (active?.status === 'uploading' && activePercent === null);

    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="text-center">
          {/* Logo Placeholder - assuming there's a site logo or we use text */}
          <div className="mb-8 text-2xl font-bold text-[#E5322D]">FreePDFHub</div>
          
          <h2 className="mb-8 text-3xl font-bold text-[#33333c]">Compressing images...</h2>
          
          <div className="relative mb-6 inline-flex items-center justify-center">
            {/* Large circular progress */}
            <svg className="h-40 w-40 -rotate-90 transform">
              <circle
                className="text-[#ececef]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
              />
              <circle
                className={`text-[#2563EB] transition-all duration-500 ease-in-out ${isIndeterminate ? 'animate-[pulse_1.5s_infinite]' : ''}`}
                strokeWidth="8"
                strokeDasharray={440}
                strokeDashoffset={isIndeterminate ? 110 : 440 - (440 * (done / total))}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              {isIndeterminate ? (
                <Loader2 className="h-10 w-10 animate-spin text-[#2563EB]" />
              ) : (
                <span className="text-4xl font-bold text-[#33333c]">{Math.round((done / total) * 100)}%</span>
              )}
            </div>
          </div>
          
          <div className="max-w-xs space-y-2 mx-auto">
            <p className="text-lg font-medium text-[#33333c]">
              {isIndeterminate ? `Processing...` : `Compressing ${done + (active ? 1 : 0)} of ${total} images`}
            </p>
            {active && (
              <div className="flex flex-col items-center gap-1">
                <p className="text-sm text-[#5a5a66] truncate max-w-full px-4">
                  {activeName}
                </p>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  {activePhase} {!isIndeterminate && activePercent !== null && activePercent > 0 ? `${Math.round(activePercent)}%` : ''}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => abortControllerRef.current?.abort()}
            className="mt-12 text-sm font-semibold text-[#5a5a66] hover:text-[#e5322d]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const hasErrors = rows.some(r => r.status === 'error');
  if (hasErrors && !running && !success) {
     return (
       <div className="mx-auto max-w-2xl text-center py-12">
         <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
         <h2 className="text-2xl font-bold text-[#33333c] mb-2">Compression Encountered Problems</h2>
         <p className="text-[#5a5a66] mb-8">Some of your images couldn't be compressed. You can try again or check the files.</p>
         
         <div className="grid gap-3 mb-8">
           {rows.filter(r => r.status === 'error').map(r => (
             <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50 text-left">
               <span className="text-sm font-medium text-red-700 truncate mr-4">{r.file.name}</span>
               <span className="text-xs text-red-500 whitespace-nowrap">{r.error || 'Unknown error'}</span>
             </div>
           ))}
         </div>

         <div className="flex justify-center gap-4">
           <button
             onClick={compressAll}
             className="px-8 py-3 bg-[#e5322d] text-white font-bold rounded-xl shadow-lg hover:bg-[#c72620] transition-colors"
           >
             Try Again
           </button>
           <button
             onClick={() => {
               setRows(prev => prev.filter(r => r.status !== 'error'));
             }}
             className="px-8 py-3 border border-[#ececef] text-[#33333c] font-bold rounded-xl hover:bg-gray-50 transition-colors"
           >
             Back to Workspace
           </button>
         </div>
       </div>
     );
  }

  return (
    <ToolWorkspace
      title="Compress images"
      actionLabel="Compress IMAGES"
      onAction={compressAll}
      actionDisabled={rows.length === 0 || rows.every(r => r.status === 'done')}
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
                <button
                  onClick={() => removeRow(r.id)}
                  className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#5a5a66] shadow-sm transition-colors hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 lg:opacity-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
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
        </div>
      </div>
    </ToolWorkspace>
  );
}

export default CompressImageTool;
