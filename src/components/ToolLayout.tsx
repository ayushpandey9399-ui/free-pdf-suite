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
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <section
        className="relative flex flex-col md:min-h-[50vh] pt-12 md:pt-6 pb-14"
      >
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors hover:text-[#e5322d] md:absolute md:top-6 md:left-0"
          style={{ color: "#7a7a86" }}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to all tools
        </Link>

        <div className="flex flex-1 flex-col justify-center text-center mt-8 md:mt-0">
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{
              color: "#383E45",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
          <p
            className="mx-auto mt-4 max-w-[640px] text-[15px] sm:text-[18px]"
            style={{ color: "#6B7280", lineHeight: 1.65, textWrap: "balance", textWrapStyle: "balance" } as React.CSSProperties}
          >
            {description}
          </p>

          <div className="mt-10">{children}</div>
        </div>
      </section>
    </div>
  );
}
