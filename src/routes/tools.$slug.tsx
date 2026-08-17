import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { getTool, categoryTint } from "@/tools/registry";
import { SITE_URL } from "@/lib/site";
import { breadcrumbJsonLd, normalizeToolJsonLd } from "@/lib/seoSchema";
import { TOOL_SEO } from "@/components/toolSeoBundle";

const OG_IMAGE = `${SITE_URL}/og-cover.png`;

type ToolMeta = {
  title: string;
  desc: string;
};

// Titles and descriptions only. The long-form SEO content and its JSON-LD live
// in toolSeoBundle so they never enter the critical route chunk.
const TOOL_META: Record<string, ToolMeta> = {
  "merge": {
    title: "Merge PDF Files Online Free — No Signup, No Limit | pdftoolconverteronline.com",
    desc: "Combine multiple PDF files into one document instantly in your browser. Free PDF merger with drag-and-drop reordering. No signup, no watermark, no file upload to servers.",
  },
  "compress": {
    title: "Compress PDF Online Free — Reduce PDF Size Without Losing Quality | PDFToolConverter",
    desc: "Compress PDF files online and reduce file size instantly in your browser. Free PDF compressor with no file size limits, no signup, no watermark. Files never leave your device.",
  },
  "split": {
    title: "Split PDF Online Free — Separate PDF Pages by Range | PDFToolConverter",
    desc: "Split PDF files online instantly in your browser. Extract pages, separate by range, or split every page into individual PDFs. Free, no signup, no watermark, files never leave your device.",
  },
  "sign-pdf": {
    title: "Sign PDF Online Free — Add Electronic Signature to PDF | PDFToolConverter",
    desc: "Sign PDF documents online instantly in your browser. Draw, type or upload your signature and place it anywhere on your PDF. Free, no signup, no watermark, files never leave your device.",
  },
  "pdf-to-images": {
    title: "PDF to JPG Converter Free, High Quality Export | pdftoolconverteronline.com",
    desc: "Convert PDF to JPG or PNG online free at high resolution. Each page becomes a separate image, processed in your browser with no signup or upload required.",
  },
  "redact-pdf": {
    title: "Redact PDF Free, Permanently Black Out Text | pdftoolconverteronline.com",
    desc: "Redact PDF online free and permanently black out names, sensitive info, or account details. Text is truly removed from the file, not just covered.",
  },
  "protect-pdf": {
    title: "Protect PDF Online Free — Add Password to PDF Instantly | PDFToolConverter",
    desc: "Password protect your PDF files online in your browser. Add AES encryption to prevent unauthorized access. Free, no signup, no watermark, files never leave your device.",
  },
  "unlock-pdf": {
    title: "Unlock PDF Free, Remove PDF Password Online | pdftoolconverteronline.com",
    desc: "Unlock a password protected PDF online free if you have the password. Decryption runs in your browser with no account or upload needed.",
  },
  "watermark": {
    title: "Add Watermark to PDF Free, Online Tool | pdftoolconverteronline.com",
    desc: "Add a watermark to PDF online free. Stamp text like DRAFT or your brand across every page with adjustable size, angle, and opacity.",
  },
  "rotate": {
    title: "Rotate PDF Pages Free, Permanently Save | pdftoolconverteronline.com",
    desc: "Rotate PDF pages online free and save the change permanently. Fix sideways or upside-down pages one at a time or in bulk, right from your browser.",
  },
  "delete-pages": {
    title: "Delete PDF Pages Free, Remove Unwanted Pages | pdftoolconverteronline.com",
    desc: "Delete pages from a PDF online free. Pick unwanted pages in the thumbnail view and download a clean copy of the document in seconds.",
  },
  "extract-pages": {
    title: "Extract PDF Pages Free, Save as New PDF | pdftoolconverteronline.com",
    desc: "Extract pages from PDF online free and save any selection as a new document. Great for pulling one chapter or invoice out of a longer report.",
  },
  "reorder-pages": {
    title: "Reorder PDF Pages Free, Visual Drag & Drop | pdftoolconverteronline.com",
    desc: "Reorder PDF pages online free with drag and drop. Rearrange chapters or invoices into the right order and download the updated file instantly.",
  },
  "images-to-pdf": {
    title: "Convert JPG to PDF Online Free, No Upload | pdftoolconverteronline.com",
    desc: "Convert JPG or PNG images to PDF online free. Combine phone photos, screenshots, and scans into one tidy document. No upload, no signup, 100% private.",
  },
  "pdf-to-word": {
    title: "Convert PDF to Word Free, Editable DOCX | pdftoolconverteronline.com",
    desc: "Convert PDF to Word online free and get a fully editable DOCX file. Headings, tables, and images are preserved. Secure server-side processing.",
  },
  "pdf-to-text": {
    title: "PDF to Text Free, Extract PDF Content | pdftoolconverteronline.com",
    desc: "Extract text from PDF online free. Copy the full contents to your clipboard or download a clean .txt file, all processed locally in your browser.",
  },
  "txt-to-pdf": {
    title: "Convert TXT to PDF Free, Unicode & Hindi | pdftoolconverteronline.com",
    desc: "Convert TXT to PDF online free with clean typography and proper page breaks. Supports Hindi, Tamil, Arabic, Chinese, and other scripts.",
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free, Online Tool | pdftoolconverteronline.com",
    desc: "Add page numbers to PDF online free. Choose position, starting number, and format, and preview before you download.",
  },
  "header-footer": {
    title: "Add Header and Footer to PDF Free | pdftoolconverteronline.com",
    desc: "Add headers and footers to PDF online free. Print titles, dates, filenames, or page counts on every page with custom formatting.",
  },
  "crop": {
    title: "Crop PDF Online Free, Live Browser Preview | pdftoolconverteronline.com",
    desc: "Crop PDF online free to trim white margins or cut unwanted edges from scans. Live preview shows the exact crop box before you save.",
  },
  "edit-pdf": {
    title: "Edit PDF Text & Annotate Free Online | pdftoolconverteronline.com",
    desc: "Edit existing PDF text, highlight, draw, and add images free in your browser. Match original style. No upload required.",
  },
  "fill-forms": {
    title: "Fill PDF Forms Online Free, No Signup | pdftoolconverteronline.com",
    desc: "Fill out PDF forms online free. Type into text fields, tick checkboxes, and pick options, then download the completed form.",
  },
  "flatten-pdf": {
    title: "Flatten PDF Free, Lock Forms & Notes | pdftoolconverteronline.com",
    desc: "Flatten PDF online free to lock form fields and annotations into the page permanently.",
  },
  "pdf-metadata": {
    title: "Edit PDF Metadata Free, Clean Hidden Info | pdftoolconverteronline.com",
    desc: "View, edit, or remove PDF metadata online free including title, author, and keywords. Clean hidden properties before sharing.",
  },
  "grayscale-pdf": {
    title: "Convert PDF to Grayscale Free, Black and White | pdftoolconverteronline.com",
    desc: "Convert PDF to grayscale (black and white) online free. Save ink, reduce file size, and clean up scans with our browser-based PDF converter.",
  },
  "add-blank-pages": {
    title: "Add Blank Pages to PDF Online Free — No Signup | pdftoolconverteronline.com",
    desc: "Add blank pages to any PDF instantly in your browser. Insert empty pages before, after, or between existing pages. Free, no signup, no watermark, files never leave your device.",
  },
  "scan-to-pdf": {
    title: "Scan to PDF Online Free, Use Phone Camera | pdftoolconverteronline.com",
    desc: "Scan documents to PDF free with your phone camera, right in the browser. Capture multiple pages and export as a single PDF.",
  },
  "extract-images": {
    title: "Extract Images from PDF Online Free — No Upload | PDFToolConverter",
    desc: "Extract all images from any PDF file instantly in your browser. Download embedded JPG, PNG, TIFF images in original quality. Free, no signup, no upload to servers.",
  },
  "compare": {
    title: "Compare Two PDF Files Online, Side-by-Side | pdftoolconverteronline.com",
    desc: "Compare two PDF files online free and see every changed page side by side. Use visual diff and text diff to spot edits in contracts fast.",
  },
};

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug, name: tool.name, description: tool.description };
  },
  head: ({ loaderData, params }) => {
    const slug = loaderData?.slug ?? params.slug;
    const url = `${SITE_URL}/tools/${slug}`;
    const crumbName = loaderData?.name ?? "Tool";
    const crumbs = breadcrumbJsonLd([
      { name: "Home", url: `${SITE_URL}/` },
      { name: "PDF Tools", url: `${SITE_URL}/tools` },
      { name: crumbName, url },
    ]);

    const meta = TOOL_META[slug];
    if (meta) {
      return {
        meta: [
          { title: meta.title },
          { name: "description", content: meta.desc },
          { property: "og:title", content: meta.title },
          { property: "og:description", content: meta.desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { property: "og:image", content: OG_IMAGE },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: meta.title },
          { name: "twitter:description", content: meta.desc },
          { name: "twitter:image", content: OG_IMAGE },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [{ type: "application/ld+json", children: JSON.stringify(crumbs) }],
      };
    }
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.name} | pdftoolconverteronline.com` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: `${loaderData.name}, pdftoolconverteronline.com` },
            { property: "og:description", content: loaderData.description },
            { property: "og:url", content: url },
            { property: "og:image", content: OG_IMAGE },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "twitter:image", content: OG_IMAGE },
          ]
        : [{ title: "Tool | pdftoolconverteronline.com" }],
      links: loaderData ? [{ rel: "canonical", href: url }] : [],
      scripts: loaderData
        ? [{ type: "application/ld+json", children: JSON.stringify(crumbs) }]
        : [],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getTool(slug);
  if (!tool) return null;
  const Comp = tool.Component;
  const seo = TOOL_SEO[slug];
  const url = `${SITE_URL}/tools/${slug}`;

  const fallback = (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading tool…
    </div>
  );

  return (
    <>
      <ToolLayout
        title={
          slug === "merge"
            ? "Merge PDF Files Online for Free"
            : slug === "add-blank-pages"
              ? "Add Blank Pages to PDF Online"
              : slug === "extract-images"
                ? "Extract Images from PDF Online for Free"
              : slug === "split"
                ? "Split PDF Online for Free"
                : slug === "sign-pdf"
                ? "Sign PDF Online for Free"
                : slug === "protect-pdf"
                ? "Protect PDF with Password Online for Free"
                : (seo?.layoutTitle ?? tool.name)
        }
        description={
          slug === "merge"
            ? "Combine multiple PDFs into one organized document in seconds. Drag and drop to reorder, then download your merged file. No signup, no watermarks, and your files never leave your device."
            : slug === "compress"
              ? "Reduce your PDF file size instantly without losing quality. Choose your compression level and download a smaller PDF in seconds. No signup, no watermark, no file size limits."
              : slug === "pdf-to-word"
              ? "Your file is securely uploaded to our server for processing and permanently deleted immediately after your download is complete. We never store, share, or access your files."
              : (slug === "add-blank-pages"
                ? "Insert empty pages anywhere in your PDF — before, after, or between existing pages. Free, private, and instant. No upload, no signup, no watermark."
                : slug === "extract-images"
                  ? "Pull out every embedded image from your PDF document in seconds. Download photos, graphics, logos, and diagrams in their original quality. No signup, no watermark, and your files never leave your device."
                  : slug === "split"
                    ? "Separate a PDF into multiple files by page range, extract specific pages, or split every page into its own document. No signup, no watermark, files stay on your device."
                    : slug === "sign-pdf"
                    ? "Add your electronic signature to any PDF document in seconds. Draw with your mouse, type your name, or upload a signature image. No printing, no scanning, no signup required. Your files stay on your device."
                    : slug === "protect-pdf"
                    ? "Add a password to any PDF document instantly in your browser. Encrypt your file to prevent unauthorized access. No signup, no watermark, your files never leave your device."
                    : tool.description)
        }
        crumbName={tool.name}
        icon={tool.icon}
        tint={categoryTint[tool.category]}
      >
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <Comp />
          </Suspense>
        </ClientOnly>
      </ToolLayout>
      {seo?.content}
      {seo?.jsonLd.map((v, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(normalizeToolJsonLd(v, url)) }}
        />
      ))}
    </>
  );
}
