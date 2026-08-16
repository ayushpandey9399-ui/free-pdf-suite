import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/heic-to-png`;

export const heicToPngSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HEIC to PNG Converter",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (browser-based, Windows, macOS, Android, iOS, Linux)",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "pdftoolconverteronline.com", url: SITE_URL },
  description:
    "Free online HEIC to PNG converter. Batch convert iPhone HEIC and HEIF photos to lossless PNG in your browser, no upload and no signup.",
};

export const heicToPngHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert HEIC to PNG",
  description:
    "Convert iPhone HEIC photos to lossless PNG online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Open the HEIC to PNG tool",
      text: "Open the HEIC to PNG tool on pdftoolconverteronline.com. No signup, no account, and no software install is needed.",
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
      name: "Click Convert",
      text: "Click Convert. Each HEIC file is decoded and re-encoded to lossless PNG inside your browser tab. Nothing is uploaded.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download PNGs",
      text: "Download each PNG individually, or download all of them together as a single ZIP file.",
      url: `${url}#step-4`,
    },
  ],
};

export const heicToPngFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a HEIC file?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HEIC (High Efficiency Image Container) is the default photo format on modern iPhones and iPads. It uses the HEVC codec to store the same image at roughly half the size of a JPG, but it is not natively supported on many Windows apps, older editors, and most websites.",
      },
    },
    {
      "@type": "Question",
      name: "Why won't HEIC files open on Windows 11 or Windows 10?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Windows does not ship the HEIF and HEVC extensions by default. Without both codecs installed from the Microsoft Store, Photos, Paint, and File Explorer cannot render HEIC. Converting HEIC to PNG produces a universally supported image that opens everywhere.",
      },
    },
    {
      "@type": "Question",
      name: "Is this HEIC to PNG converter free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No signup, no watermark, no email wall, and no daily limit. Convert as many iPhone HEIC photos as your browser can hold in memory.",
      },
    },
    {
      "@type": "Question",
      name: "Are my photos uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Conversion runs entirely in your browser through a WebAssembly build of libheif. Your HEIC files and the resulting PNGs are never uploaded, stored, or seen by us. You can disconnect from the internet after the page loads and it still works.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple HEIC files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Drop an entire folder of .heic photos, batch convert them in one pass, and download every PNG together as a single ZIP.",
      },
    },
    {
      "@type": "Question",
      name: "Is PNG better quality than JPG for HEIC conversion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG is lossless, so no additional compression artifacts are introduced during the conversion. That makes PNG the right choice for screenshots, graphics, editing masters, and anything you plan to edit further. JPG is smaller and better for sharing photos.",
      },
    },
    {
      "@type": "Question",
      name: "Why is my PNG file larger than the original HEIC?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PNG is lossless, HEIC is highly compressed with the modern HEVC codec. A photograph stored as PNG can easily be 5 to 10 times larger than the same photo as HEIC or JPG. That is normal and is the price of lossless quality.",
      },
    },
    {
      "@type": "Question",
      name: "Does the converter keep photo date and EXIF data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The converter decodes each HEIC into pixels and re-encodes it as a fresh PNG, so EXIF metadata such as capture date, camera model, and GPS coordinates is not carried over. Many people prefer this because it strips location data before sharing. If you need EXIF preserved, keep the original HEIC alongside the PNG.",
      },
    },
    {
      "@type": "Question",
      name: "Does it work on Windows, Mac, Android, and iPhone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool runs in any modern browser (Chrome, Edge, Safari, Firefox), so it works on Windows 10 and 11, macOS, Chromebook, Linux, Android, iPhone, and iPad, without installing anything.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between HEIC and PNG?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HEIC is a compact, lossy, modern format built on HEVC and used mostly on Apple devices. PNG is an older, lossless format that opens in every browser, editor, and OS. HEIC is best for storing many iPhone photos in little space; PNG is best when you need perfect pixel fidelity and universal compatibility.",
      },
    },
  ],
};

const related = imageTools.filter((t) => t.slug !== "heic-to-png").slice(0, 8);

