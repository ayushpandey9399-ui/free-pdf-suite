import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF you need to redact",
    text: "Drop the file into the browser or click Select PDF file. Every page is rendered inside the tab so you can see exactly what has to be blacked out, the document is not sent anywhere at any point.",
  },
  {
    title: "Draw a black box over anything sensitive",
    text: "Click and drag on any page to draw a redaction box over an Aadhaar number, an account number, a photograph, a signature or a whole paragraph. Boxes can be dragged into position or resized from the corners, and you can add as many as the document needs across as many pages as you want.",
  },
  {
    title: "Optional: find and redact by text",
    text: "Type a phrase such as an email address, a phone number or an account number into the Find field and press Enter. The tool locates every occurrence across all pages using the PDF's text layer and adds a redaction box on top of each one, so you never miss a hit.",
  },
  {
    title: "Click Redact PDF and download",
    text: "The affected pages are re-rendered as flat images with the black rectangles baked in, unedited pages are copied through untouched, and the document's metadata (title, author, subject, keywords, creator, producer) is cleared before saving. The redacted PDF downloads straight to your device.",
  },
];

const benefits = [
  {
    h: "Your documents never leave your device",
    p: "Redaction is used on the most private files people own, ID scans, bank statements, medical reports, salary slips, legal contracts. This tool opens, edits and saves those files entirely inside your browser using pdf.js and pdf-lib; nothing about the original document, the redaction boxes or the finished file is transmitted or stored on our side.",
  },
  {
    h: "Redact anything on any page",
    p: "A redaction box is just a rectangle you draw, so it works for text, numbers, embedded photos, signatures, watermarks, tables and whole paragraphs alike. There is no cap on how many boxes you can add or how many pages they can cover, a single ID card or a 200-page contract are both fair game.",
  },
  {
    h: "Metadata cleaned too",
    p: "Sensitive PDFs often carry hidden metadata, the original filename, the author, the software that produced them, sometimes the original document title. The redacted output has all of that cleared, so a nosy inspector cannot open File > Properties and learn something the redaction bars were supposed to hide.",
  },
  {
    h: "Untouched pages stay crisp",
    p: "Only the pages you actually drew on are re-rendered as images at 2× resolution and re-embedded. Every other page is copied through byte-for-byte, so their text stays selectable, their fonts stay sharp and their file size stays small. You do not pay a quality penalty on pages you never touched.",
  },
];

const scenarios = [
  {
    h: "Aadhaar and PAN numbers on ID proofs",
    p: "Rental agents, courier partners, hotels and small businesses routinely ask for an ID copy, and often they only need proof of identity, not the full number. Black out the first 8 digits of your Aadhaar and mask the PAN before you send the copy over WhatsApp, email or a portal.",
  },
  {
    h: "Bank statements shared for verification",
    p: "Loan brokers, landlords and visa applications sometimes want a bank statement to confirm salary or balance, but not the individual transactions. Redact the account number, the transaction table or specific merchant lines and share a statement that still proves what the reviewer actually needs.",
  },
  {
    h: "Personal details on documents posted publicly",
    p: "If you are uploading a resume, a certificate or a court order to a public page, a blog, a legal filing, a support forum, the phone number, home address and email are usually the parts you do not want indexed. A quick redaction pass removes them before the file goes live.",
  },
  {
    h: "Confidential clauses and prices in contracts",
    p: "When a contract, quote or SOW has to be shared with a third party, a lawyer, an auditor, a new supplier, specific clauses, pricing tables or client names often need to stay confidential. Draw boxes over those sections so the reviewer sees the structure without the numbers.",
  },
];

