import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PDFDocument, degrees } from "pdf-lib";
import { getStroke } from "perfect-freehand";
import {
  X, Trash2, Pen, Type as TypeIcon, Upload as UploadIcon,
  ChevronLeft, ChevronRight, MousePointerClick, Undo2, Maximize2, RotateCw, Check,
} from "lucide-react";

import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Tab = "draw" | "type" | "upload";
type Kind = "signature" | "initials";

interface Signature {
  dataUrl: string;
  w: number; // intrinsic px
  h: number;
}

interface PageInfo {
  url: string;
  width: number;
  height: number;
  rotation: number;
}

interface Placement {
  id: string;
  pageIndex: number;
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // CW degrees, screen space
}

type StrokePoint = [number, number, number]; // x, y, pressure
interface StrokeRec {
  points: StrokePoint[];
  color: string;
  size: number;
}

const COLORS = [
  { name: "Black", value: "#111111" },
  { name: "Blue", value: "#1a56db" },
  { name: "Red", value: "#c72620" },
];

const THICKNESS = [
  { name: "Thin", size: 3 },
  { name: "Medium", size: 5.5 },
  { name: "Thick", size: 9 },
];

const TYPE_FONTS = [
  { name: "Dancing Script", family: "'Dancing Script', cursive" },
  { name: "Great Vibes", family: "'Great Vibes', cursive" },
  { name: "Caveat", family: "'Caveat', cursive" },
  { name: "Sacramento", family: "'Sacramento', cursive" },
];

