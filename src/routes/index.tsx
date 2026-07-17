import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { tools, categories, type ToolCategory } from "@/tools/registry";

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
        {/* Base gradient: soft rose at edges → white in the middle */}
        <div
          aria-hidden
          className="absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(80% 70% at 50% 55%, #ffffff 0%, #ffffff 40%, #fdf2f2 100%)",
          }}
        />
        {/* Ambient blurred blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full blur-3xl opacity-70 hidden sm:block"
            style={{ background: "radial-gradient(circle, #fce7e6 0%, transparent 70%)" }}
          />
          <div
            className="absolute -top-32 -right-28 h-[480px] w-[480px] rounded-full blur-3xl opacity-70 hidden sm:block"
            style={{ background: "radial-gradient(circle, #fdede4 0%, transparent 70%)" }}
          />
          <div
            className="absolute top-40 left-1/2 -translate-x-1/2 h-[360px] w-[720px] rounded-full blur-3xl opacity-40 hidden md:block"
            style={{ background: "radial-gradient(ellipse, #fde4e2 0%, transparent 70%)" }}
          />
          {/* Soft radial spotlight behind the heading */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 40%, #ffffff 0%, #ffffff 55%, #fef6f5 100%)",
            }}
          />
        </div>

        {/* Decorative floating page cluster — desktop only */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-6 top-16 hidden xl:block animate-float-slow"
        >
          <FloatingPages />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute left-6 top-24 hidden xl:block animate-float-slow-delayed"
        >
          <FloatingPages mirrored />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-12 pb-14 sm:pt-24 sm:pb-20 lg:pt-28 lg:pb-24 text-center">
          <h1
            className="mx-auto max-w-[880px] font-bold tracking-tight text-[36px] sm:text-[52px] lg:text-[58px] leading-[1.08]"
            style={{ color: "#33333c", letterSpacing: "-0.025em" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mx-auto mt-6 max-w-[660px] text-[17px] sm:text-[19px] leading-relaxed"
            style={{ color: "#7a7a86" }}
          >
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
            Merge, split, convert, rotate, edit and more.
          </p>

          {/* Primary CTA */}
          <div className="mt-9 flex justify-center px-4 sm:px-0">
            <a
              href="#tools"
              className="group inline-flex w-full sm:w-auto items-center justify-center rounded-full px-7 py-3.5 text-[15px] font-bold text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/50"
              style={{
                backgroundColor: "#e5322d",
                boxShadow: "0 12px 28px -10px rgba(229,50,45,0.55)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c72620";
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 18px 36px -12px rgba(229,50,45,0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#e5322d";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 12px 28px -10px rgba(229,50,45,0.55)";
              }}
            >
              Get Started — It's Free
            </a>
          </div>

          {/* Small trust/stats line */}
          <p className="mt-4 text-[12.5px]" style={{ color: "#9a9aa5" }}>
            No sign-up required · No file size limits · Works on any device
          </p>

          <div
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"
            style={{
              backgroundColor: "#eafaf0",
              color: "#1f9d55",
              border: "1px solid #c9ecd6",
              boxShadow: "0 4px 14px -6px rgba(31,157,85,0.25)",
            }}
          >
            <Lock className="h-3.5 w-3.5" />
            Your files never leave your device — 100% private
          </div>


          {/* Filter pills */}
          <div
            className="mx-auto mt-16 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-4 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
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
                  className="shrink-0 min-h-[48px] rounded-full px-6 py-3 text-[16px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#33333c",
                          color: "#ffffff",
                          border: "2px solid #33333c",
                          boxShadow: "0 8px 20px -8px rgba(51,51,60,0.55)",
                        }
                      : {
                          backgroundColor: "#ffffff",
                          color: "#33333c",
                          border: "2px solid #e6e6ec",
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

      <section id="tools" className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-24">
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group block rounded-2xl bg-white p-6 sm:p-7 transition-all duration-200 hover:-translate-y-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                style={{
                  border: "1px solid #ececef",
                  minHeight: 190,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 18px 38px -14px rgba(20,20,43,0.20)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ececef";
                }}
              >
                <div className="transition-transform duration-200 group-hover:scale-[1.05] group-hover:rotate-[2deg]">
                  <Icon size={68} className="w-14 h-14 sm:w-[68px] sm:h-[68px]" />
                </div>


                <h3
                  className="mt-4 font-bold text-xl leading-snug"
                  style={{ color: "#33333c" }}
                >
                  {t.name}
                </h3>
                <p
                  className="mt-2 text-[13px] leading-relaxed"
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

function FloatingPages({ mirrored = false }: { mirrored?: boolean }) {
  const dir = mirrored ? -1 : 1;
  const pages = [
    { x: 0, y: 0, rot: -12 * dir, fill: "#ffffff", accent: "#e5322d" },
    { x: 28 * dir, y: 22, rot: 8 * dir, fill: "#fff5f4", accent: "#f28c1e" },
    { x: -18 * dir, y: 44, rot: -5 * dir, fill: "#ffffff", accent: "#4a63e7" },
  ];
  return (
    <div className="relative h-[180px] w-[190px]">
      {pages.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-[10px]"
          style={{
            left: 30 + p.x,
            top: 10 + p.y,
            width: 88,
            height: 112,
            background: p.fill,
            border: "1px solid #ececef",
            transform: `rotate(${p.rot}deg)`,
            boxShadow: "0 28px 50px -18px rgba(20,20,43,0.22), 0 10px 24px -12px rgba(20,20,43,0.14)",
          }}
        >
          <div
            className="absolute left-3 right-3 top-3 h-1.5 rounded-full"
            style={{ background: p.accent, opacity: 0.85 }}
          />
          <div className="absolute left-3 right-6 top-7 h-1 rounded-full bg-[#ececef]" />
          <div className="absolute left-3 right-10 top-10 h-1 rounded-full bg-[#ececef]" />
          <div className="absolute left-3 right-4 top-13 h-1 rounded-full bg-[#ececef]" />
        </div>
      ))}
    </div>
  );
}



