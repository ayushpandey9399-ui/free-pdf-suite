import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, Plus, Trash2, RotateCcw } from "lucide-react";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";

type Fmt = "jpg" | "png";

type TextBox = {
  id: string;
  text: string;
  // Position as a fraction (0..1) of the CANVAS (padded) size.
  xPct: number;
  yPct: number;
  // Anchor: how text is aligned around (xPct, yPct).
  align: "left" | "center" | "right";
  // Only used for the two classic boxes so we can pin them to top/bottom
  // when caption mode changes. Extra boxes are always "free".
  role: "top" | "bottom" | "free";
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

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

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
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
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      mime,
      quality,
    );
  });
}

/**
 * Draw the whole meme into `ctx`. This is used both for the on-screen
 * preview AND for the final export, so the output matches exactly.
 */
function drawMeme(params: {
  ctx: CanvasRenderingContext2D;
  bitmap: ImageBitmap;
  captionBar: boolean;
  captionText: string;
  imgW: number;
  imgH: number;
  padTop: number; // pixels added above the image in caption mode
  fontSizePct: number; // percent of image width
  uppercase: boolean;
  boxes: TextBox[];
}): void {
  const {
    ctx,
    bitmap,
    captionBar,
    captionText,
    imgW,
    imgH,
    padTop,
    fontSizePct,
    uppercase,
    boxes,
  } = params;

  const cw = imgW;
  const ch = imgH + padTop;
  ctx.canvas.width = cw;
  ctx.canvas.height = ch;

  // White padding bar (caption mode)
  if (captionBar && padTop > 0) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cw, padTop);
  }

  // Base image
  ctx.drawImage(bitmap, 0, padTop, imgW, imgH);

  const basePx = Math.max(10, Math.round((imgW * fontSizePct) / 100));
  const outline = Math.max(2, Math.round(basePx * 0.12));

  // Caption bar text (black on white, no outline needed)
  if (captionBar && captionText.trim()) {
    const capPx = Math.max(10, Math.round(padTop * 0.55));
    ctx.font = `400 ${capPx}px "Anton", "Impact", "Oswald", "Arial Narrow", sans-serif`;
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

  // Draw each text box (classic meme style)
  ctx.font = `400 ${basePx}px "Anton", "Impact", "Oswald", "Arial Narrow", sans-serif`;
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  for (const box of boxes) {
    if (!box.text.trim()) continue;
    const raw = uppercase ? box.text.toUpperCase() : box.text;
    const maxW = cw * 0.92;
    const lines = wrapLines(ctx, raw, maxW);
    const lineH = basePx * 1.05;
    const totalH = lines.length * lineH;

    // Compute x/y in canvas pixels
    const x = box.xPct * cw;
    // For classic top/bottom, y is anchored so the block sits with a margin
    // from the edge; for free boxes, y is the vertical CENTER of the block.
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

    let y = yTopOfBlock + lineH / 2;
    for (const line of lines) {
      // Outline
      ctx.lineWidth = outline;
      ctx.strokeStyle = "#000000";
      ctx.strokeText(line, x, y);
      // Fill
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(line, x, y);
      y += lineH;
    }
  }
}

