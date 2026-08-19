import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1: Upload Your Protected PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your password-protected PDF onto the upload area. The file opens in your browser without being uploaded to any external server.",
  },
  {
    title: "Step 2 — Enter the Password",
    text: "Type the password for the PDF in the password field. This is the password that was set when the document was originally protected. Without the correct password, the file cannot be decrypted.",
  },
  {
    title: "Step 3 — Unlock the PDF",
    text: "Click the \"Unlock PDF\" button. The tool uses the password you entered to decrypt the file content and generate a new copy of the document without password protection. This process runs entirely in your browser.",
  },
  {
    title: "Step 4 — Download the Unlocked PDF",
    text: "Download the unlocked PDF to your device. The new file is identical in content to the original but can be opened, edited, merged, and used in any PDF workflow without requiring a password.",
  },
];

const faqs = [
  {
    q: "How do I unlock a PDF online for free?",
    a: "Upload your protected PDF, enter the correct password, and click Unlock PDF. Download the unlocked file instantly. No signup required.",
  },
  {
    q: "Do I need to know the password to unlock a PDF?",
    a: "Yes. This tool requires the correct password to decrypt the file. It does not crack or bypass encryption — it removes the protection layer after you authenticate with the correct password.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire process runs in your browser. Your PDF and password never leave your device.",
  },
  {
    q: "Can I unlock a PDF without knowing the password?",
    a: "No. Properly encrypted PDFs cannot be opened without the correct password. If you have forgotten the password, contact the sender for a new copy.",
  },
  {
    q: "Is it legal to unlock a PDF?",
    a: "Yes, when you are the authorized recipient and you know the password. It is not legal to bypass protection on documents you are not authorized to access.",
  },
  {
    q: "What types of PDF passwords can this tool remove?",
    a: "The tool can remove both document open passwords (user passwords) and permissions passwords (owner passwords) when you provide the correct password.",
  },
  {
    q: "Is there a file size limit?",
    a: "No. You can unlock PDFs of any size with no restrictions.",
  },
  {
    q: "Can I unlock a PDF on my phone?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android. No app required.",
  },
  {
    q: "Will the content of the PDF change after unlocking?",
    a: "No. Unlocking only removes the encryption layer. All content, formatting, images, and links remain exactly the same.",
  },
  {
    q: "Can I unlock multiple PDFs at once?",
    a: "Currently the tool processes one PDF at a time. Unlock each file separately.",
  },
  {
    q: "Does this tool crack PDF passwords?",
    a: "No. This tool only removes protection when you provide the correct password. It cannot bypass or crack encryption.",
  },
  {
    q: "Will the unlocked PDF look different from the original?",
    a: "No. The content, layout, fonts, and images are identical. Only the password protection layer is removed.",
  },
  {
    q: "Can I use this offline?",
    a: "Yes. Once the page has fully loaded, the tool works without an internet connection.",
  },
  {
    q: "Is this tool really free?",
    a: "Yes. No usage limits, no signup, no watermarks on the output.",
  },
  {
    q: "What should I do after unlocking a PDF?",
    a: "Keep the original protected version for your records. Use the unlocked version for merging, compressing, editing, or any other workflow that requires an unprotected file.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add new password after editing" },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine unlocked PDFs together" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce size after unlocking" },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Annotate after removing protection" },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Sign the unlocked document" },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull pages from unlocked PDF" },
  { to: "/tools/split", name: "Split PDF", blurb: "Separate the unlocked document" },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Flatten forms after unlocking" },
] as const;

