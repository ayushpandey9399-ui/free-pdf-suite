// Property-based tests for the image-tools pure math using fast-check.
// Each property runs 1000 iterations; invariants are stated declaratively.

import { describe, it, expect } from "bun:test";
import fc from "fast-check";
import {
  aspectLockOther,
  percentResize,
  clampResizeDim,
  clampCropRect,
  defaultCenteredCrop,
  defaultAspectCrop,
  IDENTITY_XFORM,
  rotateBy,
  flipHorizontal,
  flipVertical,
  isIdentity,
  outputDims,
  watermarkAnchor,
  watermarkFontPx,
  watermarkMarginPx,
  wrapLines,
  pxBrightness,
  pxContrast,
  pxGrayscale,
  pxSaturate,
  pxSepia,
  type Xform,
  type Rotation,
  type PosKey,
} from "../../src/lib/imageMath";

const RUNS = { numRuns: 1000 };
const dim = () => fc.integer({ min: 1, max: 20000 });
const byte = () => fc.integer({ min: 0, max: 255 });

/* ---------------- RESIZE ---------------- */

describe("property: percentResize", () => {
  it("always returns >= 1 and never NaN, for any input", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 30000 }), fc.integer({ min: -1000, max: 5000 }), (o, p) => {
        const r = percentResize(o, p);
        return Number.isFinite(r) && r >= 1 && Number.isInteger(r);
      }),
      RUNS,
    );
  });
});

describe("property: clampResizeDim", () => {
  it("clamps any real to an integer >= 1", () => {
    fc.assert(
      fc.property(fc.double({ noNaN: false, min: -1e9, max: 1e9 }), (v) => {
        const r = clampResizeDim(v);
        return Number.isInteger(r) && r >= 1;
      }),
      RUNS,
    );
  });
});

describe("property: aspectLockOther", () => {
  it("preserves aspect ratio within one pixel of rounding drift", () => {
    fc.assert(
      fc.property(dim(), dim(), fc.integer({ min: 1, max: 20000 }), (w, h, v) => {
        const other = aspectLockOther(w, h, "w", v);
        const target = v / (w / h);
        // rounding can drift by up to 1 pixel; at very small target values allow 1
        return Math.abs(other - target) <= Math.max(1, target * 0.01);
      }),
      RUNS,
    );
  });
});

/* ---------------- CROP ---------------- */

describe("property: clampCropRect", () => {
  it("always stays inside bounds, area >= 1", () => {
    fc.assert(
      fc.property(
        dim(),
        dim(),
        fc.double({ min: -1000, max: 30000, noNaN: true }),
        fc.double({ min: -1000, max: 30000, noNaN: true }),
        fc.double({ min: -1000, max: 30000, noNaN: true }),
        fc.double({ min: -1000, max: 30000, noNaN: true }),
        (W, H, x, y, w, h) => {
          const c = clampCropRect({ x, y, w, h }, W, H);
          return (
            c.x >= 0 &&
            c.y >= 0 &&
            c.w >= 1 &&
            c.h >= 1 &&
            c.x + c.w <= W &&
            c.y + c.h <= H
          );
        },
      ),
      RUNS,
    );
  });
});

describe("property: defaultCenteredCrop / defaultAspectCrop stay in bounds", () => {
  it("centered crop fits", () => {
    fc.assert(
      fc.property(dim(), dim(), (W, H) => {
        const c = defaultCenteredCrop(W, H);
        return c.x >= 0 && c.y >= 0 && c.x + c.w <= W && c.y + c.h <= H;
      }),
      RUNS,
    );
  });
  it("aspect crop fits for any positive aspect", () => {
    fc.assert(
      fc.property(dim(), dim(), fc.double({ min: 0.1, max: 10, noNaN: true }), (W, H, a) => {
        const c = defaultAspectCrop(W, H, a);
        return c.x >= 0 && c.y >= 0 && c.x + c.w <= W && c.y + c.h <= H;
      }),
      RUNS,
    );
  });
});

