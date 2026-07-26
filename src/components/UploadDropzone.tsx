import { useCallback, useRef, useState } from "react";
import { Lock } from "lucide-react";

export interface UploadDropzoneProps {
  /** File input accept string. */
  accept: string;
  /** Allow selecting several files at once. */
  multiple?: boolean;
  /** Tool specific primary label, e.g. "Select HEIC files". */
  buttonLabel: string;
  /** Small helper line under the button, e.g. "or drop .heic / .heif photos here". */
  hint: string;
  /** Called with the picked or dropped files. */
  onFiles: (files: FileList | File[]) => void;
  /** Brand accent for the button and drag state, defaults to brand red. */
  accent?: string;
}

/**
 * Clean, confident empty state for every upload area: one big button,
 * one helper line, one trust line. Nothing else.
 */
export function UploadDropzone({
  accept,
  multiple = false,
  buttonLabel,
  hint,
  onFiles,
  accent = "#e5322d",
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tint = `${accent}0f`;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="flex flex-col items-center justify-center px-5 py-10 sm:px-10 sm:py-14 transition-colors duration-150"
      style={{
        border: `2px dashed ${dragging ? accent : "#e8e8ee"}`,
        borderRadius: "16px",
        backgroundColor: dragging ? tint : "#fff",
      }}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full max-w-[320px] items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
        style={{
          backgroundColor: accent,
          padding: "20px 40px",
          borderRadius: "12px",
          fontSize: "17px",
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: `0 10px 26px ${accent}3d`,
        }}
      >
        {buttonLabel}
      </button>

      <p className="mt-4 text-center text-[14px]" style={{ color: "#6B7280" }}>
        {hint}
      </p>

      <p
        className="mt-6 inline-flex items-center gap-1.5 text-center text-[13px]"
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
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export default UploadDropzone;
