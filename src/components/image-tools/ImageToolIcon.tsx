// Flat image-tool icons. Matches the PDF tool icon language:
// soft pastel rounded tile + simple flat glyph in 2-3 solid colors.
// No gradients, no gloss, no bevel, no 3D. Photo-card motif + tiny
// flat target-format tag (or compress motif for the compress tool).

import { getImageTool, imageToolTintBg } from "@/lib/imageTools";

const TARGET_LABEL: Record<string, string | null> = {
  "heic-to-jpg": "JPG",
  "heic-to-png": "PNG",
  "jpg-to-png": "PNG",
  "png-to-jpg": "JPG",
  "webp-to-jpg": "JPG",
  "webp-to-png": "PNG",
  "jpg-to-webp": "WEBP",
  "png-to-webp": "WEBP",
  "compress-image": null,
  "image-resize": null,
  "crop-image": null,
  "rotate-image": null,
  "watermark-image": null,
  "meme-generator": null,
  "photo-editor": null,
};

export interface ImageToolIconProps {
  slug: string;
  size?: number;
  radius?: number;
  className?: string;
}

/** Softer/lighter accent used for the photo card body inside the tile. */
function softAccent(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * 0.28 + 255 * 0.72);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

export function ImageToolIcon({
  slug,
  size = 46,
  radius = 10,
  className,
}: ImageToolIconProps) {
  const tool = getImageTool(slug);
  const accent = tool?.tint ?? "#E5322D";
  const tile = imageToolTintBg(accent);
  const soft = softAccent(accent);
  const label = TARGET_LABEL[slug];
  const isCompress = slug === "compress-image";
  const isResize = slug === "image-resize";
  const isCrop = slug === "crop-image";
  const isRotate = slug === "rotate-image";
  const isWatermark = slug === "watermark-image";
  const isMeme = slug === "meme-generator";

  return (
    <svg
      role="img"
      aria-label={tool?.name ?? "Image tool"}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", borderRadius: radius }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flat pastel tile */}
      <rect x="0" y="0" width="64" height="64" rx={radius} ry={radius} fill={tile} />

      {/* Flat photo card */}
      <g>
        <rect
          x="12"
          y="16"
          width="34"
          height="28"
          rx="4"
          ry="4"
          fill="#FFFFFF"
          stroke={accent}
          strokeWidth="2"
        />
        {/* Sun dot */}
        <circle cx="20" cy="24" r="2.4" fill={accent} />
        {/* Mountains, flat solid */}
        <path d="M13 43 L23 30 L30 37 L36 32 L45 43 Z" fill={soft} />
        <path d="M25 43 L34 33 L45 43 Z" fill={accent} />
      </g>

      {isCompress ? (
        // Flat compress motif: two small arrows pointing inward at the card.
        <g fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* top arrow into card */}
          <path d="M29 8 L29 14 M26 11 L29 14 L32 11" />
          {/* bottom arrow into card */}
          <path d="M29 56 L29 50 M26 53 L29 50 L32 53" />
        </g>
      ) : isResize ? (
        // Flat resize motif: diagonal arrows at the top-left and bottom-right
        // corners of the photo card, pointing outward.
        <g fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {/* top-left outward */}
          <path d="M18 22 L10 14 M10 14 L10 19 M10 14 L15 14" />
          {/* bottom-right outward */}
          <path d="M40 38 L48 46 M48 46 L48 41 M48 46 L43 46" />
        </g>
      ) : isCrop ? (
        // Flat crop motif: two L-shaped corner brackets framing a sub-area of
        // the photo card, evoking the classic crop-tool cursor.
        <g fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* top-left bracket */}
          <path d="M20 22 L20 30 M20 22 L28 22" />
          {/* bottom-right bracket */}
          <path d="M42 40 L42 32 M42 40 L34 40" />
        </g>
      ) : isRotate ? (
        // Flat rotate motif: three-quarter circular arrow curling clockwise
        // around the photo card, with an arrowhead at the end.
        <g fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {/* 3/4 arc from top-center clockwise back to left-center */}
          <path d="M29 10 A 20 20 0 1 1 9 30" />
          {/* arrowhead */}
          <path d="M25 8 L29 10 L27 14" />
        </g>
      ) : isWatermark ? (
        // Flat watermark motif: a small stamp/label with two text bars
        // sitting on top of the photo card.
        <g>
          <rect x="22" y="26" width="26" height="14" rx="2.5" ry="2.5" fill={accent} opacity="0.92" />
          <rect x="25" y="29.5" width="16" height="2" rx="1" fill="#FFFFFF" />
          <rect x="25" y="34" width="12" height="2" rx="1" fill="#FFFFFF" />
        </g>
      ) : isMeme ? (
        // Flat meme motif: a rounded speech bubble with a smile inside,
        // sitting on top of the photo card.
        <g>
          <path
            d="M18 24 h22 a4 4 0 0 1 4 4 v10 a4 4 0 0 1 -4 4 h-14 l-5 4 v-4 h-3 a4 4 0 0 1 -4 -4 v-10 a4 4 0 0 1 4 -4 z"
            fill={accent}
          />
          {/* eyes */}
          <circle cx="24" cy="31" r="1.6" fill="#FFFFFF" />
          <circle cx="34" cy="31" r="1.6" fill="#FFFFFF" />
          {/* smile */}
          <path d="M23 35 Q29 40 35 35" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      ) : (
        // Flat target-format tag at bottom-right.
        <g>
          <rect
            x="36"
            y="44"
            width="22"
            height="14"
            rx="3"
            ry="3"
            fill={accent}
          />
          <text
            x="47"
            y="53.6"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
            fontSize="8.5"
            fontWeight="800"
            fill="#FFFFFF"
            letterSpacing="0.4"
          >
            {label ?? ""}
          </text>
        </g>
      )}
    </svg>
  );
}
