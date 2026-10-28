/**
 * Architecture Notes
 * WHY this exists: the long help articles on tool pages explain the topic in
 * general, but visitors also need facts about THIS tool: what it does to the
 * file, its limits, what each error message means and how to check the result.
 * Every entry here was written from the tool's source code and from a real test
 * run with sample files (screenshots are captures of those runs, never mockups).
 * Keeping the notes as data, keyed by slug, lets both tool routes render them
 * server-side above the article without touching the lazily loaded tool code.
 * When a tool's behavior changes, update its entry here in the same change.
 */

export type FieldNoteShot = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export type FieldNoteError = { message: string; meaning: string };

export type ToolFieldNote = {
  heading: string;
  intro: string;
  shot?: FieldNoteShot;
  whatHappens: string[];
  limits: string[];
  errors: FieldNoteError[];
  check: string[];
  testedOn: string;
};

const TESTED = "28 October 2026";

export const TOOL_FIELD_NOTES: Record<string, ToolFieldNote> = {
  merge: {
    heading: "How Merge PDF handles your files",
    intro:
      "Merge copies the pages of each PDF, in the order shown on screen, into one new file. Nothing is re-drawn or re-compressed, so text stays selectable and the merged file is roughly the size of the inputs added together.",
    shot: {
      src: "/screenshots/merge-pdf-three-invoices-in-order.webp",
      width: 1200,
      height: 713,
      alt: "Merge PDF workspace with three PDFs numbered 1 to 3, page counts under each file, and the bookmark option ticked",
      caption:
        "Our test: three sample PDFs (2, 3 and 1 pages). The number on each card is its position in the merged file. The result had 6 pages and three bookmarks named invoice-march, invoice-april and receipts.",
    },
    whatHappens: [
      "Files are merged in the order of the numbered cards. Drag a card to move it; the numbers update straight away.",
      "The rotate button on a card turns every page of that file by 90 degrees in the output. It does not change your original file.",
      "With \"Add bookmarks for each file\" ticked, the merged PDF gets one bookmark per file, named after the file and pointing to its first page. Most viewers open with the bookmark panel visible.",
      "You can rename the output in the Output filename box. If you leave out .pdf it is added for you.",
    ],
    limits: [
      "You need at least two PDFs. Adding the same file twice (same name and size) is skipped, and a message says how many duplicates were left out.",
      "Bookmarks that already exist inside your source files are not carried over; only the new per-file bookmarks are added.",
      "Fillable form fields can stop being fillable after a merge. Fill and save forms first, or use Flatten PDF before merging.",
      "Everything runs in your browser's memory. Very large sets (hundreds of MB) can be slow or fail on phones; merge in smaller groups if that happens.",
    ],
    errors: [
      { message: "Add at least two PDFs to merge.", meaning: "Only one file is in the list. Use Add more files." },
      {
        message: "One of the PDFs is password-protected",
        meaning: "A file needs a password to open. Remove it with Unlock PDF (you need the password), then merge again.",
      },
      {
        message: "Merge failed: ...",
        meaning: "A file is damaged or not a real PDF. Open each file on its own to find the one that will not load.",
      },
    ],
    check: [
      "The success screen shows the number of files and total pages. It should equal the pages of all inputs added together.",
      "Open the merged file and scroll through the page where one file ends and the next begins.",
      "If you used bookmarks, open the bookmark (outline) panel in your viewer and click each entry.",
    ],
    testedOn: TESTED,
  },

  compress: {
    heading: "What Compress PDF actually does to your file",
    intro:
      "This tool makes two versions of your PDF and keeps the smaller one. Knowing which version you got matters, because one keeps text selectable and the other does not.",
    shot: {
      src: "/screenshots/compress-pdf-result-size-comparison.webp",
      width: 1200,
      height: 656,
      alt: "Compress PDF result screen showing original size 922.0 KB, compressed size 294.8 KB, saved 627.2 KB, 68 percent smaller",
      caption:
        "Our test file: a 3-page PDF made only of photos, compressed at Recommended. It went from 922 KB to 295 KB. A text-only PDF shrinks far less, so treat this as one example, not a promise.",
    },
    whatHappens: [
      "Method 1, image method: every page is redrawn and saved as a JPG. Less Compression uses about 108 DPI at 90% quality, Recommended about 86 DPI at 70%, Extreme 72 DPI at 50%.",
      "Method 2, lossless rewrite: your original pages are kept exactly as they are and only the file structure is packed more tightly.",
      "The smaller of the two is offered for download. If neither is smaller than your original, you get your original back unchanged and the screen says \"Already optimized\".",
      "After compressing, the result screen tells you which method was used.",
    ],
    limits: [
      "If the image method wins, text becomes part of a picture: you cannot select, search or copy it, and links, bookmarks and form fields are gone.",
      "Scans and photo-heavy PDFs shrink the most. Text-only PDFs made by Word or a browser are usually already small and may only shrink a little or not at all.",
      "Extreme is meant for strict upload limits. Small print can look soft, so zoom in and check before you send it anywhere official.",
      "Files over 50 pages or 20 MB trigger a warning first, because the work happens on your device and can take a while.",
    ],
    errors: [
      {
        message: "This PDF is already well-optimized. No further reduction possible.",
        meaning: "Both methods produced a file that was not smaller. You get your original, untouched.",
      },
      { message: "PDF is password-protected", meaning: "Remove the password with Unlock PDF first, then compress." },
      {
        message: "Compression produced an empty file. Please try again.",
        meaning: "A safety check stopped a broken download. Reload the page and try again; if it repeats, the PDF is likely damaged.",
      },
    ],
    check: [
      "Compare the Original and Compressed sizes on the result screen with the limit you need to meet.",
      "Open the downloaded file and zoom to 100% on the page with the smallest text.",
      "If you need searchable text, press Ctrl+F (or Cmd+F) in the downloaded file. If nothing is found, the image method was used; try Less Compression.",
    ],
    testedOn: TESTED,
  },

  "pdf-to-word": {
    heading: "Before you use PDF to Word",
    intro:
      "This is the one PDF tool on the site that sends your file to our server, because building an editable Word file needs software that cannot run in a browser.",
    whatHappens: [
      "Before uploading, your browser checks that the file starts like a real PDF, is 25 MB or smaller and is not password-protected. A file that fails these checks is never sent.",
      "During upload a progress bar shows how much has been sent, and Cancel stops it at any time.",
      "The finished file keeps your PDF's name with a .docx extension.",
    ],
    limits: [
      "Server status: when we tested on 28 October 2026, our conversion server could not be reached, so no conversion could be completed. The page now checks the server when it opens and shows a notice if it is down.",
      "25 MB maximum per file. For bigger PDFs, run Compress PDF first.",
      "Scanned pages come through as pictures inside Word, not as editable text.",
      "Complex layouts (columns, forms, many tables) usually need some tidying in Word afterwards.",
      "A conversion that takes longer than 150 seconds is stopped.",
    ],
    errors: [
      { message: "That file is over our 25 MB limit for this tool.", meaning: "Compress or split the PDF and try again." },
      {
        message: "That file does not look like a real PDF, so we did not upload it.",
        meaning: "The file was renamed to .pdf or is damaged. Open it in a PDF viewer to check.",
      },
      {
        message: "We could not convert this PDF. It may be scanned, protected or damaged.",
        meaning: "The server refused the file. If it is protected, use Unlock PDF first.",
      },
      { message: "Too many requests. Please wait a minute and try again.", meaning: "A fair-use limit was reached. Waiting clears it." },
      {
        message: "Our server is busy right now. Please try again in a minute.",
        meaning: "The server is overloaded or offline. If the yellow notice is showing, use PDF to Text in the meantime.",
      },
    ],
    check: [
      "Open the .docx in Word, Google Docs or LibreOffice and compare a page side by side with the PDF.",
      "Check tables, page breaks and any text in languages other than English, which are the parts most likely to shift.",
    ],
    testedOn: TESTED,
  },

  "pdf-to-images": {
    heading: "PDF to JPG settings, explained with a real run",
    intro:
      "Each page you select is drawn in your browser at the resolution you pick and saved as a JPG or PNG. Nothing is uploaded.",
    shot: {
      src: "/screenshots/pdf-to-jpg-page-selection-and-dpi.webp",
      width: 1200,
      height: 713,
      alt: "PDF to Image workspace with four page thumbnails selected and options for JPG or PNG, Low, Medium or High quality, ZIP or individual download, and filename prefix",
      caption:
        "Our test: a 4-page A4 PDF at JPG, Medium. The ZIP held page-1.jpg to page-4.jpg, each 1239 x 1754 pixels, 973 KB in total.",
    },
    whatHappens: [
      "All pages start selected. Click a thumbnail to leave it out, or use Deselect all and pick only the pages you want.",
      "Image Quality sets the resolution: Low is 72 DPI, Medium (the default) 150 DPI, High 300 DPI. An A4 page is about 595 x 842, 1240 x 1754 or 2480 x 3508 pixels.",
      "JPG is saved at 92% quality. PNG is lossless and bigger, better for screenshots of text or diagrams you will edit.",
      "Download as ZIP Archive gives one file named prefix-images.zip. Individual images downloads each page separately, named prefix-1.jpg, prefix-2.jpg and so on.",
    ],
    limits: [
      "This turns pages into pictures. To get the photos that are inside a PDF at their original quality, use Extract Images instead.",
      "High on a long document creates large images and can be slow on phones. Convert in batches of pages if it stalls.",
      "Text in the images cannot be selected. Use PDF to Text if you need the words.",
    ],
    errors: [
      { message: "Please select at least one page.", meaning: "Every thumbnail is deselected. Click at least one page." },
      { message: "Failed to load PDF file.", meaning: "The file is damaged or not a PDF." },
      { message: "A password prompt appears", meaning: "The PDF is locked. Unlock it first, then convert." },
    ],
    check: [
      "Open one image and zoom in on small text. If it is blurry, convert again at High.",
      "Count the files in the ZIP; it should match the number of pages you selected.",
    ],
    testedOn: TESTED,
  },

  "heic-to-jpg": {
    heading: "What to expect when converting iPhone HEIC photos",
    intro:
      "Your HEIC photos are decoded in the browser and saved as JPG files. The decoder is downloaded once, the first time you press Convert.",
    shot: {
      src: "/screenshots/heic-to-jpg-batch-result.webp",
      width: 1200,
      height: 656,
      alt: "HEIC to JPG result screen showing 2 HEIC files converted, original 1001 KB, JPG output 762 KB, with a download button for each JPG",
      caption:
        "Our test: two 1600 x 1067 HEIC photos (about 500 KB each) at the default 90% quality. Each JPG came out at 1600 x 1067 and 381 KB.",
    },
    whatHappens: [
      "Files ending in .heic or .heif are accepted. Other files are refused with a message naming the file.",
      "Quality (default 90%) sets JPG compression. Max width can shrink photos to 1920, 1280 or 800 pixels wide; Original keeps the full size.",
      "Each photo is converted on its own. If one file is damaged, the others still convert and the damaged one is marked.",
      "One photo downloads as a single JPG; two or more come as heic-to-jpg.zip, and each row also has its own download button.",
    ],
    limits: [
      "JPG files are often larger than the HEIC they came from. That is normal: HEIC simply compresses better.",
      "Camera details stored in the photo (date taken, location, camera model) are not copied into the JPG.",
      "Very large batches use a lot of memory on phones. Convert 20 to 30 photos at a time if your browser slows down.",
    ],
    errors: [
      {
        message: "Could not load the HEIC decoder. Check your connection and retry.",
        meaning: "The decoder download failed, usually because you are offline. Reconnect and press Convert again.",
      },
      {
        message: "N of M files converted. The rest could not be decoded.",
        meaning: "Some files are damaged or use a HEIC variant the decoder cannot read. The good ones are ready to download.",
      },
      { message: "\"name\" is not a HEIC/HEIF file", meaning: "The file is another format. JPG and PNG files do not need converting." },
    ],
    check: [
      "Open one JPG and compare it with the original photo on your phone, especially skin tones and skies.",
      "Check the size shown under each file against any upload limit you need to meet; lower the quality if it is too big.",
    ],
    testedOn: TESTED,
  },

  "webp-to-jpg": {
    heading: "WebP to JPG: transparency, animation and quality",
    intro:
      "Each WebP image is decoded by your browser, drawn onto a canvas and saved as a JPG. Nothing is uploaded.",
    shot: {
      src: "/screenshots/webp-to-jpg-transparent-background-white.webp",
      width: 1200,
      height: 405,
      alt: "Side by side: a WebP badge with a transparent background shown on a checkerboard, and the converted JPG where the transparent area became white",
      caption:
        "Our test: an 800 x 500 WebP with a transparent background (left, shown on a checkerboard). In the JPG (right) the transparent area is white, because JPG cannot store transparency.",
    },
    whatHappens: [
      "Transparent areas become white, not black.",
      "The Quality slider (default 90) sets JPG compression. Lower values give smaller files with more visible blocks around edges and text.",
      "The JPG keeps the original width and height and the original file name with .jpg.",
      "Press Convert all, then Download image for one file or Download all as ZIP (webp-to-jpg.zip) for several.",
    ],
    limits: [
      "Animated WebP files become a still JPG of the first frame only.",
      "If you need to keep transparency, use WebP to PNG instead.",
      "Images over 100 megapixels are refused to protect your browser from running out of memory.",
      "SVG files are refused, even if renamed.",
    ],
    errors: [
      {
        message: "Could not decode WebP (browser may not support it)",
        meaning: "The file is damaged or your browser is very old. Update the browser or try another one.",
      },
      { message: "\"name\" is not a WebP file", meaning: "The file is another format, so there is nothing to convert." },
      { message: "Image is too large", meaning: "The picture is over 100 megapixels. Resize it first." },
    ],
    check: [
      "Look at the edges of logos and cut-out products: they will now sit on white.",
      "If edges look blocky, convert again with the quality slider higher.",
    ],
    testedOn: TESTED,
  },

  "add-blank-pages": {
    heading: "Adding blank pages: what you will see",
    intro:
      "Your pages appear as thumbnails with a + button between them. Each + you press adds a blank page at that spot, and the page numbers update so you can see the final order before saving.",
    shot: {
      src: "/screenshots/add-blank-page-inserted-after-page-2.webp",
      width: 1200,
      height: 713,
      alt: "Add Blank Pages workspace with a dashed BLANK page placed as page 3 between pages of a report, and options for page size",
      caption:
        "Our test: a 4-page report with one blank added after page 2. The download had 5 pages, page 3 was empty and the original pages were unchanged.",
    },
    whatHappens: [
      "Press + between two thumbnails to add a blank there. Remove one with the x on its corner.",
      "Add blank page at end puts one after the last page. Add blank page after every page doubles the document; above 50 pages you are asked to confirm.",
      "Blank page size: Match previous copies the size of the page before it (or the next page if the blank is first). A4 makes every blank A4.",
      "Your original pages are not re-drawn, so text, links and quality stay as they were. The download is named yourfile-with-blanks.pdf.",
    ],
    limits: [
      "One PDF at a time.",
      "Match previous uses the page's stored size. On a page that is rotated to landscape, the blank may come out portrait; choose the size you need and check.",
      "Blank pages are truly empty: no page number, header or watermark. Add those afterwards with Page Numbers or Header and Footer.",
    ],
    errors: [
      { message: "PDF is password-protected", meaning: "Unlock it first with Unlock PDF, then add pages." },
      { message: "Failed to render: ...", meaning: "The thumbnails could not be drawn, usually because the PDF is damaged." },
    ],
    check: [
      "The success screen shows how many blanks were added and the new page total.",
      "For double-sided printing, check that each chapter starts on an odd page number in the downloaded file.",
    ],
    testedOn: TESTED,
  },
};
