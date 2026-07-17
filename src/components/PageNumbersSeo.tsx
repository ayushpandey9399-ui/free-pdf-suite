import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Load the PDF you want to paginate",
    text: "Click Select PDF file and pick the document from your device. The first page renders as a live preview in the middle of the workspace so you can watch exactly where the number will sit before you commit.",
  },
  {
    title: "Pick a position on the page",
    text: "In the right sidebar, tap one of the six position tiles: TL, TC and TR sit the number in the top-left, top-centre or top-right corner, and BL, BC and BR do the same along the bottom. The preview number jumps to the chosen spot instantly so there's no guessing.",
  },
  {
    title: "Set the font size and the starting number",
    text: "Type a Font size in points (anywhere from 6 to 72, default 12) and a Start at value in the number field. Setting Start at to something other than 1 lets a document that continues from an earlier file pick up where the previous one left off — page one of this PDF then prints as 47, for example.",
  },
  {
    title: "Click Add Page Numbers and download",
    text: "The tool writes the numbers straight into the PDF as a text layer and hands the finished file back to your browser's normal download flow. The output is named after your original with a -numbered suffix, so meeting-notes.pdf becomes meeting-notes-numbered.pdf.",
  },
];

const benefits = [
  {
    h: "Every position",
    p: "Six position tiles cover the practical corners and centres: top-left, top-centre, top-right, bottom-left, bottom-centre and bottom-right. Whichever margin your reader expects — the classic bottom-centre for reports, top-right for legal filings, bottom-right for printouts — one tap puts the number exactly there.",
  },
  {
    h: "Numbers you can trust",
    p: "The number on each page is drawn with the standard Helvetica font at the point size you chose, sitting a fixed 24-point margin from the edge you picked. Nothing else about the page is touched — the original text, images and layout stay exactly as they were.",
  },
  {
    h: "Start anywhere",
    p: "The Start at field accepts any integer, so page one of your file can be numbered 1, 47 or anything else. Continuing the numbering of a previous chapter or appendix is a matter of typing the right start value — no editing, no manual per-page work.",
  },
  {
    h: "No quality loss",
    p: "Numbers are added as a small text layer on top of each page; the underlying pages are never re-rendered, re-compressed or converted to images. Scanned PDFs, vector PDFs and mixed documents all come out at the same visual quality as the file you started with.",
  },
];

const scenarios = [
  {
    h: "Assignments, theses and project reports",
    p: "Universities and schools almost always require numbered pages on submitted work so the examiner can reference sections in feedback. Drop your final PDF here, pick bottom-centre and 12pt and the whole assignment is compliant in seconds — no need to re-export from your word processor.",
  },
  {
    h: "Merged files where the original numbering no longer matches",
    p: "Combine three separate PDFs into one and each chunk still carries its own baked-in numbering — usually restarting at 1 with every merge. Adding a fresh sequence in a free corner gives the combined document a single continuous count that actually matches its new length.",
  },
  {
    h: "Legal, official and contract submissions",
    p: "Court bundles, tender responses and formal contracts are routinely referenced by page (\"as stated on page 7\") and reviewers reject files where they can't cite specific pages. Adding numbers in the top-right or bottom-right corner gives every reader a stable coordinate to point at.",
  },
  {
    h: "Long documents heading to the printer",
    p: "A hundred-page unnumbered stack dropped on the floor is a nightmare to reassemble. Numbering the PDF before printing turns it into an ordered document instead of a puzzle, and readers can flip to a specific section without hunting through unmarked pages.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I add page numbers to a PDF for free?",
    a: "Open this page, click Select PDF file and pick the document you want to paginate. Choose one of the six position tiles (TL, TC, TR, BL, BC, BR), type a font size in points and a starting number, then hit Add Page Numbers. The numbered PDF downloads to your device with a -numbered suffix on the filename — no account, no watermark added.",
    plain:
      "Click Select PDF file, pick your document, tap one of the six position tiles (TL, TC, TR, BL, BC, BR), type a font size and a starting number, then hit Add Page Numbers. The file downloads with a -numbered suffix. No account, no watermark.",
  },
  {
    q: "Can I choose where the page numbers appear?",
    a: "Yes — six positions are available. TL, TC and TR place the number in the top-left, top-centre and top-right of every page; BL, BC and BR do the same along the bottom. Whichever tile you tap, the live preview shifts the number to that spot on page one so you can confirm it before saving.",
    plain:
      "Yes. Six positions are available: top-left, top-centre, top-right, bottom-left, bottom-centre and bottom-right. Tap a position tile and the live preview shifts the number instantly.",
  },
  {
    q: "Can I use a \"Page 1 of 10\" format?",
    a: "Not in this tool — right now the number is drawn as a plain digit (1, 2, 3…). A \"Page X of Y\" or a \"Page 1\" prefix isn't one of the supported formats today. If that specific label matters for your document, the neighbouring Header & Footer tool is a better fit for adding richer strings around the page count.",
    plain:
      "No. This tool draws a plain digit (1, 2, 3…). A \"Page X of Y\" or \"Page 1\" prefix isn't a supported format today; the Header & Footer tool is a better fit for richer text.",
  },
  {
    q: "Can I start numbering from a number other than 1?",
    a: "Yes. The Start at input accepts any integer, so if you set it to 47 then page one of your PDF prints as 47, page two as 48, and so on. This is useful when the current file continues from an earlier volume, appendix or chapter and the numbering needs to pick up rather than restart.",
    plain:
      "Yes. The Start at input accepts any integer. Set it to 47 and page one prints as 47, page two as 48, and so on — useful for continuing an earlier volume or chapter.",
  },
  {
    q: "Can I skip the cover page?",
    a: "Not directly — there isn't a page-range or \"skip first page\" option yet, so every page in the file gets a number. A working workaround is to open the Extract Pages tool, save the cover on its own, run this tool on the rest of the document with the position and starting number you want, and then merge the untouched cover back on the front with Merge PDF.",
    plain:
      "Not directly. There's no page-range or skip-first-page option yet; every page gets a number. Workaround: use Extract Pages to peel off the cover, number the rest here, and merge the cover back on with Merge PDF.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is read, rendered for preview and re-saved with the added numbers entirely inside your browser tab. Nothing is sent to us or to any third party during the process — you can even disconnect from the internet after the page has loaded and the numbering will still complete.",
    plain:
      "No. The PDF is read, previewed and re-saved with the added numbers entirely inside your browser tab. Nothing is uploaded to any server, and the tool keeps working offline once loaded.",
  },
  {
    q: "Will adding numbers reduce quality?",
    a: "No. The tool doesn't re-render or re-compress your pages — it opens the PDF, appends a tiny Helvetica text object to each page at the position you chose, and saves the file back out. Scans stay as scans, vector diagrams stay as vector, and file size grows only by the handful of bytes the number glyphs themselves take.",
    plain:
      "No. The tool doesn't re-render or re-compress the pages — it just appends a small Helvetica text object at your chosen position. Original content is untouched and file size grows only by a few bytes.",
  },
  {
    q: "What if my PDF already has page numbers?",
    a: "The new numbers are added on top of whatever the page already contains — the existing numbers aren't detected or removed. In practice this rarely looks bad: if the original numbers sit at the bottom-centre, add the new ones at a different corner (top-right or bottom-right, for example) so the two counts don't overlap.",
    plain:
      "The new numbers are added on top; existing ones aren't detected or removed. Pick a different corner from the existing numbering (e.g. top-right if the file already numbers bottom-centre) so nothing overlaps.",
  },
  {
    q: "Can I add numbers on my phone?",
    a: "Yes. The whole workspace is a normal web page, so on a phone Select PDF file opens the standard file picker (Files, Drive, iCloud, etc.), the position tiles are tap targets that fit thumbs, and the number/start-number inputs use the numeric keyboard. Add Page Numbers hands the finished PDF to the phone's usual download flow.",
    plain:
      "Yes. Select PDF file opens the phone's standard file picker, the position tiles are tap-sized, and font size and start-number inputs use the numeric keyboard. Add Page Numbers uses the browser's normal download flow.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No — and that's really the point. Acrobat's paid tier is the only way to add page numbers inside Adobe's own software, but this tool does the same job inside the browser with no download, no subscription and no watermark on the output. The numbered PDF opens correctly in Acrobat Reader, Preview, Chrome, Edge, Foxit or any other viewer.",
    plain:
      "No. Acrobat requires a paid tier for page numbering; this tool does the same job in the browser with no download, no subscription and no watermark. The output opens in every major PDF viewer.",
  },
];

