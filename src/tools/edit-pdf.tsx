import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  StandardFonts,
  rgb,
  BlendMode,
  LineCapStyle,
  type PDFFont,
  type PDFImage,
} from "pdf-lib";
import {
  MousePointer2,
  Highlighter,
  Type as TypeIcon,
  Square,
  Circle as CircleIcon,
  Minus,
  MoveRight,
  Pencil,
  Image as ImageIcon,
  Undo2,
  Redo2,
  X,
  Trash2,
  Eye,
  EyeOff,
  Bold,
  Italic,
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import { classifyPdfFont, type FontFamily } from "@/lib/fontMatch";
import { extractEditableLines, type EditableLine } from "@/lib/pdfTextLayer";
import { sampleBackgroundAndTextColor, rgbToHex, hexToRgb255 } from "@/lib/canvasSample";

/* =============================== types =============================== */

type ToolMode =
  | "select"
  | "highlight"
  | "text"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "draw"
  | "image";

interface Pt {
  x: number;
  y: number;
}

interface Base {
  id: string;
  page: number;
}

type Anno =
  | (Base & { kind: "highlight"; x: number; y: number; w: number; h: number; color: string })
  | (Base & {
      kind: "text";
      x: number;
      y: number;
      w: number;
      h: number;
      text: string;
      size: number;
      color: string;
      bold: boolean;
    })
  | (Base & {
      kind: "rect" | "ellipse";
      x: number;
      y: number;
      w: number;
      h: number;
      stroke: string;
      strokeWidth: number;
      fill: string | null;
      fillOpacity: number;
    })
  | (Base & {
      kind: "line" | "arrow";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      color: string;
      width: number;
    })
  | (Base & { kind: "draw"; points: Pt[]; color: string; width: number })
  | (Base & { kind: "image"; x: number; y: number; w: number; h: number; dataUrl: string; mime: string });

type EditMode = "edit-text" | "annotate";

interface TextEdit {
  id: string;
  page: number;
  lineId: string;
  /** left, PDF units, from LEFT */
  x: number;
  /** top of line box, PDF units, from TOP */
  y: number;
  width: number;
  height: number;
  /** baseline y, PDF units, from TOP */
  baselineY: number;
  originalText: string;
  newText: string;
  fontSize: number;
  color: string;   // hex
  bgColor: string; // hex (sampled)
  bold: boolean;
  italic: boolean;
  family: FontFamily;
}

interface PageInfo {
  url: string;
  width: number;
  height: number;
  rotation: number;
}

/* =============================== constants =============================== */

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fff176" },
  { name: "Green", value: "#a5f3a1" },
  { name: "Pink", value: "#f7a8d0" },
  { name: "Blue", value: "#a1c9f7" },
];

