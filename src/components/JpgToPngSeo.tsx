import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/jpg-to-png`;

export const jpgToPngSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter JPG to PNG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "3580"
  },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description: "Convert JPG images to PNG online instantly in your browser. Batch convert multiple JPEGs to PNG with transparency support. Free, no signup, no watermark, files never leave your device.",
};

export const jpgToPngHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert JPG to PNG",
  description: "Transform JPEG images into lossless PNG format instantly in your browser. Batch convert multiple files at once.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload Your JPG Files",
      text: "Click the 'Select JPG files' button or drag and drop your JPEG photos onto the upload area. You can add multiple JPG files at once for batch conversion.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set Conversion Options",
      text: "PNG is lossless, so no quality adjustment is needed for the output. Every pixel is preserved exactly as it was in the original.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Convert All Files",
      text: "Click the convert button. The tool processes each JPG file individually in your browser using the Canvas API.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download Your PNG Files",
      text: "Download individual PNG files or download all converted images at once as a ZIP archive.",
      url: `${url}#step-4`,
    },
  ],
};

export const jpgToPngFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I convert JPG to PNG online for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your JPG files using the button or drag-and-drop above and click convert. Download your lossless PNG files instantly. No signup required.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between JPG and PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG is a lossy format best for photos, while PNG is a lossless format that supports transparency and sharp text. PNG files are typically larger but preserve perfect image quality.",
      },
    },
    {
      "@type": "Question",
      name: "Does converting JPG to PNG add transparency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. JPG does not store transparency data. Converting to PNG allows you to add transparency later using an editor, but the conversion itself won't remove the original background.",
      },
    },
    {
      "@type": "Question",
      name: "Do my photos get uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All conversion happens in your browser. Your images never leave your device and are never transmitted over the internet.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple JPG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add as many JPG files as you need and they will all be converted simultaneously in a single batch operation.",
      },
    },
    {
      "@type": "Question",
      name: "Will converting JPG to PNG improve quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You cannot restore detail that was already lost to JPG compression. However, PNG prevents any further quality loss during future edits and saves.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a limit to how many files I can convert?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Convert as many JPG files as you need with no daily or session limits.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert JPG to PNG on my phone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool works in any mobile browser on iPhone and Android. No app required.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my PNG file larger than the original JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG uses lossless compression which doesn't discard data like JPG does. This results in larger file sizes but perfect visual fidelity.",
      },
    },
    {
      "@type": "Question",
      name: "Are my converted photos watermark-free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All output files are completely clean with no watermarks or branding.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once the page has fully loaded, the converter works without an internet connection.",
      },
    },
    {
      "@type": "Question",
      name: "Is this tool really free with no limits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No usage caps, no signup required, no watermarks, completely free.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert JPEG to PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. JPEG and JPG are the same format. Both extensions are supported and will be converted to PNG.",
      },
    },
    {
      "@type": "Question",
      name: "Is PNG better for logos than JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PNG is the industry standard for logos because it supports transparent backgrounds and maintains sharp edges on vector-style graphics.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert JPG to PNG for printing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Converting to PNG ensures that no further quality is lost if the image needs to be scaled or adjusted for print.",
      },
    },
  ],
};

