import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Open the PDF you want to trim",
    text: "Drop a PDF onto the page or click Select PDF file. The document opens locally in your browser — every page shows up as a thumbnail in the workspace, ready to review.",
  },
  {
    title: "Click the thumbnails you want to remove",
    text: "Each thumbnail is a toggle. Click page 3 to mark it, click again to unmark it, keep going through blank scans, duplicates or an appendix you don't need. The sidebar keeps a live tally like 4 of 32 selected so you always see the shape of what's about to leave the file.",
  },
  {
    title: "Check your selection",
    text: "The button re-labels itself to Delete 4 pages (or whatever the count is) so there's no ambiguity right before you commit. Deselect anything you added by accident — nothing has been changed on disk yet.",
  },
  {
    title: "Click Delete pages and download",
    text: "The tool builds a fresh PDF containing only the pages you kept and offers it as a download with a -cleaned.pdf suffix. Your original file on disk is not modified in any way.",
  },
];

const benefits = [
  {
    h: "Visual and mistake-proof",
    p: "Every page is rendered as a thumbnail before you touch it, so you can actually see the blank scan or the duplicate page you're about to remove instead of trusting a page-number guess. The visible marker on each selected thumbnail plus the running count in the sidebar make it obvious what will be in the output.",
  },
  {
    h: "No quality loss",
    p: "The pages you keep are copied through byte-for-byte using pdf-lib — same fonts, same embedded images, same vector shapes at the same resolution. There is no re-render, no re-compression and no downgrade anywhere in the surviving pages.",
  },
  {
    h: "Original file stays safe",
    p: "The tool never writes back to the file you opened. It builds a brand-new PDF in memory and downloads it as a separate -cleaned.pdf, so the source on your disk remains exactly as it was — a free undo if you change your mind later.",
  },
  {
    h: "Fast even for big files",
    p: "Because everything runs locally, a 200-page statement or scan bundle processes in seconds — no upload wait, no round-trip to a server, no queue. Bigger documents just mean more thumbnails to scroll, not a longer download.",
  },
];

const scenarios = [
  {
    h: "Blank pages the scanner slipped in",
    p: "Duplex scanners regularly emit a blank page whenever the back side of a sheet is empty, and phone scanner apps add stray blanks when a page is missed. Open the file here, click every blank thumbnail and delete the lot in one pass — the surviving pages keep their exact order and quality.",
  },
  {
    h: "Trimming a statement or report before submitting",
    p: "Downloaded bank statements, telecom bills and salary slips often carry pages of terms, marketing inserts or historical months you don't need to share. Delete the pages that are not relevant to the specific submission — a rental deposit, a visa application, a reimbursement — and send only what was asked for, nothing more.",
  },
  {
    h: "Duplicate scans in a merged bundle",
    p: "When you merge KYC files from different sources, the same ID or the same cheque copy often shows up twice or three times. Scroll the thumbnails, click every repeat and produce a clean, single-copy bundle before you forward it — easier for the recipient and less material floating around with your details on it.",
  },
  {
    h: "Ads and instructions in downloaded forms",
    p: "Government and utility PDF forms often ship as a 12-page file where only 3 pages are the actual form and the rest are instructions, ads or a checklist. Delete the filler pages so what prints out is just the form itself — no wasted paper, no confused clerk flipping past cover pages.",
  },
];

