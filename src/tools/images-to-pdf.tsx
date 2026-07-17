import { useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(24);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);

  const resetAll = () => {
    setFiles([]);
    setPageSize("fit");
    setOrientation("portrait");
    setMargin(24);
    setResult(null);
  };

  const run = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();
      for (const f of files) {
        const buf = await f.arrayBuffer();
        const isPng = f.type.includes("png") || f.name.toLowerCase().endsWith(".png");
        const img = isPng ? await pdf.embedPng(buf) : await pdf.embedJpg(buf);
        let pageW: number, pageH: number;
        if (pageSize === "fit") {
          pageW = img.width + margin * 2;
          pageH = img.height + margin * 2;
        } else {
          const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
          [pageW, pageH] = orientation === "portrait" ? base : [base[1], base[0]];
        }
        const page = pdf.addPage([pageW, pageH]);
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;
        const scale = Math.min(availW / img.width, availH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: "images.pdf", count: files.length });
      toast.success("PDF created");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Your PDF is ready!"
        subheading={`${result.count} image(s) combined into a single PDF.`}
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["images-to-pdf"]}
      />
    );
  }

  return (
    <div>
      <FileDropzone accept="image/png,image/jpeg" multiple files={files} onFilesChange={setFiles} label="Drop JPG / PNG images or click to browse" />
      {files.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3 rounded-xl border bg-card p-4">
          <div>
            <Label>Page size</Label>
            <Select value={pageSize} onValueChange={(v) => setPageSize(v as never)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fit">Fit to image</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Orientation</Label>
            <Select value={orientation} onValueChange={(v) => setOrientation(v as never)} disabled={pageSize === "fit"}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="margin">Margin (pt)</Label>
            <Input id="margin" type="number" min={0} value={margin} onChange={(e) => setMargin(Number(e.target.value) || 0)} className="mt-1" />
          </div>
        </div>
      )}
      <ActionBar
        onRun={run}
        disabled={!files.length}
        loading={loading}
        label={loading ? "Creating your PDF…" : "Create PDF"}
      />
    </div>
  );
}
