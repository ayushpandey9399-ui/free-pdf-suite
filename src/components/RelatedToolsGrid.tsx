import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { toolIcons, toolAccent } from "@/components/icons/ToolIcons";

export interface RelatedToolItem {
  to: string;
  /** Optional route params, e.g. { slug: "split" } when `to` is "/tools/$slug". */
  params?: { slug?: string };
  name: string;
  blurb: string;
}

function slugFromTo(to: string): string {
  const m = to.match(/\/tools\/([^/?#]+)/);
  return m ? m[1] : "";
}

export function RelatedToolsGrid({ items }: { items: readonly RelatedToolItem[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {items.map((r) => {
        // Resolve "/tools/$slug" + params into a real path so links, keys and icons all work.
        const href = r.params?.slug ? r.to.replace("$slug", r.params.slug) : r.to;
        const slug = slugFromTo(href);
        const Icon = toolIcons[slug];
        const accent = toolAccent[slug] ?? "#e5322d";
        return (
          <Link
            key={href}
            to={href}
            className="group flex items-center gap-4 rounded-lg border border-[#eee] p-5 transition-all duration-[180ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
            style={{ "--accent": accent } as CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "";
            }}
          >
            {Icon ? (
              <div className="shrink-0 transition-transform duration-[180ms] ease-out group-hover:scale-[1.05]" aria-hidden="true" title={`${r.name} tool`}>
                <Icon size={40} />
              </div>
            ) : null}
            <div className="min-w-0">
              <div className="font-semibold text-[15px] text-[#33333c]">{r.name}</div>
              <div className="mt-1 text-[13.5px] leading-snug text-[#5a5a66]">{r.blurb}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
