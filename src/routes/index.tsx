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
      {/* Compact Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 50% 40%, #ffffff 0%, #ffffff 55%, #fdf2f2 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 pb-4 sm:pt-10 sm:pb-5 text-center">
          <h1
            className="mx-auto max-w-[820px] font-bold tracking-tight text-[26px] sm:text-[32px] lg:text-[36px] leading-[1.15]"
            style={{ color: "#33333c", letterSpacing: "-0.02em" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mx-auto mt-2 max-w-[560px] text-[14px] sm:text-[15px]"
            style={{ color: "#7a7a86" }}
          >
            28 free tools to merge, split, convert, edit and sign PDFs — right in your browser.
          </p>

          <ul
            className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] font-medium"
            style={{ color: "#5a5a66" }}
          >
            {["100% free", "No signup", "Files never leave your device"].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "#e5322d" }}
                />
                {t}
              </li>
            ))}
          </ul>

          {/* Filter pills */}
          <div
            className="mx-auto mt-4 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
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
                  className="shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#e5322d",
                          color: "#ffffff",
                          border: "1.5px solid #e5322d",
                        }
                      : {
                          backgroundColor: "#ffffff",
                          color: "#33333c",
                          border: "1.5px solid #e6e6ec",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#f4f4f7";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "#ffffff";
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dense tool grid */}
      <section id="tools" className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-10 pt-2">
        {grouped.map(({ cat, items }, gi) => (
          <div key={cat} className={gi === 0 ? "" : "mt-8"}>
            {active === "All" && (
              <p
                className="mb-3 px-1 text-[12px] font-bold uppercase"
                style={{ color: "#9a9aa5", letterSpacing: "0.09em" }}
              >
                {cat}
              </p>
            )}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.slug}
                    to="/tools/$slug"
                    params={{ slug: t.slug }}
                    className="group flex h-full flex-col rounded-xl bg-white p-4 transition-all duration-150 hover:-translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                    style={{ border: "1px solid #ececef" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 10px 24px -12px rgba(20,20,43,0.18)";
                      e.currentTarget.style.borderColor = "#e0e0e6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#ececef";
                    }}
                  >
                    <Icon size={40} />
                    <h3
                      className="mt-3 font-semibold text-[15px] leading-snug"
                      style={{ color: "#33333c" }}
                    >
                      {t.name}
                    </h3>
                    <p
                      className="mt-1 text-[13px] leading-snug line-clamp-2"
                      style={{ color: "#7a7a86" }}
                    >
                      {t.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div
        className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-16 text-center text-[13px]"
        style={{ color: "#7a7a86" }}
      >
        All 28 tools. All free. All private. Files never leave your device.
      </div>
    </div>
  );
}
