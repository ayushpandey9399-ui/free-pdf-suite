import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Open the color PDF you want to convert",
    text: "Click Select PDF file and pick the document. The tool reads it locally with pdf.js, checks that it isn't password-protected, and shows a live side-by-side preview of the first page — the original on the left and the grayscale version on the right — so you can see exactly what the finished file will look like before you commit.",
  },
  {
    title: "Choose an output quality",
    text: "The sidebar offers two settings. High quality re-renders each page at 1.5× the page size and encodes the result as JPEG at 0.85 quality — best fidelity, larger file. Smaller file re-renders at 1.2× and encodes at 0.7 — visibly still crisp, noticeably lighter. The grayscale preview updates as you switch, so you're never guessing.",
  },
  {
    title: "Click Convert to Grayscale",
    text: "The tool walks every page in order, redraws it onto an offscreen canvas, applies a true grayscale filter (GPU-accelerated where the browser supports canvas filters, with a manual luminance fallback otherwise), and stitches the results into a fresh PDF with pdf-lib. Progress is reported page-by-page so a long document never looks stalled.",
  },
  {
    title: "Download the black & white copy",
    text: "The success screen shows the before/after file size and, when the conversion also shrank the document, the exact percentage saved. Your download is a standard PDF suffixed -grayscale.pdf. The original file on your disk is untouched — this is a new copy alongside it.",
  },
];

const benefits = [
  {
    h: "True grayscale output",
    p: "Every page is redrawn through a real grayscale filter and re-embedded into the new PDF, not just tinted or hidden by a viewer setting. Whichever reader, printer or portal opens the file, the pages arrive as clean black and white — never full-color pixels behind a display trick.",
  },
  {
    h: "Smaller files",
    p: "For color scans, phone-camera captures and photo-heavy documents the JPEG re-encode in grayscale usually produces a meaningfully lighter file, and the built-in Smaller file quality trades a little sharpness for extra savings. Text-only PDFs that were already lean won't shrink much, and that's fine — you're doing the conversion for the color, not the size.",
  },
  {
    h: "Cheaper printing",
    p: "A grayscale PDF removes any risk of a printer reaching for the color cartridges to render a stray logo, header band or icon. The whole document prints from the black cartridge only, in one predictable pass — no surprise CMYK usage on a hundred-page report.",
  },
  {
    h: "Cleaner look for scans",
    p: "Phone-camera scans usually come out with a yellow cast from indoor light, a green cast from fluorescent tubes, or a blue cast from a screen glow. Grayscaling collapses all of that into neutral tones, and the finished document looks like it came off a real flatbed scanner instead of a kitchen table.",
  },
];

