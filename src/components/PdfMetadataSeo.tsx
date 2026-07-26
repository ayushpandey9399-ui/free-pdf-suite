import type { ReactNode } from "react";
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

const benefits = [
  {
    h: "See everything at once",
    p: "The moment a PDF drops in, every property the file carries, Title, Author, Subject, Keywords, Producer, Creator, Created and Modified dates, is on screen. There are no separate tabs or dialogs; you're looking at the same summary a colleague or recipient would see when they open File → Properties.",
  },
  {
    h: "Edit or erase",
    p: "Correct fields one at a time when you just need to fix a stale author name or write a proper Title, or flip the Clear all metadata switch to wipe Title, Author, Subject, Keywords, Producer, Creator and the Created / Modified timestamps in a single click. Both paths save into a fresh -updated.pdf copy.",
  },
  {
    h: "Content untouched",
    p: "Only the document's property fields change. Pages, text, images, layout, fonts and file quality stay exactly as they were; the tool rewrites the metadata dictionary and re-serialises the file, without touching a single page of content.",
  },
  {
    h: "Private inspection",
    p: "Auditing a sensitive document, a resume, a contract draft, an internal memo, usually means uploading it somewhere just to see who created it. Here the file is opened, inspected and rewritten inside your browser tab, so a sensitive document never becomes a stranger's copy just to be checked.",
  },
];

