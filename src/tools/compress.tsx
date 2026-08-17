import { useState, useEffect } from "react";
import { toast } from "sonner";
import { loadPdfLib } from "@/lib/lazyLibs";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import { 
  Star, 
  Check, 
  Zap, 
  FileText, 
  ArrowRight, 
  X, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { Link } from "@tanstack/react-router";

type Level = "less" | "recommended" | "extreme";

interface CompressionLevelInfo {
  id: Level;
  label: string;
  description: string;
  reduction: string;
  icon: typeof Star;
  scale: number;
  quality: number;
  badge?: string;
}

const LEVELS: CompressionLevelInfo[] = [
  {
    id: "less",
    label: "Less Compression",
    description: "High quality — best for printing",
    reduction: "~20-40% smaller",
    icon: Star,
    scale: 1.5,
    quality: 0.9,
  },
  {
    id: "recommended",
    label: "Recommended",
    description: "Balanced quality and size",
    reduction: "~40-70% smaller",
    icon: Check,
    scale: 1.2,
    quality: 0.7,
    badge: "Best for most cases",
  },
  {
    id: "extreme",
    label: "Extreme Compression",
    description: "Smallest size — for uploads with strict limits",
    reduction: "~70-90% smaller",
    icon: Zap,
    scale: 1.0,
    quality: 0.5,
  },
];

interface Result {
  blob: Blob;
  filename: string;
  originalSize: number;
  outputSize: number;
  keptOriginal: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function CompressPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<Level>("recommended");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string>("Compressing...");
  const [result, setResult] = useState<Result | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [thumbLoading, setThumbLoading] = useState(false);
  
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(files[0]);

  useEffect(() => {
    if (files.length > 0 && !protectedName) {
      const generateThumb = async () => {
        setThumbLoading(true);
        try {
          const buf = await files[0].arrayBuffer();
          const doc = await loadPdfJsDoc(buf);
          const page = await doc.getPage(1);
          const vp1 = page.getViewport({ scale: 1 });
          const scale = 300 / vp1.width;
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          setThumb(canvas.toDataURL("image/png"));
        } catch (e) {
          console.error("Thumb error", e);
        } finally {
          setThumbLoading(false);
        }
      };
      generateThumb();
    } else {
      setThumb(null);
    }
  }, [files, protectedName]);

  const resetAll = () => {
    setFiles([]);
    setLevel("recommended");
    setResult(null);
    setThumb(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setLoadingLabel("Compressing your PDF...");
    
    try {
      const originalBytes = await file.arrayBuffer();
      const levelInfo = LEVELS.find((l) => l.id === level)!;
      const doc = await loadPdfJsDoc(originalBytes);
      const total = doc.numPages;
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();

      for (let i = 1; i <= total; i++) {
        setLoadingLabel(`Optimizing images... Processing page ${i} of ${total}`);
        const page = await doc.getPage(i);
        const vpPoints = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale: levelInfo.scale });
        
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(vp.width));
        canvas.height = Math.max(1, Math.floor(vp.height));
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        
        const jpegBlob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", levelInfo.quality),
        );
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await out.embedJpg(jpegBytes);
        const newPage = out.addPage([vpPoints.width, vpPoints.height]);
        newPage.drawImage(img, { x: 0, y: 0, width: vpPoints.width, height: vpPoints.height });
        setProgress((i / total) * 100);
      }

      const saved = await out.save({ useObjectStreams: true });
      const compressedSize = saved.byteLength;
      const originalSize = file.size;
      const keptOriginal = compressedSize >= originalSize;
      
      const finalBlob = keptOriginal
        ? new Blob([originalBytes], { type: "application/pdf" })
        : new Blob([saved as BlobPart], { type: "application/pdf" });
        
      const base = file.name.replace(/\.pdf$/i, "");
      setResult({
        blob: finalBlob,
        filename: `${base}-compressed.pdf`,
        originalSize,
        outputSize: keptOriginal ? originalSize : compressedSize,
        keptOriginal,
      });
      
      if (keptOriginal) {
        toast.info("This PDF is already well-optimized. No further reduction possible.");
      } else {
        toast.success("PDF compressed successfully!");
      }
    } catch (e) {
      if (isPdfPasswordError(e)) {
        toast.error("PDF is password-protected");
      } else {
        toast.error(`Failed: ${(e as Error).message}`);
      }
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  if (result) {
    const savings = result.originalSize - result.outputSize;
    const pct = result.originalSize
      ? Math.max(0, Math.round((savings / result.originalSize) * 100))
      : 0;
      
    return (
      <ToolSuccessScreen
        heading={result.keptOriginal ? "Already optimized" : "Your PDF has been compressed!"}
        subheading={
          result.keptOriginal
            ? "Your PDF was already well optimized, we kept the best version."
            : "Your compressed PDF is ready to download."
        }
        downloadLabel="Download compressed PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["compress"] || ["merge", "split", "protect", "sign"]}
      >
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-[#ececef] bg-white shadow-sm">
          <div className="flex items-center divide-x divide-[#ececef]">
            <div className="flex-1 p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a66]">Original</p>
              <p className="mt-1 text-lg font-semibold text-[#33333c]">{formatSize(result.originalSize)}</p>
            </div>
            <div className="flex shrink-0 items-center justify-center p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f7f8] text-[#5a5a66]">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1 p-6 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#5a5a66]">Compressed</p>
              <p className="mt-1 text-lg font-bold text-[#10B981]">{formatSize(result.outputSize)}</p>
            </div>
          </div>
          
          {!result.keptOriginal && (
            <div className="bg-[#f0fdf4] px-6 py-3 text-center border-t border-[#ececef]">
              <p className="text-[13px] font-bold text-[#10B981]">
                Saved {formatSize(savings)} ({pct}% smaller)
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#5a5a66]">{result.filename}</p>
            </div>
          )}
        </div>
      </ToolSuccessScreen>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-[#F7F7F8] -mx-4 -mt-8 px-4 py-12 sm:px-6 lg:px-8 mb-8 rounded-b-3xl">
        <FileDropzone 
          accept="application/pdf" 
          files={files} 
          onFilesChange={setFiles} 
          buttonLabel="Select PDF file" 
        />
      </div>
    );
  }

  if (protectedName) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Cannot compress this file</h2>
          <p className="mt-2 text-gray-600">
            The file <strong>{protectedName}</strong> is password protected. 
            Please unlock it before trying to compress.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link 
              to="/tools/$slug" 
              params={{ slug: "unlock-pdf" }}
              className="rounded-xl bg-[#e5322d] px-8 py-3 font-bold text-white transition-all hover:bg-[#d42d28] hover:shadow-lg"
            >
              Unlock PDF →
            </Link>
            <button 
              onClick={reset}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 underline underline-offset-4"
            >
              Choose different file
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedFile = files[0];
  const selectedLevel = LEVELS.find(l => l.id === level)!;

  return (
    <ToolWorkspace
      title="Compress PDF"
      actionLabel="COMPRESS PDF →"
      loadingLabel={loadingLabel}
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[13px] font-bold uppercase tracking-wider text-[#5a5a66]">
              Compression Level
            </p>
            <div className="space-y-3">
              {LEVELS.map((l) => {
                const active = level === l.id;
                const Icon = l.icon;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id)}
                    className={cn(
                      "relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all hover:shadow-md",
                      active 
                        ? "border-[#e5322d] bg-[#fff6f5] ring-1 ring-[#e5322d]" 
                        : "border-[#ececef] bg-white"
                    )}
                  >
                    {l.badge && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-[#e5322d] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {l.badge}
                      </span>
                    )}
                    <div className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active ? "bg-[#e5322d] text-white" : "bg-[#f7f7f8] text-[#5a5a66]"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 pr-4">
                      <span className="block text-[15px] font-bold text-[#33333c]">
                        {l.label}
                      </span>
                      <span className="mt-1 block text-[12px] leading-relaxed text-[#5a5a66]">
                        {l.description}
                      </span>
                      <span className={cn(
                        "mt-2 block text-[12px] font-bold uppercase tracking-tight",
                        active ? "text-[#e5322d]" : "text-[#5a5a66]"
                      )}>
                        {l.reduction}
                      </span>
                    </div>
                    {active && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-5 w-5 rounded-full bg-[#e5322d] p-1 text-white">
                          <Check className="h-full w-full" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="rounded-xl bg-[#f8f9fa] p-4 text-[12.5px] leading-relaxed text-[#5a5a66] border border-[#ececef]">
            <strong>Note:</strong> Compression works by re-encoding page images. Text remains sharp at all levels. Heavily compressed images may look slightly softer when zoomed in.
          </div>

          <div className="mt-auto pt-4 text-center">
            <p className="text-[13px] font-medium text-[#5a5a66]">
              Using <span className="font-bold text-[#33333c]">{selectedLevel.label}</span> compression
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col items-center">
        <div className="group relative w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#ececef] transition-all hover:shadow-xl hover:ring-[#e5322d]/20">
          <div className="relative aspect-[3/4] w-full bg-[#f7f7f8]">
            {thumbLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#d7d7dc]" />
              </div>
            ) : thumb ? (
              <img src={thumb} alt={selectedFile.name} className="h-full w-full object-contain p-4" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#d7d7dc]">
                <FileText className="h-16 w-16" />
              </div>
            )}
            
            <button
              onClick={resetAll}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#5a5a66] shadow-md transition-all hover:bg-white hover:text-[#e5322d]"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="border-t border-[#ececef] p-4">
            <h3 className="truncate text-sm font-bold text-[#33333c]" title={selectedFile.name}>
              {selectedFile.name}
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#f7f7f8] px-2 py-1 text-[11px] font-bold text-[#5a5a66]">
                <FileText className="h-3.5 w-3.5" />
                {pageCount} {pageCount === 1 ? "page" : "pages"}
              </span>
              <span className="text-[12px] font-bold text-[#33333c]">
                {formatSize(selectedFile.size)}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={resetAll}
          className="mt-6 text-[13px] font-bold text-[#5a5a66] underline underline-offset-4 transition-colors hover:text-[#e5322d]"
        >
          Choose different file
        </button>
      </div>
    </ToolWorkspace>
  );
}

