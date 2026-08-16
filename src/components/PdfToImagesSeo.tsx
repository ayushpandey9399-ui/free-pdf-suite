import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you want to convert",
    text: "Drag your PDF into the browser or click Select PDF file to pick it from your device. The document is opened locally by the built-in PDF renderer, nothing is sent anywhere, even when the file has dozens of pages.",
  },
  {
    title: "Pick JPG or PNG",
    text: "Use the Format dropdown to choose JPG for smaller, easily shareable images or PNG when you need lossless quality for text and line art. PNG ignores the quality slider because it is a lossless format.",
  },
  {
    title: "Set quality and resolution",
    text: "The Quality slider (30 to 100%, JPG only) controls how much compression is applied to each JPG. The Scale slider (1× to 4×, default 2×) renders every page at that multiple of its natural size, so 2× gives you a sharp image roughly double the on-screen dimensions.",
  },
  {
    title: "Click Convert to Images and download",
    text: "Each page is rendered to a canvas one after another with a live progress bar. A single-page PDF downloads directly as one image; a multi-page PDF is packaged into a ZIP so all the images arrive in one click, named page-1, page-2 and so on.",
  },
];

const benefits = [
  {
    h: "JPG or PNG, your choice",
    p: "Pick JPG when the goal is a small file you can drop into a chat, an email or a form, a page usually lands under a few hundred kilobytes. Pick PNG when you need lossless quality: screenshots of contracts, technical drawings, invoices and anything where text and thin lines have to stay perfectly sharp.",
  },
  {
    h: "Sharp, readable output",
    p: "Pages are rendered at 2× their natural size by default, and you can push the Scale slider up to 4× for near-print quality. Body text stays crisp instead of turning into the blurry, jagged output that lower-resolution converters produce, which matters when someone is going to read the image on a phone screen.",
  },
  {
    h: "All pages at once",
    p: "Point the tool at a 50-page report and you get 50 numbered images without touching the file again, page-1.jpg through page-50.jpg, bundled into a single ZIP. Extracting one page from that ZIP is a two-second job in any file manager.",
  },
  {
    h: "Nothing to install",
    p: "The converter is a normal web page, so it runs anywhere a browser runs, a Windows laptop, a MacBook, a Chromebook, an Android phone or an iPhone. No Acrobat licence, no desktop converter and no app store download stand between you and the images.",
  },
];

const scenarios = [
  {
    h: "Sharing a single page on WhatsApp or Instagram",
    p: "Chat apps preview and open images cleanly, but PDFs get treated as attachments that many recipients ignore or cannot open on the first tap. Converting the page you actually want to show into a JPG makes it appear inline in the chat, ready to view without a download.",
  },
  {
    h: "Inserting PDF pages into PowerPoint, Word or Canva",
    p: "Slide and design tools accept images natively but handle imported PDFs awkwardly, usually only the first page comes in, and the layout breaks. Exporting the pages you need as PNGs first lets you drag each one onto a slide, into a document or onto a Canva canvas exactly like a photo.",
  },
  {
    h: "Uploading to portals that only accept JPG or PNG",
    p: "A lot of government sites, university applications, tender portals and job boards restrict document uploads to image formats and cap the file size, think passport-size photos, signature scans, marksheet uploads or ID proofs. Converting the PDF page to a JPG with a suitable quality setting fits those forms without a rejection.",
  },
  {
    h: "Creating thumbnails or previews of documents",
    p: "If you are building a knowledge base, a product listing or an internal wiki that lists reports, invoices or brochures, showing the first-page thumbnail alongside each entry makes it far easier for readers to pick the right one. Exporting page 1 of each PDF at 1× or 2× scale gives you a ready-made preview image.",
  },
];

