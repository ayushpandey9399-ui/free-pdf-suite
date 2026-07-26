import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you want to add pages to",
    text: "Click Select PDF file and pick your document. The tool reads it locally with pdf.js, confirms it isn't password-protected, and renders every existing page as a thumbnail so you can see the layout before you insert anything.",
  },
  {
    title: "Pick where each blank page goes",
    text: "Hover any thumbnail and a red + slot appears on the left edge, click it to drop a blank page before that page. Slots exist between every pair of pages and after the last one, so you can insert at the very beginning, in the middle, at the end, or in several spots in the same pass. Each pending blank shows up inline as a dashed placeholder labelled Blank with the position number so you can proof the final order.",
  },
  {
    title: "Or add many at once",
    text: "Two sidebar shortcuts save clicking: Add blank page at end drops one at the tail, and Add blank page after every page inserts one between every existing page in a single click (with a confirm for documents over 50 pages). Removing a blank is a single click on its × badge, and Reset, remove all pending blank pages clears every pending insertion without touching the original document.",
  },
  {
    title: "Choose a size and click Add Blank Pages",
    text: "Under Blank page size pick Match previous, each blank inherits the dimensions of the page just before it (or the next page if the blank is at position 1), or A4 to force every insertion to a standard A4 sheet. Click Add N Blank Pages and the tool writes a new copy suffixed -with-blanks.pdf, with a success screen telling you how many were added and the new total.",
  },
];

const benefits = [
  {
    h: "Any position",
    p: "Insert at the very start, between any two pages, at the end, or in several spots at once, the + slot exists on every page and after the last one. There is no fixed limit on how many blanks you can queue up before you export.",
  },
  {
    h: "Size-matched pages",
    p: "The default Match previous mode makes each blank inherit the dimensions of the neighbouring page, so a mixed A4 / Letter / receipt-sized PDF stays visually consistent. Switch to A4 when you want every inserted page forced to a standard sheet regardless of the source.",
  },
  {
    h: "Perfect for print planning",
    p: "Because blanks land exactly where you place them, you can control what falls on the left versus the right side of a double-sided print, push each chapter opener onto an odd page, or leave a deliberate blank after a signature block so nothing prints on its reverse.",
  },
  {
    h: "Original untouched",
    p: "The tool never overwrites what you uploaded. The output is a new file suffixed -with-blanks.pdf saved alongside your source, so you can always throw the copy away and start over without losing the original document.",
  },
];

