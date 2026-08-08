import { useMemo, useRef, useState } from "react";
import { ArrowRight, Server } from "lucide-react";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PdfDropzone } from "@/components/pdf-to-images/PdfDropzone";
import { PdfFileCard } from "@/components/pdf-to-images/PdfFileCard";
import { ConversionSettingsPanel } from "@/components/pdf-to-images/ConversionSettingsPanel";
import {
  ConversionProgress,
  type ConversionStageKey,
} from "@/components/pdf-to-images/ConversionProgress";
import { ToolErrorCard } from "@/components/pdf-to-images/ToolErrorCard";
import { usePdfStats } from "@/hooks/usePdfStats";
import { downloadBlob } from "@/lib/download";
import { formatBytes } from "@/lib/imageMath";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import {
  absoluteDownloadUrl,
  fetchPdfToImagesResult,
  outputNameFor,
  PDF_TO_IMAGES_MAX_BYTES,
  PdfToImagesError,
  requestPdfToImages,
  shouldOfferUnlockLink,
  validatePageExpression,
  validatePdfSelection,
  type PdfToImagesDpi,
  type PdfToImagesFormat,
  type PdfToImagesQuality,
  type PdfToImagesReady,
} from "@/lib/pdfToImages";

interface Result {
  /** null when the artefact could not be streamed here, in which case the signed link is used. */
  readonly blob: Blob | null;
  readonly filename: string;
  readonly mime: string;
  readonly ready: PdfToImagesReady;
  readonly dpi: PdfToImagesDpi;
  readonly format: PdfToImagesFormat;
  readonly elapsedMs: number;
}


interface Failure {
  readonly message: string;
  readonly offerUnlock: boolean;
}

/**
 * PDF to Images.
 * The rasterising happens on the API, so this page is a state machine over the real request:
 * pick a file, choose settings, watch the two transfers that actually report progress, then save.
 * Nothing here is simulated, and no backend wording is ever shown to a person.
 */
