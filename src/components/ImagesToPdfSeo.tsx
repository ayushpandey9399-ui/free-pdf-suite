import { ToolArticle, faqJsonLd, softwareJsonLd, type ArticleFaq } from "@/components/ToolArticle";

const faqs: ArticleFaq[] = [
  {
    q: "Which image formats can I add?",
    a: "The file picker accepts JPG, PNG, WebP, BMP, GIF and HEIC. JPG and PNG are placed into the PDF directly. The others are first decoded by your browser, so they only work if your browser can display them. Most browsers other than Safari cannot open HEIC; convert it with HEIC to JPG first.",
  },
  {
    q: "Can I make one PDF per image?",
    a: "Yes. Turn off the option that merges all images into one PDF. You then get one PDF per image, packed into a ZIP.",
  },
  {
    q: "Will my images be cropped to fit the page?",
    a: "No. Each image is scaled proportionally to fill the space inside the page margins, and centred. Nothing is cut off and the proportions do not change.",
  },
  {
    q: "What happens to transparent areas in PNGs?",
    a: "PNGs placed directly can keep their transparency, so the page shows through. Images that go through the browser decoding step get a white background.",
  },
  {
    q: "Can I rotate an image before converting?",
    a: "Yes. Use the rotate button on each image. The page layout accounts for the rotation, so a rotated image still fits inside the page.",
  },
  {
    q: "Does GIF animation carry over?",
    a: "No. A PDF page is a still image, so only one frame of an animated GIF is used.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Join the result with other PDFs" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Try reducing the PDF size" },
  { to: "/tools/pdf-to-images", name: "PDF to Images", blurb: "Go the other way: pages to JPG or PNG" },
  { to: "/tools/scan-to-pdf", name: "Scan to PDF", blurb: "Capture pages with your camera" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix orientation after converting" },
  { to: "/tools/page-numbers", name: "Page Numbers", blurb: "Number the pages of the result" },
] as const;

export function ImagesToPdfSeo() {
  return (
    <ToolArticle
      toolName="Images to PDF"
      howItWorks={[
        "Images to PDF puts your pictures into a PDF, one image per page, inside your browser. Your images are not uploaded.",
        "JPG and PNG files are placed into the PDF as they are, without being re-compressed. Other formats are first drawn by your browser onto a white background and saved as PNG, then placed into the PDF. For each page, the tool works out the image's size after any rotation you applied, scales it up or down to fill the space inside the margins without changing its proportions, and centres it.",
        "With all images merged, you download one PDF with the pages in the order shown. With merging turned off, you get one PDF per image in a ZIP.",
      ]}
      options={[
        { term: "Order", text: "Drag images to reorder them, or use the sort button to order them by file name; clicking it again switches between A to Z and Z to A. The first image becomes page 1." },
        { term: "Rotate and remove", text: "Each image can be turned 90 degrees left or right, and removed from the list." },
        { term: "Page size", text: "A4, US Letter, or Fit, which makes each page the size of its image plus the chosen margin." },
        { term: "Orientation", text: "Portrait or landscape for A4 and Letter pages." },
        { term: "Margin", text: "None, Small (about 1 cm) or Large (about 2.5 cm) of white space around each image." },
        { term: "Merge all images", text: "On: one PDF. Off: one PDF per image, downloaded together as a ZIP." },
        { term: "File name", text: "The name used for the PDF or ZIP you download." },
      ]}
      limits={[
        "Formats other than JPG and PNG depend on your browser. HEIC usually only works in Safari.",
        "On A4 and Letter pages, small images are enlarged to fill the page, so low-resolution pictures can look blurry. Use Fit to keep them at their own size.",
        "Animated GIFs become a single still page.",
        "All images are held in your browser's memory. Many large photos can be slow or fail, especially on phones. Convert in smaller groups if that happens.",
      ]}
      problems={[
        { term: "\"Failed to generate PDF. Try smaller images.\"", text: "The browser could not decode one of the images or ran out of memory. Remove very large images or convert in smaller groups." },
        { term: "A HEIC photo will not convert", text: "Your browser cannot read HEIC. Convert it with HEIC to JPG first, then add the JPG." },
        { term: "The PDF is very large", text: "JPG and PNG are kept at full size. Resize or compress the images first, or run the result through Compress PDF." },
        { term: "An image is sideways", text: "Use the rotate button on that image before converting." },
      ]}
      faqs={faqs}
      related={related}
    />
  );
}

export const imagesToPdfFaqJsonLd = faqJsonLd(faqs);

export const imagesToPdfSoftwareJsonLd = softwareJsonLd(
  "PDFToolConverter Images to PDF",
  "Convert JPG, PNG and other images to PDF in your browser, with page size, orientation, margins, rotation and one or many PDFs.",
);
