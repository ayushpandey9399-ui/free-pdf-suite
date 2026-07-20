/**
 * Pure math for automatic document edge detection and 4-point perspective
 * un-warp. Framework-free, DOM-free, unit-testable. Used only by the
 * scan-to-pdf tool.
 *
 * Pipeline (call site drives it):
 *   1. rgbaToGray -> boxBlur -> sobelMagnitude
 *   2. percentileThreshold -> houghLines (internal) -> quad candidate
 *   3. orderQuadCorners -> isConvexQuad -> quadConfidence
 *   4. computeHomography + warpQuadToRect for the un-warp
 */

export interface Point { x: number; y: number }
/** Quad in canonical order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

/* ------------------------------------------------------------------ *
 *  Grayscale + blur + Sobel
 * ------------------------------------------------------------------ */

export function rgbaToGray(rgba: Uint8ClampedArray, w: number, h: number): Float64Array {
  const out = new Float64Array(w * h);
  for (let i = 0, j = 0; j < out.length; i += 4, j++) {
    out[j] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return out;
}

/** Separable 3x3 box blur, radius 1. */
export function boxBlur(gray: Float64Array, w: number, h: number): Float64Array {
  const tmp = new Float64Array(w * h);
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const x0 = x > 0 ? x - 1 : x;
      const x1 = x < w - 1 ? x + 1 : x;
      tmp[row + x] = (gray[row + x0] + gray[row + x] + gray[row + x1]) / 3;
    }
  }
  for (let y = 0; y < h; y++) {
    const y0 = (y > 0 ? y - 1 : y) * w;
    const y1 = (y < h - 1 ? y + 1 : y) * w;
    const row = y * w;
    for (let x = 0; x < w; x++) {
      out[row + x] = (tmp[y0 + x] + tmp[row + x] + tmp[y1 + x]) / 3;
    }
  }
  return out;
}

export interface SobelResult { mag: Float64Array; angle: Float64Array }

export function sobelMagnitude(gray: Float64Array, w: number, h: number): SobelResult {
  const mag = new Float64Array(w * h);
  const angle = new Float64Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const tl = gray[i - w - 1], t = gray[i - w], tr = gray[i - w + 1];
      const l = gray[i - 1], r = gray[i + 1];
      const bl = gray[i + w - 1], b = gray[i + w], br = gray[i + w + 1];
      const gx = -tl - 2 * l - bl + tr + 2 * r + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      mag[i] = Math.hypot(gx, gy);
      angle[i] = Math.atan2(gy, gx);
    }
  }
  return { mag, angle };
}

/** Adaptive percentile threshold on a downsampled histogram. */
export function percentileThreshold(mag: Float64Array, pct: number): number {
  const step = Math.max(1, Math.floor(mag.length / 20000));
  const sample: number[] = [];
  for (let i = 0; i < mag.length; i += step) sample.push(mag[i]);
  sample.sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sample.length - 1, Math.floor((sample.length - 1) * pct)));
  return sample[idx] ?? 0;
}

/* ------------------------------------------------------------------ *
 *  Quad geometry
 * ------------------------------------------------------------------ */

/** Order 4 arbitrary points into tl, tr, br, bl using sum/diff of coords. */
export function orderQuadCorners(pts: Point[]): Quad {
  if (pts.length !== 4) throw new Error("orderQuadCorners needs exactly 4 points");
  let tlI = 0, brI = 0, trI = 0, blI = 0;
  let minSum = Infinity, maxSum = -Infinity, maxDiff = -Infinity, minDiff = Infinity;
  for (let i = 0; i < 4; i++) {
    const s = pts[i].x + pts[i].y;
    const d = pts[i].x - pts[i].y;
    if (s < minSum) { minSum = s; tlI = i; }
    if (s > maxSum) { maxSum = s; brI = i; }
    if (d > maxDiff) { maxDiff = d; trI = i; }
    if (d < minDiff) { minDiff = d; blI = i; }
  }
  return [pts[tlI], pts[trI], pts[brI], pts[blI]];
}

function crossZ(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function isConvexQuad(q: Quad): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const o = q[i], a = q[(i + 1) % 4], b = q[(i + 2) % 4];
    const c = crossZ(o, a, b);
    if (Math.abs(c) < 1e-9) continue;
    const s = c > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return sign !== 0;
}

export function quadArea(q: Quad): number {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p1 = q[i], p2 = q[(i + 1) % 4];
    a += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(a) / 2;
}

