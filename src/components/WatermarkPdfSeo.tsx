import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/watermark`;

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Encrypt your PDF with a strong password." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine multiple files into one PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce PDF file size without losing quality." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Lock form fields and annotations permanently." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently hide sensitive information." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Add your electronic signature to any document." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Change text and add annotations to your PDF." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove passwords from protected documents." },
] as const;

const steps = [
  {
    "title": "Select your PDF",
    "text": "Choose a PDF in the upload area. Unlock password-protected files before using this tool."
  },
  {
    "title": "Choose text or an image",
    "text": "Use Text mode to enter a label and set text size and color, or Image mode to choose a PNG or JPG logo. Both modes provide opacity and rotation controls."
  },
  {
    "title": "Apply the watermark",
    "text": "Click Apply Watermark. The tool draws the watermark on every page. Placement is centered automatically; there is no position picker or live page preview."
  },
  {
    "title": "Download the PDF",
    "text": "Download the result, named with -watermarked.pdf. Keep the original if you may need a version without the watermark."
  }
];

const faqs = [
  {
    "q": "Can I add text and a logo together?",
    "a": "Choose either text or an image in one pass. To add both, process the downloaded result a second time."
  },
  {
    "q": "Does it watermark every page?",
    "a": "Yes. The chosen text or image is drawn on every page of the PDF."
  },
  {
    "q": "Can I choose the position?",
    "a": "No. Placement is calculated automatically near the center of each page. Opacity and rotation are adjustable."
  },
  {
    "q": "Can I choose a different font?",
    "a": "No. Text watermarks use Helvetica Bold. You can adjust text size, color, opacity, and rotation."
  },
  {
    "q": "Which logo formats can I use?",
    "a": "Use PNG or JPG. PNG can preserve transparent areas in a logo. WebP is not supported by this PDF watermark implementation."
  },
  {
    "q": "Does a watermark prevent later editing?",
    "a": "No. It is visible page content, not a tamper-proof restriction. Keep the original and review the output before sharing."
  }
];

export function WatermarkPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to add a watermark to a PDF online for free</h2>
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
        <h2 className="text-2xl font-bold">Text and image settings</h2>
        <p className="mt-3 leading-relaxed">Text uses Helvetica Bold, with adjustable size and color. Image mode accepts PNG or JPG and scales the logo automatically to half the shorter page dimension at its longest edge. There is no font selector or image-size slider.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Position and opacity</h2>
        <p className="mt-3 leading-relaxed">The tool calculates a centered placement on each page and applies your rotation and opacity. Rotation is around the drawing origin, so a rotated mark may not remain visually centered. Download and inspect the result.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Limits and troubleshooting</h2>
        <p className="mt-3 leading-relaxed">Use short text that the standard PDF font can encode. Text mode uses a single-line input and does not provide multi-line layout controls. If image embedding fails, use a valid PNG or JPG rather than WebP. Large PDFs depend on device memory.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">A watermark is not access control</h2>
        <p className="mt-3 leading-relaxed">The mark is drawn into page content. It does not prevent copying or guarantee that an editor cannot remove it. Keep the original and use encryption separately if you need an open password.</p>
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

export const watermarkFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const watermarkHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a watermark to a PDF online for free",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `${url}#step-${i + 1}`,
  })),
};

export const watermarkSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Watermark Tool",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
