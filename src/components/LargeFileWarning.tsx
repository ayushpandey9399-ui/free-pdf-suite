import { AlertTriangle } from "lucide-react";

export function LargeFileWarning({
  pageCount,
  fileSize,
  extraNote,
}: {
  pageCount: number;
  fileSize: number;
  extraNote?: string;
}) {
  const mb = fileSize / (1024 * 1024);
  const isLarge = pageCount > 50 || mb > 20;
  if (!isLarge && !extraNote) return null;
  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
      <div className="space-y-1">
        {isLarge && (
          <p>
            This is a large file ({pageCount} pages / {mb.toFixed(1)} MB).
            Processing may take longer and could be slow on some devices.
            Please keep this tab open until it finishes.
          </p>
        )}
        {extraNote && <p>{extraNote}</p>}
      </div>
    </div>
  );
}
