import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/watermark-image`;

export const watermarkImageSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Add Watermark to Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
  description:
    "Free online watermark tool. Add a text or logo watermark to JPG, PNG, and WebP images in your browser. Batch mode, tile pattern, 9-cell position grid, opacity, rotation, no upload, no signup.",
};

export const watermarkImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a watermark to an image online",
  description:
    "Add a text or logo watermark to one or many photos in your browser, free, with no upload.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the watermark tool",
      text: "Open Add Watermark to Image on FreePDFHub. No signup, no account, and nothing to install.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your images",
      text: "Drag and drop your JPG, PNG, or WebP photos, or click Select images. Any number of files can be batched together with one watermark config.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose text or logo",
      text: "Type your watermark text (name, brand, copyright) or switch to Logo and upload a PNG or JPG logo. Adjust font size, color, or logo scale as needed.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Set opacity, rotation, and position",
      text: "Pick a position from the 9-cell grid (corners, edges, or center), set opacity (30 to 50 percent is a good default), choose a rotation, or enable Tile to repeat the watermark across the whole photo for anti-theft protection.",
      url: `${url}#step-4`,
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Apply and download",
      text: "Click Apply to watermark every image in the batch, then download each file or grab the whole set as a ZIP archive.",
      url: `${url}#step-5`,
    },
  ],
};

