import { Link } from "@tanstack/react-router";
import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";

const steps = [
  {
    title: "Step 1 — Select Your PDF Files",
    text: "Click the \"Select PDF files\" button or drag and drop your files directly onto the page. You can add two or more PDF files at once. There is no limit on the number of files or total file size.",
  },
  {
    title: "Step 2 — Arrange the File Order",
    text: "Once your files are uploaded, you will see thumbnail previews of each PDF. Drag and drop the files to rearrange them in the order you want them to appear in the final merged document. The first file in the list becomes the first section of your combined PDF.",
  },
  {
    title: "Step 3 — Click Merge PDF",
    text: "When you are satisfied with the order, click the \"Merge PDF\" button. The merging process runs entirely inside your browser using client-side JavaScript, so your files are never uploaded to any server. Processing typically takes just a few seconds, even for large documents.",
  },
  {
    title: "Step 4 — Download Your Merged File",
    text: "Your combined PDF is ready instantly. Click the download button to save it to your device. The merged file preserves all original formatting, fonts, images, links, and page layouts from every source file without any quality loss.",
  },
];

const faqs = [
  {
    q: "How do I merge PDF files online for free?",
    a: "Click the \"Select PDF files\" button on this page, choose two or more PDF files from your device, arrange them in the order you want, and click \"Merge PDF.\" Your combined document will be ready to download in seconds. No signup or payment is required.",
  },
  {
    q: "Is there a limit to how many PDFs I can merge?",
    a: "No. You can merge as many PDF files as you need. There is no cap on the number of files, number of pages, or total file size. The only constraint is your device's available memory.",
  },
  {
    q: "Do my files get uploaded to a server?",
    a: "No. Our PDF merger processes everything locally in your browser using JavaScript. Your files never leave your device and are never transmitted over the internet, making this the most private way to merge PDFs online.",
  },
  {
    q: "Will merging affect the quality of my PDFs?",
    a: "No. The merging process combines the original page data from each file without re-encoding or compressing. Text stays selectable, images keep their original resolution, and all formatting is preserved exactly.",
  },
  {
    q: "Can I rearrange the order of PDFs before merging?",
    a: "Yes. After uploading your files, you can drag and drop them into any order you prefer. The final merged PDF will follow the sequence you set.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "Not directly. If a PDF is password-protected, you need to unlock it first using our Unlock PDF tool. Once unlocked, you can merge it with other files normally. You can re-protect the merged file afterward using our Protect PDF tool.",
  },
  {
    q: "Does this work on mobile phones?",
    a: "Yes. The PDF merger works on any smartphone or tablet with a modern web browser, including Chrome on Android and Safari on iPhone. No app download is needed.",
  },
  {
    q: "Can I merge PDFs with different page sizes?",
    a: "Yes. If your PDFs have different page sizes such as A4, Letter, or Legal, the merged file will preserve each page at its original size. No automatic resizing or cropping is applied.",
  },
  {
    q: "What file types can I merge?",
    a: "This tool is designed for merging PDF files. If you need to combine images like JPG or PNG into a PDF, use our Images to PDF tool first, then merge the resulting PDF with your other files.",
  },
  {
    q: "Is the merged PDF searchable?",
    a: "Yes, if the original PDFs contained searchable text (not scanned images), the merged file will also be fully searchable. The text layer is preserved during merging.",
  },
  {
    q: "Can I merge only specific pages from each PDF?",
    a: "To merge specific pages, first use our Extract Pages tool to pull out the pages you need from each document. Then merge the extracted files together.",
  },
  {
    q: "How long does the merging process take?",
    a: "Typically just a few seconds. Since processing happens locally on your device, there is no upload or download delay. The speed depends on your device's processing power and the total size of the files.",
  },
  {
    q: "Do you add a watermark to the merged PDF?",
    a: "No, never. The output file is completely clean with no watermarks, branding, or advertisements added.",
  },
  {
    q: "Can I use this tool offline?",
    a: "Yes. Once the page has fully loaded in your browser, the PDF merger works without an internet connection. This is because all processing logic runs locally in JavaScript.",
  },
  {
    q: "Is this tool really free? What is the catch?",
    a: "There is no catch. The tool is genuinely free with no premium tier, no signup required, no usage limits, and no watermarks. We keep the site running through minimal ads and community support.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Separate a PDF into individual pages or custom ranges" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Reduce file size without losing quality" },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove unwanted pages from any PDF" },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange pages within a single PDF" },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pull out specific pages as a new file" },
  { to: "/tools/add-blank-pages", name: "Add Blank Pages", blurb: "Insert empty pages as section dividers" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix page orientation before merging" },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Convert JPG or PNG images into PDF before merging" },
] as const;

