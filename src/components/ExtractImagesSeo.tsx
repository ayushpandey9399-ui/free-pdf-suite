import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const extractImagesRelated = [
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Convert entire PDF pages to JPG or PNG." },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Combine images into a single PDF." },
  { to: "/image-tools/compress-image", name: "Compress Image", blurb: "Reduce image file size after extraction." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine multiple PDFs before extracting." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull out specific pages from a PDF." },
  { to: "/image-tools/crop-image", name: "Crop Image", blurb: "Trim extracted images to the exact area." },
  { to: "/image-tools/image-resize", name: "Resize Image", blurb: "Change dimensions of extracted images." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before extracting images." },
] as const;

const steps = [
  {
    title: "Step 1 — Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the page. Your file opens directly in your browser and is not uploaded to any server.",
  },
  {
    title: "Step 2 — Wait for Automatic Extraction",
    text: "The tool scans every page of your PDF and identifies all embedded images including photographs, logos, icons, charts, and diagrams. This process runs entirely in your browser using JavaScript and takes just a few seconds even for large documents.",
  },
  {
    title: "Step 3 — Preview and Select Images",
    text: "After extraction, you will see thumbnails of every image found in the PDF. You can preview each image at full size before downloading. Select individual images you need, or choose to download all of them at once.",
  },
  {
    title: "Step 4 — Download Your Images",
    text: "Download individual images one by one, or get all extracted images as a single ZIP file. Every image is saved in its original format and resolution — no compression, no quality loss, no watermark added.",
  },
];

const faqs = [
  {
    q: "How do I extract images from a PDF for free?",
    a: "Click the \"Select PDF file\" button on this page, choose your PDF, and the tool will automatically scan and extract every embedded image. You can then preview and download them individually or as a ZIP file. No signup or payment is required.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire extraction process runs locally in your browser using JavaScript. Your PDF never leaves your device and is never transmitted over the internet.",
  },
  {
    q: "What image formats can be extracted?",
    a: "The tool extracts images in their original embedded format, which can include JPEG, PNG, TIFF, BMP, and GIF. The format depends on how the images were saved in the original PDF.",
  },
  {
    q: "Will the extracted images be the same quality as the originals?",
    a: "Yes. The tool pulls out the actual embedded image data, not a screenshot. The resolution, color depth, and quality are identical to the original images placed in the PDF.",
  },
  {
    q: "Can I extract images from a specific page only?",
    a: "If you need images from only certain pages, first use our Extract Pages tool to separate those pages into a new PDF, then run the image extractor on that smaller file.",
  },
  {
    q: "What if my PDF has no extractable images?",
    a: "If the PDF is purely text-based or uses vector graphics, no raster images will be found. In that case, consider using our PDF to Image tool to convert entire pages into image files instead.",
  },
  {
    q: "Can I extract images from a scanned PDF?",
    a: "Yes, but each scanned page is typically stored as one large image. The tool will extract these full-page scans which you can then crop to isolate specific parts.",
  },
  {
    q: "Is there a file size limit?",
    a: "No. There is no hard file size limit. The only constraint is your device's available memory. Most PDFs, including large documents with many images, process without issues on modern devices.",
  },
  {
    q: "Can I extract images from password-protected PDFs?",
    a: "Not directly. First remove the password using our Unlock PDF tool, then run the image extraction on the unlocked file.",
  },
  {
    q: "Does this work on mobile phones?",
    a: "Yes. The tool works on any smartphone or tablet with a modern web browser, including Chrome on Android and Safari on iPhone. No app download is needed.",
  },
  {
    q: "Can I download all images at once?",
    a: "Yes. After extraction, you can download all images as a single ZIP archive instead of saving them one by one.",
  },
  {
    q: "Do you add watermarks to extracted images?",
    a: "No, never. The extracted images are completely clean with no watermarks, branding, or modifications.",
  },
  {
    q: "What is the difference between extracting images and converting PDF to image?",
    a: "Extracting images pulls out only the embedded photos and graphics. Converting PDF to image renders entire pages as flat images including all text and formatting. They serve different purposes.",
  },
  {
    q: "Can I use this tool offline?",
    a: "Yes. Once the page has fully loaded in your browser, the tool works without an internet connection because all processing runs locally in JavaScript.",
  },
  {
    q: "How many images can be extracted from one PDF?",
    a: "There is no limit. The tool will find and extract every embedded image in the document, whether that is one image or hundreds.",
  },
];

