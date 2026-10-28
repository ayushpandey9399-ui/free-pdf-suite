import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your Images",
    text: "Click the \"Select images\" button or drag and drop your image files onto the upload area. You can add multiple images at once; JPG, PNG, WebP, and other common formats are all supported. All processing happens locally in your browser.",
  },
  {
    title: "Step 2: Arrange the Image Order",
    text: "After uploading, drag and drop the image thumbnails to set the order they will appear in the PDF. The first image in the list becomes page one of the PDF, the second becomes page two, and so on. Take a moment to confirm the order is correct before proceeding.",
  },
  {
    title: "Step 3: Set Page Options",
    text: "Choose the page size (A4 is standard for most uses), orientation (portrait or landscape), and margin settings. You can choose to fit each image to fill the entire page or maintain the original image proportions with white margins.",
  },
  {
    title: "Step 4: Convert and Download",
    text: "Click the \"Convert to PDF\" button. Your images are combined into a single PDF document entirely within your browser. Download the finished PDF instantly. The output file has no watermarks and is ready to share, print, or submit immediately.",
  },
];

const faqs = [
  {
    q: "Which images can I convert?",
    a: "JPG and PNG are embedded directly. Other formats require the browser to decode them for a canvas fallback, so support varies. Convert HEIC to JPG first and do not assume TIFF support.",
  },
  {
    q: "Can I reorder or rotate images?",
    a: "Yes. Drag thumbnails to change their order, sort by filename, or rotate individual images before conversion.",
  },
  {
    q: "Which page sizes are available?",
    a: "Choose A4, Letter or fit-to-image. Portrait and landscape affect fixed-size pages; fit-to-image uses each rotated image's dimensions plus the selected margins.",
  },
  {
    q: "Will images be stretched or cropped?",
    a: "The tool scales each rotated image proportionally to fit the available page area and centers it. It does not offer a crop-to-fill mode.",
  },
  {
    q: "Can I create separate PDFs instead of one combined PDF?",
    a: "Yes. Turn off the option to merge all images into one PDF to create separate PDFs packaged in a ZIP file.",
  },
  {
    q: "Are there limits for large batches?",
    a: "The tool is free to use. Large images and batches depend on available device memory, so use a smaller batch if conversion fails.",
  },
];

const related = [
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine your new PDF with others" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce PDF size after converting" },
  { to: "/image-tools/rotate-image", name: "Rotate Image", blurb: "Fix image orientation before converting" },
  { to: "/image-tools/heic-to-jpg", name: "HEIC to JPG", blurb: "Convert iPhone photos first" },
  { to: "/image-tools/image-resize", name: "Resize Image", blurb: "Resize images before converting" },
  { to: "/image-tools/compress-image", name: "Compress Image", blurb: "Reduce image size before converting" },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Add watermark to finished PDF" },
] as const;

export function ImagesToPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to Convert Images to PDF: Step by Step</h2>
      <div className="space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold" aria-label={`Step ${i + 1}`}>
              {i + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Which Image Formats Can Be Converted to PDF?</h2>
      <p>
        Our tool supports all major image formats for PDF conversion. JPG and JPEG are the most common formats for photographs and scanned documents and convert cleanly to PDF at their original resolution. PNG files, which are common for screenshots, logos, and graphics with transparent backgrounds, are also fully supported. Transparent areas in PNG images are rendered with a white background in the PDF output.
      </p>
      <p>
        WebP images, increasingly common as the default format from modern phone cameras and web browsers, convert directly to PDF without needing a separate format conversion step. This saves the extra step of converting WebP to JPG before creating the PDF. BMP and TIFF formats, used in professional scanning workflows and older imaging applications, are also supported.
      </p>
      <p>
        For HEIC images from iPhones and newer Apple devices, first convert them to JPG or PNG using our <Link to="/image-tools/$slug" params={{ slug: "heic-to-jpg" }} className="text-[#E5322D] hover:underline">HEIC to JPG tool</Link>, then add the converted images to the PDF converter. This two-step process handles the full workflow from iPhone photos to a finished PDF.
      </p>

      <h2>Page Size and Layout Options Explained</h2>
      <h2>A4 Page Size</h2>
      <p>
        A4 (210 × 297mm) is the international standard page size used in most countries outside North America. It is the default choice for official documents, reports, applications, and business correspondence. Use A4 when submitting documents to government portals, universities, or international clients.
      </p>
      <h2>Letter Page Size</h2>
      <p>
        Letter (8.5 × 11 inches) is the standard page size in the United States and Canada. Use Letter format when creating documents for US-based submission portals, US clients, or US printing requirements.
      </p>
      <h2>Fit Image to Page</h2>
      <p>
        This option scales each image to fill the entire page area edge-to-edge. This is ideal for photographs, product images, and portfolio images where you want maximum visual impact and no white margins.
      </p>
      <h2>Maintain Image Proportions With Margins</h2>
      <p>
        This option places each image centered on the page while maintaining its original aspect ratio, with white margins around it. This is better for documents with images of varying dimensions, where consistent centering looks more professional than edge-to-edge fills.
      </p>

      <h2>Tips for Converting Images to PDF Effectively</h2>
      <h2>Sort and Name Files Before Uploading</h2>
      <p>
        Rename your image files in the correct order before uploading (e.g., 01_page.jpg, 02_page.jpg) so they appear in the right sequence. This is especially helpful when working with many scanned pages.
      </p>
      <h2>Rotate Images Before Converting</h2>
      <p>
        If any images are sideways or upside down, use our <Link to="/image-tools/$slug" params={{ slug: "rotate-image" }} className="text-[#E5322D] hover:underline">Rotate Image tool</Link> to fix their orientation before converting to PDF. This gives you cleaner results than trying to rotate PDF pages after conversion.
      </p>
      <h2>Compress the PDF After Converting</h2>
      <p>
        If your images are high-resolution photographs, the resulting PDF may be large. Run it through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#E5322D] hover:underline">Compress PDF tool</Link> after conversion to reduce the file size without noticeable quality loss.
      </p>
      <h2>Convert HEIC to JPG First</h2>
      <p>
        iPhone photos saved as HEIC files need to be converted to JPG or PNG before adding them to the PDF converter. Use our <Link to="/image-tools/$slug" params={{ slug: "heic-to-jpg" }} className="text-[#E5322D] hover:underline">HEIC to JPG tool</Link> to batch convert them first.
      </p>
      <h2>Use Consistent Page Size for Professional Results</h2>
      <p>
        For documents intended for professional distribution, choose one page size (A4 or Letter) and stick to it throughout. Mixing page sizes in a single PDF looks inconsistent when printed or viewed in a document viewer.
      </p>

      <h2>Frequently Asked Questions About Converting Images to PDF</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-[#383E45]">
              {f.q}
              <span className="text-[#E5322D] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-16">Related Tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const imagesToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const imagesToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert images to PDF online for free",
  description: "Turn JPG, PNG, WebP, and other image files into a PDF document instantly. Add multiple images, arrange them in order, and download a clean PDF.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const imagesToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Images to PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