const scenarios = [
  {
    h: "Cleaning documents before you publish or share them externally",
    p: "A whitepaper, a brochure or a downloadable resource almost always inherits the author name of whoever built the template. Before it goes on your website or into a partner's inbox, open it here, wipe the internal author and set a proper title so the file represents your organisation, not the intern who exported it.",
  },
  {
    h: "Fixing embarrassing browser-tab titles on official documents",
    p: "When an invoice, offer letter or tender opens in Chrome or Safari, the tab title comes from the metadata Title, which is why users sometimes see \"Microsoft Word - draft_v3_FINAL_use_this_one\" at the top of the browser. Set a clean Title here and every viewer that reads metadata shows it correctly.",
  },
  {
    h: "Setting proper properties on reports, e-books and portfolios you distribute",
    p: "Documents you're proud of deserve accurate cataloguing. A real Title makes the file easier to search on desktops, a real Author is what shows up in library apps and reference managers, and Keywords help operating-system search surface the PDF when someone looks for the topic later.",
  },
  {
    h: "Anonymising documents where the author must not be identifiable",
    p: (
      <>
        For blind reviews, whistleblowing submissions and anonymous
        tips, clearing the metadata author and producer is a required
        first step, but it's only the metadata half of the job. Pair
        this with{" "}
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">
          Redact PDF
        </Link>{" "}
        to blank names, signatures and letterheads on the visible
        pages; metadata cleaning removes what's hidden, redaction
        removes what's shown.
      </>
    ),
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "What is PDF metadata?",
    a: "It's the set of properties every PDF quietly carries about itself, Title, Author, Subject, Keywords, the software that produced it (Producer and Creator), and the creation and modification timestamps. None of it shows on the printed page, but anyone who opens File → Properties in a PDF reader can read all of it in seconds.",
    plain:
      "It's the set of properties every PDF carries about itself, Title, Author, Subject, Keywords, Producer, Creator and creation/modification dates. Nothing shows on the page, but File → Properties in any reader reveals it.",
  },
  {
    q: "How do I remove all metadata from a PDF?",
    a: "Open the file here, tick Clear all metadata in the sidebar, then click Save PDF. The tool blanks Title, Author, Subject and Keywords, resets Producer and Creator, and removes the Created and Modified timestamps, then downloads a fresh -updated.pdf copy with those fields empty.",
    plain:
      "Open the file, tick Clear all metadata, click Save PDF. Title, Author, Subject, Keywords, Producer, Creator and the Created/Modified timestamps are all wiped in a fresh -updated.pdf copy.",
  },
  {
    q: "Can people really see my PDF's metadata?",
    a: "Yes, and no special tools are required. In Adobe Reader, Acrobat, Preview on macOS, most Linux viewers and even a right-click Properties on Windows, the Title, Author, Subject, Keywords, Producer and Creator are one dialog away. Browsers and search engines read the Title too, which is why tab titles sometimes contain names or template hints the sender didn't realise were in there.",
    plain:
      "Yes. Adobe Reader, Acrobat, macOS Preview, Windows right-click Properties and most viewers all expose Title, Author, Subject, Keywords, Producer and Creator in one dialog. Browsers read the Title too.",
  },
  {
    q: "Does editing metadata change the document's content?",
    a: "No. Only the property fields on the file are rewritten; the pages, text, images, layout, fonts and dimensions are copied through untouched. A recipient opening the -updated.pdf will see exactly the same document, just with different, or no, properties in the file dialog.",
    plain:
      "No. Only property fields change. Pages, text, images, layout, fonts and dimensions are copied through untouched.",
  },
  {
    q: "Which fields can I edit?",
    a: "Four fields are directly editable in the sidebar: Title, Author, Subject and Keywords (comma-separated). Producer, Creator, Created and Modified are shown as read-only trail information so you can inspect them, and Clear all metadata wipes them too, Producer and Creator are reset to empty strings and the Created and Modified timestamps are removed from the document information dictionary.",
    plain:
      "Editable: Title, Author, Subject and Keywords. Producer, Creator, Created and Modified are shown as read-only trail info; ticking Clear all metadata also resets Producer/Creator and removes the Created/Modified timestamps.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Reading the existing metadata, rendering the first-page thumbnail and writing the new -updated.pdf all happen inside your browser tab with pdf-lib and pdf.js. Nothing about the file is transmitted anywhere, and once the page has loaded the whole flow continues to work offline.",
    plain:
      "No. Reading metadata, rendering the thumbnail and writing the -updated.pdf all happen inside your browser tab with pdf-lib and pdf.js. Nothing is transmitted, and the tool works offline once loaded.",
  },
  {
    q: "Does clearing metadata make a PDF fully anonymous?",
    a: (
      <>
        No, and this is the important honest part. Clear all metadata
        wipes the property fields, Title, Author, Subject, Keywords,
        Producer, Creator, and removes the Created and Modified
        timestamps from the document information dictionary, and
        pdf-lib is instructed not to stamp a fresh modification date
        when it saves. But everything printed on the pages themselves
        stays: names in the text, signatures on the last page,
        letterheads at the top, watermarks, embedded photos with
        their own EXIF. For truly anonymous distribution, clean the
        metadata here, then use{" "}
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">
          Redact PDF
        </Link>{" "}
        to permanently blank the identifying content on the pages.
        One more caveat worth knowing: this tool edits the standard
        document information dictionary, but some PDFs also carry a
        separate XMP metadata stream created by other software that
        can hold its own copy of the title, author and dates. It is
        not rewritten here, so always re-inspect a sanitised copy in
        a reader before you rely on it being clean.
      </>
    ),
    plain:
      "No. Clearing wipes Title, Author, Subject, Keywords, Producer, Creator and the Created/Modified timestamps, and pdf-lib is told not to stamp a fresh ModDate on save. But names, signatures and letterheads printed on the pages stay, use Redact PDF for visible content. Some PDFs also carry a separate XMP metadata stream that isn't rewritten here, so re-inspect a sanitised copy before relying on it.",
  },
  {
    q: "Why does my PDF open with a weird title in the browser tab?",
    a: "Because Chrome, Safari, Edge and Firefox all show the PDF's metadata Title in the tab, not the filename. If the Title was never set, or was inherited from a template, you end up with tab titles like \"Microsoft Word - final_v3_use_this\" or a colleague's document name. Set a real Title in this tool, save, and every browser tab will show what you want it to.",
    plain:
      "Because browsers show the metadata Title in the tab, not the filename. If the Title is empty or came from a template, viewers see whatever's inside. Set a real Title here and every tab shows it correctly.",
  },
  {
    q: "Can I edit metadata on my phone?",
    a: "Yes. The tool is responsive and runs entirely client-side, so it works in mobile Chrome, Safari and Firefox on iOS and Android. Tap Select PDF file, pick a PDF from Files, Google Drive or iCloud, edit the four fields, or tick Clear all metadata, and save the -updated.pdf back to your device.",
    plain:
      "Yes. The tool runs client-side in mobile Chrome, Safari and Firefox on iOS and Android. Pick a PDF, edit the fields or clear all metadata, and save the -updated.pdf back to your device.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. The editor is a web page that runs in any modern browser, Chrome, Safari, Firefox, Edge or Brave, with no Acrobat licence, no install and no signup. The download is a standard PDF that opens the same way in every reader, with your updated Title, Author, Subject and Keywords in place.",
    plain:
      "No. It runs in Chrome, Safari, Firefox, Edge or Brave, no Acrobat licence, no install, no signup. Output is a standard PDF that opens anywhere.",
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
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">Redact PDF</Link>{" "}
        to blank the identifying content on the pages themselves.
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
        When do you need to edit PDF metadata?
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

export const pdfMetadataFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
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
  tool: [{ "@type": "HowToTool", name: "FreePDFHub PDF Metadata Editor (web browser)" }],
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
  name: "FreePDFHub PDF Metadata Editor",
  description:
    "Edit PDF metadata online free, view, change or remove Title, Author, Subject, Keywords, Producer and Creator. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
