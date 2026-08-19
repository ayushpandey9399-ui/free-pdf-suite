import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, Suspense } from "react";

import { getImageTool } from "@/lib/imageTools";

import { SITE_URL } from "@/lib/site";
import { normalizeToolJsonLd } from "@/lib/seoSchema";
import { IMAGE_SILOS } from "@/components/imageSeoBundle";


const HEIC_TITLE = "HEIC to JPG Converter Online Free — Convert iPhone Photos | PDFToolConverter";
const HEIC_DESC =
  "Convert HEIC photos to JPG online instantly in your browser. Batch convert iPhone HEIC images to JPG without losing quality. Free, no signup, no watermark, files never leave your device.";

const HEIC_PNG_TITLE = "HEIC to PNG Converter Free, No Upload | pdftoolconverteronline.com";
const HEIC_PNG_DESC =
  "Convert HEIC to PNG online free. Batch convert iPhone HEIC photos to lossless PNG in your browser, no upload, no signup, 100% private. Works on any device.";

const JPG_PNG_TITLE = "JPG to PNG Converter Online Free — Convert JPEG to PNG | PDFToolConverter";
const JPG_PNG_DESC =
  "Convert JPG images to PNG online instantly in your browser. Batch convert multiple JPEGs to PNG with transparency support. Free, no signup, no watermark, files never leave your device.";

const PNG_JPG_TITLE = "PNG to JPG Converter Online Free — Convert PNG to JPEG | PDFToolConverter";
const PNG_JPG_DESC =
  "Convert PNG images to JPG online instantly in your browser. Batch convert multiple PNG files to JPEG with quality control. Free, no signup, no watermark, files never leave your device.";

const WEBP_JPG_TITLE = "WebP to JPG Converter Online Free — Convert WebP to JPEG | PDFToolConverter";
const WEBP_JPG_DESC =
  "Convert WebP images to JPG online instantly in your browser. Batch convert multiple WebP files to JPEG. Free, no signup, no watermark, files never leave your device.";

const WEBP_PNG_TITLE = "WebP to PNG Converter Free, No Upload | pdftoolconverteronline.com";
const WEBP_PNG_DESC =
  "Convert WebP to PNG online free. Batch convert .webp images to lossless PNG in your browser with transparency preserved, no upload, no signup.";

const COMPRESS_TITLE = "Compress Image Online Free, JPG PNG WebP | pdftoolconverteronline.com";
const COMPRESS_DESC =
  "Compress image online free. Reduce JPG, PNG, and WebP file size in your browser, target 100KB, 200KB, or 50KB. Batch and ZIP, 100% private. Nothing to install.";

const RESIZE_TITLE = "Resize Image in Pixels or KB Free, No Upload | pdftoolconverteronline.com";
const RESIZE_DESC =
  "Resize image online free. Change JPG, PNG, and WebP dimensions by pixels or percent in your browser. Presets for passport, signature, HD. No upload.";

const JPG_WEBP_TITLE = "JPG to WebP Converter Free, No Upload | pdftoolconverteronline.com";
const JPG_WEBP_DESC =
  "Convert JPG to WebP online free. Batch convert to modern WebP for faster websites, entirely in your browser. No upload, no signup, real .webp output.";

const PNG_WEBP_TITLE = "PNG to WebP Converter Free, No Upload | pdftoolconverteronline.com";
const PNG_WEBP_DESC =
  "Convert PNG to WebP online free. Batch convert with transparency preserved, entirely in your browser. Smaller files for faster websites, no upload.";

const CROP_TITLE = "Crop Image to Any Size Free, No Upload | pdftoolconverteronline.com";
const CROP_DESC =
  "Crop image online free. Drag the crop box, lock 1:1, 16:9, 9:16, or passport ratios, or enter exact pixels. Batch JPG, PNG, WebP in your browser.";

const ROTATE_TITLE = "Rotate and Flip Image Free, No Upload | pdftoolconverteronline.com";
const ROTATE_DESC =
  "Rotate image online free. Rotate 90, 180, or 270 degrees, mirror horizontally, or flip vertically. Batch fix sideways JPG, PNG, WebP in your browser.";

const WATERMARK_TITLE = "Add Watermark to Image Free, No Upload | pdftoolconverteronline.com";
const WATERMARK_DESC =
  "Add watermark to image online free. Text or logo, tile pattern, 9-cell position grid, opacity, rotation. Batch JPG, PNG, WebP in your browser, no upload.";

const MEME_TITLE = "Free Meme Generator, No Watermark, No Upload | pdftoolconverteronline.com";
const MEME_DESC =
  "Make memes online free with no watermark. Classic top and bottom text, extra draggable captions, caption bar mode. Use your own photo, 100% private, no upload.";

const PHOTO_EDITOR_TITLE = "Free Photo Editor Online, No Signup, No Upload | pdftoolconverteronline.com";
const PHOTO_EDITOR_DESC =
  "Free online photo editor. Adjust brightness, contrast, saturation, warmth, apply one-tap filters like B&W, sepia, vintage. Export JPG, PNG, WebP. No upload.";



