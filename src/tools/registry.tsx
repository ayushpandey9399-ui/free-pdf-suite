import { lazy, type ComponentType } from "react";
import { toolIcons, type ToolIconProps } from "@/components/icons/ToolIcons";

export type ToolCategory = "Organize PDF" | "Convert PDF" | "Edit PDF" | "Forms & Compare" | "Security";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: ComponentType<ToolIconProps>;
  Component: ComponentType;
}

// Retained for legacy call sites (ToolLayout accepts an optional tint).
export const categoryTint: Record<ToolCategory, { bg: string; fg: string }> = {
  "Organize PDF": { bg: "#fdeceb", fg: "#e5322d" },
  "Convert PDF": { bg: "#fff3e6", fg: "#f28c1e" },
  "Edit PDF": { bg: "#eef1fd", fg: "#4a63e7" },
  "Forms & Compare": { bg: "#eafaf0", fg: "#1f9d55" },
  "Security": { bg: "#fdeceb", fg: "#e5322d" },
};

const meta: Omit<ToolMeta, "icon">[] = [
  { slug: "merge", name: "Merge PDF", description: "Combine multiple PDFs into one single document, in the order you want.", category: "Organize PDF", Component: lazy(() => import("./merge").then(m => ({ default: m.MergeTool }))) },
  { slug: "compress", name: "Compress PDF", description: "Reduce the size of your PDF file while keeping the best possible quality.", category: "Organize PDF", Component: lazy(() => import("./compress").then(m => ({ default: m.CompressTool }))) },
  { slug: "split", name: "Split PDF", description: "Separate one PDF into multiple files or extract page ranges easily.", category: "Organize PDF", Component: lazy(() => import("./split").then(m => ({ default: m.SplitTool }))) },
  { slug: "delete-pages", name: "Delete Pages", description: "Remove one or more unwanted pages from your PDF in seconds.", category: "Organize PDF", Component: lazy(() => import("./delete-pages").then(m => ({ default: m.DeletePagesTool }))) },
  { slug: "extract-pages", name: "Extract Pages", description: "Pick specific pages and save them as a brand new PDF file.", category: "Organize PDF", Component: lazy(() => import("./extract-pages").then(m => ({ default: m.ExtractPagesTool }))) },
  { slug: "reorder-pages", name: "Reorder Pages", description: "Drag and drop pages to rearrange your PDF exactly how you want.", category: "Organize PDF", Component: lazy(() => import("./reorder-pages").then(m => ({ default: m.ReorderPagesTool }))) },
  { slug: "add-blank-pages", name: "Add Blank Pages", description: "Insert empty pages anywhere in your PDF, for notes, printing, or separating sections.", category: "Organize PDF", Component: lazy(() => import("./add-blank-pages").then(m => ({ default: m.AddBlankPagesTool }))) },
  { slug: "rotate", name: "Rotate PDF", description: "Rotate one page or the whole document by 90, 180 or 270 degrees.", category: "Organize PDF", Component: lazy(() => import("./rotate").then(m => ({ default: m.RotatePdfTool }))) },
  { slug: "images-to-pdf", name: "Image to PDF", description: "Convert JPG and PNG images to PDF. Adjust orientation and margins.", category: "Convert PDF", Component: lazy(() => import("./images-to-pdf").then(m => ({ default: m.ImagesToPdfTool }))) },
  { slug: "pdf-to-images", name: "PDF to Image", description: "Convert each PDF page into a high-quality JPG or PNG image.", category: "Convert PDF", Component: lazy(() => import("./pdf-to-images").then(m => ({ default: m.PdfToImagesTool }))) },
  { slug: "extract-images", name: "Extract Images", description: "Pull out all the images embedded in your PDF and download them in original quality.", category: "Convert PDF", Component: lazy(() => import("./extract-images").then(m => ({ default: m.ExtractImagesTool }))) },
  { slug: "pdf-to-word", name: "PDF to Word", description: "Convert a PDF into an editable Word .docx document, converted on our server.", category: "Convert PDF", Component: lazy(() => import("./pdf-to-word").then(m => ({ default: m.PdfToWordTool }))) },
  { slug: "pdf-to-text", name: "PDF to Text", description: "Extract all text from your PDF and copy or download it as .txt.", category: "Convert PDF", Component: lazy(() => import("./pdf-to-text").then(m => ({ default: m.PdfToTextTool }))) },
  { slug: "txt-to-pdf", name: "TXT to PDF", description: "Convert plain text files into a clean, readable PDF document.", category: "Convert PDF", Component: lazy(() => import("./txt-to-pdf").then(m => ({ default: m.TxtToPdfTool }))) },
  { slug: "scan-to-pdf", name: "Scan to PDF", description: "Use your camera to scan documents and turn them into a PDF, right in your browser.", category: "Convert PDF", Component: lazy(() => import("./scan-to-pdf").then(m => ({ default: m.ScanToPdfTool }))) },
  { slug: "page-numbers", name: "Page Numbers", description: "Add page numbers with custom position, font size and starting value.", category: "Edit PDF", Component: lazy(() => import("./page-numbers").then(m => ({ default: m.PageNumbersTool }))) },
  { slug: "header-footer", name: "Add Header & Footer", description: "Stamp text like dates, filenames, or your company name at the top or bottom of every page.", category: "Edit PDF", Component: lazy(() => import("./header-footer").then(m => ({ default: m.HeaderFooterTool }))) },
  { slug: "watermark", name: "Add Watermark", description: "Stamp text or an image over your PDF with adjustable opacity.", category: "Edit PDF", Component: lazy(() => import("./watermark").then(m => ({ default: m.WatermarkPdfTool }))) },
  { slug: "crop", name: "Crop PDF", description: "Trim margins and adjust the visible area of every page.", category: "Edit PDF", Component: lazy(() => import("./crop").then(m => ({ default: m.CropPdfTool }))) },
  { slug: "edit-pdf", name: "Edit & Annotate PDF", description: "Highlight text, add comments, shapes, images, and freehand drawings to your PDF.", category: "Edit PDF", Component: lazy(() => import("./edit-pdf").then(m => ({ default: m.EditPdfTool }))) },
  { slug: "pdf-metadata", name: "PDF Metadata Editor", description: "View and edit your PDF's title, author, subject, and keywords.", category: "Edit PDF", Component: lazy(() => import("./pdf-metadata").then(m => ({ default: m.PdfMetadataTool }))) },
  { slug: "grayscale-pdf", name: "Grayscale PDF", description: "Convert your PDF to black and white, ideal for cheaper, cleaner printing.", category: "Edit PDF", Component: lazy(() => import("./grayscale-pdf").then(m => ({ default: m.GrayscalePdfTool }))) },
  { slug: "fill-forms", name: "Fill PDF Forms", description: "Fill in interactive PDF form fields and download the completed file.", category: "Forms & Compare", Component: lazy(() => import("./fill-forms").then(m => ({ default: m.FillFormsTool }))) },
  { slug: "flatten-pdf", name: "Flatten PDF", description: "Make form fields and annotations permanent so they can no longer be edited.", category: "Forms & Compare", Component: lazy(() => import("./flatten-pdf").then(m => ({ default: m.FlattenPdfTool }))) },
  { slug: "sign-pdf", name: "Sign PDF", description: "Create your electronic signature and place it anywhere on your PDF.", category: "Forms & Compare", Component: lazy(() => import("./sign-pdf").then(m => ({ default: m.SignPdfTool }))) },
  { slug: "compare", name: "Compare PDFs", description: "See the differences between two PDF documents side by side.", category: "Forms & Compare", Component: lazy(() => import("./compare").then(m => ({ default: m.ComparePdfTool }))) },
  { slug: "protect-pdf", name: "Protect PDF", description: "Add a password to your PDF and encrypt it to prevent unauthorized access.", category: "Security", Component: lazy(() => import("./protect-pdf").then(m => ({ default: m.ProtectPdfTool }))) },
  { slug: "redact-pdf", name: "Redact PDF", description: "Permanently black out sensitive text and images, the hidden content is truly removed, not just covered.", category: "Security", Component: lazy(() => import("./redact-pdf").then(m => ({ default: m.RedactPdfTool }))) },
  { slug: "unlock-pdf", name: "Unlock PDF", description: "Remove the password from your PDF so you can open it freely. You must know the current password.", category: "Security", Component: lazy(() => import("./unlock-pdf").then(m => ({ default: m.UnlockPdfTool }))) },

];

export const tools: ToolMeta[] = meta.map((m) => ({ ...m, icon: toolIcons[m.slug] }));

export const categories: ToolCategory[] = [
  "Organize PDF",
  "Convert PDF",
  "Edit PDF",
  "Forms & Compare",
  "Security",
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}