export function ExtractImagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <div className="prose prose-slate max-w-none prose-h2:text-[24px] prose-h2:sm:text-[28px] prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-14 prose-h3:text-[17px] prose-h3:font-semibold prose-h3:mt-8 prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-[#4a4a55] prose-p:mt-4">
        
        <h2>Why Would You Need to Extract Images from a PDF?</h2>
        <p>
          PDF files are designed to keep everything locked together — text, images, charts, and formatting all bundled into one read-only package. That is great for sharing documents, but it becomes a problem when you need just one image from a 50-page report or want to reuse a chart from a client presentation. Copying and pasting from a PDF usually gives you a low-resolution screenshot, not the original high-quality image. A dedicated image extractor pulls out the actual embedded image data at its original resolution.
        </p>
        <p>
          Designers and content creators frequently receive brand assets, product photos, and logos embedded inside PDFs. Extracting these images in their original resolution lets you reuse them in presentations, social media posts, website banners, and marketing materials without any quality loss. Instead of requesting the original files from the sender, you can extract exactly what you need in seconds.
        </p>
        <p>
          Researchers and students often work with academic papers, textbooks, and reports that contain charts, graphs, diagrams, and infographics. Extracting these visuals lets you include them in your own presentations, thesis documents, or study notes with proper attribution. It is much faster than recreating a complex chart from scratch.
        </p>
        <p>
          When archiving old documents, extracting embedded images separately ensures that photos, signatures, stamps, and logos are preserved independently. If a scanned contract contains an important signature image, or an old report has historical photos, extracting them creates standalone backup copies that can be cataloged and stored separately.
        </p>

        <h2>How to Extract Images from a PDF — Step by Step</h2>
        <div className="mt-5 space-y-4 not-prose">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-[15px] font-semibold text-[#33333c]">{s.title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2>Common Scenarios for Extracting Images from PDFs</h2>
        <h3>Recover Product Photos from Catalogs</h3>
        <p>
          E-commerce sellers and marketers often receive product catalogs as PDFs from manufacturers. Extracting the product images lets you use them directly on your website, online store, or social media without asking the supplier for individual photo files.
        </p>
        <h3>Pull Charts and Graphs from Reports</h3>
        <p>
          Business analysts and consultants frequently need to include charts from quarterly reports, market research, or financial statements in their own presentations. Extracting the chart as an image preserves the exact formatting and is faster than recreating it manually.
        </p>
        <h3>Save Diagrams from Technical Documentation</h3>
        <p>
          Engineers, developers, and architects work with technical manuals, system diagrams, and blueprint PDFs. Extracting these diagrams lets you reference them in your own documentation, wikis, or project management tools without losing detail.
        </p>
        <h3>Extract Logos for Brand Consistency</h3>
        <p>
          When working on a project for a client, designers often receive brand guidelines as a PDF containing the company logo in various formats. Extracting the logo image from the PDF gives you the exact approved version without needing to request separate files.
        </p>
        <h3>Archive Signatures and Stamps</h3>
        <p>
          Legal professionals and administrators sometimes need to extract signature images or official stamps from signed contracts or notarized documents for records or verification purposes.
        </p>
        <h3>Repurpose Infographics for Social Media</h3>
        <p>
          Marketing teams can extract infographics from long-form PDF reports and repurpose them as standalone social media posts, blog header images, or newsletter graphics, maximizing the value of existing content.
        </p>
        <h3>Build Training Materials from Existing Documents</h3>
        <p>
          Trainers and educators can extract diagrams, illustrations, and screenshots from existing PDF manuals or course materials to create new slide decks, worksheets, or e-learning modules.
        </p>
        <h3>Recover Images from Scanned Documents</h3>
        <p>
          When working with scanned PDFs that contain embedded photos such as passport scans, ID cards, or old photographs, the extraction tool pulls out each image separately so you can save, crop, or enhance them individually.
        </p>

        <h2>Why Use Our Free PDF Image Extractor?</h2>
        <h3>Your Files Never Leave Your Device</h3>
        <p>
          Unlike most online extraction tools that upload your PDF to a cloud server, our tool processes everything locally in your browser. No file data is ever transmitted over the internet. This makes it safe to use with confidential documents containing sensitive images, personal photos, or proprietary graphics.
        </p>
        <h3>Original Quality Preserved</h3>
        <p>
          The extraction process pulls out the actual embedded image data from the PDF, not a screenshot or re-rendered copy. This means every photo, chart, and graphic is saved at its original resolution, color depth, and format. There is no compression, downscaling, or quality degradation.
        </p>
        <h3>Completely Free With No Hidden Limits</h3>
        <p>
          There are no file size caps, no daily extraction limits, and no premium tier required for high-resolution downloads. Extract images from as many PDFs as you want, as often as you need. The output images have no watermarks or branding added.
        </p>
        <h3>Supports All Embedded Image Formats</h3>
        <p>
          The tool detects and extracts images in all common formats including JPEG, PNG, TIFF, BMP, and GIF. Regardless of how the images were embedded in the original PDF, they are extracted in their native format without conversion.
        </p>
        <h3>Batch Download as ZIP</h3>
        <p>
          When a PDF contains dozens or hundreds of images, downloading them one by one would be tedious. Our tool lets you download all extracted images at once as a single ZIP archive, organized and ready to use.
        </p>
        <h3>Works on Every Device and Browser</h3>
        <p>
          The image extractor works on Windows, Mac, Linux, ChromeOS, iOS, and Android. It runs in any modern browser including Chrome, Firefox, Safari, and Edge. No software installation, no plugins, no app downloads required — just open the page and extract.
        </p>

        <h2>Browser-Based vs Server-Based Image Extraction</h2>
        <div className="mt-6 overflow-x-auto not-prose">
          <table className="w-full text-left text-[14.5px] border-collapse">
            <thead>
              <tr className="border-b border-[#eee]">
                <th className="py-3 px-4 font-bold">Feature</th>
                <th className="py-3 px-4 font-bold">Our Tool (Browser-Based)</th>
                <th className="py-3 px-4 font-bold">Server-Based Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee]">
              <tr>
                <td className="py-3 px-4 font-medium">File Privacy</td>
                <td className="py-3 px-4">Files never leave device</td>
                <td className="py-3 px-4">Files uploaded to server</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Speed</td>
                <td className="py-3 px-4">Instant (no upload wait)</td>
                <td className="py-3 px-4">Depends on internet speed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">File Size Limit</td>
                <td className="py-3 px-4">No limit (device memory)</td>
                <td className="py-3 px-4">Often 10-50MB cap</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Image Quality</td>
                <td className="py-3 px-4">Original embedded quality</td>
                <td className="py-3 px-4">Sometimes re-compressed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Output Format</td>
                <td className="py-3 px-4">Native format preserved</td>
                <td className="py-3 px-4">Often forced to JPG only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Account Required</td>
                <td className="py-3 px-4">No</td>
                <td className="py-3 px-4">Often required</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Watermarks</td>
                <td className="py-3 px-4">Never</td>
                <td className="py-3 px-4">Common on free tier</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Batch ZIP Download</td>
                <td className="py-3 px-4">Yes</td>
                <td className="py-3 px-4">Sometimes premium only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Works Offline</td>
                <td className="py-3 px-4">Yes, after page loads</td>
                <td className="py-3 px-4">No, requires internet</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Extract Images vs Convert PDF to Image — What Is the Difference?</h2>
        <p>
          These two operations sound similar but produce very different results. "Extract Images from PDF" pulls out only the actual image files that are embedded inside the document — photographs, logos, charts, and graphics that were placed into the PDF during creation. Each extracted image is a standalone file at its original resolution.
        </p>
        <p>
          "Convert PDF to Image" is a completely different operation. It takes each entire page of the PDF and renders it as a flat image, including all text, backgrounds, headers, footers, and formatting. The result is a screenshot-like image of the full page, not the individual embedded images.
        </p>
        <p>
          Choose "Extract Images" when you need specific photos, logos, or graphics from inside a document. Choose "PDF to Image" when you need a visual copy of the entire page. If you need the latter, use our <Link to="/tools/pdf-to-images" className="text-[#e5322d] hover:underline">PDF to Image tool</Link> instead.
        </p>

        <h2>Tips for Extracting Images from PDFs</h2>
        <h3>Check if Your PDF Contains Embedded Images</h3>
        <p>
          Not all PDFs contain extractable images. Some PDFs are entirely text-based with no embedded graphics. Others use vector graphics (like SVG shapes) which are not rasterized images and may not appear in the extraction results.
        </p>
        <h3>Scanned PDFs Are One Large Image Per Page</h3>
        <p>
          If your PDF was created by scanning paper documents, each page is typically stored as one large image. The extractor will pull out these full-page scans, which you can then crop or edit as needed.
        </p>
        <h3>Use Compress Image After Extraction if Files Are Large</h3>
        <p>
          Some PDFs contain very high-resolution images that result in large file sizes. After extraction, use our <Link to="/image-tools/compress-image" className="text-[#e5322d] hover:underline">Compress Image tool</Link> to reduce file sizes while maintaining visual quality, especially before uploading to websites or sending via email.
        </p>
        <h3>Rename Images After Downloading</h3>
        <p>
          Extracted images are usually named generically like "image_001.jpg". Rename them with descriptive filenames immediately after downloading so you can find and organize them later.
        </p>
        <h3>Combine With Other PDF Tools for Complex Workflows</h3>
        <p>
          If you only need images from specific pages, first use our <Link to="/tools/extract-pages" className="text-[#e5322d] hover:underline">Extract Pages tool</Link> to pull out those pages as a separate PDF, then run the image extractor on just that smaller file. This speeds up the process and gives you only the images you actually need.
        </p>

        <h2>Frequently Asked Questions About Extracting PDF Images</h2>
      </div>

      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none text-[15.5px] font-semibold flex justify-between items-center text-[#33333c]">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight text-[#33333c]">
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "980",
  },
};
