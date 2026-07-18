import type { ReactNode } from "react";
import { BenefitBadges } from "@/components/BenefitBadges";
import { Link } from "@tanstack/react-router";


const steps = [
  {
    title: "Open the PDF you want to edit",
    text: "Click Select PDF file and pick your document. Every page renders as a stacked vertical preview in the workspace, ready to be marked up — click any page thumbnail in the sidebar to jump straight to it.",
  },
  {
    title: "Pick a tool from the sidebar toolbar",
    text: "The right-hand sidebar shows nine tools laid out in a row: Select, Highlight, Text, Rectangle, Ellipse, Line, Arrow, Freehand and Image. Click one to arm it — a small style panel appears just below with the relevant colour swatches, font size, stroke width or fill opacity for whatever you're about to place.",
  },
  {
    title: "Click, drag or draw directly on the page",
    text: "Highlights, rectangles, ellipses, lines, arrows and text boxes are drawn by clicking and dragging on the page. Freehand follows your cursor or finger like a pen. Image drops the picture at the point you click. Switch back to Select at any time to grab an existing annotation and move it, resize it, or open its style panel to change colour and size.",
  },
  {
    title: "Undo, redo, then export as a new PDF",
    text: "The toolbar has Undo and Redo buttons (Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z), plus a Trash icon on any selected element to remove it. When the page looks right, click Save PDF — the tool draws every annotation permanently into a fresh copy of the file and hands it back with an -edited suffix. Your original file on your device is untouched.",
  },
];

const benefits = [
  {
    h: "Fill anything, form or not",
    p: "Type text boxes anywhere on the page — on a real PDF form field, on a flat scanned form that has no fields at all, in the blank space beside a printed line, on top of a wrong value. Font size runs from small caption text to headline size, and the colour swatch lets you match ink-blue or plain black.",
  },
  {
    h: "Review like on paper",
    p: "Highlight in yellow, green, pink or blue to mark passages. Draw a red rectangle or ellipse around a clause. Sketch a freehand circle or arrow with the Freehand and Arrow tools, or use Line for a quick strike-through. Everything a red-pen review needs is a click away in the toolbar.",
  },
  {
    h: "Every annotation becomes part of the PDF",
    p: "On export, each highlight, text box, shape, line, freehand path and image is drawn permanently into the page content stream with pdf-lib — not attached as a floating comment layer that some viewers ignore. The downloaded file shows your edits identically in Acrobat, Preview, Chrome, Edge, Foxit and every other reader.",
  },
  {
    h: "Free and unlimited",
    p: "There is no signup, no watermark on the output, no daily quota and no upsell to a paid plan for larger files. Edit a one-page form or a two-hundred-page contract in the same session and export as many revisions as you want.",
  },
];

const scenarios = [
  {
    h: "Filling a form that has no fillable fields",
    p: "Scanned tax forms, printed rental applications and older government PDFs frequently arrive without any interactive fields at all. Arm the Text tool, click on each blank line and type — no need to print, hand-fill and re-scan just because the original was flattened.",
  },
  {
    h: "Reviewing a contract or draft before sending it back",
    p: "Open the draft, highlight the clauses that need attention in yellow, draw a red rectangle around the payment terms, and drop a text box in the margin with your comment. Send the edited PDF back and the other side sees every note exactly where you put it.",
  },
  {
    h: "Correcting a small mistake without redoing the whole document",
    p: "Draw a Line through the wrong figure to strike it out and type the correct number beside it with the Text tool. It's the same workflow you'd do with a pen on a printout, but the result stays crisp and searchable in the exported PDF.",
  },
  {
    h: "Marking up study material and lecture slides",
    p: "Highlight the definitions that matter, circle example numbers with Freehand, and drop text boxes with your own explanations next to dense diagrams. The annotated PDF re-opens with every note in place on your laptop, tablet or phone.",
  },
];

