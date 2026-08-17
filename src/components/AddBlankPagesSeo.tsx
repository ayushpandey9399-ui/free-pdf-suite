import type { ReactNode } from "react";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Select your PDF",
    text: "Click the button or drag your PDF onto the page. Your file opens directly in your browser.",
  },
  {
    title: "Choose where to insert",
    text: "Pick the position: before the first page, after the last page, or between specific pages.",
  },
  {
    title: "Download the updated PDF",
    text: "Click Add Blank Pages and download your file instantly. No account needed.",
  },
];

const useCases = [
  {
    h: "Add a separator page between sections",
    p: "When combining reports, contracts or study notes from different sources, a blank page between sections makes the document easier to read and navigate.",
  },
  {
    h: "Add a notes page after each slide",
    p: "Teachers and trainers often need a blank page after each slide or chapter so readers can write notes on the printed copy.",
  },
  {
    h: "Meet submission format requirements",
    p: "Some government portals, universities and HR systems require documents to start on a specific page number or have a cover page. Adding a blank page at the beginning or end fixes this in seconds.",
  },
  {
    h: "Fix odd/even page printing",
    p: "Double-sided (duplex) printing requires an even number of pages. Adding a blank page at the end ensures the back of the last page prints correctly.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Can I add multiple blank pages at once?",
    a: "Yes. You can insert more than one blank page at a time. Choose the position and specify how many blank pages to add before clicking the button.",
  },
  {
    q: "Where exactly can I insert the blank page?",
    a: "You can add a blank page before the first page, after the last page, or between any two existing pages in your PDF.",
  },
  {
    q: "Will adding blank pages change the formatting of my PDF?",
    a: "No. Adding blank pages only inserts empty pages at the chosen position. All existing content, fonts, images and layout stay exactly as they were.",
  },
  {
    q: "Is this tool really free?",
    a: "Yes, completely free. No signup, no subscription and no watermark on the output. You can use it as many times as you need.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Your PDF never leaves your device. The entire operation runs inside your browser using client-side JavaScript. Even your internet connection is not needed once the page has loaded.",
  },
  {
    q: "What size PDF can I use?",
    a: "There is no hard file size limit. The only constraint is your device memory. Most PDFs including large scanned documents process in seconds on any modern phone or laptop.",
  },
  {
    q: "Can I add a blank page to a password-protected PDF?",
    a: "Not directly. First remove the password using our Unlock PDF tool, then add your blank pages, and re-protect it with Protect PDF if needed.",
  },
  {
    q: "Does this work on iPhone and Android?",
    a: "Yes. The tool works in any modern mobile browser including Chrome on Android and Safari on iPhone. No app download is required.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove one or more unwanted pages from your PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Save any selection of pages as a new PDF file." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce the file size of your PDF while keeping quality." },
] as const;

export function AddBlankPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight text-center">
        When do you need to add blank pages to a PDF?
      </h2>
      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        {useCases.map((uc, i) => (
          <div key={i}>
            <h3 className="text-[18px] font-semibold">{uc.h}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">{uc.p}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight text-center">
        How to add blank pages to a PDF online
      </h2>
      <ol className="mt-8 space-y-6 max-w-2xl mx-auto">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <p className="text-[16px] font-semibold">{s.title}</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight text-center">
        Frequently asked questions
      </h2>
      <div className="mt-8 divide-y divide-[#eee] max-w-3xl mx-auto">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none text-[16px] font-semibold flex justify-between items-center pr-2">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45 text-xl">+</span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight text-center">
        Related PDF tools
      </h2>
      <div className="mt-8">
        <RelatedToolsGrid items={related} />
      </div>
    </section>
  );
}

export const addBlankPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const addBlankPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add blank pages to a PDF online",
  description: "Insert empty pages anywhere in your PDF — before, after, or between existing pages. Free, private, and instant.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const addBlankPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Add Blank Pages",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};