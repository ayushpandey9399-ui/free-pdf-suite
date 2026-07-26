import { useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PageThumbnails } from "@/components/PageThumbnails";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function Rotate() {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [allPages, setAllPages] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setSelected(new Set()); });
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]); setSelected(new Set()); setAngle(90); setAllPages(true); setResult(null);
  };
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
      const { degrees } = await loadPdfLib();
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const pages = src.getPages();
      pages.forEach((page, i) => {
        if (allPages || selected.has(i + 1)) {
          const current = page.getRotation().angle;
          page.setRotation(degrees((current + angle) % 360));
        }
      });
      const bytes = await src.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-rotated.pdf` });
      toast.success("PDF rotated");
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
        heading="Your PDF has been rotated!"
        subheading={allPages ? "All pages rotated." : `${selected.size} page(s) rotated.`}
        downloadLabel="Download Rotated PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS.rotate}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        files={files}
        onFilesChange={(fs) => { setFiles(fs); setSelected(new Set()); }}
        buttonLabel="Select PDF file"
      />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];

  return (
    <ToolWorkspace
      title="Rotate PDF"
      actionLabel="Rotate PDF"
      loadingLabel="Rotating…"
      onAction={run}
      actionDisabled={!allPages && !selected.size}
      loading={loading}
      sidebar={
        <>
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
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={allPages} onCheckedChange={(v) => setAllPages(!!v)} />
            <span>Rotate all pages</span>
          </label>
          {!allPages && (
            <InfoTip>Click page thumbnails to select which pages to rotate ({selected.size} selected).</InfoTip>
          )}
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
        </>
      }
    >
      {allPages ? (
        <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
      ) : (
        <PageThumbnails file={file} selected={selected} onToggle={toggle} />
      )}
    </ToolWorkspace>
  );
}
