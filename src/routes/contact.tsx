import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => {
    const title = "Contact FreePDFHub | Bug Reports & Feedback";
    const description =
      "Get in touch with FreePDFHub. We read every bug report, feature request, and piece of feedback. Usually respond within a few days.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/contact" },
      ],
      links: [{ rel: "canonical", href: "/contact" }],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  return (
    <LegalPage title="Contact Us">
      <p>
        We read everything — bug reports, feature requests, and general feedback all
        land in the same inbox and help shape what FreePDFHub becomes next.
      </p>

      <p>
        The best way to reach us is by email:
      </p>
      <ContactEmail />


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