export const Route = createFileRoute("/image-tools/$slug")({
  loader: ({ params }) => {
    const tool = getImageTool(params.slug);
    if (!tool) throw notFound();
    // Return only serializable fields. The registry entry carries an icon
    // component, and a function cannot be dehydrated for the client.
    return {
      tool: {
        slug: tool.slug,
        name: tool.name,
        description: tool.description,
        status: tool.status,
      },
    };
  },
  head: ({ loaderData, params }) => {
    const slug = loaderData?.tool.slug ?? params.slug;
    const tool = loaderData?.tool;
    const url = `${SITE_URL}/image-tools/${slug}`;
    const TITLES: Record<string, string> = {
      "heic-to-jpg": HEIC_TITLE,
      "heic-to-png": HEIC_PNG_TITLE,
      "jpg-to-png": JPG_PNG_TITLE,
      "png-to-jpg": PNG_JPG_TITLE,
      "webp-to-jpg": WEBP_JPG_TITLE,
      "webp-to-png": WEBP_PNG_TITLE,
      "compress-image": COMPRESS_TITLE,
      "image-resize": RESIZE_TITLE,
      "jpg-to-webp": JPG_WEBP_TITLE,
      "png-to-webp": PNG_WEBP_TITLE,
      "crop-image": CROP_TITLE,
      "rotate-image": ROTATE_TITLE,
      "watermark-image": WATERMARK_TITLE,
      "meme-generator": MEME_TITLE,
      "photo-editor": PHOTO_EDITOR_TITLE,
    };
    const DESCS: Record<string, string> = {
      "heic-to-jpg": HEIC_DESC,
      "heic-to-png": HEIC_PNG_DESC,
      "jpg-to-png": JPG_PNG_DESC,
      "png-to-jpg": PNG_JPG_DESC,
      "webp-to-jpg": WEBP_JPG_DESC,
      "webp-to-png": WEBP_PNG_DESC,
      "compress-image": COMPRESS_DESC,
      "image-resize": RESIZE_DESC,
      "jpg-to-webp": JPG_WEBP_DESC,
      "png-to-webp": PNG_WEBP_DESC,
      "crop-image": CROP_DESC,
      "rotate-image": ROTATE_DESC,
      "watermark-image": WATERMARK_DESC,
      "meme-generator": MEME_DESC,
      "photo-editor": PHOTO_EDITOR_DESC,
    };

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

    if (TITLES[slug]) {
      const title = TITLES[slug];
      const desc = DESCS[slug];
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { property: "og:image", content: `${SITE_URL}/og-cover.png` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
          { name: "twitter:image", content: `${SITE_URL}/og-cover.png` },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) },
        ],
      };

    }



    // Coming-soon: noindex.
    const title = tool ? `${tool.name} (coming soon) | pdftoolconverteronline.com` : "Coming soon | pdftoolconverteronline.com";
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

  const silo = IMAGE_SILOS[tool.slug];
  if (!silo) return null;

  const Tool = silo.Component;
  const Seo = silo.Seo;
  const maxWidth = silo.maxWidth ?? "max-w-4xl";

  const fallback = (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
      Loading tool…
    </div>
  );



  return (
    <div className="w-full">
      <div className="bg-[#F7F7F8] border-b border-[#ececec] w-full overflow-hidden">
        <section className={`mx-auto ${maxWidth} px-4 relative flex flex-col pt-6 pb-20 sm:pb-28`}>
          <Breadcrumb name={tool.name} />
          <div className="flex flex-1 flex-col justify-center text-center mt-8 md:mt-0">
            <h1
              className="mx-auto text-[28px] sm:text-[42px]"
              style={{
                color: "#383E45",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
              }}
            >
              {silo.h1}
            </h1>
            <div className="mt-10">
              <Suspense fallback={fallback}>
                <Tool />
              </Suspense>
            </div>

          </div>
        </section>
      </div>
      <div className={`mx-auto ${maxWidth} px-4 pb-16`}>
        <Seo />
      </div>

      {silo.jsonLd.map((v, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(normalizeToolJsonLd(v, `${SITE_URL}/image-tools/${tool.slug}`)),
          }}
        />
      ))}
    </div>
  );
}




function Breadcrumb({ name }: { name: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-[#6B7280]">
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
    <div className="w-full">
      <div className="bg-[#F7F7F8] border-b border-[#ececec]">
        <section className="mx-auto max-w-3xl px-4 relative flex flex-col pt-6 pb-20 sm:pb-28">
          <Breadcrumb name={name} />
          <section className="pt-10 text-center">

        <span className="inline-flex rounded-full bg-[#f6f4f9] px-3 py-1 text-[12px] font-semibold text-[#5a5a66]">
          Coming soon
        </span>
        <h2 className="mt-4 text-[32px] font-bold text-[#1F2937]">{name}</h2>
        
        <Link
          to="/image-tools"
          className="mt-8 inline-flex items-center rounded-lg border border-[#ececef] px-4 py-2.5 text-[14px] font-semibold text-[#33333c] hover:bg-[#f9fafb]"
        >
          Back to Image Tools
        </Link>
          </section>
        </section>
      </div>
    </div>

  );
}
