import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you want to crop",
    text: "Click Select PDF file and pick your document. The first page renders as a large preview in the workspace, with a red crop box drawn around the full page and eight round handles at every edge and corner ready to be dragged.",
  },
  {
    title: "Drag the crop box to frame what you want to keep",
    text: "Grab any of the eight handles to pull an edge or corner inward, the darkened overlay outside the box shows exactly what will be trimmed. Drag the middle of the box to slide the whole frame around without resizing it. If you prefer precision over dragging, the sidebar exposes Top, Right, Bottom and Left inputs in points (72pt = 1 inch) that stay perfectly in sync with the visual box.",
  },
  {
    title: "Choose all pages or a specific range",
    text: "The Apply to all pages checkbox is on by default, so a single frame in the preview crops the entire document identically. Untick it to reveal a Pages input where you can type ranges like 1-3,5 to crop only selected pages, the rest of the document keeps its original page size.",
  },
  {
    title: "Click Crop PDF and download",
    text: "The tool writes the new page boundaries into the PDF and hands you a your-file-cropped.pdf download. The original file on your device is never overwritten, so you can come back and re-crop it as many times as you like from scratch.",
  },
];

const benefits = [
  {
    h: "See exactly what you keep",
    p: "The interactive preview darkens everything that will be trimmed and leaves the keep-area bright, so there's no guessing about margins in points. Every drag of a handle updates the numeric Top/Right/Bottom/Left values in the sidebar instantly, and every number typed into those inputs snaps the visual box to match.",
  },
  {
    h: "One crop or per-page",
    p: "Leave Apply to all pages ticked to stamp the same frame across every page in one operation, ideal for a book scan with the same margins throughout. Untick it and type a page range like 1-3,5 to crop only those pages while the rest of the document keeps its original dimensions untouched.",
  },
  {
    h: "Content quality untouched",
    p: "Cropping this way rewrites the page's CropBox, the rectangle a PDF viewer chooses to display, without altering the underlying page contents. The text stays as text, vector diagrams stay as vector, photos stay at their original resolution, and nothing is re-rendered, re-compressed or converted to an image on the way out.",
  },
  {
    h: "Perfect for phone reading",
    p: "A PDF with generous white borders wastes half a phone screen on nothing; cropping the margins away lets the viewer zoom the actual text to a genuinely legible size at the default fit-to-width. The same trick makes e-reader reflow more reliable and shrinks the fit-to-page footprint when the document is embedded in a slide.",
  },
];

