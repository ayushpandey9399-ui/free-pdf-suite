import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
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
    text: "Once you are satisfied with your edits, click 'Save PDF'. The tool instantly generates a new version of your document with all annotations permanently applied, ready for secure download.",
  },
];

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How can I edit a PDF for free without Adobe?",
    a: "Our free PDF editor allows you to add text, images, annotations, and shapes directly in your browser. Simply upload your PDF, choose a tool from the sidebar, and make your edits instantly—no Adobe Acrobat or subscription required.",
  },
  {
    q: "Can I add text to a PDF?",
    a: "Yes! Use the Text tool to create boxes and type anywhere on your document. You can customize the font size, colour, and styling to match your existing document.",
  },
  {
    q: "Is it possible to edit existing text in a PDF?",
    a: "While PDFs are not inherently editable like Word documents, our tool allows you to 'edit' by covering existing text with a matching background rectangle and typing your new content on top, creating a seamless visual correction.",
  },
  {
    q: "Can I add images to a PDF?",
    a: "Absolutely. Use the Image tool to drop logos, signatures, or any graphic onto your PDF pages and adjust the position and size as needed.",
  },
  {
    q: "Are my documents safe when using an online PDF editor?",
    a: "Yes. Our tool is entirely browser-based, meaning your files never leave your device. All processing happens locally for maximum security and privacy.",
  },
  {
    q: "Can I annotate and highlight PDFs?",
    a: "Yes, you can use our highlighter tool for passages, or add shapes like rectangles, ellipses, and arrows to draw attention to specific details.",
  },
  {
    q: "Will my edits be permanent?",
    a: "When you click 'Save PDF', your annotations are merged into the document, making them a permanent part of the file that will display correctly in all PDF viewers.",
  },
  {
    q: "Is this PDF editor really free?",
    a: "Yes, all tools on our site are 100% free with no hidden charges, no watermarks on output, and no subscription requirements.",
  },
  {
    q: "Can I use this editor on my mobile device?",
    a: "Our PDF editor is fully responsive and optimized for touch, allowing you to annotate and edit PDFs easily on smartphones and tablets.",
  },
  {
    q: "What is the difference between this tool and Fill PDF Forms?",
    a: "This editor is for free-form annotations and edits on any PDF. 'Fill PDF Forms' is specifically designed to interact with built-in form fields like checkboxes and dropdown menus.",
  },
  {
    q: "Can I add a signature to my PDF?",
    a: "Yes, you can upload your signature as an image or use the Freehand/Text tools to sign your documents quickly and easily.",
  },
  {
    q: "Are there any file size limits?",
    a: "We do not impose strict file size limits; processing speed depends on your device's memory, making it efficient for even long documents.",
  },
  {
    q: "Will this change the document's original formatting?",
    a: "Your edits are applied as an overlay. The underlying document content remains unchanged, keeping your original layout intact.",
  },
  {
    q: "Can I draw on the PDF?",
    a: "Yes, the Freehand tool allows you to draw or sketch anything directly on the document pages, just like using a digital pen.",
  },
  {
    q: "Is there any software to download?",
    a: "No installation is required. Everything runs directly in your web browser.",
  },
];

const related = [
  { to: "/tools/$slug", params: { slug: "fill-forms" }, name: "Fill PDF Forms", blurb: "Easily complete and save interactive PDF forms." },
  { to: "/tools/$slug", params: { slug: "sign-pdf" }, name: "Sign PDF", blurb: "Add digital signatures to any document." },
  { to: "/tools/$slug", params: { slug: "compress" }, name: "Compress PDF", blurb: "Reduce PDF file size without quality loss." },
  { to: "/tools/$slug", params: { slug: "merge" }, name: "Merge PDF", blurb: "Combine multiple documents into a single PDF." },
  { to: "/tools/$slug", params: { slug: "protect-pdf" }, name: "Protect PDF", blurb: "Add password encryption to your sensitive files." },
  { to: "/tools/$slug", params: { slug: "flatten-pdf" }, name: "Flatten PDF", blurb: "Make your edits and annotations permanent." },
  { to: "/tools/$slug", params: { slug: "watermark" }, name: "Watermark PDF", blurb: "Add your brand logo or text to every page." },
  { to: "/tools/$slug", params: { slug: "redact-pdf" }, name: "Redact PDF", blurb: "Permanently black out sensitive information." },
] as const;

