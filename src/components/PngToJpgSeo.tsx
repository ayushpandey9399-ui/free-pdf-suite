import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/png-to-jpg`;

export const pngToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PNG to JPG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
  description:
    "Free online PNG to JPG converter. Batch convert PNG images to smaller JPG files in your browser, no upload and no signup. Adjustable quality.",
};

export const pngToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PNG to JPG",
  description:
    "Convert PNG images to smaller JPG files online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the PNG to JPG tool",
      text: "Open the PNG to JPG tool on FreePDFHub. No signup, no account, and no software install is needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your PNG files",
      text: "Drag and drop your PNG files, or click to select them from your device.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Pick a quality and click Convert",
      text: "Use the quality slider (default 90) to balance size and clarity, then click Convert. Each PNG is drawn on a white canvas and encoded as JPG inside your browser tab. Nothing is uploaded.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download JPGs",
      text: "Download each JPG individually, or download all of them together as a single ZIP file.",
      url: `${url}#step-4`,
    },
  ],
};

export const pngToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between PNG and JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG uses lossless compression and supports transparency, which makes it ideal for graphics, logos, screenshots, and images with sharp edges or text. JPG uses lossy compression tuned for photographs, so it produces much smaller files at the cost of some fine detail. PNG is best for editing masters, JPG is best for sharing photos.",
      },
    },
    {
      "@type": "Question",
      name: "Will I lose quality converting PNG to JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG is a lossy format, so some quality is discarded during encoding. At high quality settings (around 90), the loss is invisible to the eye for most photos. Lower the quality slider only if you need a smaller file and can accept mild softness or minor block artifacts around edges.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to transparent areas when I convert PNG to JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG cannot store transparency at all. Before drawing the image, this converter fills the canvas with solid white, so any transparent pixels in your PNG become white in the JPG (never black). If you need to keep transparency, keep the file as PNG.",
      },
    },
    {
      "@type": "Question",
      name: "Why is the JPG smaller than the PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG is lossless and JPG is lossy, so the JPG is often 3 to 10 times smaller than the same image saved as PNG, especially for photographs. That size difference is exactly the point: it makes JPG easier to email, upload, and share on the web.",
      },
    },
    {
      "@type": "Question",
      name: "Is this PNG to JPG converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no email wall, and no daily limit. Convert as many PNG images as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using the standard Canvas API. Your PNG images and the resulting JPGs are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many PNG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of PNGs, batch convert them in one pass, and download every JPG together as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "Is JPEG the same as JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. JPEG and JPG are the same format. The three-letter .jpg extension is a legacy from older versions of Windows that required three-character file extensions. The tool saves files with the .jpg extension.",
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
        text: "No. The converter draws each PNG on a fresh canvas and re-encodes it as JPG, so metadata and embedded color profiles are not carried over. Many people prefer this because it strips any hidden data before sharing.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "png-to-jpg").slice(0, 8);

export function PngToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        PNG to JPG, converted in your browser
      </h2>
      <p className="mt-3">
        PNG is great for graphics, screenshots, and anything with
        transparency, but the files can be huge, often too big to email,
        upload, or attach on the web. This free PNG to JPG converter turns
        any .png into a much smaller .jpg in a couple of clicks. Drop one
        image or a whole folder, pick a quality level, and download the
        results individually or as a single ZIP. Everything runs inside
        your browser tab, so no image is ever uploaded.
      </p>
      <p className="mt-3">
        The converter uses the standard HTML Canvas API to decode each PNG
        and re-encode it as JPG. That means no server, no signup, no
        watermark, and no per-file cap. If your browser can open the PNG,
        it can save it as JPG here.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert PNG to JPG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the PNG to JPG tool, no signup needed.</li>
        <li id="step-2">Drag and drop your PNG files, or click to select them.</li>
        <li id="step-3">
          Pick a quality (default 90) and click <strong>Convert</strong>.
          Every file is drawn on a canvas and encoded as JPG inside your
          browser.
        </li>
        <li id="step-4">
          Download each JPG, or download all of them as a single ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why convert PNG to JPG
      </h2>
      <p className="mt-3">
        The main reason is file size. A photograph saved as PNG can easily
        be 3 to 10 times larger than the same photograph as JPG at high
        quality, and the difference to the eye is often invisible. That
        makes JPG the right choice when you need to attach an image to an
        email, upload it through a form with a strict size limit, share
        it on a chat app, or ship it on a webpage where every kilobyte
        counts. JPG is also universally supported: every browser, image
        viewer, phone camera app, print shop, and photo frame reads it
        natively.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        What happens to transparency
      </h2>
      <p className="mt-3">
        This is the one honest catch: JPG has no transparency channel at
        all. When a PNG with transparent areas is exported as JPG, those
        transparent pixels have to become something solid. This converter
        fills them with pure white before drawing the image, so a PNG
        logo on a transparent background comes out as the same logo on a
        white background, never on a black one.
      </p>
      <p className="mt-3">
        If keeping transparency matters (for a logo you plan to layer over
        different colors, for example), stay in PNG. You can go the other
        way with our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "jpg-to-png" }}
          className="text-[#e5322d] underline"
        >
          JPG to PNG converter
        </Link>
        , though note that a format conversion cannot invent transparency
        that was never in the original image.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        PNG vs JPG: what is the difference
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Compression.</strong> PNG is lossless, JPG is lossy.
        </li>
        <li>
          <strong>Transparency.</strong> PNG supports full alpha
          transparency, JPG does not support transparency at all.
        </li>
        <li>
          <strong>File size.</strong> For photographs, JPG is dramatically
          smaller. For flat graphics with few colors, PNG can be smaller.
        </li>
        <li>
          <strong>Best use.</strong> PNG for logos, UI, screenshots,
          editing masters. JPG for photos, web thumbnails, email
          attachments, anywhere size matters.
        </li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Choosing the right quality
      </h2>
      <p className="mt-3">
        JPG quality is a trade-off between how good the image looks and
        how big the file is. The slider goes from about 30 to 100, and
        the default of 90 is a good starting point for most photos: the
        file shrinks a lot compared to the source PNG, but the loss is
        invisible at normal viewing distances. Push the slider higher
        (95 to 100) when you want the closest possible match to the
        original and do not mind a larger file. Push it lower (60 to 80)
        when you need the smallest possible file for a mailer, chat, or
        upload form, and can accept some softness and mild block
        artifacts around edges. For flat graphics with sharp lines and
        text, PNG usually beats JPG at any quality; consider staying in
        PNG for those images.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Convert PNG to JPG in bulk
      </h2>
      <p className="mt-3">
        Batch conversion is built in. Select as many PNG files as you
        like, or drop a whole folder onto the drop zone, and every
        image is converted in one pass at the quality you picked. There
        is no per-file cap and no daily limit because the work happens
        on your own machine. When the batch finishes, grab each JPG
        individually or download them all together as a single ZIP
        archive.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Reduce PNG file size the smart way
      </h2>
      <p className="mt-3">
        If your goal is simply a smaller file for sending or uploading,
        converting to JPG is usually the biggest single win. A 5 MB
        screenshot-plus-photo PNG can drop below 500 KB as a
        high-quality JPG, without any visible change on most screens.
        Save the original PNG somewhere for editing, and use the JPG
        for sharing.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h2>
      <p className="mt-3">
        Most online PNG to JPG converters upload every image to a
        stranger's server, hold it for hours or days, and quietly log
        the metadata. This tool does the opposite. Decoding and JPG
        encoding both happen inside your browser tab using the Canvas
        API that ships with every modern browser, so your files,
        filenames, and any embedded data stay on your device. Turn off
        Wi-Fi after the page loads and the conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        Because the converter is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook, Linux,
        Android, iPhone, and iPad. On desktop, Chrome and Edge give the
        fastest conversion; on mobile, Safari and Chrome both work
        well. There is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {pngToJpgFaqJsonLd.mainEntity.map((q) => (
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
