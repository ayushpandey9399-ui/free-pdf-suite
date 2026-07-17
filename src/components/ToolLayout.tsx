import type { ReactNode, ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import type { ToolIconProps } from "@/components/icons/ToolIcons";

export function ToolLayout({
  title,
  description,
  icon: Icon,
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

      <div className="mt-5 flex flex-col items-center text-center">
        {Icon && <Icon size={64} />}
        <h1
          className="mt-4 text-[30px] sm:text-[36px] font-bold tracking-tight"
          style={{ color: "#33333c", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p className="mt-2 max-w-[560px] text-[15px]" style={{ color: "#7a7a86" }}>
          {description}
        </p>
        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
          style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
        >
          <Lock className="h-3.5 w-3.5" />
          100% private — processed on your device
        </div>
      </div>

      <div className="mt-10">{children}</div>
    </div>
  );
}
