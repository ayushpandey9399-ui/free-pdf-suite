import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1 — Upload Your Images",
    text: "Click the \"Select images\" button or drag and drop your image files onto the upload area. You can add multiple images at once — JPG, PNG, WebP, and other common formats are all supported. All processing happens locally in your browser.",
  },
  {
    title: "Step 2 — Arrange the Image Order",
    text: "After uploading, drag and drop the image thumbnails to set the order they will appear in the PDF. The first image in the list becomes page one of the PDF, the second becomes page two, and so on. Take a moment to confirm the order is correct before proceeding.",
  },
  {
    title: "Step 3 — Set Page Options",
    text: "Choose the page size (A4 is standard for most uses), orientation (portrait or landscape), and margin settings. You can choose to fit each image to fill the entire page or maintain the original image proportions with white margins.",
  },
  {
    title: "Step 4 — Convert and Download",
    text: "Click the \"Convert to PDF\" button. Your images are combined into a single PDF document entirely within your browser. Download the finished PDF instantly. The output file has no watermarks and is ready to share, print, or submit immediately.",
  },
];

const faqs = [
  {
    q: "How do I convert images to PDF for free?",
    a: "Upload your images using the button or drag-and-drop above, arrange them in order, set your page options, and click Convert to PDF. Download your finished file instantly. No signup required.",
  },
  {
    q: "Which image formats are supported?",
    a: "JPG, JPEG, PNG, WebP, BMP, and TIFF are all supported. For HEIC images from iPhones, first convert to JPG using our HEIC to JPG tool.",
  },
  {
    q: "Can I combine multiple images into one PDF?",
    a: "Yes. Add as many images as you need and they will all be combined into a single multi-page PDF, one image per page.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire conversion process runs in your browser. Your images never leave your device.",
  },
  {
    q: "Is there a limit on how many images I can add?",
    a: "No. Add as many images as you need. The only constraint is your device memory.",
  },
  {
    q: "Can I set the page size and orientation?",
    a: "Yes. Choose A4, Letter, or fit-to-image page size and portrait or landscape orientation before converting.",
  },
  {
    q: "Will the image quality be reduced in the PDF?",
    a: "No. Images are embedded at their original resolution. No compression or quality reduction is applied during conversion.",
  },
  {
    q: "Can I convert PNG files with transparent backgrounds?",
    a: "Yes. Transparent areas in PNG images are rendered with a white background in the PDF output.",
  },
  {
    q: "Can I rearrange the image order before converting?",
    a: "Yes. Drag and drop the image thumbnails to set the exact order you want before generating the PDF.",
  },
  {
    q: "Can I convert a single image to PDF?",
    a: "Yes. Upload a single image to create a one-page PDF.",
  },
  {
    q: "Does this work on mobile phones?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. No app required.",
  },
  {
    q: "Can I convert HEIC photos from my iPhone?",
    a: "Use our HEIC to JPG tool first to convert iPhone HEIC photos to JPG, then add the JPG files to the image to PDF converter.",
  },
  {
    q: "Does this work offline?",
    a: "Yes. Once the page has fully loaded, the conversion tool works without an internet connection.",
  },
  {
    q: "Are there watermarks on the output PDF?",
    a: "No. The output PDF is completely clean with no watermarks or branding.",
  },
  {
    q: "Is the tool really free with no limits?",
    a: "Yes. No usage caps, no daily limits, no signup required, no watermarks.",
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
      <h2>Why Convert Images to PDF?</h2>
      <p>
        Images and PDFs serve very different purposes. A JPG or PNG file is ideal for viewing a single photo, but it becomes inconvenient when you have ten scanned pages, fifteen product photos, or twenty document screenshots that need to be shared as one organized file. Sending twenty separate image files via email creates confusion, takes up more space, and makes it hard for the recipient to view them in the correct order. Converting them all into a single PDF solves every one of these problems.
      </p>
      <p>
        PDF is the universal document format accepted by almost every platform, portal, and application in the world. Government portals, university submission systems, HR onboarding platforms, and client portals typically accept PDF uploads but not raw image files. If you have scanned a multi-page form using your phone's camera, converting the individual page photos into a single PDF is the only way to submit the complete document correctly.
      </p>
      <p>
        PDF files are also far more professional than sending image files directly. A product catalog built from multiple product photographs looks far more polished when delivered as a PDF than as a ZIP file of JPGs. A photography portfolio shared as a PDF can be opened on any device without special software. A set of scanned receipts submitted to an accountant as a single PDF is much easier to review than a folder of separate images.
      </p>
      <p>
        Converting images to PDF also offers better control over the final document. You can set the page size (A4, Letter, or custom), choose the orientation (portrait or landscape), control the margins, and arrange the images in any order before generating the PDF. This level of control is not possible when simply sharing raw image files.
      </p>

      <h2>How to Convert Images to PDF — Step by Step</h2>
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
        For HEIC images from iPhones and newer Apple devices, first convert them to JPG or PNG using our <Link to="/image-tools/heic-to-jpg" className="text-[#E5322D] hover:underline">HEIC to JPG tool</Link>, then add the converted images to the PDF converter. This two-step process handles the full workflow from iPhone photos to a finished PDF.
      </p>

      <h2>Common Scenarios for Converting Images to PDF</h2>
      <h3>Scan Multi-Page Documents With Your Phone</h3>
      <p>
        Modern phone scanning apps like Google Drive's scan feature and Apple's Notes scanner capture each page as a separate image. Converting all these page images into a single PDF recreates the original multi-page document in the standard format expected by submission portals, email recipients, and archiving systems.
      </p>
      <h3>Submit ID Documents and Proofs Online</h3>
      <p>
        Many platforms require identity verification, address proof, and income documents uploaded as PDFs. If you have photos of your passport, utility bill, and bank statement as separate JPG files, converting them into a single PDF makes the submission process faster and cleaner.
      </p>
      <h3>Create a Photo Portfolio or Lookbook</h3>
      <p>
        Photographers, designers, and artists can convert a curated selection of images into a professional PDF portfolio. Each image occupies a full page, the order is exactly as you set it, and the result is a document that looks polished on any screen or when printed.
      </p>
      <h3>Build a Product Catalog From Photos</h3>
      <p>
        E-commerce sellers and small businesses can convert product photographs into a catalog PDF. Each product gets its own page, the catalog can be emailed to buyers, and it opens correctly on any device without requiring specific software.
      </p>
      <h3>Combine Scanned Receipts for Expense Reports</h3>
      <p>
        Photographing receipts throughout the month and then converting all the photos into a single PDF at the end of the month creates a clean expense report attachment. Accountants and finance teams prefer one organized PDF over a folder of individual receipt photos.
      </p>
      <h3>Convert Screenshots Into a Reference Document</h3>
      <p>
        Researchers, developers, and students who collect screenshots of reference material, error messages, or online content can convert them into a searchable, shareable PDF document. This is much easier to review and share than a collection of separate screenshot files.
      </p>
      <h3>Prepare Medical or Insurance Documents</h3>
      <p>
        Photographed prescriptions, test results, doctor letters, and insurance claim forms can be combined into a single PDF for easy submission to insurance providers, hospitals, or pharmacies that require document uploads in PDF format.
      </p>
      <h3>Create PDF Albums From Event Photos</h3>
      <p>
        Wedding photographers, event planners, and families can convert a selection of event photos into a beautifully organized PDF album that can be shared via email or printed without any specialized album software.
      </p>

      <h2>Page Size and Layout Options Explained</h2>
      <h3>A4 Page Size</h3>
      <p>
        A4 (210 × 297mm) is the international standard page size used in most countries outside North America. It is the default choice for official documents, reports, applications, and business correspondence. Use A4 when submitting documents to government portals, universities, or international clients.
      </p>
      <h3>Letter Page Size</h3>
      <p>
        Letter (8.5 × 11 inches) is the standard page size in the United States and Canada. Use Letter format when creating documents for US-based submission portals, US clients, or US printing requirements.
      </p>
      <h3>Fit Image to Page</h3>
      <p>
        This option scales each image to fill the entire page area edge-to-edge. This is ideal for photographs, product images, and portfolio images where you want maximum visual impact and no white margins.
      </p>
      <h3>Maintain Image Proportions With Margins</h3>
      <p>
        This option places each image centered on the page while maintaining its original aspect ratio, with white margins around it. This is better for documents with images of varying dimensions, where consistent centering looks more professional than edge-to-edge fills.
      </p>

      <h2>Browser-Based vs Server-Based Image to PDF Conversion</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 border border-gray-200 text-[#383E45]">Feature</th>
              <th className="p-3 border border-gray-200 font-semibold text-[#E5322D]">Our Tool</th>
              <th className="p-3 border border-gray-200 text-[#383E45]">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody className="text-[#383E45]">
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Privacy</td>
              <td className="p-3 border border-gray-200">Files stay on device</td>
              <td className="p-3 border border-gray-200">Files uploaded to server</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Speed</td>
              <td className="p-3 border border-gray-200">Instant</td>
              <td className="p-3 border border-gray-200">Upload/download delay</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Size Limit</td>
              <td className="p-3 border border-gray-200">No limit</td>
              <td className="p-3 border border-gray-200">Often 20-50MB cap</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Number of Images</td>
              <td className="p-3 border border-gray-200">No limit</td>
              <td className="p-3 border border-gray-200">Sometimes capped</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Works Offline</td>
              <td className="p-3 border border-gray-200">Yes after page loads</td>
              <td className="p-3 border border-gray-200">No</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Account Required</td>
              <td className="p-3 border border-gray-200">No</td>
              <td className="p-3 border border-gray-200">Sometimes yes</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Watermarks</td>
              <td className="p-3 border border-gray-200">Never</td>
              <td className="p-3 border border-gray-200">Common on free tier</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Output Quality</td>
              <td className="p-3 border border-gray-200">Original resolution</td>
              <td className="p-3 border border-gray-200">Sometimes compressed</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Cost</td>
              <td className="p-3 border border-gray-200">Always free</td>
              <td className="p-3 border border-gray-200">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Tips for Converting Images to PDF Effectively</h2>
      <h3>Sort and Name Files Before Uploading</h3>
      <p>
        Rename your image files in the correct order before uploading (e.g., 01_page.jpg, 02_page.jpg) so they appear in the right sequence. This is especially helpful when working with many scanned pages.
      </p>
      <h3>Rotate Images Before Converting</h3>
      <p>
        If any images are sideways or upside down, use our <Link to="/image-tools/rotate-image" className="text-[#E5322D] hover:underline">Rotate Image tool</Link> to fix their orientation before converting to PDF. This gives you cleaner results than trying to rotate PDF pages after conversion.
      </p>
      <h3>Compress the PDF After Converting</h3>
      <p>
        If your images are high-resolution photographs, the resulting PDF may be large. Run it through our <Link to="/tools/compress" className="text-[#E5322D] hover:underline">Compress PDF tool</Link> after conversion to reduce the file size without noticeable quality loss.
      </p>
      <h3>Convert HEIC to JPG First</h3>
      <p>
        iPhone photos saved as HEIC files need to be converted to JPG or PNG before adding them to the PDF converter. Use our <Link to="/image-tools/heic-to-jpg" className="text-[#E5322D] hover:underline">HEIC to JPG tool</Link> to batch convert them first.
      </p>
      <h3>Use Consistent Page Size for Professional Results</h3>
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2340",
  },
};
