import type { ReactNode, ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ToolIconProps } from "@/components/icons/ToolIcons";

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  icon?: ComponentType<ToolIconProps>;
  tint?: { bg: string; fg: string };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors hover:text-[#e5322d]"
        style={{ color: "#7a7a86" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to all tools
      </Link>

      <div className="mt-6 text-center">
        <h1
          className="text-[30px] sm:text-[38px] font-bold tracking-tight"
          style={{ color: "#33333c", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-[560px] mx-auto text-[15px]" style={{ color: "#7a7a86" }}>
          {description}
        </p>
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
