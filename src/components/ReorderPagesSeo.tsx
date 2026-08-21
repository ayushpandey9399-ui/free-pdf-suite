import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/reorder-pages`;

const steps = [
  {
    title: "Upload Your PDF Document",
    text: "Click the 'Select PDF file' button or drag and drop your document into the workspace. The tool renders every page as a thumbnail locally in your browser instantly.",
  },
  {
    title: "Drag and Drop to Rearrange",
    text: "Simply grab any page thumbnail and drag it to its new position in the grid. The other pages will automatically shift to accommodate the new sequence in real-time.",
  },
  {
    title: "Verify the New Sequence",
    text: "Review the thumbnails to ensure the document flow is perfect. You can move individual pages or entire sections as many times as needed to get the order exactly right.",
  },
  {
    title: "Export Your Reordered PDF",
    text: "Click the 'Reorder Pages' button. The tool assembles your document in the new sequence and starts the download immediately. Your original file remains untouched.",
  },
];

const faqs = [
  {
    q: "How do I rearrange pages in a PDF for free?",
    a: "Upload your PDF to our tool, drag the page thumbnails into the correct order, and click 'Reorder Pages'. The process is instant, free, and happens entirely in your browser.",
  },
  {
    q: "Can I move a page from the end to the beginning?",
    a: "Yes. Our drag-and-drop interface allows you to move any page to any position within the document, whether it's moving the last page to the front or vice-versa.",
  },
  {
    q: "My scan came out in the wrong order, can I fix it?",
    a: "Absolutely. This is the perfect tool for fixing scanned documents where pages were fed in reverse or shuffled during processing.",
  },
  {
    q: "Can I reorder pages on my mobile phone?",
    a: "Yes. Our interface is fully touch-optimized, allowing you to rearrange PDF pages easily on smartphones and tablets.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. All reordering and processing happen locally on your device. Your sensitive documents never leave your browser, ensuring total privacy.",
  },
  {
    q: "Will reordering reduce the quality of my PDF?",
    a: "No. The tool copies pages directly from the source without re-compressing them, so your text, images, and fonts remain exactly as they were.",
  },
  {
    q: "Does my original file change?",
    a: "No. The tool creates a new version of your PDF with the updated page order, leaving your original file on your disk completely unchanged.",
  },
  {
    q: "Can I reorder a scanned PDF?",
    a: "Yes. Scanned PDFs are treated just like any other PDF. You can see the page images in the grid and move them into the correct sequence visually.",
  },
  {
    q: "Is there a page limit for reordering?",
    a: "We do not impose a strict page limit. You can comfortably reorder documents with hundreds of pages directly in your browser.",
  },
  {
    q: "Do I need Adobe Acrobat to rearrange pages?",
    a: "No. While Acrobat Pro offers this feature for a fee, our tool provides the same functionality for free, without any signups or watermarks.",
  },
  {
    q: "Can I reorder pages from multiple PDFs at once?",
    a: "Currently, you should merge your files first using our 'Merge PDF' tool and then use this tool to finalize the page sequence.",
  },
  {
    q: "Will internal links still work after reordering?",
    a: "Most internal page links will still function, though some complex bookmarks may need to be checked depending on how the original PDF was structured.",
  },
  {
    q: "Can I rotate pages while reordering?",
    a: "For rotating pages, please use our dedicated 'Rotate PDF' tool, which provides specific controls for page orientation.",
  },
  {
    q: "How fast is the reordering process?",
    a: "Since there is no upload time, the process is near-instant. The document is rebuilt as soon as you click the export button.",
  },
  {
    q: "Is there any software I need to install?",
    a: "No installation is required. The tool works in any modern web browser like Chrome, Safari, Firefox, or Edge.",
  },
];

const related = [
  { to: "/tools/$slug", params: { slug: "split" }, name: "Split PDF", blurb: "Divide a PDF into multiple separate files." },
  { to: "/tools/$slug", params: { slug: "delete-pages" }, name: "Delete Pages", blurb: "Remove unwanted pages from your document." },
  { to: "/tools/$slug", params: { slug: "extract-pages" }, name: "Extract Pages", blurb: "Save specific pages as a new PDF." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine several PDFs into one file." },
  { to: "/tools/$slug", params: { slug: "rotate" }, name: "Rotate PDF", blurb: "Fix the orientation of sideways pages." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Reduce file size without quality loss." },
  { to: "/tools/$slug", params: { slug: "add-blank-pages" }, name: "Add Blank Pages", blurb: "Insert empty pages into your PDF." },
  { to: "/tools/$slug", params: { slug: "crop" }, name: "Crop PDF", blurb: "Trim white margins or crop page edges." },
] as const;

export function ReorderPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>Why reorder PDF pages?</h2>
      <p>Managing digital documents often involves fixing errors that occurred during creation or scanning. Reordering PDF pages is one of the most common tasks for professionals who need their documents to be perfectly structured. Whether you've scanned a stack of papers and found them out of sequence, or you're assembling a complex report from multiple contributors, the ability to rearrange pages visually is essential for maintaining a logical flow.</p>
      <p>Professional presentation is key in business and academia. A document with sections in the wrong order—like a resume appearing before the cover letter, or a conclusion sandwiched between data tables—looks disorganized and can confuse your audience. By reordering pages, you ensure that your message is delivered exactly as intended, leading to better engagement and clarity for your readers.</p>
      <p>Reorganizing merged documents is another major use case. When you combine several PDFs, the resulting file might not follow the desired sequence. Instead of re-merging every individual file in a specific order, you can simply merge them all at once and then use our reorder tool to fine-tune the final sequence. This saves significant time and effort, especially when dealing with dozens of source files.</p>
      <p>Finally, browser-based reordering offers a massive privacy advantage. Traditional methods often involve uploading your entire document to a third-party server. With our tool, every page stays on your device. You can rearrange sensitive contracts, medical records, or financial statements with total peace of mind, knowing that your data never leaves your computer.</p>

      <h2>How to reorder PDF pages — Step by Step</h2>
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

      <h2>Common causes of wrong page order</h2>
      <h2>Scanning pages out of sequence</h2>
      <p>Sheet-fed scanners can easily pull multiple pages at once or feed them in reverse order if the stack isn't prepared perfectly. Manual scanning is also prone to human error, resulting in a disorganized digital file.</p>
      <h2>Merging PDFs from different sources</h2>
      <p>When you combine files from various departments or teammates, the default merge order might not match your final requirements, requiring a quick reorganization of the resulting bundle.</p>
      <h2>Exporting from design software</h2>
      <p>Design tools like Canva or Adobe InDesign sometimes export artboards in an unexpected sequence, especially when working with complex multi-page layouts.</p>
      <h2>Combining documents from multiple contributors</h2>
      <p>Assembling a final report from several individual contributions often means the sections arrive in a random order that needs to be fixed before final publication.</p>

      <h2>8 use cases for reordering PDF pages</h2>
      <h2>Fixing scanned documents</h2>
      <p>Quickly restore the correct sequence to a document that was scanned upside down or in reverse, saving you from the hassle of re-scanning the entire stack.</p>
      <h2>Reorganizing reports</h2>
      <p>Move the executive summary to the very beginning and ensure that all supporting charts and appendices follow the main text in a logical flow.</p>
      <h2>Reordering book chapters</h2>
      <p>Organize your e-book or manual draft by moving chapters into their final sequence before generating the table of contents.</p>
      <h2>Fixing merged contracts</h2>
      <p>Ensure that the main agreement comes first, followed by all relevant addendums and the final signature page in a professional bundle.</p>
      <h2>Reorganizing portfolios</h2>
      <p>Arrange your best work at the front of your PDF portfolio to make a strong first impression on potential clients or employers.</p>
      <h2>Fixing presentation exports</h2>
      <p>Adjust the slide order of your PDF presentation if the original export from PowerPoint or Keynote didn't match your speaking flow.</p>
      <h2>Legal document ordering</h2>
      <p>Arrange discovery documents and court filings into a strict chronological or thematic order for better clarity during legal proceedings.</p>
      <h2>Academic paper organization</h2>
      <p>Ensure that your thesis or research paper follows the correct academic structure, moving the abstract and bibliography to their required positions.</p>

      <h2>Reorder vs Split vs Delete pages — what is the difference?</h2>
      <p>It's important to choose the right tool for your specific document management needs. <strong>Reordering pages</strong> is about sequence; it takes every page in your file and lets you move them around without removing or adding anything. It is the best choice when the content is all there but in the wrong order.</p>
      <p><strong>Splitting a PDF</strong> is about division. It takes one document and breaks it into two or more separate files. This is useful if you have a single PDF containing multiple distinct documents that need to be filed individually.</p>
      <p><strong>Deleting pages</strong> is about removal. It allows you to pick specific pages—like blank sheets or irrelevant cover pages—and discard them permanently while keeping the rest of the document in its original order. Each tool is optimized for its specific task to ensure the best results.</p>

      <h2>Browser-based vs server-based comparison</h2>
      <table className="w-full text-left border-collapse border border-[#ececef] my-6">
        <thead>
          <tr className="bg-[#f7f7f8]">
            <th className="py-3 px-4 border">Feature</th>
            <th className="py-3 px-4 border">Browser-Based (Our Tool)</th>
            <th className="py-3 px-4 border">Server-Based Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="py-2 px-4 border">Privacy</td><td className="py-2 px-4 border">100% Private - Files stay on your device</td><td className="py-2 px-4 border">Files uploaded to a remote server</td></tr>
          <tr><td className="py-2 px-4 border">Wait Time</td><td className="py-2 px-4 border">Near-instant processing</td><td className="py-2 px-4 border">Dependent on upload/download speed</td></tr>
          <tr><td className="py-2 px-4 border">Security</td><td className="py-2 px-4 border">Highest - No network transmission</td><td className="py-2 px-4 border">Risk of interception during transfer</td></tr>
          <tr><td className="py-2 px-4 border">Cost</td><td className="py-2 px-4 border">Always 100% Free</td><td className="py-2 px-4 border">Often requires subscription</td></tr>
        </tbody>
      </table>

      <h2>5 tips for reordering PDF pages</h2>
      <h2>Use the visual grid</h2>
      <p>Take advantage of the thumbnail grid to see exactly what each page looks like before you move it, ensuring you don't miss a single page.</p>
      <h2>Reorder large files in sections</h2>
      <p>For very long documents, try reordering one section at a time to maintain clarity and focus as you move through the document.</p>
      <h2>Double-check the first and last pages</h2>
      <p>The first and last pages are the most important for professional presentation; ensure they are positioned perfectly before exporting.</p>
      <h2>Combine with other tools</h2>
      <p>If you need to both rotate and reorder, use our 'Rotate PDF' tool first to fix orientations, then use this tool to finalize the sequence.</p>
      <h2>Preview the final order</h2>
      <p>Scan the grid one last time from top-left to bottom-right to confirm the sequence is exactly what you need before clicking the save button.</p>

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
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const reorderPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const reorderPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to rearrange PDF pages online for free",
  description: "Reorder PDF pages entirely inside your browser, drag thumbnails into a new sequence and download the rearranged copy. The original file is not modified and never leaves your device.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const reorderPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Reorder Pages",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1230" },
};
