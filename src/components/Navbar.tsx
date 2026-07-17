import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { tools, categories, type ToolCategory } from "@/tools/registry";

const NAV_STYLE = {
  fontSize: 13,
  letterSpacing: "0.04em",
  color: "#33333c",
} as const;

const convertTools = tools.filter((t) => t.category === "Convert PDF");

type DropdownKey = "convert" | "all" | null;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<DropdownKey>(null);
  const [mobileSection, setMobileSection] = useState<DropdownKey>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdown) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdown(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdown]);

  const closeAll = () => {
    setDropdown(null);
    setOpen(false);
    setMobileSection(null);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background"
      style={{ borderColor: "#ececef" }}
    >
      <div
        ref={wrapRef}
        className="mx-auto flex max-w-[1200px] items-center justify-between px-4 sm:px-6"
        style={{ height: 58 }}
      >
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden min-[860px]:flex items-center gap-6">
            <Link
              to="/tools/$slug"
              params={{ slug: "merge" }}
              className="font-bold uppercase transition-colors hover:text-[#e5322d]"
              style={NAV_STYLE}
            >
              Merge PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "split" }}
              className="font-bold uppercase transition-colors hover:text-[#e5322d]"
              style={NAV_STYLE}
            >
              Split PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "compress" }}
              className="font-bold uppercase transition-colors hover:text-[#e5322d]"
              style={NAV_STYLE}
            >
              Compress PDF
            </Link>

            {/* Convert PDF dropdown */}
            <Link
              to="/tools/$slug"
              params={{ slug: "sign-pdf" }}
              className="font-bold uppercase transition-colors hover:text-[#e5322d]"
              style={NAV_STYLE}
            >
              Sign PDF
            </Link>

            {/* Convert PDF dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdown("convert")}
              onMouseLeave={() => setDropdown(null)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={dropdown === "convert"}
                onClick={() => setDropdown((d) => (d === "convert" ? null : "convert"))}
                className="inline-flex items-center gap-1 font-bold uppercase transition-colors hover:text-[#e5322d]"
                style={NAV_STYLE}
              >
                Convert PDF
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              {dropdown === "convert" && (
                <DropdownPanel width={260}>
                  <ul className="p-2">
                    {convertTools.map((t) => (
                      <DropdownItem key={t.slug} tool={t} onClick={closeAll} />
                    ))}
                  </ul>
                </DropdownPanel>
              )}
            </div>

            {/* All PDF Tools dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdown("all")}
              onMouseLeave={() => setDropdown(null)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={dropdown === "all"}
                onClick={() => setDropdown((d) => (d === "all" ? null : "all"))}
                className="inline-flex items-center gap-1 font-bold uppercase transition-colors hover:text-[#e5322d]"
                style={NAV_STYLE}
              >
                All PDF Tools
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
              {dropdown === "all" && (
                <DropdownPanel width={720} align="right">
                  <div className="grid grid-cols-2 gap-2 p-4 lg:grid-cols-4">
                    {categories.map((cat) => (
                      <div key={cat}>
                        <p
                          className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: "#9a9aa5", letterSpacing: "0.08em" }}
                        >
                          {shortCategory(cat)}
                        </p>
                        <ul>
                          {tools
                            .filter((t) => t.category === cat)
                            .map((t) => (
                              <DropdownItem key={t.slug} tool={t} onClick={closeAll} compact />
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </DropdownPanel>
              )}
            </div>
          </nav>
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
            <Link
              to="/tools/$slug"
              params={{ slug: "merge" }}
              onClick={closeAll}
              className="rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
              style={{ color: "#33333c", letterSpacing: "0.04em" }}
            >
              Merge PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "split" }}
              onClick={closeAll}
              className="rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
              style={{ color: "#33333c", letterSpacing: "0.04em" }}
            >
              Split PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "compress" }}
              onClick={closeAll}
              className="rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
              style={{ color: "#33333c", letterSpacing: "0.04em" }}
            >
              Compress PDF
            </Link>

            <MobileAccordion
              label="Convert PDF"
              expanded={mobileSection === "convert"}
              onToggle={() =>
                setMobileSection((s) => (s === "convert" ? null : "convert"))
              }
            >
              {convertTools.map((t) => (
                <DropdownItem key={t.slug} tool={t} onClick={closeAll} compact />
              ))}
            </MobileAccordion>

            <MobileAccordion
              label="All PDF Tools"
              expanded={mobileSection === "all"}
              onToggle={() => setMobileSection((s) => (s === "all" ? null : "all"))}
            >
              {categories.map((cat) => (
                <div key={cat} className="mt-2 first:mt-0">
                  <p
                    className="mb-1 px-2 text-[11px] font-bold uppercase"
                    style={{ color: "#9a9aa5", letterSpacing: "0.08em" }}
                  >
                    {shortCategory(cat)}
                  </p>
                  {tools
                    .filter((t) => t.category === cat)
                    .map((t) => (
                      <DropdownItem key={t.slug} tool={t} onClick={closeAll} compact />
                    ))}
                </div>
              ))}
            </MobileAccordion>
          </nav>
        </div>
      )}
    </header>
  );
}

function DropdownPanel({
  children,
  width,
  align = "left",
}: {
  children: React.ReactNode;
  width: number;
  align?: "left" | "right";
}) {
  return (
    <div
      className="absolute top-full z-50 mt-2 rounded-xl bg-white"
      style={{
        width,
        maxWidth: "calc(100vw - 32px)",
        [align]: 0,
        border: "1px solid #ececef",
        boxShadow: "0 20px 48px -16px rgba(20,20,43,0.18), 0 4px 12px -4px rgba(20,20,43,0.08)",
      } as React.CSSProperties}
      role="menu"
    >
      {children}
    </div>
  );
}

function DropdownItem({
  tool,
  onClick,
  compact,
}: {
  tool: (typeof tools)[number];
  onClick: () => void;
  compact?: boolean;
}) {
  const Icon = tool.icon;
  return (
    <li>
      <Link
        to="/tools/$slug"
        params={{ slug: tool.slug }}
        onClick={onClick}
        role="menuitem"
        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#f6f4f9]"
      >
        <Icon size={compact ? 24 : 28} />
        <span
          className="text-[13.5px] font-semibold"
          style={{ color: "#33333c" }}
        >
          {tool.name}
        </span>
      </Link>
    </li>
  );
}

function MobileAccordion({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
        style={{ color: "#33333c", letterSpacing: "0.04em" }}
      >
        {label}
        <ChevronDown
          className="h-4 w-4 transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>
      {expanded && <div className="mb-1 pl-2">{children}</div>}
    </div>
  );
}

function shortCategory(cat: ToolCategory): string {
  if (cat === "Organize PDF") return "Organize";
  if (cat === "Convert PDF") return "Convert";
  if (cat === "Edit PDF") return "Edit";
  return "Forms & Compare";
}
