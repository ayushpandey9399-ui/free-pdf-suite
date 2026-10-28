import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Upload Your PDF Document",
    text: "Click the 'Select PDF file' button or simply drag and drop your file into the tool area. Your document is processed entirely within your browser, ensuring complete privacy and speed.",
  },
  {
    title: "Choose Your Editing Tools",
    text: "Use the sidebar to select from nine powerful tools including Text, Highlight, Freehand, and Images. Each tool comes with a customizable style panel to adjust colours, fonts, and sizes.",
  },
  {
    title: "Annotate and Edit Your PDF",
    text: "Click and drag to add text boxes, draw shapes, highlight important passages, or place images directly onto your document pages. Our editor provides real-time visual feedback for every change.",
  },
  {
    title: "Save Your Edited PDF",
    text: "Once you are satisfied with your edits, click 'Save PDF'. The tool generates a new version of your document with edits drawn into the output, ready for secure download.",
  },
];

const faqs = [
  {
    "q": "Can I add text to a PDF?",
    "a": "Yes. Use the Text tool to place new text and adjust its available style controls before saving."
  },
  {
    "q": "Can I change existing text?",
    "a": "The editor can expose editable text segments from a PDF text layer. Supported changes are saved using visual cover-and-replacement drawing, not word-processor reflow. Scans without a text layer and some scripts are not supported for existing-text editing."
  },
  {
    "q": "Does covering text securely remove it?",
    "a": "No. A rectangle or visual text replacement can hide content without removing the original information. Do not use a visual cover for confidential information."
  },
  {
    "q": "What annotations can I add?",
    "a": "The editor includes highlighting, rectangles, ellipses, lines, arrows, freehand drawing, text, and images. Use Select to adjust supported annotations."
  },
  {
    "q": "Can I undo changes before saving?",
    "a": "Yes. The editor has Undo and Redo controls. Inspect the pages before saving and keep the original file if you need to start again."
  },
  {
    "q": "Will saving overwrite my original PDF?",
    "a": "No. Save PDF creates a separate output with the edits drawn into the document. Free to use. Large documents depend on your device memory, and the downloaded file should be checked before sharing."
  }
];

const related = [
  { to: "/tools/$slug", params: { slug: "fill-forms" }, name: "Fill PDF Forms", blurb: "Easily complete and save interactive PDF forms." },
  { to: "/tools/$slug", params: { slug: "sign-pdf" }, name: "Sign PDF", blurb: "Add digital signatures to any document." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Reduce PDF file size with compression presets." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine multiple documents into a single PDF." },
  { to: "/tools/$slug", params: { slug: "protect-pdf" }, name: "Protect PDF", blurb: "Add password encryption to your sensitive files." },
  { to: "/tools/$slug", params: { slug: "flatten-pdf" }, name: "Flatten PDF", blurb: "Make your edits and annotations permanent." },
  { to: "/tools/$slug", params: { slug: "watermark" }, name: "Watermark PDF", blurb: "Add your brand logo or text to every page." },
  { to: "/tools/$slug", params: { slug: "redact-pdf" }, name: "Redact PDF", blurb: "Permanently black out sensitive information." },
] as const;

export function EditPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>How to edit a PDF: Step by Step</h2>
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

      <h2>What can you edit in a PDF?</h2>
      <h2>Add text and text boxes</h2>
      <p>Add labels, fill forms, or include extra notes by drawing text boxes anywhere on your document pages.</p>
      <h2>Insert images</h2>
      <p>Drop logos, signatures, or photos directly onto the page, resizing and positioning them exactly where you need them.</p>
      <h2>Add notes</h2>
      <p>Use the Text tool to place visible notes on a page. These are drawn into the saved PDF, not threaded review comments.</p>
      <h2>Draw and highlight</h2>
      <p>Use our highlighter for emphasis, or draw freehand to circle important areas, underline text, or sketch diagrams.</p>
      <h2>Add shapes and lines</h2>
      <p>Insert rectangles, ellipses, lines, and arrows to structure your document or highlight specific data fields.</p>

      <h2>PDF Editing vs. PDF Form Filling</h2>
      <p>It's important to distinguish between general PDF editing and formal PDF form filling. General editing (this tool) treats your PDF like a canvas, letting you add elements anywhere, regardless of how the document was built. This is perfect for marking up documents, adding notes, or fixing small errors on static files.</p>
      <p>PDF form filling, on the other hand, is meant for interactive documents designed with specific fillable fields (AcroForm). If you need to enter data into checkboxes, dropdown menus, or specific form inputs, our <strong>Fill PDF Forms</strong> tool is the better choice, as it interacts directly with the PDF’s internal form data structure.</p>
      <p>Using our general editor for non-interactive forms gives you more freedom to type anywhere, while form-filling tools provide a more structured approach for files specifically prepared to collect information from users.</p>

      <h2>5 Tips for PDF Editing</h2>
      <h2>Zoom in for precision</h2>
      <p>Use your browser's zoom or our tool's zoom features to place text and shapes more precisely.</p>
      <h2>Check alignment</h2>
      <p>Use shapes like lines or rectangles to help align your text boxes with the existing document structure.</p>
      <h2>Use Select mode</h2>
      <p>Always switch back to the Select tool after adding an element to move or resize it without accidentally creating new ones.</p>
      <h2>Use Undo for mistakes</h2>
      <p>Don't worry about errors; use the built-in Undo/Redo history to refine your annotations before finalizing the document.</p>
      <h2>Check before saving</h2>
      <p>Do a quick pass through your document preview to ensure every edit looks perfect before downloading the final file.</p>

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

export const editPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const editPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to edit a PDF online for free",
  description: "Add text, images, and annotations to any PDF document entirely in your browser without any signups or file uploads.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const editPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Edit PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
