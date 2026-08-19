import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/jpg-to-webp`;

export const jpgToWebpSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JPG to WebP Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online JPG to WebP converter. Batch convert JPG and JPEG images to modern WebP for faster websites, entirely in your browser. No upload, no signup.",
};

export const jpgToWebpHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert JPG to WebP",
  description:
    "Convert JPG and JPEG images to WebP online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the JPG to WebP tool",
      text: "Open the JPG to WebP converter on pdftoolconverteronline.com. No signup, no account, no install needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your JPG files",
      text: "Drag and drop .jpg or .jpeg files onto the drop zone, or click to select. Add as many as you like.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Pick a quality and click Convert",
      text: "Use the quality slider (default 85) to balance size and clarity, then click Convert. Every JPG is re-encoded as WebP inside your browser tab. Browsers that cannot encode WebP on canvas (Safari, some Firefox) fall back to a WASM WebP encoder, so the output is always a real WebP file.",
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

export const jpgToWebpFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a WebP file and why should I use it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP is a modern image format built by Google specifically for the web. It uses smarter compression than JPG and typically produces files that are 25 to 35 percent smaller at the same visible quality. Smaller images mean faster page loads, less bandwidth for your visitors, and stronger Core Web Vitals scores, which Google uses as a ranking signal.",
      },
    },
    {
      "@type": "Question",
      name: "How much smaller are WebP files compared to JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In real-world tests, WebP is usually 25 to 35 percent smaller than a JPG of matching visual quality. The exact number depends on the content: photos with lots of detail see less savings, while flat or graphic images can drop 40 to 50 percent. You will see the actual saving per file in the results list after conversion.",
      },
    },
    {
      "@type": "Question",
      name: "Will image quality drop when I convert JPG to WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At quality 85 (the default), WebP looks visibly identical to the JPG source for almost every photo. Because your JPG was already compressed, the WebP is technically a re-encode, but WebP is efficient enough that the second pass at 85 is virtually invisible. If you push quality lower (60 to 75), you may see softer edges. For the closest possible match, use 90 to 95.",
      },
    },
    {
      "@type": "Question",
      name: "Is this JPG to WebP converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no email wall, no watermarks, and no daily limit. Convert as many JPG files as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using the Canvas API and, where needed, a WebAssembly WebP encoder that also runs locally. Your JPG files and the resulting WebP images are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert many JPG files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of JPGs, convert them in one pass at your chosen quality, and download every WebP together as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "Can all browsers open WebP images?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every modern browser (Chrome, Edge, Firefox, Safari 14 and later, Opera, and every current mobile browser) displays WebP. Some older desktop software, print shops, and legacy phones still cannot open .webp directly. Keep a JPG copy of anything you plan to hand to older tools, and use WebP for web publishing where reach is not a concern.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use WebP on my website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, for most sites. Serving WebP instead of JPG is one of the fastest wins for page speed and Core Web Vitals: smaller images download faster, Largest Contentful Paint improves, and Google rewards faster pages with better rankings. If you need to support very old software, you can serve WebP with a JPG fallback using the HTML picture element.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert WebP back to JPG later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If you ever need a JPG copy of the WebP, use the WebP to JPG tool in the pdftoolconverteronline.com image toolbox. It is also 100 percent browser-based.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Windows, Mac, Android, and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The converter is a web page, so it runs in any modern browser on Windows 10 and 11, macOS, Chromebook, Linux, Android, iPhone, and iPad. Safari on Mac and iPhone uses a built-in WASM fallback path automatically, so the output is always a real WebP file.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "jpg-to-webp").slice(0, 8);

export function JpgToWebpSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        JPG to WebP, converted in your browser
      </h3>
      <p className="mt-3">
        WebP is Google's modern image format for the web. It ships images
        that are typically 25 to 35 percent smaller than JPG at the same
        visual quality, which is the single fastest way to trim
        megabytes off a web page. This free JPG to WebP converter turns
        any .jpg or .jpeg file into a real .webp inside your browser
        tab, no upload, no signup, no watermark. Convert one image, or
        drop a whole folder and grab the batch as a ZIP.
      </p>
      <p className="mt-3">
        The tool tries the fast native path first: HTML canvas
        toBlob with the image/webp type. On Safari and a few older
        Firefox builds that path silently produces a PNG, so the
        converter feature-detects the returned MIME type and, if it is
        wrong, falls back to a WebAssembly WebP encoder that also runs
        locally. The result is always a genuine WebP file, on every
        browser, without ever sending your image off the device.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert JPG to WebP
      </h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the JPG to WebP tool, no signup needed.</li>
        <li id="step-2">Drag and drop .jpg or .jpeg files, or click to select.</li>
        <li id="step-3">
          Pick a quality (default 85) and click <strong>Convert</strong>.
          Every file is re-encoded to WebP right in your browser.
        </li>
        <li id="step-4">
          Download each WebP, or download the whole batch as a ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why WebP: smaller files, faster pages
      </h3>
      <p className="mt-3">
        WebP was designed from day one for the web. It combines the
        best ideas from JPG (efficient lossy compression) and PNG
        (lossless mode and transparency) into one format, then adds
        smarter prediction and entropy coding. In practice, that means
        your hero image, product photo, or blog thumbnail can lose 200
        to 500 kilobytes with no visible difference. On a mobile
        connection, that is often the difference between a Largest
        Contentful Paint under 2.5 seconds and one that trips a Core
        Web Vitals warning.
      </p>
      <p className="mt-3">
        Faster pages help beyond speed scores. Google has publicly
        confirmed that page experience signals, including Core Web
        Vitals, influence search ranking. Serving WebP instead of JPG
        is one of the highest-return SEO changes you can make in an
        afternoon, and it costs nothing.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Choosing the right WebP quality
      </h3>
      <p className="mt-3">
        The quality slider runs from about 30 to 100. The default of 85
        is the industry sweet spot: files are dramatically smaller than
        JPG, and side by side with the source, the difference is
        invisible for photographic content. Push the slider to 90 or 95
        when you want the closest possible match and file size is not a
        priority. Pull it down to 70 or 75 when the goal is the
        smallest possible thumbnail or gallery preview and mild
        softening is acceptable. The results panel shows the exact
        percent saved per file so you can tune your setting to real
        numbers instead of guesses.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Where WebP is supported (and where it isn't)
      </h3>
      <p className="mt-3">
        Every modern browser reads WebP today: Chrome and Edge since
        launch, Firefox since 65, and Safari since version 14 on both
        macOS and iOS. Every current Android and iPhone displays WebP
        natively. On the desktop, most modern editors (Photoshop with
        the built-in plugin, Affinity Photo, GIMP, Krita) also support
        it.
      </p>
      <p className="mt-3">
        Honest catch: some older or offline software still cannot open
        .webp: older versions of Microsoft Word and PowerPoint, some
        print shops, legacy ID upload forms, and older phones. If you
        need to hand an image to a tool that might be that old, keep a
        JPG copy alongside the WebP. For the web, WebP is safe to use
        as your primary format.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Bulk convert JPG to WebP
      </h3>
      <p className="mt-3">
        Batch conversion is built in. Select as many JPGs as you like,
        or drop a whole folder, and each file is converted in one pass
        at the quality you picked. There is no per-file cap and no
        daily limit because the work happens on your own machine.
        When it finishes, download each WebP individually or grab them
        all together as a single ZIP archive named jpg-to-webp.zip,
        ready to drop into your site's images folder.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your images never leave your device
      </h3>
      <p className="mt-3">
        Most online JPG to WebP converters upload every image to a
        stranger's server, hold it for hours, and log the metadata.
        This tool does the opposite. Both decoding and WebP encoding
        run inside your browser tab using the standard Canvas API and,
        where the browser cannot encode WebP itself, a locally loaded
        WebAssembly encoder. Your files, filenames, and any embedded
        EXIF data stay on your device. Disconnect from the internet
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
        with no manual step required.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h3>
      <dl className="mt-4 space-y-4">
        {jpgToWebpFaqJsonLd.mainEntity.map((q) => (
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
