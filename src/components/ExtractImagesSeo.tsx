import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const extractImagesRelated = [
  { to: "/tools/$slug", params: { slug: "pdf-to-images" }, name: "PDF to Image", blurb: "Convert entire PDF pages to JPG or PNG." },
  { to: "/tools/$slug", params: { slug: "images-to-pdf" }, name: "Images to PDF", blurb: "Combine images into a single PDF." },
  { to: "/image-tools/$slug", params: { slug: "compress-image" }, name: "Compress Image", blurb: "Reduce image file size after extraction." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine multiple PDFs before extracting." },
  { to: "/tools/$slug", params: { slug: "extract-pages" }, name: "Extract Pages", blurb: "Pull out specific pages from a PDF." },
  { to: "/image-tools/$slug", params: { slug: "crop-image" }, name: "Crop Image", blurb: "Trim extracted images to the exact area." },
  { to: "/image-tools/$slug", params: { slug: "image-resize" }, name: "Resize Image", blurb: "Change dimensions of extracted images." },
  { to: "/tools/$slug", params: { slug: "unlock-pdf" }, name: "Unlock PDF", blurb: "Remove password before extracting images." },
] as const;

const steps = [
  {
    title: "Step 1: Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the page. Your file opens directly in your browser and is not uploaded to any server.",
  },
  {
    title: "Step 2: Wait for Supported Image Extraction",
    text: "Scanning starts after you select a file. The tool examines embedded image streams locally and lists the supported images it can extract. Processing time depends on the file and your device.",
  },
  {
    title: "Step 3: Preview and Select Images",
    text: "After extraction, you will see thumbnails of every image found in the PDF. Select individual images you need, or choose to download all of them at once.",
  },
  {
    title: "Step 4: Download Your Images",
    text: "Download individual images one by one, or get all extracted images as a single ZIP file. Supported encoded streams are exported as JPG or JP2; supported pixel data is converted to PNG. Unsupported formats may be skipped.",
  },
];

const faqs = [
  {
    "q": "What image formats are exported?",
    "a": "Supported JPEG streams are exported as JPG and JPEG 2000 streams as JP2. Supported raw or Flate-compressed grayscale and RGB pixel data is converted to PNG. Not every PDF image encoding or color space is supported."
  },
  {
    "q": "Will extraction preserve the original image file?",
    "a": "Not always. Some encoded image streams can be copied, while supported pixel data is converted to PNG. The tool does not guarantee the original source format, transparency, or identical appearance for every PDF."
  },
  {
    "q": "Can I choose which images to download?",
    "a": "Yes. After scanning, select images in the grid and use Download selected. One selected image downloads directly; multiple selected images are packaged in a ZIP."
  },
  {
    "q": "Why are some graphics missing?",
    "a": "Text and vector drawings are not embedded raster images. Unsupported image encodings or color spaces may also be skipped. To capture the full page appearance, use PDF to Image instead."
  },
  {
    "q": "Can I extract images from a scanned PDF?",
    "a": "If the scan is stored as a supported image stream, it can be extracted. A full-page scan may be one image; the tool does not separate photos or diagrams within that scan."
  },
  {
    "q": "Can I extract from password-protected PDFs?",
    "a": "Unlock the PDF first. Free to use. Large PDFs and extracted image collections depend on your device memory."
  }
];

export function ExtractImagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <div>
        
        <h2>How to Extract Images from a PDF: Step by Step</h2>
        <div className="mt-5 space-y-4 not-prose">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm" aria-label={`Step ${i + 1}`}>
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-[15px] font-semibold text-[#33333c]">{s.title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2>Extraction limits and troubleshooting</h2>
        <p>This tool extracts supported embedded raster image streams, not text or vector drawings. Unsupported encodings and color spaces may be skipped. Use PDF to Image when you need a picture of a complete page.</p>
        <p>A scanned page may be stored as one large image. Extraction does not isolate individual photos within it. A repeated image resource is extracted once rather than once per appearance.</p>
        <p>If no images are found, the PDF may contain only text, vector content, or unsupported image streams. Password-protected PDFs must be unlocked first. Large files and extracted images depend on device memory.</p>

        <h2>Frequently Asked Questions About Extracting PDF Images</h2>
      </div>

      <div className="mt-8 divide-y divide-[#eee]">
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
        Related PDF and Image Tools
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
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    name: s.title,
    text: s.text,
    url: `https://pdftoolconverteronline.com/tools/extract-images#step-${i + 1}`,
  })),
};

export const extractImagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Extract Images",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
