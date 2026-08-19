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
        However, WebP is not yet as universal as JPG. While all modern web browsers support it, many desktop applications, older operating systems, and some email clients still struggle to open WebP files natively. If you need to use an image for a presentation, send it to someone using an older computer, or upload it to a platform that only accepts standard formats, converting WebP to JPG is the most reliable solution. JPEG is the most widely compatible image format in the world, ensuring your image will look the same on every screen and in every application.
      </p>

      <h2 className="mt-12 text-[24px] font-bold text-[#1F2937]" id="step-1">
        How Our WebP to JPG Converter Works
      </h2>
      <p className="mt-3">
        Our tool uses high-performance browser-based processing to convert your images. When you upload a WebP file, your browser's rendering engine (the same technology that displays websites) parses the WebP data. It then draws that image onto a hidden HTML Canvas element. From there, we use the browser's native encoding capabilities to extract the pixel data and wrap it in the JPG format at your chosen quality level.
      </p>
      <p className="mt-3">
        This approach offers several significant benefits:
      </p>
      <ul className="mt-3 list-disc pl-5">
        <li><strong>Privacy:</strong> Because the processing happens entirely within your browser, your images are never sent to a remote server. Your private photos stay on your device.</li>
        <li><strong>Speed:</strong> Local processing is often faster than uploading large files to a server and waiting for a download, especially on slower internet connections.</li>
        <li><strong>Zero Cost:</strong> We don't have to pay for expensive server-side processing power, allowing us to offer this tool completely for free with no limits.</li>
      </ul>

      <h3 className="mt-8 text-[18px] font-bold text-[#383E45]" id="step-2">
        1. Choose Your Compression Level
      </h3>
      <p className="mt-2">
        Before converting, you can adjust the quality slider. JPG is a lossy format, meaning it discards some image data to achieve smaller file sizes. A setting of 80% to 90% typically offers an excellent balance where the file size is small but the image looks identical to the human eye. If you need absolute maximum quality, set it to 100%.
      </p>

      <h3 className="mt-8 text-[18px] font-bold text-[#383E45]" id="step-3">
        2. Batch Processing for Efficiency
      </h3>
      <p className="mt-2">
        Converting images one by one is tedious. Our WebP to JPG converter supports batch processing. Simply select dozens of WebP files at once, and the tool will process them sequentially. You can then download them all as a single ZIP file, saving you time and effort.
      </p>

      <h2 className="mt-12 text-[24px] font-bold text-[#1F2937]">
        Frequently Asked Questions
      </h2>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-[18px] font-bold text-[#383E45]">Is WebP better than JPG?</h3>
          <p className="mt-2 text-[#5a5a66]">
            Technically, yes. WebP provides better compression than JPG, meaning smaller files for the same quality. However, JPG is far superior in terms of compatibility. If your image is for the web, WebP is better. If it is for general storage or sharing, JPG is usually safer.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#383E45]">Will I lose quality when converting?</h3>
          <p className="mt-2 text-[#5a5a66]">
            Yes, a small amount. Converting from one lossy format (WebP) to another (JPG) always involves some data loss. However, if you keep the quality slider at 90% or higher, the difference is practically invisible to the human eye.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#383E45]">Does this tool work on Mac and Windows?</h3>
          <p className="mt-2 text-[#5a5a66]">
            Yes. Since the tool runs in the browser, it works perfectly on Windows, macOS, Linux, ChromeOS, and even mobile platforms like iOS and Android.
          </p>
        </div>
        <div>
          <h3 className="text-[18px] font-bold text-[#383E45]">Is there a limit to how many images I can convert?</h3>
          <p className="mt-2 text-[#5a5a66]">
            No. Unlike many other online converters, we do not have a daily limit or a file count restriction. You can convert as many WebP images as you need, whenever you need.
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-[#ececef] pt-8">
        <h2 className="text-[24px] font-bold text-[#1F2937]">Related Image Tools</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/image-tools/$slug"
            params={{ slug: "jpg-to-png" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">JPG to PNG</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Convert JPG to lossless PNG</p>
          </Link>
          <Link
            to="/image-tools/$slug"
            params={{ slug: "png-to-jpg" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">PNG to JPG</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Convert PNG to high-quality JPG</p>
          </Link>
          <Link
            to="/image-tools/$slug"
            params={{ slug: "compress-image" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">Compress Image</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Reduce JPG file size after converting</p>
          </Link>
          <Link
            to="/image-tools/$slug"
            params={{ slug: "image-resize" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">Resize Image</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Resize images after converting</p>
          </Link>
          <Link
            to="/image-tools/$slug"
            params={{ slug: "rotate-image" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">Rotate Image</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Fix image orientation</p>
          </Link>
          <Link
            to="/tools/$slug"
            params={{ slug: "images-to-pdf" }}
            className="rounded-lg border border-[#ececef] p-5 hover:border-[#e5322d]"
          >
            <h3 className="font-bold">Images to PDF</h3>
            <p className="mt-1 text-sm text-[#5a5a66]">Combine JPGs into a PDF</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
