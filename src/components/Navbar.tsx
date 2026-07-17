import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const navLinks = [
  { label: "MERGE PDF", to: "/tools/$slug", params: { slug: "merge" } },
  { label: "SPLIT PDF", to: "/tools/$slug", params: { slug: "split" } },
  { label: "CONVERT PDF", to: "/tools/$slug", params: { slug: "images-to-pdf" } },
  { label: "ALL PDF TOOLS", to: "/", params: undefined, hash: "tools" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-white"
      style={{ borderColor: "#ececef" }}
    >
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden min-[900px]:flex items-center gap-7">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                className="text-[13.5px] font-semibold tracking-wide transition-colors hover:text-[#e5322d]"
                style={{ color: "#33333c" }}
              >
                {l.label}
                {l.label === "ALL PDF TOOLS" && <span aria-hidden> ▾</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden min-[900px]:flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#f4f4f6]"
            style={{ color: "#33333c" }}
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: "#e5322d" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c72620")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e5322d")}
          >
            Sign up
          </button>
        </div>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          className="min-[900px]:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#f4f4f6]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="min-[900px]:hidden border-t bg-white px-4 py-4" style={{ borderColor: "#ececef" }}>
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                params={l.params as any}
                hash={(l as any).hash}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] font-semibold hover:bg-[#f4f4f6]"
                style={{ color: "#33333c" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-2 border-t" style={{ borderColor: "#ececef" }}>
              <button
                type="button"
                className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#f4f4f6]"
                style={{ color: "#33333c" }}
              >
                Login
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "#e5322d" }}
              >
                Sign up
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
