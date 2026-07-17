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
    if (loaderData?.slug === "redact-pdf") {
      const title =
        "Redact PDF Online Free — Black Out Text Permanently, No Upload | PDFfree";
      const desc =
        "Redact PDF online free — permanently black out Aadhaar numbers, account details & sensitive text in your browser. No upload. Truly removed, not just covered.";
      const url = "/tools/redact-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(redactFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(redactHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(redactSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "protect-pdf") {
      const title =
        "Password Protect PDF Online Free — Encrypt Without Uploading | PDFfree";
      const desc =
        "Password protect PDF online free with real AES-256 encryption — in your browser. Your file AND password never leave your device. No signup.";
      const url = "/tools/protect-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(protectFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(protectHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(protectSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "unlock-pdf") {
      const title =
        "Unlock PDF Online Free — Remove Password Without Uploading | PDFfree";
      const desc =
        "Remove password from PDF online free — decrypt in your browser with the password you know. File and password never leave your device. No signup.";
      const url = "/tools/unlock-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(unlockFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(unlockHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(unlockSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "watermark") {
      const title =
        "Add Watermark to PDF Online Free — Text Watermark, No Upload | PDFfree";
      const desc =
        "Add watermark to PDF online free — stamp text like CONFIDENTIAL or your brand on every page, in your browser. No upload, no signup, no watermark ads.";
      const url = "/tools/watermark";
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
          { type: "application/ld+json", children: JSON.stringify(watermarkFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(watermarkHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(watermarkSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "rotate") {
      const title =
        "Rotate PDF Online Free — Rotate & Save Permanently, No Upload | PDFfree";
      const desc =
        "Rotate PDF pages online free and save permanently — fix sideways or upside-down pages in your browser. No upload, no signup, no watermark.";
      const url = "/tools/rotate";
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
          { type: "application/ld+json", children: JSON.stringify(rotateFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(rotateHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(rotateSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "delete-pages") {
      const title =
        "Delete Pages from PDF Online Free — Remove Pages, No Upload | PDFfree";
      const desc =
        "Delete pages from PDF online free — remove unwanted pages in your browser and download a clean copy. No upload, no signup, no watermark.";
      const url = "/tools/delete-pages";
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
          { type: "application/ld+json", children: JSON.stringify(deletePagesFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(deletePagesHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(deletePagesSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "extract-pages") {
      const title =
        "Extract Pages from PDF Online Free — Save Specific Pages | PDFfree";
      const desc =
        "Extract pages from PDF online free — save specific pages as a new PDF, in your browser. No upload, no signup, no watermark. Files stay on your device.";
      const url = "/tools/extract-pages";
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
          { type: "application/ld+json", children: JSON.stringify(extractPagesFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(extractPagesHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(extractPagesSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "reorder-pages") {
      const title =
        "Reorder PDF Pages Online Free — Rearrange by Drag & Drop | PDFfree";
      const desc =
        "Rearrange PDF pages online free — drag and drop pages into the right order in your browser. No upload, no signup, no watermark.";
      const url = "/tools/reorder-pages";
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
          { type: "application/ld+json", children: JSON.stringify(reorderPagesFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(reorderPagesHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(reorderPagesSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "images-to-pdf") {
      const title =
        "JPG to PDF Online Free — Convert Images to PDF, No Upload | PDFfree";
      const desc =
        "Convert JPG, PNG images to PDF online free — combine photos into one PDF in your browser. No upload, no signup, no watermark.";
      const url = "/tools/images-to-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(imagesToPdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(imagesToPdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(imagesToPdfSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "pdf-to-text") {
      const title =
        "PDF to Text Online Free — Extract Text From PDF, No Upload | PDFfree";
      const desc =
        "Extract text from PDF online free — copy all text or download as .txt, right in your browser. No upload, no signup. Files never leave your device.";
      const url = "/tools/pdf-to-text";
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
          { type: "application/ld+json", children: JSON.stringify(pdfToTextFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfToTextHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfToTextSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "txt-to-pdf") {
      const title =
        "TXT to PDF Online Free — Convert Text to PDF (Hindi Supported) | PDFfree";
      const desc =
        "Convert TXT to PDF online free — clean, printable PDFs from text files, in your browser. Supports Hindi & other languages. No upload, no signup.";
      const url = "/tools/txt-to-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(txtToPdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(txtToPdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(txtToPdfSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "page-numbers") {
      const title =
        "Add Page Numbers to PDF Online Free — No Upload | PDFfree";
      const desc =
        "Add page numbers to PDF online free — choose position, format and starting number, in your browser. No upload, no signup, no watermark.";
      const url = "/tools/page-numbers";
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
          { type: "application/ld+json", children: JSON.stringify(pageNumbersFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pageNumbersHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pageNumbersSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "header-footer") {
      const title =
        "Add Header & Footer to PDF Online Free — Text, Date, Page Numbers | PDFfree";
      const desc =
        "Add headers and footers to PDF online free — title, date, filename or page numbers on every page, in your browser. No upload, no signup.";
      const url = "/tools/header-footer";
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
          { type: "application/ld+json", children: JSON.stringify(headerFooterFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(headerFooterHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(headerFooterSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "crop") {
      const title =
        "Crop PDF Online Free — Trim Margins & White Space, No Upload | PDFfree";
      const desc =
        "Crop PDF online free — trim white margins and unwanted edges in your browser. No upload, no signup, no watermark. Files never leave your device.";
      const url = "/tools/crop";
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
          { type: "application/ld+json", children: JSON.stringify(cropPdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(cropPdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(cropPdfSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "edit-pdf") {
      const title =
        "Edit PDF Online Free — Add Text, Highlight & Draw, No Upload | PDFfree";
      const desc =
        "Edit PDF online free — add text, highlights, shapes and freehand notes in your browser. No upload, no signup, no watermark.";
      const url = "/tools/edit-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(editPdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(editPdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(editPdfSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "fill-forms") {
      const title =
        "Fill PDF Form Online Free — Type Into Forms, No Upload | PDFfree";
      const desc =
        "Fill out PDF forms online free — type into text fields, tick checkboxes and select options in your browser. No upload, no signup, no watermark.";
      const url = "/tools/fill-forms";
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
          { type: "application/ld+json", children: JSON.stringify(fillFormsFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(fillFormsHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(fillFormsSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "flatten-pdf") {
      const title =
        "Flatten PDF Online Free — Make Form Fields Permanent | PDFfree";
      const desc =
        "Flatten PDF online free — lock form fields so answers can't be changed. Runs in your browser: no upload, no signup, no watermark.";
      const url = "/tools/flatten-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(flattenPdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(flattenPdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(flattenPdfSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "pdf-metadata") {
      const title =
        "Edit PDF Metadata Online Free — View, Change & Remove Properties | PDFfree";
      const desc =
        "View, edit or remove PDF metadata online free — title, author & hidden properties, in your browser. No upload. Clean files before sharing.";
      const url = "/tools/pdf-metadata";
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
          { type: "application/ld+json", children: JSON.stringify(pdfMetadataFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfMetadataHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(pdfMetadataSoftwareJsonLd) },
        ],
      };
    }
    if (loaderData?.slug === "grayscale-pdf") {
      const title =
        "Convert PDF to Grayscale Online Free — Black & White PDF | PDFfree";
      const desc =
        "Convert PDF to grayscale online free — black and white pages in your browser. Save printer ink and shrink scans. No upload, no signup.";
      const url = "/tools/grayscale-pdf";
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
          { type: "application/ld+json", children: JSON.stringify(grayscalePdfFaqJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(grayscalePdfHowToJsonLd) },
          { type: "application/ld+json", children: JSON.stringify(grayscalePdfSoftwareJsonLd) },
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
    : isRedact
    ? "Redact PDF Online — Permanently Remove Sensitive Information"
    : isProtect
    ? "Password Protect PDF — Free AES-256 Encryption, 100% Private"
    : isUnlock
    ? "Unlock PDF — Remove Password From PDF, 100% Private"
    : isWatermark
    ? "Add Watermark to PDF — Free, Every Page, 100% Private"
    : isRotate
    ? "Rotate PDF — Fix Sideways Pages and Save Permanently"
    : isDeletePages
    ? "Delete Pages from PDF — Remove Unwanted Pages, 100% Private"
    : isExtractPages
    ? "Extract Pages from PDF — Save Only the Pages You Need"
    : isReorderPages
    ? "Reorder PDF Pages — Drag, Drop, Done. 100% Private"
    : isImagesToPdf
    ? "JPG to PDF Converter — Combine Images Into One PDF, Free"
    : isPdfToText
    ? "PDF to Text — Extract All Text From a PDF, 100% Private"
    : isTxtToPdf
    ? "TXT to PDF — Convert Text Files to Clean PDFs, Free"
    : isPageNumbers
    ? "Add Page Numbers to PDF — Free, Any Position, 100% Private"
    : isHeaderFooter
    ? "Add Header & Footer to PDF — Every Page, 100% Private"
    : isCrop
    ? "Crop PDF — Trim Margins and Unwanted Edges, 100% Private"
    : isEditPdf
    ? "Edit PDF Online — Add Text, Highlight and Annotate, Free"
    : isFillForms
    ? "Fill PDF Forms Online — Free, Private, No Printing"
    : isFlattenPdf
    ? "Flatten PDF — Lock Form Fields Into Permanent Content"
    : isPdfMetadata
    ? "PDF Metadata Editor — View, Edit or Remove Hidden Properties"
    : isGrayscale
    ? "Convert PDF to Grayscale — Black & White, 100% Private"
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
    </>
  );
}
