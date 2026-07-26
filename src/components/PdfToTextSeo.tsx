import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Click Select PDF file and pick the document",
    text: "Choose the PDF you want the words out of from your computer or phone. The file opens locally in the workspace as a selected file card; no upload happens at this step, and nothing about the document has been shared with us to reach the picker.",
  },
  {
    title: "Click Extract Text and wait for the progress bar",
    text: "The tool walks through the PDF one page at a time and pulls the text layer out of each one. You'll see a percentage tick up as pages are processed, a long report simply takes a few more seconds than a one-pager, but everything is happening in your browser tab.",
  },
  {
    title: "Read the preview to check the result",
    text: "The extracted text appears in a scrollable preview panel with a --- Page N --- marker between pages, so you can quickly confirm the order and spot any page that came back empty (those are labelled [No text found on this page]).",
  },
  {
    title: "Copy to clipboard or download as .txt",
    text: "Hit Copy to clipboard to paste the whole document straight into a note, email or chat, or use Download .txt to save the extracted text as a plain-text file named after your original PDF. Both options give you the same content, pick whichever fits the next step in your workflow.",
  },
];

const benefits = [
  {
    h: "Full document in one go",
    p: "Every page of the PDF is processed in a single run and stitched into one output in reading order, with a --- Page N --- marker between pages. You don't have to feed pages one at a time or paste chunks together, a 300-page report comes out as a single continuous block of text.",
  },
  {
    h: "Copy or download",
    p: "The success screen gives you both options side by side: Copy to clipboard for a quick paste into another app, and Download .txt to save a plain-text file named after your PDF. Use the button that matches what you're about to do next, no need to choose ahead of time.",
  },
  {
    h: "Private by design",
    p: "Contracts, medical letters, salary slips and internal reports never leave your device. The PDF is parsed and its text extracted entirely inside your browser tab, so nothing about the document, filename, page count or content, is ever transmitted to us.",
  },
  {
    h: "Verify your redactions",
    p: (
      <>
        After blacking out sensitive text with{" "}
        <Link to="/tools/$slug" params={{ slug: "redact-pdf" }} className="text-[#e5322d] underline">
          Redact PDF
        </Link>
        , run the redacted file through this tool. If the redaction was real, the covered words will be absent from the extracted text; if they still show up, the black box was only a visual cover-up and the underlying text is still readable to any machine.
      </>
    ),
  },
];

