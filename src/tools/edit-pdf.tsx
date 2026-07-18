import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  StandardFonts,
  rgb,
  degrees,
  BlendMode,
  LineCapStyle,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
  type PDFFont,
  type PDFImage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
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
import { classifyPdfFont, type FontFamily, type TwinFamily } from "@/lib/fontMatch";
import { extractEditableLines, type EditableLine } from "@/lib/pdfTextLayer";
import { sampleBackgroundAndTextColor, findCellRulings, rgbToHex, hexToRgb255 } from "@/lib/canvasSample";

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
  /** Base PostScript font name (subset prefix stripped). Used to pick a metric-compatible twin at export time. */
  fontName?: string;
  /** Metric-compatible open twin (Phase A). */
  twin?: TwinFamily;
  /**
   * Per-side cover-rect insets in PDF units. Non-zero values mean the
   * sampler detected a rule/table border at that edge of the line box and
   * we should shrink the cover rectangle so it doesn't paint over it.
   */
  edgeInsets?: { top: number; bottom: number; left: number; right: number };
  /** true when background sampling was noisy (busy bg / table shading) OR text is too tight after auto-shrink. */
  lowConfidence?: boolean;
  /** horizontal alignment within its cell (detected from ruling positions). */
  align?: "left" | "center" | "right";
  /** cell bounds in PDF units (top-origin), if rulings were detected on both sides. */
  cellLeft?: number;
  cellRight?: number;
  /**
   * When true, the cover rectangle is NOT drawn on export - the area was
   * too busy/multi-colored to safely mask. The replacement text is drawn
   * on top of the original ink. Flagged low-confidence + toasted on save.
   */
  skipCover?: boolean;
}

interface PageInfo {
  url: string;
  /** Display-space dimensions (rotation applied). All UI + edit + sample
   *  coordinates live in this space. Fix B-2 #2. */
  width: number;
  height: number;
  /** Unrotated PDF-content-stream dimensions, used only at export time
   *  by dispToPdf / dispRectToPdf to convert display coords back into
   *  the true content coordinate system. Fix B-2 #2. */
  pdfWidth: number;
  pdfHeight: number;
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

/* =========== script / encoding helpers (Fix Batch A - Task 1) =========== */

/**
 * Scripts that require complex text shaping (matras, ligatures, joining
 * forms) that pdf-lib+fontkit cannot render correctly. Editing text in
 * these scripts is blocked at commit time — the original run stays intact
 * on export.
 */
const COMPLEX_SCRIPT_RE =
  /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u1780-\u17FF]/;

function hasComplexScript(s: string): boolean {
  return COMPLEX_SCRIPT_RE.test(s);
}

/**
 * WinAnsi covers the standard-14 fonts. When every char is WinAnsi we can
 * keep StandardFonts (Helvetica/Times/Courier) for exact visual fidelity;
 * anything outside falls through to an embedded Noto TTF via fontkit.
 */
function isWinAnsiOnly(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c === 0x09 || c === 0x0A || c === 0x0D) continue;
    if (c >= 0x20 && c <= 0x7E) continue;
    if (c >= 0xA0 && c <= 0xFF) continue;
    return false;
  }
  return true;
}

/* ============ rotation helpers (Fix B-2 #2: /Rotate page support) ============ */

/**
 * Normalise a raw /Rotate value to one of {0, 90, 180, 270}.
 */
function normRot(n: number): number {
  const r = ((Math.round(n) % 360) + 360) % 360;
  return r === 90 || r === 180 || r === 270 ? r : 0;
}

/**
 * Map a display-space point (top-origin, in the rotated preview) back to
 * the page's UNROTATED PDF coordinate system (bottom-origin). Used to
 * position drawText anchors and drawImage anchors on export; combined
 * with `rotate: degrees(R)` on those calls the drawn content appears
 * upright once the viewer applies the page's /Rotate.
 *
 * Verified per corner for R ∈ {0, 90, 180, 270}.
 */
function dispToPdf(
  dx: number,
  dyTop: number,
  rot: number,
  Wu: number,
  Hu: number,
): { x: number; y: number } {
  switch (normRot(rot)) {
    case 90:  return { x: dyTop,          y: dx };
    case 180: return { x: Wu - dx,        y: dyTop };
    case 270: return { x: Wu - dyTop,     y: Hu - dx };
    default:  return { x: dx,             y: Hu - dyTop };
  }
}

/**
 * Map a display-space axis-aligned rectangle (top-origin) to the page's
 * UNROTATED PDF coordinate system, returning an axis-aligned rectangle
 * that covers the SAME visual region after the viewer applies /Rotate R.
 * Because the mapping is a rotation-only isometry, an axis-aligned
 * display rect always maps to an axis-aligned unrotated rect — so we can
 * draw cover / clip rectangles WITHOUT passing `rotate` to pdf-lib.
 */
