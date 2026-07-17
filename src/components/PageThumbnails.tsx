import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderPdfThumbnails } from "@/lib/thumbnail";

export interface PageThumbnailsProps {
  file: File;
  selected: Set<number>; // 1-indexed
  onToggle: (page: number) => void;
  selectionLabel?: (page: number, selected: boolean) => string;
}

export function PageThumbnails({ file, selected, onToggle }: PageThumbnailsProps) {
  const [thumbs, setThumbs] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setThumbs(null);
    setError(null);
    renderPdfThumbnails(file)
      .then((t) => !cancelled && setThumbs(t))
      .catch((e) => !cancelled && setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (error) return <p className="text-sm text-destructive mt-4">Failed to render: {error}</p>;
  if (!thumbs) {
    return (
      <div className="mt-6 flex items-center justify-center py-10 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Rendering pages…
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {thumbs.map((src, i) => {
        const page = i + 1;
        const isSel = selected.has(page);
        return (
          <button
            key={page}
            type="button"
            onClick={() => onToggle(page)}
            aria-pressed={isSel}
            className={cn(
              "rounded-lg border bg-card p-2 shadow-sm text-left transition-all",
              isSel ? "ring-2 ring-blue-600 border-blue-600" : "hover:border-blue-400",
            )}
          >
            <img src={src} alt={`Page ${page}`} className="w-full h-auto rounded" />
            <div className="mt-1 text-center text-xs text-muted-foreground">Page {page}</div>
          </button>
        );
      })}
    </div>
  );
}
