import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { Logo } from "./Logo";
import { tools } from "@/tools/registry";

export function Footer() {
  const socials = [
    { Icon: Facebook, label: "Facebook", href: "#" },
    { Icon: Twitter, label: "Twitter", href: "#" },
    { Icon: Linkedin, label: "LinkedIn", href: "#" },
    { Icon: Github, label: "GitHub", href: "#" },
  ];

  const organize = tools.filter((t) => t.category === "Organize PDF").slice(0, 6);
  const convert = tools.filter((t) => t.category === "Convert PDF");

  const company = [
    { label: "About", href: "#" },
    { label: "Why PDFfree", href: "#why" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <footer className="mt-24 text-white" style={{ backgroundColor: "#0f0f22" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 grid gap-10 md:grid-cols-4">
        <div>
          <div className="[&_a>span>span:first-child]:text-white">
            <Logo />
          </div>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "#a5a5c0" }}>
            Every PDF tool you need, 100% free — right in your browser. No signup, no uploads, no
            limits.
          </p>
        </div>

        <FooterCol title="Organize">
          {organize.map((t) => (
            <FooterLink key={t.slug} to="/tools/$slug" params={{ slug: t.slug }}>
              {t.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Convert">
          {convert.map((t) => (
            <FooterLink key={t.slug} to="/tools/$slug" params={{ slug: t.slug }}>
              {t.name}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Company">
          {company.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                className="text-sm transition-colors hover:text-white"
                style={{ color: "#a5a5c0" }}
              >
                {c.label}
              </a>
            </li>
          ))}
        </FooterCol>
      </div>

      <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "#8b8ba7" }}>
            © PDFfree 2026 — Every PDF tool you need, 100% free.
          </p>
          <div className="flex gap-2">
            {socials.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all overflow-hidden"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#a5a5c0" }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)" }}
                />
                <Icon className="relative h-4 w-4 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold tracking-[0.14em] mb-4" style={{ color: "#ffffff" }}>
        {title.toUpperCase()}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({
  to,
  params,
  children,
}: {
  to: string;
  params?: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        to={to as any}
        params={params as any}
        className="text-sm transition-colors hover:text-white"
        style={{ color: "#a5a5c0" }}
      >
        {children}
      </Link>
    </li>
  );
}
