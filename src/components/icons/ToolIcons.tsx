import type { ComponentType, ReactElement, SVGProps } from "react";

/**
 * Per-tool icon system.
 *
 * Every icon renders in a shared 64x64 viewBox with the SAME rounded paper
 * sheet primitive (white body, tinted folded corner) so the whole set feels
 * like one family. Category color is passed in via the two-tone palette:
 *   - `dom`  : the dominant category color used for the main subject
 *   - `tint` : a soft tint of the same color used for secondary shapes
 * Backgrounds are transparent — the parent tile provides the tinted surface.
 *
 * Flat only. No gradients, no strokes on the artwork, no drop shadows.
 */

export interface ToolIconProps {
  size?: number;
  className?: string;
  title?: string;
}

type Palette = { dom: string; tint: string; bg: string };

const PALETTE = {
  organize: { dom: "#E5322D", tint: "#FDE8E7", bg: "#FDECEB" },
  convert: { dom: "#2563EB", tint: "#DBEAFE", bg: "#E8F0FE" },
  edit: { dom: "#D97706", tint: "#FEF3C7", bg: "#FEF3E2" },
  forms: { dom: "#059669", tint: "#D1FAE5", bg: "#E7F7EC" },
  security: { dom: "#7C3AED", tint: "#EDE9FE", bg: "#F1EAFE" },
} as const;

/* ---------- Shared paper-sheet primitive ---------- */

// Rounded rectangular sheet, 32w x 42h by default, with a folded top-right corner.
// x/y refer to the top-left corner of the sheet's bounding rect.
function Sheet({
  x = 16,
  y = 11,
  w = 32,
  h = 42,
  fill = "#ffffff",
  fold,
  foldSize = 8,
}: {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  fill?: string;
  fold: string;
  foldSize?: number;
}) {
  const r = 3;
  const fs = foldSize;
  // Body: rounded rect with a diagonal cut at the top-right so the fold sits in the notch.
  const body = `
    M${x + r} ${y}
    H${x + w - fs}
    L${x + w} ${y + fs}
    V${y + h - r}
    Q${x + w} ${y + h} ${x + w - r} ${y + h}
    H${x + r}
    Q${x} ${y + h} ${x} ${y + h - r}
    V${y + r}
    Q${x} ${y} ${x + r} ${y}
    Z
  `;
  // Folded triangle in the notch.
  const foldPath = `
    M${x + w - fs} ${y}
    V${y + fs}
    H${x + w}
    Z
  `;
  return (
    <>
      <path d={body} fill={fill} />
      <path d={foldPath} fill={fold} />
    </>
  );
}

/* ---------- Icon factory ---------- */

type IconInner = (p: Palette) => ReactElement;

function makeIcon(inner: IconInner, palette: Palette, label: string): ComponentType<ToolIconProps> {
  const Comp = ({ size = 64, className, title }: ToolIconProps) => (
    <div
      className={`inline-flex items-center justify-center rounded-2xl transition-[filter] duration-200 group-hover:brightness-95 ${className ?? ""}`}
      style={{ width: size, height: size, backgroundColor: palette.bg }}
    >
      <svg
        viewBox="0 0 64 64"
        width={Math.round(size * 0.78)}
        height={Math.round(size * 0.78)}
        role="img"
        aria-label={title ?? label}
        xmlns="http://www.w3.org/2000/svg"
      >
        {title ? <title>{title}</title> : null}
        {inner(palette)}
      </svg>
    </div>
  );
  Comp.displayName = `ToolIcon(${label})`;
  return Comp;
}

/* ---------- Shared bits ---------- */

// Faint horizontal "text" lines on a sheet.
const TextLines = ({ tint, x = 22, y = 26, w = 20, gap = 5, count = 3 }: {
  tint: string;
  x?: number;
  y?: number;
  w?: number;
  gap?: number;
  count?: number;
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w} height={2} rx={1} fill={tint} />
    ))}
  </>
);

const Arrow = ({ x1, y1, x2, y2, color, w = 2.5 }: {
  x1: number; y1: number; x2: number; y2: number; color: string; w?: number;
}) => (
  <g stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <line x1={x1} y1={y1} x2={x2} y2={y2} />
    <polyline
      points={`${x2 - 4},${y2 - 3} ${x2},${y2} ${x2 - 4},${y2 + 3}`}
    />
  </g>
);

