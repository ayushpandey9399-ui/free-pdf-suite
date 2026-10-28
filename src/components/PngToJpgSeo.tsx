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
  description:
    "Convert PNG images to JPG online in your browser. Batch convert multiple PNG files to JPEG with quality control. Free, no signup, no watermark, files never leave your device.",
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
      name: "Will converting PNG to JPG reduce quality?",
      acceptedAnswer: { "@type": "Answer", text: "JPG uses lossy compression. Higher quality settings retain more detail but usually produce larger files. Check sharp edges and text in the downloaded result." },
    },
    {
      "@type": "Question",
      name: "What happens to transparent PNG backgrounds?",
      acceptedAnswer: { "@type": "Answer", text: "Transparent areas are filled with white because JPG does not support transparency." },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple PNG files at once?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Add multiple PNG files and click Convert all. Files are processed one after another. Download individual results or download multiple completed images as a ZIP." },
    },
    {
      "@type": "Question",
      name: "What quality setting should I use?",
      acceptedAnswer: { "@type": "Answer", text: "Start around 80 to 90 percent, then compare the result with your original. Increase quality if compression artifacts are visible." },
    },
    {
      "@type": "Question",
      name: "How much smaller will the JPG be?",
      acceptedAnswer: { "@type": "Answer", text: "The result depends on the image and quality setting. Photographs often become smaller, but a JPG is not guaranteed to be smaller than its source PNG." },
    },
    {
      "@type": "Question",
      name: "Is there a file size limit?",
      acceptedAnswer: { "@type": "Answer", text: "Free to use. Very large images depend on device memory and browser canvas limits. The tool also checks decoded image dimensions and may reject images that exceed its safety limits." },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "png-to-jpg").slice(0, 8);

export function PngToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">How to Convert PNG to JPG Online: Step by Step</h2>
      <h3 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 1: Upload Your PNG Images</h3>
      <p className="mt-2">Click the "Select images" button or drag and drop your PNG files onto the upload area. You can add multiple PNG files at once for batch conversion. All processing runs locally in your browser, your images never leave your device.</p>
      <h3 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 2: Set Output Quality</h3>
      <p className="mt-2">Choose the JPG output quality level. Higher quality produces sharper images with larger file sizes. Lower quality produces smaller files with some visible compression artifacts. For most everyday purposes, 80-90% quality produces excellent results at a fraction of the PNG file size.</p>
      <h3 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 3: Convert Your Images</h3>
      <p className="mt-2">Click the convert button. The tool renders each PNG on an HTML Canvas and encodes it as JPG at your chosen quality level. Files are processed one after another. Transparent areas in PNG images are filled with a white background in the JPG output.</p>
      <h3 className="mt-6 text-[18px] font-semibold text-[#1F2937]">Step 4: Download Your JPG Files</h3>
      <p className="mt-2">Download individual JPG files or download all converted images at once as a ZIP archive. Each JPG output file is clean and watermark-free.</p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">What Happens to Transparent Backgrounds?</h2>
      <p className="mt-3">PNG files support transparent backgrounds, areas where no color is stored and the background of whatever is behind the image shows through. JPG does not support transparency. Every pixel in a JPG file must have a color value. When a PNG with a transparent background is converted to JPG, the transparent areas must be filled with a solid color.</p>
      <p className="mt-3">Our tool fills transparent PNG areas with a white background during conversion. This is the most common and expected behavior, most PNG files with transparent backgrounds are designed to be placed on white or light-colored backgrounds. The result is a JPG where the transparent areas appear white, and the main image content appears exactly as it did in the original PNG.</p>
      <p className="mt-3">If you need a different background color for the transparent areas, for example, black, gray, or a specific brand color, you will need to first open the PNG in an image editor, fill the transparent area with the desired color, and then convert the resulting non-transparent PNG to JPG. Our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] underline">Compress Image tool</Link> can then further reduce the file size if needed.</p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Tips for Converting PNG to JPG Effectively</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5">
        <li><strong>Use 80-90% Quality:</strong> Best balance of file size and visual quality.</li>
        <li><strong>Convert Photos but Keep Graphics:</strong> PNGs with sharp edges are better kept as PNG.</li>
        <li><strong>Check for Transparency:</strong> Remember that transparency will become white.</li>
        <li><strong>Compress Further:</strong> Use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] underline">Compress Image tool</Link> if needed.</li>
        <li><strong>Batch Convert:</strong> Add several files at once; they are converted one after another.</li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Frequently Asked Questions</h2>
      <dl className="mt-4 space-y-4">
        {pngToJpgFaqJsonLd.mainEntity.map((q: any) => (
          <div key={q.name}>
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-1 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">More Image Tools</h2>
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
