import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to all tools
      </Link>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300">
          <Lock className="h-3.5 w-3.5" />
          Your files never leave your device
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
