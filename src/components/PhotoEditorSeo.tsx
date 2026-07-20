import { Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/photo-editor`;

export const photoEditorSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Photo Editor",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
  description:
    "Free online photo editor with adjustment sliders and one-tap filters. Edit brightness, contrast, color, and more entirely in your browser. No signup, no upload, no watermark.",
};

export const photoEditorHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to edit a photo online, free",
  description:
    "Edit a photo in your browser with adjustment sliders and one-tap filters. Compare before and after, then download as JPG, PNG, or WebP.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Open the photo editor", text: "Open Photo Editor on FreePDFHub. No signup, no account, and nothing to install.", url: `${url}#step-1` },
    { "@type": "HowToStep", position: 2, name: "Add your image", text: "Drag and drop a JPG, PNG, or WebP image, or click to select. Your photo stays on your device and never uploads.", url: `${url}#step-2` },
    { "@type": "HowToStep", position: 3, name: "Tap a filter or adjust sliders", text: "Try B&W, Sepia, Vintage, Cool, Punchy, or Soft as a starting point, then fine-tune brightness, contrast, saturation, warmth, and blur.", url: `${url}#step-3` },
    { "@type": "HowToStep", position: 4, name: "Compare before and after", text: "Press and hold Hold to compare to see the original image at any time, so you can judge if your edit really improved things.", url: `${url}#step-4` },
    { "@type": "HowToStep", position: 5, name: "Export as JPG, PNG, or WebP", text: "Pick a format, set the quality slider for JPG or WebP, then click Download. The exported photo keeps the full original resolution.", url: `${url}#step-5` },
  ],
};

export const photoEditorFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is the photo editor free and signup-free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every image tool on FreePDFHub is free, with no signup, no account, no trial, and no export limit." } },
    { "@type": "Question", name: "Do my photos get uploaded to a server?", acceptedAnswer: { "@type": "Answer", text: "No. The whole editor runs inside your browser using HTML5 Canvas. Your photo is decoded, adjusted, and re-encoded locally on your own device. Nothing is sent to us." } },
    { "@type": "Question", name: "Does editing reduce image quality?", acceptedAnswer: { "@type": "Answer", text: "Honest answer: the edited file exports at full original resolution, so pixel dimensions are preserved. If you export as JPG or WebP, the format applies its own compression, controlled by the Quality slider. Pick PNG to keep every pixel exact and lossless." } },
    { "@type": "Question", name: "How do I make a photo black and white?", acceptedAnswer: { "@type": "Answer", text: "Tap the B&W filter chip. That sets Grayscale to 100 and gives contrast a small bump. Fine-tune brightness and contrast if you want more punch, then download." } },
    { "@type": "Question", name: "Can I compare before and after or undo?", acceptedAnswer: { "@type": "Answer", text: "Yes. Press and hold Hold to compare on the preview to see the original at any moment. The Reset all button snaps every slider back to zero so you can start fresh." } },
    { "@type": "Question", name: "What file formats are supported?", acceptedAnswer: { "@type": "Answer", text: "You can open JPG, JPEG, PNG, and WebP images. You can export as JPG, PNG, or WebP. PNG keeps transparency where the source has it." } },
    { "@type": "Question", name: "Does the photo editor work on my phone?", acceptedAnswer: { "@type": "Answer", text: "Yes. It works on iPhone, iPad, Android, Windows, macOS, and Linux in any modern browser, Chrome, Safari, Edge, and Firefox included." } },
    { "@type": "Question", name: "Is there a watermark on the output?", acceptedAnswer: { "@type": "Answer", text: "Never. What you see in the preview is exactly what downloads. No logo, no URL, no footer bar, no export cap." } },
    { "@type": "Question", name: "Can I crop or rotate the photo here?", acceptedAnswer: { "@type": "Answer", text: "This editor is focused on adjustments and filters. For crop or rotate, use the dedicated tools, they are also free and 100 percent in your browser." } },
  ],
};