export const watermarkImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I add a watermark to a photo without losing quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The watermark is drawn on a full-resolution copy of your image inside the browser and re-encoded once at the quality you pick. The original pixels underneath the watermark are untouched at high quality settings (0.9 to 1.0), and PNG output is always lossless. To keep maximum fidelity, keep quality at 0.9 or above and use PNG for graphics with sharp edges.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use my own logo as a watermark?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Switch to Logo mode and upload a PNG, JPG, or WebP logo. A transparent PNG works best because only the artwork shows on top of your photo. Use the Logo size slider to scale it relative to each image's width, so the same setting looks proportional on a 4000 pixel photo and a 800 pixel photo.",
      },
    },
    {
      "@type": "Question",
      name: "How do I watermark 100 photos at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Drop the whole folder in, set the watermark once (text or logo, opacity, position, tile), then click Apply. Every image gets the exact same watermark and comes out as a ZIP file. There is no per-file cap besides your browser's memory.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best opacity for a watermark?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For a subtle brand mark on published photos, 30 to 50 percent opacity is a good starting point. It is visible but does not fight the image. For anti-theft use where you want to make casual reuse pointless, combine 60 to 80 percent opacity with Tile mode and a 45-degree rotation across the whole photo.",
      },
    },
    {
      "@type": "Question",
      name: "Can a watermark be removed by others?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Honestly, a small corner watermark can often be cropped or cloned out by a determined editor. Watermarks that sit in the center of the image or repeat across it with Tile mode are much harder to remove cleanly because doing so would damage the subject. If you are watermarking to deter theft, prefer Tile plus a diagonal rotation over a tiny corner mark.",
      },
    },
    {
      "@type": "Question",
      name: "Is this watermark tool free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark on the output beyond the one you choose, no daily limit, and no email wall. Watermark as many photos as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my images uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All decoding, drawing, and re-encoding happens inside your browser tab using the standard Canvas API. Your photos, your logo, and the watermarked results never leave your device. This matters a lot for a watermark tool because people often watermark original, unpublished work.",
      },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Input and output are JPG (JPEG), PNG, and WebP. Each file keeps its original format on export, so a JPG stays a JPG, a PNG stays a PNG, and a WebP stays a WebP. Logos can also be JPG, PNG, or WebP.",
      },
    },
    {
      "@type": "Question",
      name: "Is transparency kept when I watermark a PNG or WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. PNG and WebP outputs preserve the alpha channel, so a transparent background stays transparent behind the watermark. JPG output has no alpha, so any transparent pixels in a JPG are flattened onto a white background before the watermark is drawn.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "watermark-image").slice(0, 8);

export function WatermarkImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        Add a watermark to images online, free
      </h2>
      <p className="mt-3">
        Brand a portfolio of photos with your name, protect product
        shots from casual theft, mark a batch of proofs with a
        client's initials, stamp a copyright line on artwork before
        posting to social media, or add a repeating tile pattern
        across an unreleased edit so it cannot be reused without
        permission. This free watermark tool runs entirely inside
        your browser tab, so JPG, PNG, and WebP files stay on your
        device from the moment you drop them in to the moment you
        download the result.
      </p>
      <p className="mt-3">
        One watermark configuration applies to the whole batch, which
        is the common case: you pick the text or logo once, decide
        where it sits, how transparent it is, and how it rotates, and
        every photo in the batch is stamped the same way. A live
        preview updates on each change so you can dial in the exact
        look before exporting. The output is delivered as individual
        files or a single ZIP archive, ready to publish or ship.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to add a watermark
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the Add Watermark to Image tool, no signup needed.</li>
        <li id="step-2">Drop your JPG, PNG, or WebP photos, or click to select them.</li>
        <li id="step-3">
          Pick <strong>Text</strong> and type your line, or pick <strong>Logo</strong>{" "}
          and upload a PNG, JPG, or WebP mark.
        </li>
        <li id="step-4">
          Choose a position on the 9-cell grid, set opacity, rotation, and
          margin. Turn on <strong>Tile</strong> to repeat across the whole photo.
        </li>
        <li id="step-5">
          Click <strong>Apply</strong>, then download each file or the batch as a ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Text watermark vs logo watermark
      </h2>
      <p className="mt-3">
        A text watermark is the fastest option and often the right
        one. Type a copyright line, a name, a URL, or a short brand
        phrase, pick a color and a font size, and it renders using
        the same clean sans-serif the rest of the site uses.
        Text watermarks are readable on almost any background because
        you can tune color and opacity independently. They also scale
        cleanly to any resolution because the tool draws them at the
        image's native pixel size, not by scaling up a raster.
      </p>
      <p className="mt-3">
        A logo watermark uses your own brand mark. Upload a PNG (best),
        JPG, or WebP file, then use the Logo size slider to control
        how wide the logo should be as a percent of the image width.
        A transparent PNG works best because only the artwork shows
        on top of the photo, no white rectangle around it. Both text
        and logo modes support the same position grid, opacity,
        rotation, and tile pattern.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Watermark many photos at once
      </h2>
      <p className="mt-3">
        The single most common use case is a folder of freshly edited
        photos that all need the same corner mark before going out.
        Drop them all in, set the watermark once, click Apply, and
        download watermarked-images.zip. Every image is processed at
        full resolution, no downscaling, and the watermark is scaled
        relative to each image's dimensions so a small proof and a
        full-resolution export both get proportionate marks. There is
        no per-file cap besides your device's memory, so batches of
        one hundred or more images are normal.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Tile watermark to protect photos
      </h2>
      <p className="mt-3">
        Photographers and small sellers often want a watermark that
        cannot simply be cropped off. Enable <strong>Tile</strong> and
        the watermark repeats in a grid across the entire photo. Add
        a 45-degree rotation and the pattern goes diagonal, which is
        the classic anti-theft look used by stock agencies. Because
        the mark is everywhere, removing it cleanly would require
        rebuilding large portions of the image, which is enough of a
        speed bump to deter casual reuse. For proofs shared with
        clients this is often better than a small corner mark.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Choosing opacity and position
      </h2>
      <p className="mt-3">
        Opacity controls how strong the watermark looks against the
        photo. A subtle brand mark on a public post usually sits at
        30 to 50 percent, visible but not fighting the image. An
        anti-theft mark sits higher at 60 to 80 percent so it
        actually gets in the way of reuse. The 9-cell position grid
        covers every corner, every edge midpoint, and the center. A
        bottom-right corner mark is the friendliest default because
        it stays out of the subject and is easy to spot; a center
        mark plus tile is the strongest.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Watermark JPG, PNG, and WebP
      </h2>
      <p className="mt-3">
        Every input format is supported, and the output keeps the
        input format so a JPG stays a JPG, a PNG stays a PNG, and a
        WebP stays a WebP. That matters for transparency: PNG and
        WebP outputs preserve the alpha channel, so a graphic with a
        transparent background stays transparent behind the watermark.
        JPG has no alpha, so any transparent pixels in a JPG input
        are flattened onto a white background before the watermark is
        drawn. For JPG and WebP outputs the quality slider (default
        0.9) controls the re-encode; PNG is always lossless.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your photos never leave your device
      </h2>
      <p className="mt-3">
        Privacy matters more than usual for a watermark tool because
        people watermark unpublished, original work: portfolio
        selects, product proofs, artwork, client previews. Every
        other online watermark tool asks you to upload those files to
        a stranger's server, then trust them to delete afterwards.
        This tool skips that entire step. Decoding, drawing, and
        re-encoding all run inside your browser tab, powered by the
        standard Canvas API. Your files, your logo, and any embedded
        EXIF data stay on your device. Turn off Wi-Fi after the page
        loads and it still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        Because the tool is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook,
        Linux, Android, iPhone, and iPad. EXIF orientation is honored
        first, so a sideways phone photo shows upright in the preview
        and the watermark lands where you expect. After watermarking,
        you can send the results straight to our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "compress-image" }}
          className="text-[#e5322d] underline"
        >
          Compress Image tool
        </Link>{" "}
        to shrink the file size for the web without touching the
        watermark itself.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {watermarkImageFaqJsonLd.mainEntity.map((q) => (
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
