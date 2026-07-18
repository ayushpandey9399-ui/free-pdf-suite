import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";


const steps = [
  {
    title: "Open the PDF you want to stamp",
    text: "Drop a PDF into the browser or click Select PDF file. The document is loaded into the current tab and the watermark editor appears — nothing is uploaded, and the page count you see reflects a purely local parse.",
  },
  {
    title: "Pick Text or Image mode",
    text: "Switch between the Text tab (type a phrase like CONFIDENTIAL or a project name) and the Image tab (upload a PNG or JPG logo). The Text tab is the fastest for words, dates and purpose labels; the Image tab is for brand marks that already exist as a file.",
  },
  {
    title: "Dial in the look",
    text: "For text, set the exact string, the Size (12 to 144 pt), the Color (any hex via the colour picker), the Angle (-90° to 90°, so -30° gives the classic diagonal) and the Opacity (5% to 100% for anything from a ghost stamp to a solid banner). For an image, set the Angle and Opacity — the picture is auto-scaled to half the shorter page edge and centred.",
  },
  {
    title: "Click Apply Watermark and download",
    text: "The stamp is drawn once, centred, on every page of the document using pdf-lib in your browser. The file saves with a -watermarked suffix and opens in any reader with the mark baked in.",
  },
];

const benefits = [
  {
    h: "Full control over the look",
    p: "You choose the exact text, its size from 12 to 144 pt, any colour through the picker, the tilt from a subtle 15° to a full -90°, and an opacity between 5% and 100%. That range covers a ghost DRAFT that barely tints the page, a bold red CONFIDENTIAL sash across the middle, and everything in between — readable enough to notice, transparent enough to keep the underlying document legible.",
  },
  {
    h: "Every page in one click",
    p: "The watermark is stamped once on every page of the PDF in a single pass. A one-page ID copy and a 300-page report take the same click — the mark lands consistently in the centre of each page, at the same size, angle and opacity you set.",
  },
  {
    h: "No forced branding",
    p: "The awkward thing about most free online watermarkers is that they add their own logo to your file unless you upgrade — the very thing you were trying to prevent. This tool never adds a second watermark of its own; the only text or image on the output is what you typed or uploaded.",
  },
  {
    h: "Private by design",
    p: "Watermarking is what you reach for on the files you least want floating around — ID copies, unpublished manuscripts, draft contracts, client proposals. Every step here runs inside your browser tab, so the original PDF and the stamped output both stay on your device.",
  },
];

const scenarios = [
  {
    h: "ID proofs with a purpose and date",
    p: "When a broker, telecom store, hotel or lender asks for a copy of your Aadhaar, PAN or passport, stamp the reason and the date diagonally across every page — for example For HDFC home loan application only — 15 Jan 2026. If that scan later surfaces somewhere it should not, the watermark makes the misuse obvious and the shared copy hard to reuse without noticeable edits.",
  },
  {
    h: "Proposals and quotations you don't want passed off",
    p: "Consulting decks, project proposals, sample deliverables and portfolio pieces get forwarded well beyond the person you sent them to. A diagonal stamp of your firm's name across each page makes the origin unambiguous and discourages the recipient from stripping your branding out of the header before reusing the content.",
  },
  {
    h: "DRAFT versions circulated for review",
    p: "A draft that gets mistaken for the final version is a small disaster — signed, forwarded, filed. Stamping DRAFT at 40% opacity across every page makes the status impossible to miss, no matter which page a reviewer opens or prints, and keeps the final version clean of that marker.",
  },
  {
    h: "Course notes, e-books and reports you distribute",
    p: "Study material, research reports and paid PDF products travel fast once one copy is loose. Watermarking every page with your name, the buyer's name or a licence line makes the file traceable and less useful to redistribute anonymously — a soft deterrent that costs the honest reader nothing.",
  },
  {
    h: "Company logo across every page of a PDF",
    p: "Invoices, quotations, offer letters, case studies and pitch decks look unmistakably yours the moment your logo is stamped on every page. Switch to the Image tab, upload your logo as a PNG (transparent background works best) or JPG, drop opacity to around 15–25% so it sits behind the text as a background brand mark, and click Apply Watermark — the same logo lands centred on page 1, page 50 and every page in between, so a forwarded screenshot still shows who the document came from.",
  },

];

