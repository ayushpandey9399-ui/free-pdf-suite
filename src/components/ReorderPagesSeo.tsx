import { Link } from "@tanstack/react-router";


const steps = [
  {
    title: "Open the PDF whose page order needs fixing",
    text: "Drop the file into the workspace or click Select PDF file. The document opens locally and every page appears as a thumbnail tile in a grid — nothing has been transmitted anywhere to reach this view.",
  },
  {
    title: "Grab the ⋮⋮ handle on a thumbnail and drag it",
    text: "Each tile carries a two-column dot handle in its corner. Press on that handle and drag the page to its new position — the surrounding thumbnails slide out of the way as you move, so you can see where the page will land before you release.",
  },
  {
    title: "Repeat until the sequence reads correctly",
    text: "Keep pulling pages into place one at a time; there is no cap on how many moves you make. Because every page is on screen, you can scan the whole grid at a glance and confirm the story reads front-to-back the way you want.",
  },
  {
    title: "Click Export Reordered PDF and save the new file",
    text: "The tool copies the pages into the new order and offers the result as a download named with a -reordered.pdf suffix. The original PDF on your disk is not modified — the reordered version is a separate file.",
  },
];

const benefits = [
  {
    h: "See every page while you sort",
    p: "The whole document is laid out as a live grid of page thumbnails, so you're moving pictures of pages around rather than guessing at page numbers. The order that ends up on screen is the order you'll get in the exported PDF — no surprises after export.",
  },
  {
    h: "Works with touch",
    p: "The drag interaction uses a dedicated touch sensor with a short press-and-hold before it activates, so a scroll gesture on your phone stays a scroll and a deliberate press-and-drag reorders the page. Reordering on a phone or tablet is a real, usable workflow, not a desktop-only feature squeezed onto small screens.",
  },
  {
    h: "No quality loss",
    p: "The reordered PDF is built by copying pages through with pdf-lib in the new sequence — same fonts, same embedded images at their original resolution, same vector artwork. Nothing is re-rendered or re-compressed, so a 300 dpi scan stays at 300 dpi and text pages remain selectable and searchable.",
  },
  {
    h: "Free and instant",
    p: "There is no daily cap, no page cap and no watermark on the output, and because the work happens on your own device even a long document rebuilds in seconds instead of waiting on a server queue.",
  },
];

const scenarios = [
  {
    h: "Reversed or shuffled scanner output",
    p: "Sheet-fed scanners regularly emit pages in reverse when you forget to flip the stack, and duplex scanning can interleave fronts and backs in the wrong order. Instead of feeding the whole stack again, drag the thumbnails into the correct sequence right here and export — often faster than re-scanning, especially for a bundle of 40+ pages.",
  },
  {
    h: "Fixing section order after merging files",
    p: "When you combine several PDFs into one application bundle, the sections don't always line up how the recipient expects — the resume lands before the cover letter, or a supporting document ends up sandwiched between two others. Move the pages into the sequence the recipient wants (cover letter first, then resume, then references) before you send.",
  },
  {
    h: "Moving the summary or index to the front of a report",
    p: "Long reports often end up with the executive summary in the middle and an index that was auto-generated at the end. Drag the summary page to page 1 and the index to page 2 so a busy reader gets the take-away first and the roadmap second, without opening a full editor.",
  },
  {
    h: "Assembling bundles in a specific portal order",
    p: "Government portals and grant offices commonly demand a fixed page sequence — ID first, then address proof, then income proof, then declaration. Rearrange your scanned bundle to match that exact list here before uploading, so the reviewer sees each item on the page number they were told to expect.",
  },
];

