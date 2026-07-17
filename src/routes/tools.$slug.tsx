import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { getTool, categoryTint } from "@/tools/registry";
import { MergePdfSeo, mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd } from "@/components/MergePdfSeo";
import { CompressPdfSeo, compressFaqJsonLd, compressHowToJsonLd, compressSoftwareJsonLd } from "@/components/CompressPdfSeo";
import { SplitPdfSeo, splitFaqJsonLd, splitHowToJsonLd, splitSoftwareJsonLd } from "@/components/SplitPdfSeo";
import { SignPdfSeo, signFaqJsonLd, signHowToJsonLd, signSoftwareJsonLd } from "@/components/SignPdfSeo";
import { PdfToImagesSeo, pdfToImagesFaqJsonLd, pdfToImagesHowToJsonLd, pdfToImagesSoftwareJsonLd } from "@/components/PdfToImagesSeo";
import { RedactPdfSeo, redactFaqJsonLd, redactHowToJsonLd, redactSoftwareJsonLd } from "@/components/RedactPdfSeo";


export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug, name: tool.name, description: tool.description };
  },
  head: ({ loaderData, params }) => {
    if (loaderData?.slug === "merge") {
      const title =
        "Merge PDF Online Free — Combine PDF Files Without Uploading | PDFfree";
      const desc =
        "Merge PDF files online free — no upload, no signup, no watermark. Your files never leave your device. Combine PDFs on any browser in seconds.";
      const url = "/tools/merge";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(mergeFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(mergeHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(mergeSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "compress") {
      const title =
        "Compress PDF Online Free — Reduce PDF File Size Without Uploading | PDFfree";
      const desc =
        "Compress PDF online free — reduce PDF file size in your browser. No upload, no signup, no watermark. Your files never leave your device.";
      const url = "/tools/compress";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(compressFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(compressHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(compressSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "split") {
      const title =
        "Split PDF Online Free — Separate PDF Pages Without Uploading | PDFfree";
      const desc =
        "Split PDF online free — separate pages or extract page ranges in your browser. No upload, no signup, no watermark. Files never leave your device.";
      const url = "/tools/split";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(splitFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(splitHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(splitSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "sign-pdf") {
      const title =
        "Sign PDF Online Free — Add Signature Without Uploading | PDFfree";
      const desc =
        "Sign PDF online free — draw, type, or upload your signature in your browser. No upload, no signup. Contracts never leave your device.";
      const url = "/tools/sign-pdf";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(signFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(signHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(signSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "pdf-to-images") {
      const title =
        "PDF to JPG Online Free — Convert PDF to Images Without Uploading | PDFfree";
      const desc =
        "Convert PDF to JPG or PNG online free — high quality, right in your browser. No upload, no signup, no watermark. Files never leave your device.";
      const url = "/tools/pdf-to-images";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(pdfToImagesFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfToImagesHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfToImagesSoftwareJsonLd) },
        ],
      };
    }
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.name} — PDFfree` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: `${loaderData.name} — PDFfree` },
            { property: "og:description", content: loaderData.description },
            { property: "og:url", content: `/tools/${params.slug}` },
          ]
        : [{ title: "Tool — PDFfree" }],
      links: loaderData ? [{ rel: "canonical", href: `/tools/${params.slug}` }] : [],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getTool(slug);
  if (!tool) return null;
  const Comp = tool.Component;

  const fallback = (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading tool…
    </div>
  );

  const isMerge = slug === "merge";
  const isCompress = slug === "compress";
  const isSplit = slug === "split";
  const isSign = slug === "sign-pdf";
  const isPdfToImages = slug === "pdf-to-images";

  const layoutTitle = isMerge
    ? "Merge PDF Files Online — Free, Private, No Uploads"
    : isCompress
    ? "Compress PDF Online — Reduce File Size, 100% Private"
    : isSplit
    ? "Split PDF Online — Separate Pages, 100% Private"
    : isSign
    ? "Sign PDF Online — Free Electronic Signature, 100% Private"
    : isPdfToImages
    ? "PDF to JPG Converter — Free, High Quality, 100% Private"
    : tool.name;

  return (
    <>
      <ToolLayout
        title={layoutTitle}
        description={tool.description}
        icon={tool.icon}
        tint={categoryTint[tool.category]}
      >
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <Comp />
          </Suspense>
        </ClientOnly>
      </ToolLayout>
      {isMerge && <MergePdfSeo />}
      {isCompress && <CompressPdfSeo />}
      {isSplit && <SplitPdfSeo />}
      {isSign && <SignPdfSeo />}
      {isPdfToImages && <PdfToImagesSeo />}
    </>
  );
}
