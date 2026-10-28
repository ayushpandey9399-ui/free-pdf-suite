import { describe, expect, test } from "bun:test";
import { pdfToolLimits, imageToolLimits } from "../../src/lib/toolLimits";

describe("tool limits note", () => {
  test("PDF input tools tell users to unlock protected PDFs first", () => {
    expect(pdfToolLimits("merge").some((p) => p.includes("Unlock PDF"))).toBe(true);
  });
  test("Unlock PDF and image-input PDF tools do not show the password point", () => {
    expect(pdfToolLimits("unlock-pdf").some((p) => p.includes("Unlock PDF"))).toBe(false);
    expect(pdfToolLimits("images-to-pdf").some((p) => p.includes("Unlock PDF"))).toBe(false);
  });
  test("PDF to Word shows no limits note", () => {
    expect(pdfToolLimits("pdf-to-word")).toEqual([]);
  });
  test("100 million pixel limit only where the tool enforces it", () => {
    expect(imageToolLimits("image-resize").some((p) => p.includes("100 million"))).toBe(true);
    expect(imageToolLimits("heic-to-jpg").some((p) => p.includes("100 million"))).toBe(false);
    expect(imageToolLimits("compress-image").some((p) => p.includes("100 million"))).toBe(false);
  });
});
