import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your PDF onto the upload area. Your file is processed in your browser and is never uploaded to any external server. There is no fixed size cap; very large files depend on your device memory.",
  },
  {
    title: "Step 2: Choose Your Compression Level",
    text: "Select from three compression presets depending on how small you need the file to be. Less Compression keeps higher JPEG quality with a moderate size reduction. Recommended balances quality and file size for most everyday uses. Extreme Compression uses the lowest image scale and JPEG quality with some visible reduction in image sharpness.",
  },
  {
    title: "Step 3: Compress the PDF",
    text: "Click the \"Compress PDF\" button. The compression runs entirely in your browser using local processing. No internet upload is required after the page loads. Processing time depends on page count, page dimensions, and your device.",
  },
  {
    title: "Step 4: Download the Compressed File",
    text: "Once compression is complete, the tool shows you how much the file size was reduced. Click the download button to save the smaller PDF to your device. The compressed file is ready to email, upload, or share immediately.",
  },
];

const faqs = [
  {
    "q": "How much smaller will my PDF become?",
    "a": "There is no guaranteed reduction. The tool compares a page-image version, a compact rewrite, and the original, then keeps the smallest candidate. Already optimized files may stay the same size."
  },
  {
    "q": "Will the result still contain searchable text?",
    "a": "Only if the compact rewrite or original is retained. The image method renders every page as a JPEG, so text in that output cannot be selected, searched, or copied. The result screen identifies the method used."
  },
  {
    "q": "What do the compression presets change?",
    "a": "Less Compression renders at scale 1.5 with JPEG quality 0.9. Recommended uses scale 1.2 and quality 0.7. Extreme uses scale 1 and quality 0.5. These settings affect the page-image candidate, not a guaranteed reduction percentage."
  },
  {
    "q": "Why is my PDF still too large?",
    "a": "The original may already be compact. Try Extreme, but inspect the output for softer text and images. The tool cannot guarantee a particular upload size."
  },
  {
    "q": "Can I compress a password-protected PDF?",
    "a": "Unlock it first. The compressor stops when it detects a password-protected file."
  },
  {
    "q": "Can I compress several PDFs at once?",
    "a": "The tool processes one PDF at a time. Free to use. Very large files depend on your device memory and may be slow or fail."
  }
];

const related = [
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim margins and adjust the visible area of pages." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
] as const;

export function CompressPdfSeo() {
  return (
    <section className="seo-content mx-auto max-w-4xl px-4 pb-16">
      <h2>How to Compress a PDF Online: Step by Step</h2>
      <div className="mt-8 space-y-6">
        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 1">1</span>
          <div>
            <h3 className="text-lg font-bold text-[#383E45]">Step 1: Upload Your PDF</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Click the "Select PDF file" button or drag and drop your PDF onto the upload area. Your file is processed in
              your browser and is never uploaded to any external server. There is no fixed size cap; very large files depend on your device memory.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 2">2</span>
          <div>
            <h3 className="text-lg font-bold text-[#383E45]">Step 2: Choose Your Compression Level</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Select from three compression presets depending on how small you need the file to be. Less Compression keeps
              higher JPEG quality with a moderate size reduction. Recommended balances quality and file size for most
              everyday uses. Extreme Compression uses the lowest image scale and JPEG quality with some visible reduction in
              image sharpness.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 3">3</span>
          <div>
            <h3 className="text-lg font-bold text-[#383E45]">Step 3: Compress the PDF</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Click the "Compress PDF" button. The compression runs entirely in your browser using local processing. No
              internet upload is required after the page loads. Processing typically takes two to ten seconds depending on
              the original file size and the power of your device.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 4">4</span>
          <div>
            <h3 className="text-lg font-bold text-[#383E45]">Step 4: Download the Compressed File</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Once compression is complete, the tool shows you how much the file size was reduced. Click the download button
              to save the smaller PDF to your device. The compressed file is ready to email, upload, or share immediately.
            </p>
          </div>
        </div>
      </div>

      <h2>Compression limits and output checks</h2>
      <p>Reduction depends on the source PDF. The tool keeps the smallest of the original, a compact rewrite, and a page-image version. No reduction percentage or target file size is guaranteed.</p>
      <p>The image method redraws pages at about 108 DPI for Less, 86 DPI for Recommended, or 72 DPI for Extreme. It can soften text and images and removes selectable text. Check the method shown on the result screen and inspect the downloaded PDF.</p>
      <p>Password-protected files must be unlocked first. Processing time and memory use grow with the number and size of pages.</p>

      <h2>Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between items-center text-[15.5px] font-semibold text-[#383E45]">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#6B7280]">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <h2>Related PDF tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const compressFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const compressHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress a PDF online for free",
  description: "Reduce your PDF file size in your browser. Choose a compression level, see the size saved, and download the smaller copy.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `https://pdftoolconverteronline.com/tools/compress#step-${i + 1}`,
  })),
};

export const compressSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Compress PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
