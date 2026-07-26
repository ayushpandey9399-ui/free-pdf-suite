import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, X, Loader2, Type as TypeIcon, Image as ImageIcon2 } from "lucide-react";
import { loadJSZip } from "@/lib/lazyLibs";
import { saveAs } from "@/lib/saveFile";
import { guardDecodedSize, isSvgFile, uniqueZipName } from "@/lib/imageSafety";

type Fmt = "jpg" | "png" | "webp";
type WmType = "text" | "logo";
type PosKey =
  | "tl" | "tc" | "tr"
  | "ml" | "mc" | "mr"
  | "bl" | "bc" | "br";

type Row = {
  id: string;
  file: File;
  fmt: Fmt;
  origW: number;
  origH: number;
  bitmap: ImageBitmap;
  outBlob?: Blob;
  outName?: string;
  outSize?: number;
  status: "ready" | "processing" | "done" | "error";
  error?: string;
};

type Config = {
  type: WmType;
  text: string;
  color: string;
  bold: boolean;
  fontSizePct: number; // percent of min(width, height)
  logoBitmap: ImageBitmap | null;
  logoName: string;
  logoScalePct: number; // percent of image width
  opacity: number; // 0..1
  rotation: 0 | 45 | 90 | -45;
  position: PosKey;
  tile: boolean;
  margin: number; // percent of min dim
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

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
function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      mime,
      quality,
    );
  });
}

/** Compute anchor (x, y) inside canvas for a given position and content size. */
function anchorFor(
  pos: PosKey,
  cw: number,
  ch: number,
  contentW: number,
  contentH: number,
  margin: number,
): { x: number; y: number } {
  let x = cw / 2;
  let y = ch / 2;
  const col = pos[1];
  const row = pos[0];
  if (row === "t") y = margin + contentH / 2;
  else if (row === "b") y = ch - margin - contentH / 2;
  else y = ch / 2;
  if (col === "l") x = margin + contentW / 2;
  else if (col === "r") x = cw - margin - contentW / 2;
  else x = cw / 2;
  return { x, y };
}

