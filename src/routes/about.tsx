import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/about")({
  head: () => {
    const title = "About FreePDFHub | Free Browser-Based PDF Tools";
    const description =
      "FreePDFHub offers 28+ genuinely free PDF tools that run entirely in your browser — no uploads, no accounts, no watermarks. Learn why we built it.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/about" },
      ],
      links: [{ rel: "canonical", href: "/about" }],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  return (
    <LegalPage title="About FreePDFHub">
      <p>
        Every day, people need to merge a certificate into a job application, compress
        a file to squeeze under an upload limit, or sign a contract before a deadline.
        And most "free" online tools make them upload private documents to unknown
        servers, sign up for an account, or accept an ugly watermark on the result.
      </p>

      <p>
        We thought that was backwards. So we built FreePDFHub: 28+ genuinely free PDF
        tools that run entirely in your browser. No uploads. No accounts. No
        watermarks. No daily limits.
      </p>

      <h2>How it works</h2>
      <p>
        Modern browsers are surprisingly powerful — they can open, edit, and re-save
        PDFs on their own. Every tool currently on FreePDFHub is built with client-side
        technology, which means your files don't travel to a server for these tools.
        They open, get processed, and get saved back to your device, all without
        leaving the browser tab. If we ever add a tool that requires server-side
        processing, it will be clearly labeled on that tool's page.
      </p>

      <h2>What we offer</h2>
      <ul>
        <li>
          <strong>Organize</strong> — merge, split, reorder, delete, extract, rotate,
          crop, compress, and add blank pages.
        </li>
        <li>
          <strong>Convert</strong> — images to PDF, PDF to images, PDF to text, TXT
          to PDF, and scan-to-PDF from your camera.
        </li>
        <li>
          <strong>Edit</strong> — watermarks, page numbers, headers and footers,
          annotations, metadata, and grayscale conversion.
        </li>
        <li>
          <strong>Forms &amp; Compare</strong> — fill and flatten PDF forms, and
          compare two documents side by side.
        </li>
        <li>
          <strong>Security</strong> — protect with a password, unlock, sign, and
          truly redact sensitive content.
        </li>
      </ul>

      <h2>How the site stays free</h2>
      <p>
        FreePDFHub is supported by advertising shown around the tools. For the current
        browser-based tools, those ads don't see your files — they can't, because
        your files stay in your browser. If the site is useful to you, letting the
        ads load is the way you support the project.
      </p>

      <h2>We'd love your feedback</h2>
      <p>
        FreePDFHub is a small, focused project and we read every message. If a tool is
        missing something, if you found a bug, or if you have an idea for a new tool,
        head over to our <Link to="/contact">Contact page</Link> and tell us.
      </p>
    </LegalPage>
  );
}
