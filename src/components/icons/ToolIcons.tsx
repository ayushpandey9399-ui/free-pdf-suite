import type { ComponentType } from "react";

import mergeUrl from "@/assets/icons/merge.png";
import splitUrl from "@/assets/icons/split.png";
import deletePagesUrl from "@/assets/icons/delete-pages.png";
import extractPagesUrl from "@/assets/icons/extract-pages.png";
import reorderPagesUrl from "@/assets/icons/reorder-pages.png";
import rotateUrl from "@/assets/icons/rotate.png";
import imagesToPdfUrl from "@/assets/icons/images-to-pdf.png";
import pdfToImagesUrl from "@/assets/icons/pdf-to-images.png";
import pdfToTextUrl from "@/assets/icons/pdf-to-text.png";
import pageNumbersUrl from "@/assets/icons/page-numbers.png";
import watermarkUrl from "@/assets/icons/watermark.png";
import cropUrl from "@/assets/icons/crop.png";
import fillFormsUrl from "@/assets/icons/fill-forms.png";
import compareUrl from "@/assets/icons/compare.png";
import compressUrl from "@/assets/icons/compress.png";
import signPdfUrl from "@/assets/icons/sign-pdf.png";
import protectPdfUrl from "@/assets/icons/protect-pdf.png";
import unlockPdfUrl from "@/assets/icons/unlock-pdf.png";
import editPdfUrl from "@/assets/icons/edit-pdf.png";
import flattenPdfUrl from "@/assets/icons/flatten-pdf.png";

/**
 * AI-generated icon artwork for PDFfree tools.
 * Rendered as <img> so cards keep their existing hover transform on the icon.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

function makeIcon(src: string, alt: string): ComponentType<ToolIconProps> {
  const Comp = ({ size = 56, className, title }: ToolIconProps) => (
    <img
      src={src}
      width={size}
      height={size}
      alt={title ?? alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`block object-contain ${className ?? ""}`}
    />
  );
  Comp.displayName = `ToolIcon(${alt})`;
  return Comp;
}


export const MergeIcon = makeIcon(mergeUrl, "Merge PDF");
export const SplitIcon = makeIcon(splitUrl, "Split PDF");
export const DeletePagesIcon = makeIcon(deletePagesUrl, "Delete Pages");
export const ExtractPagesIcon = makeIcon(extractPagesUrl, "Extract Pages");
export const ReorderIcon = makeIcon(reorderPagesUrl, "Reorder Pages");
export const RotateIcon = makeIcon(rotateUrl, "Rotate PDF");
export const ImagesToPdfIcon = makeIcon(imagesToPdfUrl, "Image to PDF");
export const PdfToImagesIcon = makeIcon(pdfToImagesUrl, "PDF to Image");
export const PdfToTextIcon = makeIcon(pdfToTextUrl, "PDF to Text");
export const PageNumbersIcon = makeIcon(pageNumbersUrl, "Page Numbers");
export const WatermarkIcon = makeIcon(watermarkUrl, "Add Watermark");
export const CropIcon = makeIcon(cropUrl, "Crop PDF");
export const FillFormsIcon = makeIcon(fillFormsUrl, "Fill PDF Forms");
export const CompareIcon = makeIcon(compareUrl, "Compare PDFs");
export const CompressIcon = makeIcon(compressUrl, "Compress PDF");
export const SignPdfIcon = makeIcon(signPdfUrl, "Sign PDF");
export const ProtectPdfIcon = makeIcon(protectPdfUrl, "Protect PDF");
export const UnlockPdfIcon = makeIcon(unlockPdfUrl, "Unlock PDF");
export const EditPdfIcon = makeIcon(editPdfUrl, "Edit & Annotate PDF");

export const toolIcons: Record<string, ComponentType<ToolIconProps>> = {
  merge: MergeIcon,
  compress: CompressIcon,
  split: SplitIcon,
  "delete-pages": DeletePagesIcon,
  "extract-pages": ExtractPagesIcon,
  "reorder-pages": ReorderIcon,
  rotate: RotateIcon,
  "images-to-pdf": ImagesToPdfIcon,
  "pdf-to-images": PdfToImagesIcon,
  "pdf-to-text": PdfToTextIcon,
  "page-numbers": PageNumbersIcon,
  watermark: WatermarkIcon,
  crop: CropIcon,
  "fill-forms": FillFormsIcon,
  "sign-pdf": SignPdfIcon,
  compare: CompareIcon,
  "protect-pdf": ProtectPdfIcon,
  "unlock-pdf": UnlockPdfIcon,
  "edit-pdf": EditPdfIcon,
};
