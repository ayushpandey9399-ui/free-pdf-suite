import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Upload Your PDF",
    text: "Click the \"Select PDF file\" button or drag and drop your document onto the upload area. Your PDF opens in your browser without being uploaded to any external server. All processing happens locally on your device.",
  },
  {
    title: "Enter Your Password",
    text: "Type a strong password in the password field. A strong password combines uppercase and lowercase letters, numbers, and special characters. The longer and more complex the password, the more secure the encryption. Enter it again in the confirmation field to make sure there are no typos.",
  },
  {
    title: "Set Permissions (Optional)",
    text: "Choose what actions the recipient can perform with the document even after entering the password. You can allow or restrict printing, copying text, and editing. This gives you fine-grained control over how your document is used even by authorized readers.",
  },
  {
    title: "Download Your Protected PDF",
    text: "Click the \"Protect PDF\" button. The encryption is applied instantly in your browser. Download the password-protected file and share it through email, messaging, or cloud storage. Share the password with intended recipients through a separate, secure channel such as a phone call or encrypted message.",
  },
];

const faqs = [
  {
    q: "How do I password protect a PDF for free?",
    a: "Upload your PDF using the button above, enter your chosen password, set any permissions you need, and click Protect PDF. Download the encrypted file instantly. No signup required.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. The entire encryption process runs in your browser. Your PDF and password never leave your device and are never transmitted over the internet.",
  },
  {
    q: "What encryption standard does this tool use?",
    a: "The tool uses AES (Advanced Encryption Standard) encryption — the same standard used by banks and government agencies to protect sensitive data.",
  },
  {
    q: "Can I restrict printing and copying as well as opening?",
    a: "Yes. The tool lets you set permission restrictions to control whether the recipient can print the document or copy text from it, even after entering the correct password.",
  },
  {
    q: "What happens if I forget the password?",
    a: "There is no way to recover a forgotten password from a strongly encrypted PDF. Always store your passwords in a secure password manager. Keep the original unprotected version of the file so you can re-protect it if needed.",
  },
  {
    q: "Can I protect a PDF on my phone?",
    a: "Yes. The tool works in any mobile browser on iPhone and Android without an app download.",
  },
  {
    q: "Is there a file size limit?",
    a: "No. You can protect PDFs of any size. The only constraint is your device memory.",
  },
  {
    q: "Can I protect a PDF that already has a password?",
    a: "To change the password on an already-protected PDF, first unlock it using our Unlock PDF tool, then re-protect it with the new password.",
  },
  {
    q: "Does protection affect the quality of the PDF?",
    a: "No. Encryption only changes how the file data is stored. All content, formatting, images, and links are preserved exactly.",
  },
  {
    q: "Can I protect multiple PDFs at once?",
    a: "Currently the tool processes one PDF at a time. Protect each file separately.",
  },
  {
    q: "Will the recipient need special software to open the protected PDF?",
    a: "No. Any standard PDF reader — including Adobe Acrobat Reader, browser PDF viewers, and mobile PDF apps — can open password-protected PDFs and will prompt for the password.",
  },
  {
    q: "Does protecting a PDF increase its file size?",
    a: "Minimally. Encryption adds a very small amount of overhead — typically less than 1% — to the file size.",
  },
  {
    q: "Can I remove the password later?",
    a: "Yes. Use our Unlock PDF tool to remove the password when you know the current password.",
  },
  {
    q: "Is this tool really free with no limits?",
    a: "Yes. No usage caps, no daily limits, no signup required, no watermarks on output.",
  },
  {
    q: "What is the difference between Protect PDF and Encrypt PDF?",
    a: "They refer to the same process. Protecting a PDF with a password encrypts its contents. The terms are used interchangeably.",
  },
];

const related = [
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove password from protected PDF" },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Sign document before protecting it" },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Remove sensitive info before sharing" },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Flatten forms before protecting" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce size before protecting" },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine files then protect" },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Add watermark before protecting" },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "Remove metadata before protecting" },
] as const;

