import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { getImageTool } from "@/lib/imageTools";

import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { HeicToJpgTool } from "@/tools/heic-to-jpg";
import { HeicToPngTool } from "@/tools/heic-to-png";
import { JpgToPngTool } from "@/tools/jpg-to-png";
import {
  HeicToJpgSeo,
  heicToJpgFaqJsonLd,
  heicToJpgSoftwareJsonLd,
  heicToJpgHowToJsonLd,
} from "@/components/HeicToJpgSeo";
import {
  HeicToPngSeo,
  heicToPngFaqJsonLd,
  heicToPngSoftwareJsonLd,
  heicToPngHowToJsonLd,
} from "@/components/HeicToPngSeo";
import {
  JpgToPngSeo,
  jpgToPngFaqJsonLd,
  jpgToPngSoftwareJsonLd,
  jpgToPngHowToJsonLd,
} from "@/components/JpgToPngSeo";
import { PngToJpgTool } from "@/tools/png-to-jpg";
import {
  PngToJpgSeo,
  pngToJpgFaqJsonLd,
  pngToJpgSoftwareJsonLd,
  pngToJpgHowToJsonLd,
} from "@/components/PngToJpgSeo";
import { WebpToJpgTool } from "@/tools/webp-to-jpg";
import {
  WebpToJpgSeo,
  webpToJpgFaqJsonLd,
  webpToJpgSoftwareJsonLd,
  webpToJpgHowToJsonLd,
} from "@/components/WebpToJpgSeo";
import { WebpToPngTool } from "@/tools/webp-to-png";
import {
  WebpToPngSeo,
  webpToPngFaqJsonLd,
  webpToPngSoftwareJsonLd,
  webpToPngHowToJsonLd,
} from "@/components/WebpToPngSeo";
import { CompressImageTool } from "@/tools/compress-image";
import {
  CompressImageSeo,
  compressImageFaqJsonLd,
  compressImageSoftwareJsonLd,
  compressImageHowToJsonLd,
} from "@/components/CompressImageSeo";
import { ImageResizeTool } from "@/tools/image-resize";
import {
  ImageResizeSeo,
  imageResizeFaqJsonLd,
  imageResizeSoftwareJsonLd,
  imageResizeHowToJsonLd,
} from "@/components/ImageResizeSeo";
import { JpgToWebpTool } from "@/tools/jpg-to-webp";
import {
  JpgToWebpSeo,
  jpgToWebpFaqJsonLd,
  jpgToWebpSoftwareJsonLd,
  jpgToWebpHowToJsonLd,
} from "@/components/JpgToWebpSeo";
import { PngToWebpTool } from "@/tools/png-to-webp";
import {
  PngToWebpSeo,
  pngToWebpFaqJsonLd,
  pngToWebpSoftwareJsonLd,
  pngToWebpHowToJsonLd,
} from "@/components/PngToWebpSeo";
import { CropImageTool } from "@/tools/crop-image";
import {
  CropImageSeo,
  cropImageFaqJsonLd,
  cropImageSoftwareJsonLd,
  cropImageHowToJsonLd,
} from "@/components/CropImageSeo";
import { RotateImageTool } from "@/tools/rotate-image";
import {
  RotateImageSeo,
  rotateImageFaqJsonLd,
  rotateImageSoftwareJsonLd,
  rotateImageHowToJsonLd,
} from "@/components/RotateImageSeo";
import { WatermarkImageTool } from "@/tools/watermark-image";
import {
  WatermarkImageSeo,
  watermarkImageFaqJsonLd,
  watermarkImageSoftwareJsonLd,
  watermarkImageHowToJsonLd,
} from "@/components/WatermarkImageSeo";
import { MemeGeneratorTool } from "@/tools/meme-generator";
import {
  MemeGeneratorSeo,
  memeGeneratorFaqJsonLd,
  memeGeneratorSoftwareJsonLd,
  memeGeneratorHowToJsonLd,
} from "@/components/MemeGeneratorSeo";
import { PhotoEditorTool } from "@/tools/photo-editor";
import {
  PhotoEditorSeo,
  photoEditorFaqJsonLd,
  photoEditorSoftwareJsonLd,
  photoEditorHowToJsonLd,
} from "@/components/PhotoEditorSeo";