const related = [
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Add dates, filenames or titles along with numbers on every page." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Number a freshly combined file so the whole document has one continuous count." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Stamp a logo or a confidentiality mark across every page alongside the numbers." },
  { to: "/tools/txt-to-pdf", name: "TXT to PDF", blurb: "Turn a text file into a PDF first, then come back here to number the pages." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Reshuffle the pages before numbering so the sequence lands in the right order." },
] as const;

export function PageNumbersSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* Benefit strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Files never leave your device",
          "Choose position, font size & start number",
          "Free — no signup, no watermark",
        ].map((b) => (
          <div
            key={b}
            className="flex items-center gap-2 rounded-lg border border-[#f3d4d2] bg-[#fef6f5] px-3 py-2 text-[13px] font-semibold"
          >
            <Check className="h-4 w-4 shrink-0 text-[#e5322d]" />
            <span>{b}</span>
          </div>
        ))}
      </div>

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to add page numbers to a PDF online for free
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

      {/* Exactly how you need */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Number your pages exactly the way you need
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Three controls sit on the right of the workspace and, together, cover
        almost every real-world numbering need. The six-tile position grid
        pins the number to whichever corner or centre you prefer — no free
        dragging to worry about, just consistent, symmetric placement on every
        page. Font size takes a plain integer from 6 to 72 points, so
        readable defaults (10-14pt) and print-friendly larger sizes (18-24pt)
        are both a keystroke away.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The Start at field is what makes this tool useful for split
        documents: type 12 and page one of your file prints as 12, matching a
        prior volume that ended at 11. The format itself is intentionally
        minimal — a plain digit, drawn once per page — because that's what
        assignments, court bundles and printouts almost always ask for. When
        you need richer text like a date or a "Page X of Y" label, the
        Header & Footer tool linked below is the right neighbour.
      </p>

      {/* Why numbers matter */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why numbered pages matter
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A stapleless report drops out of a folder and turns into a puzzle
        without page numbers. A team on a call struggling to sync to
        "somewhere in the middle" loses minutes to "wait, which page again?"
        A submitted document that gets referenced by section only makes sense
        if the reader can actually point at a page.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Most PDFs generated from scans, screenshots, browser prints or merges
        arrive with no numbering at all — the source software simply doesn't
        add it. Fixing that once, in a corner nobody argues about, is what
        turns a raw stack of pages into a document people can actually work
        with.
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
        When do you need to add page numbers to a PDF?
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

export const pageNumbersFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const pageNumbersHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add page numbers to a PDF online for free",
  description:
    "Add page numbers to any PDF entirely in the browser — pick a corner, set the font size and starting number, and download the numbered file. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to number" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Add Page Numbers (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/page-numbers#step-${i + 1}`,
  })),
};

export const pageNumbersSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Add Page Numbers",
  description:
    "Add page numbers to PDF online free — choose one of six positions, set font size and starting number, and save the numbered file entirely inside the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
