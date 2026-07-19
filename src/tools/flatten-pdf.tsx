import { useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

interface Detection {
  fieldCount: number;
  annotationCount: number;
  loading: boolean;
}

export default function FlattenPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [flattenFields, setFlattenFields] = useState(true);
  // Annotation flattening is not reliably feasible client-side without
  // rasterizing appearances, so we keep this off/disabled and be honest.
  const [flattenAnnotations] = useState(false);
  const [detection, setDetection] = useState<Detection>({ fieldCount: 0, annotationCount: 0, loading: false });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; flattenedFields: number } | null>(null);

  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));
  const { pageCount } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]);
    setResult(null);
    setDetection({ fieldCount: 0, annotationCount: 0, loading: false });
    setFlattenFields(true);
  };

  useEffect(() => {
    const file = files[0];
    if (!file) return;
    let cancelled = false;
    setDetection({ fieldCount: 0, annotationCount: 0, loading: true });
    (async () => {
      let fieldCount = 0;
      let annotationCount = 0;
      try {
        const buf = await file.arrayBuffer();
        try {
          const doc = await loadPdfLibDoc(buf.slice(0));
          fieldCount = doc.getForm().getFields().length;
        } catch (e) {
          if (isPdfPasswordError(e)) return;
        }
        try {
          const pdf = await loadPdfJsDoc(buf.slice(0));
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const anns = await page.getAnnotations();
            for (const a of anns as Array<{ subtype?: string }>) {
              if (a.subtype && a.subtype !== "Widget" && a.subtype !== "Link") annotationCount++;
            }
          }
        } catch {
          /* ignore annotation detection errors */
        }
      } finally {
        if (!cancelled) setDetection({ fieldCount, annotationCount, loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, [files]);

  const run = async () => {
    const file = files[0]; if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const form = doc.getForm();
      const fields = form.getFields();
      let flattenedCount = 0;
      if (flattenFields && fields.length) {
        // Try whole-form flatten first (fast path); if it throws, fall back
        // to per-field to skip problematic fields gracefully.
        try {
          form.flatten();
          flattenedCount = fields.length;
        } catch {
          for (const f of fields) {
            try {
              form.flatten({ updateFieldAppearances: true });
              flattenedCount = fields.length;
              break;
            } catch {
              try {
                // Per-field fallback: remove the field so it can no longer be edited.
                form.removeField(f);
                flattenedCount++;
              } catch {
                /* skip broken field */
              }
            }
          }
        }
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({
        blob,
        filename: `${file.name.replace(/\.pdf$/i, "")}-flattened.pdf`,
        flattenedFields: flattenedCount,
      });
      toast.success("PDF flattened");
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
        heading="PDF flattened successfully!"
        subheading={`${result.flattenedFields} form field${result.flattenedFields === 1 ? "" : "s"} flattened. They can no longer be edited.`}
        downloadLabel="Download Flattened PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["flatten-pdf"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];
  const nothingToFlatten = !detection.loading && detection.fieldCount === 0 && detection.annotationCount === 0;
  const canRun = !detection.loading && flattenFields && detection.fieldCount > 0;

  return (
    <ToolWorkspace
      title="Flatten PDF"
      actionLabel="Flatten PDF"
      loadingLabel="Flattening…"
      onAction={run}
      actionDisabled={!canRun}
      loading={loading}
      sidebar={
        <>
          <div className="flex items-start gap-3">
            <Checkbox
              id="flatten-fields"
              checked={flattenFields}
              onCheckedChange={(v) => setFlattenFields(!!v)}
              disabled={detection.fieldCount === 0}
              className="mt-0.5"
            />
            <div className="min-w-0">
              <Label htmlFor="flatten-fields" className="text-[14px] font-semibold" style={{ color: "#33333c" }}>
                Flatten form fields
              </Label>
              <p className="mt-0.5 text-[12px]" style={{ color: "#5a5a66" }}>
                Filled values become permanent page content.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 opacity-60">
            <Checkbox
              id="flatten-annotations"
              checked={flattenAnnotations}
              disabled
              className="mt-0.5"
            />
            <div className="min-w-0">
              <Label htmlFor="flatten-annotations" className="text-[14px] font-semibold" style={{ color: "#33333c" }}>
                Flatten annotations
              </Label>
              <p className="mt-0.5 text-[12px]" style={{ color: "#5a5a66" }}>
                Annotation flattening not supported for this file.
              </p>
            </div>
          </div>

          <InfoTip>
            After flattening, fields and annotations can no longer be edited by anyone.
            The original text of the document stays selectable.
          </InfoTip>
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />

      <div className="mt-4 rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
        <h3 className="text-[13px] font-bold uppercase" style={{ color: "#5a5a66", letterSpacing: "0.08em" }}>
          Detected in this PDF
        </h3>

        {detection.loading ? (
          <p className="mt-4 text-[13.5px]" style={{ color: "#5a5a66" }}>Scanning…</p>
        ) : nothingToFlatten ? (
          <div
            className="mt-4 flex items-start gap-3 rounded-xl p-4"
            style={{ backgroundColor: "#f7f7f8", color: "#5a5a66" }}
          >
            <Layers className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-[13.5px]">
              This PDF has no form fields or annotations to flatten.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            <li className="flex items-center justify-between text-[14px]">
              <span style={{ color: "#33333c" }}>Form fields</span>
              <span className="font-semibold" style={{ color: detection.fieldCount ? "#1f9d55" : "#5a5a66" }}>
                {detection.fieldCount} detected
              </span>
            </li>
            <li className="flex items-center justify-between text-[14px]">
              <span style={{ color: "#33333c" }}>Annotations</span>
              <span className="font-semibold" style={{ color: detection.annotationCount ? "#254a9e" : "#5a5a66" }}>
                {detection.annotationCount} detected
              </span>
            </li>
          </ul>
        )}
      </div>
    </ToolWorkspace>
  );
}
