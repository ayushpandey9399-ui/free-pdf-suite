import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { tools, categories, type ToolCategory } from "@/tools/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

type Filter = "All" | ToolCategory;
const filters: Filter[] = ["All", ...categories];

function Home() {
  const [active, setActive] = useState<Filter>("All");

  const visible = useMemo(
    () => (active === "All" ? tools : tools.filter((t) => t.category === active)),
    [active],
  );

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#33333c" }}>
      {/* Subtle blush wash across the whole page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, #ffffff 55%, rgba(229,50,45,0.035) 100%)",
        }}
      />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 pb-6 text-center">
          <h1
            className="mx-auto max-w-[900px] font-bold tracking-tight text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.1]"
            style={{ color: "#1c1c26", letterSpacing: "-0.025em" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mx-auto mt-3 max-w-[720px] text-[16px] sm:text-[17px] leading-relaxed"
            style={{ color: "#6b6b78" }}
          >
            28 free tools to merge, split, convert, edit and sign PDFs — right in your browser. 100% free, no signup, files never leave your device.
          </p>

          {/* Filter pills */}
          <div
            className="mx-auto mt-8 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
            role="tablist"
            aria-label="Filter tools by category"
            style={{ scrollbarWidth: "none" }}
          >
            {filters.map((f) => {
              const isActive = f === active;
              return (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(f)}
                  className="shrink-0 rounded-full text-[15px] font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f2937]/30"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: isActive ? "#1f2937" : "#ffffff",
                    color: isActive ? "#ffffff" : "#1c1c26",
                    border: `1px solid ${isActive ? "#1f2937" : "#e5e7eb"}`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tool cards grid */}
      <section id="tools" className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-2 pb-12">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
          {visible.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group flex h-full flex-col rounded-lg bg-white p-5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                style={{
                  border: "1px solid #ececef",
                  boxShadow: "0 1px 2px rgba(20,20,43,0.03)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4d4dc";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px -8px rgba(20,20,43,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#ececef";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,20,43,0.03)";
                }}
              >
                <Icon size={44} />
                <h3
                  className="mt-4 font-semibold text-[17px] leading-tight truncate"
                  style={{ color: "#1c1c26" }}
                >
                  {t.name}
                </h3>
                <p
                  className="mt-1.5 text-[13px] leading-[1.5]"
                  style={{ color: "#6b6b78" }}
                >
                  {t.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <div
        className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-16 text-center text-[13px]"
        style={{ color: "#7a7a86" }}
      >
        All 28 tools. All free. All private. Files never leave your device.
      </div>
    </div>
  );
}
