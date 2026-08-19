import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/png-to-webp`;

export const pngToWebpSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PNG to WebP Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online PNG to WebP converter. Batch convert PNG images to modern WebP with transparency preserved, entirely in your browser. No upload, no signup.",
};

export const pngToWebpHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert PNG to WebP",
  description:
    "Convert PNG images to WebP online, free, with transparency preserved, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the PNG to WebP tool",
      text: "Open the PNG to WebP converter on pdftoolconverteronline.com. No signup, no account, no install needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your PNG files",
      text: "Drag and drop .png files onto the drop zone, or click to select. Add as many as you like, including transparent logos and graphics.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Pick a quality and click Convert",
      text: "Use the quality slider (default 85) to balance size and clarity, then click Convert. Every PNG is re-encoded as WebP inside your browser tab, with the alpha channel preserved. Browsers that cannot encode WebP on canvas (Safari, some Firefox) fall back to a WASM WebP encoder that also carries alpha through, so the output is always a real WebP file with transparency intact.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download WebP",
      text: "Download each WebP file, or grab the whole batch as a single ZIP.",
      url: `${url}#step-4`,
    },
  ],
};

export const pngToWebpFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does transparency survive when converting PNG to WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. WebP fully supports an alpha channel, so every transparent pixel in your PNG stays transparent in the resulting WebP. That makes this converter safe for logos, icons, product cutouts, and any graphic that needs to sit on a coloured background. Our preview shows a checkerboard behind the converted image so you can visually confirm that the transparency carried across.",
      },
    },
    {
      "@type": "Question",
      name: "How much smaller is WebP compared to PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For typical photo-like PNGs, WebP is often 60 to 80 percent smaller. For flat graphics and screenshots, expect 40 to 70 percent. Transparent logos usually shrink by 50 to 70 percent while staying visually identical. The exact number depends on the image, and the results panel shows the actual saving per file so you can measure it on your own images.",
      },
    },
    {
      "@type": "Question",
      name: "Will image quality drop when I convert PNG to WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At the default quality of 85, WebP looks visually identical to the source PNG for photos and photo-like content, and stays crisp for graphics. Because WebP has a lossy mode and a lossless mode, the encoder picks efficient settings for typical content. If you need pixel-perfect output for tiny UI icons, push the slider to 95 or 100. If you want the smallest possible file for a website thumbnail, pull it down to 70 to 75.",
      },
    },
    {
      "@type": "Question",
      name: "Is this PNG to WebP converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no email wall, no watermarks, and no daily limit. Convert as many PNG files as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using the Canvas API and, where needed, a WebAssembly WebP encoder that also runs locally. Your PNG files and the resulting WebP images are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many PNG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of PNGs, convert them in one pass at your chosen quality, and download every WebP together as a single ZIP file called png-to-webp.zip.",
      },
    },
    {
      "@type": "Question",
      name: "Can all browsers open WebP images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every modern browser (Chrome, Edge, Firefox, Safari 14 and later, Opera, and every current mobile browser) displays WebP with transparency. Some older desktop software, print shops, and legacy phones still cannot open .webp directly. Keep a PNG copy of anything you plan to hand to older tools, and use WebP for web publishing where reach is not a concern.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use WebP for my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, for most sites. Serving WebP instead of PNG is one of the fastest wins for page speed and Core Web Vitals: smaller images download faster, Largest Contentful Paint improves, and Google rewards faster pages with better rankings. Transparency and lossless WebP mean you can replace PNG almost anywhere without redesign work. For maximum reach you can serve WebP with a PNG fallback using the HTML picture element.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert WebP back to PNG later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If you ever need a PNG copy of the WebP, use the WebP to PNG tool in the pdftoolconverteronline.com image toolbox. It also preserves transparency, and it is 100 percent browser-based.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Windows, Mac, Android, and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The converter is a web page, so it runs in any modern browser on Windows 10 and 11, macOS, Chromebook, Linux, Android, iPhone, and iPad. Safari on Mac and iPhone uses a built-in WASM fallback path automatically, so the output is always a real WebP file with the alpha channel intact.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "png-to-webp").slice(0, 8);

export function PngToWebpSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        PNG to WebP, converted in your browser
      </h3>
      <p className="mt-3">
        WebP is Google's modern image format for the web. Compared to
        PNG, it typically produces files that are 50 to 80 percent
        smaller while keeping the alpha channel intact, which is the
        single fastest way to trim megabytes off a web page without
        losing transparency. This free PNG to WebP converter turns any
        .png file into a real .webp inside your browser tab, no upload,
        no signup, no watermark. Convert one image, or drop a whole
        folder and grab the batch as a ZIP.
      </p>
      <p className="mt-3">
        The tool tries the fast native path first: HTML canvas
        toBlob with the image/webp type. On Safari and a few older
        Firefox builds that path silently produces a PNG, so the
        converter feature-detects the returned MIME type and, if it is
        wrong, falls back to a WebAssembly WebP encoder that also runs
        locally and preserves alpha. The result is always a genuine
        WebP file, on every browser, with transparency carried through
        pixel for pixel.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert PNG to WebP
      </h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the PNG to WebP tool, no signup needed.</li>
        <li id="step-2">Drag and drop .png files, or click to select.</li>
        <li id="step-3">
          Pick a quality (default 85) and click <strong>Convert</strong>.
          Every PNG is re-encoded to WebP right in your browser, alpha
          channel intact.
        </li>
        <li id="step-4">
          Download each WebP, or download the whole batch as a ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Transparency is preserved
      </h3>
      <p className="mt-3">
        This is the most important guarantee of a PNG to WebP tool, and
        the one many free converters get wrong. WebP fully supports an
        alpha channel, so every transparent pixel in your PNG stays
        transparent in the resulting WebP. Logos with a see-through
        background, product cutouts, UI icons, PNG stickers, and
        text-with-shadow assets all convert cleanly, ready to drop onto
        any coloured background without a white halo around them.
      </p>
      <p className="mt-3">
        Under the hood we skip the two mistakes that break alpha in
        naive converters: we never pass the canvas the alpha:false
        flag, and we never fill a background colour before drawing the
        image. When Safari or older Firefox forces us onto the WASM
        fallback path, we hand the encoder the raw ImageData buffer
        including the RGBA channel, so alpha survives that path too.
        The preview grid places every converted image on a subtle
        checkerboard so you can visually confirm the transparency
        carried across before you download.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why WebP for your website
      </h3>
      <p className="mt-3">
        PNG is lossless and universal, but it is also large. A modern
        product photograph exported as PNG can easily hit two or three
        megabytes, while the same image as WebP at quality 85 will land
        under 400 kilobytes with no visible difference. That single
        change lets a hero section load before the visitor scrolls,
        keeps a mobile product grid snappy, and cuts your monthly
        bandwidth bill.
      </p>
      <p className="mt-3">
        Faster pages help beyond speed scores. Google has publicly
        confirmed that page experience signals, including Core Web
        Vitals, influence search ranking. Swapping PNG assets for WebP
        is one of the highest-return SEO changes you can make in an
        afternoon, and it costs nothing.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Choosing the right WebP quality
      </h3>
      <p className="mt-3">
        The quality slider runs from about 30 to 100. The default of 85
        is the industry sweet spot: files are dramatically smaller than
        the source PNG, and side by side with the original, the
        difference is invisible for photographic content and clean for
        graphics. Push the slider to 90 or 95 when you want the closest
        possible match to a PNG that had subtle gradients or fine text,
        such as small UI screenshots. Pull it down to 70 or 75 when the
        goal is the smallest possible thumbnail or gallery preview and
        mild softening is acceptable. The results panel shows the exact
        percent saved per file so you can tune your setting to real
        numbers instead of guesses.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Where WebP is supported (and where it isn't)
      </h3>
      <p className="mt-3">
        Every modern browser reads WebP with transparency today: Chrome
        and Edge since launch, Firefox since 65, and Safari since
        version 14 on both macOS and iOS. Every current Android and
        iPhone displays WebP natively. On the desktop, most modern
        editors (Photoshop with the built-in plugin, Affinity Photo,
        GIMP, Krita) also support it.
      </p>
      <p className="mt-3">
        Honest catch: some older or offline software still cannot open
        .webp: older versions of Microsoft Word and PowerPoint, some
        print shops, older phones, and a handful of legacy CMS upload
        forms. If you need to hand an image to a tool that might be
        that old, keep a PNG copy alongside the WebP. For the web,
        WebP is safe to use as your primary format.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Bulk convert PNG to WebP
      </h3>
      <p className="mt-3">
        Batch conversion is built in. Select as many PNGs as you like,
        or drop a whole folder, and each file is converted in one pass
        at the quality you picked. There is no per-file cap and no
        daily limit because the work happens on your own machine.
        When it finishes, download each WebP individually or grab them
        all together as a single ZIP archive named png-to-webp.zip,
        ready to drop into your site's images folder.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h3>
      <p className="mt-3">
        Most online PNG to WebP converters upload every image to a
        stranger's server, hold it for hours, and log the metadata.
        This tool does the opposite. Both decoding and WebP encoding
        run inside your browser tab using the standard Canvas API and,
        where the browser cannot encode WebP itself, a locally loaded
        WebAssembly encoder. Your files, filenames, and any embedded
        metadata stay on your device. Disconnect from the internet
        after the page loads and the conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h3>
      <p className="mt-3">
        Because the converter is a web page, it runs anywhere a modern
        browser runs: Windows 10 and 11, macOS, Chromebook, Linux,
        Android, iPhone, and iPad. Chrome and Edge give the fastest
        encoding on desktop. Safari on Mac and iPhone uses the WASM
        fallback path automatically, so the output is a real WebP file
        with transparency intact and no manual step required.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h3>
      <dl className="mt-4 space-y-4">
        {pngToWebpFaqJsonLd.mainEntity.map((q) => (
          <div key={q.name}>
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-1 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        More image tools
      </h3>
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
