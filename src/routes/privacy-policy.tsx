import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { breadcrumbJsonLd } from "@/lib/seoSchema";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => {
    const title = "Privacy Policy: How Your Files Are Handled | PDFToolConverter";
    const description =
      "Most PDFToolConverter tools run inside your browser; only PDF to Word uses our server. Read how files are handled, what Google Analytics measures, and how cookie consent works.";
    const url = `${SITE_URL}/privacy-policy`;
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
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: `${SITE_URL}/` },
              { name: "Privacy Policy", url },
            ]),
          ),
        },
      ],
    };
  },
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 18, 2026">
      <h2>Our core privacy promise</h2>
      <div
        className="rounded-lg border-l-4 p-4 my-4"
        style={{ backgroundColor: "#fdeceb", borderColor: "#e5322d" }}
      >
        <p style={{ margin: 0 }}>
          <strong>
            Every tool on this site except PDF to Word processes your files locally in
            your browser; those files are not transmitted to our servers, not stored by
            us, and not seen by us.
          </strong>{" "}
          When you merge, compress, sign, or edit a PDF, or compress an image, the file
          stays on your device. After the page has loaded, these tools keep working even
          if you go offline. The one exception, PDF to Word, sends your file to our
          server. Each tool page says where it is processed.
        </p>
      </div>

      <h2>Server based tool: PDF to Word</h2>
      <ul>
        <li>
          PDF to Word uploads your PDF to our server to convert it into a Word
          document, because a faithful conversion needs a document engine too large for
          a browser tab. Your file is uploaded to our server for conversion.
        </li>
        <li>
          The conversion server runs our own open source code, which you can read at{" "}
          <a
            href="https://github.com/ayushpandey9399-ui/pdftoolconverteronline-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/ayushpandey9399-ui/pdftoolconverteronline-api
          </a>
          .
        </li>
        <li>All other tools run entirely in your browser and never upload your files.</li>
      </ul>

      <h2>Information we do NOT collect</h2>
      <p>
        For the browser-based tools currently on PDFToolConverter, we do not receive or store:
      </p>
      <ul>
        <li>Your PDF, image, or text files, or any of their contents.</li>
        <li>The names or metadata of the files you process with these tools.</li>
        <li>
          Passwords you enter for protecting or unlocking PDFs, they are used only in
          your browser and are not transmitted by these tools.
        </li>
        <li>Signatures you draw or type in the Sign PDF tool.</li>
        <li>
          Personal account information, there is no signup, so we do not store names,
          emails, or passwords for user accounts.
        </li>
      </ul>

      <h2>Information collected automatically</h2>
      <p>
        Like most websites, basic technical data may be processed when you visit
        PDFToolConverter, such as browser type, device type, pages visited, approximate
        location derived from your IP address, and referral source. This data relates
        only to the page visit itself and is handled by our analytics and hosting
        providers described below. For the current browser-based tools, this data is
        not linked to the contents of files you process, because those files stay on
        your device.
      </p>

      <h2>Cookies and consent</h2>
      <p>
        Cookies are small text files stored on your device. On your first visit we ask
        whether you accept analytics cookies. Google Analytics only loads after you
        click Accept. If you click Decline, no analytics cookies are set. Your choice is
        saved in your browser, and you can change it at any time with the "Cookie
        settings" link in the footer. The PDF and image tools work the same either way.
      </p>

      <h2>Analytics</h2>
      <p>
        If you accept, we use Google Analytics to measure visits, such as which pages
        are opened, your approximate location, and your device and browser type. Google
        Analytics sets cookies to do this. It never receives the files you process. We
        also keep aggregate hosting logs to keep the site reliable and detect abuse.
      </p>

      <h2>Advertising</h2>
      <p>The site does not currently show ads.</p>

      <h2>Third-party links</h2>
      <p>
        Some pages on PDFToolConverter link to external websites. Once you leave our site, we
        are not responsible for the privacy practices of those third parties. Their
        content is governed by their own privacy policies.
      </p>

      <h2>Children's privacy</h2>
      <p>
        PDFToolConverter is a general-audience service. We do not knowingly collect personal
        information from children under 13. If you believe a child has provided
        personal information to us, please contact us and we will take appropriate
        action.
      </p>

      <h2>Data security</h2>
      <p>
        Because the current tools keep your files on your device, the primary security
        model for your documents is your own device and browser. Our website itself is
        served over HTTPS to protect the integrity of the code delivered to your
        browser.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The "Last updated" date
        at the top of this page reflects the most recent version. Significant changes
        will be highlighted on the site.
      </p>

      <h2>Contact us</h2>
      <p>
        For any questions about this Privacy Policy, please email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
