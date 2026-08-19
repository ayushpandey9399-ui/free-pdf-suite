import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Click Select PDF file and choose your document",
    text: "Pick the PDF you want as a Word document from your computer or phone. Before anything is sent, the tool checks the extension, reads the first bytes of the file to confirm it really is a PDF, and blocks anything over 25 MB so you are never left waiting on an upload that cannot succeed.",
  },
  {
    title: "Watch the upload progress bar",
    text: "Unlike the rest of our tools, this one needs a server, so the file is uploaded to our conversion service at api.pdftoolconverteronline.com. A determinate progress bar shows exactly how much has been sent, and a Cancel button stops the transfer at any point and returns you to the start.",
  },
  {
    title: "Let the server convert the PDF to DOCX",
    text: "Once the upload finishes, the status changes to Converting on our server. The conversion rebuilds paragraphs, headings, tables and images into an editable Word document. Most files finish in a few seconds; very long or graphics heavy documents take a little longer.",
  },
  {
    title: "Download the .docx and open it in Word",
    text: "The finished document downloads with the same name as your PDF but a .docx extension, ready to open in Microsoft Word, Google Docs, LibreOffice Writer or Pages. Your uploaded PDF is deleted from our server as soon as the download has been sent.",
  },
];

const benefits = [
  {
    h: "Real editable Word output",
    p: "The result is a genuine .docx file, not a PDF renamed or a picture of your pages pasted into a document. Paragraphs stay as paragraphs, so you can retype a clause, fix a name, change a number or restyle a heading with the normal Word tools.",
  },
  {
    h: "Layout kept as close as possible",
    p: "Headings, lists, tables, images and column structure are carried across so the Word file looks like the original at a glance. Complex desktop publishing layouts can shift slightly, which is normal for any PDF to Word conversion, and easy to tidy up once the text is editable.",
  },
  {
    h: "Deleted right after conversion",
    p: "This is our only server side tool, so we are blunt about it. Your PDF is uploaded, converted, returned and then deleted, and any leftover file is cleared within ten minutes. We never log file names or file contents, only the status, the size and how long the job took.",
  },
  {
    h: "Free with no account",
    p: (
      <>
        There is no signup, no card, no watermark and no trial. If your file is
        locked you can remove the password first with{" "}
        <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#e5322d] underline">
          Unlock PDF
        </Link>
        , and if it is too large you can shrink it with{" "}
        <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#e5322d] underline">
          Compress PDF
        </Link>{" "}
        before converting.
      </>
    ),
  },
];

