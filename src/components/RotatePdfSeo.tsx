import { Link } from "@tanstack/react-router";


const steps = [
  {
    title: "Open your PDF",
    text: "Drop the file into the browser or click Select PDF file. The document loads locally and the rotation editor appears — no upload happens at any point.",
  },
  {
    title: "Choose all pages or specific pages",
    text: "Leave Rotate all pages checked to turn the whole document at once. Uncheck it and page thumbnails appear — click any thumbnails to pick exactly the pages that need fixing (a sideways certificate on page 3, the two upside-down scans on pages 7 and 8).",
  },
  {
    title: "Pick the rotation angle",
    text: "Set Rotation to 90° clockwise, 180°, or 270° (which is 90° counter-clockwise). If different pages need different directions, apply one pass, download, reopen the file here and run a second pass on the remaining pages.",
  },
  {
    title: "Click Rotate PDF and download",
    text: "The tool writes the new orientation into each targeted page using pdf-lib and hands you a rotated copy with a -rotated suffix. The saved orientation now travels with the file — into email previews, portals, phones and print jobs.",
  },
];

const benefits = [
  {
    h: "Rotate one page or all pages",
    p: "The Rotate all pages checkbox flips the whole document in one shot when every page is wrong the same way. Uncheck it and the thumbnail grid lets you tick just the pages that need fixing, so a mostly-correct document does not get needlessly touched.",
  },
  {
    h: "See before you save",
    p: "When you switch to per-page mode, each page renders as a thumbnail so you can spot which ones are sideways or upside down and click precisely those. There is no guessing at page numbers from memory.",
  },
  {
    h: "No quality loss",
    p: "Rotation here changes the page's orientation flag inside the PDF, nothing else. Text stays as text, vector graphics stay sharp, and embedded images are neither re-encoded nor down-sampled — the output is the input plus one metadata edit per page.",
  },
  {
    h: "Private and instant",
    p: "The whole rotation runs inside your browser tab against a PDF you never uploaded, so a 200-page scan finishes in seconds without a single network call. Legal drafts, medical reports and ID scans never leave the device.",
  },
];

const scenarios = [
  {
    h: "A scan that came out sideways",
    p: "You scanned a certificate or a bank passbook on your phone and it saved landscape when it should be portrait. The government portal or HR system that wants it upright rejects the sideways version — rotate it here once and the correct orientation is baked into the file the portal receives.",
  },
  {
    h: "Mixed-orientation scan batches",
    p: "Office scanners and phone scan apps often produce a batch where some pages are portrait and others landscape or flipped. Switch to per-page mode, click just the pages that are wrong, apply the right rotation and the document finally reads top-to-bottom without the reader constantly tilting their head or their phone.",
  },
  {
    h: "Photos turned into a PDF that came out rotated",
    p: "When photos are converted into a PDF, one or two often land rotated because of the phone's EXIF orientation. Instead of redoing the whole conversion, open the finished PDF here, tick only the offending pages and save the corrected file.",
  },
  {
    h: "Fixing orientation before double-sided printing",
    p: "Double-sided printing is unforgiving — one sideways page and the back of that sheet is upside down relative to the front. Rotating the problem pages before you send the job saves paper, toner, and the awkward reprint that always seems to happen right before a meeting.",
  },
];

