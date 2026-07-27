import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { breadcrumbJsonLd } from "@/lib/seoSchema";
import { CONTACT_EMAIL, LAST_UPDATED, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => {
    const title = "Privacy Policy, Your Files Stay on Your Device | FreePDFHub";
    const description =
      "FreePDFHub processes every PDF entirely inside your browser. Read our privacy policy: no uploads, no accounts, and full disclosure on cookies and ads.";
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
    <LegalPage title="Privacy Policy" updated={LAST_UPDATED}>
      <h2>Our core privacy promise</h2>
      <div
        className="rounded-lg border-l-4 p-4 my-4"
        style={{ backgroundColor: "#fdeceb", borderColor: "#e5322d" }}
      >
        <p style={{ margin: 0 }}>
          <strong>
            Every tool on this site except PDF to Word processes your files
            locally in your browser; those files are not transmitted to our
            servers, not stored by us, and not seen by us.
          </strong>{" "}
          When you merge, compress, sign, or edit a PDF with those tools, the file
          stays on your device from start to finish. You can even disconnect from the
          internet after the page loads and these tools keep working. The one
          exception is PDF to Word, which needs server-side conversion. It is
          labeled on its own page and described in the section below.
        </p>
      </div>

      <h2>Server based tools</h2>
      <p>
        One tool on FreePDFHub, PDF to Word, cannot run in the browser, because a
        faithful Word conversion needs a document engine that is far too large to
        download into a browser tab. Here is exactly how that tool handles your data:
      </p>
      <ul>
        <li>
          All tools except PDF to Word run entirely in your browser and never upload
          your files.
        </li>
        <li>
          PDF to Word uploads your PDF to our own server in order to convert it into
          a Word document.
        </li>
        <li>
          The uploaded file and the converted file are deleted immediately after the
          download is sent, and any leftover file is deleted within 10 minutes.
        </li>
        <li>
          We keep only technical request logs with the status, the file size, and the
          duration of the conversion. We do not log file names or file contents.
        </li>
        <li>
          The conversion server runs our own open source code, which you can read at{" "}
          <a
            href="https://github.com/ayushpandey9399-ui/freepdfhub-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/ayushpandey9399-ui/freepdfhub-api
          </a>
          .
        </li>
      </ul>


      <h2>Information we do NOT collect</h2>
      <p>
        For the browser-based tools currently on FreePDFHub, we do not receive or store:
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
        FreePDFHub, such as browser type, device type, pages visited, approximate
        location derived from your IP address, and referral source. This data relates
        only to the page visit itself and is handled by our analytics and hosting
        providers described below. For the current browser-based tools, this data is
        not linked to the contents of files you process, because those files stay on
        your device.
      </p>

      <h2>Cookies and similar technologies</h2>
      <p>
        Cookies are small text files stored on your device that help websites remember
        information about your visit. FreePDFHub may use:
      </p>
      <ul>
        <li>
          <strong>Functional cookies</strong> to remember basic preferences (for
          example, whether you have accepted our cookie notice).
        </li>
        <li>
          <strong>Third-party cookies</strong> from our advertising and analytics
          partners described below.
        </li>
      </ul>
      <p>
        You can control or delete cookies through your browser settings. Blocking
        cookies does not break the PDF tools on this site, they will keep working
        normally.
      </p>

      <h2>Advertising (Google AdSense)</h2>
      <p>
        We use (or plan to use) Google AdSense to show advertisements that keep
        FreePDFHub free for everyone.
      </p>
      <ul>
        <li>
          Google and its partners use cookies (including the DoubleClick cookie) to
          serve ads based on your prior visits to this and other websites.
        </li>
        <li>
          You can opt out of personalized advertising by visiting{" "}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>{" "}
          or{" "}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">
            aboutads.info
          </a>
          .
        </li>
        <li>
          Third-party ad vendors may also place cookies on this site as described in
          Google's policies. See{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            How Google uses information from sites or apps that use our services
          </a>
          .
        </li>
      </ul>
      <p>
        <strong>
          Important: ads appear on the page around the tools. For the browser-based
          tools currently on FreePDFHub, advertising partners do not receive access to
          the files you process, because those files stay in your browser.
        </strong>
      </p>

      <h2>Analytics</h2>
      <p>
        We currently use no analytics beyond aggregate, anonymous hosting logs used to
        keep the site reliable and detect abuse. If we add a privacy-respecting
        analytics tool in the future, we will name it here and describe what it
        measures.
      </p>

      <h2>Third-party links</h2>
      <p>
        Some pages on FreePDFHub link to external websites. Once you leave our site, we
        are not responsible for the privacy practices of those third parties. Their
        content is governed by their own privacy policies.
      </p>

      <h2>Children's privacy</h2>
      <p>
        FreePDFHub is a general-audience service. We do not knowingly collect personal
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
