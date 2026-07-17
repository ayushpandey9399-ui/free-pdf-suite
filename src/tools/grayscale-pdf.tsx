import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type Quality = "high" | "smaller";

const QUALITY: Record<Quality, { label: string; hint: string; scale: number; jpeg: number }> = {
  high:    { label: "High quality",  hint: "Best fidelity, larger file",  scale: 1.5, jpeg: 0.85 },
  smaller: { label: "Smaller file",  hint: "Lower fidelity, smaller PDF", scale: 1.2, jpeg: 0.7 },
};

interface Result {
  blob: Blob;
  filename: string;
  originalSize: number;
  outputSize: number;
}

/** Draw a page onto a canvas, optionally grayscale. */
async function renderPage(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof loadPdfJsDoc>>["getPage"]>>,
  scale: number,
  grayscale: boolean,
): Promise<HTMLCanvasElement> {
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(vp.width));
  canvas.height = Math.max(1, Math.floor(vp.height));
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
  if (grayscale) applyGrayscale(ctx, canvas.width, canvas.height);
  return canvas;
}

function applyGrayscale(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Try canvas filter first (fast, GPU-accelerated where available).
  try {
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const tctx = tmp.getContext("2d")!;
    tctx.drawImage(ctx.canvas, 0, 0);
    ctx.clearRect(0, 0, w, h);
    // Feature-detect filter support.
    const supported = "filter" in ctx && typeof ctx.filter === "string";
    if (supported) {
      ctx.filter = "grayscale(1)";
      ctx.drawImage(tmp, 0, 0);
      ctx.filter = "none";
      return;
    }
  } catch {
    /* fall through */
  }
  // Manual luminance fallback.
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = g; d[i + 1] = g; d[i + 2] = g;
  }
  ctx.putImageData(img, 0, 0);
}

export default function GrayscalePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState<Quality>("high");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string>("Converting…");
  const [result, setResult] = useState<Result | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [grayPreview, setGrayPreview] = useState<string | null>(null);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(files[0]);
  const bytesRef = useRef<ArrayBuffer | null>(null);

  // Load original bytes once when file picked.
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!files[0]) { bytesRef.current = null; setOriginalPreview(null); setGrayPreview(null); return; }
      try {
        const buf = await files[0].arrayBuffer();
        if (cancel) return;
        bytesRef.current = buf;
      } catch {/* ignore */}
    })();
    return () => { cancel = true; };
  }, [files]);

  // Regenerate previews when file OR quality changes.
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!files[0]) return;
      // Wait for bytes to load.
      const buf = bytesRef.current ?? await files[0].arrayBuffer();
      if (cancel) return;
      bytesRef.current = buf;
      try {
        const doc = await loadPdfJsDoc(buf.slice(0));
        const page = await doc.getPage(1);
        const previewScale = 1.0;
        const orig = await renderPage(page, previewScale, false);
        const gray = await renderPage(page, QUALITY[quality].scale, true);
        if (cancel) return;
        setOriginalPreview(orig.toDataURL("image/jpeg", 0.8));
        setGrayPreview(gray.toDataURL("image/jpeg", QUALITY[quality].jpeg));
      } catch {
        /* preview failure is non-fatal */
      }
    })();
    return () => { cancel = true; };
  }, [files, quality]);

  const resetAll = () => {
    setFiles([]); setQuality("high"); setResult(null);
    setOriginalPreview(null); setGrayPreview(null);
    bytesRef.current = null;
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true); setProgress(0); setLoadingLabel("Converting…");
    try {
      const buf = bytesRef.current ?? await file.arrayBuffer();
      const { scale, jpeg } = QUALITY[quality];
      const doc = await loadPdfJsDoc(buf.slice(0));
      const total = doc.numPages;
      const out = await PDFDocument.create();

      for (let i = 1; i <= total; i++) {
        setLoadingLabel(`Converting page ${i} of ${total}…`);
        const page = await doc.getPage(i);
        const vpPoints = page.getViewport({ scale: 1 });
        const canvas = await renderPage(page, scale, true);
        const jpegBlob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b!), "image/jpeg", jpeg),
        );
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await out.embedJpg(jpegBytes);
        const newPage = out.addPage([vpPoints.width, vpPoints.height]);
        newPage.drawImage(img, { x: 0, y: 0, width: vpPoints.width, height: vpPoints.height });
        setProgress((i / total) * 100);
      }

      const saved = await out.save({ useObjectStreams: true });
      const base = file.name.replace(/\.pdf$/i, "");
      setResult({
        blob: new Blob([saved as BlobPart], { type: "application/pdf" }),
        filename: `${base}-grayscale.pdf`,
        originalSize: file.size,
        outputSize: saved.byteLength,
      });
      toast.success("PDF converted to grayscale");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false); setProgress(null);
    }
  };

  if (result) {
    const diff = result.originalSize - result.outputSize;
    const pct = result.originalSize
      ? Math.round((diff / result.originalSize) * 100)
      : 0;
    return (
      <ToolSuccessScreen
        heading="PDF converted to grayscale!"
        subheading="Your black & white PDF is ready to download."
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["grayscale-pdf"] ?? ["compress", "merge", "split", "watermark", "page-numbers", "rotate"]}
      >
        <div className="rounded-2xl bg-white px-6 py-5 text-center" style={{ border: "1px solid #ececef" }}>
          <p className="text-[13px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
            File Size
          </p>
          <p className="mt-2 text-[18px] font-semibold" style={{ color: "#33333c" }}>
            {formatSize(result.originalSize)} → {formatSize(result.outputSize)}
            {pct > 0 && (
              <span className="ml-2 font-bold" style={{ color: "#1f9d55" }}>({pct}% smaller)</span>
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
      title="Grayscale PDF"
      actionLabel="Convert to Grayscale"
      loadingLabel={loadingLabel}
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <>
          <div className="space-y-2">
            <p className="text-[13px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.06em" }}>
              Output Quality
            </p>
            {(Object.keys(QUALITY) as Quality[]).map((k) => {
              const l = QUALITY[k];
              const active = quality === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setQuality(k)}
                  className={cn("flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors")}
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
                    <span className="block text-[14px] font-semibold" style={{ color: "#33333c" }}>{l.label}</span>
                    <span className="mt-0.5 block text-[12.5px]" style={{ color: "#7a7a86" }}>{l.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <InfoTip>
            All pages will be converted to grayscale. Pages are re-rendered as images, so text will no longer be selectable in the output.
          </InfoTip>
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewPane label="Original" src={originalPreview} />
          <PreviewPane label="Grayscale" src={grayPreview} />
        </div>
        <div
          className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
          style={{ border: "1px solid #ececef" }}
        >
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold" style={{ color: "#33333c" }}>{file.name}</p>
            <p className="text-[12.5px]" style={{ color: "#7a7a86" }}>
              {formatSize(fileSize ?? file.size)}{pageCount ? ` • ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            aria-label="Remove file"
            className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-neutral-100"
            style={{ color: "#7a7a86" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </ToolWorkspace>
  );
}

function PreviewPane({ label, src }: { label: string; src: string | null }) {
  return (
    <div className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
      <p className="mb-2 text-center text-[12px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
        {label}
      </p>
      <div
        className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: "#f6f6f8" }}
      >
        {src ? (
          <img src={src} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-[12.5px]" style={{ color: "#a0a0aa" }}>Rendering…</span>
        )}
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
