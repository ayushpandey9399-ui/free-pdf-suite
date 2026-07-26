import { useRef } from "react";
import { Lock } from "lucide-react";
import { DropOverlay, useWindowFileDrop } from "@/components/DropOverlay";

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
 * Frameless empty state: one big button, one helper line, one trust line.
 * The drop target is the whole page, shown through a full area overlay.
 */
export function UploadDropzone({
  accept,
  multiple = false,
  buttonLabel,
  hint,
  onFiles,
  accent = "#e5322d",
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useWindowFileDrop(onFiles);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-20">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full max-w-[340px] items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
        style={{
          backgroundColor: accent,
          minHeight: "56px",
          padding: "18px 40px",
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
        className="mt-5 inline-flex items-center gap-1.5 text-center text-[13px]"
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

      <DropOverlay visible={dragging} accent={accent} />
    </div>
  );
}

export default UploadDropzone;
