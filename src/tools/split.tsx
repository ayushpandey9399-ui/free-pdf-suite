import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, Download, FileText, Files, Scissors } from "lucide-react";
import { loadPdfLib, loadJSZip } from "@/lib/lazyLibs";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

type Mode = "ranges" | "every" | "select";
type RangeRow = { id: string; from: string; to: string };
type OutFile = { name: string; data: Uint8Array; label: string; pages: number };

const newRow = (from = "", to = ""): RangeRow => ({
  id: Math.random().toString(36).slice(2),
  from,
  to,
});

function stripExt(name: string) {
  return name.replace(/\.pdf$/i, "");
}

export default function Split() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<Mode>("ranges");
  const [rows, setRows] = useState<RangeRow[]>([newRow("1", "1")]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [thumbs, setThumbs] = useState<(string | null)[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loadingLabel, setLoadingLabel] = useState("Splitting your PDF...");
  const [outputs, setOutputs] = useState<OutFile[] | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const file = files[0];

  // Lazy, page-by-page thumbnail rendering (skeleton until each page lands).
  useEffect(() => {
    if (!file || protectedName) {
      setThumbs([]);
      setPageCount(0);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (cancelled) return;
        setPageCount(doc.numPages);
        setThumbs(Array.from({ length: doc.numPages }, () => null));
        setRows([newRow("1", String(doc.numPages))]);
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const vp1 = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: 180 / vp1.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(vp.width));
          canvas.height = Math.max(1, Math.floor(vp.height));
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
          if (cancelled) return;
          const url = canvas.toDataURL("image/jpeg", 0.7);
          setThumbs((prev) => {
            const next = [...prev];
            next[i - 1] = url;
            return next;
          });
        }
      } catch (e) {
        if (!cancelled && !isPdfPasswordError(e)) {
          toast.error(`Could not preview pages: ${(e as Error).message}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, protectedName]);

  const resetAll = () => {
    setFiles([]);
    setMode("ranges");
    setRows([newRow("1", "1")]);
    setSelected(new Set());
    setThumbs([]);
    setPageCount(0);
    setOutputs(null);
  };

  const toggle = (page: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });

  // ---- validation -------------------------------------------------------
  const parsedRanges = rows.map((r) => {
    const a = parseInt(r.from, 10);
    const b = parseInt(r.to, 10);
    let error: string | null = null;
    if (!r.from || !r.to || Number.isNaN(a) || Number.isNaN(b)) error = "Enter both page numbers";
    else if (a < 1 || b < 1) error = "Pages start at 1";
    else if (pageCount && (a > pageCount || b > pageCount)) error = `This PDF has only ${pageCount} pages`;
    else if (a > b) error = "From must be less than To";
    return { row: r, start: a, end: b, error, count: error ? 0 : b - a + 1 };
  });
  const rangesValid = parsedRanges.length > 0 && parsedRanges.every((r) => !r.error);

  const outputCount =
    mode === "every" ? pageCount : mode === "ranges" ? parsedRanges.length : selected.size ? 1 : 0;

  const actionLabel =
    mode === "select"
      ? `Extract ${selected.size} page${selected.size === 1 ? "" : "s"}`
      : `Split into ${outputCount} file${outputCount === 1 ? "" : "s"}`;

  const actionDisabled =
    (mode === "ranges" && !rangesValid) ||
    (mode === "select" && selected.size === 0) ||
    (mode === "every" && pageCount === 0);

  const disabledReason =
    mode === "select" && selected.size === 0
      ? "Select at least one page above"
      : mode === "ranges" && !rangesValid
        ? "Fix the page ranges to continue"
        : undefined;

  // ---- run --------------------------------------------------------------
  const run = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setLoadingLabel("Splitting your PDF...");
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const total = src.getPageCount();
      const base = stripExt(file.name);
      const out: OutFile[] = [];

      const build = async (indices: number[], name: string, label: string) => {
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(src, indices);
        for (const p of pages) doc.addPage(p);
        out.push({ name, data: await doc.save(), label, pages: indices.length });
      };

      if (mode === "every") {
        for (let i = 0; i < total; i++) {
          setLoadingLabel(`Creating ${base}-page-${i + 1}.pdf`);
          await build([i], `${base}-page-${i + 1}.pdf`, `Page ${i + 1}`);
          setProgress(((i + 1) / total) * 100);
        }
      } else if (mode === "ranges") {
        for (let i = 0; i < parsedRanges.length; i++) {
          const r = parsedRanges[i];
          const name = `${base}-${r.start}-${r.end}.pdf`;
          setLoadingLabel(`Creating ${name}`);
          const indices: number[] = [];
          for (let p = r.start - 1; p <= r.end - 1; p++) indices.push(p);
          await build(indices, name, `Pages ${r.start}-${r.end}`);
          setProgress(((i + 1) / parsedRanges.length) * 100);
        }
      } else {
        const pages = [...selected].sort((a, b) => a - b);
        setLoadingLabel(`Extracting ${pages.length} pages`);
        await build(
          pages.map((p) => p - 1),
          `${base}-extracted.pdf`,
          `Pages ${pages.join(", ")}`,
        );
        setProgress(100);
      }

      setOutputs(out);
      toast.success(`Created ${out.length} file${out.length === 1 ? "" : "s"}`);
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Split failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const downloadOne = (f: OutFile) =>
    downloadBlob(new Blob([f.data as BlobPart], { type: "application/pdf" }), f.name, "application/pdf");

  const downloadZip = async () => {
    if (!outputs) return;
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    for (const f of outputs) zip.file(f.name, f.data);
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${stripExt(file?.name ?? "document")}-split.zip`, "application/zip");
  };

  // ---- SCREEN 4: success -------------------------------------------------
  if (outputs) {
    const multi = outputs.length > 1;
    return (
      <ToolSuccessScreen
        heading="Your PDF has been split!"
        subheading={`Created ${outputs.length} file${multi ? "s" : ""} from ${pageCount} page${pageCount === 1 ? "" : "s"}.`}
        downloadLabel={multi ? "Download all as ZIP" : "Download PDF"}
        onDownload={() => (multi ? void downloadZip() : downloadOne(outputs[0]))}
        onReset={resetAll}
        resetLabel="Split another PDF"
        suggestedSlugs={TOOL_SUGGESTIONS.split ?? ["merge", "extract-pages", "delete-pages", "compress"]}
      >
        <div className="mx-auto max-w-lg space-y-2 text-left">
          {outputs.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-3 rounded-xl border border-[#ececef] bg-white p-3 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff6f5] text-[#e5322d]">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#33333c]">{f.name}</p>
                <p className="text-[12px] text-[#5a5a66]">
                  {f.label} · {f.pages} page{f.pages === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadOne(f)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ececef] px-3 py-2 text-[12px] font-bold text-[#33333c] transition-colors hover:bg-[#f7f7f8]"
              >
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </div>
          ))}
        </div>
      </ToolSuccessScreen>
    );
  }

  // ---- SCREEN 1: upload -------------------------------------------------
  if (files.length === 0) {
    return (
      <div className="-mx-4 -mt-8 mb-8 rounded-b-3xl bg-[#F7F7F8] px-4 py-12 sm:px-6 lg:px-8">
        <FileDropzone
          accept="application/pdf"
          files={files}
          onFilesChange={setFiles}
          buttonLabel="Select PDF file"
        />
      </div>
    );
  }

  if (protectedName) {
    return (
      <div className="mx-auto max-w-xl p-4">
        <div className="rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Cannot split this file</h2>
          <p className="mt-2 text-gray-600">
            The file <strong>{protectedName}</strong> is password protected. Unlock it first, then split.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              to="/tools/$slug"
              params={{ slug: "unlock-pdf" }}
              className="rounded-xl bg-[#e5322d] px-8 py-3 font-bold text-white transition-all hover:bg-[#d42d28] hover:shadow-lg"
            >
              Unlock PDF →
            </Link>
            <button
              onClick={reset}
              className="text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-gray-700"
            >
              Choose different file
            </button>
          </div>
        </div>
      </div>
    );
  }

  const TABS: { id: Mode; label: string; icon: typeof Scissors }[] = [
    { id: "ranges", label: "By Range", icon: Scissors },
    { id: "every", label: "Extract All", icon: Files },
    { id: "select", label: "Select Pages", icon: Check },
  ];

  // ---- SCREEN 2/3: workspace + processing --------------------------------
  return (
    <ToolWorkspace
      title="Split PDF"
      actionLabel={actionLabel}
      loadingLabel={loadingLabel}
      onAction={run}
      loading={loading}
      progress={progress}
      actionDisabled={actionDisabled}
      disabledReason={disabledReason}
      sidebar={
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f7f7f8] p-1">
            {TABS.map((t) => {
              const active = mode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setMode(t.id)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-[12px] font-bold transition-all",
                    active ? "bg-white text-[#e5322d] shadow-sm" : "text-[#5a5a66] hover:text-[#33333c]",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {mode === "ranges" && (
            <div className="space-y-3">
              {parsedRanges.map((r, i) => (
                <div key={r.row.id} className="rounded-xl border border-[#ececef] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-bold uppercase tracking-wider text-[#5a5a66]">
                      Range {i + 1}
                    </p>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRows((p) => p.filter((x) => x.id !== r.row.id))}
                        className="text-[12px] font-medium text-[#5a5a66] hover:text-[#e5322d]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      inputMode="numeric"
                      value={r.row.from}
                      onChange={(e) =>
                        setRows((p) =>
                          p.map((x) => (x.id === r.row.id ? { ...x, from: e.target.value.replace(/\D/g, "") } : x)),
                        )
                      }
                      placeholder="From"
                      className="h-10 w-full min-w-0 rounded-lg border border-[#ececef] px-3 text-[14px] outline-none focus:border-[#e5322d]"
                    />
                    <span className="text-[#5a5a66]">–</span>
                    <input
                      inputMode="numeric"
                      value={r.row.to}
                      onChange={(e) =>
                        setRows((p) =>
                          p.map((x) => (x.id === r.row.id ? { ...x, to: e.target.value.replace(/\D/g, "") } : x)),
                        )
                      }
                      placeholder="To"
                      className="h-10 w-full min-w-0 rounded-lg border border-[#ececef] px-3 text-[14px] outline-none focus:border-[#e5322d]"
                    />
                  </div>
                  {r.error ? (
                    <p className="mt-2 text-[12px] font-medium text-[#e5322d]">{r.error}</p>
                  ) : (
                    <p className="mt-2 text-[12px] text-[#5a5a66]">
                      Covers {r.count} page{r.count === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setRows((p) => [...p, newRow()])}
                className="w-full rounded-xl border border-dashed border-[#d7d7dc] py-2.5 text-[13px] font-bold text-[#33333c] transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
              >
                + Add range
              </button>
            </div>
          )}

          {mode === "every" && (
            <div className="rounded-xl border border-[#ececef] bg-white p-4">
              <p className="text-[14px] font-semibold text-[#33333c]">Each page becomes its own PDF file</p>
              <p className="mt-1 text-[13px] text-[#5a5a66]">
                This will create {pageCount} separate file{pageCount === 1 ? "" : "s"}, delivered as a ZIP.
              </p>
            </div>
          )}

          {mode === "select" && (
            <div className="rounded-xl border border-[#ececef] bg-white p-4">
              <p className="text-[14px] font-semibold text-[#33333c]">
                {selected.size} page{selected.size === 1 ? "" : "s"} selected
              </p>
              <p className="mt-1 text-[13px] text-[#5a5a66]">
                Click page thumbnails to pick the pages for one new PDF.
              </p>
              <div className="mt-3 flex gap-4 text-[13px] font-bold">
                <button
                  type="button"
                  onClick={() => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1)))}
                  className="text-[#e5322d] hover:underline"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-[#5a5a66] hover:underline"
                >
                  Deselect all
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={resetAll}
            className="text-[13px] font-medium text-[#5a5a66] underline underline-offset-4 hover:text-[#33333c]"
          >
            Choose different file
          </button>
        </div>
      }
    >
      <div className="rounded-2xl border border-[#ececef] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[14px] font-bold text-[#33333c]">{file.name}</p>
          <p className="text-[12px] text-[#5a5a66]">
            {pageCount || "…"} page{pageCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {(thumbs.length ? thumbs : Array.from({ length: 6 }, () => null)).map((src, i) => {
            const page = i + 1;
            const isSel = mode === "select" && selected.has(page);
            return (
              <button
                key={page}
                type="button"
                onClick={() => mode === "select" && toggle(page)}
                aria-pressed={isSel}
                className={cn(
                  "relative rounded-xl border bg-white p-1.5 text-left transition-all",
                  mode === "select" ? "cursor-pointer hover:shadow-md" : "cursor-default",
                  isSel ? "border-[#e5322d] ring-2 ring-[#e5322d]" : "border-[#ececef]",
                )}
              >
                {src ? (
                  <img src={src} alt={`Page ${page}`} className="w-full rounded-lg" />
                ) : (
                  <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-[#f0f0f2]" />
                )}
                {isSel && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#e5322d] text-white">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
                <p className="mt-1 text-center text-[11px] font-medium text-[#5a5a66]">{page}</p>
              </button>
            );
          })}
        </div>
      </div>
    </ToolWorkspace>
  );
}
