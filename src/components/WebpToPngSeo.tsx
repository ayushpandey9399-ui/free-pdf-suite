import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/webp-to-png`;

export const webpToPngSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WebP to PNG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online WebP to PNG converter. Batch convert .webp images to lossless PNG in your browser with transparency preserved, no upload, no signup.",
};

export const webpToPngHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert WebP to PNG",
  description:
    "Convert WebP images to lossless PNG files online, free, entirely in your browser, with transparency preserved.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the WebP to PNG tool",
      text: "Open the WebP to PNG tool on pdftoolconverteronline.com. No signup, no account, and no software install is needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your WebP files",
      text: "Drag and drop your .webp files, or click to select them from your device. You can add many at once.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Click Convert",
      text: "Click Convert. Each WebP is drawn on a canvas that keeps its alpha channel and encoded as a lossless PNG inside your browser tab. Nothing is uploaded.",
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

export const webpToPngFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a WebP file?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP is a modern image format built by Google for the web. It compresses better than JPG or PNG at similar quality and supports both lossy and lossless modes, plus transparency and animation. Chrome, Edge, Firefox, and Safari save many web images as .webp by default, which is why photos and graphics downloaded from Google Images or a website often arrive as WebP.",
      },
    },
    {
      "@type": "Question",
      name: "Why won't my WebP file open on my computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plenty of desktop software has never added WebP support: some versions of Microsoft Office, older Photoshop installs, wallpaper apps, e-commerce upload forms, print shops, and legacy image viewers cannot read .webp. Converting to PNG makes the file readable everywhere, without losing any quality.",
      },
    },
    {
      "@type": "Question",
      name: "Does this converter keep transparency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PNG supports a full alpha channel, and the converter draws each WebP on a canvas that keeps its alpha. No background color is filled in, so a transparent WebP comes out as a transparent PNG (not a white or black background). If your WebP has no transparency to begin with, the PNG simply has none either.",
      },
    },
    {
      "@type": "Question",
      name: "Is this WebP to PNG converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no email wall, and no daily limit. Convert as many WebP files as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using the standard Canvas API. Your WebP images and the resulting PNGs are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Will quality drop when I convert WebP to PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG is lossless, so the converter will not throw away any pixels during encoding. However, if the source WebP was already saved with lossy compression (which is common for photos), the PNG cannot restore detail that was never in the file. Expect the PNG to look identical to the WebP, and expect it to be larger.",
      },
    },
    {
      "@type": "Question",
      name: "Why is the PNG larger than the WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP compresses more efficiently than PNG, especially for photographic content, so the WebP file is often much smaller than the equivalent PNG. That is expected and it does not mean the PNG has more or less quality, just that it uses a different compression scheme.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many WebP files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of WebP images, batch convert them in one pass, and download every PNG together as a single ZIP archive.",
      },
    },
    {
      "@type": "Question",
      name: "Does it also work on animated WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only the first frame is exported, because PNG is a single-frame format (APNG is a separate variant most editors do not treat the same way). If your source is an animated WebP, expect a still PNG of the poster frame.",
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
  ],
};

const related = imageTools.filter((t) => t.slug !== "webp-to-png").slice(0, 8);

export function WebpToPngSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        WebP to PNG, converted in your browser
      </h2>
      <p className="mt-3">
        You downloaded an image from a website or Google Images and got
        a .webp file that half of your apps refuse to open. This free
        WebP to PNG converter fixes that in one click: drop the WebP,
        get a widely supported lossless .png back with every pixel and
        every transparent area intact. Everything runs inside your
        browser tab, so no image is ever uploaded to a server. Convert
        one file or a whole batch, then download each PNG or grab them
        all as a ZIP.
      </p>
      <p className="mt-3">
        The converter uses the standard HTML Canvas API to decode each
        WebP and re-encode it as PNG. No signup, no watermark, no
        per-file cap. If your browser can view the WebP, it can save
        it as PNG here.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert WebP to PNG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the WebP to PNG tool, no signup needed.</li>
        <li id="step-2">Drag and drop your .webp files, or click to select them.</li>
        <li id="step-3">
          Click <strong>Convert</strong>. Every file is drawn on a canvas
          that keeps its alpha channel and encoded as a lossless PNG
          inside your browser.
        </li>
        <li id="step-4">
          Download each PNG, or download all of them as a single ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why your downloaded images are WebP and won't open
      </h2>
      <p className="mt-3">
        WebP is Google's modern image format for the web. It compresses
        images more efficiently than PNG or JPG, so Chrome, Edge, and
        many websites serve or save pictures as .webp to keep pages
        light. That is great for site speed, but it becomes a problem
        the moment you try to use one of those files somewhere else.
        Some versions of Microsoft Word, PowerPoint, and older
        Photoshop installs cannot import .webp. Certain print services,
        wallpaper apps, product upload forms, and older phones simply
        reject it. Converting to PNG makes the image work everywhere
        without losing anything.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why convert WebP to PNG
      </h2>
      <p className="mt-3">
        PNG has three properties that make it the safer archival format
        for graphics: it is lossless, so converting will not degrade the
        image; it supports full alpha transparency, so logos and
        stickers keep their transparent background; and it is supported
        by every editor, viewer, printer, and upload form built in the
        last twenty years. That combination makes PNG ideal for logos,
        icons, product cutouts, screenshots, and any image you plan to
        edit further. If you need a smaller non-transparent file for
        emailing or uploading, JPG is usually a better choice than PNG.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Transparency is preserved
      </h2>
      <p className="mt-3">
        This is the key difference between converting WebP to PNG and
        converting WebP to JPG. JPG cannot store transparency at all,
        so transparent areas have to be flattened to a solid background.
        PNG can, and this converter is careful to keep the alpha
        channel: the canvas is not filled with any color, and the PNG
        encoder writes the transparency out byte for byte. A cutout
        logo on a transparent WebP background comes out as the same
        cutout on a transparent PNG background, ready to drop onto any
        color or texture.
      </p>
      <p className="mt-3">
        If you specifically want a smaller file and do not need
        transparency (a photo, for instance), convert with our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "webp-to-jpg" }}
          className="text-[#e5322d] underline"
        >
          WebP to JPG converter
        </Link>{" "}
        instead: JPG files are typically much smaller than PNG, at the
        cost of transparency and some fine detail.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        WebP vs PNG: what is the difference
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Compression.</strong> WebP is newer and typically
          smaller than PNG at the same visual quality. PNG is lossless
          and usually larger.
        </li>
        <li>
          <strong>Transparency.</strong> Both support full alpha
          transparency, so nothing is lost in the conversion direction
          WebP to PNG.
        </li>
        <li>
          <strong>Animation.</strong> WebP can hold multi-frame
          animations. Standard PNG is single-frame (APNG exists but is
          not universally supported).
        </li>
        <li>
          <strong>Support.</strong> Every browser reads WebP now, but
          many desktop apps, editors, print shops, and upload forms
          still only accept PNG or JPG.
        </li>
        <li>
          <strong>Best use.</strong> WebP for shipping images on your
          own website. PNG for editing masters, logos, screenshots,
          and anywhere universal support matters.
        </li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Convert WebP to PNG in bulk
      </h2>
      <p className="mt-3">
        Batch conversion is built in. Select as many WebP files as you
        like, or drop a whole folder onto the drop zone, and every
        image is converted in one pass. There is no per-file cap and
        no daily limit because the work happens on your own machine.
        When the batch finishes, grab each PNG individually or
        download them all together as a single ZIP archive named
        webp-to-png.zip.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Save WebP as PNG without losing quality
      </h2>
      <p className="mt-3">
        Because PNG is a lossless format, the converter will not
        discard any pixels during encoding. If the source WebP was
        saved losslessly, the PNG is a pixel-perfect copy. If the
        source WebP was lossy (which is common for photos), the PNG
        preserves exactly what is in the file, but it cannot invent
        detail that the WebP compression already threw away. Either
        way, the PNG is a safe, edit-friendly master you can hand to
        any editor.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h2>
      <p className="mt-3">
        Most online WebP to PNG converters upload every image to a
        stranger's server, hold it for hours or days, and quietly log
        the metadata. This tool does the opposite. Decoding and PNG
        encoding both happen inside your browser tab using the Canvas
        API that ships with every modern browser, so your files,
        filenames, and any embedded data stay on your device. Turn
        off Wi-Fi after the page loads and the conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        Because the converter is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook,
        Linux, Android, iPhone, and iPad. On desktop, Chrome and Edge
        give the fastest conversion; on mobile, Safari and Chrome both
        work well. There is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {webpToPngFaqJsonLd.mainEntity.map((q) => (
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
