import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import {
  fetchPdfToImagesResult,
  outputNameFor,
  PDF_TO_IMAGES_DPI,
  PDF_TO_IMAGES_QUALITY,
  PdfToImagesError,
  requestPdfToImages,
  validatePageExpression,
  validatePdfSelection,
  type PdfToImagesDpi,
  type PdfToImagesFormat,
  type PdfToImagesQuality,
} from "@/lib/pdfToImages";

interface Result {
  readonly blob: Blob;
  readonly filename: string;
  readonly mime: string;
  readonly count: number;
  readonly isArchive: boolean;
}

export default function PdfToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<PdfToImagesFormat>("png");
  const [quality, setQuality] = useState<PdfToImagesQuality>(90);
  const [dpi, setDpi] = useState<PdfToImagesDpi>(150);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState("Converting…");
  const [result, setResult] = useState<Result | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]);
    setFormat("png");
    setQuality(90);
    setDpi(150);
    setPages("");
    setResult(null);
    setProgress(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;

    const pageCheck = validatePageExpression(pages);
    if (!pageCheck.ok) {
      toast.error(pageCheck.message);
      return;
    }

    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const check = validatePdfSelection({ name: file.name, size: file.size, header });
    if (!check.ok) {
      toast.error(check.message);
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatus("Uploading…");
    try {
      const ready = await requestPdfToImages(
        { file, format, dpi, quality, pages },
        {
          onProgress: (update) => {
            setStatus(update.phase === "uploading" ? "Uploading…" : "Converting…");
            setProgress(update.percent);
          },
        },
      );

      setStatus("Preparing your download…");
      setProgress(0);
      const blob = await fetchPdfToImagesResult(ready, { onProgress: setProgress });

      setResult({
        blob,
        filename: outputNameFor(file.name, ready),
        mime: ready.contentType,
        count: ready.imageCount,
        isArchive: ready.kind === "archive",
      });
      toast.success(`Exported ${ready.imageCount} image${ready.imageCount > 1 ? "s" : ""}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof PdfToImagesError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Images exported!"
        subheading={
          result.isArchive
            ? `${result.count} images packaged into a ZIP archive.`
            : "Your image is ready to download."
        }
        downloadLabel={result.isArchive ? "Download ZIP" : `Download ${format.toUpperCase()}`}
        onDownload={() => downloadBlob(result.blob, result.filename, result.mime)}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["pdf-to-images"]}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];

  return (
    <ToolWorkspace
      title="PDF to Images"
      actionLabel="Convert to Images"
      loadingLabel={status}
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <>
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as PdfToImagesFormat)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Resolution</Label>
            <Select value={String(dpi)} onValueChange={(v) => setDpi(Number(v) as PdfToImagesDpi)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PDF_TO_IMAGES_DPI.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value} DPI
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {format === "jpg" && (
            <div>
              <Label>Quality</Label>
              <Select value={String(quality)} onValueChange={(v) => setQuality(Number(v) as PdfToImagesQuality)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PDF_TO_IMAGES_QUALITY.map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="pages">Pages</Label>
            <Input
              id="pages"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="All pages, or 1,4-6"
              className="mt-1"
            />
          </div>
          <LargeFileWarning
            pageCount={pageCount}
            fileSize={fileSize}
            extraNote={pageCount > 30 ? `${pageCount} pages, this can take a little longer.` : undefined}
          />
          <p className="text-[12px] leading-relaxed text-[#5a5a66]">
            Two or more images arrive as a single ZIP. Your file is deleted from our server as soon as the download
            finishes.
          </p>
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
    </ToolWorkspace>
  );
}
