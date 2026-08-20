# Rebuild Sign PDF Tool

Rebuild the Sign PDF tool (`src/tools/sign-pdf.tsx`) from scratch to match the requested 4-panel layout, signature creation modal, and professional document editor.

## Proposed Changes

### 1. `src/tools/sign-pdf.tsx`
- **Rewrite entirely** to contain all logic and components in one file as requested.
- **Screen State Machine**:
  - `UPLOAD`: Standard file dropzone.
  - `WORKAREA`: The core 4-panel workspace (Thumbnails, Top Bar, Viewer, Sidebar).
  - `PROCESSING`: Loading state during PDF generation.
  - `SUCCESS`: Download and metrics screen.
- **Panels**:
  - **Left Sidebar**: Small canvas thumbnails of all pages.
  - **Top Bar**: Navigation (Prev/Next), page input, document name.
  - **Main Viewer**: Gray background, white page cards, floating red "+" button.
  - **Right Sidebar**: "Signing options" with tab cards for Simple/Digital signature, Required fields (Signature), and Optional fields (Initials, Name, Date, Text, Stamp).
- **Signature Creation Modal**:
  - Tabs: Draw (smooth quadratic bezier), Type (font selection), Upload (background removal).
- **Drag-and-Drop**:
  - HTML5 Drag API for dragging fields from sidebar to page containers.
  - Absolute positioning with percentage-based coordinates.
  - Interaction: Resizing, dragging, deleting.
- **PDF Generation**:
  - Use `pdf-lib` to embed signatures (images) and text.
  - Correct coordinate mapping (inverted Y-axis).

### Technical Details
- **Libraries**: `pdfjs-dist`, `pdf-lib`, `@pdf-lib/fontkit`, `date-fns`, `lucide-react`.
- **Worker**: Explicit CDN worker source.
- **Mobile**: Responsive layout (hide thumbnails, bottom sheet sidebar).

## Verification Plan

### Manual Verification
- Upload a multi-page PDF.
- Verify thumbnails are generated and clickable for navigation.
- Open signature modal, draw/type a signature, and apply.
- Drag signature and text fields onto different pages.
- Resize and move fields.
- Click "Sign" and verify the downloaded PDF has all elements in the correct positions.
- Test mobile view for responsiveness.