const faqs = [
  {
    q: "How do I rotate a PDF and save it permanently?",
    a: "Open this page, drop your PDF, pick 90° clockwise, 180° or 270° in the Rotation menu, leave Rotate all pages checked or uncheck it and click the specific page thumbnails you want turned, then click Rotate PDF. The download you get has the new orientation written into the file itself — not just applied to the current view.",
  },
  {
    q: "Why does my PDF go back to sideways after I rotate it in my viewer?",
    a: "Because most PDF viewers — Chrome's built-in viewer, Preview on Mac, the rotate button in many mobile readers — only rotate the on-screen view for your session. They never modify the underlying file. Close and reopen the PDF, or send it to someone else, and it comes back in its original orientation. This tool edits the page's rotation flag inside the PDF, so the fix persists everywhere the file is opened.",
  },
  {
    q: "Can I rotate just one page?",
    a: "Yes. Uncheck Rotate all pages and the tool shows a thumbnail for every page in the document — click the thumbnail of the one page you want to turn, pick your angle and hit Rotate PDF. Only that page's orientation changes; every other page in the file is left exactly as it was.",
  },
  {
    q: "Can I rotate different pages in different directions?",
    a: "Yes, in two passes. Each run of the tool applies one angle to whichever pages are selected — so first select the pages that need 90° clockwise and rotate them, then reopen the resulting file here, select the pages that need 180° and rotate again. The rotations combine cleanly because each pass just updates the pages' orientation flags.",
  },
  {
    q: "Will rotating reduce quality?",
    a: "No. Nothing gets re-rendered, re-compressed or resampled. The tool changes the rotation value stored on each page, and copies every other byte through untouched — text, fonts, vector graphics and embedded images look identical to the original.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is opened, edited and saved entirely inside your browser tab using pdf-lib. There is no network request during the rotation, so the original document and the rotated copy both stay on your device from start to finish.",
  },
  {
    q: "Can I rotate a PDF on my phone?",
    a: "Yes. The tool runs in any modern mobile browser — Chrome, Safari, Firefox, Edge — with no app to install. Rotating a scanned document from your phone and re-saving it locally works exactly the same as on a desktop, which is often the fastest way to fix a sideways scan you just made.",
  },
  {
    q: "Can I rotate a scanned PDF?",
    a: "Yes — that is by far the most common reason people reach for this tool. Whether the scan came from a flatbed scanner at the office or a scanning app on your phone, the file is just a normal PDF, and this tool rotates its pages the same way it rotates a text-based document.",
  },
  {
    q: "Is there a page limit?",
    a: "No. Rotate a single page or a 500-page appendix — there is no artificial cap, no paywall past a certain length and no daily quota. Very large files may take a few seconds longer to save because the whole PDF is rewritten with the updated rotations, but there is no imposed limit.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Acrobat's Rotate Pages feature is tucked inside the paid Pro edition, but nothing here needs installing or signing in. Open the page, drop the file, rotate, download — that is the entire flow, and it costs nothing.",
  },
];

const related = [
  { to: "/tools/scan-to-pdf", name: "Scan to PDF", blurb: "Turn phone photos of documents into a proper multi-page PDF." },
  { to: "/tools/reorder", name: "Reorder Pages", blurb: "Fix page order after fixing orientation." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim scan margins once every page is finally the right way up." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove blank or duplicate pages from a scan batch." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine the rotated file with other documents." },
];

export function RotatePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">


      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to rotate a PDF online for free
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

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Rotate a PDF and actually SAVE it
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Nearly everyone has done this dance: you open a sideways PDF in Chrome or the built-in
        viewer on your laptop, click the rotate button, and it looks fine. Then you close the
        tab, or email the file to your accountant, or upload it to a portal — and it is back
        to sideways. That is not a bug; it is how most PDF viewers behave. They rotate the
        current view, they do not touch the file.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool writes the rotation into the PDF itself using pdf-lib. Once you download the
        rotated copy, the correct orientation stays with the file wherever it goes — Gmail
        previews, WhatsApp attachments, your recipient's iPhone, the printer at the print
        shop, the upload window of a government portal. No more rotating it every single time
        someone opens it.
      </p>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Fix scans that came out sideways or upside down
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Phone-scanned documents and office multi-function printer batches are the classic
        source of orientation chaos. A batch might come out with page 1 portrait, page 2
        landscape because someone fed a certificate sideways, page 3 completely upside down.
        Uncheck Rotate all pages, look at the thumbnails, and click only the pages that are
        wrong — one pass in 90° for the sideways ones, a second pass in 180° for the
        upside-down one, and the file finally reads naturally. If you are starting from paper
        rather than an existing PDF, our <Link to="/tools/scan-to-pdf" className="text-[#e5322d] underline">Scan to PDF</Link>{" "}
        tool makes clean phone scans in the first place.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When do you need to rotate a PDF?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

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

export const rotateFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const rotateHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to rotate a PDF online for free",
  description:
    "Rotate all pages or specific pages of a PDF by 90°, 180° or 270° and save the rotation permanently into the file — entirely inside your browser.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF you want to rotate" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Rotate PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/rotate#step-${i + 1}`,
  })),
};

export const rotateSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Rotate PDF",
  description:
    "Rotate PDF pages online free — fix sideways or upside-down pages and save the rotation permanently into the file. Runs entirely in the browser, no upload, no signup.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
