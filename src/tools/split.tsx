import { useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { downloadBlob } from "@/lib/download";
import { parseRanges } from "@/lib/pageRange";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { loadJSZip } from "@/lib/lazyLibs";

type SplitResult =
  | { kind: "single"; blob: Blob; filename: string; count: number }
  | { kind: "zip"; blob: Blob; filename: string; count: number };

export default function Split() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"ranges" | "every">("ranges");
  const [ranges, setRanges] = useState("1-1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount } = usePdfStats(files[0]);

  const resetAll = () => { setFiles([]); setMode("ranges"); setRanges("1-1"); setResult(null); };

  const zipFiles = async (out: { name: string; data: Uint8Array }[]): Promise<Blob> => {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    for (const f of out) zip.file(f.name, f.data);
    return zip.generateAsync({ type: "blob" });
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const total = src.getPageCount();
      if (mode === "every") {
        const outFiles: { name: string; data: Uint8Array }[] = [];
        for (let i = 0; i < total; i++) {
          const { PDFDocument } = await loadPdfLib();
          const doc = await PDFDocument.create();
          const [p] = await doc.copyPages(src, [i]);
          doc.addPage(p);
          outFiles.push({ name: `page-${i + 1}.pdf`, data: await doc.save() });
        }
        const zipBlob = await zipFiles(outFiles);
        setResult({ kind: "zip", blob: zipBlob, filename: `${stripExt(file.name)}-pages.zip`, count: total });
        toast.success(`Split into ${total} files`);
      } else {
        const parsed = parseRanges(ranges, total);
        const outFiles: { name: string; data: Uint8Array }[] = [];
        for (const r of parsed) {
          const doc = await PDFDocument.create();
          const indices = [];
          for (let i = r.start - 1; i <= r.end - 1; i++) indices.push(i);
          const pages = await doc.copyPages(src, indices);
          for (const p of pages) doc.addPage(p);
          outFiles.push({ name: `${stripExt(file.name)}-${r.start}-${r.end}.pdf`, data: await doc.save() });
        }
        if (outFiles.length === 1) {
          const blob = new Blob([outFiles[0].data as BlobPart], { type: "application/pdf" });
          setResult({ kind: "single", blob, filename: outFiles[0].name, count: 1 });
        } else {
          const zipBlob = await zipFiles(outFiles);
          setResult({ kind: "zip", blob: zipBlob, filename: `${stripExt(file.name)}-split.zip`, count: outFiles.length });
        }
        toast.success(`Split into ${outFiles.length} file${outFiles.length > 1 ? "s" : ""}`);
      }
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Split failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const isZip = result.kind === "zip";
    return (
      <ToolSuccessScreen
        heading="PDF split successfully!"
        subheading={isZip ? `${result.count} files packaged into a ZIP archive.` : "Your extracted PDF is ready."}
        downloadLabel={isZip ? "Download ZIP" : "Download PDF"}
        onDownload={() => downloadBlob(result.blob, result.filename, isZip ? "application/zip" : "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS.split}
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

  const file = files[0];

  return (
    <ToolWorkspace
      title="Split PDF"
      actionLabel="Split PDF"
      loadingLabel="Splitting…"
      onAction={run}
      loading={loading}
      sidebar={
        <>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "ranges" | "every")}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ranges" id="ranges" />
              <Label htmlFor="ranges">Split by ranges</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="every" id="every" />
              <Label htmlFor="every">Every page → separate PDF</Label>
            </div>
          </RadioGroup>
          {mode === "ranges" && (
            <div>
              <Label htmlFor="range-input" className="text-sm">Page ranges</Label>
              <Input id="range-input" value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3, 5, 8-10" className="mt-1" />
            </div>
          )}
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
    </ToolWorkspace>
  );
}

function stripExt(name: string) { return name.replace(/\.pdf$/i, ""); }
