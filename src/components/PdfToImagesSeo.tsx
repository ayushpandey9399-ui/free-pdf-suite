import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your PDF onto the upload area. The file opens directly in your browser without being sent to any external server. There is no file size or page count limit.",
  },
  {
    title: "Step 2: Choose Output Format",
    text: "Select whether you want the output images as JPG (best for photographs, colorful pages, and documents with images) or PNG (best for documents with text, logos, and graphics that require sharp edges and transparent backgrounds). JPG produces smaller files while PNG preserves sharper edges on text and line art.",
  },
  {
    title: "Step 3: Set Image Quality",
    text: "Choose the image resolution and quality level. Higher quality settings produce sharper images with larger file sizes. Low (72 DPI) is enough for previews, Medium (150 DPI) suits screens and sharing, and High (300 DPI) is recommended when images will be printed or used in professional presentations.",
  },
  {
    title: "Step 4: Convert and Download",
    text: "Click the convert button. Each page of the PDF is rendered as a separate image file. Download individual pages as needed, or download all images at once as a single ZIP archive. All images are clean with no watermarks.",
  },
];

const faqs = [
  {
    q: "Can I convert only selected pages?",
    a: "Yes. Select the pages you want in the page-selection interface before converting.",
  },
  {
    q: "Should I choose JPG or PNG?",
    a: "JPG uses lossy compression and is often suitable for photos. PNG avoids JPEG compression artifacts and can be useful for text, diagrams, and screenshots.",
  },
  {
    q: "What resolutions are available?",
    a: "Low renders at 72 DPI, Medium at 150 DPI, and High at 300 DPI. Medium is the default. Higher resolution uses more memory and produces larger images.",
  },
  {
    q: "Can I download all converted pages together?",
    a: "Yes. The tool supports a ZIP download and individual image downloads.",
  },
  {
    q: "Can I convert several PDFs at once?",
    a: "No. This tool processes one PDF at a time. Large documents and high-resolution output depend on available device memory.",
  },
];

const related = [
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Extract embedded images from PDF" },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Convert images back to PDF" },
  { to: "/tools/split", name: "Split PDF", blurb: "Separate pages before converting" },
  { to: "/image-tools/compress-image", name: "Compress Image", blurb: "Reduce image file size after converting" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix page orientation before converting" },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine PDFs before converting" },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before converting" },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to grayscale before exporting" },
] as const;

export function PdfToImagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to Convert PDF to JPG Online: Step by Step</h2>
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

      <h2>JPG vs PNG: Which Format Should You Choose?</h2>
      <p>
        JPG (JPEG) and PNG are both excellent output formats for PDF conversion, but they serve different purposes best. JPG uses lossy compression that reduces file size by slightly approximating colors and details that the human eye cannot easily distinguish. The result is a much smaller file that looks nearly identical to the original for most viewing purposes. JPG is the right choice when file size matters and the document contains photographs, gradients, or colorful graphics.
      </p>
      <p>
        PNG uses lossless compression, meaning every pixel of the image is stored exactly as it appears with no approximation. PNG files are larger than JPG files but preserve perfectly sharp edges on text, logos, diagrams, and line art. When you convert a PDF page containing crisp black text on a white background to PNG, the text remains perfectly sharp at any zoom level. The same conversion to JPG may show very slight softening around the edges of characters at high zoom.
      </p>
      <p>
        For most everyday uses, sharing documents via email or messaging, posting to social media, inserting into presentations, JPG quality is completely sufficient and the smaller file size makes it more convenient. For professional print work, archival purposes, or situations where the image will be further edited, PNG is the better choice.
      </p>
      <p>
        PNG also supports transparent backgrounds, which JPG does not. If a PDF page has a transparent background and you need the resulting image to maintain transparency (for example, to overlay it on another design), PNG is the only correct choice. JPG will fill any transparent area with white.
      </p>

      <h2>What Quality Level Should You Choose?</h2>
      <h2>Low Quality (72 DPI)</h2>
      <p>
        Low gives the smallest files. An A4 page comes out at about 595 x 842 pixels, which is fine for a quick preview or a thumbnail but small text can be hard to read when zoomed in.
      </p>
      <h2>Medium Quality (150 DPI, default)</h2>
      <p>
        Medium is the default and produces noticeably sharper images, about 1240 x 1754 pixels for an A4 page. This setting is ideal when images will be inserted into presentations, used in documents that will be printed at standard paper sizes, or displayed on high-resolution screens. File sizes are larger but the additional clarity is visible especially in text-heavy documents.
      </p>
      <h2>High Quality (300 DPI)</h2>
      <p>
        High renders images at print resolution, the standard for professional printing. Use this setting when images will be printed at large sizes, used in professional print designs, or submitted to print services. File sizes are significantly larger but image clarity is preserved at the highest level.
      </p>

      <h2>Tips for Converting PDFs to Images Effectively</h2>
      <h2>Choose the Right Output Format for Your Use Case</h2>
      <p>
        Use JPG for photographs, colorful reports, and most sharing purposes where file size matters. Use PNG for text-heavy documents, diagrams, logos, and situations where you need perfectly sharp edges.
      </p>
      <h2>Convert Only the Pages You Need</h2>
      <p>
        If you only need specific pages from a large PDF, first use our <Link to="/tools/$slug" params={{ slug: "split" }} className="text-[#E5322D] hover:underline">Split PDF tool</Link> to extract those pages as a separate PDF, then convert just that smaller file. This is faster and gives you only the images you actually need.
      </p>
      <h2>Compress Images After Converting</h2>
      <p>
        High-quality PDF to JPG conversion can produce large image files. If you need to share them via email or messaging, use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#E5322D] hover:underline">Compress Image tool</Link> to reduce the file size while maintaining acceptable visual quality.
      </p>
      <h2>Rotate Pages Before Converting</h2>
      <p>
        If some PDF pages are in the wrong orientation, use our <Link to="/tools/$slug" params={{ slug: "rotate" }} className="text-[#E5322D] hover:underline">Rotate PDF tool</Link> to fix the orientation first. The converted JPG images will then be in the correct orientation without needing a separate image rotation step.
      </p>
      <h2>Use PNG for Images You Will Further Edit</h2>
      <p>
        If you plan to edit the converted images in Photoshop, GIMP, Canva, or another design tool, use PNG output rather than JPG. PNG preserves more detail and does not degrade further when re-saved after editing. JPG files lose a small amount of quality each time they are saved, which accumulates over multiple edits.
      </p>

      <h2>Frequently Asked Questions About Converting PDF to JPG</h2>
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

export const pdfToImagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pdfToImagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to JPG online for free",
  description: "Turn every page of your PDF into a high-quality JPG or PNG image instantly in your browser. Download images individually or as a ZIP file.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const pdfToImagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter PDF to JPG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
