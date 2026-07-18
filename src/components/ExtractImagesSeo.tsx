import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";

export function ExtractImagesSeo() {
  return (
    <div className="mx-auto mt-16 max-w-3xl space-y-12 text-[15px] leading-relaxed" style={{ color: "#33333c" }}>

      <BenefitBadges items={["Files never leave your device", "Original embedded images, full quality", "Free, no signup, no watermark"]} />

      <section>
        <h2 className="text-2xl font-bold">How to extract images from a PDF online for free</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6">
          <li>Drop your PDF on the drop zone above, or tap <strong>Select PDF file</strong>. Everything happens in your browser — nothing is uploaded.</li>
          <li>Wait a moment while the tool scans every embedded image. Progress shows as <em>"Scanning image X of Y…"</em>.</li>
          <li>Every image found appears in a preview grid, all selected by default. Use <strong>Select all / Deselect all</strong> or click individual thumbnails to pick exactly what you want.</li>
          <li>Press <strong>Extract Images</strong>. A single pick downloads as one image file; multiple picks come out as a ZIP archive named <code>{`<yourpdf>-images.zip`}</code>.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Get the original photos, not screenshots</h2>
        <p className="mt-3">
          When a photo is placed into a PDF, the original image file is embedded whole inside the document — the PDF just references it and draws it on a page. This tool walks the PDF's internals, finds those embedded image streams and hands them back exactly as they were embedded: full resolution, no recompression on the JPEG side, no page borders wrapped around them. That's fundamentally different from a screenshot or a page render, where the output quality is capped by whatever pixel grid you rendered onto. If what you actually want is whole PAGES saved as pictures (with the text and layout intact), use{" "}
          <Link to="/tools/$slug" params={{ slug: "pdf-to-images" }} className="font-semibold underline" style={{ color: "#e5322d" }}>PDF to Image</Link>{" "}
          instead — it renders each page as a JPG at your chosen DPI.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Private extraction, the whole document stays with you</h2>
        <p className="mt-3">
          To pull one product photo out of a 200-page catalog or one figure out of a confidential report, you shouldn't have to hand the whole document to a stranger's server. This tool parses the file's internal object table right in your browser tab and only reads the image streams it needs. Nothing is transmitted anywhere — no upload, no analytics beacon carrying image data. Once the page has loaded, extraction keeps working even if your network drops.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold">Full original quality</h3>
          <p className="mt-1 text-sm">Images come out at their embedded resolution — often several times larger than what you see rendered on screen. JPEGs are copied byte-for-byte with no re-encoding, so there is zero generational quality loss.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Everything found, at once</h3>
          <p className="mt-1 text-sm">The scanner sweeps every page in a single pass and lists every extractable image, sorted by page then by size. No page-by-page hunting or right-click "save as" repeated dozens of times.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Pick what you need</h3>
          <p className="mt-1 text-sm">Every thumbnail in the preview grid is a toggle — click to deselect the ones you don't want, or use Select all / Deselect all. A live counter reads "X of Y selected" so you know what you're about to download.</p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Works with scanned PDFs too</h3>
          <p className="mt-1 text-sm">A scan is a bundle of full-page image streams — exactly what this tool is built to find. Each scanned page comes out as one high-resolution picture file, ideal for archiving or reprinting.</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">When do you need to extract images from a PDF?</h2>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-bold">Recovering lost originals</h3>
            <p className="mt-1 text-sm">Old school projects, wedding albums a relative shared as a PDF, annual reports whose source files are long gone — the pictures still live inside the PDF and can be pulled back out at their real resolution.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Reusing charts, diagrams and product shots</h3>
            <p className="mt-1 text-sm">Building a presentation or a new document and need the same photo that appeared in a brief? Extract it once at full quality instead of screenshotting the PDF viewer. Respect the source's copyright when you reuse it.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Unpacking a scan bundle</h3>
            <p className="mt-1 text-sm">Someone scanned a stack of family photos or receipts into a single PDF. Extracting turns that one file back into individual image files you can rename, tag and store separately.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Grabbing a logo or graphic from a brochure</h3>
            <p className="mt-1 text-sm">A company sent a brochure PDF and you need their logo at true quality for your own material — extract it directly instead of chasing a design team for the source file.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {extractImagesFaq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold">{f.q}</h3>
              <p className="mt-1 text-sm" style={{ color: "#4a4a55" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Related PDF tools</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
          <li><Link to="/tools/$slug" params={{ slug: "pdf-to-images" }} className="font-semibold underline" style={{ color: "#e5322d" }}>PDF to Image</Link> — render whole pages as pictures instead of pulling embedded photos.</li>
          <li><Link to="/tools/$slug" params={{ slug: "images-to-pdf" }} className="font-semibold underline" style={{ color: "#e5322d" }}>Image to PDF</Link> — rebuild the extracted images into a fresh PDF.</li>
          <li><Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="font-semibold underline" style={{ color: "#e5322d" }}>Extract Pages</Link> — save specific pages of a PDF as a smaller PDF.</li>
          <li><Link to="/tools/$slug" params={{ slug: "compress" }} className="font-semibold underline" style={{ color: "#e5322d" }}>Compress PDF</Link> — shrink an image-heavy PDF for easier sharing.</li>
          <li><Link to="/tools/$slug" params={{ slug: "grayscale-pdf" }} className="font-semibold underline" style={{ color: "#e5322d" }}>Grayscale PDF</Link> — convert the whole document to black &amp; white.</li>
        </ul>
      </section>
    </div>
  );
}

const extractImagesFaq = [
  { q: "How do I extract images from a PDF for free?", a: "Open this page, drop your PDF, wait for the scan to finish, pick the images you want in the preview grid, and press Extract Images. One selection downloads as an image file; multiple selections come out as a ZIP." },
  { q: "Will the images be full quality?", a: "Yes. JPEG-embedded images (the majority in real-world PDFs) are copied byte-for-byte with zero re-encoding, so quality is identical to the original file the author embedded. Raw pixel images are exported as lossless PNG, and JPEG 2000 streams are saved as .jp2." },
  { q: "What's the difference between this and PDF to Image?", a: "This tool pulls out the ORIGINAL embedded images — the photo files that were placed inside the PDF. PDF to Image is the opposite: it renders whole pages (text, layout, images together) as one flat picture per page. Use this for photos, use PDF to Image for full-page snapshots." },
  { q: "Why did no images come out of my PDF?", a: "The document probably contains only text or vector graphics. Charts, diagrams, tables and drawings built from lines and shapes are NOT embedded images — they are drawing instructions the viewer paints on demand, so there is nothing to extract. If you want those elements as pictures, render the pages with PDF to Image instead." },
  { q: "What format do the images download in?", a: "JPEG-embedded photos download as .jpg, raw pixel images as .png, and JPEG 2000 streams as .jp2 (their original format). A single selection downloads as one image file; two or more come out packaged in a ZIP named after your PDF." },
  { q: "Do my files get uploaded to a server?", a: "No. The PDF is parsed entirely in your browser tab using client-side JavaScript. No file, image or metadata is transmitted anywhere — the page keeps working offline once loaded." },
  { q: "Can I extract images from a scanned PDF?", a: "Yes, and this is one of the best uses of the tool. A scan is just a series of full-page image streams inside a PDF wrapper, so every page comes back as one high-resolution picture ready to save, reprint or re-OCR." },
  { q: "Can I extract just one image instead of all?", a: "Yes. After the scan every thumbnail is a toggle — deselect the ones you don't want, or press Deselect all and click only the images you need. When exactly one is selected, it downloads as a single image file rather than a ZIP." },
  { q: "Is it legal to extract images from a PDF?", a: "For your own PDFs and any document you have the right to reuse — yes, entirely. When the images belong to someone else, extraction itself is fine, but reusing or publishing them still needs the copyright holder's permission just like copying any other file." },
  { q: "Do I need Adobe Acrobat?", a: "No. This is a free browser tool — no Acrobat, no plugin, no signup, no watermark. It runs anywhere a modern browser runs, including phones and Chromebooks." },
];

export const extractImagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: extractImagesFaq.map((f) => ({
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
  name: "PDFfree Extract Images",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