const STROKE_COLORS = [
  { name: "Red", value: "#e5322d" },
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#1a56db" },
  { name: "Green", value: "#1f9d55" },
  { name: "Orange", value: "#f28c1e" },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/* =============================== bbox helpers =============================== */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function bbox(a: Anno): Box {
  switch (a.kind) {
    case "line":
    case "arrow": {
      const x = Math.min(a.x1, a.x2);
      const y = Math.min(a.y1, a.y2);
      return { x, y, w: Math.abs(a.x2 - a.x1) || 1, h: Math.abs(a.y2 - a.y1) || 1 };
    }
    case "draw": {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const p of a.points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      if (!isFinite(minX)) return { x: 0, y: 0, w: 1, h: 1 };
      return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    }
    default:
      return { x: a.x, y: a.y, w: a.w, h: a.h };
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  const s = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const n = parseInt(s, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

/* =============================== main component =============================== */

export default function EditPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const [editMode, setEditMode] = useState<EditMode>("edit-text");
  const [mode, setMode] = useState<ToolMode>("select");
  const [annos, setAnnos] = useState<Anno[]>([]);
  const [edits, setEdits] = useState<TextEdit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAllEditableHint, setShowAllEditableHint] = useState(false);
  const [activeEditLineId, setActiveEditLineId] = useState<string | null>(null);

  // pdfjs doc + rendered canvases (kept in memory for lazy text extraction
  // and for background/foreground color sampling at edit / export time).
  const pdfjsDocRef = useRef<PDFDocumentProxy | null>(null);
  const pageCanvasesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const linesByPageRef = useRef<Map<number, EditableLine[]>>(new Map());
  const [linesTick, setLinesTick] = useState(0);
  const [hasAnyText, setHasAnyText] = useState<boolean | null>(null); // null = unknown

  // Contextual style state (used when creating NEW elements)
  const [hlColor, setHlColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [txtSize, setTxtSize] = useState(16);
  const [txtColor, setTxtColor] = useState("#111111");
  const [txtBold, setTxtBold] = useState(false);
  const [shapeStroke, setShapeStroke] = useState("#e5322d");
  const [shapeWidth, setShapeWidth] = useState(2);
  const [shapeFill, setShapeFill] = useState<string | null>(null);
  const [shapeFillOpacity, setShapeFillOpacity] = useState(0.3);
  const [lineColor, setLineColor] = useState("#e5322d");
  const [lineWidth, setLineWidth] = useState(2);
  const [drawColor, setDrawColor] = useState("#e5322d");
  const [drawWidth, setDrawWidth] = useState(2.5);

  // pending image (loaded from IMAGE tool, waiting to be placed on next click)
  const [pendingImage, setPendingImage] = useState<{
    dataUrl: string;
    mime: string;
    w: number;
    h: number;
  } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // history — snapshots BOTH annotation list and text-edit list.
  interface Snapshot { annos: Anno[]; edits: TextEdit[] }
  const historyRef = useRef<Snapshot[]>([{ annos: [], edits: [] }]);
  const historyIdxRef = useRef(0);
  const [historyTick, setHistoryTick] = useState(0);

  const pushHistorySnap = useCallback((snap: Snapshot) => {
    const arr = historyRef.current.slice(0, historyIdxRef.current + 1);
    arr.push(snap);
    if (arr.length > 100) arr.shift();
    historyRef.current = arr;
    historyIdxRef.current = arr.length - 1;
    setHistoryTick((t) => t + 1);
  }, []);

  const commitAnnos = useCallback(
    (updater: (prev: Anno[]) => Anno[]) => {
      setAnnos((prev) => {
        const next = updater(prev);
        pushHistorySnap({ annos: next, edits: historyRef.current[historyIdxRef.current].edits });
        return next;
      });
    },
    [pushHistorySnap],
  );

  const commitEdits = useCallback(
    (updater: (prev: TextEdit[]) => TextEdit[]) => {
      setEdits((prev) => {
        const next = updater(prev);
        pushHistorySnap({ annos: historyRef.current[historyIdxRef.current].annos, edits: next });
        return next;
      });
    },
    [pushHistorySnap],
  );

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const s = historyRef.current[historyIdxRef.current];
    setAnnos(s.annos);
    setEdits(s.edits);
    setSelectedId(null);
    setHistoryTick((t) => t + 1);
  }, []);
  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const s = historyRef.current[historyIdxRef.current];
    setAnnos(s.annos);
    setEdits(s.edits);
    setSelectedId(null);
    setHistoryTick((t) => t + 1);
  }, []);

  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;
  // reference historyTick so linter/react keep this component subscribed to updates
  void historyTick;
  void linesTick;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  // load pages
  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setAnnos([]);
    setEdits([]);
    setSelectedId(null);
    setActiveEditLineId(null);
    setHasAnyText(null);
    pdfjsDocRef.current = null;
    pageCanvasesRef.current = new Map();
    linesByPageRef.current = new Map();
    historyRef.current = [{ annos: [], edits: [] }];
    historyIdxRef.current = 0;
    setHistoryTick((t) => t + 1);
    if (!file) return;
    setLoadingPages(true);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (cancelled) return;
        pdfjsDocRef.current = doc;
        const out: PageInfo[] = [];
        const maxW = 800;
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp1 = page.getViewport({ scale: 1, rotation: 0 });
          const scale = Math.min(2, maxW / vp1.width);
          const vp = page.getViewport({ scale, rotation: 0 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          if (cancelled) return;
          pageCanvasesRef.current.set(i - 1, canvas);
          out.push({
            url: canvas.toDataURL("image/jpeg", 0.85),
            width: vp1.width,
            height: vp1.height,
            rotation: (page as unknown as { rotate: number }).rotate ?? 0,
          });
        }
        if (!cancelled) setPages(out);
        // Probe first few pages for any extractable text — used for the
        // "looks like a scanned PDF" callout.
        if (!cancelled) {
          const probe = Math.min(3, doc.numPages);
          let total = 0;
          for (let i = 1; i <= probe; i++) {
            const lines = await extractEditableLines(doc, i);
            linesByPageRef.current.set(i - 1, lines);
            total += lines.reduce((n, l) => n + l.text.length, 0);
          }
          if (!cancelled) {
            setHasAnyText(total > 0);
            setLinesTick((t) => t + 1);
          }
        }
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Preview failed: ${(e as Error).message}`);
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  // Lazy line extraction for a specific page (called from PageOverlay when
  // it becomes visible). Idempotent.
  const ensureLinesForPage = useCallback(async (pageIdx: number) => {
    if (linesByPageRef.current.has(pageIdx)) return;
    const doc = pdfjsDocRef.current;
    if (!doc) return;
    try {
      const lines = await extractEditableLines(doc, pageIdx + 1);
      linesByPageRef.current.set(pageIdx, lines);
      setLinesTick((t) => t + 1);
    } catch {
      linesByPageRef.current.set(pageIdx, []);
    }
  }, []);

  // Handle IMAGE tool file picker
  const openImagePicker = () => imageInputRef.current?.click();
  const handleImagePicked = async (f: File) => {
    try {
      const dataUrl = await fileToDataUrl(f);
      const { w, h } = await getImageSize(dataUrl);
      setPendingImage({ dataUrl, mime: f.type || "image/png", w, h });
      toast.success("Click on a page to place the image");
    } catch (e) {
      toast.error(`Image load failed: ${(e as Error).message}`);
    }
  };

  const selected = useMemo(() => annos.find((a) => a.id === selectedId) || null, [annos, selectedId]);

  const resetAll = () => {
    setFiles([]);
    setPages([]);
    setAnnos([]);
    setSelectedId(null);
    setMode("select");
    historyRef.current = [[]];
    historyIdxRef.current = 0;
    setResult(null);
    setPendingImage(null);
  };

  const clearAll = () => {
    if (!annos.length) return;
    if (!confirm("Remove all annotations?")) return;
    commitAnnos(() => []);
    setSelectedId(null);
  };

  /* =========== export =========== */

  const run = async () => {
    if (!file || !annos.length) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pdfPages = doc.getPages();

      let helv: PDFFont | null = null;
      let helvBold: PDFFont | null = null;
      const getFont = async (bold: boolean) => {
        if (bold) {
          if (!helvBold) helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
          return helvBold;
        }
        if (!helv) helv = await doc.embedFont(StandardFonts.Helvetica);
        return helv;
      };

      const imgCache: Record<string, PDFImage> = {};
      const embedImg = async (dataUrl: string, mime: string) => {
        if (imgCache[dataUrl]) return imgCache[dataUrl];
        const b64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const img = /jpe?g/i.test(mime) ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        imgCache[dataUrl] = img;
        return img;
      };

      for (const a of annos) {
        const page = pdfPages[a.page];
        if (!page) continue;
        const pH = page.getHeight();

        if (a.kind === "highlight") {
          const c = hexToRgb(a.color);
          page.drawRectangle({
            x: a.x,
            y: pH - a.y - a.h,
            width: a.w,
            height: a.h,
            color: rgb(c.r, c.g, c.b),
            opacity: 0.45,
            blendMode: BlendMode.Multiply,
          });
        } else if (a.kind === "text") {
          const font = await getFont(a.bold);
          const c = hexToRgb(a.color);
          const lines = a.text.split("\n");
          const lh = a.size * 1.2;
          for (let i = 0; i < lines.length; i++) {
            const yTop = a.y + i * lh;
            const baselineY = pH - yTop - a.size;
            page.drawText(lines[i], {
              x: a.x,
              y: baselineY,
              size: a.size,
              font,
              color: rgb(c.r, c.g, c.b),
            });
          }
        } else if (a.kind === "rect") {
          const s = hexToRgb(a.stroke);
          const fillColor = a.fill ? hexToRgb(a.fill) : null;
          page.drawRectangle({
            x: a.x,
            y: pH - a.y - a.h,
            width: a.w,
            height: a.h,
            borderColor: rgb(s.r, s.g, s.b),
            borderWidth: a.strokeWidth,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? a.fillOpacity : undefined,
          });
        } else if (a.kind === "ellipse") {
          const s = hexToRgb(a.stroke);
          const fillColor = a.fill ? hexToRgb(a.fill) : null;
          const cx = a.x + a.w / 2;
          const cy = a.y + a.h / 2;
          page.drawEllipse({
            x: cx,
            y: pH - cy,
            xScale: a.w / 2,
            yScale: a.h / 2,
            borderColor: rgb(s.r, s.g, s.b),
            borderWidth: a.strokeWidth,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? a.fillOpacity : undefined,
          });
        } else if (a.kind === "line" || a.kind === "arrow") {
          const c = hexToRgb(a.color);
          const col = rgb(c.r, c.g, c.b);
          page.drawLine({
            start: { x: a.x1, y: pH - a.y1 },
            end: { x: a.x2, y: pH - a.y2 },
            thickness: a.width,
            color: col,
            lineCap: LineCapStyle.Round,
          });
          if (a.kind === "arrow") {
            const dx = a.x2 - a.x1;
            const dy = a.y2 - a.y1;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const headLen = Math.max(8, a.width * 4);
            const headAng = Math.PI / 6;
            // rotate unit vector by ±headAng, then step back from tip
            const cosA = Math.cos(headAng);
            const sinA = Math.sin(headAng);
            const b1x = -ux * cosA - -uy * sinA;
            const b1y = -uy * cosA + -ux * sinA;
            const b2x = -ux * cosA - uy * sinA;
            const b2y = -uy * cosA - ux * sinA;
            const tipX = a.x2;
            const tipY = a.y2;
            page.drawLine({
              start: { x: tipX, y: pH - tipY },
              end: { x: tipX + b1x * headLen, y: pH - (tipY + b1y * headLen) },
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
            page.drawLine({
              start: { x: tipX, y: pH - tipY },
              end: { x: tipX + b2x * headLen, y: pH - (tipY + b2y * headLen) },
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
          }
        } else if (a.kind === "draw") {
          const c = hexToRgb(a.color);
          const col = rgb(c.r, c.g, c.b);
          for (let i = 1; i < a.points.length; i++) {
            const p0 = a.points[i - 1];
            const p1 = a.points[i];
            page.drawLine({
              start: { x: p0.x, y: pH - p0.y },
              end: { x: p1.x, y: pH - p1.y },
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
          }
        } else if (a.kind === "image") {
          const img = await embedImg(a.dataUrl, a.mime);
          page.drawImage(img, {
            x: a.x,
            y: pH - a.y - a.h,
            width: a.w,
            height: a.h,
          });
        }
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-edited.pdf` });
      toast.success("PDF edited");
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
        heading="Your PDF has been edited!"
        subheading={`${annos.length} annotation${annos.length === 1 ? "" : "s"} added.`}
        downloadLabel="Download Edited PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["edit-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  return (
    <>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImagePicked(f);
          e.target.value = "";
        }}
      />
      <ToolWorkspace
        title="Edit & Annotate PDF"
        actionLabel="Save Edited PDF"
        loadingLabel="Saving…"
        onAction={run}
        loading={loading}
        actionDisabled={!annos.length}
        sidebar={
          <Sidebar
            mode={mode}
            setMode={(m) => {
              setMode(m);
              setSelectedId(null);
              if (m === "image") openImagePicker();
              else setPendingImage(null);
            }}
            selected={selected}
            updateSelected={(patch) => {
              if (!selected) return;
              commitAnnos((prev) =>
                prev.map((a) => (a.id === selected.id ? ({ ...a, ...patch } as Anno) : a)),
              );
            }}
            removeSelected={() => {
              if (!selected) return;
              commitAnnos((prev) => prev.filter((a) => a.id !== selected.id));
              setSelectedId(null);
            }}
            hlColor={hlColor} setHlColor={setHlColor}
            txtSize={txtSize} setTxtSize={setTxtSize}
            txtColor={txtColor} setTxtColor={setTxtColor}
            txtBold={txtBold} setTxtBold={setTxtBold}
            shapeStroke={shapeStroke} setShapeStroke={setShapeStroke}
            shapeWidth={shapeWidth} setShapeWidth={setShapeWidth}
            shapeFill={shapeFill} setShapeFill={setShapeFill}
            shapeFillOpacity={shapeFillOpacity} setShapeFillOpacity={setShapeFillOpacity}
            lineColor={lineColor} setLineColor={setLineColor}
            lineWidth={lineWidth} setLineWidth={setLineWidth}
            drawColor={drawColor} setDrawColor={setDrawColor}
            drawWidth={drawWidth} setDrawWidth={setDrawWidth}
            pendingImage={pendingImage}
            reopenImage={openImagePicker}
            undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
            count={annos.length}
            onClearAll={clearAll}
          />
        }
      >
        <div className="space-y-4">
          {loadingPages && (
            <div
              className="grid h-64 place-items-center rounded-2xl bg-white text-sm text-muted-foreground"
              style={{ border: "1px solid #ececef" }}
            >
              Rendering pages…
            </div>
          )}
          {pages.map((page, i) => (
            <PageOverlay
              key={i}
              index={i}
              page={page}
              annos={annos.filter((a) => a.page === i)}
              selectedId={selectedId}
              mode={mode}
              onSelect={(id) => setSelectedId(id)}
              onCreate={(a) => {
                setAnnos((prev) => {
                  const next = [...prev, a];
                  pushHistory(next);
                  return next;
                });
                setSelectedId(a.id);
                // After creating with a shape tool, drop back to select for easy tweaking
                if (a.kind !== "draw" && a.kind !== "highlight") setMode("select");
              }}
              onUpdate={(a) => {
                setAnnos((prev) => prev.map((p) => (p.id === a.id ? a : p)));
              }}
              onCommitChange={() => {
                pushHistory([...annos]);
              }}
              onRemove={(id) => {
                commitAnnos((prev) => prev.filter((a) => a.id !== id));
                if (selectedId === id) setSelectedId(null);
              }}
              styleCtx={{
                hlColor,
                txtSize, txtColor, txtBold,
                shapeStroke, shapeWidth, shapeFill, shapeFillOpacity,
                lineColor, lineWidth,
                drawColor, drawWidth,
              }}
              pendingImage={pendingImage}
              consumePendingImage={() => setPendingImage(null)}
            />
          ))}
        </div>
      </ToolWorkspace>
    </>
  );
}

