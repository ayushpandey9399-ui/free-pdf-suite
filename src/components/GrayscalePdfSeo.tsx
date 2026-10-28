import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the color PDF you want to convert",
    text: "Click Select PDF file and pick the document. The tool reads it locally with pdf.js, checks that it isn't password-protected, and shows a live side-by-side preview of the first page, the original on the left and the grayscale version on the right, so you can see exactly what the finished file will look like before you commit.",
  },
  {
    title: "Choose an output quality",
    text: "The sidebar offers two settings. High quality re-renders each page at 1.5× the page size and encodes the result as JPEG at 0.85 quality, best fidelity, larger file. Smaller file re-renders at 1.2× and encodes at 0.7, visibly still crisp, noticeably lighter. The grayscale preview updates as you switch, so you're never guessing.",
  },
  {
    title: "Click Convert to Grayscale",
    text: "The tool walks every page in order, redraws it onto an offscreen canvas, applies a true grayscale filter (GPU-accelerated where the browser supports canvas filters, with a manual luminance fallback otherwise), and stitches the results into a fresh PDF with pdf-lib. Progress is reported page-by-page so a long document never looks stalled.",
  },
  {
    title: "Download the black & white copy",
    text: "The success screen shows the before/after file size and, when the conversion also shrank the document, the exact percentage saved. Your download is a standard PDF suffixed -grayscale.pdf. The original file on your disk is untouched, this is a new copy alongside it.",
  },
];

const faqs = [
  {
    q: "How is the grayscale PDF created?",
    a: "Each page is rendered to a canvas, converted to grayscale and encoded as a JPEG image. Those images are placed into a new PDF with the original page dimensions.",
  },
  {
    q: "Can I select or copy text after conversion?",
    a: "The output contains page images rather than the original text layer. This tool does not add OCR, so text is not preserved as selectable PDF text.",
  },
  {
    q: "What do the quality options change?",
    a: "High quality uses a higher rendering scale and JPEG quality than Smaller file. Smaller file trades some detail for a smaller output, but the final size depends on the document.",
  },
  {
    q: "Will grayscale always make my PDF smaller?",
    a: "No. Rasterizing pages can make a PDF larger, especially when the source contains compact text or vector graphics. The result screen shows the original and output sizes.",
  },
  {
    q: "Can I convert only selected pages?",
    a: "No. The conversion processes every page in the selected PDF. There is no page-range option.",
  },
  {
    q: "Can I recover the original colors?",
    a: "Not from the grayscale output with this tool. Keep the original color PDF separately.",
  },
];

const related = [
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim margins and adjust the visible area of pages." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
] as const;

export function GrayscalePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert a PDF to grayscale online for free
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Need to make a PDF black and white to save ink or meet submission requirements? 
        Our online converter renders each page in true grayscale directly in your browser.
      </p>
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

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Save ink, shrink scans, print cleaner
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Color pages drain expensive cartridges even when the color is just a tiny logo or header. 
        Converting to grayscale ensures your printer treats every page as black and white, 
        saving your color ink for documents that actually need it.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Phone-camera scans often have yellow or blue color casts. Grayscaling collapses those 
        into neutral tones, making the document look like it came off a professional scanner.
      </p>

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

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Related PDF tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const grayscalePdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const grayscalePdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert a PDF to grayscale online for free",
  description:
    "Convert a color PDF to grayscale entirely in the browser, every page re-rendered as clean black and white, ready to print, email or upload. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A color PDF" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Grayscale PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/grayscale-pdf#step-${i + 1}`,
  })),
};

export const grayscalePdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Grayscale PDF",
  description:
    "Convert PDF to grayscale online free, every page re-rendered as black and white in your browser. Save printer ink and shrink colorful scans. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
