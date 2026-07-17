import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Select or drop your PDF",
    text: "Click Select PDF files and pick the document you want to shrink, or drag it onto the page. The file is opened locally in your browser — nothing is sent anywhere.",
  },
  {
    title: "Choose a compression level",
    text: "Pick Light for best quality, Balanced for a middle ground, or Strong for the smallest possible file. You can re-run with a different level if the first result is not small enough.",
  },
  {
    title: "Click Compress PDF",
    text: "Compression runs on your device using client-side code. There is no upload queue and no waiting for a server — big files start shrinking immediately.",
  },
  {
    title: "Check the size summary and download",
    text: "The success screen shows the original size next to the compressed size so you know exactly how much smaller it got. If compression would have made the file bigger, we keep your original untouched.",
  },
];

const benefits = [
  {
    h: "Three compression levels",
    p: "Light keeps quality closest to the original, Balanced is the everyday default, and Strong squeezes out the smallest file for tight upload limits. The size summary always shows original vs compressed so you can decide whether to re-run with a stronger setting.",
  },
  {
    h: "Smart with scanned PDFs",
    p: "Image-heavy files — scanned admit cards, ID copies, salary slips, photographed contracts — see the biggest reductions because photos and scans are where most of the weight lives. Text-only PDFs are already small and shrink less.",
  },
  {
    h: "No watermark, no limits",
    p: "There are no daily quotas, no locked tiers and no watermark stamped onto the output. Compress as many PDFs as you want, as often as you want, completely free.",
  },
  {
    h: "Instant — no upload wait",
    p: "Because the file never leaves your device, compression begins the moment you click the button. Large PDFs do not have to crawl through a slow connection first, and there is nothing to download back afterwards.",
  },
];

const scenarios = [
  {
    h: "Exam and job application portals",
    p: "Government job forms, university admission portals and visa websites often cap uploads at 100 KB, 200 KB or 1 MB per document. Compressing your scanned photo, signature or filled form to fit those limits is usually the fastest way past the upload error.",
  },
  {
    h: "Email attachment limits",
    p: "Gmail caps attachments at 25 MB, and many corporate inboxes are even smaller. Reducing a heavy report or scanned contract with strong compression usually gets it under the limit without having to split the file or use a share link.",
  },
  {
    h: "Sharing scans on WhatsApp and chat apps",
    p: "Scanned documents sent to family, agents or HR usually upload and download much faster after compression. A smaller file also saves the recipient's mobile data, which matters on slower connections.",
  },
  {
    h: "Saving space on phone and cloud storage",
    p: "Years of receipts, statements and forms add up. Running old PDFs through the compressor before archiving them to Drive, iCloud or your phone can free a surprising amount of space without losing readability.",
  },
];

