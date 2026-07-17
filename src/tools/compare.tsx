import { useEffect, useMemo, useRef, useState } from "react";
import { diffLines, diffWordsWithSpace } from "diff";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { cn } from "@/lib/utils";

type PageData = { text: string; width: number; height: number };
type Doc = { pages: PageData[]; getPage: (n: number) => Promise<import("pdfjs-dist").PDFPageProxy> };

async function loadDoc(file: File): Promise<Doc> {
  const doc = await loadPdfJsDoc(await file.arrayBuffer());
  const pages: PageData[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const text = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
    pages.push({ text, width: vp.width, height: vp.height });
  }
  return { pages, getPage: (n) => doc.getPage(n) };
}

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

export default function Compare() {
  const [a, setA] = useState<File[]>([]);
  const [b, setB] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [docA, setDocA] = useState<Doc | null>(null);
  const [docB, setDocB] = useState<Doc | null>(null);
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const guardA = usePdfPasswordCheck(a, () => { setA([]); setDocA(null); });
  const guardB = usePdfPasswordCheck(b, () => { setB([]); setDocB(null); });
  const anyProtected = guardA.protectedName || guardB.protectedName;

  const textDiff = useMemo(() => {
    if (!docA || !docB) return null;
    const ta = docA.pages.map((p) => p.text).join("\n");
    const tb = docB.pages.map((p) => p.text).join("\n");
    return buildLineDiff(ta, tb);
  }, [docA, docB]);

  const pageDiffs = useMemo(() => {
    if (!docA || !docB) return [];
    const max = Math.max(docA.pages.length, docB.pages.length);
    const out: boolean[] = [];
    for (let i = 0; i < max; i++) {
      const ta = docA.pages[i]?.text ?? "";
      const tb = docB.pages[i]?.text ?? "";
      out.push(ta.trim() !== tb.trim());
    }
    return out;
  }, [docA, docB]);

  const differingPageCount = pageDiffs.filter(Boolean).length;

  const run = async () => {
    if (!a[0] || !b[0]) {
      toast.error("Upload two PDFs to compare");
      return;
    }
    setLoading(true);
    setDocA(null);
    setDocB(null);
    try {
      const [da, db] = await Promise.all([loadDoc(a[0]), loadDoc(b[0])]);
      setDocA(da);
      setDocB(db);
      toast.success("Comparison ready");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("One of the PDFs is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
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
          <ActionBar onRun={run} disabled={!a[0] || !b[0]} loading={loading} label="Compare PDFs" />
          {docA && docB && (
            <div className="mt-6 space-y-4">
              {/* Mode toggle */}
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
                <div className="text-sm text-muted-foreground">
                  {mode === "visual"
                    ? `${differingPageCount} of ${pageDiffs.length} page${pageDiffs.length === 1 ? "" : "s"} differ`
                    : textDiff
                      ? `${textDiff.changedLines} line${textDiff.changedLines === 1 ? "" : "s"} changed`
                      : ""}
                </div>
              </div>

              {docA.pages.length !== docB.pages.length && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  Document A has {docA.pages.length} pages, Document B has {docB.pages.length} pages.
                </div>
              )}

              {mode === "visual" ? (
                <VisualCompare docA={docA} docB={docB} pageDiffs={pageDiffs} />
              ) : (
                <TextDiffView diff={textDiff} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TextDiffView({ diff }: { diff: { lines: LineDiff[]; changedLines: number } | null }) {
  if (!diff) return null;
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
}: {
  docA: Doc;
  docB: Doc;
  pageDiffs: boolean[];
}) {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef<"l" | "r" | null>(null);
  const total = Math.max(docA.pages.length, docB.pages.length);

  // Synchronized scrolling (only when both columns visible: sm+)
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
  }, [total]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PageColumn
        scrollRef={leftScrollRef}
        label="Document A"
        doc={docA}
        totalPages={total}
        pageDiffs={pageDiffs}
      />
      <PageColumn
        scrollRef={rightScrollRef}
        label="Document B"
        doc={docB}
        totalPages={total}
        pageDiffs={pageDiffs}
      />
    </div>
  );
}

function PageColumn({
  scrollRef,
  label,
  doc,
  totalPages,
  pageDiffs,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  label: string;
  doc: Doc;
  totalPages: number;
  pageDiffs: boolean[];
}) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-3 py-2 text-sm font-medium">{label}</div>
      <div ref={scrollRef} className="max-h-[70vh] overflow-auto p-3 space-y-4">
        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const page = doc.pages[i];
          const changed = pageDiffs[i];
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
              </div>
              {page ? (
                <LazyPage doc={doc} pageNum={pageNum} width={page.width} height={page.height} />
              ) : (
                <div className="grid aspect-[3/4] place-items-center text-xs text-muted-foreground">
                  (no page {pageNum} in this document)
                </div>
              )}
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
}: {
  doc: Doc;
  pageNum: number;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setVisible(true);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || url || rendering) return;
    let cancelled = false;
    setRendering(true);
    (async () => {
      try {
        const page = await doc.getPage(pageNum);
        const vp1 = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, 800 / vp1.width);
        const vp = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
        if (!cancelled) setUrl(canvas.toDataURL("image/png"));
      } catch {
        // ignore
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();
    return () => { cancelled = true; };
  }, [visible, url, rendering, doc, pageNum]);

  const aspect = height / width;
  return (
    <div ref={ref} style={{ aspectRatio: `${width} / ${height}` }} className="relative w-full bg-slate-100">
      {url ? (
        <img src={url} alt={`Page ${pageNum}`} className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          {visible ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Rendering…
            </span>
          ) : (
            <span>Page {pageNum}</span>
          )}
        </div>
      )}
      {/* keep aspect ratio referenced */}
      <span className="hidden">{aspect}</span>
    </div>
  );
}
