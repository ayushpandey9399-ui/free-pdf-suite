import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const scanToPdfRelated = [
  { to: "/tools/images-to-pdf", name: "Image to PDF", blurb: "Convert JPG or PNG images into a single PDF." },
  { to: "/tools/pdf-to-images", name: "PDF to Image", blurb: "Export each page as a high-quality JPG or PNG." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Shrink file size while keeping the best possible quality." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert to black and white for cheaper printing." },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Turn pages 90, 180 or 270 degrees, one page or all." },
  { to: "/tools/crop", name: "Crop PDF", blurb: "Trim margins and adjust the visible area of pages." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
] as const;


export function ScanToPdfSeo() {
  return (
    <div className="mx-auto mt-16 max-w-3xl space-y-12 text-[15px] leading-relaxed" style={{ color: "#33333c" }}>
      {/* Benefit strip */}


      <section>
        <h2 className="text-2xl font-bold" style={{ color: "#33333c" }}>
          How to scan a document to PDF with your phone
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6">
          <li>
            Tap <strong>Open Camera</strong>. Your browser will ask permission the first
            time, allow it so the live preview can appear.
          </li>
          <li>
            Frame the page and tap the round red <strong>capture button</strong>. The shot
            appears in the thumbnail strip; repeat for as many pages as you need. Use the{" "}
            <strong>flip icon</strong> (top right) if you'd rather use the front camera.
          </li>
          <li>
            Wrong shot? Tap the small <strong>×</strong> on any thumbnail to remove it and
            capture again. When the pages look right, tap <strong>Done</strong>.
          </li>
          <li>
            Pick a filter, <strong>Document</strong> (auto-levelled, recommended),{" "}
            <strong>Grayscale</strong>, <strong>Black &amp; White</strong>, or{" "}
            <strong>Original</strong>, choose <strong>A4 / Letter / Fit</strong>, drag
            thumbnails to reorder, then press <strong>Create PDF</strong> and download.
          </li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold">No scanner? No app? No problem.</h2>
        <p className="mt-3">
          Traditional scanner apps demand an install, a signup, and often a monthly
          subscription just to save a JPEG. Several of them quietly upload every page you
          capture to a cloud you didn't sign up for, buried in a paragraph of the terms.
          This scanner runs entirely inside your browser tab. Open the page, allow the
          camera, tap capture for each sheet, tap Create PDF, and download the result.
          Close the tab and the whole thing is gone, no leftover app on your home screen,
          no account to delete, no images sitting on someone else's server.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Clean, flat, readable, even from a phone photo</h2>
        <p className="mt-3">
          Real receipts are crooked, real prescriptions have a shadow across the middle,
          real ID copies were taken under a warm overhead bulb. The per-page editor
          handles all of it in the browser: a straighten slider (with auto-zoom, so no
          white corners ever creep in) fixes a tilted capture, a one-click shadow removal
          flattens uneven lighting by estimating the background and dividing it back out,
          and the Black &amp; White filter uses adaptive Sauvola thresholding so text
          stays readable even in the shadowed half of a page. Brightness and contrast
          sliders sit right there for the last mile, and press-hold Compare to see the
          original photo before you commit.
        </p>
      </section>



      <section>
        <h2 className="text-2xl font-bold">The private scanner in your pocket</h2>
        <p className="mt-3">
          Look at what people actually reach for a scanner to capture: Aadhaar cards, PAN
          cards, passports, signed rental agreements, cheques, medical prescriptions.
          Those pages are exactly the ones that should never touch an unknown server. Here
          the camera feed and every captured frame live only in your browser's memory on
          your own phone, nothing is uploaded, not even a thumbnail. When the scan is
          ready, pair it with the other privacy tools before you send it off: write the
          purpose across an ID copy with{" "}
          <Link to="/tools/$slug" params={{ slug: "watermark" }} className="font-semibold underline" style={{ color: "#e5322d" }}>
            Watermark PDF
          </Link>{" "}
          ("For KYC only, 12 Aug"), then wrap it in a password using{" "}
          <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="font-semibold underline" style={{ color: "#e5322d" }}>
            Protect PDF
          </Link>{" "}
          before it leaves your device.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold">Multi-page documents</h3>
          <p className="mt-1 text-sm">
            Tap capture for page one, flip to page two, capture again, the numbered
            thumbnail strip grows with every shot. When you press Done, all pages arrive
            in one PDF in the order you captured them.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Retake until it's right</h3>
          <p className="mt-1 text-sm">
            Blurry, cropped short, or caught mid-shadow? Hit the × badge on the thumbnail
            to drop that frame and re-shoot the same page. Nothing is committed to a PDF
            until you press Create PDF at the end.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Works on any phone</h3>
          <p className="mt-1 text-sm">
            Android or iPhone, Chrome or Safari, the tool uses the browser's built-in
            camera API, no app-store visit required. If a device exposes both a rear and
            front lens, a flip button appears automatically.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-bold">Straight into your workflow</h3>
          <p className="mt-1 text-sm">
            The output is a real PDF you can immediately feed into the rest of the site , 
            compress it for an upload limit, watermark an ID copy, or e-sign a scanned
            agreement without ever leaving the browser.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Tips for scans that look professionally done</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Fill the frame with the page and shoot straight down, not at an angle, a
            square-on capture keeps text lines parallel instead of trapezoidal.
          </li>
          <li>
            Use bright, even daylight and step to the side so your own shadow doesn't fall
            across the paper. Overhead room light plus daylight from a window is ideal.
          </li>
          <li>
            Lay the page on a dark, contrasting surface (a wooden desk, a dark tablecloth)
            so the paper edges stand out cleanly instead of blending into a white table.
          </li>
          <li>
            Hold steady for a beat after you tap capture, phones keep processing for a
            fraction of a second, and moving early is the number-one cause of soft text.
          </li>
          <li>
            Want that clean photocopier look? Use the <strong>Document</strong> filter, or
            run the finished PDF through{" "}
            <Link to="/tools/$slug" params={{ slug: "grayscale-pdf" }} className="font-semibold underline" style={{ color: "#e5322d" }}>
              Grayscale PDF
            </Link>{" "}
            to strip the paper's yellow tint.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">When do you need to scan to PDF?</h2>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-bold">Submitting IDs and certificates to online portals</h3>
            <p className="mt-1 text-sm">
              College admission forms, job applications, KYC uploads, government portals , 
              most accept a PDF but reject a phone photo. Scan the physical certificate
              once and you have a submission-ready file.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Digitising signed agreements and receipts</h3>
            <p className="mt-1 text-sm">
              Rental agreements, freelance contracts, insurance forms, hotel bills, scan
              them the moment they're signed so a searchable digital copy exists before
              the paper gets lost in a drawer.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Sending homework and forms when there's no scanner</h3>
            <p className="mt-1 text-sm">
              Handwritten assignments, permission slips, a doctor's form to email back , 
              tasks that used to require finding an office multi-function printer are a
              two-minute job with a phone and this page.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold">Archiving paper before it fades</h3>
            <p className="mt-1 text-sm">
              Warranty cards, medical prescriptions, thermal-printer bills that go blank
              in a year, a quick scan today saves the information forever, filed on your
              own drive instead of a shoebox.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Make the PDF searchable (OCR, beta)</h2>
        <p className="mt-3">
          Turn on the Searchable PDF toggle before you press Create PDF and each
          page is read by an in-browser text engine. The output looks identical,
          the pages are still your photos, but an invisible text layer sits
          underneath so you can select, copy, and Ctrl+F search the words. The
          engine downloads to your browser the first time you enable it and
          reads every page on your device. Nothing is uploaded. Best on clear
          printed text; handwriting is not supported in this beta.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          {scanToPdfFaq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold">{f.q}</h3>
              <p className="mt-1 text-sm" style={{ color: "#4a4a55" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Related PDF tools</h2>
        <RelatedToolsGrid items={scanToPdfRelated} />
      </section>

    </div>
  );
}

const scanToPdfFaq = [
  {
    q: "How do I scan a document to PDF without an app?",
    a: "Open this page in any modern browser on your phone, tap Open Camera, allow the camera permission, tap the round capture button for each page, then tap Done and Create PDF. Nothing is installed and there's no signup.",
  },
  {
    q: "Are my scans uploaded anywhere?",
    a: "No. The camera feed and every captured frame stay in your browser's memory on your own device. There is no server, no cloud storage, and no analytics call carrying image data, closing the tab wipes everything.",
  },
  {
    q: "Why does the site ask for camera permission?",
    a: "Browsers require your explicit permission before any page can show a live camera preview, that's a security rule, not a data collection ask. The camera is only used while you're actively scanning in this tab, and the stream stops the moment you leave the capture screen.",
  },
  {
    q: "Can I scan multiple pages into one PDF?",
    a: "Yes. Every tap of the capture button adds another page to the numbered thumbnail strip. Press Done when you're finished and every page is bundled into a single PDF in the order you shot them.",
  },
  {
    q: "Can I retake a page that came out blurry?",
    a: "Yes. Tap the small × badge on the offending thumbnail to remove it, then capture the same page again. Nothing is committed until you press Create PDF at the end, so retakes cost nothing.",
  },
  {
    q: "Does it work on iPhone and Android?",
    a: "Yes, the tool uses the standard getUserMedia camera API supported by Safari on iOS and Chrome / Firefox / Samsung Internet on Android. If your device has both a rear and front camera, a flip button appears automatically in the top corner of the preview.",
  },
  {
    q: "Does it work on a laptop or desktop?",
    a: "Yes. If your computer has a webcam, the same Open Camera flow will use it. A rear phone camera is far better for document capture, but a laptop webcam is a workable fallback, or use the 'upload photos instead' link to attach existing images.",
  },
  {
    q: "How do I make the scan smaller for upload limits?",
    a: "Run the finished PDF through Compress PDF. Multi-page phone scans are image-heavy, so recompression typically cuts the file by 60 to 80% while staying readable at screen size.",
  },
  {
    q: "How do I protect a scanned ID before sharing?",
    a: "Two quick steps. Add a purpose watermark with Watermark PDF ('For loan application, 12 Aug') so a leaked copy can't be reused elsewhere, then wrap the file in a password with Protect PDF so only the intended recipient can open it.",
  },
  {
    q: "Is there OCR? Can it read the text on the scan?",
    a: "Yes, in beta. Enable Make PDF searchable (OCR) in the sidebar before you press Create PDF. The pages still look like your photos, but an invisible text layer sits underneath so text is selectable and searchable. English only for now; handwriting is not supported.",
  },
  {
    q: "Can it make the PDF searchable?",
    a: "Yes, in beta. Turn on Make PDF searchable (OCR) in the sidebar before you press Create PDF. Each page is read by an in-browser text engine and an invisible text layer is placed under the image, so the file looks identical and you can select, copy, and Ctrl+F search the text. Best on clear printed text; handwriting is not supported yet.",
  },
  {
    q: "Does OCR upload my document?",
    a: "No. When you enable OCR the first time, the text engine downloads to your browser once (about 11 MB) and then reads every page on your device. Your files never leave the tab. Turn the toggle off any time and the PDF is exported without a text layer.",
  },
  {
    q: "My photo is crooked or has a shadow across it. Can the tool fix that?",
    a: "Yes. Open the page in the editor (crop icon on the thumbnail) and use the straighten slider to level a tilted capture, the Remove shadow toggle to flatten uneven lighting, and the Black & White filter for a clean scanned look on receipts and forms. Brightness and contrast sliders let you fine-tune before you commit.",
  },
];


export const scanToPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: scanToPdfFaq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const scanToPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to scan a document to PDF with your phone",
  step: [
    { "@type": "HowToStep", name: "Open the camera", text: "Tap Open Camera and allow the browser's camera permission when prompted." },
    { "@type": "HowToStep", name: "Capture each page", text: "Frame the page and tap the round red capture button. Repeat for every page you want in the PDF." },
    { "@type": "HowToStep", name: "Retake or reorder", text: "Tap the × on any thumbnail to remove a bad shot, then drag thumbnails to reorder. Tap Done when finished." },
    { "@type": "HowToStep", name: "Create the PDF", text: "Pick a filter (Document is recommended), choose A4 / Letter / Fit, then press Create PDF and download." },
  ],
};

export const scanToPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Scan to PDF",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
