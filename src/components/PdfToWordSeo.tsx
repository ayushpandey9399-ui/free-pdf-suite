import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Click Select PDF file and choose your document",
    text: "Pick the PDF you want as a Word document from your computer or phone. Before anything is sent, the tool checks the extension, reads the first bytes of the file to confirm it really is a PDF, and blocks anything over 25 MB so you are never left waiting on an upload that cannot succeed.",
  },
  {
    title: "Watch the upload progress bar",
    text: "Unlike the rest of our tools, this one needs a server, so the file is uploaded to our conversion service at api.pdftoolconverteronline.com. A determinate progress bar shows exactly how much has been sent, and a Cancel button stops the transfer at any point and returns you to the start.",
  },
  {
    title: "Let the server convert the PDF to DOCX",
    text: "Once the upload finishes, the status changes to Converting on our server. The conversion rebuilds paragraphs, headings, tables and images into an editable Word document. Most files finish in a few seconds; very long or graphics heavy documents take a little longer.",
  },
  {
    title: "Download the .docx and open it in Word",
    text: "The finished document downloads with the same name as your PDF but a .docx extension, ready to open in Microsoft Word, Google Docs, LibreOffice Writer or Pages.",
  },
];

const faqs = [
  {
    q: "Is there a file size limit?",
    a: "Yes. The tool checks a 25 MB per-file limit before upload. It also checks the filename and PDF header.",
  },
  {
    q: "Is my PDF uploaded for conversion?",
    a: "Yes. This tool uploads your PDF to our server for conversion and returns a DOCX file to your browser.",
  },
  {
    q: "Will the Word document preserve the layout?",
    a: "Results vary by document. Text-based PDFs work best, while complex layouts, unusual fonts, and some languages may lose text or formatting. Review the downloaded DOCX before using it.",
  },
  {
    q: "Does it turn scanned pages into editable text?",
    a: "No. Scanned pages come through as images rather than editable text.",
  },
  {
    q: "Can I convert a password-protected PDF?",
    a: "Unlock it first. The tool checks for encryption in your browser when that check is available, and the server can also reject protected files.",
  },
];

const related = [
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Pull the plain text out of a PDF, fully in your browser." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a password you know so the file can be converted." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink a large PDF under the 25 MB limit." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one document first." },
  { to: "/tools/split", name: "Split PDF", blurb: "Convert only the section you actually need." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand new PDF." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high quality JPG or PNG." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Fix text directly in the PDF without leaving the browser." },
] as const;

export function PdfToWordSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert PDF to Word
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

      {/* Intro prose */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Turn a PDF into an editable Word document
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A PDF is built to be read, not rewritten. The moment a sentence needs to
        change, a date needs updating or a clause needs a redline, the format
        that made the document easy to share becomes the thing standing in your
        way. Converting PDF to Word gives you the same content in a .docx you
        can actually type into.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This converter rebuilds your document rather than screenshotting it.
        Paragraphs stay as text, headings stay as headings, tables stay as
        tables and images stay in place, so the Word file opens looking like the
        original and behaves like something you wrote yourself. It is free,
        needs no account, adds no watermark and works the same on a phone as on
        a laptop.
      </p>

      {/* Honest server note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note: this tool uses our server
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every other tool on PDFToolConverter runs entirely inside your browser and
        never uploads anything. This one is the exception, and we would rather
        say so clearly than bury it. A high quality PDF to Word conversion needs
        a document engine that is far too large to load into a browser tab, so
        your PDF is uploaded to our own conversion server, converted there, and
        sent back to you as a .docx.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        If your document is too sensitive to upload,
        please use one of our in browser tools instead.
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

export const pdfToWordFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pdfToWordHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to Word",
  description:
    "Convert a PDF into an editable Word .docx document for free. Pick your file, upload it to our conversion server, and download the Word version.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file under 25 MB" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter PDF to Word (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-to-word#step-${i + 1}`,
  })),
};

export const pdfToWordSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter PDF to Word",
  description:
    "Convert PDF to Word online free. Upload a PDF up to 25 MB and get an editable .docx with headings, paragraphs, tables and images preserved. No signup and no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
