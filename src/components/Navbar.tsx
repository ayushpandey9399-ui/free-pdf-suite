import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ChevronDown, LayoutGrid } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Merge PDF", to: "/tools/$slug", params: { slug: "merge" }, caret: false },
  { label: "Split PDF", to: "/tools/$slug", params: { slug: "split" }, caret: false },
  { label: "Compress PDF", to: "/tools/$slug", params: { slug: "crop" }, caret: false },
  { label: "Convert PDF", to: "/", params: undefined, hash: "tools", caret: true },
  { label: "All PDF Tools", to: "/", params: undefined, hash: "tools", caret: true },
] as const;

const NAV_STYLE = {
  fontSize: 13,
  letterSpacing: "0.04em",
  color: "#33333c",
} as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-white"
      style={{ borderColor: "#ececef" }}
    >
      <div
        className="mx-auto flex max-w-[1200px] items-center justify-between px-4 sm:px-6"
        style={{ height: 66 }}
      >
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden min-[860px]:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                className="inline-flex items-center gap-1 font-bold uppercase transition-colors hover:text-[#e5322d]"
                style={NAV_STYLE}
              >
                {l.label}
                {l.caret && <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden min-[860px]:flex items-center gap-3">
          <a
            href="#"
            className="font-bold uppercase transition-colors hover:text-[#e5322d]"
            style={NAV_STYLE}
          >
            Login
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-lg px-4 py-2 text-[13px] font-bold uppercase text-white transition-colors hover:bg-[#c72620]"
            style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
          >
            Sign up
          </a>
          <button
            type="button"
            aria-label="Open apps menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[#33333c] hover:bg-[#f6f4f9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
          >
            <LayoutGrid className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="min-[860px]:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#f6f4f9]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          className="min-[860px]:hidden border-t bg-white px-4 py-4"
          style={{ borderColor: "#ececef" }}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
                style={{ color: "#33333c", letterSpacing: "0.04em" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-2 border-t" style={{ borderColor: "#ececef" }}>
              <a
                href="#"
                className="flex-1 rounded-lg px-4 py-3 text-center text-[13px] font-bold uppercase hover:bg-[#f6f4f9]"
                style={{ color: "#33333c", letterSpacing: "0.04em" }}
              >
                Login
              </a>
              <a
                href="#"
                className="flex-1 rounded-lg px-4 py-3 text-center text-[13px] font-bold uppercase text-white"
                style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
              >
                Sign up
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
