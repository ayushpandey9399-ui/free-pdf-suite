import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { downloadBlob } from "@/lib/download";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import JSZip from "jszip";

type Result =
  | { kind: "single"; blob: Blob; filename: string; mime: string; count: 1 }
  | { kind: "zip"; blob: Blob; filename: string; count: number };

export default function PdfToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]); setFormat("png"); setQuality(0.9); setScale(2); setResult(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true); setProgress(0);
    try {
      const doc = await loadPdfJsDoc(await file.arrayBuffer());
      const total = doc.numPages;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const out: { name: string; data: Blob }[] = [];
      const base = file.name.replace(/\.pdf$/i, "");
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, quality));
        out.push({ name: `${base}-page-${i}.${format}`, data: blob });
        setProgress((i / total) * 100);
      }
      if (out.length === 1) {
        setResult({ kind: "single", blob: out[0].data, filename: out[0].name, mime, count: 1 });
      } else {
        const zip = new JSZip();
        for (const f of out) zip.file(f.name, f.data);
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResult({ kind: "zip", blob: zipBlob, filename: `${base}-images.zip`, count: out.length });
      }
      toast.success(`Exported ${out.length} image${out.length > 1 ? "s" : ""}`);
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false); setProgress(null);
    }
  };

  if (result) {
    const isZip = result.kind === "zip";
    return (
      <ToolSuccessScreen
        heading="Images exported!"
        subheading={isZip ? `${result.count} images packaged into a ZIP archive.` : "Your image is ready to download."}
        downloadLabel={isZip ? "Download ZIP" : `Download ${format.toUpperCase()}`}
        onDownload={() => downloadBlob(result.blob, result.filename, isZip ? "application/zip" : (result as { mime: string }).mime)}
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
      loadingLabel="Converting…"
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <>
          <div>
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as never)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quality: {Math.round(quality * 100)}%</Label>
            <Slider value={[quality * 100]} min={30} max={100} step={5} onValueChange={(v) => setQuality(v[0] / 100)} className="mt-3" />
          </div>
          <div>
            <Label>Scale: {scale}×</Label>
            <Slider value={[scale]} min={1} max={4} step={0.5} onValueChange={(v) => setScale(v[0])} className="mt-3" />
          </div>
          <LargeFileWarning
            pageCount={pageCount}
            fileSize={fileSize}
            extraNote={pageCount > 30 ? `${pageCount} pages — will be generated page by page.` : undefined}
          />
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
    </ToolWorkspace>
  );
}
