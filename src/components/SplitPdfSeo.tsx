import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Drop your PDF onto the page",
    text: "Click Select PDF file or drag the document straight into the browser. The file opens locally — no upload starts and no copy is sent anywhere.",
  },
  {
    title: "Pick a split mode",
    text: "Choose Split by ranges to pull out one or more sections (for example 1-3, 5, 8-10), or pick Every page → separate PDF to turn a long document into one file per page.",
  },
  {
    title: "Click Split PDF",
    text: "The pages are copied out of your document into new PDFs directly on your device. Even a hundred-page file finishes in a few seconds because there is no server round-trip.",
  },
  {
    title: "Download the results",
    text: "A single range comes back as one PDF. Multiple ranges or every-page mode are bundled into a ZIP so you can grab all the pieces in one click.",
  },
];

const benefits = [
  {
    h: "No quality loss",
    p: "Pages are copied out of your document exactly as they were, never re-rendered or re-compressed. Text stays selectable, images keep their original resolution and the new PDFs look identical to the source.",
  },
  {
    h: "Split large PDFs fast",
    p: "There is no upload wait, no queue and no download of the source file. A one-hundred-page scan splits into individual pages in a few seconds on any modern laptop or phone.",
  },
  {
    h: "Keep only what you need",
    p: "Send the recipient only the page they actually asked for, instead of a fifty-page report with everything else attached. It is faster, tidier and keeps the rest of the document private.",
  },
  {
    h: "Completely free",
    p: "Split as many PDFs as you want, into as many pieces as you want. There is no daily limit, no paywalled option and no watermark on the output.",
  },
];

const scenarios = [
  {
    h: "Submitting only specific pages",
    p: "Bank verifications, KYC checks and reimbursement claims usually ask for a single page from a longer statement. Splitting out just page 4 (or pages 4-5) gives you a clean file to upload without exposing the rest of the account.",
  },
  {
    h: "Separating chapters or subjects",
    p: "Course packs, textbook scans and combined lecture notes are much easier to study when each chapter or subject lives in its own file. Split by ranges to break the master PDF once, then reuse the individual files all semester.",
  },
  {
    h: "Turning a big scan into individual documents",
    p: "If you scanned a whole folder of certificates, invoices or receipts into one long PDF, every page → separate PDF turns each sheet back into its own file. You get a ZIP with one document per page, ready to rename and file away.",
  },
  {
    h: "Sharing one section of a contract",
    p: "Contracts, offer letters and reports often contain sections you do not want to circulate widely. Splitting out just the relevant range lets you share the exact clause or annex without leaking the surrounding pages.",
  },
];

const faqs = [
  {
    q: "How do I split a PDF into separate pages?",
    a: "Open your PDF here, pick Every page → separate PDF, and click Split PDF. Each page becomes its own file (page-1.pdf, page-2.pdf and so on) and they are bundled into a single ZIP for download so you get them all in one click.",
  },
  {
    q: "Can I extract specific pages from a PDF?",
    a: "Yes. Use Split by ranges and type something like 1-3, 5, 8-10 — each range comes back as its own PDF, so you can cut a PDF into exactly the sections you want. If you only need scattered single pages picked from all over the document, our dedicated Extract Pages tool is often quicker.",
  },
  {
    q: "Is it safe to split PDFs with sensitive information?",
    a: "Yes. PDFfree runs the split entirely inside your browser through client-side processing, so contracts, statements, medical reports and ID documents never leave your device. Nothing is uploaded and nothing is stored on our side.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The tool is fully client-side. Once the page has loaded you can switch off your internet connection and still separate PDF pages — the file only ever lives on your own device.",
  },
  {
    q: "Will splitting reduce quality?",
    a: "No. The pages you keep are copied byte-for-byte into the new PDF. Nothing is re-compressed or rasterised, so text stays sharp and searchable and images keep their full resolution.",
  },
  {
    q: "Is there a page or file size limit?",
    a: "There are no artificial limits, no daily cap and no paid tier. The only real ceiling is the memory of the device you are using — very large PDFs with hundreds of high-resolution scans can be slow on older phones but split fine on any modern browser.",
  },
  {
    q: "Can I split a PDF on my phone?",
    a: "Yes. The PDF splitter works in any modern mobile browser on Android and iPhone. There is no app to install and no permissions to grant.",
  },
  {
    q: "Do I need an account or software like Adobe Acrobat?",
    a: "No. You do not need Adobe Acrobat, a paid installer, a signup or an email address. The tool runs in the browser, free, with no watermark added to the output.",
  },
  {
    q: "Can I split a password-protected PDF?",
    a: "The document has to be readable before it can be split. Remove the password first with our Unlock PDF tool (you will need to know it), then run the unlocked file back through the splitter.",
  },
  {
    q: "What's the difference between Split PDF, Extract Pages, and Delete Pages?",
    a: "Split PDF cuts one document into multiple new files, either by ranges or one per page. Extract Pages pulls a set of pages you pick from a thumbnail grid into a single new PDF — best when you want scattered pages combined. Delete Pages does the opposite: it removes the pages you no longer want and gives you back the same document minus those pages.",
  },
];

const related = [
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pick scattered pages from a thumbnail grid into one new PDF." },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove unwanted pages and keep the rest of the document." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine multiple PDFs back into a single document." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new order before or after splitting." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink the file size of each split PDF for upload limits." },
  { to: "/tools/unlock", name: "Unlock PDF", blurb: "Remove a known password so the file can be split." },
];

export function SplitPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Files never leave your device", "Free, no signup, no watermark", "Split by ranges or every page"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to split a PDF online for free
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

      {/* Modes explanation */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Split a PDF into separate pages or page ranges
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Two modes cover almost every reason people want to divide a PDF. Split by ranges pulls out specific
        sections — type 12-25 to extract one chapter of a long report, or 1-3, 5, 8-10 to cut a PDF into three
        separate documents in a single pass. Every page → separate PDF is the fast way to break a hundred-page
        scan into individual pages you can rename, share or file one by one.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        When there is only one range to save, the download is a single PDF. When there are several output files —
        either multiple ranges or every-page mode — they are packaged into a ZIP so you can grab everything in
        one click and unzip locally.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private splitting — your document stays on your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Splitting tends to happen on the documents you least want floating around: contracts where only one clause
        should be shared, bank statements where a single page is being submitted for verification, medical reports
        where you want to send just a lab result. Typical online splitters ask you to upload the whole document to
        their servers first — the very thing you were trying to avoid. PDFfree runs the split inside your browser
        instead, so the original document is read, cut and saved without ever touching a remote server.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once this page has loaded you can go offline and keep splitting. That is the honest meaning of split PDF
        without uploading — the file only ever exists on your own device.
      </p>

      {/* Four benefit sections */}
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
        When do you need to split a PDF?
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

export const splitFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const splitHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to split a PDF online for free",
  description:
    "Split PDF pages online free — cut a PDF into ranges or one file per page, directly in your browser with no upload, no signup and no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file you want to split" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Split PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/split#step-${i + 1}`,
  })),
};

export const splitSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Split PDF",
  description:
    "Split PDF online free — separate pages or extract page ranges in your browser with no upload, no signup and no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
