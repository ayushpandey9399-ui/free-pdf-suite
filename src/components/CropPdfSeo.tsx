import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you want to crop",
    text: "Click Select PDF file and pick your document. The first page renders as a large preview in the workspace, with a red crop box drawn around the full page and eight round handles at every edge and corner ready to be dragged.",
  },
  {
    title: "Drag the crop box to frame what you want to keep",
    text: "Grab any of the eight handles to pull an edge or corner inward, the darkened overlay outside the box shows exactly what will be trimmed. Drag the middle of the box to slide the whole frame around without resizing it. If you prefer precision over dragging, the sidebar exposes Top, Right, Bottom and Left inputs in points (72pt = 1 inch) that stay perfectly in sync with the visual box.",
  },
  {
    title: "Choose all pages or a specific range",
    text: "The Apply to all pages checkbox is on by default, so a single frame in the preview crops the entire document identically. Untick it to reveal a Pages input where you can type ranges like 1-3,5 to crop only selected pages, the rest of the document keeps its original page size.",
  },
  {
    title: "Click Crop PDF and download",
    text: "The tool writes the new page boundaries into the PDF and hands you a your-file-cropped.pdf download. The original file on your device is never overwritten, so you can come back and re-crop it as many times as you like from scratch.",
  },
];



const faqs = [
  {
    "q": "Can I crop all pages at once?",
    "a": "Yes. Apply to all pages is selected by default. The same margin values in points are applied to every page, not a separate crop drawn for each page."
  },
  {
    "q": "Can I crop only selected pages?",
    "a": "Yes. Clear Apply to all pages and enter a range such as 1-3,5. The same margins are applied to the selected pages. Other pages keep their existing boundaries."
  },
  {
    "q": "Does cropping permanently delete hidden content?",
    "a": "No. The tool changes the CropBox, which controls the visible page area. Content outside that area remains in the PDF and may be recovered. Do not use cropping to remove sensitive information."
  },
  {
    "q": "Does cropping reduce image quality?",
    "a": "The tool changes page boundaries without rasterizing or re-encoding page content. It does not change image resolution or convert text into images."
  },
  {
    "q": "What does the preview show?",
    "a": "The preview shows the first page only. Drag its handles or enter Top, Right, Bottom, and Left margins in points. Check the downloaded PDF, especially when pages have different sizes or rotations."
  },
  {
    "q": "Can I undo a crop?",
    "a": "The original file is not overwritten. Reopen the original to choose different margins. A PDF editor that can reset page boundaries may also reveal content hidden in the cropped copy."
  }
];

const related = [
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
] as const;

export function CropPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to crop a PDF online for free
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

      {/* Wasted margins */}
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

export const cropPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const cropPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to crop a PDF online for free",
  description:
    "Crop any PDF entirely in the browser, drag a visual crop box on a live preview, or type exact margins in points, apply to all pages or a page range. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to crop" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Crop PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/crop#step-${i + 1}`,
  })),
};

export const cropPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Crop PDF",
  description:
    "Crop PDF online free, trim white margins and unwanted edges with a visual crop box and live preview, apply to all pages or a page range. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
