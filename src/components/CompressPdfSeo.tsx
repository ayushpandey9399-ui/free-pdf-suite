import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1 — Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your PDF onto the upload area. Your file is processed in your browser and is never uploaded to any external server. There is no file size limit.",
  },
  {
    title: "Step 2 — Choose Your Compression Level",
    text: "Select from three compression presets depending on how small you need the file to be. Less Compression keeps near-original image quality with a moderate size reduction. Recommended balances quality and file size for most everyday uses. Extreme Compression achieves the smallest possible file size with some visible reduction in image sharpness.",
  },
  {
    title: "Step 3 — Compress the PDF",
    text: "Click the \"Compress PDF\" button. The compression runs entirely in your browser using local processing. No internet upload is required after the page loads. Processing typically takes two to ten seconds depending on the original file size and the power of your device.",
  },
  {
    title: "Step 4 — Download the Compressed File",
    text: "Once compression is complete, the tool shows you how much the file size was reduced. Click the download button to save the smaller PDF to your device. The compressed file is ready to email, upload, or share immediately.",
  },
];

const faqs = [
  {
    q: "Why Does PDF File Size Matter?",
    a: "PDF files can grow surprisingly large, especially those containing high-resolution photographs, scanned pages, embedded fonts, or complex vector graphics. Email providers like Gmail and Outlook impose attachment size limits of 20-25MB. Compressing a PDF reduces its file size by optimizing the data it contains, most significantly through image downsampling. The result is a file that looks identical to the original in everyday use but takes up a fraction of the space.",
  },
  {
    q: "How Much Can PDF Compression Reduce File Size?",
    a: "The reduction depends heavily on the content. Image-heavy documents or scanned pages typically compress by 60-80%. A 20MB scanned contract can realistically become 4-8MB. Text-only PDFs compress the least, potentially shrinking by 20-30%. Our presets allow you to control this trade-off between quality and size.",
  },
  {
    q: "Is it safe to compress my PDF online?",
    a: "Yes, our tool processes your files locally in your browser. Unlike other services, your documents never leave your device and are never uploaded to our servers, ensuring 100% privacy for sensitive files like bank statements or legal contracts.",
  },
  {
    q: "Will I lose quality when I compress a PDF?",
    a: "It depends on the compression level. 'Less Compression' keeps images at high quality, while 'Extreme Compression' targets the smallest possible output which may result in softer images. Text usually remains perfectly sharp at all levels.",
  },
  {
    q: "Does this tool work on mobile devices?",
    a: "Yes, our PDF compressor works in any modern web browser on Android, iPhone, iPad, and desktop computers without requiring any software installation.",
  },
  {
    q: "Are there any file size limits?",
    a: "No, there are no file size limits for our browser-based compression. You can process large documents as long as your device has enough memory to handle them.",
  },
  {
    q: "Can I compress multiple PDFs at once?",
    a: "Currently, our tool processes files one at a time to ensure the highest quality and security for each individual document.",
  },
  {
    q: "Why is my PDF still too large after compression?",
    a: "If a PDF contains already-optimized images or very little data to compress (like plain text), the reduction might be minimal. Try using 'Extreme Compression' for maximum impact.",
  },
  {
    q: "Does compressing a PDF remove its password?",
    a: "No, the tool does not remove passwords. If a PDF is protected, you must unlock it first using our Unlock PDF tool before compressing it.",
  },
  {
    q: "What is downsampling in PDF compression?",
    a: "Downsampling is the process of reducing the number of pixels in an image. By lowering the resolution of images from 300 DPI to 72 or 150 DPI, the file size drops significantly while still looking great on digital screens.",
  },
  {
    q: "Can I print a compressed PDF?",
    a: "Yes, compressed PDFs are fully printable. If you need high-quality professional printing, we recommend using the 'Less Compression' setting.",
  },
  {
    q: "Does compression affect PDF searchability?",
    a: "No, compressing a PDF does not affect the text layer or the ability to search within the document.",
  },
  {
    q: "Is this PDF compressor really free?",
    a: "Yes, it is 100% free with no signup, no hidden fees, and no watermarks added to your documents.",
  },
  {
    q: "Can I use this tool offline?",
    a: "Once the page is loaded, the core compression logic runs in your browser, allowing you to process files even if your internet connection is interrupted.",
  },
  {
    q: "What happens to my metadata after compression?",
    a: "Standard compression usually strips out unnecessary metadata to save space, but the core document structure and content remain intact.",
  },
];

