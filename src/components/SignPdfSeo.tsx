import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the upload area. The PDF opens directly in your browser without being uploaded to any server.",
  },
  {
    title: "Create Your Signature",
    text: "Choose how you want to create your signature. You can draw it freehand using your mouse, touchpad, or finger on a touchscreen. You can type your name and select from signature-style fonts. Or you can upload an existing image of your handwritten signature saved as a PNG or JPG file.",
  },
  {
    title: "Place Your Signature",
    text: "Drag your signature to the correct position on the document. Resize it to fit the signature field. You can rotate it, adjust its opacity, and move it to any page in the document. Add initials, dates, or additional signatures to multiple pages if needed.",
  },
  {
    title: "Download Your Signed PDF",
    text: "Click the download button to save your signed PDF to your device. The signed document is ready to email, upload, print, or share immediately. The signature is permanently embedded in the PDF and cannot be moved or removed.",
  },
];

const faqs = [
  {
    q: "How do I sign a PDF online for free?",
    a: "Upload your PDF using the button or drag-and-drop above. Create your signature by drawing, typing, or uploading an image. Place it on the document and download the signed PDF. No signup or payment required.",
  },
  {
    q: "Is an electronic signature legally valid?",
    a: "Yes. Electronic signatures are legally recognized under the ESIGN Act and UETA in the United States and under eIDAS in the European Union. They are valid for most contracts, agreements, and business documents.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The signing process runs entirely in your browser. Your PDF and signature never leave your device and are never transmitted over the internet.",
  },
  {
    q: "Can I sign multiple pages in one document?",
    a: "Yes. You can add signatures, initials, and annotations to multiple pages within the same document in one session.",
  },
  {
    q: "Can I add initials as well as a full signature?",
    a: "Yes. You can create separate signature and initial placements and position them on different pages as required by the document.",
  },
  {
    q: "What file formats can I use for an uploaded signature image?",
    a: "You can upload PNG or JPG images of your signature. PNG with a transparent background gives the cleanest result.",
  },
  {
    q: "Can I sign a PDF on my phone?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. Signing by drawing with your finger on a touchscreen gives excellent results on mobile.",
  },
  {
    q: "Is there a limit to how many PDFs I can sign?",
    a: "No. You can sign as many PDFs as you need with no daily or monthly limits.",
  },
  {
    q: "Can I sign a password-protected PDF?",
    a: "Not directly. First remove the password using our <Link to='/tools/$slug' params={{ slug: 'unlock-pdf' }} className='text-[#e5322d] hover:underline'>Unlock PDF tool</Link>, then sign the document normally.",
  },
  {
    q: "Will the signature look the same on all devices?",
    a: "Yes. Once the signature is embedded and the PDF is downloaded, it looks identical in all PDF viewers on all devices.",
  },
  {
    q: "Can I add a date alongside my signature?",
    a: "Yes. Use the text tool to add a date next to your signature in the required format.",
  },
  {
    q: "Does this work offline?",
    a: "Yes. Once the page has fully loaded, the PDF signer works without an internet connection.",
  },
  {
    q: "Can I remove or change the signature after saving?",
    a: "No. Once the signed PDF is downloaded, the signature is permanently embedded. To change it, upload the original unsigned version and sign again.",
  },
  {
    q: "Is the signature watermark-free?",
    a: "Yes. The signed PDF has no watermarks or branding added.",
  },
  {
    q: "What is the difference between this tool and DocuSign or Adobe Sign?",
    a: "This tool is for adding your own signature to your own documents. DocuSign and Adobe Sign are platforms for requesting signatures from other people and managing multi-party signing workflows. If you just need to sign a document yourself, this tool is faster and completely free.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Password-protect your signed document." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Permanently embed the signature." },
  { to: "/tools/fill-forms", name: "Fill PDF Forms", blurb: "Fill form fields before signing." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Add text and annotations before signing." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce signed PDF file size." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password before signing." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine signed documents." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Remove sensitive info before signing." },
] as const;

export function SignPdfSeo() {
  return (
    <div className="seo-content container mx-auto px-4 py-12 text-[#383E45]">
      {/* SECTION A */}
      <section className="mb-12">
        <h3>Why Sign PDFs Electronically Instead of Printing?</h4>
        <p>The traditional process of signing a document involves printing it, signing it by hand, scanning it back into your computer, and emailing the scanned copy. This process wastes paper, takes 10-15 minutes per document, requires a printer and scanner, and produces a lower quality image than the original. Electronic signatures solve all of these problems simultaneously. You upload the PDF, add your signature, and download the signed document in under a minute — no printer required.</p>
        <p>Electronic signatures are legally recognized in most countries worldwide. In the United States, the ESIGN Act (Electronic Signatures in Global and National Commerce Act) and UETA (Uniform Electronic Transactions Act) establish that electronic signatures are legally equivalent to handwritten signatures for most purposes. The European Union recognizes electronic signatures under eIDAS regulations. This means that contracts, agreements, consent forms, and most business documents signed electronically carry the same legal weight as paper signatures.</p>
        <p>For individuals, electronic signing eliminates the need to own a printer for administrative tasks. Rental agreements, employment contracts, bank forms, insurance documents, and medical consent forms can all be signed on a laptop or phone and returned within minutes. For businesses, electronic signatures speed up workflows dramatically — a contract that used to take three days to sign and return can be completed in minutes.</p>
        <p>Privacy is also a key advantage of browser-based signing. Unlike many online signing services that upload your document to their servers, our tool processes everything locally in your browser. Your signed contracts, agreements, and sensitive forms never leave your device. This is especially important for legal documents, medical forms, financial agreements, and personal identification documents that you would not want stored on a third-party server.</p>
      </section>

      {/* SECTION B */}
      <section className="mb-12">
        <h3>How to Sign a PDF Online — Step by Step</h4>
        <div className="space-y-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#E5322D] text-white font-bold" aria-label={`Step ${i + 1}`}>
                {i + 1}
              </span>
              <div>
                <h3>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION C */}
      <section className="mb-12">
        <h3>Three Ways to Create Your Signature</h4>
        <h3>Draw Your Signature</h4>
        <p>Use your mouse, trackpad, or touchscreen to draw your signature freehand directly on the screen. This produces the most natural-looking signature and most closely resembles a handwritten one. On mobile devices, drawing with your finger gives excellent results. On desktop, using a trackpad gives more control than a mouse.</p>
        <h3>Type Your Signature</h4>
        <p>Type your full name and the tool renders it in a signature-style cursive font. This is the fastest method and works well when you need a clean, consistent signature across many documents. Multiple font styles are available so you can choose one that matches your personal style.</p>
        <h3>Upload a Signature Image</h4>
        <p>If you already have a high-quality image of your handwritten signature saved as a PNG file with a transparent background, upload it directly. This method gives you the most consistent results across documents and is ideal for business use where your signature needs to match exactly.</p>
      </section>

      {/* SECTION D */}
      <section className="mb-12">
        <h3>Common Documents People Sign Online</h4>
        <h3>Employment Contracts and Offer Letters</h4>
        <p>HR departments and job candidates both benefit from electronic signing. Offer letters, employment agreements, non-disclosure agreements, and company policy acknowledgments can all be signed and returned within minutes. This speeds up onboarding and eliminates delays caused by postal mail or printing logistics.</p>
        <h3>Rental and Lease Agreements</h4>
        <p>Landlords and tenants can sign rental agreements, lease renewals, and move-in inspection forms electronically without meeting in person. This is especially useful for international tenants, remote signings, or situations where the parties are in different cities.</p>
        <h3>Service Agreements and Freelance Contracts</h4>
        <p>Freelancers, consultants, and agencies regularly need clients to sign project agreements, scope of work documents, and payment terms. Electronic signing makes it easy to send a PDF and receive a signed copy back within hours rather than days.</p>
        <h3>Bank and Financial Forms</h4>
        <p>Many banks and financial institutions now accept electronically signed forms for account changes, loan applications, and authorization documents. Signing these forms online eliminates a trip to the branch and speeds up processing.</p>
        <h3>Medical and Healthcare Consent Forms</h4>
        <p>Patient consent forms, medical history questionnaires, and healthcare authorization documents can be signed electronically before appointments. This saves time at the clinic and keeps sensitive health information on the patient's own device rather than a third-party server.</p>
        <h3>Government and Official Forms</h4>
        <p>Many government applications — including visa applications, permit requests, and business registrations — require a signed PDF submission. Electronic signing lets you complete and return these forms quickly without printing and scanning.</p>
        <h3>Real Estate Documents</h4>
        <p>Property purchase agreements, seller disclosure forms, mortgage applications, and inspection reports are commonly signed electronically in real estate transactions. Electronic signing speeds up a process that previously required multiple in-person meetings.</p>
        <h3>Academic and School Documents</h4>
        <p>Permission slips, enrollment forms, scholarship applications, and university enrollment agreements can all be signed electronically. Parents and students can sign and return forms instantly without needing to print them.</p>
      </section>

      {/* SECTION E */}
      <section className="mb-12">
        <h3>Electronic Signature vs Digital Signature — What Is the Difference?</h4>
        <p>These two terms are often used interchangeably but they refer to different things. An electronic signature is any electronic method that indicates a person's intent to agree to a document. This includes drawing your signature on screen, typing your name, clicking an \"I agree\" button, or uploading a signature image. Electronic signatures are simple, fast, and legally binding for most everyday documents.</p>
        <p>A digital signature is a specific type of electronic signature that uses cryptographic technology. It generates a unique encrypted \"fingerprint\" of the document at the moment of signing and ties it to a digital certificate that verifies the signer's identity. Digital signatures can prove that a document has not been altered since it was signed and can verify exactly who signed it.</p>
        <p>For most everyday purposes — contracts, agreements, forms, letters, and business documents — an electronic signature is fully sufficient and legally valid. Digital signatures are typically required only for high-stakes legal filings, government submissions, and financial transactions that require a certified audit trail and tamper-proof verification.</p>
        <p>Our tool creates electronic signatures that are embedded directly into the PDF. These are legally valid for the vast majority of everyday signing needs. If you require a certified digital signature with a full audit trail and identity verification certificate, you would need a dedicated e-signature platform.</p>
      </section>

      {/* SECTION F */}
      <section className="mb-12 overflow-x-auto">
        <h3>Browser-Based vs Server-Based PDF Signing</h4>
        <table className="w-full border-collapse border border-gray-200 mt-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Feature</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Our Tool</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">File Privacy</td>
              <td className="border border-gray-200 px-4 py-2 text-green-600 font-semibold">Files stay on device</td>
              <td className="border border-gray-200 px-4 py-2">Files uploaded to server</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Speed</td>
              <td className="border border-gray-200 px-4 py-2">Instant</td>
              <td className="border border-gray-200 px-4 py-2">Upload/download delay</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Account Required</td>
              <td className="border border-gray-200 px-4 py-2">No</td>
              <td className="border border-gray-200 px-4 py-2">Most require signup</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Document Limits</td>
              <td className="border border-gray-200 px-4 py-2">Unlimited</td>
              <td className="border border-gray-200 px-4 py-2">Often 3-5 per month free</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Watermarks</td>
              <td className="border border-gray-200 px-4 py-2">Never</td>
              <td className="border border-gray-200 px-4 py-2">Common on free tier</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Works Offline</td>
              <td className="border border-gray-200 px-4 py-2">Yes after page loads</td>
              <td className="border border-gray-200 px-4 py-2">No</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Cost</td>
              <td className="border border-gray-200 px-4 py-2 text-green-600 font-semibold">Always free</td>
              <td className="border border-gray-200 px-4 py-2">Free tier very limited</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Audit Trail</td>
              <td className="border border-gray-200 px-4 py-2">Basic</td>
              <td className="border border-gray-200 px-4 py-2">Advanced (paid)</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-semibold">Multi-signer</td>
              <td className="border border-gray-200 px-4 py-2">Add multiple manually</td>
              <td className="border border-gray-200 px-4 py-2">Automated workflow</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* SECTION G */}
      <section className="mb-12">
        <h3>Tips for Signing PDFs Effectively</h4>
        <h3>Use a Transparent PNG for the Cleanest Signature</h4>
        <p>If you are uploading a signature image, save it as a PNG file with a transparent background. This ensures the signature blends naturally with the document background without a white box around it. Most phone apps that let you sign on a white paper and photograph it produce images with white backgrounds — trim these using our <Link to='/image-tools/$slug' params={{ slug: 'crop-image' }} className='text-[#e5322d] hover:underline'>Crop Image tool</Link> before uploading.</p>
        <h3>Draw on a Touchscreen for the Best Results</h4>
        <p>If you have a tablet or smartphone with a stylus, use it to draw your signature. The result looks more natural than drawing with a mouse and more closely resembles your actual handwritten signature.</p>
        <h3>Protect the Signed PDF With a Password</h4>
        <p>After signing a sensitive document, add a password using our <Link to='/tools/$slug' params={{ slug: 'protect-pdf' }} className='text-[#e5322d] hover:underline'>Protect PDF tool</Link> to prevent unauthorized access or further editing. This is especially important for financial agreements, legal contracts, and medical forms.</p>
        <h3>Add a Date Alongside Your Signature</h4>
        <p>Many legal and business documents require a date next to the signature. Use the text annotation feature in our <Link to='/tools/$slug' params={{ slug: 'edit-pdf' }} className='text-[#e5322d] hover:underline'>Edit PDF tool</Link> to add the current date in the correct format next to your signature placement.</p>
        <h3>Flatten the PDF After Signing</h4>
        <p>Once you are satisfied with the signature placement, use our <Link to='/tools/$slug' params={{ slug: 'flatten-pdf' }} className='text-[#e5322d] hover:underline'>Flatten PDF tool</Link> to permanently embed the signature into the document. Flattening converts interactive elements into static content so the signature cannot be moved, edited, or deleted by the recipient.</p>
      </section>

      {/* SECTION H */}
      <section className="mb-12">
        <h3>Frequently Asked Questions About Signing PDFs</h4>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <details key={i} className="group border border-gray-200 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-lg flex justify-between items-center list-none">
                {f.q}
                <span className="text-[#E5322D] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-4 text-[#4B5563] leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SECTION I */}
      <section className="mb-12">
        <h3>Related PDF Tools</h4>
        <RelatedToolsGrid items={related} />
      </section>
    </div>
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
  name: "How to Sign a PDF Online — Step by Step",
  description: "Sign PDF documents online instantly in your browser. Draw, type or upload your signature and place it anywhere on your PDF. Free, no signup, no watermark, files never leave your device.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const signSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Sign PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1650",
  },
};
