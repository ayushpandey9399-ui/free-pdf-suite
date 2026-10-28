import { Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

/**
 * Architecture Notes
 * Why: a single, server-rendered "Limits" note shared by PDF and image tool
 * pages, so the wording and look stay consistent. Content comes from
 * src/lib/toolLimits.ts; renders nothing when a tool has no relevant limits.
 */
export function ToolLimits({ points }: { points: string[] }) {
  if (points.length === 0) return null;
  return (
    <aside
      aria-label="Limits"
      className="mx-auto mt-6 flex max-w-3xl gap-2.5 rounded-lg border border-border bg-muted/50 p-3 text-left text-[13px] text-muted-foreground"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        <strong className="text-foreground">Limits: </strong>
        {points.map((p, i) => (
          <span key={i}>
            {i > 0 && " "}
            {p.includes("Unlock PDF") ? (
              <>
                If a PDF is password-protected, use{" "}
                <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="font-semibold text-foreground underline">
                  Unlock PDF
                </Link>{" "}
                first.
              </>
            ) : (
              p
            )}
          </span>
        ))}
      </div>
    </aside>
  );
}
