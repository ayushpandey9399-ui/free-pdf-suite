import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Load the PDF you want to paginate",
    text: "Click Select PDF file and pick the document from your device. The first page renders as a live preview in the middle of the workspace so you can watch exactly where the number will sit before you commit.",
  },
  {
    title: "Pick a position on the page",
    text: "In the right sidebar, tap one of the six position tiles: TL, TC and TR sit the number in the top-left, top-centre or top-right corner, and BL, BC and BR do the same along the bottom. The preview number jumps to the chosen spot instantly so there's no guessing.",
  },
  {
    title: "Set the font size and the starting number",
    text: "Type a Font size in points (anywhere from 6 to 72, default 12) and a Start at value in the number field. Setting Start at to something other than 1 lets a document that continues from an earlier file pick up where the previous one left off, page one of this PDF then prints as 47, for example.",
  },
  {
    title: "Click Add Page Numbers and download",
    text: "The tool writes the numbers straight into the PDF as a text layer and hands the finished file back to your browser's normal download flow. The output is named after your original with a -numbered suffix, so meeting-notes.pdf becomes meeting-notes-numbered.pdf.",
  },
];

const faqs = [
  {
    q: "Where can I place the page numbers?",
    a: "Choose top or bottom placement with left, center, or right alignment. The tool uses a fixed 24-point margin.",
  },
  {
    q: "Can I start numbering above 1?",
    a: "Yes. Set Start at to the first number you want. Each following page increments that number by one.",
  },
  {
    q: "Can I skip the cover page?",
    a: "No. This tool numbers every page in the selected PDF.",
  },
  {
    q: "Can I use Page 1 of 10 or Roman numerals?",
    a: "No. This tool draws plain numeric labels. It does not offer total-page labels, prefixes, or Roman numerals.",
  },
  {
    q: "Will existing page numbers be removed?",
    a: "No. New numbers are drawn over the existing pages. Existing numbers remain, so choose a position that does not overlap them.",
  },
];

const related = [
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages anywhere in the document." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
] as const;

export function PageNumbersSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to add page numbers to a PDF online for free
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

      {/* Exactly how you need */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Number your pages exactly the way you need
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Three controls sit on the right of the workspace and, together, cover
        almost every real-world numbering need. The six-tile position grid
        pins the number to whichever corner or centre you prefer, no free
        dragging to worry about, just consistent, symmetric placement on every
        page. Font size takes a plain integer from 6 to 72 points, so
        readable defaults (10-14pt) and print-friendly larger sizes (18-24pt)
        are both a keystroke away.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The Start at field is what makes this tool useful for split
        documents: type 12 and page one of your file prints as 12, matching a
        prior volume that ended at 11. The format itself is intentionally
        minimal, a plain digit, drawn once per page, because that's what
        assignments, court bundles and printouts almost always ask for. When
        you need richer text like a date or a "Page X of Y" label, the
        Header & Footer tool linked below is the right neighbour.
      </p>

      {/* Why numbers matter */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why numbered pages matter
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A stapleless report drops out of a folder and turns into a puzzle
        without page numbers. A team on a call struggling to sync to
        "somewhere in the middle" loses minutes to "wait, which page again?"
        A submitted document that gets referenced by section only makes sense
        if the reader can actually point at a page.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Most PDFs generated from scans, screenshots, browser prints or merges
        arrive with no numbering at all, the source software simply doesn't
        add it. Fixing that once, in a corner nobody argues about, is what
        turns a raw stack of pages into a document people can actually work
        with.
      </p>

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

export const pageNumbersFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pageNumbersHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add page numbers to a PDF online for free",
  description:
    "Add page numbers to any PDF entirely in the browser, pick a corner, set the font size and starting number, and download the numbered file. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to number" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Add Page Numbers (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/page-numbers#step-${i + 1}`,
  })),
};

export const pageNumbersSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Add Page Numbers",
  description:
    "Add page numbers to PDF online free, choose one of six positions, set font size and starting number, and save the numbered file entirely inside the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
