import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const extractPagesRelated = [
  { to: "/tools/$slug", params: { slug: "split" }, name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/$slug", params: { slug: "delete-pages" }, name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/$slug", params: { slug: "reorder-pages" }, name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/$slug", params: { slug: "rotate" }, name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/$slug", params: { slug: "pdf-to-images" }, name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/$slug", params: { slug: "extract-images" }, name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
] as const;

const steps = [
  {
    title: "Step 1 — Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the page. Your file opens directly in your browser and is not uploaded to any server.",
  },
  {
    title: "Step 2 — Select Pages to Extract",
    text: "Once the PDF is loaded, you will see a thumbnail of every page. Simply click on the pages you want to extract. You can select single pages, a specific range, or multiple non-consecutive pages from across the entire document.",
  },
  {
    title: "Step 3 — Review and Commit",
    text: "The sidebar will show a live counter of how many pages you have selected. You can uncheck any page by clicking it again. The tool identifies exactly which pages to pull without touching the original file.",
  },
  {
    title: "Step 4 — Download Your New PDF",
    text: "Click the \"Extract Pages\" button. The tool assembles your selected pages into a new PDF document instantly. The download starts automatically, and your original PDF remains unchanged on your device.",
  },
];

const faqs = [
  {
    q: "How do I extract pages from a PDF for free?",
    a: "Open this page, click Select PDF file and choose your document, then click the thumbnail of every page you want to keep. The sidebar shows a live selection counter as you work. When the picks are ready, click Extract pages and a new PDF containing only those pages downloads to your device, no account, no card, no watermark on the output.",
  },
  {
    q: "Can I extract just one page from a PDF?",
    a: "Yes. Click exactly one thumbnail, the button will label itself Extract 1 page, and the tool produces a single-page PDF that is a byte-for-byte copy of that page from the source. This is the fastest way to save one page of a PDF as a separate file without opening any desktop software.",
  },
  {
    q: "Can I extract non-consecutive pages like 2, 7 and 15?",
    a: "Yes. Selection is free-form: click page 2, scroll down and click page 7, keep scrolling and click page 15. The order in which you click doesn't matter, and the pages don't have to be next to each other. In the extracted PDF they appear in numeric order, page 2 first, then page 7, then page 15, as a single three-page document.",
  },
  {
    q: "Will the extracted pages keep their quality?",
    a: "Yes. Each picked page is copied through untouched, the same fonts, the same embedded images at their original resolution, the same vector shapes. There is no re-render and no re-compression, so a scanned page at 300 dpi stays at 300 dpi and a text page keeps its selectable, searchable text.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, its thumbnails rendered and the new document assembled entirely inside your browser tab using pdf-lib. There is no network request for the actual processing, so the source file, the pages you skipped and the extracted output never reach our servers.",
  },
  {
    q: "Does the original PDF change?",
    a: "No. The tool only reads from the file you opened; it never writes back to it. The extracted pages arrive as a separate download named with an -extracted.pdf suffix, and the source PDF on your disk remains exactly as it was, same bytes, same modification time.",
  },
  {
    q: "Can I extract pages from a scanned PDF?",
    a: "Yes. Scanned PDFs are simply image pages wrapped in a PDF container, and this tool treats every page the same way, a thumbnail you can click to include. The picked scans move across at their original resolution, so the extracted PDF looks identical to those pages inside the source bundle.",
  },
  {
    q: "What's the difference between extracting and splitting?",
    a: "Extracting means picking the pages you want and putting them into one new PDF, you decide precisely which pages, in any combination. Splitting means dividing the whole document into several smaller PDFs by range or every-N-pages, every page ends up somewhere. If you only want a subset, use extract; if you want to break the file into parts and keep everything, use Split PDF.",
  },
  {
    q: "Can I extract pages on my phone?",
    a: "Yes. The workspace runs in mobile browsers the same way it does on desktop, tap the thumbnails you want, watch the selection counter update in the sidebar, tap Extract pages and the new PDF saves into your phone's downloads. There is no app to install and nothing to sign up for.",
  },
  {
    q: "Do I need Adobe Acrobat or an account?",
    a: "No. Adobe Acrobat's page-extraction feature sits behind the paid Acrobat Pro plan, and most online alternatives ask you to sign up or watermark the result. This page needs neither, it works entirely in-browser, is free, and the output PDF is clean.",
  },
  {
    q: "How many pages can I extract at once?",
    a: "There is no limit. You can extract a single page, a dozen pages, or even every page in the document. The tool processes your selection instantly regardless of the count.",
  },
  {
    q: "Is it possible to reorder pages while extracting?",
    a: "Our Extract Pages tool preserves the original order of the pages you select. If you need to rearrange them into a new sequence, please use our Reorder Pages tool instead.",
  },
  {
    q: "Can I extract pages from a password-protected PDF?",
    a: "Not directly. You first need to remove the protection using our Unlock PDF tool. Once the file is unlocked, you can open it here and extract your desired pages freely.",
  },
  {
    q: "Does extracting pages reduce the file size?",
    a: "Yes, because the resulting PDF only contains the subset of pages you selected. The data for the pages you didn't pick is not included in the new file, making it much smaller and easier to share.",
  },
  {
    q: "Is there any software to install?",
    a: "No. This is a fully web-based application. It works in any modern browser like Chrome, Firefox, Safari, or Edge without requiring any plugins or downloads.",
  },
];

export function ExtractPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <div>
        <h2>Why Extract Pages from a PDF?</h2>
        <p>PDF documents are often large, containing hundreds of pages that you may not need to share in their entirety. Whether it's a massive legal contract where only the signature page matters, a 500-page academic textbook where you only need one chapter for class, or a multi-page bank statement where you want to hide most of your transactions, extracting specific pages is a vital task. Our PDF page extractor allows you to isolate exactly what's important, creating a new, focused document in seconds.</p>
        <p>Sharing only the necessary pages is not just a matter of convenience; it's a matter of privacy and professionality. When you send a full document instead of a focused excerpt, you might inadvertently expose sensitive data found on other pages. By using our tool to pull out only the relevant content, you ensure that your recipient sees only what they are supposed to see. This targeted approach is essential for HR professionals, lawyers, and administrative staff who handle confidential information daily.</p>
        <p>Furthermore, extracting pages is the most effective way to reduce file size for email attachments and uploads. Instead of struggling with a 50MB file that hits the attachment limit, you can extract the few pages that actually matter, resulting in a much smaller PDF that sends instantly. Because our tool runs entirely in your browser, this process is not only secure but also incredibly fast, as there is no upload or download lag to worry about.</p>

        <h2>How to Extract Pages from a PDF — Step by Step</h2>
        <div className="mt-5 space-y-4 not-prose">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-[15px] font-semibold text-[#383E45]">{s.title}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-[#4B5563]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        <h2>Common Scenarios for PDF Page Extraction</h2>
        <h3>Save a Single Page for Verification</h3>
        <p>Often, government portals or employers require a single page of verification, such as the first page of a bank statement, a specific diploma certificate from a bundle, or a single utility bill from a multi-month PDF. Our tool makes it easy to select that one page and save it as a standalone PDF for immediate submission.</p>

        <h3>Isolate Chapters for Study</h3>
        <p>Students and teachers frequently work with massive digital textbooks. Instead of scrolling through 800 pages to find this week's reading, you can extract the specific chapter pages into a separate PDF. This makes it much easier to read on a mobile device or tablet and allows you to add specific annotations without cluttering the master file.</p>

        <h3>Extract Invoices from a Batch</h3>
        <p>Accounting departments often receive large PDF files containing dozens of separate invoices. With our extractor, you can pick out individual invoices one by one or in small groups, making it easier to file them in the correct vendor folders or upload them to accounting software.</p>

        <h3>Create Focused Meeting Excerpts</h3>
        <p>When preparing for a meeting, you might want to share only the executive summary and the financial charts from a long annual report. Extracting those few pages ensures that your team stays focused on the key data points rather than getting lost in the hundreds of pages of supplementary material.</p>

        <h2>Why Use Our Free PDF Page Extractor?</h2>
        <h3>Maximum Privacy and Security</h3>
        <p>Security is our top priority. Unlike other online tools that upload your documents to their servers, our Extract Pages tool works 100% locally in your browser. This means your PDF file never leaves your computer, ensuring that sensitive personal or business information remains completely private and secure.</p>

        <h3>No Watermarks, No Limits</h3>
        <p>We believe that essential document tools should be free and clean. Our tool adds absolutely no watermarks to your extracted PDFs, and we don't impose any daily usage limits. You can process as many documents as you need without ever seeing a "premium upgrade" prompt.</p>

        <h3>Perfect Quality Preservation</h3>
        <p>Our extraction engine is designed to lift pages directly from the source without re-rendering or re-compressing them. This ensures that the extracted pages maintain the exact resolution of the original images, the same selectable text, and the same high-quality fonts as the source document.</p>

        <h3>Works on Any Device</h3>
        <p>Whether you're using a high-powered desktop, a laptop, or even a smartphone, our tool works seamlessly. The responsive workspace adapts to your screen size, allowing you to select and extract PDF pages even while you're on the go.</p>

        <h2>Extract Pages vs. Split PDF vs. Delete Pages</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#ececef]">
            <thead>
              <tr className="bg-[#f7f7f8]">
                <th className="py-3 px-4 font-bold border border-[#ececef]">Goal</th>
                <th className="py-3 px-4 font-bold border border-[#ececef]">Best Tool to Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececef]">
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Pick specific pages to keep in one new file</td>
                <td className="py-3 px-4 border border-[#ececef]"><strong>Extract Pages</strong> (This Tool)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Divide a document into multiple smaller files</td>
                <td className="py-3 px-4 border border-[#ececef]"><Link to="/tools/$slug" params={{ slug: "split" }} className="text-[#e5322d] hover:underline">Split PDF</Link></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold border border-[#ececef]">Remove unwanted pages and keep the rest</td>
                <td className="py-3 px-4 border border-[#ececef]"><Link to="/tools/$slug" params={{ slug: "delete-pages" }} className="text-[#e5322d] hover:underline">Delete Pages</Link></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Frequently Asked Questions</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group border-b border-[#ececef] pb-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-[16px] font-semibold text-[#383E45]">
                {faq.q}
                <span className="text-[#e5322d] transition-transform group-open:rotate-45 text-2xl">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6B7280]">{faq.a}</p>
            </details>
          ))}
        </div>

        <h2>Related PDF Tools</h2>
        <RelatedToolsGrid items={extractPagesRelated} />
      </div>
    </section>
  );
}

export const extractPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const extractPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to extract pages from a PDF online for free",
  description: "Save specific pages from a PDF as a new PDF, entirely inside your browser, click thumbnails to pick any pages in any combination and download an extracted copy.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const extractPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Extract Pages",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "920" },
};

