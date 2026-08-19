import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the upload area. Your PDF opens directly in your browser without being sent to any external server.",
  },
  {
    title: "Step 2 — Select Pages to Rotate",
    text: "Choose whether to rotate all pages in the document or select specific individual pages to rotate. You can rotate different pages by different amounts — for example, rotating pages 3 and 7 by 90 degrees while leaving all other pages unchanged.",
  },
  {
    title: "Step 3 — Choose Rotation Direction",
    text: "Select the rotation angle. Rotate 90 degrees clockwise to fix a page that is tilted to the left. Rotate 90 degrees counter-clockwise to fix a page tilted to the right. Rotate 180 degrees to flip an upside-down page to the correct reading orientation.",
  },
  {
    title: "Step 4 — Download the Rotated PDF",
    text: "Click the rotate button and download your corrected PDF. The rotation is permanently saved in the file — viewers do not need to manually rotate pages when opening the document. All content, fonts, images, and links are preserved exactly.",
  },
];

const faqs = [
  {
    q: "How do I rotate a PDF online for free?",
    a: "Upload your PDF above, select which pages to rotate and by how many degrees, and click rotate. Download the corrected PDF instantly. No signup required.",
  },
  {
    q: "Can I rotate just one page and leave others unchanged?",
    a: "Yes. Select specific pages to rotate while keeping all other pages in their current orientation.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire rotation process runs in your browser. Your PDF never leaves your device.",
  },
  {
    q: "Is the rotation permanent?",
    a: "Yes. The rotation is embedded into the PDF file permanently. Anyone who opens the downloaded file sees pages in the correct orientation without needing to manually adjust anything.",
  },
  {
    q: "Can I rotate PDF pages on my phone?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. No app required.",
  },
  {
    q: "Is there a file size limit?",
    a: "No. You can rotate PDFs of any size with no restrictions.",
  },
  {
    q: "Can I rotate all pages at once?",
    a: "Yes. Choose the \"Rotate all pages\" option to apply the same rotation to every page in the document simultaneously.",
  },
  {
    q: "Will rotating affect image quality or text in the PDF?",
    a: "No. Rotation is a structural change that reorients the page. Text, images, and all content are preserved at their original quality.",
  },
  {
    q: "Can I rotate a password-protected PDF?",
    a: "Not directly. First unlock it using our Unlock PDF tool, rotate the pages, then re-protect with our Protect PDF tool if needed.",
  },
  {
    q: "Can I rotate only landscape pages in a mixed document?",
    a: "Yes. Select only the landscape-oriented pages by clicking on their thumbnails and rotate just those.",
  },
  {
    q: "Does this work offline?",
    a: "Yes. Once the page has fully loaded, the rotation tool works without an internet connection.",
  },
  {
    q: "Are there any limits on how many times I can use this tool?",
    a: "No. Rotate as many PDFs as you need with no daily or monthly limits.",
  },
  {
    q: "Will the file size change after rotation?",
    a: "No. Rotating pages does not change the file size since it is a structural change, not a re-encoding.",
  },
  {
    q: "Can I rotate and then reorder pages in one session?",
    a: "Use our Rotate PDF tool first, download the rotated file, then upload it to our Reorder Pages tool to rearrange the page sequence.",
  },
  {
    q: "Will the rotated PDF look different from the original?",
    a: "No. The content, layout, fonts, and images are identical. Only the orientation of the targeted pages is changed.",
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
      <h2>Why Would You Need to Rotate PDF Pages?</h2>
      <p>
        PDF pages end up in the wrong orientation for many common reasons. When you scan a paper document by placing it sideways in a scanner, the resulting PDF has landscape pages where portrait pages were expected. When you photograph a document with a phone held at an angle, the scanned page may appear upside down or rotated by 90 degrees. When PDFs are created from different source files — some in portrait and some in landscape — the combined document can have inconsistent page orientations that make reading awkward.
      </p>
      <p>
        Rotating PDF pages permanently fixes the orientation so viewers always see the correct reading direction without needing to manually rotate their screen or scroll at an angle. This is especially important when sharing documents professionally. A report with sideways pages signals careless preparation. Correcting the orientation before sending shows attention to detail and makes the document easier for recipients to read on all devices.
      </p>
      <p>
        Printing is another major reason to rotate PDF pages. A PDF with mixed portrait and landscape pages will print incorrectly unless each page is manually adjusted. Rotating the pages to the correct orientation before printing ensures that every page comes out properly aligned on paper, reducing wasted prints and reprints.
      </p>
      <p>
        Rotating is also essential when preparing PDFs for formal submissions. Government portals, university systems, legal filing platforms, and employer application systems expect correctly oriented documents. A sideways or upside-down page in a submitted document can cause it to be rejected or create confusion during review.
      </p>

      <h2>How to Rotate PDF Pages Online — Step by Step</h2>
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
        Flips the page completely upside down. Use this when a page is fully inverted — text appears upside down from the reader's perspective. Scanning a document with the paper inserted upside down into the scanner is a common cause of this issue.
      </p>

      <h2>Common Situations Where PDF Rotation Is Needed</h2>
      <h2>Fix Scanned Documents With Wrong Orientation</h2>
      <p>
        Office scanners and phone scanning apps sometimes misread the orientation of a document and save pages sideways or upside down. Rotating the affected pages after scanning corrects the issue without needing to rescan the entire document.
      </p>
      <h2>Correct Mixed Orientation in Combined Documents</h2>
      <p>
        When you merge PDFs created from different sources — some portrait, some landscape — the resulting document often has inconsistent page orientations. Rotating specific pages brings the entire document into a consistent orientation for a professional appearance.
      </p>
      <h2>Fix PDFs Created From Photos</h2>
      <p>
        Photographs taken with a phone often save with incorrect EXIF orientation data, causing the resulting PDF to display the image sideways. Rotating the page corrects the display orientation permanently.
      </p>
      <h2>Prepare Documents for Double-Sided Printing</h2>
      <p>
        Double-sided printing requires careful orientation to ensure that pages on both sides of a sheet are correctly aligned. Rotating specific pages before printing ensures the front and back of each sheet read correctly when the paper is flipped.
      </p>
      <h2>Fix Imported or Downloaded PDF Files</h2>
      <p>
        PDFs downloaded from websites, received via email, or exported from design software sometimes have incorrect default orientations due to software-specific export settings. Rotating the pages corrects these issues without needing the original source file.
      </p>
      <h2>Correct Landscape Charts in Portrait Reports</h2>
      <p>
        Technical and financial reports often contain landscape-oriented charts and tables that need to be read sideways in an otherwise portrait document. If the chart was accidentally embedded in the wrong orientation, rotating that specific page corrects the issue.
      </p>
      <h2>Fix Upside-Down Signatures or Stamps</h2>
      <p>
        Scanned contracts and official documents sometimes have specific pages with signatures, stamps, or seal images that were scanned upside down. Rotating just that page corrects the document without affecting the rest.
      </p>
      <h2>Prepare PDFs for Mobile Reading</h2>
      <p>
        Some PDF documents display correctly on desktop but appear sideways on mobile devices due to how the device handles orientation. Permanently rotating the pages to the correct standard orientation ensures consistent display on all devices.
      </p>

      <h2>Rotate Entire Document vs Rotate Individual Pages</h2>
      <p>
        Rotating the entire document applies the same rotation angle to every page simultaneously. This is the right choice when all pages in the document have the same incorrect orientation — for example, a scanned document where every page was fed into the scanner sideways. One click corrects all pages at once.
      </p>
      <p>
        Rotating individual pages gives you precise control over specific pages that need correction while leaving all other pages unchanged. This is necessary when a document has mixed orientations — perhaps pages 1-5 are correctly oriented in portrait but page 6 contains a landscape chart that should be rotated 90 degrees for proper viewing.
      </p>
      <p>
        Our tool supports both modes. You can select all pages or choose specific pages to rotate. For documents with complex mixed orientations, you can make multiple passes — rotating one set of pages first, then another set — until all pages are correctly oriented.
      </p>

      <h2>Browser-Based vs Server-Based PDF Rotation</h2>
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
              <td className="p-3 border border-gray-200">Often capped</td>
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
              <td className="p-3 border border-gray-200 font-medium">Rotate Individual Pages</td>
              <td className="p-3 border border-gray-200">Yes</td>
              <td className="p-3 border border-gray-200">Sometimes limited</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Cost</td>
              <td className="p-3 border border-gray-200">Always free</td>
              <td className="p-3 border border-gray-200">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1340",
  },
};