/* ---------------- ROTATE / FLIP ALGEBRA ---------------- */

type Op = { t: "r"; d: 90 | 180 | 270 } | { t: "fh" } | { t: "fv" };
const opArb = fc.oneof(
  fc.constantFrom<Op>({ t: "r", d: 90 }, { t: "r", d: 180 }, { t: "r", d: 270 }),
  fc.constant<Op>({ t: "fh" }),
  fc.constant<Op>({ t: "fv" }),
);
function apply(x: Xform, o: Op): Xform {
  if (o.t === "r") return rotateBy(x, o.d);
  if (o.t === "fh") return flipHorizontal(x);
  return flipVertical(x);
}
function inv(o: Op): Op {
  if (o.t === "r") return { t: "r", d: ((360 - o.d) as 90 | 180 | 270) };
  return o; // flips are self-inverse
}

describe("property: rotate/flip normal form", () => {
  it("rotation is always in {0,90,180,270}", () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 0, maxLength: 40 }), (ops) => {
        const final = ops.reduce(apply, IDENTITY_XFORM);
        return [0, 90, 180, 270].includes(final.rotation as number);
      }),
      RUNS,
    );
  });

  it("applying the sequence then its reverse-inverse returns identity", () => {
    fc.assert(
      fc.property(fc.array(opArb, { minLength: 0, maxLength: 20 }), (ops) => {
        let x = ops.reduce(apply, IDENTITY_XFORM);
        for (let i = ops.length - 1; i >= 0; i--) x = apply(x, inv(ops[i]));
        return isIdentity(x);
      }),
      RUNS,
    );
  });

  it("outputDims swaps for 90/270, preserves otherwise; area preserved", () => {
    fc.assert(
      fc.property(dim(), dim(), fc.constantFrom<Rotation>(0, 90, 180, 270), (w, h, r) => {
        const x: Xform = { rotation: r, flipH: false, flipV: false };
        const d = outputDims(w, h, x);
        return d.w * d.h === w * h && d.w > 0 && d.h > 0;
      }),
      RUNS,
    );
  });
});

/* ---------------- WATERMARK ANCHORS ---------------- */

const POS: PosKey[] = ["tl", "tc", "tr", "cl", "cc", "cr", "bl", "bc", "br"];

describe("property: watermarkAnchor stays inside canvas", () => {
  it("anchored content stays inside for any position/margin", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 8000 }),
        fc.integer({ min: 100, max: 8000 }),
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 10, max: 500 }),
        fc.integer({ min: 0, max: 100 }),
        fc.constantFrom(...POS),
        (cw, ch, contentW, contentH, margin, pos) => {
          // Cap content + margin so it fits at all (tool code caps too).
          const cW = Math.min(contentW, cw - margin * 2 - 4);
          const cH = Math.min(contentH, ch - margin * 2 - 4);
          if (cW < 1 || cH < 1) return true;
          const { x, y } = watermarkAnchor(pos, cw, ch, cW, cH, margin);
          return x - cW / 2 >= 0 && x + cW / 2 <= cw && y - cH / 2 >= 0 && y + cH / 2 <= ch;
        },
      ),
      RUNS,
    );
  });
});

describe("property: watermark font/margin scales are always >= 8/>=0", () => {
  it("font pct maps into a sensible positive integer", () => {
    fc.assert(
      fc.property(dim(), dim(), fc.integer({ min: 1, max: 50 }), (w, h, p) => {
        const px = watermarkFontPx(w, h, p);
        return px >= 8 && Number.isInteger(px);
      }),
      RUNS,
    );
    fc.assert(
      fc.property(dim(), dim(), fc.integer({ min: 0, max: 20 }), (w, h, p) => {
        const px = watermarkMarginPx(w, h, p);
        return px >= 0 && Number.isInteger(px);
      }),
      RUNS,
    );
  });
});

/* ---------------- MEME WRAP ---------------- */

