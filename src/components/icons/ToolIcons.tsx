import type { ComponentType } from "react";
import {
  Combine,
  Scissors,
  Trash2,
  FileOutput,
  ArrowUpDown,
  FilePlus,
  RotateCw,
  Crop,
  Minimize2,
  ImagePlus,
  FileImage,
  Images,
  FileText,
  FileType,
  ScanLine,
  Hash,
  PanelTop,
  Droplets,
  Contrast,
  Tag,
  PenLine,
  FormInput,
  Layers,
  GitCompare,
  Lock,
  LockOpen,
  Signature,
  EyeOff,
  type LucideIcon,
} from "lucide-react";

/**
 * Per-tool icon system.
 * Each tool renders a rounded "duotone" tile: a light tint of its category
 * color as background, a strong stroke Lucide icon on top. The whole tile
 * is the icon component — it accepts a size prop like the old images.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

type Palette = { bg: string; fg: string };

const PALETTE = {
  organize: { bg: "#fdeceb", fg: "#e5322d" },
  convert: { bg: "#e8f0fe", fg: "#2563eb" },
  edit: { bg: "#fef3e2", fg: "#ea8a0b" },
  forms: { bg: "#e7f7ec", fg: "#16a34a" },
  security: { bg: "#f1eafe", fg: "#7c3aed" },
} as const;

function makeIcon(Icon: LucideIcon, palette: Palette, label: string): ComponentType<ToolIconProps> {
  const Comp = ({ size = 56, className, title }: ToolIconProps) => {
    const iconSize = Math.round(size * 0.5);
    return (
      <div
        role="img"
        aria-label={title ?? label}
        className={`inline-flex items-center justify-center rounded-2xl transition-[filter,transform] duration-200 group-hover:brightness-95 ${className ?? ""}`}
        style={{
          width: size,
          height: size,
          backgroundColor: palette.bg,
          color: palette.fg,
        }}
      >
        <Icon size={iconSize} strokeWidth={1.9} absoluteStrokeWidth />
      </div>
    );
  };
  Comp.displayName = `ToolIcon(${label})`;
  return Comp;
}

// slug → (Lucide icon, category palette, alt label)
const iconMap: Record<string, { icon: LucideIcon; palette: Palette; label: string }> = {
  // Organize (red)
  merge: { icon: Combine, palette: PALETTE.organize, label: "Merge PDF" },
  compress: { icon: Minimize2, palette: PALETTE.organize, label: "Compress PDF" },
  split: { icon: Scissors, palette: PALETTE.organize, label: "Split PDF" },
  "delete-pages": { icon: Trash2, palette: PALETTE.organize, label: "Delete Pages" },
  "extract-pages": { icon: FileOutput, palette: PALETTE.organize, label: "Extract Pages" },
  "reorder-pages": { icon: ArrowUpDown, palette: PALETTE.organize, label: "Reorder Pages" },
  "add-blank-pages": { icon: FilePlus, palette: PALETTE.organize, label: "Add Blank Pages" },
  rotate: { icon: RotateCw, palette: PALETTE.organize, label: "Rotate PDF" },
  crop: { icon: Crop, palette: PALETTE.organize, label: "Crop PDF" },

  // Convert (blue)
  "images-to-pdf": { icon: ImagePlus, palette: PALETTE.convert, label: "Image to PDF" },
  "pdf-to-images": { icon: FileImage, palette: PALETTE.convert, label: "PDF to Image" },
  "extract-images": { icon: Images, palette: PALETTE.convert, label: "Extract Images" },
  "pdf-to-text": { icon: FileText, palette: PALETTE.convert, label: "PDF to Text" },
  "txt-to-pdf": { icon: FileType, palette: PALETTE.convert, label: "TXT to PDF" },
  "scan-to-pdf": { icon: ScanLine, palette: PALETTE.convert, label: "Scan to PDF" },

  // Edit (amber)
  "edit-pdf": { icon: PenLine, palette: PALETTE.edit, label: "Edit & Annotate PDF" },
  watermark: { icon: Droplets, palette: PALETTE.edit, label: "Add Watermark" },
  "page-numbers": { icon: Hash, palette: PALETTE.edit, label: "Page Numbers" },
  "header-footer": { icon: PanelTop, palette: PALETTE.edit, label: "Header & Footer" },
  "grayscale-pdf": { icon: Contrast, palette: PALETTE.edit, label: "Grayscale PDF" },
  "pdf-metadata": { icon: Tag, palette: PALETTE.edit, label: "PDF Metadata" },

  // Forms & Compare (green)
  "fill-forms": { icon: FormInput, palette: PALETTE.forms, label: "Fill PDF Forms" },
  "flatten-pdf": { icon: Layers, palette: PALETTE.forms, label: "Flatten PDF" },
  compare: { icon: GitCompare, palette: PALETTE.forms, label: "Compare PDFs" },

  // Security (purple)
  "protect-pdf": { icon: Lock, palette: PALETTE.security, label: "Protect PDF" },
  "unlock-pdf": { icon: LockOpen, palette: PALETTE.security, label: "Unlock PDF" },
  "sign-pdf": { icon: Signature, palette: PALETTE.security, label: "Sign PDF" },
  "redact-pdf": { icon: EyeOff, palette: PALETTE.security, label: "Redact PDF" },
};

export const toolIcons: Record<string, ComponentType<ToolIconProps>> = Object.fromEntries(
  Object.entries(iconMap).map(([slug, { icon, palette, label }]) => [
    slug,
    makeIcon(icon, palette, label),
  ]),
);
