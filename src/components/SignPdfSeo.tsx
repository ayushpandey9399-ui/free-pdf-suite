import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";


const steps = [
  {
    title: "Open your PDF",
    text: "Drop the contract, offer letter or agreement into the browser, or click Select PDF file to pick it. The document is opened locally — it is never uploaded to a server at any point.",
  },
  {
    title: "Create your signature",
    text: "Choose Draw to sign with your mouse or finger, Type to render your name in a handwritten font, or Upload to bring in a PNG or JPG photo of your ink signature. You can create an Initials mark alongside the main signature.",
  },
  {
    title: "Place it on the document",
    text: "Click Place on document to drop your signature on the current page, then click any other page to drop another copy — as many placements as your contract needs. Drag any placement to reposition it, use the corner handle to resize, or click × to remove one.",
  },
  {
    title: "Click Sign PDF and download",
    text: "The signatures are flattened onto the pages in your browser and the finished document is offered for download. Nothing is uploaded, nothing is stored — the signed file only exists on your device.",
  },
];

const benefits = [
  {
    h: "Three ways to create your signature",
    p: "Draw naturally with a mouse or finger, type your name in a choice of handwritten fonts, or upload a PNG or JPG photo of your real ink signature. Pick whichever method feels closest to how you normally sign.",
  },
  {
    h: "Place multiple signatures anywhere",
    p: "Every agreement is different — some need one signature, some need a signature on every page plus initials in the margin. Drop as many placements as you need on any pages, drag them into position and resize with the corner handle.",
  },
  {
    h: "Sign on your phone",
    p: "The draw pad works with touch, so you can sign with your finger straight on the screen — handy when a signature is needed urgently and there is no desk or printer nearby. Works in any modern mobile browser on Android and iPhone.",
  },
  {
    h: "Free and unlimited",
    p: "There are no per-document fees, no monthly plans and no signature quotas. Sign as many PDFs as you like, place as many signatures per document as you need, and download the finished file with no watermark added.",
  },
];

const scenarios = [
  {
    h: "Offer letters and HR documents",
    p: "Returning a signed offer letter, joining kit or NDA the same hour makes a real difference during hiring. Signing on-screen skips the print-sign-scan loop and gets the countersigned PDF back into the recruiter's inbox immediately.",
  },
  {
    h: "Rent agreements and vendor contracts",
    p: "Landlords, agencies and small suppliers usually accept an electronically signed PDF as a first-round acceptance while paperwork is finalised. Signing in the browser lets you countersign and forward a rent agreement or vendor contract in minutes instead of a day.",
  },
  {
    h: "Application and consent forms",
    p: "Bank forms, school consent slips, medical intake sheets and government applications almost always end with a signature line. Sign the downloaded PDF in place instead of printing a single page just to sign it and scan it back.",
  },
  {
    h: "Freelance approvals and quotes",
    p: "Signing off on a quote, statement of work or delivery note before invoicing keeps the paper trail tidy without ever leaving your desk. Add your initials in the margin and your full signature at the bottom in the same step.",
  },
];

const faqs = [
  {
    q: "How can I sign a PDF for free without Adobe?",
    a: "Open the PDF here, create your signature by drawing, typing or uploading a photo of your handwritten one, place it on the document and click Sign PDF. There is no Adobe Acrobat, no paid installer and no signup — the free PDF signer runs entirely in your browser.",
  },
  {
    q: "Is it safe to sign contracts online here?",
    a: "Yes. The contract is opened, signed and saved on your own device through client-side processing — the file is never uploaded and your signature is never sent to a server. That makes it a fit for sensitive documents like NDAs, employment agreements and vendor contracts.",
  },
  {
    q: "Can I add my signature to multiple pages?",
    a: "Yes. After you click Place on document, click any other page to drop another copy of your signature there — you can add as many placements as your contract needs. The same works for initials, so you can add an initials mark to every page and a full signature only on the last one.",
  },
  {
    q: "Can I sign a PDF on my phone?",
    a: "Yes. The draw pad is touch-enabled, so you can sign with your finger on an Android or iPhone browser. No app install and no permissions are needed — just open the page, sign and download.",
  },
  {
    q: "Is an electronic signature legally valid?",
    a: "Electronic signatures are recognised for most everyday agreements in many countries — for example under the E-SIGN Act in the United States, eIDAS in the European Union and the Information Technology Act in India — as long as both parties intended to sign. Requirements vary by document type and jurisdiction, and some filings (property transfers, wills, certain government submissions) still need a specific format. For any critical document, confirm with your recipient what they will accept. This is general information, not legal advice.",
  },
  {
    q: "Do you store my signature?",
    a: "No. Your signature exists only in the current browser session — nothing is stored on our servers, nothing is transmitted and nothing is remembered between visits. Close the tab and the signature is gone.",
  },
  {
    q: "Can I upload an image of my handwritten signature?",
    a: "Yes. On the Upload tab you can pick a PNG or JPG of your signature and place it on the document. A PNG with a transparent background works best because it drops cleanly onto the page; a photo on white paper is fine too but the paper background will be visible around the strokes.",
  },
  {
    q: "Can I add initials as well as a signature?",
    a: "Yes. The sidebar has a separate Initials mode alongside Signature, each with its own draw/type/upload input. You can place both on the same document — for example initials on every page plus your full signature at the end.",
  },
  {
    q: "How do I make the signature background transparent?",
    a: "The Draw and Type modes produce a transparent PNG automatically, so they always drop cleanly onto the page. For Upload, use a PNG that already has a transparent background — a JPG or photo of paper will keep its white background around the signature, so remove that background first if it matters.",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no signup, no email required and no watermark added to the signed file. Every tool on PDFfree is free to use as often as you like.",
  },
];

