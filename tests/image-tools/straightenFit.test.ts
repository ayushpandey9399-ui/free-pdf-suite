// Tests for the straighten auto-zoom math (largest inscribed same-aspect rect).

import { describe, it, expect } from "bun:test";
import fc from "fast-check";
import { insideRectScale, straightenCropDims } from "../../src/lib/imageMath";

const deg2rad = (d: number) => (d * Math.PI) / 180;

describe("insideRectScale", () => {
  it("angle 0 is identity", () => {
    expect(insideRectScale(1000, 700, 0)).toBe(1);
    expect(insideRectScale(1, 1, 0)).toBe(1);
  });

  it("bogus inputs return 1", () => {
    expect(insideRectScale(0, 100, 0.1)).toBe(1);
    expect(insideRectScale(100, 0, 0.1)).toBe(1);
    expect(insideRectScale(100, 100, NaN)).toBe(1);
  });

  it("stays in (0, 1] for the whole -15..+15 straighten range", () => {
    for (const deg of [-15, -10, -7.5, -1, -0.5, 0.5, 1, 7.5, 10, 15]) {
      const s = insideRectScale(1600, 900, deg2rad(deg));
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });

  it("inscribed rect (s*W, s*H) actually fits inside rotated (W, H)", () => {
    // At angles -15, -7.5, 0.5, 15 on a variety of shapes, both projection
    // constraints must hold (with tiny epsilon for float slack).
    const shapes: Array<[number, number]> = [
      [4000, 3000], [1920, 1080], [800, 800], [100, 500], [1000, 100],
    ];
    for (const [W, H] of shapes) {
      for (const deg of [-15, -7.5, 0.5, 15]) {
        const a = Math.abs(deg2rad(deg));
        const s = insideRectScale(W, H, a);
        const w = s * W;
        const h = s * H;
        const c = Math.abs(Math.cos(a));
        const si = Math.abs(Math.sin(a));
        // The two inscription inequalities:
        expect(w * c + h * si).toBeLessThanOrEqual(W + 1e-6);
        expect(w * si + h * c).toBeLessThanOrEqual(H + 1e-6);
      }
    }
  });

  it("property: for any WxH and any angle in -15..15 the inscription inequalities hold", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 4000 }),
        fc.integer({ min: 10, max: 4000 }),
        fc.double({ min: -15, max: 15, noNaN: true }),
        (W, H, deg) => {
          const a = Math.abs(deg2rad(deg));
          const s = insideRectScale(W, H, a);
          const w = s * W;
          const h = s * H;
          const c = Math.abs(Math.cos(a));
          const si = Math.abs(Math.sin(a));
          const slack = 1e-6 * Math.max(W, H);
          return (
            s > 0 &&
            s <= 1 + 1e-9 &&
            w * c + h * si <= W + slack &&
            w * si + h * c <= H + slack
          );
        },
      ),
      { numRuns: 500 },
    );
  });

  it("scale is symmetric in sign of angle", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50, max: 3000 }),
        fc.integer({ min: 50, max: 3000 }),
        fc.double({ min: 0.1, max: 15, noNaN: true }),
        (W, H, deg) => {
          const a = insideRectScale(W, H, deg2rad(deg));
          const b = insideRectScale(W, H, deg2rad(-deg));
          return Math.abs(a - b) < 1e-12;
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe("straightenCropDims", () => {
  it("angle 0 returns exact original dims", () => {
    const r = straightenCropDims(1920, 1080, 0);
    expect(r.w).toBe(1920);
    expect(r.h).toBe(1080);
  });

  it("returns strictly smaller dims for any non-zero angle in range", () => {
    for (const deg of [-15, -7.5, -1, 0.5, 1, 7.5, 15]) {
      const r = straightenCropDims(1600, 900, deg);
      expect(r.w).toBeLessThan(1600);
      expect(r.h).toBeLessThan(900);
      expect(r.w).toBeGreaterThanOrEqual(1);
      expect(r.h).toBeGreaterThanOrEqual(1);
    }
  });

  it("preserves aspect ratio (within one integer round)", () => {
    const src = 1920 / 1080;
    for (const deg of [-15, -7.5, 0.5, 15]) {
      const r = straightenCropDims(1920, 1080, deg);
      const got = r.w / r.h;
      // rounding may shift by a whisker
      expect(Math.abs(got - src) / src).toBeLessThan(0.01);
    }
  });
});
