import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import {
  Camera,
  X,
  Plus,
  RotateCw,
  SwitchCamera,
  Check,
  ImageIcon,
  Crop as CropIcon,
  GripVertical,
  Info,
  Eye,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import { straightenCropDims } from "@/lib/imageMath";
import {
  detectDocumentQuad,
  outputSizeForQuad,
  warpQuadToRect,
  clampCornerMove,
  isConvexQuad,
  type Quad,
  type Point as ScanPoint,
} from "@/lib/scanGeometry";

type FilterKind = "original" | "document" | "grayscale" | "bw";
type PageSize = "a4" | "letter" | "fit";
type Orientation = "auto" | "portrait" | "landscape";
type QualityPreset = "small" | "medium" | "high";
type FillMode = "fit" | "fill";

const QUALITY: Record<QualityPreset, { q: number; maxEdge: number; approxKB: number }> = {
  small: { q: 0.6, maxEdge: 2000, approxKB: 180 },
  medium: { q: 0.8, maxEdge: 2800, approxKB: 420 },
  high: { q: 0.92, maxEdge: 3600, approxKB: 950 },
};

const INGEST_MAX_EDGE = 3600;
/** Cap heavy per-pixel work (Sauvola, shadow, BC) during preview to keep the UI snappy. */
const PREVIEW_WORK_MAX_EDGE = 1600;

interface ScanPage {
  id: string;
  /** Source photo, downscaled + re-encoded, as a Blob (object URL for preview). */
  blob: Blob;
  url: string;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  filter: FilterKind | null; // null => use default
  crop: { x: number; y: number; w: number; h: number } | null; // 0..1 normalized
  angleDeg: number; // -15..+15
  brightness: number; // -50..+50
  contrast: number; // -50..+50
  shadow: boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const isEdited = (p: ScanPage) =>
  p.rotation !== 0 ||
  p.filter !== null ||
  p.crop !== null ||
  p.angleDeg !== 0 ||
  p.brightness !== 0 ||
  p.contrast !== 0 ||
  p.shadow;

/* ============================================================
 *  Decode + downscale pipeline
 * ============================================================ */

async function decodeBitmap(file: Blob): Promise<{ bmp: ImageBitmap | null; img: HTMLImageElement | null }> {
  try {
    return { bmp: await createImageBitmap(file as File, { imageOrientation: "from-image" }), img: null };
  } catch {
    try {
      return { bmp: await createImageBitmap(file as File), img: null };
    } catch {
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.decoding = "async";
        img.src = url;
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error("Unsupported image"));
        });
        return { bmp: null, img };
      } finally {
        URL.revokeObjectURL(url);
      }
    }
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), mime, quality);
  });
}

/** High-quality stepped downscale to a max long edge. */
function drawStepped(source: CanvasImageSource, srcW: number, srcH: number, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  let curW = srcW;
  let curH = srcH;
  let curSrc: CanvasImageSource = source;
  while (curW * 0.5 > srcW * scale && curH * 0.5 > srcH * scale) {
    const halfW = Math.max(1, Math.floor(curW * 0.5));
    const halfH = Math.max(1, Math.floor(curH * 0.5));
    const c = document.createElement("canvas");
    c.width = halfW;
    c.height = halfH;
    const cx = c.getContext("2d")!;
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = "high";
    cx.drawImage(curSrc, 0, 0, halfW, halfH);
    curSrc = c;
    curW = halfW;
    curH = halfH;
  }
  const outW = Math.max(1, Math.round(srcW * scale));
  const outH = Math.max(1, Math.round(srcH * scale));
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(curSrc, 0, 0, outW, outH);
  return out;
}

async function ingestSource(file: Blob): Promise<ScanPage> {
  const { bmp, img } = await decodeBitmap(file);
  const src: CanvasImageSource = bmp ?? img!;
  const w = bmp ? bmp.width : img!.naturalWidth;
  const h = bmp ? bmp.height : img!.naturalHeight;
  if (!w || !h) throw new Error("Empty image");
  const canvas = drawStepped(src, w, h, INGEST_MAX_EDGE);
  if (bmp) bmp.close();
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  const url = URL.createObjectURL(blob);
  return {
    id: uid(),
    blob,
    url,
    width: canvas.width,
    height: canvas.height,
    rotation: 0,
    filter: null,
    crop: null,
    angleDeg: 0,
    brightness: 0,
    contrast: 0,
    shadow: false,
  };
}

/* ============================================================
 *  Pixel-level cleanup helpers (all pure ImageData math, no ctx.filter)
 * ============================================================ */

/** Rotate 0/90/180/270 into a fresh canvas. */
function rotate90Canvas(src: HTMLCanvasElement, rot: 0 | 90 | 180 | 270): HTMLCanvasElement {
  if (rot === 0) return src;
  const swapped = rot === 90 || rot === 270;
  const W = src.width;
  const H = src.height;
  const out = document.createElement("canvas");
  out.width = swapped ? H : W;
  out.height = swapped ? W : H;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(src, -W / 2, -H / 2);
  return out;
}

