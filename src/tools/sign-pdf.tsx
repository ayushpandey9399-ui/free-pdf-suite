import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  Plus,
  Pencil,
  PenLine,
  Calendar,
  Type as TypeIcon,
  User,
  Stamp,
  Crown,
  ShieldCheck,
  ArrowRight,
  Download,
  GripVertical,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileDropzone } from "@/components/FileDropzone";
import { loadPdfJsDoc } from "@/lib/pdfGuard";
import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/download";

import "@fontsource/dancing-script/600.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/caveat/600.css";
import "@fontsource/satisfy/400.css";

/**
 * Architecture Notes
 *
 * WHY this file exists: the Sign PDF tool needs a document-editor shell that is
 * structurally different from the generic two-column ToolWorkspace used by the
 * other tools. It owns a 4-panel layout (page rail, top bar, viewer, options
 * sidebar) plus its own screen state machine so the signing surface can occupy
 * the full viewport without the shared sidebar competing for width.
 *
 * Coordinate model: pages are rasterised at RENDER_SCALE for crispness but laid
 * out at PDF point size (1px === 1pt), so placement x/y are already PDF points.
 * Embedding only has to invert the Y axis.
 */

const RENDER_SCALE = 2;
const RED = "#e5322d";

type Screen = "UPLOAD" | "WORKAREA" | "PROCESSING" | "SUCCESS";
type FieldType = "signature" | "initials" | "name" | "date" | "text" | "stamp";

interface PageRender {
  url: string;
  /** Layout size in PDF points. */
  width: number;
  height: number;
  thumb: string;
}

interface Placement {
  id: string;
  type: FieldType;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Data URL for image fields, plain text for text fields. */
  content: string;
  isImage: boolean;
}

const SIG_FONTS = [
  { label: "Dancing Script", css: "'Dancing Script', cursive" },
  { label: "Great Vibes", css: "'Great Vibes', cursive" },
  { label: "Caveat", css: "'Caveat', cursive" },
  { label: "Satisfy", css: "'Satisfy', cursive" },
];

