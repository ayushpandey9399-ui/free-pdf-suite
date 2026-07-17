import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const faqs = [
  {
    q: "Is it safe to merge PDF files online?",
    a: "Yes. PDFfree runs entirely inside your browser using JavaScript and WebAssembly. Your PDFs are opened, combined and saved locally on your own device — nothing is sent to a server, so even confidential contracts, medical records or bank statements never leave your computer.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Unlike many other popular PDF sites, we do not upload your files anywhere. Some of those services keep your documents on their servers for up to an hour after processing. With PDFfree, there is no upload step at all — the merge happens on your machine.",
  },
  {
    q: "Is there a limit on number of files or size?",
    a: "There are no artificial limits, no daily quotas and no paywalled tiers. The only real limit is the memory of the device you are using — very large PDFs (hundreds of MB or thousands of pages) may be slow on older phones, but any modern laptop handles typical documents easily.",
  },
  {
    q: "Will merging reduce quality?",
    a: "No. Pages are copied byte-for-byte from the originals into the new document. Text stays selectable, images keep their original resolution, and nothing is re-compressed or rasterized.",
  },
  {
    q: "Can I reorder files before merging?",
    a: "Yes. After you select your PDFs, drag the thumbnails in the left panel to arrange them in the order you want. You can also remove individual files before creating the merged PDF.",
  },
  {
    q: "Can I merge PDFs on mobile?",
    a: "Yes. PDFfree works in any modern mobile browser on iOS and Android. No app to install, no permissions to grant — just open the page, pick your PDFs and download the merged file.",
  },
  {
    q: "Do I need an account or app?",
    a: "No. There is no signup, no email required, no download and no watermark on the output. Every tool on PDFfree is free forever.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into separate files or page ranges." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping quality high." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag and drop to rearrange pages inside a PDF." },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages anywhere in your document." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pick specific pages and save them as a new PDF." },
];

export function MergePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* 1. Benefit strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "No file upload — works in your browser",
          "Free forever, no signup",
          "No watermarks, no limits",
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

      {/* 2. How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to merge PDF files online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {[
          "Click Select PDF files and choose the PDFs you want to combine — or drop them onto the page. Everything stays on your device.",
          "Drag the thumbnails in the left panel to reorder the files exactly the way you want them in the final document.",
          "Click Merge PDF. The files are combined locally in your browser in a couple of seconds — no upload, no waiting.",
          "Download the merged PDF from the success screen. That's it.",
        ].map((step, i) => (
          <li key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <p className="text-[15px] leading-relaxed text-[#4a4a55] pt-1">{step}</p>
          </li>
        ))}
      </ol>

      {/* 3. Six benefit sections */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why combine PDF files with PDFfree
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {[
          {
            h: "Your files never leave your device",
            p: "This is the real difference. Other popular PDF sites upload the documents you drop onto their page to their own servers — and some keep them stored there for up to an hour after processing. PDFfree does the entire merge locally in your browser, so contracts, bank statements and ID scans stay with you.",
          },
          {
            h: "No quality loss",
            p: "Pages are copied as-is from the source files into the new PDF. Nothing is re-compressed, rasterized or downscaled, so text stays sharp and searchable and images keep their original resolution.",
          },
          {
            h: "Preview and reorder with thumbnails",
            p: "Every file you add shows up as a thumbnail in the left panel. Drag them into the order you want, or remove any file before the merge. What you see in the panel is exactly the order of the output.",
          },
          {
            h: "Works on any device",
            p: "PDFfree runs in any modern browser on Windows, macOS, Linux, ChromeOS, iOS and Android. No installer, no plugin, no browser extension — just open the page and merge.",
          },
          {
            h: "Faster than uploading",
            p: "Because there is no upload and no download of the source files, merging starts the instant you click the button. On a normal broadband connection you save the round-trip; on a slow connection the difference is huge.",
          },
          {
            h: "Completely free",
            p: "No signup, no free trial, no watermark stamped on the output, no daily limit on how many files you can combine. Every tool on PDFfree — including this one — is free to use as often as you like.",
          },
        ].map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* 4. Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        When do you need to merge PDFs?
      </h2>
      <div className="mt-6 space-y-5">
        {[
          {
            h: "Job and government applications",
            p: "Most application portals only accept a single PDF upload. Combining your ID scan, diplomas, certificates and the signed form into one merged document is usually the fastest way to get everything submitted without hitting the one-file limit.",
          },
          {
            h: "Monthly invoices and receipts",
            p: "If you save invoices and receipts as separate PDFs during the month, merging them into a single monthly report makes bookkeeping and expense claims far easier to file and to search through later.",
          },
          {
            h: "Study notes and book chapters",
            p: "Lecture handouts, chapter PDFs and past exam papers are usually distributed as separate files. Merging them into one document per subject means you have a single, ordered PDF to read, annotate or print for revision.",
          },
          {
            h: "Cover letter, resume and supporting documents",
            p: "When you apply for a job, employers often prefer one PDF containing your cover letter, CV and references in that order. Merging them yourself gives you full control over the order and saves the recruiter from opening several files.",
          },
        ].map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

      {/* 5. FAQ */}
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

      {/* 6. Related */}
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

export const mergeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const mergeSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Merge PDF",
  description:
    "Merge PDF online for free. Combine PDF files in your browser — no upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
