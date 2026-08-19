import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the two PDFs you want to compare",
    text: "Drop the original into the left slot and the revised copy into the right slot, or use the two Select PDF file buttons. Both documents open locally in your browser tab, nothing about either file is transmitted to reach this view.",
  },
  {
    title: "Wait for the pages to be analysed",
    text: "The tool walks through each PDF page by page and pulls out its text layer, updating a live Comparing… (X of Y pages) counter as it goes. Analysis runs three pages at a time and does not block the interface, you can start scrolling the side-by-side view immediately.",
  },
  {
    title: "Read the verdict and open Visual Compare",
    text: "Once every page has been examined, the header switches from the progress spinner to a clear summary like 4 of 32 overlapping pages differ. In Visual Compare mode, both documents render page-by-page next to each other with a red Differences detected banner above every page that changed.",
  },
  {
    title: "Switch to Text Diff for the word-level view",
    text: "Click the Text Diff tab to see the extracted text of both PDFs merged into a single word-level diff, added text in green, removed text in red, unchanged lines in grey. Use it to answer what exactly changed on the pages Visual Compare flagged.",
  },
];

const benefits = [
  {
    h: "Side by side, page by page",
    p: "Both PDFs render together in Visual Compare, page 1 of the original next to page 1 of the revised version, page 2 next to page 2, all the way down. Pages render lazily as you scroll into them, so you can start reviewing before the whole document is drawn.",
  },
  {
    h: "Nothing missed on the pages that changed",
    p: "Comparison reads the real text layer of each page and flags any page whose text no longer matches, a swapped number, a renamed party, an inserted clause, a shifted date. A red Differences detected banner appears above every flagged page so you cannot miss where to look.",
  },
  {
    h: "A clear final verdict",
    p: "As soon as analysis finishes, the header shows a plain-English summary like 4 of 32 overlapping pages differ so you instantly know the shape of the change. Until the last page is analysed the tool shows the honest in-progress counter instead of a misleading zero.",
  },
  {
    h: "Handles big documents smoothly",
    p: "Each page is drawn only when it scrolls into the viewport, and no more than two pages render at once. A 400-page contract behaves like a normal web page in the browser rather than freezing the tab while it processes the whole file up front.",
  },
];

const scenarios = [
  {
    h: "Reviewing a returned contract draft",
    p: "You emailed a draft, the other side sent one back marked 'a few small edits', but which ones? Drop both PDFs into the tool, wait for the analysis and jump straight to the pages that changed instead of re-reading the whole contract clause by clause. It's the perfect PDF difference checker for legal professionals.",
  },
  {
    h: "Checking a revised quotation or invoice",
    p: "A supplier sends a new quote after a call and says only the delivery date moved. Compare the two PDFs to confirm no line item, unit price, tax rate or payment term quietly changed at the same time. This side-by-side comparison tells you at a glance whether the note was accurate.",
  },
  {
    h: "Verifying the final version before signing",
    p: "The approved copy went out for one last formatting pass and came back as final.pdf. Compare it against the approved.pdf you signed off on to make sure the last pass really was cosmetic before you attach a signature, a five-second check that closes a common last-mile mistake.",
  },
  {
    h: "Confirming what a colleague updated",
    p: "A shared report has been re-exported and you want to know what actually moved between your copy and today's version. Comparing the two exports surfaces every changed page and, in Text Diff, the exact wording that shifted, no more chasing 'what changed?' in Slack.",
  },
];

const faqs = [
  {
    q: "How do I compare two PDF files online for free?",
    a: "Open this page, upload the original PDF on the left and the revised PDF on the right, then wait a few seconds while the tool extracts the text of every page. When the header stops saying Comparing… it shows a summary like 4 of 32 pages differ, and the Visual Compare view marks every changed page with a red Differences detected banner. No account, no card, no watermark.",
  },
  {
    q: "Is there a safe way to compare PDF documents online?",
    a: "Yes, our tool is designed for privacy. Unlike other sites, we don't upload your files to a server. The side-by-side comparison and text diffing happen entirely in your browser, ensuring your sensitive contracts and documents stay 100% private.",
  },
  {
    q: "What kinds of changes does the PDF difference checker detect?",
    a: "The comparison reads the actual text layer of each page and flags any page whose text no longer matches the other side. That covers edited sentences, changed numbers, swapped names and dates, inserted or removed paragraphs, and reordered content. Purely visual edits that do not touch the text (like a repositioned logo) are not flagged.",
  },
  {
    q: "Does it show exactly which words changed between the two PDFs?",
    a: "Yes, in Text Diff mode. Visual Compare is the page-level view that shows them side by side. Switch to the Text Diff tab and both PDFs are merged into a single word-level diff, added text highlighted green, removed text highlighted red, and unchanged lines in grey.",
  },
  {
    q: "Can I compare PDFs with different page counts?",
    a: "Yes. If the left PDF has 28 pages and the right has 32, the tool compares pages 1 to 28 as the overlapping range and lists pages 29 to 32 separately as existing only in the second document. The extra pages are still visible in the side-by-side view for review.",
  },
];

