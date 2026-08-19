import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1 — Upload Your PDF",
    text: "Click the \"Select PDF\" button or drag and drop your document onto the page. Your file opens directly in your browser without being uploaded to any server. There is no file size or page count limit.",
  },
  {
    title: "Step 2 — Choose Your Split Method",
    text: "Select how you want to split the PDF. You can split by custom page ranges (for example, pages 1-10, 11-20, and 21-30 as three separate files), extract all pages as individual PDFs, or select specific pages to save as a new document.",
  },
  {
    title: "Step 3 — Preview Your Selection",
    text: "The tool shows you a visual preview of your PDF pages so you can confirm exactly which pages will be included in each output file. Adjust your selection before processing to make sure the result is exactly what you need.",
  },
  {
    title: "Step 4 — Download Your Split Files",
    text: "Click the split button and your output files are ready instantly. If you are splitting into multiple files, they are packaged into a ZIP archive for convenient download. Every output file preserves the original formatting, fonts, images, and links from the source document.",
  },
];

const faqs = [
  {
    q: "How do I split a PDF online for free?",
    a: "Upload your PDF using the button or drag-and-drop above, choose your split method (by range, all pages, or specific pages), and click split. Download your files instantly. No signup or payment required.",
  },
  {
    q: "Can I split a PDF into specific page ranges?",
    a: "Yes. Enter custom page ranges to split the PDF into exactly the sections you need. Each range becomes a separate PDF file.",
  },
  {
    q: "Can I extract just one page from a PDF?",
    a: "Yes. Select the single page you want and it will be saved as its own one-page PDF file.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire splitting process runs in your browser. Your PDF never leaves your device and is never transmitted over the internet.",
  },
  {
    q: "Is there a file size or page count limit?",
    a: "No. You can split PDFs of any size and any page count. The only constraint is your device memory.",
  },
  {
    q: "Will splitting affect the quality of the PDF?",
    a: "No. Splitting only separates pages into different files. All content, formatting, images, fonts, and links are preserved exactly as they were in the original.",
  },
  {
    q: "Can I split multiple PDFs at once?",
    a: "Currently the tool processes one PDF at a time. For batch splitting, process each file separately.",
  },
  {
    q: "Can I split a password-protected PDF?",
    a: "Not directly. First remove the password using our Unlock PDF tool, then split the file normally.",
  },
  {
    q: "How do I download multiple split files?",
    a: "When you split a PDF into multiple files, they are automatically packaged into a single ZIP archive for convenient download.",
  },
  {
    q: "Will bookmarks and links still work after splitting?",
    a: "Internal bookmarks that point to pages within the same split section will continue to work. Bookmarks pointing to pages in a different split section will no longer be valid since those pages are in a separate file.",
  },
  {
    q: "Can I split a PDF on my phone?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. No app download is needed.",
  },
  {
    q: "Can I use the tool offline?",
    a: "Yes. Once the page has fully loaded, the PDF splitter works without an internet connection.",
  },
  {
    q: "What is the difference between Split PDF and Extract Pages?",
    a: "Split PDF divides a document into multiple output files based on your defined ranges. Extract Pages pulls out specific selected pages and saves them as one new PDF. Both tools are available on this site.",
  },
  {
    q: "Does splitting a PDF reduce its quality?",
    a: "No. Splitting is a structural operation that separates pages. It does not re-encode or compress any content.",
  },
  {
    q: "Is this tool really free with no limits?",
    a: "Yes. No usage caps, no daily limits, no signup, no watermarks on output files. Completely free.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange before splitting." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before splitting." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert separators before splitting." },
] as const;

