import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Select or drop your PDFs",
    text: "Click Select PDF files and pick the documents you want to combine, or drag them straight onto the page. Files are opened locally in your browser — nothing is uploaded.",
  },
  {
    title: "Drag thumbnails to set the order",
    text: "Every PDF appears as a thumbnail in the left panel. Drag them into the exact order you want them in the final document, or remove any file before merging.",
  },
  {
    title: "Click Merge PDF",
    text: "The files are combined into one PDF right on your device. It takes a couple of seconds — no upload progress bar, no queue, no server round-trip.",
  },
  {
    title: "Download the merged PDF",
    text: "Save the combined file from the success screen. You can start over with new files at any time — no account, no watermark on the output.",
  },
];

const benefits = [
  {
    h: "No quality loss",
    p: "Pages are copied byte-for-byte from your originals into the new document. Nothing is re-compressed, rasterized or downscaled — text stays selectable and images keep their original resolution.",
  },
  {
    h: "Reorder pages before merging",
    p: "Drag and drop the thumbnails to arrange your files exactly how you want them. Your merged PDF comes out in exactly the order you arranged — never reversed or shuffled.",
  },
  {
    h: "Merge scanned documents easily",
    p: "Combine multiple scanned files — certificates, receipts, signed contracts — into a single PDF in one step. If you still need to digitise paper first, use our Scan to PDF tool and drop the results straight in here.",
  },
  {
    h: "Faster than upload-based tools",
    p: "Because there is no upload and no download of the source files, merging starts the instant you click the button. Even on a slow connection you skip the round-trip entirely.",
  },
];

const scenarios = [
  {
    h: "Job and government applications",
    p: "Most application portals only accept a single PDF. Combining your certificates, ID scan and the signed form into one merged PDF is usually the fastest way to satisfy the one-file upload slot without hitting size or count limits.",
  },
  {
    h: "Monthly invoices and receipts",
    p: "If you save invoices and receipts as separate PDFs during the month, merging them into one monthly report makes bookkeeping and expense claims much easier to file, share and search through later.",
  },
  {
    h: "Study notes and book chapters",
    p: "Lecture handouts, chapter PDFs and past exam papers usually arrive as separate files. Merge them into one PDF per subject so you have a single, ordered document to read, annotate or print for revision.",
  },
  {
    h: "Resume, cover letter and supporting documents",
    p: "Recruiters often prefer one PDF containing your cover letter, CV and references in that order. Combining them yourself gives you full control over the sequence and fits neatly into a single upload slot.",
  },
];

const faqs = [
  {
    q: "Is it safe to merge PDF files online?",
    a: "Yes. FreePDFHub merges PDFs directly in your browser using client-side JavaScript and WebAssembly. Your files are opened, combined and saved on your own device — nothing is uploaded, so even confidential contracts, medical records or bank statements never leave your computer.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Processing is 100% in-browser. Once the page has loaded you can even disconnect from the internet and still merge PDFs — there is no upload step and no server-side copy of your documents at any point.",
  },
  {
    q: "How do I combine PDF files without Adobe Acrobat?",
    a: "You don't need Adobe Acrobat or any paid software. Just open this page, add your PDFs and click Merge PDF — the free browser tool combines them for you. Nothing to install, no subscription, unlimited use.",
  },
  {
    q: "Is there a limit on the number of files or file size?",
    a: "There are no artificial limits, no daily quotas and no paywalled tiers. The only real limit is the memory of the device you are using — very large PDFs with thousands of pages may be slow on older phones, but any modern laptop handles typical documents without trouble.",
  },
  {
    q: "Will merging reduce the quality of my PDFs?",
    a: "No. Pages are copied as-is from your source files into the new document. Nothing is re-compressed or rasterized, so text stays sharp and searchable and images keep their original resolution.",
  },
  {
    q: "Can I change the order of files before merging?",
    a: "Yes. Drag the thumbnails in the left panel to arrange the files however you like, and remove any file before running the merge. The output order always matches exactly what you arranged on screen.",
  },
  {
    q: "Can I merge PDFs on mobile?",
    a: "Yes. FreePDFHub works in any modern mobile browser on Android and iPhone. There is no app to install and no permissions to grant — just open the page, pick your PDFs and download the merged file.",
  },
  {
    q: "Do I need an account or email?",
    a: "No. There is no signup, no email required and no watermark added to the output. Every tool on FreePDFHub is free to use as often as you like.",
  },
  {
    q: "What's the difference between merge, combine and join PDF?",
    a: "They mean the same thing. Merge, combine and join are just different words people use for putting several PDF files into one. This tool works for all three — it's a PDF combiner, a PDF joiner and a PDF merger in one.",
  },
  {
    q: "Can I merge scanned documents or images with PDFs?",
    a: "If your scans are already saved as PDFs, drop them straight in here and merge as usual. If you have photos or JPG/PNG images, convert them first with our Image to PDF tool, then combine the resulting PDFs here.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into separate files or page ranges." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping quality high." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag and drop to rearrange pages inside a PDF." },
  { to: "/tools/scan-to-pdf", name: "Scan to PDF", blurb: "Turn phone-camera scans into a clean PDF." },
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG photos into a single PDF." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pick specific pages and save them as a new PDF." },
];

export function MergePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">


      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to merge PDF files online for free
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
      <p className="mt-5 text-[14.5px] leading-relaxed text-[#4a4a55]">
        Works the same on Windows, Mac, Linux, Android and iPhone — no app or Adobe Acrobat needed.
      </p>

      {/* Without Acrobat */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Combine PDF files without Adobe Acrobat
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        You do not need Adobe Acrobat, a paid subscription or any desktop installer to combine PDF files into one.
        This free PDF combiner runs entirely in your browser — open the page, add your files and click Merge PDF.
        People call the same job by different names (PDF combiner, PDF joiner, PDF merger); whichever term you searched
        for, this is the tool. You can merge as many PDFs as you like, as often as you like, with no signup and no
        watermark on the result.
      </p>

      {/* Privacy killer differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        The private way to merge PDFs: your files stay on your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Most popular PDF sites upload your documents to their own servers, process them there and then delete them
        after some time — you have to trust that they actually do. FreePDFHub is different. Merging happens entirely in
        your browser through client-side processing, so contracts, bank statements, salary slips, ID or Aadhaar
        documents and legal papers never leave your computer.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Because nothing is uploaded, you can even load this page, switch your device to offline mode and still merge
        PDFs. That is the real meaning of merge PDF without uploading: your files are the only copy, and they stay
        with you.
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
        When do you need to merge PDF files?
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

export const mergeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const mergeHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to merge PDF files online for free",
  description:
    "Combine multiple PDF files into one document for free, right in your browser — no upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "Two or more PDF files" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub Merge PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/merge#step-${i + 1}`,
  })),
};

export const mergeSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Merge PDF",
  description:
    "Merge PDF online free — combine PDF files in your browser with no upload, no signup and no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
