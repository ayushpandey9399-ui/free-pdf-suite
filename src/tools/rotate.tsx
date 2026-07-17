import { useState } from "react";
import { degrees } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { PageThumbnails } from "@/components/PageThumbnails";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";

export default function Rotate() {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [allPages, setAllPages] = useState(true);
  const [loading, setLoading] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setSelected(new Set()); });

  const toggle = (p: number) => {
    const s = new Set(selected);
    s.has(p) ? s.delete(p) : s.add(p);
    setSelected(s);
  };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const pages = src.getPages();
      pages.forEach((page, i) => {
        if (allPages || selected.has(i + 1)) {
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + angle) % 360));
        }
      });
      downloadBlob(await src.save(), `${file.name.replace(/\.pdf$/i, "")}-rotated.pdf`, "application/pdf");
      toast.success("Rotated PDF downloaded");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={(fs) => { setFiles(fs); setSelected(new Set()); }} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files[0] && (
            <div className="mt-6 space-y-4 rounded-xl border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Rotation</Label>
                  <Select value={String(angle)} onValueChange={(v) => setAngle(Number(v) as never)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90° clockwise</SelectItem>
                      <SelectItem value="180">180°</SelectItem>
                      <SelectItem value="270">270° (90° CCW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <Checkbox checked={allPages} onCheckedChange={(v) => setAllPages(!!v)} />
                  <span className="text-sm">Rotate all pages</span>
                </label>
              </div>
            </div>
          )}
          {files[0] && !allPages && (
            <>
              <p className="mt-6 text-sm text-muted-foreground">Select pages to rotate ({selected.size} selected).</p>
              <PageThumbnails file={files[0]} selected={selected} onToggle={toggle} />
            </>
          )}
          <ActionBar onRun={run} disabled={!files.length || (!allPages && !selected.size)} loading={loading} label="Rotate PDF" />
        </>
      )}
    </div>
  );
}
