// Premium conversion icons for the image tools silo.
// Each icon is a self-contained SVG that visually communicates the
// "FROM -> TO" transformation, matching the richness of the PDF hub tiles.

import { getImageTool } from "@/lib/imageTools";

type GradientStops = { from: string; to: string };

const GRADIENTS: Record<string, GradientStops> = {
  "heic-to-jpg": { from: "#FB7185", to: "#E11D48" },
  "heic-to-png": { from: "#FBBF24", to: "#EA580C" },
  "jpg-to-png": { from: "#60A5FA", to: "#4338CA" },
  "png-to-jpg": { from: "#34D399", to: "#047857" },
  "webp-to-jpg": { from: "#A78BFA", to: "#6D28D9" },
  "webp-to-png": { from: "#22D3EE", to: "#0E7490" },
  "compress-image": { from: "#F472B6", to: "#BE185D" },
};

const LABELS: Record<string, { from: string; to?: string }> = {
  "heic-to-jpg": { from: "HEIC", to: "JPG" },
  "heic-to-png": { from: "HEIC", to: "PNG" },
  "jpg-to-png": { from: "JPG", to: "PNG" },
  "png-to-jpg": { from: "PNG", to: "JPG" },
  "webp-to-jpg": { from: "WEBP", to: "JPG" },
  "webp-to-png": { from: "WEBP", to: "PNG" },
  "compress-image": { from: "IMG" },
};

export interface ImageToolIconProps {
  slug: string;
  size?: number;
  radius?: number;
  className?: string;
}

/**
 * Renders a premium conversion icon for an image tool.
 * Rounded gradient tile + photo card motif + FROM -> TO format badges
 * (or a compress motif for the compress-image tool).
 */
export function ImageToolIcon({
  slug,
  size = 46,
  radius = 10,
  className,
}: ImageToolIconProps) {
  const tool = getImageTool(slug);
  const grad =
    GRADIENTS[slug] ?? { from: "#E5322D", to: "#B91C1C" };
  const labels = LABELS[slug] ?? { from: "IMG", to: "OUT" };
  const uid = `img-${slug}`;
  const isCompress = slug === "compress-image";

  return (
    <svg
      role="img"
      aria-label={tool?.name ?? "Image tool"}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", borderRadius: radius }}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
        <linearGradient id={`${uid}-photo`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.86" />
        </linearGradient>
        <linearGradient id={`${uid}-hill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={grad.from} stopOpacity="0.9" />
          <stop offset="100%" stopColor={grad.to} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Tile background with gradient + subtle inner ring */}
      <rect
        x="0"
        y="0"
        width="64"
        height="64"
        rx={radius}
        ry={radius}
        fill={`url(#${uid}-bg)`}
      />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx={radius - 0.5}
        ry={radius - 0.5}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth="1.5"
      />
      {/* Soft top highlight */}
      <rect
        x="3"
        y="3"
        width="58"
        height="18"
        rx={radius - 2}
        ry={radius - 2}
        fill="#FFFFFF"
        opacity="0.12"
      />

      {/* Photo card motif */}
      <g>
        <rect
          x="10"
          y="12"
          width="30"
          height="24"
          rx="4"
          ry="4"
          fill={`url(#${uid}-photo)`}
          stroke="#FFFFFF"
          strokeOpacity="0.9"
          strokeWidth="1"
        />
        {/* Sun */}
        <circle cx="16.5" cy="19" r="2.4" fill={grad.from} opacity="0.95" />
        {/* Mountains */}
        <path
          d="M11 34 L20 24 L26 30 L31 25 L39 34 Z"
          fill={`url(#${uid}-hill)`}
        />
      </g>

      {isCompress ? (
        // Compress motif: down arrows + KB tag
        <g>
          {/* Down arrows squeezing the photo */}
          <path
            d="M46 14 L46 22 M43 19 L46 22 L49 19"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M46 34 L46 26 M43 29 L46 26 L49 29"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* KB chip */}
          <rect
            x="12"
            y="44"
            width="40"
            height="14"
            rx="7"
            ry="7"
            fill="#FFFFFF"
          />
          <text
            x="32"
            y="53.6"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontSize="8.5"
            fontWeight="800"
            fill={grad.to}
            letterSpacing="0.5"
          >
            SMALLER KB
          </text>
        </g>
      ) : (
        // FROM chip -> TO chip
        <g>
          <FormatChip
            uid={`${uid}-a`}
            x={4}
            y={44}
            w={22}
            label={labels.from}
            fill="#FFFFFF"
            color={grad.to}
          />
          {/* Arrow */}
          <path
            d="M28 51 L36 51 M33 48 L36 51 L33 54"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <FormatChip
            uid={`${uid}-b`}
            x={38}
            y={44}
            w={22}
            label={labels.to ?? ""}
            fill="#0F172A"
            color="#FFFFFF"
          />
        </g>
      )}
    </svg>
  );
}

function FormatChip({
  x,
  y,
  w,
  label,
  fill,
  color,
}: {
  uid: string;
  x: number;
  y: number;
  w: number;
  label: string;
  fill: string;
  color: string;
}) {
  const h = 14;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} ry={h / 2} fill={fill} />
      <text
        x={x + w / 2}
        y={y + h - 4.2}
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
        fontSize="8.5"
        fontWeight="800"
        fill={color}
        letterSpacing="0.4"
      >
        {label}
      </text>
    </g>
  );
}