const faqs = [
  {
    q: "How do I rearrange pages in a PDF for free?",
    a: "Open this page, click Select PDF file and pick the document, then wait a moment for the thumbnails to render. Grab the ⋮⋮ handle on any thumbnail and drag it to its new position; repeat for every page you want to move. When the grid reads in the correct order, click Export Reordered PDF and the rebuilt file downloads to your device — no account, no card, no watermark.",
  },
  {
    q: "Can I move a page from the end to the beginning?",
    a: "Yes. Drag any thumbnail anywhere in the grid — from the last row all the way up to slot number one, or the other way around. There is no rule about how far a page can travel; the surrounding pages simply shift over to make room and then close up behind it.",
  },
  {
    q: "My scan came out in reverse order — can I fix it?",
    a: "Yes, but honestly: this tool doesn't have a one-click Reverse Order button. You reverse a reversed scan by dragging the pages into the correct sequence manually — the last thumbnail to position one, the second-to-last to position two, and so on. Even so, for a 40- or 50-page scan this is usually faster than feeding the whole stack through the scanner again, and it doesn't cost you the quality of a second scan pass.",
  },
  {
    q: "Can I reorder pages on my phone?",
    a: "Yes. The drag interaction has a real touch sensor built into it: press and hold on a thumbnail's handle for a moment, and dragging your finger moves the page. A normal short tap or a scrolling swipe is not interpreted as a drag, so the page still scrolls the way you'd expect on mobile.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, its thumbnails rendered and the reordered output written entirely inside your browser tab. There is no network request involved in the actual processing, so no part of the source document or the rearranged version ever reaches our servers. Once this page has loaded once, the reorder step even works offline.",
  },
  {
    q: "Will reordering reduce quality?",
    a: "No. The exported PDF is built by copying each page byte-for-byte into the new position with pdf-lib. Fonts stay embedded, scans keep their original resolution, and vector content remains crisp — the only thing that changed is the order the pages appear in.",
  },
  {
    q: "Does my original file change?",
    a: "No. The reordered version arrives as a separate download named <original>-reordered.pdf. The source file on your disk is only read from, never written to, so if you don't like the new order you can simply drop the original back into the tool and try again.",
  },
  {
    q: "Can I reorder a scanned PDF?",
    a: "Yes — and it's the most common use of this tool. Scanned PDFs are just image pages wrapped in a PDF container, so reordering works the same way as it does for text PDFs: drag thumbnails into place and export. The scans move across at their original resolution, so the reordered file looks identical, page for page, to the one you opened.",
  },
  {
    q: "Is there a page limit?",
    a: "There is no artificial page limit imposed by the tool itself. Because everything runs on your device, the practical ceiling is your browser's memory — a couple of hundred pages is comfortable on almost any modern phone, and a thousand-page PDF is fine on a typical laptop. If a very large file feels sluggish, close other tabs first.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Rearranging pages inside Adobe Acrobat requires the paid Acrobat Pro plan, but this page needs no software, no signup and no payment — it runs entirely in your browser and the exported PDF is clean, without any watermark added.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one — then reorder the pages here into the exact sequence you need." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix sideways or upside-down pages while you're at it — reorder solves sequence, rotate solves orientation." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Drop the pages you don't want before rearranging the rest." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out into a new PDF instead of shuffling the whole document." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert blank spacer pages at chosen positions before reordering." },
] as const;

export function ReorderPagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to rearrange PDF pages online for free
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

      {/* Fix wrong order */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Fix a PDF that's in the wrong order
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Scanned documents are famous for this. A sheet-fed scanner feeds pages in
        reverse the moment somebody forgets to flip the stack; duplex scanning
        interleaves fronts and backs when a page is skipped; and merging a few
        PDFs together often leaves sections out of sequence — the resume comes
        before the cover letter, the appendix ends up in the middle of the
        report. Re-scanning the whole bundle to fix it wastes time and, on
        low-quality scanners, quality too. Here, you drag the thumbnails into
        the right positions and export. Every page is visible while you work, so
        you can see the document read correctly from top to bottom before you
        ever click save.
      </p>

      {/* Privacy */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Rearrange privately, your document stays with you
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The files people reorder are usually complete documents — an entire
        rental application, a full scanned agreement, a whole bundle of KYC
        pages. Handing that to a random online reorder service moves the
        privacy problem rather than solving it, because the full file has to
        travel to somebody else's server to come back rearranged.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This page never asks for that. The thumbnails are rendered and the
        reordered PDF is written entirely inside your browser tab, so the
        document you dragged around never leaves your device. Once the page
        has loaded, the actual reorder step keeps working even if you drop
        offline — no network round-trip is ever part of the pipeline.
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
        When do you need to reorder PDF pages?
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
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const reorderPagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const reorderPagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to rearrange PDF pages online for free",
  description:
    "Reorder PDF pages entirely inside your browser — drag thumbnails into a new sequence and download the rearranged copy. The original file is not modified and never leaves your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF whose page order you want to change" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub Reorder Pages (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/reorder-pages#step-${i + 1}`,
  })),
};

export const reorderPagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Reorder Pages",
  description:
    "Rearrange PDF pages online free — drag and drop page thumbnails into a new order and download the rebuilt PDF. Runs entirely in the browser with full touch support, no upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
