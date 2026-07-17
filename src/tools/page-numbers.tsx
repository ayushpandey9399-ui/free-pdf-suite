import { useState } from "react";
import { StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

type Position = "bl" | "bc" | "br" | "tl" | "tc" | "tr";

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState<Position>("bc");
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const resetAll = () => {
    setFiles([]);
    setPosition("bc");
    setFontSize(12);
    setStartNumber(1);
    setResult(null);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, i) => {
        const num = startNumber + i;
        const text = String(num);
        const w = font.widthOfTextAtSize(text, fontSize);
        const { width, height } = page.getSize();
        const margin = 24;
        const isBottom = position.startsWith("b");
        const y = isBottom ? margin : height - margin - fontSize;
        let x: number;
        const col = position[1];
        if (col === "l") x = margin;
        else if (col === "r") x = width - margin - w;
        else x = (width - w) / 2;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-numbered.pdf` });
      toast.success("Page numbers added");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Page numbers added!"
        subheading="Your PDF has been numbered."
        downloadLabel="Download Numbered PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["page-numbers"]}
      />
    );
  }

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files[0] && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3 rounded-xl border bg-card p-4">
              <div>
                <Label>Position</Label>
                <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bl">Bottom left</SelectItem>
                    <SelectItem value="bc">Bottom center</SelectItem>
                    <SelectItem value="br">Bottom right</SelectItem>
                    <SelectItem value="tl">Top left</SelectItem>
                    <SelectItem value="tc">Top center</SelectItem>
                    <SelectItem value="tr">Top right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fs">Font size</Label>
                <Input id="fs" type="number" min={6} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 12)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="start">Start number</Label>
                <Input id="start" type="number" min={0} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value) || 1)} className="mt-1" />
              </div>
            </div>
          )}
          <ActionBar
            onRun={run}
            disabled={!files.length}
            loading={loading}
            label={loading ? "Adding page numbers…" : "Add Page Numbers"}
          />
        </>
      )}
    </div>
  );
}
