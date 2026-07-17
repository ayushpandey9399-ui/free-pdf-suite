import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { tools, categories, categoryTint, type ToolCategory } from "@/tools/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

const categoryGradient: Record<ToolCategory, string> = {
  "Organize PDF": "linear-gradient(135deg, #ff5a5f, #e5322d)",
  "Convert PDF": "linear-gradient(135deg, #ffb057, #f28c1e)",
  "Edit PDF": "linear-gradient(135deg, #8a7bff, #6d5efc)",
  "Forms & Compare": "linear-gradient(135deg, #4fd18b, #1f9d55)",
};

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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(45% 55% at 100% 0%, #fff1ec 0%, transparent 60%), radial-gradient(45% 55% at 0% 0%, #fff1ec 0%, transparent 60%), #ffffff",
          }}
        />
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-14 sm:pt-16 pb-10 text-center">
          <h1
            className="mx-auto max-w-[820px] font-bold tracking-tight text-[32px] sm:text-[44px] leading-[1.1]"
            style={{ color: "#33333c", letterSpacing: "-0.02em" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mx-auto mt-5 max-w-[660px] text-[17px] sm:text-[19px] leading-relaxed"
            style={{ color: "#7a7a86" }}
          >
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
            Merge, split, convert, rotate, edit and more.
          </p>

          <div
            className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold"
            style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
          >
            <Lock className="h-4 w-4" />
            Your files never leave your device — 100% private
          </div>

          {/* Filter pills */}
          <div
            className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Filter tools by category"
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
                  className="min-h-[40px] rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                  style={
                    isActive
                      ? { backgroundColor: "#33333c", color: "#ffffff", border: "1px solid #33333c" }
                      : { backgroundColor: "#ffffff", color: "#33333c", border: "1px solid #ececef" }
                  }
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-24">
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {visible.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group block rounded-[10px] bg-white p-[22px] transition-all duration-200 hover:-translate-y-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                style={{
                  border: "1px solid #ececef",
                  minHeight: 150,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 14px 34px -14px rgba(20,20,43,0.18)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ececef";
                }}
              >
                <div
                  className="grid h-[46px] w-[46px] place-items-center rounded-[11px] text-white"
                  style={{ backgroundImage: categoryGradient[t.category] }}
                >
                  <Icon size={24} strokeWidth={2} className="text-white" />
                </div>
                <h3
                  className="mt-4 font-bold text-[16.5px] leading-snug"
                  style={{ color: "#33333c" }}
                >
                  {t.name}
                </h3>
                <p
                  className="mt-1.5 text-[13px] leading-relaxed"
                  style={{ color: "#7a7a86" }}
                >
                  {t.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
