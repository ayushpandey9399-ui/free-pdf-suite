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
    text: "Click the 'Extract Pages' button. The tool assembles your chosen pages into a new PDF for download with Download Extracted PDF. Your original file remains untouched.",
  },
];

const faqs = [
  {
    "q": "How do I select pages to extract?",
    "a": "Click each wanted thumbnail. Click it again to deselect it. Nonconsecutive pages can be selected together; the sidebar shows the selected count."
  },
  {
    "q": "In what order are extracted pages saved?",
    "a": "Selected pages are sorted by their original page numbers, not the order in which you clicked them."
  },
  {
    "q": "Will each selected page become a separate file?",
    "a": "No. All selected pages are copied into one new PDF. Use Split PDF if you need separate files."
  },
  {
    "q": "Does extraction change page quality?",
    "a": "The selected pages are copied into a new PDF without rendering them into images. The original file is not overwritten."
  },
  {
    "q": "Can I extract from a password-protected PDF?",
    "a": "Not directly. Unlock the PDF first, then select the pages to extract."
  },
  {
    "q": "Why is the extraction button disabled?",
    "a": "Select at least one page first. Free to use. Very large files depend on your device memory and thumbnail rendering may be slow."
  }
];

export function ExtractPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to extract PDF pages: Step by Step</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[15px] font-semibold text-[#383E45]">{s.title}</h3>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4B5563]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2>Extract pages vs split PDF vs delete pages: what is the difference?</h2>
      <p>While these tools may seem similar, they serve distinct purposes. <strong>Extracting pages</strong> is the process of hand-picking specific pages you want to keep and placing them into a single new document. It is the most surgical approach, ideal when you only need a small subset of a larger file.</p>
      <p><strong>Splitting a PDF</strong> is more about division. It allows you to take a single document and break it into multiple separate files, often by page ranges (e.g., pages 1-10 as file A and pages 11-20 as file B). This is best for organizing large reports into manageable chapters or individual invoices from a batch.</p>
      <p><strong>Deleting pages</strong> is essentially the inverse of extraction. Instead of picking what to keep, you identify the pages you want to discard, like blank pages or cover sheets, and remove them while keeping the rest of the document intact. Each tool is designed to make these specific workflows as fast and intuitive as possible.</p>

      <h2>5 tips for extracting PDF pages</h2>
      <h2>Use Thumbnail View to Spot Pages</h2>
      <p>Scroll through the thumbnails carefully to visually identify the exact pages you need. Check the selected page numbers before extracting.</p>
      <h2>Check Your Counter</h2>
      <p>Always keep an eye on the sidebar selection counter. It provides a quick sanity check to ensure you haven't missed a page or accidentally double-clicked.</p>
      <h2>Extract Multiple Ranges</h2>
      <p>Don't feel limited to consecutive pages. You can click on page 1, page 5, and page 50, and the tool will elegantly pull all three into a single new document.</p>
      <h2>Unlock Protected PDFs First</h2>
      <p>If your document is password protected, use our 'Unlock PDF' tool first so that this extractor can access and process the page data.</p>
      <h2>Check the Download</h2>
      <p>After extracting, do a quick scroll through your new file to ensure the page order and content are exactly what you needed before sharing it.</p>

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
  name: "PDFToolConverter Extract Pages",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
