import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Select your PDF",
    text: "Click Select PDF file or drag one PDF onto the page. Every page appears as a numbered thumbnail.",
  },
  {
    title: "Place the blank pages",
    text: "Tap the round plus button on the left edge of a thumbnail to insert a blank page before that page. Use the side panel to add one at the end or one after every page. Remove a pending blank with its X button.",
  },
  {
    title: "Pick the page size",
    text: "Choose Match previous to copy the size of the page before each blank, or A4 to make every blank page A4.",
  },
  {
    title: "Add and download",
    text: "Check the page numbers under each thumbnail, then click Add Blank Pages and download the new PDF.",
  },
];


const faqs = [
  {
    "q": "Can I add several blank pages in one go?",
    "a": "Yes. Click a plus button repeatedly to insert several blanks in the same position, or use the side panel to add one blank after every original page."
  },
  {
    "q": "Where can I insert a blank page?",
    "a": "Use the plus button on a thumbnail to insert before that page, including the first. Use Add blank page at end to append a blank."
  },
  {
    "q": "Will adding blank pages update printed page numbers?",
    "a": "No. Existing page content is not renumbered. The thumbnail numbers show positions in the output, not numbers printed inside the document."
  },
  {
    "q": "What size will the blank pages be?",
    "a": "Choose Match previous or A4 portrait. Match previous uses the preceding original page, or the first original page for blanks at the beginning."
  },
  {
    "q": "Can I add blanks to a password-protected PDF?",
    "a": "Not directly. Unlock the PDF first, then add the blank pages."
  },
  {
    "q": "What limits should I expect?",
    "a": "One PDF is processed at a time. Free to use. Very large files depend on your device memory, and drawing many thumbnails can be slow."
  }
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Save any selection of pages as a new PDF file." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce the file size of your PDF while keeping quality." },
] as const;

export function AddBlankPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2 className="text-center">
        How to add blank pages to a PDF online
      </h2>
      <ol className="mt-8 space-y-6 max-w-2xl mx-auto">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm" aria-label={`Step ${i + 1}`}>
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[16px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>


      <h2 className="text-center">
        Checking the page order before you download
      </h2>
      <div className="mt-6 max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p>
          The number under each thumbnail is that page&apos;s position in the finished file, and it updates as you add or remove blanks. A blank inserted with the plus button on page 3 becomes the new page 3, and your old page 3 moves to page 4.
        </p>
        <p>
          For double-sided printing, count the total. If a chapter must start on a right-hand (odd) page, the page before it needs an even number. Insert a blank just before the chapter opener when it would otherwise land on the back of a sheet.
        </p>
      </div>

      <h2 className="text-center">
        Troubleshooting
      </h2>
      <div className="mt-6 max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p><strong>The blank page is in the wrong place.</strong> The plus button inserts before the page it sits on, not after. If you are already on the download screen, start again with the result file and use Delete Pages or Reorder Pages to adjust it.</p>
        <p><strong>The Add button is greyed out.</strong> No blank pages are pending yet. Add at least one first.</p>
        <p><strong>The thumbnails never appear or an error shows.</strong> The file may be damaged or not a real PDF. Try opening and re-saving it in a PDF viewer, then load it again.</p>
        <p><strong>The download did not start.</strong> Some browsers, especially on iPhone, block downloads or open the PDF in a new tab. Allow downloads for this site, check your Downloads folder, or tap Download PDF again.</p>
      </div>

      <h2 className="text-center">
        Limitations and privacy
      </h2>
      <ul className="mt-6 max-w-3xl mx-auto list-disc pl-5 space-y-2 text-[15px] leading-relaxed text-[#4a4a55]">
        <li>One PDF at a time. To add blanks across several files, merge them first.</li>
        <li>Blank pages are fully empty: no lines, header or page number.</li>
        <li>Page size choices are Match previous or A4 only.</li>
        <li>Password-protected PDFs must be unlocked first.</li>
        <li>Processing happens in your browser; your PDF is not uploaded.</li>
      </ul>

      <h2 className="text-center">
        Frequently asked questions
      </h2>
      <div className="mt-8 divide-y divide-[#eee] max-w-3xl mx-auto not-prose">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary>
              {f.q}
              <span className="ml-4 text-[#e5322d] text-xl">+</span>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="text-center">
        Related PDF tools
      </h2>
      <div className="mt-8">
        <RelatedToolsGrid items={related} />
      </div>
    </section>
  );
}

export const addBlankPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const addBlankPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add blank pages to a PDF online",
  description: "Insert empty pages before any page or at the end of your PDF, in your browser.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const addBlankPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Add Blank Pages",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};