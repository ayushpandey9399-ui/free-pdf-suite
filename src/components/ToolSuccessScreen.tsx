import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Lock, RotateCcw } from "lucide-react";
import { getTool } from "@/tools/registry";

export interface ToolSuccessScreenProps {
  heading: string;
  subheading?: string;
  /** Primary download button. Omit for tools with no downloadable output (e.g. Compare). */
  downloadLabel?: string;
  onDownload?: () => void;
  /** Optional secondary button (e.g. "Copy text"). */
  secondaryAction?: { label: string; icon?: ReactNode; onClick: () => void };
  onReset: () => void;
  resetLabel?: string;
  suggestedSlugs: string[];
  /** Extra content rendered between the download row and the trust badge (e.g. text preview). */
  children?: ReactNode;
}

export function ToolSuccessScreen({
  heading,
  subheading,
  downloadLabel,
  onDownload,
  secondaryAction,
  onReset,
  resetLabel = "Start Over",
  suggestedSlugs,
  children,
}: ToolSuccessScreenProps) {
  const suggestions = suggestedSlugs
    .map((slug) => getTool(slug))
    .filter((t): t is NonNullable<ReturnType<typeof getTool>> => !!t);

  return (
    <div className="space-y-10">
      {/* Success header */}
      <div className="rounded-2xl border bg-white px-6 py-10 text-center" style={{ borderColor: "#ececef" }}>
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "#eafaf0" }}
        >
          <CheckCircle2 className="h-7 w-7" style={{ color: "#1f9d55" }} />
        </div>
        <h2
          className="mt-4 text-[24px] sm:text-[28px] font-bold tracking-tight"
          style={{ color: "#33333c", letterSpacing: "-0.01em" }}
        >
          {heading}
        </h2>
        {subheading && (
          <p className="mt-2 text-[15px]" style={{ color: "#7a7a86" }}>
            {subheading}
          </p>
        )}

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {downloadLabel && onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-bold uppercase text-white transition-all hover:-translate-y-0.5 hover:bg-[#c72620] sm:w-auto"
              style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
            >
              <Download className="h-4 w-4" />
              {downloadLabel}
            </button>
          )}
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-[14px] font-semibold transition-colors hover:bg-[#f7f7f8] sm:w-auto"
              style={{ borderColor: "#ececef", color: "#33333c" }}
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-[#e5322d]"
          style={{ color: "#7a7a86" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resetLabel}
        </button>
      </div>

      {children}

      {/* Continue to… */}
      {suggestions.length > 0 && (
        <div>
          <h3
            className="text-[13px] font-bold uppercase"
            style={{ color: "#7a7a86", letterSpacing: "0.08em" }}
          >
            Continue to…
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {suggestions.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="group flex items-center gap-3 rounded-xl border bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[#e5322d]"
                  style={{ borderColor: "#ececef" }}
                >
                  <Icon size={40} />
                  <span
                    className="text-[13.5px] font-semibold leading-tight"
                    style={{ color: "#33333c" }}
                  >
                    {tool.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Trust badge */}
      <div
        className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold"
        style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
      >
        <Lock className="h-4 w-4" />
        Your files were processed 100% locally on your device, never uploaded anywhere.
      </div>
    </div>
  );
}
