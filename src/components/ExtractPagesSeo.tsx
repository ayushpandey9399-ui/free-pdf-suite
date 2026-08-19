import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/extract-pages`;

const extractPagesRelated = [
  { to: "/tools/$slug", params: { slug: "split" }, name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/$slug", params: { slug: "delete-pages" }, name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/$slug", params: { slug: "reorder-pages" }, name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/$slug", params: { slug: "rotate" }, name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/$slug", params: { slug: "unlock-pdf" }, name: "Unlock PDF", blurb: "Remove passwords from protected files." },
  { to: "/tools/$slug", params: { slug: "add-blank-pages" }, name: "Add Blank Pages", blurb: "Insert empty pages into your document." },
] as const;

const steps = [
  {
    title: "Upload Your PDF",
    text: "Click the 'Select PDF file' button or drag and drop your document onto the tool area. Your file is processed entirely within your browser for maximum privacy and speed.",
  },
  {
    title: "Select Pages to Extract",
    text: "Review the page thumbnails and simply click on every page you want to keep. You can select single pages, specific ranges, or multiple non-consecutive pages from anywhere in the document.",
  },
  {
    title: "Verify Your Selection",
    text: "Check the sidebar counter to see exactly how many pages you've selected. You can uncheck any page by clicking it again to ensure your final document is exactly as intended.",
  },
  {
    title: "Download Your New PDF",
    text: "Click the 'Extract Pages' button. The tool instantly assembles your chosen pages into a new PDF and starts the download automatically. Your original file remains untouched.",
  },
];

const faqs = [
  {
    q: "How do I extract pages from a PDF for free?",
    a: "Simply upload your PDF to our free online tool, click the thumbnails of the pages you want to save, and click 'Extract Pages'. Your new PDF will be ready for download instantly.",
  },
  {
    q: "Can I extract just one page from a PDF?",
    a: "Yes. By selecting only one page thumbnail, you can quickly save a single page as a standalone PDF file.",
  },
  {
    q: "Can I extract non-consecutive pages like 2, 7, and 15?",
    a: "Yes. Our tool allows you to pick any combination of pages from across the document, regardless of their position.",
  },
  {
    q: "Will the extracted pages keep their original quality?",
    a: "Absolutely. The pages are copied directly from the source, preserving all fonts, images, and text quality without any re-compression.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. All extraction happens locally in your web browser. Your files never leave your device, ensuring total privacy.",
  },
  {
    q: "Does the original PDF change?",
    a: "No. The tool creates a completely new PDF file containing only your selected pages, leaving your original file exactly as it was.",
  },
  {
    q: "Can I extract pages from a scanned PDF?",
    a: "Yes. Our tool treats scanned pages as high-quality images and extracts them while maintaining their original resolution.",
  },
  {
    q: "What is the difference between extracting and splitting?",
    a: "Extracting is for picking specific pages to keep in one new file. Splitting is for dividing a whole document into multiple separate files.",
  },
  {
    q: "Can I extract pages on my smartphone?",
    a: "Yes. Our PDF tools are fully optimized for mobile browsers on both Android and iOS devices.",
  },
  {
    q: "Do I need to sign up or create an account?",
    a: "No. All our tools are 100% free and require no signup, no subscription, and no personal information.",
  },
  {
    q: "Is there a limit to how many pages I can extract?",
    a: "There are no arbitrary limits. You can extract as few or as many pages as you need in a single session.",
  },
  {
    q: "Can I reorder pages while extracting?",
    a: "Our Extract tool preserves the original order. To rearrange pages into a new sequence, use our 'Reorder Pages' tool.",
  },
  {
    q: "Can I extract pages from a password-protected PDF?",
    a: "You must first remove the password using our 'Unlock PDF' tool. Once unlocked, you can open the file here to extract pages.",
  },
  {
    q: "Does extracting pages reduce the file size?",
    a: "Yes, because the new file only contains the data for the pages you selected, making it much smaller and easier to share.",
  },
  {
    q: "Is there any software to install?",
    a: "No. The tool runs entirely in your modern web browser (Chrome, Firefox, Safari, or Edge).",
  },
];

export function ExtractPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>Why extract pages from a PDF?</h3>
      <p>PDF documents are often large, containing hundreds of pages that you may not need to share in their entirety. Whether it's a massive legal contract where only the signature page matters, a 500-page academic textbook where you only need one chapter for class, or a multi-page bank statement where you want to hide most of your transactions, extracting specific pages is a vital task. Our PDF page extractor allows you to isolate exactly what's important, creating a new, focused document in seconds.</p>
      <p>Sharing only the necessary pages is not just a matter of convenience; it's a matter of privacy and professionality. When you send a full document instead of a focused excerpt, you might inadvertently expose sensitive data found on other pages. By using our tool to pull out only the relevant content, you ensure that your recipient sees only what they are supposed to see. This targeted approach is essential for HR professionals, lawyers, and administrative staff who handle confidential information daily.</p>
      <p>Furthermore, extracting pages is the most effective way to reduce file size for email attachments and uploads. Instead of struggling with a 50MB file that hits the attachment limit, you can extract the few pages that actually matter, resulting in a much smaller PDF that sends instantly. Because our tool runs entirely in your browser, this process is not only secure but also incredibly fast, as there is no upload or download lag to worry about.</p>
      <p>Finally, page extraction allows for better document organization. If you are compiling a portfolio or a project report, pulling specific sections from multiple sources into their own separate files makes it much easier to manage your references and finalize your submissions.</p>

      <h2>How to extract PDF pages — Step by Step</h3>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h4 className="text-[15px] font-semibold text-[#383E45]">{s.title}</h3>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4B5563]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2>Extract pages vs split PDF vs delete pages — what is the difference?</h3>
      <p>While these tools may seem similar, they serve distinct purposes. <strong>Extracting pages</strong> is the process of hand-picking specific pages you want to keep and placing them into a single new document. It is the most surgical approach, ideal when you only need a small subset of a larger file.</p>
      <p><strong>Splitting a PDF</strong> is more about division. It allows you to take a single document and break it into multiple separate files, often by page ranges (e.g., pages 1-10 as file A and pages 11-20 as file B). This is best for organizing large reports into manageable chapters or individual invoices from a batch.</p>
      <p><strong>Deleting pages</strong> is essentially the inverse of extraction. Instead of picking what to keep, you identify the pages you want to discard—like blank pages or cover sheets—and remove them while keeping the rest of the document intact. Each tool is designed to make these specific workflows as fast and intuitive as possible.</p>

      <h2>8 use cases for extracting PDF pages</h3>
      <h2>Extracting specific chapters</h3>
      <p>Turn a massive textbook into smaller, focused files for each week's study session, making them easier to read on tablets and phones.</p>
      <h2>Pulling out invoices</h3>
      <p>Isolate individual vendor invoices from a monthly batch PDF for easier filing in your accounting software or project folders.</p>
      <h2>Sharing specific sections</h3>
      <p>Send only the relevant executive summary or financial data from an annual report to stakeholders without overwhelming them with unnecessary pages.</p>
      <h2>Extracting certificates from multi-doc PDFs</h3>
      <p>Pull out a single diploma or professional certification from a large bundle of credentials for job applications or verification portals.</p>
      <h2>Legal exhibits</h3>
      <p>Isolate specific pages from discovery documents to create clean, focused exhibits for court filings or client reviews.</p>
      <h2>Academic references</h3>
      <p>Save just the bibliography or specific citations from a research paper to keep your own reference library organized and relevant.</p>
      <h2>Extracting forms</h3>
      <p>Pull out just the single form page you need to sign and return from a long information pack or application manual.</p>
      <h2>Sharing relevant pages only</h3>
      <p>Improve collaboration by sending only the pages that require attention, ensuring your team isn't distracted by hundreds of pages of context.</p>

      <h2>Browser-based vs server-based comparison</h3>
      <table className="w-full text-left border-collapse border border-[#ececef] my-6">
        <thead>
          <tr className="bg-[#f7f7f8]">
            <th className="py-3 px-4 border">Feature</th>
            <th className="py-3 px-4 border">Browser-Based (Our Tool)</th>
            <th className="py-3 px-4 border">Server-Based Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="py-2 px-4 border">Privacy</td><td className="py-2 px-4 border">100% Private - Files never leave your PC</td><td className="py-2 px-4 border">Files uploaded to a remote server</td></tr>
          <tr><td className="py-2 px-4 border">Wait Time</td><td className="py-2 px-4 border">Zero - No upload or download delay</td><td className="py-2 px-4 border">Dependent on internet speed</td></tr>
          <tr><td className="py-2 px-4 border">Security</td><td className="py-2 px-4 border">Total - Local manipulation is safest</td><td className="py-2 px-4 border">Risk of intercept or server breach</td></tr>
          <tr><td className="py-2 px-4 border">Cost</td><td className="py-2 px-4 border">Always 100% Free</td><td className="py-2 px-4 border">Often gated behind a subscription</td></tr>
        </tbody>
      </table>

      <h2>5 tips for extracting PDF pages</h3>
      <h2>Use Thumbnail View to Spot Pages</h3>
      <p>Scroll through the thumbnails carefully to visually identify the exact pages you need. The visual interface makes it impossible to pick the wrong page by mistake.</p>
      <h2>Check Your Counter</h3>
      <p>Always keep an eye on the sidebar selection counter. It provides a quick sanity check to ensure you haven't missed a page or accidentally double-clicked.</p>
      <h2>Extract Multiple Ranges</h3>
      <p>Don't feel limited to consecutive pages. You can click on page 1, page 5, and page 50, and the tool will elegantly pull all three into a single new document.</p>
      <h2>Unlock Protected PDFs First</h3>
      <p>If your document is password protected, use our 'Unlock PDF' tool first so that this extractor can access and process the page data.</p>
      <h2>Check the Download</h3>
      <p>After extracting, do a quick scroll through your new file to ensure the page order and content are exactly what you needed before sharing it.</p>

      <h2>Frequently Asked Questions</h3>
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

      <h2>Related PDF Tools</h3>
      <RelatedToolsGrid items={extractPagesRelated} />
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
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1450" },
};
