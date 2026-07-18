import { readFileSync } from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
const data = new Uint8Array(readFileSync('/tmp/browser/edit-seg/table.pdf'));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const page = await doc.getPage(1);
const content = await page.getTextContent();
const vp = page.getViewport({ scale: 1 });
const items = content.items.filter(it => 'str' in it);
const groups = [];
for (const it of items) {
  const [,,,d,e,f] = it.transform;
  const baseline = vp.height - f;
  const fs = Math.abs(d);
  const g = groups[groups.length-1];
  if (g && Math.abs(baseline - g.b) < 2) g.items.push({ str: it.str, x: e, w: it.width, fs });
  else groups.push({ b: baseline, items: [{ str: it.str, x: e, w: it.width, fs }] });
}
const med = a=>a.length? a.slice().sort((x,y)=>x-y)[Math.floor(a.length/2)] : 0;
for (const g of groups) {
  const bucket = g.items.sort((p,q)=>p.x-q.x);
  const spaces = bucket.filter(r=>/^\s+$/.test(r.str)).map(r=>r.w);
  const gaps=[]; for (let k=1;k<bucket.length;k++){const gp=bucket[k].x-(bucket[k-1].x+bucket[k-1].w); if(gp>0)gaps.push(gp);}
  const fs0=bucket[0].fs;
  let sref = spaces.length? med(spaces) : (gaps.length? med(gaps): fs0*0.28);
  const th = Math.max(1.2*sref, 0.6*fs0);
  const segs=[]; let cur=[]; const push=()=>{if(cur.length){segs.push(cur);cur=[];}};
  for (const r of bucket){
    const ws=/^\s+$/.test(r.str);
    if (ws && r.w>th) { push(); continue; }
    if (cur.length){const prev=cur[cur.length-1]; const gp=r.x-(prev.x+prev.w); if(gp>th) push();}
    cur.push(r);
  }
  push();
  const asText = s=>s.map(i=>i.str).join('').replace(/\s+/g,' ').trim();
  console.log(`y=${g.b.toFixed(0)} sp=${sref.toFixed(2)} th=${th.toFixed(2)} → ${segs.length}: [${segs.map(asText).join('] [')}]`);
}