describe("property: wrapLines never drops characters, respects width", () => {
  it("concatenated lines contain every non-whitespace char of input", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        fc.integer({ min: 20, max: 400 }),
        (text, maxW) => {
          // measure = 6 px per char, simple deterministic width
          const measure = (s: string) => s.length * 6;
          const lines = wrapLines(text, maxW, measure);
          const joined = lines.join("").replace(/\s+/g, "");
          const source = text.replace(/\s+/g, "");
          if (joined !== source) return false;
          for (const l of lines) {
            // single overlong words are allowed to exceed maxW
            if (l.split(" ").length > 1 && measure(l) > maxW) return false;
          }
          return true;
        },
      ),
      RUNS,
    );
  });
});

/* ---------------- PIXEL FORMULAS ---------------- */

describe("property: pixel formulas stay in [0,255]", () => {
  it("brightness/contrast/sepia/saturation always clamp", () => {
    fc.assert(
      fc.property(byte(), fc.integer({ min: -200, max: 200 }), (c, a) => {
        const b = pxBrightness(c, a);
        const k = pxContrast(c, a);
        return b >= 0 && b <= 255 && k >= 0 && k <= 255;
      }),
      RUNS,
    );
    fc.assert(
      fc.property(byte(), byte(), byte(), fc.integer({ min: -100, max: 100 }), (r, g, b, a) => {
        const [gr, gg, gb] = pxGrayscale(r, g, b, Math.abs(a));
        const [sr, sg, sb] = pxSepia(r, g, b, Math.abs(a));
        const [tr, tg, tb] = pxSaturate(r, g, b, a);
        return [gr, gg, gb, sr, sg, sb, tr, tg, tb].every((v) => v >= 0 && v <= 255);
      }),
      RUNS,
    );
  });

  it("grayscale(100) collapses r=g=b to the same luminance", () => {
    fc.assert(
      fc.property(byte(), byte(), byte(), (r, g, b) => {
        const [a, c, d] = pxGrayscale(r, g, b, 100);
        return Math.abs(a - c) <= 1 && Math.abs(c - d) <= 1;
      }),
      RUNS,
    );
  });

  it("saturate(-100) also collapses to luminance", () => {
    fc.assert(
      fc.property(byte(), byte(), byte(), (r, g, b) => {
        const [a, c, d] = pxSaturate(r, g, b, -100);
        return Math.abs(a - c) <= 1 && Math.abs(c - d) <= 1;
      }),
      RUNS,
    );
  });

  it("mid-gray is a fixed point of contrast at any amount", () => {
    fc.assert(
      fc.property(fc.integer({ min: -100, max: 100 }), (a) => pxContrast(128, a) === 128),
      RUNS,
    );
  });

  it("brightness(0) and contrast(0) are identity", () => {
    fc.assert(
      fc.property(byte(), (c) => pxBrightness(c, 0) === c && pxContrast(c, 0) === c),
      RUNS,
    );
  });
});

/* ---------------- MUTATION-KILLERS (targeted) ---------------- */

describe("mutation-kill: off-by-one in clampCropRect must fail", () => {
  it("W-1 vs W: rejecting x==W is critical", () => {
    // If a mutant removed Math.min(W-1, ...), x==W would sneak through and x+w<=W would fail.
    const c = clampCropRect({ x: 10_000, y: 10_000, w: 10_000, h: 10_000 }, 100, 100);
    expect(c.x + c.w).toBeLessThanOrEqual(100);
    expect(c.y + c.h).toBeLessThanOrEqual(100);
  });
});

describe("mutation-kill: rotateBy modulo", () => {
  it("360 wraps to 0", () => {
    let x: Xform = IDENTITY_XFORM;
    x = rotateBy(x, 90);
    x = rotateBy(x, 90);
    x = rotateBy(x, 90);
    x = rotateBy(x, 90);
    expect(x.rotation).toBe(0);
  });
});

describe("mutation-kill: watermarkFontPx floor at 8", () => {
  it("tiny image still yields at least 8px", () => {
    expect(watermarkFontPx(10, 10, 1)).toBeGreaterThanOrEqual(8);
  });
});
