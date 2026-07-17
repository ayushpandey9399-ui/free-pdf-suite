import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";
import { X, Trash2, Pen, Type as TypeIcon, Upload as UploadIcon, ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";

import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

type Tab = "draw" | "type" | "upload";
type Kind = "signature" | "initials";

interface Signature {
  dataUrl: string;
  w: number; // intrinsic px
  h: number;
}

interface PageInfo {
  url: string;   // rendered image (rotation=0)
  width: number; // native PDF points
  height: number;
  rotation: number;
}

interface Placement {
  id: string;
  pageIndex: number; // 0-based
  kind: Kind;
  // Position/size in PDF points (native, top-left origin for the placement box)
  x: number;
  y: number;
  w: number;
  h: number;
}

const COLORS = [
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#1a56db" },
  { name: "Red", value: "#c72620" },
];

const TYPE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Sacramento", family: "'Sacramento', cursive" },
];

export default function SignPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const [active, setActive] = useState<Kind>("signature");
  const [tab, setTab] = useState<Tab>("draw");
  const [signature, setSignature] = useState<Signature | null>(null);
  const [initials, setInitials] = useState<Signature | null>(null);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setPlacements([]);
    if (!file) return;
    setLoadingPages(true);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        const out: PageInfo[] = [];
        const maxW = 800;
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          // Render with rotation=0 so overlay coords map directly to native PDF points.
          const vp1 = page.getViewport({ scale: 1, rotation: 0 });
          const scale = Math.min(2, maxW / vp1.width);
          const vp = page.getViewport({ scale, rotation: 0 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          if (cancelled) return;
          out.push({
            url: canvas.toDataURL("image/jpeg", 0.85),
            width: vp1.width,
            height: vp1.height,
            rotation: (page as unknown as { rotate: number }).rotate ?? 0,
          });
        }
        if (!cancelled) setPages(out);
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Preview failed: ${(e as Error).message}`);
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  const current = active === "signature" ? signature : initials;
  const setCurrent = (sig: Signature | null) => {
    if (active === "signature") setSignature(sig);
    else setInitials(sig);
  };

  const placeOnDocument = useCallback(() => {
    const sig = current;
    if (!sig || !pages.length) return;
    // Determine which page is centered in viewport
    let pageIndex = 0;
    const container = pagesContainerRef.current;
    if (container) {
      const rects = container.querySelectorAll<HTMLElement>("[data-page-index]");
      const viewportMid = window.innerHeight / 2;
      let bestDist = Infinity;
      rects.forEach((el) => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const d = Math.abs(mid - viewportMid);
        if (d < bestDist) {
          bestDist = d;
          pageIndex = Number(el.dataset.pageIndex ?? 0);
        }
      });
    }
    const page = pages[pageIndex];
    // Default width in points based on kind
    const targetW = active === "signature" ? Math.min(page.width * 0.35, 220) : Math.min(page.width * 0.18, 110);
    const aspect = sig.h / sig.w;
    const w = targetW;
    const h = w * aspect;
    const x = (page.width - w) / 2;
    const y = (page.height - h) / 2;
    setPlacements((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, pageIndex, kind: active, x, y, w, h },
    ]);
    // Scroll placement into view
    setTimeout(() => {
      const el = pagesContainerRef.current?.querySelector<HTMLElement>(`[data-page-index="${pageIndex}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, [current, pages, active]);

  const resetAll = () => {
    setFiles([]); setPages([]); setPlacements([]);
    setSignature(null); setInitials(null); setResult(null);
    setActive("signature"); setTab("draw");
  };

  const run = async () => {
    if (!file || !placements.length) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pdfPages = doc.getPages();
      // Cache embedded images per data URL
      const cache: Record<string, Awaited<ReturnType<typeof doc.embedPng>>> = {};
      for (const p of placements) {
        const sig = p.kind === "signature" ? signature : initials;
        if (!sig) continue;
        if (!cache[sig.dataUrl]) {
          const b64 = sig.dataUrl.split(",")[1];
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          cache[sig.dataUrl] = await doc.embedPng(bytes);
        }
        const png = cache[sig.dataUrl];
        const page = pdfPages[p.pageIndex];
        if (!page) continue;
        const { height } = page.getSize();
        // Native coords: top-left placement (p.x, p.y) → pdf-lib uses bottom-left origin.
        page.drawImage(png, {
          x: p.x,
          y: height - p.y - p.h,
          width: p.w,
          height: p.h,
        });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-signed.pdf` });
      toast.success("PDF signed");
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
        heading="Your PDF has been signed!"
        subheading={`${placements.length} signature${placements.length === 1 ? "" : "s"} added.`}
        downloadLabel="Download Signed PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["sign-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const hasRotatedPages = pages.some((p) => p.rotation % 360 !== 0);

  return (
    <ToolWorkspace
      title="Sign PDF"
      actionLabel="Sign PDF"
      loadingLabel="Signing…"
      onAction={run}
      loading={loading}
      actionDisabled={!placements.length}
      sidebar={
        <>
          {/* Kind selector */}
          <div className="flex rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
            {(["signature", "initials"] as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setActive(k)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold capitalize transition-colors",
                )}
                style={{
                  backgroundColor: active === k ? "#ffffff" : "transparent",
                  color: active === k ? "#33333c" : "#7a7a86",
                  boxShadow: active === k ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                }}
              >
                {k === "signature" ? "Signature" : "Initials (optional)"}
              </button>
            ))}
          </div>

          {/* Tab selector */}
          <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
            {([
              { id: "draw", label: "Draw", icon: Pen },
              { id: "type", label: "Type", icon: TypeIcon },
              { id: "upload", label: "Upload", icon: UploadIcon },
            ] as { id: Tab; label: string; icon: typeof Pen }[]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-semibold transition-colors"
                style={{
                  backgroundColor: tab === id ? "#ffffff" : "transparent",
                  color: tab === id ? "#33333c" : "#7a7a86",
                  boxShadow: tab === id ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                }}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          {tab === "draw" && <DrawPad onCommit={setCurrent} />}
          {tab === "type" && <TypePad onCommit={setCurrent} />}
          {tab === "upload" && <UploadPad onCommit={setCurrent} />}

          {current && (
            <div>
              <p className="mb-2 text-[12px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.06em" }}>
                Preview
              </p>
              <div className="rounded-lg p-3" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                <img src={current.dataUrl} alt="Signature preview" className="mx-auto max-h-16" />
              </div>
              <button
                type="button"
                onClick={placeOnDocument}
                className="mt-3 w-full rounded-lg py-2.5 text-[13px] font-bold uppercase text-white transition-colors"
                style={{ backgroundColor: "#33333c", letterSpacing: "0.04em" }}
              >
                Place on document
              </button>
            </div>
          )}

          <InfoTip>
            {placements.length
              ? `${placements.length} placement${placements.length === 1 ? "" : "s"} on document. Drag to reposition, use the corner handle to resize.`
              : "Create a signature and click \"Place on document\" to add it. You can place it on multiple pages."}
          </InfoTip>

          {hasRotatedPages && (
            <p className="text-[11.5px]" style={{ color: "#a15c1a" }}>
              Note: rotated pages are shown in their native orientation for accurate placement.
            </p>
          )}
        </>
      }
    >
      <div ref={pagesContainerRef} className="space-y-4">
        {loadingPages && (
          <div className="grid h-64 place-items-center rounded-2xl bg-white text-sm text-muted-foreground" style={{ border: "1px solid #ececef" }}>
            Rendering pages…
          </div>
        )}
        {pages.map((page, i) => (
          <PageOverlay
            key={i}
            index={i}
            page={page}
            placements={placements.filter((p) => p.pageIndex === i)}
            onChange={(updated) => setPlacements((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
            onRemove={(id) => setPlacements((prev) => prev.filter((p) => p.id !== id))}
            signature={signature}
            initials={initials}
          />
        ))}
      </div>
    </ToolWorkspace>
  );
}

/* ============================== Page overlay ============================== */

function PageOverlay({
  index,
  page,
  placements,
  onChange,
  onRemove,
  signature,
  initials,
}: {
  index: number;
  page: PageInfo;
  placements: Placement[];
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
  signature: Signature | null;
  initials: Signature | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = displayW ? displayW / page.width : 0;
  const displayH = page.height * scale;

  return (
    <div className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold" style={{ color: "#7a7a86" }}>Page {index + 1}</p>
        {placements.length > 0 && (
          <p className="text-[11.5px]" style={{ color: "#7a7a86" }}>
            {placements.length} placement{placements.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <div
        ref={wrapRef}
        data-page-index={index}
        className="relative mx-auto w-full select-none"
        style={{ height: displayH || undefined, touchAction: "none" }}
      >
        <img src={page.url} alt={`Page ${index + 1}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        {scale > 0 &&
          placements.map((p) => {
            const sig = p.kind === "signature" ? signature : initials;
            if (!sig) return null;
            return (
              <PlacementBox
                key={p.id}
                placement={p}
                sig={sig}
                scale={scale}
                pageW={page.width}
                pageH={page.height}
                onChange={onChange}
                onRemove={onRemove}
              />
            );
          })}
      </div>
    </div>
  );
}

function PlacementBox({
  placement,
  sig,
  scale,
  pageW,
  pageH,
  onChange,
  onRemove,
}: {
  placement: Placement;
  sig: Signature;
  scale: number;
  pageW: number;
  pageH: number;
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
}) {
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    start: Placement;
  } | null>(null);

  const onPointerDown = (mode: "move" | "resize") => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, start: { ...placement } };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.mode === "move") {
      const x = Math.max(0, Math.min(pageW - d.start.w, d.start.x + dx));
      const y = Math.max(0, Math.min(pageH - d.start.h, d.start.y + dy));
      onChange({ ...d.start, x, y });
    } else {
      const aspect = d.start.h / d.start.w;
      let w = Math.max(24, d.start.w + dx);
      w = Math.min(w, pageW - d.start.x);
      let h = w * aspect;
      if (h > pageH - d.start.y) {
        h = pageH - d.start.y;
        w = h / aspect;
      }
      onChange({ ...d.start, w, h });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  return (
    <div
      className="group absolute"
      style={{
        left: placement.x * scale,
        top: placement.y * scale,
        width: placement.w * scale,
        height: placement.h * scale,
      }}
    >
      <div
        onPointerDown={onPointerDown("move")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 cursor-move rounded-sm"
        style={{ border: "1.5px dashed #e5322d", backgroundColor: "rgba(229,50,45,0.04)" }}
      >
        <img
          src={sig.dataUrl}
          alt="Signature"
          className="pointer-events-none h-full w-full object-contain p-1"
          draggable={false}
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(placement.id)}
        className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-[#e5322d] shadow"
        style={{ border: "1px solid #ececef" }}
        aria-label="Remove signature"
      >
        <X className="h-3 w-3" />
      </button>
      <div
        onPointerDown={onPointerDown("resize")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full bg-[#e5322d]"
        style={{ border: "2px solid #ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
      />
    </div>
  );
}

/* ============================== Signature pads ============================== */

function DrawPad({ onCommit }: { onCommit: (sig: Signature | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const clear = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
    onCommit(null);
  };

  const commit = () => {
    const c = canvasRef.current; if (!c) return;
    // Trim transparent whitespace
    const trimmed = trimTransparent(c);
    if (!trimmed) return;
    onCommit({ dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h });
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    // Resize canvas to displayed size for crisp lines.
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
  }, []);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg bg-white"
        style={{ height: 140, border: "1px dashed #cfcfd6", touchAction: "none" }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = pos(e);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const c = canvasRef.current!; const ctx = c.getContext("2d")!;
          const p = pos(e);
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.moveTo(last.current!.x, last.current!.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          last.current = p;
          setHasDrawn(true);
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          try { (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
          if (hasDrawn) commit();
        }}
        onPointerLeave={() => { drawing.current = false; }}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.name}
              className="h-6 w-6 rounded-full transition-transform"
              style={{
                backgroundColor: c.value,
                outline: color === c.value ? "2px solid #33333c" : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#7a7a86] hover:text-[#e5322d]"
        >
          <Trash2 className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}

function TypePad({ onCommit }: { onCommit: (sig: Signature | null) => void }) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(TYPE_FONTS[0].family);
  const [color, setColor] = useState(COLORS[0].value);

  useEffect(() => {
    if (!text.trim()) { onCommit(null); return; }
    const rendered = renderTextToPng(text, font, color);
    if (rendered) onCommit(rendered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, font, color]);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="sig-text" className="text-xs">Your name</Label>
        <Input id="sig-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your signature" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TYPE_FONTS.map((f) => (
          <button
            key={f.family}
            type="button"
            onClick={() => setFont(f.family)}
            className={cn("rounded-lg p-2 text-center transition-colors")}
            style={{
              border: font === f.family ? "2px solid #e5322d" : "1px solid #ececef",
              padding: font === f.family ? "calc(0.5rem - 1px)" : "0.5rem",
              backgroundColor: font === f.family ? "#fff6f5" : "#ffffff",
            }}
          >
            <span style={{ fontFamily: f.family, fontSize: 22, color, lineHeight: 1.1 }}>
              {text || f.name}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            aria-label={c.name}
            className="h-6 w-6 rounded-full"
            style={{
              backgroundColor: c.value,
              outline: color === c.value ? "2px solid #33333c" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function UploadPad({ onCommit }: { onCommit: (sig: Signature | null) => void }) {
  const [removeBg, setRemoveBg] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImg(url);
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      if (removeBg) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          if (r > 235 && g > 235 && b > 235) px[i + 3] = 0;
        }
        ctx.putImageData(data, 0, 0);
      }
      const trimmed = trimTransparent(canvas);
      if (trimmed) onCommit({ dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h });
    } catch (e) {
      toast.error(`Upload failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg py-6 text-[13px] font-semibold transition-colors"
        style={{ border: "1px dashed #cfcfd6", color: "#33333c", backgroundColor: "#fafafb" }}
      >
        Choose signature image (PNG or JPG)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <label className="flex items-center gap-2 text-[13px]" style={{ color: "#33333c" }}>
        <Checkbox checked={removeBg} onCheckedChange={(v) => setRemoveBg(v === true)} />
        <span>Remove white background</span>
      </label>
    </div>
  );
}

/* ============================== helpers ============================== */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function renderTextToPng(text: string, font: string, color: string): Signature | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = 96;
  const pad = 20;
  ctx.font = `${fontSize}px ${font}`;
  const metrics = ctx.measureText(text);
  const textW = Math.max(1, Math.ceil(metrics.width));
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.3;
  const textH = Math.ceil(ascent + descent);
  canvas.width = textW + pad * 2;
  canvas.height = textH + pad * 2;
  const c = canvas.getContext("2d")!;
  c.font = `${fontSize}px ${font}`;
  c.fillStyle = color;
  c.textBaseline = "alphabetic";
  c.fillText(text, pad, pad + ascent);
  return { dataUrl: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height };
}

function trimTransparent(canvas: HTMLCanvasElement): { dataUrl: string; w: number; h: number } | null {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let top = height, left = width, right = 0, bottom = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 5) {
        found = true;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (!found) return null;
  const pad = 4;
  const x0 = Math.max(0, left - pad);
  const y0 = Math.max(0, top - pad);
  const w = Math.min(width - x0, right - left + 1 + pad * 2);
  const h = Math.min(height - y0, bottom - top + 1 + pad * 2);
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const octx = out.getContext("2d")!;
  octx.drawImage(canvas, x0, y0, w, h, 0, 0, w, h);
  return { dataUrl: out.toDataURL("image/png"), w, h };
}
