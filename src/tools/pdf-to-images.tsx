import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { downloadBlob, downloadZip } from "@/lib/download";
import { ensurePdfWorker } from "@/lib/pdfWorker";

export default function PdfToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(2);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setProgress(0);
    try {
      const pdfjs = ensurePdfWorker();
      const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      const total = doc.numPages;
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const out: { name: string; data: Blob }[] = [];
      const base = file.name.replace(/\.pdf$/i, "");
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), mime, quality));
        out.push({ name: `${base}-page-${i}.${format}`, data: blob });
        setProgress((i / total) * 100);
      }
      if (out.length === 1) downloadBlob(out[0].data, out[0].name, mime);
      else await downloadZip(out, `${base}-images.zip`);
      toast.success(`Exported ${out.length} image${out.length > 1 ? "s" : ""}`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {files.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3 rounded-xl border bg-card p-4">
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
        </div>
      )}
      <ActionBar onRun={run} disabled={!files.length} loading={loading} progress={progress} label="Convert to Images" />
    </div>
  );
}
