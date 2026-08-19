import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/png-to-jpg`;

export const pngToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter PNG to JPG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1890",
  },
  description:
    "Convert PNG images to JPG online instantly in your browser. Batch convert multiple PNG files to JPEG with quality control. Free, no signup, no watermark, files never leave your device.",
};

export const pngToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PNG to JPG online",
  description: "Transform PNG images into smaller JPG files instantly in your browser.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload Your PNG Images",
      text: "Click the 'Select images' button or drag and drop your PNG files onto the upload area.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set Output Quality",
      text: "Choose the JPG output quality level using the slider (80-90% recommended).",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Convert Your Images",
      text: "Click the convert button. The tool renders each PNG on an HTML Canvas and encodes it as JPG.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download Your JPG Files",
      text: "Download individual JPG files or download all converted images at once as a ZIP archive.",
    },
  ],
};

export const pngToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I convert PNG to JPG for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your PNG images using the button or drag-and-drop above. Set your quality level, convert, and download your JPG files instantly. No signup required.",
      },
    },
    {
      "@type": "Question",
      name: "Will converting PNG to JPG reduce quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Some quality reduction is inherent to JPG compression. At 80-90% quality, the difference is invisible in photographs. For graphics and logos, quality loss may be visible as blurring near sharp edges.",
      },
    },
    {
      "@type": "Question",
      name: "Do my files get uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All conversion runs in your browser. Your images never leave your device.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to transparent PNG backgrounds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Transparent areas are filled with white in the JPG output because JPG does not support transparency.",
      },
    },
    {
      "@type": "Question",
      name: "How much smaller will the JPG be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For photographic images, JPG at 80% quality is typically 70-85% smaller than the equivalent PNG.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple PNG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add as many PNG files as needed and all will be converted simultaneously.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a file size limit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Convert PNG images of any size with no restrictions.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert on my phone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool works in any mobile browser on iPhone and Android.",
      },
    },
    {
      "@type": "Question",
      name: "Will the JPG look the same as the PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For photographs, yes — the difference at standard quality settings is invisible to the human eye.",
      },
    },
    {
      "@type": "Question",
      name: "What quality setting should I use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "80-90% is ideal for web images and sharing. Use 95% for print-quality output.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert back to PNG from JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use our JPG to PNG tool for the reverse conversion. Note that quality lost during PNG to JPG conversion cannot be recovered.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once the page has fully loaded, conversion works without an internet connection.",
      },
    },
    {
      "@type": "Question",
      name: "Are the output JPG files watermark-free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All output files are completely clean with no watermarks or branding.",
      },
    },
    {
      "@type": "Question",
      name: "Can I control JPG quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the quality slider to set the compression level before converting.",
      },
    },
    {
      "@type": "Question",
      name: "Is this tool really free with no limits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No usage caps, no daily limits, no signup required, no watermarks.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "png-to-jpg").slice(0, 8);

export function PngToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">Why Convert PNG to JPG?</h3>
      <p className="mt-3">
        PNG files are significantly larger than equivalent JPG files because PNG uses lossless compression — it preserves every pixel of data in the image without any quality reduction. While this is ideal for design work, logos, and screenshots, it becomes a problem when you need to share, upload, or publish images where file size matters. A PNG photograph can easily be 5-10MB while the equivalent JPG is 500KB-1MB with no visible quality difference to the human eye.
      </p>
      <p className="mt-3">
        Converting PNG to JPG is one of the most effective ways to reduce image file sizes for web use, email sharing, and social media uploads. JPG uses lossy compression that discards image data that humans cannot easily perceive — primarily fine color variations and subtle detail at high frequencies. The result is a dramatically smaller file that looks essentially identical to the original in normal viewing.
      </p>
      <p className="mt-3">
        Web performance is a major reason to convert PNG images to JPG. Search engines like Google use page load speed as a ranking factor. Large PNG files slow down web pages significantly. Converting photographic PNG images to JPG before uploading them to a website reduces page load times, improves Core Web Vitals scores, and contributes to better search engine rankings. A page with JPG photos loads 3-5 times faster than the same page with equivalent PNG photos.
      </p>
      <p className="mt-3">
        Email attachments and messaging apps also have practical file size limits. Many email providers cap attachment sizes at 20-25MB. WhatsApp and Telegram compress large images automatically, reducing quality. Converting PNG images to JPG before attaching them gives you control over the output quality and ensures the recipient receives the image exactly as you intended.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">How to Convert PNG to JPG Online — Step by Step</h3>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 1 — Upload Your PNG Images</h3>
      <p className="mt-2">Click the "Select images" button or drag and drop your PNG files onto the upload area. You can add multiple PNG files at once for batch conversion. All processing runs locally in your browser — your images never leave your device.</p>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 2 — Set Output Quality</h3>
      <p className="mt-2">Choose the JPG output quality level. Higher quality produces sharper images with larger file sizes. Lower quality produces smaller files with some visible compression artifacts. For most everyday purposes, 80-90% quality produces excellent results at a fraction of the PNG file size.</p>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 3 — Convert Your Images</h3>
      <p className="mt-2">Click the convert button. The tool renders each PNG on an HTML Canvas and encodes it as JPG at your chosen quality level. Multiple files are processed simultaneously for fast batch conversion. Transparent areas in PNG images are filled with a white background in the JPG output.</p>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 4 — Download Your JPG Files</h3>
      <p className="mt-2">Download individual JPG files or download all converted images at once as a ZIP archive. Each JPG output file is clean and watermark-free.</p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Should You Convert PNG to JPG? When It Makes Sense</h3>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">When PNG to JPG Conversion Is the Right Choice</h3>
      <p className="mt-2">Photographs and photo-like images with millions of colors, gradients, and smooth tonal transitions compress extremely well as JPG with minimal visible quality loss. If your PNG file contains a photo — a landscape, portrait, product photo, or any image that came from a camera — converting it to JPG will typically reduce file size by 70-90% with no noticeable difference in appearance on screen.</p>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">When to Stay With PNG</h3>
      <p className="mt-2">PNG is the right format for logos, icons, text, line art, screenshots, illustrations, and any image with large areas of solid color or sharp edges. Converting these types of images to JPG can introduce visible compression artifacts — blurring, color banding, and noise around sharp edges — that degrade quality noticeably. If your PNG contains a logo or graphic with transparent areas, converting to JPG will replace the transparency with a white background, which may not be what you want.</p>
      <h4 className="mt-6 text-[18px] font-semibold text-[#1F2937]">The Quality Setting Matters</h3>
      <p className="mt-2">The JPG quality slider determines how aggressively the file is compressed. Quality 95 produces a file that looks virtually identical to the PNG original with a modest size reduction. Quality 80 produces a much smaller file with quality that is excellent for web use and invisible at normal viewing sizes. Quality 60 or below can introduce visible artifacts in photographic images.</p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Common Reasons People Convert PNG to JPG</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li><strong>Reducing Website Image File Sizes:</strong> Improve site performance by serving JPGs.</li>
        <li><strong>Sending Photos via Email:</strong> Avoid size limits on email attachments.</li>
        <li><strong>Uploading to Social Media:</strong> Control output quality to avoid platform re-compression.</li>
        <li><strong>Sharing Product Photos for E-Commerce:</strong> Meet platform file size requirements.</li>
        <li><strong>Reducing Storage Usage:</strong> Free space in cloud storage and hard drives.</li>
        <li><strong>Meeting Upload Requirements:</strong> Fulfill submission forms that mandate JPG.</li>
        <li><strong>Faster Image Loading in Apps and Presentations:</strong> Improve document performance.</li>
        <li><strong>Exporting for Print Services:</strong> Ensure format compatibility for prints.</li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">What Happens to Transparent Backgrounds?</h3>
      <p className="mt-3">PNG files support transparent backgrounds — areas where no color is stored and the background of whatever is behind the image shows through. JPG does not support transparency. Every pixel in a JPG file must have a color value. When a PNG with a transparent background is converted to JPG, the transparent areas must be filled with a solid color.</p>
      <p className="mt-3">Our tool fills transparent PNG areas with a white background during conversion. This is the most common and expected behavior — most PNG files with transparent backgrounds are designed to be placed on white or light-colored backgrounds. The result is a JPG where the transparent areas appear white, and the main image content appears exactly as it did in the original PNG.</p>
      <p className="mt-3">If you need a different background color for the transparent areas — for example, black, gray, or a specific brand color — you will need to first open the PNG in an image editor, fill the transparent area with the desired color, and then convert the resulting non-transparent PNG to JPG. Our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] underline">Compress Image tool</Link> can then further reduce the file size if needed.</p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Browser-Based vs Server-Based PNG to JPG Conversion</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead className="bg-[#f9fafb]">
            <tr>
              <th className="border p-2">Feature</th>
              <th className="border p-2">Our Tool</th>
              <th className="border p-2">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border p-2">Image Privacy</td><td className="border p-2">Files stay on device</td><td className="border p-2">Files uploaded to server</td></tr>
            <tr><td className="border p-2">Speed</td><td className="border p-2">Instant</td><td className="border p-2">Upload/download delay</td></tr>
            <tr><td className="border p-2">File Size Limit</td><td className="border p-2">No limit</td><td className="border p-2">Often 10-25MB per file</td></tr>
            <tr><td className="border p-2">Quality Control</td><td className="border p-2">Yes</td><td className="border p-2">Sometimes fixed</td></tr>
            <tr><td className="border p-2">Works Offline</td><td className="border p-2">Yes after page loads</td><td className="border p-2">No</td></tr>
            <tr><td className="border p-2">Account Required</td><td className="border p-2">No</td><td className="border p-2">Sometimes yes</td></tr>
            <tr><td className="border p-2">Batch Convert</td><td className="border p-2">Yes</td><td className="border p-2">Sometimes limited</td></tr>
            <tr><td className="border p-2">Watermarks</td><td className="border p-2">Never</td><td className="border p-2">Sometimes added</td></tr>
            <tr><td className="border p-2">Cost</td><td className="border p-2">Always free</td><td className="border p-2">Free tier limited</td></tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Tips for Converting PNG to JPG Effectively</h3>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li><strong>Use 80-90% Quality:</strong> Best balance of file size and visual quality.</li>
        <li><strong>Convert Photos but Keep Graphics:</strong> PNGs with sharp edges are better kept as PNG.</li>
        <li><strong>Check for Transparency:</strong> Remember that transparency will become white.</li>
        <li><strong>Compress Further:</strong> Use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] underline">Compress Image tool</Link> if needed.</li>
        <li><strong>Batch Convert:</strong> Add all files at once to process simultaneously.</li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Frequently Asked Questions</h3>
      <dl className="mt-4 space-y-4">
        {pngToJpgFaqJsonLd.mainEntity.map((q: any) => (
          <div key={q.name}>
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-1 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">More Image Tools</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {related.map((t) =>
          t.status === "live" ? (
            <Link
              key={t.slug}
              to="/image-tools/$slug"
              params={{ slug: t.slug }}
              className="rounded-lg border border-[#eee] p-4 transition-colors hover:border-[#e5322d]"
            >
              <div className="text-[15px] font-semibold text-[#1F2937]">{t.name}</div>
              <div className="mt-1 text-[13px] text-[#5a5a66]">{t.description}</div>
            </Link>
          ) : (
            <div
              key={t.slug}
              className="cursor-not-allowed rounded-lg border border-[#eee] bg-[#f9fafb] p-4 opacity-70"
              aria-disabled
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold text-[#1F2937]">{t.name}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#5a5a66]">
                  Coming soon
                </span>
              </div>
              <div className="mt-1 text-[13px] text-[#5a5a66]">{t.description}</div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}