/** Straighten by angleDeg with auto-zoom to the inscribed rect (no white corners). */
function straightenCanvas(src: HTMLCanvasElement, angleDeg: number): HTMLCanvasElement {
  if (!angleDeg) return src;
  const W = src.width;
  const H = src.height;
  const { w: cw, h: ch } = straightenCropDims(W, H, angleDeg);
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(cw / 2, ch / 2);
  ctx.rotate((-angleDeg * Math.PI) / 180);
  ctx.drawImage(src, -W / 2, -H / 2);
  return out;
}

/** Estimate illumination via aggressive downscale + upscale, then divide-and-renormalize. */
function shadowRemove(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const bgEdge = 64;
  const scale = Math.min(1, bgEdge / Math.max(W, H));
  const bw = Math.max(1, Math.round(W * scale));
  const bh = Math.max(1, Math.round(H * scale));
  const small = document.createElement("canvas");
  small.width = bw;
  small.height = bh;
  const sctx = small.getContext("2d")!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(canvas, 0, 0, bw, bh);
  const bg = document.createElement("canvas");
  bg.width = W;
  bg.height = H;
  const bgctx = bg.getContext("2d")!;
  bgctx.imageSmoothingEnabled = true;
  bgctx.imageSmoothingQuality = "high";
  bgctx.drawImage(small, 0, 0, W, H);
  const bgData = bgctx.getImageData(0, 0, W, H).data;
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  let meanBg = 0;
  const pixels = bgData.length / 4;
  for (let i = 0; i < bgData.length; i += 4) {
    meanBg += 0.299 * bgData[i] + 0.587 * bgData[i + 1] + 0.114 * bgData[i + 2];
  }
  meanBg = Math.max(1, meanBg / pixels);
  for (let i = 0; i < d.length; i += 4) {
    for (let k = 0; k < 3; k++) {
      const b = Math.max(1, bgData[i + k]);
      const v = (d[i + k] / b) * meanBg;
      d[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Sauvola adaptive threshold via summed-area tables. */
function sauvolaBW(canvas: HTMLCanvasElement) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const n = W * H;
  const gray = new Float64Array(n);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    gray[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  }
  const iw = W + 1;
  const I = new Float64Array(iw * (H + 1));
  const I2 = new Float64Array(iw * (H + 1));
  for (let y = 0; y < H; y++) {
    let rowSum = 0;
    let rowSum2 = 0;
    for (let x = 0; x < W; x++) {
      const g = gray[y * W + x];
      rowSum += g;
      rowSum2 += g * g;
      const idx = (y + 1) * iw + (x + 1);
      I[idx] = I[y * iw + (x + 1)] + rowSum;
      I2[idx] = I2[y * iw + (x + 1)] + rowSum2;
    }
  }
  const long = Math.max(W, H);
  let win = Math.max(15, Math.round(long / 16));
  if ((win & 1) === 0) win += 1; // odd
  const r = (win - 1) >> 1;
  const k = 0.2;
  const R = 128;
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(H - 1, y + r);
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(W - 1, x + r);
      const area = (y1 - y0 + 1) * (x1 - x0 + 1);
      const s =
        I[(y1 + 1) * iw + (x1 + 1)] - I[y0 * iw + (x1 + 1)] - I[(y1 + 1) * iw + x0] + I[y0 * iw + x0];
      const s2 =
        I2[(y1 + 1) * iw + (x1 + 1)] - I2[y0 * iw + (x1 + 1)] - I2[(y1 + 1) * iw + x0] + I2[y0 * iw + x0];
      const mean = s / area;
      const varv = Math.max(0, s2 / area - mean * mean);
      const std = Math.sqrt(varv);
      const t = mean * (1 + k * (std / R - 1));
      const g = gray[y * W + x];
      const v = g > t ? 255 : 0;
      const p = (y * W + x) * 4;
      d[p] = d[p + 1] = d[p + 2] = v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Post-filter brightness (-50..+50) and contrast (-50..+50). Pure ImageData. */
function applyBrightnessContrast(canvas: HTMLCanvasElement, brightness: number, contrast: number) {
  if (brightness === 0 && contrast === 0) return;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  const b = brightness * 2.55; // -127.5..127.5
  const factor = 1 + contrast / 50; // 0..2
  for (let i = 0; i < d.length; i += 4) {
    for (let k = 0; k < 3; k++) {
      const v = (d[i + k] - 128) * factor + 128 + b;
      d[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function applyFilterToCanvas(canvas: HTMLCanvasElement, filter: FilterKind) {
  if (filter === "original") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (filter === "bw") {
    sauvolaBW(canvas);
    return;
  }

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  if (filter === "grayscale") {
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = y;
    }
  } else if (filter === "document") {
    let min = 255;
    let max = 0;
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (y < min) min = y;
      if (y > max) max = y;
    }
    const range = Math.max(1, max - min);
    for (let i = 0; i < d.length; i += 4) {
      for (let k = 0; k < 3; k++) {
        let v = ((d[i + k] - min) * 255) / range;
        v = (v - 128) * 1.15 + 132;
        d[i + k] = Math.max(0, Math.min(255, v));
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* ============================================================
 *  Full render pipeline: crop -> rotate90 -> straighten -> shadow -> filter -> BC
 *  Same code drives thumbnails, editor preview, and export.
 * ============================================================ */

interface RenderOverrides {
  rawCompare?: boolean; // skip cleanup + filter + BC (for press-hold compare)
  workMaxEdge?: number; // cap for heavy per-pixel work (preview vs export)
}

async function renderPageToCanvas(
  page: ScanPage,
  effectiveFilter: FilterKind,
  maxEdge: number,
  overrides: RenderOverrides = {},
): Promise<HTMLCanvasElement> {
  const { bmp, img } = await decodeBitmap(page.blob);
  const src: CanvasImageSource = bmp ?? img!;
  const iw = bmp ? bmp.width : img!.naturalWidth;
  const ih = bmp ? bmp.height : img!.naturalHeight;

  // 1. Crop from source
  const crop = page.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = crop.x * iw;
  const sy = crop.y * ih;
  const sw = Math.max(1, crop.w * iw);
  const sh = Math.max(1, crop.h * ih);
  let working = document.createElement("canvas");
  working.width = Math.max(1, Math.round(sw));
  working.height = Math.max(1, Math.round(sh));
  const wctx = working.getContext("2d")!;
  wctx.imageSmoothingEnabled = true;
  wctx.imageSmoothingQuality = "high";
  wctx.drawImage(src, sx, sy, sw, sh, 0, 0, working.width, working.height);
  if (bmp) bmp.close();

  // 2. Rotate 90 increments
  if (page.rotation !== 0) working = rotate90Canvas(working, page.rotation);

  // 3. Straighten (inscribed-rect auto-zoom)
  if (page.angleDeg) working = straightenCanvas(working, page.angleDeg);

  // Downscale to output cap before heavy per-pixel work
  const workCap = Math.min(maxEdge, overrides.workMaxEdge ?? Infinity);
  const long = Math.max(working.width, working.height);
  if (long > workCap) working = drawStepped(working, working.width, working.height, workCap);

  if (overrides.rawCompare) return working;

  // 4. Shadow removal (BEFORE filter, so B&W thresholds a flat image)
  if (page.shadow) shadowRemove(working);

  // 5. Filter (grayscale / document / Sauvola BW / original)
  applyFilterToCanvas(working, effectiveFilter);

  // 6. Brightness + contrast (after filter, per spec)
  applyBrightnessContrast(working, page.brightness, page.contrast);

  return working;
}

/* ============================================================
 *  Component
 * ============================================================ */

export default function ScanToPdf() {
  const [mode, setMode] = useState<"initial" | "capture" | "configure">("initial");
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<FilterKind>("document");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [quality, setQuality] = useState<QualityPreset>("medium");
  const [fillMode, setFillMode] = useState<FillMode>("fit");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);

  const [thumbs, setThumbs] = useState<Record<string, { key: string; url: string }>>({});
  const thumbsRef = useRef(thumbs);
  thumbsRef.current = thumbs;

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCaptureInputRef = useRef<HTMLInputElement>(null);

  /* ---------- Body scroll lock during camera + editor ---------- */
  useEffect(() => {
    if (mode !== "capture" && editorId === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mode, editorId]);

  /* ---------- Camera lifecycle ---------- */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (want: "environment" | "user") => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera is not available in this browser. Please upload photos instead.");
      return;
    }
    try {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        /* ignore */
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: want },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (e) {
      const msg = (e as Error).message || String(e);
      setCameraError(
        /permission|denied|NotAllowed/i.test(msg)
          ? "Camera access was denied. You can still upload photos below."
          : "Camera not available on this device. Please upload photos instead.",
      );
    }
  }, []);

  const enterCapture = useCallback(async () => {
    setMode("capture");
    await startCamera(facing);
  }, [facing, startCamera]);

  const flipCamera = useCallback(async () => {
    const next: "environment" | "user" = facing === "environment" ? "user" : "environment";
    stopCamera();
    setFacing(next);
    await startCamera(next);
  }, [facing, startCamera, stopCamera]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const raw = await canvasToBlob(canvas, "image/jpeg", 0.95);
    try {
      const page = await ingestSource(raw);
      setPages((prev) => [...prev, page]);
    } catch (e) {
      toast.error(`Capture failed: ${(e as Error).message}`);
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /* ---------- Ingest ---------- */
  const importPhotos = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    try {
      const imported = await Promise.all(list.map((f) => ingestSource(f)));
      setPages((prev) => [...prev, ...imported]);
      setMode("configure");
    } catch (e) {
      toast.error(`Import failed: ${(e as Error).message}`);
    }
  }, []);

  const openPhotoPicker = useCallback(() => fileInputRef.current?.click(), []);
  const openNativeCamera = useCallback(() => nativeCaptureInputRef.current?.click(), []);

  const addMore = useCallback(() => {
    if (cameraError && /getUserMedia|not available/i.test(cameraError)) openNativeCamera();
    else if (cameraError) openPhotoPicker();
    else void enterCapture();
  }, [cameraError, enterCapture, openNativeCamera, openPhotoPicker]);

  /* ---------- Undo-delete ---------- */
  const removePage = useCallback((id: string) => {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const removed = prev[idx];
      const next = prev.slice();
      next.splice(idx, 1);
      let restored = false;
      const timer = window.setTimeout(() => {
        if (!restored) URL.revokeObjectURL(removed.url);
      }, 5200);
      toast("Page removed", {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => {
            restored = true;
            window.clearTimeout(timer);
            setPages((cur) => {
              const back = cur.slice();
              back.splice(Math.min(idx, back.length), 0, removed);
              return back;
            });
          },
        },
      });
      return next;
    });
  }, []);

  const updatePage = (id: string, patch: Partial<ScanPage>) =>
    setPages((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const rotatePage = (id: string) =>
    setPages((p) =>
      p.map((x) => (x.id === id ? { ...x, rotation: (((x.rotation + 90) % 360) as ScanPage["rotation"]) } : x)),
    );

  /* ---------- Reorder (dnd-kit) ---------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setPages((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      if (oldIdx < 0 || newIdx < 0) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  /* ---------- Thumbnail regeneration (real pipeline) ---------- */
  const thumbKeyOf = useCallback(
    (p: ScanPage) => {
      const c = p.crop;
      const cs = c ? `${c.x.toFixed(3)},${c.y.toFixed(3)},${c.w.toFixed(3)},${c.h.toFixed(3)}` : "-";
      return [
        p.rotation,
        p.filter ?? `d:${defaultFilter}`,
        cs,
        `a${p.angleDeg}`,
        `b${p.brightness}`,
        `k${p.contrast}`,
        p.shadow ? "s1" : "s0",
      ].join("|");
    },
    [defaultFilter],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const p of pages) {
        if (cancelled) return;
        const key = thumbKeyOf(p);
        const existing = thumbsRef.current[p.id];
        if (existing && existing.key === key) continue;
        try {
          const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, 300, {
            workMaxEdge: PREVIEW_WORK_MAX_EDGE,
          });
          const blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setThumbs((prev) => {
            const old = prev[p.id];
            if (old) URL.revokeObjectURL(old.url);
            return { ...prev, [p.id]: { key, url } };
          });
        } catch {
          /* retry next tick */
        }
        // yield to keep UI responsive
        await new Promise((r) => setTimeout(r, 0));
      }
      const ids = new Set(pages.map((p) => p.id));
      setThumbs((prev) => {
        const next: typeof prev = {};
        let changed = false;
        for (const [id, v] of Object.entries(prev)) {
          if (ids.has(id)) next[id] = v;
          else {
            URL.revokeObjectURL(v.url);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [pages, defaultFilter, thumbKeyOf]);

  /* ---------- Estimated size ---------- */
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null);
  const estimateTokenRef = useRef(0);
  const estimateCacheRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (pages.length === 0) {
      setEstimatedBytes(null);
      return;
    }
    const token = ++estimateTokenRef.current;
    const preset = QUALITY[quality];
    const cache = estimateCacheRef.current;
    const handle = window.setTimeout(async () => {
      let total = 0;
      for (const p of pages) {
        if (token !== estimateTokenRef.current) return;
        const key = `${quality}|${fillMode}|${pageSize}|${thumbKeyOf(p)}|${p.id}`;
        const cached = cache.get(key);
        if (cached !== undefined) {
          total += cached;
          continue;
        }
        try {
          const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, preset.maxEdge, {
            workMaxEdge: PREVIEW_WORK_MAX_EDGE,
          });
          const blob = await canvasToBlob(canvas, "image/jpeg", preset.q);
          // Fill mode drops the letterboxed area — reduce estimated bytes proportionally.
          let bytes = blob.size;
          if (fillMode === "fill" && pageSize !== "fit") {
            const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
            const pageAspect = base[0] / base[1];
            const imgAspect = canvas.width / canvas.height;
            const ratio = imgAspect > pageAspect ? pageAspect / imgAspect : imgAspect / pageAspect;
            bytes = Math.round(bytes * ratio);
          }
          cache.set(key, bytes);
          total += bytes;
        } catch {
          total += preset.approxKB * 1024;
        }
        await new Promise((r) => setTimeout(r, 0));
      }
      if (token === estimateTokenRef.current) setEstimatedBytes(total + 1500 * pages.length + 3000);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [pages, quality, fillMode, pageSize, defaultFilter, thumbKeyOf]);

  /* ---------- Reset ---------- */
  const resetAll = () => {
    stopCamera();
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    Object.values(thumbsRef.current).forEach((t) => URL.revokeObjectURL(t.url));
    setThumbs({});
    setPages([]);
    setResult(null);
    setMode("initial");
    setCameraError(null);
    estimateCacheRef.current.clear();
    setEstimatedBytes(null);
  };

  useEffect(() => {
    return () => {
      pages.forEach((p) => URL.revokeObjectURL(p.url));
      Object.values(thumbsRef.current).forEach((t) => URL.revokeObjectURL(t.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Build PDF ---------- */
  const buildPdf = async () => {
    if (pages.length === 0) return;
    setLoading(true);
    try {
      const preset = QUALITY[quality];
      const pdf = await PDFDocument.create();
      for (const p of pages) {
        let canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, preset.maxEdge);

        let pageW: number;
        let pageH: number;
        if (pageSize === "fit") {
          pageW = canvas.width;
          pageH = canvas.height;
        } else {
          const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
          const wantLandscape =
            orientation === "landscape" || (orientation === "auto" && canvas.width > canvas.height);
          [pageW, pageH] = wantLandscape ? [base[1], base[0]] : base;
        }

        // Fill mode: pre-crop the canvas to the page aspect so the image fully covers the page.
        if (fillMode === "fill" && pageSize !== "fit") {
          const pageAspect = pageW / pageH;
          const imgAspect = canvas.width / canvas.height;
          if (Math.abs(imgAspect - pageAspect) > 0.001) {
            let cw = canvas.width;
            let ch = canvas.height;
            let sx = 0;
            let sy = 0;
            if (imgAspect > pageAspect) {
              cw = Math.round(canvas.height * pageAspect);
              sx = Math.round((canvas.width - cw) / 2);
            } else {
              ch = Math.round(canvas.width / pageAspect);
              sy = Math.round((canvas.height - ch) / 2);
            }
            const c2 = document.createElement("canvas");
            c2.width = cw;
            c2.height = ch;
            const cctx = c2.getContext("2d")!;
            cctx.imageSmoothingEnabled = true;
            cctx.imageSmoothingQuality = "high";
            cctx.drawImage(canvas, sx, sy, cw, ch, 0, 0, cw, ch);
            canvas = c2;
          }
        }

        const jpegBlob = await canvasToBlob(canvas, "image/jpeg", preset.q);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await pdf.embedJpg(jpegBytes);
        const page = pdf.addPage([pageW, pageH]);

        if (fillMode === "fill" && pageSize !== "fit") {
          page.drawImage(img, { x: 0, y: 0, width: pageW, height: pageH });
        } else {
          const scale = Math.min(pageW / img.width, pageH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(img, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
        }

        // yield between pages so the UI doesn't freeze on a 12-page doc
        await new Promise((r) => setTimeout(r, 0));
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const today = new Date().toISOString().slice(0, 10);
      setResult({ blob, filename: `scan-${today}.pdf`, count: pages.length });
      toast.success("PDF created");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const sizeLabel = useMemo(() => {
    if (estimatedBytes === null) return null;
    const mb = estimatedBytes / (1024 * 1024);
    if (mb >= 1) return `~${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
    return `~${Math.max(1, Math.round(estimatedBytes / 1024))} KB`;
  }, [estimatedBytes]);

  /* -------------------- RESULT -------------------- */
  if (result) {
    return (
      <ToolSuccessScreen
        heading="Your scan is ready!"
        subheading={`${result.count} page(s) saved as PDF.`}
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["scan-to-pdf"]}
      />
    );
  }

  /* -------------------- INITIAL -------------------- */
  if (mode === "initial") {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            void importPhotos(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={nativeCaptureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void importPhotos(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
        <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "#ececef" }}>
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: "#fdeceb", color: "#e5322d" }}>
            <Camera className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#33333c" }}>Scan a document</h2>
          <p className="mt-1 text-sm" style={{ color: "#5a5a66" }}>
            Use your camera to capture pages, or upload photos you already have.
          </p>
          <button
            type="button"
            onClick={enterCapture}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase text-white transition-colors"
            style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c72620")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e5322d")}
          >
            <Camera className="h-4 w-4" /> Open Camera
          </button>
          <button
            type="button"
            onClick={openPhotoPicker}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold underline underline-offset-4"
            style={{ color: "#5a5a66" }}
          >
            <ImageIcon className="h-4 w-4" /> Or upload photos instead
          </button>
          {cameraError && (
            <>
              <p className="mt-4 rounded-lg p-3 text-xs" style={{ backgroundColor: "#fef4f3", color: "#a12a26" }}>
                {cameraError}
              </p>
              <button
                type="button"
                onClick={openNativeCamera}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: "#ececef", color: "#33333c" }}
              >
                <Camera className="h-4 w-4" /> Use phone camera instead
              </button>
            </>
          )}
        </div>
      </>
    );
  }

  /* -------------------- CAPTURE -------------------- */
  if (mode === "capture") {
    return (
      <>
        <input
          ref={nativeCaptureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            void importPhotos(e.currentTarget.files);
            e.currentTarget.value = "";
          }}
        />
        <div className="mx-auto max-w-3xl">
          <div
            className="relative overflow-hidden rounded-2xl bg-black"
            style={{ maxHeight: "70vh", touchAction: "none" }}
          >
            <video
              ref={videoRef}
              playsInline
              muted
              className="block h-auto w-full"
              style={{ maxHeight: "70vh" }}
            />
            {!cameraError && (
              <div className="pointer-events-none absolute inset-0">
                {(["tl", "tr", "bl", "br"] as const).map((k) => (
                  <span
                    key={k}
                    className="absolute h-8 w-8 border-white/85"
                    style={{
                      borderTopWidth: k.startsWith("t") ? 3 : 0,
                      borderBottomWidth: k.startsWith("b") ? 3 : 0,
                      borderLeftWidth: k.endsWith("l") ? 3 : 0,
                      borderRightWidth: k.endsWith("r") ? 3 : 0,
                      top: k.startsWith("t") ? "6%" : undefined,
                      bottom: k.startsWith("b") ? "6%" : undefined,
                      left: k.endsWith("l") ? "5%" : undefined,
                      right: k.endsWith("r") ? "5%" : undefined,
                    }}
                  />
                ))}
                <div className="absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold text-white/85 drop-shadow">
                  Align document edges inside the guides
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <p className="text-sm">{cameraError}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={openNativeCamera}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#33333c]"
                  >
                    Use phone camera
                  </button>
                  <button
                    type="button"
                    onClick={openPhotoPicker}
                    className="rounded-xl border border-white/60 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Upload photos
                  </button>
                </div>
              </div>
            )}
            {hasMultipleCameras && !cameraError && (
              <button
                type="button"
                onClick={flipCamera}
                className="absolute top-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
                aria-label="Flip camera"
              >
                <SwitchCamera className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode(pages.length > 0 ? "configure" : "initial");
              }}
              className="text-sm font-semibold"
              style={{ color: "#5a5a66" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void capture()}
              disabled={!!cameraError}
              className="grid h-16 w-16 place-items-center rounded-full border-4 border-white shadow-lg disabled:opacity-40"
              style={{ backgroundColor: "#e5322d" }}
              aria-label="Capture page"
            >
              <div className="h-10 w-10 rounded-full bg-white" />
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode(pages.length > 0 ? "configure" : "initial");
              }}
              disabled={pages.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: "#33333c" }}
            >
              <Check className="h-4 w-4" /> Done ({pages.length})
            </button>
          </div>

          {pages.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto py-2">
              {pages.map((p, i) => (
                <div key={p.id} className="relative shrink-0">
                  <img
                    src={thumbs[p.id]?.url ?? p.url}
                    alt={`Page ${i + 1}`}
                    className="h-20 w-16 rounded-lg border object-cover"
                    style={{ borderColor: "#ececef" }}
                  />
                  <span className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-[#33333c] text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePage(p.id)}
                    className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[#5a5a66] shadow hover:text-[#e5322d]"
                    aria-label="Remove page"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  /* -------------------- CONFIGURE -------------------- */
  const editingPage = editorId ? pages.find((p) => p.id === editorId) ?? null : null;

  const actionLabel = sizeLabel ? `Create PDF (${sizeLabel})` : "Create PDF";

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          void importPhotos(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={nativeCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          void importPhotos(e.currentTarget.files);
          e.currentTarget.value = "";
        }}
      />
      <ToolWorkspace
        title="Scan to PDF"
        actionLabel={actionLabel}
        loadingLabel="Creating PDF…"
        onAction={buildPdf}
        loading={loading}
        actionDisabled={pages.length === 0}
        sidebar={
          <>
            <div>
              <Label>Default enhancement</Label>
              <Select value={defaultFilter} onValueChange={(v) => setDefaultFilter(v as FilterKind)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original</SelectItem>
                  <SelectItem value="document">Document (recommended)</SelectItem>
                  <SelectItem value="grayscale">Grayscale</SelectItem>
                  <SelectItem value="bw">Black &amp; White (adaptive)</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px]" style={{ color: "#5a5a66" }}>
                Pages with the "edited" badge keep their own settings.
              </p>
            </div>
            <div>
              <Label>Page size</Label>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                  <SelectItem value="fit">Fit to image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Orientation</Label>
              <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)} disabled={pageSize === "fit"}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
              {pageSize === "fit" && (
                <p className="mt-1 flex items-start gap-1 text-[11px]" style={{ color: "#5a5a66" }}>
                  <Info className="mt-[1px] h-3 w-3 shrink-0" />
                  Fit to image uses each photo's own dimensions, so orientation follows the source.
                </p>
              )}
            </div>
            {pageSize !== "fit" && (
              <div>
                <Label>Page fill</Label>
                <Select value={fillMode} onValueChange={(v) => setFillMode(v as FillMode)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fit">Fit with margins (recommended)</SelectItem>
                    <SelectItem value="fill">Fill page (crop edges)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-[11px]" style={{ color: "#5a5a66" }}>
                  Fill crops the sides or top/bottom so the image covers the full page.
                </p>
              </div>
            )}
            <div>
              <Label>Quality</Label>
              <Select value={quality} onValueChange={(v) => setQuality(v as QualityPreset)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (fastest upload)</SelectItem>
                  <SelectItem value="medium">Medium (recommended)</SelectItem>
                  <SelectItem value="high">High (best quality)</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px]" style={{ color: "#5a5a66" }}>
                Estimated file size: <strong>{sizeLabel ?? "calculating…"}</strong>
              </p>
            </div>
            <div className="rounded-lg p-3 text-[13px]" style={{ backgroundColor: "#f5f5f7", color: "#33333c" }}>
              <strong>{pages.length}</strong> page{pages.length === 1 ? "" : "s"} scanned
            </div>
          </>
        }
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {pages.map((p, i) => (
                <SortablePageCard
                  key={p.id}
                  page={p}
                  index={i}
                  thumbUrl={thumbs[p.id]?.url ?? p.url}
                  edited={isEdited(p)}
                  onEdit={() => setEditorId(p.id)}
                  onRotate={() => rotatePage(p.id)}
                  onRemove={() => removePage(p.id)}
                />
              ))}
              <button
                type="button"
                onClick={addMore}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
                style={{ borderColor: "#e5d4d3", color: "#5a5a66" }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: "#e5322d" }}>
                  <Plus className="h-5 w-5" />
                </span>
                Add more
              </button>
            </div>
          </SortableContext>
        </DndContext>
      </ToolWorkspace>

      {editingPage && (
        <PageEditor
          page={editingPage}
          defaultFilter={defaultFilter}
          onClose={() => setEditorId(null)}
          onChange={(patch) => updatePage(editingPage.id, patch)}
        />
      )}
    </>
  );
}

/* ============================================================
 *  Sortable page card (configure grid)
 * ============================================================ */

function SortablePageCard({
  page,
  index,
  thumbUrl,
  edited,
  onEdit,
  onRotate,
  onRemove,
}: {
  page: ScanPage;
  index: number;
  thumbUrl: string;
  edited: boolean;
  onEdit: () => void;
  onRotate: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-60 shadow-xl z-10 ring-2 ring-[#e5322d]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1.5 left-1/2 z-10 flex h-7 -translate-x-1/2 items-center justify-center rounded-full bg-white/95 px-2 shadow-sm ring-1 ring-black/10"
        title="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" style={{ color: "#33333c" }} />
      </div>
      <img
        src={thumbUrl}
        alt={`Page ${index + 1}`}
        className="pointer-events-none aspect-[3/4] w-full object-cover"
        draggable={false}
      />
      <span className="absolute top-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#33333c] text-[11px] font-bold text-white">
        {index + 1}
      </span>
      {edited && (
        <span
          className="absolute top-1.5 left-9 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: "#e5322d" }}
        >
          Edited
        </span>
      )}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRotate(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#33333c] shadow hover:text-[#e5322d]"
          aria-label="Rotate"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#33333c] shadow hover:text-[#e5322d]"
          aria-label="Edit"
        >
          <CropIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-[#5a5a66] shadow hover:text-[#e5322d]"
        aria-label="Remove page"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ============================================================
 *  Per-page editor modal
 *  Preview canvas uses the REAL pipeline (crop -> rot -> straighten
 *  -> shadow -> filter -> BC). Press-hold the "before" button to see
 *  the raw photo.
 * ============================================================ */

function PageEditor({
  page,
  defaultFilter,
  onClose,
  onChange,
}: {
  page: ScanPage;
  defaultFilter: FilterKind;
  onClose: () => void;
  onChange: (patch: Partial<ScanPage>) => void;
}) {
  const [crop, setCrop] = useState(page.crop ?? { x: 0.05, y: 0.05, w: 0.9, h: 0.9 });
  const [drag, setDrag] = useState<null | {
    corner: "nw" | "ne" | "sw" | "se" | "move";
    startX: number;
    startY: number;
    base: typeof crop;
  }>(null);
  const [compareRaw, setCompareRaw] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const filter = page.filter ?? defaultFilter;

  // Preview canvas mirrors the real pipeline. Debounce heavy re-renders.
  const previewRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      try {
        const canvas = await renderPageToCanvas(
          { ...page, crop: null }, // preview the whole photo; crop overlay is user-driven
          filter,
          900,
          { rawCompare: compareRaw, workMaxEdge: PREVIEW_WORK_MAX_EDGE },
        );
        if (cancelled || !previewRef.current) return;
        const dst = previewRef.current;
        dst.width = canvas.width;
        dst.height = canvas.height;
        dst.getContext("2d")!.drawImage(canvas, 0, 0);
      } catch {
        /* skip */
      }
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [page, filter, compareRaw]);

  useEffect(() => {
    if (!drag) return;
    const prev = document.body.style.overscrollBehavior;
    document.body.style.overscrollBehavior = "contain";
    return () => {
      document.body.style.overscrollBehavior = prev;
    };
  }, [drag]);

  const onPointerDown = (corner: "nw" | "ne" | "sw" | "se" | "move") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({ corner, startX: e.clientX, startY: e.clientY, base: { ...crop } });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / rect.width;
    const dy = (e.clientY - drag.startY) / rect.height;
    const b = drag.base;
    let x = b.x, y = b.y, w = b.w, h = b.h;
    if (drag.corner === "move") {
      x = Math.max(0, Math.min(1 - b.w, b.x + dx));
      y = Math.max(0, Math.min(1 - b.h, b.y + dy));
    } else {
      if (drag.corner === "nw") { x = b.x + dx; y = b.y + dy; w = b.w - dx; h = b.h - dy; }
      if (drag.corner === "ne") { y = b.y + dy; w = b.w + dx; h = b.h - dy; }
      if (drag.corner === "sw") { x = b.x + dx; w = b.w - dx; h = b.h + dy; }
      if (drag.corner === "se") { w = b.w + dx; h = b.h + dy; }
      if (w < 0.05) w = 0.05;
      if (h < 0.05) h = 0.05;
      x = Math.max(0, Math.min(1 - w, x));
      y = Math.max(0, Math.min(1 - h, y));
      w = Math.min(1 - x, w);
      h = Math.min(1 - y, h);
    }
    setCrop({ x, y, w, h });
  };

  const onPointerUp = () => setDrag(null);

  const save = () => {
    onChange({ crop });
    onClose();
  };

  const rotate = () => onChange({ rotation: (((page.rotation + 90) % 360) as ScanPage["rotation"]) });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="relative max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "#33333c" }}>Edit page</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => setCompareRaw(true)}
              onPointerUp={() => setCompareRaw(false)}
              onPointerLeave={() => setCompareRaw(false)}
              onPointerCancel={() => setCompareRaw(false)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
                compareRaw ? "text-white" : "",
              )}
              style={{
                borderColor: compareRaw ? "#e5322d" : "#ececef",
                color: compareRaw ? "#ffffff" : "#33333c",
                backgroundColor: compareRaw ? "#e5322d" : "transparent",
                touchAction: "none",
              }}
              title="Press and hold to see the original photo"
            >
              <Eye className="h-3.5 w-3.5" />
              {compareRaw ? "Original" : "Compare"}
            </button>
            <button type="button" onClick={onClose} className="text-[#5a5a66] hover:text-[#33333c]" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          ref={boxRef}
          className="relative mt-4 overflow-hidden rounded-lg bg-[#f5f5f7]"
          style={{ aspectRatio: `${page.width} / ${page.height}`, touchAction: "none" }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <canvas
            ref={previewRef}
            className="absolute inset-0 h-full w-full object-contain select-none"
          />
          <div
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
              cursor: "move",
              touchAction: "none",
            }}
            onPointerDown={onPointerDown("move")}
          >
            {(["nw", "ne", "sw", "se"] as const).map((c) => (
              <div
                key={c}
                onPointerDown={onPointerDown(c)}
                className="absolute h-3 w-3 rounded-full bg-white border-2"
                style={{
                  borderColor: "#e5322d",
                  cursor: `${c}-resize`,
                  touchAction: "none",
                  ...(c.includes("n") ? { top: -6 } : { bottom: -6 }),
                  ...(c.includes("w") ? { left: -6 } : { right: -6 }),
                }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Filter</Label>
            <Select
              value={filter}
              onValueChange={(v) => onChange({ filter: v as FilterKind })}
            >
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
                <SelectItem value="bw">Black &amp; White (adaptive)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={rotate}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: "#ececef", color: "#33333c" }}
            >
              <RotateCw className="h-4 w-4" /> Rotate 90°
            </button>
            <button
              type="button"
              onClick={() => { onChange({ crop: null }); setCrop({ x: 0, y: 0, w: 1, h: 1 }); }}
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-semibold"
              style={{ borderColor: "#ececef", color: "#33333c" }}
            >
              Reset crop
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <SliderRow
            label="Straighten"
            unit="°"
            min={-15}
            max={15}
            step={0.5}
            value={page.angleDeg}
            onChange={(v) => onChange({ angleDeg: v })}
            onReset={() => onChange({ angleDeg: 0 })}
          />
          <SliderRow
            label="Brightness"
            min={-50}
            max={50}
            step={1}
            value={page.brightness}
            onChange={(v) => onChange({ brightness: v })}
            onReset={() => onChange({ brightness: 0 })}
          />
          <SliderRow
            label="Contrast"
            min={-50}
            max={50}
            step={1}
            value={page.contrast}
            onChange={(v) => onChange({ contrast: v })}
            onReset={() => onChange({ contrast: 0 })}
          />
          <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#33333c" }}>
            <Checkbox
              checked={page.shadow}
              onCheckedChange={(v) => onChange({ shadow: v === true })}
            />
            Remove shadow (flatten uneven lighting)
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              onChange({ angleDeg: 0, brightness: 0, contrast: 0, shadow: false, filter: null })
            }
            className="rounded-xl px-3 py-2 text-xs font-semibold"
            style={{ color: "#5a5a66" }}
          >
            Reset all adjustments
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ color: "#5a5a66" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-xl px-4 py-2 text-sm font-bold text-white"
              style={{ backgroundColor: "#e5322d" }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  onReset,
}: {
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label
          className="cursor-pointer select-none"
          onDoubleClick={onReset}
          title="Double-click to reset"
        >
          {label}
        </Label>
        <span className="text-xs tabular-nums" style={{ color: "#5a5a66" }}>
          {value > 0 ? `+${value}` : value}
          {unit ?? ""}
        </span>
      </div>
      <Slider
        className="mt-1"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
