import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the upload area. Your PDF opens directly in your browser without being sent to any external server.",
  },
  {
    title: "Step 2: Select Pages to Rotate",
    text: "Choose whether to rotate all pages in the document or select specific individual pages to rotate. You can rotate different pages by different amounts, for example, rotating pages 3 and 7 by 90 degrees while leaving all other pages unchanged.",
  },
  {
    title: "Step 3: Choose Rotation Direction",
    text: "Select the rotation angle. Rotate 90 degrees clockwise to fix a page that is tilted to the left. Rotate 90 degrees counter-clockwise to fix a page tilted to the right. Rotate 180 degrees to flip an upside-down page to the correct reading orientation.",
  },
  {
    title: "Step 4: Download the Rotated PDF",
    text: "Click the rotate button and download your corrected PDF. The rotation is permanently saved in the file; viewers do not need to manually rotate pages when opening the document. All content, fonts, images, and links are preserved exactly.",
  },
];

const faqs = [
  {
    q: "Can I rotate just one page and leave others unchanged?",
    a: "Yes. Turn off the all-pages option, select the required page thumbnails, and apply the rotation.",
  },
  {
    q: "What rotation angles are available?",
    a: "You can add 90, 180, or 270 degrees clockwise to the existing page rotation. A 270-degree clockwise turn is equivalent to a 90-degree counter-clockwise turn.",
  },
  {
    q: "Can I rotate all pages at once?",
    a: "Yes. Enable the all-pages option to apply the chosen rotation to every page.",
  },
  {
    q: "Will rotating affect image quality or text in the PDF?",
    a: "The tool updates each targeted page's rotation value rather than rendering the page as an image. It does not intentionally recompress page content.",
  },
  {
    q: "Will the file size change after rotation?",
    a: "It can. The PDF is saved again, so its size may change even though the operation does not intentionally recompress page images.",
  },
  {
    q: "Can I rotate a password-protected PDF?",
    a: "Unlock an authorized copy first, rotate its pages, and protect the result again if needed.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine rotated PDFs together" },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange after rotating" },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove unwanted pages" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce size after rotating" },
  { to: "/tools/split", name: "Split PDF", blurb: "Separate after rotating" },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before rotating" },
  { to: "/image-tools/rotate-image", name: "Rotate Image", blurb: "Fix image orientation before PDF" },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Convert rotated images to PDF" },
] as const;

export function RotatePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to Rotate PDF Pages Online: Step by Step</h2>
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

      <h2>Rotation Angles Explained</h2>
      <h2>Rotate 90 Degrees Clockwise</h2>
      <p>
        Turns each selected page a quarter turn to the right. Use this when a page is oriented with text running bottom-to-top (rotated 90 degrees counter-clockwise from correct orientation). After a 90-degree clockwise rotation, the page returns to the standard reading position.
      </p>
      <h2>Rotate 90 Degrees Counter-Clockwise</h2>
      <p>
        Turns each selected page a quarter turn to the left. Use this when a page is oriented with text running top-to-bottom on its side (rotated 90 degrees clockwise from correct orientation). This is common with landscape documents scanned or photographed in portrait mode.
      </p>
      <h2>Rotate 180 Degrees</h2>
      <p>
        Flips the page completely upside down. Use this when a page is fully inverted, text appears upside down from the reader's perspective. Scanning a document with the paper inserted upside down into the scanner is a common cause of this issue.
      </p>

      <h2>Rotate Entire Document vs Rotate Individual Pages</h2>
      <p>
        Rotating the entire document applies the same rotation angle to every page simultaneously. This is the right choice when all pages in the document have the same incorrect orientation, for example, a scanned document where every page was fed into the scanner sideways. One click corrects all pages at once.
      </p>
      <p>
        Rotating individual pages gives you precise control over specific pages that need correction while leaving all other pages unchanged. This is necessary when a document has mixed orientations, perhaps pages 1-5 are correctly oriented in portrait but page 6 contains a landscape chart that should be rotated 90 degrees for proper viewing.
      </p>
      <p>
        Our tool supports both modes. You can select all pages or choose specific pages to rotate. For documents with complex mixed orientations, you can make multiple passes, rotating one set of pages first, then another set, until all pages are correctly oriented.
      </p>

      <h2>Tips for Rotating PDF Pages Effectively</h2>
      <h2>Preview Before Downloading</h2>
      <p>
        Use the page thumbnail previews to verify each page is in the correct orientation before downloading. This saves you from needing to re-upload and rotate again.
      </p>
      <h2>Rotate Before Merging</h2>
      <p>
        If you are combining PDFs from different sources, rotate each document to the correct orientation first, then merge them. This produces a cleanly consistent final document. You can use our <Link to="/tools/$slug" params={{ slug: "merge" }} className="text-[#E5322D] hover:underline">Merge PDF tool</Link> once the pages are fixed.
      </p>
      <h2>Combine With Reorder Pages for Full Control</h2>
      <p>
        For complex documents with mixed orientations and inconsistent page order, use our <Link to="/tools/$slug" params={{ slug: "reorder-pages" }} className="text-[#E5322D] hover:underline">Reorder Pages tool</Link> to rearrange the page sequence after rotating, giving you complete control over the final document structure.
      </p>
      <h2>Fix Orientation Before Compressing</h2>
      <p>
        Rotating does not affect file size. However, if you need to compress the PDF after rotating, run the corrected file through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#E5322D] hover:underline">Compress PDF tool</Link> to reduce file size without affecting the fixed orientation.
      </p>
      <h2>Rotate Images Before Converting to PDF</h2>
      <p>
        If you are converting images to PDF and some images have incorrect orientation, fixing them before conversion gives you more precise control over each image orientation before it becomes a PDF page. Try our <Link to="/tools/$slug" params={{ slug: "images-to-pdf" }} className="text-[#E5322D] hover:underline">Images to PDF tool</Link>.
      </p>

      <h2>Frequently Asked Questions About Rotating PDFs</h2>
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

      <h2 className="mt-16">Related PDF Tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const rotateFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const rotateHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to rotate a PDF online for free",
  description: "Fix upside-down or sideways pages in any PDF instantly. Rotate individual pages or the entire document by 90, 180, or 270 degrees.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const rotateSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Rotate PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
