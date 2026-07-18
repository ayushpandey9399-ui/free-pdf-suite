import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the source PDF in the browser",
    text: "Drop the file onto the workspace or click Select PDF file. The document opens locally, and every page appears as a clickable thumbnail in the main panel, nothing is uploaded to reach this view.",
  },
  {
    title: "Click the thumbnails of the pages you want to keep",
    text: "Every thumbnail is a toggle. Pick page 4, jump down and pick page 12, then scroll back and add page 2, the order of clicking doesn't matter, only which pages end up marked. The sidebar shows a live 3 of 48 selected counter so you can see the pull growing as you work.",
  },
  {
    title: "Confirm the pull",
    text: "The action button relabels itself to Extract 3 pages (or whatever the current count is) so it's obvious what you're about to commit. Uncheck anything you added by mistake, the source document has not been touched yet.",
  },
  {
    title: "Click Extract pages and save the new PDF",
    text: "The tool assembles the picked pages into a fresh document and offers it as a download with an -extracted.pdf suffix. The pages inside the new file are ordered by page number, and the original PDF on disk is left exactly as it was.",
  },
];

const benefits = [
  {
    h: "Any pages, any order",
    p: "The thumbnail grid is a free-form multi-select, grab a single page, a tidy range like 5 through 9, or a scattered pull like 2, 7 and 15. The output PDF contains exactly those pages, sorted by page number so the result stays predictable to read.",
  },
  {
    h: "Exact copies, full quality",
    p: "The chosen pages are lifted straight out of the source with pdf-lib, so their fonts, embedded images and vector artwork travel across at their original resolution. There is no re-render and no re-compression anywhere in the extracted output.",
  },
  {
    h: "Original stays intact",
    p: "You receive a brand-new PDF; the file you opened is never written to. If you decide later that you wanted page 8 as well, just reopen the same source and pick again, nothing you did to build the excerpt costs you the master document.",
  },
  {
    h: "Instant, even from huge files",
    p: "Pulling three pages out of a 500-page manual takes seconds because the work happens on your own device. Larger sources just mean more thumbnails to scroll through, not a longer processing wait or a slower download.",
  },
];

const scenarios = [
  {
    h: "Submitting one specific page for verification",
    p: "A landlord asks for the salary-credit line in a bank statement, a school asks for the marks page of a mark sheet, a visa office asks for a single certificate out of a bundle. Open the file, click that one thumbnail, extract, and send a one-page PDF, nothing else attached, nothing else revealed.",
  },
  {
    h: "Pulling a chapter from study material",
    p: "Textbooks and coaching PDFs often ship as huge bundles where the group only needs to read one chapter this week. Click the thumbnails that cover pages 84 through 106, extract them into a small PDF, and share that on the class group instead of the full 900-page file.",
  },
  {
    h: "Building an excerpt for a meeting",
    p: "A 60-page quarterly report is too much to circulate before a 20-minute review, but four pages of it really matter, the summary, the revenue chart, the risk section and the ask. Pick just those pages, extract, and send a focused four-page brief that attendees will actually open.",
  },
  {
    h: "Collecting scattered pages from a scanned bundle",
    p: "When you scan every receipt for a reimbursement into one big PDF, the pages that matter for a specific claim are almost always non-consecutive, pages 3, 9 and 22, say. Click those three thumbnails in any order and extract a single clean PDF that contains only the receipts backing that claim.",
  },
];

