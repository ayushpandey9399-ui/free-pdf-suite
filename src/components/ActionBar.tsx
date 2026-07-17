import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ActionBar({
  onRun,
  disabled,
  loading,
  progress,
  label = "Process",
  className,
}: {
  onRun: () => void;
  disabled?: boolean;
  loading?: boolean;
  progress?: number | null;
  label?: string;
  className?: string;
}) {
  return (
    <>
      {/* Desktop / inline */}
      <div className={cn("mt-8 hidden sm:block space-y-3", className)}>
        {loading && progress != null && (
          <div>
            <Progress value={progress} />
            <p className="mt-1 text-center text-xs" style={{ color: "#7a7a86" }}>
              {Math.round(progress)}%
            </p>
          </div>
        )}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onRun}
            disabled={disabled || loading}
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-[15px] font-bold uppercase text-white transition-all hover:-translate-y-0.5 hover:bg-[#c72620] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
              </>
            ) : (
              label
            )}
          </button>
        </div>
      </div>


      {/* Mobile sticky bar */}
      <div
        className={cn(
          "sm:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 py-3",
          className,
        )}
        style={{ borderColor: "#ececef", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {loading && progress != null && (
          <div className="mb-2">
            <Progress value={progress} />
          </div>
        )}
        <button
          type="button"
          onClick={onRun}
          disabled={disabled || loading}
          className="inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase text-white disabled:opacity-50"
          style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…
            </>
          ) : (
            label
          )}
        </button>
      </div>

      {/* Spacer so mobile content isn't hidden behind sticky bar */}
      <div className="sm:hidden h-24" aria-hidden />
    </>
  );
}
