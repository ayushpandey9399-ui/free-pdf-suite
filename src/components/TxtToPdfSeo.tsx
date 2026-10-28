import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const related = [
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Extract selectable text and download it as .txt." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Add page numbers with custom position and style." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
] as const;

const steps = [
  {
    "title": "Add text",
    "text": "Select one or more TXT files or choose Or paste text instead and enter your content."
  },
  {
    "title": "Choose the layout",
    "text": "Choose A4 or Letter, a 10, 12, or 14 point font size, Small, Normal, or Big margins, and 1.0, 1.15, or 1.5 line spacing. With several files you can merge them into one PDF."
  },
  {
    "title": "Convert and download",
    "text": "Click Convert to PDF. Text wraps across pages. Pasted content is saved as pasted-text.pdf; merged files are saved as combined.pdf."
  }
];

const faqs = [
  {
    "q": "Can I paste text instead of choosing a file?",
    "a": "Yes. Choose Or paste text instead, enter your text, and convert it. The output is named pasted-text.pdf."
  },
  {
    "q": "Can I convert several TXT files?",
    "a": "Yes. Add several files and choose whether to merge them into combined.pdf or create separate PDFs."
  },
  {
    "q": "What layout settings can I change?",
    "a": "Choose A4 or Letter pages, 10, 12, or 14 point text, Small, Normal, or Big margins, and 1.0, 1.15, or 1.5 line spacing."
  },
  {
    "q": "How is Hindi rendered?",
    "a": "Devanagari input uses browser text shaping with bundled Noto Sans Devanagari and is embedded as image pages. Review the result; those pages do not contain selectable PDF text."
  },
  {
    "q": "Why is some output text not selectable?",
    "a": "Input containing characters above U+00FF uses an image-based rendering path for the job. Supported standard-font text uses the selectable-text path."
  },
  {
    "q": "Does the converter send my text to Google Fonts?",
    "a": "No. Fonts are bundled through local font packages, not requested from Google Fonts. TXT content and pasted text are converted in the browser, not uploaded."
  }
];

export function TxtToPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to convert a text file to PDF online for free</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6">
          {steps.map((step, i) => (
            <li key={step.title} id={`step-${i + 1}`}>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Hindi and other non-Latin text</h2>
        <p className="mt-3 leading-relaxed">Characters above U+00FF switch the converter to canvas-rendered pages embedded as images. The bundled Noto Sans Devanagari font supports Hindi shaping. Other scripts depend on available font coverage, so inspect the output rather than assuming every language will render correctly.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Selectable text versus image pages</h2>
        <p className="mt-3 leading-relaxed">The standard-font path produces selectable text for supported characters. Jobs routed through the non-Latin path produce image pages, so their text cannot be selected or searched as PDF text.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Limits and troubleshooting</h2>
        <p className="mt-3 leading-relaxed">Conversion runs in your browser. Large files depend on device memory, especially with image-based pages. Try a smaller input if export fails. If glyphs are missing, check the script and available fonts rather than expecting conversion to repair the source text.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Related tools</h2>
        <RelatedToolsGrid items={related} />
      </section>
    </section>
  );
}

export const txtToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const txtToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert a text file to PDF online for free",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `/tools/txt-to-pdf#step-${i + 1}`,
  })),
};

export const txtToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter TXT to PDF",
  description:
    "Convert TXT to PDF online free, turn text files or pasted content into clean, printable PDFs entirely inside the browser. Supports Hindi and other non-Latin scripts. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