const faqs = [
  {
    q: "How do I add a watermark to a PDF for free?",
    a: "Open this page, click Select PDF file and choose your document, then use the Text tab to type the phrase you want stamped and adjust the size, colour, angle and opacity — or the Image tab to upload a logo. Click Apply Watermark and a stamped copy downloads to your device. No account, no card and no forced branding on the output.",
  },
  {
    q: "Can I write the purpose on my Aadhaar or PAN copy?",
    a: "Yes, and this is one of the strongest uses of the tool. Open the ID PDF here, switch to the Text tab, type a line such as For SBI credit card application only — 15 Jan 2026, tilt it to -30° for the diagonal look, set opacity around 40% so the ID stays readable and click Apply Watermark. The stamped copy is what you send to the requester, and the original ID file never leaves your browser during any of it.",
  },
  {
    q: "Can I make the watermark diagonal and transparent?",
    a: "Yes. The Angle slider goes from -90° to 90° in 5° steps — -30° is the classic diagonal for stamps like CONFIDENTIAL, DRAFT or a purpose label. The Opacity slider goes from 5% to 100%, so you can drop the stamp to 20–40% for a soft see-through look that keeps the document underneath fully readable.",
  },
  {
    q: "Will the watermark appear on every page?",
    a: "Yes. The tool stamps every page of the PDF in a single pass — one text draw or one image draw per page, centred, using the exact size, angle and opacity you configured. A 1-page ID and a 250-page report are both fully covered by a single click.",
  },
  {
    q: "Can I add my logo to a PDF?",
    a: "Yes. Open the PDF, switch to the Image tab, and upload your logo as a PNG (transparent background recommended) or JPG. Set the Angle — 0° for an upright brand mark or -30° for a diagonal stamp — and set the Opacity, usually around 15–25% if you want the logo to sit as a soft background on document pages, or 60–100% if you want it to read as a clear brand stamp. Click Apply Watermark and the logo is centred on every page of the file. The image is auto-scaled to about half the shorter page edge, so it stays readable on both A4 pages and larger formats without any manual sizing.",
  },
  {
    q: "Can someone remove my watermark?",
    a: "Honestly: a watermark deters casual misuse and makes reuse visible, but no stamp is impossible to remove. Someone with enough time and a good editor can crop, blur or repaint over parts of a page — the point of a watermark is that they have to do that work, and the result almost never looks clean. If your goal is the opposite direction — permanently removing something from a PDF instead of layering something on top — use the Redact PDF tool, which re-renders the affected pages so the removed content is actually gone.",
  },
  {
    q: "Does watermarking reduce document quality?",
    a: "No. The stamp is drawn as a new text or image layer on top of each existing page using pdf-lib — the original page content, fonts, images and vector shapes are copied through untouched. There is no re-rendering, no re-compression and no loss of resolution anywhere in the document.",
  },
  {
    q: "Do my files get uploaded?",
    a: "No. The PDF, the watermark text and any logo image you pick are all opened and processed inside your browser tab. No network request is made during the watermarking, so nothing about the original file, the stamp text or the finished output ever reaches our servers.",
  },
  {
    q: "Is there a limit on pages or files?",
    a: "No. Watermark a 1-page copy or a 500-page report, and run the tool on as many files as you want, one after the other — there is no daily cap, no page limit and no paywall gate at a certain document length.",
  },
  {
    q: "Do I need Acrobat or an account?",
    a: "Neither. Adobe Acrobat's watermark feature is inside the paid Pro edition, but nothing here needs installing or signing up. Open the page, drop a PDF, apply the watermark, download — that is the entire workflow.",
  },
];

const related = [
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Repeating text at the top or bottom instead of stamped across the page." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Add a signature to a specific spot rather than a page-wide stamp." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Lock the watermarked file with a password before you send it." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently remove sensitive content instead of masking it with a stamp." },
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Number every page as part of the same finishing pass." },
];

export function WatermarkPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Files never leave your device", "Custom text, position, opacity & angle", "Free, no signup, no forced branding"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to add a watermark to a PDF online for free
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

      {/* India money / purpose watermark */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Protect your documents from misuse with a purpose watermark
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every time you share a copy of your Aadhaar, PAN or passport with a rental broker, a
        telecom store or a loan officer, that scan can technically be reused for a different
        application entirely — a KYC in your name for something you never authorised. One of
        the simplest, most widely recommended safeguards is to write the exact purpose of the
        copy across the document itself, for example For HDFC home loan application only — 15
        Jan 2026 or For airtel SIM at Koramangala store — 15 Jan 2026.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool makes that a five-second job. Load the ID PDF, type the purpose line, tilt it
        to -30° so it runs diagonally across the page, drop opacity to around 40% so it is
        obvious but the ID underneath stays readable, and click Apply Watermark. The mark is
        impossible to crop out without cutting into the ID itself. And because the entire
        workflow runs inside your browser, the original ID scan never touches our servers at
        any stage.
      </p>

      {/* Professional intents */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Brand, label and control your PDFs
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The same stamp mechanism handles the professional side of things. Mark a work-in-progress
        as DRAFT so no one accidentally treats it as the signed version. Stamp CONFIDENTIAL or
        INTERNAL across sensitive reports before you send them out for review, so a screenshot
        of any single page still shows its status. Put your firm's or your own name across
        proposals, portfolios and sample chapters so a recipient cannot quietly forward the file
        as their own work — the watermark travels with every page and shows up on print, on
        share and on screenshot.
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
        When do you need to watermark a PDF?
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

export const watermarkFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const watermarkHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a watermark to a PDF online for free",
  description:
    "Stamp a text or image watermark on every page of a PDF entirely in your browser — control size, colour, angle and opacity. The document never leaves your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF you want to watermark" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Add Watermark (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/watermark#step-${i + 1}`,
  })),
};

export const watermarkSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Add Watermark",
  description:
    "Add text or image watermarks to every page of a PDF online free — stamp CONFIDENTIAL, DRAFT, purpose labels or your logo in your browser. No upload, no signup, no forced branding.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
