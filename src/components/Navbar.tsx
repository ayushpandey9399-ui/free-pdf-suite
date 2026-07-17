import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Merge PDF", to: "/tools/$slug", params: { slug: "merge" } },
  { label: "Split PDF", to: "/tools/$slug", params: { slug: "split" } },
  { label: "Convert PDF", to: "/tools/$slug", params: { slug: "images-to-pdf" } },
  { label: "All Tools", to: "/", params: undefined, hash: "tools" },
  { label: "Why Us", to: "/", params: undefined, hash: "why" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-xl"
      style={{
        borderColor: "#eceaf0",
        backgroundColor: "rgba(255,255,255,0.72)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden min-[960px]:flex items-center gap-7">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                className="text-[14px] font-semibold transition-colors hover:text-[#e5322d]"
                style={{ color: "#14142b" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden min-[960px]:flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#f6f4f9]"
            style={{ color: "#14142b" }}
          >
            Login
          </button>
          <button
            type="button"
            className="group inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{
              backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)",
              boxShadow: "0 10px 25px -10px rgba(229,50,45,0.6)",
            }}
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="min-[960px]:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#f6f4f9]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div
          className="min-[960px]:hidden border-t bg-white px-4 py-4"
          style={{ borderColor: "#eceaf0" }}
        >
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-semibold hover:bg-[#f6f4f9]"
                style={{ color: "#14142b" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-2 border-t" style={{ borderColor: "#eceaf0" }}>
              <button
                type="button"
                className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#f6f4f9]"
                style={{ color: "#14142b" }}
              >
                Login
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)" }}
              >
                Get Started
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
