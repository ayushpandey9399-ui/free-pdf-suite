import { CheckCircle2 } from "lucide-react";

/**
 * Shared benefit-badge pill row used on every tool landing page.
 * Soft neutral pill · brand-red check · consistent everywhere.
 */
export function BenefitBadges({ items }: { items: string[] }) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {items.map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium"
          style={{
            backgroundColor: "#FAFAF9",
            border: "1px solid #EEEEEE",
            color: "#374151",
          }}
        >
          <CheckCircle2
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: "#E5322D" }}
            strokeWidth={2.25}
          />
          <span>{b}</span>
        </span>
      ))}
    </div>
  );
}
