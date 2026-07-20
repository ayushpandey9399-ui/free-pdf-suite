import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { getTool, categoryTint } from "@/tools/registry";
import { SITE_URL } from "@/lib/site";
import { MergePdfSeo, mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd } from "@/components/MergePdfSeo";
import { CompressPdfSeo, compressFaqJsonLd, compressHowToJsonLd, compressSoftwareJsonLd } from "@/components/CompressPdfSeo";
import { SplitPdfSeo, splitFaqJsonLd, splitHowToJsonLd, splitSoftwareJsonLd } from "@/components/SplitPdfSeo";
import { SignPdfSeo, signFaqJsonLd, signHowToJsonLd, signSoftwareJsonLd } from "@/components/SignPdfSeo";
import { PdfToImagesSeo, pdfToImagesFaqJsonLd, pdfToImagesHowToJsonLd, pdfToImagesSoftwareJsonLd } from "@/components/PdfToImagesSeo";
import { RedactPdfSeo, redactFaqJsonLd, redactHowToJsonLd, redactSoftwareJsonLd } from "@/components/RedactPdfSeo";
import { ProtectPdfSeo, protectFaqJsonLd, protectHowToJsonLd, protectSoftwareJsonLd } from "@/components/ProtectPdfSeo";
import { UnlockPdfSeo, unlockFaqJsonLd, unlockHowToJsonLd, unlockSoftwareJsonLd } from "@/components/UnlockPdfSeo";
import { WatermarkPdfSeo, watermarkFaqJsonLd, watermarkHowToJsonLd, watermarkSoftwareJsonLd } from "@/components/WatermarkPdfSeo";
import { RotatePdfSeo, rotateFaqJsonLd, rotateHowToJsonLd, rotateSoftwareJsonLd } from "@/components/RotatePdfSeo";
import { DeletePagesSeo, deletePagesFaqJsonLd, deletePagesHowToJsonLd, deletePagesSoftwareJsonLd } from "@/components/DeletePagesSeo";
import { ExtractPagesSeo, extractPagesFaqJsonLd, extractPagesHowToJsonLd, extractPagesSoftwareJsonLd } from "@/components/ExtractPagesSeo";
import { ReorderPagesSeo, reorderPagesFaqJsonLd, reorderPagesHowToJsonLd, reorderPagesSoftwareJsonLd } from "@/components/ReorderPagesSeo";
import { ImagesToPdfSeo, imagesToPdfFaqJsonLd, imagesToPdfHowToJsonLd, imagesToPdfSoftwareJsonLd } from "@/components/ImagesToPdfSeo";
import { PdfToTextSeo, pdfToTextFaqJsonLd, pdfToTextHowToJsonLd, pdfToTextSoftwareJsonLd } from "@/components/PdfToTextSeo";
import { TxtToPdfSeo, txtToPdfFaqJsonLd, txtToPdfHowToJsonLd, txtToPdfSoftwareJsonLd } from "@/components/TxtToPdfSeo";
import { PageNumbersSeo, pageNumbersFaqJsonLd, pageNumbersHowToJsonLd, pageNumbersSoftwareJsonLd } from "@/components/PageNumbersSeo";
import { HeaderFooterSeo, headerFooterFaqJsonLd, headerFooterHowToJsonLd, headerFooterSoftwareJsonLd } from "@/components/HeaderFooterSeo";
import { CropPdfSeo, cropPdfFaqJsonLd, cropPdfHowToJsonLd, cropPdfSoftwareJsonLd } from "@/components/CropPdfSeo";
import { EditPdfSeo, editPdfFaqJsonLd, editPdfHowToJsonLd, editPdfSoftwareJsonLd } from "@/components/EditPdfSeo";
import { FillFormsSeo, fillFormsFaqJsonLd, fillFormsHowToJsonLd, fillFormsSoftwareJsonLd } from "@/components/FillFormsSeo";
import { FlattenPdfSeo, flattenPdfFaqJsonLd, flattenPdfHowToJsonLd, flattenPdfSoftwareJsonLd } from "@/components/FlattenPdfSeo";
import { PdfMetadataSeo, pdfMetadataFaqJsonLd, pdfMetadataHowToJsonLd, pdfMetadataSoftwareJsonLd } from "@/components/PdfMetadataSeo";
import { GrayscalePdfSeo, grayscalePdfFaqJsonLd, grayscalePdfHowToJsonLd, grayscalePdfSoftwareJsonLd } from "@/components/GrayscalePdfSeo";
import { AddBlankPagesSeo, addBlankPagesFaqJsonLd, addBlankPagesHowToJsonLd, addBlankPagesSoftwareJsonLd } from "@/components/AddBlankPagesSeo";
import { ScanToPdfSeo, scanToPdfFaqJsonLd, scanToPdfHowToJsonLd, scanToPdfSoftwareJsonLd } from "@/components/ScanToPdfSeo";
import { ExtractImagesSeo, extractImagesFaqJsonLd, extractImagesHowToJsonLd, extractImagesSoftwareJsonLd } from "@/components/ExtractImagesSeo";
import { ComparePdfSeo, compareFaqJsonLd, compareHowToJsonLd, compareSoftwareJsonLd } from "@/components/ComparePdfSeo";

