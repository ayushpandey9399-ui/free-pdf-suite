import { useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
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

  const resetAll = () => { setFiles([]); setPageSize("fit"); setOrientation("portrait"); setMargin(24); setResult(null); };

  const decodeToPngBytes = (file: File): Promise<{ bytes: Uint8Array; width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          if (!canvas.width || !canvas.height) throw new Error(`${file.name}: image has zero dimensions`);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas 2D context unavailable");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) return reject(new Error(`${file.name}: failed to encode image`));
            const buf = await blob.arrayBuffer();
            resolve({ bytes: new Uint8Array(buf), width: canvas.width, height: canvas.height });
          }, "image/png");
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`${file.name}: browser could not decode this image`));
      };
      img.src = url;
    });

  const run = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();
      const safeMargin = Math.max(0, Math.floor(margin) || 0);
      for (const f of files) {
        const { bytes, width: iw, height: ih } = await decodeToPngBytes(f);
        const img = await pdf.embedPng(bytes);
        let pageW: number, pageH: number;
        if (pageSize === "fit") {
          pageW = iw + safeMargin * 2;
          pageH = ih + safeMargin * 2;
        } else {
          const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
          [pageW, pageH] = orientation === "landscape" ? [base[1], base[0]] : [base[0], base[1]];
        }
        const page = pdf.addPage([pageW, pageH]);
        const availW = Math.max(1, pageW - safeMargin * 2);
        const availH = Math.max(1, pageH - safeMargin * 2);
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
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      toast.error(`Failed to create PDF: ${msg || "unknown error"}`);
      console.error("images-to-pdf error", e);
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

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="image/png,image/jpeg"
        multiple
        files={files}
        onFilesChange={setFiles}
        buttonLabel="Select images"
        hint="or drop JPG / PNG images here"
      />
    );
  }

  const removeAt = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));
  const openPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";
    input.multiple = true;
    input.onchange = () => {
      const list = Array.from(input.files ?? []);
      setFiles((prev) => [...prev, ...list]);
    };
    input.click();
  };

  return (
    <ToolWorkspace
      title="Images to PDF"
      actionLabel="Create PDF"
      loadingLabel="Creating PDF…"
      onAction={run}
      loading={loading}
      sidebar={
        <>
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
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {files.map((f, i) => {
          const url = URL.createObjectURL(f);
          return (
            <div key={i} className="group relative overflow-hidden rounded-xl border bg-white" style={{ borderColor: "#ececef" }}>
              <img src={url} alt={f.name} className="aspect-[3/4] w-full object-cover" onLoad={() => URL.revokeObjectURL(url)} />
              <div className="px-2 py-1.5 text-[11px] font-medium truncate" style={{ color: "#33333c" }}>{f.name}</div>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-[#7a7a86] shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#e5322d]"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
        <button
          type="button"
          onClick={openPicker}
          className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
          style={{ borderColor: "#e5d4d3", color: "#7a7a86" }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: "#e5322d" }}>
            <Plus className="h-5 w-5" />
          </span>
          Add more
        </button>
      </div>
    </ToolWorkspace>
  );
}
