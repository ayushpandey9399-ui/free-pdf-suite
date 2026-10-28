import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/rotate-image`;

export const rotateImageSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rotate and Flip Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online image rotator and flipper. Rotate JPG, PNG, and WebP by 90, 180, or 270 degrees, or mirror horizontally and vertically. Batch fix sideways photos in your browser, no upload, no signup.",
};

export const rotateImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to rotate or flip an image online",
  description:
    "Rotate or mirror a JPG, PNG, or WebP image online, free, entirely in your browser.",
  totalTime: "PT30S",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the image rotator",
      text: "Open the Rotate and Flip Image tool on PDFToolConverter. No signup, no account, and nothing to install.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your images",
      text: "Drag and drop your JPG, PNG, or WebP files, or click to select them. Every file shows a live preview of its current orientation.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Rotate or flip",
      text: "Use the per-file buttons for 90 left, 90 right, 180, mirror, or flip vertical. Actions stack, so two 90-right clicks equal 180. Use Apply to all to hit every file at once.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Export",
      text: "Click Apply and export, then download each result or grab the whole batch as a ZIP archive.",
      url: `${url}#step-4`,
    },
  ],
};

export const rotateImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I rotate an image 90 degrees?",
      acceptedAnswer: { "@type": "Answer", text: "Add your image and click 90 left or 90 right on its card. Review the preview, then click Apply and export and download the result." },
    },
    {
      "@type": "Question",
      name: "How do I mirror or flip an image?",
      acceptedAnswer: { "@type": "Answer", text: "Click Mirror to flip horizontally or Flip vertical to flip top-to-bottom. These controls can be combined with rotation." },
    },
    {
      "@type": "Question",
      name: "Does rotating an image reduce quality?",
      acceptedAnswer: { "@type": "Answer", text: "Quarter-turn rotations and flips rearrange pixels without arbitrary-angle resampling. Export still re-encodes the image: JPG and WebP use the quality setting, while PNG uses lossless encoding." },
    },
    {
      "@type": "Question",
      name: "What image formats are supported?",
      acceptedAnswer: { "@type": "Answer", text: "The tool accepts JPG, JPEG, PNG, and WebP. Each result is exported in its source format." },
    },
    {
      "@type": "Question",
      name: "Is transparency kept when I rotate a PNG or WebP?",
      acceptedAnswer: { "@type": "Answer", text: "PNG and WebP output preserve transparency. JPG does not support transparency." },
    },
    {
      "@type": "Question",
      name: "Can I undo a rotation?",
      acceptedAnswer: { "@type": "Answer", text: "Use a file's Reset button to restore its original orientation, or Reset all for the batch. Export creates a separate result without changing your original file." },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "rotate-image").slice(0, 8);

export function RotateImageSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        Rotate and flip images online, free
      </h2>
      <p className="mt-3">
        Fix a sideways vacation photo, mirror a selfie so the writing
        on your shirt reads correctly, flip a scanned page that came
        out upside down, or straighten a whole batch of holiday
        pictures in one click. This free image rotator runs entirely
        inside your browser tab, so JPG, PNG, and WebP files stay on
        your device from the moment you drop them in to the moment
        you download the result.
      </p>
      <p className="mt-3">
        Rotation and flip actions are cumulative and reflected in the
        live preview immediately, so you can experiment without any
        commitment. Two 90-degree clicks equal 180. Mirror plus flip
        vertical equals a 180 rotation. Every file has its own reset
        button, and Apply to all pushes the same action across the
        whole batch in one go, which is the common case for a phone
        camera roll where every landscape shot needs the same 90
        rotation.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to rotate an image
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the Rotate and Flip Image tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your JPG, PNG, or WebP images, or click to select them.
        </li>
        <li id="step-3">
          Click <strong>90 left</strong>, <strong>90 right</strong>,{" "}
          <strong>180</strong>, <strong>Mirror</strong>, or{" "}
          <strong>Flip vertical</strong> on each file card. Use{" "}
          <strong>Apply to all</strong> to hit every file at once.
        </li>
        <li id="step-4">
          Click <strong>Apply and export</strong>, then download each result or
          grab the batch as a ZIP.
        </li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Rotate 90, 180, or 270 degrees
      </h2>
      <p className="mt-3">
        The three rotation buttons cover every practical case. Ninety
        left (which is the same as 270 right) fixes a picture that is
        lying on its right ear. Ninety right rotates the other way.
        One hundred and eighty flips a shot that is fully upside down,
        which happens a lot when you scan a document face-down or take
        a photo with the phone flipped. Because rotations are stored
        as a running value, you can click the same button twice or
        three times to keep going instead of hunting for the right
        preset, and the canvas swaps its width and height on 90 and
        270 rotations so nothing is cropped.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Mirror an image (flip horizontal)
      </h2>
      <p className="mt-3">
        Mirroring is horizontal flipping. Every pixel on the left ends
        up on the right and vice versa. The classic use case is a
        selfie: front cameras save the pixels as the sensor sees them,
        which is the reverse of what you saw on screen while you were
        composing the shot. Mirroring un-reverses it, so any text on
        your shirt or a whiteboard behind you reads left to right
        again. Mirroring is also useful for prepping images for iron-on
        transfers, symmetric layouts, and matching a subject's facing
        direction in a design.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Flip vertically
      </h2>
      <p className="mt-3">
        Vertical flipping turns the picture upside down but leaves
        left and right in place. It is less common than mirroring but
        handy for scanned pages that were fed the wrong way up, for
        reflection effects (rotate a copy 180 and stack it below), and
        for correcting images produced by microscopes, satellite feeds,
        and older scientific equipment that write bottom-to-top.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Rotate JPG, PNG, and WebP
      </h2>
      <p className="mt-3">
        Every rotation keeps the input format on the output side,
        which matters for transparency and file size. PNG and WebP
        outputs preserve the alpha channel, so a logo cropped from a
        transparent PNG stays transparent after rotation, and a
        screenshot with rounded corners keeps them. JPG has no alpha,
        so any transparent pixels in a JPG output are drawn on a solid
        white background. For JPG and WebP outputs the quality slider
        (default 0.9) controls the re-encode; PNG is always lossless.
        Because 90-degree rotations and flips only move pixels around,
        there is no visual quality loss from the operation itself,
        only from the re-encode step. Need to crop the rotated result
        before saving? Send it to our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "crop-image" }}
          className="text-[#e5322d] underline"
        >
          Crop Image tool
        </Link>{" "}
        as the next step.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {rotateImageFaqJsonLd.mainEntity.map((q) => (
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
