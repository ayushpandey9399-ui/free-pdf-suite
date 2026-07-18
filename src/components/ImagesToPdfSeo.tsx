import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Click Select images and pick your photos",
    text: "Choose one photo or a whole batch of them from your camera roll, downloads folder or desktop. The images open locally as a grid of thumbnails inside the workspace — none of them have been sent anywhere to reach this preview.",
  },
  {
    title: "Add more shots, remove the ones you don't want, or drag to reorder",
    text: "Use the Add more images button to append extra pictures at the end of the batch, and click the small × on any thumbnail to drop it. To change the sequence, grab the ⋮⋮ handle at the top of a thumbnail and drag the tile into a new slot — the other pictures shift out of the way as you move. The order shown in the grid is the order the pages will appear in the exported PDF.",
  },
  {
    title: "Pick a page setup on the right",
    text: "Choose Page size — Fit to image gives each photo its own page sized exactly to the picture (plus your margin), while A4 or Letter forces every page to a standard sheet. When you pick A4 or Letter, set Orientation to Portrait or Landscape and pick a Margin in points around the picture.",
  },
  {
    title: "Click Create PDF and download the result",
    text: "The tool decodes each image, embeds it at its original pixel resolution and writes a single PDF named images.pdf. The file is offered as a download to your device; nothing is stored on our side.",
  },
];

const benefits = [
  {
    h: "Many images, one PDF",
    p: "Drop in as many JPG or PNG files as you need and every one of them becomes a page in a single combined PDF, in the order they appear in the grid. There is no cap and no add-a-page workflow — one Create PDF click produces the whole bundled document.",
  },
  {
    h: "Control the page setup",
    p: "Fit to image sizes each PDF page exactly to its photo (plus the margin you set), which is ideal when you want no white borders. Switch to A4 or Letter and pick Portrait or Landscape when the recipient expects a standard sheet, and the picture is centered inside the page with your chosen margin around it.",
  },
  {
    h: "Quality preserved",
    p: "Every image is embedded at its full original pixel dimensions — a 12 MP phone photo stays 12 MP inside the PDF. Nothing is downsampled to a preview resolution, so zooming into the exported page shows the same detail you'd see zooming into the original picture.",
  },
  {
    h: "Works on your phone",
    p: "The whole tool is a web page, so you can take photos with your phone camera and turn them into a PDF on the same phone, in the same browser session. No app to install, no camera-roll permission dance — pick the pictures from the standard file chooser and tap Create PDF.",
  },
];

const scenarios = [
  {
    h: "Photographed documents for portals that only accept PDF",
    p: "Job applications, university admissions and KYC forms typically insist on PDF uploads and reject standalone JPGs. Snap each page of your ID or transcript, arrange the shots here and export a single PDF that the portal will actually accept — no need to find a scanner or a print shop.",
  },
  {
    h: "Handwritten notes or assignments as one file",
    p: "Multi-page handwritten homework, meeting notes or a whiteboard photo series turns into a mess when uploaded as seven separate JPGs. Combining them into one PDF gives your professor, teammate or client a single tidy attachment that opens and prints in the right sequence.",
  },
  {
    h: "Receipt and bill bundles for expense reports",
    p: "Finance teams usually want expenses submitted as one PDF per trip or per month, not a folder of receipt photos. Drop every receipt shot into the workspace, choose A4 so all pages match, and export a single expense PDF you can attach to the reimbursement form.",
  },
  {
    h: "Certificates and IDs bundled into a proper document",
    p: "Scanned copies of a passport, degree certificate or address proof are often required together for visa or bank paperwork. Group all the pictures into one document with Fit to image so each certificate keeps its own page, and hand over a single professional-looking file instead of a zip of loose photos.",
  },
];

