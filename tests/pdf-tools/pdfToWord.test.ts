import { describe, it, expect } from "bun:test";
import {
  hasPdfMagic,
  validatePdfSelection,
  messageForStatus,
  shouldOfferUnlockLink,
  docxNameFor,
  PDF_TO_WORD_MAX_BYTES,
} from "../../src/lib/pdfToWord";

const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const NOT_PDF = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);

describe("hasPdfMagic", () => {
  it("accepts the %PDF- signature", () => {
    expect(hasPdfMagic(PDF_HEADER)).toBe(true);
  });
  it("rejects other signatures", () => {
    expect(hasPdfMagic(NOT_PDF)).toBe(false);
  });
  it("rejects a short header", () => {
    expect(hasPdfMagic(new Uint8Array([0x25, 0x50]))).toBe(false);
  });
  it("rejects an empty header", () => {
    expect(hasPdfMagic(new Uint8Array())).toBe(false);
  });
});

describe("validatePdfSelection", () => {
  it("accepts a normal PDF", () => {
    const r = validatePdfSelection({ name: "report.pdf", size: 1024, header: PDF_HEADER });
    expect(r.ok).toBe(true);
  });

  it("accepts an uppercase extension", () => {
    expect(validatePdfSelection({ name: "REPORT.PDF", size: 10, header: PDF_HEADER }).ok).toBe(true);
  });

  it("rejects an empty file", () => {
    const r = validatePdfSelection({ name: "a.pdf", size: 0, header: PDF_HEADER });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("empty");
  });

  it("rejects a non PDF extension", () => {
    const r = validatePdfSelection({ name: "a.docx", size: 100, header: PDF_HEADER });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("Please select a PDF file");
  });

  it("rejects wrong magic bytes", () => {
    const r = validatePdfSelection({ name: "a.pdf", size: 100, header: NOT_PDF });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("does not look like a real PDF");
  });

  it("rejects a file over the 25 MB limit", () => {
    const r = validatePdfSelection({
      name: "a.pdf",
      size: PDF_TO_WORD_MAX_BYTES + 1,
      header: PDF_HEADER,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("25 MB");
  });

  it("accepts a file exactly on the limit", () => {
    const r = validatePdfSelection({
      name: "a.pdf",
      size: PDF_TO_WORD_MAX_BYTES,
      header: PDF_HEADER,
    });
    expect(r.ok).toBe(true);
  });
});

describe("messageForStatus", () => {
  it("maps 413", () => {
    expect(messageForStatus(413)).toBe("This file is larger than 25 MB.");
  });
  it("maps 422", () => {
    expect(messageForStatus(422)).toBe(
      "We could not convert this PDF. It may be scanned, protected or damaged.",
    );
  });
  it("maps 429", () => {
    expect(messageForStatus(429)).toBe("Too many requests. Please wait a minute and try again.");
  });
  it("maps 503", () => {
    expect(messageForStatus(503)).toBe(
      "Our server is busy right now. Please try again in a minute.",
    );
  });
  it("falls back for every other failure", () => {
    for (const s of [400, 418, 500, 502, 504, "network"] as const) {
      expect(messageForStatus(s)).toBe("Something went wrong. Please try again.");
    }
  });
  it("never exposes raw JSON", () => {
    for (const s of [400, 413, 422, 429, 500, 503, 504, 418] as const) {
      expect(messageForStatus(s)).not.toContain("{");
    }
  });
});

describe("shouldOfferUnlockLink", () => {
  it("is true only for 422", () => {
    expect(shouldOfferUnlockLink(422)).toBe(true);
    expect(shouldOfferUnlockLink(413)).toBe(false);
    expect(shouldOfferUnlockLink("network")).toBe(false);
  });
});

describe("docxNameFor", () => {
  it("swaps the pdf extension", () => {
    expect(docxNameFor("report.pdf")).toBe("report.docx");
    expect(docxNameFor("REPORT.PDF")).toBe("REPORT.docx");
  });
  it("appends when there is no extension", () => {
    expect(docxNameFor("report")).toBe("report.docx");
  });
  it("falls back for an empty base name", () => {
    expect(docxNameFor(".pdf")).toBe("document.docx");
  });
});
