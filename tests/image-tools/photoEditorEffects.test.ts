// Unit + property tests for the new Photo Editor effect formulas in imageMath.

import { describe, it, expect } from "bun:test";
import fc from "fast-check";
import {
  pxSharpen,
  vignetteFactor,
  pxGrain,
  grainNoise,
  duotoneMap,
  radialDistance,
} from "../../src/lib/imageMath";

const RUNS = { numRuns: 1000 };
const byte = () => fc.integer({ min: 0, max: 255 });

describe("pxSharpen", () => {
  it("amount=0 is identity for any pixel/blurred pair", () => {
    fc.assert(
      fc.property(byte(), byte(), (c, b) => pxSharpen(c, b, 0) === c),
      RUNS,
    );
  });
  it("stays in [0,255] for any amount up to 200", () => {
    fc.assert(
      fc.property(byte(), byte(), fc.integer({ min: 0, max: 200 }), (c, b, a) => {
        const v = pxSharpen(c, b, a);
        return v >= 0 && v <= 255;
      }),
      RUNS,
    );
  });
  it("when blurred equals c, sharpen is a no-op", () => {
    for (let c = 0; c <= 255; c += 17) {
      expect(pxSharpen(c, c, 100)).toBe(c);
    }
  });
});

describe("vignetteFactor", () => {
  it("strength=0 returns 1 for any distance", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1.5, noNaN: true }), (d) => vignetteFactor(d, 0) === 1),
      RUNS,
    );
  });
  it("center is never darkened, corner is darkest, monotonic non-increasing", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (s) => {
        const center = vignetteFactor(0, s);
        const corner = vignetteFactor(1, s);
        return center === 1 && corner <= center && corner >= 0;
      }),
      RUNS,
    );
  });
  it("factor is always in [0,1]", () => {
    fc.assert(
      fc.property(
        fc.double({ min: -0.5, max: 1.5, noNaN: true }),
        fc.integer({ min: 0, max: 100 }),
        (d, s) => {
          const v = vignetteFactor(d, s);
          return v >= 0 && v <= 1;
        },
      ),
      RUNS,
    );
  });
});

describe("pxGrain", () => {
  it("strength=0 is identity for any noise", () => {
    fc.assert(
      fc.property(byte(), fc.double({ min: -1, max: 1, noNaN: true }), (c, n) => pxGrain(c, n, 0) === c),
      RUNS,
    );
  });
  it("output always in [0,255]", () => {
    fc.assert(
      fc.property(
        byte(),
        fc.double({ min: -2, max: 2, noNaN: true }),
        fc.integer({ min: 0, max: 100 }),
        (c, n, s) => {
          const v = pxGrain(c, n, s);
          return v >= 0 && v <= 255;
        },
      ),
      RUNS,
    );
  });
  it("noise=0 is identity", () => {
    fc.assert(
      fc.property(byte(), fc.integer({ min: 0, max: 100 }), (c, s) => pxGrain(c, 0, s) === c),
      RUNS,
    );
  });
});

describe("grainNoise", () => {
  it("stays in [-1,1] and is deterministic for a given (i, seed)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1e6 }), fc.integer({ min: 0, max: 1e6 }), (i, s) => {
        const a = grainNoise(i, s);
        const b = grainNoise(i, s);
        return a === b && a >= -1 && a <= 1;
      }),
      RUNS,
    );
  });
});

describe("duotoneMap", () => {
  const NAVY: [number, number, number] = [12, 26, 64];
  const CREAM: [number, number, number] = [255, 240, 210];

  it("amount=0 is identity per channel", () => {
    fc.assert(
      fc.property(byte(), byte(), byte(), (r, g, b) => {
        const [a, c, d] = duotoneMap(r, g, b, NAVY, CREAM, 0);
        return a === r && c === g && d === b;
      }),
      RUNS,
    );
  });
  it("output always in [0,255]", () => {
    fc.assert(
      fc.property(
        byte(), byte(), byte(), fc.integer({ min: 0, max: 100 }),
        (r, g, b, amt) => {
          const [a, c, d] = duotoneMap(r, g, b, NAVY, CREAM, amt);
          return [a, c, d].every((v) => v >= 0 && v <= 255);
        },
      ),
      RUNS,
    );
  });
  it("amount=100 on pure black maps toward shadow color", () => {
    const [r, g, b] = duotoneMap(0, 0, 0, NAVY, CREAM, 100);
    expect(r).toBe(NAVY[0]);
    expect(g).toBe(NAVY[1]);
    expect(b).toBe(NAVY[2]);
  });
  it("amount=100 on pure white maps toward highlight color", () => {
    const [r, g, b] = duotoneMap(255, 255, 255, NAVY, CREAM, 100);
    expect(r).toBe(CREAM[0]);
    expect(g).toBe(CREAM[1]);
    expect(b).toBe(CREAM[2]);
  });
});

describe("radialDistance", () => {
  it("center of an image is 0", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 4000 }), fc.integer({ min: 2, max: 4000 }), (w, h) => {
        return radialDistance(w / 2, h / 2, w, h) === 0;
      }),
      RUNS,
    );
  });
  it("corners are 1 (within float epsilon)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 4000 }), fc.integer({ min: 2, max: 4000 }), (w, h) => {
        const d = radialDistance(0, 0, w, h);
        return Math.abs(d - 1) < 1e-9;
      }),
      RUNS,
    );
  });
  it("all pixels stay in [0,1]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 800 }),
        fc.integer({ min: 2, max: 800 }),
        fc.integer({ min: 0, max: 800 }),
        fc.integer({ min: 0, max: 800 }),
        (w, h, x, y) => {
          const xi = Math.min(x, w - 1);
          const yi = Math.min(y, h - 1);
          const d = radialDistance(xi, yi, w, h);
          return d >= 0 && d <= 1 + 1e-9;
        },
      ),
      RUNS,
    );
  });
});