const faqs: { q: string; a: ReactNode; plain: string }[] = [
  {
    q: "How can I edit a PDF for free without Adobe?",
    a: "Click Select PDF file, pick a tool from the sidebar (Highlight, Text, Rectangle, Ellipse, Line, Arrow, Freehand or Image), then click and drag on the page to place it. Use Select to grab existing annotations and adjust them, Undo/Redo to step through changes, and Save PDF when you're done to download an edited copy. No Acrobat, no install, no signup.",
    plain:
      "Click Select PDF file, pick a tool from the sidebar (Highlight, Text, Rectangle, Ellipse, Line, Arrow, Freehand, Image), click and drag on the page to place it, use Undo/Redo as needed, then click Save PDF to download an edited copy. No Acrobat, no install, no signup.",
  },
  {
    q: "Can I change or delete the existing text in a PDF?",
    a: (
      <>
        No — and this is worth being clear about. A PDF stores its existing
        text as fixed content on the page (often with fonts baked in and
        letters positioned individually), so it isn't editable the way a
        Word document is. This tool lets you <em>add</em> on top: type a
        new value beside the wrong one, draw a Line through text to strike
        it out, or paint a white Rectangle over a block to cover it. If
        you need to permanently remove sensitive content so it can't be
        recovered, use{" "}
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">
          Redact PDF
        </Link>
        . If the PDF has real interactive form fields, use{" "}
        <Link to="/tools/fill-forms" className="text-[#e5322d] underline">
          Fill PDF Forms
        </Link>{" "}
        to type into them properly.
      </>
    ),
    plain:
      "No. PDFs bake their text into the page, so you can't rewrite existing text here. You can add new text on top, strike through with a Line, or cover a block with a Rectangle. To permanently remove sensitive content use Redact PDF (/tools/redact-pdf); to fill real interactive form fields use Fill PDF Forms (/tools/fill-forms).",
  },
  {
    q: "Can I type on a scanned PDF?",
    a: "Yes. The Text tool places a text box at whatever coordinate you click, whether the page is a scanned image or a native PDF. Pick a font size that matches the surrounding print, choose a colour and type — the box behaves the same on a scan as it does on a digitally-generated page.",
    plain:
      "Yes. The Text tool places a text box wherever you click, on scanned images or native PDFs identically. Pick a font size and colour and type.",
  },
  {
    q: "Can I highlight text?",
    a: "Yes. Arm the Highlight tool and drag a rectangle over the passage you want to mark — you can pick yellow, green, pink or blue from the style panel. The highlight is a translucent coloured band drawn behind the text on export, so the words remain fully readable underneath.",
    plain:
      "Yes. Highlight tool draws a translucent yellow, green, pink or blue band over the area you drag; the text stays fully readable underneath on export.",
  },
  {
    q: "Can I draw on a PDF?",
    a: "Yes. Freehand follows your cursor or finger to draw any shape or signature-style scribble; Line and Arrow give clean straight strokes; Rectangle and Ellipse give closed shapes with optional fill and adjustable stroke width. Every one of them has its own colour swatch and thickness control in the sidebar.",
    plain:
      "Yes. Freehand for cursor/finger drawing; Line and Arrow for straight strokes; Rectangle and Ellipse for closed shapes with optional fill. Each tool has its own colour and thickness control.",
  },
  {
    q: "Will my edits show in other PDF readers?",
    a: "Yes. On Save PDF the tool uses pdf-lib to draw every highlight, text box, shape, freehand path and image directly into the page's content stream — not as loose comment annotations that some viewers hide. The exported file renders identically in Acrobat Reader, Preview, Chrome, Edge, Foxit and any other PDF viewer, and prints the same way too.",
    plain:
      "Yes. Edits are drawn directly into the page content stream with pdf-lib, not attached as comment-layer annotations. The exported file renders identically in every PDF viewer and prints the same.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Loading the PDF, painting the annotations onto the page previews and writing the final -edited.pdf all happen inside your browser tab using standard Web APIs. Nothing about the file is transmitted anywhere, and once the page has loaded the whole workflow keeps working offline.",
    plain:
      "No. The PDF is opened, annotated and re-saved entirely inside your browser tab. Nothing is uploaded, and the workflow keeps working offline once the page has loaded.",
  },
  {
    q: "Can I edit a PDF on my phone?",
    a: "Yes — the Freehand tool follows your finger, highlights and shapes are drawn by touch-drag, and text boxes open a normal on-screen keyboard for typing. Fine positioning on a small screen is easier if you drop the element first with a rough touch and then switch to Select to nudge it into place.",
    plain:
      "Yes. Freehand follows your finger, highlights and shapes are drawn by touch-drag, and text boxes open the on-screen keyboard. For precise placement, drop first and nudge with Select.",
  },
  {
    q: "Can I remove an annotation before saving?",
    a: "Yes. Switch to the Select tool, click the annotation you want to remove and press the Trash icon that appears in its style panel, or hit Delete on your keyboard. Undo (Ctrl/Cmd+Z) rolls back the last change; Redo (Ctrl/Cmd+Shift+Z) puts it back — the history keeps roughly a hundred steps.",
    plain:
      "Yes. Select the annotation and press the Trash icon or Delete key. Undo (Ctrl/Cmd+Z) and Redo (Ctrl/Cmd+Shift+Z) also work; history keeps about a hundred steps.",
  },
  {
    q: "How do I fill a PDF that has real form fields?",
    a: (
      <>
        Use{" "}
        <Link to="/tools/fill-forms" className="text-[#e5322d] underline">
          Fill PDF Forms
        </Link>{" "}
        instead. That tool detects the document's AcroForm fields (the
        clickable boxes and checkboxes the PDF's author set up) and lets
        you fill them directly, so the values are stored as proper form
        data rather than free-floating text on top of the page.
      </>
    ),
    plain:
      "Use Fill PDF Forms (/tools/fill-forms). It detects the document's AcroForm fields and lets you type into them directly so values are stored as real form data rather than free-floating text.",
  },
];

