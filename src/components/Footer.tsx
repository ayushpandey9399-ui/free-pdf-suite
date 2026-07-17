import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const socials = [
    { Icon: Facebook, label: "Facebook", href: "#" },
    { Icon: Twitter, label: "Twitter", href: "#" },
    { Icon: Linkedin, label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="mt-24 border-t bg-white" style={{ borderColor: "#ececef" }}>
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <Logo />
          <p className="mt-3 text-sm" style={{ color: "#7a7a86" }}>
            No file size limits · No signup required · Files never uploaded · 100% free, forever.
          </p>
        </div>
        <div className="flex gap-3">
          {socials.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              style={{ borderColor: "#ececef", color: "#7a7a86" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#e5322d";
                e.currentTarget.style.borderColor = "#e5322d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#7a7a86";
                e.currentTarget.style.borderColor = "#ececef";
              }}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t" style={{ borderColor: "#ececef" }}>
        <div
          className="mx-auto max-w-[1180px] px-4 sm:px-6 py-5 text-center text-xs"
          style={{ color: "#7a7a86" }}
        >
          © PDFfree 2026 — Every PDF tool you need, 100% free.
        </div>
      </div>
    </footer>
  );
}
