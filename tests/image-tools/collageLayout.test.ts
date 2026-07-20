// Tests for the meme-generator collage layout math.
import { describe, it, expect } from "bun:test";
import fc from "fast-check";
import {
  collagePanelCount,
  collagePanelRects,
  coverSourceRect,
  type CollageLayout,
} from "../../src/lib/imageMath";

const LAYOUTS: CollageLayout[] = ["single", "v2", "h2", "v3", "g2x2"];
const dim = () => fc.integer({ min: 200, max: 4000 });

describe("collagePanelCount", () => {
  it("matches expected panel counts", () => {
    expect(collagePanelCount("single")).toBe(1);
    expect(collagePanelCount("v2")).toBe(2);
    expect(collagePanelCount("h2")).toBe(2);
    expect(collagePanelCount("v3")).toBe(3);
    expect(collagePanelCount("g2x2")).toBe(4);
  });
});

describe("collagePanelRects", () => {
  it("returns the right number of rects per layout", () => {
    for (const l of LAYOUTS) {
      expect(collagePanelRects(1200, 1200, l, 8).length).toBe(collagePanelCount(l));
    }
  });

  it("rects stay strictly inside the canvas", () => {
    fc.assert(
      fc.property(
        dim(),
        dim(),
        fc.constantFrom(...LAYOUTS),
        fc.integer({ min: 0, max: 40 }),
        (w, h, l, g) => {
          const rects = collagePanelRects(w, h, l, g);
          return rects.every(
            (r) => r.x >= 0 && r.y >= 0 && r.w >= 1 && r.h >= 1 && r.x + r.w <= w && r.y + r.h <= h,
          );
        },
      ),
      { numRuns: 500 },
    );
  });

  it("rects do not overlap (neighbors respect gap)", () => {
    fc.assert(
      fc.property(
        dim(),
        dim(),
        fc.constantFrom(...LAYOUTS),
        fc.integer({ min: 0, max: 40 }),
        (w, h, l, g) => {
          const rects = collagePanelRects(w, h, l, g);
          for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i];
              const b = rects[j];
              const overlapX = a.x < b.x + b.w && b.x < a.x + a.w;
              const overlapY = a.y < b.y + b.h && b.y < a.y + a.h;
              if (overlapX && overlapY) return false;
            }
          }
          return true;
        },
      ),
      { numRuns: 300 },
    );
  });

  it("single layout fills the whole canvas", () => {
    const r = collagePanelRects(800, 600, "single", 12)[0];
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.w).toBe(800);
    expect(r.h).toBe(600);
  });

  it("v2 stacks two equal-height panels", () => {
    const rs = collagePanelRects(1200, 1200, "v2", 8);
    expect(rs[0].w).toBe(1200);
    expect(rs[1].w).toBe(1200);
    expect(rs[0].h).toBe(rs[1].h);
    expect(rs[1].y - (rs[0].y + rs[0].h)).toBeGreaterThanOrEqual(8);
  });

  it("h2 puts two equal-width panels side by side", () => {
    const rs = collagePanelRects(1200, 800, "h2", 10);
    expect(rs[0].h).toBe(800);
    expect(rs[1].h).toBe(800);
    expect(rs[0].w).toBe(rs[1].w);
    expect(rs[1].x - (rs[0].x + rs[0].w)).toBeGreaterThanOrEqual(10);
  });

  it("2x2 makes four equal panels", () => {
    const rs = collagePanelRects(1200, 1200, "g2x2", 12);
    const w0 = rs[0].w;
    const h0 = rs[0].h;
    expect(rs.every((r) => r.w === w0 && r.h === h0)).toBe(true);
  });
});

describe("coverSourceRect", () => {
  it("wide bitmap into square dst crops sides", () => {
    const r = coverSourceRect(2000, 1000, 500, 500);
    expect(r.sw).toBeCloseTo(1000, 5);
    expect(r.sh).toBeCloseTo(1000, 5);
    expect(r.sx).toBeCloseTo(500, 5); // centered
    expect(r.sy).toBeCloseTo(0, 5);
  });

  it("tall bitmap into square dst crops top/bottom", () => {
    const r = coverSourceRect(1000, 2000, 500, 500);
    expect(r.sw).toBeCloseTo(1000, 5);
    expect(r.sh).toBeCloseTo(1000, 5);
    expect(r.sx).toBeCloseTo(0, 5);
    expect(r.sy).toBeCloseTo(500, 5);
  });

  it("output aspect ratio equals target aspect ratio", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        (bw, bh, dw, dh) => {
          const r = coverSourceRect(bw, bh, dw, dh);
          const src = r.sw / r.sh;
          const dst = dw / dh;
          return Math.abs(src - dst) / dst < 1e-6;
        },
      ),
      { numRuns: 500 },
    );
  });

  it("source rect stays within the bitmap", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.integer({ min: 10, max: 5000 }),
        (bw, bh, dw, dh) => {
          const r = coverSourceRect(bw, bh, dw, dh);
          return r.sx >= 0 && r.sy >= 0 && r.sx + r.sw <= bw + 1e-6 && r.sy + r.sh <= bh + 1e-6;
        },
      ),
      { numRuns: 500 },
    );
  });

  it("returns a safe fallback on zero dims", () => {
    const r = coverSourceRect(0, 0, 100, 100);
    expect(r.sw).toBeGreaterThanOrEqual(1);
    expect(r.sh).toBeGreaterThanOrEqual(1);
  });
});