const faqs = [
  {
    q: "How do I delete pages from a PDF for free?",
    a: "Open this page, click Select PDF file and pick your document, then click the thumbnail of any page you want to remove — click again to unmark it. When you are happy with the selection, click the Delete pages button and a cleaned copy of the PDF downloads to your device. No account, no card, no watermark on the output.",
  },
  {
    q: "Can I delete multiple pages at once?",
    a: "Yes. The thumbnail grid is a multi-select: click page 2, page 7, page 15 and page 20 to mark all four, and the sidebar counter updates as you go. When you click Delete pages, all selected pages are removed in a single pass and the tool produces one cleaned PDF containing only the pages you kept.",
  },
  {
    q: "Is the deleted page really gone from the file?",
    a: "Yes. The tool doesn't hide or blank the page — it builds a brand-new PDF that contains only the pages you kept and drops the rest entirely. The removed pages are not stored anywhere inside the output file, so a recipient can't reveal them by scrolling, searching or opening the PDF in an editor. That's the difference between deleting a page and hiding information on a page.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, read and rebuilt entirely inside your browser tab using pdf-lib. There is no network request for the actual processing, so no part of the source document, the deleted pages or the cleaned output ever reaches our servers.",
  },
  {
    q: "Will the remaining pages lose quality?",
    a: "No. Every page you kept is copied through untouched — same fonts, same images at their original resolution, same vector artwork. The tool never re-renders or re-compresses the content, so a scanned page at 300 dpi stays at 300 dpi and a text page keeps its selectable, searchable text.",
  },
  {
    q: "Can I undo a deletion?",
    a: "Before you click Delete pages, yes — just click the thumbnail again to remove it from the selection. After the cleaned PDF has been generated, the tool itself doesn't have an undo history, but your original PDF on disk is untouched, so you can drop it back into the tool and start again with the correct pages selected.",
  },
  {
    q: "Can I delete pages from a scanned PDF?",
    a: "Yes. Scanned PDFs are just image pages wrapped in a PDF container, and the tool treats every page the same way — a thumbnail you can click to remove. The kept scans are copied through at their original resolution, so the cleaned output looks identical to the scans that were in the source file.",
  },
  {
    q: "How do I remove blank pages automatically?",
    a: (
      <>
        For a handful of blanks you can spot at a glance, this tool is faster —
        click the blank thumbnails and hit Delete. If you have a large bundle
        where blanks are scattered throughout and you don't want to hunt for
        each one, use the{" "}
        <Link to="/tools/remove-blank-pages" className="text-[#e5322d] underline">
          Remove Blank Pages
        </Link>{" "}
        tool, which detects empty pages automatically and drops them without
        needing you to click each thumbnail.
      </>
    ),
  },
  {
    q: "Can I delete pages on my phone?",
    a: "Yes. The tool runs in the mobile browser exactly as it does on desktop — tap thumbnails to mark them, watch the counter update in the sidebar, tap Delete pages and the cleaned file saves to your phone's downloads. There is no app to install and no account required.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Adobe Acrobat's page-deletion feature is behind the paid Acrobat Pro subscription, but nothing on this page requires installing software or signing in. Open the tool in any modern browser, remove the pages you don't want and download the cleaned PDF — that's the whole workflow.",
  },
];

