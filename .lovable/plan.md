# Plan - Favicon Refresh

Design and implement a professional favicon for FreePDFHub that aligns with its "two-layer overlapping badge" visual identity.

## User Review Required

> [!IMPORTANT]
> I have analyzed the project's visual style and existing assets. I propose creating a custom favicon that uses the "Red" theme (matching the core brand color `#E5322D`) with a "Document with PDF badge" design, similar to the high-quality tool icons.

- **Option A**: Use the current `logo-512.png` and adapt it to a square favicon.
- **Option B**: Design a new SVG favicon that matches the site's "two-layer" tool icon system (Recommended).
- **Option C**: Describe a specific design you'd like me to create.

## Proposed Implementation

### 1. Design & Asset Creation
- Create a new `public/favicon.svg` using the brand's primary red (`#E5322D`).
- The design will feature a "Back Paper" (light red/pink) and a "Front Badge" (solid red) with a white "PDF" glyph or icon.
- This ensures the favicon looks consistent with the 28+ tools on the site.

### 2. Metadata Integration
- Update `src/routes/__root.tsx` to ensure all favicon links point to the new assets.
- Verify that PWA manifest (`public/manifest.webmanifest`) and apple-touch-icons are aligned.

### 3. Cleanup
- Remove or overwrite stale favicon placeholders to ensure browser cache picks up the new high-resolution version.

## Technical Details
- **Primary Color**: `#E5322D` (Brand Red)
- **SVG ViewBox**: `0 0 64 64` (Standardized with `ToolIcons.tsx`)
- **Format Support**: SVG for modern browsers, PNG fallbacks for legacy/PWA.
