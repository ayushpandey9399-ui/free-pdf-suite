import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";
import { breadcrumbJsonLd } from "@/lib/seoSchema";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { ContactForm } from "@/components/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => {
    const title = "Contact PDFToolConverter, Bug Reports and Feedback | PDFToolConverter";
    const description =
      "Get in touch with PDFToolConverter. We read every bug report, feature request, and piece of feedback, and usually respond within a few days by email.";
    const url = `${SITE_URL}/contact`;
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
              { name: "Contact", url },
            ]),
          ),
        },
      ],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>
        We read everything, bug reports, feature requests, and general feedback all
        land in the same inbox and help shape what PDFToolConverter becomes next.
      </p>

      <p>
        The best way to reach us is by email:
      </p>
      <ContactEmail />

      <h2>Send us a message</h2>
      <p>
        Prefer a form? Fill this in and it lands in the same inbox.
      </p>
      <ContactForm />

      <h2>Reporting a bug</h2>
      <p>To help us reproduce and fix the issue quickly, please include:</p>
      <ul>
        <li>Which tool you were using (for example, "Merge PDF" or "Sign PDF").</li>
        <li>The file type and approximate size (for example, "a 12 MB scanned PDF").</li>
        <li>Your browser and device (for example, "Chrome on Windows 11" or "Safari on iPhone").</li>
        <li>What happened, and what you expected to happen instead.</li>
      </ul>

      <h2>Response time</h2>
      <p>We usually respond within a few days. Thanks for your patience.</p>
    </LegalPage>
  );
}

function ContactEmail() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="flex items-center gap-3 flex-wrap my-4">
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        style={{ fontSize: 20, fontWeight: 600 }}
      >
        {CONTACT_EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email to clipboard"}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors hover:bg-neutral-50"
        style={{ borderColor: "#d8d8de", color: "#3b3b48" }}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" style={{ color: "#16a34a" }} />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
