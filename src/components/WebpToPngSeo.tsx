import { RelatedToolsGrid } from "@/components/RelatedToolsGrid";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/webp-to-png`;

const related = imageTools.filter((t) => t.slug !== "webp-to-png").slice(0, 8);

const steps = [
  {
    "title": "Add WebP files",
    "text": "Select or drag in one or more WebP files. SVG and files not identified as WebP are rejected."
  },
  {
    "title": "Convert the images",
    "text": "Click Convert. Each image is decoded and drawn to a canvas at its decoded dimensions, then encoded as PNG."
  },
  {
    "title": "Download the results",
    "text": "Download individual successful outputs, or use Download all as ZIP when multiple results are ready."
  }
];

const faqs = [
  {
    "q": "What happens to transparent backgrounds?",
    "a": "The PNG output preserves the decoded image alpha channel, so transparent areas stay transparent."
  },
  {
    "q": "Does conversion improve image quality?",
    "a": "No. PNG preserves the decoded pixels without further lossy compression, but it cannot restore detail lost in the source."
  },
  {
    "q": "Can I convert several files?",
    "a": "Yes. Add multiple WebP files, convert them in one batch, and download successful outputs individually or as a ZIP."
  },
  {
    "q": "Can I preserve a WebP animation?",
    "a": "No. The tool produces one static PNG per input. It does not preserve animation or offer frame selection."
  },
  {
    "q": "Why might conversion fail?",
    "a": "The file may be damaged or unsupported by your browser. Images above 100 million decoded pixels are rejected. Device memory can also limit image dimensions or batch size."
  },
  {
    "q": "Why can the output be larger?",
    "a": "Different formats encode the same pixels differently. Lossless PNG often uses more space than compressed WebP."
  }
];

export function WebpToPngSeo() {
  return (
    <section className="mx-auto mt-14 max-w-4xl space-y-8 px-4 pb-16 text-[#33333c]">
      <section>
        <h2 className="text-2xl font-bold">How to convert WebP to PNG</h2>
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
        <p className="mt-3 leading-relaxed">The canvas retains its alpha channel and is not filled with a background color. Transparent areas remain transparent in the PNG output.</p>
      </section>
      <section>
        <h2 className="text-2xl font-bold">Quality and file size</h2>
        <p className="mt-3 leading-relaxed">PNG encoding is lossless for the decoded pixels, but cannot recover detail already lost through lossy WebP compression. PNG output can be much larger than the source. There is no quality slider.</p>
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

export const webpToPngFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export const webpToPngHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert WebP to PNG",
  step: steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.title,
    text: step.text,
    url: `${url}#step-1`,
  })),
};

export const webpToPngSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "WebP to PNG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description:
    "Free online WebP to PNG converter. Batch convert .webp images to lossless PNG in your browser with transparency preserved, no upload, no signup.",
};
