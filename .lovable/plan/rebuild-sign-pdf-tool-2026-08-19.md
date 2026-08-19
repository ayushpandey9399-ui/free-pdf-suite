# Rebuild Sign PDF Tool

Completely rebuild the Sign PDF tool with a 5-screen professional browser-based signing workspace using `pdf-lib` and `pdfjs-dist`.

## User Review Required

> [!IMPORTANT]
> The implementation uses `pdf-lib` for client-side PDF modification. Signature fonts like *Dancing Script* and *Great Vibes* will be preloaded to ensure consistent rendering between the UI and the exported PDF.

## Proposed Changes

### 1. Signature Creation Component (`src/components/sign-pdf/SignatureCreator.tsx`)
Create a new multi-tab signature setup component:
- **Draw Tab**: Smooth Bezier curve interpolation on HTML Canvas with color/thickness controls and undo/clear.
- **Type Tab**: Signature-style font selector (6-8 fonts) with live preview and color/size controls.
- **Upload Tab**: Image upload with white background removal (canvas pixel iteration) and basic cropping.
- **Initials Section**: Smaller version of the above tabs for optional initials.

### 2. Signing Workspace (`src/components/sign-pdf/SignWorkspace.tsx`)
A full-featured PDF editor:
- **Vertical Document Viewer**: Renders all pages using `pdfjs-dist` in high quality.
- **Floating/Draggable Fields**: Implement a system for placing Signatures, Initials, Dates (multi-format), Names, and Text on specific PDF pages.
- **Field Controls**: Drag, resize, rotate, and delete fields. Visual dashed borders when selected.
- **Zoom & Navigation**: Zoom controls and page-number indicators.
- **Sidebar**: Draggable field types and global controls (Clear All, Edit Signature).

### 3. State & Logic (`src/tools/sign-pdf.tsx`)
Overhaul the tool container to manage the 5-screen flow:
- **Screen 1: Upload**: File dropzone.
- **Screen 2: Creation**: Signature/Initials setup.
- **Screen 3: Editor**: The main signing workspace.
- **Screen 4: Processing**: Embedded `pdf-lib` generation logic (embedding PNGs and drawing text at calculated coordinates).
- **Screen 5: Success**: Download button and related tools grid.

### 4. Technical Details
- **Coordinate Mapping**: Convert screen-space coordinates (percentages within page containers) to PDF-space points for `pdf-lib`.
- **Performance**: Lazy-render thumbnails/canvases and tree-shake libraries.
- **Mobile**: Responsive bottom-sheet for controls and touch-friendly dragging.

## Verification Plan

### Automated Tests
- Run Playwright tests to verify the 5-screen progression.
- Mock PDF uploads and check field placement logic via DOM inspection.

### Manual Verification
- Test drawing smoothness on mobile (touch) and desktop (mouse).
- Verify "Remove white background" works on various signature images.
- Verify final PDF contains all placed fields in correct positions with correct fonts.
- Confirm 100% local processing (no network requests to backend for PDF manipulation).
