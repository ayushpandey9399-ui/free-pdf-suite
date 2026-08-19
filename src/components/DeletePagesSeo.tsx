import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/delete-pages`;

const steps = [
  {
    title: "Upload Your PDF File",
    text: "Select the PDF document from which you want to remove pages or drag and drop it into the tool area. The file is parsed locally in your browser, so you don't have to wait for an upload to complete.",
  },
  {
    title: "Select Pages to Delete",
    text: "Once the thumbnails are generated, simply click on the pages you wish to remove. Selected pages will be highlighted for easy identification. You can also use the range selector for large documents.",
  },
  {
    title: "Verify Your Selection",
    text: "Review the remaining pages to ensure you haven't accidentally marked important content for deletion. Our visual interface makes it easy to see exactly what the final document will look like.",
  },
  {
    title: "Generate and Download",
    text: "Click the 'Delete Pages' button. The tool will create a new PDF containing only the pages you kept. The processed file is ready for download instantly and stays 100% private.",
  },
];

const faqs = [
  {
    q: "How do I delete pages from a PDF for free?",
    a: "Upload your PDF to our free online tool, click on the thumbnails of the pages you want to remove, and then click 'Delete Pages'. Your new PDF will be ready for download instantly.",
  },
  {
    q: "Can I remove multiple pages at once?",
    a: "Yes, you can select as many pages as you need to delete. You can click individual thumbnails or select ranges for faster processing.",
  },
  {
    q: "Is there a limit to the file size or number of pages?",
    a: "No, PDFToolConverter does not impose arbitrary limits on file size or page counts. The only limit is your device's memory since all processing happens locally.",
  },
  {
    q: "Are my files safe when I use this tool?",
    a: "Absolutely. We use browser-based processing, meaning your PDF never leaves your computer. We don't upload, store, or see your data.",
  },
  {
    q: "What is the difference between deleting pages and splitting a PDF?",
    a: "Deleting pages removes specific pages to create one smaller document. Splitting a PDF divides one document into multiple separate files based on ranges or every page.",
  },
  {
    q: "Can I undo a deletion if I make a mistake?",
    a: "While you are in the tool, you can simply click a selected page again to deselect it. Once you've downloaded the file, you would need to start over with the original PDF.",
  },
  {
    q: "Does deleting pages affect the quality of the remaining pages?",
    a: "No. Our tool uses direct PDF manipulation to remove page references, so the remaining content, images, and text are preserved exactly as they were in the original.",
  },
  {
    q: "Can I delete pages from a password-protected PDF?",
    a: "If the PDF is encrypted, you must first unlock it using our 'Unlock PDF' tool to allow modifications like page deletion.",
  },
  {
    q: "Is it possible to delete pages on a mobile phone?",
    a: "Yes, our tool is fully optimized for mobile browsers on both Android and iOS devices.",
  },
  {
    q: "Does the output PDF have a watermark?",
    a: "No. All tools on PDFToolConverter are 100% free and do not add any watermarks to your documents.",
  },
  {
    q: "How fast is the page removal process?",
    a: "Because there is no upload time, the process is near-instant. Most documents are processed in less than a second.",
  },
  {
    q: "Can I reorder the remaining pages at the same time?",
    a: "Currently, you should use our 'Reorder Pages' tool for rearranging. You can delete pages first and then reorder the result.",
  },
  {
    q: "Will internal links and bookmarks still work?",
    a: "Most internal links to remaining pages will continue to function. However, links pointing to deleted pages will obviously become broken.",
  },
  {
    q: "Can I delete blank pages automatically?",
    a: "You can easily spot blank pages in our thumbnail view and click to remove them manually in seconds.",
  },
  {
    q: "Is there any software I need to install?",
    a: "No, the tool runs entirely in your web browser (Chrome, Safari, Firefox, or Edge).",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Divide a PDF into multiple separate files." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Save specific pages as a new PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange pages with drag and drop." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce PDF file size without quality loss." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix orientation of sideways pages." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove passwords from protected files." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages into your document." },
] as const;

export function DeletePagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why delete pages from a PDF?
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p>
          Deleting pages from a PDF is a fundamental task for document management, yet many users struggle to find a simple, free way to do it without expensive software. Whether you've scanned a stack of documents and ended up with accidental blank pages, or you've received a large report where only a few sections are relevant to you, the ability to discard unwanted content is essential for maintaining clean and professional files.
        </p>
        <p>
          Beyond simple cleanup, removing pages is often a requirement for security and privacy. If you are sharing a contract or a financial statement, there may be sensitive cover sheets, internal notes, or confidential appendices that the recipient does not need to see. By deleting these pages before sending the file, you ensure that only the intended information is shared, reducing the risk of data leaks.
        </p>
        <p>
          File size is another major motivator. Large PDFs can be difficult to email or upload to government portals. Often, the bulk of a file comes from high-resolution cover images or long-winded legal disclaimers at the end of the document. Removing these non-essential pages can significantly reduce the total file size, making it much easier to distribute and store your documents efficiently.
        </p>
        <p>
          Finally, deleting pages allows you to curate content for specific audiences. If you are a teacher preparing a reading list or a professional assembling a portfolio, you might want to strip out irrelevant chapters or outdated projects. This focused approach ensures your audience isn't overwhelmed by unnecessary information, leading to better engagement and clarity.
        </p>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to Delete PDF Pages Online — Step by Step
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[17px] font-semibold">{s.title}</h2>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Delete Pages vs Split PDF — What is the difference?
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p>
          While they might seem similar, deleting pages and splitting a PDF serve different purposes. When you delete pages, your goal is usually to create a single, 'cleaned-up' version of the original document. You identify the parts that aren't needed—like a blank back page or an old cover—and discard them permanently. The result is one file that is a direct, shorter descendant of the original.
        </p>
        <p>
          Splitting a PDF, on the other hand, is about reorganization and compartmentalization. You might have a 100-page document that contains 10 different invoices, and you want each invoice to be its own individual file. In this case, you aren't deleting anything; you are multiplying the document into many smaller, standalone units. Splitting is ideal for distribution, while deleting is ideal for refinement.
        </p>
        <p>
          Our platform offers dedicated tools for both workflows. If you find yourself needing to keep several disparate ranges as separate files, you should use the <Link to="/tools/$slug" params={{ slug: "split" }} className="text-[#e5322d] hover:underline">Split PDF</Link> tool. If you simply want to trim the fat from a single document, this 'Delete Pages' tool is the fastest and most intuitive option.
        </p>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        8 Common Use Cases for Removing PDF Pages
      </h2>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-[17px] font-semibold">1. Removing Cover Pages</h2>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Professional reports often come with generic cover sheets that aren't needed when merging documents or saving space. Deleting them creates a more direct reading experience.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">2. Deleting Blank Pages</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Scanners often insert blank pages when processing double-sided documents. Our tool lets you visually identify and remove these empty pages in a single click.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">3. Removing Confidential Sections</h3>
          <p>
            Before sharing a file externally, you can delete pages containing internal financial data, private notes, or sensitive employee information that shouldn't be public.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">4. Trimming Scanned Documents</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            If you've scanned a 20-page document but only need the 5 pages of the actual contract, you can discard the extra pages instantly without re-scanning.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">5. Removing Ads from Downloaded PDFs</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Many free e-books and online manuals include several pages of advertisements at the beginning or end. Delete them to keep your reference library clean.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">6. Cleaning Up Merged Documents</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            After using our <Link to="/tools/$slug" params={{ slug: "merge" }} className="text-[#e5322d] hover:underline">Merge PDF</Link> tool, you might find redundant table of contents or index pages. Remove them to create a seamless unified document.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">7. Submission Requirements</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            University or government portals often have strict page limits for uploads. If your document is slightly over, you can remove non-essential pages to meet the requirements.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">8. Removing Outdated Content</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            When a document is updated, you may want to remove old terms of service or superseded price lists while keeping the rest of the document intact.
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Browser-Based vs Server-Based Page Deletion
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#ececef] text-left text-[14px]">
          <thead>
            <tr className="bg-[#f9fafb]">
              <th className="border border-[#ececef] p-3 font-semibold">Feature</th>
              <th className="border border-[#ececef] p-3 font-semibold">PDFToolConverter (Browser)</th>
              <th className="border border-[#ececef] p-3 font-semibold">Other Online Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Privacy</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">100% Private - Files never leave your PC</td>
              <td className="border border-[#ececef] p-3">Files are uploaded to a remote server</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Wait Time</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">Zero - No upload or download delay</td>
              <td className="border border-[#ececef] p-3">Dependent on your internet speed</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Security</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">Total - Local manipulation is safest</td>
              <td className="border border-[#ececef] p-3">Risk of intercept or server breach</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Cost</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">Always Free</td>
              <td className="border border-[#ececef] p-3">Often gated behind a subscription</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        5 Tips for Cleaning Up Your PDFs Effectively
      </h2>
      <div className="mt-6 space-y-5">
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Use Thumbnail View to Spot Blanks</h2>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Scroll through the thumbnails carefully. Blank pages or pages with scanning errors (like black lines) are easy to spot and remove in one go.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Combine with Reordering</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            If you need to move pages around as well as delete some, use our <Link to="/tools/$slug" params={{ slug: "reorder-pages" }} className="text-[#e5322d] hover:underline">Reorder Pages</Link> tool. It often provides the same deletion capability with the added benefit of drag-and-drop sorting.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Remove Meta-Data for Privacy</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            After deleting sensitive pages, it's also a good idea to clear the document's hidden properties using our <Link to="/tools/$slug" params={{ slug: "pdf-metadata" }} className="text-[#e5322d] hover:underline">PDF Metadata</Link> tool.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Save Ink and Paper</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Before printing a long document, delete the pages you don't need. It's a simple way to be more environmentally friendly and save on toner costs.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Check Internal Page References</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            If the document has a 'Table of Contents' that refers to page numbers, remember that deleting pages will change the total count. If precision is key, consider using the <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] hover:underline">Edit PDF</Link> tool to update the TOC.
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none text-[15.5px] font-semibold flex justify-between items-center text-[#1F2937]">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Related PDF Tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const deletePagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const deletePagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to delete pages from a PDF online for free",
  description: "Remove unwanted pages from your PDF document instantly in your browser. No signup, no watermark, and your files never leave your device.",
  totalTime: "PT1M",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `${url}#step-${i + 1}`,
  })),
};

export const deletePagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Delete Pages Tool",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "850",
  },
};