const faqs = [
  {
    q: "How do I compress a PDF to 100 KB?",
    a: "Start with the Strong compression level and check the size summary. Scanned or photo-heavy PDFs will often drop to that range in one pass. If you are still over, try running Grayscale PDF first to shrink scans further, or use Extract Pages to keep only the pages you actually need to submit. No tool can guarantee an exact target size for every document — final size always depends on what is inside the PDF.",
  },
  {
    q: "Is it safe to compress PDFs with bank statements or ID documents?",
    a: "Yes. The file is never uploaded — everything happens in your browser through client-side processing. Bank statements, Aadhaar or passport scans, salary slips and admit cards stay on your device from start to finish.",
  },
  {
    q: "Does compressing reduce PDF quality?",
    a: "It depends on the level. Light keeps quality very close to the original and is safe for documents you plan to print. Strong reduces image resolution more aggressively to hit a small file size, so photos and scans look softer — text usually stays sharp and readable at every level.",
  },
  {
    q: "Why didn't my PDF get much smaller?",
    a: "Text-only PDFs are already highly compressed by design, so there is not much left to squeeze out. The compressor helps most with files that contain images, scans or photos. If our compressed output would actually be larger than your original — which happens with some already-optimised PDFs — we keep your original file as-is.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Compression is 100% client-side, running in your browser. Once this page has loaded you can disconnect from the internet and still reduce PDF file size — there is no server round-trip involved.",
  },
  {
    q: "Is there a file size or usage limit?",
    a: "There are no artificial limits and no daily caps. The only real constraint is your device's memory: very large PDFs with hundreds of high-resolution scans may be slow on older phones, but typical documents compress in seconds on any modern browser.",
  },
  {
    q: "Can I compress a PDF on my phone?",
    a: "Yes. The tool works in any modern mobile browser on Android and iPhone. There is no app to install and no permissions needed — open the page, pick the PDF and download the smaller file.",
  },
  {
    q: "Do I need an account or app?",
    a: "No. No signup, no email address, no download, no watermark. Every tool on PDFfree is free to use.",
  },
  {
    q: "Can I compress a password-protected PDF?",
    a: "Not directly — the file has to be readable first. Use our Unlock PDF tool to remove the password (you'll need to know it), then run the unlocked file through the compressor.",
  },
  {
    q: "How much smaller will my PDF get?",
    a: "For scanned or image-heavy PDFs, reductions of 50–90% are common with Strong compression. Text-only PDFs typically shrink much less because they are already efficient. Rather than guess, run the file and check the size summary — it shows the exact before and after so you know before you download.",
  },
];

const related = [
  { to: "/tools/grayscale", name: "Grayscale PDF", blurb: "Convert colour scans to grayscale to shrink them further." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Keep only the pages you need to hit tight upload limits." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break a large PDF into smaller separate files." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine multiple PDFs into a single document." },
  { to: "/tools/unlock", name: "Unlock PDF", blurb: "Remove a known password so the file can be compressed." },
];

export function CompressPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">


      {/* Benefit strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Files never leave your device",
          "Free — no signup, no watermark",
          "Three compression levels",
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
        How to compress a PDF online for free
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

      {/* Money section — target size intent */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Compress PDF to meet upload size limits (100 KB, 200 KB, 500 KB)
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A lot of the pressure to reduce PDF file size comes from strict portal caps: job application forms that only
        accept a 100 KB photo, exam sites that reject anything over 200 KB, visa uploads limited to 500 KB, or bank
        onboarding that maxes out at 1 MB per document. Our compressor is built for exactly this: start with the Strong
        level and check the size summary — scanned and photo-heavy PDFs often drop dramatically in a single pass.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        If Strong still is not small enough, combine approaches. Run{" "}
        <Link to="/tools/grayscale" className="text-[#e5322d] underline underline-offset-2">Grayscale PDF</Link> first to
        strip colour from scans (they usually shrink hard afterwards), or use{" "}
        <Link to="/tools/extract-pages" className="text-[#e5322d] underline underline-offset-2">Extract Pages</Link> to
        keep only the pages the portal actually asked for and compress the trimmed file. We will not promise an exact
        target size — final size always depends on what is inside the document — but between these three tools most
        people hit their limit.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Your PDF never leaves your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Most online PDF compressors work by uploading your file to their servers, running the compression there and
        letting you download the result. That means someone else's infrastructure briefly holds your document — not
        ideal for salary slips, bank statements, admit cards or ID scans. PDFfree takes a different route: the
        compression code runs inside your browser, so the PDF is opened, shrunk and saved without ever touching a
        remote server.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once the page has loaded you can even switch to airplane mode and keep compressing. That is what compress PDF
        without uploading actually means in practice — the file is only ever on your device.
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
        When do you need to compress a PDF?
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

export const compressFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const compressHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress a PDF online for free",
  description:
    "Reduce PDF file size for free in your browser — no upload, no signup, no watermark. Pick a compression level and download the smaller file.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file you want to shrink" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Compress PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/compress#step-${i + 1}`,
  })),
};

export const compressSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Compress PDF",
  description:
    "Compress PDF online free — reduce PDF file size in your browser with no upload, no signup and no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
