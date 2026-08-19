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
    title: "Step 3 — Set Image Quality",
    text: "Choose the image resolution and quality level. Higher quality settings produce sharper images with larger file sizes. Standard quality is sufficient for screen viewing and most sharing purposes. High quality is recommended when images will be printed or used in professional presentations.",
  },
  {
    title: "Step 4 — Convert and Download",
    text: "Click the convert button. Each page of the PDF is rendered as a separate image file. Download individual pages as needed, or download all images at once as a single ZIP archive. All images are clean with no watermarks.",
  },
];

const faqs = [
  {
    q: "How do I convert a PDF to JPG for free?",
    a: "Upload your PDF using the button above, choose JPG or PNG as output format, select your quality level, and click convert. Download your images individually or as a ZIP file. No signup required.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire conversion process runs in your browser. Your PDF never leaves your device and is never transmitted over the internet.",
  },
  {
    q: "Is there a file size or page count limit?",
    a: "No. You can convert PDFs of any size with any number of pages. The only constraint is your device memory.",
  },
  {
    q: "Will the JPG images look the same as the original PDF?",
    a: "Yes. Each page is rendered as a high-quality image that accurately represents the original PDF page content, including text, images, and graphics.",
  },
  {
    q: "Can I convert just one page instead of the whole PDF?",
    a: "Select specific pages to convert or download only the pages you need after conversion is complete.",
  },
  {
    q: "What is the difference between JPG and PNG output?",
    a: "JPG produces smaller files suitable for most sharing purposes. PNG produces larger files with sharper edges — better for text-heavy documents and design work.",
  },
  {
    q: "Can I convert a PDF to PNG instead of JPG?",
    a: "Yes. Choose PNG in the output format selector before converting.",
  },
  {
    q: "Will the converted images have watermarks?",
    a: "No. All output images are completely clean with no watermarks or branding added.",
  },
  {
    q: "Can I download all pages as a ZIP file?",
    a: "Yes. After conversion, download all images at once as a single ZIP archive for convenient storage and transfer.",
  },
  {
    q: "Does this work on mobile phones?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. No app required.",
  },
  {
    q: "Can I convert a password-protected PDF?",
    a: "Not directly. First unlock it using our Unlock PDF tool, then convert the unlocked file to images.",
  },
  {
    q: "Does this work offline?",
    a: "Yes. Once the page has fully loaded, the conversion tool works without an internet connection.",
  },
  {
    q: "What DPI resolution are the output images?",
    a: "Resolution depends on the quality setting you choose. Standard quality produces 96 DPI images suitable for screen viewing. High quality produces 150-200 DPI. Maximum quality produces 300 DPI print-ready images.",
  },
  {
    q: "Can I convert multiple PDFs at once?",
    a: "Upload one PDF at a time. Convert each file separately for best results.",
  },
  {
    q: "Is this tool really free with no limits?",
    a: "Yes. No usage caps, no daily limits, no signup required, no watermarks on output.",
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
      <h2>Why Convert a PDF to JPG?</h2>
      <p>
        PDFs are the universal document format for sharing and printing, but they are not always the right format for every use case. Many platforms, including social media sites, website builders, email marketing tools, presentation software, and messaging apps, cannot display PDFs directly. They require images. Converting your PDF pages to JPG images makes your content compatible with virtually every platform and application in the world.
      </p>
      <p>
        JPG is the most widely supported image format on the planet. Every smartphone, operating system, web browser, and application can open a JPG file without any special software. When you convert a PDF page to JPG, the resulting image can be opened instantly on any device, inserted into any document, uploaded to any platform, and shared through any messaging app without compatibility concerns.
      </p>
      <p>
        Converting PDF pages to images is also the fastest way to create visual previews and thumbnails of document content. Rather than requiring someone to open a PDF reader to preview a document, you can share a JPG thumbnail that displays the page content instantly in any image viewer. This is especially useful for sharing previews of reports, certificates, forms, and designs.
      </p>
      <p>
        Privacy is another reason to convert PDFs to images. A JPG image cannot contain hidden metadata, embedded scripts, hyperlinks, or interactive form fields that could track the recipient or expose document properties. Converting a sensitive PDF page to a JPG creates a clean image with no hidden data; it's ideal for sharing visual content without exposing the underlying document structure.
      </p>

      <h2>How to Convert PDF to JPG Online — Step by Step</h2>
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
        For most everyday uses — sharing documents via email or messaging, posting to social media, inserting into presentations — JPG quality is completely sufficient and the smaller file size makes it more convenient. For professional print work, archival purposes, or situations where the image will be further edited, PNG is the better choice.
      </p>
      <p>
        PNG also supports transparent backgrounds, which JPG does not. If a PDF page has a transparent background and you need the resulting image to maintain transparency (for example, to overlay it on another design), PNG is the only correct choice. JPG will fill any transparent area with white.
      </p>

      <h2>Common Reasons to Convert PDF Pages to Images</h2>
      <h2>Share Documents on Social Media</h2>
      <p>
        Instagram, Facebook, LinkedIn, and Twitter all display images natively in feeds but cannot display PDF files directly. Converting your PDF pages to JPG lets you share report pages, infographics, certificates, and design previews directly as social media posts without requiring followers to download and open a PDF file.
      </p>
      <h2>Insert PDF Content Into Presentations</h2>
      <p>
        PowerPoint, Google Slides, Keynote, and other presentation tools allow you to insert images but not PDF pages. Converting a specific PDF page — such as a chart, diagram, or summary slide — to JPG lets you insert it directly into your presentation at any size.
      </p>
      <h2>Create Document Thumbnails and Previews</h2>
      <p>
        When displaying a library of documents on a website, app, or internal portal, showing a JPG thumbnail of the first page helps users identify documents visually without downloading them. Convert the first page of each PDF to create thumbnail images for your document library.
      </p>
      <h2>Share Pages via WhatsApp and Messaging Apps</h2>
      <p>
        Messaging apps display JPG and PNG images inline in the conversation, making them instantly visible without tapping to download. Converting a specific page from a contract, invoice, or form to a JPG and sending it as an image message is faster and more convenient than sending the full PDF.
      </p>
      <h2>Use PDF Pages in Design and Marketing</h2>
      <p>
        Graphic designers, content creators, and marketers often need to incorporate specific pages from brand guideline documents, product sheets, or approval documents into their design work. Converting the relevant PDF pages to high-quality JPG or PNG images provides the clean source files they need to work with in Photoshop, Canva, or other design tools.
      </p>
      <h2>Archive Visual Records of Documents</h2>
      <p>
        For visual archives — keeping a record of how a document looked at a specific point in time — JPG images are more universally viewable than PDF files, especially as PDF specifications change over time. Converting important document pages to images ensures they remain viewable on any future device or system.
      </p>
      <h2>Extract Specific Pages as Standalone Images</h2>
      <p>
        When you need to share just one page from a long PDF — such as the signature page of a contract, a specific chart from a report, or a single certificate from a multi-certificate document — converting that specific page to JPG is faster than splitting the PDF and sharing the single-page result.
      </p>
      <h2>Embed PDF Content in Emails</h2>
      <p>
        Email clients display inline images in the email body, making them immediately visible to the recipient. PDF attachments require the recipient to download and open a separate file. Embedding a JPG of the key content inline in the email body ensures the recipient sees the important information immediately without needing to open an attachment.
      </p>

      <h2>What Quality Level Should You Choose?</h2>
      <h2>Standard Quality (72-96 DPI)</h2>
      <p>
        This is the default setting for screen viewing. Images produced at standard quality look excellent on any monitor or phone screen, load quickly when shared online, and have the smallest file sizes. Choose standard quality when images will be shared via messaging, email, or social media and viewed on screens.
      </p>
      <h2>High Quality (150-200 DPI)</h2>
      <p>
        High quality produces noticeably sharper images with more detail. This setting is ideal when images will be inserted into presentations, used in documents that will be printed at standard paper sizes, or displayed on high-resolution screens. File sizes are larger but the additional clarity is visible especially in text-heavy documents.
      </p>
      <h2>Maximum Quality (300 DPI)</h2>
      <p>
        Maximum quality renders images at print resolution — the standard for professional printing. Use this setting when images will be printed at large sizes, used in professional print designs, or submitted to print services. File sizes are significantly larger but image clarity is preserved at the highest level.
      </p>

      <h2>Browser-Based vs Server-Based PDF to Image Conversion</h2>
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
              <td className="p-3 border border-gray-200">Instant (no upload)</td>
              <td className="p-3 border border-gray-200">Upload/download delay</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Size Limit</td>
              <td className="p-3 border border-gray-200">No limit</td>
              <td className="p-3 border border-gray-200">Often 20-100MB cap</td>
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
              <td className="p-3 border border-gray-200">Selectable resolution</td>
              <td className="p-3 border border-gray-200">Sometimes fixed</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Batch Download as ZIP</td>
              <td className="p-3 border border-gray-200">Yes</td>
              <td className="p-3 border border-gray-200">Sometimes premium only</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Cost</td>
              <td className="p-3 border border-gray-200">Always free</td>
              <td className="p-3 border border-gray-200">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "2890",
  },
};