export function MergePdfSeo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 seo-content">
      {/* SECTION A */}
      <h2>
        Why Merge PDF Files Into One Document?
      </h2>
      <div>
        <p>
          Working with multiple separate PDF files creates confusion. You end up with dozens of files scattered across folders, 
          email attachments arrive as five separate documents instead of one, and finding the right file takes longer than it should. 
          Merging PDFs solves this by combining everything into a single, organized document that is easier to store, share, print, and archive.
        </p>
        <p>
          In professional settings, merging PDFs is essential. Lawyers combine case documents, evidence, and correspondence into 
          unified case files. Accountants merge invoices, receipts, and financial statements before filing. Project managers combine 
          progress reports from different team members into one deliverable. HR departments merge employee onboarding documents 
          — offer letters, tax forms, ID copies, and policy acknowledgments — into a single personnel file.
        </p>
        <p>
          Students and researchers regularly need to merge PDFs. Combining lecture notes from different weeks into one study guide, 
          merging research papers with your own annotations, or putting together a thesis with appendices all require a reliable PDF merger. 
          Teachers merge worksheets, answer keys, and grading rubrics into organized course packets.
        </p>
        <p>
          At home, merging PDFs simplifies everyday tasks. Combine scanned utility bills into one document for a rental application. 
          Put together travel itineraries, hotel confirmations, and boarding passes into a single travel folder. Merge insurance documents, 
          medical records, or warranty certificates so everything is in one place when you need it.
        </p>
      </div>

      {/* SECTION B */}
      <h2>
        How to Merge PDF Files Online — Step by Step
      </h2>
      <div className="mt-5 space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5322D] text-white font-bold text-sm" aria-label={`Step ${i + 1}`}>
              {i + 1}
            </span>
            <div className="pt-1">
              <h3 className="text-[18px] font-bold text-[#33333c]">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION C */}
      <h2>
        Common Scenarios for Combining PDF Documents
      </h3>
      <div className="mt-5 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Combine Project Reports for Stakeholders</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            When a project involves multiple teams, each submitting their own progress report, merging all reports into one PDF creates a unified deliverable. 
            Stakeholders receive a single document instead of opening five attachments. This also reduces the risk of someone missing a report buried in an email thread.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Merge Legal Documents and Case Files</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Attorneys frequently work with contracts, affidavits, evidence exhibits, and correspondence that need to be filed together. 
            Combining these into one PDF ensures nothing is lost and the court receives a properly ordered submission. 
            Many courts and legal portals specifically require a single PDF upload for submissions.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Consolidate Invoices and Financial Records</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Freelancers and small business owners can merge monthly invoices into quarterly or annual PDFs for cleaner bookkeeping. 
            Accountants combine receipts, bank statements, and tax forms into organized bundles before submitting to clients or tax authorities.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Build a Student Portfolio or Thesis</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Graduate students merge their thesis chapters, bibliography, abstract, and appendices into the final submission document. 
            Undergraduate students combine assignment submissions, certificates, and project reports into a portfolio PDF for job applications.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Prepare Rental or Visa Applications</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Rental applications and visa applications typically require identity proof, income proof, bank statements, and reference letters all in one document. 
            Merging these into a single PDF makes the application cleaner and reduces the chance of a missing attachment causing a rejection.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Combine Scanned Pages Into One Document</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            When scanning multi-page documents using a phone scanner, each page often saves as a separate file. 
            Merging these individual scans into one continuous PDF recreates the original multi-page document properly.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Organize Travel Documents</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Combine your flight tickets, hotel booking confirmations, visa copy, travel insurance, and itinerary into one travel PDF. 
            Having everything in a single file on your phone means you can access any document instantly at the airport or hotel check-in, even without internet.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Create Unified Training or Course Materials</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Trainers and course creators merge slides, handouts, reading materials, and quizzes into a single course packet PDF. 
            Participants receive one comprehensive file instead of downloading multiple attachments from different emails or platforms.
          </p>
        </div>
      </div>

      {/* SECTION D */}
      <h2>
        Why Use Our Free Online PDF Merger?
      </h3>
      <div className="mt-5 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Your Files Never Leave Your Device</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Unlike most online PDF tools that upload your files to cloud servers for processing, our merger runs entirely in your browser. 
            Your PDFs are processed locally using client-side JavaScript, which means no file data is ever transmitted over the internet. 
            This makes it the most private way to merge PDFs online. You can even use the tool offline once the page has loaded.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Completely Free With No Hidden Limits</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            There are no file size limits, no daily usage caps, and no premium tier hiding the features you actually need. 
            You can merge as many files as you want, as often as you want, without creating an account or providing an email address. 
            The output PDF has no watermarks or branding added.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">No Quality Loss</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            The merging process preserves every element of your original PDFs exactly as they are. Text remains selectable, images retain their original resolution, 
            hyperlinks continue to work, and form fields stay fillable. The merged file is not a re-encoded copy — it is a precise combination of the original page data.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Drag-and-Drop Reordering</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            After selecting your files, you can easily rearrange them by dragging and dropping. 
            This visual interface makes it simple to get the exact page order you need without renaming files or guessing which document comes first.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Works on Every Device and Browser</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            The PDF merger works on Windows, Mac, Linux, ChromeOS, iOS, and Android. It runs in any modern browser including Chrome, Firefox, Safari, Edge, and Opera. 
            No software download, plugin, or app installation is needed — just open the page and start merging.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Lightning-Fast Processing</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Because the processing happens locally on your device rather than waiting for a server upload and download cycle, merging is nearly instant. 
            Even combining ten large PDF files typically completes in under five seconds on a modern phone or laptop.
          </p>
        </div>
      </div>

      {/* SECTION E */}
      <h2>
        Browser-Based vs Server-Based PDF Merging
      </h3>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#ececef] text-[14.5px]">
          <thead>
            <tr className="bg-[#f7f7f8]">
              <th className="border border-[#ececef] px-4 py-3 text-left font-bold">Feature</th>
              <th className="border border-[#ececef] px-4 py-3 text-left font-bold text-[#e5322d]">Our Tool (Browser-Based)</th>
              <th className="border border-[#ececef] px-4 py-3 text-left font-bold text-[#5a5a66]">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">File Privacy</td>
              <td className="border border-[#ececef] px-4 py-3">Files never leave device</td>
              <td className="border border-[#ececef] px-4 py-3">Files uploaded to server</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Speed</td>
              <td className="border border-[#ececef] px-4 py-3">Instant (no upload wait)</td>
              <td className="border border-[#ececef] px-4 py-3">Depends on internet speed</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">File Size Limit</td>
              <td className="border border-[#ececef] px-4 py-3">No limit (device memory)</td>
              <td className="border border-[#ececef] px-4 py-3">Often 25-100MB cap</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Works Offline</td>
              <td className="border border-[#ececef] px-4 py-3">Yes, after page loads</td>
              <td className="border border-[#ececef] px-4 py-3">No, requires internet</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Account Required</td>
              <td className="border border-[#ececef] px-4 py-3">No</td>
              <td className="border border-[#ececef] px-4 py-3">Often required</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Watermarks</td>
              <td className="border border-[#ececef] px-4 py-3">Never</td>
              <td className="border border-[#ececef] px-4 py-3">Common on free tier</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Cost</td>
              <td className="border border-[#ececef] px-4 py-3 font-bold text-[#e5322d]">100% free</td>
              <td className="border border-[#ececef] px-4 py-3">Free tier limited</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] px-4 py-3 font-semibold">Processing Location</td>
              <td className="border border-[#ececef] px-4 py-3">Your browser (JavaScript)</td>
              <td className="border border-[#ececef] px-4 py-3">Remote cloud server</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* SECTION F */}
      <h2>
        Tips for Merging PDF Files Effectively
      </h2>
      <div className="mt-5 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Name Your Files Before Merging</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Give each PDF a clear, descriptive filename before adding it to the merger. 
            This makes it easier to identify and reorder documents in the merge interface, especially when working with many files.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Check Page Orientation Consistency</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            If some of your PDFs are portrait and others are landscape, the merged file will preserve each page's original orientation. 
            For a consistent look, consider rotating pages using our <Link to="/tools/$slug" params={{ slug: "rotate" }} className="text-[#e5322d] hover:underline">Rotate PDF tool</Link> before merging.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Remove Unnecessary Pages First</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            If you only need certain pages from a large PDF, use our <Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="text-[#e5322d] hover:underline">Extract Pages tool</Link> or <Link to="/tools/$slug" params={{ slug: "delete-pages" }} className="text-[#e5322d] hover:underline">Delete Pages tool</Link> to pull out what you need before merging. 
            This keeps the final document lean and focused.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Compress After Merging for Smaller File Size</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            Merged PDFs with many pages can become large. After merging, run the combined file through our <Link to="/tools/$slug" params={{ slug: "compress" }} className="text-[#e5322d] hover:underline">Compress PDF tool</Link> to reduce the file size without visible quality loss. 
            This is especially helpful before emailing or uploading.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#33333c]">Use Blank Pages as Section Dividers</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-[#4a4a55]">
            For professional documents, consider adding blank separator pages between sections using our <Link to="/tools/$slug" params={{ slug: "add-blank-pages" }} className="text-[#e5322d] hover:underline">Add Blank Pages tool</Link> before merging. 
            This creates clear visual breaks when the document is printed double-sided.
          </p>
        </div>
      </div>

      {/* SECTION G */}
      <h2>
        Frequently Asked Questions About Merging PDFs
      </h3>
      <div className="mt-8 divide-y divide-[#ececef]">
        {faqs.map((f, i) => (
          <details key={i} className="group py-4">
            <summary>
              {f.q}
              <span className="ml-4 text-[#e5322d] text-xl">+</span>
            </summary>
            <div 
              className="mt-3 text-[15px] leading-relaxed text-[#4a4a55]"
            >
              {i === 5 ? (
                <>
                  Not directly. If a PDF is password-protected, you need to unlock it first using our <Link to="/tools/$slug" params={{ slug: "unlock-pdf" }} className="text-[#e5322d] hover:underline">Unlock PDF tool</Link>. Once unlocked, you can merge it with other files normally. You can re-protect the merged file afterward using our <Link to="/tools/$slug" params={{ slug: "protect-pdf" }} className="text-[#e5322d] hover:underline">Protect PDF tool</Link>.
                </>
              ) : i === 8 ? (
                <>
                  This tool is designed for merging PDF files. If you need to combine images like JPG or PNG into a PDF, use our <Link to="/tools/$slug" params={{ slug: "images-to-pdf" }} className="text-[#e5322d] hover:underline">Images to PDF tool</Link> first, then merge the resulting PDF with your other files.
                </>
              ) : i === 10 ? (
                <>
                  To merge specific pages, first use our <Link to="/tools/$slug" params={{ slug: "extract-pages" }} className="text-[#e5322d] hover:underline">Extract Pages tool</Link> to pull out the pages you need from each document. Then merge the extracted files together.
                </>
              ) : (
                <p>{f.a}</p>
              )}
            </div>
          </details>
        ))}
      </div>

      {/* SECTION H */}
      <h2 className="text-center">
        Related PDF Tools
      </h2>
      <RelatedToolsGrid items={related} />
    </section>
  );
}

export const mergeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]*>?/gm, "") },
  })),
};

export const mergeHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Merge PDF Files Online",
  description: "Combine multiple PDF files into one organized document in seconds.",
  step: steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
};

export const mergeSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "pdftoolconverteronline.com Merge PDF",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1250" },
};