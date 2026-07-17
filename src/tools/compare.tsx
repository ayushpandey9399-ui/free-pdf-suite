import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { diffLines, diffWordsWithSpace } from "diff";
import { toast } from "sonner";
import { Loader2, RotateCcw, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { cn } from "@/lib/utils";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { getTool } from "@/tools/registry";

type PdfDoc = import("pdfjs-dist").PDFDocumentProxy;
type PageInfo = { width: number; height: number; text: string | null };

// ---------- Render queue (module-scoped, 2 concurrent) ----------
type QueueTask = () => Promise<void>;
const renderQueue: QueueTask[] = [];
let activeRenders = 0;
const MAX_CONCURRENT_RENDERS = 2;
function pump() {
  while (activeRenders < MAX_CONCURRENT_RENDERS && renderQueue.length) {
    const t = renderQueue.shift()!;
    activeRenders++;
    t().finally(() => {
      activeRenders--;
      pump();
    });
  }
}
function enqueueRender(task: QueueTask) {
  renderQueue.push(task);
  pump();
}

// ---------- Doc wrapper ----------
class LazyDoc {
  pdf: PdfDoc;
  numPages: number;
  pageInfo: PageInfo[];
  renderCache = new Map<number, string>(); // pageNum -> blob URL
  private pending = new Map<number, Promise<string>>();

  constructor(pdf: PdfDoc) {
    this.pdf = pdf;
    this.numPages = pdf.numPages;
    // default A4 portrait aspect until real size known
    this.pageInfo = Array.from({ length: pdf.numPages }, () => ({
      width: 595,
      height: 842,
      text: null,
    }));
  }

  async renderPage(pageNum: number, targetWidth: number): Promise<string> {
    const cached = this.renderCache.get(pageNum);
    if (cached) return cached;
    const existing = this.pending.get(pageNum);
    if (existing) return existing;
    const p = new Promise<string>((resolve, reject) => {
      enqueueRender(async () => {
        try {
          const page = await this.pdf.getPage(pageNum);
          const vp1 = page.getViewport({ scale: 1 });
          // fit width to panel, cap DPR at 1 for compare
          const scale = Math.min(1.25, Math.max(0.4, targetWidth / vp1.width));
          const vp = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          const blob: Blob = await new Promise((res) =>
            canvas.toBlob((b) => res(b!), "image/jpeg", 0.82),
          );
          const url = URL.createObjectURL(blob);
          this.renderCache.set(pageNum, url);
          resolve(url);
        } catch (e) {
          reject(e);
        } finally {
          this.pending.delete(pageNum);
        }
      });
    });
    this.pending.set(pageNum, p);
    return p;
  }

  dispose() {
    for (const url of this.renderCache.values()) URL.revokeObjectURL(url);
    this.renderCache.clear();
    this.pdf.destroy?.();
  }
}

async function openDoc(file: File): Promise<LazyDoc> {
  const pdf = await loadPdfJsDoc(await file.arrayBuffer());
  return new LazyDoc(pdf);
}

// Extract sizes + text progressively; call onProgress after each page done.
async function extractMetadata(
  doc: LazyDoc,
  onPage: (i: number, info: PageInfo) => void,
  isCancelled: () => boolean,
) {
  const concurrency = 3;
  let next = 0;
  const runners: Promise<void>[] = [];
  const total = doc.numPages;
  const runOne = async () => {
    while (!isCancelled()) {
      const idx = next++;
      if (idx >= total) return;
      try {
        const page = await doc.pdf.getPage(idx + 1);
        const vp = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        const text = content.items
          .map((it) => ("str" in it ? it.str : ""))
          .join(" ");
        const info: PageInfo = { width: vp.width, height: vp.height, text };
        doc.pageInfo[idx] = info;
        if (!isCancelled()) onPage(idx, info);
      } catch {
        // leave placeholder
      }
    }
  };
  for (let i = 0; i < concurrency; i++) runners.push(runOne());
  await Promise.all(runners);
}

// ---------- Text diff ----------
type WordChunk = { text: string; kind: "same" | "added" | "removed" };
type LineDiff = { left: WordChunk[]; right: WordChunk[]; changed: boolean };

function buildLineDiff(a: string, b: string): { lines: LineDiff[]; changedLines: number } {
  const parts = diffLines(a, b);
  const lines: LineDiff[] = [];
  let changedLines = 0;
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (p.removed && parts[i + 1]?.added) {
      const words = diffWordsWithSpace(p.value, parts[i + 1].value);
      const left: WordChunk[] = [];
      const right: WordChunk[] = [];
      for (const w of words) {
        if (w.added) right.push({ text: w.value, kind: "added" });
        else if (w.removed) left.push({ text: w.value, kind: "removed" });
        else {
          left.push({ text: w.value, kind: "same" });
          right.push({ text: w.value, kind: "same" });
        }
      }
      const linesInBlock = Math.max(p.value.split("\n").length, parts[i + 1].value.split("\n").length) - 1;
      changedLines += Math.max(1, linesInBlock);
      lines.push({ left, right, changed: true });
      i += 2;
    } else if (p.removed) {
      lines.push({ left: [{ text: p.value, kind: "removed" }], right: [], changed: true });
      changedLines += Math.max(1, p.value.split("\n").length - 1);
      i++;
    } else if (p.added) {
      lines.push({ left: [], right: [{ text: p.value, kind: "added" }], changed: true });
      changedLines += Math.max(1, p.value.split("\n").length - 1);
      i++;
    } else {
      lines.push({
        left: [{ text: p.value, kind: "same" }],
        right: [{ text: p.value, kind: "same" }],
        changed: false,
      });
      i++;
    }
  }
  return { lines, changedLines };
}

