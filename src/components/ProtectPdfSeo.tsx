import { Link } from "@tanstack/react-router";
import { BenefitBadges } from "@/components/BenefitBadges";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Open the PDF you want to lock",
    text: "Drop a PDF into the browser window or click Select PDF file. The document is loaded into the current tab and stays there — no upload of any kind happens at this or any later stage.",
  },
  {
    title: "Type a password (and confirm it)",
    text: "Enter the password you want the file to require and repeat it in the second field. A live strength meter grades what you typed as weak, medium or strong so you can catch a lazy password before you commit to it. The password is used purely inside your browser to derive the encryption key — it is never sent, stored or logged on our side.",
  },
  {
    title: "Click Protect PDF",
    text: "The tool applies the PDF standard's strongest encryption — AES-256 — to the document right on your machine using the mupdf WebAssembly engine. Both the user password (needed to open the file) and the owner password are set to the value you just typed.",
  },
  {
    title: "Download the encrypted PDF",
    text: "The protected copy saves straight to your Downloads folder with a -protected suffix on the filename. Opening it in any PDF reader now prompts for the password before the first page is shown.",
  },
];

const benefits = [
  {
    h: "Works with every PDF reader",
    p: "The output is a plain, spec-compliant PDF with standard AES-256 encryption applied — the exact same format Adobe Acrobat writes when you password-protect a file there. Adobe Reader, Chrome, Edge, Firefox, Preview on macOS, and the built-in viewers on Android and iOS all recognise it and ask for the password before showing the first page.",
  },
  {
    h: "Encrypt sensitive documents safely",
    p: "Salary slips, medical reports, bank statements, tax returns, offer letters, rental agreements — anything you would not want a stranger to skim if it landed in the wrong inbox. Locking the file before you attach it to an email or drop it into a shared folder means an intercepted or forwarded copy is useless without the password.",
  },
  {
    h: "No file size games or paywalls",
    p: "Protect a 500 KB payslip or a 300 MB scanned dossier — the workflow is the same and the cost is the same, which is zero. There is no page cap, no daily quota, no watermark added to the output and no upgrade prompt at the end.",
  },
  {
    h: "Instant, even for big files",
    p: "Because nothing has to be uploaded to a server before it can be encrypted, there is no wait for a slow home connection to push a huge PDF across the internet. The encryption runs at the speed of your own device and starts the moment you click the button.",
  },
];

const scenarios = [
  {
    h: "Emailing financial or HR documents",
    p: "Salary slips, Form 16s, offer letters, KYC packets and reimbursement claims are routinely sent as email attachments — and email attachments are trivially forwarded, printed and screenshot. Locking the PDF adds a second layer that stops a casually forwarded copy from being immediately readable.",
  },
  {
    h: "Sharing files via WhatsApp or a cloud link",
    p: "WhatsApp messages get forwarded, Drive links get reshared, and a document you sent to one person can end up on a family group by evening. A password-protected PDF still travels the same way, but only the intended recipient — who you told the password to separately — can actually open it.",
  },
  {
    h: "Storing sensitive records in cloud backups",
    p: "iCloud, Google Drive and OneDrive are convenient, but they also mean copies of your most private documents sit on servers you do not run. Encrypting those files with a password before you upload them means the cloud provider is holding an opaque blob, not a readable ID or medical report.",
  },
  {
    h: "Sending documents to agents or consultants",
    p: "Rental brokers, insurance agents, loan intermediaries and freelance consultants often ask for ID, address proof or financial statements. A password-protected PDF, with the password shared through a different channel, gives them what they need without leaving a permanently-open copy on their downloads folder.",
  },
];