export function UnlockPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>Why Would You Need to Unlock a PDF?</h2>
      <p>
        Password-protected PDFs are common in everyday work. Banks send password-protected statements to protect account information. Employers send encrypted payslips with your employee ID as the password. Government agencies distribute encrypted forms. Insurance companies send policy documents with a protection layer. In each of these cases, you know the password, but you need to unlock the PDF to merge it with other documents, compress it, edit it, or use it in a workflow that does not accept password-protected files.
      </p>
      <p>
        Many PDF tools and workflows do not accept password-protected files as inputs. If you try to merge a locked PDF with other documents, the merger will fail. If you try to compress an encrypted PDF, the compressor cannot access the content. If you need to extract pages, add page numbers, or watermark a password-protected document, you first need to remove the protection and then perform the operation on the unlocked copy.
      </p>
      <p>
        Long-term document storage is another common reason to unlock PDFs. If you received an encrypted document years ago and want to archive it without needing to remember or look up the password every time you need to view it, unlocking it and saving the decrypted copy as your archive version is a practical solution — provided you are authorized to do so.
      </p>
      <p>
        It is important to understand that a PDF unlocker does not bypass or crack encryption. You must know the correct password to unlock the file. What the tool does is use the password you provide to decrypt the file and save a new copy without the protection layer. This is the equivalent of opening a locked filing cabinet with your key, making a copy of the contents, and putting the copy in an unlocked folder for easier access.
      </p>

      <h2>How to Unlock a PDF Online — Step by Step</h2>
      <div className="space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold" aria-label={`Step ${i + 1}`}>
              {i + 1}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
              <p className="text-gray-600 leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Two Types of PDF Passwords: What Each One Does</h2>
      <h2>Document Open Password (User Password)</h2>
      <p>
        This password prevents the file from being opened at all. Anyone who receives a PDF with this type of protection sees a locked file and is prompted to enter a password before viewing any content. Banks, government agencies, and HR departments commonly use this type of protection for sensitive documents they send to individuals.
      </p>
      <h2>Permissions Password (Owner Password)</h2>
      <p>
        This password does not prevent the file from being opened but restricts what can be done with it. A PDF protected with only a permissions password can be viewed but cannot be printed, copied, or edited. This type of protection is common in commercially distributed PDF documents, e-books, and reports where the creator wants to control usage without preventing reading.
      </p>

      <h2>Common Situations Where You Need to Unlock a PDF</h2>
      <h2>Bank Statements and Financial Documents</h2>
      <p>
        Many banks send monthly statements as password-protected PDFs, using your date of birth or account number as the password. Unlocking these statements lets you merge them into a single annual statement, compress them for storage, or share specific pages with an accountant or financial advisor without sending the password separately.
      </p>
      <h2>Payslips and Salary Documents</h2>
      <p>
        HR departments often protect payslips with an employee's date of birth or employee ID as the password. When applying for a loan, visa, or rental property, you may need to submit payslips as unlocked PDFs that can be combined and compressed. Unlocking them first makes this process straightforward.
      </p>
      <h2>Government and Official Documents</h2>
      <p>
        Some government documents, tax notices, and official certificates are distributed as protected PDFs. Unlocking them allows you to merge them with other application documents, compress them to meet upload limits, or print them without restriction.
      </p>
      <h2>Academic Certificates and Transcripts</h2>
      <p>
        Universities sometimes distribute grade transcripts and certificates as password-protected PDFs. Unlocking these allows you to combine them with other application documents and compress them for online submissions.
      </p>
      <h2>Insurance and Medical Documents</h2>
      <p>
        Insurance policies, claim documents, and medical reports occasionally come protected. Unlocking them lets you share specific sections with relevant parties, merge multiple documents into a single submission, or annotate them with our <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#E5322D] hover:underline">Edit PDF tool</Link>.
      </p>
      <h2>Merging Multiple PDFs Including a Protected One</h2>
      <p>
        If you need to merge several PDFs into one document and one of them is password-protected, you need to unlock it first. Most PDF mergers cannot process encrypted files directly. You can use our <Link to="/tools/$slug" params={{ slug: "merge" }} className="text-[#E5322D] hover:underline">Merge PDF tool</Link> once the file is unlocked.
      </p>
      <h2>Compressing Protected PDFs</h2>
      <p>
        A PDF compressor cannot optimize the contents of an encrypted file because it cannot access the image data inside. Unlocking the PDF first allows the compressor to process the file and achieve proper size reduction. Try our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#E5322D] hover:underline">Compress PDF tool</Link> after unlocking.
      </p>
      <h2>Re-Protecting With a New Password</h2>
      <p>
        If you want to change the password on a protected PDF, you first need to unlock the current version and then re-protect it with a new password using our <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="text-[#E5322D] hover:underline">Protect PDF tool</Link>.
      </p>

      <h2>Is It Legal to Unlock a PDF?</h2>
      <p>
        Unlocking a PDF is legal when you are the authorized recipient of the document and you know the password. If a bank sent you a protected statement, an employer sent you an encrypted payslip, or a government agency sent you a protected certificate, you have full authorization to unlock and use that document as needed.
      </p>
      <p>
        It is not legal to use a PDF unlocking tool to bypass protection on documents you are not authorized to access, crack passwords on commercially distributed e-books or content to circumvent digital rights management, or remove protection from someone else's confidential documents without permission. Our tool requires you to know and enter the correct password — it does not bypass or crack encryption.
      </p>
      <p>
        If you have forgotten the password to a document you own or created yourself, you should contact the original sender for a new copy or check whether you stored the password in a password manager. Our tool cannot unlock a PDF without the correct password — it simply removes the protection layer after authentication.
      </p>

      <h2>Browser-Based vs Server-Based PDF Unlocking</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 border border-gray-200 text-[#383E45]">Feature</th>
              <th className="p-3 border border-gray-200 font-semibold text-[#E5322D]">Our Tool</th>
              <th className="p-3 border border-gray-200 text-[#383E45]">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody className="text-[#383E45]">
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Privacy</td>
              <td className="p-3 border border-gray-200">Stays on device</td>
              <td className="p-3 border border-gray-200">Uploaded to server</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Password Privacy</td>
              <td className="p-3 border border-gray-200">Never sent over internet</td>
              <td className="p-3 border border-gray-200">Sent to server</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Speed</td>
              <td className="p-3 border border-gray-200">Instant</td>
              <td className="p-3 border border-gray-200">Upload/download delay</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Account Required</td>
              <td className="p-3 border border-gray-200">No</td>
              <td className="p-3 border border-gray-200">Sometimes yes</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Watermarks</td>
              <td className="p-3 border border-gray-200">Never</td>
              <td className="p-3 border border-gray-200">Common on free tier</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Works Offline</td>
              <td className="p-3 border border-gray-200">Yes after page loads</td>
              <td className="p-3 border border-gray-200">No</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Size Limit</td>
              <td className="p-3 border border-gray-200">No limit</td>
              <td className="p-3 border border-gray-200">Often capped</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Cost</td>
              <td className="p-3 border border-gray-200">Always free</td>
              <td className="p-3 border border-gray-200">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Tips for Working With Unlocked PDFs</h2>
      <h2>Keep the Original Protected Version</h2>
      <p>
        After unlocking a PDF, keep both the protected original and the unlocked copy. The original serves as proof of the official protected version you received, while the unlocked copy is for your working needs.
      </p>
      <h2>Re-Protect After Making Edits</h2>
      <p>
        If you unlock a document, edit it, and need to share it securely, use our <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="text-[#E5322D] hover:underline">Protect PDF tool</Link> to add a new password before sharing.
      </p>
      <h2>Compress After Unlocking</h2>
      <p>
        Unlocked PDFs can be compressed normally. Run the unlocked file through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#E5322D] hover:underline">Compress PDF tool</Link> to reduce file size before archiving or emailing.
      </p>
      <h2>Merge Unlocked PDFs With Other Documents</h2>
      <p>
        Once unlocked, the PDF can be merged with other documents using our <Link to="/tools/$slug" params={{ slug: "merge" }} className="text-[#E5322D] hover:underline">Merge PDF tool</Link> without any restrictions.
      </p>
      <h2>Check Permissions After Unlocking</h2>
      <p>
        Some PDFs have two layers of protection — an open password and a permissions password. After removing the open password, verify that printing and copying are now available. If restrictions remain, the permissions password may still be active.
      </p>

      <h2>Frequently Asked Questions About Unlocking PDFs</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center text-[#383E45]">
              {f.q}
              <span className="text-[#E5322D] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-16">Related PDF Tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const unlockFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const unlockHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to remove a password from a PDF",
  description: "Remove password protection from any PDF you are authorized to access. Enter the password once and download an unlocked copy instantly.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const unlockSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Unlock PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1280",
  },
};
