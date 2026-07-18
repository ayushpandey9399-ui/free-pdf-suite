// Segment extraction sanity check against the fixture.
import { readFileSync } from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const data = new Uint8Array(readFileSync('/tmp/browser/edit-seg/table.pdf'));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const page = await doc.getPage(1);
const content = await page.getTextContent();
const vp = page.getViewport({ scale: 1 });
const items = content.items.filter(it => 'str' in it);
// Group by baseline
const groups = [];
for (const it of items) {
  const [a,b,c,d,e,f] = it.transform;
  const baseline = vp.height - f;
  const fs = Math.abs(d);
  const g = groups[groups.length-1];
  if (g && Math.abs(baseline - g.b) < 2) g.items.push({ str: it.str, x: e, w: it.width, fs });
  else groups.push({ b: baseline, items: [{ str: it.str, x: e, w: it.width, fs }] });
}
// Segment
for (const g of groups) {
  const its = g.items.sort((p,q)=>p.x-q.x);
  const gaps = [];
  for (let k=1;k<its.length;k++) gaps.push(its[k].x - (its[k-1].x + its[k-1].w));
  const positive = gaps.filter(x=>x>0);
  const med = positive.length ? positive.sort((a,b)=>a-b)[Math.floor(positive.length/2)] : its[0].fs*0.25;
  const segs = [[]];
  for (let k=0;k<its.length;k++){
    const r = its[k];
    if (segs[segs.length-1].length===0) { segs[segs.length-1].push(r); continue; }
    const prev = segs[segs.length-1][segs[segs.length-1].length-1];
    const gap = r.x - (prev.x+prev.w);
    const th = Math.max(1.2*med, 0.6*r.fs);
    if (gap>th) segs.push([r]);
    else segs[segs.length-1].push(r);
  }
  console.log(`baseline y=${g.b.toFixed(1)} medianGap=${med.toFixed(2)} → ${segs.length} segments: ${segs.map(s=>s.map(i=>i.str).join('')).join(' | ')}`);
}
