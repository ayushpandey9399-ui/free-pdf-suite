import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/webp-to-jpg`;

export const webpToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WebP to JPG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
  description:
    "Free online WebP to JPG converter. Batch convert WebP images (including transparent ones) to universal JPG files in your browser, no upload, no signup.",
};

export const webpToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert WebP to JPG",
  description:
    "Convert WebP images to universal JPG files online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the WebP to JPG tool",
      text: "Open the WebP to JPG tool on FreePDFHub. No signup, no account, and no software install is needed.",
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
      name: "Pick a quality and click Convert",
      text: "Use the quality slider (default 90) to balance size and clarity, then click Convert. Each WebP is drawn on a white canvas and encoded as JPG inside your browser tab. Nothing is uploaded.",
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

export const webpToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a WebP file?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP is a modern image format developed by Google for the web. It compresses better than JPG and PNG at similar quality, supports both lossy and lossless modes, and can carry transparency and animation. Chrome, Edge, Firefox, and Safari save many web images as .webp by default, which is why images downloaded from Google Images or a website often arrive as WebP instead of the JPG or PNG you expected.",
      },
    },
    {
      "@type": "Question",
      name: "Why won't my WebP file open on my computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lot of older or offline software has never added WebP support: some versions of Microsoft Office, Photoshop plugins, wallpaper apps, print shops, legacy image viewers, and older phones cannot open .webp at all. Many upload forms and social platforms also reject WebP. Converting to JPG immediately fixes those cases because JPG is supported everywhere.",
      },
    },
    {
      "@type": "Question",
      name: "Is this WebP to JPG converter free?",
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
        text: "No. Conversion runs entirely in your browser using the standard Canvas API. Your WebP images and the resulting JPGs are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to transparent areas in a WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG cannot store transparency at all. Before drawing the image, this converter fills the canvas with solid white, so any transparent pixels in your WebP become white in the JPG (never black). If you need to keep transparency, convert to PNG instead.",
      },
    },
    {
      "@type": "Question",
      name: "Will I lose quality converting WebP to JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG is a lossy format, so some quality is discarded during encoding. At high quality settings (around 90), the loss is invisible to the eye for most photos. Lower the quality slider only if you need a smaller file and can accept mild softness or block artifacts around edges.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many WebP files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of WebP images, batch convert them in one pass at the quality you picked, and download every JPG together as a single ZIP.",
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
      name: "Does it also work on animated WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Only the first frame is exported, because JPG is a single-frame format. If your WebP is an animation, expect a still image (the poster frame) as the JPG result. For animation, keep the file as WebP or convert to GIF using a dedicated tool.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "webp-to-jpg").slice(0, 8);

export function WebpToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        WebP to JPG, converted in your browser
      </h2>
      <p className="mt-3">
        You saved an image from a website or Google Images and ended up
        with a .webp file that half of your apps refuse to open. This
        free WebP to JPG converter fixes that in one click: drop the
        WebP, pick a quality, get a universal .jpg back. Everything
        runs inside your browser tab, so no image is ever uploaded to a
        server. Convert one file or a whole batch, then download each
        JPG or grab them all as a ZIP.
      </p>
      <p className="mt-3">
        The converter uses the standard HTML Canvas API to decode each
        WebP and re-encode it as JPG. No signup, no watermark, no
        per-file cap. If your browser can view the WebP, it can save it
        as JPG here.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert WebP to JPG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the WebP to JPG tool, no signup needed.</li>
        <li id="step-2">Drag and drop your .webp files, or click to select them.</li>
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
        Why your downloaded images are WebP and won't open
      </h2>
      <p className="mt-3">
        WebP is Google's modern image format for the web. It compresses
        images more efficiently than JPG or PNG, so Chrome, Edge, and
        many websites serve or save pictures as .webp to shave bytes off
        every page. That is great for site speed, but it becomes a
        problem the moment you try to use one of those files in a real
        app. Some versions of Microsoft Word, PowerPoint, and older
        Photoshop installs cannot import .webp. Certain print services,
        wallpaper apps, ID upload forms, e-commerce product uploaders,
        and older phones simply reject the format. Converting to JPG
        makes the image work everywhere without exception.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why convert WebP to JPG
      </h2>
      <p className="mt-3">
        The main reason is universal compatibility. JPG has been
        readable by every image viewer, editor, camera app, print shop,
        and platform for over three decades. When you need to email an
        image, attach it to a job application form, hand it to a printer,
        upload it to a marketplace listing, or drop it into an older
        document editor, JPG just works. Converting your saved WebP files
        to JPG removes the whole class of "this file type is not
        supported" errors.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        What happens to transparency
      </h2>
      <p className="mt-3">
        Here is the one honest catch: JPG has no transparency channel
        at all. When a WebP with transparent areas is exported as JPG,
        those transparent pixels have to become something solid. This
        converter fills them with pure white before drawing the image,
        so a transparent WebP logo comes out as the same logo on a
        white background, never on a black one.
      </p>
      <p className="mt-3">
        If keeping transparency matters (for a logo you plan to layer
        over different colors, for example), convert to PNG instead.
        Once our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "jpg-to-png" }}
          className="text-[#e5322d] underline"
        >
          PNG converter tools
        </Link>{" "}
        cover WebP to PNG, that will preserve the alpha channel byte
        for byte.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        WebP vs JPG: what is the difference
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Compression.</strong> WebP is newer and typically
          smaller than JPG at the same visual quality. JPG is older
          but universally supported.
        </li>
        <li>
          <strong>Transparency.</strong> WebP supports full alpha
          transparency, JPG does not support transparency at all.
        </li>
        <li>
          <strong>Animation.</strong> WebP can hold multi-frame
          animations, JPG is single-frame only.
        </li>
        <li>
          <strong>Support.</strong> Every browser reads WebP now, but
          many desktop apps, editors, printers, and upload forms still
          only accept JPG.
        </li>
        <li>
          <strong>Best use.</strong> WebP for shipping images on your
          own website. JPG for sharing, printing, and uploading
          anywhere else.
        </li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Choosing the right quality
      </h2>
      <p className="mt-3">
        JPG quality is a trade-off between how good the image looks
        and how big the file is. The slider goes from about 30 to 100,
        and the default of 90 is a good starting point for most photos:
        the file stays small, and the loss is invisible at normal
        viewing distances. Push the slider higher (95 to 100) when you
        want the closest possible match to the original WebP and do
        not mind a larger file. Push it lower (60 to 80) when you need
        the smallest possible file for a mailer, chat, or upload form,
        and can accept some softness and mild block artifacts around
        edges.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Convert WebP to JPG in bulk
      </h2>
      <p className="mt-3">
        Batch conversion is built in. Select as many WebP files as you
        like, or drop a whole folder onto the drop zone, and every
        image is converted in one pass at the quality you picked.
        There is no per-file cap and no daily limit because the work
        happens on your own machine. When the batch finishes, grab
        each JPG individually or download them all together as a
        single ZIP archive named webp-to-jpg.zip.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Save WebP as JPG without losing more quality than you have to
      </h2>
      <p className="mt-3">
        Because your source WebP has already been compressed once, a
        careless re-encode at low quality can compound the loss. Stick
        to quality 85 to 95 for anything you care about, and keep the
        original WebP if you plan to edit later. If the WebP is
        lossless (some screenshots and logos are saved that way), a
        high-quality JPG at 95 will look identical on screen for most
        photographic content, but sharp text and thin lines may still
        soften slightly, which is normal for JPG.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h2>
      <p className="mt-3">
        Most online WebP to JPG converters upload every image to a
        stranger's server, hold it for hours or days, and quietly log
        the metadata. This tool does the opposite. Decoding and JPG
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
        {webpToJpgFaqJsonLd.mainEntity.map((q) => (
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
