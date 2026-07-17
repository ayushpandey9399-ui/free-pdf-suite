import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { renderPdfThumbnails } from "@/lib/thumbnail";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { X, FileText } from "lucide-react";

interface MetaSnapshot {
  title: string;
  author: string;
  subject: string;
  keywords: string; // comma-separated
  producer: string;
  creator: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
}

function fmtDate(d: Date | undefined): string {
  if (!d) return "Not set";
  try { return d.toLocaleString(); } catch { return "Not set"; }
}

export default function PdfMetadata() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumb, setThumb] = useState<string | null>(null);
  const [original, setOriginal] = useState<MetaSnapshot | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [keywords, setKeywords] = useState("");
  const [clearAll, setClearAll] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  useEffect(() => {
    const f = files[0];
    if (!f) { setOriginal(null); setThumb(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const buf = await f.arrayBuffer();
        const doc = await loadPdfLibDoc(buf.slice(0));
        const kw = doc.getKeywords();
        const snap: MetaSnapshot = {
          title: doc.getTitle() ?? "",
          author: doc.getAuthor() ?? "",
          subject: doc.getSubject() ?? "",
          keywords: Array.isArray(kw) ? kw.join(", ") : (kw ?? ""),
          producer: doc.getProducer() ?? "",
          creator: doc.getCreator() ?? "",
          creationDate: fmtDate(doc.getCreationDate()),
          modificationDate: fmtDate(doc.getModificationDate()),
          pageCount: doc.getPageCount(),
        };
        if (cancelled) return;
        setOriginal(snap);
        setTitle(snap.title); setAuthor(snap.author);
        setSubject(snap.subject); setKeywords(snap.keywords);
        setClearAll(false);
      } catch (e) {
        if (isPdfPasswordError(e)) return;
        toast.error(`Could not read metadata: ${(e as Error).message}`);
      }
      try {
        const [t] = await renderPdfThumbnails(f, 200);
        if (!cancelled) setThumb(t ?? null);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [files]);

  const dirty = useMemo(() => {
    if (!original) return false;
    if (clearAll) return true;
    return (
      title !== original.title ||
      author !== original.author ||
      subject !== original.subject ||
      keywords !== original.keywords
    );
  }, [original, clearAll, title, author, subject, keywords]);

  const resetAll = () => {
    setFiles([]); setThumb(null); setOriginal(null);
    setTitle(""); setAuthor(""); setSubject(""); setKeywords("");
    setClearAll(false); setResult(null);
  };

  const run = async () => {
    const file = files[0]; if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      if (clearAll) {
        doc.setTitle(""); doc.setAuthor(""); doc.setSubject(""); doc.setKeywords([]);
        doc.setProducer(""); doc.setCreator("");
        try {
          const { PDFName } = await import("pdf-lib");
          const info = (doc as unknown as { getInfoDict: () => { delete: (k: unknown) => void } }).getInfoDict();
          info.delete(PDFName.of("CreationDate"));
          info.delete(PDFName.of("ModDate"));
        } catch { /* dates stay if low-level API unavailable */ }
      } else {
        doc.setTitle(title);
        doc.setAuthor(author);
        doc.setSubject(subject);
        const kw = keywords.split(",").map((s) => s.trim()).filter(Boolean);
        doc.setKeywords(kw);
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({
        blob,
        filename: `${file.name.replace(/\.pdf$/i, "")}-updated.pdf`,
      });
      toast.success("Metadata saved");
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
        heading="Metadata updated!"
        subheading="Your PDF metadata has been saved."
        downloadLabel="Download PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["pdf-metadata"] ?? ["compress", "protect-pdf", "merge", "sign-pdf", "watermark", "flatten-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const disabledInputs = clearAll;

  return (
    <ToolWorkspace
      title="Edit Metadata"
      actionLabel="Save PDF"
      loadingLabel="Saving…"
      onAction={run}
      actionDisabled={!dirty}
      loading={loading}
      sidebar={
        <>
          <div>
            <Label htmlFor="md-title" className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Title</Label>
            <Input id="md-title" className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} disabled={disabledInputs} placeholder="Untitled" />
          </div>
          <div>
            <Label htmlFor="md-author" className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Author</Label>
            <Input id="md-author" className="mt-1.5" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={disabledInputs} placeholder="Unknown" />
          </div>
          <div>
            <Label htmlFor="md-subject" className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Subject</Label>
            <Input id="md-subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={disabledInputs} />
          </div>
          <div>
            <Label htmlFor="md-keywords" className="text-[13px] font-semibold" style={{ color: "#33333c" }}>Keywords</Label>
            <Input id="md-keywords" className="mt-1.5" value={keywords} onChange={(e) => setKeywords(e.target.value)} disabled={disabledInputs} placeholder="comma, separated, keywords" />
          </div>

          <div className="flex items-start gap-3 rounded-xl p-3" style={{ backgroundColor: "#f7f7f8" }}>
            <Checkbox id="md-clear" checked={clearAll} onCheckedChange={(v) => setClearAll(!!v)} className="mt-0.5" />
            <div className="min-w-0">
              <Label htmlFor="md-clear" className="text-[13.5px] font-semibold" style={{ color: "#33333c" }}>
                Clear all metadata
              </Label>
              <p className="mt-0.5 text-[12px]" style={{ color: "#7a7a86" }}>
                Blanks Title/Author/Subject/Keywords and resets Producer/Creator.
              </p>
            </div>
          </div>
        </>
      }
    >
      <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
        <div className="flex items-start gap-4">
          <div
            className="grid shrink-0 place-items-center overflow-hidden rounded-xl"
            style={{ width: 96, height: 128, backgroundColor: "#f7f7f8", border: "1px solid #ececef" }}
          >
            {thumb ? (
              <img src={thumb} alt="" className="h-full w-full object-contain" />
            ) : (
              <FileText className="h-8 w-8" style={{ color: "#c8c8ce" }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 truncate text-[16px] font-semibold" style={{ color: "#33333c" }}>{file.name}</p>
              <button
                type="button"
                onClick={resetAll}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#7a7a86] hover:bg-[#fbecec] hover:text-[#e5322d]"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "#7a7a86" }}>
              {sizeMb} MB{original ? ` · ${original.pageCount} page${original.pageCount === 1 ? "" : "s"}` : ""}
            </p>

            {original && (
              <dl className="mt-4 grid grid-cols-1 gap-y-1.5 text-[13px] sm:grid-cols-2 sm:gap-x-6">
                <MetaRow label="Created" value={original.creationDate} />
                <MetaRow label="Modified" value={original.modificationDate} />
                <MetaRow label="Producer" value={original.producer || "Not set"} />
                <MetaRow label="Creator" value={original.creator || "Not set"} />
              </dl>
            )}
          </div>
        </div>
      </div>
    </ToolWorkspace>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-0">
      <dt className="text-[12px] uppercase" style={{ color: "#7a7a86", letterSpacing: "0.06em" }}>{label}</dt>
      <dd className="truncate text-[13.5px]" style={{ color: "#33333c" }}>{value}</dd>
    </div>
  );
}
