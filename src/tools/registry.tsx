import { lazy, type ComponentType } from "react";
import {
  FileImage,
  ImageIcon,
  Type,
  Merge,
  Scissors,
  Trash2,
  FileOutput,
  MoveVertical,
  RotateCw,
  Hash,
  Droplet,
  Crop,
  FormInput,
  GitCompare,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "Organize PDF" | "Convert PDF" | "Edit PDF" | "Forms & Compare";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  Component: ComponentType;
}

export const categoryTint: Record<ToolCategory, { bg: string; fg: string }> = {
  "Organize PDF": { bg: "#fdeceb", fg: "#e5322d" },
  "Convert PDF": { bg: "#fff3e6", fg: "#f28c1e" },
  "Edit PDF": { bg: "#eef1fd", fg: "#4a63e7" },
  "Forms & Compare": { bg: "#eafaf0", fg: "#1f9d55" },
};

export const tools: ToolMeta[] = [
  // Organize
  {
    slug: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one single document, in the order you want.",
    category: "Organize PDF",
    icon: Merge,
    Component: lazy(() => import("./merge").then((m) => ({ default: m.default }))),
  },
  {
    slug: "split",
    name: "Split PDF",
    description: "Separate one PDF into multiple files or extract page ranges easily.",
    category: "Organize PDF",
    icon: Scissors,
    Component: lazy(() => import("./split").then((m) => ({ default: m.default }))),
  },
  {
    slug: "delete-pages",
    name: "Delete Pages",
    description: "Remove one or more unwanted pages from your PDF in seconds.",
    category: "Organize PDF",
    icon: Trash2,
    Component: lazy(() => import("./delete-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "extract-pages",
    name: "Extract Pages",
    description: "Pick specific pages and save them as a brand new PDF file.",
    category: "Organize PDF",
    icon: FileOutput,
    Component: lazy(() => import("./extract-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "reorder-pages",
    name: "Reorder Pages",
    description: "Drag and drop pages to rearrange your PDF exactly how you want.",
    category: "Organize PDF",
    icon: MoveVertical,
    Component: lazy(() => import("./reorder-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "rotate",
    name: "Rotate PDF",
    description: "Rotate one page or the whole document by 90, 180 or 270 degrees.",
    category: "Organize PDF",
    icon: RotateCw,
    Component: lazy(() => import("./rotate").then((m) => ({ default: m.default }))),
  },
  // Convert
  {
    slug: "images-to-pdf",
    name: "Image to PDF",
    description: "Convert JPG and PNG images to PDF. Adjust orientation and margins.",
    category: "Convert PDF",
    icon: FileImage,
    Component: lazy(() => import("./images-to-pdf").then((m) => ({ default: m.default }))),
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Image",
    description: "Convert each PDF page into a high-quality JPG or PNG image.",
    category: "Convert PDF",
    icon: ImageIcon,
    Component: lazy(() => import("./pdf-to-images").then((m) => ({ default: m.default }))),
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description: "Extract all text from your PDF and copy or download it as .txt.",
    category: "Convert PDF",
    icon: Type,
    Component: lazy(() => import("./pdf-to-text").then((m) => ({ default: m.default }))),
  },
  // Edit
  {
    slug: "page-numbers",
    name: "Page Numbers",
    description: "Add page numbers with custom position, font size and starting value.",
    category: "Edit PDF",
    icon: Hash,
    Component: lazy(() => import("./page-numbers").then((m) => ({ default: m.default }))),
  },
  {
    slug: "watermark",
    name: "Add Watermark",
    description: "Stamp text or an image over your PDF with adjustable opacity.",
    category: "Edit PDF",
    icon: Droplet,
    Component: lazy(() => import("./watermark").then((m) => ({ default: m.default }))),
  },
  {
    slug: "crop",
    name: "Crop PDF",
    description: "Trim margins and adjust the visible area of every page.",
    category: "Edit PDF",
    icon: Crop,
    Component: lazy(() => import("./crop").then((m) => ({ default: m.default }))),
  },
  // Forms & Compare
  {
    slug: "fill-forms",
    name: "Fill PDF Forms",
    description: "Fill in interactive PDF form fields and download the completed file.",
    category: "Forms & Compare",
    icon: FormInput,
    Component: lazy(() => import("./fill-forms").then((m) => ({ default: m.default }))),
  },
  {
    slug: "compare",
    name: "Compare PDFs",
    description: "See the differences between two PDF documents side by side.",
    category: "Forms & Compare",
    icon: GitCompare,
    Component: lazy(() => import("./compare").then((m) => ({ default: m.default }))),
  },
];

export const categories: ToolCategory[] = [
  "Organize PDF",
  "Convert PDF",
  "Edit PDF",
  "Forms & Compare",
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}
