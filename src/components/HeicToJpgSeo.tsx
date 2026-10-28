import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/heic-to-jpg`;

export const heicToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter HEIC to JPG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  description: "Convert HEIC photos to JPG online instantly in your browser. Batch convert iPhone HEIC images to JPG without losing quality. Free, no signup, no watermark; files never leave your device.",
};

export const heicToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert HEIC to JPG",
  description: "Convert iPhone HEIC photos to JPG format instantly in your browser. Batch convert multiple HEIC files at once.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload Your HEIC Files",
      text: "Click the 'Select HEIC files' button or drag and drop your HEIC photos onto the upload area. You can add multiple HEIC files at once for batch conversion.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set Quality Options",
      text: "Choose the output quality level. Higher quality preserves more image detail but produces larger JPG files.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Convert All Files",
      text: "Click the convert button. The tool processes each HEIC file individually in your browser using the heic2any library.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download Your JPG Files",
      text: "Download individual JPG files or download all converted images at once as a ZIP archive.",
      url: `${url}#step-4`,
    },
  ],
};

export const heicToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which input files are accepted?",
      acceptedAnswer: { "@type": "Answer", text: "The tool accepts HEIC and HEIF files and converts them to JPG." },
    },
    {
      "@type": "Question",
      name: "Can I change the JPG quality?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Set the quality before conversion. JPG uses lossy compression, so lower quality can reduce file size at the cost of detail." },
    },
    {
      "@type": "Question",
      name: "Can I reduce the image dimensions?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Choose a maximum-size option instead of Original. The resize step reduces the longest edge to the selected limit without enlarging smaller images." },
    },
    {
      "@type": "Question",
      name: "Can I change the output filenames?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can add a filename prefix before converting." },
    },
    {
      "@type": "Question",
      name: "Can I download a batch?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Successful conversions can be downloaded individually or together in a ZIP file. When there is one successful result, the main download offers that JPG." },
    },
    {
      "@type": "Question",
      name: "What happens if one file fails?",
      acceptedAnswer: { "@type": "Answer", text: "The tool records an error for that file and continues processing the remaining files. You can still download successful results." },
    },
  ],
};

