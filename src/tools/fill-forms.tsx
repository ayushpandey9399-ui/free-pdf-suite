import { useEffect, useState } from "react";
import { PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

interface FieldDef {
  name: string;
  type: "text" | "checkbox" | "dropdown" | "radio" | "options";
  options?: string[];
}

export default function FillForms() {
  const [files, setFiles] = useState<File[]>([]);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setFields([]); setValues({}); });

  const resetAll = () => { setFiles([]); setFields([]); setValues({}); setResult(null); };

  useEffect(() => {
    const file = files[0];
    if (!file) { setFields([]); setValues({}); return; }
    (async () => {
      try {
        const doc = await loadPdfLibDoc(await file.arrayBuffer());
        const form = doc.getForm();
        const defs: FieldDef[] = [];
        const initial: Record<string, string | boolean> = {};
        for (const f of form.getFields()) {
          const name = f.getName();
          if (f instanceof PDFTextField) { defs.push({ name, type: "text" }); initial[name] = f.getText() ?? ""; }
          else if (f instanceof PDFCheckBox) { defs.push({ name, type: "checkbox" }); initial[name] = f.isChecked(); }
          else if (f instanceof PDFDropdown) { defs.push({ name, type: "dropdown", options: f.getOptions() }); initial[name] = f.getSelected()[0] ?? ""; }
          else if (f instanceof PDFRadioGroup) { defs.push({ name, type: "radio", options: f.getOptions() }); initial[name] = f.getSelected() ?? ""; }
          else if (f instanceof PDFOptionList) { defs.push({ name, type: "options", options: f.getOptions() }); initial[name] = f.getSelected()[0] ?? ""; }
        }
        setFields(defs);
        setValues(initial);
        if (!defs.length) toast.warning("No form fields found in this PDF");
      } catch (e) {
        if (!isPdfPasswordError(e)) toast.error(`Failed to read form: ${(e as Error).message}`);
      }
    })();
  }, [files]);

  const run = async () => {
    const file = files[0]; if (!file) return;
    setLoading(true);
    try {
      const doc = await loadPdfLibDoc(await file.arrayBuffer());
      const form = doc.getForm();
      for (const def of fields) {
        const v = values[def.name];
        const field = form.getField(def.name);
        if (field instanceof PDFTextField) field.setText(String(v ?? ""));
        else if (field instanceof PDFCheckBox) v ? field.check() : field.uncheck();
        else if (field instanceof PDFDropdown && v) field.select(String(v));
        else if (field instanceof PDFRadioGroup && v) field.select(String(v));
        else if (field instanceof PDFOptionList && v) field.select(String(v));
      }
      const bytes = await doc.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-filled.pdf` });
      toast.success("Form filled");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally { setLoading(false); }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Form filled successfully!"
        subheading="Your completed PDF is ready to download."
        downloadLabel="Download Filled PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["fill-forms"]}
      />
    );
  }

  if (files.length === 0) {
    return <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />;
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  return (
    <ToolWorkspace
      title="Fill forms"
      actionLabel="Download Filled PDF"
      loadingLabel="Filling form…"
      onAction={run}
      actionDisabled={!fields.length}
      loading={loading}
      sidebar={
        <>
          <InfoTip>
            {fields.length
              ? `${fields.length} field${fields.length === 1 ? "" : "s"} detected. Fill them in and export the completed PDF.`
              : "This PDF doesn't contain any interactive form fields."}
          </InfoTip>
        </>
      }
    >
      <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #ececef" }}>
        {fields.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No fillable form fields found in this PDF.</p>
        ) : (
          <div className="space-y-5">
            {fields.map((f) => (
              <div key={f.name}>
                <Label htmlFor={f.name} className="font-medium">{f.name}</Label>
                {f.type === "text" && (
                  <Input
                    id={f.name}
                    value={String(values[f.name] ?? "")}
                    onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                    className="mt-1"
                  />
                )}
                {f.type === "checkbox" && (
                  <div className="mt-2">
                    <Checkbox
                      id={f.name}
                      checked={!!values[f.name]}
                      onCheckedChange={(v) => setValues({ ...values, [f.name]: !!v })}
                    />
                  </div>
                )}
                {(f.type === "dropdown" || f.type === "radio" || f.type === "options") && f.options && (
                  <Select value={String(values[f.name] ?? "")} onValueChange={(v) => setValues({ ...values, [f.name]: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {f.options.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolWorkspace>
  );
}
