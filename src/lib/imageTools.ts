// Image-tools silo registry. Kept intentionally separate from the PDF `tools`
// registry so the image section can grow without touching PDF SEO surface.

export type ImageToolStatus = "live" | "coming-soon";

export interface ImageTool {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: ImageToolStatus;
  aliases?: readonly string[];
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
  },
  {
    id: "heic-to-png",
    slug: "heic-to-png",
    name: "HEIC to PNG",
    description:
      "Convert iPhone HEIC photos to lossless PNG in your browser. Batch convert and download as a ZIP.",
    status: "live",
    aliases: ["heic", "heif", "iphone photo to png"],
  },
  {
    id: "jpg-to-png",
    slug: "jpg-to-png",
    name: "JPG to PNG",
    description: "Convert JPG images to PNG in your browser.",
    status: "coming-soon",
  },
  {
    id: "png-to-jpg",
    slug: "png-to-jpg",
    name: "PNG to JPG",
    description: "Convert PNG images to JPG with adjustable quality.",
    status: "coming-soon",
  },
  {
    id: "webp-to-jpg",
    slug: "webp-to-jpg",
    name: "WebP to JPG",
    description: "Convert WebP images to JPG in your browser.",
    status: "coming-soon",
  },
  {
    id: "webp-to-png",
    slug: "webp-to-png",
    name: "WebP to PNG",
    description: "Convert WebP images to lossless PNG in your browser.",
    status: "coming-soon",
  },
  {
    id: "image-compress",
    slug: "image-compress",
    name: "Compress Image",
    description: "Reduce image file size while keeping quality.",
    status: "coming-soon",
  },
];

export function getImageTool(slug: string): ImageTool | undefined {
  return imageTools.find((t) => t.slug === slug);
}
