import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo";
import { ShieldCheck, Sparkles, CloudOff, ArrowUp } from "lucide-react";

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

type ImageLink = { to: string; name: string };
const imageTools: ImageLink[] = [
  { to: "/image-tools", name: "Image Tools" },
  { to: "/image-tools/heic-to-jpg", name: "HEIC to JPG" },
  { to: "/image-tools/heic-to-png", name: "HEIC to PNG" },
  { to: "/image-tools/jpg-to-png", name: "JPG to PNG" },
  { to: "/image-tools/png-to-jpg", name: "PNG to JPG" },
  { to: "/image-tools/webp-to-jpg", name: "WebP to JPG" },
  { to: "/image-tools/webp-to-png", name: "WebP to PNG" },
  { to: "/image-tools/jpg-to-webp", name: "JPG to WebP" },
  { to: "/image-tools/png-to-webp", name: "PNG to WebP" },
  { to: "/image-tools/compress-image", name: "Compress Image" },
  { to: "/image-tools/image-resize", name: "Resize Image" },
  { to: "/image-tools/crop-image", name: "Crop Image" },
  { to: "/image-tools/rotate-image", name: "Rotate & Flip" },
  { to: "/image-tools/watermark-image", name: "Watermark Image" },
  { to: "/image-tools/meme-generator", name: "Meme Generator" },
  { to: "/image-tools/photo-editor", name: "Photo Editor" },
];


const HEAD_STYLE = {
  color: "#4B5563",
  letterSpacing: "0.05em",
  fontWeight: 600,
} as const;

const LINK_CLASS =
  "inline-block py-1.5 text-[14px] transition-all duration-150 ease-out hover:text-white hover:translate-x-0.5";

const LINK_STYLE = { color: "#d1d5db" } as const;

export function Footer() {
  
  const backToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  return (
    <footer style={{ backgroundColor: "#0F172A", color: "#9CA3AF" }}>
      <nav aria-label="Footer" className="mx-auto max-w-[1200px] px-4 sm:px-6 pt-14 pb-10 sm:pt-16 sm:pb-10">
        <div className="grid gap-10 sm:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 items-start">
          {/* Brand, 2 col wide on desktop */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              aria-label="pdftoolconverteronline.com, home"
              className="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-[26px] leading-none"
            >
              <LogoMark size={38} />
              <span className="inline-flex items-baseline gap-0.5">
                <span style={{ color: "#ffffff" }}>PDFTool</span>
                <span style={{ color: "#e5322d" }}>Converter</span>
              </span>
            </Link>
            <p
              className="mt-5 text-[14px] max-w-[280px]"
              style={{ color: "#9CA3AF", lineHeight: 1.65 }}
            >
              Free PDF tools that process your files right in your browser, private, fast and completely free.
            </p>
            <ul
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]"
              style={{ color: "#9CA3AF" }}
            >
              <MicroBadge icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No signup" />
              <MicroBadge icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No watermark" />
              <MicroBadge icon={<CloudOff className="h-3.5 w-3.5" strokeWidth={2.25} />} label="No uploads" />
            </ul>
          </div>

          <FooterColumn title="Organize" links={organize} />
          <FooterColumn title="Convert" links={convert} />
          <FooterColumn title="Edit" links={edit} />

          {/* Image Tools column, spans 2 on desktop */}
          <div className="sm:col-span-2 lg:col-span-2">
            <FooterHeading>Image Tools</FooterHeading>
            <ul className="mt-4 grid grid-cols-2 gap-x-6">
              {imageTools.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={LINK_CLASS} style={LINK_STYLE}>
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure + Company sharing a column */}
          <div>
            <FooterColumn title="Secure" links={secure} />
            <div className="mt-8">
              <FooterHeading>Company</FooterHeading>
              <ul className="mt-4">
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
      </nav>


      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div
          className="mx-auto flex max-w-[1200px] flex-col items-center gap-2 px-4 sm:px-6 py-5 text-[13px] sm:flex-row sm:justify-between"
          style={{ color: "#9CA3AF" }}
        >
          <p>© 2026 pdftoolconverteronline.com. All rights reserved.</p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
            <button
              type="button"
              onClick={backToTop}
              className="inline-flex items-center gap-1 text-[13px] transition-colors duration-150 hover:text-white"
              style={{ color: "#9CA3AF" }}
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] uppercase" style={HEAD_STYLE}>
      {children}
    </h4>
  );
}

function FooterColumn({ title, links }: { title: string; links: ToolLink[] }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-4">
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
    <li className="inline-flex items-center gap-1.5 leading-none">
      <span className="inline-flex items-center" style={{ color: "#ff6b67" }}>{icon}</span>
      <span>{label}</span>
    </li>
  );
}
