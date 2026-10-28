import { ToolArticle, faqJsonLd, softwareJsonLd, type ArticleFaq } from "@/components/ToolArticle";

const faqs: ArticleFaq[] = [
  {
    q: "How many PDFs do I need to merge?",
    a: "At least two. With only one file in the list, the tool shows the message: Add at least two PDFs to merge.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "No. If any file needs a password, the merge stops with the message: One of the PDFs is password-protected. Unlock that file first with Unlock PDF, then add the unlocked copy.",
  },
  {
    q: "Are the bookmarks from my original files kept?",
    a: "No. Existing bookmark trees in the source files are not carried over. If Add bookmarks for each file is ticked, the merged PDF gets one new bookmark per file, named after the file and pointing at its first page.",
  },
  {
    q: "Can I merge PDFs with different page sizes?",
    a: "Yes. Pages are copied with their own dimensions, so a merged file can mix A4, Letter and landscape pages. Nothing is resized.",
  },
  {
    q: "Why was one of my files skipped when I added it?",
    a: "The tool skips files that have the same name and size as one already in the list, and shows how many duplicates were skipped. Rename the file if you really want it twice.",
  },
  {
    q: "Is the text in the merged PDF still selectable?",
    a: "Yes. Pages are copied as PDF pages, not turned into images, so text that was selectable in the source stays selectable.",
  },
];

const related = [
  { to: "/tools/split", name: "Split PDF", blurb: "Separate a PDF into ranges or single pages" },
  { to: "/tools/unlock-pdf", name: "Unlock PDF", blurb: "Remove a known password before merging" },
  { to: "/tools/reorder-pages", name: "Reorder Pages", blurb: "Rearrange pages inside one PDF" },
  { to: "/tools/compress", name: "Compress PDF", blurb: "Try reducing the merged file size" },
  { to: "/tools/rotate", name: "Rotate PDF", blurb: "Fix page orientation" },
  { to: "/tools/images-to-pdf", name: "Images to PDF", blurb: "Turn photos into a PDF first" },
] as const;

export function MergePdfSeo() {
  return (
    <ToolArticle
      toolName="Merge PDF"
      howItWorks={[
        "Merge PDF combines two or more PDF files into one document, inside your browser. When you add files, each one is opened locally to read its page count and draw a thumbnail of its first page. Your files are not uploaded.",
        "When you click Merge, the tool goes through your list from top to bottom and copies every page of each file, in order, into a new PDF. Pages are copied as they are: text, vector graphics and images inside a page are not re-rendered, so text you could select before stays selectable. Each page keeps its own size, so mixed page sizes are fine.",
        "If you rotated a file in the list, that rotation is added to the rotation each of its pages already had. The result downloads under the file name you chose.",
      ]}
      options={[
        { term: "File order", text: "Drag the file cards to change the order. The top file comes first in the merged PDF. Each card shows the file's page count once it has been read." },
        { term: "Rotate a file", text: "The rotate button on a card turns every page of that file by 90 degrees clockwise per click. Four clicks bring it back to the start." },
        { term: "Add bookmarks for each file", text: "Ticked by default. Adds one bookmark per source file, named after the file and pointing at its first page in the merged document. Untick it if you do not want a bookmark panel." },
        { term: "Output file name", text: "Defaults to merged.pdf. If you type a name without .pdf, the extension is added for you." },
      ]}
      limits={[
        "Password-protected PDFs cannot be merged. Unlock them first.",
        "Bookmark trees from the source files are not carried over; only the optional one-per-file bookmarks are added.",
        "Document-level extras such as attachments, document properties and some form features may not be kept. Check forms and links in the result before relying on them.",
        "Everything happens in your browser's memory. Very large files or many files at once can be slow or fail, especially on phones. Merge in smaller groups if that happens.",
        "Pages are merged whole. To move single pages between files, merge first and then use Reorder Pages.",
      ]}
      problems={[
        { term: "\"One of the PDFs is password-protected\"", text: "One file in the list needs a password. Remove it, unlock it with Unlock PDF, and add the unlocked copy." },
        { term: "\"Merge failed\" followed by an error", text: "A file may be damaged, not a real PDF, or the browser ran out of memory. Try merging the files two at a time to find the one causing the problem." },
        { term: "A file was skipped as a duplicate", text: "Files with the same name and size count as duplicates. Rename one copy if you want it included twice." },
        { term: "Pages appear sideways", text: "The source page already had a rotation, or you rotated the card. Use the rotate button on that card, or fix single pages afterwards with Rotate PDF." },
      ]}
      faqs={faqs}
      related={related}
    />
  );
}

export const mergeFaqJsonLd = faqJsonLd(faqs);

export const mergeSoftwareJsonLd = softwareJsonLd(
  "PDFToolConverter Merge PDF",
  "Combine two or more PDF files into one in your browser, with file reordering, per-file rotation and optional per-file bookmarks.",
);
