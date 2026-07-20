import { describe, it, expect } from "bun:test";
import {
  outExtension,
  mimeFromExt,
  formatBytes,
  computeSavedPct,
  shouldKeepOriginal,
  clampTargetKb,
  stripKnownExt,
} from "../../src/lib/imageMath";

describe("outExtension", () => {
  it("picks png/webp/jpg by suffix", () => {
    expect(outExtension("a.PNG")).toBe("png");
    expect(outExtension("a.webp")).toBe("webp");
    expect(outExtension("a.jpg")).toBe("jpg");
    expect(outExtension("a.jpeg")).toBe("jpg");
    expect(outExtension("no-extension")).toBe("jpg");
  });
});

describe("mimeFromExt", () => {
  it("maps to canonical mime types", () => {
    expect(mimeFromExt("png")).toBe("image/png");
    expect(mimeFromExt("webp")).toBe("image/webp");
    expect(mimeFromExt("jpg")).toBe("image/jpeg");
  });
});

describe("formatBytes", () => {
  it("formats bytes/KB/MB", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.00 MB");
  });
  it("returns 0 B for garbage", () => {
    expect(formatBytes(NaN)).toBe("0 B");
    expect(formatBytes(-1)).toBe("0 B");
  });
});

describe("computeSavedPct", () => {
  it("computes saving as an integer percent", () => {
    expect(computeSavedPct(1000, 250)).toBe(75);
    expect(computeSavedPct(1000, 1000)).toBe(0);
    expect(computeSavedPct(1000, 1200)).toBe(-20); // inflation
  });
  it("returns 0 for empty input", () => {
    expect(computeSavedPct(0, 0)).toBe(0);
    expect(computeSavedPct(-5, 100)).toBe(0);
  });
});

describe("shouldKeepOriginal", () => {
  it("keeps original when output is not smaller", () => {
    expect(shouldKeepOriginal(1000, 1000)).toBe(true);
    expect(shouldKeepOriginal(1000, 1200)).toBe(true);
    expect(shouldKeepOriginal(1000, 999)).toBe(false);
  });
});

describe("clampTargetKb", () => {
  it("enforces minimum 5 KB", () => {
    expect(clampTargetKb(0)).toBe(5);
    expect(clampTargetKb(-100)).toBe(5);
    expect(clampTargetKb(4.9)).toBe(5);
    expect(clampTargetKb(200)).toBe(200);
    expect(clampTargetKb(200.9)).toBe(200);
  });
  it("handles NaN", () => {
    expect(clampTargetKb(NaN)).toBe(5);
  });
});

describe("stripKnownExt", () => {
  it("strips raster extensions only", () => {
    expect(stripKnownExt("photo.jpg")).toBe("photo");
    expect(stripKnownExt("photo.JPEG")).toBe("photo");
    expect(stripKnownExt("photo.png")).toBe("photo");
    expect(stripKnownExt("photo.webp")).toBe("photo");
    expect(stripKnownExt("archive.tar.gz")).toBe("archive.tar.gz");
  });
});

// -------- Metamorphic / fuzz on math helpers --------
describe("fuzz: math helpers never throw", () => {
  it("survives 300 random size pairs", () => {
    const rand = () =>
      [0, 1, -1, 100, 1e9, Number.MAX_SAFE_INTEGER, NaN, Infinity][
        Math.floor(Math.random() * 8)
      ];
    let crashes = 0;
    for (let i = 0; i < 300; i++) {
      try {
        computeSavedPct(rand(), rand());
        shouldKeepOriginal(rand(), rand());
        formatBytes(rand());
        clampTargetKb(rand());
      } catch {
        crashes++;
      }
    }
    expect(crashes).toBe(0);
  });

  it("round-trips: outExtension of stripKnownExt+suffix is stable", () => {
    for (const ext of ["jpg", "jpeg", "png", "webp"] as const) {
      const name = `my.photo.${ext}`;
      const base = stripKnownExt(name);
      const rebuilt = `${base}.${ext}`;
      expect(outExtension(rebuilt)).toBe(ext === "jpeg" ? "jpg" : (ext as never));
    }
  });
});
