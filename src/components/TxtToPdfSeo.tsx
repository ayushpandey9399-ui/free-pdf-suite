import type { ReactNode } from "react";
import { BenefitBadges } from "@/components/BenefitBadges";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Bring your text in — as a .txt file or by pasting it",
    text: "Click Select TXT files to pick one or several .txt files from your device (the picker accepts .txt / text/plain and supports multi-select), or tap Or paste text instead to type or paste content straight into a textarea. Both routes feed the same converter — pick whichever is closer to hand.",
  },
  {
    title: "Set the page look on the right",
    text: "Choose Page size A4 or Letter, a Font size (Small 10pt, Medium 12pt, Large 14pt), a Margin (Small, Normal, Big) and Line spacing (1.0, 1.15 or 1.5). With multiple files loaded you also get a Merge into one PDF switch — on gives you a single combined.pdf, off gives you one PDF per file.",
  },
  {
    title: "Click Convert to PDF and download",
    text: "The tool wraps your text to fit the printable area, paginates as many pages as needed and hands back the finished PDF (or PDFs) to your browser's normal download flow. Single files come out named after the source; a combined batch is saved as combined.pdf and a pasted snippet becomes pasted-text.pdf.",
  },
];

const benefits = [
  {
    h: "Clean page layout",
    p: "Every PDF ships with proper A4 or Letter dimensions, the margin you picked (36, 54 or 90 points), the font size you chose and 1.0 / 1.15 / 1.5 line spacing. Long lines are wrapped to fit the printable width and the text flows onto as many pages as it needs — no truncation, no crushed lines.",
  },
  {
    h: "Multi-language support",
    p: "Latin-1 English text is embedded as crisp, selectable vector text using the PDF standard font. When the input contains characters beyond that — Hindi, Marathi, Sanskrit, Chinese, Japanese, Arabic and other Unicode scripts — the tool automatically switches to a shaping pipeline that uses Noto Sans Devanagari and Noto Sans so matras, conjuncts and glyph joining come out correctly.",
  },
  {
    h: "Private conversion",
    p: "The whole conversion runs inside your browser tab, so notes, journals, drafts and personal letters never leave your device. There's no server-side upload of your text and no queue on our side — once the page loads, the actual conversion keeps working even if the connection drops.",
  },
  {
    h: "No length limit",
    p: "There is no artificial page or character cap. The tool wraps your text line by line and adds pages until every wrapped line has a home — a 3-line note becomes a 1-page PDF; a 10,000-line log paginates into as many pages as it needs. The practical ceiling is your device's memory.",
  },
];

