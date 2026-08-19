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
  return (<section>Test</section>);
}
