import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/jpg-to-png`;

export const jpgToPngSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JPG to PNG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online JPG to PNG converter. Batch convert JPG and JPEG images to lossless PNG in your browser, no upload and no signup.",
};

export const jpgToPngHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert JPG to PNG",
  description:
    "Convert JPG images to lossless PNG online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the JPG to PNG tool",
      text: "Open the JPG to PNG tool on pdftoolconverteronline.com. No signup, no account, and no software install is needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your JPG files",
      text: "Drag and drop your JPG or JPEG files, or click to select them from your device.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Click Convert",
      text: "Click Convert. Each JPG is decoded on a canvas and re-encoded to lossless PNG inside your browser tab. Nothing is uploaded.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download PNGs",
      text: "Download each PNG individually, or download all of them together as a single ZIP file.",
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
      name: "What is the difference between JPG and PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG uses lossy compression tuned for photographs, which throws away subtle detail to shrink the file. PNG uses lossless compression, so every pixel is stored exactly, and it supports transparency. JPG is smaller and better for photos, while PNG is better for screenshots, logos, graphics with text, and any image you plan to edit further.",
      },
    },
    {
      "@type": "Question",
      name: "Does converting JPG to PNG add transparency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. JPG does not store transparency, so anything that looks like a background in the JPG (usually solid white) stays as solid pixels in the PNG. You cannot recover a transparent background that never existed. To remove a background, you need a background remover tool, not a format converter.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my PNG file larger than the original JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG is lossless and JPG is lossy, so a photograph saved as PNG is normally 3 to 10 times larger than the same photo as a JPG. That is expected and is the price of pixel-perfect quality. If small file size matters more than quality, keep the file as JPG.",
      },
    },
    {
      "@type": "Question",
      name: "Is this JPG to PNG converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no email wall, and no daily limit. Convert as many JPG and JPEG images as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using the standard Canvas API. Your JPG images and the resulting PNGs are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many JPG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a full folder of JPGs, batch convert them in one pass, and download every PNG together as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "Is JPEG the same as JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. JPEG and JPG refer to the same format. The extension was shortened to three letters because early versions of Windows required a three-character extension. Both .jpg and .jpeg files work in this converter.",
      },
    },
    {
      "@type": "Question",
      name: "Will the image quality improve after converting to PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Detail already lost by the original JPG compression cannot be restored by re-saving as PNG. What PNG guarantees is that no further quality is lost from this point on. If you plan to edit and re-save the image many times, working in PNG protects it from further JPG re-compression artifacts.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Windows, Mac, Android, and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The converter is a web page, so it runs in any modern browser on Windows 10, Windows 11, macOS, Chromebook, Linux, Android, iPhone, and iPad. Nothing to install.",
      },
    },
    {
      "@type": "Question",
      name: "Are EXIF metadata and color profile preserved?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The converter draws each JPG to a canvas and re-encodes it as a fresh PNG, so EXIF metadata (camera model, GPS, capture date) and embedded color profiles are not carried over. Many people prefer this because it strips location data before sharing.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "jpg-to-png").slice(0, 8);

export function JpgToPngSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        JPG to PNG, converted in your browser
      </h2>
      <p className="mt-3">
        Need a PNG instead of a JPG? This free JPG to PNG converter turns any
        .jpg or .jpeg file into a clean, lossless PNG in a couple of clicks.
        Drop one image or a whole folder, convert them all in one pass, and
        download the results individually or as a single ZIP. Everything
        runs inside your browser tab, so no image is ever uploaded.
      </p>
      <p className="mt-3">
        The converter uses the standard HTML Canvas API to decode each JPG
        and re-encode it as PNG. That means no server, no signup, no
        watermark, and no per-file cap. If your browser can open the JPG,
        it can save it as PNG here.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert JPG to PNG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the JPG to PNG tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your JPG or JPEG files, or click to select them.
        </li>
        <li id="step-3">
          Click <strong>Convert</strong>. Every file is decoded on a canvas
          and re-encoded to lossless PNG inside your browser.
        </li>
        <li id="step-4">
          Download each PNG, or download all of them as a single ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why convert JPG to PNG
      </h2>
      <p className="mt-3">
        There are three common reasons to convert a JPG to PNG. First,
        further editing: every time you re-save a JPG, the lossy compression
        runs again and quality drops a little more. Saving the working copy
        as PNG stops that decay in its tracks. Second, some platforms and
        tools require PNG, from many logo submission forms and app-store
        assets to certain print workflows and design software presets.
        Third, PNG is a better fit for graphics, screenshots, diagrams, and
        anything with sharp lines or embedded text, where the mosquito-like
        artifacts JPG leaves around edges become visible.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        JPG vs PNG: what is the difference
      </h2>
      <p className="mt-3">
        Both formats store bitmap images, but they were built for different
        jobs.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Compression.</strong> JPG is lossy, PNG is lossless.
        </li>
        <li>
          <strong>Transparency.</strong> JPG cannot store transparency, PNG
          supports full alpha transparency.
        </li>
        <li>
          <strong>File size.</strong> For photographs, JPG is usually much
          smaller. For flat graphics with few colors, PNG can be smaller.
        </li>
        <li>
          <strong>Best use.</strong> JPG for photos and web thumbnails, PNG
          for logos, UI, screenshots, editing masters, anything with text
          or sharp edges.
        </li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Does converting JPG to PNG add transparency
      </h2>
      <p className="mt-3">
        No, and this is worth being clear about. JPG has no transparency
        channel at all, so whatever background is in your JPG (usually
        solid white) becomes solid pixels in the PNG. A format conversion
        cannot invent transparency that was never captured. To make a
        background transparent you need a background remover, not a JPG
        to PNG converter.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Will the quality improve or drop
      </h2>
      <p className="mt-3">
        Neither. PNG is lossless, so re-saving your JPG as PNG will not
        introduce any additional compression artifacts. But it also cannot
        restore detail that the original JPG compression already threw
        away, so a blurry or blocky JPG will still look blurry or blocky
        as a PNG. What you do gain is protection against future re-saves:
        if you plan to edit the image several times, keeping the working
        copy as PNG stops each save from adding a new layer of JPG
        artifacts. Expect the PNG file to be significantly larger than
        the JPG it came from.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Convert JPG to PNG in bulk
      </h2>
      <p className="mt-3">
        Batch conversion is built in. Select as many JPG files as you like,
        or drop a whole folder onto the drop zone, and every image is
        converted in one pass. There is no per-file cap and no daily
        limit because the work happens on your own machine. When the
        batch finishes, grab each PNG individually or download them all
        together as a single ZIP archive.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h2>
      <p className="mt-3">
        Most online JPG to PNG converters upload every image to a stranger's
        server, hold it for hours or days, and quietly log the metadata.
        This tool does the opposite. Decoding and PNG encoding both happen
        inside your browser tab using the Canvas API that ships with every
        modern browser, so your files, filenames, and any embedded data
        stay on your device. Turn off Wi-Fi after the page loads and the
        conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        The converter is a web page, so it runs anywhere a modern browser
        runs: Windows 10, Windows 11, macOS, Chromebook, Linux, Android,
        iPhone, and iPad. On desktop, Chrome and Edge give the fastest
        conversion; on mobile, Safari and Chrome both work well. There
        is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Prefer PNG to JPG instead
      </h2>
      <p className="mt-3">
        Going the other way (shrinking a PNG down to a JPG for sharing)?
        Check the{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "heic-to-png" }}
          className="text-[#e5322d] underline"
        >
          HEIC to PNG converter
        </Link>{" "}
        for iPhone photos, or watch this space, more image tools are on
        the way.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {jpgToPngFaqJsonLd.mainEntity.map((q) => (
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