export function PhotoEditorSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl text-[15px] leading-[1.75] text-[#33333c]">
      <h2 className="mb-3 text-[24px] font-bold text-[#1F2937]">How to edit a photo online, free</h2>
      <p>
        Editing a photo should not require an install, an account, or a monthly
        fee. Open this page, drop in a JPG, PNG, or WebP, and every adjustment
        slider and one-tap filter is right there. Try a preset like Vintage or
        Punchy for an instant look, then fine-tune brightness, contrast,
        saturation, and warmth to taste. When it looks right, press Download and
        the edited photo is saved at the same full resolution you started with.
      </p>
      <p className="mt-3">
        Everything happens inside your browser using HTML5 Canvas. Your image
        is decoded, adjusted, and re-encoded on your own laptop or phone. No
        upload, no server-side processing, no queue, no signup. Open the
        network tab in your browser while you export a photo and you will see
        exactly zero requests going out with your image.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Adjust brightness, contrast, and color</h2>
      <p>
        The seven sliders cover the adjustments that fix the vast majority of
        everyday photos. Brightness lifts or dims the overall exposure.
        Contrast pushes shadows down and highlights up so a flat photo has more
        depth. Saturation controls how vivid the colors are, useful for both
        boosting a dull food photo and toning down a sunset that looks
        cartoonish. Warmth shifts the hue toward orange or blue, the fastest
        way to correct a photo that came out too cold under fluorescent light
        or too warm indoors. Grayscale and Sepia are one-slider film looks.
        Blur adds a small soft-focus effect, great for social avatars.
      </p>
      <p className="mt-3">
        Every slider shows its current numeric value and has a tiny reset link
        next to it, so you can undo a single adjustment without wiping the
        others. The Reset all button zeroes everything and returns the preview
        to the original photo.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">One-tap filters, B&W, sepia, vintage, and more</h2>
      <p>
        The filter chips at the top set a preset combination of sliders in a
        single tap. B&W drives grayscale to 100 with a small contrast bump.
        Sepia gives the classic warm brown film look. Vintage combines a light
        sepia tint, a small hue shift, and a slight fade on contrast and
        saturation, a look that is instantly recognizable on Instagram-style
        feeds. Cool tilts everything toward blue for moody outdoor shots.
        Punchy boosts contrast and saturation for high-impact product shots.
        Soft is a low-contrast dreamy look with a hint of blur, ideal for
        portraits. Filters are just starting points, the sliders stay live so
        you can dial them in further.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Fix a dark or washed-out photo</h2>
      <p>
        For a dark indoor photo, try this recipe: bump Brightness by about
        +20, add Contrast around +15 to keep the shadows from turning gray,
        then nudge Saturation +10 so the recovered color does not look
        muddy. If the light is too warm, drop Warmth to about -10. For a
        washed-out photo shot at high ISO or through a hazy window, start
        with Contrast +25, Saturation +15, and if the whites look blue, add
        Warmth around +8. These are starting points, not rules, the whole
        point of live preview is that you can watch the picture change while
        you drag.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Before and after compare</h2>
      <p>
        The Hold to compare button lets you press and hold to see the
        original, un-edited photo instantly. It works with mouse and touch,
        so you can verify on desktop or on a phone. This is the single most
        useful control for judging an edit, if the compare toggle makes your
        edit look worse than the original, dial it back.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Export as JPG, PNG, or WebP</h2>
      <p>
        JPG is the default and the right choice for most photos, small file,
        universal support, adjustable quality slider. PNG is the right choice
        when the source image has transparency you want to keep, or when you
        want the sharpest possible pixel-exact output with no compression.
        WebP is the modern format, roughly 25 to 35 percent smaller than JPG
        at the same visual quality, and every current browser supports it.
        The editor uses a WebAssembly fallback so WebP export works even in
        Safari, where the native canvas encoder can be unreliable.
      </p>
      <p className="mt-3">
        Whichever format you pick, the exported file uses the full original
        pixel dimensions of your source image. The live preview may be
        downscaled for speed on very large photos, but the download is
        always full resolution.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Your photo never leaves your device</h2>
      <p>
        Personal photos are personal. A picture of your child, a screenshot
        with private information, a photo of a document, none of these belong
        on a stranger's server. Because the whole editor runs client-side, you
        can edit sensitive images with the same confidence you would open them
        in a native app. There is no account tied to the images, no cloud
        backup you did not ask for, and no third party quietly logging
        thumbnails.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">Works on Windows, Mac, Android, and iPhone</h2>
      <p>
        The photo editor is a plain web page. It runs in Chrome, Safari,
        Edge, and Firefox on Windows, macOS, and Linux, and in mobile Safari
        on iPhone and iPad and mobile Chrome on Android. All the sliders,
        the compare button, and the filter chips are touch-friendly. If you
        also want to trim the frame or straighten a sideways photo, our{" "}
        <Link to="/image-tools/$slug" params={{ slug: "crop-image" }} className="text-[#e5322d] underline">
          Crop Image
        </Link>{" "}
        tool is right next door, also fully in the browser.
      </p>

      <h2 className="mt-10 mb-4 text-[22px] font-bold text-[#1F2937]">Frequently asked questions</h2>
      <div className="space-y-4">
        {(photoEditorFaqJsonLd.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).map((q) => (
          <div key={q.name}>
            <h3 className="text-[16px] font-semibold text-[#1F2937]">{q.name}</h3>
            <p className="mt-1 text-[14px] text-[#4B5563]">{q.acceptedAnswer.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
