# Fix rotated images + rebuild HEIC to JPG

Two pieces of work. Neither changes the look of anything the user already likes; both bring existing tools up to the standard the rest of the site already uses.

## 1. Rotated images get cut off in Images to PDF

Current state (verified in `src/tools/images-to-pdf.tsx`): the anchor is already rotated around the intended centre, so the image is no longer pushed fully off the page. What is still wrong is the fit: the scale factor is computed from the image's unrotated width and height. At 90 or 270 degrees the drawn footprint is height x width, so a landscape photo rotated sideways is taller than the page and gets clipped at the top and bottom.

Fix:
- Compute the rotated footprint first: for 90/270 swap width and height before fitting.
- Scale to fit the available box using the swapped dimensions, then derive the drawn width/height from that single scale.
- For the "fit page" size option, size the page from the rotated footprint, not the raw image.
- Keep the existing centre-rotation anchor math and apply the same change in both code paths: `generatePdf` and the merge branch of `run()`.

Result: any image at 0/90/180/270 sits fully inside the page, centred, at the largest size that fits.

## 2. Rebuild HEIC to JPG as a 4-screen workspace

`/tools/heic-to-jpg` is still the old single-screen dropzone plus grid, unlike Images to PDF, Merge, Split, Compress and PDF to Images, which all use the shared workspace pattern. Rebuild it on that same pattern.

Screens:
1. Upload - dropzone, HEIC/HEIF only, multi-file.
2. Workspace - `ToolWorkspace` shell. Left: responsive thumbnail grid of the queued files (HEIC placeholder tile until decoded, name, size, remove button, plus an "Add more" tile). Right sidebar: output format fixed to JPG, quality slider, optional max-width resize, filename prefix. Fixed bottom bar with the red "CONVERT TO JPG" action.
3. Processing - the standard progress overlay with per-file progress and current filename.
4. Success - `ToolSuccessScreen`: download all as ZIP, per-file download, before/after size totals, and next-step tiles pulled from `TOOL_SUGGESTIONS`.

Behaviour details:
- Decode continues to use the lazily imported `heic2any`; conversion stays fully in the browser.
- A file that fails to decode is marked as failed inline and does not abort the batch; the success screen reports how many succeeded.
- ZIP naming keeps the existing duplicate-name guard.
- Non-HEIC and SVG files are rejected on drop, as today.

## Technical notes

- Files touched: `src/tools/images-to-pdf.tsx` (rotation fit), `src/tools/heic-to-jpg.tsx` (rebuild).
- Reuses existing shared pieces: `ToolWorkspace`, `ToolSuccessScreen`, `UploadDropzone`, `loadJSZip`, `saveAs`, `uniqueZipName`, `isSvgFile`, `TOOL_SUGGESTIONS`.
- No new dependencies, no route changes, no SEO content changes. Existing `HeicToJpgSeo` content stays as-is.
- Verify by converting a landscape image rotated 90 degrees and checking the PDF page, and by running a multi-file HEIC batch including one corrupt file.
