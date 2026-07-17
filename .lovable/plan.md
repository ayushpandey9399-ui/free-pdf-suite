# PDFFree — Client-Side PDF Toolkit

A privacy-first PDF web app where all processing runs in the browser. No backend, no uploads, no auth. Built on the existing TanStack Start + Tailwind + shadcn stack.

## Scope

- Homepage with searchable tool grid grouped by category
- 14 fully working tools, all client-side
- Shared tool page layout, reusable dropzone, shared PDF hook
- Responsive, accessible, friendly UI with blue-600 primary
- Privacy badge on every tool

## Tech & Libraries

Add: `pdf-lib`, `pdfjs-dist`, `jszip`, `file-saver`, `@dnd-kit/core` + `@dnd-kit/sortable` (drag reorder), `diff` (text diff).

pdfjs worker: import worker via `?url` and set `GlobalWorkerOptions.workerSrc`. All PDF logic gated to client (lazy-loaded components / `useEffect`) since TanStack Start SSRs by default.

## Routes (file-based)

```
src/routes/
  __root.tsx        (update meta: PDFFree, add Navbar/Footer wrapper)
  index.tsx         (homepage: hero + searchable tool grid + footer)
  tools.$slug.tsx   (dynamic tool page — dispatches to tool component by slug)
```

Each tool has metadata (slug, name, category, icon, description, component) in `src/tools/registry.ts`. The dynamic route looks up the tool and renders it inside `<ToolLayout>`.

## Shared Components

- `src/components/Navbar.tsx` — "PDFFree" logo + "All tools" link
- `src/components/Footer.tsx` — privacy tagline
- `src/components/FileDropzone.tsx` — drag/drop + click, accepts filter, multi/single, file list with remove
- `src/components/ToolLayout.tsx` — title, description, privacy badge, dropzone slot, options slot, action button, progress, download button, toast errors
- `src/components/PagePreview.tsx` — pdfjs thumbnail renderer
- `src/components/SortableThumbGrid.tsx` — dnd-kit grid for reorder/select
- `src/hooks/usePdf.ts` — load pdf-lib doc, render thumbnails via pdfjs, parse page ranges, progress helper, save/download helpers
- `src/lib/pdfWorker.ts` — pdfjs worker init
- `src/lib/download.ts` — file-saver + jszip helpers

## Tools (one folder each under `src/tools/`)

Convert: `images-to-pdf`, `pdf-to-images`, `pdf-to-text`
Organize: `merge`, `split`, `delete-pages`, `extract-pages`, `reorder-pages`, `rotate`
Edit: `page-numbers`, `watermark`, `crop`
Forms: `fill-forms`
Compare: `compare`

Each exports `{ meta, Component }`. Priority build order per request: Homepage + ToolLayout → Merge → Split → Images→PDF → PDF→Images → then remaining tools.

## UX Details

- Privacy badge (lock icon) fixed in ToolLayout header
- Loading spinner + percent progress for per-page loops
- Success toast via sonner on download
- Warning toast if file > 100MB
- Empty states with icon + hint
- Hover lift + shadow on tool cards
- Keyboard focus rings, ARIA labels on dropzone/buttons
- Mobile: single-column grid, sticky action button

## SSR / TanStack Notes

- All tool components use `React.lazy` + `<ClientOnly>` wrapper (or dynamic import inside `useEffect`) so pdfjs/pdf-lib never run during SSR
- Update `__root.tsx` head: title "PDFFree — Every PDF tool, 100% free", matching description/og/twitter
- `tools.$slug.tsx` sets per-tool head() with tool name + description
- Homepage keeps root meta; add tool grid content

## Technical Details

- pdfjs worker: `import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`
- Page range parser: `"1-3,5,8-10"` → `number[]` with validation
- Merge: `PDFDocument.create()` + `copyPages` loop
- Split ranges: one output per range; "every page" mode → zip of N single-page PDFs
- Images→PDF: `embedJpg`/`embedPng`, page size = image / A4, orientation + margin options
- PDF→Images: pdfjs `page.render` to canvas → `toBlob(png|jpeg, quality)`, zip if >1
- PDF→Text: pdfjs `getTextContent()` joined per page
- Delete/Extract/Reorder: build new doc via `copyPages` with chosen indices/order
- Rotate: `page.setRotation(degrees(n))` on selected pages
- Page numbers: draw text with `StandardFonts.Helvetica` at position offsets
- Watermark text: `drawText` with opacity/rotate/color across all pages; image variant uses `embedPng/Jpg` + `drawImage`
- Crop: `page.setCropBox(x,y,w,h)` from margins
- Fill forms: `getForm().getFields()` → render inputs matching field type (text/checkbox/dropdown/radio) → `field.setText` etc. → save
- Compare: pdfjs text per doc, `diffLines` from `diff`, side-by-side with add/remove highlights

## Out of Scope

- No auth, backend, DB, uploads, analytics, ads
- No OCR (would need heavy WASM); note as future enhancement if asked