export function SplitPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      {/* Section A */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Why Would You Need to Split a PDF File?</h2>
      <p className="mt-4 text-base leading-relaxed text-[#383E45]">
        PDF files are designed to bundle information together, which is ideal for sharing but creates problems when you only need part of a document. A 200-page annual report might contain separate chapters for different departments, each needing to be distributed individually. A scanned booklet might have multiple independent forms on different pages. A legal contract might need specific sections extracted for review without sharing the entire document. Splitting a PDF solves all of these problems instantly.
      </p>
      <p className="mt-3 text-base leading-relaxed text-[#383E45]">
        The ability to separate PDF pages gives you precise control over your documents. Instead of sending someone a 50-page document when they only need pages 12-18, you extract exactly those pages and share a clean, focused file. This saves the recipient's time, reduces confusion, and keeps sensitive sections of the document private.
      </p>
      <p className="mt-3 text-base leading-relaxed text-[#383E45]">
        Splitting is also essential for working around upload limits. Many government portals, university systems, and business platforms impose strict page count or file size limits per submission. Splitting a large PDF into smaller sections lets you comply with these requirements without recreating the document from scratch.
      </p>
      <p className="mt-3 text-base leading-relaxed text-[#383E45]">
        For digital archiving, splitting makes documents more manageable. A 500-page archive of monthly reports is much easier to search and retrieve when it is split into individual monthly files. Splitting once saves hours of searching later.
      </p>

      {/* Section B - How-to */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">How to Split a PDF Online — Step by Step</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-lg font-semibold text-[#383E45]">{s.title}</h3>
              <p className="mt-1 text-base leading-relaxed text-[#383E45]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Section C */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Three Ways to Split a PDF</h2>
      <h3 className="mt-6 text-lg font-semibold text-[#383E45]">Split by Page Range</h3>
      <p className="mt-2 text-base leading-relaxed text-[#383E45]">
        This is the most common split method. You define specific page ranges and each range becomes a separate PDF file. For example, a 30-page document can be split into three 10-page files, or into unequal sections such as pages 1-5, 6-22, and 23-30 based on where chapters or sections begin and end. This method is ideal for splitting long reports, books, and multi-section documents.
      </p>
      <h3 className="mt-6 text-lg font-semibold text-[#383E45]">Extract Every Page as a Separate PDF</h3>
      <p className="mt-2 text-base leading-relaxed text-[#383E45]">
        This method creates one individual PDF file for every single page in the document. A 20-page document produces 20 separate one-page PDFs. This is useful when each page is an independent document (such as individual invoices, certificates, or forms) that needs to be distributed or filed separately.
      </p>
      <h3 className="mt-6 text-lg font-semibold text-[#383E45]">Extract Specific Pages</h3>
      <p className="mt-2 text-base leading-relaxed text-[#383E45]">
        Select individual pages from anywhere in the document and save them as a new PDF. Unlike range-based splitting which requires consecutive pages, this method lets you pick pages 2, 7, 15, and 22 from a 30-page document and combine them into one new file. This is ideal for extracting highlighted sections, relevant exhibits, or specific records from a larger archive.
      </p>

      {/* Section D */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Common Scenarios for Splitting PDF Files</h3>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Split a Large Report Into Chapters</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Annual reports, research papers, and technical manuals are often distributed as single large PDFs but contain clearly defined chapters or sections. Splitting by chapter page ranges creates separate files that individual team members or departments can receive without accessing unrelated sections.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Extract Individual Invoices from a Batch PDF</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Accounting software often exports monthly invoices as a single multi-page PDF. Splitting each invoice into its own file makes it easy to email individual invoices to clients, file them by customer name, or attach specific invoices to expense reports.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Separate Pages Before Distributing to Recipients</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">When a document contains information for multiple recipients — for example, a HR onboarding packet with different forms for different employees — splitting by recipient section ensures each person receives only the pages relevant to them.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Split Scanned Documents Into Individual Forms</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Scanning a stack of paper forms in one go produces a single multi-page PDF. Splitting each form onto its own PDF file creates properly organized digital records that can be named, filed, and retrieved individually.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Reduce File Size for Upload Limits</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">When a PDF is too large to upload to a portal, splitting it into smaller sections and uploading each separately is often the simplest solution. Split a 50-page document into five 10-page sections and upload them as separate attachments.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Extract Evidence or Exhibits for Legal Filings</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Legal professionals regularly need to extract specific pages, exhibits, or appendices from long case files. Splitting lets them pull out exactly the pages needed for a specific motion, filing, or presentation without sharing the entire confidential file.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Create Chapter Previews or Samples</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Publishers and content creators can split a full e-book or guide PDF to create free sample chapters. Extract the first chapter or introduction as a standalone PDF to share as a preview while keeping the rest of the document private.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Organize Scanned Archives by Topic</h3>
          <p className="mt-1.5 text-base leading-relaxed text-[#383E45]">Large scanned archives of historical records, medical files, or project documentation can be split into topic-based sections for easier navigation. Instead of scrolling through 300 pages to find one record, split the archive once and retrieve individual sections instantly.</p>
        </div>
      </div>

      {/* Section E - Comparison */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Browser-Based vs Server-Based PDF Splitting</h3>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#eee] text-base">
          <thead>
            <tr className="bg-[#f9f9f9]">
              <th className="border border-[#eee] p-3 text-left">Feature</th>
              <th className="border border-[#eee] p-3 text-left text-[#E5322D]">Our Tool</th>
              <th className="border border-[#eee] p-3 text-left text-[#383E45]">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#eee] p-3">File Privacy</td>
              <td className="border border-[#eee] p-3">Files stay on device</td>
              <td className="border border-[#eee] p-3">Files uploaded to server</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Speed</td>
              <td className="border border-[#eee] p-3">Instant processing</td>
              <td className="border border-[#eee] p-3">Upload/download delay</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">File Size Limit</td>
              <td className="border border-[#eee] p-3">No limit</td>
              <td className="border border-[#eee] p-3">Often 100-200MB cap</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Page Count Limit</td>
              <td className="border border-[#eee] p-3">No limit</td>
              <td className="border border-[#eee] p-3">Sometimes capped</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Works Offline</td>
              <td className="border border-[#eee] p-3">Yes after page loads</td>
              <td className="border border-[#eee] p-3">No</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Account Required</td>
              <td className="border border-[#eee] p-3">No</td>
              <td className="border border-[#eee] p-3">Adobe requires signup</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Watermarks</td>
              <td className="border border-[#eee] p-3">Never</td>
              <td className="border border-[#eee] p-3">Common on free tier</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Output ZIP Download</td>
              <td className="border border-[#eee] p-3">Yes for multiple files</td>
              <td className="border border-[#eee] p-3">Sometimes premium only</td>
            </tr>
            <tr>
              <td className="border border-[#eee] p-3">Cost</td>
              <td className="border border-[#eee] p-3">Always free</td>
              <td className="border border-[#eee] p-3">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Section F - Tips */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Tips for Splitting PDFs Effectively</h2>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Know Your Page Numbers Before Splitting</h3>
          <p className="mt-2 text-base leading-relaxed text-[#383E45]">Open the PDF in your browser and note the exact page numbers of each section you want to extract. PDF page numbers shown in the document header may differ from the actual PDF page order if the document has a cover page, table of contents, or front matter.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Compress After Splitting</h3>
          <p className="mt-2 text-base leading-relaxed text-[#383E45]">If the extracted pages still produce large files (because they contain high-resolution images), run each split PDF through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#E5322D] hover:underline">Compress PDF tool</Link> to reduce file size further before sharing.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Merge Specific Pages Before Splitting</h3>
          <p className="mt-2 text-base leading-relaxed text-[#383E45]">If you need pages from different parts of the document combined into one new file (for example, the introduction plus the conclusion), use our <Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="text-[#E5322D] hover:underline">Extract Pages tool</Link> to pull those pages out first, then if needed merge them with other content.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Use Delete Pages for Simple Trimming</h3>
          <p className="mt-2 text-base leading-relaxed text-[#383E45]">If you only need to remove a few pages from a document rather than splitting it into multiple files, our <Link to="/tools/$slug" params={{ slug: "delete-pages" }} className="text-[#E5322D] hover:underline">Delete Pages tool</Link> is faster. Upload the PDF, select the pages to remove, and download the trimmed version as a single file.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#383E45]">Rename Output Files Immediately</h3>
          <p className="mt-2 text-base leading-relaxed text-[#383E45]">Split PDFs are usually named generically. Rename each output file with a descriptive name immediately after downloading so you can find and share the right file without confusion later.</p>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Frequently Asked Questions About Splitting PDFs</h3>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none text-base font-semibold flex justify-between items-center text-[#383E45]">
              {f.q}
              <span className="ml-4 text-[#E5322D] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-base leading-relaxed text-[#383E45]">{f.a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <h2 className="mt-14 text-2xl font-bold text-[#383E45]">Related PDF Tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const splitFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const splitHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to split a PDF online for free",
  description: "Split PDF pages online free, cut a PDF into ranges or one file per page, directly in your browser with no upload, no signup and no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file you want to split" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Split PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/$slug#step-${i + 1}`,
    params: { slug: "split" },
  })),
};

export const splitSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Split PDF",
  description: "Split PDF online free, separate pages or extract page ranges in your browser with no upload, no signup and no watermark.",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1890"
  }
};
