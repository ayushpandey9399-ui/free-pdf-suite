import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF form you need to fill",
    text: "Click Select PDF file and choose the form on your device. The tool immediately reads the document's AcroForm layer with pdf-lib and lists every interactive field it can find, text boxes, checkboxes, radio groups, dropdowns and option lists, inside the workspace panel.",
  },
  {
    title: "Type or tick your answers, field by field",
    text: "Each detected field appears as a labelled input in the panel, matched to its real type: text fields become an Input, checkboxes become a tickbox, dropdowns and radio groups become a Select of the original options. The sidebar shows a running count like \"12 fields detected\" so you know nothing was missed.",
  },
  {
    title: "Preview values and correct anything at will",
    text: "Existing values that the PDF was distributed with, say, a pre-filled applicant name, are loaded into the inputs so you can either keep or overwrite them. There is no submit-and-lose-it step: change any answer as many times as you want before exporting.",
  },
  {
    title: "Download the completed PDF",
    text: "Click Download Filled PDF and the tool writes every answer back into the real form fields with pdf-lib, saves the document, and hands it back with a -filled suffix. The exported file is a proper filled AcroForm, no flattened image, no server round-trip, no watermark.",
  },
];

const faqs = [
  {
    q: "Which PDF form fields can I fill?",
    a: "The tool supports text fields, checkboxes, dropdowns, radio groups and option lists. Dropdowns, radio groups and option lists let you choose one of the options defined in the PDF.",
  },
  {
    q: "Why does the tool say no fillable form fields were found?",
    a: "The tool did not detect supported interactive form fields. A scan or flat PDF may contain only page content, not fields that this tool can fill.",
  },
  {
    q: "Can I keep answers that are already in the form?",
    a: "Yes. Existing text, checkbox states and selected options are loaded into the inputs. You can keep or change them before exporting.",
  },
  {
    q: "Can I save a partially completed form?",
    a: "Yes. Export the answers entered so far and download the filled PDF. Reopen that copy later to load its supported field values. The tool does not provide a saved draft between sessions.",
  },
  {
    q: "Does exporting flatten the form?",
    a: "No. Export writes your answers into the PDF form fields and saves a copy with a -filled.pdf suffix. It does not flatten the fields.",
  },
  {
    q: "Why might exporting a form fail?",
    a: "The tool shows an error if it cannot read or save the PDF. Password-protected PDFs are handled separately. Some field contents or PDF structures may not be supported, so keep the original and check the downloaded copy.",
  },
];

const related = [
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
] as const;

export function FillFormsSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to fill out a PDF form online for free
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

      {/* Honest note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note: fillable vs flat forms
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool works with PDFs that contain real interactive fields , 
        the kind where a cursor blinks in a box the moment you click
        it. A lot of forms in the wild aren't like that: they're
        pictures of forms, exported from a scanner or a print driver,
        with nothing interactive inside them at all. When you open one
        of those here, the workspace will show <em>No fillable form
        fields found in this PDF</em> and there won't be anything to
        type into.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The fix is one click away. Open the same file in{" "}
        <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] underline">
          Edit PDF
        </Link>{" "}
        and use its Text tool to type answers straight onto the printed
        lines, it works identically on native PDFs and scans, so you
        can complete a flat form in the browser without ever printing
        it.
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

export const fillFormsFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const fillFormsHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to fill out a PDF form online for free",
  description:
    "Fill interactive PDF forms entirely in the browser, text fields, checkboxes, dropdowns and radio groups, and download a proper filled AcroForm PDF. No upload, no signup, no watermark.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF form with interactive fields" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Fill PDF Forms (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/fill-forms#step-${i + 1}`,
  })),
};

export const fillFormsSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Fill PDF Forms",
  description:
    "Fill PDF forms online free, type into text fields, tick checkboxes and select dropdown or radio options. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
