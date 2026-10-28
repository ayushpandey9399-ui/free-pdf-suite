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



const faqs = [
  {
    "q": "What changes does comparison detect?",
    "a": "The tool compares extracted page text. It does not compare image pixels. A changed logo, color, or graphic may not be flagged if the text is unchanged."
  },
  {
    "q": "Does Text Diff show changed words?",
    "a": "Yes. Text Diff compares extracted text, highlighting additions and removals. It does not compare formatting or images."
  },
  {
    "q": "Can I compare PDFs with different page counts?",
    "a": "Yes. The summary compares the overlapping page range, and the visual view marks additional pages as present in only one document."
  },
  {
    "q": "Can I compare scanned PDFs?",
    "a": "Scans need an existing text layer for text comparison. The tool does not perform OCR, so empty text layers do not prove two scans are identical."
  },
  {
    "q": "Are the PDFs uploaded?",
    "a": "No. File reading, page rendering, and text comparison run in your browser. Free to use. Very large files depend on your device memory."
  }
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

      {/* Spot what changed */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note about how comparison works
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Visual Compare works at the page level: it reads each page&rsquo;s text layer
        and flags the page as different if the extracted text no longer matches its
        counterpart in the other file. That reliably catches edited sentences,
        changed numbers, renamed parties and inserted or removed paragraphs.
        Purely visual changes that do not touch the text, a repositioned logo, a
        recoloured shape, will not turn a page red on their own. For a
        word-by-word view of the actual edits, switch to Text Diff, which
        highlights every added and removed word across both documents. Scanned
        PDFs need a text layer (from OCR) to be comparable, pure image scans
        can be reported as matching despite different images.
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
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Compare PDFs (web browser)" }],
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
  name: "PDFToolConverter Compare PDFs",
  description:
    "Compare two PDF files online free, spot every changed page side by side and get a word-level Text Diff, entirely in the browser. No upload. Large files depend on device memory.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
