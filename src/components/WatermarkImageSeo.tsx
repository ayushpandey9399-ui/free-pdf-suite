import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/watermark-image`;

const related = imageTools.filter((t) => t.slug !== "watermark-image").slice(0, 8);

const steps = [
  {
    "title": "Add your images",
    "text": "Select JPG, PNG, or WebP images. You can add several images to one batch."
  },
  {
    "title": "Choose text or a logo",
    "text": "Enter text or upload a JPG, PNG, or WebP logo. A transparent PNG is useful when you want only the logo artwork to show."
  },
  {
    "title": "Adjust the watermark",
    "text": "Set position, opacity, rotation, and margin. Adjust text size and color or logo size. Enable Tile to repeat the mark across the image and review the preview."
  },
  {
    "title": "Apply and download",
    "text": "Apply the settings to the batch. Download individual outputs or the set as a ZIP archive."
  }
];

const faqs = [
  {
    "q": "Can I use my own logo?",
    "a": "Yes. Choose Logo mode and upload a JPG, PNG, or WebP image. SVG logos are not supported."
  },
  {
    "q": "Can I watermark several images at once?",
    "a": "Yes. Add several supported images, configure the watermark once, and apply it to the batch. Download individual outputs or a ZIP archive."
  },
  {
    "q": "Will watermarking leave image pixels unchanged?",
    "a": "No. The watermark changes the pixels it covers, and lossy JPG or WebP re-encoding can change other pixels too. PNG output avoids additional lossy compression."
  },
  {
    "q": "Is transparency preserved?",
    "a": "PNG and WebP outputs retain the alpha channel behind the watermark. JPG output has no transparency and uses a white background."
  },
  {
    "q": "Can others remove the watermark?",
    "a": "A visible watermark is not tamper-proof. Editors may crop or retouch it. Tile and central placement cover more of the image but do not guarantee protection."
  },
  {
    "q": "What size limits apply?",
    "a": "Images and logos above 100 million decoded pixels are rejected. Smaller files and batches can still exceed the memory available on your device."
  }
];

export function WatermarkImageSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to add a watermark to an image online</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6">
          {steps.map((step, i) => (
            <li key={step.title} id={`step-${i + 1}`}>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Text, logo, and tile settings</h2>
        <p className="mt-3 leading-relaxed">Text size is relative to the shorter image dimension; logo size is relative to image width. Tile repeats the chosen text or logo across the canvas. A visible watermark can deter casual reuse, but it cannot guarantee protection from editing or removal.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Formats and quality</h2>
        <p className="mt-3 leading-relaxed">Outputs keep the source format: JPG, PNG, or WebP. PNG and WebP retain transparency; JPG uses a white background. PNG encoding is lossless, while JPG and WebP quality settings can introduce compression changes. The watermark itself changes the marked pixels.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Limits and troubleshooting</h2>
        <p className="mt-3 leading-relaxed">Images and logos above 100 million decoded pixels are rejected. SVG is not supported. Batch size also depends on device memory. Reduce the image dimensions or the number of files if processing fails.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((faq) => (
            <details key={faq.q} className="rounded-lg border p-4">
              <summary className="cursor-pointer font-semibold">{faq.q}</summary>
              <p className="mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Related tools</h2>
        <RelatedToolsGrid items={related} />
      </section>
    </section>
  );
}

export const watermarkImageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const watermarkImageHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add a watermark to an image online",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `${url}#step-1`,
  })),
};

export const watermarkImageSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Add Watermark to Image",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online watermark tool. Add a text or logo watermark to JPG, PNG, and WebP images in your browser. Batch mode, tile pattern, 9-cell position grid, opacity, rotation, no upload, no signup.",
};
