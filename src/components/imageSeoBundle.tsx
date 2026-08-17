/**
 * Image tool silos: tool UI, long-form SEO content, and JSON-LD.
 *
 * Imported ONLY from the route component so none of it lands in the route's
 * critical chunk (which every page downloads).
 */
import type { ReactNode } from "react";

import { HeicToJpgTool } from "@/tools/heic-to-jpg";
import { HeicToPngTool } from "@/tools/heic-to-png";
import { JpgToPngTool } from "@/tools/jpg-to-png";
import { PngToJpgTool } from "@/tools/png-to-jpg";
import { WebpToJpgTool } from "@/tools/webp-to-jpg";
import { WebpToPngTool } from "@/tools/webp-to-png";
import { CompressImageTool } from "@/tools/compress-image";
import { ImageResizeTool } from "@/tools/image-resize";
import { JpgToWebpTool } from "@/tools/jpg-to-webp";
import { PngToWebpTool } from "@/tools/png-to-webp";
import { CropImageTool } from "@/tools/crop-image";
import { RotateImageTool } from "@/tools/rotate-image";
import { WatermarkImageTool } from "@/tools/watermark-image";
import { MemeGeneratorTool } from "@/tools/meme-generator";
import { PhotoEditorTool } from "@/tools/photo-editor";
import {
  HeicToJpgSeo,
  heicToJpgFaqJsonLd,
  heicToJpgSoftwareJsonLd,
  heicToJpgHowToJsonLd,
} from "@/components/HeicToJpgSeo";
import {
  HeicToPngSeo,
  heicToPngFaqJsonLd,
  heicToPngSoftwareJsonLd,
  heicToPngHowToJsonLd,
} from "@/components/HeicToPngSeo";
import {
  JpgToPngSeo,
  jpgToPngFaqJsonLd,
  jpgToPngSoftwareJsonLd,
  jpgToPngHowToJsonLd,
} from "@/components/JpgToPngSeo";
import {
  PngToJpgSeo,
  pngToJpgFaqJsonLd,
  pngToJpgSoftwareJsonLd,
  pngToJpgHowToJsonLd,
} from "@/components/PngToJpgSeo";
import {
  WebpToJpgSeo,
  webpToJpgFaqJsonLd,
  webpToJpgSoftwareJsonLd,
  webpToJpgHowToJsonLd,
} from "@/components/WebpToJpgSeo";
import {
  WebpToPngSeo,
  webpToPngFaqJsonLd,
  webpToPngSoftwareJsonLd,
  webpToPngHowToJsonLd,
} from "@/components/WebpToPngSeo";
import {
  CompressImageSeo,
  compressImageFaqJsonLd,
  compressImageSoftwareJsonLd,
  compressImageHowToJsonLd,
} from "@/components/CompressImageSeo";
import {
  ImageResizeSeo,
  imageResizeFaqJsonLd,
  imageResizeSoftwareJsonLd,
  imageResizeHowToJsonLd,
} from "@/components/ImageResizeSeo";
import {
  JpgToWebpSeo,
  jpgToWebpFaqJsonLd,
  jpgToWebpSoftwareJsonLd,
  jpgToWebpHowToJsonLd,
} from "@/components/JpgToWebpSeo";
import {
  PngToWebpSeo,
  pngToWebpFaqJsonLd,
  pngToWebpSoftwareJsonLd,
  pngToWebpHowToJsonLd,
} from "@/components/PngToWebpSeo";
import {
  CropImageSeo,
  cropImageFaqJsonLd,
  cropImageSoftwareJsonLd,
  cropImageHowToJsonLd,
} from "@/components/CropImageSeo";
import {
  RotateImageSeo,
  rotateImageFaqJsonLd,
  rotateImageSoftwareJsonLd,
  rotateImageHowToJsonLd,
} from "@/components/RotateImageSeo";
import {
  WatermarkImageSeo,
  watermarkImageFaqJsonLd,
  watermarkImageSoftwareJsonLd,
  watermarkImageHowToJsonLd,
} from "@/components/WatermarkImageSeo";
import {
  MemeGeneratorSeo,
  memeGeneratorFaqJsonLd,
  memeGeneratorSoftwareJsonLd,
  memeGeneratorHowToJsonLd,
} from "@/components/MemeGeneratorSeo";
import {
  PhotoEditorSeo,
  photoEditorFaqJsonLd,
  photoEditorSoftwareJsonLd,
  photoEditorHowToJsonLd,
} from "@/components/PhotoEditorSeo";

type Silo = {
  jsonLd: readonly unknown[];
  h1: string;
  subtitle: string;
  Component: () => ReactNode;
  Seo: () => ReactNode;
  maxWidth?: string;
};

