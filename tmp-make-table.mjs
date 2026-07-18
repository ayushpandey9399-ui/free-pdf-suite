import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { writeFileSync } from 'fs';
const doc = await PDFDocument.create();
const p = doc.addPage([500, 300]);
const f = await doc.embedFont(StandardFonts.Helvetica);
const rows = [
  ['1', '2024-25', 'Micro',  '11/01/2024'],
  ['2', '2025-26', 'Small',  '15/03/2025'],
  ['3', '2026-27', 'Medium', '22/04/2026'],
  ['4', '2027-28', 'Large',  '05/06/2027'],
];
const xs = [40, 120, 220, 340];
const y0 = 240;
const rowH = 40;
// grid
for (let i = 0; i <= rows.length; i++) {
  const y = y0 - i * rowH;
  p.drawLine({ start: { x: 30, y }, end: { x: 470, y }, thickness: 1, color: rgb(0,0,0) });
}
for (const x of [30, 110, 210, 330, 470]) {
  p.drawLine({ start: { x, y: y0 }, end: { x, y: y0 - rows.length * rowH }, thickness: 1, color: rgb(0,0,0) });
}
for (let r = 0; r < rows.length; r++) {
  for (let c = 0; c < 4; c++) {
    p.drawText(rows[r][c], { x: xs[c], y: y0 - (r+1) * rowH + 14, size: 12, font: f });
  }
}
writeFileSync('/tmp/browser/edit-seg/table.pdf', await doc.save());
console.log('written');