/* ------------------------------------------------------------------ *
 *  Hough-based dominant-line quad search
 * ------------------------------------------------------------------ */

interface Line { rho: number; theta: number; votes: number }

function angDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % Math.PI;
  if (d > Math.PI / 2) d = Math.PI - d;
  return d;
}

function houghLines(
  mag: Float64Array,
  angle: Float64Array,
  w: number,
  h: number,
  threshold: number,
): Line[] {
  const angleBins = 180;
  const maxRho = Math.hypot(w, h);
  const rhoBins = Math.max(64, Math.ceil(maxRho));
  const acc = new Float64Array(angleBins * rhoBins);
  const rhoScale = rhoBins / (2 * maxRho);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const m = mag[i];
      if (m < threshold) continue;
      let g = angle[i];
      if (g < 0) g += Math.PI;
      if (g >= Math.PI) g -= Math.PI;
      const bin = Math.min(angleBins - 1, Math.max(0, Math.floor((g / Math.PI) * angleBins)));
      const theta = ((bin + 0.5) / angleBins) * Math.PI;
      const rho = x * Math.cos(theta) + y * Math.sin(theta);
      const rBin = Math.min(rhoBins - 1, Math.max(0, Math.floor((rho + maxRho) * rhoScale)));
      acc[bin * rhoBins + rBin] += m;
    }
  }
  // Extract peaks with non-max suppression.
  const suppressed = new Uint8Array(acc.length);
  let max = 0;
  for (let i = 0; i < acc.length; i++) if (acc[i] > max) max = acc[i];
  const minVotes = max * 0.15;
  const rhoWin = Math.max(4, Math.floor(rhoBins / 40));
  const thetaWin = 3;
  const peaks: Line[] = [];
  for (let n = 0; n < 60; n++) {
    let bestI = -1;
    let best = minVotes;
    for (let i = 0; i < acc.length; i++) {
      if (suppressed[i]) continue;
      if (acc[i] > best) { best = acc[i]; bestI = i; }
    }
    if (bestI < 0) break;
    const t = Math.floor(bestI / rhoBins);
    const r = bestI % rhoBins;
    const theta = ((t + 0.5) / angleBins) * Math.PI;
    const rho = (r + 0.5) / rhoScale - maxRho;
    peaks.push({ rho, theta, votes: best });
    for (let dt = -thetaWin; dt <= thetaWin; dt++) {
      let tt = t + dt;
      if (tt < 0) tt += angleBins;
      if (tt >= angleBins) tt -= angleBins;
      for (let dr = -rhoWin; dr <= rhoWin; dr++) {
        const rr = r + dr;
        if (rr < 0 || rr >= rhoBins) continue;
        suppressed[tt * rhoBins + rr] = 1;
      }
    }
  }
  return peaks;
}

function intersectLines(a: Line, b: Line): Point | null {
  const ca = Math.cos(a.theta), sa = Math.sin(a.theta);
  const cb = Math.cos(b.theta), sb = Math.sin(b.theta);
  const det = ca * sb - sa * cb;
  if (Math.abs(det) < 1e-6) return null;
  const x = (sb * a.rho - sa * b.rho) / det;
  const y = (-cb * a.rho + ca * b.rho) / det;
  return { x, y };
}

