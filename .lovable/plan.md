# Rebuild PDF to Image Tool with Professional Workspace

The PDF to Image tool will be upgraded from a server-side conversion flow to a high-performance, browser-native 4-screen workspace (Upload → Workspace → Processing → Success) matching the site's professional tool pattern.

## User Experience
- **Upload Screen**: Existing dropzone for PDF selection.
- **Workspace Screen**: 
    - **Main Area**: Responsive grid of all PDF pages rendered in real-time.
    - **Sidebar**: Controls for Output Format (JPG/PNG), Quality (Low/Medium/High DPI), Download Method (Individual/ZIP), and Custom Filename.
    - **Selection**: All pages selected by default; users can toggle individual pages or use "Select All".
- **Processing Screen**: Real-time progress tracking ("Converting page 3 of 12...") with an animated red progress bar.
- **Success Screen**: Direct download for ZIP or a grid of images for individual downloads, plus related tool suggestions.

## Technical Details
- **Rendering Engine**: `pdfjs-dist` (browser-side) for both thumbnails (0.3 scale) and final exports (1.0 to 4.0 scale based on quality).
- **Format Handling**: 
    - JPG: `image/jpeg` with 0.92 quality for optimized file size.
    - PNG: `image/png` for lossless quality with transparency support.
- **Quality Levels**:
    - Low: 72 DPI (scale 1.0)
    - Medium: 150 DPI (scale 2.0)
    - High: 300 DPI (scale 4.0)
- **Packaging**: `JSZip` for bundling multiple images into a single ZIP archive.
- **Performance**: Progressive thumbnail rendering with skeleton loading states and ArrayBuffer cloning to prevent `pdfjs` worker conflicts.
- **Security**: 100% browser-based processing; password-protected PDFs are detected and handled with a link to the Unlock tool.

## Files
- `src/tools/pdf-to-images.tsx`: Complete rebuild of the component and logic.
- `src/lib/pdfToImages.ts`: (Optional) Update types if needed, or keep for legacy server-side fallback/compatibility.
