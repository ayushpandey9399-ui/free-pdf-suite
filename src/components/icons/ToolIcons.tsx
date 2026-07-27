import type { ComponentType, ReactNode } from "react";

/**
 * Uniform tool icon system.
 *
 * Every icon is composed on a 64x64 viewBox from three fixed layers:
 *   1. BACK PAPER  , rounded rect 34x40 @ (4,6), rx=6, tinted, with folded corner + 3 text lines.
 *   2. FRONT BADGE , rounded square 30x30 @ (26,26), rx=8, saturated color, white glyph centered.
 *   3. CONNECTOR   , optional soft arc arrow (convert/transform tools).
 *
 * ONLY the color and glyph change across icons, geometry is identical.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

/* ---------- Color helpers ---------- */

// Solid pastel approximating color @ ~12% over white.
function tintOf(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * 0.14 + 255 * 0.86);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}
function deeperTintOf(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * 0.28 + 255 * 0.72);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

/* ---------- Shared layers ---------- */

// Back paper: rect 34x40 at (4,6), folded corner top-right (6px).
function BackPaper({ color }: { color: string }) {
  const tint = tintOf(color);
  const deeper = deeperTintOf(color);
  // Path with clipped top-right corner
  const body = `
    M10 6
    H32
    L38 12
    V40
    Q38 46 32 46
    H10
    Q4 46 4 40
    V12
    Q4 6 10 6
    Z
  `;
  const fold = `M32 6 V12 H38 Z`;
  return (
    <g>
      <path d={body} fill={tint} />
      <path d={fold} fill={deeper} />
      {/* 3 text lines */}
      <rect x={9} y={17} width={20} height={2} rx={1} fill={deeper} />
      <rect x={9} y={22} width={22} height={2} rx={1} fill={deeper} />
      <rect x={9} y={27} width={16} height={2} rx={1} fill={deeper} />
    </g>
  );
}

// Front badge: rounded square 30x30 at (26,26), rx=8.
function FrontBadge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <g>
      <rect x={26} y={26} width={30} height={30} rx={8} fill={color} />
      {/* Glyphs are drawn in a 20x20 area centered at (41,41), i.e. child coords 31..51 x 31..51 */}
      {children}
    </g>
  );
}

// Optional connector arrow from back paper toward front badge.
function Connector({ color, reverse = false }: { color: string; reverse?: boolean }) {
  // arc from (20,22) to (30,32), soft curve
  const d = reverse
    ? "M30 32 Q22 32 20 22"
    : "M20 22 Q22 32 30 32";
  return (
    <g fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
      {reverse ? (
        <polyline points="18,20 20,22 22,20" />
      ) : (
        <polyline points="28,34 30,32 32,34" />
      )}
    </g>
  );
}

/* ---------- Factory ---------- */

interface Spec {
  color: string;
  label: string;
  glyph: ReactNode;
  connector?: boolean;
  connectorReverse?: boolean;
}

function makeIcon({ color, label, glyph, connector, connectorReverse }: Spec): ComponentType<ToolIconProps> {
  const Comp = ({ size = 64, className, title }: ToolIconProps) => (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? label}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <BackPaper color={color} />
      {connector ? <Connector color={color} reverse={connectorReverse} /> : null}
      <FrontBadge color={color}>{glyph}</FrontBadge>
    </svg>
  );
  Comp.displayName = `ToolIcon(${label})`;
  return Comp;
}

/* ---------- Glyphs (white, centered in 20x20 area @ 31..51) ---------- */
// Stroke defaults: 2.2px, round caps/joins.
const S = {
  stroke: "#ffffff",
  fill: "#ffffff",
  sw: 2.2,
} as const;

const G = {
  strokeProps: {
    stroke: S.stroke,
    strokeWidth: S.sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  },
};

// Merge, two arrows converging into one point (down-right)
const glyphMerge = (
  <g {...G.strokeProps}>
    <path d="M33 33 L41 41" />
    <path d="M49 33 L41 41" />
    <path d="M41 41 L41 49" />
    <polyline points="38,46 41,49 44,46" />
  </g>
);

