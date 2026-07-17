import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  label?: string;
}

export function FileDropzone({
  accept = "application/pdf",
  multiple = false,
  files,
  onFilesChange,
  maxSizeMB = 100,
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

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? "Upload files"}
        onClick={openPicker}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPicker()}
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
          "group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-14 text-center cursor-pointer transition-all",
          dragging
            ? "border-[#e5322d] bg-[#fff6f5]"
            : "border-[#f0c9c7] bg-[#fffaf9] hover:border-[#e5322d] hover:bg-[#fff6f5]",
        )}
      >
        <div
          className="grid h-16 w-16 place-items-center rounded-2xl text-white transition-transform group-hover:-translate-y-0.5"
          style={{
            backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)",
            boxShadow: "0 14px 28px -10px rgba(229,50,45,0.5)",
          }}
        >
          <UploadCloud className="h-7 w-7" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[17px] font-bold" style={{ color: "#33333c" }}>
            {label ?? "Drag & drop your PDF here"}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "#7a7a86" }}>
            {multiple ? "or click to browse — select multiple files" : "or click to browse"} · max{" "}
            {maxSizeMB}MB
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          className="inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-[#c72620]"
          style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
        >
          Select File
        </button>
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

      <div
        className="mt-3 flex items-center justify-center gap-1.5 text-[12px]"
        style={{ color: "#1f9d55" }}
      >
        <Lock className="h-3.5 w-3.5" />
        Your files never leave your device — processed locally in your browser.
      </div>

      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
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
