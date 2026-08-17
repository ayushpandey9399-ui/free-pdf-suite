import { useEffect, useRef, useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { renderPdfThumbnails } from "@/lib/thumbnail";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

// Sequence item: original page number (1-indexed) or a blank marker with unique id.
type Item = { kind: "page"; page: number } | { kind: "blank"; id: number };

export default function AddBlankPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<string[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [sizeMode, setSizeMode] = useState<"match" | "a4">("match");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; added: number; total: number } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setItems([]); setThumbs(null); });

  const resetAll = () => { setFiles([]); setItems([]); setThumbs(null); setResult(null); setSizeMode("match"); };

  useEffect(() => {
    const file = files[0]; if (!file) { setThumbs(null); setItems([]); return; }
    let cancelled = false;
    setThumbs(null);
    renderPdfThumbnails(file)
      .then((t) => {
        if (cancelled) return;
        setThumbs(t);
        setItems(t.map((_, i) => ({ kind: "page", page: i + 1 })));
      })
      .catch((e) => !cancelled && toast.error(`Failed to render: ${(e as Error).message}`));
    return () => { cancelled = true; };
  }, [files]);

  const blankCount = items.filter((it) => it.kind === "blank").length;
  const nextIdRef = useNextId();

  const insertAt = (index: number) => {
    setItems((prev) => {
      const copy = prev.slice();
      copy.splice(index, 0, { kind: "blank", id: nextIdRef() });
      return copy;
    });
  };

  const removeBlank = (id: number) => {
    setItems((prev) => prev.filter((it) => !(it.kind === "blank" && it.id === id)));
  };

  const addAtEnd = () => insertAt(items.length);

  const addAfterEvery = () => {
    const pageIndices = items
      .map((it, i) => (it.kind === "page" ? i : -1))
      .filter((i) => i !== -1);
    if (pageIndices.length > 50 && !confirm(`This will add ${pageIndices.length} blank pages. Continue?`)) return;
    setItems((prev) => {
      const out: Item[] = [];
      prev.forEach((it) => {
        out.push(it);
        if (it.kind === "page") out.push({ kind: "blank", id: nextIdRef() });
      });
      return out;
    });
  };

  const resetBlanks = () => {
    setItems((prev) => prev.filter((it) => it.kind === "page"));
  };

  const run = async () => {
    const file = files[0]; if (!file || !blankCount) return;
    setLoading(true);
    try {
      const { PageSizes } = await loadPdfLib();
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const totalOriginal = doc.getPageCount();

      // Compute insertion instructions in the FINAL sequence order.
      // For each blank item, its final index equals its position in `items`.
      // Determine size at insertion time: match previous page (or next if at index 0).
      const A4: [number, number] = [PageSizes.A4[0], PageSizes.A4[1]];

      // Precompute page sizes from source (original indices)
      const origSizes: Array<[number, number]> = doc.getPages().map((p) => {
        const { width, height } = p.getSize();
        return [width, height];
      });

      // Build a working list of sizes matching current items (page → its size, blank → placeholder).
      const currentSizes: Array<[number, number] | null> = items.map((it) =>
        it.kind === "page" ? origSizes[it.page - 1] ?? A4 : null,
      );

      // Walk items and insert into pdf-lib doc at final indices.
      // Since we know the target indices in the FINAL layout, and the source doc's
      // page ordering is unchanged (we only ADD pages), we can iterate items in order
      // and call insertPage at each blank's index. Original pages stay at their
      // original positions relative to each other; pdf-lib insertPage shifts later.
      // However, pdf-lib pages are indexed in their current state, so inserting
      // at the target index works as long as we walk left-to-right and every
      // preceding non-blank page in `items` already exists at that position.
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind !== "blank") continue;
        let size: [number, number];
        if (sizeMode === "a4") size = A4;
        else {
          // Find nearest previous non-blank size, else next.
          let prev: [number, number] | null = null;
          for (let j = i - 1; j >= 0; j--) if (currentSizes[j]) { prev = currentSizes[j] as [number, number]; break; }
          if (!prev) for (let j = i + 1; j < items.length; j++) if (currentSizes[j]) { prev = currentSizes[j] as [number, number]; break; }
          size = prev ?? A4;
        }
        doc.insertPage(i, size);
        currentSizes[i] = size;
      }

      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const total = totalOriginal + blankCount;
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-with-blanks.pdf`, added: blankCount, total });
      toast.success(`Added ${blankCount} blank page(s)`);
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
        heading="Blank pages added!"
        subheading={`${result.added} blank page${result.added === 1 ? "" : "s"} added, ${result.total} pages total.`}
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["add-blank-pages"] ?? TOOL_SUGGESTIONS["reorder-pages"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  return (
    <ToolWorkspace
      title="Add Blank Pages to PDF Online"
      description="Insert empty pages anywhere in your PDF — before, after, or between existing pages. Free, private, and instant. No upload, no signup, no watermark."
      loadingLabel="Inserting blank pages…"
      onAction={run}
      actionDisabled={!blankCount}
      loading={loading}
      sidebar={
        <>
          <div
            className="rounded-lg p-3 text-[13px]"
            style={{ backgroundColor: "#fbf6f5", color: "#33333c" }}
          >
            <p className="font-semibold">{blankCount} blank page{blankCount === 1 ? "" : "s"} will be added</p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#5a5a66" }}>{files[0].name}</p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={addAtEnd}
              className="w-full rounded-md border-2 px-3 py-2 text-sm font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
              style={{ borderColor: "#ececef", color: "#4a4a55" }}
            >
              + Add blank page at end
            </button>
            <button
              type="button"
              onClick={addAfterEvery}
              className="w-full rounded-md border-2 px-3 py-2 text-sm font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
              style={{ borderColor: "#ececef", color: "#4a4a55" }}
            >
              + Add blank page after every page
            </button>
            {blankCount > 0 && (
              <button
                type="button"
                onClick={resetBlanks}
                className="text-xs font-medium underline"
                style={{ color: "#5a5a66" }}
              >
                Reset, remove all pending blank pages
              </button>
            )}
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wide" style={{ color: "#5a5a66" }}>Blank page size</Label>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {([
                ["match", "Match previous"],
                ["a4", "A4"],
              ] as const).map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSizeMode(k)}
                  className={cn(
                    "rounded-md border-2 py-2 text-[11px] font-semibold transition-colors",
                    sizeMode === k ? "border-[#e5322d] bg-[#fbecec] text-[#e5322d]" : "border-[#ececef] text-[#5a5a66] hover:border-[#c8c8d0]",
                  )}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </>
      }
    >
      {!thumbs ? (
        <div className="mt-6 flex items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering pages…
        </div>
      ) : (
        <PageInsertGrid items={items} thumbs={thumbs} onInsert={insertAt} onRemoveBlank={removeBlank} />
      )}
    </ToolWorkspace>
  );
}

// ---- helpers ----

function useNextId() {
  const ref = useRef(1);
  return () => ref.current++;
}

function PageInsertGrid({
  items,
  thumbs,
  onInsert,
  onRemoveBlank,
}: {
  items: Item[];
  thumbs: string[];
  onInsert: (index: number) => void;
  onRemoveBlank: (id: number) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((it, i) => {
        const finalPos = i + 1;
        return (
          <div key={it.kind === "page" ? `p-${it.page}` : `b-${it.id}`} className="group relative">
            <InsertSlot side="left" onClick={() => onInsert(i)} />
            {it.kind === "page" ? (
              <div className="rounded-lg border bg-card p-2 shadow-sm" style={{ borderColor: "#ececef" }}>
                <img src={thumbs[it.page - 1]} alt={`Page ${it.page}`} className="h-auto w-full rounded" />
                <div className="mt-1 text-center text-xs text-muted-foreground">Page {finalPos}</div>
              </div>
            ) : (
              <div
                className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-2 shadow-sm"
                style={{ borderColor: "#e5322d", background: "#fff" }}
              >
                <div className="flex aspect-[3/4] w-full items-center justify-center rounded bg-[#fbf6f5] text-xs font-semibold uppercase tracking-wide" style={{ color: "#e5322d" }}>
                  Blank
                </div>
                <div className="mt-1 text-center text-xs text-muted-foreground">Page {finalPos}</div>
                <button
                  type="button"
                  onClick={() => onRemoveBlank(it.id)}
                  aria-label="Remove blank page"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e5322d] text-white shadow"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {i === items.length - 1 && <InsertSlot side="right" onClick={() => onInsert(i + 1)} />}
          </div>
        );
      })}
    </div>
  );
}

function InsertSlot({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Insert blank page here"
      className={cn(
        "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#e5322d] shadow transition-opacity",
        "border-2 border-[#e5322d]",
        "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100",
        side === "left" ? "-left-4" : "-right-4",
      )}
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