export function EditPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>Why Edit PDFs Online?</h2>
      <p>Editing PDFs used to require expensive, heavy desktop software like Adobe Acrobat. Now, you can perform essential edits directly in your web browser. Online PDF editing is perfect for quick adjustments, such as adding a missing signature, correcting a typo, or adding a brief annotation. By keeping everything in the browser, you maintain total control over your files while enjoying the convenience of instant access without the need for installations.</p>
      <p>Beyond convenience, our browser-based approach provides a significant privacy advantage. When you use traditional cloud-based PDF editors, your documents are uploaded to a remote server, where they are parsed and stored—at least temporarily. With our PDF editor, all processing happens locally on your device. Your file stays on your computer, providing peace of mind when working with confidential contracts, personal identification, or financial documents.</p>
      <p>Whether you need to mark up a research paper, add logos to a flyer, or simply fill in a non-interactive form, an online PDF editor gives you the versatility to do it all in seconds. It bridges the gap between static documents and dynamic workflows, allowing you to turn a rigid file into an active, collaborative document without the cost or complexity of professional design software.</p>
      <p>Finally, the accessibility of online PDF editing cannot be overstated. You can start a edit on your office desktop, make a quick change from your tablet during a meeting, or finish your task from a home laptop. Because it's all web-based, you have a consistent toolset at your fingertips, no matter where your day takes you.</p>

      <h2>How to edit a PDF — Step by Step</h2>
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
      <h2>Add annotations and comments</h2>
      <p>Leave notes and feedback on specific sections of your PDF, making it easy for collaborators to review your points.</p>
      <h2>Draw and highlight</h2>
      <p>Use our highlighter for emphasis, or draw freehand to circle important areas, underline text, or sketch diagrams.</p>
      <h2>Add shapes and lines</h2>
      <p>Insert rectangles, ellipses, lines, and arrows to structure your document or highlight specific data fields.</p>

      <h2>8 Use Cases for PDF Editing</h2>
      <h2>Adding comments to contracts</h2>
      <p>Review legal agreements by adding your specific feedback directly in the margins, making it clear what parts of the contract need adjustment.</p>
      <h2>Filling non-interactive forms</h2>
      <p>For scans or older PDFs without form fields, our text tool lets you type responses in exactly the right spots.</p>
      <h2>Annotating research papers</h2>
      <p>Use highlights and freehand notes to mark key findings in technical papers, making it easier to study complex concepts.</p>
      <h2>Adding logos to documents</h2>
      <p>Quickly brand your quotes or invoices by placing your company logo in the header or footer section.</p>
      <h2>Marking up designs</h2>
      <p>Use arrows and shapes to give specific design feedback on layout previews without the need for specialized design software.</p>
      <h2>Adding notes to presentations</h2>
      <p>Include quick reminders or speaker notes directly onto your PDF slide decks for easy reference during a presentation.</p>
      <h2>Correcting typos</h2>
      <p>Fix minor spelling or data errors in PDFs by masking the original and typing the correct version on top.</p>
      <h2>Adding stamps or labels</h2>
      <p>Use rectangles, text, and images to create custom 'Approved', 'Confidential', or 'Draft' labels for your internal documents.</p>

      <h2>PDF Editing vs. PDF Form Filling</h2>
      <p>It's important to distinguish between general PDF editing and formal PDF form filling. General editing (this tool) treats your PDF like a canvas, letting you add elements anywhere, regardless of how the document was built. This is perfect for marking up documents, adding notes, or fixing small errors on static files.</p>
      <p>PDF form filling, on the other hand, is meant for interactive documents designed with specific fillable fields (AcroForm). If you need to enter data into checkboxes, dropdown menus, or specific form inputs, our <strong>Fill PDF Forms</strong> tool is the better choice, as it interacts directly with the PDF’s internal form data structure.</p>
      <p>Using our general editor for non-interactive forms gives you more freedom to type anywhere, while form-filling tools provide a more structured approach for files specifically prepared to collect information from users.</p>

      <h2>Browser-Based vs. Server-Based Comparison</h2>
      <table className="w-full text-left border-collapse border border-[#ececef] my-6">
        <thead>
          <tr className="bg-[#f7f7f8]">
            <th className="py-3 px-4 border">Feature</th>
            <th className="py-3 px-4 border">Browser-Based (Our Tool)</th>
            <th className="py-3 px-4 border">Server-Based Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="py-2 px-4 border">Privacy</td><td className="py-2 px-4 border">Files never leave your computer</td><td className="py-2 px-4 border">Files uploaded to servers</td></tr>
          <tr><td className="py-2 px-4 border">Wait Time</td><td className="py-2 px-4 border">Instant</td><td className="py-2 px-4 border">Upload/Download lag</td></tr>
          <tr><td className="py-2 px-4 border">Offline Usage</td><td className="py-2 px-4 border">Works offline</td><td className="py-2 px-4 border">Requires connection</td></tr>
          <tr><td className="py-2 px-4 border">Watermarks</td><td className="py-2 px-4 border">None</td><td className="py-2 px-4 border">Often included</td></tr>
        </tbody>
      </table>

      <h2>5 Tips for PDF Editing</h2>
      <h2>Zoom in for precision</h2>
      <p>Use your browser's zoom or our tool's zoom features to place text and shapes with pixel-perfect accuracy.</p>
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
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1780" },
};
