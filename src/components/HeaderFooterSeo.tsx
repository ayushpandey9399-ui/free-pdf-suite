import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you want to stamp",
    text: "Click Select PDF file and pick your document. The first page renders as a live preview so you can watch each header and footer slot fill in as you type, navigate to any page with the ← → buttons above the preview to confirm placement across the file.",
  },
  {
    title: "Type into the six slots and drop in tokens",
    text: "The sidebar shows two panels, Header and Footer, each with a Left, Center and Right text input. Type any static text, then tap the {page}, {total}, {date} or {filename} chip under the row to insert that token at the cursor position of the last-focused slot. You can mix freely: \"Confidential, {filename}\" in the header-left, \"Page {page} of {total}\" in the footer-right.",
  },
  {
    title: "Set the look and choose which pages get stamped",
    text: "Pick a Font size (6 to 72pt, default 10), a Color from the swatch picker, and a Margin from edge, Small (18pt), Normal (28pt) or Big (44pt). Under Pages, choose All pages or Page range and type something like 2-10 or 1,3,5-9 to skip a cover page or target a specific section.",
  },
  {
    title: "Click Add Header & Footer and download",
    text: "The tool writes each slot's text, with tokens resolved for the actual page, as a Helvetica text layer on every included page, respecting page rotation so headers stay on top even for sideways scans. The output downloads as your-file-stamped.pdf; the original PDF isn't overwritten.",
  },
];

const faqs = [
  {
    q: "Can I put different text in different positions?",
    a: "Yes. There are separate left, center and right text slots for both the header and footer.",
  },
  {
    q: "How do I add page numbers?",
    a: "Insert {page} for the current page number and {total} for the document page count. For example, Page {page} of {total} combines both tokens.",
  },
  {
    q: "Can I insert the date or filename?",
    a: "Yes. Use {date} for the date and {filename} for the source filename without its .pdf extension.",
  },
  {
    q: "Which styling controls are available?",
    a: "You can change font size, text color and the margin from the page edge. The exported text uses Helvetica.",
  },
  {
    q: "Can I stamp only certain pages?",
    a: "Yes. Choose the page-range option instead of all pages and enter the pages to stamp.",
  },
  {
    q: "Will the tool make space for my header and footer?",
    a: "No. Text is drawn over the existing page without moving its contents. Check the preview and choose a margin and font size that avoid overlap.",
  },
];

const related = [
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Add page numbers with custom position and style." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages anywhere in the document." },
] as const;

export function HeaderFooterSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to add a header or footer to a PDF online for free
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

      {/* Tokens differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Smart tokens: dates, filenames and page numbers that fill themselves
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The chips beneath each row of inputs, {"{page}"}, {"{total}"},
        {" "}{"{date}"} and {"{filename}"}, are the reason this tool is faster
        than doing headers by hand in a word processor. Tap one and the token
        is inserted at the end of whichever slot you last focused; when the PDF
        saves, each token is replaced with the real value for that page.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Type {"Page {page} of {total}"} in Footer-Center and every page
        auto-numbers itself with the true totals; drop {"{date}"} in a header
        slot and today's date (DD/MM/YYYY) stamps across the file at save time;
        put {"{filename}"} in a corner and every page carries the document's
        name minus the .pdf extension. Combining is free-form, so a footer of
        "Confidential, {"{filename}"}, Page {"{page}"} of {"{total}"}" is
        one line of typing that produces a fully-referenced, per-page stamp on
        a 200-page document.
      </p>

      {/* Label like a professional document */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Label every page like a professional document
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A report without a header, a bundle without a footer, or a printed
        handout without a date all share the same problem, the pages don't
        know what they are. Any page that gets photographed, forwarded,
        stapled, unstapled or dropped becomes an orphan without a way back to
        its source.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        A quiet title along the top and a small "Page X of Y" along the bottom
        fixes that in one pass. It makes the document referenceable in
        meetings ("see page 14 of the RFP"), hard to misfile after printing,
        and instantly identifiable when a single page is forwarded on. That's
        the entire brief of this tool: give a plain PDF the metadata a
        professional reader expects to see on the page itself.
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

export const headerFooterFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const headerFooterHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a header or footer to a PDF online for free",
  description:
    "Add headers and footers to any PDF entirely in the browser, six slots, smart tokens for page number, total, date and filename, colour and margin controls, optional page range. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to stamp" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Header & Footer (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/header-footer#step-${i + 1}`,
  })),
};

export const headerFooterSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Add Header & Footer",
  description:
    "Add headers and footers to PDF online free, six slots (header and footer × left/center/right), smart tokens for page number, total, date and filename, colour, margin and page-range controls. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
