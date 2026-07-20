import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/heic-to-jpg`;

export const heicToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HEIC to JPG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "FreePDFHub", url: SITE_URL },
  description:
    "Free online HEIC to JPG converter. Batch convert iPhone HEIC and HEIF photos to JPG in your browser with no upload and no signup.",
};

export const heicToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert HEIC to JPG",
  description:
    "Convert iPhone HEIC photos to JPG online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the HEIC to JPG tool",
      text: "Open the HEIC to JPG tool on FreePDFHub. No signup, no account, and no software install is needed.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Add your HEIC files",
      text: "Drag and drop your HEIC files, or click to select them. Works with iPhone photos and any .heic or .heif file.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Choose JPG quality",
      text: "Pick a JPG quality. 90 percent is a good default; use 100 for archival copies or 60 to 80 for sharing on WhatsApp and email.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Convert in your browser",
      text: "Click Convert. Every HEIC file is decoded and re-encoded to JPG inside your browser tab. Nothing is uploaded.",
      url: `${url}#step-4`,
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Download JPGs",
      text: "Download each JPG individually, or download all of them together as a single ZIP file.",
      url: `${url}#step-5`,
    },
  ],
};

export const heicToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a HEIC file and why does my iPhone use it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HEIC (High Efficiency Image Container) is the default photo format on modern iPhones and iPads. Apple adopted it because it stores the same photo at roughly half the size of a JPG at similar visual quality, which saves storage on your device and in iCloud.",
      },
    },
    {
      "@type": "Question",
      name: "Why won't my HEIC files open on Windows 10 or 11?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Windows 10 and Windows 11 do not include the HEIF Image Extensions and HEVC Video Extensions by default. Without both codecs installed from the Microsoft Store, apps like Photos, Paint, and File Explorer show a blank thumbnail or a codec error. Converting HEIC to JPG sidesteps the codec problem entirely.",
      },
    },
    {
      "@type": "Question",
      name: "Is this HEIC to JPG converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. There is no signup, no watermark, no email wall, and no file limit. Convert as many iPhone HEIC photos as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my photos uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser using a WebAssembly build of libheif. Your HEIC files and the JPGs are never uploaded, stored, or seen by us. You can even disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple HEIC files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop an entire folder of .heic photos, batch convert them in one pass, and download every JPG together as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "Will converting HEIC to JPG reduce quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "JPG is a lossy format, so a small amount of compression is introduced. In practice the quality slider makes this invisible: 90 percent looks identical to the original for photos, and 100 percent produces an archival-grade JPG.",
      },
    },
    {
      "@type": "Question",
      name: "Does the converter keep photo date and EXIF data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The converter decodes each HEIC into pixels and re-encodes it as a fresh JPG, so EXIF metadata such as capture date, camera model, and GPS coordinates is not carried over. Many people prefer this because it strips location data before sharing, but if you need EXIF preserved you should keep the original HEIC alongside the JPG.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Windows, Mac, Android, and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool runs in any modern browser (Chrome, Edge, Safari, Firefox), so it works on Windows 10 and 11, macOS, Android, iPhone, iPad, and Linux without installing anything.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between HEIC and JPG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HEIC uses the modern HEVC codec and is about half the size of a JPG at similar quality, and it can store multi-image bursts and depth data. JPG is older, larger, and lossy, but it opens on virtually every device, website, and app on the planet. HEIC is best for storage; JPG is best for sharing.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert HEIC to JPG on Windows 11 without installing software?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open this page in Chrome or Edge on Windows 11, drop your HEIC files onto the box, click Convert, and download the JPGs. Nothing is installed, no codec pack is needed, and your photos never leave the PC.",
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
        Your iPhone photos are saved as HEIC, and Windows 10, Windows 11, and
        plenty of websites still cannot open them. This free HEIC to JPG
        converter fixes that in seconds. Drop your iPhone photos, pick a
        quality, and download standard JPG files, all inside your browser with
        no upload and no signup.
      </p>
      <p className="mt-3">
        Under the hood we use a WebAssembly build of libheif that runs in your
        browser tab. Your HEIC files are never sent to a server, no watermark
        is added, and there is no file limit. Batch convert a whole camera
        roll and download every JPG at once as a ZIP.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert HEIC to JPG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the HEIC to JPG tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your HEIC files, or click to select. Works with iPhone
          photos and any .heic or .heif file.
        </li>
        <li id="step-3">Choose your JPG quality (90 percent is a safe default).</li>
        <li id="step-4">Click <strong>Convert</strong>, everything runs in your browser.</li>
        <li id="step-5">Download each JPG, or download all of them as a ZIP.</li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why your iPhone photos are HEIC and won't open on Windows
      </h2>
      <p className="mt-3">
        Since iOS 11, iPhones save photos as HEIC (also called HEIF), a
        container built on the HEVC video codec. HEIC files are roughly half
        the size of an equivalent JPG at the same visual quality, which is
        why Apple made it the default: it saves storage on your phone and in
        iCloud.
      </p>
      <p className="mt-3">
        The trade-off is compatibility. Windows 10 and Windows 11 ship
        without the HEIF Image Extensions and HEVC Video Extensions, so File
        Explorer shows a blank thumbnail, Photos throws a codec error, and
        Paint refuses to open the file at all. Microsoft charges for the HEVC
        extension in the Store, and even after installing it, older editors
        and upload forms still reject .heic. Converting to JPG removes the
        problem for good.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Convert HEIC to JPG in bulk
      </h2>
      <p className="mt-3">
        Vacation dumps and camera rolls are never one file. Select as many
        HEIC photos as you like, or drop a whole folder, and every image is
        converted to JPG in one batch. There is no per-file cap and no
        artificial daily limit, because the work happens on your own machine.
        When the batch finishes, download the JPGs individually or grab them
        all as a single ZIP.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your photos never leave your device
      </h2>
      <p className="mt-3">
        Photos are personal. They carry faces, locations, timestamps, and
        camera serial numbers. Most online HEIC converters upload every file
        to a stranger's server, keep it for hours or days, and quietly log
        the metadata. This tool does the opposite: HEIC decoding and JPG
        encoding happen entirely inside your browser tab, so your files and
        their metadata stay on your device. Turn off Wi-Fi after the page
        loads and the conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        HEIC vs JPG: what is the difference
      </h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-[#eee]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f9fafb] text-[#1F2937]">
            <tr>
              <th className="px-4 py-2 font-semibold">Feature</th>
              <th className="px-4 py-2 font-semibold">HEIC</th>
              <th className="px-4 py-2 font-semibold">JPG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            <tr>
              <td className="px-4 py-2">File size</td>
              <td className="px-4 py-2">About 50% smaller</td>
              <td className="px-4 py-2">Larger</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Compatibility</td>
              <td className="px-4 py-2">iPhone, iPad, modern Mac only by default</td>
              <td className="px-4 py-2">Universal, opens everywhere</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Transparency</td>
              <td className="px-4 py-2">Yes (alpha channel)</td>
              <td className="px-4 py-2">No</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Web support</td>
              <td className="px-4 py-2">Safari only, limited elsewhere</td>
              <td className="px-4 py-2">Every browser, every CMS</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Best use</td>
              <td className="px-4 py-2">Storage on iPhone</td>
              <td className="px-4 py-2">Sharing, printing, uploading</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to stop your iPhone from saving HEIC
      </h2>
      <p className="mt-3">
        If you would rather your iPhone save JPGs directly, open
        <strong> Settings &gt; Camera &gt; Formats</strong> and pick
        <strong> Most Compatible</strong>. From that moment on, new photos
        are captured as JPG (and videos as H.264), so you skip the
        conversion step entirely. Existing HEIC photos on the phone stay
        HEIC; use this converter to change them.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        Because the converter is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook, Linux,
        Android, iPhone, and iPad. On desktop, Chrome and Edge give the
        fastest conversion; on mobile, Safari and Chrome both work. There is
        nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {heicToJpgFaqJsonLd.mainEntity.map((q) => (
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
