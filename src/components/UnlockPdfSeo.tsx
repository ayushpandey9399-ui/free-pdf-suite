import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the protected PDF",
    text: "Drop the locked PDF into the browser or click Select PDF file. The tool inspects the document in your tab, detects that it is encrypted, and shows a padlock badge along with a password field, nothing has been sent anywhere.",
  },
  {
    title: "Type the current password",
    text: "Enter the password that currently opens the file. You can toggle the eye icon to check what you typed. If the password is wrong, the tool tells you inline so you can try again, it does not upload anything on a failed attempt.",
  },
  {
    title: "Click Unlock PDF",
    text: "The tool authenticates the password locally using the mupdf WebAssembly engine, then re-saves the document with encryption set to none. This runs at the speed of your CPU, not your uplink.",
  },
  {
    title: "Download the unlocked copy",
    text: "A file with a -unlocked suffix downloads to your device. Open it in any reader on any phone or laptop, it will no longer ask for a password. Your original file, and the password you typed, stayed on your machine the whole time.",
  },
];

const benefits = [
  {
    h: "Permanently unlocked",
    p: "The downloaded copy is a plain, unencrypted PDF. It opens instantly in the Gmail attachment preview, in your phone's file browser, in any desktop reader, no password prompt, ever again, on any device you copy it to.",
  },
  {
    h: "Original stays untouched",
    p: "What you get back is a separate, unlocked copy of the document. The protected original in your Downloads folder or email is not modified, moved or replaced, so you can always fall back to it if the encrypted version was the one you actually needed to keep.",
  },
  {
    h: "No quality or content change",
    p: "Removing encryption does not re-render pages, re-compress images or touch the text layer. Every page, every font and every embedded image is byte-identical to the protected file, only the encryption wrapper is stripped away.",
  },
  {
    h: "Free and unlimited",
    p: "Unlock one statement or a whole year of them. There is no daily limit, no page cap, no watermark on the output and no account to create. Open a file, type its password, download the unlocked copy, done.",
  },
];

const scenarios = [
  {
    h: "Monthly bank and credit-card statements",
    p: "Statements arriving in your inbox every month are almost always password-protected, and typing the password on every open across every device gets old fast. Unlock the ones you have already archived somewhere safe of your own so they behave like normal PDFs when you actually need to look at them.",
  },
  {
    h: "Insurance and investment documents",
    p: "Policy documents, mutual fund statements and annual investment summaries are opened often, during tax season, during renewals, when a claim is filed. Keeping an unlocked working copy in your personal records folder means you are not hunting for the password every time.",
  },
  {
    h: "Portals that reject password-protected PDFs",
    p: "Many government portals, HR systems and application forms refuse encrypted uploads outright and return an error like Encrypted files are not accepted. Unlock the file first, then upload the plain copy, this is the fix for most such rejections.",
  },
  {
    h: "Editing, merging or signing a protected file",
    p: "Encrypted PDFs cannot be processed by most PDF tools until they are unlocked, you cannot merge one into another file, add a signature to it or extract a page range while the encryption is in place. Unlock it once, then run whichever tool you actually needed.",
  },
];