export default function PdfToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<PdfToImagesDpi>(300);
  const [format, setFormat] = useState<PdfToImagesFormat>("png");
  const [quality, setQuality] = useState<PdfToImagesQuality>(90);
  const [pages, setPages] = useState("");
  const [stage, setStage] = useState<ConversionStageKey | null>(null);
  const [percent, setPercent] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const { pageCount } = usePdfStats(file);

  const pagesCheck = validatePageExpression(pages);
  const pagesError = pagesCheck.ok ? undefined : pagesCheck.message;
  const running = stage !== null;

  const maxSizeLabel = useMemo(() => formatBytes(PDF_TO_IMAGES_MAX_BYTES), []);

  const resetAll = (): void => {
    setFile(null);
    setDpi(300);
    setFormat("png");
    setQuality(90);
    setPages("");
    setResult(null);
    setFailure(null);
    setStage(null);
    setPercent(null);
  };

  const backToSettings = (): void => {
    setFailure(null);
    setStage(null);
    setPercent(null);
  };

  /**
   * Selection gate. The same rules the request path enforces run here too, so an obviously
   * wrong file is refused the moment it is dropped rather than after a pointless upload.
   */
  const acceptFile = async (next: File): Promise<void> => {
    const header = new Uint8Array(await next.slice(0, 5).arrayBuffer());
    const check = validatePdfSelection({ name: next.name, size: next.size, header });
    if (!check.ok) {
      setFile(null);
      setFailure({ message: check.message, offerUnlock: false });
      return;
    }
    setFile(next);
    setResult(null);
    setFailure(null);
  };


  const run = async (): Promise<void> => {
    // A second click while a conversion is in flight must never start a second upload.
    if (running || !file || pagesError) return;

    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const check = validatePdfSelection({ name: file.name, size: file.size, header });
    if (!check.ok) {
      setFailure({ message: check.message, offerUnlock: false });
      return;
    }

    setFailure(null);
    setStage("uploading");
    setPercent(0);
    const startedAt = Date.now();

    try {
      const ready = await requestPdfToImages(
        { file, format, dpi, quality, pages },
        {
          onProgress: (update) => {
            if (update.phase === "uploading") {
              setStage("uploading");
              setPercent(update.percent);
              return;
            }
            // The upload is on the wire: the server now owns the job and reports no percentage.
            setStage("converting");
            setPercent(null);
          },
        },
      );

      setStage("download");
      setPercent(0);
      // A blocked or expired artefact fetch must not hide a finished conversion: the signed link
      // still works, so the success screen falls back to opening it directly.
      let blob: Blob | null = null;
      try {
        blob = await fetchPdfToImagesResult(ready, { onProgress: setPercent });
      } catch (downloadError) {
        if (downloadError instanceof DOMException && downloadError.name === "AbortError") throw downloadError;
        console.error("[pdf-to-images] falling back to the direct download link", downloadError);
      }

      setStage("done");
      setResult({
        blob,
        filename: outputNameFor(file.name, ready),
        mime: ready.contentType,
        ready,
        dpi,
        format,
        elapsedMs: Date.now() - startedAt,
      });
      setStage(null);
      setPercent(null);
    } catch (error) {
      setStage(null);
      setPercent(null);
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[pdf-to-images] conversion failed", error);
      if (error instanceof PdfToImagesError) {
        setFailure({
          message: error.message,
          offerUnlock: shouldOfferUnlockLink(error.status, error.reason),
        });
        return;
      }
      setFailure({ message: "Something went wrong. Please try again.", offerUnlock: false });
    }
  };


  if (result) {
    const metrics = result.ready.metrics;
    const seconds = Math.max(0.1, (metrics?.durationMs ?? result.elapsedMs) / 1000);
    const stats: Array<{ label: string; value: string }> = [
      { label: "Pages converted", value: String(metrics?.pagesConverted ?? result.ready.imageCount) },
      { label: "Images created", value: String(result.ready.imageCount) },
      { label: "Resolution", value: `${metrics?.dpi ?? result.dpi} DPI` },
      { label: "Format", value: (metrics?.format ?? result.format).toUpperCase() },
      { label: "Processing time", value: `${seconds.toFixed(1)}s` },
      {
        label: result.ready.kind === "archive" ? "ZIP size" : "File size",
        value: formatBytes(result.ready.sizeBytes || result.blob?.size || 0),
      },
    ];

    const saveResult = (): void => {
      if (result.blob) {
        downloadBlob(result.blob, result.filename, result.mime);
        return;
      }
      window.location.assign(absoluteDownloadUrl(result.ready.url));
    };

    return (
      <ToolSuccessScreen
        heading="Conversion complete"
        subheading={
          result.ready.kind === "archive"
            ? `${result.ready.imageCount} images packaged into a single ZIP archive.`
            : "Your image is ready to download."
        }
        downloadLabel={result.ready.kind === "archive" ? "Download ZIP" : `Download ${result.format.toUpperCase()}`}
        onDownload={saveResult}

        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["pdf-to-images"]}
        trustBadge={
          <span className="inline-flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5" aria-hidden />
            Converted on our server and deleted right after your download.
          </span>
        }
      >
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[12px] font-semibold uppercase tracking-wide text-neutral-400">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-[17px] font-bold text-neutral-800 dark:text-neutral-100">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 truncate border-t border-neutral-100 pt-4 text-[13px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            Filename: <span className="font-semibold">{result.filename}</span>
          </p>
        </div>
      </ToolSuccessScreen>
    );
  }

  if (running && stage) {
    return <ConversionProgress stage={stage} percent={percent} />;
  }

  if (failure) {
    return (
      <ToolErrorCard
        message={failure.message}
        hint={file ? "Your file was not changed. You can adjust the settings and convert again." : undefined}
        onRetry={file ? backToSettings : resetAll}
        retryLabel={file ? "Back to settings" : "Choose another PDF"}
        offerUnlock={failure.offerUnlock}
      />
    );
  }

  if (!file) {
    return <PdfDropzone onFile={acceptFile} maxSizeLabel={maxSizeLabel} />;
  }

  const canRun = !pagesError && !running;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PdfFileCard
        file={file}
        pageCount={pageCount}
        onRemove={resetAll}
        onReplace={() => replaceRef.current?.click()}
      />

      <ConversionSettingsPanel
        value={{ dpi, format, quality, pages }}
        pagesError={pagesError}
        onChange={(next) => {
          if (next.dpi !== undefined) setDpi(next.dpi);
          if (next.format !== undefined) setFormat(next.format);
          if (next.quality !== undefined) setQuality(next.quality);
          if (next.pages !== undefined) setPages(next.pages);
        }}
      />

      <button
        type="button"
        onClick={run}
        disabled={!canRun}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl text-[17px] font-bold transition-all duration-150 enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed"
        style={{
          minHeight: "62px",
          background: canRun ? "linear-gradient(140deg, #f2564f, #e5322d)" : "#d7d7dc",
          color: canRun ? "#ffffff" : "#8a8a93",
          boxShadow: canRun ? "0 16px 34px -14px rgba(229,50,45,0.6)" : "none",
        }}
      >
        Convert PDF to Images
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>

      <p className="text-center text-[13px] text-neutral-500 dark:text-neutral-400">
        Files are processed on our server and removed as soon as your download finishes.
      </p>

      <input
        ref={replaceRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0];
          if (next) void acceptFile(next);
          e.target.value = "";
        }}
      />
    </div>
  );
}
