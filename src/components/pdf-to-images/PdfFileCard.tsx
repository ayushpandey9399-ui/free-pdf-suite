import { FileText, RefreshCw, X } from "lucide-react";
import { formatBytes } from "@/lib/imageMath";

export interface PdfFileCardProps {
  file: File;
  /** Page count once it is known locally, 0 while unknown. */
  pageCount: number;
  onRemove: () => void;
  onReplace: () => void;
}

/** Selected file summary: name, size, page count, and the two ways out of it. */
export function PdfFileCard({ file, pageCount, onRemove, onReplace }: PdfFileCardProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(20,20,43,0.4)] sm:p-5 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
            style={{ background: "linear-gradient(140deg, #f2564f, #e5322d)" }}
          >
            <FileText className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-neutral-800 dark:text-neutral-100">
              {file.name}
            </p>
            <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
              {formatBytes(file.size)}
              {pageCount > 0 && ` · ${pageCount} page${pageCount === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onReplace}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-[13px] font-semibold text-neutral-600 transition-colors hover:border-[#e5322d] hover:text-[#e5322d] dark:border-neutral-700 dark:text-neutral-300"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Replace</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove file"
            className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 transition-colors hover:border-[#e5322d] hover:text-[#e5322d] dark:border-neutral-700 dark:text-neutral-300"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfFileCard;
