import type { ReactNode, ComponentType, CSSProperties } from "react";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { prefetchPdfLibs } from "@/lib/lazyLibs";
import type { ToolIconProps } from "@/components/icons/ToolIcons";

export function ToolLayout({
  title,
  description,
  crumbName,
  children,
}: {
  title: string;
  description: string;
  crumbName?: string;
  icon?: ComponentType<ToolIconProps>;
  tint?: { bg: string; fg: string };
  children: ReactNode;
}) {
  // Warm the heavy PDF chunks once the page is interactive, so the first real
  // action feels instant without blocking first paint.
  useEffect(() => {
    prefetchPdfLibs();
  }, []);

  return (
    <div className="w-full">
      <div className="bg-[#F7F7F8] w-full overflow-hidden">
        <section className="mx-auto max-w-4xl px-4 relative flex flex-col pt-6 pb-20 sm:pb-28">


        <nav
          aria-label="Breadcrumb"
          className="text-[13px] leading-normal pb-[3px]"
          style={{ color: "#6B7280" }}
        >
          <ol className="flex items-center gap-[6px] whitespace-nowrap overflow-hidden">
            <li className="shrink-0">
              <Link to="/" className="transition-colors hover:text-[#e5322d]">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="shrink-0">
              ›
            </li>
            <li className="shrink-0">
              <Link to="/tools" className="transition-colors hover:text-[#e5322d]">
                PDF Tools
              </Link>
            </li>
            <li aria-hidden="true" className="shrink-0">
              ›
            </li>

            <li
              aria-current="page"
              className="min-w-0 overflow-x-hidden text-ellipsis"
              style={{ color: "#4B5563" }}
            >
              {crumbName ?? title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-1 flex-col justify-center text-center mt-8 md:mt-0">
          <h1 className="tool-title">
            {title}
          </h1>

          <div className="mt-10">{children}</div>
        </div>


        </section>
      </div>
    </div>
  );
}