const scenarios = [
  {
    h: "Quoting a report or research paper in your own document",
    p: "You need to lift a paragraph from a PDF into a memo, a thesis or a blog post without retyping it. Extract the whole document once, then search for the passage you want and paste just those lines into your draft, no more copy-paste-and-fix-the-line-breaks from a PDF viewer.",
  },
  {
    h: "Converting an e-book or notes PDF into plain text for editing or translation",
    p: "Study notes, self-published e-books and lecture handouts often arrive as PDFs even though you want to edit them or run them through a translator. Getting the text out first turns the file into something any editor or translation tool can actually work with, without the fonts and layout getting in the way.",
  },
  {
    h: "Pulling text out to search or analyze a long document",
    p: "A long contract, court filing or product spec is much easier to search inside a plain text editor than inside a PDF viewer, especially for terms scattered across dozens of pages. Extract the text once and you can grep it, load it into a script, feed it to another tool or just Ctrl+F through the full document at full speed.",
  },
  {
    h: "Checking what text is really embedded in a file",
    p: "Two PDFs can look identical and behave very differently, one may be a proper text document, the other a scan wearing a PDF wrapper. Running a file through this tool answers that question in one click and, after a redaction pass, confirms whether the sensitive words are truly gone or just visually covered.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I extract text from a PDF for free?",
    a: "Click Select PDF file, pick the document from your device, then press Extract Text. The tool reads the text layer of each page in your browser and shows the result on a success screen with Copy to clipboard and Download .txt buttons. No account, no card and nothing to install.",
    plain:
      "Click Select PDF file, pick the document, then press Extract Text. The tool reads the text layer of each page in your browser and shows the result with Copy to clipboard and Download .txt buttons. No account, no card, nothing to install.",
  },
  {
    q: "Why is my output empty or incomplete?",
    a: "The most common reason is that the PDF has no real text layer inside it, pages are just images (a scan, a photo, or an image exported to PDF). This tool can only extract text that already exists in the file, so image-only pages come back marked [No text found on this page]. That isn't a bug; there is genuinely no text for the tool to read.",
    plain:
      "The most common reason is that the PDF has no real text layer, the pages are images (a scan, a photo or an image exported to PDF). The tool can only extract text that already exists in the file, so image-only pages come back marked [No text found on this page].",
  },
  {
    q: "Do you support OCR for scanned documents?",
    a: "Not today. Getting text out of images requires OCR (optical character recognition), which is a separate technology, and FreePDFHub does not include an OCR tool at the moment. It is on our roadmap. For now, if your PDF is a scan, this extractor will honestly report an empty result rather than pretend to have read something.",
    plain:
      "Not today. OCR is a separate technology and FreePDFHub does not include an OCR tool at the moment; it is on our roadmap. For now, scanned PDFs return an empty result rather than pretending to have read something.",
  },
  {
    q: "Will the text keep its formatting?",
    a: "Only the parts that plain text can carry, paragraphs, line breaks and reading order across pages. Fonts, bold/italic styling, colors, columns, tables and images are dropped, because a .txt file has no way to represent them. If you need the layout preserved, that's a different kind of job than pure text extraction.",
    plain:
      "Only what plain text can carry, paragraphs, line breaks and reading order across pages. Fonts, styling, colors, columns, tables and images are dropped because a .txt file cannot represent them.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened and parsed entirely inside your browser tab, and the extracted text never leaves your device. There is no queue on our side, no temporary server-side copy and no log of the document's contents, once this page has loaded, the actual extraction step keeps working even if you go offline.",
    plain:
      "No. The PDF is opened and parsed entirely inside your browser tab and the extracted text never leaves your device. No queue, no temporary server copy, no log.",
  },
  {
    q: "Can I extract text from a password-protected PDF?",
    a: (
      <>
        Not directly, a locked PDF blocks even reading its text layer, and this tool will show a Password-protected notice instead of running. Remove the password first with{" "}
        <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#e5322d] underline">
          Unlock PDF
        </Link>{" "}
        (you'll need to know the password), then bring the unlocked copy back here and extract the text as normal.
      </>
    ),
    plain:
      "Not directly. A locked PDF blocks reading its text layer, and the tool will show a Password-protected notice. Remove the password first with Unlock PDF (/tools/unlock-pdf) using the password you know, then extract text from the unlocked copy.",
  },
  {
    q: "Is there a page limit?",
    a: "No artificial cap. The tool processes as many pages as your PDF contains, one after another, and shows progress while it goes. The practical ceiling is your device's memory, very large books can be slower on an older phone than on a laptop, but there is no rule that stops you at 20 or 50 pages.",
    plain:
      "No artificial cap. The tool processes every page in the PDF and shows progress while it goes. The practical ceiling is your device's memory.",
  },
  {
    q: "Can I extract text on my phone?",
    a: "Yes. The whole tool is a web page, so tapping Select PDF file opens your phone's normal file picker (Files, Drive, iCloud, etc.), Extract Text runs inside the mobile browser, and Copy to clipboard / Download .txt behave exactly the way they do on desktop. No app to install.",
    plain:
      "Yes. It is a web page, so Select PDF file opens the phone's file picker, Extract Text runs in the mobile browser and Copy/Download behave the same as on desktop. No app to install.",
  },
  {
    q: "Can I extract text in Hindi or other languages?",
    a: "Yes, provided the PDF has a real text layer in that language. Devanagari, Tamil, Bengali, Arabic, Chinese, Japanese and any other Unicode script all come out correctly when the file was authored with proper text (from Word, LaTeX, most modern report generators, and so on). If instead the pages are photographs of Hindi text with no text layer, no tool can extract without OCR, and this one won't either.",
    plain:
      "Yes, provided the PDF has a real text layer in that language. Devanagari, Tamil, Arabic, Chinese and other Unicode scripts extract correctly when the file was authored with proper text. Scanned pages in any language still need OCR.",
  },
  {
    q: "How is this different from PDF to Word?",
    a: "This tool gives you plain text, the words in reading order, with page markers, and nothing else. A PDF-to-Word conversion is a much heavier job that tries to rebuild fonts, headings, tables, images and column layout inside a .docx file, and FreePDFHub doesn't currently ship that tool. If all you need is the words themselves, to quote, translate, search or paste elsewhere, plain text is usually the right output and this page is the shortest path to it.",
    plain:
      "This tool gives plain text, words in reading order with page markers. A PDF-to-Word conversion rebuilds fonts, tables and layout inside a .docx file, which is a different job; FreePDFHub doesn't ship a PDF-to-Word tool today.",
  },
];

const related = [
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/txt-to-pdf", name: "TXT to PDF", blurb: "Turn a plain-text file into a clean, readable PDF." },
  { to: "/tools/compare", name: "Compare PDFs", blurb: "See the differences between two versions side by side." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently black out sensitive text and images." },
] as const;

export function PdfToTextSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to extract text from a PDF online for free
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

      {/* Get clean text */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Get clean, copyable text out of any PDF
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        PDF is a great format for reading and printing but a stubborn one for
        reuse. Selecting a passage in a PDF viewer and pasting it into a
        document often turns tidy paragraphs into a broken staircase of half
        sentences, drops footnotes into the middle of body copy or scrambles
        the order when the page is laid out in columns.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool skips the viewer entirely. It reads the PDF's underlying text
        layer directly, page by page, and returns everything as one flat
        stream of Unicode, the same words in the same reading order, without
        the line-wrapping and column artifacts a manual copy tends to
        introduce. From there you can quote a report in your own document,
        reuse content in a slide deck, feed the text to a translator or a
        script, or just search a long file inside a plain text editor at full
        speed. It's the fastest way to convert PDF to plain text when the words
        are what you need, not the layout.
      </p>

      {/* Honest OCR note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note about scanned PDFs
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool extracts the text <em>layer</em> of a PDF. If your PDF is a
        scan, pages that are really just photographs of paper wrapped in a
        PDF container, there is no text layer inside the file, and the
        output will be empty (or a page will come back marked
        &ldquo;[No text found on this page]&rdquo;). That is not a bug; there
        is genuinely nothing textual for the tool to read.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Reading words out of an image requires OCR (optical character
        recognition), which is a completely different technology from text
        extraction. To be transparent: FreePDFHub does not currently ship an OCR
        tool, it's on our roadmap. Until it lands, this extractor will
        honestly tell you when a page has no text rather than guess. If your
        source is a scan today, you'll need an OCR-capable app to convert it
        into a searchable PDF first, then bring that result back here.
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
        When do you need to extract text from a PDF?
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

export const pdfToTextFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const pdfToTextHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to extract text from a PDF online for free",
  description:
    "Pull the full text layer out of a PDF entirely inside your browser and copy it to the clipboard or download it as a .txt file. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file with a text layer" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub PDF to Text (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-to-text#step-${i + 1}`,
  })),
};

export const pdfToTextSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub PDF to Text",
  description:
    "Extract text from PDF online free, pull the full text layer out of any PDF with a text layer, page by page, entirely inside your browser. Copy to clipboard or download as a .txt file. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
