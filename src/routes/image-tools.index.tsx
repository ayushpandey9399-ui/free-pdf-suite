import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { imageTools, imageCategories, type ImageTool, type ImageToolCategory } from "@/lib/imageTools";
import { ImageToolIcon } from "@/components/image-tools/ImageToolIcon";
import { SITE_URL } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seoSchema";


const TITLE = "Free Image Tools, Convert HEIC, JPG, PNG | FreePDFHub";
const DESC =
  "Free browser-based image tools. Convert HEIC to JPG, and more coming soon. 100% client-side, no signup, no upload, your files stay on your device.";

export const Route = createFileRoute("/image-tools/")({
  head: () => {
    const url = `${SITE_URL}/image-tools`;
    const collectionLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Free Image Tools",
      description: DESC,
      url,
      isPartOf: { "@type": "WebSite", name: "FreePDFHub", url: `${SITE_URL}/` },
      mainEntity: {
        "@type": "ItemList",
        name: "Free browser-based image tools",
        numberOfItems: imageTools.length,
        itemListElement: imageTools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${SITE_URL}/image-tools/${t.slug}`,
        })),
      },
    };
    const crumbs = breadcrumbJsonLd([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "Image Tools", url },
    ]);
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/og-cover.png` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(collectionLd) },
        { type: "application/ld+json", children: JSON.stringify(crumbs) },
      ],
    };
  },
  component: ImageToolsHub,
});


type Filter = "All" | ImageToolCategory;
const filters: Filter[] = ["All", ...imageCategories];

function ImageToolsHub() {
  const [active, setActive] = useState<Filter>("All");

  const visible = useMemo(
    () => (active === "All" ? imageTools : imageTools.filter((t) => t.category === active)),
    [active],
  );

  return (
    <div style={{ backgroundColor: "#ffffff", color: "#33333c" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-6">
        <nav aria-label="Breadcrumb" className="text-[13px] text-[#6B7280]">
          <ol className="flex items-center gap-[6px]">
            <li><Link to="/" className="hover:text-[#e5322d]">Home</Link></li>
            <li aria-hidden>›</li>
            <li aria-current="page" style={{ color: "#4B5563" }}>Image Tools</li>
          </ol>
        </nav>
      </div>

      {/* Hero, replicates PDF homepage hero */}
      <section className="relative overflow-hidden">


        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 pt-8 pb-0 text-center">
          <h1
            className="mx-auto max-w-[900px] font-extrabold text-[32px] sm:text-[42px] lg:text-[48px] leading-[1.08]"
            style={{ color: "#1c1c26", letterSpacing: "-0.025em" }}
          >
            Every tool you need to work with{" "}
            <span className="relative inline-block">
              <span style={{ color: "#E5322D" }}>Images</span>
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
            15 free tools to convert, compress, resize, edit and meme images, right in your browser. Fast, private and free.
          </p>

          {/* Filter pills */}
          <div
            className="mx-auto mt-7 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-visible px-1 -mx-1 sm:mx-auto"
            role="tablist"
            aria-label="Filter image tools by category"
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

      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-6 pb-8">
        <ul className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {visible.map((t) => (
            <li key={t.slug}>
              {t.status === "live" ? (
                <ImageToolCard tool={t} />
              ) : (
                <ComingSoonCard tool={t} />
              )}
            </li>
          ))}
        </ul>

        {/* Below-the-fold SEO copy, carries HEIC iPhone / no signup / no upload / client-side keywords */}
        <p className="mx-auto mt-10 max-w-[820px] text-center text-[14px] leading-[1.7] text-[#6B7280]">
          Convert HEIC iPhone photos to JPG or PNG, swap JPG, PNG and WebP, compress, resize, crop, rotate and watermark, all with no signup and no upload. Every image tool runs 100% client-side in your browser, so your files stay on your device.
        </p>
      </section>
    </div>
  );
}

/** Matches PDF tool card style: rounded tinted icon tile, hover lift, tinted border. */
function ImageToolCard({ tool }: { tool: ImageTool }) {
  const [hover, setHover] = useState(false);
  const tint = tool.tint;
  return (
    <Link
      to="/image-tools/$slug"
      params={{ slug: tool.slug }}
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
        style={{
          transform: hover ? "scale(1.06)" : "scale(1)",
          transformOrigin: "left center",
          filter: hover
            ? "drop-shadow(0 8px 14px rgba(20,20,43,0.18))"
            : "drop-shadow(0 2px 4px rgba(20,20,43,0.08))",
        }}
      >
        <ImageToolIcon slug={tool.slug} size={46} radius={10} />
      </div>

      <h3
        className="mt-3.5 sm:mt-4 font-semibold text-[16px] sm:text-[18px] leading-snug"
        style={{ color: "#1F2937", letterSpacing: "-0.005em" }}
      >
        {tool.name}
      </h3>
      <p
        className="mt-2 text-[13.5px] sm:text-[14px] leading-[1.55]"
        style={{ color: "#6B7280" }}
      >
        {tool.description}
      </p>
    </Link>
  );
}

function ComingSoonCard({ tool }: { tool: ImageTool }) {
  const Icon = tool.icon;
  return (
    <div
      className="flex h-full flex-col rounded-lg border border-[#ececef] bg-[#f9fafb] p-5 sm:p-6 opacity-80"
    >
      <div className="flex items-center justify-between">
        <div
          className="grid h-[46px] w-[46px] place-items-center rounded-[10px]"
          style={{ backgroundColor: "#eef0f3", color: "#9ca3af" }}
        >
          <Icon size={26} strokeWidth={2} />
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5a5a66] border border-[#ececef]">
          Coming soon
        </span>
      </div>
      <h3 className="mt-3.5 sm:mt-4 font-semibold text-[16px] sm:text-[18px] leading-snug text-[#1F2937]">
        {tool.name}
      </h3>
      <p className="mt-2 text-[13.5px] sm:text-[14px] leading-[1.55] text-[#6B7280]">
        {tool.description}
      </p>
    </div>
  );
}