function findQuadFromLines(lines: Line[], w: number, h: number): Quad | null {
  if (lines.length < 4) return null;
  const sorted = [...lines].sort((a, b) => b.votes - a.votes);
  const primary = sorted[0].theta;
  const secondaryLine = sorted.find((l) => angDiff(l.theta, primary) > Math.PI / 4);
  if (!secondaryLine) return null;
  const secondary = secondaryLine.theta;

  const groupTol = Math.PI / 6;
  const g1: Line[] = [];
  const g2: Line[] = [];
  for (const l of sorted) {
    const d1 = angDiff(l.theta, primary);
    const d2 = angDiff(l.theta, secondary);
    if (d1 <= d2 && d1 < groupTol) g1.push(l);
    else if (d2 < d1 && d2 < groupTol) g2.push(l);
  }
  if (g1.length < 2 || g2.length < 2) return null;

  const pickPair = (g: Line[]): [Line, Line] | null => {
    // Convert to signed rho relative to a shared angle so parallel lines compare cleanly.
    const ref = g[0].theta;
    const proj = g.map((l) => {
      const flip = Math.cos(l.theta - ref) < 0 ? -1 : 1;
      return { l, rr: l.rho * flip };
    });
    let best: [Line, Line] | null = null;
    let bestScore = 0;
    for (let i = 0; i < proj.length; i++) {
      for (let j = i + 1; j < proj.length; j++) {
        const sep = Math.abs(proj[i].rr - proj[j].rr);
        // Reward wide separation weighted by votes.
        const score = sep * (proj[i].l.votes + proj[j].l.votes);
        if (score > bestScore) {
          bestScore = score;
          best = [proj[i].l, proj[j].l];
        }
      }
    }
    return best;
  };

  const p1 = pickPair(g1);
  const p2 = pickPair(g2);
  if (!p1 || !p2) return null;

  const corners: Point[] = [];
  for (const a of p1) {
    for (const b of p2) {
      const c = intersectLines(a, b);
      if (!c) return null;
      if (c.x < -w * 0.15 || c.x > w * 1.15 || c.y < -h * 0.15 || c.y > h * 1.15) return null;
      corners.push({
        x: Math.max(0, Math.min(w, c.x)),
        y: Math.max(0, Math.min(h, c.y)),
      });
    }
  }
  if (corners.length !== 4) return null;
  const quad = orderQuadCorners(corners);
  if (!isConvexQuad(quad)) return null;
  return quad;
}

/**
 * Confidence 0..1 combining area ratio, convexity, edge strength along the
 * quad sides, and how close corner angles are to 90 degrees.
 */
export function quadConfidence(q: Quad, mag: Float64Array, w: number, h: number): number {
  if (!isConvexQuad(q)) return 0;
  const area = quadArea(q);
  const frame = w * h;
  const ratio = area / frame;
  if (ratio < 0.2 || ratio > 0.98) return 0;

  let edgeSum = 0, edgeSamples = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(10, Math.floor(len / 3));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const x = Math.floor(a.x + (b.x - a.x) * t);
      const y = Math.floor(a.y + (b.y - a.y) * t);
      if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
      edgeSum += mag[y * w + x];
      edgeSamples++;
    }
  }
  const avgEdge = edgeSamples > 0 ? edgeSum / edgeSamples : 0;
  const edgeScore = Math.max(0, Math.min(1, avgEdge / 250));

  let angleScore = 1;
  for (let i = 0; i < 4; i++) {
    const p0 = q[(i + 3) % 4], p1 = q[i], p2 = q[(i + 1) % 4];
    const v1x = p0.x - p1.x, v1y = p0.y - p1.y;
    const v2x = p2.x - p1.x, v2y = p2.y - p1.y;
    const denom = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) + 1e-6;
    const cos = (v1x * v2x + v1y * v2y) / denom;
    const ang = Math.acos(Math.max(-1, Math.min(1, cos)));
    const dev = Math.abs(ang - Math.PI / 2);
    if (dev > 1.0) angleScore *= 0.25;
    else angleScore *= Math.max(0, 1 - dev / 1.3);
  }
  angleScore = Math.max(0, Math.min(1, angleScore));

  const areaScore = ratio > 0.9
    ? Math.max(0, 1 - (ratio - 0.9) * 4)
    : Math.min(1, (ratio - 0.2) / 0.5);

  return Math.max(0, Math.min(1, 0.3 * areaScore + 0.45 * edgeScore + 0.25 * angleScore));
}

/**
 * Full detection on a small working RGBA buffer (call site downscales to
 * ~800px long edge first). Returns null when nothing plausible is found.
 */
export function detectDocumentQuad(
  rgba: Uint8ClampedArray,
  w: number,
  h: number,
): { quad: Quad; confidence: number } | null {
  const gray = boxBlur(rgbaToGray(rgba, w, h), w, h);
  const { mag, angle } = sobelMagnitude(gray, w, h);
  const threshold = percentileThreshold(mag, 0.92);
  const lines = houghLines(mag, angle, w, h, threshold);
  const quad = findQuadFromLines(lines, w, h);
  if (!quad) return null;
  const confidence = quadConfidence(quad, mag, w, h);
  return { quad, confidence };
}

/* ------------------------------------------------------------------ *
 *  Homography + warp
 * ------------------------------------------------------------------ */

