import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const popularTools = [
  { slug: "merge", name: "Merge PDF" },
  { slug: "compress", name: "Compress PDF" },
  { slug: "split", name: "Split PDF" },
  { slug: "sign-pdf", name: "Sign PDF" },
  { slug: "protect-pdf", name: "Protect PDF" },
  { slug: "pdf-to-images", name: "PDF to Image" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-20 border-t"
      style={{ backgroundColor: "#fbfbfd", borderColor: "#ececef" }}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Logo />
          <p className="mt-3 text-sm max-w-xs" style={{ color: "#5b5b6b" }}>
            Free PDF tools that never upload your files. Everything runs in your browser.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "#14142b" }}>
            Popular tools
          </h3>
          <ul className="space-y-2">
            {popularTools.map((t) => (
              <li key={t.slug}>
                <Link
                  to="/tools/$slug"
                  params={{ slug: t.slug }}
                  className="text-sm hover:text-[#e5322d] transition-colors"
                  style={{ color: "#5b5b6b" }}
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3" style={{ color: "#14142b" }}>
            Company
          </h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-sm hover:text-[#e5322d] transition-colors" style={{ color: "#5b5b6b" }}>
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm hover:text-[#e5322d] transition-colors" style={{ color: "#5b5b6b" }}>
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="text-sm hover:text-[#e5322d] transition-colors" style={{ color: "#5b5b6b" }}>
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-sm hover:text-[#e5322d] transition-colors" style={{ color: "#5b5b6b" }}>
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "#ececef" }}>
        <p
          className="mx-auto max-w-[1200px] px-4 sm:px-6 py-5 text-center text-[12.5px]"
          style={{ color: "#7a7a86" }}
        >
          © {year} PDFfree. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
