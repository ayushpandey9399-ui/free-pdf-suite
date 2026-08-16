import { useRef } from "react";
import { DropOverlay, useWindowFileDrop } from "@/components/DropOverlay";

export interface UploadDropzoneProps {
  /** File input accept string. */
  accept: string;
  /** Allow selecting several files at once. */
  multiple?: boolean;
  /** Tool specific primary label, e.g. "Select HEIC files". */
  buttonLabel: string;
  /** Called with the picked or dropped files. */
  onFiles: (files: FileList | File[]) => void;
  /** Brand accent for the button and drag state, defaults to brand red. */
  accent?: string;
}


/**
 * Premium empty state: a single prominent button inside a dashed dropzone box.
 * The drop target is the whole page, shown through a full area overlay.
 */
export function UploadDropzone({
  accept,
  multiple = false,
  buttonLabel,
  onFiles,
  accent = "#e5322d",
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useWindowFileDrop(onFiles);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 sm:py-32">
      <div
        className="flex flex-col items-center justify-center px-5 py-10 sm:px-20 sm:py-15"
        style={{
          border: "2px dashed #D1D5DB",
          borderRadius: "16px",
          background: "white",
          minWidth: "320px",
          maxWidth: "100%",
        }}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            backgroundColor: accent,
            minWidth: "280px",
            padding: "18px 60px",
            borderRadius: "10px",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: 1,
            boxShadow: `0 12px 30px ${accent}33`,
          }}
        >
          {buttonLabel}
        </button>
      </div>

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