/* =====================================================================
   ORGANIZE — red
   ===================================================================== */

// MERGE — two small sheets on left/right feeding a big center sheet
const mergeIcon: IconInner = ({ dom, tint }) => (
  <g>
    <rect x={4} y={22} width={16} height={20} rx={3} fill={tint} />
    <rect x={44} y={22} width={16} height={20} rx={3} fill={tint} />
    <Sheet x={22} y={13} w={20} h={38} fill="#fff" fold={dom} foldSize={7} />
    <Arrow x1={18} y1={32} x2={24} y2={32} color={dom} />
    <Arrow x1={46} y1={32} x2={40} y2={32} color={dom} w={2.5} />
  </g>
);

// COMPRESS — sheet squeezed by two arrows from left/right
const compressIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <Arrow x1={4} y1={32} x2={14} y2={32} color={dom} w={3} />
    <Arrow x1={60} y1={32} x2={50} y2={32} color={dom} w={3} />
  </g>
);

// SPLIT — one sheet cut down the middle with dotted gap
const splitIcon: IconInner = ({ dom, tint }) => (
  <g>
    {/* left half */}
    <path d="M13 14a3 3 0 0 1 3-3h14v42H16a3 3 0 0 1-3-3z" fill="#fff" />
    {/* right half with folded corner */}
    <path d="M34 11h10l6 6v34a3 3 0 0 1-3 3H34z" fill="#fff" />
    <path d="M44 11v6h6z" fill={tint} />
    {/* dotted split line */}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={31.25} y={13 + i * 6} width={1.5} height={3.5} rx={0.75} fill={dom} />
    ))}
  </g>
);

// DELETE PAGES — sheet with trash bin at bottom-right
const deletePagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={10} y={9} w={30} h={38} fold={tint} />
    <TextLines tint={tint} x={16} y={22} w={18} count={3} />
    {/* trash bin */}
    <rect x={40} y={38} width={16} height={14} rx={2} fill={dom} />
    <rect x={38} y={34} width={20} height={3} rx={1.5} fill={dom} />
    <rect x={45} y={31} width={6} height={2} rx={1} fill={dom} />
    <rect x={44} y={41} width={1.5} height={7} rx={0.75} fill="#fff" opacity={0.6} />
    <rect x={51} y={41} width={1.5} height={7} rx={0.75} fill="#fff" opacity={0.6} />
  </g>
);

// EXTRACT PAGES — stack of 3 sheets with one highlighted sliding up
const extractPagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    {/* back stack */}
    <rect x={16} y={30} width={30} height={22} rx={3} fill={tint} />
    <rect x={19} y={26} width={30} height={22} rx={3} fill={tint} />
    {/* highlighted sheet sliding up */}
    <Sheet x={22} y={8} w={26} h={30} fill={dom} fold="#fff" foldSize={7} />
    <Arrow x1={35} y1={22} x2={35} y2={6} color={dom} w={0} />
    <g stroke={dom} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <polyline points="31,10 35,6 39,10" />
    </g>
  </g>
);

// REORDER PAGES — two sheets side by side with swap arrows
const reorderPagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={6} y={16} w={22} h={32} fold={tint} />
    <Sheet x={36} y={16} w={22} h={32} fold={tint} />
    {/* swap arrows */}
    <g fill="none" stroke={dom} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10 Q32 2 46 10" />
      <polyline points="18,6 18,10 22,10" />
      <path d="M46 54 Q32 62 18 54" />
      <polyline points="46,58 46,54 42,54" />
    </g>
  </g>
);

// ADD BLANK PAGES — stack with a new sheet + plus circle
const addBlankPagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    <rect x={12} y={20} width={30} height={34} rx={3} fill={tint} />
    <Sheet x={18} y={12} w={30} h={34} fold={tint} />
    {/* plus badge */}
    <circle cx={48} cy={16} r={8} fill={dom} />
    <rect x={47} y={11.5} width={2} height={9} rx={1} fill="#fff" />
    <rect x={43.5} y={15} width={9} height={2} rx={1} fill="#fff" />
  </g>
);

