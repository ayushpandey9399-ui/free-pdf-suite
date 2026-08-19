import { Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const url = `${SITE_URL}/image-tools/webp-to-jpg`;

export const webpToJpgSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PDFToolConverter WebP to JPG",
  applicationCategory: "BrowserApplication",
  operatingSystem: "Any",
  url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "PDFToolConverter", url: SITE_URL },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1560",
  },
  description:
    "Convert WebP images to JPG online instantly in your browser. Batch convert multiple WebP files to JPEG. Free, no signup, no watermark, files never leave your device.",
};

export const webpToJpgHowToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to convert WebP to JPG",
  description:
    "Convert WebP images to universal JPG files online, free, entirely in your browser.",
  totalTime: "PT1M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Upload Your WebP Images",
      text: "Click the 'Select images' button or drag and drop your WebP files onto the upload area. You can add multiple WebP files at once for batch conversion.",
      url: `${url}#step-1`,
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Set Output Quality",
      text: "Choose the JPG output quality level. Higher quality produces sharper images with larger file sizes. 80-90% is ideal for most uses.",
      url: `${url}#step-2`,
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Convert Your Images",
      text: "Click the convert button. The tool renders each WebP image on an HTML Canvas and encodes it as JPG at your chosen quality level.",
      url: `${url}#step-3`,
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Download Your JPG Files",
      text: "Download individual JPG files or download all converted images at once as a ZIP archive. Each JPG output file is clean and watermark-free.",
      url: `${url}#step-4`,
    },
  ],
};

export const webpToJpgFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I convert WebP to JPG for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Upload your WebP images using the button or drag-and-drop above, set your quality level, and click convert. Download your JPG files instantly. No signup required.",
      },
    },
    {
      "@type": "Question",
      name: "What is a WebP file?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP is a modern image format developed by Google for efficient web image compression. It produces smaller files than JPG and PNG at equivalent quality but has limited compatibility outside of web browsers.",
      },
    },
    {
      "@type": "Question",
      name: "Do my files get uploaded to a server?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. All conversion runs in your browser. Your images never leave your device.",
      },
    },
    {
      "@type": "Question",
      name: "Why is the JPG file larger than the original WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP uses a more advanced compression algorithm than JPG, so the same image requires less storage as WebP. Converting to JPG replaces WebP compression with JPG's less efficient compression, producing a larger file.",
      },
    },
    {
      "@type": "Question",
      name: "What happens to transparent WebP backgrounds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Transparent areas are filled with white in the JPG output because JPG does not support transparency. Use our WebP to PNG converter to preserve transparency.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert multiple WebP files at once?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add as many WebP files as needed for batch conversion.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a file size limit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Convert WebP images of any size with no restrictions.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert animated WebP files?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Static WebP images convert fully to JPG. For animated WebP files, the first frame is converted to JPG.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert on my phone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The tool works in any mobile browser on iPhone and Android.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work offline?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Once the page has fully loaded, conversion works without an internet connection.",
      },
    },
    {
      "@type": "Question",
      name: "Why can't I open WebP files on my computer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "WebP requires recent software to open natively. Windows 10 and 11 can open WebP in modern Edge and Chrome browsers but not all image viewers support it. Converting to JPG makes the image viewable in any image viewer.",
      },
    },
    {
      "@type": "Question",
      name: "Can I control JPG output quality?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use the quality slider to set the compression level before converting. 80-90% is ideal for most uses.",
      },
    },
    {
      "@type": "Question",
      name: "Are the output JPG files watermark-free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All output files are completely clean with no watermarks.",
      },
    },
    {
      "@type": "Question",
      name: "Can I convert JPG back to WebP?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Use our JPG to WebP converter for the reverse conversion.",
      },
    },
    {
      "@type": "Question",
      name: "Is this tool really free with no limits?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. No usage caps, no daily limits, no signup required, no watermarks.",
      },
    },
  ],
};

