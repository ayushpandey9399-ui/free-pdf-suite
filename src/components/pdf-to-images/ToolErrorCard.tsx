import { Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";

export interface ToolErrorCardProps {
  /** Friendly, already mapped message. Raw backend text must never reach this prop. */
  message: string;
  /** Optional second line with a concrete next step. */
  hint?: string;
  onRetry: () => void;
  retryLabel?: string;
  /** Shows a link to the Unlock PDF tool for password protected files. */
  offerUnlock?: boolean;
}

/** Error state for a server side tool: one clear sentence, one clear way forward. */
export function ToolErrorCard({
  message,
  hint,
  onRetry,
  retryLabel = "Try again",
  offerUnlock,
}: ToolErrorCardProps) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-in">
      <div className="rounded-3xl border border-[#f5d3d1] bg-white p-6 text-center shadow-[0_20px_60px_-40px_rgba(229,50,45,0.5)] sm:p-9 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fdeceb] dark:bg-neutral-800">
          <AlertTriangle className="h-7 w-7 text-[#e5322d]" aria-hidden />
        </div>
        <h2 className="mt-5 text-[20px] font-bold tracking-tight text-neutral-800 sm:text-[22px] dark:text-neutral-100">
          {message}
        </h2>
        {hint && (
          <p className="mt-2 text-[14px] text-neutral-500 dark:text-neutral-400">{hint}</p>
        )}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5 sm:w-auto"
            style={{
              background: "linear-gradient(140deg, #f2564f, #e5322d)",
              boxShadow: "0 14px 30px -14px rgba(229,50,45,0.6)",
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {retryLabel}
          </button>
          {offerUnlock && (
            <Link
              to="/tools/$slug"
              params={{ slug: "unlock-pdf" }}
              className="text-[14px] font-semibold text-[#e5322d] underline-offset-4 hover:underline"
            >
              Remove the password first
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToolErrorCard;
