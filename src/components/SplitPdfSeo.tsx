import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange before splitting." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before splitting." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert separators before splitting." },
] as const;

const steps = [
  {
    "title": "Select one PDF",
    "text": "Select a PDF or drag it into the upload area. Wait for the page count and thumbnails to load."
  },
  {
    "title": "Choose the split method",
    "text": "Use custom ranges for one output per range, every-page mode for one PDF per page, or select pages to combine your selection into one PDF."
  },
  {
    "title": "Check the selection",
    "text": "Use page numbers starting at 1. Keep range endpoints within the document and put the start before or equal to the end."
  },
  {
    "title": "Split and download",
    "text": "Run the split operation, then download the output files. For multiple outputs you can use the ZIP download option."
  }
];

const faqs = [
  {
    "q": "Can I split by page range?",
    "a": "Yes. Add start and end page numbers for each output range. Each valid range creates a separate PDF."
  },
  {
    "q": "Can I extract a single page?",
    "a": "Yes. Select that page in selected-pages mode or enter a range with the same start and end number."
  },
  {
    "q": "In what order are selected pages saved?",
    "a": "Selected-pages mode combines your selection into one PDF in ascending source-page order."
  },
  {
    "q": "How do I download several outputs?",
    "a": "Use the individual download controls or the ZIP download option for multiple outputs."
  },
  {
    "q": "Why is splitting disabled?",
    "a": "Check for invalid or incomplete ranges. In selected-pages mode, choose at least one page. In every-page mode, wait for the page count to load."
  },
  {
    "q": "Does splitting compress the pages?",
    "a": "No. The tool copies pages into new PDFs rather than rasterizing or recompressing them. Check document-level features and links after splitting."
  }
];

export function SplitPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to split a PDF online for free</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6">
          {steps.map((step, i) => (
            <li key={step.title} id={`step-${i + 1}`}>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Three split methods</h2>
        <p className="mt-3 leading-relaxed">Ranges create separate PDFs for each start and end pair. Every-page mode creates a PDF for each source page. Selected pages are saved together in ascending source-page order.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Range messages</h2>
        <p className="mt-3 leading-relaxed">Enter both page numbers means a range is incomplete. Pages start at 1 rejects zero or negative numbers. A page-count error means an endpoint exceeds the document. Fix invalid ranges or select at least one page to continue.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">What is copied</h2>
        <p className="mt-3 leading-relaxed">Pages are copied into new PDF documents without rasterizing or recompressing the page images. Do not assume document-level bookmarks, forms, or links to omitted pages will remain functional; check the output.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Limits and protected files</h2>
        <p className="mt-3 leading-relaxed">Process one PDF at a time. Unlock protected PDFs before splitting. Large documents and many output files depend on available device memory.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Related tools</h2>
        <RelatedToolsGrid items={related} />
      </section>
    </section>
  );
}

export const splitFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const splitHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to split a PDF online for free",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `/tools/$slug#step-${i + 1}`,
    params: { slug: "split" },
  })),
};

export const splitSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Split PDF",
  description: "Split PDF online free, separate pages or extract page ranges in your browser with no upload, no signup and no watermark.",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
