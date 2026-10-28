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
      name: "Can I convert both JPG and JPEG files?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. The tool accepts .jpg and .jpeg files and outputs PNG." },
    },
    {
      "@type": "Question",
      name: "Does converting to PNG improve image quality?",
      acceptedAnswer: { "@type": "Answer", text: "No. The tool decodes the JPG and encodes its pixels as PNG. It cannot restore detail lost through JPEG compression." },
    },
    {
      "@type": "Question",
      name: "Does conversion remove the background?",
      acceptedAnswer: { "@type": "Answer", text: "No. The tool does not include background removal. Converting an opaque JPG to PNG does not create transparent areas." },
    },
    {
      "@type": "Question",
      name: "Are there quality or resize settings?",
      acceptedAnswer: { "@type": "Answer", text: "No. This converter creates PNG output from the decoded image without exposing quality or resize controls." },
    },
    {
      "@type": "Question",
      name: "Can I download multiple converted files?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Download successful PNGs individually or together in a ZIP file. Failed files show an error without preventing other files from being processed." },
    },
    {
      "@type": "Question",
      name: "Why might a large image fail?",
      acceptedAnswer: { "@type": "Answer", text: "The tool checks decoded image dimensions before conversion. Browser decoding, canvas limits and device memory can also prevent conversion. Try a smaller image if processing fails." },
    },
  ],
};

export function JpgToPngSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">How to Convert JPG to PNG Online: Step by Step</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-1">Step 1: Upload Your JPG Files</h3>
      <p className="mt-2">
        Click the "Select JPG files" button or drag and drop your JPEG photos onto the upload area. You can add multiple JPG files at once for batch conversion. All processing happens locally in your browser, your images never leave your device.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-2">Step 2: Set Conversion Options</h3>
      <p className="mt-2">
        Since PNG is a lossless format, there are no quality settings to adjust like there are with JPG. The tool will automatically preserve the full fidelity of your original image during the conversion process.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-3">Step 3: Convert All Files</h3>
      <p className="mt-2">
        Click the convert button. The tool processes each JPG file individually in your browser using the Canvas API. Multiple files are converted simultaneously for fast batch processing. A progress indicator shows the status of each file.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-4">Step 4: Download Your PNG Files</h3>
      <p className="mt-2">
        Download individual PNG files or download all converted images at once as a ZIP archive. Every PNG output file is clean, no watermarks, no branding, and full quality preserved from the original JPG source.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">JPG vs PNG: Full Comparison</h2>
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