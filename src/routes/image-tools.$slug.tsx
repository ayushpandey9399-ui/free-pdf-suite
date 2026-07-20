import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getImageTool } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";
import { HeicToJpgTool } from "@/tools/heic-to-jpg";
import {
  HeicToJpgSeo,
  heicToJpgFaqJsonLd,
  heicToJpgSoftwareJsonLd,
  heicToJpgHowToJsonLd,
} from "@/components/HeicToJpgSeo";

const HEIC_TITLE = "HEIC to JPG Converter Free, No Upload | FreePDFHub";
const HEIC_DESC =
  "Convert HEIC to JPG online free. Batch convert iPhone photos in your browser with no upload, no signup, and no quality loss. Fast and 100% private.";

export const Route = createFileRoute("/image-tools/$slug")({
  loader: ({ params }) => {
    const tool = getImageTool(params.slug);
    if (!tool) throw notFound();
    return { tool };
  },
  head: ({ loaderData, params }) => {
    const slug = loaderData?.tool.slug ?? params.slug;
    const tool = loaderData?.tool;
    const url = `${SITE_URL}/image-tools/${slug}`;
    const isHeic = slug === "heic-to-jpg";

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Image Tools", item: `${SITE_URL}/image-tools` },
        {
          "@type": "ListItem",
          position: 3,
          name: tool?.name ?? "Tool",
          item: url,
        },
      ],
    };

    if (isHeic) {
      return {
        meta: [
          { title: HEIC_TITLE },
          { name: "description", content: HEIC_DESC },
          { property: "og:title", content: HEIC_TITLE },
          { property: "og:description", content: HEIC_DESC },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { property: "og:image", content: `${SITE_URL}/og-cover.png` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: HEIC_TITLE },
          { name: "twitter:description", content: HEIC_DESC },
          { name: "twitter:image", content: `${SITE_URL}/og-cover.png` },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(heicToJpgSoftwareJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(heicToJpgFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
        ],
      };
    }

    // Coming-soon: noindex.
    const title = tool ? `${tool.name} (coming soon) | FreePDFHub` : "Coming soon | FreePDFHub";
    return {
      meta: [
        { title },
        { name: "description", content: tool?.description ?? "Coming soon." },
        { name: "robots", content: "noindex, follow" },
        { property: "og:title", content: title },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
      ],
    };
  },
  component: ImageToolPage,
});

function ImageToolPage() {
  const { tool } = Route.useLoaderData();

  if (tool.status === "coming-soon") return <ComingSoonView name={tool.name} description={tool.description} />;

  if (tool.slug === "heic-to-jpg") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert HEIC to JPG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn iPhone HEIC photos into universal JPGs in your browser. Batch convert, choose quality, download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <HeicToJpgTool />
          </div>
        </section>
        <HeicToJpgSeo />
      </div>
    );
  }

  return null;
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="pt-6 text-[13px] text-[#6B7280]">
      <ol className="flex items-center gap-[6px]">
        <li><Link to="/" className="hover:text-[#e5322d]">Home</Link></li>
        <li aria-hidden>›</li>
        <li><Link to="/image-tools" className="hover:text-[#e5322d]">Image Tools</Link></li>
        <li aria-hidden>›</li>
        <li aria-current="page" style={{ color: "#4B5563" }}>{name}</li>
      </ol>
    </nav>
  );
}

function ComingSoonView({ name, description }: { name: string; description: string }) {
  // Belt & suspenders: also set noindex client-side.
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, follow";
    m.setAttribute("data-tmp-noindex", "true");
    document.head.appendChild(m);
    return () => {
      document.querySelectorAll('meta[data-tmp-noindex="true"]').forEach((el) => el.remove());
    };
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <Breadcrumb name={name} />
      <section className="pt-10 text-center">
        <span className="inline-flex rounded-full bg-[#f6f4f9] px-3 py-1 text-[12px] font-semibold text-[#5a5a66]">
          Coming soon
        </span>
        <h1 className="mt-4 text-[32px] font-bold text-[#1F2937]">{name}</h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[15px] text-[#6B7280]">{description}</p>
        <Link
          to="/image-tools"
          className="mt-8 inline-flex items-center rounded-lg border border-[#ececef] px-4 py-2.5 text-[14px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
        >
          Back to Image Tools
        </Link>
      </section>
    </div>
  );
}