const related = [
  { to: "/tools/fill-forms", name: "Fill PDF Forms", blurb: "Type into form fields before adding your signature." },
  { to: "/tools/flatten", name: "Flatten PDF", blurb: "Lock filled fields and signatures so they cannot be edited." },
  { to: "/tools/protect", name: "Protect PDF", blurb: "Add a password before sending the signed contract." },
  { to: "/tools/edit", name: "Edit PDF", blurb: "Add text or notes to the document before signing." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine the signed contract with annexures into one file." },
];

export function SignPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Documents never leave your device", "Draw, type, or upload your signature", "Free, no signup, no watermark"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to sign a PDF online for free
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

      {/* Without Acrobat / printing */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Sign a PDF without Adobe Acrobat or printing
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        You do not need an Adobe Acrobat subscription, a scanner or even a printer to add a signature to a PDF.
        Create your signature once with the draw pad, the type styles or an uploaded image and place it wherever
        the document asks for one. Real-world agreements often need three or four signatures — one at the end, one
        or two beside specific clauses, initials in the margin — and you can drop all of them in a single pass
        instead of running the print-sign-scan loop over and over.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Because the whole flow runs in the browser, the same free PDF signer works on a laptop, a work desktop or
        a phone screen with no app to install.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        The private way to sign: your contract never leaves your device
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The documents people sign — offer letters, NDAs, rent agreements, service contracts — are often the most
        sensitive files they own. Typical e-sign services quietly upload the whole document to their servers, store
        your signature image against your account and keep a copy of the signed file. PDFfree does none of that:
        the PDF is opened, the signature is rendered onto the pages and the signed file is saved to your disk, all
        inside your browser. Neither the document nor the signature is ever transmitted or stored.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once this page has loaded you can go offline and still add a signature to a PDF. Your contract is only ever
        on your device.
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
        When do you need to sign a PDF online?
      </h2>
      <div className="mt-6 space-y-5">
        {scenarios.map((s) => (
          <div key={s.h}>
            <h3 className="text-[17px] font-semibold">{s.h}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.p}</p>
          </div>
        ))}
      </div>

      {/* Electronic vs digital signature */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Electronic signature vs digital signature, what's the difference?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool creates an electronic signature: a visual signature — drawn, typed or uploaded — placed on the
        page and saved into the PDF. Electronic signatures are what most everyday agreements, offer letters, rent
        contracts and consent forms actually need, and they are widely accepted.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        A cryptographic digital signature is a different technology — it uses a certificate issued by a certifying
        authority (for example a DSC token used for GST returns, income tax filings or MCA submissions in India, or
        a qualified certificate under eIDAS in the EU). That kind of signature proves who signed and that the file
        has not been changed since. This tool does not issue or apply those certificates. If your recipient
        specifically asks for a digitally signed or DSC-signed PDF, use the software they recommend for that filing.
      </p>

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

export const signFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const signHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to sign a PDF online for free",
  description:
    "Add a free electronic signature to a PDF in your browser — draw, type or upload your signature, place it on any page and download the signed file without uploading the document anywhere.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF that needs a signature" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Sign PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/sign-pdf#step-${i + 1}`,
  })),
};

export const signSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Sign PDF",
  description:
    "Sign PDF online free — draw, type or upload your electronic signature and place it anywhere in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
