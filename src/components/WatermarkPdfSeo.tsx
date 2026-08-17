import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/tools/watermark`;

const steps = [
  {
    title: "Upload Your PDF File",
    text: "Select the PDF document you want to watermark or drag and drop it into the upload zone. The file is processed entirely in your browser using local resources, ensuring your sensitive data never leaves your device.",
  },
  {
    title: "Configure Watermark Settings",
    text: "Choose between a text watermark (like 'DRAFT', 'CONFIDENTIAL', or your name) or upload an image/logo. Adjust the position, opacity, font size, and rotation to your liking. You can see the changes in real-time.",
  },
  {
    title: "Apply the Watermark",
    text: "Once you are happy with the preview, click the 'Apply Watermark' button. Our tool will bake the watermark into every page of your PDF document using high-fidelity rendering that preserves original quality.",
  },
  {
    title: "Download Your Document",
    text: "Your watermarked PDF will be generated instantly. Download the file to your computer or mobile device. The output is 100% clean and free of any branding from our tool.",
  },
];

const faqs = [
  {
    q: "How do I add a watermark to a PDF for free?",
    a: "Simply upload your PDF to our online tool, type your text or upload a logo, adjust the settings, and click 'Apply Watermark'. You can then download your file for free without any signups or watermarks from us.",
  },
  {
    q: "Can I add both text and image watermarks?",
    a: "Currently, our tool allows you to add either a text-based watermark or an image-based watermark in a single pass. If you need both, you can run the document through the tool a second time.",
  },
  {
    q: "Will the watermark appear on every page of the PDF?",
    a: "Yes, the tool is designed to apply the watermark consistently across every single page of your document automatically.",
  },
  {
    q: "Is it possible to change the opacity of the watermark?",
    a: "Absolutely. You can use the opacity slider to make the watermark very subtle (transparent) or bold and opaque, depending on your needs.",
  },
  {
    q: "Do my files get stored on your servers?",
    a: "No. Unlike other services, PDFToolConverter processes everything locally in your web browser. Your files never leave your device, ensuring total privacy.",
  },
  {
    q: "What is the best position for a PDF watermark?",
    a: "For security, a large diagonal watermark across the center of the page is most effective. For branding, a small logo in the header or footer corner is preferred.",
  },
  {
    q: "Can I watermark protected or encrypted PDFs?",
    a: "You will need to unlock the PDF first using our 'Unlock PDF' tool if it has a password that prevents editing or printing.",
  },
  {
    q: "Does watermarking increase the file size significantly?",
    a: "Text watermarks add negligible size. Image watermarks will increase the size based on the dimensions and quality of the image you upload.",
  },
  {
    q: "Can I choose the font for my text watermark?",
    a: "Yes, we provide several standard fonts that are universally compatible with all PDF readers to ensure your watermark looks consistent everywhere.",
  },
  {
    q: "Is there a limit on how many PDFs I can watermark?",
    a: "No, our tool is completely free with no daily limits or file count restrictions.",
  },
  {
    q: "Can I remove a watermark after it has been applied?",
    a: "Once a watermark is 'baked' into the PDF layers, it is difficult to remove without professional editing software. We recommend keeping a backup of your original file.",
  },
  {
    q: "Does this tool work on mobile devices?",
    a: "Yes, PDFToolConverter is fully responsive and works perfectly on Chrome, Safari, and other modern browsers on iPhone and Android.",
  },
  {
    q: "Can I watermark a PDF with multiple lines of text?",
    a: "Yes, our text watermark tool supports multi-line input so you can add detailed disclaimers or copyright notices.",
  },
  {
    q: "What image formats are supported for watermarking?",
    a: "You can upload JPG, PNG, or WebP images to use as watermarks. PNG is recommended for logos with transparency.",
  },
  {
    q: "Is this tool safe for business and legal documents?",
    a: "Yes. Because the processing is local, your business secrets and legal documents are never exposed to the internet.",
  },
];

const related = [
  { to: "/tools/protect-pdf", name: "Protect PDF", blurb: "Encrypt your PDF with a strong password." },
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine multiple files into one PDF." },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce PDF file size without losing quality." },
  { to: "/tools/flatten-pdf", name: "Flatten PDF", blurb: "Lock form fields and annotations permanently." },
  { to: "/tools/redact-pdf", name: "Redact PDF", blurb: "Permanently hide sensitive information." },
  { to: "/tools/sign-pdf", name: "Sign PDF", blurb: "Add your electronic signature to any document." },
  { to: "/tools/edit-pdf", name: "Edit PDF", blurb: "Change text and add annotations to your PDF." },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove passwords from protected documents." },
] as const;

export function WatermarkPdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 text-[#33333c]">
      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Why watermark a PDF?
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4a4a55]">
        <p>
          Watermarking a PDF is one of the most effective ways to protect your intellectual property and control how your documents are used. By placing a visible layer of text or an image over your pages, you clearly communicate the ownership and status of the file. Whether you are distributing a draft for review or sharing a confidential report, a watermark acts as a constant reminder of the document's sensitive nature.
        </p>
        <p>
          Beyond security, watermarks are essential for branding. When you send out invoices, proposals, or white papers, adding your company logo as a subtle background element reinforces your professional identity. It ensures that even if pages are printed or shared individually, the source of the information remains unmistakable.
        </p>
        <p>
          For legal and official documents, watermarks serve as a deterrent against unauthorized copying and tampering. A diagonal 'CONFIDENTIAL' or 'COPY' stamp makes it much harder for someone to pass off your work as their own or to use a temporary draft as a final agreement. It adds a layer of psychological security that discourages casual data theft.
        </p>
        <p>
          Finally, watermarking is a practical tool for workflow management. Using stamps like 'PAID', 'REVIEWED', or 'VOID' helps organizations track the lifecycle of a document at a glance. In a digital-first world, these visual cues are invaluable for maintaining order across large volumes of paperwork.
        </p>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        How to Add Watermark to PDF Online — Step by Step
      </h2>
      <ol className="mt-5 space-y-4">
        {steps.map((s, i) => (
          <li key={i} id={`step-${i + 1}`} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e5322d] text-white font-bold text-sm">
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Choosing the Right Watermark Type
      </h2>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#1F2937]">Text Watermark</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Text watermarks are the most common choice for status labels and security warnings. You can type any custom text, such as 'DRAFT', 'DO NOT COPY', or your email address. Our tool allows you to customize the font size, color, and rotation. A diagonal red text watermark is the industry standard for marking confidential documents because it intersects with the main content, making it nearly impossible to remove without damaging the underlying text.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#1F2937]">Image Watermark</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Image watermarks are perfect for corporate branding. By uploading your company logo (preferably a PNG with a transparent background), you can create professional-looking documents that carry your visual identity on every page. You can adjust the scale and opacity of the image to ensure it doesn't interfere with the readability of the document while still remaining clearly visible as a brand mark.
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        8 Professional Use Cases for PDF Watermarking
      </h2>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-[17px] font-semibold">1. Business Documents</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Protect your internal memos, strategy documents, and project plans. Adding a company-specific watermark ensures that sensitive business logic remains tied to your organization's identity even if files are leaked.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">2. Confidential Reports</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Stamp investigative reports or financial audits with 'CONFIDENTIAL'. This visual warning is a critical part of data governance and compliance, reminding every reader of their nondisclosure obligations.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">3. Draft Documents</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            When circulating a contract or a manuscript for edits, a 'DRAFT' watermark prevents the document from being mistaken for the final, approved version. This prevents costly errors in legal and publishing workflows.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">4. Copyright Protection</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Photographers, writers, and designers can protect their portfolios and sample works by adding a copyright notice watermark. It allows you to share your work with potential clients while discouraging unauthorized reuse.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">5. Invoice Branding</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Give your invoices a premium feel by adding a faint logo watermark in the background. It makes your billing documents look official and harder to forge, adding a layer of trust to your financial transactions.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">6. Legal Documents</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Law firms use watermarks like 'EXHIBIT A' or 'CERTIFIED COPY' to categorize evidence and court filings. This tool allows for the rapid labeling of large PDF bundles without needing specialized legal software.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">7. Real Estate Listings</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Real estate agents can protect property floor plans and brochures by adding their agency's contact information as a watermark. This ensures that their effort in creating these marketing materials isn't hijacked by competitors.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold">8. Academic Work</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Students and researchers can watermark their theses or unpublished papers before submission. It provides a clear trail of ownership and protects against plagiarism during the peer-review process.
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Watermark Position and Opacity Guide
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[#4a4a55]">
        The effectiveness of a watermark depends heavily on its placement and transparency. A watermark that is too opaque can make the text underneath impossible to read, while one that is too faint might be missed entirely. For security purposes, we recommend a center-page placement with a 45-degree rotation and an opacity between 20% and 40%. This ensures the watermark covers the core content without obstructing the reader.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]">
        For branding, a corner placement (top-right or bottom-right) is often better. In these cases, you can afford higher opacity (60% to 80%) because the logo is not competing with the main body text. Our tool provides a real-time preview, allowing you to fine-tune these settings until you achieve the perfect balance between visibility and legibility.
      </p>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Browser-Based vs Server-Based Watermarking
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#ececef] text-left text-[14px]">
          <thead>
            <tr className="bg-[#f9fafb]">
              <th className="border border-[#ececef] p-3 font-semibold">Feature</th>
              <th className="border border-[#ececef] p-3 font-semibold">PDFToolConverter (Browser)</th>
              <th className="border border-[#ececef] p-3 font-semibold">Traditional Online Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Privacy</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">100% Secure - Files never leave your device</td>
              <td className="border border-[#ececef] p-3">Files uploaded to a 3rd party server</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Speed</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">Instant - No upload or download wait time</td>
              <td className="border border-[#ececef] p-3">Dependent on internet upload speed</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Output Quality</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">Original Quality Preserved</td>
              <td className="border border-[#ececef] p-3">Often compressed to save server space</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3 font-medium">Limits</td>
              <td className="border border-[#ececef] p-3 text-green-600 font-medium">No file size or page limits</td>
              <td className="border border-[#ececef] p-3">Often restricted to 50MB or 20 pages</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        5 Tips for Effective PDF Watermarking
      </h2>
      <div className="mt-6 space-y-5">
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Keep Background Colors in Mind</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            If your PDF has a colored background, choose a watermark color that provides enough contrast. A light gray watermark might disappear on a beige page, whereas a dark blue or red one will remain clear.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Use PNG for Image Logos</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            Always use a PNG file with transparency for logo watermarks. This prevents an ugly white box from appearing around your logo when it is placed over text or images in the PDF.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Don't Over-Rotate</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            While a 45-degree angle is standard, extreme angles can sometimes make the watermark look like a mistake or a glitch. Stick to 30 to 45 degrees for the most professional appearance.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Check Every Page</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            If your PDF has varying layouts (e.g., some pages are text-heavy, others are full-page images), check the preview to ensure the watermark position works well for all of them.
          </p>
        </div>
        <div>
          <h3 className="text-[17px] font-semibold text-[#1F2937]">Combine with Password Protection</h3>
          <p className="mt-1 text-[14.5px] leading-relaxed text-[#4a4a55]">
            For maximum security, watermark your file and then use our <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="text-[#e5322d] hover:underline">Protect PDF</Link> tool to encrypt it. This makes it much harder for someone to strip the watermark and reuse the file.
          </p>
        </div>
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 divide-y divide-[#eee]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary className="cursor-pointer list-none text-[15.5px] font-semibold flex justify-between items-center text-[#1F2937]">
              {f.q}
              <span className="ml-4 text-[#e5322d] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a4a55]">{f.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-14 text-[24px] sm:text-[28px] font-bold tracking-tight">
        Related PDF Tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const watermarkFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const watermarkHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a watermark to a PDF online for free",
  description: "Add a text or image watermark to every page of a PDF online for free. Control opacity, position, and rotation entirely in your browser.",
  totalTime: "PT1M",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
    url: `${url}#step-${i + 1}`,
  })),
};

export const watermarkSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter Watermark Tool",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1240",
  },
};
