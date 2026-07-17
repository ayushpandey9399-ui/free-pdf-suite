import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { downloadBlob, downloadZip } from "@/lib/download";
import { parseRanges } from "@/lib/pageRange";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";

export default function Split() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<"ranges" | "every">("ranges");
  const [ranges, setRanges] = useState("1-1");
  const [loading, setLoading] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

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
          const doc = await PDFDocument.create();
          const [p] = await doc.copyPages(src, [i]);
          doc.addPage(p);
          outFiles.push({ name: `page-${i + 1}.pdf`, data: await doc.save() });
        }
        await downloadZip(outFiles, `${stripExt(file.name)}-pages.zip`);
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
          downloadBlob(outFiles[0].data, outFiles[0].name, "application/pdf");
        } else {
          await downloadZip(outFiles, `${stripExt(file.name)}-split.zip`);
        }
        toast.success(`Split into ${outFiles.length} file${outFiles.length > 1 ? "s" : ""}`);
      }
    } catch (e) {
      if (isPdfPasswordError(e)) {
        toast.error("PDF is password-protected");
      } else {
        toast.error(`Split failed: ${(e as Error).message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : files.length > 0 && (
        <div className="mt-6 space-y-4 rounded-xl border bg-card p-4">
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as "ranges" | "every")}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ranges" id="ranges" />
              <Label htmlFor="ranges">Split by ranges</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="every" id="every" />
              <Label htmlFor="every">Every page → separate PDF (ZIP)</Label>
            </div>
          </RadioGroup>
          {mode === "ranges" && (
            <div>
              <Label htmlFor="range-input" className="text-sm">
                Page ranges (e.g. 1-3, 5, 8-10)
              </Label>
              <Input id="range-input" value={ranges} onChange={(e) => setRanges(e.target.value)} className="mt-1" />
            </div>
          )}
        </div>
      )}
      <ActionBar onRun={run} disabled={!files.length} loading={loading} label="Split PDF" />
    </div>
  );
}

function stripExt(name: string) {
  return name.replace(/\.pdf$/i, "");
}
