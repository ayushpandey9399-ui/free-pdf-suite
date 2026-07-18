import { useCallback, useRef, useState } from "react";
import { X, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [dragging, setDragging] = useState(false);
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
          toast.warning(`"${f.name}" is larger than ${maxSizeMB}MB — processing may be slow`);
        }
        filtered.push(f);
      }
      if (!filtered.length) return;
      onFilesChange(multiple ? [...files, ...filtered] : filtered.slice(0, 1));
    },
    [accept, files, maxSizeMB, multiple, onFilesChange],
  );

  const openPicker = () => inputRef.current?.click();

  const isPdf = accept.includes("pdf");
  const defaultBtn = buttonLabel ?? (isPdf ? (multiple ? "Select PDF files" : "Select PDF file") : label ?? "Select files");
  const defaultHint = hint ?? (isPdf ? (multiple ? "or drop PDFs here" : "or drop a PDF here") : "or drop files here");

  return (
    <div className="w-full">
      {files.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-2xl transition-colors",
            dragging ? "bg-[#fff6f5] py-6" : "bg-transparent",
          )}
        >
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center justify-center text-[15px] font-semibold text-white transition-all duration-150"
            style={{
              backgroundColor: "#e5322d",
              padding: "16px 36px",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(229,50,45,0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#c72620";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(229,50,45,0.32)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#e5322d";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(229,50,45,0.25)";
            }}
          >
            {defaultBtn}
          </button>
          <p className="mt-3 sm:mt-3.5 text-[13px]" style={{ color: "#7a7a86" }}>
            {defaultHint}
          </p>
          <span
            className="mt-4 sm:mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-medium"
            style={{
              backgroundColor: "#FAFAF9",
              border: "1px solid #EEEEEE",
              color: "#6B7280",
            }}
          >
            <Lock className="h-3 w-3" style={{ color: "#9ca3af" }} />
            100% private, processed on your device
          </span>

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
                    <p className="text-[11px]" style={{ color: "#7a7a86" }}>
                      {(f.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => onFilesChange(files.filter((_, j) => j !== i))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#7a7a86] hover:bg-[#f6f4f9] hover:text-[#e5322d]"
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
