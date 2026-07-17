import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Play,
  Star,
  Cloud,
  Lock,
  Zap,
  Smartphone,
  Gift,
  FileText,
  FileImage as FileImageIcon,
  Receipt,
} from "lucide-react";
import { tools, categories, type ToolCategory } from "@/tools/registry";

export const Route = createFileRoute("/")({
  component: Home,
});

const RED_GRADIENT = "linear-gradient(135deg, #ff5a5f, #e5322d)";

const categoryGradient: Record<ToolCategory, string> = {
  "Organize PDF": "linear-gradient(135deg, #ff5a5f, #e5322d)",
  "Convert PDF": "linear-gradient(135deg, #ffb057, #f28c1e)",
  "Edit PDF": "linear-gradient(135deg, #8a7bff, #6d5efc)",
  "Forms & Compare": "linear-gradient(135deg, #4fd18b, #1f9d55)",
};

function Home() {
  return (
    <div style={{ backgroundColor: "#ffffff", color: "#14142b" }}>
      <Hero />
      <LogoStrip />
      <ToolsSection />
      <FeaturesBand />
      <HowItWorks />
      <StatsBanner />
      <Testimonials />
      <FinalCTA />
      <FloatKeyframes />
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft radial gradient background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 90% 0%, #fff1ec 0%, transparent 60%), radial-gradient(50% 60% at 5% 0%, #f1ecff 0%, transparent 60%), #ffffff",
        }}
      />
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 sm:py-24 grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left */}
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border bg-white/70 backdrop-blur px-3.5 py-1.5 text-[13px] font-semibold"
            style={{ borderColor: "#eceaf0", color: "#14142b" }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-[#1f9d55] shadow-[0_0_0_3px_rgba(31,157,85,0.18)]" />
            Trusted by 2M+ users worldwide
          </span>

          <h1
            className="mt-6 font-bold tracking-tight text-[42px] sm:text-[54px] leading-[1.05]"
            style={{ color: "#14142b", letterSpacing: "-0.02em" }}
          >
            Every PDF tool you need.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: RED_GRADIENT }}
            >
              100% free,
            </span>{" "}
            forever.
          </h1>

          <p className="mt-5 text-[17px] leading-relaxed max-w-[560px]" style={{ color: "#6b6b7b" }}>
            Merge, split, convert, compress and edit PDFs in seconds — right in your browser. No
            sign-up, no limits, and your files never leave your device.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#tools"
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                backgroundImage: RED_GRADIENT,
                boxShadow: "0 14px 32px -12px rgba(229,50,45,0.55)",
              }}
            >
              Explore All Tools
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border bg-white px-6 py-3.5 text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(20,20,43,0.18)]"
              style={{ borderColor: "#eceaf0", color: "#14142b" }}
            >
              <Play className="h-4 w-4 fill-current" />
              See how it works
            </a>
          </div>

          {/* Trust row */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {["#ff5a5f", "#ffb057", "#8a7bff", "#4fd18b", "#14142b"].map((c, i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-white"
                  style={{ background: c }}
                  aria-hidden
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />
                ))}
              </div>
              <p className="text-[13px] font-medium" style={{ color: "#6b6b7b" }}>
                Loved by <span className="font-bold text-[#14142b]">2M+ happy users</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right — mockup */}
        <HeroMockup />
      </div>
    </section>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] aspect-[5/5] sm:aspect-[6/5]">
      {/* Glow */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[36px] blur-2xl opacity-60 -z-10"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,90,95,0.25), transparent 70%)",
        }}
      />

      {/* Main panel */}
      <div
        className="absolute inset-0 rounded-[24px] bg-white p-8 sm:p-10 flex flex-col items-center justify-center text-center"
        style={{
          border: "1px solid #eceaf0",
          boxShadow: "0 30px 80px -30px rgba(20,20,43,0.25)",
        }}
      >
        <div
          className="rounded-[20px] w-full h-full flex flex-col items-center justify-center gap-4 p-6"
          style={{
            border: "2px dashed #f0c9c7",
            backgroundColor: "#fff6f5",
          }}
        >
          <div
            className="grid h-16 w-16 place-items-center rounded-[16px] text-white"
            style={{
              backgroundImage: RED_GRADIENT,
              boxShadow: "0 14px 28px -10px rgba(229,50,45,0.5)",
            }}
          >
            <Cloud className="h-8 w-8" />
          </div>
          <div>
            <p className="text-[17px] font-bold" style={{ color: "#14142b" }}>
              Drop your PDF here
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "#6b6b7b" }}>
              or click to browse — up to 100MB
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              backgroundImage: RED_GRADIENT,
              boxShadow: "0 10px 24px -8px rgba(229,50,45,0.55)",
            }}
          >
            Select PDF file
          </button>
        </div>
      </div>

      {/* Floating file cards */}
      <FloatingCard
        className="absolute -top-5 -left-4 sm:-left-10"
        rotate={-8}
        delay="0s"
        icon={<FileText className="h-5 w-5" />}
        iconBg="#fdeceb"
        iconFg="#e5322d"
        title="Report_2026.pdf"
        subtitle="2.4 MB"
      />
      <FloatingCard
        className="absolute top-6 -right-4 sm:-right-8"
        rotate={7}
        delay="0.6s"
        icon={<FileImageIcon className="h-5 w-5" />}
        iconBg="#fff3e6"
        iconFg="#f28c1e"
        title="Scan_page.jpg"
        subtitle="1.1 MB"
      />
      <FloatingCard
        className="absolute -bottom-4 right-8 sm:right-16"
        rotate={-5}
        delay="1.2s"
        icon={<Receipt className="h-5 w-5" />}
        iconBg="#eef1fd"
        iconFg="#6d5efc"
        title="Invoice.pdf"
        subtitle="380 KB"
      />

      {/* Privacy badge */}
      <div
        className="absolute -bottom-6 -left-2 sm:-left-6 rounded-2xl bg-white px-4 py-3 flex items-center gap-2.5"
        style={{
          border: "1px solid #eceaf0",
          boxShadow: "0 20px 40px -15px rgba(20,20,43,0.2)",
          animation: "floaty 6s ease-in-out infinite",
          animationDelay: "0.3s",
        }}
      >
        <div
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: "#eafaf0", color: "#1f9d55" }}
        >
          <Lock className="h-4 w-4" />
        </div>
        <div className="text-left">
          <p className="text-[13px] font-bold" style={{ color: "#14142b" }}>
            100% Private
          </p>
          <p className="text-[11px]" style={{ color: "#6b6b7b" }}>
            Processed on your device
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatingCard({
  className,
  rotate,
  delay,
  icon,
  iconBg,
  iconFg,
  title,
  subtitle,
}: {
  className?: string;
  rotate: number;
  delay: string;
  icon: React.ReactNode;
  iconBg: string;
  iconFg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={className}
      style={{
        transform: `rotate(${rotate}deg)`,
        animation: "floaty 5.5s ease-in-out infinite",
        animationDelay: delay,
      }}
    >
      <div
        className="flex items-center gap-3 rounded-xl bg-white px-3.5 py-3"
        style={{
          border: "1px solid #eceaf0",
          boxShadow: "0 16px 36px -14px rgba(20,20,43,0.22)",
        }}
      >
        <div
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ backgroundColor: iconBg, color: iconFg }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-bold leading-tight" style={{ color: "#14142b" }}>
            {title}
          </p>
          <p className="text-[11px]" style={{ color: "#6b6b7b" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function FloatKeyframes() {
  return (
    <style>{`
      @keyframes floaty {
        0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
        50% { transform: translateY(-10px) rotate(var(--r, 0deg)); }
      }
      @media (prefers-reduced-motion: reduce) {
        [style*="floaty"] { animation: none !important; }
      }
    `}</style>
  );
}

/* ---------------- Logo strip ---------------- */

function LogoStrip() {
  const brands = ["Acme", "Northwind", "Globex", "Initech", "Umbrella"];
  return (
    <section style={{ backgroundColor: "#fff6f5" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12 text-center">
        <p
          className="text-xs font-bold tracking-[0.18em]"
          style={{ color: "#a4778c" }}
        >
          POWERING TEAMS AT
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {brands.map((b) => (
            <span
              key={b}
              className="text-[22px] font-extrabold tracking-tight opacity-50"
              style={{ color: "#6b6b7b", fontFamily: "ui-serif, Georgia, serif" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Tools ---------------- */

function ToolsSection() {
  return (
    <section id="tools" className="mx-auto max-w-[1200px] px-4 sm:px-6 py-20">
      <SectionHeader
        kicker="ALL-IN-ONE TOOLKIT"
        title="Everything you need to work with PDFs"
        subtitle="A complete PDF toolkit — organize, convert, edit, and compare — with zero friction."
      />
      <div className="mt-14 space-y-12">
        {categories.map((cat) => {
          const items = tools.filter((t) => t.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat}>
              <h3
                className="text-[12px] font-bold tracking-[0.14em] mb-5"
                style={{ color: "#8b8ba7" }}
              >
                {cat.toUpperCase()}
              </h3>
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.slug}
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="group relative block rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5322d]/40"
                      style={{
                        border: "1px solid #eceaf0",
                        boxShadow: "0 4px 14px -8px rgba(20,20,43,0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 20px 48px -16px rgba(20,20,43,0.18)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 14px -8px rgba(20,20,43,0.08)";
                      }}
                    >
                      <div
                        className="grid h-[50px] w-[50px] place-items-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          backgroundImage: categoryGradient[cat],
                          boxShadow: "0 10px 22px -10px rgba(20,20,43,0.35)",
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h4
                        className="mt-5 font-bold text-[16px] leading-snug"
                        style={{ color: "#14142b" }}
                      >
                        {t.name}
                      </h4>
                      <p
                        className="mt-1.5 text-[13.5px] leading-relaxed"
                        style={{ color: "#6b6b7b" }}
                      >
                        {t.description}
                      </p>
                      <span
                        className="absolute right-5 bottom-5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                        style={{ color: "#e5322d" }}
                        aria-hidden
                      >
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Features ---------------- */

function FeaturesBand() {
  const features = [
    {
      Icon: Zap,
      title: "Lightning fast",
      desc: "Files process instantly in your browser — no waiting in upload queues.",
    },
    {
      Icon: Lock,
      title: "100% private",
      desc: "Your documents never leave your device. Nothing is uploaded to a server.",
    },
    {
      Icon: Gift,
      title: "Free forever",
      desc: "Every tool, unlimited use, no watermarks and no hidden paywalls.",
    },
    {
      Icon: Smartphone,
      title: "Works everywhere",
      desc: "Any device, any browser — desktop, tablet or phone. No install needed.",
    },
  ];
  return (
    <section id="why" style={{ backgroundColor: "#fff6f5" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-20">
        <SectionHeader
          kicker="WHY PDFFREE"
          title="Premium tools, zero cost"
          subtitle="The polish and performance of paid software — without the price tag or the sign-up wall."
        />
        <div className="mt-14 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-white p-6 transition-all duration-300 hover:-translate-y-1.5"
              style={{
                border: "1px solid #eceaf0",
                boxShadow: "0 10px 30px -18px rgba(20,20,43,0.15)",
              }}
            >
              <div
                className="grid h-[50px] w-[50px] place-items-center rounded-xl text-white"
                style={{
                  backgroundImage: RED_GRADIENT,
                  boxShadow: "0 10px 22px -10px rgba(229,50,45,0.5)",
                }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h4 className="mt-5 font-bold text-[17px]" style={{ color: "#14142b" }}>
                {title}
              </h4>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "#6b6b7b" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */

function HowItWorks() {
  const steps = [
    { n: 1, title: "Choose a tool", desc: "Pick from 14 powerful PDF tools built for every job." },
    { n: 2, title: "Drop your file", desc: "Add your PDF or image — it stays on your device." },
    { n: 3, title: "Download result", desc: "Get your processed file instantly, no wait, no cost." },
  ];
  return (
    <section id="how" className="mx-auto max-w-[1200px] px-4 sm:px-6 py-20">
      <SectionHeader
        kicker="DEAD SIMPLE"
        title="Get it done in 3 steps"
        subtitle="No accounts, no learning curve. Just open, drop, and download."
      />
      <div className="mt-14 grid gap-8 grid-cols-1 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="text-center">
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-full text-[22px] font-bold"
              style={{
                border: "2px solid #e5322d",
                color: "#e5322d",
                backgroundColor: "#fff6f5",
              }}
            >
              {s.n}
            </div>
            <h4 className="mt-5 font-bold text-[18px]" style={{ color: "#14142b" }}>
              {s.title}
            </h4>
            <p
              className="mt-2 text-[14px] leading-relaxed max-w-[280px] mx-auto"
              style={{ color: "#6b6b7b" }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */

function StatsBanner() {
  const stats = [
    { n: "2M+", label: "Happy users" },
    { n: "50M+", label: "Files processed" },
    { n: "14", label: "Powerful tools" },
    { n: "100%", label: "Free, no limits" },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
      <div
        className="rounded-[24px] px-6 py-14 sm:px-14"
        style={{
          backgroundImage: "linear-gradient(135deg, #1b1b3a, #2d1e4f)",
          boxShadow: "0 30px 80px -30px rgba(27,27,58,0.55)",
        }}
      >
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                className="bg-clip-text text-transparent font-bold tracking-tight text-[40px] sm:text-[52px] leading-none"
                style={{ backgroundImage: "linear-gradient(135deg, #ff8a8f, #ffd0c2)" }}
              >
                {s.n}
              </div>
              <p className="mt-2 text-[13px] font-medium" style={{ color: "#c9c6df" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

function Testimonials() {
  const items = [
    {
      quote:
        "PDFfree replaced three paid tools for me. It's fast, private, and I never worry about upload limits.",
      name: "Ananya S.",
      role: "Product Designer",
      color: "#ff5a5f",
    },
    {
      quote:
        "I merge and split invoices every day. This does it in seconds — right in the browser. Brilliant.",
      name: "Rahul M.",
      role: "Accountant",
      color: "#6d5efc",
    },
    {
      quote:
        "Client documents never leave my laptop. That alone makes PDFfree indispensable for my practice.",
      name: "Meera K.",
      role: "Lawyer",
      color: "#1f9d55",
    },
  ];
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-20">
      <SectionHeader
        kicker="LOVED WORLDWIDE"
        title="What people are saying"
        subtitle="Real people using PDFfree every day — from designers to lawyers."
      />
      <div className="mt-14 grid gap-6 grid-cols-1 md:grid-cols-3">
        {items.map((t) => (
          <div
            key={t.name}
            className="rounded-2xl bg-white p-7 flex flex-col"
            style={{
              border: "1px solid #eceaf0",
              boxShadow: "0 10px 30px -18px rgba(20,20,43,0.15)",
            }}
          >
            <div className="flex gap-0.5" aria-label="5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />
              ))}
            </div>
            <p
              className="mt-4 text-[15px] leading-relaxed flex-1"
              style={{ color: "#14142b" }}
            >
              “{t.quote}”
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div
                className="grid h-11 w-11 place-items-center rounded-full text-white font-bold"
                style={{ backgroundColor: t.color }}
                aria-hidden
              >
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-[14px] font-bold" style={{ color: "#14142b" }}>
                  {t.name}
                </p>
                <p className="text-[12.5px]" style={{ color: "#6b6b7b" }}>
                  {t.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */

function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-20">
      <div
        className="relative overflow-hidden rounded-[24px] px-6 py-16 sm:px-14 text-center text-white"
        style={{
          backgroundImage: RED_GRADIENT,
          boxShadow: "0 30px 80px -25px rgba(229,50,45,0.55)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(60% 80% at 20% 20%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(50% 70% at 90% 90%, rgba(255,255,255,0.25), transparent 60%)",
          }}
        />
        <div className="relative">
          <h2
            className="font-bold tracking-tight text-[34px] sm:text-[46px] leading-[1.1]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ready to work smarter with PDFs?
          </h2>
          <p className="mt-4 text-[16px] sm:text-[18px] opacity-95 max-w-[620px] mx-auto">
            Join 2 million people using PDFfree every day — completely free.
          </p>
          <a
            href="#tools"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-[15px] font-bold transition-all hover:-translate-y-0.5"
            style={{
              color: "#e5322d",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.25)",
            }}
          >
            Start using PDFfree
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Shared ---------------- */

function SectionHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-[720px] mx-auto">
      <p
        className="text-[12px] font-bold tracking-[0.18em]"
        style={{ color: "#e5322d" }}
      >
        {kicker}
      </p>
      <h2
        className="mt-3 font-bold tracking-tight text-[32px] sm:text-[42px] leading-[1.1]"
        style={{ color: "#14142b", letterSpacing: "-0.02em" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "#6b6b7b" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
