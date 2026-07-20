import { describe, it, expect } from "bun:test";
import {
  MAX_IMAGE_PIXELS,
  guardDecodedSize,
  isSvgFile,
  safeZipName,
  uniqueZipName,
} from "../../src/lib/imageSafety";

// Minimal File shim so this suite runs headlessly under bun test.
// We only use .name and .type, which the helpers rely on.
function mkFile(name: string, type = ""): File {
  return { name, type } as unknown as File;
}

describe("guardDecodedSize", () => {
  it("throws on empty dimensions", () => {
    expect(() => guardDecodedSize(0, 100)).toThrow();
    expect(() => guardDecodedSize(100, 0)).toThrow();
  });
  it("accepts a normal image", () => {
    expect(() => guardDecodedSize(4000, 3000)).not.toThrow();
  });
  it("accepts exactly the cap", () => {
    expect(() => guardDecodedSize(10000, 10000)).not.toThrow();
  });
  it("rejects one pixel over the cap", () => {
    expect(() => guardDecodedSize(10001, 10000)).toThrow(/too large/);
  });
  it("blocks a decompression bomb declaration", () => {
    expect(() => guardDecodedSize(100000, 100000)).toThrow();
  });
  it("cap is 100 MP", () => {
    expect(MAX_IMAGE_PIXELS).toBe(100_000_000);
  });
});

describe("isSvgFile", () => {
  const cases: Array<[string, string, boolean]> = [
    ["logo.svg", "", true],
    ["logo.SVG", "", true],
    ["archive.svgz", "", true],
    ["anything", "image/svg+xml", true],
    ["anything", "image/svg", true],
    ["photo.jpg", "image/jpeg", false],
    ["photo.png", "image/png", false],
    ["photo.webp", "image/webp", false],
    ["photo.heic", "image/heic", false],
    ["../evil.svg\x00.jpg", "", true], // extension-based catch
  ];
  it.each(cases)("classifies %s (type=%s) -> %s", (name, type, expected) => {
    expect(isSvgFile(mkFile(name, type))).toBe(expected);
  });
});

describe("safeZipName", () => {
  it("strips path traversal", () => {
    expect(safeZipName("../../etc/passwd")).toBe("passwd");
    expect(safeZipName("..\\..\\windows\\system32\\cmd.exe")).toBe("cmd.exe");
    expect(safeZipName("/absolute/path/photo.jpg")).toBe("photo.jpg");
  });
  it("strips control characters", () => {
    expect(safeZipName("photo\x00\x07\x1f.jpg")).toBe("photo.jpg");
  });
  it("falls back to 'file' on empty", () => {
    expect(safeZipName("")).toBe("file");
    expect(safeZipName("/")).toBe("file");
  });
  it("truncates absurdly long names", () => {
    const n = safeZipName("x".repeat(5000) + ".jpg");
    expect(n.length).toBeLessThanOrEqual(200);
  });
});

describe("uniqueZipName", () => {
  it("returns the safe name on first use", () => {
    const used = new Set<string>();
    expect(uniqueZipName(used, "photo.jpg")).toBe("photo.jpg");
    expect(used.has("photo.jpg")).toBe(true);
  });
  it("appends -1, -2 for collisions", () => {
    const used = new Set<string>();
    expect(uniqueZipName(used, "photo.jpg")).toBe("photo.jpg");
    expect(uniqueZipName(used, "photo.jpg")).toBe("photo-1.jpg");
    expect(uniqueZipName(used, "photo.jpg")).toBe("photo-2.jpg");
  });
  it("handles names with no extension", () => {
    const used = new Set<string>();
    expect(uniqueZipName(used, "README")).toBe("README");
    expect(uniqueZipName(used, "README")).toBe("README-1");
  });
  it("sanitizes before dedupe", () => {
    const used = new Set<string>();
    expect(uniqueZipName(used, "../a.jpg")).toBe("a.jpg");
    expect(uniqueZipName(used, "sub/dir/a.jpg")).toBe("a-1.jpg");
  });
});

// -------- Fuzz --------
// 200+ mutated names; every call must return a non-empty, path-free, <=200
// char string, and repeated adds must always be unique within the set.
describe("fuzz: safeZipName + uniqueZipName never crash and always dedupe", () => {
  const rand = (n: number) => Math.floor(Math.random() * n);
  const noise = () => {
    const chars = "abc.DEF_/\\\x00\x1f 中🔥.jpg.png";
    let s = "";
    const len = rand(300);
    for (let i = 0; i < len; i++) s += chars[rand(chars.length)];
    return s;
  };

  it("survives 250 random inputs", () => {
    const used = new Set<string>();
    let crashes = 0;
    for (let i = 0; i < 250; i++) {
      try {
        const out = uniqueZipName(used, noise());
        expect(out.length).toBeGreaterThan(0);
        expect(out.length).toBeLessThanOrEqual(200);
        expect(out.includes("/")).toBe(false);
        expect(out.includes("\\")).toBe(false);
        expect(/[\x00-\x1f]/.test(out)).toBe(false);
      } catch {
        crashes++;
      }
    }
    expect(crashes).toBe(0);
    // Every returned name is unique inside the set.
    expect(used.size).toBe(250);
  });
});
