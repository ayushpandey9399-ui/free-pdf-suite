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
    text: "Once the thumbnails are generated, simply click on the pages you wish to remove. Selected pages will be highlighted for easy identification. Click a selected page again to keep it. There is no range-entry control.",
  },
  {
    title: "Verify Your Selection",
    text: "Review the remaining pages to ensure you haven't accidentally marked important content for deletion. Our visual interface makes it easy to see exactly what the final document will look like.",
  },
  {
    title: "Generate and Download",
    text: "Click the 'Delete Pages' button. The tool will create a new PDF containing only the pages you kept. The processed file is ready for download after processing and stays 100% private.",
  },
];

const faqs = [
  {
    "q": "How do I choose pages to delete?",
    "a": "Click the page thumbnails to select pages for removal. Click a selected page again to deselect it before running Delete Pages."
  },
  {
    "q": "Can I delete every page?",
    "a": "No. At least one page must remain. The tool stops and asks you to keep at least one page."
  },
  {
    "q": "Does deletion reduce the quality of remaining pages?",
    "a": "Remaining pages are saved without being rendered into images. Existing text and image content is not re-encoded by this operation."
  },
  {
    "q": "Can I reorder the remaining pages?",
    "a": "Not in this tool. Delete pages first, then use Reorder Pages on the result if needed."
  },
  {
    "q": "Can I delete pages from a password-protected PDF?",
    "a": "Unlock the PDF first. Protected files are detected and cannot be processed directly."
  },
  {
    "q": "What limits should I expect?",
    "a": "One PDF is processed at a time. Free to use. Very large files depend on your device memory and thumbnail rendering may be slow."
  }
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Divide a PDF into multiple separate files." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Save specific pages as a new PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange pages with drag and drop." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Try reducing PDF file size" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix orientation of sideways pages." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove passwords from protected files." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages into your document." },
] as const;

export function DeletePagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to Delete PDF Pages Online, Step by Step
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Delete Pages vs Split PDF, What is the difference?
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p>
          While they might seem similar, deleting pages and splitting a PDF serve different purposes. When you delete pages, your goal is usually to create a single, 'cleaned-up' version of the original document. You identify the parts that aren't needed, like a blank back page or an old cover, and discard them permanently. The result is one file that is a direct, shorter descendant of the original.
        </p>
        <p>
          Splitting a PDF, on the other hand, is about reorganization and compartmentalization. You might have a 100-page document that contains 10 different invoices, and you want each invoice to be its own individual file. In this case, you aren't deleting anything; you are multiplying the document into many smaller, standalone units. Splitting is ideal for distribution, while deleting is ideal for refinement.
        </p>
        <p>
          Our platform offers dedicated tools for both workflows. If you find yourself needing to keep several disparate ranges as separate files, you should use the <Link to="/tools/$slug" params={{ slug: "split" }} className="text-[#e5322d] hover:underline">Split PDF</Link> tool. If you simply want to trim the fat from a single document, this 'Delete Pages' tool is the fastest and most intuitive option.
        </p>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        5 Tips for Cleaning Up Your PDFs Effectively
      </h2>
      <div className="mt-6 space-y-5">
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Use Thumbnail View to Spot Blanks</h3>
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
  description: "Remove unwanted pages from your PDF document after processing in your browser. No signup, no watermark, and your files never leave your device.",
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
};
