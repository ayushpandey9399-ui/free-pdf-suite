import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you need to redact",
    text: "Drop the file into the browser or click Select PDF file. Every page is rendered inside the tab so you can see exactly what has to be blacked out, the document is not sent anywhere at any point.",
  },
  {
    title: "Draw a black box over anything sensitive",
    text: "Click and drag on any page to draw a redaction box over an Aadhaar number, an account number, a photograph, a signature or a whole paragraph. Boxes can be dragged into position or resized from the corners, and you can add as many as the document needs across as many pages as you want.",
  },
  {
    title: "Optional: find and redact by text",
    text: "Type a phrase such as an email address, a phone number or an account number into the Find field and press Enter. The tool locates every occurrence across all pages using the PDF's text layer and adds a redaction box on top of each one, so you never miss a hit.",
  },
  {
    title: "Click Redact PDF and download",
    text: "The affected pages are re-rendered as flat images with the black rectangles baked in, unedited pages are copied through untouched, and the document's metadata (title, author, subject, keywords, creator, producer) is cleared before saving. The redacted PDF downloads straight to your device.",
  },
];

const faqs = [
  {
    q: "Does redaction remove the text underneath a box?",
    a: "On pages containing redaction boxes, the tool renders the page as an image with the black rectangles baked into its pixels. That image replaces the original page content in the output.",
  },
  {
    q: "Can I still select text on redacted pages?",
    a: "No. Pages containing redactions become images. Pages without redactions are copied into the new PDF without this rasterization step.",
  },
  {
    q: "Can I redact multiple areas and multiple pages?",
    a: "Yes. Draw boxes on the areas you need to remove across the document. Review every affected page before sharing the downloaded PDF.",
  },
  {
    q: "Can Find redact every occurrence automatically?",
    a: "Find uses the PDF's text layer to locate matches and add redaction boxes. Scanned text without a text layer and text split into separate PDF items may not match. Review the results and add boxes manually where needed.",
  },
  {
    q: "Will the rest of my document lose quality?",
    a: "Pages with redaction boxes are rendered at twice the PDF page dimensions and embedded as JPEG images, so their appearance and file size can change. Other pages are copied without being rasterized, but the output PDF is rebuilt rather than copied byte-for-byte.",
  },
  {
    q: "Does the tool remove all hidden information?",
    a: "The tool clears common document metadata fields, including title, author, subject, keywords, creator, and producer. This is not a guarantee that every kind of hidden information has been removed. Inspect the output before sharing sensitive documents.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password so the PDF opens freely." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/compare", name: "Compare PDFs", blurb: "See the differences between two versions side by side." },
] as const;

export function RedactPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to redact a PDF online for free
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

      {/* True redaction */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Real redaction, not just a black box
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This is the part almost every online tool gets wrong. In the usual PDF editor, drawing a black rectangle
        over sensitive text only covers it visually, the underlying characters remain inside the file as regular
        text objects. Anyone who opens the PDF can select the covered area, copy the text out, or run the file
        through any text extractor and see everything the black bar was supposed to hide. That is not redaction;
        it is a cover-up that fools no one.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool works differently. Every page you drew on is re-rendered as a flat image with the black
        rectangles painted directly onto the pixels, and that image replaces the original vector page in the
        output PDF. The characters that used to sit under the box are not in the file any more, and the document's
        metadata, title, author, producer, keywords, is cleared at the same time so nothing sensitive leaks
        through the properties dialog either.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Do not take our word for it. Run the redacted file through our{" "}
        <Link to="/tools/$slug" params={{ slug: "pdf-to-text" }} className="font-semibold text-[#e5322d] underline underline-offset-2">
          PDF to Text
        </Link>{" "}
        tool and search for the words you blacked out, they will not appear. That is what permanently remove
        text from PDF actually looks like.
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

export const redactFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const redactHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to redact a PDF online for free",
  description:
    "Permanently black out sensitive text, numbers or images in a PDF using an in-browser redaction tool, the redacted pages are re-rendered so the hidden content is truly removed, not just covered.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF containing sensitive content to remove" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Redact PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/redact-pdf#step-${i + 1}`,
  })),
};

export const redactSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Redact PDF",
  description:
    "Redact PDF online free, permanently black out Aadhaar numbers, account details and other sensitive content in your browser. Redacted pages are re-rendered so removed text cannot be recovered.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
