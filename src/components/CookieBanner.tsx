import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Check localStorage
      const localConsent = localStorage.getItem(STORAGE_KEY);
      
      // Check backup cookie
      const cookieConsent = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${STORAGE_KEY}=`))
        ?.split("=")[1];

      if (!localConsent && !cookieConsent) {
        setVisible(true);
      } else if (localConsent && !cookieConsent) {
        // Sync to cookie if missing but present in local
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        document.cookie = `${STORAGE_KEY}=${localConsent}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (choice: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
      
      // Set backup cookie with 365 days expiry
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 1);
      document.cookie = `${STORAGE_KEY}=${choice}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed left-0 right-0 bottom-0 z-50 pointer-events-none px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div
        className="pointer-events-auto mx-auto max-w-3xl rounded-xl border shadow-lg bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
        style={{ borderColor: "#ececef" }}
      >
        <p className="text-sm leading-relaxed flex-1" style={{ color: "#3b3b48" }}>
          PDFToolConverter uses cookies for ads and site functionality. Your PDF files are processed
          right in your browser, not uploaded.{" "}
          <Link to="/privacy-policy" className="underline hover:text-[#e5322d]">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("declined")}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-neutral-50 transition-colors"
            style={{ borderColor: "#d8d8de", color: "#3b3b48" }}
          >
            Decline
          </button>
          <button
            onClick={() => decide("accepted")}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white transition-colors"
            style={{ backgroundColor: "#e5322d" }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