const HEIC_TITLE = "HEIC to JPG Converter Free, No Upload | FreePDFHub";
const HEIC_DESC =
  "Convert HEIC to JPG online free. Batch convert iPhone photos in your browser with no upload, no signup, and no quality loss. Fast and 100% private.";

const HEIC_PNG_TITLE = "HEIC to PNG Converter Free, No Upload | FreePDFHub";
const HEIC_PNG_DESC =
  "Convert HEIC to PNG online free. Batch convert iPhone HEIC photos to lossless PNG in your browser, no upload, no signup, 100% private. Works on any device.";

const JPG_PNG_TITLE = "JPG to PNG Converter Online Free, No Upload | FreePDFHub";
const JPG_PNG_DESC =
  "Convert JPG to PNG online free. Batch convert JPG and JPEG images to lossless PNG in your browser, no upload, no signup, 100% private. Works on any device.";

const PNG_JPG_TITLE = "PNG to JPG Converter Online Free, No Upload | FreePDFHub";
const PNG_JPG_DESC =
  "Convert PNG to JPG online free. Batch convert PNG images to smaller JPG files in your browser, adjustable quality, no upload, 100% private. No install needed.";

const WEBP_JPG_TITLE = "WebP to JPG Converter Free, No Upload | FreePDFHub";
const WEBP_JPG_DESC =
  "Convert WebP to JPG online free. Batch convert .webp images to universal JPG in your browser, adjustable quality, no upload, no signup. Works on any device.";

const WEBP_PNG_TITLE = "WebP to PNG Converter Free, No Upload | FreePDFHub";
const WEBP_PNG_DESC =
  "Convert WebP to PNG online free. Batch convert .webp images to lossless PNG in your browser with transparency preserved, no upload, no signup.";

const COMPRESS_TITLE = "Compress Image Online Free, JPG PNG WebP | FreePDFHub";
const COMPRESS_DESC =
  "Compress image online free. Reduce JPG, PNG, and WebP file size in your browser, target 100KB, 200KB, or 50KB. Batch and ZIP, 100% private. Nothing to install.";

const RESIZE_TITLE = "Resize Image in Pixels or KB Free, No Upload | FreePDFHub";
const RESIZE_DESC =
  "Resize image online free. Change JPG, PNG, and WebP dimensions by pixels or percent in your browser. Presets for passport, signature, HD. No upload.";

const JPG_WEBP_TITLE = "JPG to WebP Converter Free, No Upload | FreePDFHub";
const JPG_WEBP_DESC =
  "Convert JPG to WebP online free. Batch convert to modern WebP for faster websites, entirely in your browser. No upload, no signup, real .webp output.";

const PNG_WEBP_TITLE = "PNG to WebP Converter Free, No Upload | FreePDFHub";
const PNG_WEBP_DESC =
  "Convert PNG to WebP online free. Batch convert with transparency preserved, entirely in your browser. Smaller files for faster websites, no upload.";

const CROP_TITLE = "Crop Image to Any Size Free, No Upload | FreePDFHub";
const CROP_DESC =
  "Crop image online free. Drag the crop box, lock 1:1, 16:9, 9:16, or passport ratios, or enter exact pixels. Batch JPG, PNG, WebP in your browser.";

const ROTATE_TITLE = "Rotate and Flip Image Free, No Upload | FreePDFHub";
const ROTATE_DESC =
  "Rotate image online free. Rotate 90, 180, or 270 degrees, mirror horizontally, or flip vertically. Batch fix sideways JPG, PNG, WebP in your browser.";

const WATERMARK_TITLE = "Add Watermark to Image Free, No Upload | FreePDFHub";
const WATERMARK_DESC =
  "Add watermark to image online free. Text or logo, tile pattern, 9-cell position grid, opacity, rotation. Batch JPG, PNG, WebP in your browser, no upload.";

const MEME_TITLE = "Free Meme Generator, No Watermark, No Upload | FreePDFHub";
const MEME_DESC =
  "Make memes online free with no watermark. Classic top and bottom text, extra draggable captions, caption bar mode. Use your own photo, 100% private, no upload.";