const faqs = [
  {
    q: "How do I convert a PDF to JPG for free?",
    a: "Open the PDF here, leave the format on JPG (or switch to PNG for a lossless PDF to PNG conversion instead), adjust the quality and scale sliders if needed and click Convert to Images. A one-page PDF downloads as a single JPG; a multi-page PDF downloads as a ZIP containing one image per page. There is no signup, no watermark and no page cap.",
  },
  {
    q: "Should I choose JPG or PNG?",
    a: "Choose JPG when the file has to be small, for messaging apps, email attachments and portals that limit upload size. Choose PNG when quality matters more than size: pages that are mostly text, contracts, diagrams, technical drawings or anything that will be re-shared, zoomed into or printed. PNG is lossless, so the quality slider has no effect on it.",
  },
  {
    q: "Will the images be high quality?",
    a: "Yes. Pages are rendered by pdf.js at 2× their natural size by default, which is roughly 144 DPI, enough for on-screen reading and most uploads. If you need print-quality output, push the Scale slider to 3× or 4×; the file gets larger but the text stays perfectly crisp under a zoom.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is loaded into your browser's memory, every page is drawn to a local canvas and the images are packaged in-browser. Nothing about the document, not the file, not the extracted images, not the filename, is transmitted or stored on our side.",
  },
  {
    q: "Can I convert only one page instead of all?",
    a: "Not directly, the converter renders every page of the PDF in one pass. If you only need one page as an image, first run the file through the Extract Pages tool to keep just the page you want, then bring that one-page PDF here and it will download as a single image.",
  },
  {
    q: "How do I convert PDF to image on my phone?",
    a: "Open this page in Safari on an iPhone or Chrome on Android, tap Select PDF file, pick the PDF from Files or your downloads and tap Convert to Images. The ZIP or single image is saved to your phone's Downloads and can be shared straight from there to any chat or upload form.",
  },
  {
    q: "Is there a page limit?",
    a: "There is no artificial cap, a two-page brochure or a 300-page annual report both work. Because rendering happens in your browser, the practical limit is your device's memory. On a phone, very large PDFs (hundreds of pages combined with a 4× scale) may slow down or hit the tab's memory ceiling; on a laptop, that ceiling is much higher.",
  },
  {
    q: "Why is my downloaded file a ZIP?",
    a: "Whenever the PDF has more than one page, the images are packaged into a ZIP so the whole set arrives as one download instead of dozens of separate file prompts. Single-page PDFs skip the ZIP and download as a plain .jpg or .png. Any file manager on Windows, macOS, iOS or Android can open the ZIP with a double-tap.",
  },
  {
    q: "Can I convert a scanned PDF to images?",
    a: "Yes. A scanned PDF is essentially images already embedded in a PDF container, so each scanned page is re-rendered here into a standalone JPG or PNG at the scale you picked. If you would rather pull out the exact embedded scans without re-rendering them, use the Extract Images tool instead.",
  },
  {
    q: "How do I do the reverse, images to PDF?",
    a: "Use the Image to PDF tool. Drop JPG or PNG files in the order you want, arrange them into a single PDF and download the combined document, useful when you have to submit a set of photos or scans as one PDF attachment.",
  },
];

const related = [
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/extract-images", name: "Extract Images", blurb: "Pull embedded photos out of a PDF in original quality." },
  { to: "/tools/pdf-to-text", name: "PDF to Text", blurb: "Extract selectable text and download it as .txt." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull specific pages out as a brand-new PDF." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
] as const;

export function PdfToImagesSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert PDF to JPG online for free
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

      {/* Every page becomes an image */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Convert every PDF page into a high-quality image
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every page of your PDF is rendered to its own image at the scale you pick, so a 12-page brochure becomes
        twelve numbered pictures and a single-page invoice becomes one. JPG is the right pick when you want a small
        file to drop into a chat, an email or a form; PNG is the right pick when quality has to be lossless, text
        stays razor-sharp and thin lines never smudge, which matters for contracts, diagrams and scans that will be
        re-shared.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Multi-page PDFs arrive as a single ZIP so a hundred images do not have to be downloaded one at a time; a
        one-page PDF skips the ZIP and downloads as a plain .jpg or .png. Pages are always saved in the order they
        appear, named page-1, page-2 and so on, so reassembling or picking just one is trivial.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private conversion, your PDF never leaves your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The pages people usually want as images are the sensitive ones: a specific line from a bank statement to
        send to an accountant, a single page of an ID for a rental form, a slide from an internal report to embed
        in a deck. Most PDF-to-JPG sites quietly upload the whole file to a conversion server, process it there
        and hand you back a download link, meaning a complete copy of that private document has already left
        your machine.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This converter renders every page locally in your browser using pdf.js. The bytes of your PDF never touch
        our servers, and once the page is loaded you can even disconnect from the internet and finish the
        conversion offline. The document, and every image it produces, only ever exists on your device.
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
        When do you need to convert PDF to images?
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

export const pdfToImagesFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const pdfToImagesHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PDF to JPG online for free",
  description:
    "Convert a PDF to JPG or PNG images in your browser, pick the format, adjust quality and scale, and download every page as an image without uploading the file anywhere.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A PDF you want to turn into images" }],
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com PDF to Images (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/pdf-to-images#step-${i + 1}`,
  })),
};

export const pdfToImagesSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com PDF to Images",
  description:
    "Convert PDF to JPG or PNG online free, render every page as a high-quality image in your browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
