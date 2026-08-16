import { useRef } from "react";
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
  /**
   * Replaces the default "Your files never leave your device" trust line.
   * Used by the one server side tool, which must not make that promise.
   */
  trustNote?: ReactNode;
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
  trustNote,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useWindowFileDrop(onFiles);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 sm:py-32">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full max-w-[340px] items-center justify-center text-white transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
        style={{
          backgroundColor: accent,
          minHeight: "64px",
          padding: "20px 52px",
          borderRadius: "8px",
          fontSize: "20px",
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: `0 12px 30px ${accent}33`,
        }}
      >
        {buttonLabel}
      </button>



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
