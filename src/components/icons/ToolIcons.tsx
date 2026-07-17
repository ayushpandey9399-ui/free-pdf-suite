import type { ComponentType, SVGProps } from "react";

/**
 * Two-layer badge icon system for PDFfree tools.
 * Original artwork: back rounded square (lighter, rotated), front rounded
 * square (solid) with a white line-glyph. 56x56 default, scales via `size`.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

interface BadgeProps extends ToolIconProps {
  back: string;
  front: string;
  children: React.ReactNode;
}

let uidCounter = 0;
const nextId = () => `pdf-badge-${++uidCounter}`;

function Badge({ size = 56, className, title, back, front, children }: BadgeProps) {
  const shadowId = nextId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
    >
      <defs>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="#0b0b1a" floodOpacity="0.10" />
        </filter>
      </defs>
      {/* Back layer */}
      <g transform="rotate(-6 22 22)">
        <rect x="2" y="2" width="40" height="40" rx="11" fill={back} />
      </g>
      {/* Front layer with soft shadow */}
      <g filter={`url(#${shadowId})`}>
        <rect x="12" y="12" width="42" height="42" rx="12" fill={front} />
      </g>
      {/* Glyph, centered around (33, 33) inside the front tile */}
      <g
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {children}
      </g>
    </svg>
  );
}

// Palettes
const RED = { back: "#FED7D2", front: "#E5322D" };
const CORAL = { back: "#FDE0DC", front: "#DC2626" };
const ORANGE = { back: "#FDE4CF", front: "#EA580C" };
const AMBER = { back: "#FEF0C7", front: "#D97706" };
const BLUE = { back: "#DCEBFC", front: "#2563EB" };
const PURPLE = { back: "#EDE4FB", front: "#7C3AED" };
const SLATE = { back: "#E2E8F0", front: "#475569" };
const INDIGO = { back: "#E0E7FF", front: "#4F46E5" };
const TEAL = { back: "#D6F5F3", front: "#0D9488" };
const VIOLET = { back: "#EDE4FB", front: "#7C3AED" };
const EMERALD = { back: "#D1FAE5", front: "#059669" };

// --- Organize ---

export const MergeIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...RED}>
    <rect x="22" y="19" width="10" height="7" rx="1.4" />
    <rect x="34" y="19" width="10" height="7" rx="1.4" />
    <path d="M28 28 L28 34 M40 28 L40 34" />
    <path d="M28 34 Q28 38 32 38 L36 38 Q40 38 40 34" />
    <path d="M34 42 L34 46 M34 46 L31 43 M34 46 L37 43" />
  </Badge>
);

export const SplitIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...RED}>
    <rect x="27" y="19" width="12" height="9" rx="1.4" />
    <path d="M33 28 L33 34" strokeDasharray="1.5 2" />
    <path d="M33 34 Q33 37 30 37 L25 37 M33 34 Q33 37 36 37 L41 37" />
    <rect x="21" y="38" width="10" height="8" rx="1.4" />
    <rect x="35" y="38" width="10" height="8" rx="1.4" />
  </Badge>
);

export const DeletePagesIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...CORAL}>
    <path d="M25 20 L36 20 L41 25 L41 44 Q41 46 39 46 L25 46 Q23 46 23 44 L23 22 Q23 20 25 20 Z" />
    <path d="M36 20 L36 25 L41 25" />
    <path d="M28 33 L36 41 M36 33 L28 41" />
  </Badge>
);

export const ExtractPagesIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...ORANGE}>
    <rect x="25" y="28" width="16" height="18" rx="1.6" />
    <path d="M29 25 L41 25 L41 42" opacity="0.55" />
    <path d="M33 40 L33 30 M33 30 L29 34 M33 30 L37 34" />
  </Badge>
);

export const ReorderIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...AMBER}>
    <path d="M22 24 L36 24" />
    <path d="M22 32 L36 32" />
    <path d="M22 40 L36 40" />
    <circle cx="20" cy="24" r="1.2" fill="#ffffff" stroke="none" />
    <circle cx="20" cy="32" r="1.2" fill="#ffffff" stroke="none" />
    <circle cx="20" cy="40" r="1.2" fill="#ffffff" stroke="none" />
    <path d="M42 22 L42 42" />
    <path d="M42 22 L39 25 M42 22 L45 25" />
    <path d="M42 42 L39 39 M42 42 L45 39" />
  </Badge>
);

export const RotateIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...RED}>
    <rect x="26" y="26" width="14" height="16" rx="1.6" />
    <path d="M22 32 A11 11 0 0 1 44 32" />
    <path d="M44 32 L44 27 M44 32 L48.5 32" />
  </Badge>
);

