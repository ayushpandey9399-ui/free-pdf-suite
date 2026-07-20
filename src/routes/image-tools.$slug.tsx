import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { getImageTool, imageToolTintBg, type ImageTool } from "@/lib/imageTools";
import { ImageToolIcon } from "@/components/image-tools/ImageToolIcon";

import { SITE_URL } from "@/lib/site";
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


const HEIC_TITLE = "HEIC to JPG Converter Free, No Upload | FreePDFHub";
const HEIC_DESC =
  "Convert HEIC to JPG online free. Batch convert iPhone photos in your browser with no upload, no signup, and no quality loss. Fast and 100% private.";

const HEIC_PNG_TITLE = "HEIC to PNG Converter Free, No Upload | FreePDFHub";
const HEIC_PNG_DESC =
  "Convert HEIC to PNG online free. Batch convert iPhone HEIC photos to lossless PNG in your browser, no upload, no signup, 100% private.";

const JPG_PNG_TITLE = "JPG to PNG Converter Free, No Upload | FreePDFHub";
const JPG_PNG_DESC =
  "Convert JPG to PNG online free. Batch convert JPG and JPEG images to lossless PNG in your browser, no upload, no signup, 100% private.";

const PNG_JPG_TITLE = "PNG to JPG Converter Free, No Upload | FreePDFHub";
const PNG_JPG_DESC =
  "Convert PNG to JPG online free. Batch convert PNG images to smaller JPG files in your browser, adjustable quality, no upload, 100% private.";

const WEBP_JPG_TITLE = "WebP to JPG Converter Free, No Upload | FreePDFHub";
const WEBP_JPG_DESC =
  "Convert WebP to JPG online free. Batch convert .webp images to universal JPG in your browser, adjustable quality, no upload, no signup.";

const WEBP_PNG_TITLE = "WebP to PNG Converter Free, No Upload | FreePDFHub";
const WEBP_PNG_DESC =
  "Convert WebP to PNG online free. Batch convert .webp images to lossless PNG in your browser with transparency preserved, no upload, no signup.";