export function MemeGeneratorTool() {
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [imgW, setImgW] = useState(0);
  const [imgH, setImgH] = useState(0);
  const [fileName, setFileName] = useState<string>("");

  const [topText, setTopText] = useState("Top text");
  const [bottomText, setBottomText] = useState("Bottom text");
  const [uppercase, setUppercase] = useState(true);
  const [fontSizePct, setFontSizePct] = useState(8); // percent of image width
  const [captionBar, setCaptionBar] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionHeightPct, setCaptionHeightPct] = useState(14);
  const [exportFmt, setExportFmt] = useState<Fmt>("jpg");

  const [extraBoxes, setExtraBoxes] = useState<TextBox[]>([]);
  const [busy, setBusy] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fontReadyRef = useRef(false);
  const draggingRef = useRef<{ id: string; dxPct: number; dyPct: number } | null>(null);
  const [, forceTick] = useState(0);

  // Preload Anton so the first draw uses it
  useEffect(() => {
    if (typeof document === "undefined") return;
    const anyDoc = document as unknown as {
      fonts?: { load: (spec: string) => Promise<unknown> };
    };
    if (!anyDoc.fonts?.load) return;
    anyDoc.fonts.load('64px "Anton"').then(() => {
      fontReadyRef.current = true;
      forceTick((n) => n + 1);
    }).catch(() => {
      fontReadyRef.current = true;
    });
  }, []);

  const boxes: TextBox[] = useMemo(() => {
    const list: TextBox[] = [];
    if (!captionBar || !captionText) {
      // In classic (overlay) mode the top text lives on the image
      list.push({
        id: "__top",
        text: topText,
        xPct: 0.5,
        yPct: 0,
        align: "center",
        role: "top",
      });
    }
    list.push({
      id: "__bottom",
      text: bottomText,
      xPct: 0.5,
      yPct: 1,
      align: "center",
      role: "bottom",
    });
    for (const b of extraBoxes) list.push(b);
    return list;
  }, [topText, bottomText, extraBoxes, captionBar, captionText]);

  const padTop = useMemo(() => {
    if (!captionBar || !imgW) return 0;
    return Math.max(48, Math.round((imgW * captionHeightPct) / 100));
  }, [captionBar, imgW, captionHeightPct]);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !bitmap) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    drawMeme({
      ctx,
      bitmap,
      captionBar,
      captionText,
      imgW,
      imgH,
      padTop,
      fontSizePct,
      uppercase,
      boxes,
    });
  }, [bitmap, captionBar, captionText, imgW, imgH, padTop, fontSizePct, uppercase, boxes]);

  useEffect(() => {
    render();
  }, [render]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const f = arr[0];
    if (!f) return;
    if (isSvgFile(f)) {
      toast.error("SVG files are not supported.");
      return;
    }
    if (!isSupported(f)) {
      toast.error("Please pick a JPG, PNG, or WebP image.");
      return;
    }
    try {
      const bmp = await decodeBitmap(f);
      guardDecodedSize(bmp.width, bmp.height);
      setBitmap(bmp);
      setImgW(bmp.width);
      setImgH(bmp.height);
      setFileName(f.name);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not read that image.";
      toast.error(msg);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) void handleFiles(e.dataTransfer.files);
  };

  const addBox = () => {
    setExtraBoxes((prev) => [
      ...prev,
      {
        id: `b_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text: "New text",
        xPct: 0.5,
        yPct: 0.5,
        align: "center",
        role: "free",
      },
    ]);
  };

  const removeBox = (id: string) =>
    setExtraBoxes((prev) => prev.filter((b) => b.id !== id));
  const updateBoxText = (id: string, text: string) =>
    setExtraBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, text } : b)));

  // Drag handling on preview: works for classic top/bottom too if user grabs the text area of an extra box.
  // We only allow dragging EXTRA boxes; classic top/bottom are pinned.
  const getCanvasRect = () => {
    const cv = canvasRef.current;
    if (!cv) return null;
    return cv.getBoundingClientRect();
  };

  const startDrag = (id: string, e: React.PointerEvent) => {
    const box = extraBoxes.find((b) => b.id === id);
    if (!box) return;
    const rect = getCanvasRect();
    if (!rect) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    const scaleX = rect.width;
    const scaleY = rect.height;
    draggingRef.current = {
      id,
      dxPct: box.xPct - pxX / scaleX,
      dyPct: box.yPct - pxY / scaleY,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = draggingRef.current;
    if (!drag) return;
    const rect = getCanvasRect();
    if (!rect) return;
    const pxX = e.clientX - rect.left;
    const pxY = e.clientY - rect.top;
    const xPct = Math.min(1, Math.max(0, pxX / rect.width + drag.dxPct));
    const yPct = Math.min(1, Math.max(0, pxY / rect.height + drag.dyPct));
    setExtraBoxes((prev) =>
      prev.map((b) => (b.id === drag.id ? { ...b, xPct, yPct } : b)),
    );
  };
  const endDrag = () => {
    draggingRef.current = null;
  };

  const download = async () => {
    if (!bitmap || !canvasRef.current) return;
    setBusy(true);
    try {
      const cv = document.createElement("canvas");
      const ctx = cv.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      drawMeme({
        ctx,
        bitmap,
        captionBar,
        captionText,
        imgW,
        imgH,
        padTop,
        fontSizePct,
        uppercase,
        boxes,
      });
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
      const msg = e instanceof Error ? e.message : "Export failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setBitmap(null);
    setImgW(0);
    setImgH(0);
    setFileName("");
    setTopText("Top text");
    setBottomText("Bottom text");
    setExtraBoxes([]);
    setCaptionText("");
    setCaptionBar(false);
  };

  // Positions for extra-box drag handles in preview coordinates (percent)
  const previewOverlay = useMemo(() => {
    if (!bitmap) return null;
    return extraBoxes.map((b) => ({
      id: b.id,
      xPct: b.xPct * 100,
      yPct: b.yPct * 100,
    }));
  }, [extraBoxes, bitmap]);

  if (!bitmap) {
    return (
      <div className="mx-auto max-w-3xl">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-white p-10 text-center hover:border-[#eab308]"
        >
          <Upload className="h-8 w-8 text-[#eab308]" />
          <div className="text-[16px] font-semibold text-[#1F2937]">
            Drop a JPG, PNG, or WebP image
          </div>
          <div className="text-[13px] text-[#6B7280]">
            Your image never leaves your device
          </div>
          <input
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
          <span className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#eab308] px-4 py-2 text-[14px] font-semibold text-white">
            Select image
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 8,
              background: "#fff",
              touchAction: "none",
            }}
          />
          {previewOverlay?.map((o) => (
            <button
              key={o.id}
              type="button"
              aria-label="Drag text"
              onPointerDown={(e) => startDrag(o.id, e)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#eab308] shadow-md"
              style={{
                left: `${o.xPct}%`,
                top: `${o.yPct}%`,
                width: 22,
                height: 22,
                touchAction: "none",
              }}
            />
          ))}
        </div>
        <div className="mt-2 text-center text-[12px] text-[#6B7280]">
          {imgW} x {imgH}px, live preview matches export
        </div>
      </div>

      {/* CONTROLS */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="block text-[12px] font-semibold text-[#4B5563]">
            Top text
          </label>
          <textarea
            rows={2}
            value={topText}
            onChange={(e) => setTopText(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Top text (leave blank to skip)"
          />
          <label className="mt-3 block text-[12px] font-semibold text-[#4B5563]">
            Bottom text
          </label>
          <textarea
            rows={2}
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[14px]"
            placeholder="Bottom text (leave blank to skip)"
          />
        </div>

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="flex items-center justify-between text-[13px] font-semibold text-[#1F2937]">
            UPPERCASE
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
            />
          </label>
          <div className="mt-3">
            <label className="block text-[12px] font-semibold text-[#4B5563]">
              Font size ({fontSizePct}% of image width)
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
          </div>
        </div>

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <label className="flex items-center justify-between text-[13px] font-semibold text-[#1F2937]">
            Caption bar (white padding on top)
            <input
              type="checkbox"
              checked={captionBar}
              onChange={(e) => setCaptionBar(e.target.checked)}
            />
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

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#1F2937]">
              Extra text boxes
            </span>
            <button
              type="button"
              onClick={addBox}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1F2937] px-2.5 py-1.5 text-[12px] font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add text
            </button>
          </div>
          {extraBoxes.length === 0 ? (
            <p className="mt-2 text-[12px] text-[#6B7280]">
              Add draggable captions anywhere on the image.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {extraBoxes.map((b) => (
                <li key={b.id} className="rounded-lg border border-[#f1f2f4] p-2">
                  <div className="flex items-start gap-2">
                    <input
                      value={b.text}
                      onChange={(e) => updateBoxText(b.id, e.target.value)}
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
                  <p className="mt-1 text-[11px] text-[#6B7280]">
                    Drag the yellow dot on the preview to move.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-[#ececef] bg-white p-4">
          <span className="block text-[13px] font-semibold text-[#1F2937]">
            Export as
          </span>
          <div className="mt-2 flex gap-2">
            {(["jpg", "png"] as Fmt[]).map((f) => (
              <label
                key={f}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-semibold ${
                  exportFmt === f
                    ? "border-[#eab308] bg-[#fef9c3] text-[#713f12]"
                    : "border-[#e5e7eb] text-[#4B5563]"
                }`}
              >
                <input
                  type="radio"
                  name="fmt"
                  value={f}
                  checked={exportFmt === f}
                  onChange={() => setExportFmt(f)}
                  className="hidden"
                />
                {f.toUpperCase()}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-[#6B7280]">
            No watermark added, ever.
          </p>
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