// ROTATE — tilted sheet with circular arrow
const rotateIcon: IconInner = ({ dom, tint }) => (
  <g>
    <g transform="rotate(-15 32 32)">
      <Sheet fold={tint} />
    </g>
    {/* clockwise arc */}
    <g fill="none" stroke={dom} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 20 A22 22 0 1 1 20 12" />
      <polyline points="45,10 50,20 40,22" />
    </g>
  </g>
);

// CROP — sheet with 4 L-shaped corner marks
const cropIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={18} y={13} w={28} h={38} fold={tint} />
    <g stroke={dom} strokeWidth={3} strokeLinecap="round" fill="none">
      {/* TL */}
      <polyline points="10,18 10,10 18,10" />
      {/* TR */}
      <polyline points="46,10 54,10 54,18" />
      {/* BL */}
      <polyline points="10,46 10,54 18,54" />
      {/* BR */}
      <polyline points="46,54 54,54 54,46" />
    </g>
  </g>
);

/* =====================================================================
   CONVERT — blue
   ===================================================================== */

// Small photo thumbnail primitive (sun + mountain)
const Photo = ({ x, y, w = 20, h = 18, dom, tint }: {
  x: number; y: number; w?: number; h?: number; dom: string; tint: string;
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={2.5} fill={tint} />
    <circle cx={x + w * 0.28} cy={y + h * 0.32} r={1.8} fill={dom} />
    <path
      d={`M${x + 1.5} ${y + h - 1.5} L${x + w * 0.4} ${y + h * 0.5} L${x + w * 0.62} ${y + h * 0.72} L${x + w * 0.78} ${y + h * 0.55} L${x + w - 1.5} ${y + h - 1.5} Z`}
      fill={dom}
    />
  </g>
);

// IMAGE TO PDF — photo -> arrow -> sheet
const imagesToPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Photo x={4} y={23} w={20} h={18} dom={dom} tint={tint} />
    <Arrow x1={26} y1={32} x2={36} y2={32} color={dom} />
    <Sheet x={38} y={16} w={22} h={32} fold={tint} />
  </g>
);

// PDF TO IMAGE — sheet -> arrow -> photo
const pdfToImagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={4} y={16} w={22} h={32} fold={tint} />
    <Arrow x1={28} y1={32} x2={38} y2={32} color={dom} />
    <Photo x={40} y={23} w={20} h={18} dom={dom} tint={tint} />
  </g>
);

// EXTRACT IMAGES — sheet with two photos sliding out fanned
const extractImagesIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={8} y={9} w={30} h={40} fold={tint} />
    <TextLines tint={tint} x={14} y={20} w={18} count={2} />
    <g transform="rotate(15 44 44)">
      <Photo x={32} y={30} w={18} h={16} dom={dom} tint={tint} />
    </g>
    <g transform="rotate(-8 48 40)">
      <Photo x={40} y={22} w={18} h={16} dom={dom} tint={tint} />
    </g>
  </g>
);

// PDF TO TEXT — sheet with big T + text lines
const pdfToTextIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    {/* T */}
    <rect x={22} y={18} width={20} height={3.5} rx={1} fill={dom} />
    <rect x={30.25} y={18} width={3.5} height={16} rx={1} fill={dom} />
    {/* lines */}
    <TextLines tint={tint} x={22} y={40} w={20} gap={4} count={3} />
  </g>
);

// TXT TO PDF — text lines -> arrow -> sheet
const txtToPdfIcon: IconInner = ({ dom }) => (
  <g>
    {[0, 1, 2].map((i) => (
      <rect key={i} x={5} y={22 + i * 6} width={18} height={3} rx={1.5} fill={dom} />
    ))}
    <Arrow x1={26} y1={32} x2={36} y2={32} color={dom} />
    <Sheet x={38} y={13} w={22} h={38} fold="#DBEAFE" />
    <TextLines tint="#DBEAFE" x={42} y={22} w={14} gap={4} count={4} />
  </g>
);

