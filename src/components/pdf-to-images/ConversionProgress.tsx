import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stages of one conversion, in the order the backend performs them.
 * Only stages that a real event confirms are ever marked done: nothing here is on a timer.
 */
export const CONVERSION_STAGES = [
  { key: "uploading", label: "Uploading PDF" },
  { key: "workspace", label: "Preparing workspace" },
  { key: "converting", label: "Converting pages" },
  { key: "images", label: "Generating images" },
  { key: "zip", label: "Creating ZIP" },
  { key: "download", label: "Preparing download" },
  { key: "done", label: "Completed" },
] as const;

export type ConversionStageKey = (typeof CONVERSION_STAGES)[number]["key"];

export interface ConversionProgressProps {
  /** Stage currently in flight. */
  stage: ConversionStageKey;
  /** Real transfer progress for the active stage, or null when the server gives no percentage. */
  percent: number | null;
}

function stageIndex(key: ConversionStageKey): number {
  return CONVERSION_STAGES.findIndex((s) => s.key === key);
}

/** Premium progress screen: a determinate bar when we have real numbers, a sweep when we do not. */
export function ConversionProgress({ stage, percent }: ConversionProgressProps) {
  const active = stageIndex(stage);
  const current = CONVERSION_STAGES[active];
  const indeterminate = percent === null;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(20,20,43,0.5)] sm:p-9 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="text-center">
          <div
            className="mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white"
            style={{ background: "linear-gradient(140deg, #f2564f, #e5322d)" }}
          >
            <Loader2 className="h-7 w-7 animate-spin" aria-hidden />
          </div>
          <h2 className="mt-5 text-[22px] font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            {current?.label ?? "Working"}
          </h2>
          <p className="mt-2 text-[14px] text-neutral-500 dark:text-neutral-400">
            Please keep this tab open while we finish your images.
          </p>
        </div>

        {/* Progress bar */}
        <div
          className="mt-7 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={current?.label ?? "Progress"}
        >
          {indeterminate ? (
            <div
              className="h-full w-1/3 rounded-full"
              style={{
                background: "linear-gradient(90deg, #f2564f, #e5322d)",
                animation: "p2i-sweep 1.4s ease-in-out infinite",
              }}
            />
          ) : (
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${Math.max(2, Math.min(100, percent))}%`,
                background: "linear-gradient(90deg, #f2564f, #e5322d)",
              }}
            />
          )}
        </div>
        {!indeterminate && (
          <p className="mt-2 text-center text-[12px] font-semibold text-neutral-500 dark:text-neutral-400">
            {Math.round(percent)}%
          </p>
        )}

        {/* Stage checklist */}
        <ul className="mt-7 space-y-2.5">
          {CONVERSION_STAGES.map((s, i) => {
            const done = i < active;
            const isActive = i === active;
            return (
              <li
                key={s.key}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors duration-300",
                  isActive
                    ? "bg-[#fff6f5] font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                    : done
                      ? "text-neutral-600 dark:text-neutral-300"
                      : "text-neutral-400 dark:text-neutral-500",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                    done
                      ? "border-transparent bg-[#1f9d55] text-white"
                      : isActive
                        ? "border-[#e5322d] text-[#e5322d]"
                        : "border-neutral-200 dark:border-neutral-700",
                  )}
                >
                  {done ? (
                    <Check className="h-3 w-3" aria-hidden />
                  ) : isActive ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e5322d]" />
                  ) : null}
                </span>
                {s.label}
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`@keyframes p2i-sweep{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}

export default ConversionProgress;