const faqs = [
  {
    q: "How do I convert JPG to PDF for free?",
    a: "Open this page, click Select images and pick your JPG (or PNG) files, then choose a page setup on the right — Fit to image, A4 or Letter with an orientation and margin. Click Create PDF and a single file named images.pdf downloads to your device. There is no account, no card and no watermark added to the output.",
  },
  {
    q: "Can I combine multiple images into one PDF?",
    a: "Yes — that's the point of the tool. Every image you add becomes one page in the same PDF, and they appear in the exact order shown in the thumbnail grid: the first tile is page one, the last tile is the final page. Use Add more to keep appending pictures until the batch is complete, then export.",
  },
  {
    q: "What image formats are supported?",
    a: "JPG and PNG. The file picker accepts image/jpeg and image/png specifically. Formats like HEIC, WebP, TIFF and GIF are not accepted here — if your phone shoots in HEIC, share the pictures out as JPG first (most phones offer this automatically when you export or attach them).",
  },
  {
    q: "Can I change the order of images before converting?",
    a: "Yes. Every thumbnail carries a ⋮⋮ drag handle at the top — press it and drag the tile to a new position in the grid, and the surrounding pictures slide out of the way to make room. The drag interaction has a dedicated touch sensor with a short press-and-hold, so reordering works on a phone as well as with a mouse. Whatever order you leave the grid in is the order the pages will appear in the exported PDF. You can also remove any picture with the small × on its tile.",
  },
  {
    q: "Will my photos lose quality?",
    a: "No. Each picture is embedded at its full original pixel dimensions — a 4032×3024 photo stays 4032×3024 inside the PDF. The tool does re-encode JPG input into PNG data before embedding (that's what pdf-lib needs), and PNG is a lossless format, so no additional compression artifacts are introduced during that step.",
  },
  {
    q: "Do my photos get uploaded to a server?",
    a: "No. The images are read, decoded and packaged into the PDF entirely inside your browser tab; no upload, no temporary server-side copy, no queue. Once this page has finished loading, the actual conversion step keeps working even if you disconnect from the internet.",
  },
  {
    q: "Can I convert photos to PDF on my phone?",
    a: "Yes, and it is by far the most common use of this tool. On a phone, tapping Select images opens your standard photo picker so you can choose shots straight from the camera roll, and Create PDF hands the file back through your browser's normal download flow. No app install and no permission grants beyond picking the pictures themselves.",
  },
  {
    q: "How do I make all pages the same size?",
    a: "Switch Page size from Fit to image to A4 or Letter. Every page in the exported PDF then uses the same standard sheet dimensions, with your chosen orientation, and each picture is centered inside its page with the margin you set. Fit to image, in contrast, gives every page a different size that matches its own photo.",
  },
  {
    q: "Can I convert PNG screenshots to PDF?",
    a: "Yes. PNG is one of the two formats the file picker accepts, so screenshots taken on Windows, macOS, iOS or Android drop in the same way phone photos do. A screenshot's transparency, if any, is preserved during embedding but PDF viewers typically render the transparent area as white.",
  },
  {
    q: "How do I do the reverse — PDF to images?",
    a: (
      <>
        Use the reverse tool: <Link to="/tools/pdf-to-images" className="text-[#e5322d] underline">PDF to Image</Link>. It renders each page of a PDF as a JPG or PNG file at a resolution you choose. Everything happens in the browser there too, so the PDF you're extracting from never leaves your device.
      </>
    ),
  },
];

const faqsPlain = faqs.map((f) => ({
  q: f.q,
  a: typeof f.a === "string"
    ? f.a
    : "Use the reverse tool: PDF to Image (/tools/pdf-to-images). It renders each page of a PDF as a JPG or PNG file at a resolution you choose. Everything happens in the browser there too, so the PDF you're extracting from never leaves your device.",
}));

const related = [
  { to: "/tools/scan-to-pdf", name: "Scan to PDF", blurb: "Use your phone camera as a guided scanner — better than raw photos when the source is a flat document." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "The reverse direction — turn each PDF page back into a JPG or PNG image." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Already have a PDF and want to add photos to the end? Convert the images here, then merge." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink the PDF after converting photos — high-resolution phone shots make big files." },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Fix the sequence of the exported PDF by dragging pages into the order you want." },
] as const;

export function ImagesToPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Photos never leave your device", "Combine many images into one PDF", "Free, no signup, no watermark"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to convert images to PDF online for free
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

      {/* Photos of documents */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Turn photos of documents into one clean PDF
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        You photograph a form, a certificate or a page of handwritten notes with
        your phone — and then the portal, the recruiter or your accountant asks
        for ONE PDF, not seven separate photos. That's the exact gap this tool
        closes. Drop every picture into the workspace, arrange them so page one
        comes first, pick a page setup (Fit to image keeps each picture edge-to-edge;
        A4 or Letter makes every page a standard sheet), and hit Create PDF —
        out comes a single, tidy document you can attach anywhere PDFs are
        accepted.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        A couple of honest photo tips make a big difference: shoot the page
        straight-on rather than at an angle, and take the picture in even light
        without your shadow falling across the paper — you'll get sharper text
        and truer colors, and the exported PDF looks like a scan rather than a
        snapshot. If you want an even cleaner result with automatic edge
        detection and perspective correction,{" "}
        <Link to="/tools/scan-to-pdf" className="text-[#e5322d] underline">
          Scan to PDF
        </Link>{" "}
        walks your camera through a guided capture flow built for flat
        documents.
      </p>

      {/* Privacy */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private conversion, your photos stay on your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Photos are personal. Pages of your passport, a snap of a signed loan
        form, handwritten notes with names and phone numbers on them — that's
        the sort of thing people run through image-to-PDF converters every day.
        Most converter sites take every picture you drop and upload the raw
        files to their own servers before handing back a PDF, which quietly
        moves the privacy problem instead of solving it.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool doesn't do that. Each image is decoded, embedded and stitched
        into the PDF entirely inside your browser tab, so none of the source
        pictures — and none of the finished document — is ever transmitted to
        us. Once the page has loaded, the conversion step even keeps running
        offline if the network drops.
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
        When do you need to convert images to PDF?
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

export const imagesToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqsPlain.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const imagesToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert images to PDF online for free",
  description:
    "Combine JPG and PNG images into a single PDF entirely inside your browser — pick a page setup, choose a margin and download the finished file. No upload, no signup, no watermark.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "One or more JPG or PNG images" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Images to PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/images-to-pdf#step-${i + 1}`,
  })),
};

export const imagesToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Images to PDF",
  description:
    "Convert JPG and PNG images into one PDF online free — combine many pictures into a single document with your choice of Fit-to-image, A4 or Letter page size. Runs entirely in the browser, no upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