const faqs = [
  {
    q: "How do I put a password on a PDF for free?",
    a: "Open this page, click Select PDF file, choose the document you want to lock, type the password you want the file to require, confirm it in the second field and click Protect PDF. A password-protected copy downloads to your device a moment later. You do not need Adobe Acrobat, an account or a card — the whole thing takes about ten seconds and costs nothing.",
  },
  {
    q: "Is the password sent to your server?",
    a: "No. Nothing is. The PDF is opened in your browser's memory, the encryption runs there via a WebAssembly build of the mupdf engine, and the encrypted output is handed back to you as a local download. Your password is used only to derive the encryption key locally — we never receive it, log it or store it, because we never receive any data from the tool at all.",
  },
  {
    q: "How strong is the encryption?",
    a: "The tool applies AES-256, which is the strongest encryption defined in the PDF specification and the same algorithm Adobe Acrobat uses on its most secure output. That said, real-world strength depends on the password you choose: AES-256 is unbreakable in practice, but a four-letter dictionary word is not. Use something long, unique and not shared with any other account.",
  },
  {
    q: "Will the protected PDF open on any device?",
    a: "Yes. The output is a standard encrypted PDF, so Adobe Reader, Adobe Acrobat, Preview on macOS, the built-in PDF viewers in Chrome, Edge, Firefox and Safari, and mobile PDF apps on Android and iOS all recognise it. Every one of them will prompt for the password before showing the first page.",
  },
  {
    q: "What happens if I forget the password?",
    a: "There is no recovery — not by us, not by anyone. We never received your password in the first place (it stayed in your browser), so we cannot look it up, reset it or send you a magic link. That is not a limitation of this tool; it is the point of real encryption. If a service can recover your password for you, it is holding your key on its servers, which means so can anyone who breaches those servers. Store the password somewhere safe (a password manager is ideal) before you close the tab.",
  },
  {
    q: "Can I remove a password from a PDF?",
    a: "Yes, if you know the current password. Use our free Unlock PDF tool for that — like this one, it runs entirely in your browser, so the password you type to unlock the file is never sent anywhere either.",
  },
  {
    q: "Can I protect multiple PDFs?",
    a: "Yes. There is no daily quota, no per-file limit and no signup. Run one file, download it, drop in the next — repeat as many times as you need. Every run is independent and runs locally.",
  },
  {
    q: "Does protecting change the content or quality?",
    a: "No. Encryption wraps the existing PDF; it does not re-render pages, re-compress images or touch the text layer. Fonts stay sharp, images stay at their original resolution, form fields keep working and the file size barely changes. Everything the recipient sees after typing the password is byte-identical to what you would have sent unprotected.",
  },
  {
    q: "Is a password-protected PDF safe to email?",
    a: "It is meaningfully safer than an unprotected one. Email attachments can be forwarded, mis-sent, backed up on a mail server and archived indefinitely — a locked PDF stays useless to anyone who does not have the password. The important rule: send the password through a different channel than the file. If both travel in the same email thread, an attacker who reads that thread has both, and the encryption has bought you nothing.",
  },
  {
    q: "Do I need an account or Adobe Acrobat?",
    a: "Neither. There is no login, no free trial, no email capture and no need to install Acrobat Pro (whose encryption feature is a paid tier anyway). Open this page, drop a PDF, type a password, download the encrypted file — that is the whole workflow.",
  },
];

const related = [
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove the password from a PDF you know the password to." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently remove sensitive parts instead of locking the whole file." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Add a signature before encrypting a contract for delivery." },
  { to: "/tools/flatten", name: "Flatten PDF", blurb: "Lock down form fields and annotations before you protect the file." },
  { to: "/tools/metadata", name: "Metadata Editor", blurb: "Clean out author and title info before you send the encrypted PDF." },
];

export function ProtectPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["File and password never leave your device", "Real AES-256 encryption", "Free, no signup, no watermark"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to password protect a PDF online for free
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

      {/* Trust section */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Think about it: would you email someone your password?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Every other online tool that offers to password-protect a PDF for you needs two things from
        you: the document itself, and the password you want to lock it with. In other words, you
        are handing a stranger's server both the secret and the thing the secret is meant to
        protect — often the same password you reuse on other accounts because most people do.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool does not ask for that trust because it does not need it. The PDF is opened in
        your browser, the password stays in your browser, and the AES-256 encryption is performed
        by a WebAssembly module running inside the same tab. The finished file appears in your
        Downloads folder without a single byte of the document or a single character of the
        password ever crossing the network.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        There is nothing to trust here — because there is nothing we ever receive. Open the
        Network tab in your browser's developer tools while you protect a file if you want to see
        for yourself: not a single request is made to our servers during the encryption.
      </p>

      {/* Real encryption */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Real encryption, not a fake lock
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The output is a genuine encrypted PDF with AES-256 applied — the strongest algorithm the
        PDF specification defines and the same one Adobe Acrobat writes when you use its
        password-protect feature. It is not a viewer-only overlay, a watermark, or a metadata flag
        that pretends the file is locked. Open the protected PDF in Adobe Reader, Chrome, Preview
        on macOS or a phone viewer and every one of them will refuse to render the first page
        until the password is entered.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Honest caveat: PDF encryption is only as strong as the password you pick. AES-256 itself is
        unbreakable in any realistic sense, but a four-character dictionary word is guessed in
        milliseconds by an off-the-shelf cracker. Choose something long (at least 12 characters),
        unique to this file, and mixed enough that the strength meter shows Strong before you
        commit to it.
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
        When should you password protect a PDF?
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
  description:
    "Add AES-256 password encryption to a PDF entirely in your browser — the file and password never leave your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "The PDF you want to encrypt" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Protect PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/protect-pdf#step-${i + 1}`,
  })),
};

export const protectSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Protect PDF",
  description:
    "Password protect PDF online free with AES-256 encryption in your browser. Your file and password never leave your device. No signup, no watermark.",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
