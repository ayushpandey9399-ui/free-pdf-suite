import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const scanToPdfRelated = [
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim margins and adjust the visible area of pages." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
] as const;

const steps = [
  {
    "title": "Open the camera or add photos",
    "text": "Tap Open Camera and allow camera access, or upload existing photos. Capture each page and remove unwanted thumbnails before continuing."
  },
  {
    "title": "Review and arrange pages",
    "text": "Tap Done after capture. Reorder thumbnails and open the page editor to crop, rotate, straighten, remove shadows, or adjust brightness and contrast."
  },
  {
    "title": "Create the PDF",
    "text": "Choose Document, Grayscale, Black & White, or Original, then A4, Letter, or Fit. Choose output quality and press Create PDF, then download."
  }
];

const faqs = [
  {
    "q": "Why does the camera not open?",
    "a": "Check browser camera permission and that a camera is available. The tool also offers phone-camera and photo-upload fallbacks when live capture is unavailable."
  },
  {
    "q": "Can I combine multiple scans into one PDF?",
    "a": "Yes. Capture or add several pages, remove unwanted shots, and reorder the thumbnails before creating one PDF."
  },
  {
    "q": "Can I fix a crooked or shadowed photo?",
    "a": "Open its page editor to crop, rotate, straighten, toggle shadow removal, and adjust brightness and contrast. These adjustments do not guarantee a readable result from a blurred photo."
  },
  {
    "q": "Can I search text in a scanned PDF?",
    "a": "Enable the optional OCR setting before export. It adds recognized text to the page images. It works best on clear printed English text; check the result for recognition errors."
  },
  {
    "q": "Are my scan images uploaded?",
    "a": "No. Image processing and OCR run in your browser. OCR assets are downloaded when needed, but your captured pages are not uploaded."
  },
  {
    "q": "How can I make the PDF smaller?",
    "a": "Choose a lower output quality before creating the PDF. This reduces image detail as well as file size. For a large document, try smaller batches if your device runs out of memory."
  }
];

export function ScanToPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to scan a document to PDF with your phone</h2>
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
        <h2 className="text-2xl font-bold">Page cleanup</h2>
        <p className="mt-3 leading-relaxed">Straightening crops the rotated image to avoid blank corners. Shadow removal and adaptive Black & White filtering can help unevenly lit pages, but cannot recover missing or blurred text.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Searchable PDF (OCR, beta)</h2>
        <p className="mt-3 leading-relaxed">Enable OCR before creating the PDF to add a text layer to the scanned images. OCR runs locally and needs engine assets and a font to load. Recognition can make mistakes; review important text. If the engine fails to load, the tool exports without OCR.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Scan quality and limits</h2>
        <p className="mt-3 leading-relaxed">Use even light and hold the camera parallel to the paper. Output quality affects image detail and file size. Large batches depend on device memory; use fewer pages or a lower quality setting if export fails.</p>
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
        <RelatedToolsGrid items={scanToPdfRelated} />
      </section>
    </section>
  );
}

export const scanToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const scanToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to scan a document to PDF with your phone",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
  })),
};

export const scanToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Scan to PDF",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
