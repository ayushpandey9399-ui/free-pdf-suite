import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, X, Scissors } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "@/lib/saveFile";
import { guardDecodedSize, isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Fmt = "jpg" | "png" | "webp";

type CropRect = { x: number; y: number; w: number; h: number };

type Row = {
  id: string;
  file: File;
  fmt: Fmt;
  origW: number;
  origH: number;
  previewUrl: string; // orientation-corrected preview data URL
  bitmap: ImageBitmap; // orientation-corrected bitmap
  crop: CropRect; // pixel-space rect on the orientation-corrected image
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  status: "ready" | "processing" | "done" | "error";
  error?: string;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const ASPECTS: { label: string; ratio: number | null }[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "Passport 35x45", ratio: 35 / 45 },
];

function isSupported(f: File): boolean {
  const t = f.type;
  const n = f.name.toLowerCase();
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") return true;
  return /\.(jpe?g|png|webp)$/i.test(n);
}
function fmtOf(file: File): Fmt {
  const n = file.name.toLowerCase();
  if (n.endsWith(".png") || file.type === "image/png") return "png";
  if (n.endsWith(".webp") || file.type === "image/webp") return "webp";
  return "jpg";
}
function mimeOf(f: Fmt): string {
  if (f === "png") return "image/png";
  if (f === "webp") return "image/webp";
  return "image/jpeg";
}
function extOf(f: Fmt): string {
  return f;
}
function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}
function bitmapToPreviewUrl(bmp: ImageBitmap): string {
  const c = document.createElement("canvas");
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(bmp, 0, 0);
  return c.toDataURL();
}
function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      mime,
      quality,
    );
  });
}

function clampCrop(c: CropRect, W: number, H: number): CropRect {
  const x = Math.max(0, Math.min(W - 1, Math.round(c.x)));
  const y = Math.max(0, Math.min(H - 1, Math.round(c.y)));
  const w = Math.max(1, Math.min(W - x, Math.round(c.w)));
  const h = Math.max(1, Math.min(H - y, Math.round(c.h)));
  return { x, y, w, h };
}

function defaultCrop(W: number, H: number, aspect: number | null): CropRect {
  if (!aspect) {
    // 80% centered box
    const w = Math.round(W * 0.8);
    const h = Math.round(H * 0.8);
    return clampCrop({ x: (W - w) / 2, y: (H - h) / 2, w, h }, W, H);
  }
  // Fit largest rect of given aspect inside 90% of image, centered
  let w = W * 0.9;
  let h = w / aspect;
  if (h > H * 0.9) {
    h = H * 0.9;
    w = h * aspect;
  }
  return clampCrop({ x: (W - w) / 2, y: (H - h) / 2, w, h }, W, H);
}