export default function SignPdf() {
  const isMobile = useIsMobile();

  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);

  const [active, setActive] = useState<Kind>("signature");
  const [tab, setTab] = useState<Tab>("draw");
  const [signature, setSignature] = useState<Signature | null>(null);
  const [initials, setInitials] = useState<Signature | null>(null);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const [stampMode, setStampMode] = useState<Kind | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pulsePlace, setPulsePlace] = useState(false);

  const pagesContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());
  const registerPageEl = useCallback((idx: number, el: HTMLElement | null) => {
    if (el) pageRefs.current.set(idx, el);
    else pageRefs.current.delete(idx);
  }, []);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  useEffect(() => {
    let cancelled = false;
    setPages([]);
    setPlacements([]);
    setSelectedId(null);
    setStampMode(null);
    setCurrentPage(0);
    if (!file) return;
    setLoadingPages(true);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        const out: PageInfo[] = [];
        const maxW = 800;
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const vp1 = page.getViewport({ scale: 1, rotation: 0 });
          const scale = Math.min(2, maxW / vp1.width);
          const vp = page.getViewport({ scale, rotation: 0 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          if (cancelled) return;
          out.push({
            url: canvas.toDataURL("image/jpeg", 0.85),
            width: vp1.width,
            height: vp1.height,
            rotation: (page as unknown as { rotate: number }).rotate ?? 0,
          });
        }
        if (!cancelled) setPages(out);
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Preview failed: ${(e as Error).message}`);
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  const current = active === "signature" ? signature : initials;
  const setCurrent = (sig: Signature | null) => {
    if (active === "signature") setSignature(sig);
    else setInitials(sig);
    // Pulse the Place button once when a new signature is committed
    if (sig) {
      setPulsePlace(true);
      window.setTimeout(() => setPulsePlace(false), 1400);
    }
  };

  useEffect(() => {
    if (!pages.length) return;
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const idx = Number((e.target as HTMLElement).dataset.pageIndex ?? -1);
          if (idx >= 0) ratios.set(idx, e.intersectionRatio);
        }
        let best = 0, bestR = -1;
        ratios.forEach((r, i) => { if (r > bestR) { bestR = r; best = i; } });
        setCurrentPage(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    pageRefs.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pages.length]);

  // Escape to exit stamp mode / deselect
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (stampMode) setStampMode(null);
        else if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stampMode, selectedId]);

  // Keyboard nudge + delete for selected placement
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const tag = tgt?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tgt?.isContentEditable) return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setPlacements((prev) => prev.map((p) => {
          if (p.id !== selectedId) return p;
          const page = pages[p.pageIndex]; if (!page) return p;
          let x = p.x, y = p.y;
          if (e.key === "ArrowLeft") x -= step;
          if (e.key === "ArrowRight") x += step;
          if (e.key === "ArrowUp") y -= step;
          if (e.key === "ArrowDown") y += step;
          x = Math.max(0, Math.min(page.width - p.w, x));
          y = Math.max(0, Math.min(page.height - p.h, y));
          return { ...p, x, y };
        }));
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setPlacements((prev) => prev.filter((p) => p.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, pages]);

  const addPlacement = useCallback(
    (kind: Kind, pageIndex: number, cxPoints: number, cyPoints: number) => {
      const sig = kind === "signature" ? signature : initials;
      const page = pages[pageIndex];
      if (!sig || !page) return;
      const targetW = kind === "signature" ? Math.min(page.width * 0.35, 220) : Math.min(page.width * 0.18, 110);
      const aspect = sig.h / sig.w;
      const w = targetW;
      const h = w * aspect;
      const x = Math.max(0, Math.min(page.width - w, cxPoints - w / 2));
      const y = Math.max(0, Math.min(page.height - h, cyPoints - h / 2));
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPlacements((prev) => [...prev, { id, pageIndex, kind, x, y, w, h, rotation: 0 }]);
      setSelectedId(id);
    },
    [pages, signature, initials],
  );

  const placeOnDocument = useCallback(() => {
    if (!current) return;
    const pageIndex = currentPage;
    const page = pages[pageIndex];
    if (!page) return;
    const samePage = placements.filter((p) => p.pageIndex === pageIndex).length;
    const offset = (samePage % 6) * 20;
    addPlacement(active, pageIndex, page.width / 2 + offset, page.height / 2 + offset);
    setStampMode(active);
  }, [current, currentPage, pages, placements, active, addPlacement]);

  const scrollToPage = (idx: number) => {
    const el = pageRefs.current.get(idx);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetAll = () => {
    setFiles([]); setPages([]); setPlacements([]); setSelectedId(null);
    setSignature(null); setInitials(null); setResult(null);
    setActive("signature"); setTab("draw"); setStampMode(null); setCurrentPage(0);
    pageRefs.current.clear();
  };

  const run = async () => {
    if (!file || !placements.length) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const pdfPages = doc.getPages();
      const cache: Record<string, Awaited<ReturnType<typeof doc.embedPng>>> = {};
      for (const p of placements) {
        const sig = p.kind === "signature" ? signature : initials;
        if (!sig) continue;
        if (!cache[sig.dataUrl]) {
          const b64 = sig.dataUrl.split(",")[1];
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          cache[sig.dataUrl] = await doc.embedPng(bytes);
        }
        const png = cache[sig.dataUrl];
        const page = pdfPages[p.pageIndex];
        if (!page) continue;
        const { height } = page.getSize();
        // Convert top-left screen coords to pdf-lib bottom-left origin,
        // then apply rotation around the placement center.
        const uiAngle = p.rotation || 0;
        const rad = -uiAngle * Math.PI / 180; // pdf-lib rotates CCW
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const cxPdf = p.x + p.w / 2;
        const cyPdf = height - (p.y + p.h / 2);
        const anchorX = cxPdf - (p.w / 2) * cos + (p.h / 2) * sin;
        const anchorY = cyPdf - (p.w / 2) * sin - (p.h / 2) * cos;
        page.drawImage(png, {
          x: anchorX,
          y: anchorY,
          width: p.w,
          height: p.h,
          rotate: uiAngle ? degrees(-uiAngle) : undefined,
        });
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-signed.pdf` });
      toast.success("PDF signed");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Your PDF has been signed!"
        subheading={`${placements.length} signature${placements.length === 1 ? "" : "s"} added.`}
        downloadLabel="Download Signed PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["sign-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const hasRotatedPages = pages.some((p) => p.rotation % 360 !== 0);
  const stepIdx = !current ? 0 : placements.length === 0 ? 1 : 2;

  return (
    <>
      <ToolWorkspace
        title="Sign PDF"
        actionLabel="Sign PDF"
        loadingLabel="Signing…"
        onAction={run}
        loading={loading}
        actionDisabled={!placements.length}
        sidebar={
          <>
            {/* 1-2-3 strip */}
            <StepStrip step={stepIdx} />

            {/* Kind selector */}
            <div className="flex rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
              {(["signature", "initials"] as Kind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActive(k)}
                  className="flex-1 rounded-md px-3 py-1.5 text-[13px] font-semibold capitalize transition-colors"
                  style={{
                    backgroundColor: active === k ? "#ffffff" : "transparent",
                    color: active === k ? "#33333c" : "#5a5a66",
                    boxShadow: active === k ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                  }}
                >
                  {k === "signature" ? "Signature" : "Initials (optional)"}
                </button>
              ))}
            </div>

            {/* Tab selector */}
            <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: "#f4f4f6" }}>
              {([
                { id: "draw", label: "Draw", icon: Pen },
                { id: "type", label: "Type", icon: TypeIcon },
                { id: "upload", label: "Upload", icon: UploadIcon },
              ] as { id: Tab; label: string; icon: typeof Pen }[]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px] font-semibold transition-colors"
                  style={{
                    backgroundColor: tab === id ? "#ffffff" : "transparent",
                    color: tab === id ? "#33333c" : "#5a5a66",
                    boxShadow: tab === id ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            {tab === "draw" && <DrawTab onCommit={setCurrent} isMobile={isMobile} />}
            {tab === "type" && <TypePad onCommit={setCurrent} />}
            {tab === "upload" && <UploadPad onCommit={setCurrent} />}

            {current && (
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.06em" }}>
                  Preview
                </p>
                <div className="rounded-lg p-3" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                  <img src={current.dataUrl} alt="Signature preview" className="mx-auto max-h-16" />
                </div>
                {stampMode === active ? (
                  <button
                    type="button"
                    onClick={() => setStampMode(null)}
                    className="mt-3 w-full rounded-lg py-2.5 text-[13px] font-bold uppercase text-white transition-colors"
                    style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
                  >
                    Done placing
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={placeOnDocument}
                    data-pulse={pulsePlace ? "1" : "0"}
                    className="sign-place-btn mt-3 w-full rounded-lg py-2.5 text-[13px] font-bold uppercase text-white transition-colors"
                    style={{ backgroundColor: "#33333c", letterSpacing: "0.04em" }}
                  >
                    Place on document
                  </button>
                )}
                {stampMode === active && (
                  <p className="mt-2 text-center text-[11.5px]" style={{ color: "#5a5a66" }}>
                    <MousePointerClick className="mr-1 inline h-3 w-3" />
                    Tap where you want the signature. Press Esc to finish.
                  </p>
                )}
              </div>
            )}

            {/* Page navigator */}
            {pages.length > 1 && (
              <div className="flex items-center justify-between rounded-lg p-2" style={{ border: "1px solid #ececef", backgroundColor: "#fafafb" }}>
                <button
                  type="button"
                  onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage <= 0}
                  className="grid h-8 w-8 place-items-center rounded-md text-[#33333c] disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[12.5px] font-semibold" style={{ color: "#33333c" }}>
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToPage(Math.min(pages.length - 1, currentPage + 1))}
                  disabled={currentPage >= pages.length - 1}
                  className="grid h-8 w-8 place-items-center rounded-md text-[#33333c] disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <InfoTip>
              {placements.length
                ? `${placements.length} placement${placements.length === 1 ? "" : "s"} on document. Tap to select, drag to move, corners to resize, top pill to rotate. Arrow keys nudge, Delete removes.`
                : "Create a signature, then tap \"Place on document\". Tap other pages to drop more copies."}
            </InfoTip>

            {hasRotatedPages && (
              <p className="text-[11.5px]" style={{ color: "#a15c1a" }}>
                Note: rotated pages are shown in their native orientation for accurate placement.
              </p>
            )}
          </>
        }
      >
        {stampMode && (
          <div
            className="sticky top-2 z-20 mb-3 flex items-center justify-between gap-3 rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-md"
            style={{ backgroundColor: "#33333c" }}
          >
            <span className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Tap where you want the signature
            </span>
            <button
              type="button"
              onClick={() => setStampMode(null)}
              className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold hover:bg-white/25"
            >
              Cancel
            </button>
          </div>
        )}

        <div ref={pagesContainerRef} className="space-y-4 pb-24 sm:pb-4">
          {loadingPages && (
            <div className="grid h-64 place-items-center rounded-2xl bg-white text-sm text-muted-foreground" style={{ border: "1px solid #ececef" }}>
              Rendering pages…
            </div>
          )}
          {pages.map((page, i) => (
            <PageOverlay
              key={i}
              index={i}
              page={page}
              placements={placements.filter((p) => p.pageIndex === i)}
              onChange={(updated) => setPlacements((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
              onRemove={(id) => { setPlacements((prev) => prev.filter((p) => p.id !== id)); if (selectedId === id) setSelectedId(null); }}
              signature={signature}
              initials={initials}
              stampSig={stampMode ? (stampMode === "signature" ? signature : initials) : null}
              onStamp={(pageIndex, cxPts, cyPts) => stampMode && addPlacement(stampMode, pageIndex, cxPts, cyPts)}
              registerEl={registerPageEl}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </ToolWorkspace>

      {/* Sticky mobile bottom bar */}
      {pages.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ececef] bg-white/95 p-3 backdrop-blur sm:hidden">
          {stampMode ? (
            <button
              type="button"
              onClick={() => setStampMode(null)}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white"
              style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            >
              Done placing
            </button>
          ) : placements.length ? (
            <button
              type="button"
              onClick={run}
              disabled={loading}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white disabled:opacity-60"
              style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            >
              {loading ? "Signing…" : "Sign PDF"}
            </button>
          ) : current ? (
            <button
              type="button"
              onClick={placeOnDocument}
              className="w-full rounded-lg py-3 text-[14px] font-bold uppercase text-white"
              style={{ backgroundColor: "#33333c", letterSpacing: "0.04em" }}
            >
              Place signature
            </button>
          ) : (
            <p className="text-center text-[13px] font-semibold text-[#5a5a66]">
              Create a signature above to get started
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes signPulseOnce {
          0% { box-shadow: 0 0 0 0 rgba(229,50,45,0.55); }
          70% { box-shadow: 0 0 0 12px rgba(229,50,45,0); }
          100% { box-shadow: 0 0 0 0 rgba(229,50,45,0); }
        }
        .sign-place-btn[data-pulse="1"] {
          animation: signPulseOnce 1.2s ease-out 1;
        }
      `}</style>
    </>
  );
}

/* ============================== Step strip ============================== */

function StepStrip({ step }: { step: 0 | 1 | 2 }) {
  const steps = ["Create signature", "Place on document", "Download signed PDF"];
  return (
    <ol className="flex items-center gap-1.5">
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5">
            <div
              className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11.5px] font-semibold"
              style={{
                backgroundColor: active ? "#fff6f5" : done ? "#f4f4f6" : "#fafafb",
                color: active ? "#e5322d" : done ? "#33333c" : "#a1a1ab",
                border: active ? "1px solid #f3c9c7" : "1px solid transparent",
                flex: 1,
              }}
            >
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: active ? "#e5322d" : done ? "#33333c" : "#d4d4dc",
                  color: "#ffffff",
                }}
              >
                {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </span>
              <span className="truncate">{label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ============================== Page overlay ============================== */

function PageOverlay({
  index,
  page,
  placements,
  onChange,
  onRemove,
  signature,
  initials,
  stampSig,
  onStamp,
  registerEl,
  selectedId,
  onSelect,
}: {
  index: number;
  page: PageInfo;
  placements: Placement[];
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
  signature: Signature | null;
  initials: Signature | null;
  stampSig: Signature | null;
  onStamp: (pageIndex: number, cxPts: number, cyPts: number) => void;
  registerEl: (idx: number, el: HTMLElement | null) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayW, setDisplayW] = useState(0);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const update = () => setDisplayW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    registerEl(index, cardRef.current);
    return () => registerEl(index, null);
  }, [index, registerEl]);

  const scale = displayW ? displayW / page.width : 0;
  const displayH = page.height * scale;

  const ghostW = stampSig ? (Math.min(page.width * 0.35, 220)) : 0;
  const ghostH = stampSig ? ghostW * (stampSig.h / stampSig.w) : 0;

  return (
    <div ref={cardRef} data-page-index={index} className="rounded-2xl bg-white p-3" style={{ border: "1px solid #ececef" }}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[12px] font-semibold" style={{ color: "#5a5a66" }}>Page {index + 1}</p>
        {placements.length > 0 && (
          <p className="text-[11.5px]" style={{ color: "#5a5a66" }}>
            {placements.length} placement{placements.length === 1 ? "" : "s"}
          </p>
        )}
      </div>
      <div
        ref={wrapRef}
        className="relative mx-auto w-full select-none"
        style={{
          height: displayH || undefined,
          touchAction: "none",
          cursor: stampSig ? "crosshair" : "default",
        }}
        onPointerMove={(e) => {
          if (!stampSig || !scale) return;
          const r = e.currentTarget.getBoundingClientRect();
          setGhost({ x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale });
        }}
        onPointerLeave={() => setGhost(null)}
        onClick={(e) => {
          if (!stampSig || !scale) {
            // clicking blank page area deselects
            if (selectedId) onSelect(null);
            return;
          }
          const r = e.currentTarget.getBoundingClientRect();
          const cx = (e.clientX - r.left) / scale;
          const cy = (e.clientY - r.top) / scale;
          onStamp(index, cx, cy);
        }}
      >
        <img src={page.url} alt={`Page ${index + 1}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        {scale > 0 &&
          placements.map((p) => {
            const sig = p.kind === "signature" ? signature : initials;
            if (!sig) return null;
            return (
              <PlacementBox
                key={p.id}
                placement={p}
                sig={sig}
                scale={scale}
                pageW={page.width}
                pageH={page.height}
                onChange={onChange}
                onRemove={onRemove}
                selected={selectedId === p.id}
                onSelect={onSelect}
              />
            );
          })}
        {stampSig && ghost && scale > 0 && (
          <img
            src={stampSig.dataUrl}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute opacity-60"
            style={{
              left: (ghost.x - ghostW / 2) * scale,
              top: (ghost.y - ghostH / 2) * scale,
              width: ghostW * scale,
              height: ghostH * scale,
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ============================== Placement box ============================== */

type DragMode =
  | { kind: "move" }
  | { kind: "resize"; corner: "nw" | "ne" | "sw" | "se" }
  | { kind: "rotate" };

function PlacementBox({
  placement,
  sig,
  scale,
  pageW,
  pageH,
  onChange,
  onRemove,
  selected,
  onSelect,
}: {
  placement: Placement;
  sig: Signature;
  scale: number;
  pageW: number;
  pageH: number;
  onChange: (p: Placement) => void;
  onRemove: (id: string) => void;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const dragRef = useRef<{
    mode: DragMode;
    startClientX: number;
    startClientY: number;
    start: Placement;
    boxCenterClientX: number;
    boxCenterClientY: number;
  } | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);

  const startDrag = (mode: DragMode) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(placement.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const box = boxRef.current!.getBoundingClientRect();
    dragRef.current = {
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      start: { ...placement },
      boxCenterClientX: box.left + box.width / 2,
      boxCenterClientY: box.top + box.height / 2,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    e.preventDefault();
    const dx = (e.clientX - d.startClientX) / scale;
    const dy = (e.clientY - d.startClientY) / scale;

    if (d.mode.kind === "move") {
      const x = Math.max(0, Math.min(pageW - d.start.w, d.start.x + dx));
      const y = Math.max(0, Math.min(pageH - d.start.h, d.start.y + dy));
      onChange({ ...d.start, x, y });
      return;
    }

    if (d.mode.kind === "rotate") {
      const ang = Math.atan2(e.clientY - d.boxCenterClientY, e.clientX - d.boxCenterClientX);
      // 0 deg = up. atan2 gives 0 at +x, so subtract 90.
      let deg = ang * 180 / Math.PI + 90;
      // Normalize to [-180, 180]
      while (deg > 180) deg -= 360;
      while (deg < -180) deg += 360;
      // Snap at 0/90/180/-90 within 5 deg
      for (const t of [0, 90, 180, -180, -90]) {
        if (Math.abs(deg - t) < 5) { deg = t === -180 ? 180 : t; break; }
      }
      onChange({ ...d.start, rotation: Math.round(deg) });
      return;
    }

    // Resize (proportional, aspect-locked from any corner around center of opposite corner)
    const aspect = d.start.h / d.start.w;
    const corner = d.mode.corner;
    // Anchor corner is the opposite corner (kept fixed)
    const anchor = {
      x: corner === "nw" ? d.start.x + d.start.w : corner === "ne" ? d.start.x : corner === "sw" ? d.start.x + d.start.w : d.start.x,
      y: corner === "nw" ? d.start.y + d.start.h : corner === "ne" ? d.start.y + d.start.h : corner === "sw" ? d.start.y : d.start.y,
    };
    const dragged = {
      x: (corner === "nw" || corner === "sw") ? d.start.x + dx : d.start.x + d.start.w + dx,
      y: (corner === "nw" || corner === "ne") ? d.start.y + dy : d.start.y + d.start.h + dy,
    };
    let w = Math.abs(dragged.x - anchor.x);
    let h = Math.abs(dragged.y - anchor.y);
    // Lock aspect ratio: use the larger dimension driver
    if (h / w > aspect) w = h / aspect; else h = w * aspect;
    w = Math.max(24, w);
    h = Math.max(24 * aspect, w * aspect);
    // Recompute new top-left with anchor fixed
    const newX = corner === "ne" || corner === "se" ? anchor.x : anchor.x - w;
    const newY = corner === "sw" || corner === "se" ? anchor.y : anchor.y - h;
    // Clamp to page
    let x = Math.max(0, Math.min(pageW - w, newX));
    let y = Math.max(0, Math.min(pageH - h, newY));
    // If clamped, tighten w/h so we don't drift off-page
    if (x + w > pageW) w = pageW - x;
    if (y + h > pageH) { h = pageH - y; w = h / aspect; }
    onChange({ ...d.start, x, y, w, h });
  };

  const endDrag = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const HANDLE = "grid place-items-center rounded-full bg-[#e5322d] text-white touch-none";
  const cornerBase: React.CSSProperties = {
    width: 24, height: 24, border: "2px solid #ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
  };

  return (
    <div
      ref={boxRef}
      className="group absolute"
      onClick={(e) => e.stopPropagation()}
      style={{
        left: placement.x * scale,
        top: placement.y * scale,
        width: placement.w * scale,
        height: placement.h * scale,
        touchAction: "none",
      }}
    >
      <div
        style={{
          transform: placement.rotation ? `rotate(${placement.rotation}deg)` : undefined,
          transformOrigin: "50% 50%",
          width: "100%", height: "100%", position: "relative",
        }}
      >
        <div
          onPointerDown={startDrag({ kind: "move" })}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute inset-0 cursor-move rounded-sm"
          style={{
            border: selected ? "1.5px solid #e5322d" : "1.5px dashed #e5322d",
            backgroundColor: selected ? "rgba(229,50,45,0.06)" : "rgba(229,50,45,0.04)",
          }}
        >
          <img
            src={sig.dataUrl}
            alt="Signature"
            className="pointer-events-none h-full w-full object-contain p-1"
            draggable={false}
          />
        </div>

        {selected && (
          <>
            {/* Rotate handle top-center */}
            <div
              onPointerDown={startDrag({ kind: "rotate" })}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              className={cn(HANDLE, "absolute cursor-grab")}
              style={{ ...cornerBase, left: "50%", top: -34, transform: "translateX(-50%)" }}
              aria-label="Rotate"
            >
              <RotateCw className="h-3 w-3" />
            </div>
            {/* 4 corner handles */}
            {(["nw", "ne", "sw", "se"] as const).map((c) => {
              const pos: React.CSSProperties =
                c === "nw" ? { left: -12, top: -12, cursor: "nwse-resize" } :
                c === "ne" ? { right: -12, top: -12, cursor: "nesw-resize" } :
                c === "sw" ? { left: -12, bottom: -12, cursor: "nesw-resize" } :
                { right: -12, bottom: -12, cursor: "nwse-resize" };
              return (
                <div
                  key={c}
                  onPointerDown={startDrag({ kind: "resize", corner: c })}
                  onPointerMove={onPointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  className={cn(HANDLE, "absolute")}
                  style={{ ...cornerBase, ...pos }}
                  aria-label={`Resize ${c}`}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Remove button outside the rotation transform so it stays upright */}
      <button
        type="button"
        onClick={() => onRemove(placement.id)}
        className="absolute -right-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-white text-[#e5322d] shadow"
        style={{ border: "1px solid #ececef" }}
        aria-label="Remove signature"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ============================== Draw tab (inline + fullscreen sheet) ============================== */

function DrawTab({ onCommit, isMobile }: { onCommit: (sig: Signature | null) => void; isMobile: boolean }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState<Signature | null>(null);

  const commit = (sig: Signature | null) => {
    setPreview(sig);
    onCommit(sig);
  };

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-6 text-[13px] font-semibold transition-colors"
          style={{ border: "1px dashed #cfcfd6", color: "#33333c", backgroundColor: "#fafafb" }}
        >
          <Maximize2 className="h-4 w-4" />
          {preview ? "Redraw signature" : "Open drawing pad"}
        </button>
        {sheetOpen && (
          <FullscreenDrawSheet
            initial={null}
            onClose={() => setSheetOpen(false)}
            onDone={(sig) => { commit(sig); setSheetOpen(false); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <DrawPad heightPx={220} onCommit={commit} onOpenFullscreen={() => setSheetOpen(true)} />
      {sheetOpen && (
        <FullscreenDrawSheet
          initial={null}
          onClose={() => setSheetOpen(false)}
          onDone={(sig) => { commit(sig); setSheetOpen(false); }}
        />
      )}
    </>
  );
}

function FullscreenDrawSheet({
  onClose, onDone,
}: {
  initial: Signature | null;
  onClose: () => void;
  onDone: (sig: Signature | null) => void;
}) {
  const [portrait, setPortrait] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight >= window.innerWidth : true,
  );
  const localCommitRef = useRef<Signature | null>(null);

  useEffect(() => {
    const onResize = () => setPortrait(window.innerHeight >= window.innerWidth);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    // Lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ touchAction: "none" }}>
      <div className="flex items-center justify-between border-b border-[#ececef] px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="text-[14px] font-semibold text-[#5a5a66]"
        >
          Cancel
        </button>
        <p className="text-[14px] font-bold text-[#33333c]">Draw signature</p>
        <button
          type="button"
          onClick={() => onDone(localCommitRef.current)}
          disabled={!localCommitRef.current}
          className="rounded-md px-3 py-1.5 text-[13px] font-bold uppercase text-white disabled:opacity-50"
          style={{ backgroundColor: "#e5322d" }}
        >
          Done
        </button>
      </div>
      {portrait && (
        <p className="bg-[#fff6f5] px-4 py-2 text-center text-[12px] font-semibold text-[#a15c1a]">
          Rotate your phone for more room
        </p>
      )}
      <div className="flex-1 p-3">
        <DrawPad
          fill
          onCommit={(sig) => { localCommitRef.current = sig; }}
        />
      </div>
    </div>
  );
}

function DrawPad({
  heightPx,
  fill,
  onCommit,
  onOpenFullscreen,
}: {
  heightPx?: number;
  fill?: boolean;
  onCommit: (sig: Signature | null) => void;
  onOpenFullscreen?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(THICKNESS[1].size);
  // stroke stack committed
  const strokesRef = useRef<StrokeRec[]>([]);
  // current in-progress stroke
  const currentRef = useRef<StrokeRec | null>(null);
  const [strokeCount, setStrokeCount] = useState(0); // for undo button enabled state

  // Setup canvas size
  const setup = useCallback(() => {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = w.getBoundingClientRect();
    c.width = Math.max(1, Math.floor(rect.width * ratio));
    c.height = Math.max(1, Math.floor(rect.height * ratio));
    c.style.width = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setup();
    const ro = new ResizeObserver(setup);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [setup]);

  const redraw = () => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.scale(ratio, ratio);
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (currentRef.current) drawStroke(ctx, currentRef.current);
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, s: StrokeRec) => {
    if (s.points.length === 0) return;
    const outline = getStroke(s.points, {
      size: s.size,
      thinning: 0.55,
      smoothing: 0.6,
      streamline: 0.55,
      simulatePressure: true,
      last: currentRef.current !== s,
    });
    if (!outline.length) return;
    const path = new Path2D();
    path.moveTo(outline[0][0], outline[0][1]);
    for (let i = 1; i < outline.length; i++) {
      const [x0, y0] = outline[i - 1];
      const [x1, y1] = outline[i];
      path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    path.closePath();
    ctx.fillStyle = s.color;
    ctx.fill(path);
  };

  const pos = (e: React.PointerEvent): StrokePoint => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const p = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    return [e.clientX - rect.left, e.clientY - rect.top, p];
  };

  const commit = () => {
    const c = canvasRef.current; if (!c) return;
    if (strokesRef.current.length === 0) { onCommit(null); return; }
    const trimmed = trimTransparent(c);
    if (!trimmed) { onCommit(null); return; }
    onCommit({ dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h });
  };

  const undo = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
    commit();
  };

  const clear = () => {
    strokesRef.current = [];
    setStrokeCount(0);
    redraw();
    onCommit(null);
  };

  const style: React.CSSProperties = fill
    ? { width: "100%", height: "100%" }
    : { width: "100%", height: heightPx ?? 220 };

  return (
    <div className={fill ? "flex h-full flex-col" : ""}>
      <div
        ref={wrapRef}
        className="relative rounded-lg bg-white"
        style={{ ...style, border: "1px dashed #cfcfd6", touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-lg"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            currentRef.current = { points: [pos(e)], color, size };
            redraw();
          }}
          onPointerMove={(e) => {
            if (!currentRef.current) return;
            e.preventDefault();
            currentRef.current.points.push(pos(e));
            redraw();
          }}
          onPointerUp={(e) => {
            try { (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
            const s = currentRef.current;
            currentRef.current = null;
            if (s && s.points.length > 1) {
              strokesRef.current.push(s);
              setStrokeCount(strokesRef.current.length);
              redraw();
              commit();
            } else {
              redraw();
            }
          }}
          onPointerCancel={() => { currentRef.current = null; redraw(); }}
        />
        {strokeCount === 0 && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center text-[13px] text-[#a1a1ab]">
            Sign here
          </p>
        )}
      </div>

      {/* Controls */}
      <div className={cn("mt-2 flex flex-wrap items-center gap-3", fill && "px-1")}>
        {/* Colors */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              aria-label={c.name}
              className="h-7 w-7 rounded-full transition-transform"
              style={{
                backgroundColor: c.value,
                outline: color === c.value ? "2px solid #33333c" : "none",
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        {/* Thickness */}
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: "#f4f4f6" }}>
          {THICKNESS.map((t) => (
            <button
              key={t.name}
              type="button"
              onClick={() => setSize(t.size)}
              className="rounded-md px-2 py-1 text-[11.5px] font-semibold"
              style={{
                backgroundColor: size === t.size ? "#ffffff" : "transparent",
                color: size === t.size ? "#33333c" : "#5a5a66",
                boxShadow: size === t.size ? "0 1px 2px rgba(20,20,43,0.08)" : "none",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={strokeCount === 0}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d] disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={strokeCount === 0}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d] disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          {onOpenFullscreen && (
            <button
              type="button"
              onClick={onOpenFullscreen}
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5a5a66] hover:text-[#e5322d]"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Type + Upload pads ============================== */

function TypePad({ onCommit }: { onCommit: (sig: Signature | null) => void }) {
  const [text, setText] = useState("");
  const [font, setFont] = useState(TYPE_FONTS[0].family);
  const [color, setColor] = useState(COLORS[0].value);

  useEffect(() => {
    if (!text.trim()) { onCommit(null); return; }
    const rendered = renderTextToPng(text, font, color);
    if (rendered) onCommit(rendered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, font, color]);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="sig-text" className="text-xs">Your name</Label>
        <Input id="sig-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your signature" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TYPE_FONTS.map((f) => (
          <button
            key={f.family}
            type="button"
            onClick={() => setFont(f.family)}
            className="rounded-lg p-2 text-center transition-colors"
            style={{
              border: font === f.family ? "2px solid #e5322d" : "1px solid #ececef",
              padding: font === f.family ? "calc(0.5rem - 1px)" : "0.5rem",
              backgroundColor: font === f.family ? "#fff6f5" : "#ffffff",
            }}
          >
            <span style={{ fontFamily: f.family, fontSize: 22, color, lineHeight: 1.1 }}>
              {text || f.name}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setColor(c.value)}
            aria-label={c.name}
            className="h-6 w-6 rounded-full"
            style={{
              backgroundColor: c.value,
              outline: color === c.value ? "2px solid #33333c" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function UploadPad({ onCommit }: { onCommit: (sig: Signature | null) => void }) {
  const [removeBg, setRemoveBg] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const img = await loadImg(url);
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      if (removeBg) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          if (r > 235 && g > 235 && b > 235) px[i + 3] = 0;
        }
        ctx.putImageData(data, 0, 0);
      }
      const trimmed = trimTransparent(canvas);
      if (trimmed) onCommit({ dataUrl: trimmed.dataUrl, w: trimmed.w, h: trimmed.h });
    } catch (e) {
      toast.error(`Upload failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg py-6 text-[13px] font-semibold transition-colors"
        style={{ border: "1px dashed #cfcfd6", color: "#33333c", backgroundColor: "#fafafb" }}
      >
        Choose signature image (PNG or JPG)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <label className="flex items-center gap-2 text-[13px]" style={{ color: "#33333c" }}>
        <Checkbox checked={removeBg} onCheckedChange={(v) => setRemoveBg(v === true)} />
        <span>Remove white background</span>
      </label>
    </div>
  );
}

/* ============================== helpers ============================== */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function renderTextToPng(text: string, font: string, color: string): Signature | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const fontSize = 96;
  const pad = 20;
  ctx.font = `${fontSize}px ${font}`;
  const metrics = ctx.measureText(text);
  const textW = Math.max(1, Math.ceil(metrics.width));
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.3;
  const textH = Math.ceil(ascent + descent);
  canvas.width = textW + pad * 2;
  canvas.height = textH + pad * 2;
  const c = canvas.getContext("2d")!;
  c.font = `${fontSize}px ${font}`;
  c.fillStyle = color;
  c.textBaseline = "alphabetic";
  c.fillText(text, pad, pad + ascent);
  return { dataUrl: canvas.toDataURL("image/png"), w: canvas.width, h: canvas.height };
}

function trimTransparent(canvas: HTMLCanvasElement): { dataUrl: string; w: number; h: number } | null {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let top = height, left = width, right = 0, bottom = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 5) {
        found = true;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (!found) return null;
  const pad = 4;
  const x0 = Math.max(0, left - pad);
  const y0 = Math.max(0, top - pad);
  const w = Math.min(width - x0, right - left + 1 + pad * 2);
  const h = Math.min(height - y0, bottom - top + 1 + pad * 2);
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const octx = out.getContext("2d")!;
  octx.drawImage(canvas, x0, y0, w, h, 0, 0, w, h);
  return { dataUrl: out.toDataURL("image/png"), w, h };
}