// Compress, four arrows pointing inward
const glyphCompress = (
  <g {...G.strokeProps}>
    <path d="M33 33 L38 38" />
    <polyline points="33,36 33,33 36,33" />
    <path d="M49 33 L44 38" />
    <polyline points="49,36 49,33 46,33" />
    <path d="M33 49 L38 44" />
    <polyline points="36,49 33,49 33,46" />
    <path d="M49 49 L44 44" />
    <polyline points="46,49 49,49 49,46" />
  </g>
);

// Split, two arrows diverging apart
const glyphSplit = (
  <g {...G.strokeProps}>
    <path d="M41 33 L41 37" />
    <path d="M41 37 L34 44" />
    <polyline points="34,41 34,44 37,44" />
    <path d="M41 37 L48 44" />
    <polyline points="48,41 48,44 45,44" />
    <path d="M34 44 L34 49" />
    <path d="M48 44 L48 49" />
  </g>
);

// Delete, trash bin
const glyphDelete = (
  <g {...G.strokeProps}>
    <rect x={34} y={35} width={14} height={14} rx={1.5} />
    <line x1={32} y1={35} x2={50} y2={35} />
    <line x1={38} y1={33} x2={44} y2={33} />
    <line x1={38} y1={39} x2={38} y2={45} />
    <line x1={44} y1={39} x2={44} y2={45} />
  </g>
);

// Extract Pages, sheet with up-arrow
const glyphExtract = (
  <g {...G.strokeProps}>
    <rect x={35} y={38} width={12} height={11} rx={1.5} />
    <path d="M41 34 L41 43" />
    <polyline points="38,37 41,34 44,37" />
  </g>
);

// Reorder, up/down swap arrows
const glyphReorder = (
  <g {...G.strokeProps}>
    <line x1={37} y1={33} x2={37} y2={49} />
    <polyline points="34,36 37,33 40,36" />
    <line x1={45} y1={49} x2={45} y2={33} />
    <polyline points="42,46 45,49 48,46" />
  </g>
);

// Add Blank Pages, plus sign
const glyphAdd = (
  <g {...G.strokeProps} strokeWidth={2.6}>
    <line x1={41} y1={33} x2={41} y2={49} />
    <line x1={33} y1={41} x2={49} y2={41} />
  </g>
);

// Rotate, circular rotation arrow
const glyphRotate = (
  <g {...G.strokeProps}>
    <path d="M48 41 A7 7 0 1 1 41 34" />
    <polyline points="41,31 41,34 44,34" />
  </g>
);

// Crop, corner frame marks
const glyphCrop = (
  <g {...G.strokeProps}>
    <polyline points="34,37 34,34 37,34" />
    <polyline points="45,34 48,34 48,37" />
    <polyline points="34,45 34,48 37,48" />
    <polyline points="45,48 48,48 48,45" />
  </g>
);

// Photo (mountain + sun) glyph
const glyphPhoto = (
  <g>
    <rect x={33} y={34} width={16} height={14} rx={1.8} fill="none" stroke={S.stroke} strokeWidth={S.sw} />
    <circle cx={37} cy={38} r={1.5} fill={S.fill} />
    <path
      d="M34 47 L39 42 L42 45 L46 40 L48 44 L48 47 Z"
      fill={S.fill}
    />
  </g>
);

// Extract Images, two overlapping photos
const glyphExtractImages = (
  <g>
    <rect x={31} y={36} width={13} height={11} rx={1.5} fill="none" stroke={S.stroke} strokeWidth={S.sw} />
    <rect x={37} y={33} width={13} height={11} rx={1.5} fill="none" stroke={S.stroke} strokeWidth={S.sw} />
    <circle cx={40.5} cy={36.5} r={1.1} fill={S.fill} />
    <path d="M38 42 L41 39 L43 41 L46 38 L48 40 L48 42 Z" fill={S.fill} />
  </g>
);

// PDF to Text, letter "T"
const glyphT = (
  <g fill={S.fill}>
    <rect x={33} y={33} width={16} height={3} rx={0.5} />
    <rect x={39.5} y={33} width={3} height={16} rx={0.5} />
  </g>
);

// PDF to Word, letter "W"
const glyphW = (
  <g
    fill="none"
    stroke={S.fill}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M33 34 L36.5 48 L41 39 L45.5 48 L49 34" />
  </g>
);



