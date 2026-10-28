import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/webp-to-jpg`;

const related = [
  {
    "to": "/image-tools/jpg-to-png",
    "name": "JPG to PNG",
    "blurb": "Convert JPG to lossless PNG"
  },
  {
    "to": "/image-tools/png-to-jpg",
    "name": "PNG to JPG",
    "blurb": "Convert PNG to high-quality JPG"
  },
  {
    "to": "/image-tools/compress-image",
    "name": "Compress Image",
    "blurb": "Reduce JPG file size after converting"
  },
  {
    "to": "/image-tools/image-resize",
    "name": "Resize Image",
    "blurb": "Resize images after converting"
  },
  {
    "to": "/image-tools/rotate-image",
    "name": "Rotate Image",
    "blurb": "Fix image orientation"
  },
  {
    "to": "/image-tools/images-to-pdf",
    "name": "Images to PDF",
    "blurb": "Combine JPGs into a PDF"
  }
] as const;

const steps = [
  {
    "title": "Add WebP files",
    "text": "Select or drag in one or more WebP files. SVG and files not identified as WebP are rejected."
  },
  {
    "title": "Set JPG quality",
    "text": "Choose the JPG quality setting. Higher quality can retain more detail but can also produce a larger file."
  },
  {
    "title": "Convert the images",
    "text": "Click Convert. Each image is decoded and drawn to a canvas at its decoded dimensions, then encoded as JPG."
  },
  {
    "title": "Download the results",
    "text": "Download individual successful outputs, or use Download all as ZIP when multiple results are ready."
  }
];

const faqs = [
  {
    "q": "What happens to transparent backgrounds?",
    "a": "They become white because JPG does not support transparency."
  },
  {
    "q": "Does conversion improve image quality?",
    "a": "No. JPG introduces lossy encoding and cannot restore detail missing from the WebP source."
  },
  {
    "q": "Can I convert several files?",
    "a": "Yes. Add multiple WebP files, convert them in one batch, and download successful outputs individually or as a ZIP."
  },
  {
    "q": "Can I preserve a WebP animation?",
    "a": "No. The tool produces one static JPG per input. It does not preserve animation or offer frame selection."
  },
  {
    "q": "Why might conversion fail?",
    "a": "The file may be damaged or unsupported by your browser. Images above 100 million decoded pixels are rejected. Device memory can also limit image dimensions or batch size."
  },
  {
    "q": "Why can the output be larger?",
    "a": "Different formats encode the same pixels differently. JPG size also depends on the quality setting."
  }
];

export function WebpToJpgSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to convert WebP to JPG</h2>
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
        <h2 className="text-2xl font-bold">Transparency</h2>
        <p className="mt-3 leading-relaxed">JPG has no alpha channel. The tool fills the canvas with white before drawing the WebP, so transparent areas become white. Use PNG output if you need transparency.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Quality and file size</h2>
        <p className="mt-3 leading-relaxed">JPG uses lossy compression. Even a high quality setting cannot recover detail already lost in the WebP source. Output size depends on image content and the quality setting; it is not guaranteed to be smaller.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Troubleshooting and limits</h2>
        <p className="mt-3 leading-relaxed">A decode error can mean a damaged file or missing browser support. Renaming another format to .webp does not make it a valid WebP. Images above 100 million decoded pixels are rejected; device memory can impose lower practical limits. Try fewer or smaller images.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Static output and privacy</h2>
        <p className="mt-3 leading-relaxed">Conversion runs in the browser without uploading the source images. Each file produces one static image; the tool does not export an animation or a sequence of frames.</p>
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

export const webpToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const webpToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert WebP to JPG",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `${url}#step-1`,
  })),
};

export const webpToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter WebP to JPG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Convert WebP images to JPG online instantly in your browser. Batch convert multiple WebP files to JPEG. Free, no signup, no watermark, files never leave your device.",
};
