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
    title: "Merge PDF Online Free | FreePDFHub",
    desc: "Merge PDF files online free — no upload, no signup, no watermark. Your files never leave your device. Combine PDFs on any browser in seconds.",
    jsonLd: [mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd],
  },
  "compress": {
    title: "Compress PDF Online Free | FreePDFHub",
    desc: "Compress PDF online free — reduce PDF file size in your browser. No upload, no signup, no watermark. Your files never leave your device.",
    jsonLd: [compressFaqJsonLd, compressHowToJsonLd, compressSoftwareJsonLd],
  },
  "split": {
    title: "Split PDF Online Free | FreePDFHub",
    desc: "Split PDF online free — separate pages or extract page ranges in your browser. No upload, no signup, no watermark. Files never leave your device.",
    jsonLd: [splitFaqJsonLd, splitHowToJsonLd, splitSoftwareJsonLd],
  },
  "sign-pdf": {
    title: "Sign PDF Online Free | FreePDFHub",
    desc: "Sign PDF online free — draw, type, or upload your signature in your browser. No upload, no signup. Contracts never leave your device.",
    jsonLd: [signFaqJsonLd, signHowToJsonLd, signSoftwareJsonLd],
  },
  "pdf-to-images": {
    title: "PDF to JPG Converter Free | FreePDFHub",
    desc: "Convert PDF to JPG or PNG online free — high quality, right in your browser. No upload, no signup, no watermark. Files never leave your device.",
    jsonLd: [pdfToImagesFaqJsonLd, pdfToImagesHowToJsonLd, pdfToImagesSoftwareJsonLd],
  },
  "redact-pdf": {
    title: "Redact PDF Online Free | FreePDFHub",
    desc: "Redact PDF online free — permanently black out Aadhaar numbers, account details & sensitive text in your browser. No upload. Truly removed, not just covered.",
    jsonLd: [redactFaqJsonLd, redactHowToJsonLd, redactSoftwareJsonLd],
  },
  "protect-pdf": {
    title: "Password Protect PDF Free | FreePDFHub",
    desc: "Password protect PDF online free with real AES-256 encryption — in your browser. Your file AND password never leave your device. No signup.",
    jsonLd: [protectFaqJsonLd, protectHowToJsonLd, protectSoftwareJsonLd],
  },
  "unlock-pdf": {
    title: "Unlock PDF Online Free | FreePDFHub",
    desc: "Remove password from PDF online free — decrypt in your browser with the password you know. File and password never leave your device. No signup.",
    jsonLd: [unlockFaqJsonLd, unlockHowToJsonLd, unlockSoftwareJsonLd],
  },
  "watermark": {
    title: "Add Watermark to PDF Free | FreePDFHub",
    desc: "Add watermark to PDF online free — stamp text like CONFIDENTIAL or your brand on every page, in your browser. No upload, no signup, no watermark ads.",
    jsonLd: [watermarkFaqJsonLd, watermarkHowToJsonLd, watermarkSoftwareJsonLd],
  },
  "rotate": {
    title: "Rotate PDF Online Free | FreePDFHub",
    desc: "Rotate PDF pages online free and save permanently — fix sideways or upside-down pages in your browser. No upload, no signup, no watermark.",
    jsonLd: [rotateFaqJsonLd, rotateHowToJsonLd, rotateSoftwareJsonLd],
  },
  "delete-pages": {
    title: "Delete Pages from PDF Free | FreePDFHub",
    desc: "Delete pages from PDF online free — remove unwanted pages in your browser and download a clean copy. No upload, no signup, no watermark.",
    jsonLd: [deletePagesFaqJsonLd, deletePagesHowToJsonLd, deletePagesSoftwareJsonLd],
  },
  "extract-pages": {
    title: "Extract PDF Pages Online Free | FreePDFHub",
    desc: "Extract pages from PDF online free — save specific pages as a new PDF, in your browser. No upload, no signup, no watermark. Files stay on your device.",
    jsonLd: [extractPagesFaqJsonLd, extractPagesHowToJsonLd, extractPagesSoftwareJsonLd],
  },
  "reorder-pages": {
    title: "Reorder PDF Pages Online Free | FreePDFHub",
    desc: "Rearrange PDF pages online free — drag and drop pages into the right order in your browser. No upload, no signup, no watermark.",
    jsonLd: [reorderPagesFaqJsonLd, reorderPagesHowToJsonLd, reorderPagesSoftwareJsonLd],
  },
  "images-to-pdf": {
    title: "JPG to PDF Converter Free | FreePDFHub",
    desc: "Convert JPG, PNG images to PDF online free — combine photos into one PDF in your browser. No upload, no signup, no watermark.",
    jsonLd: [imagesToPdfFaqJsonLd, imagesToPdfHowToJsonLd, imagesToPdfSoftwareJsonLd],
  },
  "pdf-to-text": {
    title: "PDF to Text Online Free | FreePDFHub",
    desc: "Extract text from PDF online free — copy all text or download as .txt, right in your browser. No upload, no signup. Files never leave your device.",
    jsonLd: [pdfToTextFaqJsonLd, pdfToTextHowToJsonLd, pdfToTextSoftwareJsonLd],
  },
  "txt-to-pdf": {
    title: "TXT to PDF Online Free | FreePDFHub",
    desc: "Convert TXT to PDF online free — clean, printable PDFs from text files, in your browser. Supports Hindi & other languages. No upload, no signup.",
    jsonLd: [txtToPdfFaqJsonLd, txtToPdfHowToJsonLd, txtToPdfSoftwareJsonLd],
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free | FreePDFHub",
    desc: "Add page numbers to PDF online free — choose position, format and starting number, in your browser. No upload, no signup, no watermark.",
    jsonLd: [pageNumbersFaqJsonLd, pageNumbersHowToJsonLd, pageNumbersSoftwareJsonLd],
  },
  "header-footer": {
    title: "Add Header & Footer to PDF Free | FreePDFHub",
    desc: "Add headers and footers to PDF online free — title, date, filename or page numbers on every page, in your browser. No upload, no signup.",
    jsonLd: [headerFooterFaqJsonLd, headerFooterHowToJsonLd, headerFooterSoftwareJsonLd],
  },
  "crop": {
    title: "Crop PDF Online Free | FreePDFHub",
    desc: "Crop PDF online free — trim white margins and unwanted edges in your browser. No upload, no signup, no watermark. Files never leave your device.",
    jsonLd: [cropPdfFaqJsonLd, cropPdfHowToJsonLd, cropPdfSoftwareJsonLd],
  },
  "edit-pdf": {
    title: "Edit PDF Online Free | FreePDFHub",
    desc: "Edit PDF online free — add text, highlights, shapes and freehand notes in your browser. No upload, no signup, no watermark.",
    jsonLd: [editPdfFaqJsonLd, editPdfHowToJsonLd, editPdfSoftwareJsonLd],
  },
  "fill-forms": {
    title: "Fill PDF Forms Online Free | FreePDFHub",
    desc: "Fill out PDF forms online free — type into text fields, tick checkboxes and select options in your browser. No upload, no signup, no watermark.",
    jsonLd: [fillFormsFaqJsonLd, fillFormsHowToJsonLd, fillFormsSoftwareJsonLd],
  },
  "flatten-pdf": {
    title: "Flatten PDF Online Free | FreePDFHub",
    desc: "Flatten PDF online free — lock form fields so answers can't be changed. Runs in your browser: no upload, no signup, no watermark.",
    jsonLd: [flattenPdfFaqJsonLd, flattenPdfHowToJsonLd, flattenPdfSoftwareJsonLd],
  },
  "pdf-metadata": {
    title: "Edit PDF Metadata Online Free | FreePDFHub",
    desc: "View, edit or remove PDF metadata online free — title, author & hidden properties, in your browser. No upload. Clean files before sharing.",
    jsonLd: [pdfMetadataFaqJsonLd, pdfMetadataHowToJsonLd, pdfMetadataSoftwareJsonLd],
  },
  "grayscale-pdf": {
    title: "Grayscale PDF Converter Free | FreePDFHub",
    desc: "Convert PDF to grayscale online free — black and white pages in your browser. Save printer ink and shrink scans. No upload, no signup.",
    jsonLd: [grayscalePdfFaqJsonLd, grayscalePdfHowToJsonLd, grayscalePdfSoftwareJsonLd],
  },
  "add-blank-pages": {
    title: "Add Blank Pages to PDF Free | FreePDFHub",
    desc: "Insert blank pages into a PDF online free — anywhere in the document, in your browser. No upload, no signup, no watermark.",
    jsonLd: [addBlankPagesFaqJsonLd, addBlankPagesHowToJsonLd, addBlankPagesSoftwareJsonLd],
  },
  "scan-to-pdf": {
    title: "Scan to PDF Online Free | FreePDFHub",
    desc: "Scan documents to PDF free using your phone camera — right in the browser, no app install. No upload, no signup. Scans never leave your device.",
    jsonLd: [scanToPdfFaqJsonLd, scanToPdfHowToJsonLd, scanToPdfSoftwareJsonLd],
  },
  "extract-images": {
    title: "Extract Images from PDF Free | FreePDFHub",
    desc: "Extract images from PDF online free — pull out the original embedded photos at full quality, in your browser. No upload, no signup.",
    jsonLd: [extractImagesFaqJsonLd, extractImagesHowToJsonLd, extractImagesSoftwareJsonLd],
  },
  "compare": {
    title: "Compare PDF Files Online Free | FreePDFHub",
    desc: "Compare two PDFs online free — spot every changed page side by side in your browser. No upload, no signup. Both files stay on your device.",
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
        scripts: meta.jsonLd.map((v) => ({
          type: "application/ld+json",
          children: JSON.stringify(v),
        })),
      };
    }
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.name} — FreePDFHub` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: `${loaderData.name} — FreePDFHub` },
            { property: "og:description", content: loaderData.description },
            { property: "og:url", content: url },
            { property: "og:image", content: OG_IMAGE },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:image", content: OG_IMAGE },
          ]
        : [{ title: "Tool — FreePDFHub" }],
      links: loaderData ? [{ rel: "canonical", href: url }] : [],
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