const faqs = [
  {
    q: "How do I remove a password from a PDF for free?",
    a: "Open this page, click Select PDF file, choose the protected document, type the password that currently opens it and click Unlock PDF to remove the PDF password. An unlocked copy downloads to your device a moment later. You do not need Adobe Acrobat, an account or a card, and this free PDF password remover runs entirely in your browser.",
  },
  {
    q: "Can you unlock a PDF without knowing the password?",
    a: "No. This tool decrypts the file using the password you provide, it does not attempt to guess, bypass or crack an unknown one. That is a deliberate design choice: password-cracking utilities are what people use to open other people's documents, which is not what this tool is for. If you have genuinely lost the password to a document, contact whoever issued it (your bank, your employer, your insurer) and ask them to send a fresh copy or reset the password.",
  },
  {
    q: "Is my password sent to your server?",
    a: "No. The password is fed directly into the mupdf WebAssembly engine running inside your browser tab and used there to derive the decryption key. It is never placed in a network request, never logged and never stored, because no network request is made at all during the unlock. You can watch the Network tab in your browser's developer tools and confirm this yourself.",
  },
  {
    q: "What is the password for my bank statement PDF?",
    a: "The bank always states the formula in the same email that delivered the statement, read that email first. The common patterns in India are your PAN in capital letters, your date of birth in a specific format (often DDMMYYYY or DDMM), or a mix such as the first four letters of your name in caps plus the last four digits of your account or year of birth. Different banks use different formulas, so trust the one printed in the delivery email rather than guessing.",
  },
  {
    q: "Will the unlocked PDF work everywhere?",
    a: "Yes. The output is a standard PDF with the encryption wrapper removed, so every reader that supports PDF at all, Adobe Reader, Chrome, Edge, Firefox, Safari, Preview on macOS, phone viewers on Android and iOS, the inline preview inside email clients, opens it with no prompt.",
  },
  {
    q: "Is it legal to remove a PDF password?",
    a: "For your own documents where you know the password, your bank statement, your salary slip, your insurance policy, a report you generated, yes, you are simply removing a lock on something that is yours. What is not okay is removing protection from a document you are not authorised to access; that is true even if a tool technically lets you do it. This tool requires the correct password precisely so it stays on the right side of that line.",
  },
  {
    q: "Why does a portal reject my password-protected PDF?",
    a: "Most upload systems parse the PDF to validate it, extract text or generate a thumbnail, none of which they can do while the file is encrypted. Rather than deal with the ambiguity, they refuse the upload outright with a message like Encrypted or password-protected files are not accepted. Unlock the file with this tool first and re-upload the plain copy.",
  },
  {
    q: "Does unlocking change quality or content?",
    a: "No. Removing encryption is a metadata-level change, it strips the encryption dictionary from the PDF and re-saves everything else as-is. Pages, fonts, images, form fields and annotations are all preserved exactly as they were in the protected file.",
  },
  {
    q: "Can I add a new password later?",
    a: "Yes. Once you have the unlocked copy, open our free Protect PDF tool, drop the file in and set a new password. Like this tool, that one also runs entirely in your browser, so the new password is never sent anywhere either.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. Adobe Acrobat can remove a password too, but only the paid Pro edition. This tool is free, needs no install and runs in any modern browser, the workflow is the same but without the subscription.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently black out sensitive text and images." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/split", name: "Split PDF", blurb: "Break one PDF into multiple files or page ranges." },
  { to: "/tools/compare", name: "Compare PDFs", blurb: "See the differences between two versions side by side." },
] as const;

export function UnlockPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to remove a password from a PDF
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

      {/* Pain section */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Tired of typing the password every single time?
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Bank statements, credit card bills, salary slips, insurance policies and Aadhaar PDFs
        almost always arrive password-protected, and then insist on the password on every
        open, on every phone, on every laptop you copy the file to. The lock made sense while
        the file was in transit through email; once you have moved it into your own secure
        storage, typing the password for the tenth time this month is pure friction and
        nothing else.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Unlock the file once here and you get a copy that just opens, no prompt, no delay,
        no fishing around your inbox for the delivery email. Which brings up the other
        common question: what is the password in the first place? Banks and issuers in India
        almost always state the formula inside the same email, commonly your PAN in
        capitals, your date of birth as DDMMYYYY, or the first four letters of your name in
        capitals joined to your year of birth. Read the delivery email once and you will
        find it.
      </p>

      {/* Privacy section */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        The only safe place to type a PDF password
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        When you unlock a PDF on an upload-based site, you have to hand it two things at
        once: the encrypted document and the exact password that decrypts it. Together those
        are literally everything an attacker needs to read the file, and often the same
        password you have reused on a bank statement from last year and one from this year.
        Even if the site is well-intentioned, it now holds a temporary copy of both.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool does the whole thing inside your browser. The PDF is opened in tab
        memory, the password you type is fed into a WebAssembly build of mupdf to derive
        the decryption key, and the unlocked file is saved straight back to your device.
        Neither the document nor the password is ever transmitted, logged or stored, no
        request goes out at all during the unlock. Once the page has loaded, you could even
        turn Wi-Fi off and it would still work.
      </p>

      {/* Ethics */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        We unlock, we don't crack
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool removes protection from a PDF when you already know the password, your
        own bank statement, your salary slip, your insurance policy, a report you generated
        for yourself. It cannot guess, bypass or brute-force an unknown password, and that
        is a deliberate choice: password-crackers are what people reach for when they want
        to open someone else's documents, which is not the job this tool is trying to do.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        If you have genuinely lost the password to a document you own, the right next step
        is to contact whoever issued it, your bank, your employer, your insurer, the
        government department, and ask them to resend the file or reset the password.
        That is faster than any workaround and it keeps the paper trail clean.
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
        When do you need to unlock a PDF?
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
  description:
    "Decrypt a password-protected PDF entirely in your browser using the password you already know, the file and password never leave your device.",
  totalTime: "PT1M",
  supply: [{ "@type": "HowToSupply", name: "A password-protected PDF and its current password" }],
  tool: [{ "@type": "HowToTool", name: "FreePDFHub Unlock PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/unlock-pdf#step-${i + 1}`,
  })),
};

export const unlockSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "FreePDFHub Unlock PDF",
  description:
    "Remove password from PDF online free, decrypt password-protected PDFs in your browser with the password you know. File and password never leave your device.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
