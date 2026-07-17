import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SortableThumbGrid, type ThumbItem } from "@/components/SortableThumbGrid";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

interface ImgEntry {
  id: string;
  file: File;
  url: string;
}

export default function ImagesToPdf() {
  const [entries, setEntries] = useState<ImgEntry[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState(24);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const idRef = useRef(0);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setEntries((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `img-${++idRef.current}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const resetAll = () => {
    entries.forEach((e) => URL.revokeObjectURL(e.url));
    setEntries([]);
    setPageSize("fit");
    setOrientation("portrait");
    setMargin(24);
    setResult(null);
  };

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      entries.forEach((e) => URL.revokeObjectURL(e.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!entries.length) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();
      const safeMargin = Math.max(0, Math.floor(margin) || 0);
      for (const e of entries) {
        const { bytes, width: iw, height: ih } = await decodeToPngBytes(e.file);
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
      setResult({ blob, filename: "images.pdf", count: entries.length });
      toast.success("PDF created");
    } catch (e) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      toast.error(`Failed to create PDF: ${msg || "unknown error"}`);
      console.error("images-to-pdf error", e);
    } finally {
      setLoading(false);
    }
  };

  const thumbItems: ThumbItem[] = useMemo(
    () => entries.map((e, i) => ({ id: e.id, src: e.url, label: `${i + 1}. ${e.file.name}` })),
    [entries],
  );

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

  if (entries.length === 0) {
    return (
      <FileDropzone
        accept="image/png,image/jpeg"
        multiple
        files={[]}
        onFilesChange={(list) => addFiles(list)}
        buttonLabel="Select images"
        hint="or drop JPG / PNG images here"
      />
    );
  }

  const removeById = (id: string) => {
    setEntries((prev) => {
      const gone = prev.find((e) => e.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((e) => e.id !== id);
    });
  };

  const reorder = (next: ThumbItem[]) => {
    setEntries((prev) => {
      const byId = new Map(prev.map((e) => [e.id, e] as const));
      return next.map((n) => byId.get(n.id)!).filter(Boolean);
    });
  };

  const openPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";
    input.multiple = true;
    input.onchange = () => addFiles(Array.from(input.files ?? []));
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
          <p className="text-[12px] leading-relaxed text-[#7a7a86]">
            Drag the ⋮⋮ handle on any thumbnail to reorder. Pages in the PDF follow the grid order.
          </p>
        </>
      }
    >
      <SortableThumbGrid items={thumbItems} onReorder={reorder} onRemove={removeById} />
      <div className="mt-4">
        <button
          type="button"
          onClick={openPicker}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed px-4 py-2 text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
          style={{ borderColor: "#e5d4d3", color: "#7a7a86" }}
        >
          <span className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ backgroundColor: "#e5322d" }}>
            <Plus className="h-3.5 w-3.5" />
          </span>
          Add more images
        </button>
      </div>
    </ToolWorkspace>
  );
}
