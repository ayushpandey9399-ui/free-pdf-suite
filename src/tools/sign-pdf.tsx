// Signature fonts load with this tool chunk only, so the other 48 pages do not
// pay for them. Everything that rasterises typed text awaits ensureSignatureFonts().
import "@fontsource/dancing-script/600.css";
import "@fontsource/great-vibes/400.css";
import "@fontsource/caveat/600.css";
import "@fontsource/sacramento/400.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, degrees, rgb, StandardFonts, type PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getStroke } from "perfect-freehand";
import {
  X, Trash2, Pen, Type as TypeIcon, Upload as UploadIcon,
  ChevronLeft, ChevronRight, MousePointerClick, Undo2, Maximize2, RotateCw, Check,
  Calendar as CalendarIcon, CheckSquare, XSquare, Copy, Bookmark,
} from "lucide-react";

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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Tab = "draw" | "type" | "upload" | "saved";
type Kind = "signature" | "initials" | "date" | "text" | "check";
type CheckKind = "check" | "cross";
type DateFormat = "DMY" | "MDY" | "DMonY";

interface Signature {
  dataUrl: string;
  w: number; // intrinsic px
  h: number;
}

interface SavedSig extends Signature {
  id: string;
  createdAt: number;
}

interface PageInfo {
  url: string;
  width: number;
  height: number;
  rotation: number;
}

interface TextPayload {
  variant: "date" | "text" | "check";
  value: string;         // rendered date string, user text, or "" for check
  checkKind?: CheckKind; // when variant === "check"
  color: string;         // "#111111" or "#1a56db"
  fontPx: number;        // font size in PDF points (used for text/date)
}

interface Placement {
  id: string;
  pageIndex: number;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // CW degrees, screen space
  text?: TextPayload; // set for kind === "date" | "text" | "check"
}

type StrokePoint = [number, number, number]; // x, y, pressure
interface StrokeRec {
  points: StrokePoint[];
  color: string;
  size: number;
}

const COLORS = [
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#1a56db" },
  { name: "Red", value: "#c72620" },
];

const TEXT_COLORS = [
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#1a56db" },
];

const THICKNESS = [
  { name: "Thin", size: 3 },
  { name: "Medium", size: 5.5 },
  { name: "Thick", size: 9 },
];

const TYPE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Sacramento", family: "'Sacramento', cursive" },
];

const DATE_FORMATS: { id: DateFormat; label: string }[] = [
  { id: "DMY",   label: "DD/MM/YYYY" },
  { id: "MDY",   label: "MM/DD/YYYY" },
  { id: "DMonY", label: "DD Mon YYYY" },
];

/* -------- Complex script guard (mirrors edit-pdf) -------- */
const COMPLEX_SCRIPT_RE =
  /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u1780-\u17FF]/;

function hasComplexScript(s: string): boolean {
  return COMPLEX_SCRIPT_RE.test(s);
}

/* -------- Date helpers -------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function pad2(n: number) { return String(n).padStart(2, "0"); }
function formatDate(d: Date, fmt: DateFormat): string {
  const dd = pad2(d.getDate()), mm = pad2(d.getMonth() + 1), yyyy = d.getFullYear();
  if (fmt === "DMY") return `${dd}/${mm}/${yyyy}`;
  if (fmt === "MDY") return `${mm}/${dd}/${yyyy}`;
  return `${dd} ${MONTHS[d.getMonth()]} ${yyyy}`;
}

/* -------- Saved signatures (device-only) -------- */
const SAVED_MAX = 3;
const SAVED_KEYS: Record<"signature" | "initials", string> = {
  signature: "signpdf.saved.signatures.v1",
  initials:  "signpdf.saved.initials.v1",
};

function loadSaved(k: "signature" | "initials"): SavedSig[] {
  try {
    const raw = localStorage.getItem(SAVED_KEYS[k]);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && typeof x.dataUrl === "string" && typeof x.w === "number" && typeof x.h === "number");
  } catch { return []; }
}
function persistSaved(k: "signature" | "initials", list: SavedSig[]): boolean {
  try {
    localStorage.setItem(SAVED_KEYS[k], JSON.stringify(list));
    return true;
  } catch { return false; }
}

/* -------- Font measurement cache (Arimo for preview + export) -------- */
let ARIMO_BYTES: Uint8Array | null = null;
async function loadArimoBytes(): Promise<Uint8Array> {
  if (ARIMO_BYTES) return ARIMO_BYTES;
  const res = await fetch("/fonts/Arimo-Regular.ttf");
  if (!res.ok) throw new Error("Font load failed");
  ARIMO_BYTES = new Uint8Array(await res.arrayBuffer());
  return ARIMO_BYTES;
}

