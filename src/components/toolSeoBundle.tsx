/**
 * Per-tool SEO content bundle for the PDF tool pages.
 *
 * Imported ONLY from the route component (never from `head()`), so the code
 * splitter keeps every byte of it out of the route's critical chunk and off
 * pages that are not a PDF tool page.
 */
import type { ReactNode } from "react";

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

type ToolSeo = {
  layoutTitle: string;
  jsonLd: readonly unknown[];
  content: ReactNode;
};

export const TOOL_SEO: Record<string, ToolSeo> = {
  "merge": {
    layoutTitle: "Merge PDF files online",
    jsonLd: [mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd],
    content: <MergePdfSeo />,
  },
  "compress": {
    layoutTitle: "Compress PDF online",
    jsonLd: [compressFaqJsonLd, compressHowToJsonLd, compressSoftwareJsonLd],
    content: <CompressPdfSeo />,
  },
  "split": {
    layoutTitle: "Split PDF files",
    jsonLd: [splitFaqJsonLd, splitHowToJsonLd, splitSoftwareJsonLd],
    content: <SplitPdfSeo />,
  },
  "sign-pdf": {
    layoutTitle: "Sign PDF online",
    jsonLd: [signFaqJsonLd, signHowToJsonLd, signSoftwareJsonLd],
    content: <SignPdfSeo />,
  },
  "pdf-to-images": {
    layoutTitle: "Convert PDF to JPG",
    jsonLd: [pdfToImagesFaqJsonLd, pdfToImagesHowToJsonLd, pdfToImagesSoftwareJsonLd],
    content: <PdfToImagesSeo />,
  },
  "redact-pdf": {
    layoutTitle: "Redact PDF online",
    jsonLd: [redactFaqJsonLd, redactHowToJsonLd, redactSoftwareJsonLd],
    content: <RedactPdfSeo />,
  },
  "protect-pdf": {
    layoutTitle: "Protect PDF with a password",
    jsonLd: [protectFaqJsonLd, protectHowToJsonLd, protectSoftwareJsonLd],
    content: <ProtectPdfSeo />,
  },
  "unlock-pdf": {
    layoutTitle: "Unlock PDF online",
    jsonLd: [unlockFaqJsonLd, unlockHowToJsonLd, unlockSoftwareJsonLd],
    content: <UnlockPdfSeo />,
  },
  "watermark": {
    layoutTitle: "Watermark PDF online",
    jsonLd: [watermarkFaqJsonLd, watermarkHowToJsonLd, watermarkSoftwareJsonLd],
    content: <WatermarkPdfSeo />,
  },
  "rotate": {
    layoutTitle: "Rotate PDF pages",
    jsonLd: [rotateFaqJsonLd, rotateHowToJsonLd, rotateSoftwareJsonLd],
    content: <RotatePdfSeo />,
  },
  "delete-pages": {
    layoutTitle: "Delete PDF pages",
    jsonLd: [deletePagesFaqJsonLd, deletePagesHowToJsonLd, deletePagesSoftwareJsonLd],
    content: <DeletePagesSeo />,
  },
  "extract-pages": {
    layoutTitle: "Extract PDF pages",
    jsonLd: [extractPagesFaqJsonLd, extractPagesHowToJsonLd, extractPagesSoftwareJsonLd],
    content: <ExtractPagesSeo />,
  },
  "reorder-pages": {
    layoutTitle: "Reorder PDF pages",
    jsonLd: [reorderPagesFaqJsonLd, reorderPagesHowToJsonLd, reorderPagesSoftwareJsonLd],
    content: <ReorderPagesSeo />,
  },
  "images-to-pdf": {
    layoutTitle: "Convert JPG to PDF",
    jsonLd: [imagesToPdfFaqJsonLd, imagesToPdfHowToJsonLd, imagesToPdfSoftwareJsonLd],
    content: <ImagesToPdfSeo />,
  },
  "pdf-to-text": {
    layoutTitle: "Convert PDF to text",
    jsonLd: [pdfToTextFaqJsonLd, pdfToTextHowToJsonLd, pdfToTextSoftwareJsonLd],
    content: <PdfToTextSeo />,
  },
  "txt-to-pdf": {
    layoutTitle: "Convert TXT to PDF",
    jsonLd: [txtToPdfFaqJsonLd, txtToPdfHowToJsonLd, txtToPdfSoftwareJsonLd],
    content: <TxtToPdfSeo />,
  },
  "page-numbers": {
    layoutTitle: "Add page numbers to PDF",
    jsonLd: [pageNumbersFaqJsonLd, pageNumbersHowToJsonLd, pageNumbersSoftwareJsonLd],
    content: <PageNumbersSeo />,
  },
  "header-footer": {
    layoutTitle: "Add header and footer to PDF",
    jsonLd: [headerFooterFaqJsonLd, headerFooterHowToJsonLd, headerFooterSoftwareJsonLd],
    content: <HeaderFooterSeo />,
  },
  "crop": {
    layoutTitle: "Crop PDF online",
    jsonLd: [cropPdfFaqJsonLd, cropPdfHowToJsonLd, cropPdfSoftwareJsonLd],
    content: <CropPdfSeo />,
  },
  "edit-pdf": {
    layoutTitle: "Edit PDF online",
    jsonLd: [editPdfFaqJsonLd, editPdfHowToJsonLd, editPdfSoftwareJsonLd],
    content: <EditPdfSeo />,
  },
  "fill-forms": {
    layoutTitle: "Fill PDF forms online",
    jsonLd: [fillFormsFaqJsonLd, fillFormsHowToJsonLd, fillFormsSoftwareJsonLd],
    content: <FillFormsSeo />,
  },
  "flatten-pdf": {
    layoutTitle: "Flatten PDF online",
    jsonLd: [flattenPdfFaqJsonLd, flattenPdfHowToJsonLd, flattenPdfSoftwareJsonLd],
    content: <FlattenPdfSeo />,
  },
  "pdf-metadata": {
    layoutTitle: "Edit PDF metadata",
    jsonLd: [pdfMetadataFaqJsonLd, pdfMetadataHowToJsonLd, pdfMetadataSoftwareJsonLd],
    content: <PdfMetadataSeo />,
  },
  "grayscale-pdf": {
    layoutTitle: "Convert PDF to grayscale",
    jsonLd: [grayscalePdfFaqJsonLd, grayscalePdfHowToJsonLd, grayscalePdfSoftwareJsonLd],
    content: <GrayscalePdfSeo />,
  },
  "add-blank-pages": {
    layoutTitle: "Add blank pages to PDF",
    jsonLd: [addBlankPagesFaqJsonLd, addBlankPagesHowToJsonLd, addBlankPagesSoftwareJsonLd],
    content: <AddBlankPagesSeo />,
  },
  "scan-to-pdf": {
    layoutTitle: "Scan documents to PDF",
    jsonLd: [scanToPdfFaqJsonLd, scanToPdfHowToJsonLd, scanToPdfSoftwareJsonLd],
    content: <ScanToPdfSeo />,
  },
  "extract-images": {
    layoutTitle: "Extract images from PDF",
    jsonLd: [extractImagesFaqJsonLd, extractImagesHowToJsonLd, extractImagesSoftwareJsonLd],
    content: <ExtractImagesSeo />,
  },
  "compare": {
    layoutTitle: "Compare two PDFs",
    jsonLd: [compareFaqJsonLd, compareHowToJsonLd, compareSoftwareJsonLd],
    content: <ComparePdfSeo />,
  },
};