const related = [
  { to: "/tools/remove-blank-pages", name: "Remove Blank Pages", blurb: "Automatically detect and drop blank pages instead of clicking each thumbnail." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Keep a few pages instead of deleting many — pull just the pages you want into a new PDF." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break a long PDF into several smaller PDFs by range." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently hide sensitive text or areas on pages you're keeping." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence before or after cleaning up the file." },
] as const;

export function DeletePagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* Benefit strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Files never leave your device",
          "Visual page selection with thumbnails",
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
        How to delete pages from a PDF online for free
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

      {/* Precise removal */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Remove exactly the pages you don't need
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The whole PDF is laid out as a scrollable grid of thumbnails, so you can see
        every page before deciding what goes. Click the blank scan the printer added,
        the duplicate copy of your ID that got merged in twice, the appendix that no
        longer belongs in the report — each click is reversible until you commit. The
        sidebar keeps a live count in the form 4 of 32 selected as you work, so the
        shape of the output is obvious at a glance. When you click Delete pages, the
        surviving pages keep their original order and their original quality, and the
        cleaned file downloads with a -cleaned.pdf suffix.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Clean up documents before sharing — privately
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The pages people delete are almost always the sensitive ones — the salary
        annexure buried in a bank statement, the pay history at the back of an offer
        letter, the extra Aadhaar copy sitting inside a scanned bundle, the internal
        notes on the last page of a report meant for a client. Sending a PDF like
        that to an online tool for trimming just moves the exposure — the sensitive
        pages still travel to somebody else's server before you get the clean copy
        back.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Here, no part of the file goes anywhere. The PDF is opened, thumbnails are
        rendered and the cleaned output is written entirely inside your browser tab,
        so a page you deleted was never seen by any server in the middle. One honest
        note: deleting a page removes it from the new file completely, but if the
        information you want to hide is on a page you actually need to keep, deletion
        isn't the right tool — use{" "}
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">
          Redact PDF
        </Link>{" "}
        to permanently black out the specific text or area on that page instead.
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
        When do you need to delete PDF pages?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">
              {s.p}
            </p>
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

// Plain-text FAQ answers for JSON-LD (schema.org requires plain text).
const faqsPlain: { q: string; a: string }[] = [
  {
    q: "How do I delete pages from a PDF for free?",
    a: "Open this page, click Select PDF file and pick your document, then click the thumbnail of any page you want to remove — click again to unmark it. When you are happy with the selection, click the Delete pages button and a cleaned copy of the PDF downloads to your device. No account, no card, no watermark on the output.",
  },
  {
    q: "Can I delete multiple pages at once?",
    a: "Yes. The thumbnail grid is a multi-select: click page 2, page 7, page 15 and page 20 to mark all four, and the sidebar counter updates as you go. When you click Delete pages, all selected pages are removed in a single pass and the tool produces one cleaned PDF containing only the pages you kept.",
  },
  {
    q: "Is the deleted page really gone from the file?",
    a: "Yes. The tool doesn't hide or blank the page — it builds a brand-new PDF that contains only the pages you kept and drops the rest entirely. The removed pages are not stored anywhere inside the output file, so a recipient can't reveal them by scrolling, searching or opening the PDF in an editor.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, read and rebuilt entirely inside your browser tab using pdf-lib. There is no network request for the actual processing, so no part of the source document, the deleted pages or the cleaned output ever reaches our servers.",
  },
  {
    q: "Will the remaining pages lose quality?",
    a: "No. Every page you kept is copied through untouched — same fonts, same images at their original resolution, same vector artwork. The tool never re-renders or re-compresses the content, so a scanned page at 300 dpi stays at 300 dpi and a text page keeps its selectable, searchable text.",
  },
  {
    q: "Can I undo a deletion?",
    a: "Before you click Delete pages, yes — just click the thumbnail again to remove it from the selection. After the cleaned PDF has been generated, the tool itself doesn't have an undo history, but your original PDF on disk is untouched, so you can drop it back into the tool and start again with the correct pages selected.",
  },
  {
    q: "Can I delete pages from a scanned PDF?",
    a: "Yes. Scanned PDFs are just image pages wrapped in a PDF container, and the tool treats every page the same way — a thumbnail you can click to remove. The kept scans are copied through at their original resolution, so the cleaned output looks identical to the scans that were in the source file.",
  },
  {
    q: "How do I remove blank pages automatically?",
    a: "For a handful of blanks you can spot at a glance, this tool is faster — click the blank thumbnails and hit Delete. If you have a large bundle where blanks are scattered throughout, use the Remove Blank Pages tool at /tools/remove-blank-pages, which detects empty pages automatically and drops them without needing you to click each thumbnail.",
  },
  {
    q: "Can I delete pages on my phone?",
    a: "Yes. The tool runs in the mobile browser exactly as it does on desktop — tap thumbnails to mark them, watch the counter update in the sidebar, tap Delete pages and the cleaned file saves to your phone's downloads. There is no app to install and no account required.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Adobe Acrobat's page-deletion feature is behind the paid Acrobat Pro subscription, but nothing on this page requires installing software or signing in. Open the tool in any modern browser, remove the pages you don't want and download the cleaned PDF — that's the whole workflow.",
  },
];

export const deletePagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqsPlain.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const deletePagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to delete pages from a PDF online for free",
  description:
    "Remove unwanted pages from a PDF entirely inside your browser — click thumbnails to select pages and download a cleaned copy. The original file is not modified and never leaves your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF you want to trim" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Delete Pages (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/delete-pages#step-${i + 1}`,
  })),
};

export const deletePagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Delete Pages",
  description:
    "Delete pages from a PDF online free — select pages visually from a thumbnail grid and download a cleaned copy. Runs entirely in the browser, no upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