const PHOTO_EDITOR_TITLE = "Free Photo Editor Online, No Signup, No Upload | FreePDFHub";
const PHOTO_EDITOR_DESC =
  "Free online photo editor. Adjust brightness, contrast, saturation, warmth, apply one-tap filters like B&W, sepia, vintage. Export JPG, PNG, WebP. No upload.";



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
    const SOFTWARE_LDS: Record<string, unknown> = {
      "heic-to-jpg": heicToJpgSoftwareJsonLd,
      "heic-to-png": heicToPngSoftwareJsonLd,
      "jpg-to-png": jpgToPngSoftwareJsonLd,
      "png-to-jpg": pngToJpgSoftwareJsonLd,
      "webp-to-jpg": webpToJpgSoftwareJsonLd,
      "webp-to-png": webpToPngSoftwareJsonLd,
      "compress-image": compressImageSoftwareJsonLd,
      "image-resize": imageResizeSoftwareJsonLd,
      "jpg-to-webp": jpgToWebpSoftwareJsonLd,
      "png-to-webp": pngToWebpSoftwareJsonLd,
      "crop-image": cropImageSoftwareJsonLd,
      "rotate-image": rotateImageSoftwareJsonLd,
      "watermark-image": watermarkImageSoftwareJsonLd,
      "meme-generator": memeGeneratorSoftwareJsonLd,
      "photo-editor": photoEditorSoftwareJsonLd,
    };
    const HOWTO_LDS: Record<string, unknown> = {
      "heic-to-jpg": heicToJpgHowToJsonLd,
      "heic-to-png": heicToPngHowToJsonLd,
      "jpg-to-png": jpgToPngHowToJsonLd,
      "png-to-jpg": pngToJpgHowToJsonLd,
      "webp-to-jpg": webpToJpgHowToJsonLd,
      "webp-to-png": webpToPngHowToJsonLd,
      "compress-image": compressImageHowToJsonLd,
      "image-resize": imageResizeHowToJsonLd,
      "jpg-to-webp": jpgToWebpHowToJsonLd,
      "png-to-webp": pngToWebpHowToJsonLd,
      "crop-image": cropImageHowToJsonLd,
      "rotate-image": rotateImageHowToJsonLd,
      "watermark-image": watermarkImageHowToJsonLd,
      "meme-generator": memeGeneratorHowToJsonLd,
      "photo-editor": photoEditorHowToJsonLd,
    };
    const FAQ_LDS: Record<string, unknown> = {
      "heic-to-jpg": heicToJpgFaqJsonLd,
      "heic-to-png": heicToPngFaqJsonLd,
      "jpg-to-png": jpgToPngFaqJsonLd,
      "png-to-jpg": pngToJpgFaqJsonLd,
      "webp-to-jpg": webpToJpgFaqJsonLd,
      "webp-to-png": webpToPngFaqJsonLd,
      "compress-image": compressImageFaqJsonLd,
      "image-resize": imageResizeFaqJsonLd,
      "jpg-to-webp": jpgToWebpFaqJsonLd,
      "png-to-webp": pngToWebpFaqJsonLd,
      "crop-image": cropImageFaqJsonLd,
      "rotate-image": rotateImageFaqJsonLd,
      "watermark-image": watermarkImageFaqJsonLd,
      "meme-generator": memeGeneratorFaqJsonLd,
      "photo-editor": photoEditorFaqJsonLd,
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
      const softwareLd = SOFTWARE_LDS[slug];
      const howToLd = HOWTO_LDS[slug];
      const faqLd = FAQ_LDS[slug];
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
          { type: "application/ld+json", children: JSON.stringify(softwareLd) },
          { type: "application/ld+json", children: JSON.stringify(howToLd) },
          { type: "application/ld+json", children: JSON.stringify(faqLd) },
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

type Silo = {
  h1: string;
  subtitle: string;
  Component: () => ReactNode;
  Seo: () => ReactNode;
  maxWidth?: string;
};

const SILOS: Record<string, Silo> = {
  "heic-to-jpg": {
    h1: "Convert HEIC to JPG online, free",
    subtitle: "Turn iPhone HEIC photos into universal JPGs, right in your browser.",
    Component: HeicToJpgTool,
    Seo: HeicToJpgSeo,
  },
  "heic-to-png": {
    h1: "Convert HEIC to PNG online, free",
    subtitle: "Turn iPhone HEIC photos into lossless PNGs, right in your browser.",
    Component: HeicToPngTool,
    Seo: HeicToPngSeo,
  },
  "jpg-to-png": {
    h1: "Convert JPG to PNG online, free",
    subtitle: "Turn JPG and JPEG images into lossless PNGs, right in your browser.",
    Component: JpgToPngTool,
    Seo: JpgToPngSeo,
  },
  "png-to-jpg": {
    h1: "Convert PNG to JPG online, free",
    subtitle: "Turn PNG images into smaller JPGs with adjustable quality, in your browser.",
    Component: PngToJpgTool,
    Seo: PngToJpgSeo,
  },
  "webp-to-jpg": {
    h1: "Convert WebP to JPG online, free",
    subtitle: "Turn .webp images into universal JPGs, right in your browser.",
    Component: WebpToJpgTool,
    Seo: WebpToJpgSeo,
  },
  "webp-to-png": {
    h1: "Convert WebP to PNG online, free",
    subtitle: "Turn .webp images into lossless PNGs with transparency preserved, in your browser.",
    Component: WebpToPngTool,
    Seo: WebpToPngSeo,
  },
  "compress-image": {
    h1: "Compress images online, free",
    subtitle: "Reduce JPG, PNG, and WebP file size right in your browser, no upload.",
    Component: CompressImageTool,
    Seo: CompressImageSeo,
  },
  "image-resize": {
    h1: "Resize images online, free",
    subtitle: "Change JPG, PNG, and WebP dimensions by pixels or percent, in your browser.",
    Component: ImageResizeTool,
    Seo: ImageResizeSeo,
  },
  "jpg-to-webp": {
    h1: "Convert JPG to WebP online, free",
    subtitle: "Turn JPG and JPEG images into modern WebP for faster websites, in your browser.",
    Component: JpgToWebpTool,
    Seo: JpgToWebpSeo,
  },
  "png-to-webp": {
    h1: "Convert PNG to WebP online, free",
    subtitle: "Turn PNG images into modern WebP with transparency preserved, in your browser.",
    Component: PngToWebpTool,
    Seo: PngToWebpSeo,
  },
  "crop-image": {
    h1: "Crop images online, free",
    subtitle: "Crop JPG, PNG, and WebP to any size or preset ratio, in your browser.",
    Component: CropImageTool,
    Seo: CropImageSeo,
  },
  "rotate-image": {
    h1: "Rotate and flip images online, free",
    subtitle: "Rotate JPG, PNG, and WebP by 90, 180, or 270 degrees, or mirror them, in your browser.",
    Component: RotateImageTool,
    Seo: RotateImageSeo,
  },
  "watermark-image": {
    h1: "Add a watermark to images online, free",
    subtitle: "Stamp a text line or your own logo across JPG, PNG, and WebP photos, in your browser.",
    Component: WatermarkImageTool,
    Seo: WatermarkImageSeo,
    maxWidth: "max-w-5xl",
  },
  "meme-generator": {
    h1: "Make memes online, free, no watermark",
    subtitle: "Drop in a photo, add captions, and download a clean meme, right in your browser.",
    Component: MemeGeneratorTool,
    Seo: MemeGeneratorSeo,
    maxWidth: "max-w-6xl",
  },
  "photo-editor": {
    h1: "Edit photos online, free",
    subtitle: "Adjust brightness, contrast, saturation, and warmth, or apply filters, in your browser.",
    Component: PhotoEditorTool,
    Seo: PhotoEditorSeo,
    maxWidth: "max-w-6xl",
  },
};

function ImageToolPage() {
  const { tool } = Route.useLoaderData();

  if (tool.status === "coming-soon") return <ComingSoonView name={tool.name} description={tool.description} />;

  const silo = SILOS[tool.slug];
  if (!silo) return null;

  const Tool = silo.Component;
  const Seo = silo.Seo;
  const maxWidth = silo.maxWidth ?? "max-w-4xl";

  return (
    <div className={`mx-auto ${maxWidth} px-4 pb-16`}>
      <section className="relative flex flex-col pt-6 pb-14">
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
          <p
            className="mx-auto mt-4 max-w-[640px] text-[15px] sm:text-[18px]"
            style={{ color: "#6B7280", lineHeight: 1.65 }}
          >
            {silo.subtitle}
          </p>
          <div className="mt-10">
            <Tool />
          </div>
        </section>
      <Seo />
    </div>
  );
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
        <h2 className="mt-4 text-[32px] font-bold text-[#1F2937]">{name}</h2>
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
