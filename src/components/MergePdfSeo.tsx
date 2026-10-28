import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Select Your PDF Files",
    text: "Click the \"Select PDF files\" button or drag and drop your files directly onto the page. You can add two or more PDF files at once. There is no limit on the number of files or total file size.",
  },
  {
    title: "Step 2: Arrange the File Order",
    text: "Once your files are uploaded, you will see thumbnail previews of each PDF. Drag and drop the files to rearrange them in the order you want them to appear in the final merged document. The first file in the list becomes the first section of your combined PDF.",
  },
  {
    title: "Step 3: Click Merge PDF",
    text: "When you are satisfied with the order, click the \"Merge PDF\" button. The merging process runs entirely inside your browser using client-side JavaScript, so your files are never uploaded to any server. Processing typically takes just a few seconds, even for large documents.",
  },
  {
    title: "Step 4: Download Your Merged File",
    text: "Your combined PDF is ready instantly. Click the download button to save it to your device. The merged file preserves all original formatting, fonts, images, links, and page layouts from every source file without any quality loss.",
  },
];

const faqs = [
  {
    q: "Can I change the order before merging?",
    a: "Yes. Arrange the source PDFs in the desired order before merging. Their pages are appended in that order.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "Unlock password-protected PDFs first, then merge the unlocked copies.",
  },
  {
    q: "Can I merge PDFs with different page sizes?",
    a: "Yes. Copied pages retain their individual dimensions, so the merged PDF can contain mixed page sizes.",
  },
  {
    q: "What does the bookmark option add?",
    a: "When selected, the option adds one bookmark per source file, pointing to that file's first page in the merged PDF. It does not recreate the source files' existing bookmark trees.",
  },
  {
    q: "Is there a practical size limit?",
    a: "The tool is free to use. Large files and batches depend on available device memory, and merging can fail when browser resources are exhausted.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Separate a PDF into individual pages or custom ranges" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce file size without losing quality" },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove unwanted pages from any PDF" },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange pages within a single PDF" },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull out specific pages as a new file" },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages as section dividers" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix page orientation before merging" },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Convert JPG or PNG images into PDF before merging" },
] as const;

export function MergePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      {/* SECTION B */}
      <h2>
        How to Merge PDF Files Online: Step by Step
      </h2>
      <div className="mt-5 space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label={`Step ${i + 1}`}>
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[18px] font-bold text-[#33333c]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION F */}
      <h2>
        Tips for Merging PDF Files Effectively
      </h2>
      <div className="mt-5 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Name Your Files Before Merging</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Give each PDF a clear, descriptive filename before adding it to the merger. 
            This makes it easier to identify and reorder documents in the merge interface, especially when working with many files.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Check Page Orientation Consistency</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            If some of your PDFs are portrait and others are landscape, the merged file will preserve each page's original orientation. 
            For a consistent look, consider rotating pages using our <Link to="/tools/$slug" params={{ slug: "rotate" }} className="text-[#e5322d] hover:underline">Rotate PDF tool</Link> before merging.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Remove Unnecessary Pages First</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            If you only need certain pages from a large PDF, use our <Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="text-[#e5322d] hover:underline">Extract Pages tool</Link> or <Link to="/tools/$slug" params={{ slug: "delete-pages" }} className="text-[#e5322d] hover:underline">Delete Pages tool</Link> to pull out what you need before merging. 
            This keeps the final document lean and focused.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Compress After Merging for Smaller File Size</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Merged PDFs with many pages can become large. After merging, run the combined file through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#e5322d] hover:underline">Compress PDF tool</Link> to try to reduce the file size; results depend on the document and compression settings. 
            This is especially helpful before emailing or uploading.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Use Blank Pages as Section Dividers</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            For professional documents, consider adding blank separator pages between sections using our <Link to="/tools/$slug" params={{ slug: "add-blank-pages" }} className="text-[#e5322d] hover:underline">Add Blank Pages tool</Link> before merging. 
            This creates clear visual breaks when the document is printed double-sided.
          </p>
        </div>
      </div>

      {/* SECTION G */}
      <h2>
        Frequently Asked Questions About Merging PDFs
      </h2>
      <div className="mt-8 divide-y divide-[#ececef]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary>
              {f.q}
              <span className="ml-4 text-[#e5322d] text-xl">+</span>
            </summary>
            <div 
              className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]"
            >
              <p>{f.a}</p>
            </div>
          </details>
        ))}
      </div>

      {/* SECTION H */}
      <h2 className="text-center">
        Related PDF Tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const mergeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]*>?/gm, "") },
  })),
};

export const mergeHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Merge PDF Files Online",
  description: "Combine multiple PDF files into one organized document in seconds.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const mergeSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Merge PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};