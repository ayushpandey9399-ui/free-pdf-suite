# Mobile Performance and Accessibility Optimization Plan

Improve mobile PageSpeed scores (target: 90+) and accessibility compliance by optimizing bundle size, hydration, rendering, and content hierarchy.

## Technical Details

### 1. Bundle and Hydration (Fix 1 & 3)
- **Radix UI Audit**: Ensure `src/components/ui/` components only import what's needed. Remove unused UI components from the project to reduce scanning overhead.
- **Hydration optimization**: Use `React.lazy` for components below the fold in `HomeBottom.tsx` (PrivacyStory, WhyChoose, etc.) to reduce the initial main-thread task duration.
- **Polyfills**: Check `vite.config.ts` for unnecessary legacy polyfills.

### 2. Rendering and Animation (Fix 2 & 4)
- **CSS Inlining**: Inline critical styles for the Hero and Navbar in `src/routes/__root.tsx` to eliminate render-blocking CSS for the LCP element.
- **GPU Acceleration**: Replace `translateY` animations in `HomeBottom.tsx` and `ToolCard` with `will-change: transform` and ensure they use `transform: translate3d` for hardware acceleration.
- **Font Preloading**: Move font preloads to the very top of the `<head>` and ensure they are cached.

### 3. Accessibility and SEO (Fix 5 & 6)
- **Heading Hierarchy**: Audit `src/routes/index.tsx`, `src/components/HomeBottom.tsx`, and `src/components/Footer.tsx` to fix skipped heading levels (H1 -> H3).
- **Color Contrast**: Update `src/styles.css` to darken `--muted-foreground` and hardcoded gray text (`#6B7280`, `#9CA3AF`) to meet the 4.5:1 contrast ratio.

### 4. Caching (Fix 7)
- **Static Assets**: Ensure all assets in `public/` and hashed assets in `dist/` have appropriate long-term cache headers (configured via platform/headers).

## User Review Required

> [!IMPORTANT]
> Some visual changes to text colors (darker grays) will occur to meet accessibility standards. The heading levels will also be adjusted, which may slightly change their default styling if not explicitly overridden.

- **Check**: Are you okay with the light gray text appearing slightly darker for accessibility?
- **Check**: Should I also audit the SEO-specific components (`src/components/*Seo.tsx`) for heading hierarchy, as they were recently updated?
