import { Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/meme-generator`;

export const memeGeneratorSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Meme Generator",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online meme generator with no watermark and no upload. Add classic top and bottom text, extra draggable captions, emoji stickers, image overlays, and multi-panel collages, entirely in your browser.",
};

export const memeGeneratorHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to make a meme online, free",
  description:
    "Make a meme in your browser with no watermark. Add your own image, type top and bottom text, tweak size, then download as JPG or PNG.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the meme generator",
      text: "Open Meme Generator on PDFToolConverter. No signup, no account, and nothing to install.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your image",
      text: "Drag and drop a JPG, PNG, or WebP image, or click Select image. Your photo stays on your device, it never uploads to a server.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Type top and bottom text",
      text: "Type your top text and bottom text. The classic meme style renders in the Anton font, white with a black outline. Toggle UPPERCASE and adjust the font size slider to taste.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Add extra captions or a caption bar",
      text: "Click Add text to drop a draggable caption anywhere on the image, or turn on Caption bar to get a white padding strip above the photo for the modern Twitter and Reddit style.",
      url: `${url}#step-4`,
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Download as JPG or PNG",
      text: "Pick JPG or PNG and click Download meme. There is no watermark added to the output, ever.",
      url: `${url}#step-5`,
    },
  ],
};

export const memeGeneratorFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I change the font and caption colors?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Each text box has font, text-color, and outline-color controls. Available fonts include Anton, Oswald, Bebas Neue, and Comic Neue." },
    },
    {
      "@type": "Question",
      name: "Can I add captions beyond the top and bottom text?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Use Add text to create another caption, then drag its position control in the preview. You can edit or delete each caption separately." },
    },
    {
      "@type": "Question",
      name: "Can I add emojis and my own images as overlays?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Add an emoji or upload an image overlay, then adjust its position, scale, and rotation. The Layers panel controls ordering and deletion." },
    },
    {
      "@type": "Question",
      name: "Can I make a multi-panel meme?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Choose single, two stacked, two side by side, three stacked, or a two-by-two grid. Fill the panels with images and place captions or overlays above the collage." },
    },
    {
      "@type": "Question",
      name: "Should I export as JPG or PNG?",
      acceptedAnswer: { "@type": "Answer", text: "JPG uses lossy compression and can produce smaller files. PNG avoids JPEG compression artifacts around text. Compare the downloaded file before sharing." },
    },
  ],
};

export function MemeGeneratorSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl text-[15px] leading-[1.75] text-[#33333c]">
      <h2 className="mb-3 text-[24px] font-bold text-[#1F2937]">
        How to make a meme online, free
      </h2>
      <p>
        Making a meme should take fifteen seconds, not fifteen minutes. Open
        this page, drop in a photo, type your top and bottom text, and press
        Download meme. That is it. There is no signup wall, no free trial, no
        credit card, and no watermark stamped on the corner of your image.
        Everything runs inside your browser using HTML5 Canvas, so the picture
        of your cat, your friend, or your last vacation never leaves your
        laptop or phone.
      </p>
      <p className="mt-3">
        The tool matches the classic meme layout by default: bold white text at
        the top and bottom, a chunky black outline, and an uppercase toggle so
        captions read from ten meters away. Adjust the font size slider to
        scale text relative to the image so a 4K photo and a 640px screenshot
        both look right. When your caption is longer than a single line, the
        text wraps automatically inside the image bounds and never spills off
        the edge.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">
        Classic top and bottom text
      </h2>
      <p>
        The bold uppercase style that made memes famous originally used the
        Impact typeface. Impact is proprietary, so we cannot legally ship it.
        Instead we offer 4 open-license fonts: Anton (an almost identical
        Impact lookalike from Google Fonts, the default), Oswald, Bebas Neue,
        and Comic Neue for a more playful vibe. Pick a font per text box.
        Every box also has its own text color and outline color pickers with 8
        preset swatches plus a custom color input, so you can match a brand
        palette, invert to black-on-white for light photos, or drop the
        outline entirely for a flatter modern look. Outline thickness still
        auto scales with the font size, so titles stay readable on both light
        and dark photos.

      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">
        Add extra captions anywhere
      </h2>
      <p>
        Not every meme is a two-liner. Reaction images, four-panel jokes, and
        object-labeling memes need more text in more places. Click Add text to
        drop a new caption box on the image, then drag the yellow dot on the
        preview to place it exactly where you want. Each extra box has the same
        classic white text with a black outline, and each one gets its own
        content, so you can label characters, objects, or panels
        independently. Delete a box any time with the trash icon.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">
        Caption bar style
      </h2>
      <p>
        The modern Twitter and Reddit meme style uses a white bar above the
        image with black text, instead of stamping white text on top of the
        photo. Toggle Caption bar to switch to that layout. The height of the
        bar scales with the image and adjusts with the slider. This mode is
        great for text-heavy jokes that would cover too much of the picture in
        classic mode.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">
        Export as JPG or PNG
      </h2>
      <p>
        Pick JPG for smaller files that upload quickly to WhatsApp, Instagram,
        Twitter, or Discord. Pick PNG when you want the sharpest possible text
        edges, or when your source image had transparency you want to keep.
        The download uses the exact same canvas as the preview, so what you
        see is what you get. If you plan to post the meme somewhere with a
        strict file size limit, you can{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "compress-image" }}
          className="text-[#e5322d] underline"
        >
          compress the meme
        </Link>{" "}
        before sharing, still in your browser.
      </p>

      <h2 className="mt-8 mb-3 text-[22px] font-bold text-[#1F2937]">
        Stickers, overlays, and multi-panel collages
      </h2>
      <p>
        Modern memes are not always plain text on a photo. Open the emoji
        picker to drop any of 60 popular emojis (faces, hands, hearts, symbols,
        and misc) onto the image, or paste any Unicode emoji into the free-text
        field. Every emoji becomes its own draggable, scalable, rotatable
        layer, and the export renders the same emoji glyph shown in the
        preview (appearance varies by device since we use native system
        emoji, that is normal). Need to add your own logo, a reaction cut-out,
        or a transparent PNG? Click Add image to upload a second file as an
        overlay layer, scale it from the corner handle, and rotate it into
        place. For four-panel jokes, drake-style comparisons, or before and
        after shots, pick a layout: single, 2 stacked, 2 side by side, 3
        stacked, or a 2 x 2 grid. Click each empty panel in the preview to
        fill it with an image, and your text, emoji, and overlay layers float
        above the whole collage in the export. The Layers panel lets you
        bring a layer forward, send it backward, or delete it.
      </p>

      <h2 className="mt-10 mb-4 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <div className="space-y-4">
        {(memeGeneratorFaqJsonLd.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).map((q) => (
          <div key={q.name}>
            <h3 className="text-[16px] font-semibold text-[#1F2937]">{q.name}</h3>
            <p className="mt-1 text-[14px] text-[#4B5563]">{q.acceptedAnswer.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
