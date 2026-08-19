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
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
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
      text: "Open the Crop Image tool on pdftoolconverteronline.com. No signup, no account, and nothing to install.",
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

export const cropImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I crop an image to a square?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Add your image, pick the 1:1 preset in the Aspect row, drag the box to the area you want, and click Crop all. A 1:1 crop is perfect for Instagram feed posts and most profile pictures.",
      },
    },
    {
      "@type": "Question",
      name: "Can I crop an image to exact pixel dimensions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Type the width and height you need in the pixel inputs under the preview (X, Y, Width, Height). The crop box moves and resizes on the image to match, so you can see exactly what you will get before you export.",
      },
    },
    {
      "@type": "Question",
      name: "Does cropping reduce image quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Cropping only removes area. The pixels inside the crop rectangle are copied to the output at their original resolution, so quality is not degraded by the crop itself. JPG and WebP outputs go through a re-encode, so use the quality slider (default 0.9) to control that step; PNG stays lossless.",
      },
    },
    {
      "@type": "Question",
      name: "Is this image cropper free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no daily limit, and no email wall. Crop as many images as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every crop happens inside your browser tab using the standard Canvas API. Your originals and the cropped results are never uploaded or stored on our servers. You can even disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Is transparency kept when I crop a PNG or WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PNG and WebP outputs preserve the alpha channel, so transparent backgrounds stay transparent after cropping. JPG has no alpha, so any transparent pixels inside a JPG crop are drawn on a white background.",
      },
    },
    {
      "@type": "Question",
      name: "Can I crop images on my phone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The crop box handles use pointer events with a comfortable hit area, so drag and pinch style adjustments work on Android and iPhone. Photos taken sideways are auto-rotated using EXIF orientation, so you always crop what you see.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG (JPEG), PNG, and WebP inputs and outputs. Each file keeps its original format on export, so a JPG stays a JPG, a PNG stays a PNG, and a WebP stays a WebP.",
      },
    },
    {
      "@type": "Question",
      name: "Can I undo a crop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Nothing is written until you click Crop all. Re-drag the crop box, switch aspect presets, or edit the X, Y, width, and height values as many times as you want before exporting. You can also remove the file from the strip and add it again to start fresh.",
      },
    },
    {
      "@type": "Question",
      name: "Can I crop many images in one go?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add multiple files, switch between them in the file strip to set each crop box, then click Crop all. Download each result individually or grab everything as cropped-images.zip.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "crop-image").slice(0, 8);

export function CropImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        Crop images online, free
      </h4>
      <p className="mt-3">
        Crop an image to a square for Instagram, a wide 16:9 for a
        YouTube thumbnail, a tall 9:16 for Reels and Stories, a
        passport 35 by 45 mm frame for an official form, or any exact
        pixel size a job portal or school application asks for. This
        free image cropper runs entirely inside your browser tab, so
        JPG, PNG, and WebP files stay on your device from the moment
        you drop them in to the moment you download the result.
      </p>
      <p className="mt-3">
        The interactive crop box has draggable corners and edges,
        rule-of-thirds guide lines, and a dim overlay outside the box
        so you can see the composition at a glance. Lock an aspect
        ratio to constrain the box, or leave it on Free and type X, Y,
        width, and height in pixels for pixel-perfect precision. Every
        control works with mouse and with touch, so you can crop
        photos on Android and iPhone the same way you do on a laptop.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to crop an image
      </h4>
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
      </h4>
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
        Crop for social media
      </h4>
      <p className="mt-3">
        Every social network has its own favourite aspect ratio and
        cropping to the right shape before you upload keeps the
        platform from choosing an ugly auto-crop for you. Use the 1:1
        preset for Instagram feed posts and most profile pictures, 4:3
        or 3:4 for classic photo prints, 16:9 for YouTube thumbnails
        and Twitter/X in-stream video covers, and 9:16 for TikTok,
        Instagram Reels, YouTube Shorts, and Instagram Stories. Locked
        aspect ratios keep the box perfectly proportioned no matter
        which handle you drag, so you can concentrate on framing
        instead of doing arithmetic.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Crop passport size photos (35x45)
      </h4>
      <p className="mt-3">
        Indian and international passport photos use a 35 by 45 mm
        frame, which is a 35:45 aspect ratio (roughly 7:9). Pick the
        Passport 35x45 preset in the Aspect row and drag the box to
        centre the face inside the frame. The output is written at the
        exact pixel dimensions of your crop rectangle, which you can
        also type into the pixel inputs (for example 413 by 531 for a
        standard 3.5x4.5 cm photo at 300 DPI). If the form also
        requires a maximum file size like 100 KB, run the file through
        our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "compress-image" }}
          className="text-[#e5322d] underline"
        >
          Compress Image tool
        </Link>{" "}
        after cropping.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Crop JPG, PNG, and WebP
      </h4>
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
      </h4>
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
        Your images never leave your device
      </h4>
      <p className="mt-3">
        Most online image croppers upload every photo to a stranger's
        server, hold it for hours or days, and log the filename. This
        tool does the opposite. Decoding, cropping, and re-encoding
        all run inside your browser tab, powered by the standard
        Canvas API. Your files, filenames, and any embedded EXIF data
        stay on your device. Turn off Wi-Fi after the page loads and
        the cropper still works, which is handy on planes, in cafes,
        or anywhere with a weak signal.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h4>
      <p className="mt-3">
        Because the cropper is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook,
        Linux, Android, iPhone, and iPad. EXIF rotation is honored
        before the crop box appears, so a photo taken sideways on an
        iPhone comes out upright and you crop exactly what you see.
        There is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h4>
      <dl className="mt-4 space-y-4">
        {cropImageFaqJsonLd.mainEntity.map((q) => (
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
