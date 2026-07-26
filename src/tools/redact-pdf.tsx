import { useCallback, useEffect, useRef, useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import { X, Search, AlertTriangle, Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/lib/download";
import { loadPdfJsDoc, loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";


/* Redaction stored in normalized [0..1] coords of the unrotated page viewport
 * (rotation=0), so mapping to overlay pixels or output canvas is a simple
 * multiply, no rotation math anywhere. Redacted pages are rerendered at
 * scale=2 (rotation=0) and inserted into the output at the page's on-screen
 * dimensions (viewport.width/height at scale=1 with rotation=0). */
interface Redaction {
  id: string;
  pageIndex: number; // 0-based
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PageInfo {
  pageIndex: number;
  vpWidth: number; // viewport width at scale=1, rotation=0 (points)
  vpHeight: number;
  previewSrc: string;
}

interface Result {
  blob: Blob;
  filename: string;
  boxCount: number;
  pageCount: number;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const PREVIEW_SCALE = 1.35;
const EXPORT_SCALE = 2;

export default function RedactPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [redactions, setRedactions] = useState<Redaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Redacting…");
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [findText, setFindText] = useState("");
  const [lastMatchCount, setLastMatchCount] = useState<number | null>(null);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const bytesRef = useRef<ArrayBuffer | null>(null);

  // Render every page as JPEG previews once file is picked.
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!files[0]) {
        bytesRef.current = null;
        setPages([]);
        setRedactions([]);
        return;
      }
      try {
        const buf = await files[0].arrayBuffer();
        if (cancel) return;
        bytesRef.current = buf;
        const doc = await loadPdfJsDoc(buf.slice(0));
        const out: PageInfo[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancel) return;
          const page = await doc.getPage(i);
          const vp1 = page.getViewport({ scale: 1, rotation: 0 });
          const vp = page.getViewport({ scale: PREVIEW_SCALE, rotation: 0 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(vp.width));
          canvas.height = Math.max(1, Math.floor(vp.height));
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          out.push({
            pageIndex: i - 1,
            vpWidth: vp1.width,
            vpHeight: vp1.height,
            previewSrc: canvas.toDataURL("image/jpeg", 0.85),
          });
          setPages([...out]);
        }
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Failed to load: ${(e as Error).message}`);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [files]);

  const addRedaction = (r: Omit<Redaction, "id">) =>
    setRedactions((prev) => [...prev, { ...r, id: uid() }]);

  const updateRedaction = (id: string, patch: Partial<Redaction>) =>
    setRedactions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const removeRedaction = (id: string) =>
    setRedactions((prev) => prev.filter((r) => r.id !== id));

  const clearAll = () => {
    if (redactions.length === 0) return;
    if (window.confirm(`Remove all ${redactions.length} redaction(s)?`)) {
      setRedactions([]);
      setLastMatchCount(null);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setPages([]);
    setRedactions([]);
    setResult(null);
    setFindText("");
    setLastMatchCount(null);
    bytesRef.current = null;
  };

  const findAndAdd = async () => {
    const q = findText.trim();
    if (!q || !bytesRef.current) return;
    try {
      const doc = await loadPdfJsDoc(bytesRef.current.slice(0));
      const boxes: Omit<Redaction, "id">[] = [];
      const needle = q.toLowerCase();
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const vp = page.getViewport({ scale: 1, rotation: 0 });
        const tc = await page.getTextContent();
        for (const raw of tc.items) {
          const item = raw as {
            str?: string;
            transform?: number[];
            width?: number;
            height?: number;
          };
          const s = item.str ?? "";
          if (!s || !item.transform) continue;
          if (!s.toLowerCase().includes(needle)) continue;
          // item.transform is [a,b,c,d,e,f] in PDF user space (origin bottom-left).
          const t = item.transform;
          const fontHeight = Math.hypot(t[2], t[3]) || (item.height ?? 10);
          const pdfX = t[4];
          const pdfYBaseline = t[5];
          const width = item.width ?? fontHeight * s.length * 0.5;
          // Convert to top-left origin in viewport coords (unrotated => vp.height − y).
          const topY = vp.height - pdfYBaseline - fontHeight * 0.15;
          const boxTop = topY - fontHeight;
          const padY = fontHeight * 0.15;
          const padX = fontHeight * 0.05;
          boxes.push({
            pageIndex: i - 1,
            x: Math.max(0, (pdfX - padX) / vp.width),
            y: Math.max(0, (boxTop - padY) / vp.height),
            w: Math.min(1, (width + padX * 2) / vp.width),
            h: Math.min(1, (fontHeight + padY * 2) / vp.height),
          });
        }
      }
      if (boxes.length === 0) {
        setLastMatchCount(0);
        toast.info("No matches found");
        return;
      }
      setRedactions((prev) => [
        ...prev,
        ...boxes.map((b) => ({ ...b, id: uid() })),
      ]);
      setLastMatchCount(boxes.length);
      toast.success(`Added ${boxes.length} redaction${boxes.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(`Search failed: ${(e as Error).message}`);
    }
  };

  const run = async () => {
    if (!files[0] || redactions.length === 0 || !bytesRef.current) return;
    setLoading(true);
    setProgress(0);
    setLoadingLabel("Redacting…");
    try {
      const original = bytesRef.current.slice(0);
      const src = await loadPdfLibDoc(original);
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();
      const pdfjs = await loadPdfJsDoc(bytesRef.current.slice(0));

      // Bucket redactions by page.
      const byPage = new Map<number, Redaction[]>();
      for (const r of redactions) {
        const list = byPage.get(r.pageIndex) ?? [];
        list.push(r);
        byPage.set(r.pageIndex, list);
      }

      const total = src.getPageCount();
      for (let i = 0; i < total; i++) {
        setLoadingLabel(`Processing page ${i + 1} of ${total}…`);
        const list = byPage.get(i);
        if (!list || list.length === 0) {
          // Copy through untouched → preserves selectable text & original quality.
          const [copied] = await out.copyPages(src, [i]);
          out.addPage(copied);
        } else {
          // Rasterize the page, paint solid black over redactions, embed as JPEG.
          const page = await pdfjs.getPage(i + 1);
          const vpPoints = page.getViewport({ scale: 1, rotation: 0 });
          const vp = page.getViewport({ scale: EXPORT_SCALE, rotation: 0 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(vp.width));
          canvas.height = Math.max(1, Math.floor(vp.height));
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          ctx.fillStyle = "#000000";
          for (const r of list) {
            ctx.fillRect(
              Math.round(r.x * canvas.width),
              Math.round(r.y * canvas.height),
              Math.max(1, Math.round(r.w * canvas.width)),
              Math.max(1, Math.round(r.h * canvas.height)),
            );
          }
          const jpegBlob: Blob = await new Promise((res) =>
            canvas.toBlob((b) => res(b!), "image/jpeg", 0.85),
          );
          const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
          const img = await out.embedJpg(jpegBytes);
          const newPage = out.addPage([vpPoints.width, vpPoints.height]);
          newPage.drawImage(img, {
            x: 0,
            y: 0,
            width: vpPoints.width,
            height: vpPoints.height,
          });
        }
        setProgress(((i + 1) / total) * 100);
      }

      // Strip metadata (redacted docs are typically sensitive).
      out.setTitle("");
      out.setAuthor("");
      out.setSubject("");
      out.setKeywords([]);
      out.setProducer("");
      out.setCreator("");

      const saved = await out.save({ useObjectStreams: true });
      const base = files[0].name.replace(/\.pdf$/i, "");
      setResult({
        blob: new Blob([saved as BlobPart], { type: "application/pdf" }),
        filename: `${base}-redacted.pdf`,
        boxCount: redactions.length,
        pageCount: byPage.size,
      });
      toast.success("PDF redacted");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  /* ----------------------------- render ----------------------------- */

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Your redacted PDF is ready!"
        subheading={`${result.boxCount} area${result.boxCount === 1 ? "" : "s"} redacted on ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}.`}
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["redact-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        files={files}
        onFilesChange={setFiles}
        buttonLabel="Select PDF file"
      />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const pageCountsWithBoxes = new Set(redactions.map((r) => r.pageIndex)).size;

  return (
    <ToolWorkspace
      title="Redact PDF"
      actionLabel="Redact PDF"
      loadingLabel={loadingLabel}
      onAction={run}
      loading={loading}
      progress={progress}
      actionDisabled={redactions.length === 0}
      sidebar={
        <>
          <div
            className="flex gap-2.5 rounded-lg p-3 text-[12.5px]"
            style={{ backgroundColor: "#fff7e6", color: "#8a5a00" }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Redaction is permanent. Content under the black boxes is destroyed
              and cannot be recovered, the affected pages are re-rendered as images.
            </div>
          </div>

          <div>
            <Label htmlFor="find">Find text to redact</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="find"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="e.g. john@example.com"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void findAndAdd();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void findAndAdd()}
                className="inline-flex items-center gap-1 rounded-lg px-3 text-[13px] font-semibold"
                style={{ backgroundColor: "#33333c", color: "#ffffff" }}
              >
                <Search className="h-4 w-4" /> Find
              </button>
            </div>
            {lastMatchCount != null && (
              <p className="mt-1 text-[11.5px]" style={{ color: "#5a5a66" }}>
                Last search: {lastMatchCount} match{lastMatchCount === 1 ? "" : "es"}
              </p>
            )}
          </div>

          <div className="rounded-lg p-3 text-[13px]" style={{ backgroundColor: "#f5f5f7", color: "#33333c" }}>
            <strong>{redactions.length}</strong> redaction{redactions.length === 1 ? "" : "s"} on{" "}
            <strong>{pageCountsWithBoxes}</strong> page{pageCountsWithBoxes === 1 ? "" : "s"}
          </div>

          {redactions.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-semibold underline underline-offset-4"
              style={{ color: "#5a5a66" }}
            >
              Clear all redactions
            </button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        {pages.length === 0 && (
          <div className="flex items-center justify-center rounded-2xl bg-white py-16" style={{ border: "1px solid #ececef" }}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#5a5a66]" />
            <span className="text-[13px]" style={{ color: "#5a5a66" }}>Rendering pages…</span>
          </div>
        )}
        {pages.map((p) => (
          <PageCanvas
            key={p.pageIndex}
            page={p}
            redactions={redactions.filter((r) => r.pageIndex === p.pageIndex)}
            onAdd={(r) => addRedaction({ ...r, pageIndex: p.pageIndex })}
            onUpdate={updateRedaction}
            onRemove={removeRedaction}
          />
        ))}
      </div>
    </ToolWorkspace>
  );
}

/* ============================================================
 *  Per-page canvas with drag-to-draw + move/resize overlays
 * ============================================================ */

type DragKind =
  | { kind: "new"; startX: number; startY: number; id: string }
  | { kind: "move"; id: string; startX: number; startY: number; base: Redaction }
  | { kind: "resize"; id: string; corner: "nw" | "ne" | "sw" | "se"; startX: number; startY: number; base: Redaction };

function PageCanvas({
  page,
  redactions,
  onAdd,
  onUpdate,
  onRemove,
}: {
  page: PageInfo;
  redactions: Redaction[];
  onAdd: (r: Omit<Redaction, "id" | "pageIndex">) => void;
  onUpdate: (id: string, patch: Partial<Redaction>) => void;
  onRemove: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragKind | null>(null);
  // Track a live "pending" box so drawing feels responsive without spamming state upward.
  const [pending, setPending] = useState<Redaction | null>(null);

  const norm = (px: number, py: number, rect: DOMRect) => ({
    nx: Math.max(0, Math.min(1, (px - rect.left) / rect.width)),
    ny: Math.max(0, Math.min(1, (py - rect.top) / rect.height)),
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).dataset.handle || (e.target as HTMLElement).dataset.box) return;
    if (!wrapRef.current) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const rect = wrapRef.current.getBoundingClientRect();
    const { nx, ny } = norm(e.clientX, e.clientY, rect);
    const id = uid();
    setPending({ id, pageIndex: page.pageIndex, x: nx, y: ny, w: 0, h: 0 });
    setDrag({ kind: "new", startX: nx, startY: ny, id });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const { nx, ny } = norm(e.clientX, e.clientY, rect);
    if (drag.kind === "new") {
      const x = Math.min(drag.startX, nx);
      const y = Math.min(drag.startY, ny);
      const w = Math.abs(nx - drag.startX);
      const h = Math.abs(ny - drag.startY);
      setPending((p) => (p ? { ...p, x, y, w, h } : p));
    } else if (drag.kind === "move") {
      const dx = nx - drag.startX;
      const dy = ny - drag.startY;
      const b = drag.base;
      onUpdate(drag.id, {
        x: Math.max(0, Math.min(1 - b.w, b.x + dx)),
        y: Math.max(0, Math.min(1 - b.h, b.y + dy)),
      });
    } else {
      const dx = nx - drag.startX;
      const dy = ny - drag.startY;
      const b = drag.base;
      let x = b.x, y = b.y, w = b.w, h = b.h;
      if (drag.corner === "nw") { x = b.x + dx; y = b.y + dy; w = b.w - dx; h = b.h - dy; }
      if (drag.corner === "ne") { y = b.y + dy; w = b.w + dx; h = b.h - dy; }
      if (drag.corner === "sw") { x = b.x + dx; w = b.w - dx; h = b.h + dy; }
      if (drag.corner === "se") { w = b.w + dx; h = b.h + dy; }
      if (w < 0.005) w = 0.005;
      if (h < 0.005) h = 0.005;
      x = Math.max(0, Math.min(1 - w, x));
      y = Math.max(0, Math.min(1 - h, y));
      w = Math.min(1 - x, w);
      h = Math.min(1 - y, h);
      onUpdate(drag.id, { x, y, w, h });
    }
  };

  const onPointerUp = () => {
    if (drag?.kind === "new" && pending) {
      if (pending.w > 0.01 && pending.h > 0.01) {
        onAdd({ x: pending.x, y: pending.y, w: pending.w, h: pending.h });
      }
      setPending(null);
    }
    setDrag(null);
  };

  const startBoxDrag = (r: Redaction) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wrapRef.current) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const rect = wrapRef.current.getBoundingClientRect();
    const { nx, ny } = norm(e.clientX, e.clientY, rect);
    setDrag({ kind: "move", id: r.id, startX: nx, startY: ny, base: { ...r } });
  };

  const startResize = (r: Redaction, corner: "nw" | "ne" | "sw" | "se") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wrapRef.current) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const rect = wrapRef.current.getBoundingClientRect();
    const { nx, ny } = norm(e.clientX, e.clientY, rect);
    setDrag({ kind: "resize", id: r.id, corner, startX: nx, startY: ny, base: { ...r } });
  };

  const all = pending ? [...redactions, pending] : redactions;

  return (
    <div className="mx-auto" style={{ maxWidth: page.vpWidth * PREVIEW_SCALE }}>
      <div className="mb-2 text-[11.5px] font-semibold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
        Page {page.pageIndex + 1}
      </div>
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-lg bg-white select-none"
        style={{
          aspectRatio: `${page.vpWidth} / ${page.vpHeight}`,
          border: "1px solid #ececef",
          boxShadow: "0 1px 2px rgba(20,20,43,0.06)",
          touchAction: "none",
          cursor: drag ? "crosshair" : "crosshair",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          src={page.previewSrc}
          alt={`Page ${page.pageIndex + 1}`}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        {all.map((r) => {
          const isPending = pending && r.id === pending.id;
          return (
            <div
              key={r.id}
              data-box="1"
              onPointerDown={isPending ? undefined : startBoxDrag(r)}
              className="absolute"
              style={{
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                width: `${r.w * 100}%`,
                height: `${r.h * 100}%`,
                backgroundColor: "rgba(0,0,0,0.72)",
                border: `2px solid ${isPending ? "#e5322d" : "#e5322d"}`,
                cursor: "move",
              }}
            >
              {!isPending && (
                <>
                  <button
                    type="button"
                    data-handle="1"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onRemove(r.id); }}
                    className="absolute grid place-items-center rounded-full bg-white text-[#e5322d] shadow"
                    style={{ top: -10, right: -10, height: 20, width: 20 }}
                    aria-label="Remove redaction"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {(["nw", "ne", "sw", "se"] as const).map((c) => (
                    <div
                      key={c}
                      data-handle="1"
                      onPointerDown={startResize(r, c)}
                      className="absolute rounded-sm bg-white"
                      style={{
                        border: "2px solid #e5322d",
                        height: 10,
                        width: 10,
                        cursor: `${c}-resize`,
                        ...(c.includes("n") ? { top: -6 } : { bottom: -6 }),
                        ...(c.includes("w") ? { left: -6 } : { right: -6 }),
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