// SCAN TO PDF — phone above sheet with scan lines
const scanToPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={16} y={30} w={32} h={24} fold={tint} />
    {/* phone */}
    <rect x={22} y={5} width={20} height={20} rx={3} fill={dom} />
    <rect x={24.5} y={7.5} width={15} height={11} rx={1.5} fill="#fff" />
    <circle cx={32} cy={22} r={1.2} fill="#fff" />
    {/* scan lines between phone & paper */}
    <rect x={22} y={27} width={20} height={1.5} rx={0.75} fill={dom} opacity={0.6} />
  </g>
);

/* =====================================================================
   EDIT — amber
   ===================================================================== */

// EDIT PDF — sheet with diagonal pencil
const editPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={10} y={11} w={32} h={42} fold={tint} />
    <TextLines tint={tint} x={16} y={22} w={18} count={2} />
    {/* pencil body */}
    <g transform="rotate(35 46 34)">
      <rect x={30} y={31} width={26} height={6} rx={1} fill={dom} />
      <path d="M56 31 L62 34 L56 37 Z" fill="#fff" />
      <rect x={30} y={31} width={4} height={6} fill={tint} />
    </g>
  </g>
);

// WATERMARK — sheet with translucent droplet over text lines
const watermarkIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <TextLines tint={tint} x={22} y={22} w={20} gap={4} count={4} />
    {/* droplet centered */}
    <path
      d="M32 22 C26 30 24 34 24 38 A8 8 0 0 0 40 38 C40 34 38 30 32 22 Z"
      fill={dom}
      opacity={0.35}
    />
  </g>
);

// PAGE NUMBERS — sheet with "1 2 3" at bottom
const pageNumbersIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <TextLines tint={tint} x={22} y={20} w={20} gap={4} count={3} />
    {/* digits at bottom */}
    <g fill={dom} fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize={9} fontWeight={700} textAnchor="middle">
      <text x={26} y={47}>1</text>
      <text x={32} y={47}>2</text>
      <text x={38} y={47}>3</text>
    </g>
  </g>
);

// HEADER & FOOTER — sheet with top and bottom bars filled
const headerFooterIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={dom} />
    {/* header bar */}
    <rect x={16} y={11} width={26} height={7} fill={dom} />
    <path d="M42 11v7h6z" fill={dom} />
    {/* footer bar */}
    <path d="M16 46 h32 v4 a3 3 0 0 1-3 3 H19 a3 3 0 0 1-3-3 z" fill={dom} />
    {/* middle text lines */}
    <TextLines tint={tint} x={22} y={26} w={20} gap={4} count={3} />
  </g>
);

// GRAYSCALE — sheet split vertically: color left / gray right
const grayscalePdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    {/* left color circle + bar */}
    <circle cx={22} cy={24} r={4} fill={dom} />
    <rect x={17} y={32} width={13} height={3} rx={1.5} fill={dom} />
    <rect x={17} y={38} width={10} height={3} rx={1.5} fill={tint} />
    {/* right gray circle + bar */}
    <circle cx={42} cy={24} r={4} fill="#9CA3AF" />
    <rect x={35} y={32} width={13} height={3} rx={1.5} fill="#9CA3AF" />
    <rect x={35} y={38} width={10} height={3} rx={1.5} fill="#D1D5DB" />
    {/* divider */}
    <rect x={31.5} y={12} width={1} height={40} fill="#E5E7EB" />
  </g>
);

// METADATA — sheet with price tag attached to top-left
const pdfMetadataIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={18} y={15} w={30} h={38} fold={tint} />
    <TextLines tint={tint} x={24} y={26} w={18} count={3} />
    {/* tag */}
    <g transform="rotate(-25 20 20)">
      <path d="M8 12 h14 l6 6 -14 14 -12 -12 z" fill={dom} />
      <circle cx={10} cy={14} r={2} fill="#fff" />
    </g>
  </g>
);

/* =====================================================================
   FORMS & COMPARE — green
   ===================================================================== */

