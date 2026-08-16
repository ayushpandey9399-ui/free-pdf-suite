import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const extractImagesRelated = [
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Extract selectable text and download it as .txt." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/scan-to-pdf", name: "Scan to PDF", blurb: "Use your camera to scan pages straight into a PDF." },
] as const;

const steps = [
  {
    title: "Upload your PDF",
    text: "Drop your PDF on the drop zone above, or tap Select PDF file. Everything happens in your browser, nothing is uploaded.",
  },
  {
    title: "Wait for the scan",
    text: "Wait a moment while the tool scans every embedded image. Progress shows as 'Scanning image X of Y…'.",
  },
  {
    title: "Pick your images",
    text: "Every image found appears in a preview grid. Use Select all / Deselect all or click individual thumbnails to pick exactly what you want.",
  },
  {
    title: "Extract and Download",
    text: "Press Extract Images. A single pick downloads as one image file; multiple picks come out as a ZIP archive.",
  },
];

const benefits = [
  {
    h: "Full original quality",
    p: "Images come out at their embedded resolution, often several times larger than what you see rendered on screen. JPEGs are copied byte-for-byte with no re-encoding, so there is zero quality loss.",
  },
  {
    h: "Everything found at once",
    p: "The scanner sweeps every page in a single pass and lists every extractable image, sorted by page. No page-by-page hunting or right-click 'save as' repeated dozens of times.",
  },
  {
    h: "Pick what you need",
    p: "Every thumbnail in the preview grid is a toggle. A live counter reads 'X of Y selected' so you know exactly what you're about to download.",
  },
  {
    h: "Scanned PDF support",
    p: "A scan is a bundle of full-page image streams. Each scanned page comes out as one high-resolution picture file, ideal for archiving or reprinting.",
  },
];

const scenarios = [
  {
    h: "Recovering lost originals",
    p: "Old school projects, wedding albums shared as PDF, annual reports whose source files are long gone—the pictures still live inside the PDF at their real resolution.",
  },
  {
    h: "Reusing charts and diagrams",
    p: "Need the same photo or figure that appeared in a brief? Extract it once at full quality instead of screenshotting the PDF viewer.",
  },
  {
    h: "Unpacking a scan bundle",
    p: "Someone scanned a stack of family photos into a single PDF. Extracting turns that file back into individual image files you can rename and tag.",
  },
];

const faqs = [
  {
    q: "How do I extract images from a PDF for free?",
    a: "Open this page, drop your PDF, wait for the scan to finish, pick the images you want in the preview grid, and press Extract Images. One selection downloads as an image file; multiple selections come out as a ZIP. No signup, no upload, no watermark.",
  },
  {
    q: "Will the images be full quality?",
    a: "Yes. JPEG-embedded images are copied byte-for-byte with zero re-encoding, so quality is identical to the original file the author embedded. Raw pixel images are exported as lossless PNG.",
  },
  {
    q: "What is the difference between this and PDF to Image?",
    a: "This tool pulls out the ORIGINAL embedded photos. PDF to Image renders whole pages (text, layout, images together) as one flat picture per page. Use this for photos, use PDF to Image for full-page snapshots.",
  },
  {
    q: "Why did no images come out of my PDF?",
    a: "The document probably contains only text or vector graphics. Charts, diagrams, and logos built from lines and shapes are drawing instructions, not embedded image files, so there is nothing to extract.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is parsed entirely in your browser tab using client-side JavaScript. No file, image or metadata is transmitted anywhere, keeping your data 100% private.",
  },
];

export function ExtractImagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to extract images from a PDF online for free
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Need to pull original high-resolution photos or figures out of a PDF document? 
        Our browser-based extractor scans the file internals to find embedded image streams.
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
        Get the original photos, not screenshots
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        When a photo is placed into a PDF, the original image file is embedded whole inside the document. 
        This tool walks the PDF's internals, finds those embedded image streams and hands them back 
        exactly as they were embedded: full resolution, no recompression, and no page borders. 
        It's perfect for reclaiming high-quality assets from reports, brochures, or ebooks.
      </p>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why use pdftoolconverteronline.com to extract PDF images?
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Common scenarios for image extraction
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

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
      <RelatedToolsGrid items={extractImagesRelated} />
    </section>
  );
}


export const extractImagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const extractImagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to extract images from a PDF online for free",
  step: [
    { "@type": "HowToStep", name: "Upload the PDF", text: "Drop your PDF on the drop zone or tap Select PDF file. Processing runs entirely in your browser." },
    { "@type": "HowToStep", name: "Wait for the scan", text: "The tool scans every embedded image in the document and reports progress as it goes." },
    { "@type": "HowToStep", name: "Pick your images", text: "Every extracted image appears in a preview grid. Use Select all / Deselect all or click thumbnails to pick individually." },
    { "@type": "HowToStep", name: "Download", text: "Press Extract Images. One selection downloads as a single image file; multiple come out as a ZIP archive." },
  ],
};

export const extractImagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Extract Images",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
