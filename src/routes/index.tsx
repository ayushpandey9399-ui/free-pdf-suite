import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Lock } from "lucide-react";
import { tools, categories, categoryTint } from "@/tools/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <div style={{ backgroundColor: "#fbfbfd", color: "#33333c" }}>
      {/* Hero */}
      <section className="px-4 pt-16 pb-10 sm:pt-24 sm:pb-14">
        <div className="mx-auto max-w-[900px] text-center">
          <h1
            className="font-bold tracking-tight text-[34px] sm:text-[42px] leading-[1.1]"
            style={{ color: "#33333c" }}
          >
            Every tool you need to work with PDFs in one place
          </h1>
          <p
            className="mt-5 text-[17px] sm:text-[19px] leading-relaxed"
            style={{ color: "#7a7a86" }}
          >
            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use!
            Merge, split, compress, convert, rotate, unlock and more.
          </p>

          <div className="mt-6 flex justify-center">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
              style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
            >
              <Lock className="h-3.5 w-3.5" />
              Your files never leave your device — 100% private
            </span>
          </div>

          <div className="mt-8 mx-auto max-w-[520px] relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "#7a7a86" }}
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a tool (e.g. merge, split, rotate)..."
              aria-label="Search PDF tools"
              className="w-full h-12 rounded-xl border bg-white pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-[#e5322d] focus:ring-2 focus:ring-[#e5322d]/20"
              style={{ borderColor: "#ececef", color: "#33333c" }}
            />
          </div>
        </div>
      </section>

      {/* Tool grid */}
      <section id="tools" className="mx-auto max-w-[1180px] px-4 sm:px-6 pb-16">
        {categories.map((cat) => {
          const items = filtered.filter((t) => t.category === cat);
          if (!items.length) return null;
          const tint = categoryTint[cat];
          return (
            <div key={cat} className="mb-12">
              <h2
                className="text-[13px] font-bold tracking-[0.12em] mb-5"
                style={{ color: "#7a7a86" }}
              >
                {cat.toUpperCase()}
              </h2>
              <div className="grid gap-[18px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.slug}
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="group block rounded-xl border bg-white p-[22px] transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(51,51,60,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                      style={{ borderColor: "#ececef" }}
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-[10px]"
                        style={{ backgroundColor: tint.bg, color: tint.fg }}
                      >
                        <Icon className="h-[22px] w-[22px]" />
                      </div>
                      <h3
                        className="mt-4 font-bold text-[17px] leading-snug"
                        style={{ color: "#33333c" }}
                      >
                        {t.name}
                      </h3>
                      <p
                        className="mt-1.5 text-[13.5px] leading-relaxed"
                        style={{ color: "#7a7a86" }}
                      >
                        {t.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-[15px]" style={{ color: "#7a7a86" }}>
            No tools match your search.
          </div>
        )}
      </section>
    </div>
  );
}
