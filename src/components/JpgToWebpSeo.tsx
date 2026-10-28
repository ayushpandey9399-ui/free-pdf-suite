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
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
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
      text: "Open the JPG to WebP converter on PDFToolConverter. No signup, no account, no install needed.",
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
      name: "How do I choose the WebP quality?",
      acceptedAnswer: { "@type": "Answer", text: "The slider runs from 30 to 100 and defaults to 85. Lower settings can reduce file size but may introduce visible artifacts. Compare the downloaded result with your original." },
    },
    {
      "@type": "Question",
      name: "Will the WebP always be smaller than the JPG?",
      acceptedAnswer: { "@type": "Answer", text: "No. Output size depends on the image and quality setting. The results show the original size, output size, and percentage change." },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded for conversion?",
      acceptedAnswer: { "@type": "Answer", text: "No. Decoding and encoding run in your browser. The tool tries native canvas WebP encoding and loads a local WebAssembly encoder if needed." },
    },
    {
      "@type": "Question",
      name: "Can I convert several JPG files together?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Select or drop multiple JPG or JPEG files and click Convert all. Download results individually or download multiple completed images as a ZIP. A single completed image downloads directly." },
    },
    {
      "@type": "Question",
      name: "Why might an image fail to convert?",
      acceptedAnswer: { "@type": "Answer", text: "An image can fail if it cannot be decoded, exceeds the decoded-image safety limit, or cannot be processed with the available browser resources. Try a smaller image or a smaller batch." },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "jpg-to-webp").slice(0, 8);

export function JpgToWebpSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        JPG to WebP, converted in your browser
      </h2>
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
      </h2>
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
        Choosing the right WebP quality
      </h2>
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
      </h2>
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
      </h2>
      <p className="mt-3">
        Batch conversion is built in. Select as many JPGs as you like,
        or drop a whole folder, and each file is converted in one pass
        at the quality you picked. Images above 100 million pixels are rejected, and there is no
        daily limit because the work happens on your own machine.
        When it finishes, download each WebP individually or grab them
        all together as a single ZIP archive named jpg-to-webp.zip,
        ready to drop into your site's images folder.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
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
