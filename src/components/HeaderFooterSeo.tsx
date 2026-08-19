import type { ReactNode } from "react";
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

const benefits = [
  {
    h: "Six placement slots",
    p: "Two rows of three inputs, Header-Left, Header-Center, Header-Right, Footer-Left, Footer-Center, Footer-Right, cover every corner-and-centre placement a professional document tends to use. Each slot is independent, so you can stamp only the ones you need and leave the rest empty.",
  },
  {
    h: "Your text plus smart tokens",
    p: "Any slot accepts free-form text mixed with the four smart tokens: {page}, {total}, {date} and {filename}. Type \"Draft, {date}\" or \"{filename} · Page {page} of {total}\" and the tool resolves each token per page when it saves the PDF, no placeholders left behind.",
  },
  {
    h: "Consistent on every page",
    p: "One setup applies to every page in the file, or every page in the range you specified. The Margin from edge control keeps all six slots a uniform Small (18pt), Normal (28pt) or Big (44pt) distance from the paper edge, so the document reads as one cohesive piece rather than a patchwork.",
  },
  {
    h: "No quality loss",
    p: "Text is added as a lightweight Helvetica text layer sitting in the page margins; nothing about the underlying pages is re-rendered, re-compressed, or converted to images. Scans stay as scans, vector diagrams stay as vector, and the file grows only by the bytes the added text itself needs.",
  },
];

