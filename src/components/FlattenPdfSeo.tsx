import type { ReactNode } from "react";
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

const benefits = [
  {
    h: "Looks identical, behaves differently",
    p: "Every value you entered stays in the same box, the same font and the same position on the page. What changes is invisible to the eye: the clickable field layer is gone, so the document reads exactly the same and behaves like a printed page instead of a fillable one.",
  },
  {
    h: "Compatible everywhere",
    p: "Some older readers, print drivers and email previews silently drop unflattened field values or render them in the wrong font. Flattening bakes the answers into the page content, so the finished PDF displays and prints the same way in Acrobat Reader, Preview, Chrome, Edge, Foxit and every mobile viewer.",
  },
  {
    h: "Nothing to misclick",
    p: "Once the interactive layer is removed, no recipient can accidentally tab into a field and blank it, no reviewer can quietly tweak a number, and no auto-fill browser extension can overwrite what you sent. The document becomes a read-only record.",
  },
  {
    h: "Free and instant",
    p: "There is no signup, no size cap, no watermark on the output and no queue. Flattening runs locally with pdf-lib, so a filled multi-page form is ready in the time it takes to click the button and download the file.",
  },
];

const scenarios = [
  {
    h: "Submitting applications and declarations",
    p: "For loan applications, university admission forms, tax declarations and consent forms, the exact wording of every answer matters. Flatten the completed PDF before you send it so the recipient can't add, delete or change a value between your inbox and their desk.",
  },
  {
    h: "Sending quotes and invoices built on fillable templates",
    p: "Many small businesses issue quotes and invoices from a fillable PDF template. Flatten the finished document before it leaves your machine, the client sees a clean, uneditable invoice, not a template they could technically re-price and re-forward.",
  },
  {
    h: "Archiving completed forms",
    p: "A record you keep for seven years shouldn't be re-openable and quietly editable. Flattening the copy that goes into your archive turns the fields into fixed page content, so the file you retrieve years later is exactly what you stored.",
  },
  {
    h: "Fixing forms that misprint or drop values in some viewers",
    p: "If a recipient tells you the fields print blank or look wrong on their end, the field appearances are usually the problem. Re-flatten your copy and resend, with the values baked into the page content, every viewer and printer renders them identically.",
  },
  {
    h: "Legal, HR and compliance packages",
    p: "Solicitors sending signed agreements, HR teams distributing offer letters and compliance officers issuing acknowledgement forms all need certainty that the document received is the document sent. Flattening the completed PDF before it leaves your outbox is the standard fix, the recipient reads the exact values you filled in and cannot silently adjust a figure, a date or a name in a free reader before forwarding it on.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "What does flattening a PDF do?",
    a: "It merges the interactive form-field layer into the page itself. Before flattening, the answers you typed sit on top of the page as editable widgets that any reader can click and change. After flattening, those same answers are drawn permanently into the page content, the document looks identical, but the fields no longer exist to edit.",
    plain:
      "It merges the interactive form-field layer into the page. Before, answers sit on top as editable widgets any reader can change. After, the same answers are drawn permanently into the page content, identical look, no editable fields.",
  },
  {
    q: "How do I flatten a PDF for free?",
    a: "Click Select PDF file, pick your filled form, keep Flatten form fields ticked in the sidebar, then click Flatten PDF. The tool reports how many fields were flattened and downloads a copy with a -flattened suffix. No Acrobat, no signup, no upload, no watermark.",
    plain:
      "Click Select PDF file, pick your filled form, keep Flatten form fields ticked, click Flatten PDF, and download the -flattened copy. No Acrobat, no signup, no upload, no watermark.",
  },
  {
    q: "Why does it say there are no form fields to flatten?",
    a: "Because the PDF has no interactive field layer to begin with. Scanned documents, exported images and print-driver-generated PDFs are already flat, they're pictures of pages, not fillable forms, so there is nothing for a flattener to bake in. That's why the panel says \"This PDF has no form fields or annotations to flatten\" and the button stays disabled: the file is already as fixed as flattening would make it.",
    plain:
      "Because the PDF has no interactive field layer. Scanned documents and print-driver PDFs are already flat, pictures of pages, not fillable forms, so there is nothing to bake in and the button stays disabled.",
  },
  {
    q: "Can a flattened PDF be unflattened?",
    a: "No. Once the tool bakes the values into the page and the interactive fields are removed from the document, there is no field layer left to restore, the values are now ordinary page content. Keep your original fillable copy separately if you might need to edit the answers later; flatten only the copy you're about to send.",
    plain:
      "No. Once values are baked into the page and the interactive fields are removed, there's no field layer left to restore. Keep your original fillable copy separately if you might need to edit the answers later.",
  },
  {
    q: "Does flattening change how the document looks?",
    a: "No. The page renders exactly the same before and after, same text, same layout, same values in the same boxes. Flattening only changes how those values are stored inside the file, not how they appear on screen or when printed.",
    plain:
      "No. The page renders exactly the same, same text, layout and values in the same boxes. Flattening only changes how values are stored inside the file, not how they appear.",
  },
  {
    q: "Does flattening also lock my annotations or signature?",
    a: (
      <>
        Not in this tool. Client-side annotation flattening isn't
        reliable across every PDF, so the sidebar's "Flatten
        annotations" option is intentionally disabled and only form
        fields are baked in. If you added notes or highlights, the
        cleanest workflow is to open the file in{" "}
        <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] underline">
          Edit PDF
        </Link>
        , which draws annotations permanently into the page content
        stream on save. If you added a handwritten or typed signature,{" "}
        <Link to="/tools/$slug" params={{ slug: "sign-pdf" }} className="text-[#e5322d] underline">
          Sign PDF
        </Link>{" "}
        stamps it into the page directly rather than as a separate
        widget.
      </>
    ),
    plain:
      "Not in this tool, only form fields are flattened. The 'Flatten annotations' option is intentionally disabled. Use Edit PDF (/tools/edit-pdf) to bake annotations into the page, or Sign PDF (/tools/sign-pdf) to stamp signatures as page content.",
  },
  {
    q: "Is flattening the same as password-protecting?",
    a: (
      <>
        No, they solve different problems. Flattening removes the
        interactive field layer so the answers you filled can't be
        changed, but the document itself is still openable by anyone
        who has the file. Password protection encrypts the whole PDF
        so only someone with the password can open it at all, use{" "}
        <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="text-[#e5322d] underline">
          Protect PDF
        </Link>{" "}
        for that, and flatten first if you want both.
      </>
    ),
    plain:
      "No. Flattening removes the interactive field layer so answers can't be changed, but the file is still openable by anyone. Password protection encrypts the whole PDF, use Protect PDF (/tools/protect-pdf) for that, and flatten first if you want both.",
  },
  {
    q: "Do my files get uploaded?",
    a: "No. Scanning the field and annotation counts, flattening the form and writing the final -flattened.pdf all happen inside your browser tab using pdf-lib and pdf.js. Nothing about the file is transmitted to us or to any third party, and once the page has loaded the whole flow keeps working offline.",
    plain:
      "No. Scanning, flattening and writing the -flattened.pdf all happen inside your browser tab with pdf-lib and pdf.js. Nothing is transmitted, and the flow keeps working offline once loaded.",
  },
  {
    q: "Will it reduce quality?",
    a: "No. Flattening rewrites the file's structure, not its visual content, the page's original text stays as searchable text, images stay at their original resolution, and vector graphics stay vector. Field values are drawn into the page content stream at their existing appearance, so the flattened copy is visually indistinguishable from the fillable original.",
    plain:
      "No. Flattening changes the file's structure, not its visual content. Original text stays searchable, images keep their resolution, vectors stay vector, and field values are drawn at their existing appearance.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. The tool is a web page that runs in any modern browser, Chrome, Safari, Firefox, Edge or Brave, with no Acrobat licence, no install and no account. The download is a standard, universally-readable flattened PDF.",
    plain:
      "No. It's a web page that runs in Chrome, Safari, Firefox, Edge or Brave, no Acrobat licence, no install, no account. The output is a standard flattened PDF.",
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

      {/* Why flatten */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why flatten before you send?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        You filled a form carefully, an application, a declaration, a
        salary figure on an invoice template, and hit send. The
        recipient (and anyone who forwards the file after them) can
        open the same PDF in a free reader, click into your fields and
        change a number, a name or a date without leaving any trace
        that they did. Nothing in the PDF specification stops them.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Flattening removes that possibility at the source. What you
        submitted stays what you submitted, byte-for-byte, page-for-page.
        The safe workflow is a two-step:{" "}
        <Link to="/tools/$slug" params={{ slug: "fill-forms" }} className="text-[#e5322d] underline">
          Fill PDF Forms
        </Link>{" "}
        first, then flatten here, fill, flatten, send.
      </p>

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

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private flattening, your form stays with you
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A filled form is usually the last document you'd want on a
        stranger's server: it has your name, your address, sometimes
        your bank details or medical answers. This tool reads the
        field counts, bakes the values into the page and writes the
        finished file entirely inside your browser tab with pdf-lib , 
        nothing is transmitted anywhere, and nothing is logged. Once
        the page has loaded you can go offline and the whole flow
        keeps working.
      </p>

      {/* Four benefits */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When should you flatten a PDF?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

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
    acceptedAnswer: { "@type": "Answer", text: f.plain },
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
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com Flatten PDF (web browser)" }],
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
  name: "pdftoolconverteronline.com Flatten PDF",
  description:
    "Flatten PDF online free, merge interactive form fields into the page so filled answers can't be changed. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