/* =============================== Sidebar =============================== */

interface StyleCtx {
  hlColor: string;
  txtSize: number; txtColor: string; txtBold: boolean;
  shapeStroke: string; shapeWidth: number; shapeFill: string | null; shapeFillOpacity: number;
  lineColor: string; lineWidth: number;
  drawColor: string; drawWidth: number;
}

interface SidebarProps extends StyleCtx {
  mode: ToolMode;
  setMode: (m: ToolMode) => void;
  selected: Anno | null;
  updateSelected: (patch: Partial<Anno>) => void;
  removeSelected: () => void;
  setHlColor: (v: string) => void;
  setTxtSize: (v: number) => void;
  setTxtColor: (v: string) => void;
  setTxtBold: (v: boolean) => void;
  setShapeStroke: (v: string) => void;
  setShapeWidth: (v: number) => void;
  setShapeFill: (v: string | null) => void;
  setShapeFillOpacity: (v: number) => void;
  setLineColor: (v: string) => void;
  setLineWidth: (v: number) => void;
  setDrawColor: (v: string) => void;
  setDrawWidth: (v: number) => void;
  pendingImage: { dataUrl: string; w: number; h: number } | null;
  reopenImage: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  count: number;
  onClearAll: () => void;
}

const TOOLS: { id: ToolMode; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "text", label: "Text", icon: TypeIcon },
  { id: "rect", label: "Rectangle", icon: Square },
  { id: "ellipse", label: "Ellipse", icon: CircleIcon },
  { id: "line", label: "Line", icon: Minus },
  { id: "arrow", label: "Arrow", icon: MoveRight },
  { id: "draw", label: "Freehand", icon: Pencil },
  { id: "image", label: "Image", icon: ImageIcon },
];

