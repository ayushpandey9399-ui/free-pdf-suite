import { describe, expect, it } from "vitest";
import * as pdfLib from "pdf-lib";
import { addFlatOutline, bookmarkTitleFor } from "../../src/lib/pdfOutline";

const { PDFDocument, PDFName } = pdfLib;

async function readTitles(bytes: Uint8Array) {
  const doc = await PDFDocument.load(bytes);
  const outlines = doc.catalog.lookup(PDFName.of("Outlines")) as pdfLib.PDFDict | undefined;
  const titles: string[] = [];
  const targets: number[] = [];
  const pageRefs = doc.getPages().map((p) => p.ref.toString());
  let item = outlines?.lookup(PDFName.of("First")) as pdfLib.PDFDict | undefined;
  while (item) {
    titles.push((item.lookup(PDFName.of("Title")) as pdfLib.PDFHexString).decodeText());
    const dest = item.lookup(PDFName.of("Dest")) as pdfLib.PDFArray;
    targets.push(pageRefs.indexOf(dest.get(0).toString()));
    item = item.lookup(PDFName.of("Next")) as pdfLib.PDFDict | undefined;
  }
  return { titles, targets };
}

describe("Merge PDF bookmarks", () => {
  it("adds one bookmark per merged file pointing at that file's first page", async () => {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 6; i++) doc.addPage([200, 200]);
    const added = addFlatOutline(
      doc,
      [
        { title: bookmarkTitleFor("invoice-march.pdf"), pageIndex: 0 },
        { title: bookmarkTitleFor("invoice-april.PDF"), pageIndex: 2 },
        { title: bookmarkTitleFor("receipts.pdf"), pageIndex: 5 },
      ],
      pdfLib,
    );
    expect(added).toBe(3);
    const { titles, targets } = await readTitles(await doc.save());
    expect(titles).toEqual(["invoice-march", "invoice-april", "receipts"]);
    expect(targets).toEqual([0, 2, 5]);
  });

  it("writes no outline when there are no valid pages", async () => {
    const doc = await PDFDocument.create();
    doc.addPage([200, 200]);
    expect(addFlatOutline(doc, [{ title: "x", pageIndex: 4 }], pdfLib)).toBe(0);
    expect(doc.catalog.get(PDFName.of("Outlines"))).toBeUndefined();
  });
});