const OG_IMAGE = `${SITE_URL}/og-cover.png`;

type ToolMeta = {
  title: string;
  desc: string;
  jsonLd: readonly unknown[];
};

const TOOL_META: Record<string, ToolMeta> = {
  "merge": {
    title: "Merge PDF Free, No Signup or Watermark | FreePDFHub",
    desc: "Merge PDF files online free and combine multiple documents into one clean file. Works right in your browser with no signup and no watermark added.",
    jsonLd: [mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd],
  },
  "compress": {
    title: "Compress PDF Online Free, No Watermark | FreePDFHub",
    desc: "Compress PDF file size online free without losing quality. Shrink large scans and reports in your browser so they fit email limits and load faster.",
    jsonLd: [compressFaqJsonLd, compressHowToJsonLd, compressSoftwareJsonLd],
  },
  "split": {
    title: "Split PDF Free, No Signup or Watermark | FreePDFHub",
    desc: "Split PDF into separate files or extract page ranges online free. Runs offline in your browser, so you can break up long documents without an account.",
    jsonLd: [splitFaqJsonLd, splitHowToJsonLd, splitSoftwareJsonLd],
  },
  "sign-pdf": {
    title: "Sign PDF Free in Your Browser, No Signup | FreePDFHub",
    desc: "Sign PDF documents online free by drawing, typing, or uploading your signature. Place it anywhere on any page and download a signed copy in seconds.",
    jsonLd: [signFaqJsonLd, signHowToJsonLd, signSoftwareJsonLd],
  },
  "pdf-to-images": {
    title: "PDF to JPG Converter Free, No Signup Needed | FreePDFHub",
    desc: "Convert PDF to JPG or PNG online free at high resolution. Each page becomes a separate image, processed in your browser with no signup required.",
    jsonLd: [pdfToImagesFaqJsonLd, pdfToImagesHowToJsonLd, pdfToImagesSoftwareJsonLd],
  },
  "redact-pdf": {
    title: "Redact PDF Free, Truly Private in Browser | FreePDFHub",
    desc: "Redact PDF online free and permanently black out names, Aadhaar numbers, or account details. Text is truly removed from the file, not just covered.",
    jsonLd: [redactFaqJsonLd, redactHowToJsonLd, redactSoftwareJsonLd],
  },
  "protect-pdf": {
    title: "Password Protect PDF Free, AES 256 Secure | FreePDFHub",
    desc: "Password protect PDF online free with real AES-256 encryption. Set a password directly in your browser, so your file and password stay on your device.",
    jsonLd: [protectFaqJsonLd, protectHowToJsonLd, protectSoftwareJsonLd],
  },
  "unlock-pdf": {
    title: "Unlock PDF Free in Your Browser, No Signup | FreePDFHub",
    desc: "Unlock a password protected PDF online free using the password you already know. Decryption runs in your browser with no account or upload needed.",
    jsonLd: [unlockFaqJsonLd, unlockHowToJsonLd, unlockSoftwareJsonLd],
  },
  "watermark": {
    title: "Add Watermark to PDF Free, No Signup Needed | FreePDFHub",
    desc: "Add a watermark to PDF online free. Stamp text like CONFIDENTIAL, DRAFT, or your brand across every page, with adjustable size, angle, and opacity.",
    jsonLd: [watermarkFaqJsonLd, watermarkHowToJsonLd, watermarkSoftwareJsonLd],
  },
  "rotate": {
    title: "Rotate PDF Pages Free, Save Permanently | FreePDFHub",
    desc: "Rotate PDF pages online free and save the change permanently. Fix sideways or upside-down pages one at a time or in bulk, right from your browser.",
    jsonLd: [rotateFaqJsonLd, rotateHowToJsonLd, rotateSoftwareJsonLd],
  },
  "delete-pages": {
    title: "Delete PDF Pages Free, No Signup Needed | FreePDFHub",
    desc: "Delete pages from a PDF online free. Pick unwanted pages in the thumbnail view and download a clean copy of the document without them in seconds.",
    jsonLd: [deletePagesFaqJsonLd, deletePagesHowToJsonLd, deletePagesSoftwareJsonLd],
  },
  "extract-pages": {
    title: "Extract PDF Pages Free, No Watermark Added | FreePDFHub",
    desc: "Extract pages from PDF online free and save any selection as a new document. Great for pulling one chapter or invoice out of a longer report.",
    jsonLd: [extractPagesFaqJsonLd, extractPagesHowToJsonLd, extractPagesSoftwareJsonLd],
  },
  "reorder-pages": {
    title: "Reorder PDF Pages Free, Drag and Drop | FreePDFHub",
    desc: "Reorder PDF pages online free with drag and drop. Rearrange chapters, invoices, or scan sheets into the right order and download the updated file.",
    jsonLd: [reorderPagesFaqJsonLd, reorderPagesHowToJsonLd, reorderPagesSoftwareJsonLd],
  },
  "images-to-pdf": {
    title: "JPG to PDF Converter Free, No Watermark | FreePDFHub",
    desc: "Convert JPG or PNG images to PDF online free. Combine phone photos, screenshots, and scans into one tidy document with A4, Letter, or auto page sizes.",
    jsonLd: [imagesToPdfFaqJsonLd, imagesToPdfHowToJsonLd, imagesToPdfSoftwareJsonLd],
  },
  "pdf-to-text": {
    title: "PDF to Text Free, Copy or Download TXT | FreePDFHub",
    desc: "Extract text from PDF online free. Copy the full contents to your clipboard or download a clean .txt file, all processed locally in your browser.",
    jsonLd: [pdfToTextFaqJsonLd, pdfToTextHowToJsonLd, pdfToTextSoftwareJsonLd],
  },
  "txt-to-pdf": {
    title: "TXT to PDF Free, Unicode and Hindi Ready | FreePDFHub",
    desc: "Convert TXT to PDF online free with clean typography and proper page breaks. Supports Hindi, Tamil, Arabic, Chinese, and other non-Latin scripts.",
    jsonLd: [txtToPdfFaqJsonLd, txtToPdfHowToJsonLd, txtToPdfSoftwareJsonLd],
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free, No Signup | FreePDFHub",
    desc: "Add page numbers to PDF online free. Choose position, starting number, and format like 1 of 20 or Roman numerals, and preview before you download.",
    jsonLd: [pageNumbersFaqJsonLd, pageNumbersHowToJsonLd, pageNumbersSoftwareJsonLd],
  },
  "header-footer": {
    title: "Add Header and Footer to PDF Free, No Signup | FreePDFHub",
    desc: "Add headers and footers to PDF online free. Print titles, dates, filenames, or page counts on every page with custom fonts and alignment options.",
    jsonLd: [headerFooterFaqJsonLd, headerFooterHowToJsonLd, headerFooterSoftwareJsonLd],
  },
  "crop": {
    title: "Crop PDF Free with Live Preview in Browser | FreePDFHub",
    desc: "Crop PDF online free to trim white margins or cut unwanted edges from scans. Live preview shows the exact crop box before you save the updated file.",
    jsonLd: [cropPdfFaqJsonLd, cropPdfHowToJsonLd, cropPdfSoftwareJsonLd],
  },
  "edit-pdf": {
    title: "Edit PDF Text Free Right in Your Browser | FreePDFHub",
    desc: "Edit existing PDF text in your browser. Click any line, retype it, and we match the original style. Also highlight, draw, and add images for free.",
    jsonLd: [editPdfFaqJsonLd, editPdfHowToJsonLd, editPdfSoftwareJsonLd],
  },
  "fill-forms": {
    title: "Fill PDF Forms Free, No Signup or Upload | FreePDFHub",
    desc: "Fill out PDF forms online free. Type into text fields, tick checkboxes, and pick options, then download the completed form ready to send or print.",
    jsonLd: [fillFormsFaqJsonLd, fillFormsHowToJsonLd, fillFormsSoftwareJsonLd],
  },
  "flatten-pdf": {
    title: "Flatten PDF Free, Lock Fields and Notes | FreePDFHub",
    desc: "Flatten PDF online free to lock form fields and annotations into the page. Recipients can view but not change the answers, and printing stays sharp.",
    jsonLd: [flattenPdfFaqJsonLd, flattenPdfHowToJsonLd, flattenPdfSoftwareJsonLd],
  },
  "pdf-metadata": {
    title: "Edit PDF Metadata Free, Clean Hidden Info | FreePDFHub",
    desc: "View, edit, or remove PDF metadata online free including title, author, subject, and keywords. Clean hidden properties before sharing sensitive files.",
    jsonLd: [pdfMetadataFaqJsonLd, pdfMetadataHowToJsonLd, pdfMetadataSoftwareJsonLd],
  },
  "grayscale-pdf": {
    title: "Grayscale PDF Free, Save Ink and File Size | FreePDFHub",
    desc: "Convert PDF to grayscale online free. Turn color pages into clean black and white to save printer ink, shrink file size, and prep documents for print.",
    jsonLd: [grayscalePdfFaqJsonLd, grayscalePdfHowToJsonLd, grayscalePdfSoftwareJsonLd],
  },
  "add-blank-pages": {
    title: "Add Blank Pages to PDF Free, Any Position | FreePDFHub",
    desc: "Insert blank pages into a PDF online free at any position. Add spacers between chapters, signature pages, or notes pages before you download.",
    jsonLd: [addBlankPagesFaqJsonLd, addBlankPagesHowToJsonLd, addBlankPagesSoftwareJsonLd],
  },
  "scan-to-pdf": {
    title: "Scan to PDF Free with Your Phone Camera | FreePDFHub",
    desc: "Scan documents to PDF free with your phone camera, right in the browser. No app to install. Capture multiple pages and export them as a single PDF.",
    jsonLd: [scanToPdfFaqJsonLd, scanToPdfHowToJsonLd, scanToPdfSoftwareJsonLd],
  },
  "extract-images": {
    title: "Extract Images from PDF Free, Full Quality | FreePDFHub",
    desc: "Extract images from PDF online free. Pull out the original embedded photos, logos, and figures at full quality, then download them individually.",
    jsonLd: [extractImagesFaqJsonLd, extractImagesHowToJsonLd, extractImagesSoftwareJsonLd],
  },
  "compare": {
    title: "Compare Two PDF Files Free, Side by Side | FreePDFHub",
    desc: "Compare two PDF files online free and see every changed page side by side. Switch between visual diff and text diff to spot edits in contracts fast.",
    jsonLd: [compareFaqJsonLd, compareHowToJsonLd, compareSoftwareJsonLd],
  },
};

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug, name: tool.name, description: tool.description };
  },
  head: ({ loaderData, params }) => {
    const slug = loaderData?.slug ?? params.slug;
    const url = `${SITE_URL}/tools/${slug}`;
    const crumbName = loaderData?.name ?? "Tool";
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "All tools", item: `${SITE_URL}/#tools` },
        { "@type": "ListItem", position: 3, name: crumbName, item: url },
      ],
    };
    const meta = TOOL_META[slug];
    if (meta) {
      return {
        meta: [
          { title: meta.title },
          { name: "description", content: meta.desc },
          { property: "og:title", content: meta.title },
          { property: "og:description", content: meta.desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { property: "og:image", content: OG_IMAGE },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: meta.title },
          { name: "twitter:description", content: meta.desc },
          { name: "twitter:image", content: OG_IMAGE },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          ...meta.jsonLd.map((v) => ({
            type: "application/ld+json",
            children: JSON.stringify(v),
          })),
          {
            type: "application/ld+json",
            children: JSON.stringify(breadcrumbJsonLd),
          },
        ],
      };
    }
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.name} | FreePDFHub` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: `${loaderData.name}, FreePDFHub` },
            { property: "og:description", content: loaderData.description },
            { property: "og:url", content: url },
            { property: "og:image", content: OG_IMAGE },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:image", content: OG_IMAGE },
          ]
        : [{ title: "Tool | FreePDFHub" }],
      links: loaderData ? [{ rel: "canonical", href: url }] : [],
      scripts: loaderData
        ? [{ type: "application/ld+json", children: JSON.stringify(breadcrumbJsonLd) }]
        : [],
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
  const isRedact = slug === "redact-pdf";
  const isProtect = slug === "protect-pdf";
  const isUnlock = slug === "unlock-pdf";
  const isWatermark = slug === "watermark";
  const isRotate = slug === "rotate";
  const isDeletePages = slug === "delete-pages";
  const isExtractPages = slug === "extract-pages";
  const isReorderPages = slug === "reorder-pages";
  const isImagesToPdf = slug === "images-to-pdf";
  const isPdfToText = slug === "pdf-to-text";
  const isTxtToPdf = slug === "txt-to-pdf";
  const isPageNumbers = slug === "page-numbers";
  const isHeaderFooter = slug === "header-footer";
  const isCrop = slug === "crop";
  const isEditPdf = slug === "edit-pdf";
  const isFillForms = slug === "fill-forms";
  const isFlattenPdf = slug === "flatten-pdf";
  const isPdfMetadata = slug === "pdf-metadata";
  const isGrayscale = slug === "grayscale-pdf";
  const isAddBlankPages = slug === "add-blank-pages";
  const isScanToPdf = slug === "scan-to-pdf";
  const isExtractImages = slug === "extract-images";
  const isCompare = slug === "compare";

  const layoutTitle = isMerge
    ? "Merge PDF files online"
    : isCompress
    ? "Compress PDF online"
    : isSplit
    ? "Split PDF files"
    : isSign
    ? "Sign PDF online"
    : isPdfToImages
    ? "Convert PDF to JPG"
    : isRedact
    ? "Redact PDF online"
    : isProtect
    ? "Protect PDF with a password"
    : isUnlock
    ? "Unlock PDF online"
    : isWatermark
    ? "Watermark PDF online"
    : isRotate
    ? "Rotate PDF pages"
    : isDeletePages
    ? "Delete PDF pages"
    : isExtractPages
    ? "Extract PDF pages"
    : isReorderPages
    ? "Reorder PDF pages"
    : isImagesToPdf
    ? "Convert JPG to PDF"
    : isPdfToText
    ? "Convert PDF to text"
    : isTxtToPdf
    ? "Convert TXT to PDF"
    : isPageNumbers
    ? "Add page numbers to PDF"
    : isHeaderFooter
    ? "Add header and footer to PDF"
    : isCrop
    ? "Crop PDF online"
    : isEditPdf
    ? "Edit PDF online"
    : isFillForms
    ? "Fill PDF forms online"
    : isFlattenPdf
    ? "Flatten PDF online"
    : isPdfMetadata
    ? "Edit PDF metadata"
    : isGrayscale
    ? "Convert PDF to grayscale"
    : isAddBlankPages
    ? "Add blank pages to PDF"
    : isScanToPdf
    ? "Scan documents to PDF"
    : isExtractImages
    ? "Extract images from PDF"
    : isCompare
    ? "Compare two PDFs"
    : tool.name;

  return (
    <>
      <ToolLayout
        title={layoutTitle}
        description={tool.description}
        crumbName={tool.name}
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
      {isRedact && <RedactPdfSeo />}
      {isProtect && <ProtectPdfSeo />}
      {isUnlock && <UnlockPdfSeo />}
      {isWatermark && <WatermarkPdfSeo />}
      {isRotate && <RotatePdfSeo />}
      {isDeletePages && <DeletePagesSeo />}
      {isExtractPages && <ExtractPagesSeo />}
      {isReorderPages && <ReorderPagesSeo />}
      {isImagesToPdf && <ImagesToPdfSeo />}
      {isPdfToText && <PdfToTextSeo />}
      {isTxtToPdf && <TxtToPdfSeo />}
      {isPageNumbers && <PageNumbersSeo />}
      {isHeaderFooter && <HeaderFooterSeo />}
      {isCrop && <CropPdfSeo />}
      {isEditPdf && <EditPdfSeo />}
      {isFillForms && <FillFormsSeo />}
      {isFlattenPdf && <FlattenPdfSeo />}
      {isPdfMetadata && <PdfMetadataSeo />}
      {isGrayscale && <GrayscalePdfSeo />}
      {isAddBlankPages && <AddBlankPagesSeo />}
      {isScanToPdf && <ScanToPdfSeo />}
      {isExtractImages && <ExtractImagesSeo />}
      {isCompare && <ComparePdfSeo />}
    </>
  );
}