const scenarios = [
  {
    h: "Printing long documents where color adds nothing",
    p: "Textbooks, meeting packs, contracts, study notes and internal reports rarely need color to be understood, but color cartridges are the most expensive consumable on any office printer. Convert the file to grayscale first and the printer treats every page as black and white — no accidental color hits on a page you're going to staple and forget.",
  },
  {
    h: "Submitting documents to portals that require black & white",
    p: "Government submissions, court filings, tender responses and some university portals explicitly ask for black-and-white PDFs, and reject uploads that contain color pages. Converting the file here means you send exactly what they asked for, once, instead of getting the submission bounced back a day later.",
  },
  {
    h: "Shrinking colorful scans before emailing or uploading",
    p: "A scanned brochure or a photo-heavy report can push past mailbox and portal limits. Grayscale re-encoding usually knocks a noticeable chunk off the size, and pairing this with a follow-up pass through Compress PDF (linked below) gets you the smallest possible file without touching the page dimensions.",
  },
  {
    h: "Making phone-camera scans look like proper scans",
    p: "A snap of a receipt or a contract on a desk tends to look amateur — uneven lighting, a color tint, a warm cast from the room. Converting that PDF to grayscale strips the color noise and produces something that reads and prints like a document, not a photo of a document.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I convert a PDF to black and white for free?",
    a: "Click Select PDF file, pick your document, choose High quality or Smaller file in the sidebar, then click Convert to Grayscale. The tool re-renders every page in grayscale and hands back a copy named -grayscale.pdf. No signup, no upload, no watermark, no page limit.",
    plain:
      "Click Select PDF file, pick your document, choose High quality or Smaller file, then click Convert to Grayscale. The tool re-renders every page and gives you a -grayscale.pdf copy. No signup, upload, watermark or page limit.",
  },
  {
    q: "Will grayscale make my PDF smaller?",
    a: "Usually yes for colorful documents, scanned pages and photo-heavy PDFs — the JPEG re-encode in grayscale drops each pixel from three channels to one, and the success screen shows the exact percentage saved. Text-only PDFs that were already efficient can come out about the same size or slightly larger, because the conversion still rasterizes each page. If size is your priority pick Smaller file, then run the result through Compress PDF.",
    plain:
      "Usually yes for colorful and scanned PDFs — the success screen shows the saved percentage. Text-only PDFs may stay similar or grow slightly because pages get rasterized. For maximum reduction pick Smaller file, then run the result through Compress PDF.",
  },
  {
    q: "Will the text stay sharp?",
    a: "Yes, at both quality settings the text remains clearly legible on screen and in print. High quality re-renders pages at 1.5× the page size and encodes as JPEG at 0.85 — visually indistinguishable from the original for reading. Smaller file uses 1.2× and JPEG 0.7 to save space, which is still crisp for standard document text; if you plan to print at very large sizes or read very small footnotes, keep the High quality setting.",
    plain:
      "Yes. High quality re-renders at 1.5× the page size at JPEG 0.85, visually indistinguishable for reading. Smaller file uses 1.2× at JPEG 0.7 to save space and stays crisp for standard text. Pick High quality for very large prints or very small footnotes.",
  },
  {
    q: "Can I still select or copy text after conversion?",
    a: "No. To guarantee identical black-and-white output in every reader and printer, the tool rasterizes each page — the finished PDF stores each page as a grayscale image rather than as searchable text characters. Keep your original file if you'll still need to select, copy or search the text; use the grayscale copy for printing, sending or submitting.",
    plain:
      "No. Each page is rasterized to guarantee identical output everywhere, so the finished PDF stores pages as grayscale images rather than searchable text. Keep your original for text work; use the grayscale copy for printing and submission.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The scan, the previews, the page-by-page grayscale render and the writing of the final -grayscale.pdf all happen inside your browser tab using pdf.js and pdf-lib. Nothing about the file is transmitted to us or to any third party, and once the page has loaded the whole flow keeps working with your network disconnected.",
    plain:
      "No. Scanning, previews, the grayscale render and writing the -grayscale.pdf all happen inside your browser tab with pdf.js and pdf-lib. Nothing is transmitted, and the flow keeps working offline once loaded.",
  },
  {
    q: "Is grayscale the same as printing in black-and-white mode?",
    a: "No — they're related but different. A printer's black-and-white mode drops color at print time only, on that one printer, for that one job; the file itself is still a full-color PDF, and the next person who prints it can (and often will) print it in color again. Grayscaling here converts the file itself, so every reader, printer, portal and email preview shows the document in black and white from now on.",
    plain:
      "No. A printer's B&W mode drops color at print time on that one printer for that one job — the file is still color and can be printed in color later. Grayscaling here converts the file itself, so every reader, printer, portal and email preview shows it in black and white.",
  },
  {
    q: "Can I convert only some pages?",
    a: "Not in this tool — the conversion always applies to every page in the document. If you need one section grayscale and another in color, split the file with Split PDF first, convert only the grayscale section here, then merge the pieces back together with Merge PDF.",
    plain:
      "No. The conversion always applies to every page. For a mix of grayscale and color, split the file with Split PDF, convert only the grayscale section here, then merge the pieces back with Merge PDF.",
  },
  {
    q: "Can I convert scanned or photo-heavy PDFs?",
    a: "Yes — that's the most common use of this tool. Scanned brochures, camera-captured contracts, photo reports and image-heavy handouts all convert cleanly to grayscale, and these are precisely the files where you'll see the biggest visible improvement and the biggest file-size reduction.",
    plain:
      "Yes — the most common use. Scanned brochures, camera-captured contracts, photo reports and image-heavy handouts convert cleanly and see the biggest visible improvement and size reduction.",
  },
  {
    q: "Can I undo the conversion?",
    a: "The tool never overwrites your original — the grayscale copy is a new file suffixed -grayscale.pdf, saved alongside the source. There's no in-tool undo because there's nothing to reverse: if you don't like the result, delete the copy, reopen the original and try again with the other quality setting.",
    plain:
      "The tool never overwrites your original — the grayscale copy is a new -grayscale.pdf saved alongside it. There's no in-tool undo because there's nothing to reverse: delete the copy and try again with the other quality setting.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. The tool is a web page that runs in Chrome, Safari, Firefox, Edge or Brave with no Acrobat licence, no install and no account. The output is a standard, universally-readable PDF that any viewer or printer will accept.",
    plain:
      "No. It runs in Chrome, Safari, Firefox, Edge or Brave with no Acrobat licence, install or account. The output is a standard PDF that any viewer or printer accepts.",
  },
];