const INK_COLORS = ["#111827", "#2563eb", "#1e3a8a", "#e5322d"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/** Rasterise a text field so we never have to embed a custom font in pdf-lib. */
function textToPng(text: string, fontCss: string, color: string, height: number) {
  const scale = 4;
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = `${height * scale * 0.7}px ${fontCss}`;
  const w = Math.max(20, measure.measureText(text).width + 12 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(w);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${height * scale * 0.7}px ${fontCss}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 6 * scale, canvas.height / 2);
  return { url: canvas.toDataURL("image/png"), ratio: canvas.width / canvas.height };
}

/* ------------------------------------------------------------------ */
/* Signature creation modal                                            */
/* ------------------------------------------------------------------ */

function SignatureModal({
  mode,
  onClose,
  onApply,
}: {
  mode: "signature" | "initials";
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}) {
  const [tab, setTab] = useState<"draw" | "type" | "upload">("draw");
  const [color, setColor] = useState(INK_COLORS[0]);
  const [typed, setTyped] = useState("");
  const [font, setFont] = useState(SIG_FONTS[0].css);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const strokes = useRef<{ points: { x: number; y: number }[]; color: string; lineWidth: number }[]>([]);

  /** Size the canvas to its container at device pixel ratio so strokes stay crisp. */
  useEffect(() => {
    if (tab !== "draw") return;
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    if (!c || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, Math.round(wrap.clientWidth * dpr));
    c.height = Math.round(180 * dpr);
    c.style.width = "100%";
    c.style.height = "180px";
    c.style.touchAction = "none";
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }, [tab]);

  const strokePath = (
    ctx: CanvasRenderingContext2D,
    pts: { x: number; y: number }[],
    strokeColor: string,
    lineWidth: number,
  ) => {
    if (pts.length < 2) {
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.fillStyle = strokeColor;
        ctx.arc(pts[0].x, pts[0].y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  };

  const redraw = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, c.width / dpr, c.height / dpr);
    for (const s of strokes.current) strokePath(ctx, s.points, s.color, s.lineWidth);
  };

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    points.current = [pos(e)];
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    points.current.push(pos(e));
    redraw();
    strokePath(canvasRef.current!.getContext("2d")!, points.current, color, 2.5);
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (points.current.length) {
      strokes.current.push({ points: [...points.current], color, lineWidth: 2.5 });
    }
    points.current = [];
    redraw();
  };

  const clear = () => {
    strokes.current = [];
    points.current = [];
    redraw();
  };


  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setUploaded(String(reader.result));
    reader.readAsDataURL(file);
  };

  const processUpload = (src: string) =>
    new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        if (removeBg) {
          const data = ctx.getImageData(0, 0, c.width, c.height);
          const px = data.data;
          for (let i = 0; i < px.length; i += 4) {
            if (px[i] > 235 && px[i + 1] > 235 && px[i + 2] > 235) px[i + 3] = 0;
          }
          ctx.putImageData(data, 0, 0);
        }
        resolve(c.toDataURL("image/png"));
      };
      img.src = src;
    });

  const apply = async () => {
    if (tab === "draw") {
      if (!strokes.current.length) return toast.error("Draw your signature first");
      onApply(canvasRef.current!.toDataURL("image/png"));
      return;
    }
    if (tab === "type") {
      if (!typed.trim()) return toast.error("Type your name first");
      onApply(textToPng(typed.trim(), font, color, 60).url);
      return;
    }
    if (!uploaded) return toast.error("Upload an image first");
    onApply(await processUpload(uploaded));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[560px] rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-[20px] font-semibold" style={{ color: "#1a1a1a" }}>
            {mode === "initials" ? "Create your Initials" : "Create your Signature"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-gray-100">
            <X className="h-5 w-5" style={{ color: "#888" }} />
          </button>
        </div>

        <div className="flex gap-6" style={{ borderBottom: "1px solid #f0f0f0" }}>
          {(["draw", "type", "upload"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="pb-2 text-[14px] font-medium capitalize transition-colors"
              style={
                tab === t
                  ? { color: RED, borderBottom: `2px solid ${RED}` }
                  : { color: "#888", borderBottom: "2px solid transparent" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {tab === "draw" && (
            <div>
              <div ref={wrapRef} className="relative" style={{ border: "1px solid #e0e0e0", borderRadius: 8 }}>
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center text-[24px]"
                  style={{ color: "#f0f0f0" }}
                >
                  Sign here
                </span>
                <canvas
                  ref={canvasRef}
                  className="relative block w-full touch-none rounded-lg"
                  style={{ height: 180, touchAction: "none" }}
                  onPointerDown={start}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                  onPointerLeave={end}
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <ColorPicker color={color} setColor={setColor} />
                <button type="button" onClick={clear} className="text-[13px]" style={{ color: "#888" }}>
                  Clear
                </button>
              </div>
            </div>
          )}

          {tab === "type" && (
            <div>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={mode === "initials" ? "Type your initials..." : "Type your name..."}
                className="w-full text-[16px] outline-none"
                style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px" }}
              />
              <div className="mt-3 grid grid-cols-2 gap-3">
                {SIG_FONTS.map((f) => (
                  <button
                    key={f.css}
                    type="button"
                    onClick={() => setFont(f.css)}
                    className="flex h-[68px] items-center justify-center overflow-hidden rounded-lg px-3"
                    style={{
                      border: font === f.css ? `2px solid ${RED}` : "1px solid #e0e0e0",
                      background: font === f.css ? "#fff5f5" : "#fff",
                    }}
                  >
                    <span
                      className="truncate text-[26px]"
                      style={{ fontFamily: f.css, color }}
                    >
                      {typed.trim() || f.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <ColorPicker color={color} setColor={setColor} />
              </div>
            </div>
          )}

          {tab === "upload" && (
            <div>
              <label
                className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg text-[14px]"
                style={{ border: "2px dashed #e0e0e0", color: "#888" }}
              >
                {uploaded ? (
                  <img src={uploaded} alt="Signature preview" className="max-h-[120px] object-contain" />
                ) : (
                  "Upload PNG, JPG or SVG"
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </label>
              <label className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: "#555" }}>
                <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} />
                Remove white background
              </label>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium"
            style={{ border: "1px solid #e0e0e0", borderRadius: 8, padding: "10px 24px", color: "#555" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={apply}
            className="text-[14px] font-semibold text-white"
            style={{ background: RED, borderRadius: 8, padding: "10px 24px" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ color, setColor }: { color: string; setColor: (c: string) => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      {INK_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Ink colour ${c}`}
          onClick={() => setColor(c)}
          className="h-6 w-6 rounded-full"
          style={{
            background: c,
            boxShadow: color === c ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar field card                                                  */
/* ------------------------------------------------------------------ */

function FieldCard({
  label,
  icon,
  tone,
  preview,
  previewFont,
  onEdit,
  onDragStart,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  tone: "blue" | "gray" | "sky";
  preview?: string | null;
  previewFont?: string;
  onEdit?: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  const tones = {
    blue: { background: "#dbeafe", color: "#2563eb" },
    gray: { background: "#f3f4f6", color: "#6b7280" },
    sky: { background: "#e0f2fe", color: "#0284c7" },
  }[tone];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="mb-2 flex cursor-grab items-center gap-2.5 bg-white transition-colors hover:bg-[#f5f5f5]"
      style={{ border: "1px solid #e8e8e8", borderRadius: 8, padding: "10px 12px" }}
    >
      <GripVertical className="h-3.5 w-3.5 shrink-0" style={{ color: "#ccc" }} />
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center"
        style={{ ...tones, borderRadius: 6 }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className="block text-[11px] font-medium uppercase"
          style={{ color: "#888", letterSpacing: "0.06em" }}
        >
          {label}
        </span>
        {preview && (
          <span
            className="block truncate text-[18px] leading-tight"
            style={{ color: "#1a1a1a", fontFamily: previewFont }}
          >
            {preview}
          </span>
        )}
      </span>
      {onEdit && (
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="shrink-0 rounded p-1 hover:bg-gray-100"
        >
          <Pencil className="h-4 w-4" style={{ color: "#9ca3af" }} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main tool                                                           */
/* ------------------------------------------------------------------ */

export default function SignPdf() {
  const [screen, setScreen] = useState<Screen>("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageRender[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const [modal, setModal] = useState<null | "signature" | "initials">(null);
  const [signedName, setSignedName] = useState("Your name");
  const [placeMode, setPlaceMode] = useState<FieldType | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [signedBlob, setSignedBlob] = useState<Blob | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragType = useRef<FieldType | null>(null);
  const hintShown = useRef(false);

  /** Escape cancels click-to-place mode. */
  useEffect(() => {
    if (!placeMode) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlaceMode(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placeMode]);


  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;
    const selected = files[0];
    setFile(selected);
    setScreen("WORKAREA");
    setLoadingPages(true);
    try {
      const buffer = await selected.arrayBuffer();
      const pdf = await loadPdfJsDoc(buffer);
      const out: PageRender[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport, canvas }).promise;
        const url = canvas.toDataURL("image/jpeg", 0.85);

        const thumbCanvas = document.createElement("canvas");
        const tv = page.getViewport({ scale: 0.3 });
        thumbCanvas.width = tv.width;
        thumbCanvas.height = tv.height;
        await page.render({ canvasContext: thumbCanvas.getContext("2d")!, viewport: tv, canvas: thumbCanvas })
          .promise;

        out.push({ url, width: base.width, height: base.height, thumb: thumbCanvas.toDataURL("image/jpeg", 0.7) });
      }
      setPages(out);
    } catch (e) {
      toast.error((e as Error).message || "Could not open this PDF");
      setScreen("UPLOAD");
    } finally {
      setLoadingPages(false);
    }
  };

  const defaultSize = (type: FieldType) => {
    if (type === "signature") return { width: 180, height: 60 };
    if (type === "stamp") return { width: 120, height: 120 };
    if (type === "initials") return { width: 80, height: 50 };
    return { width: 140, height: 28 };
  };

  const contentFor = (type: FieldType) => {
    if (type === "signature") return { content: signature ?? "", isImage: true };
    if (type === "initials") return { content: initials ?? "", isImage: true };
    if (type === "stamp") return { content: "", isImage: true };
    if (type === "date") return { content: new Date().toLocaleDateString(), isImage: false };
    if (type === "name") return { content: signedName, isImage: false };
    return { content: "Text", isImage: false };
  };

  const addPlacement = useCallback(
    (type: FieldType, pageIndex: number, x: number, y: number) => {
      if (type === "signature" && !signature) {
        setModal("signature");
        return;
      }
      if (type === "initials" && !initials) {
        setModal("initials");
        return;
      }
      const size = defaultSize(type);
      const c = contentFor(type);
      const id = uid();
      const page = pages[pageIndex];
      const maxX = page ? Math.max(0, page.width - size.width) : x;
      const maxY = page ? Math.max(0, page.height - size.height) : y;
      setPlacements((prev) => [
        ...prev,
        {
          id,
          type,
          pageIndex,
          x: Math.max(0, Math.min(maxX, x)),
          y: Math.max(0, Math.min(maxY, y)),
          ...size,
          ...c,
        },
      ]);
      setSelectedId(id);
      if (!hintShown.current) {
        hintShown.current = true;
        setShowHint(true);
        window.setTimeout(() => setShowHint(false), 3000);
      }
    },
    [signature, initials, signedName, pages],
  );

  /** Map a client point onto PDF point coordinates for the given page element. */
  const pointOnPage = (clientX: number, clientY: number, el: HTMLElement, pageIndex: number) => {
    const rect = el.getBoundingClientRect();
    const page = pages[pageIndex];
    const scale = page ? page.width / rect.width : 1;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top) * scale };
  };

  const dropOnPage = (e: React.DragEvent, pageIndex: number) => {
    e.preventDefault();
    const type = dragType.current;
    if (!type) return;
    const size = defaultSize(type);
    const pt = pointOnPage(e.clientX, e.clientY, e.currentTarget as HTMLElement, pageIndex);
    addPlacement(type, pageIndex, pt.x - size.width / 2, pt.y - size.height / 2);
    dragType.current = null;
  };

  const clickOnPage = (e: React.MouseEvent, pageIndex: number) => {
    if (!placeMode) return;
    e.stopPropagation();
    const size = defaultSize(placeMode);
    const pt = pointOnPage(e.clientX, e.clientY, e.currentTarget as HTMLElement, pageIndex);
    addPlacement(placeMode, pageIndex, pt.x - size.width / 2, pt.y - size.height / 2);
    setPlaceMode(null);
  };

  /** Pointer-driven move/resize for a placed field. */
  const beginInteract = (e: React.PointerEvent, id: string, action: "move" | "resize") => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
    const startX = e.clientX;
    const startY = e.clientY;
    const target = placements.find((p) => p.id === id);
    if (!target) return;
    const pageEl = pageRefs.current[target.pageIndex];
    const page = pages[target.pageIndex];
    const scale = pageEl && page ? page.width / pageEl.getBoundingClientRect().width : 1;
    const origin = { x: target.x, y: target.y, w: target.width, h: target.height };

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) * scale;
      const dy = (ev.clientY - startY) * scale;
      setPlacements((prev) =>
        prev.map((p) =>
          p.id !== id
            ? p
            : action === "move"
              ? {
                  ...p,
                  x: Math.max(0, Math.min(page ? page.width - p.width : Infinity, origin.x + dx)),
                  y: Math.max(0, Math.min(page ? page.height - p.height : Infinity, origin.y + dy)),
                }
              : { ...p, width: Math.max(60, origin.w + dx), height: Math.max(30, origin.h + dy) },
        ),
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };


  const goToPage = (i: number) => {
    setActivePage(i);
    pageRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applySignature = (dataUrl: string) => {
    if (modal === "initials") setInitials(dataUrl);
    else setSignature(dataUrl);
    setModal(null);
  };

  const signedFileName = file ? file.name.replace(/\.pdf$/i, "") + "-signed.pdf" : "signed.pdf";
  const pagesWithFields = new Set(placements.map((p) => p.pageIndex)).size;
  const placementSummary = placements.length
    ? `${placements.length} field${placements.length === 1 ? "" : "s"} placed on ${pagesWithFields} page${pagesWithFields === 1 ? "" : "s"}`
    : "0 fields placed";



  const sign = async () => {
    if (!file || !placements.length) return;
    setScreen("PROCESSING");
    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const docPages = pdfDoc.getPages();
      for (const p of placements) {
        const page = docPages[p.pageIndex];
        if (!page) continue;
        const { height: pageHeight } = page.getSize();
        let url = p.content;
        if (!p.isImage) {
          url = textToPng(p.content || " ", "Helvetica, Arial, sans-serif", "#111827", p.height).url;
        }
        if (!url) continue;
        const bytes = await fetch(url).then((r) => r.arrayBuffer());
        const img = url.startsWith("data:image/jpeg")
          ? await pdfDoc.embedJpg(bytes)
          : await pdfDoc.embedPng(bytes);
        page.drawImage(img, {
          x: p.x,
          y: pageHeight - p.y - p.height,
          width: p.width,
          height: p.height,
        });
      }
      const out = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      setSignedBlob(blob);
      downloadBlob(blob, signedFileName);
      setScreen("SUCCESS");
    } catch (e) {
      toast.error((e as Error).message || "Signing failed");
      setScreen("WORKAREA");
    }
  };

  /* ------------------------------ render ------------------------------ */

  if (screen === "UPLOAD") {
    return (
      <div className="w-full">
        <FileDropzone
          files={file ? [file] : []}
          onFilesChange={handleFileUpload}
          accept="application/pdf"
          multiple={false}
          hideList
        />
      </div>
    );
  }

  if (screen === "SUCCESS") {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "#eafaf0", color: "#1f9d55" }}
        >
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-[24px] font-semibold" style={{ color: "#1a1a1a" }}>
          Your PDF has been signed
        </h2>
        <p className="text-[14px]" style={{ color: "#555" }}>
          {signedFileName}
        </p>
        <p className="text-[13px]" style={{ color: "#888" }}>
          {placementSummary}
        </p>
        <button
          type="button"
          onClick={() => signedBlob && downloadBlob(signedBlob, signedFileName)}
          className="mt-2 inline-flex items-center gap-2 text-[15px] font-semibold text-white"
          style={{ background: RED, borderRadius: 8, padding: "14px 32px" }}
        >
          <Download className="h-4 w-4" /> Download Again
        </button>
        <button
          type="button"
          onClick={() => {
            setFile(null);
            setPages([]);
            setPlacements([]);
            setSignedBlob(null);
            setScreen("UPLOAD");
          }}
          className="text-[13px] font-semibold underline"
          style={{ color: "#5a5a66" }}
        >
          Sign another PDF
        </button>
      </div>
    );
  }

  const total = pages.length;
  const canSign = placements.length > 0;


  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2">
      <div className="flex h-[calc(100dvh-220px)] min-h-[560px] w-full flex-col overflow-hidden">
        {/* TOP BAR */}
        <div
          className="flex h-12 shrink-0 items-center gap-3 bg-white px-4"
          style={{ borderBottom: "1px solid #e8e8e8" }}
        >
          <button
            type="button"
            aria-label="Previous page"
            onClick={() => goToPage(Math.max(0, activePage - 1))}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#f5f5f5]"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next page"
            onClick={() => goToPage(Math.min(total - 1, activePage + 1))}
            className="flex h-8 w-8 items-center justify-center rounded hover:bg-[#f5f5f5]"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <input
            value={total ? activePage + 1 : 0}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n >= 1 && n <= total) goToPage(n - 1);
            }}
            aria-label="Page number"
            className="w-10 text-center text-[14px] outline-none"
            style={{ border: "1px solid #e0e0e0", borderRadius: 4, padding: "4px 0" }}
          />
          <span className="text-[14px]" style={{ color: "#888" }}>
            / {total}
          </span>
          <div className="flex-1" />
          <span
            className="hidden truncate text-[13px] sm:block"
            style={{ color: "#555", maxWidth: 300 }}
          >
            {file?.name}
          </span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* LEFT PAGE RAIL */}
          <div
            className="hidden shrink-0 overflow-y-auto sm:block"
            style={{ width: 80, background: "#f0f0f0", padding: "8px 6px" }}
          >
            {pages.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToPage(i)}
                className="mb-2 block w-full"
              >
                <img
                  src={p.thumb}
                  alt={`Page ${i + 1}`}
                  className="w-full rounded"
                  style={{
                    border: `2px solid ${activePage === i ? RED : "transparent"}`,
                    borderRadius: 4,
                  }}
                />
                <span className="mt-0.5 block text-center text-[10px]" style={{ color: "#888" }}>
                  {i + 1}
                </span>
              </button>
            ))}
          </div>

          {/* MAIN VIEWER */}
          <div
            ref={viewerRef}
            className="relative min-w-0 flex-1 overflow-auto"
            style={{ background: "#e8e8e8" }}
            onClick={() => setSelectedId(null)}
          >
            {loadingPages && (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: RED }} />
                <p className="text-[14px]" style={{ color: "#666" }}>
                  Loading PDF pages...
                </p>
              </div>
            )}
            {pages.map((page, i) => (
              <div
                key={i}
                ref={(el) => {
                  pageRefs.current[i] = el;
                }}
                className="relative bg-white"
                style={{
                  width: page.width,
                  height: page.height,
                  margin: "16px auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  maxWidth: "calc(100% - 24px)",
                  cursor: placeMode ? "crosshair" : "default",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => dropOnPage(e, i)}
                onClick={(e) => clickOnPage(e, i)}
              >
                <img src={page.url} alt={`Page ${i + 1}`} className="pointer-events-none h-full w-full" />

                {placements
                  .filter((p) => p.pageIndex === i)
                  .map((p) => {
                    const selected = selectedId === p.id;
                    return (
                      <div
                        key={p.id}
                        onPointerDown={(e) => beginInteract(e, p.id, "move")}
                        className="absolute flex cursor-move items-center justify-center"
                        style={{
                          left: `${(p.x / page.width) * 100}%`,
                          top: `${(p.y / page.height) * 100}%`,
                          width: `${(p.width / page.width) * 100}%`,
                          height: `${(p.height / page.height) * 100}%`,
                          border: selected ? `2px solid ${RED}` : `2px dashed ${RED}`,
                          background: "rgba(229,50,45,0.08)",
                          opacity: selected ? 1 : 0.75,
                        }}
                      >
                        {p.isImage && p.content ? (
                          <img
                            src={p.content}
                            alt={p.type}
                            className="pointer-events-none h-full w-full object-contain"
                          />
                        ) : p.type === "text" ? (
                          <input
                            value={p.content}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setPlacements((prev) =>
                                prev.map((x) => (x.id === p.id ? { ...x, content: e.target.value } : x)),
                              )
                            }
                            placeholder="Type text"
                            className="h-full w-full bg-transparent px-1 text-center outline-none"
                            style={{ fontSize: Math.max(10, p.height * 0.55), color: "#111827" }}
                          />
                        ) : (
                          <span
                            className="pointer-events-none truncate px-1"
                            style={{ fontSize: Math.max(10, p.height * 0.6), color: "#111827" }}
                          >
                            {p.content || FIELD_LABELS[p.type]}
                          </span>
                        )}

                        {!p.isImage || p.content ? null : (
                          <span
                            className="pointer-events-none px-1 text-center text-[11px] font-semibold"
                            style={{ color: RED }}
                          >
                            {FIELD_LABELS[p.type]}
                          </span>
                        )}

                        <button
                          type="button"
                          aria-label="Remove field"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlacements((prev) => prev.filter((x) => x.id !== p.id));
                          }}
                          className="absolute z-10 flex items-center justify-center rounded-full text-white"
                          style={{ top: -10, right: -10, width: 20, height: 20, background: RED }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span
                          onPointerDown={(e) => beginInteract(e, p.id, "resize")}
                          className="absolute z-10 cursor-nwse-resize"
                          style={{
                            right: -6,
                            bottom: -6,
                            width: 12,
                            height: 12,
                            background: "#666",
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            ))}

            {placeMode && (
              <div
                className="pointer-events-none sticky top-2 z-20 mx-auto w-fit rounded-full px-4 py-2 text-[13px] font-semibold text-white"
                style={{ background: "rgba(17,24,39,0.85)" }}
              >
                Click on the document to place {FIELD_LABELS[placeMode]} (Esc to cancel)
              </div>
            )}

            {showHint && (
              <div
                className="pointer-events-none sticky bottom-4 z-20 mx-auto w-fit rounded-full px-4 py-2 text-[12px] font-medium text-white"
                style={{ background: "rgba(17,24,39,0.85)" }}
              >
                Drag to move, corner to resize, x to delete
              </div>
            )}

            {screen === "PROCESSING" && (
              <div
                className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
                style={{ background: "rgba(255,255,255,0.8)" }}
              >
                <Loader2 className="h-10 w-10 animate-spin" style={{ color: RED }} />
                <p className="text-[15px] font-semibold" style={{ color: "#1a1a1a" }}>
                  Generating your signed PDF...
                </p>
              </div>
            )}


            {!loadingPages && (
              <button
                type="button"
                aria-label="Add signature field"
                onClick={(e) => {
                  e.stopPropagation();
                  addPlacement("signature", activePage, 60, 60);
                }}
                className="fixed z-20 flex h-12 w-12 items-center justify-center rounded-full text-white lg:right-[300px]"
                style={{ bottom: 80, right: 16, background: RED, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
              >
                <Plus className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside
            className="hidden shrink-0 flex-col bg-white lg:flex"
            style={{ width: 280, minWidth: 280, borderLeft: "1px solid #e8e8e8" }}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <h2
                className="text-[20px] font-semibold"
                style={{ color: "#1a1a1a", padding: "20px 16px 12px" }}
              >
                Signing options
              </h2>

              <div className="flex gap-3 px-4 pb-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
                <div
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1.5"
                  style={{ border: `2px solid ${RED}`, borderRadius: 8, padding: 12, background: "#fff5f5" }}
                >
                  <PenLine style={{ width: 28, height: 28, color: RED }} />
                  <span className="text-center text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                    Simple Signature
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("Digital Signature is a premium feature")}
                  className="relative flex flex-1 cursor-pointer flex-col items-center gap-1.5"
                  style={{
                    border: "2px solid #e0e0e0",
                    borderRadius: 8,
                    padding: 12,
                    background: "#fff",
                    opacity: 0.6,
                  }}
                >
                  <Crown className="absolute right-1.5 top-1.5 h-3.5 w-3.5" style={{ color: "#d4a017" }} />
                  <ShieldCheck style={{ width: 28, height: 28, color: "#6b7280" }} />
                  <span className="text-center text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                    Digital Signature
                  </span>
                </button>
              </div>

              <div
                className="text-[11px] font-semibold uppercase"
                style={{ color: "#888", letterSpacing: "0.08em", padding: "16px 16px 8px" }}
              >
                Required fields
              </div>
              <div className="px-4">
                <FieldCard
                  label="Signature"
                  tone="blue"
                  icon={<PenLine className="h-4 w-4" />}
                  preview={signature ? undefined : signedName}
                  previewFont="'Dancing Script', cursive"
                  onEdit={() => setModal("signature")}
                  onDragStart={() => {
                    dragType.current = "signature";
                  }}
                  onClick={() => addPlacement("signature", activePage, 60, 60)}
                />
                {signature && (
                  <img
                    src={signature}
                    alt="Your signature"
                    className="mb-2 h-10 object-contain"
                    style={{ marginLeft: 12 }}
                  />
                )}
              </div>

              <div
                className="text-[11px] font-semibold uppercase"
                style={{ color: "#888", letterSpacing: "0.08em", padding: "16px 16px 8px" }}
              >
                Optional fields
              </div>
              <div className="px-4 pb-4">
                <FieldCard
                  label="Initials"
                  tone="blue"
                  icon={<span className="text-[11px] font-bold">AC</span>}
                  onEdit={() => setModal("initials")}
                  onDragStart={() => {
                    dragType.current = "initials";
                  }}
                  onClick={() => addPlacement("initials", activePage, 60, 60)}
                />
                <FieldCard
                  label="Name"
                  tone="gray"
                  icon={<User className="h-4 w-4" />}
                  onDragStart={() => {
                    dragType.current = "name";
                  }}
                  onClick={() => addPlacement("name", activePage, 60, 60)}
                />
                <FieldCard
                  label="Date"
                  tone="sky"
                  icon={<Calendar className="h-4 w-4" />}
                  onDragStart={() => {
                    dragType.current = "date";
                  }}
                  onClick={() => addPlacement("date", activePage, 60, 60)}
                />
                <FieldCard
                  label="Text"
                  tone="gray"
                  icon={<TypeIcon className="h-4 w-4" />}
                  onDragStart={() => {
                    dragType.current = "text";
                  }}
                  onClick={() => addPlacement("text", activePage, 60, 60)}
                />
                <FieldCard
                  label="Company Stamp"
                  tone="gray"
                  icon={<Stamp className="h-4 w-4" />}
                  onDragStart={() => {
                    dragType.current = "stamp";
                  }}
                  onClick={() => addPlacement("stamp", activePage, 60, 60)}
                />
                {placements.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPlacements([])}
                    className="mt-1 inline-flex items-center gap-1.5 text-[12px]"
                    style={{ color: "#888" }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear all fields ({placements.length})
                  </button>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-4 py-3" style={{ borderTop: "1px solid #f0f0f0" }}>
              <button
                type="button"
                onClick={sign}
                disabled={!canSign}
                className="flex w-full items-center justify-center gap-2 text-[16px] font-semibold text-white"
                style={{
                  height: 52,
                  borderRadius: 8,
                  background: canSign ? RED : "#fca5a5",
                  cursor: canSign ? "pointer" : "not-allowed",
                }}
              >
                Sign <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sign bar */}
      <div className="bg-white px-4 py-3 lg:hidden" style={{ borderTop: "1px solid #e8e8e8" }}>
        <button
          type="button"
          onClick={sign}
          disabled={!canSign}
          className="flex w-full items-center justify-center gap-2 text-[16px] font-semibold text-white"
          style={{ height: 52, borderRadius: 8, background: canSign ? RED : "#fca5a5" }}
        >
          Sign <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {modal && (
        <SignatureModal mode={modal} onClose={() => setModal(null)} onApply={applySignature} />
      )}
    </div>
  );
}
