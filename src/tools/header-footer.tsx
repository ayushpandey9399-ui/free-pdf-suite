import { useEffect, useMemo, useRef, useState } from "react";
import { StandardFonts, degrees, rgb } from "pdf-lib";
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

type Slot = "hl" | "hc" | "hr" | "fl" | "fc" | "fr";
const TOKENS = ["{page}", "{total}", "{date}", "{filename}"] as const;
const MARGIN_MAP = { small: 18, normal: 28, big: 44 } as const;
type MarginKey = keyof typeof MARGIN_MAP;

function todayStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function replaceTokens(tpl: string, page: number, total: number, filename: string) {
  return tpl
    .replaceAll("{page}", String(page))
    .replaceAll("{total}", String(total))
    .replaceAll("{date}", todayStr())
    .replaceAll("{filename}", filename);
}

function parseRange(input: string, total: number): Set<number> {
  const out = new Set<number>();
  if (!input.trim()) return out;
  for (const part of input.split(",")) {
    const s = part.trim();
    if (!s) continue;
    const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = Math.max(1, parseInt(m[1], 10));
      let b = Math.min(total, parseInt(m[2], 10));
      if (a > b) [a, b] = [b, a];
      for (let i = a; i <= b; i++) out.add(i);
    } else if (/^\d+$/.test(s)) {
      const n = parseInt(s, 10);
      if (n >= 1 && n <= total) out.add(n);
    }
  }
  return out;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function HeaderFooter() {
  const [files, setFiles] = useState<File[]>([]);
  const [slots, setSlots] = useState<Record<Slot, string>>({ hl: "", hc: "", hr: "", fl: "", fc: "", fr: "" });
  const [fontSize, setFontSize] = useState(10);
  const [color, setColor] = useState("#666666");
  const [marginKey, setMarginKey] = useState<MarginKey>("normal");
  const [rangeMode, setRangeMode] = useState<"all" | "range">("all");
  const [rangeText, setRangeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageDim, setPageDim] = useState<{ w: number; h: number } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const focusedSlotRef = useRef<Slot | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const resetAll = () => {
    setFiles([]);
    setSlots({ hl: "", hc: "", hr: "", fl: "", fc: "", fr: "" });
    setFontSize(10); setColor("#666666"); setMarginKey("normal");
    setRangeMode("all"); setRangeText("");
    setResult(null); setPreviewUrl(null); setPageDim(null); setTotalPages(1); setPreviewPage(1);
  };

  useEffect(() => {
    const file = files[0]; if (!file) return;
    let cancelled = false;
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (!cancelled) setTotalPages(doc.numPages);
        const page = await doc.getPage(Math.min(previewPage, doc.numPages));
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
  }, [files, previewPage]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, [previewUrl]);

  const hasAny = Object.values(slots).some((v) => v.trim().length > 0);
  const margin = MARGIN_MAP[marginKey];

  const insertToken = (tok: string) => {
    const slot = focusedSlotRef.current;
    if (!slot) { toast("Tap a text field first"); return; }
    setSlots((s) => ({ ...s, [slot]: (s[slot] ?? "") + tok }));
  };

  const setSlot = (slot: Slot, val: string) => setSlots((s) => ({ ...s, [slot]: val }));

  const run = async () => {
    const file = files[0]; if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const total = pages.length;
      const filename = file.name.replace(/\.pdf$/i, "");
      const included = rangeMode === "all" ? null : parseRange(rangeText, total);
      const [r, g, b] = hexToRgb(color);

      pages.forEach((page, i) => {
        const pageNum = i + 1;
        if (included && !included.has(pageNum)) return;
        const { width, height } = page.getSize();
        const rot = page.getRotation().angle % 360;
        const rotated = rot === 90 || rot === 270;
        const pageW = rotated ? height : width;
        const pageH = rotated ? width : height;

        const draw = (slot: Slot) => {
          const raw = slots[slot]; if (!raw.trim()) return;
          const text = replaceTokens(raw, pageNum, total, filename);
          const tw = font.widthOfTextAtSize(text, fontSize);
          const isHeader = slot[0] === "h";
          const col = slot[1];
          // Local coords in unrotated page space
          const lx = col === "l" ? margin : col === "r" ? pageW - margin - tw : (pageW - tw) / 2;
          const ly = isHeader ? pageH - margin - fontSize : margin;

          // Map local (lx, ly) back to actual page coordinates for rotated pages
          let x = lx, y = ly, rotation = 0;
          if (rot === 90) { x = ly; y = height - lx; rotation = -90; }
          else if (rot === 180) { x = width - lx; y = ly + fontSize; rotation = 180; }
          else if (rot === 270) { x = width - ly - fontSize; y = lx; rotation = 90; }

          page.drawText(text, { x, y, size: fontSize, font, color: rgb(r, g, b), rotate: degrees(rotation) });
        };

        (["hl", "hc", "hr", "fl", "fc", "fr"] as Slot[]).forEach(draw);
      });

      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-stamped.pdf` });
      toast.success("Header & footer added");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally { setLoading(false); }
  };

  const previewValues = useMemo(() => {
    const filename = files[0]?.name.replace(/\.pdf$/i, "") ?? "document";
    const out: Record<Slot, string> = { hl: "", hc: "", hr: "", fl: "", fc: "", fr: "" };
    (["hl", "hc", "hr", "fl", "fc", "fr"] as Slot[]).forEach((k) => {
      out[k] = replaceTokens(slots[k] ?? "", previewPage, totalPages, filename);
    });
    return out;
  }, [slots, previewPage, totalPages, files]);

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Header & footer added!"
        subheading="Your PDF has been stamped."
        downloadLabel="Download Stamped PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["header-footer"] ?? TOOL_SUGGESTIONS["page-numbers"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const scale = pageDim && displayW ? displayW / pageDim.w : 0;
  const displayH = pageDim ? pageDim.h * scale : 0;
  const mPx = margin * scale;

  const stampStyle = (slot: Slot): React.CSSProperties => {
    const isHeader = slot[0] === "h";
    const col = slot[1];
    const s: React.CSSProperties = {
      position: "absolute",
      fontSize: fontSize * scale,
      color,
      fontFamily: "Helvetica, Arial, sans-serif",
      whiteSpace: "nowrap",
      lineHeight: 1,
    };
    if (isHeader) s.top = mPx; else s.bottom = mPx;
    if (col === "l") s.left = mPx;
    else if (col === "r") s.right = mPx;
    else { s.left = "50%"; s.transform = "translateX(-50%)"; }
    return s;
  };

  const Section = ({ label, keys }: { label: string; keys: [Slot, Slot, Slot] }) => null;


  return (
    <ToolWorkspace
      title="Add Header & Footer"
      actionLabel="Add Header & Footer"
      loadingLabel="Stamping…"
      onAction={run}
      loading={loading}
      actionDisabled={!hasAny}
      sidebar={
        <>
          <Section label="Header" keys={["hl", "hc", "hr"]} />
          <Section label="Footer" keys={["fl", "fc", "fr"]} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hf-fs">Font size</Label>
              <Input id="hf-fs" type="number" min={6} max={72} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 10)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="hf-color">Color</Label>
              <input id="hf-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="mt-1 h-10 w-full rounded-md border" style={{ borderColor: "#ececef" }} />
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide" style={{ color: "#7a7a86" }}>Margin from edge</Label>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(["small", "normal", "big"] as MarginKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMarginKey(k)}
                  className={cn(
                    "rounded-md border-2 py-2 text-[11px] font-semibold capitalize transition-colors",
                    marginKey === k ? "border-[#e5322d] bg-[#fbecec] text-[#e5322d]" : "border-[#ececef] text-[#7a7a86] hover:border-[#c8c8d0]",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide" style={{ color: "#7a7a86" }}>Pages</Label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {(["all", "range"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRangeMode(k)}
                  className={cn(
                    "rounded-md border-2 py-2 text-[11px] font-semibold transition-colors",
                    rangeMode === k ? "border-[#e5322d] bg-[#fbecec] text-[#e5322d]" : "border-[#ececef] text-[#7a7a86] hover:border-[#c8c8d0]",
                  )}
                >
                  {k === "all" ? "All pages" : "Page range"}
                </button>
              ))}
            </div>
            {rangeMode === "range" && (
              <Input
                placeholder="e.g. 2-10"
                value={rangeText}
                onChange={(e) => setRangeText(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </>
      }
    >
      <div className="rounded-2xl bg-white p-4" style={{ border: "1px solid #ececef" }}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px]" style={{ color: "#7a7a86" }}>Live preview — page {previewPage} of {totalPages}</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage <= 1}
                className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
                style={{ borderColor: "#ececef" }}
              >←</button>
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                disabled={previewPage >= totalPages}
                className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"
                style={{ borderColor: "#ececef" }}
              >→</button>
            </div>
          )}
        </div>
        <div ref={containerRef} className="relative mx-auto w-full max-w-[600px]" style={{ height: displayH || undefined }}>
          {previewUrl && (
            <>
              <img src={previewUrl} alt="Preview" className="pointer-events-none absolute inset-0 h-full w-full" />
              {(["hl", "hc", "hr", "fl", "fc", "fr"] as Slot[]).map((k) =>
                previewValues[k] ? <div key={k} style={stampStyle(k)}>{previewValues[k]}</div> : null,
              )}
            </>
          )}
        </div>
      </div>
    </ToolWorkspace>
  );
}