const scenarios = [
  {
    h: "Editing a contract or agreement you only received as a PDF",
    p: "The other side sends a final PDF, then a clause needs to change. Converting to Word gives you a document you can redline, comment on and send back, instead of retyping the whole agreement from scratch.",
  },
  {
    h: "Reusing a report, proposal or resume",
    p: "You have last year's proposal or an old resume as a PDF and the source file is long gone. A Word copy lets you update the dates, swap the client name and reuse the structure without rebuilding the layout by hand.",
  },
  {
    h: "Translating or rewriting long documents",
    p: "Translation tools, grammar checkers and writing assistants work far better on a .docx than on a PDF. Convert first, then run the document through whatever tool you use, and keep the headings and tables intact along the way.",
  },
  {
    h: "Collaborating with people who work in Word",
    p: "Colleagues who track changes, add comments and pass drafts around need a Word file. Converting the PDF once turns a read only handover into a document the whole team can actually work in.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "Is the PDF to Word converter free?",
    a: "Yes, completely free. There is no account, no card, no trial period, no watermark on the output and no daily conversion quota beyond a fair use rate limit that stops automated abuse. If you do hit that limit, waiting a few minutes clears it.",
    plain:
      "Yes, completely free. No account, no card, no trial, no watermark and no daily quota beyond a fair use rate limit that clears after a few minutes.",
  },
  {
    q: "Is there a file size limit?",
    a: "Yes, 25 MB per file for this tool. The size is checked in your browser before anything is uploaded, so an oversized file fails instantly instead of wasting your bandwidth. If your PDF is larger, run it through Compress PDF first and then convert the smaller copy.",
    plain:
      "Yes, 25 MB per file. The size is checked in your browser before any upload starts. For larger PDFs, use Compress PDF (/tools/compress) first and convert the smaller copy.",
  },
  {
    q: "What happens to my file after conversion?",
    a: (
      <>
        This specific tool uploads your PDF to our own server, because a
        faithful Word conversion cannot be done in the browser today. The
        uploaded PDF and the converted document are deleted immediately after
        the download is sent, and any leftover file is removed within ten
        minutes. We never log file names or file contents, only technical
        request data such as status, size and duration. Every one of our other
        tools runs entirely in your browser and uploads nothing at all. The
        full detail is in our{" "}
        <Link to="/privacy-policy" className="text-[#e5322d] underline">
          privacy policy
        </Link>
        .
      </>
    ),
    plain:
      "This tool uploads your PDF to our own server because a faithful Word conversion cannot be done in the browser today. The uploaded PDF and the converted file are deleted immediately after the download is sent, and any leftover file is removed within ten minutes. We never log file names or file contents, only status, size and duration. All of our other tools run entirely in your browser and upload nothing.",
  },
  {
    q: "Is the layout preserved in the Word file?",
    a: "In most cases yes. Headings, paragraphs, lists, tables and images are rebuilt in the .docx, so the document reads the same as the PDF. Heavily designed files with unusual fonts, text boxes or multi column magazine layouts can shift a little, which is normal for any PDF to Word conversion and quick to correct once the text is editable.",
    plain:
      "In most cases yes. Headings, paragraphs, lists, tables and images are rebuilt in the .docx. Heavily designed layouts with unusual fonts or text boxes can shift slightly, which is normal for any PDF to Word conversion.",
  },
  {
    q: "Does it work on scanned PDFs?",
    a: (
      <>
        Only partly. A scan is a photograph of paper, so there is no text to
        rebuild and the pages come through as images inside the Word file
        rather than editable text. If you need searchable text from a scan,
        our{" "}
        <Link to="/tools/$slug" params={{ slug: "scan-to-pdf" }} className="text-[#e5322d] underline">
          Scan to PDF
        </Link>{" "}
        tool has an in browser OCR option that produces a searchable PDF first.
      </>
    ),
    plain:
      "Only partly. A scan is a photograph of paper, so pages come through as images rather than editable text. For searchable text from a scan, use the in browser OCR option in Scan to PDF (/tools/scan-to-pdf) first.",
  },
  {
    q: "Can I convert a password protected PDF?",
    a: (
      <>
        No. A locked PDF cannot be read by the converter, and we check for
        encryption in your browser so a protected file is never uploaded.
        Remove the password first with{" "}
        <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#e5322d] underline">
          Unlock PDF
        </Link>{" "}
        using the password you already know, then convert the unlocked copy.
      </>
    ),
    plain:
      "No. A locked PDF cannot be read by the converter, and we check for encryption in your browser so a protected file is never uploaded. Remove the password first with Unlock PDF (/tools/unlock-pdf), then convert the unlocked copy.",
  },
  {
    q: "Does it work on phones?",
    a: "Yes. The tool is a normal web page, so tapping Select PDF file opens your phone's file picker, the progress bar and Cancel button work the same as on desktop, and the finished .docx lands in your downloads folder ready for Word, Google Docs or Pages.",
    plain:
      "Yes. Tapping Select PDF file opens the phone's file picker, the progress bar and Cancel button behave the same as on desktop, and the .docx lands in your downloads folder.",
  },
  {
    q: "Why is this tool not fully in the browser like the others?",
    a: "Because a faithful PDF to Word conversion needs a document engine that is far too heavy to download into a browser tab. Rather than ship a poor quality in browser version, we run the conversion on our own server, tell you plainly that it happens, and delete the file straight after. Our conversion service is open source so you can read exactly what it does.",
    plain:
      "A faithful PDF to Word conversion needs a document engine that is far too heavy for a browser tab. We run it on our own server, say so plainly, delete the file straight after, and publish the service as open source.",
  },
];

const related = [
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Pull the plain text out of a PDF, fully in your browser." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a password you know so the file can be converted." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink a large PDF under the 25 MB limit." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one document first." },
  { to: "/tools/split", name: "Split PDF", blurb: "Convert only the section you actually need." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand new PDF." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high quality JPG or PNG." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Fix text directly in the PDF without leaving the browser." },
] as const;

export function PdfToWordSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert PDF to Word
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

      {/* Intro prose */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Turn a PDF into an editable Word document
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A PDF is built to be read, not rewritten. The moment a sentence needs to
        change, a date needs updating or a clause needs a redline, the format
        that made the document easy to share becomes the thing standing in your
        way. Converting PDF to Word gives you the same content in a .docx you
        can actually type into.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This converter rebuilds your document rather than screenshotting it.
        Paragraphs stay as text, headings stay as headings, tables stay as
        tables and images stay in place, so the Word file opens looking like the
        original and behaves like something you wrote yourself. It is free,
        needs no account, adds no watermark and works the same on a phone as on
        a laptop.
      </p>

      {/* Honest server note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note: this tool uses our server
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every other tool on pdftoolconverteronline.com runs entirely inside your browser and
        never uploads anything. This one is the exception, and we would rather
        say so clearly than bury it. A high quality PDF to Word conversion needs
        a document engine that is far too large to load into a browser tab, so
        your PDF is uploaded to our own conversion server, converted there, and
        sent back to you as a .docx.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The uploaded file and the converted result are deleted immediately after
        the download is sent, and anything left behind is cleared within ten
        minutes. We store technical request logs only, the status code, the file
        size and how long the conversion took. File names and file contents are
        never written to a log. If your document is too sensitive for that,
        please use one of our in browser tools instead.
      </p>

      {/* Benefits */}
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
        When do you need to convert PDF to Word?
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
      </h3>
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

export const pdfToWordFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const pdfToWordHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to Word",
  description:
    "Convert a PDF into an editable Word .docx document for free. Pick your file, upload it to our conversion server, and download the Word version. The uploaded file is deleted right after the download.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file under 25 MB" }],
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com PDF to Word (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-to-word#step-${i + 1}`,
  })),
};

export const pdfToWordSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com PDF to Word",
  description:
    "Convert PDF to Word online free. Upload a PDF up to 25 MB and get an editable .docx with headings, paragraphs, tables and images preserved. No signup and no watermark, and the uploaded file is deleted right after conversion.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