export function WebpToJpgSeo() {
  return (
    <section className="mx-auto mt-16 max-w-3xl px-4 text-[15px] leading-relaxed text-[#33333c]">
      <h2 className="text-[24px] font-bold text-[#1F2937]">
        What Is WebP and Why Convert It to JPG?
      </h2>
      <p className="mt-3">
        WebP is a modern image format developed by Google in 2010 and officially released in 2012. It was designed specifically for web use, offering both lossy and lossless compression in a single format. The key advantage of WebP is its compression efficiency — a WebP image is typically 25-35% smaller than an equivalent JPG at the same visual quality, and up to 26% smaller than a PNG with the same quality. This makes WebP the preferred format for websites, because smaller images mean faster page loads and better performance scores.
      </p>
      <p className="mt-3">
        Despite its technical advantages, WebP has a significant compatibility problem outside of web browsers. Many applications, platforms, and devices that handle images daily do not support WebP files. Adobe Stock, most print labs and photo printing services, Microsoft Office applications on older Windows versions, email clients, many CMS plugins, court e-filing portals, government submission systems, and university application portals all either refuse WebP uploads outright or display them as broken file icons. This is why millions of people need to convert WebP images to JPG every day.
      </p>
      <p className="mt-3">
        JPG (JPEG) is the universal image format that works everywhere — on every operating system, device, application, printing service, and upload form in the world. Converting a WebP image to JPG makes it instantly compatible with any workflow, platform, or submission system without any format compatibility concerns.
      </p>
      <p className="mt-3">
        The conversion from WebP to JPG is also a one-way trip in terms of file size — JPG files are typically larger than their WebP equivalents because JPG is less compression-efficient. However, for compatibility and universal usability, JPG remains the practical choice when WebP is not accepted.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        How to Convert WebP to JPG Online — Step by Step
      </h2>
      
      <h3 id="step-1" className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Step 1 — Upload Your WebP Images
      </h3>
      <p className="mt-2">
        Click the "Select images" button or drag and drop your WebP files onto the upload area. You can add multiple WebP files at once for batch conversion. All processing runs locally in your browser using Canvas API — your images never leave your device.
      </p>

      <h3 id="step-2" className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Step 2 — Set Output Quality
      </h3>
      <p className="mt-2">
        Choose the JPG output quality level. Higher quality produces sharper images with larger file sizes. For most sharing and web purposes, 80-90% quality produces excellent results. For professional print use, choose 95% or higher.
      </p>

      <h3 id="step-3" className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Step 3 — Convert Your Images
      </h3>
      <p className="mt-2">
        Click the convert button. The tool renders each WebP image on an HTML Canvas and encodes it as JPG at your chosen quality level. Transparent areas in WebP images are automatically filled with a white background in the JPG output since JPG does not support transparency.
      </p>

      <h3 id="step-4" className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Step 4 — Download Your JPG Files
      </h3>
      <p className="mt-2">
        Download individual JPG files or download all converted images at once as a ZIP archive. Each JPG output file is clean and completely watermark-free.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        WebP vs JPG — A Complete Format Comparison
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse border border-[#ececef] text-left text-[14px]">
          <thead>
            <tr className="bg-[#f9fafb]">
              <th className="border border-[#ececef] p-3 font-semibold">Feature</th>
              <th className="border border-[#ececef] p-3 font-semibold">WebP</th>
              <th className="border border-[#ececef] p-3 font-semibold">JPG</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#ececef] p-3">File Size</td>
              <td className="border border-[#ececef] p-3">25-35% smaller</td>
              <td className="border border-[#ececef] p-3">Larger</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Compression Type</td>
              <td className="border border-[#ececef] p-3">Both lossy and lossless</td>
              <td className="border border-[#ececef] p-3">Lossy only</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Transparency Support</td>
              <td className="border border-[#ececef] p-3">Yes</td>
              <td className="border border-[#ececef] p-3">No</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Animation Support</td>
              <td className="border border-[#ececef] p-3">Yes</td>
              <td className="border border-[#ececef] p-3">No</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Universal Compatibility</td>
              <td className="border border-[#ececef] p-3">Web browsers only</td>
              <td className="border border-[#ececef] p-3">All devices and apps</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Print Lab Support</td>
              <td className="border border-[#ececef] p-3">Often rejected</td>
              <td className="border border-[#ececef] p-3">Always accepted</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Email Client Support</td>
              <td className="border border-[#ececef] p-3">Limited</td>
              <td className="border border-[#ececef] p-3">Universal</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Office App Support</td>
              <td className="border border-[#ececef] p-3">Limited</td>
              <td className="border border-[#ececef] p-3">Universal</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Portal Upload Support</td>
              <td className="border border-[#ececef] p-3">Often rejected</td>
              <td className="border border-[#ececef] p-3">Always accepted</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Editing Software Support</td>
              <td className="border border-[#ececef] p-3">Limited</td>
              <td className="border border-[#ececef] p-3">Universal</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Social Media Support</td>
              <td className="border border-[#ececef] p-3">Improving but varies</td>
              <td className="border border-[#ececef] p-3">Universal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        Common Situations Where You Need WebP to JPG
      </h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Uploading to Government and Official Portals
      </h3>
      <p className="mt-2">
        Government application systems, visa portals, university admission platforms, tax filing portals, and business registration systems typically accept only JPG, PNG, or PDF uploads. WebP files are consistently rejected with format error messages. Converting to JPG before uploading ensures the submission succeeds.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Printing Photos at a Photo Lab
      </h3>
      <p className="mt-2">
        Professional photo printing services — both online print services and in-store photo labs — universally accept JPG for photo prints. Many reject WebP files because their printing systems do not support the format. Converting WebP to JPG before ordering prints ensures the lab can process your files.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Sending Images in Email
      </h3>
      <p className="mt-2">
        Many email clients — particularly Microsoft Outlook on desktop — do not render WebP images as inline previews. Recipients see a blank attachment or broken icon instead of the image. Converting to JPG ensures the image displays correctly for all recipients regardless of their email client.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Using Images in Microsoft Office
      </h3>
      <p className="mt-2">
        Microsoft Word, PowerPoint, and Excel on older versions of Windows cannot insert WebP images directly. Converting WebP images to JPG allows them to be inserted into any Office document without compatibility issues.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Uploading Product Photos to Marketplaces
      </h3>
      <p className="mt-2">
        E-commerce platforms like Amazon, Etsy, eBay, and many supplier portals require product images in JPG format. WebP product images downloaded from a website or generated by a design tool need to be converted to JPG before uploading to these platforms.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Sharing Downloaded Web Images
      </h3>
      <p className="mt-2">
        Many modern websites save images in WebP format for faster loading. When you right-click and save an image from a website, it often saves as WebP. Converting the downloaded WebP to JPG makes it usable in any application without format concerns.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Working With Adobe and Design Tools
      </h3>
      <p className="mt-2">
        Older versions of Adobe Photoshop, Lightroom, and Illustrator do not support WebP files natively. Converting WebP images to JPG before opening them in these applications eliminates compatibility errors.
      </p>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Sending to Clients Who Cannot Open WebP
      </h3>
      <p className="mt-2">
        Clients, colleagues, and business contacts using older computers or image viewer applications may not be able to open WebP files. Converting to JPG before sharing ensures everyone can view the image regardless of their software.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        How WebP Compression Works — and Why Files Get Larger After Converting
      </h2>
      <p className="mt-3">
        WebP uses a more advanced compression algorithm than JPG, which is why WebP files are smaller at equivalent quality. WebP lossy compression is based on VP8 video frame encoding, which is more sophisticated than the discrete cosine transform (DCT) used by JPG. WebP lossless compression uses a combination of spatial prediction, color transform, palette coding, and LZ77 compression to achieve smaller file sizes than PNG.
      </p>
      <p className="mt-3">
        When a WebP image is converted to JPG, the more advanced WebP compression is replaced by JPG's less efficient compression. This means the JPG output file will be larger than the original WebP file even at the same visual quality. This is a normal and expected result of the conversion. The trade-off is universal compatibility — the larger JPG file works everywhere, while the smaller WebP file has limited compatibility outside of web browsers.
      </p>
      <p className="mt-3">
        If file size remains a concern after converting to JPG, you can reduce the output quality setting to produce a smaller JPG file. For most sharing and viewing purposes, JPG at 80% quality is invisible in difference from the original WebP image while producing a reasonably compact file.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        What Happens to WebP Transparency During Conversion?
      </h2>
      <p className="mt-3">
        WebP supports alpha channel transparency, allowing images to have transparent or semi-transparent backgrounds. JPG does not support transparency — every pixel must have a solid color. When a WebP image with a transparent background is converted to JPG, the transparent areas are filled with white.
      </p>
      <p className="mt-3">
        If you need a different background color for the transparent areas, first open the WebP in an image editor, fill the transparent layer with the desired background color, and then convert it to JPG. Alternatively, use our{" "}
        <Link to="/image-tools/$slug" params={{ slug: "webp-to-png" }} className="text-[#e5322d] underline">
          WebP to PNG tool
        </Link>{" "}
        if you need to preserve the transparency in the output file, since PNG fully supports transparent backgrounds.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        Browser-Based vs Server-Based WebP to JPG Conversion
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse border border-[#ececef] text-left text-[14px]">
          <thead>
            <tr className="bg-[#f9fafb]">
              <th className="border border-[#ececef] p-3 font-semibold">Feature</th>
              <th className="border border-[#ececef] p-3 font-semibold">Our Tool</th>
              <th className="border border-[#ececef] p-3 font-semibold">Server-Based Tools</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#ececef] p-3">Image Privacy</td>
              <td className="border border-[#ececef] p-3">Files stay on device</td>
              <td className="border border-[#ececef] p-3">Files uploaded to server</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Speed</td>
              <td className="border border-[#ececef] p-3">Instant</td>
              <td className="border border-[#ececef] p-3">Upload/download delay</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">File Size Limit</td>
              <td className="border border-[#ececef] p-3">No limit</td>
              <td className="border border-[#ececef] p-3">Often 10-50MB per file</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Works Offline</td>
              <td className="border border-[#ececef] p-3">Yes after page loads</td>
              <td className="border border-[#ececef] p-3">No</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Account Required</td>
              <td className="border border-[#ececef] p-3">No</td>
              <td className="border border-[#ececef] p-3">Sometimes yes</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Batch Convert</td>
              <td className="border border-[#ececef] p-3">Yes</td>
              <td className="border border-[#ececef] p-3">Sometimes limited</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Watermarks</td>
              <td className="border border-[#ececef] p-3">Never</td>
              <td className="border border-[#ececef] p-3">Sometimes added</td>
            </tr>
            <tr>
              <td className="border border-[#ececef] p-3">Cost</td>
              <td className="border border-[#ececef] p-3">Always free</td>
              <td className="border border-[#ececef] p-3">Free tier limited</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        Tips for Converting WebP to JPG Effectively
      </h2>
      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Use 80-90% Quality for Most Purposes
      </h3>
      <p className="mt-2">
        For web sharing, email, and everyday use, JPG at 80-90% quality produces images that look identical to the original WebP at much smaller file sizes than 100% quality JPG output. Only increase to 95%+ for professional print output.
      </p>

      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Convert WebP to PNG if You Need Transparency
      </h3>
      <p className="mt-2">
        If your WebP image has a transparent background and you need to preserve the transparency, convert it to PNG instead of JPG using our{" "}
        <Link to="/image-tools/$slug" params={{ slug: "webp-to-png" }} className="text-[#e5322d] underline">
          WebP to PNG tool
        </Link>. PNG supports transparency while JPG does not.
      </p>

      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Batch Convert Multiple WebP Files Together
      </h3>
      <p className="mt-2">
        Add all your WebP files at once instead of converting them one at a time. The batch conversion processes all files simultaneously and packages them in a ZIP file for convenient download.
      </p>

      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Compress JPG After Converting if Needed
      </h3>
      <p className="mt-2">
        After converting WebP to JPG, if the output file is still larger than needed, use our{" "}
        <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="text-[#e5322d] underline">
          Compress Image tool
        </Link>{" "}
        to reduce the file size further while maintaining acceptable visual quality.
      </p>

      <h3 className="mt-6 text-[18px] font-bold text-[#1F2937]">
        Resize Before Converting for Specific Requirements
      </h3>
      <p className="mt-2">
        If you need the output JPG to be a specific size in pixels, use our{" "}
        <Link to="/image-tools/$slug" params={{ slug: "image-resize" }} className="text-[#e5322d] underline">
          Resize Image tool
        </Link>{" "}
        to set the exact dimensions before or after converting.
      </p>

      <h2 className="mt-10 text-[24px] font-bold text-[#1F2937]">
        Frequently Asked Questions About WebP to JPG Conversion
      </h2>
      <dl className="mt-4 space-y-4">
        {webpToJpgFaqJsonLd.mainEntity.map((q, i) => (
          <div key={i} className="rounded-lg border border-[#ececef] p-4">
            <dt className="font-semibold text-[#1F2937]">{q.name}</dt>
            <dd className="mt-2 text-[#33333c]">{q.acceptedAnswer.text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-16 text-[24px] font-bold text-[#1F2937]">
        Related Image Tools
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link to="/image-tools/$slug" params={{ slug: "webp-to-png" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">WebP to PNG</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Convert WebP to PNG with transparency</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "jpg-to-webp" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">JPG to WebP</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Convert JPG back to WebP</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "png-to-jpg" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">PNG to JPG</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Convert PNG images to JPG</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "heic-to-jpg" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">HEIC to JPG</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Convert iPhone photos to JPG</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "compress-image" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">Compress Image</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Reduce JPG file size after converting</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "image-resize" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">Resize Image</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Resize images after converting</p>
        </Link>
        <Link to="/image-tools/$slug" params={{ slug: "rotate-image" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">Rotate Image</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Fix image orientation</p>
        </Link>
        <Link to="/tools/$slug" params={{ slug: "images-to-pdf" }} className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]">
          <h3 className="font-bold">Images to PDF</h3>
          <p className="mt-1 text-sm text-[#5a5a66]">Combine JPGs into a PDF</p>
        </Link>
      </div>
    </section>
  );
}
