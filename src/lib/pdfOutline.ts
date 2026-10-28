import type { PDFDocument } from "pdf-lib";

/**
 * Architecture Notes
 * WHY this exists: pdf-lib has no public bookmark (outline) API, but Merge PDF
 * offers "Add bookmarks for each file". Without this helper that checkbox did
 * nothing, which is a broken promise to the user. Writing the outline dictionary
 * by hand keeps the feature real without pulling in a second PDF library.
 * The helper takes the pdf-lib module as a parameter so it works with the lazily
 * loaded copy the tools already use and adds nothing to the initial bundle.
 */
export type OutlineEntry = { title: string; pageIndex: number };

type PdfLibParts = Pick<typeof import("pdf-lib"), "PDFName" | "PDFHexString" | "PDFNumber">;

export function addFlatOutline(doc: PDFDocument, entries: OutlineEntry[], lib: PdfLibParts): number {
  const { PDFName, PDFHexString, PDFNumber } = lib;
  const pages = doc.getPages();
  const valid = entries.filter((e) => e.pageIndex >= 0 && e.pageIndex < pages.length);
  if (valid.length === 0) return 0;

  const ctx = doc.context;
  const outlinesRef = ctx.nextRef();
  const itemRefs = valid.map(() => ctx.nextRef());

  valid.forEach((entry, i) => {
    const item = ctx.obj({});
    item.set(PDFName.of("Title"), PDFHexString.fromText(entry.title));
    item.set(PDFName.of("Parent"), outlinesRef);
    item.set(PDFName.of("Dest"), ctx.obj([pages[entry.pageIndex].ref, PDFName.of("Fit")]));
    if (i > 0) item.set(PDFName.of("Prev"), itemRefs[i - 1]);
    if (i < valid.length - 1) item.set(PDFName.of("Next"), itemRefs[i + 1]);
    ctx.assign(itemRefs[i], item);
  });

  const outlines = ctx.obj({});
  outlines.set(PDFName.of("Type"), PDFName.of("Outlines"));
  outlines.set(PDFName.of("First"), itemRefs[0]);
  outlines.set(PDFName.of("Last"), itemRefs[itemRefs.length - 1]);
  outlines.set(PDFName.of("Count"), PDFNumber.of(valid.length));
  ctx.assign(outlinesRef, outlines);

  doc.catalog.set(PDFName.of("Outlines"), outlinesRef);
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
  return valid.length;
}

/** Bookmark title for a merged file: its name without the .pdf extension. */
export function bookmarkTitleFor(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").trim() || "Untitled";
}