// FILL FORMS — sheet with checkboxes + pen
const fillFormsIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={10} y={9} w={34} h={42} fold={tint} />
    {/* row 1 (ticked) */}
    <rect x={15} y={19} width={6} height={6} rx={1.2} fill={dom} />
    <polyline points="16.5,22 18,23.5 20,20.5" stroke="#fff" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <rect x={24} y={21} width={16} height={2} rx={1} fill={tint} />
    {/* row 2 empty */}
    <rect x={15} y={30} width={6} height={6} rx={1.2} fill="none" stroke={dom} strokeWidth={1.5} />
    <rect x={24} y={32} width={16} height={2} rx={1} fill={tint} />
    {/* pen at lower right */}
    <g transform="rotate(40 48 46)">
      <rect x={40} y={44} width={16} height={4} rx={1} fill={dom} />
      <path d="M56 44 L60 46 L56 48 Z" fill="#fff" />
    </g>
  </g>
);

// FLATTEN — 3 stacked sheets pressed by a bar
const flattenPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    {/* press bar */}
    <rect x={8} y={12} width={48} height={5} rx={2} fill={dom} />
    {/* stacked sheets */}
    <rect x={12} y={22} width={40} height={6} rx={2} fill={tint} />
    <rect x={14} y={30} width={36} height={6} rx={2} fill={tint} />
    <rect x={10} y={40} width={44} height={10} rx={2} fill="#fff" stroke={tint} strokeWidth={1.5} />
    {/* down arrows */}
    <g stroke={dom} strokeWidth={2} strokeLinecap="round" fill="none">
      <line x1={20} y1={18} x2={20} y2={22} />
      <line x1={44} y1={18} x2={44} y2={22} />
    </g>
  </g>
);

// COMPARE — two sheets side by side + magnifying glass
const compareIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={4} y={11} w={26} h={40} fold={tint} />
    <Sheet x={34} y={11} w={26} h={40} fold={tint} />
    <TextLines tint={tint} x={9} y={22} w={16} gap={4} count={3} />
    <TextLines tint={tint} x={39} y={22} w={16} gap={4} count={3} />
    {/* magnifying glass */}
    <circle cx={32} cy={36} r={11} fill="#fff" stroke={dom} strokeWidth={3} />
    <line x1={40} y1={44} x2={48} y2={52} stroke={dom} strokeWidth={3.5} strokeLinecap="round" />
  </g>
);

/* =====================================================================
   SECURITY — purple
   ===================================================================== */

// Padlock body (shared)
const LockBody = ({ cx, cy, color }: { cx: number; cy: number; color: string }) => (
  <>
    <rect x={cx - 8} y={cy - 4} width={16} height={13} rx={2} fill={color} />
    <circle cx={cx} cy={cy + 2} r={1.6} fill="#fff" />
    <rect x={cx - 0.8} y={cy + 2} width={1.6} height={4} fill="#fff" />
  </>
);

// PROTECT — sheet with closed padlock on lower half
const protectPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <TextLines tint={tint} x={22} y={20} w={20} gap={4} count={2} />
    {/* shackle closed */}
    <path d="M26 34 v-4 a6 6 0 0 1 12 0 v4" stroke={dom} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <LockBody cx={32} cy={38} color={dom} />
  </g>
);

// UNLOCK — sheet with open padlock (shackle open to the side)
const unlockPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <TextLines tint={tint} x={22} y={20} w={20} gap={4} count={2} />
    {/* shackle open (rotated, one leg lifted) */}
    <path d="M22 34 v-3 a6 6 0 0 1 12 -2" stroke={dom} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    <LockBody cx={32} cy={38} color={dom} />
  </g>
);

// SIGN — sheet with fountain pen nib on a signature curve
const signPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet x={8} y={11} w={40} h={42} fold={tint} />
    {/* signature curve */}
    <path
      d="M14 40 C 20 30, 26 46, 30 34 S 40 42, 44 30"
      fill="none"
      stroke={dom}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
    {/* pen at end of stroke */}
    <g transform="rotate(30 50 26)">
      <rect x={44} y={16} width={18} height={5} rx={1} fill={dom} />
      <path d="M62 16 L66 18.5 L62 21 Z" fill={dom} />
      <rect x={44} y={16} width={3} height={5} fill="#fff" />
    </g>
  </g>
);

