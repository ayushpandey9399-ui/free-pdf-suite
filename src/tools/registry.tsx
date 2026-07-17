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

export type ToolCategory = "Convert" | "Organize" | "Edit" | "Forms & Compare";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  Component: ComponentType;
}

export const tools: ToolMeta[] = [
  // Convert
  {
    slug: "images-to-pdf",
    name: "Images to PDF",
    description: "Combine JPG/PNG images into a single PDF.",
    category: "Convert",
    icon: FileImage,
    Component: lazy(() => import("./images-to-pdf").then((m) => ({ default: m.default }))),
  },
  {
    slug: "pdf-to-images",
    name: "PDF to Images",
    description: "Render each page of a PDF as PNG or JPG.",
    category: "Convert",
    icon: ImageIcon,
    Component: lazy(() => import("./pdf-to-images").then((m) => ({ default: m.default }))),
  },
  {
    slug: "pdf-to-text",
    name: "PDF to Text",
    description: "Extract all text from a PDF file.",
    category: "Convert",
    icon: Type,
    Component: lazy(() => import("./pdf-to-text").then((m) => ({ default: m.default }))),
  },
  // Organize
  {
    slug: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDFs into one — drag to reorder.",
    category: "Organize",
    icon: Merge,
    Component: lazy(() => import("./merge").then((m) => ({ default: m.default }))),
  },
  {
    slug: "split",
    name: "Split PDF",
    description: "Split by ranges (1-3, 5) or every page separately.",
    category: "Organize",
    icon: Scissors,
    Component: lazy(() => import("./split").then((m) => ({ default: m.default }))),
  },
  {
    slug: "delete-pages",
    name: "Delete Pages",
    description: "Select pages to remove from a PDF.",
    category: "Organize",
    icon: Trash2,
    Component: lazy(() => import("./delete-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "extract-pages",
    name: "Extract Pages",
    description: "Pick specific pages to save as a new PDF.",
    category: "Organize",
    icon: FileOutput,
    Component: lazy(() => import("./extract-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "reorder-pages",
    name: "Reorder Pages",
    description: "Drag page thumbnails to rearrange, then export.",
    category: "Organize",
    icon: MoveVertical,
    Component: lazy(() => import("./reorder-pages").then((m) => ({ default: m.default }))),
  },
  {
    slug: "rotate",
    name: "Rotate PDF",
    description: "Rotate selected pages or all pages by 90°, 180°, 270°.",
    category: "Organize",
    icon: RotateCw,
    Component: lazy(() => import("./rotate").then((m) => ({ default: m.default }))),
  },
  // Edit
  {
    slug: "page-numbers",
    name: "Add Page Numbers",
    description: "Add customizable page numbers to your PDF.",
    category: "Edit",
    icon: Hash,
    Component: lazy(() => import("./page-numbers").then((m) => ({ default: m.default }))),
  },
  {
    slug: "watermark",
    name: "Add Watermark",
    description: "Overlay text or image watermarks on every page.",
    category: "Edit",
    icon: Droplet,
    Component: lazy(() => import("./watermark").then((m) => ({ default: m.default }))),
  },
  {
    slug: "crop",
    name: "Crop PDF",
    description: "Set crop margins applied to all pages.",
    category: "Edit",
    icon: Crop,
    Component: lazy(() => import("./crop").then((m) => ({ default: m.default }))),
  },
  // Forms & Compare
  {
    slug: "fill-forms",
    name: "Fill PDF Forms",
    description: "Detect AcroForm fields and fill them in your browser.",
    category: "Forms & Compare",
    icon: FormInput,
    Component: lazy(() => import("./fill-forms").then((m) => ({ default: m.default }))),
  },
  {
    slug: "compare",
    name: "Compare 2 PDFs",
    description: "Side-by-side text diff between two PDFs.",
    category: "Forms & Compare",
    icon: GitCompare,
    Component: lazy(() => import("./compare").then((m) => ({ default: m.default }))),
  },
];

export const categories: ToolCategory[] = ["Convert", "Organize", "Edit", "Forms & Compare"];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}
