import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => {
    const title = "Terms of Use | FreePDFHub";
    const description =
      "The terms that govern your use of FreePDFHub, free, browser-based PDF tools with no accounts, no uploads, and clear rules for acceptable use.";
    const url = `${SITE_URL}/terms`;
    const ogImage = `${SITE_URL}/og-cover.png`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated={LAST_UPDATED}>
      <p>
        Welcome to FreePDFHub. These Terms of Use ("Terms") govern your access to and use
        of the FreePDFHub website and tools.
      </p>

      <h2>Acceptance of terms</h2>
      <p>
        By using FreePDFHub, you agree to these Terms. If you do not agree, please do not
        use the service.
      </p>

      <h2>The service</h2>
      <p>
        FreePDFHub provides a set of free, browser-based tools for working with PDF
        files. All processing happens locally in your browser, no files are uploaded
        to our servers. No account is required to use any tool.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>
          You must have the legal right to the files you process using our tools.
        </li>
        <li>
          You may not use FreePDFHub for any illegal purpose, including but not limited
          to forging documents, violating copyright, or tampering with
          government-issued documents.
        </li>
        <li>
          The Sign PDF tool creates simple electronic signatures. You are responsible
          for ensuring that such signatures meet the legal requirements of your
          jurisdiction and use case (for example, some contracts require qualified
          electronic signatures or handwritten signatures).
        </li>
      </ul>

      <h2>No warranty</h2>
      <p>
        The service is provided "as is" and "as available", without warranties of any
        kind, whether express or implied. We do not guarantee that the outputs
        produced by the tools are error-free or fit for any particular purpose.
        Always verify important documents after processing them.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law, FreePDFHub and its operators
        are not liable for any damages arising from your use of the tools, including
        without limitation data loss, document corruption, or errors introduced by
        processing. Always keep a copy of your original files as backup.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The FreePDFHub site design, brand, and code are owned by us and protected by
        applicable intellectual property laws. Your files remain entirely yours, we
        never receive them, and we make no claim to them.
      </p>

      <h2>Advertising</h2>
      <p>
        FreePDFHub is supported by advertising. See our{" "}
        <a href="/privacy-policy">Privacy Policy</a> for details on how advertising
        partners handle cookies and personalization.
      </p>

      <h2>Changes to the service and terms</h2>
      <p>
        We may add, change, or remove tools and features at any time. We may also
        update these Terms without prior notice. Continued use of the service after
        changes take effect constitutes acceptance of the updated Terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
