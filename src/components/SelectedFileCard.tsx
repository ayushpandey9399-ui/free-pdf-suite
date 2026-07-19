import { FileText, X } from "lucide-react";

export interface SelectedFileCardProps {
  file: File;
  pageCount?: number;
  onRemove?: () => void;
  extra?: React.ReactNode;
}

/** Simple left-panel card summarizing the selected file, for tools that
 * don't have a natural visual preview area (watermark, page-numbers,
 * split, images-to-pdf, etc). */
export function SelectedFileCard({ file, pageCount, onRemove, extra }: SelectedFileCardProps) {
  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  return (
    <div
      className="flex items-center gap-4 rounded-2xl bg-white p-5"
      style={{ border: "1px solid #ececef" }}
    >
      <div
        className="grid h-14 w-14 shrink-0 place-items-center rounded-xl text-white"
        style={{ backgroundColor: "#e5322d" }}
      >
        <FileText className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold" style={{ color: "#33333c" }}>
          {file.name}
        </p>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "#5a5a66" }}>
          {sizeMb} MB{pageCount ? ` · ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}
        </p>
        {extra}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#5a5a66] transition-colors hover:bg-[#fbecec] hover:text-[#e5322d]"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
