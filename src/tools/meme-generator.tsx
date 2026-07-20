import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Plus, Trash2, RotateCcw, RotateCw } from "lucide-react";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";

type Fmt = "jpg" | "png";

type FontKey = "anton" | "oswald" | "bebas" | "comic";

type TextBox = {
  id: string;
  text: string;
  xPct: number;
  yPct: number;
  align: "left" | "center" | "right";
  role: "top" | "bottom" | "free";
  fontKey: FontKey;
  color: string;
  outlineColor: string;
  outlineOn: boolean;
  fontSizePct?: number;
  rotation: number; // degrees, only used for free
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const FONTS: Record<FontKey, { label: string; stack: string }> = {
  anton: { label: "Anton (classic)", stack: '"Anton", "Arial Narrow", sans-serif' },
  oswald: { label: "Oswald", stack: '700 "Oswald", sans-serif' },
  bebas: { label: "Bebas Neue", stack: '"Bebas Neue", "Oswald", sans-serif' },
  comic: { label: "Comic Neue", stack: '700 "Comic Neue", "Comic Sans MS", cursive' },
};

const SWATCHES = ["#FFFFFF", "#000000", "#FACC15", "#EF4444", "#3B82F6", "#22C55E", "#EC4899", "#F97316"];

async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

function isSupported(f: File): boolean {
  const t = f.type;
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") return true;
  return /\.(jpe?g|png|webp)$/i.test(f.name);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  for (const p of paragraphs) {
    if (!p.trim()) {
      out.push("");
      continue;
    }
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width <= maxWidth || !line) {
        line = test;
      } else {
        out.push(line);
        line = w;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encode failed"))), mime, quality);
  });
}

function fontSpec(fontKey: FontKey, px: number): string {
  const raw = FONTS[fontKey].stack;
  // Stack may already include a weight prefix; ensure a size is present.
  if (/^\d/.test(raw)) return `${raw.replace(/^(\d+)\s+/, `$1 ${px}px `)}`;
  return `400 ${px}px ${raw}`;
}

function drawMeme(params: {
  ctx: CanvasRenderingContext2D;
  bitmap: ImageBitmap;
  captionBar: boolean;
  captionText: string;
  imgW: number;
  imgH: number;
  padTop: number;
  fontSizePct: number;
  uppercase: boolean;
  boxes: TextBox[];
}): void {
  const {
    ctx, bitmap, captionBar, captionText, imgW, imgH, padTop, fontSizePct, uppercase, boxes,
  } = params;

  const cw = imgW;
  const ch = imgH + padTop;
  ctx.canvas.width = cw;
  ctx.canvas.height = ch;

  if (captionBar && padTop > 0) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cw, padTop);
  }
  ctx.drawImage(bitmap, 0, padTop, imgW, imgH);

  if (captionBar && captionText.trim()) {
    const capPx = Math.max(10, Math.round(padTop * 0.55));
    ctx.font = fontSpec("anton", capPx);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxW = cw * 0.92;
    const raw = uppercase ? captionText.toUpperCase() : captionText;
    const lines = wrapLines(ctx, raw, maxW);
    const lineH = capPx * 1.05;
    const totalH = lines.length * lineH;
    let y = padTop / 2 - totalH / 2 + lineH / 2;
    for (const line of lines) {
      ctx.fillText(line, cw / 2, y);
      y += lineH;
    }
  }

  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  for (const box of boxes) {
    if (!box.text.trim()) continue;
    const sizePct = box.fontSizePct ?? fontSizePct;
    const basePx = Math.max(10, Math.round((imgW * sizePct) / 100));
    const outline = Math.max(2, Math.round(basePx * 0.12));
    ctx.font = fontSpec(box.fontKey, basePx);

    const raw = uppercase ? box.text.toUpperCase() : box.text;
    const maxW = cw * 0.92;
    const lines = wrapLines(ctx, raw, maxW);
    const lineH = basePx * 1.05;
    const totalH = lines.length * lineH;

    const x = box.xPct * cw;
    let yTopOfBlock: number;
    if (box.role === "top") {
      const margin = basePx * 0.35;
      yTopOfBlock = (captionBar ? padTop : 0) + margin;
    } else if (box.role === "bottom") {
      const margin = basePx * 0.35;
      yTopOfBlock = ch - margin - totalH;
    } else {
      yTopOfBlock = box.yPct * ch - totalH / 2;
    }

    ctx.textAlign = box.align;

    const rot = box.role === "free" ? (box.rotation || 0) : 0;
    if (rot !== 0) {
      const cx = x;
      const cy = yTopOfBlock + totalH / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((rot * Math.PI) / 180);
      let y = -totalH / 2 + lineH / 2;
      for (const line of lines) {
        if (box.outlineOn) {
          ctx.lineWidth = outline;
          ctx.strokeStyle = box.outlineColor;
          ctx.strokeText(line, 0, y);
        }
        ctx.fillStyle = box.color;
        ctx.fillText(line, 0, y);
        y += lineH;
      }
      ctx.restore();
    } else {
      let y = yTopOfBlock + lineH / 2;
      for (const line of lines) {
        if (box.outlineOn) {
          ctx.lineWidth = outline;
          ctx.strokeStyle = box.outlineColor;
          ctx.strokeText(line, x, y);
        }
        ctx.fillStyle = box.color;
        ctx.fillText(line, x, y);
        y += lineH;
      }
    }
  }
}