// ---------- Component ----------
export default function Compare() {
  const [a, setA] = useState<File[]>([]);
  const [b, setB] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [docA, setDocA] = useState<LazyDoc | null>(null);
  const [docB, setDocB] = useState<LazyDoc | null>(null);
  const [mode, setMode] = useState<"visual" | "text">("visual");

  // progress tick: increments every time a page's metadata is extracted, forcing rerender
  const [tick, setTick] = useState(0);
  const [analyzedA, setAnalyzedA] = useState(0);
  const [analyzedB, setAnalyzedB] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const guardA = usePdfPasswordCheck(a, () => { setA([]); setDocA(null); });
  const guardB = usePdfPasswordCheck(b, () => { setB([]); setDocB(null); });
  const anyProtected = guardA.protectedName || guardB.protectedName;

  // cleanup on doc swap
  useEffect(() => {
    return () => {
      docA?.dispose();
    };
  }, [docA]);
  useEffect(() => {
    return () => {
      docB?.dispose();
    };
  }, [docB]);

  const totalPagesToAnalyze = (docA?.numPages ?? 0) + (docB?.numPages ?? 0);
  const totalAnalyzed = analyzedA + analyzedB;
  const analysisDone =
    !analyzing && !!docA && !!docB && analyzedA === docA.numPages && analyzedB === docB.numPages;

  const overlap = docA && docB ? Math.min(docA.numPages, docB.numPages) : 0;
  const maxPages = docA && docB ? Math.max(docA.numPages, docB.numPages) : 0;

  const pageDiffs = useMemo(() => {
    if (!docA || !docB) return [];
    const out: (boolean | null)[] = [];
    for (let i = 0; i < overlap; i++) {
      const ta = docA.pageInfo[i]?.text;
      const tb = docB.pageInfo[i]?.text;
      if (ta == null || tb == null) out.push(null);
      else out.push(ta.trim() !== tb.trim());
    }
    return out;
    // depend on tick so this recomputes as text streams in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docA, docB, overlap, tick]);

  const differingPageCount = pageDiffs.filter((v) => v === true).length;

  const textDiff = useMemo(() => {
    if (!analysisDone || !docA || !docB) return null;
    const ta = docA.pageInfo.map((p) => p.text ?? "").join("\n");
    const tb = docB.pageInfo.map((p) => p.text ?? "").join("\n");
    return buildLineDiff(ta, tb);
  }, [analysisDone, docA, docB]);

  const run = async () => {
    if (!a[0] || !b[0]) {
      toast.error("Upload two PDFs to compare");
      return;
    }
    setLoading(true);
    docA?.dispose();
    docB?.dispose();
    setDocA(null);
    setDocB(null);
    setAnalyzedA(0);
    setAnalyzedB(0);
    setTick(0);
    try {
      const [da, db] = await Promise.all([openDoc(a[0]), openDoc(b[0])]);
      setDocA(da);
      setDocB(db);
      setLoading(false);
      setAnalyzing(true);
      // Kick off background metadata extraction (non-blocking; user sees UI immediately)
      let cancelled = false;
      const cancelCheck = () => cancelled;
      const runA = extractMetadata(da, (i) => {
        setAnalyzedA((n) => Math.max(n, i + 1));
        setTick((t) => t + 1);
      }, cancelCheck);
      const runB = extractMetadata(db, (i) => {
        setAnalyzedB((n) => Math.max(n, i + 1));
        setTick((t) => t + 1);
      }, cancelCheck);
      Promise.all([runA, runB]).then(() => setAnalyzing(false));
      toast.success("Comparison ready");
    } catch (e) {
      setLoading(false);
      if (isPdfPasswordError(e)) toast.error("One of the PDFs is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    }
  };

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium mb-2">Document A (Original)</p>
          <FileDropzone accept="application/pdf" files={a} onFilesChange={setA} />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Document B (Modified)</p>
          <FileDropzone accept="application/pdf" files={b} onFilesChange={setB} />
        </div>
      </div>
      {anyProtected ? (
        <PasswordProtectedNotice
          fileName={guardA.protectedName ?? guardB.protectedName ?? undefined}
          onReset={() => { guardA.reset(); guardB.reset(); }}
        />
      ) : (
        <>
          <ActionBar
            onRun={run}
            disabled={!a[0] || !b[0]}
            loading={loading}
            label={loading ? "Opening PDFs…" : "Compare PDFs"}
          />
          {docA && docB && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex rounded-xl border bg-card p-1 text-sm">
                  <button
                    onClick={() => setMode("visual")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg transition",
                      mode === "visual" ? "bg-[#e5322d] text-white" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Visual Compare
                  </button>
                  <button
                    onClick={() => setMode("text")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg transition",
                      mode === "text" ? "bg-[#e5322d] text-white" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Text Diff
                  </button>
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                  {analyzing || !analysisDone ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Comparing… ({totalAnalyzed} of {totalPagesToAnalyze} pages)
                    </>
                  ) : mode === "visual" ? (
                    `${differingPageCount} of ${overlap} overlapping page${overlap === 1 ? "" : "s"} differ`
                  ) : textDiff ? (
                    `${textDiff.changedLines} line${textDiff.changedLines === 1 ? "" : "s"} changed`
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {docA.numPages !== docB.numPages && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  Document A has {docA.numPages} pages, Document B has {docB.numPages} pages.
                  Comparing pages 1–{overlap}. Pages {overlap + 1}–{maxPages} exist in only one
                  document and are listed as “only in” below.
                </div>
              )}

              {mode === "visual" ? (
                <VisualCompare
                  docA={docA}
                  docB={docB}
                  pageDiffs={pageDiffs}
                  overlap={overlap}
                  tick={tick}
                />
              ) : (
                <TextDiffView diff={textDiff} pending={!analysisDone} />
              )}

              <CompareNextSteps
                onReset={() => {
                  docA?.dispose();
                  docB?.dispose();
                  setA([]);
                  setB([]);
                  setDocA(null);
                  setDocB(null);
                  setMode("visual");
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CompareNextSteps({ onReset }: { onReset: () => void }) {
  const suggestions = TOOL_SUGGESTIONS.compare
    .map((slug) => getTool(slug))
    .filter((t): t is NonNullable<ReturnType<typeof getTool>> => !!t);
  return (
    <div className="mt-10 space-y-8 border-t pt-8" style={{ borderColor: "#ececef" }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-[15px] font-semibold" style={{ color: "#33333c" }}>
          Comparison complete.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-[#e5322d]"
          style={{ color: "#7a7a86" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Compare two other PDFs
        </button>
      </div>
      <div>
        <h3 className="text-[13px] font-bold uppercase" style={{ color: "#7a7a86", letterSpacing: "0.08em" }}>
          Continue to…
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {suggestions.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                to="/tools/$slug"
                params={{ slug: tool.slug }}
                className="group flex items-center gap-3 rounded-xl border bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#e5322d]"
                style={{ borderColor: "#ececef" }}
              >
                <Icon size={40} />
                <span className="text-[13.5px] font-semibold leading-tight" style={{ color: "#33333c" }}>
                  {tool.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold"
        style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
      >
        <Lock className="h-4 w-4" />
        Your files were processed 100% locally on your device — never uploaded anywhere.
      </div>
    </div>
  );
}

function TextDiffView({
  diff,
  pending,
}: {
  diff: { lines: LineDiff[]; changedLines: number } | null;
  pending: boolean;
}) {
  if (pending || !diff) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Extracting text from both documents…
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Comparing extracted text content only — formatting and images are not
        compared here. Switch to Visual Compare to see rendered pages.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <DiffPane title="Document A" side="left" lines={diff.lines} />
        <DiffPane title="Document B" side="right" lines={diff.lines} />
      </div>
    </div>
  );
}

function DiffPane({
  title,
  side,
  lines,
}: {
  title: string;
  side: "left" | "right";
  lines: LineDiff[];
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">{title}</div>
      <pre className="p-3 text-xs whitespace-pre-wrap font-mono max-h-[500px] overflow-auto">
        {lines.map((ln, i) => {
          const chunks = side === "left" ? ln.left : ln.right;
          if (!chunks.length) return null;
          return (
            <span key={i}>
              {chunks.map((c, j) => (
                <span
                  key={j}
                  className={cn(
                    c.kind === "added" && "bg-green-200 dark:bg-green-900/60",
                    c.kind === "removed" && "bg-red-200 dark:bg-red-900/60",
                  )}
                >
                  {c.text}
                </span>
              ))}
            </span>
          );
        })}
      </pre>
    </div>
  );
}

function VisualCompare({
  docA,
  docB,
  pageDiffs,
  overlap,
  tick,
}: {
  docA: LazyDoc;
  docB: LazyDoc;
  pageDiffs: (boolean | null)[];
  overlap: number;
  tick: number;
}) {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<"l" | "r" | null>(null);

  useEffect(() => {
    const l = leftScrollRef.current;
    const r = rightScrollRef.current;
    if (!l || !r) return;
    const onL = () => {
      if (syncingRef.current === "r") { syncingRef.current = null; return; }
      syncingRef.current = "l";
      const ratio = l.scrollTop / Math.max(1, l.scrollHeight - l.clientHeight);
      r.scrollTop = ratio * Math.max(1, r.scrollHeight - r.clientHeight);
    };
    const onR = () => {
      if (syncingRef.current === "l") { syncingRef.current = null; return; }
      syncingRef.current = "r";
      const ratio = r.scrollTop / Math.max(1, r.scrollHeight - r.clientHeight);
      l.scrollTop = ratio * Math.max(1, l.scrollHeight - l.clientHeight);
    };
    l.addEventListener("scroll", onL, { passive: true });
    r.addEventListener("scroll", onR, { passive: true });
    return () => {
      l.removeEventListener("scroll", onL);
      r.removeEventListener("scroll", onR);
    };
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PageColumn
        scrollRef={leftScrollRef}
        label="Document A"
        doc={docA}
        otherDoc={docB}
        pageDiffs={pageDiffs}
        overlap={overlap}
        side="A"
        tick={tick}
      />
      <PageColumn
        scrollRef={rightScrollRef}
        label="Document B"
        doc={docB}
        otherDoc={docA}
        pageDiffs={pageDiffs}
        overlap={overlap}
        side="B"
        tick={tick}
      />
    </div>
  );
}

function PageColumn({
  scrollRef,
  label,
  doc,
  otherDoc,
  pageDiffs,
  overlap,
  side,
  tick,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  label: string;
  doc: LazyDoc;
  otherDoc: LazyDoc;
  pageDiffs: (boolean | null)[];
  overlap: number;
  side: "A" | "B";
  tick: number;
}) {
  const totalPages = Math.max(doc.numPages, otherDoc.numPages);
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">{label}</div>
      <div ref={scrollRef} className="max-h-[70vh] overflow-auto p-3 space-y-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const inThisDoc = pageNum <= doc.numPages;
          if (!inThisDoc) {
            // Placeholder for "only in other doc" rows so scroll stays synced
            return (
              <div
                key={pageNum}
                className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/60 aspect-[3/4] grid place-items-center p-4 text-center"
              >
                <div className="text-xs text-muted-foreground">
                  Page {pageNum} — only in Document {side === "A" ? "B" : "A"}
                </div>
              </div>
            );
          }
          const info = doc.pageInfo[i];
          const inOverlap = pageNum <= overlap;
          const diff = inOverlap ? pageDiffs[i] : null;
          const changed = diff === true;
          const pending = inOverlap && diff === null;
          return (
            <div
              key={pageNum}
              className={cn(
                "rounded-lg border-2 bg-white overflow-hidden",
                changed ? "border-orange-400" : "border-transparent",
              )}
            >
              <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-1.5 text-xs">
                <span className="font-medium">
                  {label} — Page {pageNum}
                </span>
                {changed && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                    Differences detected
                  </span>
                )}
                {pending && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Comparing…
                  </span>
                )}
                {!inOverlap && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    Only in Document {side}
                  </span>
                )}
              </div>
              <LazyPage doc={doc} pageNum={pageNum} width={info.width} height={info.height} tick={tick} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LazyPage({
  doc,
  pageNum,
  width,
  height,
  tick: _tick,
}: {
  doc: LazyDoc;
  pageNum: number;
  width: number;
  height: number;
  tick: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(() => doc.renderCache.get(pageNum) ?? null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setVisible(true);
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || url || rendering) return;
    let cancelled = false;
    setRendering(true);
    const targetWidth = ref.current?.clientWidth ?? 400;
    doc
      .renderPage(pageNum, targetWidth)
      .then((u) => { if (!cancelled) setUrl(u); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRendering(false); });
    return () => { cancelled = true; };
  }, [visible, url, rendering, doc, pageNum]);

  return (
    <div ref={ref} style={{ aspectRatio: `${width} / ${height}` }} className="relative w-full bg-slate-100">
      {url ? (
        <img src={url} alt={`Page ${pageNum}`} className="absolute inset-0 h-full w-full object-contain" loading="lazy" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          {visible ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Rendering page {pageNum}…
            </span>
          ) : (
            <span>Page {pageNum}</span>
          )}
        </div>
      )}
    </div>
  );
}
