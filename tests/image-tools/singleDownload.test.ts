import { test, expect } from "bun:test";
import JSZip from "jszip";
import { singleZipEntry } from "../../src/lib/imageSafety";

test("one converted image downloads directly, not as ZIP", async () => {
  const zip = new JSZip();
  zip.file("photo.png", new Uint8Array([1, 2, 3]));
  const r = await singleZipEntry(zip as never);
  expect(r?.name).toBe("photo.png");
  expect(r?.blob.type).toBe("image/png");
  expect(r?.blob.size).toBe(3);
});

test("two or more images still go into a ZIP", async () => {
  const zip = new JSZip();
  zip.file("a.jpg", new Uint8Array([1]));
  zip.file("b.jpg", new Uint8Array([2]));
  expect(await singleZipEntry(zip as never)).toBeNull();
});