const faqs = [
  {
    q: "How do I extract pages from a PDF for free?",
    a: "Open this page, click Select PDF file and choose your document, then click the thumbnail of every page you want to keep. The sidebar shows a live selection counter as you work. When the picks are ready, click Extract pages and a new PDF containing only those pages downloads to your device, no account, no card, no watermark on the output.",
  },
  {
    q: "Can I extract just one page from a PDF?",
    a: "Yes. Click exactly one thumbnail, the button will label itself Extract 1 page, and the tool produces a single-page PDF that is a byte-for-byte copy of that page from the source. This is the fastest way to save one page of a PDF as a separate file without opening any desktop software.",
  },
  {
    q: "Can I extract non-consecutive pages like 2, 7 and 15?",
    a: "Yes. Selection is free-form: click page 2, scroll down and click page 7, keep scrolling and click page 15. The order in which you click doesn't matter, and the pages don't have to be next to each other. In the extracted PDF they appear in numeric order, page 2 first, then page 7, then page 15, as a single three-page document.",
  },
  {
    q: "Will the extracted pages keep their quality?",
    a: "Yes. Each picked page is copied through untouched, the same fonts, the same embedded images at their original resolution, the same vector shapes. There is no re-render and no re-compression, so a scanned page at 300 dpi stays at 300 dpi and a text page keeps its selectable, searchable text.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, its thumbnails rendered and the new document assembled entirely inside your browser tab using pdf-lib. There is no network request for the actual processing, so the source file, the pages you skipped and the extracted output never reach our servers.",
  },
  {
    q: "Does the original PDF change?",
    a: "No. The tool only reads from the file you opened; it never writes back to it. The extracted pages arrive as a separate download named with an -extracted.pdf suffix, and the source PDF on your disk remains exactly as it was, same bytes, same modification time.",
  },
  {
    q: "Can I extract pages from a scanned PDF?",
    a: "Yes. Scanned PDFs are simply image pages wrapped in a PDF container, and this tool treats every page the same way, a thumbnail you can click to include. The picked scans move across at their original resolution, so the extracted PDF looks identical to those pages inside the source bundle.",
  },
  {
    q: "What's the difference between extracting and splitting?",
    a: "Extracting means picking the pages you want and putting them into one new PDF, you decide precisely which pages, in any combination. Splitting means dividing the whole document into several smaller PDFs by range or every-N-pages, every page ends up somewhere. If you only want a subset, use extract; if you want to break the file into parts and keep everything, use Split PDF.",
  },
  {
    q: "Can I extract pages on my phone?",
    a: "Yes. The workspace runs in mobile browsers the same way it does on desktop, tap the thumbnails you want, watch the selection counter update in the sidebar, tap Extract pages and the new PDF saves into your phone's downloads. There is no app to install and nothing to sign up for.",
  },
  {
    q: "Do I need Adobe Acrobat or an account?",
    a: "No. Adobe Acrobat's page-extraction feature sits behind the paid Acrobat Pro plan, and most online alternatives ask you to sign up or watermark the result. This page needs neither, it works entirely in-browser, is free, and the output PDF is clean.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
] as const;

export function ExtractPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to extract pages from a PDF online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
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

      {/* Save one page, or any pages */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Save one page, or any pages, as a new PDF
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The most common ask is a single page: pull page 47 out of a 300-page bank
        statement so a landlord only sees the credit line and nothing else on the
        account. The workflow scales up the same way, grab three certificate pages
        from a scanned document bundle, or a scattered pull like pages 2, 7 and 15
        from a longer report. Selection is entirely visual, so you don't have to
        translate what you need into a range string. The extracted pages are exact
        copies of the originals, arranged in ascending page order inside the new PDF
        so the result reads exactly as expected.
      </p>

      {/* Share only what's needed */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Share only what's needed, nothing more
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Extraction is the polite version of privacy. When somebody asks for one
        salary slip, they don't need your full nine-month statement; when a
        recruiter asks for the certificate page, they don't need the entire scanned
        folder it lives inside. Sending the whole PDF because it was easier to
        forward hands over information nobody asked for and nobody should be
        reading.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Because this tool runs inside your browser tab, the full source document
        never leaves your device either, pdf-lib opens the file, renders the
        thumbnails and writes the extracted PDF locally, so the pages you skipped
        are never seen by anyone. The end result is double privacy: the recipient
        sees only the pages that matter, and no server in the middle saw anything
        at all.
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
        When do you need to extract PDF pages?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">
              {s.p}
            </p>
          </div>
        ))}
      </div>

      {/* Comparison */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Extract Pages vs Split PDF vs Delete Pages, which one do you need?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The three tools sit close together but solve different problems. Pick by the
        shape of what you want to end up with:
      </p>
      <div className="mt-5 overflow-hidden rounded-lg border border-[#eee]">
        <table className="w-full text-left text-[14.5px]">
          <thead className="bg-[#fef6f5] text-[13.5px] font-semibold text-[#33333c]">
            <tr>
              <th className="px-4 py-3">Tool</th>
              <th className="px-4 py-3">Use when you want to…</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee] text-[#4a4a55]">
            <tr>
              <td className="px-4 py-3 font-semibold text-[#33333c]">Extract Pages</td>
              <td className="px-4 py-3">Pick the pages you WANT and get one new PDF with just those pages.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold text-[#33333c]">
                <Link to="/tools/split" className="text-[#e5322d] underline">Split PDF</Link>
              </td>
              <td className="px-4 py-3">Divide the whole document into parts or ranges, every page ends up in some output.</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-semibold text-[#33333c]">
                <Link to="/tools/delete-pages" className="text-[#e5322d] underline">Delete Pages</Link>
              </td>
              <td className="px-4 py-3">Remove the pages you DON'T want and keep the rest inside one cleaned PDF.</td>
            </tr>
          </tbody>
        </table>
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

export const extractPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const extractPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to extract pages from a PDF online for free",
  description:
    "Save specific pages from a PDF as a new PDF, entirely inside your browser, click thumbnails to pick any pages in any combination and download an extracted copy. The original file is not modified and never leaves your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF you want to extract pages from" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub Extract Pages (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/extract-pages#step-${i + 1}`,
  })),
};

export const extractPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Extract Pages",
  description:
    "Extract pages from PDF online free, pick any pages in any combination from a thumbnail grid and save them as a new PDF. Runs entirely in the browser, no upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