function drawWatermark(
  canvas: HTMLCanvasElement,
  bmp: ImageBitmap,
  cfg: Config,
  fmt: Fmt,
) {
  const w = bmp.width;
  const h = bmp.height;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  if (fmt === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(bmp, 0, 0, w, h);

  const minDim = Math.min(w, h);
  const marginPx = Math.round((cfg.margin / 100) * minDim);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, cfg.opacity));

  if (cfg.type === "text") {
    const text = cfg.text || "";
    if (!text) {
      ctx.restore();
      return;
    }
    const fontPx = Math.max(8, Math.round((cfg.fontSizePct / 100) * minDim));
    const weight = cfg.bold ? "700" : "500";
    ctx.font = `${weight} ${fontPx}px "Plus Jakarta Sans", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = cfg.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontPx * 1.15;

    if (cfg.tile) {
      const stepX = Math.max(40, textW + minDim * 0.08);
      const stepY = Math.max(40, textH + minDim * 0.08);
      // Cover a diagonal by iterating a padded region and applying rotation.
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((cfg.rotation * Math.PI) / 180);
      // Draw over a bounding square that fully covers rotated canvas.
      const D = Math.ceil(Math.hypot(w, h));
      for (let y = -D / 2; y <= D / 2; y += stepY) {
        for (let x = -D / 2; x <= D / 2; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      const { x, y } = anchorFor(cfg.position, w, h, textW, textH, marginPx);
      ctx.translate(x, y);
      ctx.rotate((cfg.rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
    }
  } else {
    const logo = cfg.logoBitmap;
    if (!logo) {
      ctx.restore();
      return;
    }
    const logoW = Math.max(8, Math.round((cfg.logoScalePct / 100) * w));
    const logoH = Math.round(logoW * (logo.height / logo.width));

    if (cfg.tile) {
      const stepX = Math.max(40, logoW + minDim * 0.06);
      const stepY = Math.max(40, logoH + minDim * 0.06);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((cfg.rotation * Math.PI) / 180);
      const D = Math.ceil(Math.hypot(w, h));
      for (let y = -D / 2; y <= D / 2; y += stepY) {
        for (let x = -D / 2; x <= D / 2; x += stepX) {
          ctx.drawImage(logo, x - logoW / 2, y - logoH / 2, logoW, logoH);
        }
      }
      ctx.restore();
    } else {
      const { x, y } = anchorFor(cfg.position, w, h, logoW, logoH, marginPx);
      ctx.translate(x, y);
      ctx.rotate((cfg.rotation * Math.PI) / 180);
      ctx.drawImage(logo, -logoW / 2, -logoH / 2, logoW, logoH);
    }
  }
  ctx.restore();
}

const DEFAULT_CFG: Config = {
  type: "text",
  text: "© Your Brand",
  color: "#ffffff",
  bold: true,
  fontSizePct: 6,
  logoBitmap: null,
  logoName: "",
  logoScalePct: 20,
  opacity: 0.4,
  rotation: 0,
  position: "br",
  tile: false,
  margin: 3,
};

function PreviewCanvas({ row, cfg }: { row: Row; cfg: Config }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // Render at up to 800px for perf; watermark is scaled to image dims so
    // the preview reflects the output faithfully.
    const scratch = document.createElement("canvas");
    drawWatermark(scratch, row.bitmap, cfg, row.fmt);
    const maxDim = 800;
    const s = Math.min(1, maxDim / Math.max(scratch.width, scratch.height));
    const dw = Math.max(1, Math.round(scratch.width * s));
    const dh = Math.max(1, Math.round(scratch.height * s));
    c.width = dw;
    c.height = dh;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(scratch, 0, 0, dw, dh);
  }, [row, cfg]);
  return (
    <div className="flex items-center justify-center rounded-lg border border-[#ececef] bg-[repeating-conic-gradient(#f3f4f6_0%_25%,#ffffff_0%_50%)_50%/16px_16px] p-2">
      <canvas ref={ref} className="max-h-[360px] max-w-full" />
    </div>
  );
}

const POS_LABEL: Record<PosKey, string> = {
  tl: "Top left", tc: "Top center", tr: "Top right",
  ml: "Middle left", mc: "Center", mr: "Middle right",
  bl: "Bottom left", bc: "Bottom center", br: "Bottom right",
};
const POS_KEYS: PosKey[] = ["tl","tc","tr","ml","mc","mr","bl","bc","br"];

export function WatermarkImageTool() {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cfg, setCfg] = useState<Config>(DEFAULT_CFG);
  const [quality, setQuality] = useState<number>(0.9);
  const [running, setRunning] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const active = useMemo(
    () => rows.find((r) => r.id === activeId) ?? rows[0] ?? null,
    [rows, activeId],
  );

  const addFiles = useCallback(async (incoming: FileList | File[]) => {
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
        added.push({
          id: `${++idRef.current}-${f.name}`,
          file: f,
          fmt: fmtOf(f),
          origW: bmp.width,
          origH: bmp.height,
          bitmap: bmp,
          status: "ready",
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not read image";
        toast.error(`"${f.name}": ${msg}`);
      }
    }
    if (added.length) {
      setRows((prev) => [...prev, ...added]);
      if (!activeId) setActiveId(added[0].id);
    }
  }, [activeId]);

  useEffect(() => {
    return () => {
      rows.forEach((r) => r.bitmap.close?.());
      cfg.logoBitmap?.close?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLogo = useCallback(async (f: File) => {
    if (isSvgFile(f)) {
      toast.error("SVG logos are not supported");
      return;
    }
    if (!isSupported(f)) {
      toast.error("Logo must be JPG, PNG, or WebP");
      return;
    }
    try {
      const bmp = await decodeBitmap(f);
      guardDecodedSize(bmp.width, bmp.height);
      setCfg((c) => {
        c.logoBitmap?.close?.();
        return { ...c, logoBitmap: bmp, logoName: f.name };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not read logo";
      toast.error(msg);
    }
  }, []);

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

  const applyOne = async (row: Row): Promise<Row> => {
    const canvas = document.createElement("canvas");
    drawWatermark(canvas, row.bitmap, cfg, row.fmt);
    const q = row.fmt === "png" ? undefined : quality;
    const blob = await canvasToBlob(canvas, mimeOf(row.fmt), q);
    const base = row.file.name.replace(/\.(jpe?g|png|webp)$/i, "");
    const outName = `${base}-watermarked.${extOf(row.fmt)}`;
    return { ...row, status: "done", outBlob: blob, outName, outSize: blob.size };
  };

  const runAll = async () => {
    if (!rows.length) return;
    if (cfg.type === "text" && !cfg.text.trim()) {
      toast.error("Enter watermark text first");
      return;
    }
    if (cfg.type === "logo" && !cfg.logoBitmap) {
      toast.error("Upload a logo first");
      return;
    }
    setRunning(true);
    for (const row of rows) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "processing" } : r)));
      try {
        const next = await applyOne(row);
        setRows((prev) => prev.map((r) => (r.id === row.id ? next : r)));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Watermark failed";
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "error", error: msg } : r)));
        toast.error(`"${row.file.name}": ${msg}`);
      }
    }
    setRunning(false);
    toast.success("Done");
  };

  const downloadOne = (row: Row) => {
    if (!row.outBlob || !row.outName) return;
    saveAs(row.outBlob, row.outName);
  };
  const downloadZip = async () => {
    const done = rows.filter((r) => r.status === "done" && r.outBlob && r.outName);
    if (!done.length) {
      toast.error("Apply the watermark first");
      return;
    }
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    const used = new Set<string>();
    for (const r of done) zip.file(uniqueZipName(used, r.outName!), r.outBlob!);
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "watermarked-images.zip");
  };

  const doneCount = rows.filter((r) => r.status === "done").length;

  const setC = <K extends keyof Config>(k: K, v: Config[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Dropzone */}
      <UploadDropzone
        accept={ACCEPT}
        multiple
        buttonLabel="Select images"
        hint="or drop JPG, PNG, or WebP images here"
        onFiles={addFiles}
        accent="#F97316"
      />

      {rows.length > 0 && active && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Preview + strip */}
          <div>
            <PreviewCanvas row={active} cfg={cfg} />
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {rows.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className={`group relative flex-shrink-0 rounded-lg border p-1 ${
                    r.id === active.id ? "border-[#F97316] ring-2 ring-[#F97316]/30" : "border-[#ececef]"
                  }`}
                  title={r.file.name}
                >
                  <StripThumb row={r} />
                  <div className="mt-1 max-w-[96px] truncate text-[11px] text-[#33333c]">
                    {r.file.name}
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); removeRow(r.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeRow(r.id); } }}
                    className="absolute -right-1 -top-1 hidden rounded-full bg-white p-0.5 shadow group-hover:block"
                    aria-label={`Remove ${r.file.name}`}
                  >
                    <X className="h-3 w-3 text-[#5a5a66]" />
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-[12px] text-[#6B7280]">
              {active.origW}x{active.origH} - {formatBytes(active.file.size)} - {active.fmt.toUpperCase()}
            </div>
          </div>

          {/* Controls */}
          <aside className="rounded-xl border border-[#ececef] bg-white p-4">
            {/* Type toggle */}
            <div className="flex rounded-lg border border-[#ececef] p-1">
              <button
                type="button"
                onClick={() => setC("type", "text")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-[13px] font-semibold ${
                  cfg.type === "text" ? "bg-[#F97316] text-white" : "text-[#33333c]"
                }`}
              >
                <TypeIcon className="h-4 w-4" /> Text
              </button>
              <button
                type="button"
                onClick={() => setC("type", "logo")}
                className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-[13px] font-semibold ${
                  cfg.type === "logo" ? "bg-[#F97316] text-white" : "text-[#33333c]"
                }`}
              >
                <ImageIcon2 className="h-4 w-4" /> Logo
              </button>
            </div>

            {cfg.type === "text" ? (
              <div className="mt-4 space-y-3">
                <label className="block text-[12px] font-semibold text-[#33333c]">
                  Watermark text
                  <input
                    type="text"
                    value={cfg.text}
                    onChange={(e) => setC("text", e.target.value)}
                    maxLength={120}
                    className="mt-1 w-full rounded-md border border-[#ececef] px-3 py-2 text-[14px] font-normal focus:border-[#F97316] focus:outline-none"
                  />
                </label>
                <label className="block text-[12px] font-semibold text-[#33333c]">
                  Font size: {cfg.fontSizePct}%
                  <input
                    type="range" min={2} max={20} step={0.5}
                    value={cfg.fontSizePct}
                    onChange={(e) => setC("fontSizePct", Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[12px] font-semibold text-[#33333c]">
                    Color
                    <input
                      type="color"
                      value={cfg.color}
                      onChange={(e) => setC("color", e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-[#ececef]"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#33333c]">
                    <input
                      type="checkbox"
                      checked={cfg.bold}
                      onChange={(e) => setC("bold", e.target.checked)}
                    />
                    Bold
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full rounded-md border border-dashed border-[#ececef] px-3 py-3 text-[13px] font-semibold text-[#33333c] hover:border-[#F97316] hover:bg-[#fff7ed]"
                  >
                    {cfg.logoBitmap ? `Logo: ${cfg.logoName}` : "Upload logo (PNG, JPG, WebP)"}
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) chooseLogo(f);
                      e.target.value = "";
                    }}
                  />
                  <p className="mt-1 text-[11px] text-[#6B7280]">
                    A transparent PNG logo works best.
                  </p>
                </div>
                <label className="block text-[12px] font-semibold text-[#33333c]">
                  Logo size: {cfg.logoScalePct}% of image width
                  <input
                    type="range" min={5} max={80} step={1}
                    value={cfg.logoScalePct}
                    onChange={(e) => setC("logoScalePct", Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>
              </div>
            )}

            <div className="my-4 h-px bg-[#ececef]" />

            <label className="block text-[12px] font-semibold text-[#33333c]">
              Opacity: {Math.round(cfg.opacity * 100)}%
              <input
                type="range" min={0.05} max={1} step={0.05}
                value={cfg.opacity}
                onChange={(e) => setC("opacity", Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>

            <div className="mt-3">
              <div className="text-[12px] font-semibold text-[#33333c]">Rotation</div>
              <div className="mt-1 flex gap-1.5">
                {[0, 45, -45, 90].map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setC("rotation", deg as Config["rotation"])}
                    className={`flex-1 rounded-md border py-1.5 text-[12px] font-semibold ${
                      cfg.rotation === deg
                        ? "border-[#F97316] bg-[#fff7ed] text-[#F97316]"
                        : "border-[#ececef] text-[#33333c]"
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold text-[#33333c]">Position</div>
                <label className="flex items-center gap-1.5 text-[12px] font-semibold text-[#33333c]">
                  <input
                    type="checkbox"
                    checked={cfg.tile}
                    onChange={(e) => setC("tile", e.target.checked)}
                  />
                  Tile
                </label>
              </div>
              <div className={`mt-1 grid grid-cols-3 gap-1 ${cfg.tile ? "opacity-40 pointer-events-none" : ""}`}>
                {POS_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setC("position", k)}
                    className={`aspect-square rounded border ${
                      cfg.position === k
                        ? "border-[#F97316] bg-[#F97316]"
                        : "border-[#ececef] bg-white hover:bg-[#f9fafb]"
                    }`}
                    aria-label={POS_LABEL[k]}
                    title={POS_LABEL[k]}
                  >
                    <span className={`mx-auto block h-1.5 w-1.5 rounded-full ${
                      cfg.position === k ? "bg-white" : "bg-[#9ca3af]"
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-3 block text-[12px] font-semibold text-[#33333c]">
              Margin: {cfg.margin}%
              <input
                type="range" min={0} max={15} step={0.5}
                value={cfg.margin}
                onChange={(e) => setC("margin", Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>

            <div className="my-4 h-px bg-[#ececef]" />

            <label className="block text-[12px] font-semibold text-[#33333c]">
              JPG/WebP quality: {quality.toFixed(2)}
              <input
                type="range" min={0.3} max={1} step={0.05}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={runAll}
                disabled={running}
                className="inline-flex h-[46px] items-center justify-center rounded-xl bg-[#F97316] px-5 text-[14px] font-semibold text-white shadow-[0_10px_28px_rgba(249,115,22,0.28)] disabled:opacity-60"
              >
                {running ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                ) : (
                  `Apply to ${rows.length} image${rows.length === 1 ? "" : "s"}`
                )}
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={downloadZip}
                  disabled={doneCount === 0}
                  className="inline-flex h-[40px] flex-1 items-center justify-center rounded-lg border border-[#ececef] bg-white px-3 text-[13px] font-semibold text-[#33333c] hover:bg-[#f9fafb] disabled:opacity-60"
                >
                  <Download className="mr-1.5 h-4 w-4" /> ZIP
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-[40px] items-center justify-center rounded-lg border border-[#ececef] bg-white px-3 text-[13px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
                >
                  Clear
                </button>
              </div>
            </div>
          </aside>

          {/* Per-file results */}
          {doneCount > 0 && (
            <div className="lg:col-span-2">
              <h3 className="mt-4 text-[14px] font-semibold text-[#1F2937]">Results</h3>
              <ul className="mt-2 divide-y divide-[#ececef] rounded-xl border border-[#ececef] bg-white">
                {rows.filter((r) => r.status === "done").map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#1F2937]">{r.outName}</div>
                      <div className="text-[11px] text-[#6B7280]">
                        {formatBytes(r.file.size)} → {r.outSize ? formatBytes(r.outSize) : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadOne(r)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#ececef] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StripThumb({ row }: { row: Row }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const maxDim = 96;
    const s = Math.min(1, maxDim / Math.max(row.origW, row.origH));
    const dw = Math.max(1, Math.round(row.origW * s));
    const dh = Math.max(1, Math.round(row.origH * s));
    c.width = dw;
    c.height = dh;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (row.fmt === "jpg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, dw, dh); }
    ctx.drawImage(row.bitmap, 0, 0, dw, dh);
  }, [row]);
  return <canvas ref={ref} className="block max-h-[72px] max-w-[96px]" />;
}
