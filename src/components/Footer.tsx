import { Facebook, Twitter, Instagram } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const socials = [
    { Icon: Facebook, label: "Facebook", href: "#" },
    { Icon: Twitter, label: "Twitter", href: "#" },
    { Icon: Instagram, label: "Instagram", href: "#" },
  ];

  return (
    <footer className="mt-20 border-t" style={{ backgroundColor: "#fbfbfd", borderColor: "#ececef" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />
        <p
          className="text-[13.5px] text-center md:text-left"
          style={{ color: "#7a7a86" }}
        >
          No file size limits · No signup required · Files never uploaded · 100% free, forever.
        </p>
        <div className="flex gap-2">
          {socials.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-[#e5322d] hover:border-[#e5322d]"
              style={{ borderColor: "#ececef", color: "#7a7a86" }}
            >
              <Icon className="h-4 w-4 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>
      </div>
      <div className="border-t" style={{ borderColor: "#ececef" }}>
        <p
          className="mx-auto max-w-[1200px] px-4 sm:px-6 py-5 text-center text-[12.5px]"
          style={{ color: "#7a7a86" }}
        >
          © PDFfree 2026 — Every PDF tool you need, 100% free.
        </p>
      </div>
    </footer>
  );
}
