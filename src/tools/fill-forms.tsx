import { useEffect, useState } from "react";
import { PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup, PDFOptionList } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";

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
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setFields([]); setValues({}); });

  useEffect(() => {
    const file = files[0];
    if (!file) {
      setFields([]);
      setValues({});
      return;
    }
    (async () => {
      try {
        const doc = await loadPdfLibDoc(await file.arrayBuffer());
        const form = doc.getForm();
        const defs: FieldDef[] = [];
        const initial: Record<string, string | boolean> = {};
        for (const f of form.getFields()) {
          const name = f.getName();
          if (f instanceof PDFTextField) {
            defs.push({ name, type: "text" });
            initial[name] = f.getText() ?? "";
          } else if (f instanceof PDFCheckBox) {
            defs.push({ name, type: "checkbox" });
            initial[name] = f.isChecked();
          } else if (f instanceof PDFDropdown) {
            defs.push({ name, type: "dropdown", options: f.getOptions() });
            initial[name] = f.getSelected()[0] ?? "";
          } else if (f instanceof PDFRadioGroup) {
            defs.push({ name, type: "radio", options: f.getOptions() });
            initial[name] = f.getSelected() ?? "";
          } else if (f instanceof PDFOptionList) {
            defs.push({ name, type: "options", options: f.getOptions() });
            initial[name] = f.getSelected()[0] ?? "";
          }
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
    const file = files[0];
    if (!file) return;
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
      downloadBlob(await doc.save(), `${file.name.replace(/\.pdf$/i, "")}-filled.pdf`, "application/pdf");
      toast.success("Filled PDF downloaded");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {fields.length > 0 && (
            <div className="mt-6 space-y-4 rounded-xl border bg-card p-4">
              {fields.map((f) => (
                <div key={f.name}>
                  <Label htmlFor={f.name}>{f.name}</Label>
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
                        {f.options.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}
          <ActionBar onRun={run} disabled={!files.length || !fields.length} loading={loading} label="Download Filled PDF" />
        </>
      )}
    </div>
  );
}
