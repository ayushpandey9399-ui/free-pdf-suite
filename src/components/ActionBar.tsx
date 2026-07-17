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
  const isDisabled = disabled || loading;

  // Hide the primary action entirely until there's something to act on.
  // The user selects files first; the action button then appears alongside the file list.
  if (disabled && !loading) return null;

  const baseBtn =
    "inline-flex items-center justify-center rounded-xl px-8 py-4 text-[15px] font-bold uppercase text-white transition-all duration-150";
  const activeBtn =
    "shadow-[0_6px_20px_-6px_rgba(229,50,45,0.55)] hover:scale-[1.02] hover:shadow-[0_10px_28px_-8px_rgba(199,38,32,0.65)]";
  const disabledBtn = "cursor-not-allowed";

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
            disabled={isDisabled}
            className={cn(baseBtn, isDisabled ? disabledBtn : activeBtn)}
            style={{
              backgroundColor: isDisabled && !loading ? "#d7d7dc" : "#e5322d",
              color: isDisabled && !loading ? "#8a8a93" : "#ffffff",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) e.currentTarget.style.backgroundColor = "#c72620";
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) e.currentTarget.style.backgroundColor = "#e5322d";
            }}
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
        style={{
          borderColor: "#ececef",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        {loading && progress != null && (
          <div className="mb-2">
            <Progress value={progress} />
          </div>
        )}
        <button
          type="button"
          onClick={onRun}
          disabled={isDisabled}
          className={cn(
            "inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase text-white",
            isDisabled && "cursor-not-allowed",
          )}
          style={{
            backgroundColor: isDisabled && !loading ? "#d7d7dc" : "#e5322d",
            color: isDisabled && !loading ? "#8a8a93" : "#ffffff",
            letterSpacing: "0.04em",
          }}
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
