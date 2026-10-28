import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/reorder-pages`;

const steps = [
  {
    title: "Upload Your PDF Document",
    text: "Click the 'Select PDF file' button or drag and drop your document into the workspace. Page thumbnails are rendered locally in your browser; large documents can take longer.",
  },
  {
    title: "Drag and Drop to Rearrange",
    text: "Simply grab any page thumbnail and drag it to its new position in the grid. The other pages will automatically shift to accommodate the new sequence in real-time.",
  },
  {
    title: "Verify the New Sequence",
    text: "Review the thumbnails to ensure the document flow is perfect. Move individual pages as many times as needed until the order is right.",
  },
  {
    title: "Export Your Reordered PDF",
    text: "Click the 'Reorder Pages' button. The tool assembles your document in the new sequence and starts the download immediately. Your original file remains untouched.",
  },
];

const faqs = [
  {
    q: "How do I rearrange pages in a PDF?",
    a: "Open one PDF, drag its page thumbnails into the required order, and click Export Reordered PDF. Download the result from the success screen.",
  },
  {
    q: "Can I move a page from the end to the beginning?",
    a: "Yes. Drag its thumbnail to the beginning of the grid, then review the sequence before exporting.",
  },
  {
    q: "Will reordering reduce the quality of my PDF?",
    a: "The tool copies PDF pages into a new document without rendering them as images. It does not intentionally recompress page images.",
  },
  {
    q: "Does my original file change?",
    a: "No. Export creates a new PDF and leaves the original file on your device unchanged.",
  },
  {
    q: "Can I reorder pages from multiple PDFs at once?",
    a: "This tool opens one PDF at a time. Merge the documents first if you need to arrange their pages together.",
  },
  {
    q: "Is there a page limit for reordering?",
    a: "Large documents depend on available device memory and thumbnail rendering resources. A document with many pages may take longer to open and export.",
  },
];

const related = [
  { to: "/tools/$slug", params: { slug: "split" }, name: "Split PDF", blurb: "Divide a PDF into multiple separate files." },
  { to: "/tools/$slug", params: { slug: "delete-pages" }, name: "Delete Pages", blurb: "Remove unwanted pages from your document." },
  { to: "/tools/$slug", params: { slug: "extract-pages" }, name: "Extract Pages", blurb: "Save specific pages as a new PDF." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine several PDFs into one file." },
  { to: "/tools/$slug", params: { slug: "rotate" }, name: "Rotate PDF", blurb: "Fix the orientation of sideways pages." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Try reducing PDF file size." },
  { to: "/tools/$slug", params: { slug: "add-blank-pages" }, name: "Add Blank Pages", blurb: "Insert empty pages into your PDF." },
  { to: "/tools/$slug", params: { slug: "crop" }, name: "Crop PDF", blurb: "Trim white margins or crop page edges." },
] as const;

export function ReorderPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to reorder PDF pages: Step by Step</h2>
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

      <h2>Reorder vs Split vs Delete pages: what is the difference?</h2>
      <p>It's important to choose the right tool for your specific document management needs. <strong>Reordering pages</strong> is about sequence; it takes every page in your file and lets you move them around without removing or adding anything. It is the best choice when the content is all there but in the wrong order.</p>
      <p><strong>Splitting a PDF</strong> is about division. It takes one document and breaks it into two or more separate files. This is useful if you have a single PDF containing multiple distinct documents that need to be filed individually.</p>
      <p><strong>Deleting pages</strong> is about removal. It allows you to pick specific pages, like blank sheets or irrelevant cover pages, and discard them permanently while keeping the rest of the document in its original order. Each tool is optimized for its specific task to ensure the best results.</p>

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
};
