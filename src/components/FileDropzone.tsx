import { useCallback, useRef, useState } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface FileDropzoneProps {
  accept?: string; // e.g. "application/pdf" or "image/*"
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

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={label ?? "Upload files"}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
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
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors",
          dragging
            ? "border-blue-600 bg-blue-50 dark:bg-blue-950/20"
            : "border-border hover:border-blue-500 hover:bg-muted/40",
        )}
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{label ?? "Drop files here or click to browse"}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {multiple ? "You can select multiple files" : "Select one file"} • max {maxSizeMB}MB each
          </p>
        </div>
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

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate text-sm">{f.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${f.name}`}
                onClick={() => onFilesChange(files.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </Button>
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
