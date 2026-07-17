import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { tools, categories, type ToolCategory } from "@/tools/registry";
import mergeIconImg from "@/assets/tool-icons/merge.png";

export const Route = createFileRoute("/")({
  component: Home,
});

const categoryGradient: Record<ToolCategory, string> = {
  "Organize PDF": "linear-gradient(135deg, #ff5a5f, #e5322d)",
  "Convert PDF": "linear-gradient(135deg, #ffb057, #f28c1e)",
  "Edit PDF": "linear-gradient(135deg, #8a7bff, #6d5efc)",
  "Forms & Compare": "linear-gradient(135deg, #4fd18b, #1f9d55)",
  "Security": "linear-gradient(135deg, #ff5a5f, #c72620)",
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

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16 text-center">
          <h1
            className="mx-auto max-w-[880px] font-bold tracking-tight text-[36px] sm:text-[52px] lg:text-[58px] leading-[1.08]"
            style={{ color: "#33333c", letterSpacing: "-0.025em" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mx-auto mt-5 max-w-[620px] text-[17px] sm:text-[19px] leading-relaxed"
            style={{ color: "#7a7a86" }}
          >
            28 free tools to merge, split, convert, edit and sign PDFs — right in your browser.
          </p>

          {/* Trust badges */}
          <ul
            className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium"
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
            className="mx-auto mt-9 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
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
                  className="shrink-0 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#e5322d",
                          color: "#ffffff",
                          border: "2px solid #e5322d",
                          boxShadow: "0 8px 20px -8px rgba(229,50,45,0.55)",
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
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group flex h-full flex-col rounded-2xl bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                style={{
                  border: "1px solid #ececef",
                  minHeight: 200,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 18px 38px -14px rgba(20,20,43,0.20)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ececef";
                }}
              >
                {t.slug === "merge" ? (
                  <div
                    className="inline-flex items-center justify-center rounded-2xl transition-[filter] duration-200 group-hover:brightness-95"
                    style={{ width: 64, height: 64, backgroundColor: "#FDECEB" }}
                  >
                    <img
                      src={mergeIconImg}
                      alt="Merge PDF"
                      width={52}
                      height={52}
                      loading="eager"
                      decoding="async"
                      style={{ width: 52, height: 52, display: "block" }}
                    />
                  </div>
                ) : (
                  <Icon size={64} />
                )}

                <h3
                  className="mt-5 font-semibold text-lg leading-snug"
                  style={{ color: "#33333c" }}
                >
                  {t.name}
                </h3>
                <p
                  className="mt-1.5 text-[13.5px] leading-relaxed line-clamp-2"
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



