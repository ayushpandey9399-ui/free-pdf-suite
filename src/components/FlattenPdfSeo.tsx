import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the filled PDF you want to lock down",
    text: "Click Select PDF file and pick the completed form. The tool immediately scans the document with pdf-lib and pdf.js, then shows a Detected in this PDF panel with a live count of form fields and non-widget annotations so you know exactly what's inside before flattening.",
  },
  {
    title: "Confirm the Flatten form fields option",
    text: "The sidebar has one active option: Flatten form fields, ticked by default. If the scan found interactive fields, the Flatten PDF button becomes clickable. If the file has no fields, the panel shows \"This PDF has no form fields or annotations to flatten\" and the button stays disabled, nothing to do.",
  },
  {
    title: "Click Flatten PDF",
    text: "The tool asks pdf-lib to flatten the whole form in one pass (the fast path), and if any field resists it falls back to per-field flattening and removes any stubborn ones so nothing interactive remains. The document's original page text stays fully selectable, only the field layer is baked in.",
  },
  {
    title: "Download the flattened copy",
    text: "The success screen tells you how many fields were flattened and hands back a copy suffixed -flattened.pdf. Save it, attach it, upload it, the file looks identical to what you filled, but the fields are gone from the interactive layer and no reader can change your answers.",
  },
];

const faqs = [
  {
    q: "What does flattening a PDF do?",
    a: "It converts supported form-field appearances into page content and removes the interactive fields. Keep the original fillable PDF if you may need to change its answers later.",
  },
  {
    q: "Does flattening prevent all editing?",
    a: "No. Removing form fields prevents editing through those fields, but a PDF editor can still change page content. Flattening is not encryption or tamper protection.",
  },
  {
    q: "Does this tool flatten annotations?",
    a: "No. The Flatten annotations option is disabled. The tool detects non-widget annotations but only offers form-field flattening.",
  },
  {
    q: "Why is the Flatten PDF button disabled?",
    a: "The action requires detected form fields and the Flatten form fields option to be selected. Annotation detection alone does not enable form-field flattening.",
  },
  {
    q: "Will the flattened PDF look exactly the same?",
    a: "Check the downloaded copy before sharing it. Field appearances vary between PDFs, and the fallback for fields that cannot be flattened can remove those fields.",
  },
  {
    q: "Can the tool restore the original interactive fields?",
    a: "No. It does not include an unflatten operation. Save the original fillable PDF separately.",
  },
];

const related = [
  { to: "/tools/fill-forms", name: "Fill PDF Forms", blurb: "Fill interactive form fields and save the result." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
] as const;

export function FlattenPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* Definition FIRST */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        What does flattening a PDF mean?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A fillable PDF has two layers stacked on top of each other: the
        printed page underneath, and a set of interactive boxes on top
        that anyone who opens the file can click into and change.
        Flattening merges those two layers into one, the answers you
        typed become part of the page itself, like ink dried on paper,
        and the interactive boxes disappear.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The document looks identical after flattening. The only
        difference is that no reader, not Acrobat, not Preview, not
        Chrome, can edit, clear or re-tab into the field values any
        more. The form has stopped being a form and become a fixed
        record.
      </p>

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to flatten a PDF online for free
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

      {/* Flatten vs Print-to-PDF */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Flatten vs Print-to-PDF: why the shortcut isn't the same
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The common workaround for locking a filled form is Print → Save as PDF, and it does
        remove the interactive fields. What it also does is rasterise every page: the printer
        driver treats the document as an image, so selectable text stops being selectable, the
        file often gets larger, searchability breaks and any high-quality vector content
        becomes pixels. It is flattening by demolition.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool takes the opposite route. pdf-lib merges only the form-field layer into the
        page content stream; the original page text stays real text, images stay at their
        embedded resolution, and the file size barely moves. The output looks and behaves
        exactly like the original PDF minus the editable fields, no print-driver detour and
        no loss of quality.
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

export const flattenPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const flattenPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to flatten a PDF online for free",
  description:
    "Flatten a filled PDF entirely in the browser, merge interactive form fields into the page so the answers become permanent, uneditable content. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A filled PDF with interactive form fields" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Flatten PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/flatten-pdf#step-${i + 1}`,
  })),
};

export const flattenPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Flatten PDF",
  description:
    "Flatten PDF online free, merge interactive form fields into the page so filled answers can't be changed. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
