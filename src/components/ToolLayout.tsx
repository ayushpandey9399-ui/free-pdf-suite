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
    <div className="mx-auto max-w-4xl px-4 pt-6 pb-16">
      <Link
        to="/"
        className="group inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-[#e5322d]"
        style={{ color: "#7a7a86" }}
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
        Back to all tools
      </Link>

      <div className="mt-6 sm:mt-8 text-center">
        <h1
          className="mx-auto max-w-[640px] text-[26px] sm:text-[36px] font-extrabold"
          style={{
            color: "#171717",
            letterSpacing: "-0.025em",
            lineHeight: 1.25,
            textWrap: "balance",
          }}
        >
          {title}
        </h1>
        <p
          className="mx-auto mt-3.5 sm:mt-5 max-w-[560px] text-[15px] sm:text-[17px]"
          style={{ color: "#6B7280", lineHeight: 1.6 }}
        >
          {description}
        </p>
      </div>

      <div className="mt-9 sm:mt-12">{children}</div>
    </div>

  );
}