const scenarios = [
  {
    h: "Double-sided printing where each chapter starts on the right",
    p: "In duplex printing the right-hand page is always odd-numbered. If chapter two ends on an odd page, chapter three will start on the back of that sheet unless you slip a blank in between. Inserting a blank at the right spot forces the next section to open on a fresh right-hand page, the way printed books do.",
  },
  {
    h: "Leaving room for signatures, stamps or handwritten notes",
    p: "Agreements often need a witness page, a notary block or a hand-signed acknowledgement that isn't part of the original layout. Drop a blank right after the clause it belongs to, print the file, and there's a clean sheet waiting exactly where the pen has to go.",
  },
  {
    h: "Separating sections in a compiled document",
    p: "When you've merged several reports, invoices or scans into one PDF, a blank page between sections gives a clear visual break, especially when the document is printed and passed around. It's the paper equivalent of a divider tab.",
  },
  {
    h: "Reserving space for content you'll add later",
    p: "Sometimes you know a map, a chart, a form or an attachment is coming but you don't have it yet. Drop a blank as a placeholder at the right position, keep working, and swap the content in later, the surrounding page numbering stays exactly as planned.",
  },
  {
    h: "Meeting agendas with reserved discussion pages",
    p: "When an agenda goes out as a PDF, participants often want a blank sheet after each item to jot notes during the discussion. Insert one blank after every agenda point, or use Add blank page after every page for the whole document, so everyone prints a booklet-style handout with note space exactly where the conversation happens.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I add a blank page to a PDF for free?",
    a: "Click Select PDF file, pick your document, hover any page thumbnail and click the red + slot where you want the blank to appear, then click Add Blank Pages. Download the -with-blanks.pdf copy. No signup, no upload, no watermark, no page limit.",
    plain:
      "Click Select PDF file, pick your document, hover any thumbnail and click the red + slot where the blank should go, then click Add Blank Pages. Download the -with-blanks.pdf copy. No signup, upload, watermark or page limit.",
  },
  {
    q: "Can I insert a page in the middle of the document?",
    a: "Yes, insert slots exist on the left edge of every thumbnail and after the last page, so you can drop a blank between any two pages, at the very beginning or at the very end. There's no dropdown restricting you to first / last only.",
    plain:
      "Yes. Insert slots appear on the left edge of every thumbnail and after the last page, so blanks can go between any two pages, at the very start or at the end. No first/last-only restriction.",
  },
  {
    q: "Can I add several blank pages at once?",
    a: "Yes, in three ways. Click the + slot on multiple positions to queue up as many blanks as you like before exporting. Use Add blank page at end to append one to the tail with one click. Use Add blank page after every page to insert a blank between every existing page in a single pass (documents over 50 pages ask for confirmation first). Every insertion is written into the final PDF in one export.",
    plain:
      "Yes, three ways: click the + slot on multiple positions to queue as many as you like, use Add blank page at end to append one, or use Add blank page after every page to insert one between every page in one click (confirm prompt above 50 pages). All insertions are written in one export.",
  },
  {
    q: "Will the blank page match my document's page size?",
    a: "By default yes, the sidebar's Blank page size is set to Match previous, so each blank inherits the dimensions of the page just before it (or the next page if the blank is at position 1). Switch to A4 if you want every inserted page forced to a standard A4 sheet regardless of what the surrounding pages look like.",
    plain:
      "By default yes, the Blank page size setting is Match previous, so each blank inherits the size of the page before it (or the next page if at position 1). Switch to A4 to force every insertion to a standard A4 sheet.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Rendering the thumbnails, queuing insertions and writing the final -with-blanks.pdf all happen inside your browser tab using pdf.js and pdf-lib. Nothing about the file is transmitted to us or to any third party, and the flow keeps working once your network is disconnected.",
    plain:
      "No. Thumbnails, insertions and writing the -with-blanks.pdf all happen inside your browser tab with pdf.js and pdf-lib. Nothing is transmitted, and the flow keeps working offline once loaded.",
  },
  {
    q: "Can I write on the blank page afterwards?",
    a: (
      <>
        Yes, the inserted page is a real, editable PDF page. Open the
        finished document in{" "}
        <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] underline">
          Edit PDF
        </Link>{" "}
        to add text, highlights, shapes or a signature directly onto the
        blank, or print the file and fill the sheet by hand.
      </>
    ),
    plain:
      "Yes. The inserted page is a real editable PDF page. Open the finished file in Edit PDF (/tools/edit-pdf) to add text, highlights or a signature, or print and fill it by hand.",
  },
  {
    q: "How do I remove a blank page instead?",
    a: (
      <>
        Use{" "}
        <Link to="/tools/$slug" params={{ slug: "delete-pages" }} className="text-[#e5322d] underline">
          Delete Pages
        </Link>{" "}
       , pick the page numbers you want removed and export a copy
        without them. If a blank you just added here is wrong, the
        pending placeholder has an × badge you can click before you
        export, and Reset, remove all pending blank pages clears every
        insertion at once.
      </>
    ),
    plain:
      "Use Delete Pages (/tools/delete-pages), pick the page numbers and export a copy without them. Before exporting here, click the × on any pending blank to drop it, or Reset to clear all insertions.",
  },
  {
    q: "Can I use this on my phone?",
    a: "Yes. The tool is a mobile-friendly web page, on phones the + insertion slots stay visible on every thumbnail (rather than appearing on hover), and everything runs locally in your mobile browser without needing an app or a signup.",
    plain:
      "Yes. It's a mobile-friendly web page. On phones the + insertion slots stay visible on every thumbnail rather than appearing on hover, and everything runs in your mobile browser with no app or signup.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. The tool runs in Chrome, Safari, Firefox, Edge or Brave with no Acrobat licence, no install and no account. The output is a standard, universally-readable PDF that any reader or printer will accept.",
    plain:
      "No. It runs in Chrome, Safari, Firefox, Edge or Brave with no Acrobat licence, install or account. The output is a standard PDF accepted by any reader or printer.",
  },
  {
    q: "Why add blank pages for double-sided printing?",
    a: (
      <>
        In duplex printing the right-hand page is always odd-numbered
        and the back of each sheet is even. If a chapter or section
        ends on an odd page, the next section will start on the back
        of that sheet unless a blank is inserted between them.
        Inserting a blank at that point forces the next section to
        open on a fresh right-hand page, the same effect print books
        use. After inserting, you may want to run the file through{" "}
        <Link to="/tools/$slug" params={{ slug: "page-numbers" }} className="text-[#e5322d] underline">
          Page Numbers
        </Link>{" "}
        to renumber cleanly.
      </>
    ),
    plain:
      "In duplex printing the right-hand page is odd and the back is even. If a section ends on an odd page, the next section starts on its back unless a blank is inserted. Adding a blank forces the next section to open on a fresh right-hand page. After inserting, use Page Numbers (/tools/page-numbers) to renumber cleanly.",
  },
];

const related = [
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Add page numbers with custom position and style." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
] as const;

export function AddBlankPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to add a blank page to a PDF online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[15px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Insert empty pages exactly where you need them */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Insert empty pages exactly where you need them
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Drop a blank right after the cover so the table of contents starts on a
        fresh page. Wedge one between two chapters so the next chapter opens on
        the right-hand side. Add one at the end for handwritten notes that need
        to travel with the document. Every insertion happens where you click , 
        no dropdown that only lets you pick "beginning" or "end".
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        With the default Match previous size setting, each blank inherits the
        dimensions of the surrounding page, so a PDF that mixes A4 pages with
        Letter-sized scans stays visually uniform after you insert. Switch to A4
        only when you specifically want every insertion forced to a standard
        sheet.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private and instant
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Like every FreePDFHub tool, the insertion runs entirely inside your
        browser tab with pdf.js and pdf-lib, the document never leaves your
        device, and nothing is logged on our side. Even long files update in
        seconds because adding pages is a structural change, not a re-render of
        the existing content.
      </p>

      {/* Four benefits */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When do you need blank pages in a PDF?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none text-[15.5px] font-semibold flex justify-between items-center">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Related PDF tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const addBlankPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const addBlankPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a blank page to a PDF online for free",
  description:
    "Insert one or more blank pages into a PDF entirely in the browser, anywhere in the document, at the size of your choice. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub Add Blank Pages (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/add-blank-pages#step-${i + 1}`,
  })),
};

export const addBlankPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Add Blank Pages",
  description:
    "Insert blank pages into a PDF online free, anywhere in the document, matching the surrounding page size, in your browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
