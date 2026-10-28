import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/crop-image`;

export const cropImageSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Crop Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online image cropper. Crop JPG, PNG, and WebP to any size in your browser. Drag the crop box, lock 1:1, 4:3, 16:9, 9:16, or passport ratios, or enter exact pixels. Batch and ZIP, no upload, no signup.",
};

export const cropImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to crop an image online",
  description:
    "Crop a JPG, PNG, or WebP image to any size online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the image cropper",
      text: "Open the Crop Image tool on PDFToolConverter. No signup, no account, and nothing to install.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your images",
      text: "Drag and drop your JPG, PNG, or WebP files, or click to select them. Every file gets its own crop box.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Adjust the crop box",
      text: "Drag the corners or edges to resize, or drag the middle to move. Pick a preset like 1:1 Instagram, 16:9 YouTube, 9:16 Reels, or Passport 35x45, or enter exact X, Y, width, and height in pixels.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Crop and download",
      text: "Click Crop all. Download each cropped image, or grab the whole batch as a single ZIP archive.",
      url: `${url}#step-4`,
    },
  ],
};

const faqs = [
  {
    "q": "How do I crop an image to a square?",
    "a": "Select the image, choose the 1:1 aspect preset, position the crop box, and click Crop all."
  },
  {
    "q": "Can I enter exact pixel dimensions?",
    "a": "Yes. Edit X, Y, width, and height below the preview. The crop is constrained to the source image bounds; it does not enlarge the image."
  },
  {
    "q": "Does cropping reduce image quality?",
    "a": "The selected rectangle is exported at its crop dimensions. JPEG and WebP outputs are re-encoded using the quality setting, which defaults to 0.9. PNG output uses lossless encoding."
  },
  {
    "q": "Is transparency preserved?",
    "a": "PNG and WebP output can preserve transparency. JPEG does not support transparency and is drawn on a white background."
  },
  {
    "q": "What formats are supported?",
    "a": "The tool accepts JPG, PNG, and WebP. Each image is exported in its corresponding input format."
  },
  {
    "q": "Can I crop several images at once?",
    "a": "Yes. Set each image crop in the file strip, then click Crop all. Download individual results or a ZIP. Free to use. Large images and batches depend on your device memory and image safety checks."
  }
];

export const cropImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};


const related = imageTools.filter((t) => t.slug !== "crop-image").slice(0, 8);

export function CropImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to crop an image
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the Crop Image tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your JPG, PNG, or WebP images, or click to select them.
        </li>
        <li id="step-3">
          Drag the crop box (or pick an aspect preset, or type exact
          pixels) to frame the area you want to keep.
        </li>
        <li id="step-4">
          Click <strong>Crop all</strong>, then download each result or
          grab the batch as a ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Crop to exact pixels
      </h2>
      <p className="mt-3">
        When a form or website asks for a specific size (say, a 600 by
        600 profile picture, a 1500 by 500 banner, or a 200 by 230
        college portal photo), pixel precision matters more than the
        preset chips. Type the numbers directly into the X, Y, Width,
        and Height fields and the crop box moves and resizes on the
        image to show exactly what your output will contain. The
        result is written with those exact pixel dimensions, no
        rounding surprises. Pair this with our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "image-resize" }}
          className="text-[#e5322d] underline"
        >
          Resize Image tool
        </Link>{" "}
        when you also need to change the output size after cropping.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Crop JPG, PNG, and WebP
      </h2>
      <p className="mt-3">
        Every crop keeps the input format on the output side, which
        matters for transparency and file size. PNG and WebP outputs
        preserve the alpha channel, so a logo cropped from a
        transparent PNG stays transparent, and a screenshot with
        rounded corners keeps them. JPG has no alpha, so any
        transparent pixels inside a JPG crop are drawn on a solid
        white background. For JPG and WebP outputs the quality slider
        (default 0.9) controls the re-encode; PNG is always lossless.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Crop many images at once
      </h2>
      <p className="mt-3">
        Batch cropping is built in. Add several files, click a
        thumbnail in the file strip to make it active, set the crop
        box, then move to the next file. When every image has its own
        crop rectangle, hit <strong>Crop all</strong> and every file
        is processed in one pass. Download each result individually or
        take the whole batch as <em>cropped-images.zip</em>. There is
        no per-file cap and no daily limit because the work happens on
        your own machine, not on ours.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {faqs.map((q) => (
          <div key={q.q}>
            <dt className="font-semibold text-[#1F2937]">{q.q}</dt>
            <dd className="mt-1 text-[#33333c]">{q.a}</dd>
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