// TXT to PDF, three text lines
const glyphLines = (
  <g fill={S.fill}>
    <rect x={33} y={35} width={16} height={2.4} rx={1} />
    <rect x={33} y={40} width={16} height={2.4} rx={1} />
    <rect x={33} y={45} width={11} height={2.4} rx={1} />
  </g>
);

// Scan, camera
const glyphCamera = (
  <g {...G.strokeProps}>
    <path d="M34 39 h3 l1.5 -2 h5 l1.5 2 h3 a1 1 0 0 1 1 1 v7 a1 1 0 0 1 -1 1 h-14 a1 1 0 0 1 -1 -1 v-7 a1 1 0 0 1 1 -1 z" />
    <circle cx={41} cy={43} r={2.6} />
  </g>
);

// Edit, pencil
const glyphPencil = (
  <g {...G.strokeProps}>
    <path d="M34 48 L34 44 L44 34 L48 38 L38 48 Z" />
    <line x1={42} y1={36} x2={46} y2={40} />
  </g>
);

// Watermark, water drop
const glyphDrop = (
  <path
    d="M41 32 C 37 38, 34 41, 34 44 A7 7 0 0 0 48 44 C 48 41, 45 38, 41 32 Z"
    fill={S.fill}
  />
);

// Page Numbers, "123"
const glyph123 = (
  <g fill={S.fill} fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif" fontSize={12} fontWeight={800} textAnchor="middle">
    <text x={35} y={45}>1</text>
    <text x={41} y={45}>2</text>
    <text x={47} y={45}>3</text>
  </g>
);

// Header & Footer, rectangle with top/bottom bars
const glyphHeaderFooter = (
  <g fill={S.fill}>
    <rect x={33} y={33} width={16} height={3} rx={1} />
    <rect x={33} y={38} width={12} height={1.5} rx={0.75} opacity={0.55} />
    <rect x={33} y={41.5} width={10} height={1.5} rx={0.75} opacity={0.55} />
    <rect x={33} y={46} width={16} height={3} rx={1} />
  </g>
);

// Grayscale, half-filled circle
const glyphGrayscale = (
  <g>
    <circle cx={41} cy={41} r={7} fill="none" stroke={S.stroke} strokeWidth={S.sw} />
    <path d="M41 34 A7 7 0 0 1 41 48 Z" fill={S.fill} />
  </g>
);

// Metadata, price tag
const glyphTag = (
  <g {...G.strokeProps}>
    <path d="M34 34 h8 l8 8 -8 8 -8 -8 Z" />
    <circle cx={38} cy={38} r={1.2} fill={S.fill} stroke="none" />
  </g>
);

// Fill Forms, checkbox with tick
const glyphCheckbox = (
  <g {...G.strokeProps}>
    <rect x={34} y={34} width={14} height={14} rx={2} />
    <polyline points="37,41 40,44 46,38" />
  </g>
);

// Flatten, layers pressed by down-arrow
const glyphFlatten = (
  <g fill={S.fill}>
    <rect x={33} y={45} width={16} height={2.5} rx={1} />
    <rect x={35} y={41.5} width={12} height={2.2} rx={1} opacity={0.7} />
    <rect x={37} y={38.5} width={8} height={1.8} rx={0.9} opacity={0.5} />
    <g stroke={S.stroke} strokeWidth={S.sw} strokeLinecap="round" fill="none">
      <line x1={41} y1={32} x2={41} y2={37} />
      <polyline points="38,35 41,37.5 44,35" />
    </g>
  </g>
);

// Compare, magnifying glass
const glyphSearch = (
  <g {...G.strokeProps}>
    <circle cx={39} cy={39} r={5} />
    <line x1={43} y1={43} x2={48} y2={48} />
  </g>
);

// Lock body + shackle helper
const glyphLockClosed = (
  <g>
    <path d="M36 39 v-3 a5 5 0 0 1 10 0 v3" fill="none" stroke={S.stroke} strokeWidth={S.sw} strokeLinecap="round" />
    <rect x={34} y={39} width={14} height={10} rx={1.5} fill={S.fill} />
  </g>
);

const glyphLockOpen = (
  <g>
    <path d="M36 39 v-3 a5 5 0 0 1 9 -2.5" fill="none" stroke={S.stroke} strokeWidth={S.sw} strokeLinecap="round" />
    <rect x={34} y={39} width={14} height={10} rx={1.5} fill={S.fill} />
  </g>
);

