import { lazy, type ComponentType } from "react";
import { toolIcons, type ToolIconProps } from "@/components/icons/ToolIcons";

export type ToolCategory = "Organize PDF" | "Convert PDF" | "Edit PDF" | "Forms & Compare";

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
};

const meta: Omit<ToolMeta, "icon">[] = [
  { slug: "merge", name: "Merge PDF", description: "Combine multiple PDFs into one single document, in the order you want.", category: "Organize PDF", Component: lazy(() => import("./merge")) },
  { slug: "compress", name: "Compress PDF", description: "Reduce the size of your PDF file while keeping the best possible quality.", category: "Organize PDF", Component: lazy(() => import("./compress")) },
  { slug: "split", name: "Split PDF", description: "Separate one PDF into multiple files or extract page ranges easily.", category: "Organize PDF", Component: lazy(() => import("./split")) },
  { slug: "delete-pages", name: "Delete Pages", description: "Remove one or more unwanted pages from your PDF in seconds.", category: "Organize PDF", Component: lazy(() => import("./delete-pages")) },
  { slug: "extract-pages", name: "Extract Pages", description: "Pick specific pages and save them as a brand new PDF file.", category: "Organize PDF", Component: lazy(() => import("./extract-pages")) },
  { slug: "reorder-pages", name: "Reorder Pages", description: "Drag and drop pages to rearrange your PDF exactly how you want.", category: "Organize PDF", Component: lazy(() => import("./reorder-pages")) },
  { slug: "rotate", name: "Rotate PDF", description: "Rotate one page or the whole document by 90, 180 or 270 degrees.", category: "Organize PDF", Component: lazy(() => import("./rotate")) },
  { slug: "images-to-pdf", name: "Image to PDF", description: "Convert JPG and PNG images to PDF. Adjust orientation and margins.", category: "Convert PDF", Component: lazy(() => import("./images-to-pdf")) },
  { slug: "pdf-to-images", name: "PDF to Image", description: "Convert each PDF page into a high-quality JPG or PNG image.", category: "Convert PDF", Component: lazy(() => import("./pdf-to-images")) },
  { slug: "pdf-to-text", name: "PDF to Text", description: "Extract all text from your PDF and copy or download it as .txt.", category: "Convert PDF", Component: lazy(() => import("./pdf-to-text")) },
  { slug: "page-numbers", name: "Page Numbers", description: "Add page numbers with custom position, font size and starting value.", category: "Edit PDF", Component: lazy(() => import("./page-numbers")) },
  { slug: "watermark", name: "Add Watermark", description: "Stamp text or an image over your PDF with adjustable opacity.", category: "Edit PDF", Component: lazy(() => import("./watermark")) },
  { slug: "crop", name: "Crop PDF", description: "Trim margins and adjust the visible area of every page.", category: "Edit PDF", Component: lazy(() => import("./crop")) },
  { slug: "fill-forms", name: "Fill PDF Forms", description: "Fill in interactive PDF form fields and download the completed file.", category: "Forms & Compare", Component: lazy(() => import("./fill-forms")) },
  { slug: "sign-pdf", name: "Sign PDF", description: "Create your electronic signature and place it anywhere on your PDF.", category: "Forms & Compare", Component: lazy(() => import("./sign-pdf")) },
  { slug: "compare", name: "Compare PDFs", description: "See the differences between two PDF documents side by side.", category: "Forms & Compare", Component: lazy(() => import("./compare")) },
];

export const tools: ToolMeta[] = meta.map((m) => ({ ...m, icon: toolIcons[m.slug] }));

export const categories: ToolCategory[] = [
  "Organize PDF",
  "Convert PDF",
  "Edit PDF",
  "Forms & Compare",
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}
