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
    title: "Compress PDF Online, Reduce PDF Size Free | pdftoolconverteronline.com",
    desc: "Compress PDF file size online free without losing quality. Shrink large scans and reports in your browser to fit email limits and load faster, 100% private.",
  },
  "split": {
    title: "Split PDF Free, Extract Page Ranges Online | pdftoolconverteronline.com",
    desc: "Split PDF into separate files or extract page ranges online free. Runs offline in your browser, break up long documents without an account or upload.",
  },
  "sign-pdf": {
    title: "Sign PDF Online Free, Add Signature to PDF | pdftoolconverteronline.com",
    desc: "Sign PDF documents online free by drawing, typing, or uploading your signature. Place it anywhere on any page and download a signed copy in seconds.",
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
    title: "Protect PDF with Password, Free AES-256 | pdftoolconverteronline.com",
    desc: "Password protect PDF online free with real AES-256 encryption. Set a password directly in your browser, your file and password stay on your device.",
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
    desc: "Convert PDF to Word online free and get a fully editable DOCX file. Headings, tables, and images are preserved, processed 100% in your browser.",
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
    title: "Extract Images from PDF Online Free, Full Quality | pdftoolconverteronline.com",
    desc: "Extract images from PDF online free. Pull out original photos, logos, and figures at full quality. No upload, entirely in your browser.",
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
              : (seo?.layoutTitle ?? tool.name)
        }
        description={
          slug === "merge"
            ? "Combine multiple PDFs into one organized document in seconds. Drag and drop to reorder, then download your merged file. No signup, no watermarks, and your files never leave your device."
            : slug === "pdf-to-word"
              ? "Converts your PDF into an editable Word file while keeping images, tables and page layout."
              : (slug === "add-blank-pages"
                ? "Insert empty pages anywhere in your PDF — before, after, or between existing pages. Free, private, and instant. No upload, no signup, no watermark."
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
