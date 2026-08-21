import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";


const steps = [
  {
    title: "Open the PDF form you need to fill",
    text: "Click Select PDF file and choose the form on your device. The tool immediately reads the document's AcroForm layer with pdf-lib and lists every interactive field it can find, text boxes, checkboxes, radio groups, dropdowns and option lists, inside the workspace panel.",
  },
  {
    title: "Type or tick your answers, field by field",
    text: "Each detected field appears as a labelled input in the panel, matched to its real type: text fields become an Input, checkboxes become a tickbox, dropdowns and radio groups become a Select of the original options. The sidebar shows a running count like \"12 fields detected\" so you know nothing was missed.",
  },
  {
    title: "Preview values and correct anything at will",
    text: "Existing values that the PDF was distributed with, say, a pre-filled applicant name, are loaded into the inputs so you can either keep or overwrite them. There is no submit-and-lose-it step: change any answer as many times as you want before exporting.",
  },
  {
    title: "Download the completed PDF",
    text: "Click Download Filled PDF and the tool writes every answer back into the real form fields with pdf-lib, saves the document, and hands it back with a -filled suffix. The exported file is a proper filled AcroForm, no flattened image, no server round-trip, no watermark.",
  },
];

const benefits = [
  {
    h: "All standard field types",
    p: "The tool detects and lets you fill the four field types PDF forms actually use: text inputs (single line), checkboxes, dropdowns and radio groups. Option lists are treated as dropdowns too, so anything the form's author added shows up as a familiar Select or tickbox.",
  },
  {
    h: "Clean, legible results",
    p: "Typed answers land in the exact font and position the form's designer defined, without the crooked handwriting and scanner shadows you'd get from a printed workflow. The recipient reads a crisp, uniform document that copies cleanly and stays perfectly aligned when printed.",
  },
  {
    h: "Save and send the same minute",
    p: "Because everything runs locally, there is no queue and no upload progress bar between you and the download button. Fill the form, hit Download Filled PDF, attach it to the email you already have open, no context-switching to a print shop or a scanner app.",
  },
  {
    h: "Your answers stay on your device",
    p: "Every keystroke you type into a field stays inside your browser tab. The PDF is opened, the fields are enumerated and the completed file is written entirely with in-browser Web APIs, so none of the personal data you enter is transmitted to us or to any third party.",
  },
];

