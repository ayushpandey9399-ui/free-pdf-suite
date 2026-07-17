// Parse "1-3, 5, 8-10" into arrays of ranges (1-indexed inclusive).
export type Range = { start: number; end: number };

export function parseRanges(input: string, max: number): Range[] {
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  const out: Range[] = [];
  for (const p of parts) {
    const m = p.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`Invalid range: "${p}"`);
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    if (a < 1 || b < 1 || a > max || b > max || a > b) {
      throw new Error(`Out of bounds range: "${p}" (max ${max})`);
    }
    out.push({ start: a, end: b });
  }
  if (!out.length) throw new Error("No ranges specified");
  return out;
}

export function expandRanges(ranges: Range[]): number[] {
  const s = new Set<number>();
  for (const r of ranges) for (let i = r.start; i <= r.end; i++) s.add(i);
  return [...s].sort((a, b) => a - b);
}
