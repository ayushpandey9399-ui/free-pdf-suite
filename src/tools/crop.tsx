import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { downloadBlob } from "@/lib/download";

export default function Crop() {
  const [files, setFiles] = useState<File[]>([]);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);
  const [left, setLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        const x = left;
        const y = bottom;
        const w = Math.max(1, width - left - right);
        const h = Math.max(1, height - top - bottom);
        page.setCropBox(x, y, w, h);
      }
      downloadBlob(await doc.save(), `${file.name.replace(/\.pdf$/i, "")}-cropped.pdf`, "application/pdf");
      toast.success("Cropped PDF downloaded");
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {files[0] && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-3">Margins in points (72pt = 1 inch). Applied to every page.</p>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Top", value: top, set: setTop },
              { label: "Right", value: right, set: setRight },
              { label: "Bottom", value: bottom, set: setBottom },
              { label: "Left", value: left, set: setLeft },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <Label htmlFor={label}>{label}</Label>
                <Input id={label} type="number" min={0} value={value} onChange={(e) => set(Number(e.target.value) || 0)} className="mt-1" />
              </div>
            ))}
          </div>
        </div>
      )}
      <ActionBar onRun={run} disabled={!files.length} loading={loading} label="Crop PDF" />
    </div>
  );
}
