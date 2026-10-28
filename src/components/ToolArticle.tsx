import type { ReactNode } from "react";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

/**
 * Architecture Notes
 * Why: the priority help articles share one structure (how it works, options,
 * limits, problems and fixes, FAQs, related tools). Rendering them through one
 * component keeps the layout identical, and building the FAQPage JSON-LD from
 * the same array guarantees it always matches the visible FAQs.
 */

export type ArticleFaq = { q: string; a: string };
export type ArticleItem = { term: string; text: ReactNode };
export type RelatedItem = { to: string; name: string; blurb: string };

export interface ToolArticleProps {
  toolName: string;
  howItWorks: ReactNode[];
  options: ArticleItem[];
  limits: ReactNode[];
  problems: ArticleItem[];
  faqs: ArticleFaq[];
  related: readonly RelatedItem[];
}

export function ToolArticle({ toolName, howItWorks, options, limits, problems, faqs, related }: ToolArticleProps) {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How {toolName} works</h2>
      {howItWorks.map((p, i) => (
        <p key={i} className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">{p}</p>
      ))}

      <h2>Options explained</h2>
      <dl className="mt-4 space-y-4">
        {options.map((o) => (
          <div key={o.term}>
            <dt className="text-[18px] font-bold text-[#33333c]">{o.term}</dt>
            <dd className="mt-1 text-[15px] leading-relaxed text-[#4a4a55]">{o.text}</dd>
          </div>
        ))}
      </dl>

      <h2>Limits to know about</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[#4a4a55]">
        {limits.map((l, i) => <li key={i}>{l}</li>)}
      </ul>

      <h2>Common problems and fixes</h2>
      <dl className="mt-4 space-y-4">
        {problems.map((p) => (
          <div key={p.term}>
            <dt className="text-[18px] font-bold text-[#33333c]">{p.term}</dt>
            <dd className="mt-1 text-[15px] leading-relaxed text-[#4a4a55]">{p.text}</dd>
          </div>
        ))}
      </dl>

      <h2>Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-[#ececef]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary>
              {f.q}
              <span className="ml-4 text-[#e5322d] text-xl">+</span>
            </summary>
            <div className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
              <p>{f.a}</p>
            </div>
          </details>
        ))}
      </div>

      <h2 className="text-center">Related tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export function faqJsonLd(faqs: ArticleFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function softwareJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