function Sidebar(p: SidebarProps) {
  return (
    <>
      {/* Tool picker */}
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
          Tools
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const active = p.mode === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => p.setMode(t.id)}
                title={t.label}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-semibold transition-colors",
                )}
                style={{
                  backgroundColor: active ? "#fdeceb" : "#f7f7f8",
                  color: active ? "#e5322d" : "#33333c",
                  border: active ? "1px solid #f0c9c7" : "1px solid transparent",
                }}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contextual options */}
      <ContextOptions {...p} />

      {/* Undo / Redo */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={p.undo}
          disabled={!p.canUndo}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors disabled:opacity-40"
          style={{ border: "1px solid #ececef", color: "#33333c" }}
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button
          type="button"
          onClick={p.redo}
          disabled={!p.canRedo}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors disabled:opacity-40"
          style={{ border: "1px solid #ececef", color: "#33333c" }}
        >
          <Redo2 className="h-3.5 w-3.5" /> Redo
        </button>
      </div>

      <InfoTip>
        {p.count
          ? `${p.count} annotation${p.count === 1 ? "" : "s"} on document. Use Select to move, resize, or delete.`
          : "Pick a tool and click or drag on a page to add annotations. All edits stay on top of the original PDF."}
      </InfoTip>

      {p.count > 0 && (
        <button
          type="button"
          onClick={p.onClearAll}
          className="flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#7a7a86] transition-colors hover:text-[#e5322d]"
        >
          <Trash2 className="h-3 w-3" /> Clear all
        </button>
      )}
    </>
  );
}

