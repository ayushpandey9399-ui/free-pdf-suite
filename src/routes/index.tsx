import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { tools, categories, type ToolCategory } from "@/tools/registry";
import { HomeBottom } from "@/components/HomeBottom";
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from "@/lib/site";

const HOME_TITLE = "FreePDFHub — Every PDF tool, 100% free";
const HOME_DESC =
  "Free PDF tools that run in your browser. Merge, split, convert, compress, edit, and organize PDFs — no signup, no upload step, no limits.";
const HOME_URL = `${SITE_URL}/`;
const OG_IMAGE = `${SITE_URL}/og-cover.png`;

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon-192.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: CONTACT_EMAIL,
        contactType: "customer support",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESC },
      { property: "og:url", content: HOME_URL },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(homeJsonLd) },
    ],
  }),
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
      {/* Base blush wash */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, #ffffff 55%, rgba(229,50,45,0.035) 100%)",
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Subtle dot-grid behind hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(31,41,55,0.06) 1px, transparent 0)",
            backgroundSize: "22px 22px",
            maskImage:
              "radial-gradient(60% 70% at 50% 30%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(60% 70% at 50% 30%, #000 40%, transparent 100%)",
          }}
        />
        {/* Soft brand-tinted glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 50% at 50% 10%, rgba(229,50,45,0.05), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-10 pb-0 text-center">
          <h1
            className="mx-auto max-w-[900px] font-extrabold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.08]"
            style={{ color: "#1c1c26", letterSpacing: "-0.025em" }}
          >
            Every tool you need to work with{" "}
            <span className="relative inline-block">
              <span style={{ color: "#E5322D" }}>PDFs</span>
              <svg
                aria-hidden
                viewBox="0 0 120 12"
                preserveAspectRatio="none"
                className="hero-underline absolute left-0 -bottom-1.5 h-[10px] w-full"
                fill="none"
              >
                <path
                  d="M2 8 Q 30 2, 60 6 T 118 5"
                  stroke="#E5322D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </svg>
            </span>{" "}
            in one place
          </h1>
          <p
            className="mx-auto mt-4 max-w-[720px] text-[16px] sm:text-[17px] leading-relaxed"
            style={{ color: "#6b6b78" }}
          >
            28 free tools to merge, split, convert, edit and sign PDFs — right in your browser. Fast, private and free.
          </p>

          {/* Filter pills */}
          <div
            className="mx-auto mt-7 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
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
      <section id="tools" className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-6 pb-12">
        <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
          {visible.map((t) => {
            const Icon = t.icon;
            return (
              <ToolCard key={t.slug} slug={t.slug} name={t.name} description={t.description} Icon={Icon} />
            );
          })}
        </div>
      </section>

      <HomeBottom />
    </div>
  );
}

/* Premium tool card — hover lift, icon scale, tinted border, inset top highlight, focus ring. */
function ToolCard({
  slug,
  name,
  description,
  Icon,
}: {
  slug: string;
  name: string;
  description: string;
  Icon: React.ComponentType<{ size?: number }> & { tint?: string };
}) {
  const [hover, setHover] = useState(false);
  // Prefer per-icon tint if the ToolIcon exposes one, else brand red.
  const tint = (Icon as { tint?: string }).tint ?? "#E5322D";
  return (
    <Link
      to="/tools/$slug"
      params={{ slug }}
      className="group relative flex h-full flex-col rounded-lg bg-white p-5 sm:p-6 text-left transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E5322D]/40"
      style={{
        border: `1px solid ${hover ? tint + "55" : "#ececef"}`,
        boxShadow: hover
          ? "inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 22px -12px rgba(20,20,43,0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 2px rgba(20,20,43,0.03)",
        transform: hover ? "translateY(-3px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: hover ? "scale(1.06)" : "scale(1)", transformOrigin: "left center" }}
      >
        <Icon size={46} />
      </div>
      <h3
        className="mt-3.5 sm:mt-4 font-semibold text-[16px] sm:text-[18px] leading-snug"
        style={{ color: "#1F2937", letterSpacing: "-0.005em" }}
      >
        {name}
      </h3>
      <p
        className="mt-2 text-[13.5px] sm:text-[14px] leading-[1.55]"
        style={{ color: "#6B7280" }}
      >
        {description}
      </p>
    </Link>
  );
}