const related = [
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim margins and adjust the visible area of pages." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
] as const;

export function CompressPdfSeo() {
  return (
    <section className="seo-content mx-auto max-w-4xl px-4 pb-16">
      <h2>Why Does PDF File Size Matter?</h3>
      <p>
        PDF files can grow surprisingly large, especially those containing high-resolution photographs, scanned pages,
        embedded fonts, or complex vector graphics. A PDF brochure that looks simple on screen can easily reach 30, 50,
        or even 100 megabytes. This creates real problems in everyday workflows. Email providers like Gmail and
        Outlook impose attachment size limits of 20-25MB. Cloud storage fills up faster than expected. Web upload forms
        reject files over a certain size. And mobile users on slower connections struggle to download heavy documents.
      </p>
      <p>
        Compressing a PDF reduces its file size by optimizing the data it contains. The most significant reduction
        usually comes from images. A PDF with ten high-resolution photos at 300 DPI might shrink by 70-80% when those
        images are downsampled to 72-150 DPI — a resolution that still looks perfectly sharp on a screen. Other
        optimizations include removing embedded metadata, compressing font subsets, flattening invisible layers, and
        stripping out duplicate content streams that PDF editors sometimes leave behind.
      </p>
      <p>
        The result is a file that looks identical to the original in everyday use but takes up a fraction of the space.
        A 15MB report can become a 3MB file. A 40MB scanned contract can become 8MB. These smaller files upload faster,
        email without trouble, load quicker on mobile, and take up less space in cloud storage or shared drives.
        Compression is one of the highest-value operations you can perform on a PDF.
      </p>
      <p>
        Knowing how much to compress depends on the use case. A document destined for professional printing needs to
        preserve high image resolution. A PDF being uploaded to a government portal just needs to be under a specific
        file size threshold. A report being emailed to a colleague benefits from maximum compression for fast delivery.
        Our compression tool gives you control over the level of optimization so you always get the right balance for
        your specific situation.
      </p>

      <h2>How to Compress a PDF Online — Step by Step</h3>
      <div className="mt-8 space-y-6">
        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 1">1</span>
          <div>
            <h4 className="text-lg font-bold text-[#383E45]">Step 1 — Upload Your PDF</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Click the "Select PDF file" button or drag and drop your PDF onto the upload area. Your file is processed in
              your browser and is never uploaded to any external server. There is no file size limit.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 2">2</span>
          <div>
            <h4 className="text-lg font-bold text-[#383E45]">Step 2 — Choose Your Compression Level</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Select from three compression presets depending on how small you need the file to be. Less Compression keeps
              near-original image quality with a moderate size reduction. Recommended balances quality and file size for most
              everyday uses. Extreme Compression achieves the smallest possible file size with some visible reduction in
              image sharpness.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 3">3</span>
          <div>
            <h4 className="text-lg font-bold text-[#383E45]">Step 3 — Compress the PDF</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Click the "Compress PDF" button. The compression runs entirely in your browser using local processing. No
              internet upload is required after the page loads. Processing typically takes two to ten seconds depending on
              the original file size and the power of your device.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label="Step 4">4</span>
          <div>
            <h4 className="text-lg font-bold text-[#383E45]">Step 4 — Download the Compressed File</h3>
            <p className="mt-2 text-base leading-relaxed text-[#383E45]">
              Once compression is complete, the tool shows you how much the file size was reduced. Click the download button
              to save the smaller PDF to your device. The compressed file is ready to email, upload, or share immediately.
            </p>
          </div>
        </div>
      </div>

      <h2>How Much Can PDF Compression Reduce File Size?</h3>
      <p>
        The reduction you get from compressing a PDF depends heavily on what the file contains. Image-heavy documents
        compress the most dramatically. A PDF created from scanned paper pages — common in contracts, legal documents,
        and old reports — typically compresses by 60-80%. A 20MB scanned contract can realistically become 4-8MB.
      </p>
      <p>
        PDFs created directly from Word or Excel files with embedded high-resolution photos also compress significantly.
        A 15MB marketing brochure with full-page product photography can drop to 3-5MB using standard compression.
        Infographic-heavy reports with charts and graphics typically compress by 40-60%.
      </p>
      <p>
        Text-only PDFs compress the least. A 10-page legal brief with nothing but formatted text might only shrink from
        500KB to 350KB because text data is already very compact. However, even modest reductions help when uploading
        to systems with strict file size limits.
      </p>
      <p>
        The three compression presets give you direct control over this trade-off. "Less Compression" keeps images at
        high quality and typically reduces file size by 20-40%. "Recommended" is tuned for the best balance and usually
        achieves 40-70% reduction. "Extreme Compression" targets the smallest possible output and can reduce
        image-heavy files by 70-90%, though some images may appear softer when viewed closely or printed.
      </p>

      <h2>Common Situations Where You Need to Compress a PDF</h3>
      <h2>Sending PDF Attachments via Email</h3>
      <p>
        Gmail, Outlook, Yahoo Mail, and most corporate email systems cap attachment sizes at 20-25MB. A single scanned
        contract, illustrated report, or photo-heavy brochure can easily exceed this limit. Compressing the PDF before
        sending ensures it goes through without bouncing, and recipients with slow connections receive it faster.
      </p>

      <h2>Uploading to Government and University Portals</h3>
      <p>
        Many official portals for filing taxes, submitting visa applications, applying to universities, or registering
        businesses impose strict file size limits of 2MB, 5MB, or 10MB per document. These limits cannot be bypassed.
        Compressing your PDF to meet the portal's requirement is the only way to complete the submission.
      </p>

      <h2>Sharing Via WhatsApp and Messaging Apps</h3>
      <p>
        WhatsApp limits document shares to 100MB, but large PDFs often load slowly on recipients' phones, especially on
        mobile data. Compressing a PDF to under 5MB ensures it loads instantly and does not consume the recipient's
        data allowance unnecessarily.
      </p>

      <h2>Saving Cloud Storage Space</h3>
      <p>
        When storing hundreds of PDFs in Google Drive, Dropbox, OneDrive, or iCloud, file size adds up quickly.
        Compressing PDFs before archiving them can reduce cloud storage usage by 50-70%, either cutting your monthly
        costs or freeing space for other files.
      </p>

      <h2>Uploading to Websites and Client Portals</h3>
      <p>
        Website builders, client portals, HR systems, and legal document platforms often have upload limits. A
        recruitment system might cap CVs and cover letters at 5MB. A client onboarding portal might limit documents to
        10MB. Compressing ensures your PDF meets these requirements without recreating it.
      </p>

      <h2>Speeding Up PDF Loading in Browsers</h3>
      <p>
        PDFs embedded in websites or shared via public links load slowly in browsers when they are large. A compressed
        PDF opens in seconds rather than minutes for visitors on mobile or slower connections, improving their
        experience significantly.
      </p>

      <h2>Reducing Size After Scanning Documents</h3>
      <p>
        Scanning physical documents using a phone scanner app or office scanner often produces very large files because
        each scanned page is stored as a high-resolution image. Compressing the scanned PDF can reduce a 50-page
        scanned contract from 30MB to under 5MB without making the text unreadable.
      </p>

      <h2>Preparing PDFs for Long-Term Digital Archiving</h3>
      <p>
        Organizations keeping digital records for years or decades benefit enormously from compressed PDFs. Smaller
        files are easier to back up, faster to search, and consume significantly less physical server space over time.
      </p>

      <h2>Frequently asked questions</h3>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none flex justify-between items-center text-[15.5px] font-semibold text-[#383E45]">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#6B7280]">
              {f.a}
            </p>
          </details>
        ))}
      </div>

      <h2>Related PDF tools</h3>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const compressFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const compressHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress a PDF online for free",
  description: "Reduce your PDF file size instantly without losing quality. Choose your compression level and download a smaller PDF in seconds.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `https://pdftoolconverteronline.com/tools/compress#step-${i + 1}`,
  })),
};

export const compressSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Compress PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1250",
  },
};