const related = [
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Extract selectable text and download it as .txt." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDF files into one." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password so the PDF opens freely." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password to a PDF to secure your documents." },
  { to: "/tools/add-blank-pages", name: "Add Blank Page to PDF", blurb: "Insert a blank page to a PDF at any position." },
  { to: "/tools/extract-images", name: "Extract Images from PDF", blurb: "Pull embedded photos out of a PDF in original quality." },
  { to: "/tools/images-to-pdf", name: "Convert Images to PDF", blurb: "Turn JPG or PNG images into a single PDF document." },
] as const;

export function ComparePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to compare two PDF files online for free
      </h4>
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

      {/* Spot what changed */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Spot what changed between two versions
      </h4>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Someone sends a document back with a note that reads &ldquo;same as before, just
        one small change&rdquo;, and the whole review turns into a hunt for a single
        edit hidden inside dozens of pages. Reading two PDFs in parallel by eye is
        exactly how quiet changes slip through, whether that is a swapped payment
        term, a renamed party or a shifted date. This tool loads both files
        locally, pulls out the text layer of every page and marks every page whose
        text no longer matches its counterpart on the other side. You only review
        the pages that actually changed, and Text Diff mode shows the exact words
        that shifted so you never have to trust a casual &ldquo;small change&rdquo; again.
      </p>

      {/* Privacy */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        The only safe place to compare contracts
      </h4>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The PDFs people most often compare are also the most sensitive ones , 
        contract drafts, non-disclosure agreements, supplier quotations, revised
        salary offers, board resolutions. Uploading two versions to a comparison
        website means the same confidential material is now sitting on someone
        else&rsquo;s server, twice over.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool never sends either PDF anywhere. Both files are opened,
        rendered, text-extracted and diffed entirely inside your browser tab using
        PDF.js and jsdiff, with no upload endpoint on the other end. Once the tool
        code has loaded, you can drop your Wi-Fi and it will still finish the
        comparison, that is the honest test for whether a &ldquo;private&rdquo; tool is
        actually private.
      </p>

      {/* Honest note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note about how comparison works
      </h4>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Visual Compare works at the page level: it reads each page&rsquo;s text layer
        and flags the page as different if the text no longer matches its
        counterpart in the other file. That reliably catches edited sentences,
        changed numbers, renamed parties and inserted or removed paragraphs.
        Purely visual changes that do not touch the text, a repositioned logo, a
        recoloured shape, will not turn a page red on their own. For a
        word-by-word view of the actual edits, switch to Text Diff, which
        highlights every added and removed word across both documents. Scanned
        PDFs need a text layer (from OCR) to be comparable, pure image scans
        will look identical because there is no text to diff.
      </p>

      {/* Four benefits */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h4 className="text-[17px] font-semibold">{b.h}</h4>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When do you need to compare PDFs?
      </h4>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h4 className="text-[17px] font-semibold">{s.h}</h4>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Frequently asked questions
      </h4>
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
      </h4>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const compareFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const compareHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compare two PDF files online for free",
  description:
    "Compare two PDFs page by page inside your browser, upload both files, wait for text-layer analysis, and see every page that changed with a word-level Text Diff option. Nothing is uploaded to a server.",
  totalTime: "PT1M",
  supply: [
    { "@type": "HowToSupply", name: "The original PDF" },
    { "@type": "HowToSupply", name: "The revised PDF to compare against it" },
  ],
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com Compare PDFs (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/compare#step-${i + 1}`,
  })),
};

export const compareSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Compare PDFs",
  description:
    "Compare two PDF files online free, spot every changed page side by side and get a word-level Text Diff, entirely in the browser. No upload, no signup, no page limits.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
