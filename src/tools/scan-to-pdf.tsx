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
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

type FilterKind = "original" | "document" | "grayscale" | "bw";
type PageSize = "a4" | "letter" | "fit";
type Orientation = "auto" | "portrait" | "landscape";
type QualityPreset = "small" | "medium" | "high";

const QUALITY: Record<QualityPreset, { q: number; maxEdge: number; approxKB: number }> = {
  small: { q: 0.6, maxEdge: 2000, approxKB: 180 },
  medium: { q: 0.8, maxEdge: 2800, approxKB: 420 },
  high: { q: 0.92, maxEdge: 3600, approxKB: 950 },
};

const INGEST_MAX_EDGE = 3600;

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
}

const uid = () => Math.random().toString(36).slice(2, 10);

const isEdited = (p: ScanPage) => p.rotation !== 0 || p.filter !== null || p.crop !== null;

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
      // Last-ditch <img> fallback (no EXIF fixup, but at least renders).
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

/** High-quality stepped downscale to a max long edge. Returns a fresh canvas. */
function drawStepped(source: CanvasImageSource, srcW: number, srcH: number, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  let curW = srcW;
  let curH = srcH;
  let curSrc: CanvasImageSource = source;
  // Halve iteratively for quality, then final step to target.
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
  };
}

/* ============================================================
 *  Filter + render pipeline (single source of truth)
 * ============================================================ */

function applyFilterToCanvas(canvas: HTMLCanvasElement, filter: FilterKind) {
  if (filter === "original") return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  if (filter === "grayscale") {
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = y;
    }
  } else if (filter === "bw") {
    for (let i = 0; i < d.length; i += 4) {
      const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = y > 160 ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
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

async function renderPageToCanvas(
  page: ScanPage,
  effectiveFilter: FilterKind,
  maxEdge: number,
): Promise<HTMLCanvasElement> {
  const { bmp, img } = await decodeBitmap(page.blob);
  const src: CanvasImageSource = bmp ?? img!;
  const iw = bmp ? bmp.width : img!.naturalWidth;
  const ih = bmp ? bmp.height : img!.naturalHeight;

  const crop = page.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = crop.x * iw;
  const sy = crop.y * ih;
  const sw = crop.w * iw;
  const sh = crop.h * ih;

  const rot = page.rotation;
  const rotated = rot === 90 || rot === 270;
  const rawW = rotated ? sh : sw;
  const rawH = rotated ? sw : sh;

  const scale = Math.min(1, maxEdge / Math.max(rawW, rawH));
  const outW = Math.max(1, Math.round(rawW * scale));
  const outH = Math.max(1, Math.round(rawH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((rot * Math.PI) / 180);
  const drawW = sw * scale;
  const drawH = sh * scale;
  ctx.drawImage(src, sx, sy, sw, sh, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
  if (bmp) bmp.close();
  applyFilterToCanvas(canvas, effectiveFilter);
  return canvas;
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
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);

  // Thumbnail cache: id -> { key, url }
  const [thumbs, setThumbs] = useState<Record<string, { key: string; url: string }>>({});
  const thumbsRef = useRef(thumbs);
  thumbsRef.current = thumbs;

  // Camera state
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

  /* ---------- Ingest + revoke lifecycle ---------- */
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
    // Prefer camera, fall back to native capture input, then gallery picker.
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

  /* ---------- Thumbnail regeneration (real pipeline, 300px) ---------- */
  const thumbKeyOf = useCallback(
    (p: ScanPage) => {
      const c = p.crop;
      const cs = c ? `${c.x.toFixed(3)},${c.y.toFixed(3)},${c.w.toFixed(3)},${c.h.toFixed(3)}` : "-";
      return `${p.rotation}|${p.filter ?? `d:${defaultFilter}`}|${cs}`;
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
          const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, 300);
          const blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          setThumbs((prev) => {
            const old = prev[p.id];
            if (old) URL.revokeObjectURL(old.url);
            return { ...prev, [p.id]: { key, url } };
          });
        } catch {
          /* skip; will retry next tick */
        }
      }
      // Sweep: revoke thumbs whose page is gone.
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
        const key = `${quality}|${thumbKeyOf(p)}|${p.id}`;
        const cached = cache.get(key);
        if (cached !== undefined) {
          total += cached;
          continue;
        }
        try {
          const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, preset.maxEdge);
          const blob = await canvasToBlob(canvas, "image/jpeg", preset.q);
          cache.set(key, blob.size);
          total += blob.size;
        } catch {
          total += preset.approxKB * 1024;
        }
      }
      if (token === estimateTokenRef.current) setEstimatedBytes(total + 1500 * pages.length + 3000);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [pages, quality, defaultFilter, thumbKeyOf]);

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

  // Full-teardown on unmount.
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
        const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter, preset.maxEdge);
        const jpegBlob = await canvasToBlob(canvas, "image/jpeg", preset.q);
        const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
        const img = await pdf.embedJpg(jpegBytes);

        let pageW: number;
        let pageH: number;
        if (pageSize === "fit") {
          pageW = img.width;
          pageH = img.height;
        } else {
          const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
          const wantLandscape =
            orientation === "landscape" || (orientation === "auto" && img.width > img.height);
          [pageW, pageH] = wantLandscape ? [base[1], base[0]] : base;
        }
        const page = pdf.addPage([pageW, pageH]);
        const scale = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        page.drawImage(img, { x: (pageW - w) / 2, y: (pageH - h) / 2, width: w, height: h });
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
            {/* Corner guides */}
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
                  <SelectItem value="bw">Black &amp; White</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[11px]" style={{ color: "#5a5a66" }}>
                Pages with the "edited" badge keep their own filter.
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
      // ensure the whole card is a drag surface
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
 *  Per-page editor modal (rotate + simple crop + filter)
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
  const boxRef = useRef<HTMLDivElement>(null);

  const filter = page.filter ?? defaultFilter;

  // Preview canvas mirrors the real pipeline so preview == PDF output.
  const previewRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const canvas = await renderPageToCanvas(
        { ...page, crop: null }, // preview the whole photo; crop overlay is user-driven
        filter,
        900,
      );
      if (cancelled || !previewRef.current) return;
      const dst = previewRef.current;
      dst.width = canvas.width;
      dst.height = canvas.height;
      dst.getContext("2d")!.drawImage(canvas, 0, 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, filter]);

  // Lock body scroll while dragging (already locked while editor open at parent level).
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
        className="relative w-full max-w-2xl rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "#33333c" }}>Edit page</h3>
          <button type="button" onClick={onClose} className="text-[#5a5a66] hover:text-[#33333c]" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
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
                <SelectItem value="bw">Black &amp; White</SelectItem>
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

        <div className="mt-6 flex justify-end gap-2">
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
  );
}
