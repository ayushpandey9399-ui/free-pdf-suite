import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { imageTools, type ImageTool } from "@/lib/imageTools";
import { ImageToolIcon } from "@/components/image-tools/ImageToolIcon";
import { SITE_URL } from "@/lib/site";


const TITLE = "Free Image Tools, Convert HEIC, JPG, PNG | FreePDFHub";
const DESC =
  "Free browser-based image tools. Convert HEIC to JPG, and more coming soon. 100% client-side, no signup, no upload, your files stay on your device.";

export const Route = createFileRoute("/image-tools/")({
  head: () => {
    const url = `${SITE_URL}/image-tools`;
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
    };
  },
  component: ImageToolsHub,
});

function ImageToolsHub() {
  const liveCount = imageTools.filter((t) => t.status === "live").length;

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-16 pt-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-[#6B7280]">
        <ol className="flex items-center gap-[6px]">
          <li><Link to="/" className="hover:text-[#e5322d]">Home</Link></li>
          <li aria-hidden>›</li>
          <li aria-current="page" style={{ color: "#4B5563" }}>Image Tools</li>
        </ol>
      </nav>

      <header className="mt-6 text-center">
        <h1
          className="mx-auto max-w-[820px] font-extrabold text-[32px] sm:text-[44px] leading-[1.1]"
          style={{ color: "#1c1c26", letterSpacing: "-0.025em" }}
        >
          Free image tools, in your browser
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-[15px] sm:text-[17px] text-[#6B7280]">
          Convert HEIC iPhone photos to JPG or PNG, swap JPG, PNG and WebP, and compress images, without signup and without uploading a single byte. Everything runs client-side on your device.
        </p>
        <p className="mt-3 text-[13px] font-semibold text-[#6B7280]">
          {liveCount} free image tools, no signup, no upload
        </p>
      </header>

      <ul className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {imageTools.map((t) => (
          <li key={t.slug}>
            {t.status === "live" ? (
              <ImageToolCard tool={t} />
            ) : (
              <ComingSoonCard tool={t} />
            )}
          </li>
        ))}
      </ul>
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
