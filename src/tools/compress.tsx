import { useState } from "react";
import { toast } from "sonner";
import { loadPdfLib } from "@/lib/lazyLibs";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { downloadBlob } from "@/lib/download";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

type Level = "less" | "recommended" | "extreme";

const LEVELS: Record<Level, { label: string; hint: string; scale: number; quality: number }> = {
  less:        { label: "Less Compression",    hint: "High quality, larger size",       scale: 1.5, quality: 0.9 },
  recommended: { label: "Recommended",         hint: "Good quality, good compression",  scale: 1.2, quality: 0.7 },
  extreme:     { label: "Extreme Compression", hint: "Smaller size, lower quality",     scale: 1.0, quality: 0.5 },
};

interface Result {
  blob: Blob;
  filename: string;
  originalSize: number;
  outputSize: number;
  keptOriginal: boolean;
}

export default function CompressPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<Level>("recommended");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string>("Compressing…");
  const [result, setResult] = useState<Result | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]); setLevel("recommended"); setResult(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true); setProgress(0); setLoadingLabel("Compressing…");
    try {
      const originalBytes = await file.arrayBuffer();
      const { scale, quality } = LEVELS[level];
      const doc = await loadPdfJsDoc(originalBytes);
      const total = doc.numPages;
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();

      for (let i = 1; i <= total; i++) {
        setLoadingLabel(`Compressing page ${i} of ${total}…`);
        const page = await doc.getPage(i);
        const vpPoints = page.getViewport({ scale: 1 });
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(vp.width));
        canvas.height = Math.max(1, Math.floor(vp.height));
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        const jpegBlob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", quality),
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
      toast.success(keptOriginal ? "PDF was already well optimized" : "PDF compressed");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false); setProgress(null);
    }
  };

  if (result) {
    const pct = result.originalSize
      ? Math.max(0, Math.round((1 - result.outputSize / result.originalSize) * 100))
      : 0;
    return (
      <ToolSuccessScreen
        heading={result.keptOriginal ? "Already optimized" : "PDF compressed!"}
        subheading={
          result.keptOriginal
            ? "Your PDF was already well optimized, we kept the best version."
            : "Your compressed PDF is ready to download."
        }
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["compress"] ?? ["merge", "split", "watermark", "page-numbers", "rotate", "crop"]}
      >
        <div
          className="rounded-2xl bg-white px-6 py-5 text-center"
          style={{ border: "1px solid #ececef" }}
        >
          <p className="text-[13px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.08em" }}>
            Compression Summary
          </p>
          <p className="mt-2 text-[18px] font-semibold" style={{ color: "#33333c" }}>
            {formatSize(result.originalSize)} → {formatSize(result.outputSize)}
            {!result.keptOriginal && pct > 0 && (
              <span className="ml-2 font-bold" style={{ color: "#1f9d55" }}>
                ({pct}% smaller)
              </span>
            )}
          </p>
        </div>
      </ToolSuccessScreen>
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];

  return (
    <ToolWorkspace
      title="Compress PDF"
      actionLabel="Compress PDF"
      loadingLabel={loadingLabel}
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <>
          <div className="space-y-2">
            <p className="text-[13px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
              Compression Level
            </p>
            {(Object.keys(LEVELS) as Level[]).map((k) => {
              const l = LEVELS[k];
              const active = level === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLevel(k)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors",
                  )}
                  style={{
                    border: active ? "2px solid #e5322d" : "1px solid #ececef",
                    backgroundColor: active ? "#fff6f5" : "#ffffff",
                    padding: active ? "calc(0.75rem - 1px)" : "0.75rem",
                  }}
                >
                  <span
                    className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full"
                    style={{
                      border: active ? "5px solid #e5322d" : "2px solid #cfcfd6",
                      backgroundColor: active ? "#ffffff" : "transparent",
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold" style={{ color: "#33333c" }}>
                      {l.label}
                    </span>
                    <span className="mt-0.5 block text-[12.5px]" style={{ color: "#5a5a66" }}>
                      {l.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <InfoTip>
            Compression works by re-encoding page images. Text in heavily compressed files may look slightly softer.
          </InfoTip>
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
    </ToolWorkspace>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
