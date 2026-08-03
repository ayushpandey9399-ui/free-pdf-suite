import { useRef, useState } from "react";
import { FileUp, Lock, ShieldCheck } from "lucide-react";
import { DropOverlay, useWindowFileDrop } from "@/components/DropOverlay";
import { cn } from "@/lib/utils";

export interface PdfDropzoneProps {
  /** Called with the chosen or dropped file. Only the first PDF is used. */
  onFile: (file: File) => void;
  /** Human readable size limit, e.g. "25 MB". */
  maxSizeLabel: string;
}

/**
 * Large, premium upload surface for a single PDF.
 * The whole window is a drop target as well, so a file dragged anywhere lands here.
 */
export function PdfDropzone({ onFile, maxSizeLabel }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const take = (files: FileList | File[] | null): void => {
    const first = files ? Array.from(files)[0] : undefined;
    if (first) onFile(first);
  };
  const windowDragging = useWindowFileDrop(take);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer?.files ?? null);
        }}
        className={cn(
          "group relative overflow-hidden rounded-3xl border-2 border-dashed bg-white px-6 py-14 text-center transition-all duration-300 sm:px-10 sm:py-20 dark:bg-neutral-900",
          over
            ? "-translate-y-0.5 border-[#e5322d] bg-[#fff6f5] shadow-[0_24px_60px_-30px_rgba(229,50,45,0.45)] dark:bg-neutral-800"
            : "border-neutral-200 shadow-[0_12px_40px_-28px_rgba(20,20,43,0.35)] hover:border-[#f0a19e] dark:border-neutral-700",
        )}
      >
        {/* Soft brand glow, purely decorative */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-48 rounded-full opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-90"
          style={{ background: "radial-gradient(circle, rgba(229,50,45,0.20), transparent 70%)" }}
        />

        <div
          className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-105"
          style={{
            background: "linear-gradient(140deg, #f2564f, #e5322d)",
            boxShadow: "0 16px 30px -14px rgba(229,50,45,0.6)",
          }}
        >
          <FileUp className="h-8 w-8" aria-hidden />
        </div>

        <h2 className="relative mt-6 text-[22px] font-bold tracking-tight text-neutral-800 sm:text-[26px] dark:text-neutral-100">
          Upload your PDF
        </h2>
        <p className="relative mt-2 text-[15px] text-neutral-500 dark:text-neutral-400">
          Drag and drop your file here, or choose it from your device.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative mt-7 inline-flex w-full max-w-[320px] items-center justify-center rounded-xl text-[17px] font-bold text-white transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
          style={{
            background: "linear-gradient(140deg, #f2564f, #e5322d)",
            minHeight: "58px",
            padding: "18px 44px",
            boxShadow: "0 14px 32px -12px rgba(229,50,45,0.6)",
          }}
        >
          Select PDF
        </button>

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-neutral-500 dark:text-neutral-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" aria-hidden /> PDF files only
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4" aria-hidden /> Max file size {maxSizeLabel}
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            take(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <DropOverlay visible={windowDragging} accent="#e5322d" />
    </div>
  );
}

export default PdfDropzone;
