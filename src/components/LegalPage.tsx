import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#14142b" }}>
        {title}
      </h1>
      {updated && (
        <p className="mt-2 text-sm" style={{ color: "#7a7a86" }}>
          Last updated: {updated}
        </p>
      )}
      <div className="mt-8 legal-prose">{children}</div>
      <style>{`
        .legal-prose { color: #2f2f3a; font-size: 16px; line-height: 1.75; }
        .legal-prose h2 { font-size: 22px; font-weight: 700; color: #14142b; margin-top: 2.25rem; margin-bottom: 0.75rem; }
        .legal-prose h3 { font-size: 17px; font-weight: 600; color: #14142b; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .legal-prose p { margin-bottom: 1rem; }
        .legal-prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .legal-prose ul li { margin-bottom: 0.4rem; }
        .legal-prose a { color: #e5322d; text-decoration: underline; }
        .legal-prose a:hover { color: #b8241f; }
        .legal-prose strong { color: #14142b; }
      `}</style>
    </div>
  );
}
