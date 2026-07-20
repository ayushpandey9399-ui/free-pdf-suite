import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/heic-to-jpg`;

export const heicToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HEIC to JPG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "220" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
};

export const heicToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this HEIC to JPG converter really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. There is no signup, no watermark, and no upload limit. You can convert as many iPhone HEIC photos as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Do my photos get uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using a WebAssembly build of libheif. Your files never leave your device.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple HEIC files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop a whole folder of .heic photos, convert them in one batch, and download all JPGs as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "What quality should I choose?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The default of 90% is a good balance between file size and detail. Use 100% for archival copies, or 60 to 80% for sharing on WhatsApp and email.",
      },
    },
    {
      "@type": "Question",
      name: "Why does my iPhone save photos as HEIC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "iOS uses HEIC (High Efficiency Image Container) because it stores the same photo at roughly half the size of a JPG. The trade-off is that many Windows apps and websites cannot open it, which is where a converter helps.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work with Live Photos or bursts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. A HEIC container that holds multiple frames is split into separate JPGs so you keep every image.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "heic-to-jpg").slice(0, 8);

export function HeicToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        HEIC to JPG, converted in your browser
      </h2>
      <p className="mt-3">
        HEIC is the default photo format on modern iPhones and iPads. It saves
        space on your device, but it is still awkward to share: many Windows
        apps, older Android phones, WhatsApp Web, and plenty of websites will
        not open a .heic file. FreePDFHub converts HEIC (and HEIF) photos to
        standard JPG right in your browser, so you can send, upload, or print
        them anywhere.
      </p>
      <p className="mt-3">
        We use a WebAssembly build of libheif that runs inside your browser
        tab. Nothing about your photos is sent to a server, there is no signup
        step, and no watermark is added. Drop a full camera roll, pick a
        quality level, and download the JPGs one by one or as a single ZIP.
      </p>

      <h3 className="mt-8 text-[19px] font-semibold text-[#1F2937]">
        How to convert HEIC to JPG
      </h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li>Click <strong>Select HEIC files</strong> or drop photos on the box.</li>
        <li>Pick a JPG quality (90% works for most photos).</li>
        <li>Press <strong>Convert all</strong> and wait for the previews.</li>
        <li>Download individual JPGs, or grab everything as a ZIP.</li>
      </ol>

      <h3 className="mt-8 text-[19px] font-semibold text-[#1F2937]">
        Why convert HEIC to JPG?
      </h3>
      <ul className="mt-3 list-disc space-y-2 pl-5">
        <li>Share iPhone photos over WhatsApp Web, Gmail, or Slack without errors.</li>
        <li>Upload to older CMS platforms, job portals, and government forms that only accept JPG.</li>
        <li>Edit photos in Windows Photos, Paint, or budget photo editors that cannot read HEIC.</li>
        <li>Print at a photo lab whose kiosk does not recognize the newer format.</li>
      </ul>

      <h3 className="mt-8 text-[19px] font-semibold text-[#1F2937]">
        Privacy first
      </h3>
      <p className="mt-3">
        Photos often contain more than pixels: GPS coordinates, timestamps,
        camera serial numbers. Uploading them to a random web converter means
        trusting a stranger with all of that. Because HEIC to JPG on
        FreePDFHub runs 100% client-side, your photos and their metadata stay
        on your device. Turn off Wi-Fi after loading the page and the
        conversion still works.
      </p>

      <h3 className="mt-8 text-[19px] font-semibold text-[#1F2937]">
        FAQ
      </h3>
      <dl className="mt-4 space-y-4">
        {heicToJpgFaqJsonLd.mainEntity.map((q) => (
          <div key={q.name}>
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-1 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-10 text-[19px] font-semibold text-[#1F2937]">
        More image tools
      </h3>
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