export const IMAGE_SILOS: Record<string, Silo> = {
  "heic-to-jpg": {
    jsonLd: [heicToJpgSoftwareJsonLd, heicToJpgHowToJsonLd, heicToJpgFaqJsonLd],
    h1: "Convert HEIC to JPG Online for Free",
    subtitle: "Convert iPhone HEIC photos to JPG format instantly in your browser. Batch convert multiple HEIC files at once. No signup, no watermark, your photos never leave your device.",
    Component: HeicToJpgTool,
    Seo: HeicToJpgSeo,
  },
  "heic-to-png": {
    jsonLd: [heicToPngSoftwareJsonLd, heicToPngHowToJsonLd, heicToPngFaqJsonLd],
    h1: "Convert HEIC to PNG online, free",
    subtitle: "Turn iPhone HEIC photos into lossless PNGs, right in your browser.",
    Component: HeicToPngTool,
    Seo: HeicToPngSeo,
  },
  "jpg-to-png": {
    jsonLd: [jpgToPngSoftwareJsonLd, jpgToPngHowToJsonLd, jpgToPngFaqJsonLd],
    h1: "Convert JPG to PNG Online for Free",
    subtitle: "Transform JPEG images into lossless PNG format instantly in your browser. Batch convert multiple files at once. No signup, no watermark, your images never leave your device.",
    Component: JpgToPngTool,
    Seo: JpgToPngSeo,
  },
  "png-to-jpg": {
    jsonLd: [pngToJpgSoftwareJsonLd, pngToJpgHowToJsonLd, pngToJpgFaqJsonLd],
    h1: "Convert PNG to JPG online, free",
    subtitle: "Turn PNG images into smaller JPGs with adjustable quality, in your browser.",
    Component: PngToJpgTool,
    Seo: PngToJpgSeo,
  },
  "webp-to-jpg": {
    jsonLd: [webpToJpgSoftwareJsonLd, webpToJpgHowToJsonLd, webpToJpgFaqJsonLd],
    h1: "Convert WebP to JPG online, free",
    subtitle: "Turn .webp images into universal JPGs, right in your browser.",
    Component: WebpToJpgTool,
    Seo: WebpToJpgSeo,
  },
  "webp-to-png": {
    jsonLd: [webpToPngSoftwareJsonLd, webpToPngHowToJsonLd, webpToPngFaqJsonLd],
    h1: "Convert WebP to PNG online, free",
    subtitle: "Turn .webp images into lossless PNGs with transparency preserved, in your browser.",
    Component: WebpToPngTool,
    Seo: WebpToPngSeo,
  },
  "compress-image": {
    jsonLd: [compressImageSoftwareJsonLd, compressImageHowToJsonLd, compressImageFaqJsonLd],
    h1: "Compress images online, free",
    subtitle: "Reduce JPG, PNG, and WebP file size right in your browser, no upload.",
    Component: CompressImageTool,
    Seo: CompressImageSeo,
  },
  "image-resize": {
    jsonLd: [imageResizeSoftwareJsonLd, imageResizeHowToJsonLd, imageResizeFaqJsonLd],
    h1: "Resize images online, free",
    subtitle: "Change JPG, PNG, and WebP dimensions by pixels or percent, in your browser.",
    Component: ImageResizeTool,
    Seo: ImageResizeSeo,
  },
  "jpg-to-webp": {
    jsonLd: [jpgToWebpSoftwareJsonLd, jpgToWebpHowToJsonLd, jpgToWebpFaqJsonLd],
    h1: "Convert JPG to WebP online, free",
    subtitle: "Turn JPG and JPEG images into modern WebP for faster websites, in your browser.",
    Component: JpgToWebpTool,
    Seo: JpgToWebpSeo,
  },
  "png-to-webp": {
    jsonLd: [pngToWebpSoftwareJsonLd, pngToWebpHowToJsonLd, pngToWebpFaqJsonLd],
    h1: "Convert PNG to WebP online, free",
    subtitle: "Turn PNG images into modern WebP with transparency preserved, in your browser.",
    Component: PngToWebpTool,
    Seo: PngToWebpSeo,
  },
  "crop-image": {
    jsonLd: [cropImageSoftwareJsonLd, cropImageHowToJsonLd, cropImageFaqJsonLd],
    h1: "Crop images online, free",
    subtitle: "Crop JPG, PNG, and WebP to any size or preset ratio, in your browser.",
    Component: CropImageTool,
    Seo: CropImageSeo,
  },
  "rotate-image": {
    jsonLd: [rotateImageSoftwareJsonLd, rotateImageHowToJsonLd, rotateImageFaqJsonLd],
    h1: "Rotate and flip images online, free",
    subtitle: "Rotate JPG, PNG, and WebP by 90, 180, or 270 degrees, or mirror them, in your browser.",
    Component: RotateImageTool,
    Seo: RotateImageSeo,
  },
  "watermark-image": {
    jsonLd: [watermarkImageSoftwareJsonLd, watermarkImageHowToJsonLd, watermarkImageFaqJsonLd],
    h1: "Add a watermark to images online, free",
    subtitle: "Stamp a text line or your own logo across JPG, PNG, and WebP photos, in your browser.",
    Component: WatermarkImageTool,
    Seo: WatermarkImageSeo,
    maxWidth: "max-w-5xl",
  },
  "meme-generator": {
    jsonLd: [memeGeneratorSoftwareJsonLd, memeGeneratorHowToJsonLd, memeGeneratorFaqJsonLd],
    h1: "Make memes online, free, no watermark",
    subtitle: "Drop in a photo, add captions, and download a clean meme, right in your browser.",
    Component: MemeGeneratorTool,
    Seo: MemeGeneratorSeo,
    maxWidth: "max-w-6xl",
  },
  "photo-editor": {
    jsonLd: [photoEditorSoftwareJsonLd, photoEditorHowToJsonLd, photoEditorFaqJsonLd],
    h1: "Edit photos online, free",
    subtitle: "Adjust brightness, contrast, saturation, and warmth, or apply filters, in your browser.",
    Component: PhotoEditorTool,
    Seo: PhotoEditorSeo,
    maxWidth: "max-w-6xl",
  },
};

