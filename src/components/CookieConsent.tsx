import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  OPEN_CONSENT_EVENT,
  disableAnalytics,
  loadAnalytics,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * Architecture Notes
 * Asks before any analytics cookie is set. Rendered on the client only
 * (state read in useEffect) so the server HTML never differs from the first
 * client render. Reopened by the footer "Cookie settings" link.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (c === "accepted") loadAnalytics();
    else if (c === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (v: "accepted" | "declined") => {
    writeConsent(v);
    if (v === "accepted") loadAnalytics();
    else disableAnalytics();
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-xl border border-border bg-card p-4 text-card-foreground shadow-lg sm:flex sm:items-center sm:gap-4"
    >
      <p className="text-sm">
        We use Google Analytics cookies to see which pages are used, only if you accept.
        Your files are never shared.{" "}
        <Link to="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => choose("declined")}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("accepted")}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