function ContextOptions(p: SidebarProps) {
  // If an element is selected, show controls for it. Otherwise show controls for the active tool (for new element defaults).
  const sel = p.selected;
  if (sel) {
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
            Selected: {sel.kind}
          </p>
          <button
            type="button"
            onClick={p.removeSelected}
            className="text-[12px] font-semibold text-[#7a7a86] hover:text-[#e5322d]"
          >
            Delete
          </button>
        </div>
        {sel.kind === "highlight" && (
          <ColorRow
            label="Color"
            colors={HIGHLIGHT_COLORS}
            value={sel.color}
            onChange={(v) => p.updateSelected({ color: v } as Partial<Anno>)}
          />
        )}
        {sel.kind === "text" && (
          <>
            <NumberRow label="Font size" value={sel.size} min={6} max={96}
              onChange={(v) => p.updateSelected({ size: v } as Partial<Anno>)} />
            <ColorRow label="Color" colors={STROKE_COLORS} value={sel.color}
              onChange={(v) => p.updateSelected({ color: v } as Partial<Anno>)} />
            <ToggleRow label="Bold" value={sel.bold}
              onChange={(v) => p.updateSelected({ bold: v } as Partial<Anno>)} />
          </>
        )}
        {(sel.kind === "rect" || sel.kind === "ellipse") && (
          <>
            <ColorRow label="Stroke" colors={STROKE_COLORS} value={sel.stroke}
              onChange={(v) => p.updateSelected({ stroke: v } as Partial<Anno>)} />
            <NumberRow label="Stroke width" value={sel.strokeWidth} min={1} max={12}
              onChange={(v) => p.updateSelected({ strokeWidth: v } as Partial<Anno>)} />
            <FillRow
              fill={sel.fill}
              opacity={sel.fillOpacity}
              onFillChange={(v) => p.updateSelected({ fill: v } as Partial<Anno>)}
              onOpacityChange={(v) => p.updateSelected({ fillOpacity: v } as Partial<Anno>)}
            />
          </>
        )}
        {(sel.kind === "line" || sel.kind === "arrow") && (
          <>
            <ColorRow label="Color" colors={STROKE_COLORS} value={sel.color}
              onChange={(v) => p.updateSelected({ color: v } as Partial<Anno>)} />
            <NumberRow label="Width" value={sel.width} min={1} max={12}
              onChange={(v) => p.updateSelected({ width: v } as Partial<Anno>)} />
          </>
        )}
        {sel.kind === "draw" && (
          <>
            <ColorRow label="Color" colors={STROKE_COLORS} value={sel.color}
              onChange={(v) => p.updateSelected({ color: v } as Partial<Anno>)} />
            <NumberRow label="Width" value={sel.width} min={1} max={12}
              onChange={(v) => p.updateSelected({ width: v } as Partial<Anno>)} />
          </>
        )}
        {sel.kind === "image" && (
          <p className="text-[12.5px]" style={{ color: "#7a7a86" }}>
            Drag to reposition. Use corner handles to resize.
          </p>
        )}
      </div>
    );
  }

  // No selection — show defaults for active tool
  const m = p.mode;
  if (m === "select") return null;
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
        {TOOLS.find((t) => t.id === m)?.label} options
      </p>
      {m === "highlight" && <ColorRow label="Color" colors={HIGHLIGHT_COLORS} value={p.hlColor} onChange={p.setHlColor} />}
      {m === "text" && (
        <>
          <NumberRow label="Font size" value={p.txtSize} min={6} max={96} onChange={p.setTxtSize} />
          <ColorRow label="Color" colors={STROKE_COLORS} value={p.txtColor} onChange={p.setTxtColor} />
          <ToggleRow label="Bold" value={p.txtBold} onChange={p.setTxtBold} />
        </>
      )}
      {(m === "rect" || m === "ellipse") && (
        <>
          <ColorRow label="Stroke" colors={STROKE_COLORS} value={p.shapeStroke} onChange={p.setShapeStroke} />
          <NumberRow label="Stroke width" value={p.shapeWidth} min={1} max={12} onChange={p.setShapeWidth} />
          <FillRow
            fill={p.shapeFill}
            opacity={p.shapeFillOpacity}
            onFillChange={p.setShapeFill}
            onOpacityChange={p.setShapeFillOpacity}
          />
        </>
      )}
      {(m === "line" || m === "arrow") && (
        <>
          <ColorRow label="Color" colors={STROKE_COLORS} value={p.lineColor} onChange={p.setLineColor} />
          <NumberRow label="Width" value={p.lineWidth} min={1} max={12} onChange={p.setLineWidth} />
        </>
      )}
      {m === "draw" && (
        <>
          <ColorRow label="Color" colors={STROKE_COLORS} value={p.drawColor} onChange={p.setDrawColor} />
          <NumberRow label="Width" value={p.drawWidth} min={1} max={12} onChange={p.setDrawWidth} />
        </>
      )}
      {m === "image" && (
        <div className="space-y-2">
          {p.pendingImage ? (
            <>
              <div className="rounded-lg p-2" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                <img src={p.pendingImage.dataUrl} alt="" className="mx-auto max-h-16" />
              </div>
              <p className="text-[12.5px]" style={{ color: "#7a7a86" }}>
                Click a page to place. Drag corners to resize.
              </p>
              <button
                type="button"
                onClick={p.reopenImage}
                className="w-full rounded-lg py-2 text-[12.5px] font-semibold"
                style={{ border: "1px solid #ececef", color: "#33333c" }}
              >
                Choose a different image
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={p.reopenImage}
              className="w-full rounded-lg py-3 text-[13px] font-semibold"
              style={{ border: "1px dashed #cfcfd6", color: "#33333c", backgroundColor: "#fafafb" }}
            >
              Choose an image
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ColorRow({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: { name: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[12px] font-semibold" style={{ color: "#33333c" }}>{label}</p>
      <div className="flex items-center gap-1.5">
        {colors.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            aria-label={c.name}
            className="h-7 w-7 rounded-full"
            style={{
              backgroundColor: c.value,
              outline: value === c.value ? "2px solid #33333c" : "none",
              outlineOffset: 2,
              border: "1px solid #ececef",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <p className="mb-1.5 text-[12px] font-semibold" style={{ color: "#33333c" }}>
        {label}: <span style={{ color: "#7a7a86" }}>{value}</span>
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[12px] font-semibold" style={{ color: "#33333c" }}>{label}</p>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="rounded-md px-3 py-1 text-[12px] font-bold"
        style={{
          backgroundColor: value ? "#33333c" : "#f7f7f8",
          color: value ? "#ffffff" : "#7a7a86",
        }}
      >
        {value ? "On" : "Off"}
      </button>
    </div>
  );
}

function FillRow({
  fill,
  opacity,
  onFillChange,
  onOpacityChange,
}: {
  fill: string | null;
  opacity: number;
  onFillChange: (v: string | null) => void;
  onOpacityChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[12px] font-semibold" style={{ color: "#33333c" }}>Fill</p>
        <button
          type="button"
          onClick={() => onFillChange(fill ? null : "#e5322d")}
          className="rounded-md px-2 py-0.5 text-[11px] font-bold"
          style={{
            backgroundColor: fill ? "#33333c" : "#f7f7f8",
            color: fill ? "#ffffff" : "#7a7a86",
          }}
        >
          {fill ? "On" : "Off"}
        </button>
      </div>
      {fill && (
        <>
          <div className="flex items-center gap-1.5">
            {STROKE_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onFillChange(c.value)}
                aria-label={c.name}
                className="h-6 w-6 rounded-full"
                style={{
                  backgroundColor: c.value,
                  outline: fill === c.value ? "2px solid #33333c" : "none",
                  outlineOffset: 2,
                  border: "1px solid #ececef",
                }}
              />
            ))}
          </div>
          <div className="mt-2">
            <p className="mb-1 text-[11.5px]" style={{ color: "#7a7a86" }}>
              Opacity: {Math.round(opacity * 100)}%
            </p>
            <input
              type="range"
              min={0.05}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </>
      )}
    </div>
  );
}

/* =============================== Page overlay =============================== */

interface PageOverlayProps {
  index: number;
  page: PageInfo;
  annos: Anno[];
  selectedId: string | null;
  mode: ToolMode;
  onSelect: (id: string | null) => void;
  onCreate: (a: Anno) => void;
  onUpdate: (a: Anno) => void;
  onCommitChange: () => void;
  onRemove: (id: string) => void;
  styleCtx: StyleCtx;
  pendingImage: { dataUrl: string; mime: string; w: number; h: number } | null;
  consumePendingImage: () => void;
}

function PageOverlay(props: PageOverlayProps) {
  const { index, page, annos, selectedId, mode, onSelect, onCreate, onUpdate, onCommitChange, onRemove } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const [draft, setDraft] = useState<Anno | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = displayW ? displayW / page.width : 0;
  const displayH = page.height * scale;

  // Convert screen event to page-relative point (PDF points)
  const eventToPoint = (e: React.PointerEvent): Pt | null => {
    const el = wrapRef.current;
    if (!el || !scale) return null;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return {
      x: Math.max(0, Math.min(page.width, x)),
      y: Math.max(0, Math.min(page.height, y)),
    };
  };

  const draftRef = useRef<Anno | null>(null);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const onPageDown = (e: React.PointerEvent) => {
    if (mode === "select") return;
    // Ignore clicks on existing annotation wrappers
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest("[data-anno-wrap]")) return;
    const p = eventToPoint(e);
    if (!p) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const s = props.styleCtx;

    if (mode === "text") {
      // Single click places a text box, then focuses it.
      const size = s.txtSize;
      const a: Anno = {
        id: uid(),
        page: index,
        kind: "text",
        x: p.x,
        y: p.y,
        w: 200,
        h: size * 1.5,
        text: "",
        size,
        color: s.txtColor,
        bold: s.txtBold,
      };
      onCreate(a);
      // Focus the new text via microtask
      setTimeout(() => {
        const el = wrapRef.current?.querySelector<HTMLElement>(`[data-anno="${a.id}"]`);
        el?.focus();
      }, 0);
      return;
    }
    if (mode === "image") {
      if (!props.pendingImage) return;
      const img = props.pendingImage;
      const maxW = Math.min(page.width * 0.4, 220);
      const aspect = img.h / img.w;
      const w = maxW;
      const h = w * aspect;
      const a: Anno = {
        id: uid(),
        page: index,
        kind: "image",
        x: Math.max(0, p.x - w / 2),
        y: Math.max(0, p.y - h / 2),
        w,
        h,
        dataUrl: img.dataUrl,
        mime: img.mime,
      };
      onCreate(a);
      props.consumePendingImage();
      return;
    }
    if (mode === "highlight") {
      setDraft({ id: "draft", page: index, kind: "highlight", x: p.x, y: p.y, w: 0, h: 0, color: s.hlColor });
      return;
    }
    if (mode === "rect" || mode === "ellipse") {
      setDraft({
        id: "draft",
        page: index,
        kind: mode,
        x: p.x,
        y: p.y,
        w: 0,
        h: 0,
        stroke: s.shapeStroke,
        strokeWidth: s.shapeWidth,
        fill: s.shapeFill,
        fillOpacity: s.shapeFillOpacity,
      });
      return;
    }
    if (mode === "line" || mode === "arrow") {
      setDraft({
        id: "draft",
        page: index,
        kind: mode,
        x1: p.x,
        y1: p.y,
        x2: p.x,
        y2: p.y,
        color: s.lineColor,
        width: s.lineWidth,
      });
      return;
    }
    if (mode === "draw") {
      setDraft({
        id: "draft",
        page: index,
        kind: "draw",
        points: [p],
        color: s.drawColor,
        width: s.drawWidth,
      });
      return;
    }
  };

  const onPageMove = (e: React.PointerEvent) => {
    const d = draftRef.current;
    if (!d) return;
    const p = eventToPoint(e);
    if (!p) return;
    if (d.kind === "highlight" || d.kind === "rect" || d.kind === "ellipse") {
      const x = Math.min(d.x, p.x);
      const y = Math.min(d.y, p.y);
      const w = Math.abs(p.x - d.x);
      const h = Math.abs(p.y - d.y);
      setDraft({ ...d, x, y, w, h } as Anno);
    } else if (d.kind === "line" || d.kind === "arrow") {
      setDraft({ ...d, x2: p.x, y2: p.y } as Anno);
    } else if (d.kind === "draw") {
      const last = d.points[d.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return;
      setDraft({ ...d, points: [...d.points, p] } as Anno);
    }
  };

  const onPageUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const d = draftRef.current;
    if (!d) return;
    setDraft(null);
    // Commit if meaningful size
    if (d.kind === "highlight" || d.kind === "rect" || d.kind === "ellipse") {
      if (d.w < 4 || d.h < 4) return;
      onCreate({ ...d, id: uid() } as Anno);
    } else if (d.kind === "line" || d.kind === "arrow") {
      if (Math.hypot(d.x2 - d.x1, d.y2 - d.y1) < 4) return;
      onCreate({ ...d, id: uid() } as Anno);
    } else if (d.kind === "draw") {
      if (d.points.length < 2) return;
      onCreate({ ...d, id: uid() } as Anno);
    }
  };

  const cursor =
    mode === "select"
      ? "default"
      : mode === "text"
      ? "text"
      : mode === "image"
      ? "copy"
      : "crosshair";

  return (
    <div className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
      <p className="mb-2 text-[12px] font-semibold" style={{ color: "#7a7a86" }}>
        Page {index + 1}
      </p>
      <div
        ref={wrapRef}
        className="relative mx-auto w-full select-none"
        style={{ height: displayH || undefined, touchAction: "none", cursor }}
        onPointerDown={onPageDown}
        onPointerMove={onPageMove}
        onPointerUp={onPageUp}
        onPointerCancel={onPageUp}
        onClick={(e) => {
          if (mode === "select" && !(e.target as HTMLElement).closest("[data-anno-wrap]")) {
            onSelect(null);
          }
        }}
      >
        <img
          src={page.url}
          alt={`Page ${index + 1}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          draggable={false}
        />
        {/* SVG layer for shape/line/freehand rendering */}
        {scale > 0 && (
          <svg
            className="pointer-events-none absolute inset-0"
            width={displayW}
            height={displayH}
            viewBox={`0 0 ${page.width} ${page.height}`}
            preserveAspectRatio="none"
          >
            {[...annos, ...(draft ? [draft] : [])].map((a) => renderSvg(a))}
          </svg>
        )}
        {/* HTML overlays for text/image + selection wrappers */}
        {scale > 0 &&
          annos.map((a) => (
            <AnnoWrap
              key={a.id}
              anno={a}
              scale={scale}
              pageW={page.width}
              pageH={page.height}
              selected={selectedId === a.id}
              interactive={mode === "select"}
              onSelect={() => onSelect(a.id)}
              onUpdate={onUpdate}
              onCommit={onCommitChange}
              onRemove={() => onRemove(a.id)}
            />
          ))}
      </div>
    </div>
  );
}

/* =============================== SVG rendering =============================== */

function renderSvg(a: Anno) {
  if (a.kind === "highlight") {
    return (
      <rect
        key={a.id}
        x={a.x}
        y={a.y}
        width={a.w}
        height={a.h}
        fill={a.color}
        opacity={0.5}
        style={{ mixBlendMode: "multiply" }}
      />
    );
  }
  if (a.kind === "rect") {
    return (
      <rect
        key={a.id}
        x={a.x}
        y={a.y}
        width={a.w}
        height={a.h}
        fill={a.fill ?? "none"}
        fillOpacity={a.fill ? a.fillOpacity : 0}
        stroke={a.stroke}
        strokeWidth={a.strokeWidth}
      />
    );
  }
  if (a.kind === "ellipse") {
    return (
      <ellipse
        key={a.id}
        cx={a.x + a.w / 2}
        cy={a.y + a.h / 2}
        rx={a.w / 2}
        ry={a.h / 2}
        fill={a.fill ?? "none"}
        fillOpacity={a.fill ? a.fillOpacity : 0}
        stroke={a.stroke}
        strokeWidth={a.strokeWidth}
      />
    );
  }
  if (a.kind === "line" || a.kind === "arrow") {
    const markerId = `arrow-${a.id}`;
    return (
      <g key={a.id}>
        {a.kind === "arrow" && (
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth={Math.max(4, a.width * 2)}
              markerHeight={Math.max(4, a.width * 2)}
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={a.color} />
            </marker>
          </defs>
        )}
        <line
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          stroke={a.color}
          strokeWidth={a.width}
          strokeLinecap="round"
          markerEnd={a.kind === "arrow" ? `url(#${markerId})` : undefined}
        />
      </g>
    );
  }
  if (a.kind === "draw") {
    const d = a.points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
    return (
      <path
        key={a.id}
        d={d}
        fill="none"
        stroke={a.color}
        strokeWidth={a.width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  return null;
}

/* =============================== HTML wrapper (text/image + selection) =============================== */

interface AnnoWrapProps {
  anno: Anno;
  scale: number;
  pageW: number;
  pageH: number;
  selected: boolean;
  interactive: boolean;
  onSelect: () => void;
  onUpdate: (a: Anno) => void;
  onCommit: () => void;
  onRemove: () => void;
}

function AnnoWrap(props: AnnoWrapProps) {
  const { anno, scale, pageW, pageH, selected, interactive, onSelect, onUpdate, onCommit, onRemove } = props;
  const b = bbox(anno);
  const dragRef = useRef<
    | {
        mode: "move" | "resize";
        corner?: "nw" | "ne" | "sw" | "se";
        startX: number;
        startY: number;
        start: Anno;
      }
    | null
  >(null);

  const shift = (a: Anno, dx: number, dy: number): Anno => {
    switch (a.kind) {
      case "line":
      case "arrow":
        return { ...a, x1: a.x1 + dx, y1: a.y1 + dy, x2: a.x2 + dx, y2: a.y2 + dy };
      case "draw":
        return { ...a, points: a.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
      default:
        return { ...a, x: a.x + dx, y: a.y + dy };
    }
  };

  const resize = (start: Anno, corner: "nw" | "ne" | "sw" | "se", dx: number, dy: number): Anno => {
    const b0 = bbox(start);
    let nx = b0.x,
      ny = b0.y,
      nw = b0.w,
      nh = b0.h;
    if (corner === "se") {
      nw = Math.max(6, b0.w + dx);
      nh = Math.max(6, b0.h + dy);
    } else if (corner === "sw") {
      nx = Math.min(b0.x + b0.w - 6, b0.x + dx);
      nw = b0.w - (nx - b0.x);
      nh = Math.max(6, b0.h + dy);
    } else if (corner === "ne") {
      ny = Math.min(b0.y + b0.h - 6, b0.y + dy);
      nh = b0.h - (ny - b0.y);
      nw = Math.max(6, b0.w + dx);
    } else if (corner === "nw") {
      nx = Math.min(b0.x + b0.w - 6, b0.x + dx);
      ny = Math.min(b0.y + b0.h - 6, b0.y + dy);
      nw = b0.w - (nx - b0.x);
      nh = b0.h - (ny - b0.y);
    }
    return scaleTo(start, nx, ny, nw, nh);
  };

  const scaleTo = (a: Anno, nx: number, ny: number, nw: number, nh: number): Anno => {
    const b0 = bbox(a);
    switch (a.kind) {
      case "line":
      case "arrow": {
        const map = (px: number, py: number) => ({
          x: nx + ((px - b0.x) / Math.max(1, b0.w)) * nw,
          y: ny + ((py - b0.y) / Math.max(1, b0.h)) * nh,
        });
        const p1 = map(a.x1, a.y1);
        const p2 = map(a.x2, a.y2);
        return { ...a, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
      }
      case "draw": {
        const sx = nw / Math.max(1, b0.w);
        const sy = nh / Math.max(1, b0.h);
        return { ...a, points: a.points.map((p) => ({ x: nx + (p.x - b0.x) * sx, y: ny + (p.y - b0.y) * sy })) };
      }
      default:
        return { ...a, x: nx, y: ny, w: nw, h: nh };
    }
  };

  const onDragPointerDown = (mode: "move" | "resize", corner?: "nw" | "ne" | "sw" | "se") =>
    (e: React.PointerEvent) => {
      if (!interactive) return;
      e.stopPropagation();
      e.preventDefault();
      onSelect();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { mode, corner, startX: e.clientX, startY: e.clientY, start: anno };
    };

  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / scale;
    const dy = (e.clientY - d.startY) / scale;
    if (d.mode === "move") {
      // clamp so bbox stays in page
      const b0 = bbox(d.start);
      const clampedDx = Math.max(-b0.x, Math.min(pageW - b0.x - b0.w, dx));
      const clampedDy = Math.max(-b0.y, Math.min(pageH - b0.y - b0.h, dy));
      onUpdate(shift(d.start, clampedDx, clampedDy));
    } else if (d.corner) {
      onUpdate(resize(d.start, d.corner, dx, dy));
    }
  };

  const onDragUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (dragRef.current) {
      dragRef.current = null;
      onCommit();
    }
  };

  const showHandles = selected && interactive;

  // Wrapper positioning (screen px). Use bbox in points × scale.
  const wrapStyle: React.CSSProperties = {
    position: "absolute",
    left: b.x * scale,
    top: b.y * scale,
    width: b.w * scale,
    height: b.h * scale,
  };

  // Text / image get an actual visible interior; shapes/lines/freehand are only wrapped for selection.
  const isVisibleContent = anno.kind === "text" || anno.kind === "image";

  return (
    <div
      data-anno-wrap
      style={wrapStyle}
      className={cn(interactive ? "cursor-move" : "pointer-events-none")}
      onPointerDown={onDragPointerDown("move")}
      onPointerMove={onDragMove}
      onPointerUp={onDragUp}
      onPointerCancel={onDragUp}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Interior content */}
      {anno.kind === "text" && (
        <TextEditor
          anno={anno}
          scale={scale}
          onChangeText={(t) => onUpdate({ ...anno, text: t })}
          onBlur={onCommit}
        />
      )}
      {anno.kind === "image" && (
        <img
          src={anno.dataUrl}
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      )}
      {/* Selection outline */}
      {selected && interactive && (
        <div
          className="pointer-events-none absolute inset-0 rounded-sm"
          style={{ border: "1.5px dashed #e5322d", backgroundColor: isVisibleContent ? "transparent" : "rgba(229,50,45,0.04)" }}
        />
      )}
      {/* Delete button */}
      {selected && interactive && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-[#e5322d] shadow"
          style={{ border: "1px solid #ececef" }}
          aria-label="Delete annotation"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {/* Corner handles */}
      {showHandles &&
        (["nw", "ne", "sw", "se"] as const).map((corner) => (
          <div
            key={corner}
            onPointerDown={onDragPointerDown("resize", corner)}
            onPointerMove={onDragMove}
            onPointerUp={onDragUp}
            onPointerCancel={onDragUp}
            className="absolute h-3 w-3 rounded-full bg-[#e5322d]"
            style={{
              border: "2px solid #ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              left: corner.includes("w") ? -6 : undefined,
              right: corner.includes("e") ? -6 : undefined,
              top: corner.startsWith("n") ? -6 : undefined,
              bottom: corner.startsWith("s") ? -6 : undefined,
              cursor:
                corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
            }}
          />
        ))}
    </div>
  );
}

function TextEditor({
  anno,
  scale,
  onChangeText,
  onBlur,
}: {
  anno: Extract<Anno, { kind: "text" }>;
  scale: number;
  onChangeText: (t: string) => void;
  onBlur: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Only reset innerText when the underlying anno.text truly changes from outside (undo, style update).
  useEffect(() => {
    if (ref.current && ref.current.innerText !== anno.text) {
      ref.current.innerText = anno.text;
    }
  }, [anno.text]);
  return (
    <div
      ref={ref}
      data-anno={anno.id}
      contentEditable
      suppressContentEditableWarning
      onPointerDown={(e) => e.stopPropagation()}
      onInput={(e) => onChangeText((e.target as HTMLDivElement).innerText)}
      onBlur={onBlur}
      className="absolute inset-0 outline-none"
      style={{
        fontSize: anno.size * scale,
        color: anno.color,
        fontWeight: anno.bold ? 700 : 400,
        lineHeight: 1.2,
        fontFamily: "Helvetica, Arial, sans-serif",
        whiteSpace: "pre-wrap",
        padding: 0,
        cursor: "text",
      }}
    >
      {anno.text}
    </div>
  );
}

/* =============================== helpers =============================== */

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}
function getImageSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = rej;
    img.src = dataUrl;
  });
}
