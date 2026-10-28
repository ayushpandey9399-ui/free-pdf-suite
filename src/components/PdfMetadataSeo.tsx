import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF whose properties you want to inspect",
    text: "Click Select PDF file and pick any document. The tool immediately reads the file with pdf-lib, renders a small first-page thumbnail so you can confirm you picked the right one, and prints the page count next to the file size.",
  },
  {
    title: "Read what the file is currently saying about itself",
    text: "Four editable fields appear in the sidebar, Title, Author, Subject and Keywords, pre-filled with whatever is already stored inside the PDF. Below the thumbnail you can see the read-only trail: Created, Modified, Producer and Creator, each showing \"Not set\" when the field is empty.",
  },
  {
    title: "Correct a field, or tick Clear all metadata",
    text: "Type over any of the four editable fields to change them individually, for example, replacing a template's old author name with your own, or setting a proper document Title. To wipe the lot in one move, tick the Clear all metadata box: it blanks Title, Author, Subject and Keywords, resets Producer and Creator to empty strings, and removes the Created and Modified timestamps from the document information dictionary.",
  },
  {
    title: "Save the updated copy",
    text: "The Save PDF button lights up as soon as anything is different from the original. Click it and the tool writes a fresh document via pdf-lib and hands back a copy suffixed -updated.pdf. Your input file is untouched; only the downloaded copy carries the new properties.",
  },
];

const faqs = [
  {
    q: "Which metadata fields can I edit?",
    a: "You can edit Title, Author, Subject, and Keywords. Keywords are entered as comma-separated values. Producer, Creator, and dates are displayed for reference.",
  },
  {
    q: "What does Clear all metadata do?",
    a: "It empties Title, Author, Subject, Keywords, Producer, and Creator in the PDF information dictionary. It also attempts to remove creation and modification dates, but those dates may remain if the low-level operation is unavailable.",
  },
  {
    q: "Does clearing metadata make the PDF anonymous?",
    a: "No. Visible content, annotations, attachments, images, and other embedded metadata can still identify people or software. This tool is not a complete anonymization or sanitization tool.",
  },
  {
    q: "Does editing metadata change the visible pages?",
    a: "The tool changes document information fields rather than editing visible page content. Check the downloaded PDF before distributing it.",
  },
  {
    q: "Why does my PDF show an unexpected title in a viewer?",
    a: "Some viewers display the PDF Title field instead of the filename. Edit Title and save a new copy, then reopen it in your viewer.",
  },
];

const related = [
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently black out sensitive text and images." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
] as const;

export function PdfMetadataSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* Definition FIRST */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        What is PDF metadata?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every PDF quietly carries a small file of information about
        itself: a Title, an Author name, the software that produced
        it, the date it was first saved, the date it was last modified
        and a list of Keywords. None of that ever appears on the
        printed pages you read.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        But it is one right-click away. Any PDF reader, Adobe,
        Preview, a Windows Explorer Properties tab, even the browser
        tab title, can display it in seconds, which means every file
        you send out is also telling recipients a small story about
        who made it, on what, and when. That story is often not the
        one you meant to tell: the Author field may still show the
        colleague whose template you reused, the Producer field
        reveals the exact software on your machine, and the timestamps
        quietly reveal when the document was really written.
      </p>

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to edit PDF metadata online for free
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

      {/* Privacy section */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Check what your PDF is telling people about you
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Before you attach a resume, a proposal or a tender document,
        it is worth looking at what is riding along inside the file.
        The Author field may still carry a colleague's name from
        whichever template you reused, the Producer field reveals the
        exact application that saved it and the timestamps reveal your
        actual writing timeline down to the minute.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        One tick of Clear all metadata strips those fields out, and
        because the whole flow runs inside your browser tab, auditing
        a sensitive file does not mean handing it to anyone. You open
        it, look at it, clean it and save the cleaned copy, the
        original never leaves your device, and neither does the copy.
      </p>

      {/* Browser-tab title section */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Fix titles that look broken in browsers
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        When a PDF opens in a browser tab, the tab does not show the
        filename, it shows the metadata Title. That is why official
        documents so often appear in the wild with tab captions like
        "Microsoft Word - final_v3_REAL_use_this" or the name of
        someone else's template.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Set a proper Title here and save, and the file's tab caption
        matches your document in every browser and reader that
        displays it. It is a five-second edit that instantly makes an
        externally shared PDF look professional.
      </p>

      {/* 30-second sanity check */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        A 30-second sanity check before every external send
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Metadata leaks are almost always accidental, someone reused a template and never looked
        at the Author, or exported a client draft with the internal project code sitting in the
        Title. The fix is a habit, not a tool: before any resume, tender, proposal or contract
        leaves your machine, drop it in here and glance at the four editable fields (Title,
        Author, Subject and Keywords) plus the read-only Producer, Creator and timestamps. If
        any of them tells a story you didn't mean to tell, an old employer's name, a
        colleague's template, a working title with "draft" or "v3" in it, either overwrite the
        field or tick Clear all metadata before you send.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        For anonymised submissions (blind reviews, whistleblowing packets, media source
        materials), clearing metadata is a required first step but not a sufficient one, page
        content, signatures and embedded photo EXIF still identify the source. Pair the wipe
        here with{" "}
        <Link to="/tools/$slug" params={{ slug: "redact-pdf" }} className="text-[#e5322d] underline">Redact PDF</Link>{" "}
        to blank the identifying content on the pages themselves.
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

export const pdfMetadataFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pdfMetadataHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to edit PDF metadata online for free",
  description:
    "View, edit or clear PDF properties, Title, Author, Subject, Keywords, Producer and Creator, entirely in the browser. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "Any PDF file" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter PDF Metadata Editor (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-metadata#step-${i + 1}`,
  })),
};

export const pdfMetadataSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter PDF Metadata Editor",
  description:
    "Edit PDF metadata online free, view, change or remove Title, Author, Subject, Keywords, Producer and Creator. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
