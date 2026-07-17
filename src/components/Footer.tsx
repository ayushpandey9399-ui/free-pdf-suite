import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";
import { ShieldCheck, Sparkles, CloudOff } from "lucide-react";

type ToolLink = { slug: string; name: string };

const organize: ToolLink[] = [
  { slug: "merge", name: "Merge PDF" },
  { slug: "split", name: "Split PDF" },
  { slug: "extract-pages", name: "Extract Pages" },
  { slug: "reorder-pages", name: "Reorder Pages" },
  { slug: "delete-pages", name: "Delete Pages" },
  { slug: "add-blank-pages", name: "Add Blank Pages" },
  { slug: "rotate", name: "Rotate PDF" },
  { slug: "crop", name: "Crop PDF" },
];

const convert: ToolLink[] = [
  { slug: "images-to-pdf", name: "Image to PDF" },
  { slug: "pdf-to-images", name: "PDF to Image" },
  { slug: "extract-images", name: "Extract Images" },
  { slug: "pdf-to-text", name: "PDF to Text" },
  { slug: "txt-to-pdf", name: "TXT to PDF" },
  { slug: "scan-to-pdf", name: "Scan to PDF" },
  { slug: "compress", name: "Compress PDF" },
  { slug: "grayscale-pdf", name: "Grayscale PDF" },
];

const edit: ToolLink[] = [
  { slug: "edit-pdf", name: "Edit PDF" },
  { slug: "fill-forms", name: "Fill PDF Forms" },
  { slug: "sign-pdf", name: "Sign PDF" },
  { slug: "watermark", name: "Watermark PDF" },
  { slug: "page-numbers", name: "Page Numbers" },
  { slug: "header-footer", name: "Header & Footer" },
  { slug: "compare", name: "Compare PDFs" },
  { slug: "flatten-pdf", name: "Flatten PDF" },
];

const secure: ToolLink[] = [
  { slug: "protect-pdf", name: "Protect PDF" },
  { slug: "unlock-pdf", name: "Unlock PDF" },
  { slug: "redact-pdf", name: "Redact PDF" },
  { slug: "pdf-metadata", name: "PDF Metadata" },
];

const HEAD_STYLE = {
  color: "#6B7280",
  letterSpacing: "0.05em",
  fontWeight: 600,
} as const;

const LINK_CLASS =
  "block py-1.5 text-[14px] transition-colors duration-150 hover:text-white";

const LINK_STYLE = { color: "#9CA3AF" } as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ backgroundColor: "#0F172A", color: "#9CA3AF" }} className="mt-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-14 pb-10 sm:pt-16 sm:pb-10">
        <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand — 2 col wide on desktop */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              aria-label="PDFfree — home"
              className="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-[26px] leading-none"
            >
              <LogoMark size={38} />
              <span className="inline-flex items-baseline gap-0.5">
                <span style={{ color: "#ffffff" }}>PDF</span>
                <span style={{ color: "#ff6b67" }}>free</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[14px]" style={{ color: "#9CA3AF", lineHeight: 1.65 }}>
              Free PDF tools that process your files right in your browser — private, fast and completely free.
            </p>
            <ul className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px]" style={{ color: "#9CA3AF" }}>
              <MicroBadge icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No signup" />
              <MicroBadge icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No watermark" />
              <MicroBadge icon={<CloudOff className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No uploads" />
            </ul>
          </div>

          <FooterColumn title="Organize" links={organize} />
          <FooterColumn title="Convert" links={convert} />
          <FooterColumn title="Edit" links={edit} />

          {/* Secure + Company sharing a column */}
          <div>
            <FooterColumn title="Secure" links={secure} />
            <div className="mt-8">
              <FooterHeading>Company</FooterHeading>
              <ul className="mt-3">
                <li>
                  <Link to="/about" className={LINK_CLASS} style={LINK_STYLE}>About</Link>
                </li>
                <li>
                  <Link to="/contact" className={LINK_CLASS} style={LINK_STYLE}>Contact</Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className={LINK_CLASS} style={LINK_STYLE}>Privacy Policy</Link>
                </li>
                <li>
                  <Link to="/terms" className={LINK_CLASS} style={LINK_STYLE}>Terms of Use</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-4 sm:px-6 py-5 text-[13px] sm:flex-row sm:justify-between"
          style={{ color: "#9CA3AF" }}
        >
          <p>© {year} PDFfree. All rights reserved.</p>
          <p>Made with <span style={{ color: "#ff6b67" }}>❤</span> in India · 100% free, forever</p>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] uppercase" style={HEAD_STYLE}>
      {children}
    </h3>
  );
}

function FooterColumn({ title, links }: { title: string; links: ToolLink[] }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-3">
        {links.map((l) => (
          <li key={l.slug}>
            <Link
              to="/tools/$slug"
              params={{ slug: l.slug }}
              className={LINK_CLASS}
              style={LINK_STYLE}
            >
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MicroBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li className="inline-flex items-center gap-1.5">
      <span style={{ color: "#ff6b67" }}>{icon}</span>
      <span>{label}</span>
    </li>
  );
}
