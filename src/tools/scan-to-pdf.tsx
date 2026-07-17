import { useCallback, useEffect, useRef, useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { toast } from "sonner";
import { Camera, X, Plus, RotateCw, SwitchCamera, Check, ImageIcon, Crop as CropIcon } from "lucide-react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

type FilterKind = "original" | "document" | "grayscale" | "bw";
type PageSize = "a4" | "letter" | "fit";
type Orientation = "auto" | "portrait" | "landscape";

interface ScanPage {
  id: string;
  /** Raw captured image as a data URL (source of truth). */
  src: string;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  filter: FilterKind | null; // null => use default
  crop: { x: number; y: number; w: number; h: number } | null; // 0..1 normalized
}

const uid = () => Math.random().toString(36).slice(2, 10);

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
    // Auto-levels on luminance, mild contrast + brightness normalization
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
        // slight contrast boost
        v = (v - 128) * 1.15 + 132;
        d[i + k] = Math.max(0, Math.min(255, v));
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

async function renderPageToCanvas(page: ScanPage, effectiveFilter: FilterKind): Promise<HTMLCanvasElement> {
  const image = new Image();
  image.src = page.src;
  await new Promise<void>((res, rej) => {
    image.onload = () => res();
    image.onerror = () => rej(new Error("Failed to load capture"));
  });

  const crop = page.crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = crop.x * image.width;
  const sy = crop.y * image.height;
  const sw = crop.w * image.width;
  const sh = crop.h * image.height;

  const rot = page.rotation;
  const rotated = rot === 90 || rot === 270;
  const outW = rotated ? sh : sw;
  const outH = rotated ? sw : sh;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(outW));
  canvas.height = Math.max(1, Math.round(outH));
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(image, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
  applyFilterToCanvas(canvas, effectiveFilter);
  return canvas;
}

export default function ScanToPdf() {
  const [mode, setMode] = useState<"initial" | "capture" | "configure">("initial");
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [defaultFilter, setDefaultFilter] = useState<FilterKind>("document");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const [editorId, setEditorId] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async (mode: "environment" | "user") => {
    setCameraError(null);
    try {
      // Enumerate cameras to know whether to show a flip button
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(devices.filter((d) => d.kind === "videoinput").length > 1);
      } catch {
        /* ignore */
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
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

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const src = canvas.toDataURL("image/jpeg", 0.92);
    setPages((prev) => [
      ...prev,
      { id: uid(), src, width: canvas.width, height: canvas.height, rotation: 0, filter: null, crop: null },
    ]);
  }, []);

  const doneCapturing = useCallback(() => {
    stopCamera();
    setMode(pages.length > 0 ? "configure" : "initial");
  }, [pages.length, stopCamera]);

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  const importPhotos = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<ScanPage>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => {
              const src = String(reader.result);
              const img = new Image();
              img.onload = () =>
                res({ id: uid(), src, width: img.width, height: img.height, rotation: 0, filter: null, crop: null });
              img.onerror = () => rej(new Error("Invalid image"));
              img.src = src;
            };
            reader.onerror = () => rej(reader.error ?? new Error("Read failed"));
            reader.readAsDataURL(f);
          }),
      ),
    )
      .then((imported) => {
        setPages((prev) => [...prev, ...imported]);
        setMode("configure");
      })
      .catch((e) => toast.error(`Import failed: ${(e as Error).message}`));
  }, []);

  const openPhotoPicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.multiple = true;
    input.onchange = () => importPhotos(input.files);
    input.click();
  }, [importPhotos]);

  const addMore = useCallback(() => {
    // Prefer reopening the camera; fall back to picker if permission was denied earlier.
    if (cameraError) {
      openPhotoPicker();
    } else {
      void enterCapture();
    }
  }, [cameraError, enterCapture, openPhotoPicker]);

  const removePage = (id: string) => setPages((p) => p.filter((x) => x.id !== id));
  const updatePage = (id: string, patch: Partial<ScanPage>) =>
    setPages((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const rotatePage = (id: string) =>
    setPages((p) =>
      p.map((x) => (x.id === id ? { ...x, rotation: (((x.rotation + 90) % 360) as ScanPage["rotation"]) } : x)),
    );

  // Drag & drop reordering
  const dragIndex = useRef<number | null>(null);
  const onDragStart = (i: number) => () => (dragIndex.current = i);
  const onDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === i) return;
    setPages((p) => {
      const next = p.slice();
      const [m] = next.splice(from, 1);
      next.splice(i, 0, m);
      dragIndex.current = i;
      return next;
    });
  };
  const onDragEnd = () => (dragIndex.current = null);

  const resetAll = () => {
    stopCamera();
    setPages([]);
    setResult(null);
    setMode("initial");
    setCameraError(null);
  };

  const buildPdf = async () => {
    if (pages.length === 0) return;
    setLoading(true);
    try {
      const pdf = await PDFDocument.create();
      for (const p of pages) {
        const canvas = await renderPageToCanvas(p, p.filter ?? defaultFilter);
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
        const img = await pdf.embedJpg(jpegBytes);

        let pageW: number;
        let pageH: number;
        if (pageSize === "fit") {
          pageW = img.width;
          pageH = img.height;
        } else {
          const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
          const wantLandscape =
            orientation === "landscape" ||
            (orientation === "auto" && img.width > img.height);
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

  // -------------------- RESULT --------------------
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

  // -------------------- INITIAL --------------------
  if (mode === "initial") {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "#ececef" }}>
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: "#fdeceb", color: "#e5322d" }}>
          <Camera className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold" style={{ color: "#33333c" }}>Scan a document</h2>
        <p className="mt-1 text-sm" style={{ color: "#7a7a86" }}>
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
          style={{ color: "#7a7a86" }}
        >
          <ImageIcon className="h-4 w-4" /> Or upload photos instead
        </button>
        {cameraError && (
          <p className="mt-4 rounded-lg p-3 text-xs" style={{ backgroundColor: "#fef4f3", color: "#a12a26" }}>
            {cameraError}
          </p>
        )}
      </div>
    );
  }

  // -------------------- CAPTURE --------------------
  if (mode === "capture") {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl bg-black" style={{ aspectRatio: "3 / 4" }}>
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
              <p className="text-sm">{cameraError}</p>
              <button
                type="button"
                onClick={openPhotoPicker}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#33333c]"
              >
                Upload photos instead
              </button>
            </div>
          )}
          {/* Top-right flip */}
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

        {/* Controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => { stopCamera(); setMode(pages.length > 0 ? "configure" : "initial"); }}
            className="text-sm font-semibold"
            style={{ color: "#7a7a86" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={capture}
            disabled={!!cameraError}
            className="grid h-16 w-16 place-items-center rounded-full border-4 border-white shadow-lg disabled:opacity-40"
            style={{ backgroundColor: "#e5322d" }}
            aria-label="Capture page"
          >
            <div className="h-10 w-10 rounded-full bg-white" />
          </button>
          <button
            type="button"
            onClick={doneCapturing}
            disabled={pages.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: "#33333c" }}
          >
            <Check className="h-4 w-4" /> Done ({pages.length})
          </button>
        </div>

        {/* Thumbnail strip */}
        {pages.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto py-2">
            {pages.map((p, i) => (
              <div key={p.id} className="relative shrink-0">
                <img src={p.src} alt={`Page ${i + 1}`} className="h-20 w-16 rounded-lg border object-cover" style={{ borderColor: "#ececef" }} />
                <span className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-[#33333c] text-[10px] font-bold text-white">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePage(p.id)}
                  className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[#7a7a86] shadow hover:text-[#e5322d]"
                  aria-label="Remove page"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------- CONFIGURE --------------------
  const editingPage = editorId ? pages.find((p) => p.id === editorId) ?? null : null;

  return (
    <>
      <ToolWorkspace
        title="Scan to PDF"
        actionLabel="Create PDF"
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
              <p className="mt-1 text-[11px]" style={{ color: "#7a7a86" }}>
                Per-page edits override this.
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
            </div>
            <div className="rounded-lg p-3 text-[13px]" style={{ backgroundColor: "#f5f5f7", color: "#33333c" }}>
              <strong>{pages.length}</strong> page{pages.length === 1 ? "" : "s"} scanned
            </div>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {pages.map((p, i) => (
            <div
              key={p.id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDragEnd={onDragEnd}
              className="group relative overflow-hidden rounded-xl border bg-white cursor-move"
              style={{ borderColor: "#ececef" }}
            >
              <button type="button" onClick={() => setEditorId(p.id)} className="block w-full">
                <img
                  src={p.src}
                  alt={`Page ${i + 1}`}
                  className="aspect-[3/4] w-full object-cover"
                  style={{ transform: `rotate(${p.rotation}deg)`, filter:
                    (p.filter ?? defaultFilter) === "grayscale" ? "grayscale(1)" :
                    (p.filter ?? defaultFilter) === "bw" ? "grayscale(1) contrast(2)" :
                    (p.filter ?? defaultFilter) === "document" ? "contrast(1.15) brightness(1.05)" : "none",
                  }}
                />
              </button>
              <span className="absolute top-1.5 left-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#33333c] text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between gap-1">
                <button
                  type="button"
                  onClick={() => rotatePage(p.id)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#33333c] shadow hover:text-[#e5322d]"
                  aria-label="Rotate"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditorId(p.id)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#33333c] shadow hover:text-[#e5322d]"
                  aria-label="Edit"
                >
                  <CropIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removePage(p.id)}
                className="absolute top-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/95 text-[#7a7a86] shadow hover:text-[#e5322d]"
                aria-label="Remove page"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMore}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
            style={{ borderColor: "#e5d4d3", color: "#7a7a86" }}
          >
            <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: "#e5322d" }}>
              <Plus className="h-5 w-5" />
            </span>
            Add more
          </button>
        </div>
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
  const [drag, setDrag] = useState<null | { corner: "nw" | "ne" | "sw" | "se" | "move"; startX: number; startY: number; base: typeof crop }>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const filter = page.filter ?? defaultFilter;

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
      // clamp
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
          <button type="button" onClick={onClose} className="text-[#7a7a86] hover:text-[#33333c]" aria-label="Close">
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
          <img
            src={page.src}
            alt="Editing"
            className="absolute inset-0 h-full w-full object-contain select-none"
            draggable={false}
            style={{ transform: `rotate(${page.rotation}deg)`, filter:
              filter === "grayscale" ? "grayscale(1)" :
              filter === "bw" ? "grayscale(1) contrast(2)" :
              filter === "document" ? "contrast(1.15) brightness(1.05)" : "none",
            }}
          />
          {/* Crop overlay */}
          <div
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.w * 100}%`,
              height: `${crop.h * 100}%`,
              cursor: "move",
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
            style={{ color: "#7a7a86" }}
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
