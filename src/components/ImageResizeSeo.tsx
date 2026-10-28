import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/image-resize`;

export const imageResizeSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Resize Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online image resizer. Resize JPG, PNG, and WebP by exact pixels or percent in your browser. Presets for passport photo, signature, HD, and Full HD. No upload, no signup.",
};

export const imageResizeHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to resize an image",
  description:
    "Change the width and height of a JPG, PNG, or WebP image online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the image resizer",
      text: "Open the Resize Image tool on PDFToolConverter. No signup, no account, and nothing to install.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your images",
      text: "Drag and drop your JPG, PNG, or WebP files, or click to select them. You can add many at once.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Pick pixels or percent",
      text: "Choose By pixels and enter width and height (lock aspect ratio if you want), or choose By percent and pick 25, 50, or 75 percent.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Resize and download",
      text: "Click Resize all. Download each resized image, or grab all of them as a single ZIP archive.",
      url: `${url}#step-4`,
    },
  ],
};

export const imageResizeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I resize by pixels or percentage?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Pixel mode uses the configured width and height. Percentage mode scales each source image, with the percentage constrained to 1 through 400." },
    },
    {
      "@type": "Question",
      name: "How does the aspect-ratio lock work?",
      acceptedAnswer: { "@type": "Answer", text: "In pixel mode, changing one dimension updates the other using the reference image ratio. The configured output dimensions are then applied to the batch, so mixed-ratio images may be stretched." },
    },
    {
      "@type": "Question",
      name: "What happens when I choose a size preset?",
      acceptedAnswer: { "@type": "Answer", text: "The preset switches to pixel mode, sets its width and height and turns off the aspect-ratio lock. Check the required dimensions for your destination before using a passport or signature preset." },
    },
    {
      "@type": "Question",
      name: "Can I guarantee an exact KB size?",
      acceptedAnswer: { "@type": "Answer", text: "No. Optional compression attempts to reach the target size and may also change dimensions. If compression fails, the tool keeps the resized image." },
    },
    {
      "@type": "Question",
      name: "Which image formats are supported?",
      acceptedAnswer: { "@type": "Answer", text: "The tool processes JPG, PNG and WebP images and uses the source format for the resized output." },
    },
    {
      "@type": "Question",
      name: "Is transparency preserved?",
      acceptedAnswer: { "@type": "Answer", text: "The resize canvas preserves transparency for PNG and WebP output. JPG output uses a white background." },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "image-resize").slice(0, 8);

export function ImageResizeSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        Resize images online, free
      </h2>
      <p className="mt-3">
        Resize an image to fit a form, a website hero, a WhatsApp
        share, a job portal upload, or a school exam application. This
        free image resizer changes the width and height of JPG, PNG,
        and WebP files right inside your browser tab. Enter exact
        pixels, drop a percent slider, or pick a one-click preset for
        passport photo, signature, HD, or Full HD. Combine the pixel
        target with a KB target when a form says "photo under 100 KB
        at 413 by 531 pixels" and hit both requirements in a single
        pass.
      </p>
      <p className="mt-3">
        Everything runs client-side. Your originals and the resized
        results never leave your device, so you can change image
        dimensions for a passport form, an ID upload, or a private
        document without handing anything to a stranger's server.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to resize an image
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the Resize Image tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your JPG, PNG, or WebP images, or click to select them.
        </li>
        <li id="step-3">
          Choose <strong>By pixels</strong> and enter width and height (leave{" "}
          <strong>Lock aspect ratio</strong> on to keep the original
          proportions), or choose <strong>By percent</strong> and pick 25, 50,
          or 75 percent.
        </li>
        <li id="step-4">
          Click <strong>Resize all</strong>, then download each image or grab
          them as a single ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Resize an image to exact pixels for online forms
      </h2>
      <p className="mt-3">
        Government portals, exam applications, banking KYC uploads,
        and job sites almost always ask for a specific pixel size. The
        two most common in India are a passport photo at 413 by 531
        pixels (about 3.5 by 4.5 cm at 300 DPI) and a signature at
        140 by 60 pixels. Other frequent requirements are 200 by 230,
        150 by 200, and thumbnail sizes for school and college portals.
        Enter the numbers in the width and height fields, or pick a
        preset chip, and the resizer produces an image at that exact
        size. Turn <strong>Lock aspect ratio</strong> off when the
        target is not the same aspect as your source so the output
        matches the form's box exactly.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Resize to a target file size in KB
      </h2>
      <p className="mt-3">
        Many forms are strict about file size on top of pixel size,
        for example "photo under 100 KB" or "signature under 20 KB".
        Tick <strong>Also compress to target KB</strong>, enter the
        KB value, and the tool first resizes to the pixel target and
        then iterates the JPG or WebP encoder until the file lands at
        or under your KB goal when possible. This chains resize plus
        compress into a single click so you never have to bounce
        between two tools. For very small targets, prefer a JPG
        output; PNG is lossless and shrinks less.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Resize without losing quality
      </h2>
      <p className="mt-3">
        Downscaling is friendly to quality: this resizer halves the
        image in steps and uses high quality smoothing, so text stays
        legible and edges stay sharp even for large reductions. That
        is the honest ceiling. Enlarging cannot add detail that is
        not in the original file, so an image blown up beyond its
        source dimensions will look softer no matter which tool you
        use. If you must enlarge, small factors (up to about 1.5x)
        usually look fine; anything more will show softness. This tool
        never upscales silently: if the target is larger than the
        original, a yellow warning tells you so, then respects your
        choice.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Resize JPG, PNG, and WebP
      </h2>
      <p className="mt-3">
        Each file keeps its original format on output, which matters
        for transparency and file size. PNG and WebP preserve the
        alpha channel, so logos, screenshots, and product cutouts stay
        transparent after resize. JPG has no alpha, so any transparent
        pixels in a JPG output are drawn on a white background. If you
        need a smaller upload after resizing, JPG usually shrinks more
        than PNG for the same visual quality; try our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "compress-image" }}
          className="text-[#e5322d] underline"
        >
          Compress Image tool
        </Link>{" "}
        as a follow-up when you want more control over the KB size.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Resize images in bulk
      </h2>
      <p className="mt-3">
        Batch resize is built in. Drop a whole folder of images, pick
        one pixel target or one percent value, and every file is
        processed in one pass. Download each result individually, or
        grab all of them together as a single ZIP archive named
        resized-images.zip. There is no per-file cap and no daily
        limit because the work happens on your own machine. For each
        file the tool shows the original dimensions and size, then the
        new dimensions and size, so you can see exactly what changed.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {imageResizeFaqJsonLd.mainEntity.map((q) => (
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
