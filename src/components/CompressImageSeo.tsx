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
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online image compressor. Reduce JPG, PNG, and WebP file size with a quality slider or a target size in KB. Secure server-side processing with immediate deletion.",
};

export const compressImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to compress an image",
  description:
    "Reduce the file size of a JPG, PNG, or WebP image online, free, with secure server-side processing.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the image compressor",
      text: "Open the Compress Image tool on pdftoolconverteronline.com. No signup, no account, and no software install is needed.",
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
      name: "Pick Quality or Target size",
      text: "Choose Quality mode and move the slider, or choose Target size mode and enter a size in KB (for example 100, 200, or 50).",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Compress and download",
      text: "Click Compress all. Download each compressed image, or grab all of them as a single ZIP.",
      url: `${url}#step-4`,
    },
  ],
};

export const compressImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I compress an image to 100KB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add your image, switch to Target size mode, type 100 into the KB box (or click the 100 KB chip), and click Compress all. The compressor iterates the encoder until the result lands at or under 100 KB when possible. Very large photos may need a lower target or a small maxWidthOrHeight reduction to hit exactly 100 KB.",
      },
    },
    {
      "@type": "Question",
      name: "Is this image compressor free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no email wall, and no daily limit. Compress as many images as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Is the processing private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Your file is securely uploaded to our server for processing and permanently deleted immediately after your download is complete. We never store, share, or access your files.",
      },
    },
    {
      "@type": "Question",
      name: "Will my image lose quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG and WebP are lossy formats, so some quality is discarded when you compress. At a quality of 80 to 90 the loss is invisible for most photos. Lower the slider or the KB target only when you need a smaller file and can accept mild softness or block artifacts around edges.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compress a PNG without losing quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG compression on the web is essentially lossless-friendly, so a PNG can only shrink so far without changing pixels. Icons, screenshots, and flat graphics compress well. Photos saved as PNG usually shrink far more if you convert them to JPG first using our PNG to JPG tool.",
      },
    },
    {
      "@type": "Question",
      name: "Can I compress many images at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of images, compress them in one pass with the same setting, and download every result together as a single ZIP archive.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG (also known as JPEG), PNG, and WebP. Each file keeps its original format on output, so a JPG stays a JPG, a PNG stays a PNG, and a WebP stays a WebP.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Android and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The compressor is a web page, so it runs in any modern browser on Windows, macOS, Chromebook, Linux, Android, iPhone, and iPad. Nothing to install.",
      },
    },
    {
      "@type": "Question",
      name: "How small can I compress an image?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can target 20 KB, 50 KB, or any other size. The smaller the target, the more visible quality loss. If a photo will not shrink far enough, add a max width or height (for example 1600 or 1200 px) so the compressor can also downscale.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my output slightly larger than the target KB?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The library iterates the encoder to land at or under the target when possible. If the image content resists compression (a busy photo, or a PNG with lots of detail), the closest safe result may sit just above the target. Lower the KB target, or turn on Max width or height, to push it further.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "compress-image").slice(0, 8);

export function CompressImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        Compress images online, free
      </h4>
      <p className="mt-3">
        Compress an image to shrink it for email, upload forms,
        WhatsApp, exam applications, resumes, product listings, or a
        faster website. This free image compressor reduces JPG, PNG,
        and WebP file size. Your file is securely uploaded to our 
        server for processing and permanently deleted 
        immediately after your download is complete. 
        We never store, share, or access your files. 
        Pick a quality, or set an exact target like 100KB, 200KB, 50KB, even
        20KB, and the compressor iterates the encoder until the file
        lands at or under your goal when possible.
      </p>
      <p className="mt-3">
        🔒 Processed securely on our servers. Auto-deleted after download.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to compress an image
      </h4>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the Compress Image tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your JPG, PNG, or WebP images, or click to select them.
        </li>
        <li id="step-3">
          Choose <strong>Quality</strong> mode and move the slider, or choose{" "}
          <strong>Target size</strong> and enter a size in KB.
        </li>
        <li id="step-4">
          Click <strong>Compress all</strong>, then download each image or
          grab them as a single ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Compress an image to a target size (100KB, 200KB, 50KB)
      </h4>
      <p className="mt-3">
        Most online forms cap uploads at a specific size. Job portals
        want a photo under 200KB. School and government exam forms
        often ask for a signature or photo under 100KB, sometimes even
        50KB or 20KB. Instead of guessing quality numbers, switch to
        Target size mode, type the exact KB value, and let the
        compressor iterate for you. The encoder tries progressively
        stronger settings until the result lands at or under your
        target when possible.
      </p>
      <p className="mt-3">
        Preset chips make the common cases one click: 20 KB, 50 KB,
        100 KB, 200 KB, and 500 KB. If a photo refuses to shrink
        enough at high resolution, turn on the optional{" "}
        <strong>Max width or height</strong> box (try 1600 or 1200 px)
        so the compressor can also downscale. Downscaling combined
        with a KB target is the fastest way to compress a large phone
        photo into a tiny upload without visible ugliness.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Compress JPG, PNG, and WebP
      </h4>
      <p className="mt-3">
        The tool accepts JPG (JPEG), PNG, and WebP, and each file
        keeps its original format on output. That is important because
        different formats behave very differently under compression.
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>
          <strong>Compress JPG.</strong> JPG is lossy and made for
          photos, so it can shrink dramatically with almost no visible
          loss at quality 80 to 90. This is the format where you get
          the biggest wins.
        </li>
        <li>
          <strong>Compress PNG.</strong> PNG is a lossless format, so
          the compressor stays lossless-friendly and may only shave a
          modest amount off the file. Icons, screenshots, and flat
          graphics still shrink well. Photos saved as PNG usually
          shrink far more if you convert them to JPG instead,{" "}
          <Link
            to="/image-tools/$slug"
            params={{ slug: "png-to-jpg" }}
            className="text-[#e5322d] underline"
          >
            our PNG to JPG converter
          </Link>{" "}
          does exactly that.
        </li>
        <li>
          <strong>Compress WebP.</strong> WebP is already a very
          efficient format, but re-encoding at a lower quality still
          reduces the file. Expect smaller wins than JPG.
        </li>
      </ul>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Quality vs file size
      </h4>
      <p className="mt-3">
        Compression is a trade. Push quality down to save more bytes,
        push it up to keep more detail. For JPG and WebP, the sweet
        spot for most photos is quality 80 to 90: the file gets much
        smaller and the loss is invisible at normal viewing distances.
        Below 60 you will start to see softness and block artifacts
        near sharp edges. If you care about faces, text, or product
        detail, do not go under 70 unless the target size forces it.
        In Target size mode, the compressor picks quality for you and
        iterates, so you do not have to guess.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Compress images in bulk
      </h4>
      <p className="mt-3">
        Batch compression is built in. Drop a whole folder of images,
        apply the same quality or KB target to all of them in one
        pass, and download every result together as a single ZIP
        archive named compressed-images.zip. There is no per-file cap
        and no daily limit because the work happens on your own
        machine. For each file the tool shows the original size, the
        new size, and the percent saved, so you can see exactly how
        much lighter every image got.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Privacy and security
      </h4>
      <p className="mt-3">
        Your file is securely uploaded to our 
        server for processing and permanently deleted 
        immediately after your download is complete. 
        We never store, share, or access your files. 
        The connection is encrypted and the processing is automated 
        to ensure your data remains completely private during its 
        brief stay on our system.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h4>
      <p className="mt-3">
        Because the compressor is a web page, it runs anywhere a
        modern browser runs: Windows 10, Windows 11, macOS,
        Chromebook, Linux, Android, iPhone, and iPad. On desktop,
        Chrome and Edge give the fastest compression thanks to Web
        Worker support; on mobile, Safari and Chrome both work well.
        There is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h4>
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
      </h4>
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
