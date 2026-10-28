import { ToolArticle, faqJsonLd, softwareJsonLd, type ArticleFaq } from "@/components/ToolArticle";

const faqs: ArticleFaq[] = [
  {
    q: "How much smaller will my PDF get?",
    a: "There is no fixed amount. It depends on what the file contains. PDFs made of large photos or scans usually shrink the most. Text-only PDFs often shrink little, and sometimes not at all.",
  },
  {
    q: "Will the text in my PDF stay selectable?",
    a: "It depends on which method produced the smallest file. If the result screen says pages were turned into images, text can no longer be selected or searched, and links, bookmarks and form fields are gone. If it says the file was rewritten without loss, text stays selectable.",
  },
  {
    q: "Why did I get my original file back?",
    a: "Neither compression method produced a smaller file, so the tool keeps your original instead of giving you a bigger one. The screen says Original kept.",
  },
  {
    q: "What do Less, Recommended and Extreme change?",
    a: "They set how sharp the page images are and how strongly they are compressed when the image method is used. Less keeps more detail, Extreme makes smaller and softer images. They do not affect the lossless rewrite.",
  },
  {
    q: "Can I compress a password-protected PDF?",
    a: "No. The tool shows the message PDF is password-protected. Unlock the file first with Unlock PDF.",
  },
  {
    q: "Is my file uploaded?",
    a: "No. Compress PDF runs in your browser. The file is read and rebuilt on your device.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine files, then compress once" },
  { to: "/tools/split", name: "Split PDF", blurb: "Send only the pages you need" },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove pages to save space" },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password first" },
  { to: "/tools/grayscale-pdf", name: "Grayscale PDF", blurb: "Convert pages to black and white" },
  { to: "/tools/pdf-to-images", name: "PDF to Images", blurb: "Save pages as JPG or PNG" },
] as const;

export function CompressPdfSeo() {
  return (
    <ToolArticle
      toolName="Compress PDF"
      howItWorks={[
        "Compress PDF tries two different ways to make your file smaller, inside your browser, and keeps whichever result is smallest. Your file is not uploaded.",
        "The first way is an image method. Each page is drawn as a picture at the resolution of the level you chose, saved as a JPEG at that level's quality, and placed into a new PDF. This often shrinks scans and photo-heavy files a lot, but the pages become images: text can no longer be selected or searched, and links, bookmarks and form fields are lost.",
        "The second way is a lossless rewrite. The PDF is saved again in a more compact structure without touching what is on the pages, so text stays selectable.",
        "The tool then compares both results with your original. The smallest one is offered for download, and the result screen tells you which method was used. If neither is smaller, you get your original back.",
      ]}
      options={[
        { term: "Less Compression", text: "Page images at 1.5 times the page size with JPEG quality 0.9. Sharpest pages, smallest savings from the image method." },
        { term: "Recommended", text: "Page images at 1.2 times the page size with JPEG quality 0.7. A middle setting for most files." },
        { term: "Extreme Compression", text: "Page images at the page size with JPEG quality 0.5. Smallest image results, with visibly softer text and photos." },
      ]}
      limits={[
        "No reduction is guaranteed. Files that are already compact may come back unchanged.",
        "When the image method wins, text is no longer selectable or searchable, and links, bookmarks and form fields are removed. Check the method shown on the result screen.",
        "Password-protected PDFs cannot be compressed. Unlock them first.",
        "Every page is drawn in your browser's memory. Long or very large PDFs can be slow or fail, especially on phones. Splitting the file first can help.",
      ]}
      problems={[
        { term: "\"These methods did not produce a smaller file\"", text: "Your original is kept. Try Extreme Compression if you have not, or remove pages you do not need with Delete Pages." },
        { term: "Text is no longer selectable", text: "The image method produced the smallest file. If you need selectable text, try Less Compression; if the image method still wins, the lossless rewrite was not smaller than it." },
        { term: "\"PDF is password-protected\"", text: "Open the file in Unlock PDF with its password, then compress the unlocked copy." },
        { term: "\"Failed\" followed by an error", text: "The file may be damaged or the browser ran out of memory. Try a smaller part of the document." },
      ]}
      faqs={faqs}
      related={related}
    />
  );
}

export const compressFaqJsonLd = faqJsonLd(faqs);

export const compressSoftwareJsonLd = softwareJsonLd(
  "PDFToolConverter Compress PDF",
  "Compress a PDF in your browser. Compares an image based method and a lossless rewrite with your original and keeps the smallest file.",
);