// Inject an @font-face for Arimo so on-screen preview matches export.
function useArimoFace() {
  useEffect(() => {
    if (document.getElementById("signpdf-arimo-face")) return;
    const style = document.createElement("style");
    style.id = "signpdf-arimo-face";
    style.textContent = `
      @font-face {
        font-family: 'ArimoSignPdf';
        src: url('/fonts/Arimo-Regular.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }, []);
}

// Measure width of a text string in Arimo at a given font size (in px, matches PDF pt).
function measureArimoWidth(text: string, fontPx: number): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontPx}px 'ArimoSignPdf', Arial, sans-serif`;
  return Math.max(1, Math.ceil(ctx.measureText(text).width));
}

export default function SignPdf() {
  const isMobile = useIsMobile();
  useArimoFace();

  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const [active, setActive] = useState<Kind>("signature");
  const [tab, setTab] = useState<Tab>("draw");
  const [signature, setSignature] = useState<Signature | null>(null);
  const [initials, setInitials] = useState<Signature | null>(null);

  // Text primitives config
  const [dateFormat, setDateFormat] = useState<DateFormat>("DMY");
  const [dateColor, setDateColor] = useState(TEXT_COLORS[0].value);
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState(TEXT_COLORS[0].value);
  const [checkKind, setCheckKind] = useState<CheckKind>("check");
  const [checkColor, setCheckColor] = useState(TEXT_COLORS[0].value);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const [stampMode, setStampMode] = useState<Kind | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pulsePlace, setPulsePlace] = useState(false);

  // Saved sigs state (only meaningful for signature/initials)
  const [savedSigs, setSavedSigs] = useState<SavedSig[]>(() => loadSaved("signature"));
  const [savedInits, setSavedInits] = useState<SavedSig[]>(() => loadSaved("initials"));

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());
  const registerPageEl = useCallback((idx: number, el: HTMLElement | null) => {
    if (el) pageRefs.current.set(idx, el);
    else pageRefs.current.delete(idx);
  }, []);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setPlacements([]);
    setSelectedId(null);
    setStampMode(null);
    setCurrentPage(0);
    if (!file) return;
    setLoadingPages(true);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
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

  const current = active === "signature" ? signature : active === "initials" ? initials : null;
  const setCurrentImage = (sig: Signature | null) => {
    if (active === "signature") setSignature(sig);
    else if (active === "initials") setInitials(sig);
    if (sig) {
      setPulsePlace(true);
      window.setTimeout(() => setPulsePlace(false), 1400);
    }
  };

  // Reset tab when switching active kind
  useEffect(() => {
    if (active === "date" || active === "text" || active === "check") return;
    if (tab === "saved") return; // stay on saved when switching signature<->initials
    // keep current tab
  }, [active, tab]);

  useEffect(() => {
    if (!pages.length) return;
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.pageIndex ?? -1);
          if (idx >= 0) ratios.set(idx, e.intersectionRatio);
        }
        let best = 0, bestR = -1;
        ratios.forEach((r, i) => { if (r > bestR) { bestR = r; best = i; } });
        setCurrentPage(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    pageRefs.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages.length]);

  // Escape to exit stamp mode / deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (stampMode) setStampMode(null);
        else if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stampMode, selectedId]);

  // Keyboard nudge + delete for selected placement
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tgt?.isContentEditable) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setPlacements((prev) => prev.map((p) => {
          if (p.id !== selectedId) return p;
          const page = pages[p.pageIndex]; if (!page) return p;
          let x = p.x, y = p.y;
          if (e.key === "ArrowLeft") x -= step;
          if (e.key === "ArrowRight") x += step;
          if (e.key === "ArrowUp") y -= step;
          if (e.key === "ArrowDown") y += step;
          x = Math.max(0, Math.min(page.width - p.w, x));
          y = Math.max(0, Math.min(page.height - p.h, y));
          return { ...p, x, y };
        }));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setPlacements((prev) => prev.filter((p) => p.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, pages]);

  const addImagePlacement = useCallback(
    (kind: "signature" | "initials", pageIndex: number, cxPoints: number, cyPoints: number) => {
      const sig = kind === "signature" ? signature : initials;
      const page = pages[pageIndex];
      if (!sig || !page) return;
      const targetW = kind === "signature" ? Math.min(page.width * 0.35, 220) : Math.min(page.width * 0.18, 110);
      const aspect = sig.h / sig.w;
      const w = targetW;
      const h = w * aspect;
      const x = Math.max(0, Math.min(page.width - w, cxPoints - w / 2));
      const y = Math.max(0, Math.min(page.height - h, cyPoints - h / 2));
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPlacements((prev) => [...prev, { id, pageIndex, kind, x, y, w, h, rotation: 0 }]);
      setSelectedId(id);
    },
    [pages, signature, initials],
  );

  const addTextPlacement = useCallback(
    (variant: "date" | "text" | "check", pageIndex: number, cxPoints: number, cyPoints: number) => {
      const page = pages[pageIndex];
      if (!page) return;
      let value = "";
      let color = "#111111";
      let ck: CheckKind | undefined;
      if (variant === "date") { value = formatDate(new Date(), dateFormat); color = dateColor; }
      else if (variant === "text") {
        value = textInput.trim();
        if (!value) { toast.error("Type something first"); return; }
        if (hasComplexScript(value)) { toast.error("This script isn't supported yet"); return; }
        color = textColor;
      } else { ck = checkKind; color = checkColor; }

      const fontPx = variant === "check" ? 22 : 20;
      let w: number, h: number;
      if (variant === "check") { w = 22; h = 22; }
      else {
        w = measureArimoWidth(value, fontPx) + 6;
        h = Math.ceil(fontPx * 1.25);
      }
      const x = Math.max(0, Math.min(page.width - w, cxPoints - w / 2));
      const y = Math.max(0, Math.min(page.height - h, cyPoints - h / 2));
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPlacements((prev) => [...prev, {
        id, pageIndex, kind: variant, x, y, w, h, rotation: 0,
        text: { variant, value, checkKind: ck, color, fontPx },
      }]);
      setSelectedId(id);
    },
    [pages, dateFormat, dateColor, textInput, textColor, checkKind, checkColor],
  );

  const stampAt = useCallback((pageIndex: number, cxPts: number, cyPts: number) => {
    if (!stampMode) return;
    if (stampMode === "signature" || stampMode === "initials") {
      addImagePlacement(stampMode, pageIndex, cxPts, cyPts);
    } else {
      addTextPlacement(stampMode, pageIndex, cxPts, cyPts);
    }
  }, [stampMode, addImagePlacement, addTextPlacement]);

  const canPlace = useMemo(() => {
    if (active === "signature") return !!signature;
    if (active === "initials")  return !!initials;
    if (active === "date")      return true;
    if (active === "text")      return textInput.trim().length > 0;
    if (active === "check")     return true;
    return false;
  }, [active, signature, initials, textInput]);

  const placeOnDocument = useCallback(() => {
    if (!canPlace) return;
    const pageIndex = currentPage;
    const page = pages[pageIndex];
    if (!page) return;
    const samePage = placements.filter((p) => p.pageIndex === pageIndex).length;
    const offset = (samePage % 6) * 20;
    const cx = page.width / 2 + offset;
    const cy = page.height / 2 + offset;
    if (active === "signature" || active === "initials") addImagePlacement(active, pageIndex, cx, cy);
    else addTextPlacement(active, pageIndex, cx, cy);
    setStampMode(active);
  }, [canPlace, currentPage, pages, placements, active, addImagePlacement, addTextPlacement]);

  const scrollToPage = (idx: number) => {
    const el = pageRefs.current.get(idx);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetAll = () => {
    setFiles([]); setPages([]); setPlacements([]); setSelectedId(null);
    setSignature(null); setInitials(null); setResult(null);
    setActive("signature"); setTab("draw"); setStampMode(null); setCurrentPage(0);
    setTextInput("");
    pageRefs.current.clear();
  };

  /* -------- Apply to all pages -------- */
  const applySelectedToAllPages = useCallback(() => {
    if (!selectedId) return;
    setPlacements((prev) => {
      const src = prev.find((p) => p.id === selectedId);
      if (!src) return prev;
      const srcPage = pages[src.pageIndex]; if (!srcPage) return prev;
      const rx = src.x / srcPage.width;
      const ry = src.y / srcPage.height;
      const rw = src.w / srcPage.width;
      const clones: Placement[] = [];
      for (let i = 0; i < pages.length; i++) {
        if (i === src.pageIndex) continue;
        const dst = pages[i]; if (!dst) continue;
        // Duplicate detection: same kind, same content, close relative position + width
        const exists = prev.some((p) => {
          if (p.pageIndex !== i || p.kind !== src.kind) return false;
          if ((p.text?.value ?? "") !== (src.text?.value ?? "")) return false;
          if ((p.text?.variant ?? "") !== (src.text?.variant ?? "")) return false;
          if ((p.text?.checkKind ?? "") !== (src.text?.checkKind ?? "")) return false;
          const prx = p.x / dst.width, pry = p.y / dst.height, prw = p.w / dst.width;
          return Math.abs(prx - rx) < 0.02 && Math.abs(pry - ry) < 0.02 && Math.abs(prw - rw) < 0.02;
        });
        if (exists) continue;
        const w = rw * dst.width;
        const aspect = src.h / src.w;
        const h = w * aspect;
        const x = Math.max(0, Math.min(dst.width - w, rx * dst.width));
        const y = Math.max(0, Math.min(dst.height - h, ry * dst.height));
        clones.push({
          ...src,
          id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          pageIndex: i, x, y, w, h,
        });
      }
      if (clones.length === 0) { toast.info("Already placed on every page"); return prev; }
      toast.success(`Applied to ${clones.length} more page${clones.length === 1 ? "" : "s"}`);
      return [...prev, ...clones];
    });
  }, [selectedId, pages]);

  /* -------- Saved sigs actions -------- */
  const saveCurrent = useCallback((asKind: "signature" | "initials", sig: Signature) => {
    const key = asKind;
    const cur = key === "signature" ? savedSigs : savedInits;
    // Dedupe by dataUrl
    if (cur.some((s) => s.dataUrl === sig.dataUrl)) return;
    const next: SavedSig[] = [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), ...sig },
      ...cur,
    ].slice(0, SAVED_MAX);
    const ok = persistSaved(key, next);
    if (!ok) { toast.error("Could not save to this device (storage full)"); return; }
    if (key === "signature") setSavedSigs(next); else setSavedInits(next);
    toast.success("Saved on this device");
  }, [savedSigs, savedInits]);

  const deleteSaved = (kind: "signature" | "initials", id: string) => {
    const cur = kind === "signature" ? savedSigs : savedInits;
    const next = cur.filter((s) => s.id !== id);
    persistSaved(kind, next);
    if (kind === "signature") setSavedSigs(next); else setSavedInits(next);
  };
  const clearSaved = (kind: "signature" | "initials") => {
    persistSaved(kind, []);
    if (kind === "signature") setSavedSigs([]); else setSavedInits([]);
  };

  const run = async () => {
    if (!file || !placements.length) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pdfPages = doc.getPages();
      const imgCache: Record<string, Awaited<ReturnType<typeof doc.embedPng>>> = {};
      let arimo: PDFFont | null = null;
      let needsFont = placements.some((p) => p.kind === "date" || p.kind === "text");
      if (needsFont) {
        try {
          doc.registerFontkit(fontkit);
          const bytes = await loadArimoBytes();
          arimo = await doc.embedFont(bytes, { subset: true });
        } catch {
          // Fallback to Helvetica for latin-only text
          arimo = await doc.embedFont(StandardFonts.Helvetica);
        }
      }

      for (const p of placements) {
        const page = pdfPages[p.pageIndex];
        if (!page) continue;
        const { height } = page.getSize();

        if (p.kind === "signature" || p.kind === "initials") {
          const sig = p.kind === "signature" ? signature : initials;
          if (!sig) continue;
          if (!imgCache[sig.dataUrl]) {
            const b64 = sig.dataUrl.split(",")[1];
            const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
            imgCache[sig.dataUrl] = await doc.embedPng(bytes);
          }
          const png = imgCache[sig.dataUrl];
          const uiAngle = p.rotation || 0;
          const rad = -uiAngle * Math.PI / 180;
          const cos = Math.cos(rad), sin = Math.sin(rad);
          const cxPdf = p.x + p.w / 2;
          const cyPdf = height - (p.y + p.h / 2);
          const anchorX = cxPdf - (p.w / 2) * cos + (p.h / 2) * sin;
          const anchorY = cyPdf - (p.w / 2) * sin - (p.h / 2) * cos;
          page.drawImage(png, {
            x: anchorX,
            y: anchorY,
            width: p.w,
            height: p.h,
            rotate: uiAngle ? degrees(-uiAngle) : undefined,
          });
          continue;
        }

        // Text / date / check: no rotation on export
        const t = p.text; if (!t) continue;
        const col = hexToPdfRgb(t.color);

        if (t.variant === "check") {
          // vector strokes fit inside the box, drawn in PDF (bottom-origin) coords
          const left = p.x;
          const top  = height - p.y;                // top of box in bottom-origin
          const w = p.w, h = p.h;
          const lw = Math.max(1.5, Math.min(w, h) * 0.14);
          if (t.checkKind === "cross") {
            page.drawLine({
              start: { x: left + w * 0.15, y: top - h * 0.15 },
              end:   { x: left + w * 0.85, y: top - h * 0.85 },
              thickness: lw, color: col,
            });
            page.drawLine({
              start: { x: left + w * 0.15, y: top - h * 0.85 },
              end:   { x: left + w * 0.85, y: top - h * 0.15 },
              thickness: lw, color: col,
            });
          } else {
            page.drawLine({
              start: { x: left + w * 0.10, y: top - h * 0.55 },
              end:   { x: left + w * 0.40, y: top - h * 0.85 },
              thickness: lw, color: col,
            });
            page.drawLine({
              start: { x: left + w * 0.40, y: top - h * 0.85 },
              end:   { x: left + w * 0.90, y: top - h * 0.15 },
              thickness: lw, color: col,
            });
          }
          continue;
        }

        // Date / text: draw vector text
        if (!arimo) continue;
        const fontPx = t.fontPx;
        // Baseline sits about 20% up from the bottom of our layout box.
        const baselineY = height - (p.y + p.h) + p.h * 0.22;
        page.drawText(t.value, {
          x: p.x + 3,
          y: baselineY,
          size: fontPx,
          font: arimo,
          color: col,
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
        subheading={`${placements.length} placement${placements.length === 1 ? "" : "s"} added.`}
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
  const stepIdx: 0 | 1 | 2 = !canPlace ? 0 : placements.length === 0 ? 1 : 2;

  const showImagePads = active === "signature" || active === "initials";
  const savedList = active === "initials" ? savedInits : savedSigs;

  return (
    <>
      <ToolWorkspace
        title="Sign PDF"
        actionLabel="Sign PDF"
        loadingLabel="Signing…"
        onAction={run}
        loading={loading}
        actionDisabled={!placements.length}
        sidebar={
          <>
            {/* 1-2-3 strip */}
            <StepStrip step={stepIdx} />

            {/* Kind selector (5 primitives) */}
            <div className="grid grid-cols-5 gap-1 rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
              {([
                { id: "signature", label: "Sign" },
                { id: "initials",  label: "Init." },
                { id: "date",      label: "Date" },
                { id: "text",      label: "Text" },
                { id: "check",     label: "Check" },
              ] as { id: Kind; label: string }[]).map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setActive(k.id)}
                  className="rounded-md py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    backgroundColor: active === k.id ? "#ffffff" : "transparent",
                    color: active === k.id ? "#33333c" : "#5a5a66",
                    boxShadow: active === k.id ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            {/* Signature / Initials creators */}
            {showImagePads && (
              <>
                <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
                  {([
                    { id: "draw",   label: "Draw",   icon: Pen },
                    { id: "type",   label: "Type",   icon: TypeIcon },
                    { id: "upload", label: "Upload", icon: UploadIcon },
                    { id: "saved",  label: "Saved",  icon: Bookmark },
                  ] as { id: Tab; label: string; icon: typeof Pen }[]).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[11.5px] font-semibold transition-colors"
                      style={{
                        backgroundColor: tab === id ? "#ffffff" : "transparent",
                        color: tab === id ? "#33333c" : "#5a5a66",
                        boxShadow: tab === id ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>

                {tab === "draw" && (
                  <DrawTab
                    onCommit={setCurrentImage}
                    isMobile={isMobile}
                    onSave={(sig) => saveCurrent(active as "signature" | "initials", sig)}
                  />
                )}
                {tab === "type" && (
                  <TypePad
                    onCommit={setCurrentImage}
                    onSave={(sig) => saveCurrent(active as "signature" | "initials", sig)}
                  />
                )}
                {tab === "upload" && (
                  <UploadPad
                    onCommit={setCurrentImage}
                    onSave={(sig) => saveCurrent(active as "signature" | "initials", sig)}
                  />
                )}
                {tab === "saved" && (
                  <SavedTab
                    list={savedList}
                    onUse={(s) => setCurrentImage({ dataUrl: s.dataUrl, w: s.w, h: s.h })}
                    onDelete={(id) => deleteSaved(active as "signature" | "initials", id)}
                    onClear={() => clearSaved(active as "signature" | "initials")}
                  />
                )}
              </>
            )}

            {/* Date pad */}
            {active === "date" && (
              <DatePad
                format={dateFormat}
                setFormat={setDateFormat}
                color={dateColor}
                setColor={setDateColor}
              />
            )}

            {/* Text pad */}
            {active === "text" && (
              <TextStampPad
                value={textInput}
                setValue={setTextInput}
                color={textColor}
                setColor={setTextColor}
              />
            )}

            {/* Check pad */}
            {active === "check" && (
              <CheckPad
                kind={checkKind}
                setKind={setCheckKind}
                color={checkColor}
                setColor={setCheckColor}
              />
            )}

            {/* Preview + Place */}
            {(current || active === "date" || active === "text" || active === "check") && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
                  Preview
                </p>
                <div className="rounded-lg p-3" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                  <PreviewChip
                    active={active}
                    current={current}
                    dateValue={formatDate(new Date(), dateFormat)}
                    dateColor={dateColor}
                    textValue={textInput}
                    textColor={textColor}
                    checkKind={checkKind}
                    checkColor={checkColor}
                  />
                </div>
                {stampMode === active ? (
                  <button
                    type="button"
                    onClick={() => setStampMode(null)}
                    className="mt-3 w-full rounded-lg py-2.5 text-[13px] font-bold uppercase text-white transition-colors"
                    style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
                  >
                    Done placing
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={placeOnDocument}
                    disabled={!canPlace}
                    data-pulse={pulsePlace ? "1" : "0"}
                    className="sign-place-btn mt-3 w-full rounded-lg py-2.5 text-[13px] font-bold uppercase text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#33333c", letterSpacing: "0.04em" }}
                  >
                    Place on document
                  </button>
                )}
                {stampMode === active && (
                  <p className="mt-2 text-center text-[11.5px]" style={{ color: "#5a5a66" }}>
                    <MousePointerClick className="mr-1 inline h-3 w-3" />
                    Tap where you want it. Press Esc to finish.
                  </p>
                )}
              </div>
            )}

            {/* Selected placement actions */}
            {selectedId && (
              <div className="rounded-lg p-3" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                <p className="mb-2 text-[12px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
                  Selected placement
                </p>
                <button
                  type="button"
                  onClick={applySelectedToAllPages}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-[12.5px] font-semibold text-[#33333c] hover:bg-white"
                  style={{ border: "1px solid #ececef", backgroundColor: "#ffffff" }}
                >
                  <Copy className="h-3.5 w-3.5" /> Apply to all pages
                </button>
                <p className="mt-1.5 text-center text-[11px]" style={{ color: "#5a5a66" }}>
                  Same relative position on every page. Skips pages that already have it.
                </p>
              </div>
            )}

            {/* Page navigator */}
            {pages.length > 1 && (
              <div className="flex items-center justify-between rounded-lg p-2" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                <button
                  type="button"
                  onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage <= 0}
                  className="grid h-8 w-8 place-items-center rounded-md text-[#33333c] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[12.5px] font-semibold" style={{ color: "#33333c" }}>
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage >= pages.length - 1}
                  className="grid h-8 w-8 place-items-center rounded-md text-[#33333c] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <InfoTip>
              {placements.length
                ? `${placements.length} placement${placements.length === 1 ? "" : "s"} on document. Tap to select, drag to move, corners to resize. Arrow keys nudge, Delete removes.`
                : "Create a signature, date, text or check, then tap \"Place on document\". Select any placement and use \"Apply to all pages\"."}
            </InfoTip>

            {hasRotatedPages && (
              <p className="text-[11.5px]" style={{ color: "#a15c1a" }}>
                Note: rotated pages are shown in their native orientation for accurate placement.
              </p>
            )}
          </>
        }
      >
        {stampMode && (
          <div
            className="sticky top-2 z-20 mb-3 flex items-center justify-between gap-3 rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-md"
            style={{ backgroundColor: "#33333c" }}
          >
            <span className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Tap where you want it
            </span>
            <button
              type="button"
              onClick={() => setStampMode(null)}
              className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold hover:bg-white/25"
            >
              Cancel
            </button>
          </div>
        )}

        <div ref={pagesContainerRef} className="space-y-4 pb-24 sm:pb-4">
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
              onRemove={(id) => { setPlacements((prev) => prev.filter((p) => p.id !== id)); if (selectedId === id) setSelectedId(null); }}
              signature={signature}
              initials={initials}
              stampKind={stampMode}
              onStamp={stampAt}
              registerEl={registerPageEl}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </ToolWorkspace>

      {/* Sticky mobile bottom bar */}
      {pages.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ececef] bg-white/95 p-3 backdrop-blur sm:hidden">
          {stampMode ? (
            <button
              type="button"
              onClick={() => setStampMode(null)}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white"
              style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            >
              Done placing
            </button>
          ) : placements.length ? (
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white disabled:opacity-60"
              style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            >
              {loading ? "Signing…" : "Sign PDF"}
            </button>
          ) : canPlace ? (
            <button
              type="button"
              onClick={placeOnDocument}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white"
              style={{ backgroundColor: "#33333c", letterSpacing: "0.04em" }}
            >
              Place on document
            </button>
          ) : (
            <p className="text-center text-[13px] font-semibold text-[#5a5a66]">
              Create a signature or pick a stamp above
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes signPulseOnce {
          0% { box-shadow: 0 0 0 0 rgba(229,50,45,0.55); }
          70% { box-shadow: 0 0 0 12px rgba(229,50,45,0); }
          100% { box-shadow: 0 0 0 0 rgba(229,50,45,0); }
        }
        .sign-place-btn[data-pulse="1"] {
          animation: signPulseOnce 1.2s ease-out 1;
        }
      `}</style>
    </>
  );
}

/* ============================== Step strip ============================== */

function StepStrip({ step }: { step: 0 | 1 | 2 }) {
  const steps = ["Create a stamp", "Place on document", "Download signed PDF"];
  return (
    <ol className="flex items-center gap-1.5">
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <div
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11.5px] font-semibold"
              style={{
                backgroundColor: active ? "#fff6f5" : done ? "#f4f4f6" : "#fafafb",
                color: active ? "#e5322d" : done ? "#33333c" : "#a1a1ab",
                border: active ? "1px solid #f3c9c7" : "1px solid transparent",
                flex: 1,
              }}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: active ? "#e5322d" : done ? "#33333c" : "#d4d4dc",
                  color: "#ffffff",
                }}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span className="truncate">{label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================== Preview chip ============================== */

function PreviewChip({
  active, current, dateValue, dateColor, textValue, textColor, checkKind, checkColor,
}: {
  active: Kind;
  current: Signature | null;
  dateValue: string;
  dateColor: string;
  textValue: string;
  textColor: string;
  checkKind: CheckKind;
  checkColor: string;
}) {
  if (active === "signature" || active === "initials") {
    return current
      ? <img src={current.dataUrl} alt="Signature preview" className="mx-auto max-h-16" />
      : <p className="text-center text-[12px] text-[#a1a1ab]">Create a signature first</p>;
  }
  if (active === "date") {
    return <p className="text-center" style={{ fontFamily: "'ArimoSignPdf', Arial, sans-serif", color: dateColor, fontSize: 18 }}>{dateValue}</p>;
  }
  if (active === "text") {
    return textValue.trim()
      ? <p className="text-center" style={{ fontFamily: "'ArimoSignPdf', Arial, sans-serif", color: textColor, fontSize: 18 }}>{textValue}</p>
      : <p className="text-center text-[12px] text-[#a1a1ab]">Type a line above</p>;
  }
  // check
  return (
    <div className="mx-auto grid h-10 w-10 place-items-center">
      <CheckGlyph kind={checkKind} color={checkColor} />
    </div>
  );
}

function CheckGlyph({ kind, color, size = 36 }: { kind: CheckKind; color: string; size?: number }) {
  if (kind === "cross") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <line x1="15" y1="15" x2="85" y2="85" stroke={color} strokeWidth="14" strokeLinecap="round" />
        <line x1="15" y1="85" x2="85" y2="15" stroke={color} strokeWidth="14" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polyline points="10,55 40,85 90,15" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================== Page overlay ============================== */

function PageOverlay({
  index, page, placements, onChange, onRemove,
  signature, initials, stampKind, onStamp, registerEl, selectedId, onSelect,
}: {
  index: number;
  page: PageInfo;
  placements: Placement[];
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
  signature: Signature | null;
  initials: Signature | null;
  stampKind: Kind | null;
  onStamp: (pageIndex: number, cxPts: number, cyPts: number) => void;
  registerEl: (idx: number, el: HTMLElement | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    registerEl(index, cardRef.current);
    return () => registerEl(index, null);
  }, [index, registerEl]);

  const scale = displayW ? displayW / page.width : 0;
  const displayH = page.height * scale;

  return (
    <div ref={cardRef} data-page-index={index} className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold" style={{ color: "#5a5a66" }}>Page {index + 1}</p>
        {placements.length > 0 && (
          <p className="text-[11.5px]" style={{ color: "#5a5a66" }}>
            {placements.length} placement{placements.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <div
        ref={wrapRef}
        className="relative mx-auto w-full select-none"
        style={{
          height: displayH || undefined,
          touchAction: "none",
          cursor: stampKind ? "crosshair" : "default",
        }}
        onPointerMove={(e) => {
          if (!stampKind || !scale) return;
          const r = e.currentTarget.getBoundingClientRect();
          setGhost({ x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale });
        }}
        onPointerLeave={() => setGhost(null)}
        onClick={(e) => {
          if (!stampKind || !scale) {
            if (selectedId) onSelect(null);
            return;
          }
          const r = e.currentTarget.getBoundingClientRect();
          const cx = (e.clientX - r.left) / scale;
          const cy = (e.clientY - r.top) / scale;
          onStamp(index, cx, cy);
        }}
      >
        <img src={page.url} alt={`Page ${index + 1}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        {scale > 0 &&
          placements.map((p) => (
            <PlacementBox
              key={p.id}
              placement={p}
              scale={scale}
              pageW={page.width}
              pageH={page.height}
              signature={signature}
              initials={initials}
              onChange={onChange}
              onRemove={onRemove}
              selected={selectedId === p.id}
              onSelect={onSelect}
            />
          ))}
        {stampKind && ghost && scale > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute opacity-60"
            style={{
              left: (ghost.x - 12) * scale,
              top: (ghost.y - 12) * scale,
              width: 24 * scale,
              height: 24 * scale,
            }}
          >
            <div className="h-full w-full rounded-full" style={{ border: "1.5px dashed #e5322d" }} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== Placement box ============================== */

type DragMode =
  | { kind: "move" }
  | { kind: "resize"; corner: "nw" | "ne" | "sw" | "se" }
  | { kind: "rotate" };

function PlacementBox({
  placement, scale, pageW, pageH,
  signature, initials,
  onChange, onRemove, selected, onSelect,
}: {
  placement: Placement;
  scale: number;
  pageW: number;
  pageH: number;
  signature: Signature | null;
  initials: Signature | null;
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const dragRef = useRef<{
    mode: DragMode;
    startClientX: number;
    startClientY: number;
    start: Placement;
    boxCenterClientX: number;
    boxCenterClientY: number;
  } | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const isText = placement.kind === "date" || placement.kind === "text" || placement.kind === "check";
  const canRotate = !isText;

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(placement.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = boxRef.current!.getBoundingClientRect();
    dragRef.current = {
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      start: { ...placement },
      boxCenterClientX: box.left + box.width / 2,
      boxCenterClientY: box.top + box.height / 2,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    e.preventDefault();
    const dx = (e.clientX - d.startClientX) / scale;
    const dy = (e.clientY - d.startClientY) / scale;

    if (d.mode.kind === "move") {
      const x = Math.max(0, Math.min(pageW - d.start.w, d.start.x + dx));
      const y = Math.max(0, Math.min(pageH - d.start.h, d.start.y + dy));
      onChange({ ...d.start, x, y });
      return;
    }

    if (d.mode.kind === "rotate") {
      const ang = Math.atan2(e.clientY - d.boxCenterClientY, e.clientX - d.boxCenterClientX);
      let deg = ang * 180 / Math.PI + 90;
      while (deg > 180) deg -= 360;
      while (deg < -180) deg += 360;
      for (const t of [0, 90, 180, -180, -90]) {
        if (Math.abs(deg - t) < 5) { deg = t === -180 ? 180 : t; break; }
      }
      onChange({ ...d.start, rotation: Math.round(deg) });
      return;
    }

    const aspect = d.start.h / d.start.w;
    const corner = d.mode.corner;
    const anchor = {
      x: corner === "nw" ? d.start.x + d.start.w : corner === "ne" ? d.start.x : corner === "sw" ? d.start.x + d.start.w : d.start.x,
      y: corner === "nw" ? d.start.y + d.start.h : corner === "ne" ? d.start.y + d.start.h : corner === "sw" ? d.start.y : d.start.y,
    };
    const dragged = {
      x: (corner === "nw" || corner === "sw") ? d.start.x + dx : d.start.x + d.start.w + dx,
      y: (corner === "nw" || corner === "ne") ? d.start.y + dy : d.start.y + d.start.h + dy,
    };
    let w = Math.abs(dragged.x - anchor.x);
    let h = Math.abs(dragged.y - anchor.y);
    if (h / w > aspect) w = h / aspect; else h = w * aspect;
    w = Math.max(24, w);
    h = Math.max(24 * aspect, w * aspect);
    const newX = corner === "ne" || corner === "se" ? anchor.x : anchor.x - w;
    const newY = corner === "sw" || corner === "se" ? anchor.y : anchor.y - h;
    let x = Math.max(0, Math.min(pageW - w, newX));
    let y = Math.max(0, Math.min(pageH - h, newY));
    if (x + w > pageW) w = pageW - x;
    if (y + h > pageH) { h = pageH - y; w = h / aspect; }
    // Keep font size proportional for text placements
    const nextText = d.start.text ? {
      ...d.start.text,
      fontPx: Math.max(8, (d.start.text.fontPx * h) / d.start.h),
    } : undefined;
    onChange({ ...d.start, x, y, w, h, text: nextText });
  };

  const endDrag = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const HANDLE = "grid place-items-center rounded-full bg-[#e5322d] text-white touch-none";
  const cornerBase: React.CSSProperties = {
    width: 24, height: 24, border: "2px solid #ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
  };

  const sig = placement.kind === "signature" ? signature : placement.kind === "initials" ? initials : null;

  const renderInner = () => {
    if (placement.kind === "signature" || placement.kind === "initials") {
      if (!sig) return null;
      return (
        <img
          src={sig.dataUrl}
          alt="Signature"
          className="pointer-events-none h-full w-full object-contain p-1"
          draggable={false}
        />
      );
    }
    const t = placement.text;
    if (!t) return null;
    if (t.variant === "check") {
      return (
        <div className="pointer-events-none grid h-full w-full place-items-center">
          <CheckGlyph kind={t.checkKind ?? "check"} color={t.color} size={Math.max(12, Math.min(placement.w, placement.h) * scale)} />
        </div>
      );
    }
    return (
      <div
        className="pointer-events-none grid h-full w-full items-center"
        style={{
          fontFamily: "'ArimoSignPdf', Arial, sans-serif",
          color: t.color,
          fontSize: Math.max(6, t.fontPx * scale),
          lineHeight: 1.2,
          paddingLeft: 3 * scale,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {t.value}
      </div>
    );
  };

  return (
    <div
      ref={boxRef}
      className="group absolute"
      onClick={(e) => e.stopPropagation()}
      style={{
        left: placement.x * scale,
        top: placement.y * scale,
        width: placement.w * scale,
        height: placement.h * scale,
        touchAction: "none",
      }}
    >
      <div
        style={{
          transform: placement.rotation ? `rotate(${placement.rotation}deg)` : undefined,
          transformOrigin: "50% 50%",
          width: "100%", height: "100%", position: "relative",
        }}
      >
        <div
          onPointerDown={startDrag({ kind: "move" })}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute inset-0 cursor-move rounded-sm"
          style={{
            border: selected ? "1.5px solid #e5322d" : "1.5px dashed #e5322d",
            backgroundColor: selected ? "rgba(229,50,45,0.06)" : "rgba(229,50,45,0.04)",
          }}
        >
          {renderInner()}
        </div>

        {selected && (
          <>
            {canRotate && (
              <div
                onPointerDown={startDrag({ kind: "rotate" })}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={cn(HANDLE, "absolute cursor-grab")}
                style={{ ...cornerBase, left: "50%", top: -34, transform: "translateX(-50%)" }}
                aria-label="Rotate"
              >
                <RotateCw className="h-3 w-3" />
              </div>
            )}
            {(["nw", "ne", "sw", "se"] as const).map((c) => {
              const pos: React.CSSProperties =
                c === "nw" ? { left: -12, top: -12, cursor: "nwse-resize" } :
                c === "ne" ? { right: -12, top: -12, cursor: "nesw-resize" } :
                c === "sw" ? { left: -12, bottom: -12, cursor: "nesw-resize" } :
                { right: -12, bottom: -12, cursor: "nwse-resize" };
              return (
                <div
                  key={c}
                  onPointerDown={startDrag({ kind: "resize", corner: c })}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className={cn(HANDLE, "absolute")}
                  style={{ ...cornerBase, ...pos }}
                  aria-label={`Resize ${c}`}
                />
              );
            })}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => onRemove(placement.id)}
        className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-[#e5322d] shadow"
        style={{ border: "1px solid #ececef" }}
        aria-label="Remove placement"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ============================== Draw tab (inline + fullscreen sheet) ============================== */

function DrawTab({
  onCommit, isMobile, onSave,
}: {
  onCommit: (sig: Signature | null) => void;
  isMobile: boolean;
  onSave: (sig: Signature) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState<Signature | null>(null);
  const [saveOptIn, setSaveOptIn] = useState(false);

  const commit = (sig: Signature | null) => {
    setPreview(sig);
    onCommit(sig);
    if (sig && saveOptIn) onSave(sig);
  };

  return (
    <>
      {isMobile ? (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-6 text-[13px] font-semibold transition-colors"
          style={{ border: "1px dashed #cfcfd6", color: "#33333c", backgroundColor: "#fafafb" }}
        >
          <Maximize2 className="h-4 w-4" />
          {preview ? "Redraw signature" : "Open drawing pad"}
        </button>
      ) : (
        <DrawPad heightPx={220} onCommit={commit} onOpenFullscreen={() => setSheetOpen(true)} />
      )}
      <SaveOptIn checked={saveOptIn} onChange={setSaveOptIn} />
      {sheetOpen && (
        <FullscreenDrawSheet
          initial={null}
          onClose={() => setSheetOpen(false)}
          onDone={(sig) => { commit(sig); setSheetOpen(false); }}
        />
      )}
    </>
  );
}

function FullscreenDrawSheet({
  onClose, onDone,
}: {
  initial: Signature | null;
  onClose: () => void;
  onDone: (sig: Signature | null) => void;
}) {
  const [portrait, setPortrait] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight >= window.innerWidth : true,
  );
  const localCommitRef = useRef<Signature | null>(null);

  useEffect(() => {
    const onResize = () => setPortrait(window.innerHeight >= window.innerWidth);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ touchAction: "none" }}>
      <div className="flex items-center justify-between border-b border-[#ececef] px-4 py-3">
        <button type="button" onClick={onClose} className="text-[14px] font-semibold text-[#5a5a66]">
          Cancel
        </button>
        <p className="text-[14px] font-bold text-[#33333c]">Draw signature</p>
        <button
          type="button"
          onClick={() => onDone(localCommitRef.current)}
          disabled={!localCommitRef.current}
          className="rounded-md px-3 py-1.5 text-[13px] font-bold uppercase text-white disabled:opacity-50"
          style={{ backgroundColor: "#e5322d" }}
        >
          Done
        </button>
      </div>
      {portrait && (
        <p className="bg-[#fff6f5] px-4 py-2 text-center text-[12px] font-semibold text-[#a15c1a]">
          Rotate your phone for more room
        </p>
      )}
      <div className="flex-1 p-3">
        <DrawPad fill onCommit={(sig) => { localCommitRef.current = sig; }} />
      </div>
    </div>
  );
}

function DrawPad({
  heightPx, fill, onCommit, onOpenFullscreen,
}: {
  heightPx?: number;
  fill?: boolean;
  onCommit: (sig: Signature | null) => void;
  onOpenFullscreen?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(THICKNESS[1].size);
  const strokesRef = useRef<StrokeRec[]>([]);
  const currentRef = useRef<StrokeRec | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);

  const setup = useCallback(() => {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = w.getBoundingClientRect();
    c.width = Math.max(1, Math.floor(rect.width * ratio));
    c.height = Math.max(1, Math.floor(rect.height * ratio));
    c.style.width = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setup();
    const ro = new ResizeObserver(setup);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [setup]);

  const redraw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.scale(ratio, ratio);
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (currentRef.current) drawStroke(ctx, currentRef.current);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: StrokeRec) => {
    if (s.points.length === 0) return;
    const outline = getStroke(s.points, {
      size: s.size,
      thinning: 0.55,
      smoothing: 0.6,
      streamline: 0.55,
      simulatePressure: true,
      last: currentRef.current !== s,
    });
    if (!outline.length) return;
    const path = new Path2D();
    path.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length; i++) {
      const [x0, y0] = outline[i - 1];
      const [x1, y1] = outline[i];
      path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    path.closePath();
    ctx.fillStyle = s.color;
    ctx.fill(path);
  };

  const pos = (e: React.PointerEvent): StrokePoint => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const p = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return [e.clientX - rect.left, e.clientY - rect.top, p];
  };

  const commit = () => {
    const c = canvasRef.current; if (!c) return;
    if (strokesRef.current.length === 0) { onCommit(null); return; }
    const trimmed = trimTransparent(c);
    if (!trimmed) { onCommit(null); return; }
    onCommit({ dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h });
  };

  const undo = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
    commit();
  };

  const clear = () => {
    strokesRef.current = [];
    setStrokeCount(0);
    redraw();
    onCommit(null);
  };

  const style: React.CSSProperties = fill
    ? { width: "100%", height: "100%" }
    : { width: "100%", height: heightPx ?? 220 };

  return (
    <div className={fill ? "flex h-full flex-col" : ""}>
      <div
        ref={wrapRef}
        className="relative rounded-lg bg-white"
        style={{ ...style, border: "1px dashed #cfcfd6", touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-lg"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            currentRef.current = { points: [pos(e)], color, size };
            redraw();
          }}
          onPointerMove={(e) => {
            if (!currentRef.current) return;
            e.preventDefault();
            currentRef.current.points.push(pos(e));
            redraw();
          }}
          onPointerUp={(e) => {
            try { (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
            const s = currentRef.current;
            currentRef.current = null;
            if (s && s.points.length > 1) {
              strokesRef.current.push(s);
              setStrokeCount(strokesRef.current.length);
              redraw();
              commit();
            } else {
              redraw();
            }
          }}
          onPointerCancel={() => { currentRef.current = null; redraw(); }}
        />
        {strokeCount === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-[#a1a1ab]">
            Sign here
          </p>
        )}
      </div>

      <div className={cn("mt-2 flex flex-wrap items-center gap-3", fill && "px-1")}>
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.name}
              className="h-7 w-7 rounded-full transition-transform"
              style={{
                backgroundColor: c.value,
                outline: color === c.value ? "2px solid #33333c" : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "#f4f4f6" }}>
          {THICKNESS.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSize(t.size)}
              className="rounded-md px-2 py-1 text-[11.5px] font-semibold"
              style={{
                backgroundColor: size === t.size ? "#ffffff" : "transparent",
                color: size === t.size ? "#33333c" : "#5a5a66",
                boxShadow: size === t.size ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={strokeCount === 0}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d] disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={strokeCount === 0}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d] disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d]"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Type + Upload pads ============================== */

function TypePad({
  onCommit, onSave,
}: {
  onCommit: (sig: Signature | null) => void;
  onSave: (sig: Signature) => void;
}) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(TYPE_FONTS[0].family);
  const [color, setColor] = useState(COLORS[0].value);
  const [saveOptIn, setSaveOptIn] = useState(false);
  const lastCommittedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!text.trim()) { onCommit(null); lastCommittedRef.current = null; return; }
    let cancelled = false;
    void (async () => {
      // The cursive faces now arrive with this tool chunk, so wait for them
      // before measuring or drawing, otherwise canvas would use a fallback.
      await ensureSignatureFonts();
      if (cancelled) return;
      const rendered = renderTextToPng(text, font, color);
      if (rendered) {
        onCommit(rendered);
        if (saveOptIn && lastCommittedRef.current !== rendered.dataUrl) {
          lastCommittedRef.current = rendered.dataUrl;
          onSave(rendered);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, font, color, saveOptIn]);

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
            className="rounded-lg p-2 text-center transition-colors"
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
      <SaveOptIn checked={saveOptIn} onChange={setSaveOptIn} />
    </div>
  );
}

function UploadPad({
  onCommit, onSave,
}: {
  onCommit: (sig: Signature | null) => void;
  onSave: (sig: Signature) => void;
}) {
  const [removeBg, setRemoveBg] = useState(true);
  const [threshold, setThreshold] = useState(230);
  const [saveOptIn, setSaveOptIn] = useState(false);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const rawRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(() => {
    const img = rawRef.current; if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);

    let outCanvas: HTMLCanvasElement = canvas;

    if (removeBg) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const px = data.data;
      const t = threshold;
      const feather = 22; // soft edge zone
      let removed = 0;
      const total = px.length / 4;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum >= t) {
          px[i + 3] = 0; removed++;
        } else if (lum >= t - feather) {
          // Soft fade in the feather band for a 1px edge cleanup
          const fade = (lum - (t - feather)) / feather;
          px[i + 3] = Math.round(px[i + 3] * (1 - fade));
        }
      }
      // If almost everything got removed, fall back to original
      if (removed / total > 0.97) {
        toast.warning("Background removal looked empty. Kept the original image.");
      } else {
        ctx.putImageData(data, 0, 0);
      }
    }

    const trimmed = trimTransparent(outCanvas);
    const sig: Signature = trimmed
      ? { dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h }
      : { dataUrl: outCanvas.toDataURL("image/png"), w: outCanvas.width, h: outCanvas.height };
    setAfterUrl(sig.dataUrl);
    onCommit(sig);
    if (saveOptIn) onSave(sig);
  }, [removeBg, threshold, saveOptIn, onCommit, onSave]);

  const handleFile = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImg(url);
      URL.revokeObjectURL(url);
      rawRef.current = img;
      // Show original as before preview
      const beforeCanvas = document.createElement("canvas");
      beforeCanvas.width = img.naturalWidth; beforeCanvas.height = img.naturalHeight;
      beforeCanvas.getContext("2d")!.drawImage(img, 0, 0);
      setBeforeUrl(beforeCanvas.toDataURL("image/png"));
      // process below via effect on state changes
      queueMicrotask(process);
    } catch (e) {
      toast.error(`Upload failed: ${(e as Error).message}`);
    }
  };

  // Re-process when knobs change (if we have a raw image)
  useEffect(() => {
    if (rawRef.current) process();
  }, [removeBg, threshold, process]);

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

      {removeBg && (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label className="text-[11.5px] font-semibold text-[#5a5a66]">Sensitivity</Label>
            <span className="text-[11.5px] text-[#5a5a66]">{threshold}</span>
          </div>
          <input
            type="range"
            min={180}
            max={250}
            step={1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
          />
          <p className="mt-1 text-[11px] text-[#5a5a66]">
            Lower removes more (pale strokes may fade). Higher keeps more paper texture.
          </p>
        </div>
      )}

      {(beforeUrl || afterUrl) && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-[11px] font-semibold text-[#5a5a66]">Before</p>
            <div className="grid h-16 place-items-center rounded-md bg-white" style={{ border: "1px solid #ececef" }}>
              {beforeUrl && <img src={beforeUrl} alt="Before" className="max-h-14 object-contain" />}
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold text-[#5a5a66]">After</p>
            <div
              className="grid h-16 place-items-center rounded-md"
              style={{
                border: "1px solid #ececef",
                backgroundImage:
                  "linear-gradient(45deg,#eee 25%,transparent 25%),linear-gradient(-45deg,#eee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eee 75%),linear-gradient(-45deg,transparent 75%,#eee 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0,0 5px,5px -5px,-5px 0",
              }}
            >
              {afterUrl && <img src={afterUrl} alt="After" className="max-h-14 object-contain" />}
            </div>
          </div>
        </div>
      )}

      <SaveOptIn checked={saveOptIn} onChange={setSaveOptIn} />
    </div>
  );
}

function SavedTab({
  list, onUse, onDelete, onClear,
}: {
  list: SavedSig[];
  onUse: (s: SavedSig) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  if (!list.length) {
    return (
      <div className="rounded-lg p-4 text-center" style={{ border: "1px dashed #cfcfd6", backgroundColor: "#fafafb" }}>
        <p className="text-[12.5px] font-semibold text-[#33333c]">No saved signatures yet</p>
        <p className="mt-1 text-[11.5px] text-[#5a5a66]">
          Create a signature and tick "Save on this device" to keep it for next time.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {list.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-2 rounded-lg p-2"
          style={{ border: "1px solid #ececef", backgroundColor: "#ffffff" }}
        >
          <button
            type="button"
            onClick={() => onUse(s)}
            className="flex flex-1 items-center justify-center rounded-md bg-white p-1 hover:bg-[#fafafb]"
            style={{ border: "1px solid #f0f0f2" }}
          >
            <img src={s.dataUrl} alt="Saved" className="max-h-10 object-contain" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(s.id)}
            className="grid h-7 w-7 place-items-center rounded-full text-[#5a5a66] hover:bg-[#f4f4f6] hover:text-[#e5322d]"
            aria-label="Delete saved signature"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="w-full text-[11.5px] font-semibold text-[#5a5a66] hover:text-[#e5322d]"
      >
        Remove all
      </button>
      <p className="text-[11px]" style={{ color: "#5a5a66" }}>
        Saved only in your browser on this device. Never uploaded. Clearing browser data removes them.
      </p>
    </div>
  );
}

function SaveOptIn({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2 text-[12px]" style={{ color: "#33333c" }}>
      <Checkbox
        className="mt-0.5"
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
      />
      <span>
        Save on this device for next time.
        <span className="block text-[11px] text-[#5a5a66]">
          Stored only in your browser. Never uploaded.
        </span>
      </span>
    </label>
  );
}

/* ============================== Date / Text / Check pads ============================== */

function DatePad({
  format, setFormat, color, setColor,
}: {
  format: DateFormat;
  setFormat: (f: DateFormat) => void;
  color: string;
  setColor: (c: string) => void;
}) {
  const today = formatDate(new Date(), format);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg p-3" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
        <CalendarIcon className="h-4 w-4 text-[#5a5a66]" />
        <span style={{ fontFamily: "'ArimoSignPdf', Arial, sans-serif", fontSize: 16, color }}>{today}</span>
      </div>
      <div>
        <Label className="text-[11.5px] font-semibold text-[#5a5a66]">Format</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {DATE_FORMATS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setFormat(d.id)}
              className="rounded-md py-1.5 text-[11.5px] font-semibold"
              style={{
                border: format === d.id ? "2px solid #e5322d" : "1px solid #ececef",
                backgroundColor: format === d.id ? "#fff6f5" : "#ffffff",
                color: "#33333c",
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <ColorRow colors={TEXT_COLORS} value={color} onChange={setColor} />
      <p className="text-[11px]" style={{ color: "#5a5a66" }}>
        Exports as crisp vector text using an embedded Arimo font. Editable after placing.
      </p>
    </div>
  );
}

function TextStampPad({
  value, setValue, color, setColor,
}: {
  value: string;
  setValue: (v: string) => void;
  color: string;
  setColor: (c: string) => void;
}) {
  const complex = hasComplexScript(value);
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="stamp-text" className="text-xs">Text</Label>
        <Input
          id="stamp-text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='e.g. Approved, John Smith, Mumbai'
          className="mt-1"
        />
      </div>
      <ColorRow colors={TEXT_COLORS} value={color} onChange={setColor} />
      {complex && (
        <p className="rounded-md p-2 text-[11.5px] font-semibold" style={{ backgroundColor: "#fff6f5", color: "#a15c1a" }}>
          This script isn't supported yet. Please use Latin characters.
        </p>
      )}
    </div>
  );
}

function CheckPad({
  kind, setKind, color, setColor,
}: {
  kind: CheckKind;
  setKind: (k: CheckKind) => void;
  color: string;
  setColor: (c: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(["check", "cross"] as CheckKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className="grid place-items-center rounded-lg py-3"
            style={{
              border: kind === k ? "2px solid #e5322d" : "1px solid #ececef",
              backgroundColor: kind === k ? "#fff6f5" : "#ffffff",
            }}
          >
            {k === "check" ? <CheckSquare className="h-6 w-6" color={color} /> : <XSquare className="h-6 w-6" color={color} />}
            <span className="mt-1 text-[11.5px] font-semibold text-[#33333c]">
              {k === "check" ? "Check" : "Cross"}
            </span>
          </button>
        ))}
      </div>
      <ColorRow colors={TEXT_COLORS} value={color} onChange={setColor} />
    </div>
  );
}

function ColorRow({
  colors, value, onChange,
}: {
  colors: { name: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          aria-label={c.name}
          className="h-6 w-6 rounded-full"
          style={{
            backgroundColor: c.value,
            outline: value === c.value ? "2px solid #33333c" : "none",
            outlineOffset: 2,
          }}
        />
      ))}
    </div>
  );
}


const SIGNATURE_FAMILIES = ["Dancing Script", "Great Vibes", "Caveat", "Sacramento"];
let signatureFontsPromise: Promise<unknown> | null = null;

/** Wait until the cursive families are decoded. Canvas must never fall back. */
function ensureSignatureFonts(): Promise<unknown> {
  if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
  if (!signatureFontsPromise) {
    signatureFontsPromise = Promise.all([
      ...SIGNATURE_FAMILIES.flatMap((f) => [
        document.fonts.load(`96px "${f}"`),
        document.fonts.load(`600 96px "${f}"`),
      ]),
    ])
      .then(() => document.fonts.ready)
      .catch(() => undefined);
  }
  return signatureFontsPromise;
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

function hexToPdfRgb(hex: string) {
  const c = hex.replace("#", "");
  const s = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const n = parseInt(s, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
