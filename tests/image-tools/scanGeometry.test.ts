import { describe, it, expect } from "bun:test";
import {
  orderQuadCorners,
  isConvexQuad,
  quadConfidence,
  computeHomography,
  type Quad,
  type Point,
} from "../../src/lib/scanGeometry";

// Apply a 3x3 homography (row-major, 9 numbers) to a point.
function applyH(H: number[], p: Point): Point {
  const x = H[0] * p.x + H[1] * p.y + H[2];
  const y = H[3] * p.x + H[4] * p.y + H[5];
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: x / w, y: y / w };
}

describe("orderQuadCorners", () => {
  it("returns tl,tr,br,bl regardless of input order", () => {
    const tl = { x: 10, y: 10 };
    const tr = { x: 200, y: 20 };
    const br = { x: 210, y: 180 };
    const bl = { x: 5, y: 190 };
    const shuffled = [br, tl, bl, tr];
    const out = orderQuadCorners(shuffled);
    expect(out[0]).toEqual(tl);
    expect(out[1]).toEqual(tr);
    expect(out[2]).toEqual(br);
    expect(out[3]).toEqual(bl);
  });
});

describe("computeHomography round-trip", () => {
  it("forward then inverse recovers original 4 corners within 0.5px", () => {
    const src: Quad = [
      { x: 30, y: 25 },
      { x: 410, y: 60 },
      { x: 445, y: 305 },
      { x: 15, y: 280 },
    ];
    const outW = 400;
    const outH = 300;
    const dst: Quad = [
      { x: 0, y: 0 },
      { x: outW, y: 0 },
      { x: outW, y: outH },
      { x: 0, y: outH },
    ];
    const H = computeHomography(src, dst);
    const Hinv = computeHomography(dst, src);
    for (let i = 0; i < 4; i++) {
      const projected = applyH(H, src[i]);
      const back = applyH(Hinv, projected);
      const err = Math.hypot(back.x - src[i].x, back.y - src[i].y);
      expect(err).toBeLessThan(0.5);
    }
  });
});

describe("quadConfidence on concave quads", () => {
  it("returns 0 for a self-intersecting/concave quad", () => {
    const w = 100, h = 100;
    const mag = new Float64Array(w * h); // uniformly zero magnitude is fine
    const concave: Quad = [
      { x: 10, y: 10 },
      { x: 90, y: 10 },
      { x: 20, y: 20 }, // inside — makes it concave
      { x: 10, y: 90 },
    ];
    expect(isConvexQuad(concave)).toBe(false);
    expect(quadConfidence(concave, mag, w, h)).toBe(0);
  });
});
