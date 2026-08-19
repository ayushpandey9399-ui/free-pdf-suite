import { Link } from "@tanstack/react-router";
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
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <div>
        
        <h2>Why Would You Need to Extract Images from a PDF?</h2>
        <p>PDF files are designed as immutable containers, bundling text, vector graphics, embedded images, and complex formatting into a single, reliable format for sharing and printing. While this structure is ideal for document integrity, it presents a significant obstacle when you need to repurpose specific visual content. For instance, extracting a high-resolution logo from a brand guideline PDF or pulling a chart from a detailed financial report is often difficult because these elements are fused into the document structure.</p>
        <p>When you attempt to copy and paste visuals directly from a PDF reader, you almost always end up with a low-resolution screenshot or a jagged, pixelated approximation of the original graphic. This is unacceptable for professional design, printing, or high-quality digital output. Our PDF image extractor solves this by precisely locating the actual embedded image binary data within the PDF file structure and pulling it out at its original, native resolution. Whether your PDF contains photographs, icons, logos, or technical diagrams, this tool guarantees that you retrieve the exact image file that was placed there originally.</p>
        <p>For design and creative professionals, receiving brand assets, product photos, or icons embedded inside a PDF is a daily occurrence. Instead of going through the time-consuming process of requesting individual assets from the original creator, you can use our tool to instantly extract these images. This is essential for maintaining brand consistency in presentations, social media graphics, website banners, and digital marketing materials. By bypassing the need for original files, you dramatically speed up your creative workflow.</p>
        <p>Researchers, students, and analysts frequently deal with academic textbooks, research papers, and industrial reports filled with essential charts, diagrams, and infographics. Extracting these visual assets allows for easy citation and reuse in your own research or study materials without the need to recreate complex graphics from scratch. By using our image extraction tool, you ensure that the integrity and clarity of the original technical visuals are preserved for your own documentation, wikis, or academic projects.</p>
        <p>Finally, archival tasks often demand that documents be broken down into their constituent parts for preservation. Extracting photos, official stamps, signatures, or historical documents from a PDF helps in organizing and cataloging digital assets. Our tool creates standalone files from these elements, which can then be safely backed up, managed, or indexed individually, ensuring that your document archives are thorough and accessible.</p>

        <h2>How to Extract Images from a PDF — Step by Step</h2>
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

        <h2>Common Scenarios for Extracting Images from PDFs</h2>
        <h2>Recover Product Photos from Catalogs</h2>
        <p>Marketing teams and e-commerce store managers often receive large product catalogs as PDFs from manufacturers. Extracting these product photos allows for immediate integration into an online store, website catalog, or social media feed. Instead of waiting for the supplier to send hundreds of individual photo files, you can simply run the catalog through this tool and pull out all product images instantly.</p>
        
        <h2>Pull Charts and Graphs from Reports</h2>
        <p>Business consultants and analysts need to extract key performance indicators, market research data, or financial charts from complex PDF reports for inclusion in client presentations. Extracting these items as high-quality images ensures that labels are legible and the original chart design remains intact, avoiding the need for manual recreation.</p>
        
        <h2>Save Diagrams from Technical Documentation</h2>
        <p>Engineers and architects often refer to technical manuals, system blueprints, and construction documents in PDF format. Extracting the embedded diagrams or schematics allows them to be referenced in project management software, internal wikis, or site documentation without losing essential technical detail.</p>
        
        <h2>Extract Logos for Brand Consistency</h2>
        <p>When working on collaborative projects, designers often receive PDF-based brand guidelines containing the company logo in various sizes and formats. Extracting these logo files directly from the guideline document ensures you are using the officially approved version of the brand asset.</p>
        
        <h2>Archive Signatures and Stamps</h2>
        <p>Administrative and legal personnel often need to extract official stamps, notarized signatures, or company seals from signed legal documents for compliance records. This tool creates isolated image files of these elements, facilitating easier verification and digital archiving.</p>
        
        <h2>Repurpose Infographics for Social Media</h2>
        <p>Content creators can extract high-value infographics from long-form research reports or e-books. Once extracted, these visuals can be repurposed as standalone social media posts or blog headers, maximizing the reach and utility of the original content.</p>
        
        <h2>Build Training Materials from Existing Documents</h2>
        <p>Educators and corporate trainers frequently pull diagrams, illustrations, and technical screenshots from existing training PDF manuals to develop new instructional slide decks, worksheets, and interactive e-learning modules.</p>
        
        <h2>Recover Images from Scanned Documents</h2>
        <p>When processing scanned PDF files that contain embedded documents like identity card scans, old photographs, or historical document copies, this tool isolates each photo or scan component, allowing you to save or enhance them individually for your records.</p>

        <h2>Why Use Our Free PDF Image Extractor?</h2>
        <h2>Your Files Never Leave Your Device</h2>
        <p>Unlike most online PDF extraction tools that require uploading your file to a remote cloud server for processing, our application processes everything locally within your web browser. This means your file data is never transmitted over the internet, making it the safest option for highly sensitive documents, private photographs, or confidential corporate graphics.</p>
        
        <h2>Original Quality Preserved</h2>
        <p>This extraction process identifies the exact binary data of images already stored within the PDF, rather than taking a screenshot or generating a new image file. As a result, every extracted file maintains its original color depth, resolution, and format, with absolutely zero quality loss or re-compression.</p>
        
        <h2>Completely Free With No Hidden Limits</h2>
        <p>There are no arbitrary file size limits, daily usage quotas, or requirements to sign up for a premium account. You are free to process as many PDF documents as you need, as often as you want, and every downloaded image will be free of watermarks or branding.</p>
        
        <h2>Supports All Embedded Image Formats</h2>
        <p>The extractor is engineered to recognize and retrieve a wide range of embedded formats including JPEG, PNG, TIFF, BMP, and GIF. It adapts to the format in which the image was originally saved in the PDF, ensuring you always get the native file format back.</p>
        
        <h2>Batch Download as ZIP</h2>
        <p>For PDFs packed with dozens or even hundreds of visual elements, saving each image individually is inefficient. Our tool offers a batch download feature, packaging all selected assets into a single ZIP file for quick transfer and storage. If you need to combine these images into a new document later, you can use our <Link to="/tools/$slug" params={{ slug: "images-to-pdf" }} className="text-[#e5322d] hover:underline">Images to PDF tool</Link>.</p>
        
        <h2>Works on Every Device and Browser</h2>
        <p>Whether you are on a Windows desktop, a Mac, a Linux machine, or mobile devices like Android or iOS, this tool runs seamlessly in any modern web browser. There is no requirement for plugins, software installations, or app downloads.</p>

        <h2>Browser-Based vs Server-Based Image Extraction</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#ececef]">
            <thead>
              <tr className="bg-[#f7f7f8]">
                <th className="py-3 px-4 font-bold border border-[#ececef]">Feature</th>
                <th className="py-3 px-4 font-bold border border-[#ececef]">Our Tool (Browser-Based)</th>
                <th className="py-3 px-4 font-bold border border-[#ececef]">Server-Based Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececef]">
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">File Privacy</td>
                <td className="py-3 px-4 border border-[#ececef]">Files never leave device</td>
                <td className="py-3 px-4 border border-[#ececef]">Files uploaded to server</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Speed</td>
                <td className="py-3 px-4 border border-[#ececef]">Instant (no upload wait)</td>
                <td className="py-3 px-4 border border-[#ececef]">Depends on internet speed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">File Size Limit</td>
                <td className="py-3 px-4 border border-[#ececef]">No limit (device memory)</td>
                <td className="py-3 px-4 border border-[#ececef]">Often 10-50MB cap</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Image Quality</td>
                <td className="py-3 px-4 border border-[#ececef]">Original embedded quality</td>
                <td className="py-3 px-4 border border-[#ececef]">Sometimes re-compressed</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Output Format</td>
                <td className="py-3 px-4 border border-[#ececef]">Native format preserved</td>
                <td className="py-3 px-4 border border-[#ececef]">Often forced to JPG only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Account Required</td>
                <td className="py-3 px-4 border border-[#ececef]">No</td>
                <td className="py-3 px-4 border border-[#ececef]">Often required</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Watermarks</td>
                <td className="py-3 px-4 border border-[#ececef]">Never</td>
                <td className="py-3 px-4 border border-[#ececef]">Common on free tier</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Batch ZIP Download</td>
                <td className="py-3 px-4 border border-[#ececef]">Yes</td>
                <td className="py-3 px-4 border border-[#ececef]">Sometimes premium only</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Works Offline</td>
                <td className="py-3 px-4 border border-[#ececef]">Yes, after page loads</td>
                <td className="py-3 px-4 border border-[#ececef]">No, requires internet</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Extract Images vs Convert PDF to Image — What Is the Difference?</h2>
        <p>While these operations are frequently confused, they serve fundamentally different purposes. Extracting images from a PDF specifically identifies and retrieves the individual image files that were embedded within the document — such as logos, photos, and charts. Each resulting file is a standalone asset at its original resolution.</p>
        <p>Conversely, converting a PDF to image is a page-level operation. This process takes every single page of a PDF document and renders it as a flat image file, encompassing all text, background colors, headers, footers, and structural formatting. The output here is a screenshot-like image of the full page, not the individual embedded assets themselves.</p>
        <p>Select the "Extract Images" tool when you require specific photos, logos, or graphics previously embedded inside the document. Use the "PDF to Image" tool if you need a visual representation of the entire page for reference or sharing. If the latter is what you require, please use our <Link to="/tools/$slug" params={{ slug: "pdf-to-images" }} className="text-[#e5322d] hover:underline">PDF to Image tool</Link> instead. If you have multiple documents, you might want to use our <Link to="/tools/$slug" params={{ slug: "merge" }} className="text-[#e5322d] hover:underline">Merge PDF tool</Link> first to combine them before extraction.</p>

        <h2>Tips for Extracting Images from PDFs</h2>
        <h2>Check if Your PDF Contains Embedded Images</h2>
        <p>Be aware that not all PDFs contain raster images. Some documents are entirely text-based or rely heavily on vector graphics, which do not appear as standard images and thus cannot be extracted as image files. If your document is password-protected, you must first use our <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#e5322d] hover:underline">Unlock PDF tool</Link> to remove the security before extraction can occur.</p>
        
        <h2>Scanned PDFs Are One Large Image Per Page</h2>
        <p>If your document was created via a flatbed scanner or a mobile scanning app, every page typically consists of a single large, flat image layer. Extracting images from such a file will yield these full-page scans, which can then be cropped for your specific needs using our <Link to="/image-tools/$slug" params={{ slug: "crop-image" }} className="text-[#e5322d] hover:underline">Crop Image tool</Link>.</p>
        
        <h2>Use Compress Image After Extraction if Files Are Large</h2>
        <p>Some documents include high-definition photographic data that can lead to large files. After extraction, you can use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] hover:underline">Compress Image tool</Link> to optimize file sizes without visible quality loss, making them perfect for website or email use.</p>
        
        <h2>Rename Images After Downloading</h2>
        <p>The system generates generic filenames for extracted images, such as "image_001.jpg". We highly recommend renaming them with descriptive identifiers immediately after download to facilitate easier search and organization. If the dimensions are not right, you can use our <Link to="/image-tools/$slug" params={{ slug: "image-resize" }} className="text-[#e5322d] hover:underline">Resize Image tool</Link> to adjust them.</p>
        
        <h2>Combine With Other PDF Tools for Complex Workflows</h2>
        <p>If you only need images from specific parts of a long PDF, first use our <Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="text-[#e5322d] hover:underline">Extract Pages tool</Link> to save only those relevant pages as a new, smaller document. This greatly simplifies the extraction process and ensures you only work with the specific images you require.</p>

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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "980",
  },
};