export function ProtectPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      <h2>Why Should You Password Protect a PDF?</h2>
      <p>
        When you share a PDF document, you lose control over who can access it. An email forwarded to the wrong person, a shared drive with incorrect permissions, or a downloaded file on a borrowed device can all expose sensitive information to unintended readers. Password protecting a PDF adds a layer of security that ensures only people who know the password can open and read the file. Without the correct password, the document appears as unreadable encrypted data.
      </p>
      <p>
        PDF password protection is especially important for documents containing personal or financial information. Tax returns, bank statements, salary slips, medical records, legal contracts, identification documents, and business proposals all contain sensitive data that should not be accessible to everyone who might encounter the file. Encrypting these documents before sharing means that even if the file reaches the wrong person, they cannot read its contents.
      </p>
      <p>
        Businesses handling client data, confidential reports, and proprietary information benefit significantly from PDF password protection. Internal financial reports shared with board members, client contracts sent for review, HR documents distributed to management, and strategic plans emailed to partners can all be protected with a password that is shared separately through a secure channel.
      </p>
      <p>
        PDF password protection using AES encryption is extremely strong. AES-256 encryption — the standard used by governments and banks — makes brute-force attacks computationally impossible with today's technology. A well-chosen password combined with AES encryption provides military-grade document security without requiring any special software or technical knowledge.
      </p>

      <h2>How to Password Protect a PDF Online — Step by Step</h2>
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

      <h2>Understanding PDF Encryption — AES-128 vs AES-256</h2>
      <p>
        PDF password protection works by encrypting the file contents using the AES (Advanced Encryption Standard) algorithm. Encryption scrambles the document data into an unreadable format that can only be decoded with the correct password. Without the right password, the file contents are mathematically impossible to read — not just difficult, but computationally infeasible.
      </p>
      <p>
        AES-128 uses a 128-bit encryption key and provides very strong security for most everyday purposes. It is faster to process and still provides protection that would take billions of years to break with a brute-force attack on a modern computer. AES-128 is sufficient for personal documents, everyday business files, and general confidential content.
      </p>
      <p>
        AES-256 uses a 256-bit encryption key — twice as long — and is considered the gold standard for sensitive data protection. It is used by governments, military organizations, banks, and healthcare providers for their most sensitive data. AES-256 is the right choice for highly confidential documents, legal files, financial records, and anything that requires the highest available level of protection.
      </p>
      <p>
        The strength of encryption also depends on the password itself. A 4-digit PIN provides very weak protection regardless of the encryption standard because it can be guessed in seconds. A 12-character password combining letters, numbers, and symbols makes the encryption essentially unbreakable. Always use a strong, unique password for important documents.
      </p>

      <h2>Common Scenarios Where PDF Password Protection Is Essential</h2>
      <h3>Sharing Financial Documents</h3>
      <p>
        Tax returns, salary slips, bank statements, investment portfolios, and financial projections should always be password protected before sharing via email or messaging apps. Financial information in an unprotected PDF is accessible to anyone who intercepts the file.
      </p>
      <h3>Sending Legal Contracts and Agreements</h3>
      <p>
        Contracts, NDAs, settlement agreements, and legal opinions contain sensitive information about parties and terms. Password protecting them ensures that only the intended signatory can access the document, not anyone else on the email chain or shared drive.
      </p>
      <h3>Distributing Confidential Business Reports</h3>
      <p>
        Internal financial reports, strategic plans, acquisition documents, and board meeting materials should be encrypted before distribution, even to trusted employees. Password protection limits access to authorized readers and reduces the risk of leaks.
      </p>
      <h3>Protecting Personal Identification Documents</h3>
      <p>
        Scans of passports, driving licenses, national IDs, and birth certificates are frequently required for applications and verifications. Sending these as unprotected PDFs exposes your personal details to anyone who might see the email. Always encrypt identity documents before sharing them online.
      </p>
      <h3>Securing Medical Records</h3>
      <p>
        Medical history, prescriptions, test results, insurance claims, and hospital discharge summaries contain highly sensitive personal health information. Encrypting these documents before sharing with doctors, insurers, or family members protects your medical privacy.
      </p>
      <h3>Protecting Academic Work Before Submission</h3>
      <p>
        Students and researchers protecting original dissertation drafts, thesis documents, and unpublished research before sharing with supervisors or collaborators can use password protection to prevent unauthorized copying or distribution of their work.
      </p>
      <h3>Controlling Access to Premium or Paid Content</h3>
      <p>
        Content creators, publishers, and course creators distributing paid PDF guides, e-books, reports, and workbooks can password protect files and share the password only with paying customers. This provides basic access control without requiring a dedicated subscription platform.
      </p>
      <h3>Protecting HR and Employee Documents</h3>
      <p>
        Offer letters, salary information, performance reviews, disciplinary records, and personal employee data should all be encrypted before sharing, even within an organization. Password protection ensures that sensitive HR documents are only accessible to the intended recipient.
      </p>

      <h2>Two Types of PDF Passwords — What Is the Difference?</h2>
      <h3>Document Open Password (User Password)</h3>
      <p>
        This password controls who can open and view the document. Anyone who does not know this password sees a locked file that they cannot read. This is the most common type of PDF protection and is what most people mean when they talk about password protecting a PDF.
      </p>
      <h3>Permissions Password (Owner Password)</h3>
      <p>
        This password controls what an authorized user can do with the document after opening it. Even if someone knows the open password, the permissions password can restrict printing, copying text, or making edits. This lets you share a readable document while preventing downstream misuse of its contents.
      </p>

      <h2>Browser-Based vs Server-Based PDF Protection</h2>
      <div className="overflow-x-auto my-8">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3 border border-gray-200">Feature</th>
              <th className="p-3 border border-gray-200 font-semibold text-[#E5322D]">Our Tool</th>
              <th className="p-3 border border-gray-200">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">File Privacy</td>
              <td className="p-3 border border-gray-200">Encrypted in browser</td>
              <td className="p-3 border border-gray-200">File uploaded to server</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Password Visibility</td>
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
              <td className="p-3 border border-gray-200 font-medium">Encryption Strength</td>
              <td className="p-3 border border-gray-200">AES encryption</td>
              <td className="p-3 border border-gray-200">AES encryption</td>
            </tr>
            <tr>
              <td className="p-3 border border-gray-200 font-medium">Cost</td>
              <td className="p-3 border border-gray-200">Always free</td>
              <td className="p-3 border border-gray-200">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Tips for Creating Strong PDF Password Protection</h2>
      <h3>Use a Long, Random Password</h3>
      <p>
        A strong PDF password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid using common words, names, dates, or keyboard patterns. A longer password makes the encryption exponentially harder to crack regardless of the encryption algorithm used.
      </p>
      <h3>Share the Password Separately</h3>
      <p>
        Never include the password in the same email as the protected PDF. Share the password through a different channel — a phone call, text message, or separate encrypted message. This ensures that even if the email is intercepted, the attacker has the encrypted file but not the key to open it.
      </p>
      <h3>Keep a Record of the Password</h3>
      <p>
        PDF encryption is extremely strong. If you forget the password to a protected PDF, the file is effectively inaccessible — even to us. Store important passwords in a secure password manager so you can always recover them when needed.
      </p>
      <h3>Restrict Printing and Copying for Sensitive Documents</h3>
      <p>
        For highly sensitive documents that need to be readable but not reproducible, use the permissions settings to disable printing and text copying. This prevents recipients from creating paper copies or extracting text from the document.
      </p>
      <h3>Re-Protect After Editing</h3>
      <p>
        If you need to edit a protected PDF, unlock it using our <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#E5322D] hover:underline">Unlock PDF tool</Link>, make your edits, and then re-protect the updated version with a new password.
      </p>

      <h2>Frequently Asked Questions About Protecting PDFs</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="group border border-gray-200 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
              {f.q}
              <span className="text-[#E5322D] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {f.q === "Can I protect a PDF that already has a password?" || f.q === "Can I remove the password later?" ? (
                <>
                  {f.a.split("Unlock PDF tool")[0]}
                  <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#E5322D] hover:underline">Unlock PDF tool</Link>
                  {f.a.split("Unlock PDF tool")[1]}
                </>
              ) : (
                f.a
              )}
            </p>
          </details>
        ))}
      </div>

      <h2 className="mt-16">Related PDF Tools</h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const protectFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const protectHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to password protect a PDF online for free",
  description: "Add a password to any PDF document instantly in your browser. Encrypt your file to prevent unauthorized access.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const protectSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Protect PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "1420" },
};