/** Gaussian elimination for an NxN system A x = b, mutates its own copies. */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let piv = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[piv][i])) piv = k;
    [M[i], M[piv]] = [M[piv], M[i]];
    const p = M[i][i];
    if (Math.abs(p) < 1e-12) throw new Error("Singular system");
    for (let k = i + 1; k < n; k++) {
      const f = M[k][i] / p;
      for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

/** 4-point DLT homography H mapping src -> dst. Returns 9 numbers row-major, H[8] = 1. */
export function computeHomography(src: Quad, dst: Quad): number[] {
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x: X, y: Y } = src[i];
    const { x: u, y: v } = dst[i];
    A.push([X, Y, 1, 0, 0, 0, -u * X, -u * Y]); b.push(u);
    A.push([0, 0, 0, X, Y, 1, -v * X, -v * Y]); b.push(v);
  }
  const h = solveLinear(A, b);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

export function applyH(H: number[], x: number, y: number): Point {
  const w = H[6] * x + H[7] * y + H[8];
  return { x: (H[0] * x + H[1] * y + H[2]) / w, y: (H[3] * x + H[4] * y + H[5]) / w };
}

/** Output rect size for a quad: average of opposite side lengths. */
export function outputSizeForQuad(q: Quad): { w: number; h: number } {
  const top = Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y);
  const bot = Math.hypot(q[2].x - q[3].x, q[2].y - q[3].y);
  const left = Math.hypot(q[3].x - q[0].x, q[3].y - q[0].y);
  const right = Math.hypot(q[2].x - q[1].x, q[2].y - q[1].y);
  return {
    w: Math.max(1, Math.round((top + bot) / 2)),
    h: Math.max(1, Math.round((left + right) / 2)),
  };
}

/** Inverse-mapped bilinear warp of a quad in source coords onto a (outW x outH) rect. */
export function warpQuadToRect(src: ImageData, quad: Quad, outW: number, outH: number): ImageData {
  const dst = new ImageData(outW, outH);
  const dstQ: Quad = [
    { x: 0, y: 0 },
    { x: outW - 1, y: 0 },
    { x: outW - 1, y: outH - 1 },
    { x: 0, y: outH - 1 },
  ];
  const Hinv = computeHomography(dstQ, quad);
  const s = src.data;
  const d = dst.data;
  const sw = src.width, sh = src.height;
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const p = applyH(Hinv, x, y);
      const fx = p.x, fy = p.y;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const cx0 = x0 < 0 ? 0 : x0 > sw - 1 ? sw - 1 : x0;
      const cy0 = y0 < 0 ? 0 : y0 > sh - 1 ? sh - 1 : y0;
      const cx1 = x0 + 1 < 0 ? 0 : x0 + 1 > sw - 1 ? sw - 1 : x0 + 1;
      const cy1 = y0 + 1 < 0 ? 0 : y0 + 1 > sh - 1 ? sh - 1 : y0 + 1;
      const ax = fx - x0, ay = fy - y0;
      const di = (y * outW + x) * 4;
      const i00 = (cy0 * sw + cx0) * 4;
      const i10 = (cy0 * sw + cx1) * 4;
      const i01 = (cy1 * sw + cx0) * 4;
      const i11 = (cy1 * sw + cx1) * 4;
      for (let k = 0; k < 4; k++) {
        const v0 = s[i00 + k] + (s[i10 + k] - s[i00 + k]) * ax;
        const v1 = s[i01 + k] + (s[i11 + k] - s[i01 + k]) * ax;
        d[di + k] = v0 + (v1 - v0) * ay;
      }
    }
  }
  return dst;
}

/* ------------------------------------------------------------------ *
 *  Interactive-drag helpers (kept pure for testability)
 * ------------------------------------------------------------------ */

/**
 * Clamp a corner drag: keep the moved corner inside the frame AND keep the
 * quad convex. If the new position would make the quad self-intersect or
 * non-convex, return the original corner unchanged.
 *
 * cornerIndex is 0..3 in tl/tr/br/bl order.
 */
export function clampCornerMove(
  quad: Quad,
  cornerIndex: 0 | 1 | 2 | 3,
  proposed: Point,
  frameW: number,
  frameH: number,
): Point {
  const inside: Point = {
    x: Math.max(0, Math.min(frameW, proposed.x)),
    y: Math.max(0, Math.min(frameH, proposed.y)),
  };
  const test = quad.map((p, i) => (i === cornerIndex ? inside : p)) as Quad;
  if (isConvexQuad(test)) return inside;
  return quad[cornerIndex];
}
