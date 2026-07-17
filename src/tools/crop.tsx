import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { parseRanges, expandRanges } from "@/lib/pageRange";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";

type Handle =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export default function Crop() {
  const [files, setFiles] = useState<File[]>([]);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState<{ url: string; w: number; h: number } | null>(null);
  const [applyAll, setApplyAll] = useState(true);
  const [pageRange, setPageRange] = useState("1");
  const [numPages, setNumPages] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    start: { top: number; right: number; bottom: number; left: number };
    pageW: number;
    pageH: number;
    scale: number;
  } | null>(null);

  const file = files[0];
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount, fileSize } = usePdfStats(file);


  // Render first page + read page count
  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setNumPages(0);
    setTop(0); setRight(0); setBottom(0); setLeft(0);
    if (!file) return;
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (cancelled) return;
        setNumPages(doc.numPages);
        const page = await doc.getPage(1);
        const vp1 = page.getViewport({ scale: 1 });
        const maxW = 900;
        const scale = Math.min(2, maxW / vp1.width);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        if (cancelled) return;
        setPreview({ url: canvas.toDataURL("image/png"), w: vp1.width, h: vp1.height });
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Preview failed: ${(e as Error).message}`);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  // Compute display scale from rendered container width
  const [displayW, setDisplayW] = useState(0);
  useEffect(() => {
    if (!preview) return;
    const el = containerRef.current;
    if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [preview]);

  const scale = preview && displayW ? displayW / preview.w : 0;
  const displayH = preview ? preview.h * scale : 0;

  // Clamp margins so w/h > 10pt
  const clamp = (t: number, r: number, b: number, l: number) => {
    if (!preview) return { t, r, b, l };
    const minSize = 10;
    t = Math.max(0, t);
    b = Math.max(0, b);
    l = Math.max(0, l);
    r = Math.max(0, r);
    if (preview.h - t - b < minSize) {
      if (t + b > preview.h - minSize) {
        const excess = t + b - (preview.h - minSize);
        // shrink whichever was just changed less aggressively — cap both
        t = Math.max(0, t - excess / 2);
        b = Math.max(0, preview.h - minSize - t);
      }
    }
    if (preview.w - l - r < minSize) {
      const excess = l + r - (preview.w - minSize);
      l = Math.max(0, l - excess / 2);
      r = Math.max(0, preview.w - minSize - l);
    }
    return { t, r, b, l };
  };

  const setMargins = (t: number, r: number, b: number, l: number) => {
    const c = clamp(t, r, b, l);
    setTop(c.t); setRight(c.r); setBottom(c.b); setLeft(c.l);
  };

  const boxStyle = useMemo(() => {
    if (!preview) return null;
    return {
      left: left * scale,
      top: top * scale,
      width: (preview.w - left - right) * scale,
      height: (preview.h - top - bottom) * scale,
    };
  }, [preview, scale, top, right, bottom, left]);

  const onPointerDown = (handle: Handle) => (e: React.PointerEvent) => {
    if (!preview) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      start: { top, right, bottom, left },
      pageW: preview.w,
      pageH: preview.h,
      scale,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startX) / d.scale;
    const dy = (e.clientY - d.startY) / d.scale;
    let { top: t, right: r, bottom: b, left: l } = d.start;
    switch (d.handle) {
      case "move": {
        const maxDx = d.pageW - d.start.left - d.start.right;
        const maxDy = d.pageH - d.start.top - d.start.bottom;
        const shiftX = Math.max(-d.start.left, Math.min(d.start.right, dx));
        const shiftY = Math.max(-d.start.top, Math.min(d.start.bottom, dy));
        l = d.start.left + shiftX;
        r = d.start.right - shiftX;
        t = d.start.top + shiftY;
        b = d.start.bottom - shiftY;
        void maxDx; void maxDy;
        break;
      }
      case "n": t = d.start.top + dy; break;
      case "s": b = d.start.bottom - dy; break;
      case "w": l = d.start.left + dx; break;
      case "e": r = d.start.right - dx; break;
      case "nw": t = d.start.top + dy; l = d.start.left + dx; break;
      case "ne": t = d.start.top + dy; r = d.start.right - dx; break;
      case "sw": b = d.start.bottom - dy; l = d.start.left + dx; break;
      case "se": b = d.start.bottom - dy; r = d.start.right - dx; break;
    }
    setMargins(t, r, b, l);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pages = doc.getPages();
      let target: number[];
      if (applyAll) {
        target = pages.map((_p, i) => i + 1);
      } else {
        target = expandRanges(parseRanges(pageRange, pages.length));
      }
      for (const n of target) {
        const page = pages[n - 1];
        const { width, height } = page.getSize();
        const x = left;
        const y = bottom;
        const w = Math.max(1, width - left - right);
        const h = Math.max(1, height - top - bottom);
        page.setCropBox(x, y, w, h);
      }
      downloadBlob(
        await doc.save(),
        `${file.name.replace(/\.pdf$/i, "")}-cropped.pdf`,
        "application/pdf",
      );
      toast.success("Cropped PDF downloaded");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />

      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : file && (
        <div className="mt-6 space-y-6">
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
          {/* Preview */}
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Drag the crop box or its handles to adjust. Everything outside stays hidden.
            </p>
            <div
              ref={containerRef}
              className="relative mx-auto w-full max-w-[900px] select-none touch-none"
              style={{ height: displayH || undefined }}
            >
              {preview ? (
                <>
                  <img
                    src={preview.url}
                    alt="First page preview"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    draggable={false}
                  />
                  {boxStyle && (
                    <>
                      {/* Dim overlays around the crop box */}
                      <div className="pointer-events-none absolute inset-0">
                        <div
                          className="absolute bg-black/50"
                          style={{ left: 0, top: 0, right: 0, height: boxStyle.top }}
                        />
                        <div
                          className="absolute bg-black/50"
                          style={{
                            left: 0,
                            top: boxStyle.top + boxStyle.height,
                            right: 0,
                            bottom: 0,
                          }}
                        />
                        <div
                          className="absolute bg-black/50"
                          style={{
                            left: 0,
                            top: boxStyle.top,
                            width: boxStyle.left,
                            height: boxStyle.height,
                          }}
                        />
                        <div
                          className="absolute bg-black/50"
                          style={{
                            left: boxStyle.left + boxStyle.width,
                            top: boxStyle.top,
                            right: 0,
                            height: boxStyle.height,
                          }}
                        />
                      </div>

                      {/* Crop box */}
                      <div
                        className="absolute border-2 border-[#e5322d] cursor-move"
                        style={boxStyle}
                        onPointerDown={onPointerDown("move")}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                      >
                        {(
                          [
                            ["n", "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"],
                            ["s", "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize"],
                            ["w", "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"],
                            ["e", "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize"],
                            ["nw", "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize"],
                            ["ne", "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize"],
                            ["sw", "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize"],
                            ["se", "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize"],
                          ] as [Handle, string][]
                        ).map(([h, cls]) => (
                          <div
                            key={h}
                            className={`absolute h-4 w-4 rounded-full border-2 border-white bg-[#e5322d] shadow ${cls}`}
                            onPointerDown={(e) => { e.stopPropagation(); onPointerDown(h)(e); }}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="grid h-64 place-items-center text-sm text-muted-foreground">
                  Rendering preview…
                </div>
              )}
            </div>
          </div>

          {/* Numeric inputs */}
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Margins in points (72pt = 1 inch).
            </p>
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Top", value: top, set: (v: number) => setMargins(v, right, bottom, left) },
                { label: "Right", value: right, set: (v: number) => setMargins(top, v, bottom, left) },
                { label: "Bottom", value: bottom, set: (v: number) => setMargins(top, right, v, left) },
                { label: "Left", value: left, set: (v: number) => setMargins(top, right, bottom, v) },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <Label htmlFor={label}>{label}</Label>
                  <Input
                    id={label}
                    type="number"
                    min={0}
                    value={Math.round(value)}
                    onChange={(e) => set(Number(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={applyAll}
                  onCheckedChange={(v) => setApplyAll(v === true)}
                />
                Apply this crop to all pages
              </label>
              {!applyAll && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="range" className="text-sm">Pages</Label>
                  <Input
                    id="range"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="1-3,5"
                    className="w-40"
                  />
                  <span className="text-xs text-muted-foreground">of {numPages}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ActionBar onRun={run} disabled={!files.length} loading={loading} label="Crop PDF" />
    </div>
  );
}