export function HeicToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#383E45]">What Is HEIC and Why Do You Need to Convert It?</h2>
      <p className="mt-3">
        HEIC stands for High Efficiency Image Container. It is the default photo format used by iPhones and iPads since iOS 11 (released in 2017). Apple switched to HEIC because it uses the HEVC (H.265) compression algorithm, which compresses photos to roughly half the file size of a JPEG while maintaining the same visual quality. A photo that would be 3MB as a JPG becomes approximately 1.5MB as a HEIC file. This is why your iPhone can store roughly twice as many photos in the same storage space.
      </p>
      <p className="mt-3">
        Despite its technical advantages, HEIC has a major compatibility problem. It is an Apple proprietary format and is not natively supported by most non-Apple systems and applications. Windows computers (especially older versions of Windows 10 and Windows 11 without the HEIF Image Extensions installed) cannot open HEIC files. Most websites, social media platforms, email clients, online stores, and third-party applications do not accept HEIC uploads. Try to submit a HEIC photo to an online application form, visa portal, or social media platform and you will typically receive an error message.
      </p>
      <p className="mt-3">
        JPG (JPEG) is the universal image format supported by every device, operating system, browser, and application in the world. Converting HEIC photos to JPG solves the compatibility problem permanently. The converted JPG files can be opened, shared, uploaded, and used everywhere without any format errors or compatibility issues.
      </p>
      <p className="mt-3">
        Converting HEIC to JPG is essential in everyday situations. Sending iPhone photos to Android users, uploading photos to government and university portals, submitting photos to online stores, printing at a photo lab, sharing with Windows users via email, and posting on websites that do not accept HEIC, all of these require JPG format.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">How to Convert HEIC to JPG Online: Step by Step</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-1">Step 1: Upload Your HEIC Files</h3>
      <p className="mt-2">
        Click the "Select HEIC files" button or drag and drop your HEIC photos onto the upload area. You can add multiple HEIC files at once for batch conversion. All processing happens locally in your browser, your photos never leave your device.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-2">Step 2: Set Quality Options</h3>
      <p className="mt-2">
        Choose the output quality level. Higher quality preserves more image detail but produces larger JPG files. For most everyday uses, sharing on messaging apps, social media, or email, standard quality produces excellent results at a fraction of the file size. For professional or print use, select maximum quality.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-3">Step 3: Convert All Files</h3>
      <p className="mt-2">
        Click the convert button. The tool processes each HEIC file individually in your browser using the heic2any library. Multiple files are converted simultaneously for fast batch processing. A progress indicator shows the status of each file.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]" id="step-4">Step 4: Download Your JPG Files</h3>
      <p className="mt-2">
        Download individual JPG files or download all converted images at once as a ZIP archive. Every JPG output file is clean, no watermarks, no branding, and full quality preserved from the original HEIC source.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Why iPhone Photos Are Saved as HEIC</h2>
      <p className="mt-3">
        Apple introduced HEIC as the default camera format in iOS 11 to help users store more photos without running out of storage space. The iPhone's camera produces high-resolution images, a 12-megapixel photo shot on an iPhone can be 6-8MB as a JPEG. With HEIC compression, that same photo shrinks to 3-4MB with no visible quality difference to the human eye. For users who take hundreds of photos, this difference adds up to gigabytes of saved storage.
      </p>
      <p className="mt-3">
        HEIC also supports advanced features that JPEG cannot match. It can store multiple images in a single file, this is how iPhone Live Photos work (storing both the still image and the short video clip in one HEIC file). HEIC supports 16-bit color depth compared to JPEG's 8-bit, producing more accurate colors and smoother gradients. It also stores depth information from Portrait mode shots.
      </p>
      <p className="mt-3">
        You can configure your iPhone to capture photos in JPG instead of HEIC by going to Settings → Camera → Formats → Most Compatible. This saves all future photos as JPG but uses more storage space. Most iPhone users prefer to keep HEIC for storage efficiency and convert photos to JPG only when needed for sharing or uploading.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">HEIC vs JPG: Full Comparison</h2>
      <div className="mt-4 overflow-hidden rounded-lg border border-[#eee]">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#f9fafb] text-[#383E45]">
            <tr>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">Feature</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">HEIC</th>
              <th className="px-4 py-2 font-semibold border-b border-[#eee]">JPG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee]">
            <tr>
              <td className="px-4 py-2">File Size</td>
              <td className="px-4 py-2">~50% smaller</td>
              <td className="px-4 py-2">Larger</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Quality</td>
              <td className="px-4 py-2">Equivalent to JPG</td>
              <td className="px-4 py-2">Standard</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Color Depth</td>
              <td className="px-4 py-2">16-bit</td>
              <td className="px-4 py-2">8-bit</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Live Photo Support</td>
              <td className="px-4 py-2">Yes</td>
              <td className="px-4 py-2">No</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Universal Compatibility</td>
              <td className="px-4 py-2">Apple devices only</td>
              <td className="px-4 py-2">All devices</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Windows Support</td>
              <td className="px-4 py-2">Limited</td>
              <td className="px-4 py-2">Full</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Social Media Upload</td>
              <td className="px-4 py-2">Often rejected</td>
              <td className="px-4 py-2">Always accepted</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Photo Lab Printing</td>
              <td className="px-4 py-2">Often rejected</td>
              <td className="px-4 py-2">Always accepted</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Email Inline Preview</td>
              <td className="px-4 py-2">Limited</td>
              <td className="px-4 py-2">Full</td>
            </tr>
            <tr>
              <td className="px-4 py-2">Photo Editing Support</td>
              <td className="px-4 py-2">Limited</td>
              <td className="px-4 py-2">Full</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Tips for Converting HEIC to JPG Effectively</h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Use Batch Conversion for Multiple Files</h3>
      <p className="mt-2">
        Add all your HEIC files at once instead of converting them one by one. Our tool processes multiple files simultaneously, making batch conversion just as fast as converting a single file.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Set iPhone to Capture in JPG Directly</h3>
      <p className="mt-2">
        If you frequently need JPG photos, configure your iPhone to shoot in Most Compatible mode: Settings → Camera → Formats → Most Compatible. This saves future photos as JPG, eliminating the need to convert them later. Note that this increases per-photo storage usage.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Compress After Converting for Uploads</h3>
      <p className="mt-2">
        If you need to upload photos to a portal with a strict file size limit, convert HEIC to JPG first, then use our <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#E5322D] hover:underline">Compress Image tool</Link> to reduce the file size while maintaining acceptable quality.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Convert to PNG for Transparent Backgrounds</h3>
      <p className="mt-2">
        If your HEIC photo needs a transparent background for design work, use our <Link to="/image-tools/$slug" params={{ slug: "heic-to-png" }} className="text-[#E5322D] hover:underline">HEIC to PNG tool</Link> instead of HEIC to JPG. PNG supports transparency while JPG fills transparent areas with white.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#383E45]">Resize After Converting for Specific Requirements</h3>
      <p className="mt-2">
        Many application forms have both format and dimension requirements for photo uploads. After converting HEIC to JPG, use our <Link to="/image-tools/$slug" params={{ slug: "image-resize" }} className="text-[#E5322D] hover:underline">Resize Image tool</Link> to set the exact pixel dimensions required.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Frequently Asked Questions About HEIC to JPG Conversion</h2>
      <dl className="mt-4 space-y-4">
        {heicToJpgFaqJsonLd.mainEntity.map((q, idx) => (
          <div key={idx} className="border-b border-[#eee] pb-4">
            <dt className="font-semibold text-[#383E45]">{q.name}</dt>
            <dd className="mt-2 text-[#33333c]">
              {q.name === "Can I convert HEIC to PNG instead of JPG?" ? (
                <span>Yes. Use our <Link to="/image-tools/$slug" params={{ slug: "heic-to-png" }} className="text-[#E5322D] hover:underline">HEIC to PNG</Link> converter for lossless output with sharper edges and transparency support.</span>
              ) : q.acceptedAnswer.text}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-10 text-[24px] font-bold text-[#383E45]">Related Image Tools</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "HEIC to PNG", desc: "Convert iPhone photos to PNG", slug: "heic-to-png", type: "image" },
          { name: "JPG to PNG", desc: "Convert JPG images to PNG", slug: "jpg-to-png", type: "image" },
          { name: "Compress Image", desc: "Reduce file size after converting", slug: "compress-image", type: "image" },
          { name: "Resize Image", desc: "Resize photos after converting", slug: "image-resize", type: "image" },
          { name: "PNG to JPG", desc: "Convert PNG images to JPG", slug: "png-to-jpg", type: "image" },
          { name: "WebP to JPG", desc: "Convert WebP images to JPG", slug: "webp-to-jpg", type: "image" },
          { name: "Rotate Image", desc: "Fix photo orientation", slug: "rotate-image", type: "image" },
          { name: "Images to PDF", desc: "Combine photos into a PDF", slug: "images-to-pdf", type: "pdf" },
        ].map((t) => (
          <Link
            key={t.slug}
            to={t.type === "image" ? "/image-tools/$slug" : "/tools/$slug"}
            params={{ slug: t.slug }}
            className="rounded-lg border border-[#eee] p-4 transition-colors hover:border-[#e5322d]"
          >
            <div className="text-[15px] font-semibold text-[#383E45]">{t.name}</div>
            <div className="mt-1 text-[13px] text-[#5a5a66]">{t.desc}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}