type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function CropImageTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [aspectIdx, setAspectIdx] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.9);
  const [running, setRunning] = useState(false);
  const idRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const active = rows.find((r) => r.id === activeId) ?? null;
  const aspect = ASPECTS[aspectIdx].ratio;

  const addFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const list = Array.from(incoming).filter((f) => {
        if (isSvgFile(f)) {
          toast.error(`"${f.name}" is an SVG, not supported`);
          return false;
        }
        if (!isSupported(f)) {
          toast.error(`"${f.name}" is not a JPG, PNG, or WebP`);
          return false;
        }
        return true;
      });
      if (!list.length) return;
      const added: Row[] = [];
      for (const f of list) {
        try {
          const bmp = await decodeBitmap(f);
          guardDecodedSize(bmp.width, bmp.height);
          const previewUrl = bitmapToPreviewUrl(bmp);
          const row: Row = {
            id: `${++idRef.current}-${f.name}`,
            file: f,
            fmt: fmtOf(f),
            origW: bmp.width,
            origH: bmp.height,
            previewUrl,
            bitmap: bmp,
            crop: defaultCrop(bmp.width, bmp.height, aspect),
            status: "ready",
          };
          added.push(row);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Could not read image";
          toast.error(`"${f.name}": ${msg}`);
        }
      }
      if (!added.length) return;
      setRows((prev) => [...prev, ...added]);
      if (!activeId) setActiveId(added[0].id);
    },
    [aspect, activeId],
  );

  // Re-apply aspect ratio to active image when user picks a preset.
  const applyAspectToActive = (a: number | null) => {
    if (!active) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === active.id
          ? { ...r, crop: defaultCrop(r.origW, r.origH, a) }
          : r,
      ),
    );
  };
  const handleAspect = (i: number) => {
    setAspectIdx(i);
    applyAspectToActive(ASPECTS[i].ratio);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      const r = prev.find((x) => x.id === id);
      r?.bitmap.close?.();
      const next = prev.filter((x) => x.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };
  const clearAll = () => {
    rows.forEach((r) => r.bitmap.close?.());
    setRows([]);
    setActiveId(null);
  };

  useEffect(() => {
    return () => {
      rows.forEach((r) => r.bitmap.close?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Crop box interaction (pointer events, works with touch) ---
  const stageState = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startCrop: CropRect;
    imgW: number;
    imgH: number;
    scale: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent, handle: Handle) => {
    if (!active || !stageRef.current) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const rect = stageRef.current.getBoundingClientRect();
    const scale = rect.width / active.origW;
    stageState.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...active.crop },
      imgW: active.origW,
      imgH: active.origH,
      scale,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = stageState.current;
    if (!s || !active) return;
    const dxImg = (e.clientX - s.startX) / s.scale;
    const dyImg = (e.clientY - s.startY) / s.scale;
    let { x, y, w, h } = s.startCrop;
    const h_ = s.handle;

    if (h_ === "move") {
      x += dxImg;
      y += dyImg;
    } else {
      // Resize per handle
      let nx = x;
      let ny = y;
      let nw = w;
      let nh = h;
      if (h_.includes("w")) {
        nx = x + dxImg;
        nw = w - dxImg;
      }
      if (h_.includes("e")) {
        nw = w + dxImg;
      }
      if (h_.includes("n")) {
        ny = y + dyImg;
        nh = h - dyImg;
      }
      if (h_.includes("s")) {
        nh = h + dyImg;
      }
      // Aspect lock
      if (aspect) {
        // Adjust so nw/nh == aspect. Prefer changing the axis dominant in this handle.
        if (h_ === "n" || h_ === "s") {
          nw = nh * aspect;
          // keep center horizontally
          nx = x + (w - nw) / 2;
        } else if (h_ === "e" || h_ === "w") {
          nh = nw / aspect;
          ny = y + (h - nh) / 2;
        } else {
          // corner: match width to height keeping the opposite corner fixed
          if (Math.abs(dxImg) > Math.abs(dyImg)) {
            nh = nw / aspect;
            if (h_.includes("n")) ny = y + h - nh;
          } else {
            nw = nh * aspect;
            if (h_.includes("w")) nx = x + w - nw;
          }
        }
      }
      x = nx;
      y = ny;
      w = nw;
      h = nh;
    }
    // Enforce min size and bounds
    if (w < 8) w = 8;
    if (h < 8) h = 8;
    const clamped = clampCrop({ x, y, w, h }, s.imgW, s.imgH);
    setRows((prev) =>
      prev.map((r) => (r.id === active.id ? { ...r, crop: clamped } : r)),
    );
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    stageState.current = null;
  };

  // Manual pixel inputs sync
  const setCropField = (k: keyof CropRect, v: number) => {
    if (!active) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== active.id) return r;
        const next = { ...r.crop, [k]: Math.max(1, Math.floor(v || 0)) };
        return { ...r, crop: clampCrop(next, r.origW, r.origH) };
      }),
    );
  };

  // Rendering geometry
  const stageStyle = useMemo(() => {
    if (!active) return { width: "100%", aspectRatio: "16 / 9" as const };
    return {
      width: "100%",
      aspectRatio: `${active.origW} / ${active.origH}`,
    };
  }, [active]);

  const cropBoxStyle = (r: Row) => {
    const left = (r.crop.x / r.origW) * 100;
    const top = (r.crop.y / r.origH) * 100;
    const width = (r.crop.w / r.origW) * 100;
    const height = (r.crop.h / r.origH) * 100;
    return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
  };

  const cropOne = async (row: Row): Promise<Row> => {
    const c = clampCrop(row.crop, row.origW, row.origH);
    const canvas = document.createElement("canvas");
    canvas.width = c.w;
    canvas.height = c.h;
    const ctx = canvas.getContext("2d", { alpha: row.fmt !== "jpg" });
    if (!ctx) throw new Error("Canvas not supported");
    if (row.fmt === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, c.w, c.h);
    }
    ctx.drawImage(row.bitmap, c.x, c.y, c.w, c.h, 0, 0, c.w, c.h);
    const q = row.fmt === "png" ? undefined : quality;
    const blob = await canvasToBlob(canvas, mimeOf(row.fmt), q);
    const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const outName = `${base}-cropped-${c.w}x${c.h}.${extOf(row.fmt)}`;
    return {
      ...row,
      status: "done",
      outBlob: blob,
      outName,
      outSize: blob.size,
      crop: c,
    };
  };

  const cropAll = async () => {
    if (!rows.length) return;
    setRunning(true);
    for (const row of rows) {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: "processing" } : r)),
      );
      try {
        const next = await cropOne(row);
        setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Crop failed";
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, status: "error", error: msg } : r,
          ),
        );
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Crop finished");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob || !row.outName) return;
    saveAs(row.outBlob, row.outName);
  };
  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (!done.length) {
      toast.error("Crop some files first");
      return;
    }
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) zip.file(uniqueZipName(used, r.outName!), r.outBlob!);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "cropped-images.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <UploadDropzone
        accept={ACCEPT}
        multiple
        buttonLabel="Select images"
        hint="or drop JPG, PNG, or WebP images here"
        onFiles={addFiles}
        accent="#0EA5E9"
      />

      {rows.length > 0 && (
        <>
          {/* File strip */}
          <div className="mt-6 flex flex-wrap gap-2">
            {rows.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveId(r.id)}
                className={`group relative flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[12px] ${
                  activeId === r.id
                    ? "border-[#0EA5E9] bg-[#eff6ff] text-[#0369a1]"
                    : "border-[#ececef] bg-white text-[#33333c] hover:bg-[#f9fafb]"
                }`}
                title={r.file.name}
              >
                <img
                  src={r.previewUrl}
                  alt=""
                  className="h-8 w-8 rounded object-cover"
                />
                <span className="max-w-[140px] truncate">{r.file.name}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRow(r.id);
                  }}
                  className="rounded p-0.5 text-[#8a8a95] hover:bg-white hover:text-[#e5322d]"
                  aria-label={`Remove ${r.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              </button>
            ))}
          </div>

          {/* Aspect + quality controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#ececef] bg-white p-3">
            <span className="text-[13px] font-semibold text-[#33333c]">Aspect:</span>
            {ASPECTS.map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={() => handleAspect(i)}
                className={`rounded-full border px-2.5 py-1 text-[12px] ${
                  aspectIdx === i
                    ? "border-[#0EA5E9] bg-[#eff6ff] text-[#0369a1]"
                    : "border-[#ececef] text-[#5a5a66] hover:bg-[#f9fafb]"
                }`}
              >
                {a.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[12px] text-[#5a5a66]">
              <span className="font-semibold text-[#33333c]">JPG/WebP quality</span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="accent-[#0EA5E9]"
              />
              <span>{Math.round(quality * 100)}</span>
            </div>
          </div>

          {/* Stage */}
          {active && (
            <div className="mt-4 rounded-xl border border-[#ececef] bg-[#f9fafb] p-3">
              <div className="mx-auto max-w-full overflow-hidden">
                <div
                  ref={stageRef}
                  className="relative mx-auto max-w-full select-none touch-none"
                  style={stageStyle}
                >
                  <img
                    src={active.previewUrl}
                    alt={active.file.name}
                    className="absolute inset-0 h-full w-full"
                    draggable={false}
                  />
                  {/* Dim overlays outside crop */}
                  <div className="pointer-events-none absolute inset-0">
                    <div
                      className="absolute bg-black/45"
                      style={{
                        left: 0,
                        top: 0,
                        right: 0,
                        height: `${(active.crop.y / active.origH) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute bg-black/45"
                      style={{
                        left: 0,
                        top: `${(active.crop.y / active.origH) * 100}%`,
                        width: `${(active.crop.x / active.origW) * 100}%`,
                        height: `${(active.crop.h / active.origH) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute bg-black/45"
                      style={{
                        left: `${((active.crop.x + active.crop.w) / active.origW) * 100}%`,
                        top: `${(active.crop.y / active.origH) * 100}%`,
                        right: 0,
                        height: `${(active.crop.h / active.origH) * 100}%`,
                      }}
                    />
                    <div
                      className="absolute bg-black/45"
                      style={{
                        left: 0,
                        top: `${((active.crop.y + active.crop.h) / active.origH) * 100}%`,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                  </div>

                  {/* Crop box */}
                  <div
                    className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                    style={cropBoxStyle(active)}
                  >
                    {/* Grid: rule of thirds */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute left-1/3 top-0 h-full w-px bg-white/60" />
                      <div className="absolute left-2/3 top-0 h-full w-px bg-white/60" />
                      <div className="absolute top-1/3 left-0 w-full h-px bg-white/60" />
                      <div className="absolute top-2/3 left-0 w-full h-px bg-white/60" />
                    </div>
                    {/* Move region */}
                    <div
                      className="absolute inset-0 cursor-move"
                      onPointerDown={(e) => onPointerDown(e, "move")}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                    />
                    {/* Edge handles */}
                    <Handle pos="n" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="s" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="e" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="w" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    {/* Corner handles */}
                    <Handle pos="nw" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="ne" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="sw" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                    <Handle pos="se" onDown={onPointerDown} onMove={onPointerMove} onUp={onPointerUp} />
                  </div>
                </div>
              </div>

              {/* Pixel inputs */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
                <NumField label="X" value={active.crop.x} onChange={(v) => setCropField("x", v)} />
                <NumField label="Y" value={active.crop.y} onChange={(v) => setCropField("y", v)} />
                <NumField label="Width" value={active.crop.w} onChange={(v) => setCropField("w", v)} />
                <NumField label="Height" value={active.crop.h} onChange={(v) => setCropField("h", v)} />
              </div>
              <p className="mt-2 text-[12px] text-[#5a5a66]">
                Original: {active.origW} x {active.origH} px | Crop: {active.crop.w} x {active.crop.h} px
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={cropAll}
              disabled={running}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] px-6 text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(14,165,233,0.25)] disabled:opacity-60"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scissors className="h-4 w-4" />}
              Crop all
            </button>
            <button
              type="button"
              onClick={downloadZip}
              disabled={doneCount === 0}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl border border-[#ececef] bg-white px-4 text-[14px] font-semibold text-[#33333c] hover:bg-[#f9fafb] disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Download ZIP ({doneCount})
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto inline-flex h-[46px] items-center justify-center rounded-xl border border-[#ececef] bg-white px-3 text-[13px] font-semibold text-[#5a5a66] hover:bg-[#f9fafb]"
            >
              Clear all
            </button>
          </div>

          {/* Per-file results */}
          <ul className="mt-4 space-y-2">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-[#ececef] bg-white px-3 py-2 text-[13px]"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[#33333c]">{r.file.name}</div>
                  <div className="text-[12px] text-[#5a5a66]">
                    {r.origW} x {r.origH} px
                    {r.status === "done" && r.outSize
                      ? ` | cropped ${r.crop.w} x ${r.crop.h} | ${formatBytes(r.outSize)}`
                      : r.status === "error"
                        ? ` | ${r.error}`
                        : ""}
                  </div>
                </div>
                {r.status === "done" && r.outBlob ? (
                  <button
                    type="button"
                    onClick={() => downloadOne(r)}
                    className="ml-3 inline-flex items-center gap-1 rounded-md border border-[#ececef] px-2.5 py-1 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                ) : r.status === "processing" ? (
                  <Loader2 className="ml-3 h-4 w-4 animate-spin text-[#5a5a66]" />
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="font-semibold text-[#33333c]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-24 rounded-md border border-[#ececef] px-2 py-1 text-[12px]"
      />
    </label>
  );
}

function Handle({
  pos,
  onDown,
  onMove,
  onUp,
}: {
  pos: Handle;
  onDown: (e: React.PointerEvent, h: Handle) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp: (e: React.PointerEvent) => void;
}) {
  const style: React.CSSProperties = { position: "absolute" };
  const size = 18; // hit area
  const half = size / 2;
  const cursor: Record<Handle, string> = {
    move: "move",
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
  };
  const place: Record<Handle, React.CSSProperties> = {
    move: {},
    n: { left: `calc(50% - ${half}px)`, top: -half },
    s: { left: `calc(50% - ${half}px)`, bottom: -half },
    e: { right: -half, top: `calc(50% - ${half}px)` },
    w: { left: -half, top: `calc(50% - ${half}px)` },
    nw: { left: -half, top: -half },
    ne: { right: -half, top: -half },
    sw: { left: -half, bottom: -half },
    se: { right: -half, bottom: -half },
  };
  return (
    <div
      style={{
        ...style,
        ...place[pos],
        width: size,
        height: size,
        cursor: cursor[pos],
        touchAction: "none",
      }}
      onPointerDown={(e) => onDown(e, pos)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="rounded-full border-2 border-white bg-[#0EA5E9] shadow"
    />
  );
}
