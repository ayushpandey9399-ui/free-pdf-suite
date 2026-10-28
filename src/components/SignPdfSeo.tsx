import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Password-protect your signed document." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Permanently embed the signature." },
  { to: "/tools/fill-forms", name: "Fill PDF Forms", blurb: "Fill form fields before signing." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Add text and annotations before signing." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce signed PDF file size." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before signing." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine signed documents." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Remove sensitive info before signing." },
] as const;

const steps = [
  {
    "title": "Upload a PDF",
    "text": "Select a PDF or drag it into the upload area. The tool renders page previews in your browser."
  },
  {
    "title": "Create your signature",
    "text": "Draw a signature, type it using a signature-style font, or upload a PNG, JPG, or SVG signature image. You can also create initials."
  },
  {
    "title": "Place fields",
    "text": "Place and resize signatures or initials on the required pages. Add name, date, or text fields where needed."
  },
  {
    "title": "Sign and download",
    "text": "Review the placements and sign the PDF. The tool draws the fields as images into the original PDF pages and downloads a file ending in -signed.pdf."
  }
];

const faqs = [
  {
    "q": "How can I create a signature?",
    "a": "Draw it, type it using a supplied signature font, or upload a PNG, JPG, or SVG image."
  },
  {
    "q": "Can I sign more than one page?",
    "a": "Yes. Place signatures or initials on the required pages before exporting the document."
  },
  {
    "q": "Can I add the date and my name?",
    "a": "Yes. The editor includes name, date, and text fields in addition to signatures and initials."
  },
  {
    "q": "Can I sign an encrypted PDF?",
    "a": "Unlock the PDF first with the correct password and permission to modify it. The signer does not provide a password-entry workflow."
  },
  {
    "q": "Is this a certificate-based digital signature?",
    "a": "No. The tool adds visible signature images to PDF pages. It does not supply certificate-based signing or identity verification."
  },
  {
    "q": "Can I change a signature after downloading?",
    "a": "Use the unsigned original to make a revised version. Exported fields are drawn into page content and are not retained as movable editor fields. They are not guaranteed to resist later editing."
  }
];

export function SignPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to Sign a PDF Online, Step by Step</h2>
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
        <h2 className="text-2xl font-bold">Three signature methods</h2>
        <p className="mt-3 leading-relaxed">Draw with a pointer or touchscreen, type using one of the supplied signature fonts, or upload a signature image. A transparent PNG avoids a visible rectangular background.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Electronic signature versus digital signature</h2>
        <p className="mt-3 leading-relaxed">This tool adds visible signature images. It does not create a certificate-based digital signature, verify identity, or manage requests for other people to sign. Whether a signature is acceptable depends on the recipient and applicable requirements.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Review before signing</h2>
        <p className="mt-3 leading-relaxed">Keep the unsigned original. Check the page, position, size, and date before export. Fields are embedded as page content, not saved as movable editor fields. This does not make them tamper-proof.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Limits and troubleshooting</h2>
        <p className="mt-3 leading-relaxed">Password-protected PDFs must be unlocked first. Large documents require memory for page previews and export. If loading fails, try a smaller PDF and check that the input is a valid, unencrypted document.</p>
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

export const signFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const signHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Sign a PDF Online, Step by Step",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
  })),
};

export const signSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Sign PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