const scenarios = [
  {
    h: "Official and legal submissions",
    p: "Court bundles, tender responses and government filings routinely require the document title and filing date on every page so nothing goes missing. Type the case name in header-center and \"{date}\" in footer-right and the whole file is compliant in one pass.",
  },
  {
    h: "Company reports and client proposals",
    p: "A quarterly report or a client deck reads far more polished when the company or document name sits quietly at the top of every page and page numbers sit at the bottom. Combine \"Acme Q3 Report\" in the header-center with \"Page {page} of {total}\" in the footer-center and the document immediately looks accountably produced.",
  },
  {
    h: "Class notes, handouts and printed course packs",
    p: "Handouts get printed, stapled loosely, and shuffled between students. Labelling every page with the module title and date turns a stack that would otherwise be indistinguishable into a self-identifying resource that finds its way back to its owner.",
  },
  {
    h: "Version-tracking drafts before final review",
    p: "Drafts circulate faster than they get renamed and reviewers frequently end up commenting on last week's version. Stamping \"Draft, {date}\" in the header-right on every page makes the vintage of the file visible at a glance without having to open its properties.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I add a header or footer to a PDF for free?",
    a: "Open this page, click Select PDF file and pick the document. Type into any of the six slots in the sidebar, Header-Left, Header-Center, Header-Right, Footer-Left, Footer-Center, Footer-Right, and drop {page}, {total}, {date} or {filename} tokens in via the chips beneath each row. Set font size, colour, margin and page range, then hit Add Header & Footer. A stamped copy downloads to your device with a -stamped suffix on the filename.",
    plain:
      "Click Select PDF file, type into any of the six slots (Header-Left/Center/Right, Footer-Left/Center/Right), insert {page}, {total}, {date} or {filename} tokens via the chips, set font size, colour, margin and page range, then hit Add Header & Footer. A stamped copy downloads with a -stamped suffix.",
  },
  {
    q: "Can I add page numbers in the footer?",
    a: (
      <>
        Yes, the classic recipe is to type "Page {"{page}"} of {"{total}"}" into
        Footer-Center (or any footer slot you prefer). The tool substitutes the
        actual page number and total on each page when it saves the file. If page
        numbering is the only thing you want and you'd rather use a dedicated
        control for six preset positions, the{" "}
        <Link to="/tools/$slug" params={{ slug: "page-numbers" }} className="text-[#e5322d] underline">
          Page Numbers
        </Link>{" "}
        tool is the more focused option.
      </>
    ),
    plain:
      "Yes. Type \"Page {page} of {total}\" into a footer slot (usually Footer-Center) and the tool substitutes the real values per page. If you only need numbering with six preset positions, the Page Numbers tool (/tools/page-numbers) is more focused.",
  },
  {
    q: "Can I add today's date automatically?",
    a: "Yes. Drop the {date} token into any slot and it resolves to today's date in DD/MM/YYYY format at the moment you click Add Header & Footer, every stamped page carries the same date. If you want a fixed literal date instead (say a report cover date that shouldn't drift), just type the date as plain text and skip the token.",
    plain:
      "Yes. The {date} token resolves to today's date in DD/MM/YYYY format when you click Add Header & Footer. For a fixed literal date, type it as plain text instead of using the token.",
  },
  {
    q: "Can I put different text on the left, center and right?",
    a: "Yes, that's exactly what the six-slot layout is for. Header and Footer each expose three independent inputs labelled Left, Center and Right, so you can put a document title in Header-Center, a version marker in Header-Right, and page numbers in Footer-Center all at the same time. Any slot you leave empty is simply not stamped.",
    plain:
      "Yes. Header and Footer each have three independent inputs, Left, Center and Right, so you can stamp different text in each of the six positions simultaneously. Empty slots are skipped.",
  },
  {
    q: "Can I add the filename to every page?",
    a: "Yes. Put the {filename} token in any slot and it resolves to the source file's name without the .pdf extension on every stamped page. This is useful for course packs, legal bundles or any workflow where a page might get separated from the file it came from.",
    plain:
      "Yes. Insert the {filename} token in any slot; it resolves to the source file's name (without .pdf) on every stamped page.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, previewed and re-saved with the added headers and footers entirely inside your browser tab, using standard Web APIs, nothing is sent to us or to any third party during the process. You can even disconnect from the internet after the page has loaded and the stamping will still complete.",
    plain:
      "No. The PDF is opened, previewed and re-saved with headers and footers entirely inside your browser tab. Nothing is uploaded, and the tool keeps working offline once the page has loaded.",
  },
  {
    q: "Can I style the header/footer text?",
    a: "Yes, but the controls are intentionally simple: pick a font size from 6 to 72 points (default 10) and a colour from the sidebar colour picker (default is a soft grey #666666). The typeface itself is fixed to the standard Helvetica included in every PDF viewer, no bold, italic or custom font selection today. This keeps output consistent across every device that opens the file.",
    plain:
      "Yes but the controls are intentionally simple: font size 6-72pt (default 10) and a colour picker (default #666666 grey). Typeface is fixed to standard Helvetica, no bold, italic or custom fonts today.",
  },
  {
    q: "Will it overlap my page content?",
    a: "The stamps sit in the page margin at the distance you pick, Small is 18 points from the edge, Normal is 28, Big is 44, so on typical documents they land in the whitespace above and below the body text. Content that reaches the very edge of the page (edge-to-edge scans, artwork, tightly typeset pages) can overlap, which is why the live preview shows the exact placement on any page you navigate to before you save. Switch to Big margin or move the text to a less crowded slot if the preview shows a clash.",
    plain:
      "Stamps sit in the page margin at your chosen distance (Small 18pt, Normal 28pt, Big 44pt), which lands in the whitespace on typical documents. Edge-to-edge content can overlap; the live preview shows the exact placement so you can switch to Big margin or a less crowded slot before saving.",
  },
  {
    q: "Can I apply a header to only some pages?",
    a: "Yes. Under Pages in the sidebar, switch from All pages to Page range and type the pages you want stamped, the field accepts single numbers and ranges separated by commas, so 2-10 stamps pages 2 through 10, 1,3,5-9 stamps page 1, page 3 and pages 5 through 9, and 2-100 lets you skip a cover page. Pages outside the range keep their original appearance untouched.",
    plain:
      "Yes. Switch Pages from All pages to Page range and type numbers and ranges separated by commas, e.g. 2-10, or 1,3,5-9, or 2-100 to skip a cover page. Pages outside the range are left untouched.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Acrobat's header-and-footer feature lives behind its paid tier; this tool does the same work in the browser with no download, no subscription and no watermark on the output. The stamped PDF opens correctly in Acrobat Reader, Preview, Chrome, Edge, Foxit or any other PDF viewer.",
    plain:
      "No. Acrobat's header-and-footer feature is behind a paid tier; this tool does the same work in the browser with no download, no subscription and no watermark. Output opens in every major PDF viewer.",
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

      {/* Four benefits */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When do you need headers and footers on a PDF?
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

export const headerFooterFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
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
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com Header & Footer (web browser)" }],
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
  name: "pdftoolconverteronline.com Add Header & Footer",
  description:
    "Add headers and footers to PDF online free, six slots (header and footer × left/center/right), smart tokens for page number, total, date and filename, colour, margin and page-range controls. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