const related = [
  { to: "/tools/compress", name: "Compress PDF", blurb: "Compress after grayscale for the smallest possible file." },
  { to: "/tools/pdf-to-images", name: "PDF to JPG", blurb: "Export the grayscale pages as standalone JPG images." },
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Combine scanned photos into a single PDF before converting." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Straighten sideways scans before or after grayscaling." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim scan borders so the grayscale copy looks even cleaner." },
] as const;

export function GrayscalePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      {/* Benefit strip */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          "Files never leave your device",
          "Every page converted to clean black & white",
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
        How to convert a PDF to grayscale online for free
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

      {/* Save ink, shrink scans, print cleaner */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Save ink, shrink scans, print cleaner
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Color pages drain the most expensive cartridges on any printer even when the color adds
        nothing meaningful to the content — a stray header band, a company logo in the corner, a
        chart no one reads on paper. Converting to grayscale before printing means the printer
        treats every page as black and white, and the color cartridges stay untouched for the jobs
        that actually need them.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Colorful scans and photo-heavy PDFs also get significantly lighter as grayscale because
        each pixel drops from three color channels to one, and pairing this pass with{" "}
        <Link to="/tools/compress" className="text-[#e5322d] underline">
          Compress PDF
        </Link>{" "}
        squeezes out the last bit of size for mailbox and portal limits. On top of that, documents
        simply look cleaner once the stray color casts from phone-camera scans — the yellows, the
        greens, the blues — are gone and every page reads as neutral, professional black and white.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private conversion — your documents stay with you
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Grayscale conversion is often the last step before a personal document goes somewhere it
        can't be taken back — a portal upload, a court submission, a scanned ID sent to a landlord.
        This tool re-renders every page inside your browser tab using pdf.js and pdf-lib, so
        nothing about the file is transmitted anywhere, and nothing about it is logged on our side.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once the page has loaded you can disconnect your network and the whole flow — preview,
        conversion and download — keeps working. The document you convert is the document you
        keep.
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
        When do you need a grayscale PDF?
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

export const grayscalePdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const grayscalePdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert a PDF to grayscale online for free",
  description:
    "Convert a color PDF to grayscale entirely in the browser — every page re-rendered as clean black and white, ready to print, email or upload. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A color PDF" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Grayscale PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/grayscale-pdf#step-${i + 1}`,
  })),
};

export const grayscalePdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Grayscale PDF",
  description:
    "Convert PDF to grayscale online free — every page re-rendered as black and white in your browser. Save printer ink and shrink colorful scans. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