function defaultStyle(): Pick<TextBox, "fontKey" | "color" | "outlineColor" | "outlineOn"> {
  return { fontKey: "anton", color: "#FFFFFF", outlineColor: "#000000", outlineOn: true };
}

export function MemeGeneratorTool() {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [fileName, setFileName] = useState<string>("");

  const [topBox, setTopBox] = useState<TextBox>(() => ({
    id: "__top", text: "Top text", xPct: 0.5, yPct: 0, align: "center", role: "top",
    rotation: 0, ...defaultStyle(),
  }));
  const [bottomBox, setBottomBox] = useState<TextBox>(() => ({
    id: "__bottom", text: "Bottom text", xPct: 0.5, yPct: 1, align: "center", role: "bottom",
    rotation: 0, ...defaultStyle(),
  }));
  const [extraBoxes, setExtraBoxes] = useState<TextBox[]>([]);
  const [selectedId, setSelectedId] = useState<string>("__top");

  const [uppercase, setUppercase] = useState(true);
  const [fontSizePct, setFontSizePct] = useState(8);
  const [captionBar, setCaptionBar] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionHeightPct, setCaptionHeightPct] = useState(14);
  const [exportFmt, setExportFmt] = useState<Fmt>("jpg");
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<{ id: string; kind: "move" | "rotate"; dxPct: number; dyPct: number; cxPct: number; cyPct: number } | null>(null);
  const [, forceTick] = useState(0);

  // Preload all four fonts so first draw uses them.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const anyDoc = document as unknown as { fonts?: { load: (spec: string) => Promise<unknown>; ready?: Promise<unknown> } };
    if (!anyDoc.fonts?.load) return;
    Promise.all([
      anyDoc.fonts.load('64px "Anton"'),
      anyDoc.fonts.load('700 64px "Oswald"'),
      anyDoc.fonts.load('64px "Bebas Neue"'),
      anyDoc.fonts.load('700 64px "Comic Neue"'),
    ]).finally(() => forceTick((n) => n + 1));
  }, []);

  const boxes: TextBox[] = useMemo(() => {
    const list: TextBox[] = [];
    if (!captionBar || !captionText) list.push(topBox);
    list.push(bottomBox);
    for (const b of extraBoxes) list.push(b);
    return list;
  }, [topBox, bottomBox, extraBoxes, captionBar, captionText]);

  const padTop = useMemo(() => {
    if (!captionBar || !imgW) return 0;
    return Math.max(48, Math.round((imgW * captionHeightPct) / 100));
  }, [captionBar, imgW, captionHeightPct]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !bitmap) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    drawMeme({ ctx, bitmap, captionBar, captionText, imgW, imgH, padTop, fontSizePct, uppercase, boxes });
  }, [bitmap, captionBar, captionText, imgW, imgH, padTop, fontSizePct, uppercase, boxes]);

  useEffect(() => { render(); }, [render]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const f = arr[0];
    if (!f) return;
    if (isSvgFile(f)) { toast.error("SVG files are not supported."); return; }
    if (!isSupported(f)) { toast.error("Please pick a JPG, PNG, or WebP image."); return; }
    try {
      const bmp = await decodeBitmap(f);
      guardDecodedSize(bmp.width, bmp.height);
      setBitmap(bmp);
      setImgW(bmp.width);
      setImgH(bmp.height);
      setFileName(f.name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that image.");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) void handleFiles(e.dataTransfer.files);
  };

  const addBox = () => {
    const id = `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setExtraBoxes((prev) => [
      ...prev,
      { id, text: "New text", xPct: 0.5, yPct: 0.5, align: "center", role: "free", rotation: 0, ...defaultStyle() },
    ]);
    setSelectedId(id);
  };
  const removeBox = (id: string) => {
    setExtraBoxes((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId("__top");
  };

  const updateSelected = (patch: Partial<TextBox>) => {
    if (selectedId === "__top") setTopBox((b) => ({ ...b, ...patch }));
    else if (selectedId === "__bottom") setBottomBox((b) => ({ ...b, ...patch }));
    else setExtraBoxes((prev) => prev.map((b) => (b.id === selectedId ? { ...b, ...patch } : b)));
  };
  const updateBox = (id: string, patch: Partial<TextBox>) => {
    if (id === "__top") setTopBox((b) => ({ ...b, ...patch }));
    else if (id === "__bottom") setBottomBox((b) => ({ ...b, ...patch }));
    else setExtraBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const selected: TextBox =
    selectedId === "__top" ? topBox : selectedId === "__bottom" ? bottomBox : (extraBoxes.find((b) => b.id === selectedId) ?? topBox);

  const getCanvasRect = () => canvasRef.current?.getBoundingClientRect() ?? null;

  const startDragMove = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    const box = extraBoxes.find((b) => b.id === id);
    if (!box) return;
    const rect = getCanvasRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    draggingRef.current = {
      id, kind: "move",
      dxPct: box.xPct - pxX / rect.width,
      dyPct: box.yPct - pxY / rect.height,
      cxPct: box.xPct, cyPct: box.yPct,
    };
  };

  const startDragRotate = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    const box = extraBoxes.find((b) => b.id === id);
    if (!box) return;
    const rect = getCanvasRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    draggingRef.current = {
      id, kind: "rotate",
      dxPct: 0, dyPct: 0,
      cxPct: box.xPct, cyPct: box.yPct,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = draggingRef.current;
    if (!drag) return;
    const rect = getCanvasRect();
    if (!rect) return;
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    if (drag.kind === "move") {
      const xPct = Math.min(1, Math.max(0, pxX / rect.width + drag.dxPct));
      const yPct = Math.min(1, Math.max(0, pxY / rect.height + drag.dyPct));
      setExtraBoxes((prev) => prev.map((b) => (b.id === drag.id ? { ...b, xPct, yPct } : b)));
    } else {
      const cx = drag.cxPct * rect.width;
      const cy = drag.cyPct * rect.height;
      let deg = (Math.atan2(pxY - cy, pxX - cx) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      if (deg < -180) deg += 360;
      const snaps = [-90, -45, 0, 45, 90, 180, -180];
      for (const s of snaps) {
        if (Math.abs(deg - s) < 7) { deg = s; break; }
      }
      setExtraBoxes((prev) => prev.map((b) => (b.id === drag.id ? { ...b, rotation: deg } : b)));
    }
  };
  const endDrag = () => { draggingRef.current = null; };

  const download = async () => {
    if (!bitmap || !canvasRef.current) return;
    setBusy(true);
    try {
      // Ensure all fonts are loaded before drawing.
      const anyDoc = document as unknown as { fonts?: { ready?: Promise<unknown> } };
      if (anyDoc.fonts?.ready) await anyDoc.fonts.ready;
      const cv = document.createElement("canvas");
      const ctx = cv.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      drawMeme({ ctx, bitmap, captionBar, captionText, imgW, imgH, padTop, fontSizePct, uppercase, boxes });
      const mime = exportFmt === "png" ? "image/png" : "image/jpeg";
      const blob = await canvasToBlob(cv, mime, exportFmt === "jpg" ? 0.92 : undefined);
      const base = (fileName || "meme").replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${base}-meme.${exportFmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setBitmap(null);
    setImgW(0); setImgH(0); setFileName("");
    setTopBox({ id: "__top", text: "Top text", xPct: 0.5, yPct: 0, align: "center", role: "top", rotation: 0, ...defaultStyle() });
    setBottomBox({ id: "__bottom", text: "Bottom text", xPct: 0.5, yPct: 1, align: "center", role: "bottom", rotation: 0, ...defaultStyle() });
    setExtraBoxes([]);
    setCaptionText(""); setCaptionBar(false); setSelectedId("__top");
  };

  const previewOverlay = useMemo(() => {
    if (!bitmap) return null;
    return extraBoxes.map((b) => ({ id: b.id, xPct: b.xPct * 100, yPct: b.yPct * 100, rotation: b.rotation, selected: b.id === selectedId }));
  }, [extraBoxes, bitmap, selectedId]);

  if (!bitmap) {
    return (
      <div className="mx-auto max-w-3xl">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-white p-10 text-center hover:border-[#eab308]"
        >
          <Upload className="h-8 w-8 text-[#eab308]" />
          <div className="text-[16px] font-semibold text-[#1F2937]">Drop a JPG, PNG, or WebP image</div>
          <div className="text-[13px] text-[#6B7280]">Your image never leaves your device</div>
          <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
          <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#eab308] px-4 py-2 text-[14px] font-semibold text-white">Select image</span>
        </label>
      </div>
    );
  }

  const isSelectedExtra = selected.role === "free";
  const selectedSizePct = selected.fontSizePct ?? fontSizePct;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* PREVIEW */}
      <div
        ref={previewRef}
        className="relative rounded-2xl border border-[#ececef] bg-[#faf7ef] p-4"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="relative mx-auto max-w-full" style={{ width: "100%" }}>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, background: "#fff", touchAction: "none" }}
          />
          {previewOverlay?.map((o) => (
            <div
              key={o.id}
              className="pointer-events-none absolute"
              style={{ left: `${o.xPct}%`, top: `${o.yPct}%`, transform: "translate(-50%, -50%)" }}
            >
              {o.selected ? (
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-dashed border-[#eab308]"
                  style={{ width: 80, height: 40, transform: `translate(-50%, -50%) rotate(${o.rotation}deg)` }}
                />
              ) : null}
              <button
                type="button"
                aria-label="Drag text"
                onPointerDown={(e) => startDragMove(o.id, e)}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#eab308] shadow-md"
                style={{ width: 22, height: 22, touchAction: "none" }}
              />
              {o.selected ? (
                <button
                  type="button"
                  aria-label="Rotate text"
                  onPointerDown={(e) => startDragRotate(o.id, e)}
                  className="pointer-events-auto absolute -translate-x-1/2 rounded-full border-2 border-white bg-[#1F2937] shadow-md flex items-center justify-center text-white"
                  style={{ width: 22, height: 22, top: -38, left: 0, touchAction: "none" }}
                >
                  <RotateCw className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-[12px] text-[#6B7280]">
          {imgW} x {imgH}px, live preview matches export
        </div>
      </div>

      {/* CONTROLS */}
      <div className="space-y-4">
        {/* Text content */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="block text-[12px] font-semibold text-[#4B5563]">Top text</label>
          <textarea
            rows={2}
            value={topBox.text}
            onFocus={() => setSelectedId("__top")}
            onChange={(e) => setTopBox((b) => ({ ...b, text: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Top text (leave blank to skip)"
          />
          <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Bottom text</label>
          <textarea
            rows={2}
            value={bottomBox.text}
            onFocus={() => setSelectedId("__bottom")}
            onChange={(e) => setBottomBox((b) => ({ ...b, text: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Bottom text (leave blank to skip)"
          />
        </div>

        {/* Selection tabs */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="text-[12px] font-semibold text-[#4B5563]">Editing</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { id: "__top", label: "Top" },
              { id: "__bottom", label: "Bottom" },
              ...extraBoxes.map((b, i) => ({ id: b.id, label: `Box ${i + 1}` })),
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${selectedId === t.id ? "bg-[#1F2937] text-white" : "bg-[#f3f4f6] text-[#4B5563]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Font picker */}
          <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Font</label>
          <select
            value={selected.fontKey}
            onChange={(e) => updateSelected({ fontKey: e.target.value as FontKey })}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white p-2 text-[14px]"
          >
            {(Object.keys(FONTS) as FontKey[]).map((k) => (
              <option key={k} value={k} style={{ fontFamily: FONTS[k].stack.replace(/^\d+\s+/, "") }}>
                {FONTS[k].label}
              </option>
            ))}
          </select>

          {/* Size override */}
          <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
            Size ({selectedSizePct}% of image width){selected.fontSizePct != null ? " (override)" : " (global)"}
          </label>
          <input
            type="range"
            min={3}
            max={20}
            step={1}
            value={selectedSizePct}
            onChange={(e) => updateSelected({ fontSizePct: Number(e.target.value) })}
            className="w-full"
          />
          {selected.fontSizePct != null ? (
            <button
              type="button"
              onClick={() => updateSelected({ fontSizePct: undefined })}
              className="mt-1 text-[11px] font-semibold text-[#4B5563] underline"
            >
              Reset to global size
            </button>
          ) : null}

          {/* Text color */}
          <div className="mt-3 text-[12px] font-semibold text-[#4B5563]">Text color</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Text color ${c}`}
                onClick={() => updateSelected({ color: c })}
                className={`h-6 w-6 rounded-full border ${selected.color.toUpperCase() === c ? "ring-2 ring-[#1F2937]" : "border-[#e5e7eb]"}`}
                style={{ background: c }}
              />
            ))}
            <input
              type="color"
              value={selected.color}
              onChange={(e) => updateSelected({ color: e.target.value })}
              className="h-7 w-9 cursor-pointer rounded border border-[#e5e7eb]"
              aria-label="Custom text color"
            />
          </div>

          {/* Outline */}
          <label className="mt-3 flex items-center justify-between text-[12px] font-semibold text-[#4B5563]">
            Outline
            <input
              type="checkbox"
              checked={selected.outlineOn}
              onChange={(e) => updateSelected({ outlineOn: e.target.checked })}
            />
          </label>
          {selected.outlineOn ? (
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Outline color ${c}`}
                  onClick={() => updateSelected({ outlineColor: c })}
                  className={`h-6 w-6 rounded-full border ${selected.outlineColor.toUpperCase() === c ? "ring-2 ring-[#1F2937]" : "border-[#e5e7eb]"}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={selected.outlineColor}
                onChange={(e) => updateSelected({ outlineColor: e.target.value })}
                className="h-7 w-9 cursor-pointer rounded border border-[#e5e7eb]"
                aria-label="Custom outline color"
              />
            </div>
          ) : null}

          {/* Rotation (free only) */}
          {isSelectedExtra ? (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
                Rotation ({Math.round(selected.rotation)}°)
              </label>
              <input
                type="range"
                min={-180}
                max={180}
                step={1}
                value={selected.rotation}
                onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                className="w-full"
              />
              <p className="mt-1 text-[11px] text-[#6B7280]">
                Drag the dark handle above the yellow dot in the preview to rotate. Snaps at 0, 45, 90.
              </p>
            </>
          ) : null}
        </div>

        {/* Global controls */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="flex items-center justify-between text-[13px] font-semibold text-[#1F2937]">
            UPPERCASE
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
          </label>
          <div className="mt-3">
            <label className="block text-[12px] font-semibold text-[#4B5563]">
              Global font size ({fontSizePct}% of image width)
            </label>
            <input
              type="range"
              min={3}
              max={16}
              step={1}
              value={fontSizePct}
              onChange={(e) => setFontSizePct(Number(e.target.value))}
              className="w-full"
            />
            <p className="mt-1 text-[11px] text-[#6B7280]">Used unless a box has its own size override.</p>
          </div>
        </div>

        {/* Caption bar */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="flex items-center justify-between text-[13px] font-semibold text-[#1F2937]">
            Caption bar (white padding on top)
            <input type="checkbox" checked={captionBar} onChange={(e) => setCaptionBar(e.target.checked)} />
          </label>
          {captionBar ? (
            <>
              <textarea
                rows={2}
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Caption text"
                className="mt-2 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
              />
              <label className="mt-2 block text-[12px] font-semibold text-[#4B5563]">
                Bar height ({captionHeightPct}% of image width)
              </label>
              <input
                type="range"
                min={8}
                max={30}
                step={1}
                value={captionHeightPct}
                onChange={(e) => setCaptionHeightPct(Number(e.target.value))}
                className="w-full"
              />
            </>
          ) : null}
        </div>

        {/* Extra boxes */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1F2937]">Extra text boxes</span>
            <button
              type="button"
              onClick={addBox}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1F2937] px-2.5 py-1.5 text-[12px] font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add text
            </button>
          </div>
          {extraBoxes.length === 0 ? (
            <p className="mt-2 text-[12px] text-[#6B7280]">Add draggable, rotatable captions anywhere on the image.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {extraBoxes.map((b, i) => (
                <li
                  key={b.id}
                  className={`rounded-lg border p-2 ${selectedId === b.id ? "border-[#eab308]" : "border-[#f1f2f4]"}`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      value={b.text}
                      onFocus={() => setSelectedId(b.id)}
                      onChange={(e) => updateBox(b.id, { text: e.target.value })}
                      className="min-w-0 flex-1 rounded-md border border-[#e5e7eb] p-1.5 text-[13px]"
                    />
                    <button
                      type="button"
                      aria-label="Delete box"
                      onClick={() => removeBox(b.id)}
                      className="rounded-md p-1.5 text-[#b91c1c] hover:bg-[#fef2f2]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#6B7280]">Box {i + 1}. Drag the yellow dot to move, the dark handle to rotate.</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <span className="block text-[13px] font-semibold text-[#1F2937]">Export as</span>
          <div className="mt-2 flex gap-2">
            {(["jpg", "png"] as Fmt[]).map((f) => (
              <label
                key={f}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold ${
                  exportFmt === f ? "border-[#eab308] bg-[#fef9c3] text-[#713f12]" : "border-[#e5e7eb] text-[#4B5563]"
                }`}
              >
                <input type="radio" name="fmt" value={f} checked={exportFmt === f} onChange={() => setExportFmt(f)} className="hidden" />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#6B7280]">No watermark added, ever.</p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={download}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#eab308] px-4 py-3 text-[15px] font-bold text-white hover:bg-[#ca9c07] disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Download meme
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#f9fafb]"
          >
            <RotateCcw className="h-4 w-4" />
            Start over with another image
          </button>
        </div>
      </div>
    </div>
  );
}
