import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download, Upload, Plus, Trash2, RotateCcw, RotateCw,
  ArrowUp, ArrowDown, Smile, Image as ImageIcon, LayoutGrid,
} from "lucide-react";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";
import {
  collagePanelRects, collagePanelCount, coverSourceRect,
  type CollageLayout,
} from "@/lib/imageMath";

type Fmt = "jpg" | "png";
type FontKey = "anton" | "oswald" | "bebas" | "comic";

type BaseLayer = {
  id: string;
  xPct: number; // center x, 0..1 of full canvas (including caption bar)
  yPct: number; // center y, 0..1 of full canvas
  rotation: number;
};
type TextLayer = BaseLayer & {
  kind: "text";
  text: string;
  align: "left" | "center" | "right";
  role: "top" | "bottom" | "free";
  fontKey: FontKey;
  color: string;
  outlineColor: string;
  outlineOn: boolean;
  fontSizePct?: number;
};
type EmojiLayer = BaseLayer & {
  kind: "emoji";
  char: string;
  sizePct: number; // % of min(canvasW, canvasH)
};
type ImageLayer = BaseLayer & {
  kind: "image";
  bitmap: ImageBitmap;
  widthPct: number; // % of canvas width
  aspect: number;   // bitmap.width / bitmap.height
};
type Layer = TextLayer | EmojiLayer | ImageLayer;

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

const FONTS: Record<FontKey, { label: string; stack: string }> = {
  anton: { label: "Anton (classic)", stack: '"Anton", "Arial Narrow", sans-serif' },
  oswald: { label: "Oswald", stack: '700 "Oswald", sans-serif' },
  bebas: { label: "Bebas Neue", stack: '"Bebas Neue", "Oswald", sans-serif' },
  comic: { label: "Comic Neue", stack: '700 "Comic Neue", "Comic Sans MS", cursive' },
};

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "EmojiOne Color", sans-serif';

const SWATCHES = ["#FFFFFF", "#000000", "#FACC15", "#EF4444", "#3B82F6", "#22C55E", "#EC4899", "#F97316"];

