import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/compress-image`;

export const compressImageSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Compress Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online image compressor. Reduce JPG, PNG, WebP and SVG file size with a quality slider and an optional maximum width. Processed in your browser.",
};

export const compressImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress an image",
  description: "Reduce the file size of a JPG, PNG, WebP or SVG image in your browser, free.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Add your images", text: "Drag and drop JPG, PNG, WebP or SVG files, or click Select images. You can add several at once.", url: `${url}#step-1` },
    { "@type": "HowToStep", position: 2, name: "Set quality and width", text: "Move the Quality slider (used for JPG and WebP) and, if you want, pick a Maximum width to shrink large photos.", url: `${url}#step-2` },
    { "@type": "HowToStep", position: 3, name: "Compress and download", text: "Click Compress IMAGES. Download each image, or all of them as one ZIP.", url: `${url}#step-3` },
  ],
};

export const compressImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are my images uploaded anywhere?",
      acceptedAnswer: { "@type": "Answer", text: "No. Compression runs in your browser using its built-in image encoder. Your files never leave your device." },
    },
    {
      "@type": "Question",
      name: "Which quality setting should I use?",
      acceptedAnswer: { "@type": "Answer", text: "75 is the default. For most photos 70 to 85 gives a much smaller file with little visible change. Below 50 you will usually see blur and blocky edges. The slider only affects JPG and WebP." },
    },
    {
      "@type": "Question",
      name: "Why did my PNG barely shrink?",
      acceptedAnswer: { "@type": "Answer", text: "PNG is re-saved losslessly so transparency and exact pixels are kept. That rarely saves much on its own. Choosing a Maximum width shrinks PNGs a lot, or convert photos to JPG with the PNG to JPG tool." },
    },
    {
      "@type": "Question",
      name: "Why is the result the same size as my original?",
      acceptedAnswer: { "@type": "Answer", text: "If the compressed version would not be smaller, the tool keeps your original file instead of handing you a bigger one. Lower the quality or pick a smaller Maximum width and try again." },
    },
    {
      "@type": "Question",
      name: "Is photo information like date and location kept?",
      acceptedAnswer: { "@type": "Answer", text: "No. Re-encoding through the browser drops EXIF metadata such as camera model, date taken and GPS location. If the original is returned unchanged, its metadata stays." },
    },
    {
      "@type": "Question",
      name: "Is there a size limit?",
      acceptedAnswer: { "@type": "Answer", text: "Free to use. There is no fixed limit, but very large images or big batches depend on your device memory and may be slow on older phones." },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "compress-image").slice(0, 8);

export function CompressImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">Compress images online, free</h2>
      <p className="mt-3">
        Shrink JPG, PNG, WebP and SVG files for email, upload forms or a faster website.
        Processed in your browser. Your file never leaves your device.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">How to compress an image</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Drag and drop your images, or click <strong>Select images</strong>.</li>
        <li id="step-2">Set the <strong>Quality</strong> slider and, optionally, a <strong>Maximum width</strong>.</li>
        <li id="step-3">Click <strong>Compress IMAGES</strong>, then download each image or one ZIP.</li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">What happens to each format</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li><strong>JPG and WebP</strong> are re-encoded at the quality you choose. This is where you save the most.</li>
        <li><strong>PNG</strong> is re-saved losslessly with transparency kept. It mainly shrinks when you pick a Maximum width.</li>
        <li><strong>SVG</strong> has comments and extra spaces removed; the drawing is not changed.</li>
        <li>Each file keeps its format. If the result is not smaller, the original is kept.</li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">Limits to know about</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>GIF files are not accepted, because re-saving them would drop the animation.</li>
        <li>Camera details, date and location (EXIF) are removed from re-encoded photos.</li>
        <li>Width is only reduced, never enlarged. Height follows to keep the shape.</li>
        <li>There is no target size in KB; lower the quality or width to get smaller.</li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {compressImageFaqJsonLd.mainEntity.map((q) => (
          <div key={q.name}>
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-1 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        More image tools
      </h2>
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