const COMPRESS_TITLE = "Compress Image Free, No Upload | FreePDFHub";
const COMPRESS_DESC =
  "Compress image online free. Reduce JPG, PNG, and WebP file size in your browser, target 100KB, 200KB, or 50KB. Batch and ZIP, 100% private.";

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
    const isHeicJpg = slug === "heic-to-jpg";
    const isHeicPng = slug === "heic-to-png";
    const isJpgPng = slug === "jpg-to-png";
    const isPngJpg = slug === "png-to-jpg";
    const isWebpJpg = slug === "webp-to-jpg";
    const isWebpPng = slug === "webp-to-png";
    const isCompress = slug === "compress-image";
    const isResize = slug === "image-resize";
    const isJpgWebp = slug === "jpg-to-webp";
    const isPngWebp = slug === "png-to-webp";
    const isCrop = slug === "crop-image";

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

    if (isHeicJpg || isHeicPng || isJpgPng || isPngJpg || isWebpJpg || isWebpPng || isCompress || isResize || isJpgWebp || isPngWebp || isCrop) {
      const title = isHeicJpg
        ? HEIC_TITLE
        : isHeicPng
          ? HEIC_PNG_TITLE
          : isJpgPng
            ? JPG_PNG_TITLE
            : isPngJpg
              ? PNG_JPG_TITLE
              : isWebpJpg
                ? WEBP_JPG_TITLE
                : isWebpPng
                  ? WEBP_PNG_TITLE
                  : isCompress
                    ? COMPRESS_TITLE
                    : isResize
                      ? RESIZE_TITLE
                      : isJpgWebp
                        ? JPG_WEBP_TITLE
                        : isPngWebp
                          ? PNG_WEBP_TITLE
                          : CROP_TITLE;
      const desc = isHeicJpg
        ? HEIC_DESC
        : isHeicPng
          ? HEIC_PNG_DESC
          : isJpgPng
            ? JPG_PNG_DESC
            : isPngJpg
              ? PNG_JPG_DESC
              : isWebpJpg
                ? WEBP_JPG_DESC
                : isWebpPng
                  ? WEBP_PNG_DESC
                  : isCompress
                    ? COMPRESS_DESC
                    : isResize
                      ? RESIZE_DESC
                      : isJpgWebp
                        ? JPG_WEBP_DESC
                        : isPngWebp
                          ? PNG_WEBP_DESC
                          : CROP_DESC;
      const softwareLd = isHeicJpg
        ? heicToJpgSoftwareJsonLd
        : isHeicPng
          ? heicToPngSoftwareJsonLd
          : isJpgPng
            ? jpgToPngSoftwareJsonLd
            : isPngJpg
              ? pngToJpgSoftwareJsonLd
              : isWebpJpg
                ? webpToJpgSoftwareJsonLd
                : isWebpPng
                  ? webpToPngSoftwareJsonLd
                  : isCompress
                    ? compressImageSoftwareJsonLd
                    : isResize
                      ? imageResizeSoftwareJsonLd
                      : isJpgWebp
                        ? jpgToWebpSoftwareJsonLd
                        : isPngWebp
                          ? pngToWebpSoftwareJsonLd
                          : cropImageSoftwareJsonLd;
      const howToLd = isHeicJpg
        ? heicToJpgHowToJsonLd
        : isHeicPng
          ? heicToPngHowToJsonLd
          : isJpgPng
            ? jpgToPngHowToJsonLd
            : isPngJpg
              ? pngToJpgHowToJsonLd
              : isWebpJpg
                ? webpToJpgHowToJsonLd
                : isWebpPng
                  ? webpToPngHowToJsonLd
                  : isCompress
                    ? compressImageHowToJsonLd
                    : isResize
                      ? imageResizeHowToJsonLd
                      : isJpgWebp
                        ? jpgToWebpHowToJsonLd
                        : isPngWebp
                          ? pngToWebpHowToJsonLd
                          : cropImageHowToJsonLd;
      const faqLd = isHeicJpg
        ? heicToJpgFaqJsonLd
        : isHeicPng
          ? heicToPngFaqJsonLd
          : isJpgPng
            ? jpgToPngFaqJsonLd
            : isPngJpg
              ? pngToJpgFaqJsonLd
              : isWebpJpg
                ? webpToJpgFaqJsonLd
                : isWebpPng
                  ? webpToPngFaqJsonLd
                  : isCompress
                    ? compressImageFaqJsonLd
                    : isResize
                      ? imageResizeFaqJsonLd
                      : isJpgWebp
                        ? jpgToWebpFaqJsonLd
                        : isPngWebp
                          ? pngToWebpFaqJsonLd
                          : cropImageFaqJsonLd;
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

function ImageToolPage() {
  const { tool } = Route.useLoaderData();

  if (tool.status === "coming-soon") return <ComingSoonView name={tool.name} description={tool.description} />;

  if (tool.slug === "heic-to-jpg") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
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

  if (tool.slug === "heic-to-png") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert HEIC to PNG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn iPhone HEIC photos into lossless PNGs in your browser. Batch convert and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <HeicToPngTool />
          </div>
        </section>
        <HeicToPngSeo />
      </div>
    );
  }

  if (tool.slug === "jpg-to-png") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert JPG to PNG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn JPG and JPEG images into lossless PNGs in your browser. Batch convert and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <JpgToPngTool />
          </div>
        </section>
        <JpgToPngSeo />
      </div>
    );
  }

  if (tool.slug === "png-to-jpg") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert PNG to JPG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn PNG images into smaller JPGs in your browser. Adjustable quality, batch convert, and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <PngToJpgTool />
          </div>
        </section>
        <PngToJpgSeo />
      </div>
    );
  }

  if (tool.slug === "webp-to-jpg") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert WebP to JPG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn .webp images (including ones saved from the web) into universal JPGs in your browser. Adjustable quality, batch convert, and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <WebpToJpgTool />
          </div>
        </section>
        <WebpToJpgSeo />
      </div>
    );
  }

  if (tool.slug === "webp-to-png") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert WebP to PNG online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn .webp images (including transparent ones) into lossless PNGs in your browser. Transparency preserved, batch convert, and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <WebpToPngTool />
          </div>
        </section>
        <WebpToPngSeo />
      </div>
    );
  }

  if (tool.slug === "compress-image") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Compress images online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Reduce JPG, PNG, and WebP file size right in your browser. Use a quality slider or target an exact size like 100KB, 200KB, or 50KB. Batch and download as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <CompressImageTool />
          </div>
        </section>
        <CompressImageSeo />
      </div>
    );
  }

  if (tool.slug === "image-resize") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Resize images online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Change JPG, PNG, and WebP dimensions right in your browser. Enter exact pixels, use a percent slider, or pick a preset for passport photo, signature, HD, or Full HD. Also compress to a target KB in the same pass.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <ImageResizeTool />
          </div>
        </section>
        <ImageResizeSeo />
      </div>
    );
  }

  if (tool.slug === "jpg-to-webp") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert JPG to WebP online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn JPG and JPEG images into modern WebP for faster websites and smaller files. Adjustable quality, batch convert, and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <JpgToWebpTool />
          </div>
        </section>
        <JpgToWebpSeo />
      </div>
    );
  }

  if (tool.slug === "png-to-webp") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Convert PNG to WebP online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Turn PNG images into modern WebP with transparency preserved. Ideal for logos, icons, and graphics on your website. Adjustable quality, batch convert, and download individually or as a ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <PngToWebpTool />
          </div>
        </section>
        <PngToWebpSeo />
      </div>
    );
  }

  if (tool.slug === "crop-image") {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16">
        <Breadcrumb name={tool.name} />
        <section className="flex flex-col pt-6 pb-10 text-center">
          <ToolHeaderIcon tool={tool} />
          <h1
            className="mx-auto text-[28px] sm:text-[42px]"
            style={{ color: "#383E45", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
          >
            Crop images online, free
          </h1>
          <p className="mx-auto mt-4 max-w-[620px] text-[15px] sm:text-[18px] text-[#6B7280]">
            Crop JPG, PNG, and WebP to any size right in your browser. Drag the crop box, lock a preset like 1:1, 16:9, 9:16, or passport 35x45, or enter exact pixels. Batch and ZIP.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-semibold text-[#047857]">
            Your files never leave your device
          </p>
          <div className="mt-10">
            <CropImageTool />
          </div>
        </section>
        <CropImageSeo />
      </div>
    );
  }

  return null;



}

function ToolHeaderIcon({ tool }: { tool: ImageTool }) {
  return (
    <div
      className="mx-auto mb-4"
      style={{ width: 64, height: 64 }}
      aria-hidden
    >
      <ImageToolIcon slug={tool.slug} size={64} radius={14} />
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