const related = [
  { to: "/tools/fill-forms", name: "Fill PDF Forms", blurb: "Type into the document's real AcroForm fields instead of placing text on top." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Draw or type a signature and stamp it anywhere across the document." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently remove sensitive content so it can't be recovered later." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Lock your annotations in place so no reader can move or delete them." },
  { to: "/tools/watermark", name: "Watermark PDF", blurb: "Stamp Draft, Confidential or your logo diagonally across every page." },
] as const;

export function EditPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <BenefitBadges items={["Files never leave your device", "Text, highlights, shapes & freehand drawing", "Free, no signup, no watermark"]} />

      {/* How-to */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to edit a PDF online for free
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

      {/* What you can add */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        What you can add to any PDF
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The sidebar toolbar exposes nine tools, each with its own style
        panel: <strong>Select</strong> for grabbing and adjusting anything
        already on the page; <strong>Highlight</strong> for translucent
        yellow, green, pink or blue bands over a passage; <strong>Text</strong>{" "}
        for typed text boxes with adjustable font size, colour and bold;{" "}
        <strong>Rectangle</strong> and <strong>Ellipse</strong> for closed
        shapes with a stroke colour, stroke width and optional filled
        interior at any opacity; <strong>Line</strong> and{" "}
        <strong>Arrow</strong> for clean straight strokes with a chosen
        colour and thickness; <strong>Freehand</strong> for pen-style
        drawing that follows the cursor or finger; and{" "}
        <strong>Image</strong> for dropping a PNG or JPG onto the page and
        resizing it. Everything is placed by click-and-drag or, in the
        case of Image, by a single click at the target spot.
      </p>

      {/* Honest note */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        An honest note: adding vs rewriting
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        A PDF is not a Word file. Its existing text is baked into the
        page — often with fonts embedded and each letter positioned
        individually — which means no browser tool can genuinely rewrite
        that text the way you'd edit a paragraph in a document. What this
        editor does is let you <em>add</em> new content on top: type
        corrections beside a wrong value, strike through with a Line,
        cover a block with a filled Rectangle, highlight a clause, or
        drop a comment in the margin.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        For everyday needs — filling a form that has no fields, marking
        up a review, correcting a typo, annotating study material — the
        add-on-top approach is exactly right. If you need to genuinely
        hide sensitive content so nobody can recover it, use{" "}
        <Link to="/tools/redact-pdf" className="text-[#e5322d] underline">
          Redact PDF
        </Link>
        . If the PDF has real interactive form fields you want to fill
        properly, use{" "}
        <Link to="/tools/fill-forms" className="text-[#e5322d] underline">
          Fill PDF Forms
        </Link>
        .
      </p>

      {/* Privacy differentiator */}
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Private editing, your documents stay yours
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The PDFs people edit are usually live working documents — a
        contract under review, an application with personal details, a
        salary slip being corrected, a form with a home address on
        it. This editor runs entirely inside your browser tab: the file
        loads locally, the annotations are painted on the local page
        previews and the final file is written on your device with
        pdf-lib. Nothing is transmitted to us or to any third party at
        any point.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        Once the page has finished loading you can disconnect from the
        internet and the whole editor keeps working. There is no account
        that remembers what you edited yesterday and no server-side copy
        that could be leaked in a breach.
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
        When do you need to edit a PDF?
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

export const editPdfFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.plain },
  })),
};

export const editPdfHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to edit a PDF online for free",
  description:
    "Edit and annotate any PDF entirely in the browser — add text, highlights, shapes, lines, arrows, freehand drawings and images, then save a new PDF. No upload, no signup, no watermark.",
  totalTime: "PT2M",
  supply: [{ "@type": "HowToSupply", name: "A PDF file to edit" }],
  tool: [{ "@type": "HowToTool", name: "PDFfree Edit PDF (web browser)" }],
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `/tools/edit-pdf#step-${i + 1}`,
  })),
};

export const editPdfSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFfree Edit PDF",
  description:
    "Edit PDF online free — add text, highlights, rectangles, ellipses, lines, arrows, freehand drawings and images to any PDF. Entirely in the browser. No upload, no signup, no watermark.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};
