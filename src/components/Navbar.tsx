import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { tools, categories, type ToolCategory } from "@/tools/registry";

const NAV_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.02em",
  color: "#1F2937",
} as const;

const NAV_LINK_CLASS =
  "uppercase transition-colors duration-150 hover:text-[#e5322d]";

const convertTools = tools.filter((t) => t.category === "Convert PDF");

type DropdownKey = "convert" | "all" | null;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<DropdownKey>(null);
  const [mobileSection, setMobileSection] = useState<DropdownKey>(null);
  const [scrolled, setScrolled] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openDropdown = (k: DropdownKey) => {
    cancelClose();
    setDropdown(k);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setDropdown(null), 180);
  };

  useEffect(() => () => cancelClose(), []);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = () => {
    cancelClose();
    setDropdown(null);
    setOpen(false);
    setMobileSection(null);
  };


  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background transition-shadow duration-150"
      style={{
        borderColor: "#ececef",
        boxShadow: scrolled ? "0 2px 8px -4px rgba(20,20,43,0.08)" : "none",
      }}
    >
      <div
        ref={wrapRef}
        className="mx-auto flex max-w-[1200px] items-center justify-between px-4 sm:px-6"
        style={{ height: 64 }}
      >
        <div className="flex items-center gap-10">
          <Logo />
          <nav aria-label="Primary" className="hidden min-[920px]:flex items-center gap-8">
            <Link
              to="/tools/$slug"
              params={{ slug: "merge" }}
              className={NAV_LINK_CLASS}
              style={NAV_STYLE}
            >
              Merge PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "split" }}
              className={NAV_LINK_CLASS}
              style={NAV_STYLE}
            >
              Split PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "compress" }}
              className={NAV_LINK_CLASS}
              style={NAV_STYLE}
            >
              Compress PDF
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "sign-pdf" }}
              className={NAV_LINK_CLASS}
              style={NAV_STYLE}
            >
              Sign PDF
            </Link>
            <Link
              to="/image-tools"
              className={NAV_LINK_CLASS}
              style={NAV_STYLE}
            >
              Image Tools
            </Link>



            {/* Convert PDF dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("convert")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={dropdown === "convert"}
                onClick={() => setDropdown((d) => (d === "convert" ? null : "convert"))}
                className={`inline-flex items-center gap-1 ${NAV_LINK_CLASS}`}
                style={NAV_STYLE}
              >
                Convert PDF
                <ChevronDown className="h-3 w-3 relative top-px" strokeWidth={2.5} />
              </button>
              {dropdown === "convert" && (
                <DropdownPanel
                  width={280}
                  className="hidden min-[920px]:block"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
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
              onMouseEnter={() => openDropdown("all")}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={dropdown === "all"}
                onClick={() => setDropdown((d) => (d === "all" ? null : "all"))}
                className={`inline-flex items-center gap-1 ${NAV_LINK_CLASS}`}
                style={NAV_STYLE}
              >
                All PDF Tools
                <ChevronDown className="h-3 w-3 relative top-px" strokeWidth={2.5} />
              </button>
              {dropdown === "all" && (
                <DropdownPanel
                  width={720}
                  align="right"
                  className="hidden min-[920px]:block"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
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
          className="min-[920px]:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#f6f4f9]"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>


      {open && (
        <div
          className="min-[920px]:hidden border-t bg-white px-4 py-4"
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
            <Link
              to="/image-tools"
              onClick={closeAll}
              className="rounded-lg px-3 py-3 text-[14px] font-bold uppercase hover:bg-[#f6f4f9]"
              style={{ color: "#33333c", letterSpacing: "0.04em" }}
            >
              Image Tools

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
  className,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  width: number;
  align?: "left" | "right";
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      className={cn("absolute top-full z-50 pt-2", className)}
      style={{ [align]: 0 } as React.CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className="rounded-xl bg-white"
        style={{
          width,
          maxWidth: "calc(100vw - 32px)",
          border: "1px solid #ececef",
          boxShadow:
            "0 20px 48px -16px rgba(20,20,43,0.18), 0 4px 12px -4px rgba(20,20,43,0.08)",
        }}
        role="menu"
      >
        {children}
      </div>
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
        className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-[#F9FAFB]"
      >
        <Icon size={compact ? 22 : 26} />
        <span
          className="text-[14px] font-semibold"
          style={{ color: "#1F2937" }}
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
  if (cat === "Security") return "Security";
  return "Forms & Compare";
}