const EMOJI_CATEGORIES: Array<{ name: string; list: string[] }> = [
  { name: "Faces", list: ["😀","😂","😍","🥰","😎","🤔","😭","😡","🥺","🤯","😴","🤩"] },
  { name: "Hands", list: ["👍","👎","👏","🙌","👌","✌️","🤞","🙏","💪","🫶"] },
  { name: "Hearts", list: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💯","💔"] },
  { name: "Symbols", list: ["⭐","✨","🔥","💥","⚡","✅","❌","⚠️","🎉","🎊","🏆","👑"] },
  { name: "Misc", list: ["🐶","🐱","🦄","🌈","🍕","🍔","☕","🎵","📷","🚀","🎁","🌍","☀️","🌙","💎","🪐"] },
];

const LAYOUTS: Array<{ key: CollageLayout; label: string }> = [
  { key: "single", label: "Single" },
  { key: "v2", label: "2 stacked" },
  { key: "h2", label: "2 side by side" },
  { key: "v3", label: "3 stacked" },
  { key: "g2x2", label: "2 x 2 grid" },
];

async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try { return await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { return await createImageBitmap(file); }
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
    if (!p.trim()) { out.push(""); continue; }
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (ctx.measureText(test).width <= maxWidth || !line) line = test;
      else { out.push(line); line = w; }
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
  if (/^\d/.test(raw)) return raw.replace(/^(\d+)\s+/, `$1 ${px}px `);
  return `400 ${px}px ${raw}`;
}

function baseSize(layout: CollageLayout, singleW: number, singleH: number): { w: number; h: number } {
  if (layout === "single") return { w: Math.max(1, singleW), h: Math.max(1, singleH) };
  if (layout === "v3") return { w: 1200, h: 1500 };
  return { w: 1200, h: 1200 };
}

function defaultTextStyle(): Pick<TextLayer, "fontKey" | "color" | "outlineColor" | "outlineOn"> {
  return { fontKey: "anton", color: "#FFFFFF", outlineColor: "#000000", outlineOn: true };
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/* ============================= DRAW ============================= */

interface DrawParams {
  ctx: CanvasRenderingContext2D;
  layout: CollageLayout;
  panels: (ImageBitmap | null)[];
  panelGap: number;
  baseW: number;
  baseH: number;
  padTop: number;
  captionBar: boolean;
  captionText: string;
  fontSizePct: number;
  uppercase: boolean;
  topBox: TextLayer;
  bottomBox: TextLayer;
  layers: Layer[];
}

function drawPanels(
  ctx: CanvasRenderingContext2D,
  layout: CollageLayout,
  panels: (ImageBitmap | null)[],
  baseW: number,
  baseH: number,
  padTop: number,
  gap: number,
): void {
  const rects = collagePanelRects(baseW, baseH, layout, gap);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, padTop, baseW, baseH);
  rects.forEach((r, i) => {
    const bmp = panels[i] || null;
    if (bmp) {
      const src = coverSourceRect(bmp.width, bmp.height, r.w, r.h);
      ctx.drawImage(bmp, src.sx, src.sy, src.sw, src.sh, r.x, r.y + padTop, r.w, r.h);
    } else {
      ctx.fillStyle = "#e5e7eb";
      ctx.fillRect(r.x, r.y + padTop, r.w, r.h);
      ctx.fillStyle = "#6B7280";
      ctx.font = `600 ${Math.max(16, Math.round(Math.min(r.w, r.h) * 0.08))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Empty panel", r.x + r.w / 2, r.y + padTop + r.h / 2);
    }
  });
}

function drawTextBox(
  ctx: CanvasRenderingContext2D,
  box: TextLayer,
  cw: number,
  ch: number,
  padTop: number,
  captionBar: boolean,
  fontSizePct: number,
  uppercase: boolean,
): void {
  if (!box.text.trim()) return;
  const sizePct = box.fontSizePct ?? fontSizePct;
  const basePx = Math.max(10, Math.round((cw * sizePct) / 100));
  const outline = Math.max(2, Math.round(basePx * 0.12));
  ctx.font = fontSpec(box.fontKey, basePx);
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.textBaseline = "middle";

  const raw = uppercase ? box.text.toUpperCase() : box.text;
  const maxW = cw * 0.92;
  const lines = wrapLines(ctx, raw, maxW);
  const lineH = basePx * 1.05;
  const totalH = lines.length * lineH;

  const x = box.xPct * cw;
  let yTop: number;
  if (box.role === "top") {
    const margin = basePx * 0.35;
    yTop = (captionBar ? padTop : 0) + margin;
  } else if (box.role === "bottom") {
    const margin = basePx * 0.35;
    yTop = ch - margin - totalH;
  } else {
    yTop = box.yPct * ch - totalH / 2;
  }
  ctx.textAlign = box.align;
  const rot = box.role === "free" ? (box.rotation || 0) : 0;

  const drawLines = (offsetX: number) => {
    let y = yTop + lineH / 2 - (rot !== 0 ? yTop + totalH / 2 : 0);
    if (rot !== 0) y = -totalH / 2 + lineH / 2;
    for (const line of lines) {
      if (box.outlineOn) {
        ctx.lineWidth = outline;
        ctx.strokeStyle = box.outlineColor;
        ctx.strokeText(line, offsetX, y);
      }
      ctx.fillStyle = box.color;
      ctx.fillText(line, offsetX, y);
      y += lineH;
    }
  };

  if (rot !== 0) {
    const cx = x;
    const cy = yTop + totalH / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180);
    drawLines(0);
    ctx.restore();
  } else {
    drawLines(x);
  }
}

function drawEmojiLayer(ctx: CanvasRenderingContext2D, l: EmojiLayer, cw: number, ch: number): void {
  const size = Math.max(8, Math.round((l.sizePct / 100) * Math.min(cw, ch)));
  const x = l.xPct * cw;
  const y = l.yPct * ch;
  ctx.save();
  ctx.translate(x, y);
  if (l.rotation) ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.font = `${size}px ${EMOJI_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#000000";
  ctx.fillText(l.char, 0, 0);
  ctx.restore();
}

function drawImageLayer(ctx: CanvasRenderingContext2D, l: ImageLayer, cw: number, ch: number): void {
  const w = Math.max(4, (l.widthPct / 100) * cw);
  const h = w / (l.aspect || 1);
  const x = l.xPct * cw;
  const y = l.yPct * ch;
  ctx.save();
  ctx.translate(x, y);
  if (l.rotation) ctx.rotate((l.rotation * Math.PI) / 180);
  ctx.drawImage(l.bitmap, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function drawMeme(p: DrawParams): void {
  const cw = p.baseW;
  const ch = p.baseH + p.padTop;
  p.ctx.canvas.width = cw;
  p.ctx.canvas.height = ch;

  // caption bar
  if (p.captionBar && p.padTop > 0) {
    p.ctx.fillStyle = "#FFFFFF";
    p.ctx.fillRect(0, 0, cw, p.padTop);
  }
  // panels
  drawPanels(p.ctx, p.layout, p.panels, p.baseW, p.baseH, p.padTop, p.panelGap);
  // caption bar text
  if (p.captionBar && p.captionText.trim()) {
    const capPx = Math.max(10, Math.round(p.padTop * 0.55));
    p.ctx.font = fontSpec("anton", capPx);
    p.ctx.fillStyle = "#111111";
    p.ctx.textAlign = "center";
    p.ctx.textBaseline = "middle";
    const maxW = cw * 0.92;
    const raw = p.uppercase ? p.captionText.toUpperCase() : p.captionText;
    const lines = wrapLines(p.ctx, raw, maxW);
    const lineH = capPx * 1.05;
    const totalH = lines.length * lineH;
    let y = p.padTop / 2 - totalH / 2 + lineH / 2;
    for (const line of lines) { p.ctx.fillText(line, cw / 2, y); y += lineH; }
  }
  // z-ordered layers (emoji/image/free text) BELOW top/bottom text
  for (const l of p.layers) {
    if (l.kind === "text") drawTextBox(p.ctx, l, cw, ch, p.padTop, p.captionBar, p.fontSizePct, p.uppercase);
    else if (l.kind === "emoji") drawEmojiLayer(p.ctx, l, cw, ch);
    else drawImageLayer(p.ctx, l, cw, ch);
  }
  // classic top/bottom always on top
  if (!(p.captionBar && p.captionText.trim())) {
    drawTextBox(p.ctx, p.topBox, cw, ch, p.padTop, p.captionBar, p.fontSizePct, p.uppercase);
  }
  drawTextBox(p.ctx, p.bottomBox, cw, ch, p.padTop, p.captionBar, p.fontSizePct, p.uppercase);
}

/* ============================= COMPONENT ============================= */

export function MemeGeneratorTool() {
  const [layout, setLayout] = useState<CollageLayout>("single");
  const [panels, setPanels] = useState<(ImageBitmap | null)[]>([null]);
  const [panelName, setPanelName] = useState<string>("");
  const [panelGap] = useState(8);

  const [topBox, setTopBox] = useState<TextLayer>(() => ({
    id: "__top", kind: "text", text: "Top text", xPct: 0.5, yPct: 0, align: "center", role: "top",
    rotation: 0, ...defaultTextStyle(),
  }));
  const [bottomBox, setBottomBox] = useState<TextLayer>(() => ({
    id: "__bottom", kind: "text", text: "Bottom text", xPct: 0.5, yPct: 1, align: "center", role: "bottom",
    rotation: 0, ...defaultTextStyle(),
  }));
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("__top");
  const [pendingPanelIdx, setPendingPanelIdx] = useState<number | null>(null);

  const [uppercase, setUppercase] = useState(true);
  const [fontSizePct, setFontSizePct] = useState(8);
  const [captionBar, setCaptionBar] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionHeightPct, setCaptionHeightPct] = useState(14);
  const [exportFmt, setExportFmt] = useState<Fmt>("jpg");
  const [busy, setBusy] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelInputRef = useRef<HTMLInputElement>(null);
  const overlayInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    id: string; kind: "move" | "rotate" | "scale";
    startX: number; startY: number; startSize: number; startRot: number;
    pointerX: number; pointerY: number;
    centerX: number; centerY: number;
  } | null>(null);
  const [, forceTick] = useState(0);

  // Font preload
  useEffect(() => {
    if (typeof document === "undefined") return;
    const anyDoc = document as unknown as { fonts?: { load: (s: string) => Promise<unknown>; ready?: Promise<unknown> } };
    if (!anyDoc.fonts?.load) return;
    Promise.all([
      anyDoc.fonts.load('64px "Anton"'),
      anyDoc.fonts.load('700 64px "Oswald"'),
      anyDoc.fonts.load('64px "Bebas Neue"'),
      anyDoc.fonts.load('700 64px "Comic Neue"'),
    ]).finally(() => forceTick((n) => n + 1));
  }, []);

  const size = useMemo(() => {
    const first = panels[0];
    return baseSize(layout, first?.width ?? 1200, first?.height ?? 1200);
  }, [layout, panels]);

  const padTop = useMemo(() => {
    if (!captionBar) return 0;
    return Math.max(48, Math.round((size.w * captionHeightPct) / 100));
  }, [captionBar, size.w, captionHeightPct]);

  const cw = size.w;
  const ch = size.h + padTop;

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    drawMeme({
      ctx, layout, panels, panelGap, baseW: size.w, baseH: size.h, padTop,
      captionBar, captionText, fontSizePct, uppercase, topBox, bottomBox, layers,
    });
  }, [layout, panels, panelGap, size.w, size.h, padTop, captionBar, captionText, fontSizePct, uppercase, topBox, bottomBox, layers]);

  useEffect(() => { render(); }, [render]);

  /* -------- file loading -------- */

  const loadPanelFile = useCallback(async (f: File, idx: number) => {
    if (isSvgFile(f)) { toast.error("SVG files are not supported."); return; }
    if (!isSupported(f)) { toast.error("Please pick a JPG, PNG, or WebP image."); return; }
    try {
      const bmp = await decodeBitmap(f);
      guardDecodedSize(bmp.width, bmp.height);
      setPanels((prev) => {
        const next = [...prev];
        while (next.length <= idx) next.push(null);
        const old = next[idx];
        if (old) old.close?.();
        next[idx] = bmp;
        return next;
      });
      if (idx === 0) setPanelName(f.name);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that image.");
    }
  }, []);

  const loadOverlayFile = useCallback(async (f: File) => {
    if (isSvgFile(f)) { toast.error("SVG overlays are not supported."); return; }
    if (!isSupported(f)) { toast.error("Overlay must be JPG, PNG, or WebP."); return; }
    try {
      const bmp = await decodeBitmap(f);
      guardDecodedSize(bmp.width, bmp.height);
      const id = newId("i");
      setLayers((prev) => [
        ...prev,
        { kind: "image", id, bitmap: bmp, xPct: 0.5, yPct: 0.5, widthPct: 30, aspect: bmp.width / bmp.height, rotation: 0 },
      ]);
      setSelectedId(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not read that image.");
    }
  }, []);


  /* -------- layer helpers -------- */

  const addTextBox = () => {
    const id = newId("t");
    setLayers((prev) => [
      ...prev,
      { kind: "text", id, text: "New text", xPct: 0.5, yPct: 0.5, align: "center", role: "free", rotation: 0, ...defaultTextStyle() },
    ]);
    setSelectedId(id);
  };
  const addEmoji = (ch: string) => {
    if (!ch.trim()) return;
    const id = newId("e");
    setLayers((prev) => [
      ...prev,
      { kind: "emoji", id, char: ch, xPct: 0.5, yPct: 0.5, sizePct: 15, rotation: 0 },
    ]);
    setSelectedId(id);
  };
  const removeLayer = (id: string) => {
    setLayers((prev) => {
      const gone = prev.find((l) => l.id === id);
      if (gone && gone.kind === "image") gone.bitmap.close?.();
      return prev.filter((l) => l.id !== id);
    });
    if (selectedId === id) setSelectedId("__top");
  };
  const bringForward = (id: string) => {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i < 0 || i === prev.length - 1) return prev;
      const next = [...prev]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; return next;
    });
  };
  const sendBackward = (id: string) => {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id);
      if (i <= 0) return prev;
      const next = [...prev]; [next[i], next[i - 1]] = [next[i - 1], next[i]]; return next;
    });
  };
  const updateLayer = (id: string, patch: Partial<Layer>) => {
    if (id === "__top") setTopBox((b) => ({ ...b, ...patch } as TextLayer));
    else if (id === "__bottom") setBottomBox((b) => ({ ...b, ...patch } as TextLayer));
    else setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } as Layer : l)));
  };
  const updateSelected = (patch: Partial<Layer>) => updateLayer(selectedId, patch);

  const selected: Layer =
    selectedId === "__top" ? topBox :
    selectedId === "__bottom" ? bottomBox :
    (layers.find((l) => l.id === selectedId) ?? topBox);

  /* -------- pointer handling -------- */

  const getCanvasRect = () => canvasRef.current?.getBoundingClientRect() ?? null;

  const startDrag = (id: string, kind: "move" | "rotate" | "scale", e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedId(id);
    const rect = getCanvasRect();
    if (!rect) return;
    const layer: Layer | undefined =
      id === "__top" ? topBox : id === "__bottom" ? bottomBox : layers.find((l) => l.id === id);
    if (!layer) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const cx = layer.xPct * rect.width;
    const cy = layer.yPct * rect.height;
    const startSize =
      layer.kind === "emoji" ? layer.sizePct :
      layer.kind === "image" ? layer.widthPct :
      (layer.fontSizePct ?? fontSizePct);
    dragRef.current = {
      id, kind,
      startX: layer.xPct, startY: layer.yPct,
      startSize, startRot: layer.rotation || 0,
      pointerX: e.clientX - rect.left, pointerY: e.clientY - rect.top,
      centerX: cx, centerY: cy,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = getCanvasRect();
    if (!rect) return;
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;

    if (d.kind === "move") {
      const dx = (pxX - d.pointerX) / rect.width;
      const dy = (pxY - d.pointerY) / rect.height;
      const xPct = Math.min(1, Math.max(0, d.startX + dx));
      const yPct = Math.min(1, Math.max(0, d.startY + dy));
      updateLayer(d.id, { xPct, yPct } as Partial<Layer>);
    } else if (d.kind === "rotate") {
      let deg = (Math.atan2(pxY - d.centerY, pxX - d.centerX) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      if (deg < -180) deg += 360;
      for (const s of [-90, -45, 0, 45, 90, 180, -180]) if (Math.abs(deg - s) < 7) { deg = s; break; }
      updateLayer(d.id, { rotation: deg } as Partial<Layer>);
    } else {
      const d0 = Math.max(1, Math.hypot(d.pointerX - d.centerX, d.pointerY - d.centerY));
      const d1 = Math.hypot(pxX - d.centerX, pxY - d.centerY);
      const factor = d1 / d0;
      const layer: Layer | undefined =
        d.id === "__top" ? topBox : d.id === "__bottom" ? bottomBox : layers.find((l) => l.id === d.id);
      if (!layer) return;
      if (layer.kind === "emoji") {
        updateLayer(d.id, { sizePct: Math.max(3, Math.min(80, d.startSize * factor)) } as Partial<Layer>);
      } else if (layer.kind === "image") {
        updateLayer(d.id, { widthPct: Math.max(3, Math.min(150, d.startSize * factor)) } as Partial<Layer>);
      } else {
        updateLayer(d.id, { fontSizePct: Math.max(3, Math.min(30, d.startSize * factor)) } as Partial<Layer>);
      }
    }
  };
  const endDrag = () => { dragRef.current = null; };

  /* -------- download -------- */

  const download = async () => {
    if (!panels[0]) return;
    setBusy(true);
    try {
      const anyDoc = document as unknown as { fonts?: { ready?: Promise<unknown> } };
      if (anyDoc.fonts?.ready) await anyDoc.fonts.ready;
      const cv = document.createElement("canvas");
      const ctx = cv.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      drawMeme({
        ctx, layout, panels, panelGap, baseW: size.w, baseH: size.h, padTop,
        captionBar, captionText, fontSizePct, uppercase, topBox, bottomBox, layers,
      });
      const mime = exportFmt === "png" ? "image/png" : "image/jpeg";
      const blob = await canvasToBlob(cv, mime, exportFmt === "jpg" ? 0.92 : undefined);
      const base = (panelName || "meme").replace(/\.[^.]+$/, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${base}-meme.${exportFmt}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally { setBusy(false); }
  };

  const reset = () => {
    setPanels((prev) => { prev.forEach((b) => b?.close?.()); return [null]; });
    setLayout("single"); setPanelName("");
    setLayers((prev) => { prev.forEach((l) => { if (l.kind === "image") l.bitmap.close?.(); }); return []; });
    setTopBox({ id: "__top", kind: "text", text: "Top text", xPct: 0.5, yPct: 0, align: "center", role: "top", rotation: 0, ...defaultTextStyle() });
    setBottomBox({ id: "__bottom", kind: "text", text: "Bottom text", xPct: 0.5, yPct: 1, align: "center", role: "bottom", rotation: 0, ...defaultTextStyle() });
    setCaptionText(""); setCaptionBar(false); setSelectedId("__top");
  };

  /* -------- layout change: resize panels array -------- */

  const changeLayout = (k: CollageLayout) => {
    const n = collagePanelCount(k);
    setPanels((prev) => {
      // Close bitmaps in panels being dropped when shrinking layouts.
      for (let i = n; i < prev.length; i++) prev[i]?.close?.();
      const next = prev.slice(0, n);
      while (next.length < n) next.push(null);
      return next;
    });
    setLayout(k);
  };

  /* -------- overlays (preview panel add-buttons + layer handles) -------- */

  const panelRects = useMemo(
    () => collagePanelRects(size.w, size.h, layout, panelGap),
    [size.w, size.h, layout, panelGap],
  );

  const layerOverlays = useMemo(() => {
    if (!panels[0]) return [];
    return layers.map((l) => {
      const wPct = l.kind === "image" ? l.widthPct :
        l.kind === "emoji" ? (l.sizePct * Math.min(size.w, size.h) / size.w) * 100 :
        20;
      const hPct = l.kind === "image" ? (l.widthPct * (size.w / (l.aspect || 1))) / ch * 100 :
        l.kind === "emoji" ? (l.sizePct * Math.min(size.w, size.h)) / ch * 100 :
        (basePxForText(l as TextLayer, size.w, fontSizePct) * 1.2) / ch * 100;
      return { id: l.id, xPct: l.xPct * 100, yPct: l.yPct * 100, rot: l.rotation || 0, wPct, hPct, kind: l.kind, selected: l.id === selectedId };
    });
  }, [layers, panels, size.w, size.h, ch, selectedId, fontSizePct]);

  if (!panels[0]) {
    return (
      <div className="mx-auto max-w-3xl">
        <UploadDropzone
          accept={ACCEPT}
          buttonLabel="Select image"
          hint="or drop a JPG, PNG, or WebP image here"
          onFiles={(files) => {
            const f = Array.from(files)[0];
            if (f) loadPanelFile(f, 0);
          }}
          accent="#eab308"
        />
      </div>
    );
  }

  const isText = selected.kind === "text";
  const isEmoji = selected.kind === "emoji";
  const isImage = selected.kind === "image";
  const selectedSizePct = isText ? ((selected as TextLayer).fontSizePct ?? fontSizePct) : 0;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* PREVIEW */}
      <div
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

          {/* PANEL FILL OVERLAYS (relative to canvas rect) */}
          {layout !== "single" && panelRects.map((r, i) => {
            if (panels[i]) {
              return (
                <button
                  key={`replace-${i}`}
                  type="button"
                  onClick={() => { setPendingPanelIdx(i); panelInputRef.current?.click(); }}
                  className="pointer-events-auto absolute rounded-md bg-black/50 px-2 py-1 text-[11px] font-semibold text-white opacity-0 hover:opacity-100"
                  style={{
                    left: `${((r.x + 6) / cw) * 100}%`,
                    top: `${((r.y + padTop + 6) / ch) * 100}%`,
                  }}
                >
                  Replace
                </button>
              );
            }
            return (
              <button
                key={`add-${i}`}
                type="button"
                onClick={() => { setPendingPanelIdx(i); panelInputRef.current?.click(); }}
                className="pointer-events-auto absolute flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#9ca3af] bg-white/70 text-[#4B5563] hover:border-[#eab308] hover:text-[#1F2937]"
                style={{
                  left: `${(r.x / cw) * 100}%`,
                  top: `${((r.y + padTop) / ch) * 100}%`,
                  width: `${(r.w / cw) * 100}%`,
                  height: `${(r.h / ch) * 100}%`,
                }}
              >
                <Upload className="h-5 w-5" />
                <span className="text-[12px] font-semibold">Add image</span>
              </button>
            );
          })}

          {/* LAYER HANDLES (emoji + image + free text) */}
          {layerOverlays.map((o) => (
            <div
              key={o.id}
              className="pointer-events-none absolute"
              style={{
                left: `${o.xPct}%`, top: `${o.yPct}%`,
                transform: `translate(-50%, -50%) rotate(${o.rot}deg)`,
                width: `${Math.max(2, o.wPct)}%`,
                height: `${Math.max(2, o.hPct)}%`,
              }}
            >
              {o.selected ? (
                <div className="pointer-events-none absolute inset-0 rounded border-2 border-dashed border-[#eab308]" />
              ) : null}
              {/* Move handle: covers the layer footprint */}
              <button
                type="button"
                aria-label={`Move ${o.kind}`}
                onPointerDown={(e) => startDrag(o.id, "move", e)}
                className="pointer-events-auto absolute inset-0 cursor-move"
                style={{ touchAction: "none", background: "transparent" }}
              />
              {o.selected ? (
                <>
                  <button
                    type="button"
                    aria-label="Rotate"
                    onPointerDown={(e) => startDrag(o.id, "rotate", e)}
                    className="pointer-events-auto absolute -translate-x-1/2 rounded-full border-2 border-white bg-[#1F2937] text-white shadow-md flex items-center justify-center"
                    style={{ width: 22, height: 22, top: -30, left: "50%", touchAction: "none" }}
                  >
                    <RotateCw className="h-3 w-3" />
                  </button>
                  {(o.kind === "emoji" || o.kind === "image") ? (
                    <button
                      type="button"
                      aria-label="Scale"
                      onPointerDown={(e) => startDrag(o.id, "scale", e)}
                      className="pointer-events-auto absolute rounded-full border-2 border-white bg-[#eab308] shadow-md"
                      style={{ width: 18, height: 18, right: -9, bottom: -9, touchAction: "none", cursor: "nwse-resize" }}
                    />
                  ) : null}
                </>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-[12px] text-[#6B7280]">
          {cw} x {ch}px, live preview matches export
        </div>
        <input
          ref={panelInputRef} type="file" accept={ACCEPT} className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]; const idx = pendingPanelIdx ?? 0;
            e.target.value = ""; setPendingPanelIdx(null);
            if (f) void loadPanelFile(f, idx);
          }}
        />
        <input
          ref={overlayInputRef} type="file" accept={ACCEPT} className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void loadOverlayFile(f); }}
        />
      </div>

      {/* CONTROLS */}
      <div className="space-y-4">
        {/* Layout picker */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1F2937]">
            <LayoutGrid className="h-4 w-4" /> Layout
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LAYOUTS.map((l) => (
              <button
                key={l.key} type="button" onClick={() => changeLayout(l.key)}
                className={`rounded-md px-2.5 py-1 text-[12px] font-semibold ${layout === l.key ? "bg-[#1F2937] text-white" : "bg-[#f3f4f6] text-[#4B5563]"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {layout !== "single" ? (
            <p className="mt-2 text-[11px] text-[#6B7280]">Click each empty panel in the preview to add an image. Panels cover-fit to keep aspect.</p>
          ) : null}
        </div>

        {/* Add stickers/overlays */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1F2937]">
            <Smile className="h-4 w-4" /> Stickers and overlays
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button" onClick={() => setShowEmojiPicker((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] font-semibold text-[#1F2937]"
            >
              <Smile className="h-3.5 w-3.5" /> {showEmojiPicker ? "Hide emoji" : "Add emoji"}
            </button>
            <button
              type="button" onClick={() => overlayInputRef.current?.click()}
              className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] font-semibold text-[#1F2937]"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Add image
            </button>
            <button
              type="button" onClick={addTextBox}
              className="inline-flex items-center gap-1 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] font-semibold text-[#1F2937]"
            >
              <Plus className="h-3.5 w-3.5" /> Add text
            </button>
          </div>
          {showEmojiPicker ? (
            <div className="mt-3 space-y-2">
              {EMOJI_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="text-[11px] font-semibold text-[#6B7280]">{cat.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {cat.list.map((e) => (
                      <button
                        key={e} type="button" onClick={() => addEmoji(e)}
                        className="rounded-md border border-[#f1f2f4] px-1.5 py-1 text-[18px] leading-none hover:bg-[#fef9c3]"
                        aria-label={`Add emoji ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <input
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Paste any emoji"
                  className="min-w-0 flex-1 rounded-md border border-[#e5e7eb] p-1.5 text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => { if (customEmoji.trim()) { addEmoji(customEmoji.trim()); setCustomEmoji(""); } }}
                  className="rounded-md bg-[#1F2937] px-2.5 py-1.5 text-[12px] font-semibold text-white"
                >
                  Add
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280]">Emoji look varies by device (Apple, Android, Windows). That is normal.</p>
            </div>
          ) : null}
        </div>

        {/* Text content: classic top/bottom */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="block text-[12px] font-semibold text-[#4B5563]">Top text</label>
          <textarea
            rows={2} value={topBox.text}
            onFocus={() => setSelectedId("__top")}
            onChange={(e) => setTopBox((b) => ({ ...b, text: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Top text (leave blank to skip)"
          />
          <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Bottom text</label>
          <textarea
            rows={2} value={bottomBox.text}
            onFocus={() => setSelectedId("__bottom")}
            onChange={(e) => setBottomBox((b) => ({ ...b, text: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Bottom text (leave blank to skip)"
          />
        </div>

        {/* Layers panel */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="text-[13px] font-semibold text-[#1F2937]">Layers</div>
          <div className="mt-2 space-y-1.5">
            <LayerRow id="__top" label="Top text" active={selectedId === "__top"} onSelect={setSelectedId} />
            <LayerRow id="__bottom" label="Bottom text" active={selectedId === "__bottom"} onSelect={setSelectedId} />
            {[...layers].reverse().map((l, revIdx) => {
              const realIdx = layers.length - 1 - revIdx;
              const label =
                l.kind === "text" ? `Text: ${((l as TextLayer).text || "").slice(0, 18) || "(empty)"}` :
                l.kind === "emoji" ? `Emoji ${(l as EmojiLayer).char}` :
                `Image overlay`;
              return (
                <div key={l.id} className={`flex items-center gap-1.5 rounded-md border p-1.5 ${selectedId === l.id ? "border-[#eab308] bg-[#fef9c3]/40" : "border-[#f1f2f4]"}`}>
                  <button
                    type="button" onClick={() => setSelectedId(l.id)}
                    className="min-w-0 flex-1 truncate text-left text-[12px] font-semibold text-[#1F2937]"
                  >
                    {label}
                  </button>
                  <button type="button" aria-label="Bring forward" onClick={() => bringForward(l.id)} disabled={realIdx === layers.length - 1}
                    className="rounded p-1 text-[#4B5563] hover:bg-[#f3f4f6] disabled:opacity-30">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Send backward" onClick={() => sendBackward(l.id)} disabled={realIdx === 0}
                    className="rounded p-1 text-[#4B5563] hover:bg-[#f3f4f6] disabled:opacity-30">
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Delete layer" onClick={() => removeLayer(l.id)}
                    className="rounded p-1 text-[#b91c1c] hover:bg-[#fef2f2]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-layer edit UI */}
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="text-[12px] font-semibold text-[#4B5563]">Editing: {isEmoji ? `emoji ${(selected as EmojiLayer).char}` : isImage ? "image overlay" : `text (${(selected as TextLayer).role})`}</div>

          {isText ? (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Font</label>
              <select
                value={(selected as TextLayer).fontKey}
                onChange={(e) => updateSelected({ fontKey: e.target.value as FontKey } as Partial<Layer>)}
                className="mt-1 w-full rounded-lg border border-[#e5e7eb] bg-white p-2 text-[14px]"
              >
                {(Object.keys(FONTS) as FontKey[]).map((k) => (
                  <option key={k} value={k} style={{ fontFamily: FONTS[k].stack.replace(/^\d+\s+/, "") }}>
                    {FONTS[k].label}
                  </option>
                ))}
              </select>

              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
                Size ({selectedSizePct}% of image width){(selected as TextLayer).fontSizePct != null ? " (override)" : " (global)"}
              </label>
              <input
                type="range" min={3} max={20} step={1} value={selectedSizePct}
                onChange={(e) => updateSelected({ fontSizePct: Number(e.target.value) } as Partial<Layer>)}
                className="w-full"
              />
              {(selected as TextLayer).fontSizePct != null ? (
                <button
                  type="button" onClick={() => updateSelected({ fontSizePct: undefined } as Partial<Layer>)}
                  className="mt-1 text-[11px] font-semibold text-[#4B5563] underline"
                >
                  Reset to global size
                </button>
              ) : null}

              <div className="mt-3 text-[12px] font-semibold text-[#4B5563]">Text color</div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {SWATCHES.map((c) => (
                  <button
                    key={c} type="button" aria-label={`Text color ${c}`}
                    onClick={() => updateSelected({ color: c } as Partial<Layer>)}
                    className={`h-6 w-6 rounded-full border ${(selected as TextLayer).color.toUpperCase() === c ? "ring-2 ring-[#1F2937]" : "border-[#e5e7eb]"}`}
                    style={{ background: c }}
                  />
                ))}
                <input
                  type="color" value={(selected as TextLayer).color}
                  onChange={(e) => updateSelected({ color: e.target.value } as Partial<Layer>)}
                  className="h-7 w-9 cursor-pointer rounded border border-[#e5e7eb]" aria-label="Custom text color"
                />
              </div>

              <label className="mt-3 flex items-center justify-between text-[12px] font-semibold text-[#4B5563]">
                Outline
                <input
                  type="checkbox" checked={(selected as TextLayer).outlineOn}
                  onChange={(e) => updateSelected({ outlineOn: e.target.checked } as Partial<Layer>)}
                />
              </label>
              {(selected as TextLayer).outlineOn ? (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {SWATCHES.map((c) => (
                    <button
                      key={c} type="button" aria-label={`Outline color ${c}`}
                      onClick={() => updateSelected({ outlineColor: c } as Partial<Layer>)}
                      className={`h-6 w-6 rounded-full border ${(selected as TextLayer).outlineColor.toUpperCase() === c ? "ring-2 ring-[#1F2937]" : "border-[#e5e7eb]"}`}
                      style={{ background: c }}
                    />
                  ))}
                  <input
                    type="color" value={(selected as TextLayer).outlineColor}
                    onChange={(e) => updateSelected({ outlineColor: e.target.value } as Partial<Layer>)}
                    className="h-7 w-9 cursor-pointer rounded border border-[#e5e7eb]" aria-label="Custom outline color"
                  />
                </div>
              ) : null}

              {(selected as TextLayer).role === "free" ? (
                <>
                  <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Rotation ({Math.round(selected.rotation)}°)</label>
                  <input
                    type="range" min={-180} max={180} step={1} value={selected.rotation}
                    onChange={(e) => updateSelected({ rotation: Number(e.target.value) } as Partial<Layer>)}
                    className="w-full"
                  />
                  <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Text</label>
                  <input
                    value={(selected as TextLayer).text}
                    onChange={(e) => updateSelected({ text: e.target.value } as Partial<Layer>)}
                    className="mt-1 w-full rounded-md border border-[#e5e7eb] p-1.5 text-[13px]"
                  />
                </>
              ) : null}
            </>
          ) : null}

          {isEmoji ? (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Character</label>
              <input
                value={(selected as EmojiLayer).char}
                onChange={(e) => updateSelected({ char: e.target.value } as Partial<Layer>)}
                className="mt-1 w-full rounded-md border border-[#e5e7eb] p-1.5 text-[18px]"
              />
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
                Size ({Math.round((selected as EmojiLayer).sizePct)}% of image)
              </label>
              <input
                type="range" min={3} max={80} step={1} value={(selected as EmojiLayer).sizePct}
                onChange={(e) => updateSelected({ sizePct: Number(e.target.value) } as Partial<Layer>)}
                className="w-full"
              />
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Rotation ({Math.round(selected.rotation)}°)</label>
              <input
                type="range" min={-180} max={180} step={1} value={selected.rotation}
                onChange={(e) => updateSelected({ rotation: Number(e.target.value) } as Partial<Layer>)}
                className="w-full"
              />
            </>
          ) : null}

          {isImage ? (
            <>
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
                Width ({Math.round((selected as ImageLayer).widthPct)}% of canvas)
              </label>
              <input
                type="range" min={5} max={150} step={1} value={(selected as ImageLayer).widthPct}
                onChange={(e) => updateSelected({ widthPct: Number(e.target.value) } as Partial<Layer>)}
                className="w-full"
              />
              <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">Rotation ({Math.round(selected.rotation)}°)</label>
              <input
                type="range" min={-180} max={180} step={1} value={selected.rotation}
                onChange={(e) => updateSelected({ rotation: Number(e.target.value) } as Partial<Layer>)}
                className="w-full"
              />
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
            <label className="block text-[12px] font-semibold text-[#4B5563]">Global font size ({fontSizePct}% of image width)</label>
            <input type="range" min={3} max={16} step={1} value={fontSizePct} onChange={(e) => setFontSizePct(Number(e.target.value))} className="w-full" />
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
                rows={2} value={captionText} onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Caption text"
                className="mt-2 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
              />
              <label className="mt-2 block text-[12px] font-semibold text-[#4B5563]">Bar height ({captionHeightPct}% of image width)</label>
              <input type="range" min={8} max={30} step={1} value={captionHeightPct} onChange={(e) => setCaptionHeightPct(Number(e.target.value))} className="w-full" />
            </>
          ) : null}
        </div>

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <span className="block text-[13px] font-semibold text-[#1F2937]">Export as</span>
          <div className="mt-2 flex gap-2">
            {(["jpg", "png"] as Fmt[]).map((f) => (
              <label
                key={f}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold ${exportFmt === f ? "border-[#eab308] bg-[#fef9c3] text-[#713f12]" : "border-[#e5e7eb] text-[#4B5563]"}`}
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
            type="button" onClick={download} disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#eab308] px-4 py-3 text-[15px] font-bold text-white hover:bg-[#ca9c07] disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> Download meme
          </button>
          <button
            type="button" onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-[13px] font-semibold text-[#4B5563] hover:bg-[#f9fafb]"
          >
            <RotateCcw className="h-4 w-4" /> Start over with another image
          </button>
        </div>
      </div>
    </div>
  );
}

function basePxForText(box: TextLayer, cw: number, globalPct: number): number {
  const sizePct = box.fontSizePct ?? globalPct;
  return Math.max(10, Math.round((cw * sizePct) / 100));
}

function LayerRow({ id, label, active, onSelect }: { id: string; label: string; active: boolean; onSelect: (s: string) => void }) {
  return (
    <button
      type="button" onClick={() => onSelect(id)}
      className={`flex w-full items-center rounded-md border p-1.5 text-left text-[12px] font-semibold ${active ? "border-[#eab308] bg-[#fef9c3]/40 text-[#1F2937]" : "border-[#f1f2f4] text-[#4B5563]"}`}
    >
      {label}
    </button>
  );
}
