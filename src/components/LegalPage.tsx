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
        <p className="mt-2 text-sm" style={{ color: "#5a5a66" }}>
          Last updated: {updated}
        </p>
      )}
      <div className="mt-8 legal-prose">{children}</div>
    </div>
  );
}

