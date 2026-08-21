import type { ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface ToolWorkspaceProps {
  /** Sidebar heading (tool name). */
  title: string;
  /** Left panel content (thumbnails, previews, grids, etc). */
  children: ReactNode;
  /** Sidebar controls rendered above the primary action. */
  sidebar?: ReactNode;
  /** Primary action label. */
  actionLabel?: string;
  /** Called when the primary action button is clicked. */
  onAction?: () => void;
  actionDisabled?: boolean;
  /** Shown as a small centered hint under the disabled button. */
  disabledReason?: string;
  loading?: boolean;
  loadingLabel?: string;
  /** Optional progress 0-100 shown above the action button while loading. */
  progress?: number | null;
  /** Hide the primary action button entirely (e.g. Compare has no single "process" step). */
  hideAction?: boolean;
  /** Optional extra button rendered inline above the primary action (in sidebar). */
  extraSidebarButton?: ReactNode;
}

/** Breakout wrapper: escape the max-w-4xl parent and re-cap at 1100px, centered. */
export const WORKSPACE_CONTAINER_CLASS =
  "lg:w-[min(1100px,calc(100vw-2rem))] lg:relative lg:left-1/2 lg:-translate-x-1/2";

/** Two-column workspace grid: thumbnails ~2/3, sidebar ~1/3. */
export const WORKSPACE_GRID_CLASS =
  "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]";

export function ToolWorkspace({
  title,
  children,
  sidebar,
  actionLabel,
  onAction,
  actionDisabled,
  disabledReason,
  loading,
  loadingLabel,
  progress,
  hideAction,
  extraSidebarButton,
}: ToolWorkspaceProps) {
  const canRun = !actionDisabled && !loading;
  const showHint = !!disabledReason && actionDisabled && !loading;

  return (
    <div className={WORKSPACE_CONTAINER_CLASS}>
      <div className={WORKSPACE_GRID_CLASS}>
        {/* LEFT panel */}
        <div className="min-w-0">{children}</div>

        {/* RIGHT sidebar (desktop) */}
        <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)]">
          <div
            className="flex h-full flex-col rounded-2xl bg-white p-5"
            style={{
              border: "1px solid #ececef",
              boxShadow: "0 1px 2px rgba(20,20,43,0.04)",
              minHeight: "clamp(320px, 60vh, 560px)",
            }}
          >
            <h2 className="text-[18px] font-bold" style={{ color: "#33333c" }}>
              {title}
            </h2>
            <div className="mt-3 h-px w-full shrink-0" style={{ backgroundColor: "#ececef" }} />

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
              {sidebar}
            </div>

            {extraSidebarButton}

            {!hideAction && (
              <>
                {loading && progress != null && (
                  <div className="mt-4">
                    <Progress value={progress} />
                    <p className="mt-1 text-center text-[11px]" style={{ color: "#5a5a66" }}>
                      {Math.round(progress)}%
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onAction}
                  disabled={!canRun}
                  className={cn(
                    "mt-6 hidden lg:inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-xl px-6 text-[16px] font-bold uppercase transition-all duration-150",
                    canRun && "hover:scale-[1.01]",
                    !canRun && "cursor-not-allowed",
                  )}
                  style={{
                    backgroundColor: canRun ? "#e5322d" : "#d7d7dc",
                    color: canRun ? "#ffffff" : "#8a8a93",
                    letterSpacing: "0.04em",
                    boxShadow: canRun ? "0 10px 24px -8px rgba(229,50,45,0.55)" : "none",
                  }}
                  onMouseEnter={(e) => canRun && (e.currentTarget.style.backgroundColor = "#c72620")}
                  onMouseLeave={(e) => canRun && (e.currentTarget.style.backgroundColor = "#e5322d")}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {loadingLabel ?? "Processing…"}
                    </>
                  ) : (
                    <>
                      {actionLabel ?? "Continue"} <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
                {showHint && (
                  <p
                    className="mt-2 hidden lg:block text-center text-[13px]"
                    style={{ color: "#9CA3AF" }}
                  >
                    {disabledReason}
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      {!hideAction && (
        <>
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 py-3"
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
              onClick={onAction}
              disabled={!canRun}
              className={cn(
                "inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-xl px-6 text-[16px] font-bold uppercase",
                !canRun && "cursor-not-allowed",
              )}
              style={{
                backgroundColor: canRun ? "#e5322d" : "#d7d7dc",
                color: canRun ? "#ffffff" : "#8a8a93",
                letterSpacing: "0.04em",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {loadingLabel ?? "Processing…"}
                </>
              ) : (
                <>
                  {actionLabel ?? "Continue"} <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            {disabledReason && (
              <p className="mt-2 text-center text-[13px]" style={{ color: "#9CA3AF" }}>
                {disabledReason}
              </p>
            )}
          </div>
          <div className="lg:hidden h-24" aria-hidden />
        </>
      )}
    </div>
  );
}

/** Small blue info-tip block for use inside a ToolWorkspace sidebar. */
export function InfoTip({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex gap-2.5 rounded-lg p-3 text-[13px]"
      style={{ backgroundColor: "#eef4ff", color: "#254a9e" }}
    >
      <svg
        className="mt-0.5 h-4 w-4 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      <div>{children}</div>
    </div>
  );
}