function dispRectToPdf(
  dx: number,
  dyTop: number,
  dw: number,
  dh: number,
  rot: number,
  Wu: number,
  Hu: number,
): { x: number; y: number; width: number; height: number } {
  switch (normRot(rot)) {
    case 90:  return { x: dyTop,              y: dx,              width: dh, height: dw };
    case 180: return { x: Wu - dx - dw,       y: dyTop,           width: dw, height: dh };
    case 270: return { x: Wu - dyTop - dh,    y: Hu - dx - dw,    width: dh, height: dw };
    default:  return { x: dx,                 y: Hu - dyTop - dh, width: dw, height: dh };
  }
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
  // Fix B-2 #26: bumped on every new file load. Any in-flight render /
  // extraction that captured an older token discards its result instead
  // of writing it into the new file's refs.
  const loadGenRef = useRef(0);
  const pageCanvasesRef = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderingRef = useRef<Set<number>>(new Set());
  const linesByPageRef = useRef<Map<number, EditableLine[]>>(new Map());
  const [linesTick, setLinesTick] = useState(0);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(() => new Set());
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
    // Fix B-2 #1: cap history at 50 (was 100). Each snapshot deep-copies
    // both the annos and edits arrays; on heavy edits this doubles the
    // per-edit heap cost, so a smaller cap keeps memory bounded.
    if (arr.length > 50) arr.shift();
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

  // ---- Fix B1: per-page render/evict. On file load we set up all page
  // slots with empty urls, eager-render only the first few, then let the
  // visibility observer + eviction effect drive the rest. Total retained
  // canvases stays bounded at ~5 (visible ± 2) regardless of doc length.
  const renderPage = useCallback(async (pageIdx: number): Promise<void> => {
    const doc = pdfjsDocRef.current;
    if (!doc) return;
    // If we already have a canvas for this page, make sure pages state
    // has its url (may have been cleared by a prior eviction pass that
    // raced with a visibility update — the "stuck on Loading page N…"
    // symptom). Then bail out; no need to re-render.
    const existing = pageCanvasesRef.current.get(pageIdx);
    if (existing) {
      const url = existing.toDataURL("image/jpeg", 0.85);
      setPages((prev) => {
        if (!prev[pageIdx] || prev[pageIdx].url === url) return prev;
        const copy = prev.slice();
        copy[pageIdx] = { ...copy[pageIdx], url };
        return copy;
      });
      return;
    }
    if (renderingRef.current.has(pageIdx)) return;
    // Fix B-2 #26: capture generation now; discard the render if a new
    // file has been loaded before this render completes.
    const gen = loadGenRef.current;
    renderingRef.current.add(pageIdx);
    try {
      const page = await doc.getPage(pageIdx + 1);
      if (loadGenRef.current !== gen) return;
      // Fix B-2 #2: render preview in DISPLAY orientation so what the
      // user sees matches the geometry used for edits + sampling.
      const rotation = (page as unknown as { rotate: number }).rotate ?? 0;
      const vp1 = page.getViewport({ scale: 1, rotation });
      const scale = Math.min(2, 800 / vp1.width);
      const vp = page.getViewport({ scale, rotation });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
      if (loadGenRef.current !== gen) return;
      pageCanvasesRef.current.set(pageIdx, canvas);
      const url = canvas.toDataURL("image/jpeg", 0.85);
      setPages((prev) => {
        if (!prev[pageIdx] || prev[pageIdx].url === url) return prev;
        const copy = prev.slice();
        copy[pageIdx] = { ...copy[pageIdx], url };
        return copy;
      });
    } catch {
      /* ignore render failures for evicted pages */
    } finally {
      renderingRef.current.delete(pageIdx);
    }
  }, []);

  // load pages
  useEffect(() => {
    let cancelled = false;
    // Fix B-2 #26: bump the load-generation token so any in-flight
    // render / extraction from the previous file (a) sees a stale gen
    // and (b) discards its result instead of leaking into new refs.
    loadGenRef.current += 1;
    const gen = loadGenRef.current;
    setPages([]);
    setAnnos([]);
    setEdits([]);
    setSelectedId(null);
    setActiveEditLineId(null);
    setHasAnyText(null);
    // Fix flicker: seed visible pages with the eager set so the eviction
    // pass on first paint cannot drop pages 0..EAGER-1 before the
    // IntersectionObserver reports them.
    setVisiblePages(new Set());
    pdfjsDocRef.current = null;
    pageCanvasesRef.current = new Map();
    renderingRef.current = new Set();
    linesByPageRef.current = new Map();
    historyRef.current = [{ annos: [], edits: [] }];
    historyIdxRef.current = 0;
    setHistoryTick((t) => t + 1);
    if (!file) return;
    setLoadingPages(true);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (cancelled || loadGenRef.current !== gen) return;
        pdfjsDocRef.current = doc;
        const out: PageInfo[] = [];
        const maxW = 800;
        // Eager-render only the first few pages so the viewer feels
        // instant; every other page starts with url="" and is rendered on
        // demand as it scrolls into view (Fix B1 memory cap).
        // Fix B-2 #2: preview + extraction operate in DISPLAY (rotated)
        // space; we also stash pdfWidth/pdfHeight (unrotated) so the
        // export can convert display coords back to content-stream space.
        const EAGER = Math.min(3, doc.numPages);
        const eagerSet = new Set<number>();
        for (let i = 0; i < EAGER; i++) eagerSet.add(i);
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          if (cancelled || loadGenRef.current !== gen) return;
          const rotation = (page as unknown as { rotate: number }).rotate ?? 0;
          const vpU = page.getViewport({ scale: 1, rotation: 0 });
          const vp1 = page.getViewport({ scale: 1, rotation });
          out.push({
            url: "",
            width: vp1.width,
            height: vp1.height,
            pdfWidth: vpU.width,
            pdfHeight: vpU.height,
            rotation,
          });
        }
        if (cancelled || loadGenRef.current !== gen) return;
        setPages(out);
        setVisiblePages(eagerSet);
        // Explicitly kick off eager renders. The render+eviction effect
        // will also try, but we don't want to wait a full render cycle
        // for the seeded-visible pages to appear.
        for (const i of eagerSet) void renderPage(i);
        // Await the first eager page so the "any extractable text" probe
        // below has a canvas to sample. Sequentially await eager renders
        // — they're bounded (<=3) and small.
        for (const i of eagerSet) {
          // renderPage is idempotent; awaiting a re-entry is a no-op.
          // eslint-disable-next-line no-await-in-loop
          await renderPage(i);
          if (cancelled || loadGenRef.current !== gen) return;
        }
        // Probe first few pages for any extractable text — used for the
        // "looks like a scanned PDF" callout. Only the pre-rendered pages
        // have canvases at this point, which is fine — the probe stays
        // bounded to EAGER pages.
        const probe = Math.min(3, doc.numPages);
        let total = 0;
        for (let i = 1; i <= probe; i++) {
          const c = pageCanvasesRef.current.get(i - 1);
          const p = await doc.getPage(i);
          if (cancelled || loadGenRef.current !== gen) return;
          const rot = (p as unknown as { rotate: number }).rotate ?? 0;
          const pv = p.getViewport({ scale: 1, rotation: rot });
          const rc = c ? { canvas: c, scale: c.width / pv.width } : null;
          const lines = await extractEditableLines(doc, i, rc);
          if (cancelled || loadGenRef.current !== gen) return;
          linesByPageRef.current.set(i - 1, lines);
          total += lines.reduce((n, l) => n + l.text.length, 0);
        }
        if (!cancelled && loadGenRef.current === gen) {
          setHasAnyText(total > 0);
          setLinesTick((t) => t + 1);
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

  // ---- Fix B1: canvas eviction. Retain only visible pages ± 2 buffer,
  // hard cap at 5. Everything else releases its HTMLCanvasElement AND the
  // JPEG dataURL. Re-renders on scroll back into view.
  const pagesLen = pages.length;
  const setPageVisibility = useCallback((idx: number, visible: boolean) => {
    setVisiblePages((prev) => {
      const has = prev.has(idx);
      if (visible === has) return prev;
      const next = new Set(prev);
      if (visible) next.add(idx);
      else next.delete(idx);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!pagesLen) return;
    const RETAIN_CAP = 5;
    const BUFFER = 2;
    // Debounce to a single animation frame so rapid IO ticks (or the
    // observer firing repeatedly during layout) coalesce into one pass.
    // Prevents the eviction ↔ visibility feedback loop that flickered
    // pages on upload (audit #11).
    const raf = requestAnimationFrame(() => {
      const keep = new Set<number>();
      for (const v of visiblePages) {
        for (let i = v - BUFFER; i <= v + BUFFER; i++) {
          if (i >= 0 && i < pagesLen) keep.add(i);
        }
      }
      if (keep.size > RETAIN_CAP && visiblePages.size) {
        const centers = [...visiblePages];
        const nearest = (i: number) => Math.min(...centers.map((c) => Math.abs(c - i)));
        const sorted = [...keep].sort((a, b) => nearest(a) - nearest(b));
        keep.clear();
        for (const i of sorted.slice(0, RETAIN_CAP)) keep.add(i);
      }
      // Never evict a currently-visible page — belt-and-braces on top of
      // the buffer, in case RETAIN_CAP is smaller than visiblePages.size.
      for (const v of visiblePages) keep.add(v);

      // Evict canvases + drop their JPEG urls. Skip entirely when nothing
      // is out of keep — no setState → no re-render → no observer thrash.
      const toEvict: number[] = [];
      for (const idx of pageCanvasesRef.current.keys()) {
        if (!keep.has(idx)) toEvict.push(idx);
      }
      if (toEvict.length) {
        for (const idx of toEvict) pageCanvasesRef.current.delete(idx);
        setPages((prev) => {
          let changed = false;
          const copy = prev.slice();
          for (const idx of toEvict) {
            if (copy[idx] && copy[idx].url) {
              copy[idx] = { ...copy[idx], url: "" };
              changed = true;
            }
          }
          return changed ? copy : prev;
        });
      }
      // Silently evict extracted lines for far pages. NO linesTick bump:
      // those pages aren't mounted, so nothing needs to re-render. When a
      // page next scrolls into view, ensureLinesForPage will re-populate
      // and bump linesTick then. This breaks the feedback loop.
      for (const idx of Array.from(linesByPageRef.current.keys())) {
        if (!keep.has(idx)) linesByPageRef.current.delete(idx);
      }
      // Render anything in `keep` we don't have. renderPage self-guards
      // against re-rendering an already-cached page in the same tick.
      keep.forEach((i) => {
        if (!pageCanvasesRef.current.has(i)) void renderPage(i);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [visiblePages, pagesLen, renderPage]);

  // Lazy line extraction for a specific page (called from PageOverlay when
  // it becomes visible). Idempotent.
  const ensureLinesForPage = useCallback(async (pageIdx: number) => {
    if (linesByPageRef.current.has(pageIdx)) return;
    const doc = pdfjsDocRef.current;
    if (!doc) return;
    // Fix B-2 #26: gen check so a stale in-flight extraction from a
    // previous file doesn't leak lines into the new file's ref.
    const gen = loadGenRef.current;
    try {
      const c = pageCanvasesRef.current.get(pageIdx);
      const p = await doc.getPage(pageIdx + 1);
      if (loadGenRef.current !== gen) return;
      // Fix B-2 #2: viewport at page.rotate matches the display canvas
      // dimensions, so ruling-canvas scale (canvas.width / pv.width) is
      // correct regardless of page rotation.
      const rot = (p as unknown as { rotate: number }).rotate ?? 0;
      const pv = p.getViewport({ scale: 1, rotation: rot });
      const rc = c ? { canvas: c, scale: c.width / pv.width } : null;
      const lines = await extractEditableLines(doc, pageIdx + 1, rc);
      if (loadGenRef.current !== gen) return;
      linesByPageRef.current.set(pageIdx, lines);
      setLinesTick((t) => t + 1);
    } catch {
      if (loadGenRef.current === gen) linesByPageRef.current.set(pageIdx, []);
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
    setEdits([]);
    setSelectedId(null);
    setActiveEditLineId(null);
    setMode("select");
    setEditMode("edit-text");
    // Fix B-2 #26: bump generation so any in-flight render/extraction
    // from the previous file is discarded on completion.
    loadGenRef.current += 1;
    pdfjsDocRef.current = null;
    pageCanvasesRef.current = new Map();
    renderingRef.current = new Set();
    linesByPageRef.current = new Map();
    setVisiblePages(new Set());
    historyRef.current = [{ annos: [], edits: [] }];
    historyIdxRef.current = 0;
    setResult(null);
    setPendingImage(null);
  };

  const clearAll = () => {
    if (!annos.length && !edits.length) return;
    if (!confirm("Remove all annotations and text edits?")) return;
    setAnnos([]);
    setEdits([]);
    pushHistorySnap({ annos: [], edits: [] });
    setSelectedId(null);
    setActiveEditLineId(null);
  };

  /* =========== export =========== */

  const run = async () => {
    if (!file || (!annos.length && !edits.length)) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      doc.registerFontkit(fontkit);
      const pdfPages = doc.getPages();

      // Font cache — Helvetica pair for annotations, plus per-classification
      // caches for text-edit lines (standard-14 for WinAnsi text, Noto TTF
      // for extended characters).
      const fontCache = new Map<string, PDFFont>();
      const getStdFont = async (name: (typeof StandardFonts)[keyof typeof StandardFonts]) => {
        const key = "std:" + String(name);
        let f = fontCache.get(key);
        if (!f) {
          f = await doc.embedFont(name);
          fontCache.set(key, f);
        }
        return f;
      };
      const getFont = async (bold: boolean) =>
        getStdFont(bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);

      // Twin font cache. Fonts are fetched from /fonts ON DEMAND (only the
      // faces an edit actually needs) and embedded subset:true so exported
      // PDFs stay small and same-origin (privacy: no third-party CDN).
      const twinBytesCache = new Map<string, Uint8Array>();
      const twinFileName = (twin: TwinFamily): string => {
        switch (twin) {
          case "arimo": return "Arimo";
          case "tinos": return "Tinos";
          case "cousine": return "Cousine";
          case "carlito": return "Carlito";
          case "caladea": return "Caladea";
          case "notoserif": return "NotoSerif";
          case "notosans":
          default: return "NotoSans";
        }
      };
      const getTwinFont = async (twin: TwinFamily, bold: boolean, italic: boolean): Promise<PDFFont> => {
        const style = bold && italic ? "BoldItalic" : bold ? "Bold" : italic ? "Italic" : "Regular";
        const face = `${twinFileName(twin)}-${style}`;
        const key = "twin:" + face;
        let f = fontCache.get(key);
        if (f) return f;
        let bytes = twinBytesCache.get(face);
        if (!bytes) {
          const res = await fetch(`/fonts/${face}.ttf`);
          if (!res.ok) throw new Error(`font ${face}`);
          bytes = new Uint8Array(await res.arrayBuffer());
          twinBytesCache.set(face, bytes);
        }
        f = await doc.embedFont(bytes, { subset: true });
        fontCache.set(key, f);
        return f;
      };
      const getNotoFallback = (family: FontFamily, bold: boolean, italic: boolean) =>
        getTwinFont(family === "serif" ? "notoserif" : "notosans", bold, italic);

      const imgCache: Record<string, PDFImage> = {};
      const embedImg = async (dataUrl: string, mime: string) => {
        if (imgCache[dataUrl]) return imgCache[dataUrl];
        const b64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const img = /jpe?g/i.test(mime) ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
        imgCache[dataUrl] = img;
        return img;
      };

      // ---- Two-pass text-edit render (Fix Batch A - Task 2).
      // Pass 1: paint EVERY cover rectangle. Pass 2: draw EVERY replacement
      // string. This guarantees a later edit's cover rect never paints over
      // an earlier edit's replacement text, so descenders on chained /
      // adjacent edits are never clipped.
      //
      // Fix B-2 #2: edit coordinates are DISPLAY-space (rotation applied).
      // Convert every rect / anchor to the page's UNROTATED content
      // coordinate system via dispRectToPdf / dispToPdf, and draw text
      // with rotate: degrees(R) so it appears upright once the viewer
      // reapplies /Rotate R.

      interface DrawPlan {
        te: TextEdit;
        pageIndex: number;
        R: number;
        Wu: number;
        Hu: number;
        font: PDFFont;
        safeText: string;
        drawX: number;
        drawSize: number;
        color: { r: number; g: number; b: number };
        unencodable: number;
        skipCover: boolean;   // complex-script or empty commit — leave original
        overflow: boolean;    // Fix B3: still doesn't fit at 0.7× — clip
        boxLeft: number;
        boxRight: number;
      }

      const plans: DrawPlan[] = [];
      let totalUnencodable = 0;
      let editsWithUnencodable = 0;

      for (const te of edits) {
        const page = pdfPages[te.page];
        if (!page) continue;
        const R = normRot(page.getRotation().angle);
        const Wu = page.getWidth();
        const Hu = page.getHeight();

        // Complex-script guard: never touch the original run. The commit
        // block in the editor already prevents new complex-script edits,
        // but legacy edits from an older session may still exist — skip
        // them entirely so the source text is preserved verbatim.
        if (hasComplexScript(te.newText)) {
          plans.push({
            te, pageIndex: te.page, R, Wu, Hu,
            font: (await getFont(false)), safeText: "", drawX: 0, drawSize: 0,
            color: { r: 0, g: 0, b: 0 }, unencodable: 0, skipCover: true,
            overflow: false, boxLeft: te.x, boxRight: te.x + te.width,
          });
          continue;
        }

        // Font decision chain (Phase A - Tier 2 twin mapping):
        //   1. Resolve the metric-compatible twin from the run's REAL
        //      PostScript name (te.twin was set at edit-commit time; older
        //      edits without it fall back to classifying te.fontName, then
        //      finally to the coarse family).
        //   2. Try that twin first.
        //   3. If the twin can't encode every char, fall back to Noto
        //      Sans/Serif (broader Unicode).
        //   4. If both fail (asset fetch error), fall back to Standard-14
        //      Helvetica; missed chars are counted as unencodable and
        //      surfaced via the amber marker + toast.
        const resolvedTwin: TwinFamily =
          te.twin
          ?? classifyPdfFont(te.fontName ?? "", { bold: te.bold, italic: te.italic }).twin
          ?? (te.family === "serif" ? "tinos" : te.family === "mono" ? "cousine" : "arimo");

        let font: PDFFont;
        try {
          font = await getTwinFont(resolvedTwin, te.bold, te.italic);
        } catch {
          try {
            font = await getNotoFallback(te.family, te.bold, te.italic);
          } catch {
            font = await getStdFont(StandardFonts.Helvetica);
          }
        }

        // Encode-check char by char. Unencodable code points are replaced
        // with "?" AND counted, so the caller sees an amber dot + a toast
        // — never a silent corruption.
        let safeText: string;
        let unencodable = 0;
        const encodeCheck = (f: PDFFont): { text: string; missed: number } => {
          try {
            f.widthOfTextAtSize(te.newText, te.fontSize);
            return { text: te.newText, missed: 0 };
          } catch {
            let rebuilt = ""; let missed = 0;
            for (const ch of te.newText) {
              try { f.widthOfTextAtSize(ch, te.fontSize); rebuilt += ch; }
              catch { rebuilt += "?"; missed++; }
            }
            return { text: rebuilt, missed };
          }
        };
        let enc = encodeCheck(font);
        // If the chosen twin can't encode every char, retry once with the
        // broader Noto fallback (spec step 3). Adopt it if it does strictly
        // better; otherwise keep the twin result for visual fidelity.
        if (enc.missed > 0) {
          try {
            const noto = await getNotoFallback(te.family, te.bold, te.italic);
            const encNoto = encodeCheck(noto);
            if (encNoto.missed < enc.missed) {
              font = noto;
              enc = encNoto;
            }
          } catch { /* fallback unavailable */ }
        }
        safeText = enc.text;
        unencodable = enc.missed;
        if (unencodable > 0) {
          totalUnencodable += unencodable;
          editsWithUnencodable++;
        }

        const fg = hexToRgb255(te.color);
        const boxLeft = te.cellLeft ?? te.x;
        const boxRight = te.cellRight ?? te.x + te.width;
        const boxWidth = Math.max(1, boxRight - boxLeft);

        let drawSize = te.fontSize;
        const minSize = te.fontSize * 0.7;
        let textW = 0;
        try { textW = font.widthOfTextAtSize(safeText, drawSize); } catch { textW = 0; }
        if (textW > boxWidth && textW > 0) {
          drawSize = Math.max(minSize, drawSize * (boxWidth / textW));
          try { textW = font.widthOfTextAtSize(safeText, drawSize); } catch { /* keep */ }
        }

        const align = te.align ?? "left";
        let drawX = te.x;
        if (align === "center") drawX = boxLeft + (boxWidth - textW) / 2;
        else if (align === "right") drawX = boxRight - textW;

        // Fix B3: after the shrink-to-0.7 floor, if text STILL overflows
        // the cell, mark it so Pass 2 clips the draw to the box width and
        // the export can surface a review toast.
        const overflow = textW > boxWidth + 0.5;

        plans.push({
          te, pageIndex: te.page, R, Wu, Hu, font, safeText, drawX, drawSize,
          color: fg, unencodable, skipCover: false,
          overflow, boxLeft, boxRight,
        });
      }

      // Pass 1: every cover rectangle (axis-aligned in unrotated space,
      // computed from the display rect via dispRectToPdf).
      let skippedCoverCount = 0;
      for (const p of plans) {
        if (p.skipCover) continue;
        // Fix Batch A.1 - Fix 3: skip the opaque erase when the sampler
        // marked the area as busy / multi-color. Painting a solid rect here
        // would erase content the user didn't intend to remove.
        if (p.te.skipCover) {
          skippedCoverCount++;
          continue;
        }
        const page = pdfPages[p.pageIndex];
        if (!page) continue;
        const te = p.te;
        const bg = hexToRgb255(te.bgColor);
        const pad = 1;
        const ins = te.edgeInsets ?? { top: 0, bottom: 0, left: 0, right: 0 };
        const padTop = Math.max(0, pad - ins.top);
        const padBot = Math.max(0, pad - ins.bottom);
        const padLef = Math.max(0, pad - ins.left);
        const padRig = Math.max(0, pad - ins.right);

        const rectLefDisp = te.x - padLef;
        const rectTopDisp = te.y - padTop;
        const rectWDisp = Math.max(0, te.width + padLef + padRig);
        const rectHDisp = Math.max(0, te.height + padTop + padBot);
        if (rectWDisp > 0 && rectHDisp > 0) {
          const r = dispRectToPdf(rectLefDisp, rectTopDisp, rectWDisp, rectHDisp, p.R, p.Wu, p.Hu);
          page.drawRectangle({
            x: r.x, y: r.y, width: r.width, height: r.height,
            color: rgb(bg.r / 255, bg.g / 255, bg.b / 255),
          });
        }
      }
      if (skippedCoverCount > 0) {
        toast.warning(
          `Couldn't safely mask the old text on ${skippedCoverCount} edit${skippedCoverCount === 1 ? "" : "s"} - please review the exported PDF.`,
        );
      }

      // Pass 2: every replacement string. Clip rect (when overflow) and
      // text anchor are both converted from display space to the page's
      // unrotated PDF space; text is drawn with rotate: degrees(R) so it
      // appears upright once the viewer reapplies /Rotate R.
      let overflowCount = 0;
      for (const p of plans) {
        if (p.skipCover) continue;
        const page = pdfPages[p.pageIndex];
        if (!page) continue;
        const boxW = Math.max(1, p.boxRight - p.boxLeft);
        const doClip = p.overflow;
        if (doClip) {
          overflowCount++;
          const cr = dispRectToPdf(p.boxLeft, p.te.y - 1, boxW, p.te.height + 2, p.R, p.Wu, p.Hu);
          page.pushOperators(
            pushGraphicsState(),
            rectangle(cr.x, cr.y, cr.width, cr.height),
            clip(),
            endPath(),
          );
        }
        const anchor = dispToPdf(p.drawX, p.te.baselineY, p.R, p.Wu, p.Hu);
        try {
          page.drawText(p.safeText, {
            x: anchor.x,
            y: anchor.y,
            size: p.drawSize,
            font: p.font,
            color: rgb(p.color.r / 255, p.color.g / 255, p.color.b / 255),
            rotate: degrees(p.R),
          });
        } catch {
          const fb = await getStdFont(StandardFonts.Helvetica);
          const scrubbed = p.safeText.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
          page.drawText(scrubbed, {
            x: anchor.x,
            y: anchor.y,
            size: p.drawSize,
            font: fb,
            color: rgb(p.color.r / 255, p.color.g / 255, p.color.b / 255),
            rotate: degrees(p.R),
          });
        }
        if (doClip) {
          page.pushOperators(popGraphicsState());
        }
      }

      if (totalUnencodable > 0) {
        toast.warning(
          `${totalUnencodable} character${totalUnencodable === 1 ? "" : "s"} in ${editsWithUnencodable} edit${editsWithUnencodable === 1 ? "" : "s"} couldn't be encoded and were replaced with "?".`,
        );
      }
      if (overflowCount > 0) {
        toast.warning(
          `${overflowCount} edit${overflowCount === 1 ? "" : "s"} didn't fit their original space — please review.`,
        );
      }







      // Annotation coords are DISPLAY-space (Fix B-2 #2). Convert each
      // draw call to the page's unrotated PDF space and, for orientation-
      // aware kinds (text / image), pass rotate: degrees(R) so the drawn
      // content appears upright after the viewer reapplies /Rotate R.
      for (const a of annos) {
        const page = pdfPages[a.page];
        if (!page) continue;
        const R = normRot(page.getRotation().angle);
        const Wu = page.getWidth();
        const Hu = page.getHeight();

        if (a.kind === "highlight") {
          const c = hexToRgb(a.color);
          const r = dispRectToPdf(a.x, a.y, a.w, a.h, R, Wu, Hu);
          page.drawRectangle({
            x: r.x, y: r.y, width: r.width, height: r.height,
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
            const baselineTop = a.y + i * lh + a.size;
            const anc = dispToPdf(a.x, baselineTop, R, Wu, Hu);
            page.drawText(lines[i], {
              x: anc.x,
              y: anc.y,
              size: a.size,
              font,
              color: rgb(c.r, c.g, c.b),
              rotate: degrees(R),
            });
          }
        } else if (a.kind === "rect") {
          const s = hexToRgb(a.stroke);
          const fillColor = a.fill ? hexToRgb(a.fill) : null;
          const r = dispRectToPdf(a.x, a.y, a.w, a.h, R, Wu, Hu);
          page.drawRectangle({
            x: r.x, y: r.y, width: r.width, height: r.height,
            borderColor: rgb(s.r, s.g, s.b),
            borderWidth: a.strokeWidth,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? a.fillOpacity : undefined,
          });
        } else if (a.kind === "ellipse") {
          const s = hexToRgb(a.stroke);
          const fillColor = a.fill ? hexToRgb(a.fill) : null;
          const cxDisp = a.x + a.w / 2;
          const cyDisp = a.y + a.h / 2;
          const c = dispToPdf(cxDisp, cyDisp, R, Wu, Hu);
          // For R = 90/270 the display x-axis maps to the unrotated
          // y-axis, so swap xScale/yScale to keep the visual axes.
          const swap = R === 90 || R === 270;
          page.drawEllipse({
            x: c.x,
            y: c.y,
            xScale: swap ? a.h / 2 : a.w / 2,
            yScale: swap ? a.w / 2 : a.h / 2,
            borderColor: rgb(s.r, s.g, s.b),
            borderWidth: a.strokeWidth,
            color: fillColor ? rgb(fillColor.r, fillColor.g, fillColor.b) : undefined,
            opacity: fillColor ? a.fillOpacity : undefined,
          });
        } else if (a.kind === "line" || a.kind === "arrow") {
          const c = hexToRgb(a.color);
          const col = rgb(c.r, c.g, c.b);
          const p1 = dispToPdf(a.x1, a.y1, R, Wu, Hu);
          const p2 = dispToPdf(a.x2, a.y2, R, Wu, Hu);
          page.drawLine({
            start: p1,
            end: p2,
            thickness: a.width,
            color: col,
            lineCap: LineCapStyle.Round,
          });
          if (a.kind === "arrow") {
            // Arrow-head math is a rotation-only isometry — using unrotated
            // endpoints and unrotated deltas gives correct display arrows
            // for every R because the length is preserved.
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const headLen = Math.max(8, a.width * 4);
            const headAng = Math.PI / 6;
            const cosA = Math.cos(headAng);
            const sinA = Math.sin(headAng);
            const b1x = -ux * cosA + uy * sinA;
            const b1y = -uy * cosA - ux * sinA;
            const b2x = -ux * cosA - uy * sinA;
            const b2y = -uy * cosA + ux * sinA;
            page.drawLine({
              start: { x: p2.x, y: p2.y },
              end: { x: p2.x + b1x * headLen, y: p2.y + b1y * headLen },
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
            page.drawLine({
              start: { x: p2.x, y: p2.y },
              end: { x: p2.x + b2x * headLen, y: p2.y + b2y * headLen },
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
          }
        } else if (a.kind === "draw") {
          const c = hexToRgb(a.color);
          const col = rgb(c.r, c.g, c.b);
          for (let i = 1; i < a.points.length; i++) {
            const p0d = a.points[i - 1];
            const p1d = a.points[i];
            const p0 = dispToPdf(p0d.x, p0d.y, R, Wu, Hu);
            const p1 = dispToPdf(p1d.x, p1d.y, R, Wu, Hu);
            page.drawLine({
              start: p0,
              end: p1,
              thickness: a.width,
              color: col,
              lineCap: LineCapStyle.Round,
            });
          }
        } else if (a.kind === "image") {
          const img = await embedImg(a.dataUrl, a.mime);
          // Anchor = display bottom-left mapped to unrotated PDF space,
          // then rotate: degrees(R) so the image appears upright.
          const anc = dispToPdf(a.x, a.y + a.h, R, Wu, Hu);
          page.drawImage(img, {
            x: anc.x,
            y: anc.y,
            width: a.w,
            height: a.h,
            rotate: degrees(R),
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
    const totalChanges = annos.length + edits.length;
    return (
      <ToolSuccessScreen
        heading="Your PDF has been edited!"
        subheading={`${totalChanges} change${totalChanges === 1 ? "" : "s"} applied${edits.length ? ` (${edits.length} text edit${edits.length === 1 ? "" : "s"})` : ""}.`}
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

  const totalChanges = annos.length + edits.length;

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
        actionDisabled={!totalChanges}
        sidebar={
          editMode === "annotate" ? (
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
          ) : (
            <EditTextSidebar
              editsCount={edits.length}
              annosCount={annos.length}
              showAll={showAllEditableHint}
              setShowAll={setShowAllEditableHint}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onClearAll={clearAll}
            />
          )
        }
      >
        <div className="space-y-4">
          {/* Mode tabs */}
          <div className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
            <div className="flex gap-1.5 rounded-lg bg-[#f7f7f8] p-1">
              {(["edit-text", "annotate"] as const).map((m) => {
                const active = editMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setEditMode(m);
                      setSelectedId(null);
                      setActiveEditLineId(null);
                    }}
                    className="flex-1 rounded-md py-2 text-[13px] font-semibold transition-colors"
                    style={{
                      backgroundColor: active ? "#ffffff" : "transparent",
                      color: active ? "#e5322d" : "#7a7a86",
                      boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    {m === "edit-text" ? "Edit text" : "Annotate"}
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-[12.5px] leading-relaxed" style={{ color: "#7a7a86" }}>
              {editMode === "edit-text"
                ? "Click any text to edit it. We match the original style as closely as possible. Most PDFs blend seamlessly."
                : "Pick a tool from the sidebar and click or drag on a page to add annotations."}
            </p>
            {editMode === "edit-text" && hasAnyText === false && (
              <div
                className="mt-3 rounded-lg p-3 text-[13px] leading-relaxed"
                style={{ backgroundColor: "#fdf5e6", border: "1px solid #f0e0b8", color: "#5a4a1a" }}
              >
                This looks like a scanned PDF, so there is no editable text. You can still use Annotate mode to write on top.
              </div>
            )}
          </div>

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
              mode={editMode === "annotate" ? mode : "select"}
              onSelect={(id) => setSelectedId(id)}
              onCreate={(a) => {
                setAnnos((prev) => {
                  const next = [...prev, a];
                  pushHistorySnap({ annos: next, edits });
                  return next;
                });
                setSelectedId(a.id);
                if (a.kind !== "draw" && a.kind !== "highlight") setMode("select");
              }}
              onUpdate={(a) => {
                setAnnos((prev) => prev.map((p) => (p.id === a.id ? a : p)));
              }}
              onCommitChange={() => {
                pushHistorySnap({ annos: [...annos], edits });
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
              /* Edit-text mode props */
              editTextMode={editMode === "edit-text"}
              lines={linesByPageRef.current.get(i) ?? null}
              edits={edits.filter((e) => e.page === i)}
              activeEditLineId={activeEditLineId}
              showAllEditable={showAllEditableHint}
              onNeedLines={() => ensureLinesForPage(i)}
              onOpenLine={(lineId) => setActiveEditLineId(lineId)}
              onCloseLine={() => setActiveEditLineId(null)}
              onCommitEdit={(next) => {
                commitEdits((prev) => {
                  const idx = prev.findIndex((p) => p.lineId === next.lineId);
                  if (idx >= 0) {
                    const copy = prev.slice();
                    copy[idx] = next;
                    return copy;
                  }
                  return [...prev, next];
                });
                setActiveEditLineId(null);
              }}
              onRemoveEdit={(lineId) => {
                commitEdits((prev) => prev.filter((p) => p.lineId !== lineId));
              }}
              getPageCanvas={() => pageCanvasesRef.current.get(i) ?? null}
              onVisibilityChange={(v) => setPageVisibility(i, v)}
            />
          ))}
        </div>
      </ToolWorkspace>
    </>
  );
}

/* =============================== Edit-text sidebar =============================== */

function EditTextSidebar(props: {
  editsCount: number;
  annosCount: number;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
}) {
  return (
    <>
      <div>
        <p className="mb-2 text-[11px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
          Edit existing text
        </p>
        <p className="text-[13px] leading-relaxed" style={{ color: "#33333c" }}>
          Hover a line of text on the page. Click to retype. Enter to save, Escape to cancel.
        </p>
      </div>

      <button
        type="button"
        onClick={() => props.setShowAll(!props.showAll)}
        className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition-colors"
        style={{
          border: "1px solid #ececef",
          color: props.showAll ? "#e5322d" : "#33333c",
          backgroundColor: props.showAll ? "#fdeceb" : "#ffffff",
        }}
      >
        {props.showAll ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {props.showAll ? "Hide editable areas" : "Show editable areas"}
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={props.undo}
          disabled={!props.canUndo}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold disabled:opacity-40"
          style={{ border: "1px solid #ececef", color: "#33333c" }}
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button
          type="button"
          onClick={props.redo}
          disabled={!props.canRedo}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold disabled:opacity-40"
          style={{ border: "1px solid #ececef", color: "#33333c" }}
        >
          <Redo2 className="h-3.5 w-3.5" /> Redo
        </button>
      </div>

      <InfoTip>
        {props.editsCount
          ? `${props.editsCount} text edit${props.editsCount === 1 ? "" : "s"}${props.annosCount ? ` plus ${props.annosCount} annotation${props.annosCount === 1 ? "" : "s"}` : ""} ready to save.`
          : "Hover any text line to reveal an editable outline, then click to retype it."}
      </InfoTip>

      {(props.editsCount > 0 || props.annosCount > 0) && (
        <button
          type="button"
          onClick={props.onClearAll}
          className="flex items-center gap-1.5 self-start text-[12px] font-semibold text-[#7a7a86] transition-colors hover:text-[#e5322d]"
        >
          <Trash2 className="h-3 w-3" /> Clear all
        </button>
      )}
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
  /* Edit-text mode props */
  editTextMode: boolean;
  lines: EditableLine[] | null;
  edits: TextEdit[];
  activeEditLineId: string | null;
  showAllEditable: boolean;
  onNeedLines: () => void;
  onOpenLine: (lineId: string) => void;
  onCloseLine: () => void;
  onCommitEdit: (edit: TextEdit) => void;
  onRemoveEdit: (lineId: string) => void;
  getPageCanvas: () => HTMLCanvasElement | null;
  onVisibilityChange: (visible: boolean) => void;
}

function PageOverlay(props: PageOverlayProps) {
  const { index, page, annos, selectedId, mode, onSelect, onCreate, onUpdate, onCommitChange, onRemove } = props;
  const { editTextMode, lines, edits, activeEditLineId, showAllEditable, onNeedLines, onOpenLine, onCloseLine, onCommitEdit, onRemoveEdit, getPageCanvas, onVisibilityChange } = props;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const [draft, setDraft] = useState<Anno | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Always track visibility so the parent can drive canvas eviction
  // (Fix B1). Also triggers lazy line extraction when in edit-text mode.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          const isVis = ent.isIntersecting;
          setVisible((v) => (v === isVis ? v : isVis));
          onVisibilityChange(isVis);
          if (isVis && editTextMode && !lines) onNeedLines();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      onVisibilityChange(false);
    };
  }, [editTextMode, lines, onNeedLines, onVisibilityChange]);

  // Filter out lines that already have a saved edit (they render an
  // "edited" indicator instead of the raw hover outline).
  const editsByLineId = useMemo(() => {
    const m = new Map<string, TextEdit>();
    for (const e of edits) m.set(e.lineId, e);
    return m;
  }, [edits]);

  void visible;

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
        {page.url ? (
          <img
            src={page.url}
            alt={`Page ${index + 1}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            draggable={false}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-50 text-xs text-neutral-400">
            Loading page {index + 1}…
          </div>
        )}
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

        {/* Edit-text overlay layer */}
        {scale > 0 && editTextMode && lines && (
          <div className="absolute inset-0">
            {/* Left-gutter change-bar: one marker per edited line, sitting
                in the page card's padding — never over glyph content. */}
            {lines.map((ln) => {
              const existing = editsByLineId.get(ln.id);
              if (!existing) return null;
              const cy = (ln.y + ln.height / 2) * scale;
              return (
                <span
                  key={`mark-${ln.id}`}
                  className="pointer-events-none absolute rounded-sm"
                  style={{
                    left: -8,
                    top: cy - 6,
                    width: 3,
                    height: 12,
                    backgroundColor: existing.lowConfidence ? "#f59e0b" : "#e5322d",
                    boxShadow: "0 0 0 1px #ffffff",
                  }}
                  title={
                    existing.lowConfidence
                      ? "Low-confidence edit — preview the exported PDF."
                      : "Edited"
                  }
                />
              );
            })}
            {lines.map((ln) => {
              const existing = editsByLineId.get(ln.id);
              const isActive = activeEditLineId === ln.id;
              return (
                <EditLineOverlay
                  key={ln.id}
                  line={ln}
                  scale={scale}
                  pageWidth={page.width}
                  pageHeight={page.height}
                  isActive={isActive}
                  existing={existing ?? null}
                  showAll={showAllEditable}
                  nearby={visible}
                  getPageCanvas={getPageCanvas}
                  onOpen={() => onOpenLine(ln.id)}
                  onCancel={onCloseLine}
                  onCommit={onCommitEdit}
                  onRemove={() => onRemoveEdit(ln.id)}
                />
              );
            })}
          </div>
        )}
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

/* =============================== Edit-text line overlay =============================== */

function EditLineOverlay({
  line,
  scale,
  pageWidth,
  pageHeight,
  isActive,
  existing,
  showAll,
  nearby,
  getPageCanvas,
  onOpen,
  onCancel,
  onCommit,
  onRemove,
}: {
  line: EditableLine;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  isActive: boolean;
  existing: TextEdit | null;
  showAll: boolean;
  /** True when this line's page is within the visible ± buffer window.
   *  When false, the sampler cache is evicted (Fix B-2 #1). */
  nearby: boolean;
  getPageCanvas: () => HTMLCanvasElement | null;
  onOpen: () => void;
  onCancel: () => void;
  onCommit: (edit: TextEdit) => void;
  onRemove: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [sampled, setSampled] = useState<{
    bg: string;
    fg: string;
    lowConfidence: boolean;
    edgeInsets: { top: number; bottom: number; left: number; right: number };
    align: "left" | "center" | "right";
    cellLeft?: number;
    cellRight?: number;
    skipCover: boolean;
  } | null>(null);

  // Fix B-2 #1: evict the sampler cache when the page scrolls out of the
  // nearby window. Keeps overall heap bounded on long docs; the sampler
  // re-runs cheaply the next time the page comes back into view.
  useEffect(() => {
    if (!nearby) setSampled(null);
  }, [nearby]);

  useEffect(() => {
    if (!isActive && !existing) return;
    if (sampled) return;
    const canvas = getPageCanvas();
    if (!canvas) return;

    const sx = canvas.width / pageWidth;
    const sy = canvas.height / pageHeight;
    // Sample within the TIGHT box (line.x/y/width/height already tight).
    const cx = Math.floor(line.x * sx);
    const cy = Math.floor(line.y * sy);
    const cw = Math.max(1, Math.ceil(line.width * sx));
    const ch = Math.max(1, Math.ceil(line.height * sy));
    const s = sampleBackgroundAndTextColor(canvas, { x: cx, y: cy, w: cw, h: ch });

    // Convert per-side pixel insets back to PDF units.
    const insets = {
      top: s.edgeInsets.top ? s.edgeInsets.top / sy + 0.5 : 0,
      bottom: s.edgeInsets.bottom ? s.edgeInsets.bottom / sy + 0.5 : 0,
      left: s.edgeInsets.left ? s.edgeInsets.left / sx + 0.5 : 0,
      right: s.edgeInsets.right ? s.edgeInsets.right / sx + 0.5 : 0,
    };

    // Cell-border rulings (clamp = 8px for cover-rect protection; align =
    // up to 200px each side to find the cell bounds for alignment).
    const rulings = findCellRulings(
      canvas,
      { x: cx, y: cy, w: cw, h: ch },
      s.background,
      { clampMax: 8, alignMax: 220 },
    );
    // Fold clamp rulings into edgeInsets so the export never overpaints them.
    if (rulings.clamp.top != null)
      insets.top = Math.max(insets.top, Math.max(0, rulings.clamp.top - 1) / sy);
    if (rulings.clamp.bottom != null)
      insets.bottom = Math.max(insets.bottom, Math.max(0, rulings.clamp.bottom - 1) / sy);
    if (rulings.clamp.left != null)
      insets.left = Math.max(insets.left, Math.max(0, rulings.clamp.left - 1) / sx);
    if (rulings.clamp.right != null)
      insets.right = Math.max(insets.right, Math.max(0, rulings.clamp.right - 1) / sx);

    // Alignment: need rulings on BOTH sides (from clamp or align search).
    const dL = rulings.align.left ?? rulings.clamp.left;
    const dR = rulings.align.right ?? rulings.clamp.right;
    let align: "left" | "center" | "right" = "left";
    let cellLeft: number | undefined;
    let cellRight: number | undefined;
    if (dL != null && dR != null) {
      cellLeft = line.x - dL / sx;
      cellRight = line.x + line.width + dR / sx;
      const leftGap = dL / sx;
      const rightGap = dR / sx;
      if (Math.abs(leftGap - rightGap) < 4 && Math.min(leftGap, rightGap) > 3) align = "center";
      else if (rightGap > leftGap + 4) align = "left";
      else align = "right";
    }
    // Fix B5: borderless-table fallback. When rulings are absent on either
    // side, defer to the column-alignment cluster the extractor inferred
    // from siblings sharing a right/left/center edge across baselines.
    // Anchor cellLeft/cellRight to the current glyph edges so a shorter
    // replacement stays anchored to the shared column edge.
    if ((dL == null || dR == null) && line.columnAlign) {
      align = line.columnAlign;
      if (cellLeft == null) cellLeft = line.x;
      if (cellRight == null) cellRight = line.x + line.width;
    }

    setSampled({
      bg: rgbToHex(s.background),
      fg: rgbToHex(s.text),
      lowConfidence: !s.bgConfident || s.bgBusy,
      edgeInsets: insets,
      align,
      cellLeft,
      cellRight,
      skipCover: !s.bgConfident && s.bgBusy,
    });
  }, [isActive, existing, sampled, getPageCanvas, line, pageWidth, pageHeight]);

  const bgColor = existing?.bgColor ?? sampled?.bg ?? "#ffffff";
  const fgColor = existing?.color ?? sampled?.fg ?? "#000000";
  const align = existing?.align ?? sampled?.align ?? "left";

  // Tight box in screen coordinates.
  const style: React.CSSProperties = {
    position: "absolute",
    left: line.x * scale,
    top: line.y * scale,
    width: line.width * scale,
    height: line.height * scale,
    overflow: "hidden",
  };

  if (isActive) {
    return (
      <EditLineInlineEditor
        line={line}
        scale={scale}
        style={style}
        bgColor={bgColor}
        fgColor={fgColor}
        align={align}
        initialText={existing?.newText ?? line.text}
        initialSize={existing?.fontSize ?? line.fontSize}
        initialBold={existing?.bold ?? line.bold}
        initialItalic={existing?.italic ?? line.italic}
        initialFamily={existing?.family ?? line.family}
        onCancel={onCancel}
        onCommit={(next) => {
          // ---- Fix Batch A.1 - Fix 1: NO-OP GUARD ----
          // If the committed text is identical to the original AND font/
          // style/size are unchanged, create NO TextEdit. Prevents accidental
          // click-and-Enter from covering the cell with a redundant edit.
          const origText = line.text;
          const sameText = next.text === origText;
          const sameStyle =
            next.fontSize === (existing?.fontSize ?? line.fontSize) &&
            next.bold === (existing?.bold ?? line.bold) &&
            next.italic === (existing?.italic ?? line.italic) &&
            next.family === (existing?.family ?? line.family) &&
            next.color === (existing?.color ?? sampled?.fg ?? "#000000");
          if (sameText && sameStyle && !existing) {
            onCancel();
            return;
          }
          // Empty commit: only accept as an intentional delete if the user
          // confirms. Otherwise cancel and keep the original text.
          if (next.text.trim() === "" && origText.trim() !== "") {
            const ok =
              typeof window !== "undefined" &&
              window.confirm("Delete this text from the PDF?");
            if (!ok) {
              onCancel();
              return;
            }
          }
          onCommit({
            id: existing?.id ?? `TE-${line.id}`,
            page: line.page,
            lineId: line.id,
            x: line.x,
            y: line.y,
            width: line.width,
            height: line.height,
            baselineY: line.baselineY,
            originalText: line.text,
            newText: next.text,
            fontSize: next.fontSize,
            color: next.color,
            bgColor,
            bold: next.bold,
            italic: next.italic,
            family: next.family,
            fontName: line.fontName,
            twin: line.twin,
            edgeInsets: existing?.edgeInsets ?? sampled?.edgeInsets,
            lowConfidence: existing?.lowConfidence ?? sampled?.lowConfidence,
            align: existing?.align ?? sampled?.align,
            cellLeft: existing?.cellLeft ?? sampled?.cellLeft,
            cellRight: existing?.cellRight ?? sampled?.cellRight,
            skipCover: existing?.skipCover ?? sampled?.skipCover ?? false,
          });
        }}
      />
    );
  }

  if (existing) {
    const textAlign: React.CSSProperties["textAlign"] =
      align === "center" ? "center" : align === "right" ? "right" : "left";
    return (
      <div className="group" style={{ position: "absolute", left: line.x * scale, top: line.y * scale, width: line.width * scale, height: line.height * scale }}>
        <div style={{ ...style, left: 0, top: 0 }}>
          <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
          <div
            className="absolute inset-0 flex items-center"
            style={{
              fontSize: existing.fontSize * scale,
              lineHeight: 1,
              color: existing.color,
              fontWeight: existing.bold ? 700 : 400,
              fontStyle: existing.italic ? "italic" : "normal",
              fontFamily:
                existing.family === "serif"
                  ? "'Times New Roman', Times, serif"
                  : existing.family === "mono"
                    ? "Menlo, Consolas, monospace"
                    : "Helvetica, Arial, sans-serif",
              whiteSpace: "nowrap",
              justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
              textAlign,
            }}
          >
            {existing.newText}
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="absolute inset-0 cursor-text"
            style={{ background: "transparent" }}
            aria-label="Edit segment again"
          />
        </div>
        {/* Edit indicators live in the page's left-gutter change-bar, not
            over the glyphs — see PageOverlay. */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute grid h-4 w-4 place-items-center rounded-full bg-white text-[#e5322d] opacity-0 shadow group-hover:opacity-100"
          style={{ right: -8, top: -12, border: "1px solid #ececef" }}
          aria-label="Undo this text edit"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    );
  }

  // Idle: solid hover outline hugging tight box.
  const outlineVisible = hover || showAll;
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        ...style,
        border: outlineVisible ? "1px solid rgba(229,50,45,0.4)" : "1px solid transparent",
        backgroundColor: showAll && !hover ? "rgba(229,50,45,0.06)" : hover ? "rgba(229,50,45,0.06)" : "transparent",
        cursor: "text",
      }}
      className="rounded-[2px] transition-colors"
      aria-label={`Edit segment: ${line.text.slice(0, 60)}`}
    />
  );
}

function EditLineInlineEditor({
  line,
  scale,
  style,
  bgColor,
  fgColor,
  align,
  initialText,
  initialSize,
  initialBold,
  initialItalic,
  initialFamily,
  onCancel,
  onCommit,
}: {
  line: EditableLine;
  scale: number;
  style: React.CSSProperties;
  bgColor: string;
  fgColor: string;
  align: "left" | "center" | "right";
  initialText: string;
  initialSize: number;
  initialBold: boolean;
  initialItalic: boolean;
  initialFamily: FontFamily;
  onCancel: () => void;
  onCommit: (v: { text: string; fontSize: number; color: string; bold: boolean; italic: boolean; family: FontFamily }) => void;
}) {
  const [text, setText] = useState(initialText);
  const [size, setSize] = useState(initialSize);
  const [bold, setBold] = useState(initialBold);
  const [italic, setItalic] = useState(initialItalic);
  const [color, setColor] = useState(fgColor);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Live warning while the user is typing — non-blocking, but the commit
  // itself is blocked below.
  useEffect(() => {
    if (hasComplexScript(text)) {
      setScriptError(
        "Editing text in this script (e.g. Hindi, Arabic) isn't supported yet. The original text was kept unchanged.",
      );
    } else {
      setScriptError(null);
    }
  }, [text]);

  const commit = () => {
    const next = text.trim() === "" ? "" : text;
    if (hasComplexScript(next)) {
      setScriptError(
        "Editing text in this script (e.g. Hindi, Arabic) isn't supported yet. The original text was kept unchanged.",
      );
      inputRef.current?.focus();
      return;
    }
    onCommit({
      text: next,
      fontSize: size,
      color,
      bold,
      italic,
      family: initialFamily,
    });
  };


  const cssFamily =
    initialFamily === "serif"
      ? "'Times New Roman', Times, serif"
      : initialFamily === "mono"
        ? "Menlo, Consolas, monospace"
        : "Helvetica, Arial, sans-serif";

  const textAlign: React.CSSProperties["textAlign"] =
    align === "center" ? "center" : align === "right" ? "right" : "left";

  return (
    <div style={style}>
      <div
        className="absolute inset-0"
        style={{ backgroundColor: bgColor, outline: "1.5px solid #e5322d" }}
      />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          else if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        onBlur={(e) => {
          const to = e.relatedTarget as HTMLElement | null;
          if (to && to.closest("[data-edit-toolbar]")) return;
          if (scriptError) { onCancel(); return; }
          commit();
        }}
        className="absolute inset-0 border-0 bg-transparent p-0 outline-none"
        style={{
          fontSize: size * scale,
          lineHeight: `${line.height * scale}px`,
          color,
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? "italic" : "normal",
          fontFamily: cssFamily,
          textAlign,
        }}
      />

      {/* Floating mini toolbar */}
      <div
        data-edit-toolbar
        onMouseDown={(e) => e.preventDefault()}
        className="absolute z-10 flex items-center gap-1 rounded-lg bg-white p-1 shadow-lg"
        style={{ left: 0, top: -40, border: "1px solid #ececef" }}
      >
        <button type="button" onClick={() => setSize((s) => Math.max(6, s - 1))} className="grid h-6 w-6 place-items-center rounded text-[13px] font-bold text-[#33333c] hover:bg-[#f7f7f8]">−</button>
        <span className="min-w-[24px] text-center text-[11.5px] font-semibold" style={{ color: "#33333c" }}>{Math.round(size)}</span>
        <button type="button" onClick={() => setSize((s) => Math.min(200, s + 1))} className="grid h-6 w-6 place-items-center rounded text-[13px] font-bold text-[#33333c] hover:bg-[#f7f7f8]">+</button>
        <span className="mx-1 h-4 w-px bg-[#ececef]" />
        <button type="button" onClick={() => setBold((v) => !v)} className="grid h-6 w-6 place-items-center rounded hover:bg-[#f7f7f8]" style={{ backgroundColor: bold ? "#f7f7f8" : "transparent", color: bold ? "#e5322d" : "#33333c" }} aria-label="Bold"><Bold className="h-3.5 w-3.5" /></button>
        <button type="button" onClick={() => setItalic((v) => !v)} className="grid h-6 w-6 place-items-center rounded hover:bg-[#f7f7f8]" style={{ backgroundColor: italic ? "#f7f7f8" : "transparent", color: italic ? "#e5322d" : "#33333c" }} aria-label="Italic"><Italic className="h-3.5 w-3.5" /></button>
        <span className="mx-1 h-4 w-px bg-[#ececef]" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0" aria-label="Text color" style={{ padding: 0 }} />
      </div>

      {scriptError && (
        <div
          role="alert"
          data-edit-toolbar
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-20 rounded-md px-2 py-1 text-[11px] font-medium"
          style={{
            left: 0,
            top: "100%",
            marginTop: 6,
            maxWidth: 320,
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            color: "#92400e",
            whiteSpace: "normal",
          }}
        >
          {scriptError}
        </div>
      )}
    </div>
  );
}

