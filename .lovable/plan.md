# Plan: Rebuild Sign PDF Tool Workspace

Complete rebuild of the Sign PDF tool workspace using a professional 4-panel layout with draggable fields, signature creation modal, and high-fidelity rendering.

## User Review Required

- **Placement Persistence**: Fields will be stored in component state during the session.
- **Background Removal**: The signature upload feature will use basic white-pixel transparency.

## Proposed Changes

### Tool Workspace
- **Layout**: 4-panel structure (Sidebar Thumbnails | Top Nav | Central Viewer | Right Options).
- **Draggable Fields**: Implement drag-and-drop for Signature, Initials, Name, Date, Text, and Stamp.
- **Rendering**: Optimized multi-page preview using pdfjs-dist.

### Signature Modal
- **Draw**: Smooth bezier curves for mouse/touch signatures.
- **Type**: 8+ cursive/handwriting font options.
- **Upload**: PNG/JPG support with automatic background removal.

### Technical Detail
- **State**: `placements` array tracking `type`, `pageIndex`, `x`, `y`, `width`, `height`, and `rotation`.
- **Export**: `pdf-lib` for final embedding with coordinate transformation (Y-axis inversion).

## Verification Plan

### Manual Verification
- Upload multi-page PDF.
- Drag signature field to page 2.
- Create signature via "Draw" and "Type".
- Resize and rotate placed field.
- Verify final download has signature in the correct location.
