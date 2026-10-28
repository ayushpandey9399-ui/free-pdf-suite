import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add new password after editing" },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine unlocked PDFs together" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce size after unlocking" },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Annotate after removing protection" },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Sign the unlocked document" },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull pages from unlocked PDF" },
  { to: "/tools/split", name: "Split PDF", blurb: "Separate the unlocked document" },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Flatten forms after unlocking" },
] as const;

const steps = [
  {
    "title": "Select the PDF",
    "text": "Choose one protected PDF. The tool checks whether it needs an open password, has owner restrictions, or is already unprotected."
  },
  {
    "title": "Enter the password if requested",
    "text": "For a PDF that requires an open password, enter the correct password. Owner-only restrictions can be removed without an open password when the document already opens."
  },
  {
    "title": "Unlock the document",
    "text": "Click Unlock PDF. The tool authenticates when required and saves the document with encryption disabled."
  },
  {
    "title": "Download the result",
    "text": "Download the password-free file, named after the original with -unlocked.pdf appended. Keep the protected original if you need it."
  }
];

const faqs = [
  {
    "q": "Do I always need a password?",
    "a": "A document with an open password requires the correct password. Owner-only restrictions can be removed without entering a password if the PDF already opens."
  },
  {
    "q": "Does the tool crack forgotten passwords?",
    "a": "No. It authenticates the password you enter and does not guess or recover a forgotten open password."
  },
  {
    "q": "What does Incorrect password mean?",
    "a": "The supplied password did not authenticate. Check capitalization and accidental spaces, then try again."
  },
  {
    "q": "Why does the tool say there is nothing to unlock?",
    "a": "The file was detected as unprotected. There is no encryption for this tool to remove, so the unlock action is not offered."
  },
  {
    "q": "Can I unlock several PDFs together?",
    "a": "No. Select and process one PDF at a time. Very large files depend on your device memory."
  },
  {
    "q": "What is saved in the output?",
    "a": "The tool saves the PDF with encryption disabled and adds -unlocked.pdf to its base filename. Review the downloaded copy before sharing it."
  }
];

export function UnlockPdfSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to remove a password from a PDF</h2>
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
        <h2 className="text-2xl font-bold">Two password situations</h2>
        <p className="mt-3 leading-relaxed">An open password is required to decrypt a document that will not open without one. Owner restrictions can limit editing or printing even when the document opens without a password. The tool detects these situations and offers the applicable workflow.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Messages and troubleshooting</h2>
        <p className="mt-3 leading-relaxed">Incorrect password. Please try again. means authentication failed. Re-enter the password carefully. If the tool says there is nothing to unlock, the PDF is already unprotected. An invalid-file message means the PDF could not be read.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Permission and limits</h2>
        <p className="mt-3 leading-relaxed">Only unlock files you own or have permission to modify. The tool does not guess or crack passwords. It handles one PDF at a time, and very large documents depend on available device memory.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">After unlocking</h2>
        <p className="mt-3 leading-relaxed">The downloaded copy has encryption disabled. Store it carefully and re-protect it if needed before sharing. Check the output in a PDF viewer before replacing any important original.</p>
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

export const unlockFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const unlockHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to remove a password from a PDF",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
  })),
};

export const unlockSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Unlock PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};