// Sign, pen nib with signature curve
const glyphSign = (
  <g {...G.strokeProps}>
    <path d="M33 47 Q37 41 41 45 T49 43" />
    <path d="M46 34 L49 37 L43 43 L40 43 L40 40 Z" fill={S.fill} stroke="none" />
  </g>
);

// Redact, two solid censor bars
const glyphRedact = (
  <g fill={S.fill}>
    <rect x={33} y={36} width={16} height={3.5} rx={0.8} />
    <rect x={33} y={43} width={12} height={3.5} rx={0.8} />
  </g>
);

/* ---------- Registry ---------- */

const specs: Record<string, Spec> = {
  // Organize
  merge: { color: "#E5322D", label: "Merge PDF", glyph: glyphMerge },
  compress: { color: "#16A34A", label: "Compress PDF", glyph: glyphCompress },
  split: { color: "#EA580C", label: "Split PDF", glyph: glyphSplit },
  "delete-pages": { color: "#E11D48", label: "Delete Pages", glyph: glyphDelete },
  "extract-pages": { color: "#0D9488", label: "Extract Pages", glyph: glyphExtract },
  "reorder-pages": { color: "#4F46E5", label: "Reorder Pages", glyph: glyphReorder },
  "add-blank-pages": { color: "#0284C7", label: "Add Blank Pages", glyph: glyphAdd },
  rotate: { color: "#DB2777", label: "Rotate PDF", glyph: glyphRotate },
  crop: { color: "#65A30D", label: "Crop PDF", glyph: glyphCrop },

  // Convert (with connectors)
  "images-to-pdf": { color: "#D97706", label: "Image to PDF", glyph: glyphPhoto, connector: true },
  "pdf-to-images": { color: "#2563EB", label: "PDF to Image", glyph: glyphPhoto, connector: true, connectorReverse: true },
  "extract-images": { color: "#7C3AED", label: "Extract Images", glyph: glyphExtractImages },
  "pdf-to-text": { color: "#475569", label: "PDF to Text", glyph: glyphT },
  "pdf-to-word": { color: "#1E5FBF", label: "PDF to Word", glyph: glyphW, connector: true },
  "txt-to-pdf": { color: "#0891B2", label: "TXT to PDF", glyph: glyphLines, connector: true },
  "scan-to-pdf": { color: "#C2410C", label: "Scan to PDF", glyph: glyphCamera },

  // Edit
  "edit-pdf": { color: "#9333EA", label: "Edit PDF", glyph: glyphPencil },
  watermark: { color: "#0EA5E9", label: "Add Watermark", glyph: glyphDrop },
  "page-numbers": { color: "#059669", label: "Page Numbers", glyph: glyph123 },
  "header-footer": { color: "#C026D3", label: "Header & Footer", glyph: glyphHeaderFooter },
  "grayscale-pdf": { color: "#4B5563", label: "Grayscale PDF", glyph: glyphGrayscale },
  "pdf-metadata": { color: "#92400E", label: "PDF Metadata", glyph: glyphTag },

  // Forms & Compare
  "fill-forms": { color: "#15803D", label: "Fill PDF Forms", glyph: glyphCheckbox },
  "flatten-pdf": { color: "#1D4ED8", label: "Flatten PDF", glyph: glyphFlatten },
  compare: { color: "#B45309", label: "Compare PDFs", glyph: glyphSearch },

  // Security
  "protect-pdf": { color: "#1E40AF", label: "Protect PDF", glyph: glyphLockClosed },
  "unlock-pdf": { color: "#CA8A04", label: "Unlock PDF", glyph: glyphLockOpen },
  "sign-pdf": { color: "#0F766E", label: "Sign PDF", glyph: glyphSign },
  "redact-pdf": { color: "#1F2937", label: "Redact PDF", glyph: glyphRedact },
};

export const toolIcons: Record<string, ComponentType<ToolIconProps>> = Object.fromEntries(
  Object.entries(specs).map(([slug, spec]) => [slug, makeIcon(spec)]),
);

export const toolAccent: Record<string, string> = Object.fromEntries(
  Object.entries(specs).map(([slug, spec]) => [slug, spec.color]),
);