const faqs = [
  {
    q: "Does redaction really delete the text, or just hide it?",
    a: "It really deletes it. When you click Redact PDF, every page with a box on it is re-rendered as a flat image with the black rectangles painted in, and that image replaces the original vector page in the output PDF. The characters that used to sit under the box are not in the file any more, they were dropped when the page became an image. You can verify this yourself: open the redacted file in our PDF to Text tool and confirm the redacted words do not appear in the extracted text.",
  },
  {
    q: "Can someone remove the black box and see the text?",
    a: "No. In many other tools, a black rectangle is just an annotation drawn on top of the original page, so deleting the annotation reveals the text again. Here, the redacted pages are re-rendered as images, so there is no text object left underneath, there is nothing to reveal, no matter what software the recipient opens the file in.",
  },
  {
    q: "How do I hide my Aadhaar number in a PDF?",
    a: "Open the Aadhaar PDF here and draw a black box over the first 8 digits of the number, leaving only the last 4 visible, that matches how UIDAI defines a masked Aadhaar. Do this on the front side and the back side wherever the full number appears, then click Redact PDF. The output is a safely masked Aadhaar copy you can share with couriers, hotels and businesses, and your Aadhaar was never uploaded to any server in the process.",
  },
  {
    q: "Is it safe to redact bank statements online?",
    a: "It is safe here because the statement never leaves your browser. Most online redaction sites upload the entire PDF to a server, redact it there and hand you back a download link, meaning a full copy of your bank statement has already left your machine. This tool opens the file locally, applies the redactions locally and saves the output locally; the statement bytes are never sent anywhere.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The PDF is loaded into your browser's memory, every page is rendered on a local canvas, the redactions are painted on that canvas and the result is assembled into a new PDF entirely in the tab. Nothing about the original file, the redaction coordinates or the finished output is transmitted to us.",
  },
  {
    q: "Can I redact multiple areas and multiple pages?",
    a: "Yes. Draw as many boxes as you need on any page, a single page can hold one box or a hundred, and every page in the document can have redactions. You can also use the Find feature to type a phrase (an email, an account number, a name) and have a box added automatically over every occurrence across the whole file.",
  },
  {
    q: "Will the rest of my document lose quality?",
    a: "Only the pages you actually drew a box on are re-rendered, those pages are exported as high-quality JPEG images at 2× resolution, which keeps text and diagrams sharp for on-screen reading and normal printing. Every page you left untouched is copied through byte-for-byte from the original, so its vector text, fonts and file size are exactly the same as before.",
  },
  {
    q: "Can I still select text on redacted pages?",
    a: "No, and that is the point. The pages that carry redactions are turned into images, which is precisely what makes the redaction permanent (there is no text object left to select or copy). Pages without any redactions still have fully selectable text. If keeping the text layer everywhere matters more than removing the sensitive content, you probably want a different tool.",
  },
  {
    q: "What's the difference between redacting and deleting a page?",
    a: "Redacting hides specific areas, words, numbers, photos, while keeping the rest of the page intact and in place. Deleting removes an entire page from the document. If the sensitive content is one line of an otherwise useful page, redact it here; if a whole page has to go, use the Delete Pages tool instead.",
  },
  {
    q: "Do I need Adobe Acrobat to redact a PDF?",
    a: "No. Adobe Acrobat's redaction feature is only in the paid Pro edition. This tool is free, runs in the browser, produces a genuinely redacted PDF (re-rendered pages, no recoverable text) and strips document metadata, everything you would expect from a proper redaction workflow, without a subscription.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password so the PDF opens freely." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/compare", name: "Compare PDFs", blurb: "See the differences between two versions side by side." },
] as const;

export function RedactPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to redact a PDF online for free
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

      {/* True redaction */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Real redaction, not just a black box
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This is the part almost every online tool gets wrong. In the usual PDF editor, drawing a black rectangle
        over sensitive text only covers it visually, the underlying characters remain inside the file as regular
        text objects. Anyone who opens the PDF can select the covered area, copy the text out, or run the file
        through any text extractor and see everything the black bar was supposed to hide. That is not redaction;
        it is a cover-up that fools no one.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool works differently. Every page you drew on is re-rendered as a flat image with the black
        rectangles painted directly onto the pixels, and that image replaces the original vector page in the
        output PDF. The characters that used to sit under the box are not in the file any more, and the document's
        metadata, title, author, producer, keywords, is cleared at the same time so nothing sensitive leaks
        through the properties dialog either.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Do not take our word for it. Run the redacted file through our{" "}
        <Link to="/tools/$slug" params={{ slug: "pdf-to-text" }} className="font-semibold text-[#e5322d] underline underline-offset-2">
          PDF to Text
        </Link>{" "}
        tool and search for the words you blacked out, they will not appear. That is what permanently remove
        text from PDF actually looks like.
      </p>

      {/* Aadhaar / India */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Hide your Aadhaar number in a PDF (masked Aadhaar)
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        UIDAI defines a masked Aadhaar as a copy where only the last 4 digits of the 12-digit number are visible
        and the first 8 digits are hidden. Sharing the masked version instead of the full Aadhaar is now the
        recommended practice for hotels, couriers, rental agents, telecom stores and most private businesses that
        ask for ID, the last 4 digits are enough for their verification, and giving them the full number
        exposes you to misuse.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        With this tool, open your Aadhaar PDF, draw a black box over the first 8 digits everywhere the number
        appears (both the front and the back), and download a safely masked Aadhaar copy, without uploading your
        Aadhaar to any third-party server. You can also mask the parent's name, the address block or the QR code
        in the same pass if the recipient does not need them. The same workflow works on a PAN card (hide the
        middle digits of the PAN), a passport (hide the passport number or the date of birth) or a driving
        licence.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Honest tip: UIDAI's official myaadhaar portal (myaadhaar.uidai.gov.in) also lets you download a masked
        Aadhaar directly, and that is the most authoritative option when you are starting from scratch. This
        tool is the right pick when you already have the PDF in front of you, or when you need to mask more than
        just the number, an address, a photograph or a specific field the official portal does not let you
        touch.
      </p>

      {/* Four benefit sections */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {benefits.map((b) => (
          <div key={b.h}>
            <h3 className="text-[17px] font-semibold">{b.h}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a4a55]">{b.p}</p>
          </div>
        ))}
      </div>

      {/* Scenarios */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        What should you redact before sharing a document?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h2>
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

export const redactFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const redactHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to redact a PDF online for free",
  description:
    "Permanently black out sensitive text, numbers or images in a PDF using an in-browser redaction tool, the redacted pages are re-rendered so the hidden content is truly removed, not just covered.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF containing sensitive content to remove" }],
  tool: [{ "@type": "HowToTool", name: "pdftoolconverteronline.com Redact PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/redact-pdf#step-${i + 1}`,
  })),
};

export const redactSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Redact PDF",
  description:
    "Redact PDF online free, permanently black out Aadhaar numbers, account details and other sensitive content in your browser. Redacted pages are re-rendered so removed text cannot be recovered.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