const scenarios = [
  {
    h: "Assignments and application portals that only accept PDF",
    p: "University submission systems, government forms and job portals routinely reject .txt attachments and demand a PDF. Convert your draft here and the same content becomes an acceptable upload without you having to open a word processor just to hit File → Export.",
  },
  {
    h: "Notes exported from Notepad, code editors or note apps",
    p: "Content copied out of Notepad, VS Code, Sublime, Obsidian or Apple Notes usually lives as a raw .txt or a paste on the clipboard. Turning it into a PDF gives the recipient a document that opens the same way on every device, with real margins and page breaks instead of a raw text stream.",
  },
  {
    h: "Archiving logs and records in a fixed, printable format",
    p: "Chat logs, server output, invoice line lists and any other plain-text record are safer to archive as PDFs — the layout is frozen, printing is predictable, and the file survives any future changes to the source app. This tool paginates the log cleanly so you can file or print it without surprises.",
  },
  {
    h: "Turning a Hindi or English letter into a document ready to send",
    p: "Whether you're drafting a leave letter, a complaint, a bio or an offer note in Hindi or English, converting the plain text into a PDF makes it presentable enough to attach to an email or upload to a portal. The Hindi pipeline means Devanagari matras render correctly instead of collapsing into boxes.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I convert a TXT file to PDF for free?",
    a: "Open this page, click Select TXT files and pick your .txt file (or paste text with the Or paste text instead link). Choose a page size, font size, margin and line spacing on the right, then hit Convert to PDF. A PDF named after your source file downloads to your device — no account, no card, no watermark added.",
    plain:
      "Click Select TXT files (or paste text), pick page size, font size, margin and line spacing, then hit Convert to PDF. A PDF named after your source file downloads to your device — no account, no watermark.",
  },
  {
    q: "Can I convert Hindi text to PDF?",
    a: "Yes — and getting Hindi right is one of the main reasons this tool exists. When the input contains Devanagari characters, the converter automatically switches to a shaping pipeline that uses Noto Sans Devanagari, so matras stay attached to their base letters and conjuncts like क्ष, त्र and ज्ञ render as proper ligatures. Marathi and Sanskrit written in Devanagari behave the same way. The trade-off is that Hindi pages are drawn as high-resolution images inside the PDF, so the text is not selectable in a viewer — but it prints and displays correctly everywhere.",
    plain:
      "Yes. Devanagari input is routed through a shaping pipeline that uses Noto Sans Devanagari so matras stay attached and conjuncts render as proper ligatures. Marathi and Sanskrit in Devanagari work the same way. Hindi pages are drawn as high-resolution images, so text is not selectable — but it displays and prints correctly.",
  },
  {
    q: "Why do other converters show \"????\" for Hindi?",
    a: "Most free converters embed the standard PDF font (Helvetica), which only knows the first 256 Latin characters — Devanagari letters live far outside that range, so the encoder replaces each unknown character with a question mark. This tool detects that your text contains characters above that range and switches to a different pipeline that loads a proper Devanagari font in the browser and draws the shaped text onto the page. Same input, correct output.",
    plain:
      "Most free converters embed the standard PDF font Helvetica, which only knows the first 256 Latin characters, so Devanagari letters become question marks. This tool detects non-Latin characters and switches to a pipeline that loads a proper Devanagari font in the browser and draws shaped text onto the page.",
  },
  {
    q: "Can I paste text directly instead of uploading a file?",
    a: "Yes. On the start screen there's a small Or paste text instead link under the file dropzone — tap it to switch to a paste view with a textarea, type or paste your content, and press Convert to PDF. The output is saved as pasted-text.pdf. You can flip back to file mode at any time with the Use a file instead link.",
    plain:
      "Yes. Click Or paste text instead under the file dropzone, type or paste into the textarea and press Convert to PDF. The output is saved as pasted-text.pdf. Switch back with Use a file instead.",
  },
  {
    q: "Will English text be selectable in the PDF?",
    a: "Yes. When your input stays inside the standard Latin-1 range (English and most Western European languages), the tool takes a fast vector path that embeds the text using the standard PDF Helvetica font — so you can select, copy and search it in any viewer. The moment a Devanagari or CJK character appears, the tool switches to the image-based pipeline for that job and the output note tells you the pages aren't selectable.",
    plain:
      "Yes. Pure Latin-1 input takes a vector path with the standard PDF Helvetica font, so text is selectable, copyable and searchable in any viewer. If Devanagari or CJK characters appear, the tool switches to the image-based pipeline and the output note flags that the pages aren't selectable.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Your .txt content and pasted text are read, converted and packaged into a PDF entirely inside your browser tab, so the words themselves never leave your device. To render Hindi and other non-Latin scripts, the browser does download the Noto Sans and Noto Sans Devanagari font files from Google Fonts the first time they're needed — but that request only fetches the font, it never carries your text back the other way.",
    plain:
      "No. The .txt content and pasted text are converted into a PDF entirely inside your browser tab; the words never leave your device. For non-Latin scripts the browser downloads the Noto Sans and Noto Sans Devanagari font files from Google Fonts, but that request only fetches the fonts — your text is never uploaded.",
  },
  {
    q: "Can I change font size or page size?",
    a: "Yes — both, from the sidebar. Page size toggles between A4 and Letter, and Font size offers Small (10pt), Medium (12pt) and Large (14pt). You can also pick a Margin (Small, Normal, Big) and Line spacing (1.0, 1.15 or 1.5). Every setting affects both the vector and the image-based pipelines the same way.",
    plain:
      "Yes. Page size toggles between A4 and Letter; Font size offers Small (10pt), Medium (12pt) and Large (14pt); Margin has Small, Normal and Big; Line spacing offers 1.0, 1.15 and 1.5. All settings apply to both pipelines.",
  },
  {
    q: "Is there a file length limit?",
    a: "No artificial cap on characters, lines or pages. The tool wraps each line to the printable width and adds pages until every line has a slot, so a five-word note becomes a one-page PDF and a very long log paginates into as many pages as it needs. Practical limits come from your device's memory, especially in the image-based Hindi pipeline where each page is a high-resolution image.",
    plain:
      "No artificial cap on characters, lines or pages. Lines are wrapped to the printable width and pages are added until every line fits. Practical limits come from your device's memory, especially in the image-based Hindi pipeline.",
  },
  {
    q: "Can I convert on my phone?",
    a: "Yes. The whole tool is a web page, so on a phone Select TXT files opens the standard file picker (Files, Drive, iCloud, etc.), the paste option opens a normal textarea for typing or pasting, and Convert to PDF hands the finished document to the browser's usual download flow. No app to install and no permissions to grant beyond picking the file itself.",
    plain:
      "Yes. Select TXT files opens the phone's standard file picker, the paste option opens a textarea, and Convert to PDF uses the browser's normal download flow. No app to install.",
  },
  {
    q: "How do I do the reverse — PDF to text?",
    a: (
      <>
        Use the reverse tool:{" "}
        <Link to="/tools/pdf-to-text" className="text-[#e5322d] underline">
          PDF to Text
        </Link>
        . It reads the text layer of a PDF and lets you copy the whole document to the clipboard or download it as a .txt file. Everything happens in the browser there too, so the PDF you're extracting from never leaves your device.
      </>
    ),
    plain:
      "Use the reverse tool: PDF to Text (/tools/pdf-to-text). It reads the text layer of a PDF and lets you copy the whole document to the clipboard or download it as a .txt file. Everything happens in the browser, so the source PDF never leaves your device.",
  },
];