export function HeicToPngSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        HEIC to PNG, converted in your browser
      </h2>
      <p className="mt-3">
        Your iPhone saves photos as HEIC, and Windows 11, Windows 10, and most
        online editors still cannot open the format. This free HEIC to PNG
        converter fixes that in seconds. Drop your iPhone photos and download
        clean, lossless PNG files that open in any app on any device, all
        inside your browser with no upload and no signup.
      </p>
      <p className="mt-3">
        Under the hood we use a WebAssembly build of libheif that runs in your
        browser tab. Your HEIC photos are never sent to a server, there is no
        watermark, and there is no file cap. Batch convert an entire camera
        roll and grab every PNG in one ZIP.
      </p>

      <h2 id="how-to" className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to convert HEIC to PNG
      </h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5">
        <li id="step-1">Open the HEIC to PNG tool, no signup needed.</li>
        <li id="step-2">
          Drag and drop your HEIC files, or click to select. Works with iPhone
          photos and any .heic or .heif file.
        </li>
        <li id="step-3">
          Click <strong>Convert</strong>. Every file is decoded and re-encoded
          to lossless PNG inside your browser tab.
        </li>
        <li id="step-4">Download each PNG, or download all of them as a ZIP.</li>
      </ol>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Why iPhone photos are HEIC and won't open on Windows
      </h2>
      <p className="mt-3">
        Since iOS 11, iPhones store camera photos as HEIC, a container built
        on the HEVC video codec. HEIC files are roughly half the size of an
        equivalent JPG at the same visual quality, which is why Apple made it
        the default, it saves a lot of iCloud and on-device storage.
      </p>
      <p className="mt-3">
        The catch is compatibility. Windows 10 and Windows 11 ship without the
        HEIF Image Extensions and HEVC Video Extensions, so File Explorer
        shows a blank thumbnail, Photos throws a codec error, and Paint refuses
        to open the file at all. Microsoft even charges for the HEVC extension
        in the Store, and older editors, forums, and web upload forms still
        reject .heic outright. Converting HEIC to PNG removes the codec
        problem entirely and gives you a file every app understands.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        HEIC to PNG in bulk
      </h2>
      <p className="mt-3">
        Vacations and camera rolls are never a single file. Select as many
        HEIC photos as you like, or drop a whole folder, and every image is
        converted to lossless PNG in one pass. There is no per-file cap and
        no artificial daily limit because the work happens on your own
        machine. When the batch finishes, download the PNGs individually or
        grab them all as a single ZIP archive.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        PNG vs JPG: which should you choose
      </h2>
      <p className="mt-3">
        PNG is a lossless format. Every pixel of the decoded HEIC is written
        out exactly, with no additional compression artifacts. That makes PNG
        the right choice for screenshots, UI graphics, editing masters,
        anything with sharp edges or text, and any image that supports
        transparency. The trade-off is size: a PNG of a photograph can be 5
        to 10 times larger than the equivalent JPG, because photos compress
        very well as lossy JPG and very poorly as lossless PNG.
      </p>
      <p className="mt-3">
        If you just want smaller files to share on WhatsApp, email, or a
        website, JPG is usually the better pick. Use our{" "}
        <Link
          to="/image-tools/$slug"
          params={{ slug: "heic-to-jpg" }}
          className="text-[#e5322d] underline"
        >
          HEIC to JPG converter
        </Link>{" "}
        for that. Pick PNG when quality and universal editor support matter
        more than file size.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Your photos never leave your device
      </h2>
      <p className="mt-3">
        Photos are personal. They carry faces, locations, timestamps, and
        camera serial numbers. Most online HEIC converters upload every file
        to a stranger's server, keep it for hours or days, and quietly log
        the metadata. This tool does the opposite: HEIC decoding and PNG
        encoding happen entirely inside your browser tab, so your files and
        their metadata stay on your device. Turn off Wi-Fi after the page
        loads and the conversion still works.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        How to stop your iPhone from saving HEIC
      </h2>
      <p className="mt-3">
        If you would rather your iPhone save universally compatible files
        directly, open <strong>Settings &gt; Camera &gt; Formats</strong> and
        pick <strong>Most Compatible</strong>. From that moment on, new
        photos are captured as JPG (and videos as H.264), so you can skip
        the conversion step for new shots. Existing HEIC photos on the phone
        stay HEIC; use this converter to change them to PNG.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Works on Windows, Mac, Android, and iPhone
      </h2>
      <p className="mt-3">
        Because the converter is a web page, it runs anywhere a modern
        browser runs: Windows 10, Windows 11, macOS, Chromebook, Linux,
        Android, iPhone, and iPad. On desktop, Chrome and Edge give the
        fastest conversion; on mobile, Safari and Chrome both work well.
        There is nothing to install, update, or uninstall.
      </p>

      <h2 className="mt-10 text-[22px] font-bold text-[#1F2937]">
        Frequently asked questions
      </h2>
      <dl className="mt-4 space-y-4">
        {heicToPngFaqJsonLd.mainEntity.map((q) => (
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
