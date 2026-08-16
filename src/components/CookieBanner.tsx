import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "pdftoolconverteronline.cookieConsent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* ignore */
    }
  }, []);

  const decide = (choice: "accept" | "decline") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
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
          pdftoolconverteronline.com uses cookies for ads and site functionality. Your PDF files are processed
          right in your browser, not uploaded.{" "}
          <Link to="/privacy-policy" className="underline hover:text-[#e5322d]">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide("decline")}
            className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-neutral-50 transition-colors"
            style={{ borderColor: "#d8d8de", color: "#3b3b48" }}
          >
            Decline
          </button>
          <button
            onClick={() => decide("accept")}
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
