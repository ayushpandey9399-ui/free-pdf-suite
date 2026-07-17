import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShieldCheck, Zap, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { tools, categories } from "@/tools/registry";

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
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/30 dark:via-background dark:to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-white/70 dark:bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 mb-6">
            <ShieldCheck className="h-3.5 w-3.5" />
            Files processed in your browser — never uploaded
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Every PDF tool you need —{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              100% Free, Forever
            </span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-muted-foreground">
            Merge, split, convert, edit, and organize PDFs directly in your browser. No signup, no
            uploads, no limits.
          </p>

          <div className="mt-8 max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tools (e.g. merge, split, watermark)"
              className="pl-10 h-12 text-base"
              aria-label="Search tools"
            />
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Privacy-first
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-600" /> Instant results
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-blue-600" /> Truly free
            </span>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        {categories.map((cat) => {
          const items = filtered.filter((t) => t.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-12">
              <h2 className="text-xl font-semibold mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.slug}
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-500 transition-all"
                    >
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-semibold">{t.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No tools match "{q}". Try a different search.
          </div>
        )}
      </section>
    </div>
  );
}
