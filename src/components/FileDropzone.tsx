import { useCallback, useRef } from "react";
import { X, FileText } from "lucide-react";
import { toast } from "sonner";
import { DropOverlay, useWindowFileDrop } from "@/components/DropOverlay";


export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  /** Button label for the empty state, e.g. "Select PDF files". */
  buttonLabel?: string;
  /** Small hint text under the button, e.g. "or drop PDFs here". */
  hint?: string;
  /** Skip the built-in selected-file list (when the tool renders its own list/thumbnails). */
  hideList?: boolean;
  /** Legacy: previously rendered as heading in dashed box; kept for back-compat. */
  label?: string;
}

export function FileDropzone({
  accept = "application/pdf",
  multiple = false,
  files,
  onFilesChange,
  maxSizeMB = 100,
  buttonLabel,
  hint,
  hideList,
  label,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const filtered: File[] = [];
      for (const f of list) {
        if (accept && !matchesAccept(f, accept)) {
          toast.error(`"${f.name}" is not an accepted file type`);
          continue;
        }
        if (f.size > maxSizeMB * 1024 * 1024) {
          toast.warning(`"${f.name}" is larger than ${maxSizeMB}MB, processing may be slow`);
        }
        filtered.push(f);
      }
      if (!filtered.length) return;
      onFilesChange(multiple ? [...files, ...filtered] : filtered.slice(0, 1));
    },
    [accept, files, maxSizeMB, multiple, onFilesChange],
  );

  const dragging = useWindowFileDrop(addFiles, files.length === 0);

  const openPicker = () => inputRef.current?.click();

  const isPdf = accept.includes("pdf");
  const defaultBtn = buttonLabel ?? (isPdf ? (multiple ? "Select PDF files" : "Select PDF file") : label ?? "Select files");
  const defaultHint = hint ?? (isPdf ? (multiple ? "or drop PDFs here" : "or drop a PDF here") : "or drop files here");

  return (
    <div className="w-full">
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-20">
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex w-full max-w-[340px] items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
            style={{
              backgroundColor: "#e5322d",
              minHeight: "56px",
              padding: "18px 40px",
              borderRadius: "12px",
              fontSize: "17px",
              fontWeight: 700,
              lineHeight: 1,
              boxShadow: "0 10px 26px rgba(229,50,45,0.24)",
            }}
          >
            {defaultBtn}
          </button>
          <p className="mt-4 text-center text-[14px]" style={{ color: "#6B7280" }}>
            {defaultHint}
          </p>
          <p
            className="mt-5 inline-flex items-center gap-1.5 text-[13px]"
            style={{ color: "#8b8b96" }}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Your files never leave your device.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <DropOverlay visible={dragging} />
        </div>
      )}




      {files.length > 0 && !hideList && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <ul className="space-y-2">
            {files.map((f, i) => (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5"
                style={{ border: "1px solid #ececef" }}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: "#fdeceb", color: "#e5322d" }}
                  >
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "#33333c" }}>
                      {f.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "#5a5a66" }}>
                      {(f.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onFilesChange(files.filter((_, j) => j !== i))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5a5a66] hover:bg-[#f6f4f9] hover:text-[#e5322d]"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {multiple && (
            <div className="mt-3">
              <button
                type="button"
                onClick={openPicker}
                className="text-[13px] font-semibold text-[#e5322d] hover:underline"
              >
                + Add more files
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function matchesAccept(file: File, accept: string): boolean {
  const types = accept.split(",").map((s) => s.trim().toLowerCase());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return types.some((t) => {
    if (t.startsWith(".")) return name.endsWith(t);
    if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
}