const related = [
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "The reverse direction — pull the words out of a PDF as plain text." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine your fresh PDF with other documents into a single file." },
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Number the pages after converting for reports, dissertations and printouts." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Add a title, date or filename to every page of the converted PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink the file — especially useful when the Hindi image pipeline produces a larger PDF." },
] as const;

export function TxtToPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Files never leave your device", "Hindi and other languages supported", "Free, no signup, no watermark"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert a text file to PDF online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
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

      {/* Hindi differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Works with Hindi, where most converters fail
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Try converting a paragraph of Hindi, Marathi or Sanskrit in most free
        online text-to-PDF tools and you'll see the same disappointing result:
        rows of question marks, empty boxes, or roman transliteration instead
        of Devanagari. The reason is boring but simple — those converters build
        the PDF with the standard font that has been shipped with PDF viewers
        since the 1990s, and that font only knows a handful of Latin
        characters. Anything beyond it, including every Devanagari matra and
        conjunct, gets replaced with a placeholder because the font has no
        glyph for it.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This converter takes a different route the moment your text contains a
        non-Latin character. It loads real Noto Sans Devanagari fonts inside
        the browser, uses the same shaping engine your browser uses to display
        Hindi on a normal web page, and paints each page onto a
        high-resolution canvas — so matras attach to the right base letters,
        conjuncts like क्ष and ज्ञ render as proper ligatures, and half-forms
        connect the way native readers expect. English content, on the other
        hand, still goes through the fast selectable-text path, so a plain
        Latin document doesn't pay for the Hindi machinery at all. The tool
        picks the right pipeline automatically for each conversion.
      </p>

      {/* Presentable */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        From plain text to a presentable document
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A .txt file is a strange thing to hand someone. It has no page
        structure, opens in whatever editor the recipient happens to have set
        as default, wraps differently on every screen and looks nothing like
        what you saw when you wrote it. Converting the same content to PDF
        pins everything down: real margins, a real font size, real page
        breaks, and identical rendering on every device that opens the file.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        That's why portals, professors and hiring managers keep asking for a
        PDF instead of the notepad export they somehow received: it prints
        cleanly, attaches to any email client, uploads without odd
        line-wrapping and is impossible to accidentally re-format in transit.
        Convert once here and the same file is ready for every one of those
        destinations.
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
        When do you need to convert text to PDF?
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
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {related.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className="rounded-lg border border-[#eee] p-4 transition-colors hover:border-[#e5322d] hover:bg-[#fef6f5]"
          >
            <div className="font-semibold text-[15px]">{r.name}</div>
            <div className="mt-1 text-[13.5px] text-[#7a7a86]">{r.blurb}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export const txtToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const txtToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert a text file to PDF online for free",
  description:
    "Convert TXT files or pasted text into a clean, printable PDF entirely inside your browser — with Hindi and other non-Latin scripts rendered correctly. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "One or more .txt files, or a block of text to paste" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree TXT to PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/txt-to-pdf#step-${i + 1}`,
  })),
};

export const txtToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree TXT to PDF",
  description:
    "Convert TXT to PDF online free — turn text files or pasted content into clean, printable PDFs entirely inside the browser. Supports Hindi and other non-Latin scripts. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
