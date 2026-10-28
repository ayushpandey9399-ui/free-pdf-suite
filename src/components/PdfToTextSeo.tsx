import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Click Select PDF file and pick the document",
    text: "Choose the PDF you want the words out of from your computer or phone. The file opens locally in the workspace as a selected file card; no upload happens at this step, and nothing about the document has been shared with us to reach the picker.",
  },
  {
    title: "Click Extract Text and wait for the progress bar",
    text: "The tool walks through the PDF one page at a time and pulls the text layer out of each one. You'll see a percentage tick up as pages are processed, a long report simply takes a few more seconds than a one-pager, but everything is happening in your browser tab.",
  },
  {
    title: "Read the preview to check the result",
    text: "The extracted text appears in a scrollable preview panel with a --- Page N --- marker between pages, so you can quickly confirm the order and spot any page that came back empty (those are labelled [No text found on this page]).",
  },
  {
    title: "Copy to clipboard or download as .txt",
    text: "Hit Copy to clipboard to paste the whole document straight into a note, email or chat, or use Download .txt to save the extracted text as a plain-text file named after your original PDF. Both options give you the same content, pick whichever fits the next step in your workflow.",
  },
];

const faqs = [
  {
    q: "Why is my extracted text empty?",
    a: "The tool reads the PDF's existing text layer. Scanned pages or text stored as image shapes may produce no text.",
  },
  {
    q: "Does this tool perform OCR?",
    a: "No. It does not recognize text in scanned images.",
  },
  {
    q: "Will the output preserve formatting?",
    a: "No. Text items are joined with spaces and the output includes page labels. It does not reconstruct the original columns, tables, fonts, or paragraph layout.",
  },
  {
    q: "Can it extract Hindi or other languages?",
    a: "It can return text available in the PDF's text layer. Results depend on the document's character mappings and reading order, so some files may produce incorrect or incomplete text.",
  },
  {
    q: "Is there a practical document limit?",
    a: "The tool is free to use. Large PDFs depend on available device memory and processing time.",
  },
];

const related = [
  { to: "/tools/pdf-to-word", name: "PDF to Word", blurb: "Get an editable .docx instead of plain text." },
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/txt-to-pdf", name: "TXT to PDF", blurb: "Turn a plain-text file into a clean, readable PDF." },
  { to: "/tools/compare", name: "Compare PDFs", blurb: "See the differences between two versions side by side." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
] as const;

export function PdfToTextSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to extract text from a PDF online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[15px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Get clean text */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Get clean, copyable text out of any PDF
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        PDF is a great format for reading and printing but a stubborn one for
        reuse. Selecting a passage in a PDF viewer and pasting it into a
        document often turns tidy paragraphs into a broken staircase of half
        sentences, drops footnotes into the middle of body copy or scrambles
        the order when the page is laid out in columns.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool skips the viewer entirely. It reads the PDF's underlying text
        layer directly, page by page, and returns everything as one flat
        stream of Unicode, the same words in the same reading order, without
        the line-wrapping and column artifacts a manual copy tends to
        introduce. From there you can quote a report in your own document,
        reuse content in a slide deck, feed the text to a translator or a
        script, or just search a long file inside a plain text editor at full
        speed. It's the fastest way to convert PDF to plain text when the words
        are what you need, not the layout.
      </p>

      {/* Honest OCR note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note about scanned PDFs
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool extracts the text <em>layer</em> of a PDF. If your PDF is a
        scan, pages that are really just photographs of paper wrapped in a
        PDF container, there is no text layer inside the file, and the
        output will be empty (or a page will come back marked
        &ldquo;[No text found on this page]&rdquo;). That is not a bug; there
        is genuinely nothing textual for the tool to read.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Reading words out of an image requires OCR (optical character
        recognition), which is a completely different technology from text
        extraction. To be transparent: PDFToolConverter does not currently ship an OCR
        tool, it's on our roadmap. Until it lands, this extractor will
        honestly tell you when a page has no text rather than guess. If your
        source is a scan today, you'll need an OCR-capable app to convert it
        into a searchable PDF first, then bring that result back here.
      </p>

      {/* FAQ */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Frequently asked questions
      </h2>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="cursor-pointer list-none text-[15.5px] font-semibold flex justify-between items-center">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      {/* Related */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Related PDF tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const pdfToTextFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pdfToTextHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to extract text from a PDF online for free",
  description:
    "Pull the full text layer out of a PDF entirely inside your browser and copy it to the clipboard or download it as a .txt file. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file with a text layer" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter PDF to Text (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-to-text#step-${i + 1}`,
  })),
};

export const pdfToTextSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter PDF to Text",
  description:
    "Extract text from PDF online free, pull the full text layer out of any PDF with a text layer, page by page, entirely inside your browser. Copy to clipboard or download as a .txt file. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
