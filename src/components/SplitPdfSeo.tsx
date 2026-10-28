import { ToolArticle, faqJsonLd, softwareJsonLd, type ArticleFaq } from "@/components/ToolArticle";

const faqs: ArticleFaq[] = [
  {
    q: "What is the difference between By Range, Extract All and Select Pages?",
    a: "By Range makes one PDF per range you enter. Extract All makes one PDF for every page. Select Pages makes a single PDF that contains only the pages you clicked.",
  },
  {
    q: "Can a range be a single page?",
    a: "Yes. Enter the same number in From and To, for example 3 and 3, to get a PDF with just page 3.",
  },
  {
    q: "How do I download several files at once?",
    a: "When the split creates more than one file, the main button is Download all as ZIP. The ZIP is named after your original file with -split added.",
  },
  {
    q: "Can I split a password-protected PDF?",
    a: "No. The tool shows the message PDF is password-protected. Unlock the file first with Unlock PDF, then split the unlocked copy.",
  },
  {
    q: "Is the text in the split files still selectable?",
    a: "Yes. Pages are copied into the new files as PDF pages, not images, so selectable text stays selectable.",
  },
  {
    q: "What happens if I enter the same range twice?",
    a: "You get two files with the same pages. Each file name includes its range number, so neither overwrites the other in the ZIP.",
  },
];

const related = [
  { to: "/tools/merge", name: "Merge PDF", blurb: "Combine split parts back together" },
  { to: "/tools/extract-pages", name: "Extract Pages", blurb: "Pick pages by thumbnail" },
  { to: "/tools/delete-pages", name: "Delete Pages", blurb: "Remove pages you do not need" },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password first" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Try reducing file size" },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Change the page order" },
] as const;

export function SplitPdfSeo() {
  return (
    <ToolArticle
      toolName="Split PDF"
      howItWorks={[
        "Split PDF takes one PDF and turns it into one or more smaller PDFs, inside your browser. When you add a file, it is opened locally to count its pages and draw a thumbnail of each page, so you can see what you are splitting. The file is not uploaded.",
        "When you click the split button, the tool builds each output file by copying the chosen pages from the original into a new PDF. Pages are copied as they are, not turned into images, so text stays selectable and the pages keep their size. Your original file is not changed.",
        "When only one file is created you download a PDF. When several are created, they are packed into one ZIP.",
      ]}
      options={[
        { term: "By Range", text: "Enter a From and To page for each range. You can add more rows for more ranges. Each range becomes its own file named after your original, the range number and its pages, for example report-range-2-4-7.pdf. From must be less than or equal to To, and both must be whole page numbers inside the document." },
        { term: "Extract All", text: "Creates one PDF per page, named with -page- and the page number, for example report-page-3.pdf." },
        { term: "Select Pages", text: "Click the thumbnails of the pages you want. They are saved together, in page order, as one file ending in -extracted.pdf. The order you click in does not matter." },
      ]}
      limits={[
        "Password-protected PDFs cannot be split. Unlock them first.",
        "Ranges only accept whole numbers. Entries like 1.5 or 2a are rejected with an error on that row.",
        "Bookmarks, attachments and some document-wide features of the original may not be copied into the new files.",
        "Thumbnails and output files are kept in your browser's memory. Long documents, or Extract All on a long document, can be slow or fail on phones. Try a shorter document or fewer ranges.",
      ]}
      problems={[
        { term: "\"From must be less than or equal to To\"", text: "The first page of a range is after its last page. Swap the two numbers." },
        { term: "\"PDF is password-protected\"", text: "The file needs a password to open. Use Unlock PDF with the password, then split the unlocked copy." },
        { term: "\"Could not preview pages\"", text: "The thumbnails failed to render. The file may be damaged or very large. Try again, or try the file in another browser." },
        { term: "\"Split failed\" followed by an error", text: "The file may be damaged or the browser ran out of memory. Try fewer ranges at a time." },
      ]}
      faqs={faqs}
      related={related}
    />
  );
}

export const splitFaqJsonLd = faqJsonLd(faqs);

export const splitSoftwareJsonLd = softwareJsonLd(
  "PDFToolConverter Split PDF",
  "Split a PDF in your browser by page ranges, into single pages, or by selecting pages, and download the parts as PDFs or a ZIP.",
);
