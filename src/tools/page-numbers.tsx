import { useEffect, useRef, useState } from "react";
import { StandardFonts, rgb } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

type Position = "bl" | "bc" | "br" | "tl" | "tc" | "tr";
const POSITIONS: Position[] = ["tl", "tc", "tr", "bl", "bc", "br"];

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState<Position>("bc");
  const [fontSize, setFontSize] = useState(12);
  const [startNumber, setStartNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageDim, setPageDim] = useState<{ w: number; h: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const resetAll = () => { setFiles([]); setPosition("bc"); setFontSize(12); setStartNumber(1); setResult(null); setPreviewUrl(null); setPageDim(null); };

  useEffect(() => {
    const file = files[0]; if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        const page = await doc.getPage(1);
        const vp1 = page.getViewport({ scale: 1 });
        const scale = Math.min(2, 800 / vp1.width);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        if (!cancelled) { setPreviewUrl(canvas.toDataURL("image/png")); setPageDim({ w: vp1.width, h: vp1.height }); }
      } catch (e) {
        if (cancelled) return;
        if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
        else toast.error(`Failed to open PDF: ${(e as Error).message}`);
        setFiles([]);
      }
    })();
    return () => { cancelled = true; };
  }, [files]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, [previewUrl]);

  const run = async () => {
    const file = files[0]; if (!file) return;
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
        const col = position[1];
        const x = col === "l" ? margin : col === "r" ? width - margin - w : (width - w) / 2;
        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
      });
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-numbered.pdf` });
      toast.success("Page numbers added");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally { setLoading(false); }
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

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const scale = pageDim && displayW ? displayW / pageDim.w : 0;
  const displayH = pageDim ? pageDim.h * scale : 0;
  const previewNumberStyle = () => {
    const margin = 24 * scale;
    const isBottom = position.startsWith("b");
    const col = position[1];
    const style: React.CSSProperties = { position: "absolute", fontSize: fontSize * scale, color: "#000", fontFamily: "Helvetica, Arial, sans-serif" };
    if (isBottom) style.bottom = margin; else style.top = margin;
    if (col === "l") style.left = margin;
    else if (col === "r") style.right = margin;
    else { style.left = "50%"; style.transform = "translateX(-50%)"; }
    return style;
  };

  return (
    <ToolWorkspace
      title="Page numbers"
      actionLabel="Add Page Numbers"
      loadingLabel="Adding numbers…"
      onAction={run}
      loading={loading}
      sidebar={
        <>
          <div>
            <Label className="text-xs uppercase tracking-wide" style={{ color: "#5a5a66" }}>Position</Label>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {POSITIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPosition(p)}
                  className={cn(
                    "aspect-square rounded-md border-2 text-[10px] font-semibold transition-colors",
                    position === p ? "border-[#e5322d] bg-[#fbecec] text-[#e5322d]" : "border-[#ececef] text-[#5a5a66] hover:border-[#c8c8d0]",
                  )}
                  aria-label={`Position ${p}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="fs">Font size</Label>
            <Input id="fs" type="number" min={6} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 12)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="start">Start at</Label>
            <Input id="start" type="number" min={0} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value) || 1)} className="mt-1" />
          </div>
        </>
      }
    >
      <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #ececef" }}>
        <p className="mb-3 text-[12px]" style={{ color: "#5a5a66" }}>Live preview, page 1</p>
        <div ref={containerRef} className="relative mx-auto w-full max-w-[600px]" style={{ height: displayH || undefined }}>
          {previewUrl && (
            <>
              <img src={previewUrl} alt="PDF page preview with page number placement" className="pointer-events-none absolute inset-0 h-full w-full" />
              <div style={previewNumberStyle()}>{startNumber}</div>
            </>
          )}
        </div>
      </div>
    </ToolWorkspace>
  );
}
