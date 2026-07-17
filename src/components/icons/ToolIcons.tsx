import type { ComponentType } from "react";

import mergeUrl from "@/assets/tool-icons/merge.png";
import compressUrl from "@/assets/tool-icons/compress.png";
import splitUrl from "@/assets/tool-icons/split.png";
import deletePagesUrl from "@/assets/tool-icons/delete-pages.png";
import extractPagesUrl from "@/assets/tool-icons/extract-pages.png";
import reorderPagesUrl from "@/assets/tool-icons/reorder-pages.png";
import addBlankPagesUrl from "@/assets/tool-icons/add-blank-pages.png";
import rotateUrl from "@/assets/tool-icons/rotate.png";
import cropUrl from "@/assets/tool-icons/crop.png";
import imagesToPdfUrl from "@/assets/tool-icons/images-to-pdf.png";
import pdfToImagesUrl from "@/assets/tool-icons/pdf-to-images.png";
import extractImagesUrl from "@/assets/tool-icons/extract-images.png";
import pdfToTextUrl from "@/assets/tool-icons/pdf-to-text.png";
import txtToPdfUrl from "@/assets/tool-icons/txt-to-pdf.png";
import scanToPdfUrl from "@/assets/tool-icons/scan-to-pdf.png";
import editPdfUrl from "@/assets/tool-icons/edit-pdf.png";
import watermarkUrl from "@/assets/tool-icons/watermark.png";
import pageNumbersUrl from "@/assets/tool-icons/page-numbers.png";
import headerFooterUrl from "@/assets/tool-icons/header-footer.png";
import grayscalePdfUrl from "@/assets/tool-icons/grayscale-pdf.png";
import pdfMetadataUrl from "@/assets/tool-icons/pdf-metadata.png";
import fillFormsUrl from "@/assets/tool-icons/fill-forms.png";
import flattenPdfUrl from "@/assets/tool-icons/flatten-pdf.png";
import compareUrl from "@/assets/tool-icons/compare.png";
import protectPdfUrl from "@/assets/tool-icons/protect-pdf.png";
import unlockPdfUrl from "@/assets/tool-icons/unlock-pdf.png";
import signPdfUrl from "@/assets/tool-icons/sign-pdf.png";
import redactPdfUrl from "@/assets/tool-icons/redact-pdf.png";

/**
 * Per-tool icon system.
 * Each tool renders a rounded tinted tile (category color at low opacity)
 * with a 3D PNG artwork centered inside.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

type Palette = { bg: string };

const PALETTE = {
  organize: { bg: "#fdeceb" },
  convert: { bg: "#e8f0fe" },
  edit: { bg: "#fef3e2" },
  forms: { bg: "#e7f7ec" },
  security: { bg: "#f1eafe" },
} as const;

function makeIcon(src: string, palette: Palette, label: string): ComponentType<ToolIconProps> {
  const Comp = ({ size = 64, className, title }: ToolIconProps) => {
    const imgSize = Math.round(size * 0.86);
    return (
      <div
        className={`inline-flex items-center justify-center rounded-2xl transition-[filter,transform] duration-200 group-hover:brightness-95 ${className ?? ""}`}
        style={{
          width: size,
          height: size,
          backgroundColor: palette.bg,
        }}
      >
        <img
          src={src}
          width={imgSize}
          height={imgSize}
          alt={title ?? label}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block object-contain"
          style={{ width: imgSize, height: imgSize }}
        />
      </div>
    );
  };
  Comp.displayName = `ToolIcon(${label})`;
  return Comp;
}

const iconMap: Record<string, { src: string; palette: Palette; label: string }> = {
  // Organize (red)
  merge: { src: mergeUrl, palette: PALETTE.organize, label: "Merge PDF" },
  compress: { src: compressUrl, palette: PALETTE.organize, label: "Compress PDF" },
  split: { src: splitUrl, palette: PALETTE.organize, label: "Split PDF" },
  "delete-pages": { src: deletePagesUrl, palette: PALETTE.organize, label: "Delete Pages" },
  "extract-pages": { src: extractPagesUrl, palette: PALETTE.organize, label: "Extract Pages" },
  "reorder-pages": { src: reorderPagesUrl, palette: PALETTE.organize, label: "Reorder Pages" },
  "add-blank-pages": { src: addBlankPagesUrl, palette: PALETTE.organize, label: "Add Blank Pages" },
  rotate: { src: rotateUrl, palette: PALETTE.organize, label: "Rotate PDF" },
  crop: { src: cropUrl, palette: PALETTE.organize, label: "Crop PDF" },

  // Convert (blue)
  "images-to-pdf": { src: imagesToPdfUrl, palette: PALETTE.convert, label: "Image to PDF" },
  "pdf-to-images": { src: pdfToImagesUrl, palette: PALETTE.convert, label: "PDF to Image" },
  "extract-images": { src: extractImagesUrl, palette: PALETTE.convert, label: "Extract Images" },
  "pdf-to-text": { src: pdfToTextUrl, palette: PALETTE.convert, label: "PDF to Text" },
  "txt-to-pdf": { src: txtToPdfUrl, palette: PALETTE.convert, label: "TXT to PDF" },
  "scan-to-pdf": { src: scanToPdfUrl, palette: PALETTE.convert, label: "Scan to PDF" },

  // Edit (orange)
  "edit-pdf": { src: editPdfUrl, palette: PALETTE.edit, label: "Edit & Annotate PDF" },
  watermark: { src: watermarkUrl, palette: PALETTE.edit, label: "Add Watermark" },
  "page-numbers": { src: pageNumbersUrl, palette: PALETTE.edit, label: "Page Numbers" },
  "header-footer": { src: headerFooterUrl, palette: PALETTE.edit, label: "Header & Footer" },
  "grayscale-pdf": { src: grayscalePdfUrl, palette: PALETTE.edit, label: "Grayscale PDF" },
  "pdf-metadata": { src: pdfMetadataUrl, palette: PALETTE.edit, label: "PDF Metadata" },

  // Forms & Compare (green)
  "fill-forms": { src: fillFormsUrl, palette: PALETTE.forms, label: "Fill PDF Forms" },
  "flatten-pdf": { src: flattenPdfUrl, palette: PALETTE.forms, label: "Flatten PDF" },
  compare: { src: compareUrl, palette: PALETTE.forms, label: "Compare PDFs" },

  // Security (purple)
  "protect-pdf": { src: protectPdfUrl, palette: PALETTE.security, label: "Protect PDF" },
  "unlock-pdf": { src: unlockPdfUrl, palette: PALETTE.security, label: "Unlock PDF" },
  "sign-pdf": { src: signPdfUrl, palette: PALETTE.security, label: "Sign PDF" },
  "redact-pdf": { src: redactPdfUrl, palette: PALETTE.security, label: "Redact PDF" },
};

export const toolIcons: Record<string, ComponentType<ToolIconProps>> = Object.fromEntries(
  Object.entries(iconMap).map(([slug, { src, palette, label }]) => [
    slug,
    makeIcon(src, palette, label),
  ]),
);