const scenarios = [
  {
    h: "Cleaning up messy scans",
    p: "Scanner beds routinely capture a dark strip along one edge, a shadow from the facing page, or half an inch of skin from the person holding the book down. A quick visual crop trims those artefacts away so the finished PDF looks like something that was born digital.",
  },
  {
    h: "Making documents readable on phones and e-readers",
    p: "Many public PDFs are laid out for A4 print and become unreadably small on a 6-inch screen because of their oversized margins. Cropping those margins down to a slim border repositions the actual body text at a size the phone's default zoom can display comfortably.",
  },
  {
    h: "Preparing a page for a slide or a document",
    p: "When you screenshot a page to drop into a slide or a Word document, half the space is often wasted margin. Cropping to just the chart, paragraph or table you want to quote gives a much cleaner embed that respects the receiving layout.",
  },
  {
    h: "Trimming a downloaded ticket or form before printing",
    p: "Online tickets, boarding passes and short forms frequently ship on a full A4 page with a small block of actual content in the middle. Crop the page down to just that block and printing uses a fraction of the paper, some printers will even auto-scale the crop to fill a smaller physical sheet.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I crop a PDF for free?",
    a: "Click Select PDF file, drag the red crop box or its eight handles over the first-page preview until it frames the area you want to keep, decide whether to apply the same frame to every page or to a range like 1-3,5, then click Crop PDF. A cropped copy downloads with a -cropped suffix; the original stays as it was on your device.",
    plain:
      "Click Select PDF file, drag the red crop box or its handles over the first-page preview, choose Apply to all pages or type a range like 1-3,5, then click Crop PDF. A cropped copy downloads with a -cropped suffix; the original is untouched.",
  },
  {
    q: "Can I crop all pages at once?",
    a: "Yes, Apply to all pages is on by default. Set the frame once on the preview and the same margins apply to every page in the document in a single operation, no matter how many pages the file has.",
    plain:
      "Yes. Apply to all pages is on by default; setting the frame once applies the same margins to every page in a single operation.",
  },
  {
    q: "Can I crop each page differently?",
    a: "You can crop a subset of pages with one frame, but the tool doesn't currently let you draw a different frame for every individual page in one run. Untick Apply to all pages and use the Pages field (e.g. 1-3,5) to target a range with the crop you've set; to give a different range a different crop, run the tool a second time on the cropped file with a new selection.",
    plain:
      "You can target a page range with one frame by unticking Apply to all pages and typing pages like 1-3,5. To give different pages different crops, run the tool again on the output with a new range and new frame.",
  },
  {
    q: "Does cropping delete the cropped-out content permanently?",
    a: (
      <>
        No, and this is important to understand. Cropping here adjusts the
        page's <em>CropBox</em>, which is the rectangle a PDF viewer chooses to
        display; the trimmed-out pixels, text and graphics still live inside
        the file and can be revealed by anyone who resets the crop in a PDF
        editor. If your goal is to hide sensitive information (an ID number,
        an address, a signature in a margin), use{" "}
        <Link to="/tools/$slug" params={{ slug: "redact-pdf" }} className="text-[#e5322d] underline">
          Redact PDF
        </Link>{" "}
        instead, it actually deletes the underlying content, whereas cropping
        only changes what's on screen.
      </>
    ),
    plain:
      "No. Cropping adjusts the page's CropBox (the rectangle a viewer displays); the trimmed-out content still exists in the file and can be recovered by resetting the crop. For sensitive information use Redact PDF (/tools/redact-pdf), which actually removes the underlying content.",
  },
  {
    q: "Will cropping reduce quality?",
    a: "No. Because cropping only changes the visible page boundary and doesn't touch the underlying content stream, text remains selectable, embedded fonts stay embedded, vector diagrams stay crisp at any zoom and raster images keep their original resolution. There's no re-encoding step that could soften edges or introduce compression artefacts.",
    plain:
      "No. Cropping only adjusts the visible page boundary; the content stream isn't touched. Text stays selectable, vector art stays crisp and raster images keep their original resolution, no re-encoding.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The preview renders, the crop box is dragged and the new page boundaries are written into the PDF entirely inside your browser tab using standard Web APIs. Nothing about the file leaves your device, and once the page has loaded the whole flow works offline.",
    plain:
      "No. The preview and the crop are done entirely inside your browser tab. Nothing is uploaded, and the flow keeps working offline once the page has loaded.",
  },
  {
    q: "Can I undo a crop?",
    a: "Your original file on your device is never modified, the tool only produces a new -cropped.pdf as a separate download. If you want to change the crop, delete that output and re-open the original here; drag a fresh frame and export again. Because the underlying content is preserved even in the cropped copy (see the CropBox answer above), a full-featured PDF editor can also reset the crop on the exported file.",
    plain:
      "Yes. The original file on your device is never modified; the tool only produces a separate -cropped.pdf. Re-crop by opening the original again. A PDF editor can also reset the CropBox on the cropped copy.",
  },
  {
    q: "Can I crop a scanned PDF?",
    a: "Yes, scanned PDFs are the most common thing people crop here, precisely because they arrive with dark scanner edges, uneven white borders and the occasional shadow of a neighbouring page. The visual crop box makes it easy to line the frame up with the actual content and trim those artefacts away without touching the scan's resolution.",
    plain:
      "Yes. Scanned PDFs are the most common use case; the visual crop box makes it easy to trim scanner edges, white borders and shadows without touching the scan's resolution.",
  },
  {
    q: "Can I crop on my phone?",
    a: "Yes. The crop box and all eight handles respond to touch, tap and drag any handle with your finger, or drag the middle of the box to move the whole frame. If precise pixel work is fiddly on a small screen, the Top/Right/Bottom/Left number inputs in the sidebar are usually the fastest way to nudge each edge into place on mobile.",
    plain:
      "Yes. The crop box and all eight handles support touch dragging. For precise adjustments on a small screen, the Top/Right/Bottom/Left number inputs in the sidebar are often faster than dragging.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Acrobat's crop tool is behind its paid tier; this one does the same job in the browser with no download, no subscription and no watermark on the output. The cropped PDF opens correctly in Acrobat Reader, Preview, Chrome, Edge, Foxit or any other PDF viewer.",
    plain:
      "No. Acrobat's crop tool is behind a paid tier; this one does the same job in the browser with no download, no subscription and no watermark. Output opens in every major PDF viewer.",
  },
];

const related = [
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Drag pages into a new sequence with a visual grid." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
] as const;

export function CropPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to crop a PDF online for free
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
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

      {/* Wasted margins */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Remove wasted margins and messy edges
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A surprising number of PDFs waste half their surface on nothing.
        Scans typically arrive with fat white borders, the dark stripe where
        the scanner lid didn't quite meet the page, or a grey ghost of the
        opposite page bleeding in. Documents downloaded from institutional
        sites are often laid out for A4 print with margins wide enough to
        scribble notes in, margins nobody scribbles in when the PDF is being
        read on a laptop.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Trimming those wasted edges away lets the content itself fill the
        page. The result reads better on phones and tablets (the zoom-to-fit
        default lands on the text, not the whitespace), prints better (the
        content is proportionally bigger for the same paper size) and embeds
        better in slides and documents (no awkward halo of margin around the
        thing you actually wanted to quote).
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Crop privately, your document stays with you
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The documents people crop most often are the ones they least want
        strangers reading, scanned bills, boarding passes, ID copies,
        salary slips, statements with a name and address in the corner.
        This tool renders the first-page preview and rewrites the page
        boundaries entirely inside the browser tab you already have open;
        the PDF is never transmitted to us or to any third party at any
        point in the process.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once the page has finished loading you can disconnect from the
        internet and the crop still works, the JavaScript that does the
        work lives on your device, not on a server. Nothing is retained,
        nothing is analysed, and there's no account to sign into that could
        remember what you cropped last week.
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
        When do you need to crop a PDF?
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
      </h3>
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

export const cropPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const cropPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to crop a PDF online for free",
  description:
    "Crop any PDF entirely in the browser, drag a visual crop box on a live preview, or type exact margins in points, apply to all pages or a page range. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to crop" }],
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com Crop PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/crop#step-${i + 1}`,
  })),
};

export const cropPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Crop PDF",
  description:
    "Crop PDF online free, trim white margins and unwanted edges with a visual crop box and live preview, apply to all pages or a page range. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
