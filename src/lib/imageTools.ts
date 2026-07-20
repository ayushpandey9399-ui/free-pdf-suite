// Image-tools silo registry. Kept intentionally separate from the PDF `tools`
// registry so the image section can grow without touching PDF SEO surface.

import {
  Smartphone,
  ImageDown,
  ImagePlus,
  Image as ImageIcon,
  Globe,
  Layers,
  Shrink,
  Maximize2,
  type LucideIcon,
} from "lucide-react";

export type ImageToolStatus = "live" | "coming-soon";

export interface ImageTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ImageToolStatus;
  aliases?: readonly string[];
  icon: LucideIcon;
  /** Solid brand color for icon + tinted tile background (bg = color @ ~12%). */
  tint: string;
}

export const imageTools: readonly ImageTool[] = [
  {
    id: "heic-to-jpg",
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    description:
      "Convert iPhone HEIC photos to JPG in your browser. Batch convert, choose quality, download as a ZIP.",
    status: "live",
    aliases: ["heic", "heif", "iphone photo converter"],
    icon: Smartphone,
    tint: "#E5322D",
  },
  {
    id: "heic-to-png",
    slug: "heic-to-png",
    name: "HEIC to PNG",
    description:
      "Convert iPhone HEIC photos to lossless PNG in your browser. Batch convert and download as a ZIP.",
    status: "live",
    aliases: ["heic", "heif", "iphone photo to png"],
    icon: ImageDown,
    tint: "#F59E0B",
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    name: "JPG to PNG",
    description:
      "Convert JPG and JPEG images to lossless PNG in your browser. Batch convert and download as a ZIP.",
    status: "live",
    aliases: ["jpeg to png", "jpg converter", "png converter"],
    icon: ImagePlus,
    tint: "#2563EB",
  },
  {
    id: "png-to-jpg",
    slug: "png-to-jpg",
    name: "PNG to JPG",
    description:
      "Convert PNG images to smaller JPG files in your browser. Adjustable quality, batch and ZIP download.",
    status: "live",
    aliases: ["png to jpeg", "reduce png size", "png converter"],
    icon: ImageIcon,
    tint: "#10B981",
  },
  {
    id: "webp-to-jpg",
    slug: "webp-to-jpg",
    name: "WebP to JPG",
    description:
      "Convert WebP images to universal JPG files in your browser. Adjustable quality, batch and ZIP download.",
    status: "live",
    aliases: ["webp to jpeg", "save webp as jpg", "webp converter"],
    icon: Globe,
    tint: "#7C3AED",
  },
  {
    id: "webp-to-png",
    slug: "webp-to-png",
    name: "WebP to PNG",
    description:
      "Convert WebP images to lossless PNG in your browser with transparency preserved. Batch and ZIP download.",
    status: "live",
    aliases: ["webp to png transparent", "save webp as png", "webp converter"],
    icon: Layers,
    tint: "#0891B2",
  },
  {
    id: "compress-image",
    slug: "compress-image",
    name: "Compress Image",
    description:
      "Reduce JPG, PNG, and WebP file size in your browser. Quality slider or target a size in KB. Batch and ZIP download.",
    status: "live",
    aliases: ["image compressor", "reduce image size", "compress jpg", "compress png"],
    icon: Shrink,
    tint: "#DB2777",
  },
  {
    id: "image-resize",
    slug: "image-resize",
    name: "Resize Image",
    description:
      "Resize JPG, PNG, and WebP by pixels or percent in your browser. Presets for passport, signature, and HD sizes. Batch and ZIP.",
    status: "live",
    aliases: ["image resizer", "resize image online free", "resize image to exact pixels", "resize image in KB"],
    icon: Maximize2,
    tint: "#4F46E5",
  },
];


export function getImageTool(slug: string): ImageTool | undefined {
  return imageTools.find((t) => t.slug === slug);
}

/** Tint hex to a soft pastel background (~12% color over white). */
export function imageToolTintBg(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * 0.14 + 255 * 0.86);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