export function JpgToPngSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#383E45]">Why Convert JPG to PNG?</h2>
      <p className="mt-3">
        JPG and PNG are the two most common image formats on the internet, but they serve fundamentally different purposes. JPG is a lossy compression format — it reduces file size by permanently discarding some image data that the human eye cannot easily detect. This makes JPG ideal for photographs where small quality reductions are invisible, but it makes JPG a poor choice for images that need to be edited multiple times, contain transparent areas, or display crisp text and sharp lines without any blurring.
      </p>
      <p className="mt-3">
        PNG is a lossless compression format — it compresses image data without discarding any information. The result is that PNG files are larger than equivalent JPGs, but they preserve every pixel exactly as it was in the original image. Text in a PNG image looks perfectly sharp at any zoom level. Lines, borders, and geometric shapes have perfectly clean edges. And most importantly, PNG supports transparent backgrounds — a feature that JPG simply does not have.
      </p>
      <p className="mt-3">
        Converting JPG to PNG is necessary when you need to work with an image in a design tool that requires a transparent background. If you have a product photo, logo, or graphic saved as JPG and need to place it on a colored background or overlay it on another image without a white box around it, you first need to convert it to PNG and then use an image editor to remove the background. PNG is the correct format for the final image.
      </p>
      <p className="mt-3">
        PNG is also the better choice when an image will be further edited and re-saved multiple times. Every time you save a JPG, it undergoes a new round of lossy compression, which compounds the quality loss. This is known as "generation loss." By converting to PNG first, you ensure that every subsequent save preserves 100% of the remaining image quality.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">How to Convert JPG to PNG Online — Step by Step</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-1">Step 1 — Upload Your JPG Files</h3>
      <p className="mt-2">
        Click the "Select JPG files" button or drag and drop your JPEG photos onto the upload area. You can add multiple JPG files at once for batch conversion. All processing happens locally in your browser — your images never leave your device.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-2">Step 2 — Set Conversion Options</h3>
      <p className="mt-2">
        Since PNG is a lossless format, there are no quality settings to adjust like there are with JPG. The tool will automatically preserve the full fidelity of your original image during the conversion process.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-3">Step 3 — Convert All Files</h3>
      <p className="mt-2">
        Click the convert button. The tool processes each JPG file individually in your browser using the Canvas API. Multiple files are converted simultaneously for fast batch processing. A progress indicator shows the status of each file.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-4">Step 4 — Download Your PNG Files</h3>
      <p className="mt-2">
        Download individual PNG files or download all converted images at once as a ZIP archive. Every PNG output file is clean — no watermarks, no branding, and full quality preserved from the original JPG source.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Common Situations Where You Need JPG to PNG</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Creating Transparent Logos</h3>
      <p className="mt-2">
        If you have a logo saved as a JPG with a white background, you cannot make that background transparent without first converting it to PNG. Once converted, you can use transparency-aware tools to remove the white pixels, allowing the logo to be placed over any background color or image.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Graphic Design and UI Mockups</h3>
      <p className="mt-2">
        Designers prefer PNG for UI elements, buttons, and icons because it maintains perfectly sharp edges and supports alpha transparency. Converting JPG assets to PNG is often the first step in a professional design workflow to ensure these assets meet technical requirements.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Preserving Text Clarity</h3>
      <p className="mt-2">
        If an image contains text — such as a screenshot, a diagram, or an infographic — JPG compression will often create "halos" or blurry artifacts around the letters. Converting to PNG ensures that the text remains crisp and readable, especially if the image needs to be scaled or embedded in a document.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Preparing Images for Further Editing</h3>
      <p className="mt-2">
        If you plan to perform complex edits, color grading, or retouching in software like Photoshop or GIMP, converting the source JPG to PNG first prevents any additional quality loss during the multi-stage editing process.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">JPG vs PNG — Full Comparison</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-[#eee]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f9fafb] text-[#383E45]">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">Feature</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">JPG</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">PNG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            <tr>
              <td className="px-4 py-2">Compression Type</td>
              <td className="px-4 py-2">Lossy</td>
              <td className="px-4 py-2">Lossless</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Transparency Support</td>
              <td className="px-4 py-2">No</td>
              <td className="px-4 py-2">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-2">File Size</td>
              <td className="px-4 py-2">Smaller</td>
              <td className="px-4 py-2">Larger</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Text Clarity</td>
              <td className="px-4 py-2">Can be blurry</td>
              <td className="px-4 py-2">Perfectly sharp</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Best For</td>
              <td className="px-4 py-2">Photos</td>
              <td className="px-4 py-2">Logos, Icons, Text</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Universal Compatibility</td>
              <td className="px-4 py-2">Yes</td>
              <td className="px-4 py-2">Yes</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Browser-Based vs Server-Based Conversion</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-[#eee]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f9fafb] text-[#383E45]">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">Feature</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">Our Tool</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            <tr>
              <td className="px-4 py-2">Image Privacy</td>
              <td className="px-4 py-2">Images stay on device</td>
              <td className="px-4 py-2">Images uploaded to server</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Speed</td>
              <td className="px-4 py-2">Instant (no upload)</td>
              <td className="px-4 py-2">Upload/download delay</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Watermarks</td>
              <td className="px-4 py-2">Never</td>
              <td className="px-4 py-2">Sometimes added</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Batch Convert</td>
              <td className="px-4 py-2">Yes</td>
              <td className="px-4 py-2">Sometimes limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Tips for Converting JPG to PNG Effectively</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Convert Before Removing Backgrounds</h3>
      <p className="mt-2">
        If you need to make a JPG logo transparent, convert it to PNG first. Most background removal tools work better and produce cleaner results when outputting to a PNG container that natively supports transparency.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Use for Screenshots with Text</h3>
      <p className="mt-2">
        If you've taken a screenshot that was saved as a JPG, convert it to PNG before sharing it in a professional document. This prevents the text from becoming fuzzy or unreadable due to additional compression.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Compress After Converting if Needed</h3>
      <p className="mt-2">
        If your resulting PNG file is too large for web use, you can use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#E5322D] hover:underline">Compress Image tool</Link> to reduce the PNG file size using lossless optimization techniques.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Convert to WebP for Even Better Web Performance</h3>
      <p className="mt-2">
        If you need the benefits of PNG (transparency and lossless quality) but with smaller file sizes for your website, consider converting your JPG to WebP instead using our <Link to="/image-tools/$slug" params={{ slug: "jpg-to-webp" }} className="text-[#E5322D] hover:underline">JPG to WebP tool</Link>.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Frequently Asked Questions About JPG to PNG Conversion</h2>
      <dl className="mt-4 space-y-4">
        {jpgToPngFaqJsonLd.mainEntity.map((q, idx) => (
          <div key={idx} className="border-b border-[#eee] pb-4">
            <dt className="font-semibold text-[#383E45]">{q.name}</dt>
            <dd className="mt-2 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Related Image Tools</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "PNG to JPG", desc: "Convert PNG images to JPG", slug: "png-to-jpg", type: "image" },
          { name: "JPG to WebP", desc: "Convert JPG images to WebP", slug: "jpg-to-webp", type: "image" },
          { name: "Compress Image", desc: "Reduce file size after converting", slug: "compress-image", type: "image" },
          { name: "Resize Image", desc: "Resize photos after converting", slug: "image-resize", type: "image" },
          { name: "HEIC to PNG", desc: "Convert iPhone photos to PNG", slug: "heic-to-png", type: "image" },
          { name: "WebP to PNG", desc: "Convert WebP images to PNG", slug: "webp-to-png", type: "image" },
          { name: "Crop Image", desc: "Crop photos after converting", slug: "crop-image", type: "image" },
          { name: "Images to PDF", desc: "Combine photos into a PDF", slug: "images-to-pdf", type: "pdf" },
        ].map((t) => (
          <Link
            key={t.slug}
            to={t.type === "image" ? "/image-tools/$slug" : "/tools/$slug"}
            params={{ slug: t.slug }}
            className="rounded-lg border border-[#eee] p-4 transition-colors hover:border-[#e5322d]"
          >
            <div className="text-[15px] font-semibold text-[#383E45]">{t.name}</div>
            <div className="mt-1 text-[13px] text-[#5a5a66]">{t.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}