const scenarios = [
  {
    h: "Job applications and HR onboarding packets",
    p: "New-hire paperwork is almost always a PDF bundle, offer letter acknowledgements, direct-deposit forms, tax withholding, emergency contacts. Fill each one on your laptop, download and email it back the same day instead of printing five pages, signing, and finding a scanner.",
  },
  {
    h: "Government, bank and insurance forms",
    p: "Passport renewals, account opening kits, insurance claim forms and address-change requests are frequently issued as fillable PDFs. Type your details straight into the fields, keep a digital copy for your records and upload the same file to the agency's portal.",
  },
  {
    h: "School and college admission or exam forms",
    p: "Course registration, exam-centre allocation and scholarship applications often ship as PDFs students are expected to complete and email back. Filling them on-screen avoids the print-shop trip and produces a copy that admissions staff can index and search.",
  },
  {
    h: "Vendor registration and KYC documents for business",
    p: "Supplier onboarding, KYC packs and NDA cover sheets are recurring PDF forms for anyone selling to another company. Fill the same base details once, save the completed file, and reuse it as the template for every new client you onboard.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How do I fill out a PDF form for free?",
    a: "Click Select PDF file, pick your form, and this free PDF form filler generates a labelled input for every detected field, text boxes, checkboxes, dropdowns and radio groups. Fill out the PDF on screen, click Download Filled PDF and the completed document downloads to your device with a -filled suffix. No signup, no upload, no watermark, no Acrobat.",
    plain:
      "Click Select PDF file, pick your form, and this free PDF form filler generates a labelled input for each detected field (text, checkboxes, dropdowns, radio groups). Fill out the PDF on screen, then click Download Filled PDF to save a completed copy with a -filled suffix. No signup, no upload, no watermark, no Acrobat.",
  },
  {
    q: "Why can't I type into my PDF?",
    a: (
      <>
        The form is almost certainly a flat PDF, a scan or an exported
        image of a paper form, with no interactive AcroForm fields
        inside. This tool relies on those fields being present, so if
        the workspace says <em>No fillable form fields found in this
        PDF</em>, that is the reason. Open the same file in{" "}
        <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] underline">
          Edit PDF
        </Link>{" "}
        instead: its Text tool drops a text box wherever you click, on
        native pages or scans alike, so you can type answers straight
        onto the printed lines.
      </>
    ),
    plain:
      "Your form is flat, a scanned or image-based PDF with no interactive AcroForm fields inside, so this tool can't find fields to fill. Open it in Edit PDF (/tools/edit-pdf) instead and use its Text tool to type answers anywhere on the page.",
  },
  {
    q: "Can I tick checkboxes and select dropdown options?",
    a: "Yes. Checkbox fields in the source PDF appear as tickboxes in the panel and toggle with a click, and both dropdown and radio-group fields render as a Select that lists the exact options the form's designer defined. Picking one writes that value back into the field on export so the downloaded PDF shows the correct selection.",
    plain:
      "Yes. Checkboxes render as tickboxes, and dropdowns and radio groups render as a Select with the original options; your choice is written back into the field so the downloaded PDF shows the correct selection.",
  },
  {
    q: "Is what I type uploaded anywhere?",
    a: "No, and this is the point of the tool. Reading the form, generating the input for every field, storing the values you type and writing the final -filled.pdf all happen inside your browser tab using pdf-lib and standard Web APIs. Nothing you type into a field is transmitted to us, to any analytics provider or to any third party.",
    plain:
      "No. The form is opened, the fields are enumerated, your answers are stored and the completed PDF is written entirely inside your browser tab with pdf-lib and standard Web APIs. Nothing you type is transmitted anywhere.",
  },
  {
    q: "Can I save a partially filled form and continue later?",
    a: "The tool doesn't keep a draft between sessions, nothing you type is stored on our side, so closing the tab clears the inputs. To pause, click Download Filled PDF at any point: the tool writes whatever answers you've entered so far into a real filled PDF, and you can reopen that partly-filled copy here later to keep going from exactly where you stopped.",
    plain:
      "The tool doesn't keep drafts between sessions, closing the tab clears inputs. To pause, click Download Filled PDF at any point; the partly-filled copy can be reopened later and finished from where you left off.",
  },
  {
    q: "Will my answers show in other PDF readers?",
    a: "Yes. Because the tool writes values back into the PDF's native AcroForm fields with pdf-lib, not as a flat drawn overlay, the completed file is a proper filled form. Acrobat Reader, Preview, Chrome, Edge, Foxit and every other reader render the values in the same boxes and print them the same way.",
    plain:
      "Yes. Values are written back into the PDF's real AcroForm fields with pdf-lib, so Acrobat Reader, Preview, Chrome, Edge, Foxit and every other reader display and print the answers identically.",
  },
  {
    q: "Can I stop others from editing my answers after I send the form?",
    a: (
      <>
        Yes, run the completed file through{" "}
        <Link to="/tools/$slug" params={{ slug: "flatten-pdf" }} className="text-[#e5322d] underline">
          Flatten PDF
        </Link>
        . Flattening merges the form-field values into the page as fixed
        content and removes the interactive layer, so the recipient can
        read and print the answers but can't change them, blank them out
        or repurpose the blank form.
      </>
    ),
    plain:
      "Yes. Run the completed file through Flatten PDF (/tools/flatten-pdf), it merges the field values into the page as fixed content and removes the interactive layer so recipients can't edit or blank the answers.",
  },
  {
    q: "Can I sign the form too?",
    a: (
      <>
        Yes, save the filled form here, then open it in{" "}
        <Link to="/tools/$slug" params={{ slug: "sign-pdf" }} className="text-[#e5322d] underline">
          Sign PDF
        </Link>{" "}
        to draw or type a signature and stamp it into the signature
        block. Both tools run entirely in the browser, so the signed,
        filled PDF never touches a server.
      </>
    ),
    plain:
      "Yes. Save the filled form, open it in Sign PDF (/tools/sign-pdf) and draw or type a signature into the signature block. Both tools are entirely in-browser.",
  },
  {
    q: "Can I fill forms on my phone?",
    a: "Yes. The workspace is fully responsive, every detected field turns into a normal mobile input, so text fields open the on-screen keyboard, checkboxes toggle on tap and dropdowns open the phone's native picker. Download Filled PDF saves the completed file straight to your phone's downloads folder.",
    plain:
      "Yes. Every field becomes a normal mobile input: text fields open the keyboard, checkboxes toggle on tap and dropdowns use the native picker. Download Filled PDF saves the completed file to the phone's downloads folder.",
  },
  {
    q: "Do I need Adobe Acrobat?",
    a: "No. The whole tool is a web page and works in any modern browser, Chrome, Safari, Firefox, Edge, Brave. There's nothing to install, no Acrobat licence and no account, and the download you get is a standard, universally-readable filled PDF.",
    plain:
      "No. It's a web page that works in Chrome, Safari, Firefox, Edge or Brave, no install, no Acrobat licence, no account. The output is a standard filled PDF.",
  },
];