// --- Convert ---

export const ImagesToPdfIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...BLUE}>
    <rect x="19" y="22" width="13" height="13" rx="1.6" />
    <path d="M19 32 L23 29 L27 32 L30 30 L32 32" />
    <circle cx="23" cy="26" r="1.2" fill="#ffffff" stroke="none" />
    <path d="M35 30 L41 30 M41 30 L38 27 M41 30 L38 33" />
    <path d="M40 25 L47 25 L47 42 Q47 44 45 44 L40 44 Q38 44 38 42 L38 27 Q38 25 40 25 Z" />
  </Badge>
);

export const PdfToImagesIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...PURPLE}>
    <path d="M17 25 L24 25 L24 42 Q24 44 22 44 L17 44 Q15 44 15 42 L15 27 Q15 25 17 25 Z" />
    <path d="M27 30 L33 30 M33 30 L30 27 M33 30 L30 33" />
    <rect x="36" y="22" width="13" height="13" rx="1.6" />
    <path d="M36 32 L40 29 L44 32 L46 31 L49 32" />
    <circle cx="40" cy="26" r="1.2" fill="#ffffff" stroke="none" />
  </Badge>
);

export const PdfToTextIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...SLATE}>
    <path d="M17 22 L26 22 L26 42 Q26 44 24 44 L17 44 Q15 44 15 42 L15 24 Q15 22 17 22 Z" />
    <path d="M18 28 L23 28 M18 32 L23 32 M18 36 L21 36" />
    <path d="M30 32 L36 32 M36 32 L33 29 M36 32 L33 35" />
    <path d="M42 40 L42 26 L48 26 L48 40 Z" opacity="0" />
    <path d="M42 40 L45 26 L48 40 M43.2 34.7 L46.8 34.7" />
  </Badge>
);

// --- Edit ---

export const PageNumbersIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...INDIGO}>
    <path d="M23 20 L37 20 L43 26 L43 44 Q43 46 41 46 L23 46 Q21 46 21 44 L21 22 Q21 20 23 20 Z" />
    <path d="M37 20 L37 26 L43 26" />
    <path d="M27 40 L27 34 L25 35.5 M31 34 Q34 34 34 36 Q34 38 30 40 L34 40 M37 34 Q39.5 34 39.5 36 Q39.5 37 37 37 Q39.5 37 39.5 39 Q39.5 40.5 37 40.5" />
  </Badge>
);

export const WatermarkIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...TEAL}>
    <path d="M22 20 L36 20 L42 26 L42 44 Q42 46 40 46 L22 46 Q20 46 20 44 L20 22 Q20 20 22 20 Z" />
    <path d="M36 20 L36 26 L42 26" />
    <path d="M31 30 Q31 30 27 35 Q24 39 27 41.5 Q31 44 35 41.5 Q38 39 35 35 Q31 30 31 30 Z" opacity="0.75" />
  </Badge>
);

export const CropIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...VIOLET}>
    <rect x="24" y="22" width="16" height="20" rx="1.6" opacity="0.55" />
    <path d="M21 26 L27 26 L27 20" />
    <path d="M37 44 L37 38 L43 38" />
  </Badge>
);

// --- Forms & Compare ---

export const FillFormsIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...EMERALD}>
    <path d="M21 20 L35 20 L41 26 L41 44 Q41 46 39 46 L21 46 Q19 46 19 44 L19 22 Q19 20 21 20 Z" />
    <path d="M35 20 L35 26 L41 26" />
    <rect x="23" y="30" width="4" height="4" rx="0.6" />
    <path d="M22.5 32 L24 33.5 L27 30.5" />
    <path d="M29 32.5 L37 32.5" />
    <path d="M23 39 L34 39 M34 39 L37 36 M37 36 L38.5 37.5 M38.5 37.5 L35.5 40.5 L34 39" />
  </Badge>
);

export const CompareIcon: ComponentType<ToolIconProps> = (p) => (
  <Badge {...p} {...ORANGE}>
    <rect x="18" y="22" width="14" height="18" rx="1.6" opacity="0.75" />
    <rect x="26" y="26" width="14" height="18" rx="1.6" />
    <circle cx="42" cy="43" r="3.2" />
    <path d="M44.4 45.4 L47 48" />
  </Badge>
);

// Aggregated export map by slug for the registry.
export const toolIcons: Record<string, ComponentType<ToolIconProps>> = {
  merge: MergeIcon,
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
  compare: CompareIcon,
};

// Satisfy import linters for SVGProps re-export if not used above.
export type _SvgProps = SVGProps<SVGSVGElement>;