// REDACT — sheet with censor bars over some lines
const redactPdfIcon: IconInner = ({ dom, tint }) => (
  <g>
    <Sheet fold={tint} />
    <rect x={22} y={19} width={16} height={2.5} rx={1} fill={dom} />
    <rect x={22} y={25} width={20} height={4} rx={1} fill="#111827" />
    <rect x={22} y={32} width={12} height={2.5} rx={1} fill={tint} />
    <rect x={22} y={38} width={18} height={4} rx={1} fill="#111827" />
    <rect x={22} y={46} width={10} height={2.5} rx={1} fill={tint} />
  </g>
);

/* ---------- Registry ---------- */

const iconMap: Record<string, { inner: IconInner; palette: Palette; label: string }> = {
  // Organize
  merge: { inner: mergeIcon, palette: PALETTE.organize, label: "Merge PDF" },
  compress: { inner: compressIcon, palette: PALETTE.organize, label: "Compress PDF" },
  split: { inner: splitIcon, palette: PALETTE.organize, label: "Split PDF" },
  "delete-pages": { inner: deletePagesIcon, palette: PALETTE.organize, label: "Delete Pages" },
  "extract-pages": { inner: extractPagesIcon, palette: PALETTE.organize, label: "Extract Pages" },
  "reorder-pages": { inner: reorderPagesIcon, palette: PALETTE.organize, label: "Reorder Pages" },
  "add-blank-pages": { inner: addBlankPagesIcon, palette: PALETTE.organize, label: "Add Blank Pages" },
  rotate: { inner: rotateIcon, palette: PALETTE.organize, label: "Rotate PDF" },
  crop: { inner: cropIcon, palette: PALETTE.organize, label: "Crop PDF" },

  // Convert
  "images-to-pdf": { inner: imagesToPdfIcon, palette: PALETTE.convert, label: "Image to PDF" },
  "pdf-to-images": { inner: pdfToImagesIcon, palette: PALETTE.convert, label: "PDF to Image" },
  "extract-images": { inner: extractImagesIcon, palette: PALETTE.convert, label: "Extract Images" },
  "pdf-to-text": { inner: pdfToTextIcon, palette: PALETTE.convert, label: "PDF to Text" },
  "txt-to-pdf": { inner: txtToPdfIcon, palette: PALETTE.convert, label: "TXT to PDF" },
  "scan-to-pdf": { inner: scanToPdfIcon, palette: PALETTE.convert, label: "Scan to PDF" },

  // Edit
  "edit-pdf": { inner: editPdfIcon, palette: PALETTE.edit, label: "Edit PDF" },
  watermark: { inner: watermarkIcon, palette: PALETTE.edit, label: "Add Watermark" },
  "page-numbers": { inner: pageNumbersIcon, palette: PALETTE.edit, label: "Page Numbers" },
  "header-footer": { inner: headerFooterIcon, palette: PALETTE.edit, label: "Header & Footer" },
  "grayscale-pdf": { inner: grayscalePdfIcon, palette: PALETTE.edit, label: "Grayscale PDF" },
  "pdf-metadata": { inner: pdfMetadataIcon, palette: PALETTE.edit, label: "PDF Metadata" },

  // Forms & Compare
  "fill-forms": { inner: fillFormsIcon, palette: PALETTE.forms, label: "Fill PDF Forms" },
  "flatten-pdf": { inner: flattenPdfIcon, palette: PALETTE.forms, label: "Flatten PDF" },
  compare: { inner: compareIcon, palette: PALETTE.forms, label: "Compare PDFs" },

  // Security
  "protect-pdf": { inner: protectPdfIcon, palette: PALETTE.security, label: "Protect PDF" },
  "unlock-pdf": { inner: unlockPdfIcon, palette: PALETTE.security, label: "Unlock PDF" },
  "sign-pdf": { inner: signPdfIcon, palette: PALETTE.security, label: "Sign PDF" },
  "redact-pdf": { inner: redactPdfIcon, palette: PALETTE.security, label: "Redact PDF" },
};

export const toolIcons: Record<string, ComponentType<ToolIconProps>> = Object.fromEntries(
  Object.entries(iconMap).map(([slug, { inner, palette, label }]) => [
    slug,
    makeIcon(inner, palette, label),
  ]),
);

// Silence unused import warning; SVGProps kept for future extensions.
export type _SVGProps = SVGProps<SVGSVGElement>;