const related = [
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Make form fields and annotations permanent." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and place it on any page." },
  { to: "/tools/edit-pdf", name: "Edit & Annotate PDF", blurb: "Highlight, comment, draw and add shapes to a PDF." },
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Add a password and encrypt to lock the document." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine several PDFs into one file in the order you choose." },
  { to: "/tools/pdf-metadata", name: "PDF Metadata", blurb: "View and edit title, author, subject and keywords." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Overlay text or an image with adjustable opacity." },
  { to: "/tools/header-footer", name: "Header & Footer", blurb: "Stamp text at the top or bottom of every page." },
] as const;

export function FillFormsSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to fill out a PDF form online for free
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

      {/* Print-fill-scan */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Skip the print-fill-scan cycle
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The old ritual is familiar: download the form, hunt for a
        printer, fill each line by hand, then find a scanner or a phone
        app to send it back. What lands in the recipient's inbox is a
        slightly tilted, slightly grey copy with handwriting that
        someone will have to squint at.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        If your PDF has real form fields, all of that is unnecessary.
        Fill the same document directly on your screen and download a
        crisp copy where every value sits inside its intended box, in
        the intended font, perfectly straight. No printer, no scanner
        app, no hand-cramp, and the recipient gets a file that's
        cleanly indexable and searchable.
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        The private way to fill forms
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        Forms are the most personal documents most people ever fill.
        They ask, by design, for a full legal name, a residential
        address, a national ID or tax number, salary figures, sometimes
        medical history. When you fill that on an upload-based service,
        every one of those answers exists on someone else's server for
        as long as their retention policy says it should.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool takes a different route. The PDF is parsed with
        pdf-lib in your browser tab, the field inputs are generated
        locally, the answers you type live only in the tab's memory,
        and the finished file is written on your device. Nothing you
        enter into a form field is ever transmitted anywhere. Once the
        page has loaded, you can go offline and the whole flow keeps
        working, which is exactly what you want when you're typing a
        bank account number into a form at a café.
      </p>

      {/* Honest note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note: fillable vs flat forms
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        This tool works with PDFs that contain real interactive fields , 
        the kind where a cursor blinks in a box the moment you click
        it. A lot of forms in the wild aren't like that: they're
        pictures of forms, exported from a scanner or a print driver,
        with nothing interactive inside them at all. When you open one
        of those here, the workspace will show <em>No fillable form
        fields found in this PDF</em> and there won't be anything to
        type into.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        The fix is one click away. Open the same file in{" "}
        <Link to="/tools/$slug" params={{ slug: "edit-pdf" }} className="text-[#e5322d] underline">
          Edit PDF
        </Link>{" "}
        and use its Text tool to type answers straight onto the printed
        lines, it works identically on native PDFs and scans, so you
        can complete a flat form in the browser without ever printing
        it.
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
        When do you need to fill a PDF form?
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

export const fillFormsFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const fillFormsHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to fill out a PDF form online for free",
  description:
    "Fill interactive PDF forms entirely in the browser, text fields, checkboxes, dropdowns and radio groups, and download a proper filled AcroForm PDF. No upload, no signup, no watermark.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF form with interactive fields" }],
  tool: [{ "@type": "HowToTool", name: "PDFToolConverter Fill PDF Forms (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/fill-forms#step-${i + 1}`,
  })),
};

export const fillFormsSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Fill PDF Forms",
  description:
    "Fill PDF forms online free, type into text fields, tick checkboxes and select dropdown or radio options. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
