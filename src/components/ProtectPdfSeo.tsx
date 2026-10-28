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
    q: "What encryption standard does this tool use?",
    a: "The tool uses MuPDF to save the PDF with AES-256 encryption.",
  },
  {
    q: "Can I restrict printing and copying as well as opening?",
    a: "No. This tool sets a password for opening the PDF. It does not provide separate printing, copying, or editing permission controls.",
  },
  {
    q: "What are the password requirements?",
    a: "Enter a password of at least four characters and repeat it exactly in the confirmation field. A longer, unique password is safer than the minimum.",
  },
  {
    q: "What happens if I forget the password?",
    a: "This tool does not recover forgotten passwords. Store the password securely and keep an unprotected original if you may need to create another protected copy.",
  },
  {
    q: "Can I protect a PDF that already has a password?",
    a: "The tool does not accept an already password-protected PDF for this workflow. Unlock an authorized copy first, then protect it with the new password.",
  },
  {
    q: "Can I protect multiple PDFs at once?",
    a: "No. The tool processes one PDF at a time. Large documents depend on available device memory.",
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
      <h2>How to Password Protect a PDF Online: Step by Step</h2>
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

      <h2>How the password protection works</h2>
      <p>
        The tool asks the MuPDF library to encrypt the file with AES-256. Without the password, a reader cannot open the document contents.
      </p>
      <p>
        Protection also depends on the password itself and on the reader software. Short, common or reused passwords can be guessed, so no password is unbreakable. Use a long, unique password and keep it somewhere safe: this tool cannot recover a forgotten password.
      </p>

      <h2>Tips for Creating Strong PDF Password Protection</h2>
      <h2>Use a Long, Random Password</h2>
      <p>
        A strong PDF password should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and symbols. Avoid using common words, names, dates, or keyboard patterns. A longer password makes the encryption exponentially harder to crack regardless of the encryption algorithm used.
      </p>
      <h2>Share the Password Separately</h2>
      <p>
        Never include the password in the same email as the protected PDF. Share the password through a different channel, a phone call, text message, or separate encrypted message. This ensures that even if the email is intercepted, the attacker has the encrypted file but not the key to open it.
      </p>
      <h2>Keep a Record of the Password</h2>
      <p>
        PDF encryption is extremely strong. If you forget the password to a protected PDF, the file is effectively inaccessible, even to us. Store important passwords in a secure password manager so you can always recover them when needed.
      </p>
      <h2>Re-Protect After Editing</h2>
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
};
