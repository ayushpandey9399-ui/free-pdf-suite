import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Gift,
  Zap,
  WifiOff,
  FileText,
  Lock,
  CloudOff,
  ArrowRight,
} from "lucide-react";

const BRAND = "#E5322D";
const INK = "#1F2937";
const MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BAND = "#FAFAF9";

export function HomeBottom() {
  return (
    <>
      <PrivacyStory />
      <WhyChoose />
      <HowItWorks />
      <SeoProse />
      <FinalCta />
    </>
  );
}

/* ─────────────── SECTION 1 ─────────────── */
function PrivacyStory() {
  return (
    <section style={{ backgroundColor: BAND }} className="py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-14 items-center">
          <div className="lg:col-span-3">
            <h2
              className="text-[24px] sm:text-[32px] font-bold leading-tight tracking-tight"
              style={{ color: INK, letterSpacing: "-0.02em" }}
            >
              Your files stay on your device
            </h2>
            <p
              className="mt-5 text-[16px]"
              style={{ color: MUTED, lineHeight: 1.7 }}
            >
              Every tool on this page processes your files in your browser. When
              you merge, compress, sign or redact a PDF here, the work happens
              on your own computer or phone — powered by the same technology
              that runs modern web apps.
            </p>
            <p
              className="mt-4 text-[16px]"
              style={{ color: MUTED, lineHeight: 1.7 }}
            >
              These tools have no upload step — your file opens directly in
              your browser and the processing happens right there. Nothing is
              transmitted, nothing is stored, and nobody — including us — sees
              your documents. Close the tab, and no trace of your file remains.
            </p>
            <p
              className="mt-4 text-[14px]"
              style={{ color: "#8b8b95", lineHeight: 1.7 }}
            >
              That's why PDFfree is safe even for your most sensitive documents
              — ID cards, bank statements, contracts and medical records.
            </p>
          </div>

          <div className="lg:col-span-2">
            <PrivacyIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyIllustration() {
  return (
    <div
      className="mx-auto max-w-[420px] rounded-xl bg-white"
      style={{
        border: `1px solid ${BORDER}`,
        padding: 32,
      }}
    >
      {/* Document with shield-check */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div
            className="flex h-24 w-20 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#F3F4F6", border: `1px solid ${BORDER}` }}
          >
            <FileText className="h-10 w-10" style={{ color: "#9CA3AF" }} strokeWidth={1.5} />
          </div>
          <div
            className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full"
            style={{
              backgroundColor: BRAND,
              boxShadow: "0 4px 10px -2px rgba(229,50,45,0.35)",
            }}
          >
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
        </div>

        {/* Flow */}
        <div className="mt-8 flex w-full items-center justify-between gap-2">
          <FlowNode label="Your device" />
          <div className="flex flex-1 flex-col items-center">
            <Lock className="h-4 w-4" style={{ color: BRAND }} strokeWidth={2.25} />
            <div
              className="mt-1 h-px w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #D1D5DB 50%, transparent 0%)",
                backgroundSize: "8px 1px",
                backgroundRepeat: "repeat-x",
              }}
            />
          </div>
          <FlowNode label="Your device" />
        </div>

        {/* Device-only label */}
        <div className="mt-6 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 animate-soft-pulse" style={{ color: BRAND }} strokeWidth={2.25} />
          <span className="text-[13px]" style={{ color: MUTED }}>
            Processed on your device
          </span>
        </div>
      </div>
    </div>
  );
}

function FlowNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="h-10 w-10 rounded-md"
        style={{
          backgroundColor: "#F3F4F6",
          border: `1px solid ${BORDER}`,
        }}
      />
      <span className="mt-2 text-[11px] font-medium" style={{ color: MUTED }}>
        {label}
      </span>
    </div>
  );
}

/* ─────────────── SECTION 2 ─────────────── */
const REASONS = [
  {
    icon: ShieldCheck,
    title: "100% private",
    body:
      "Files are processed in your browser and never uploaded anywhere. Your documents stay yours.",
  },
  {
    icon: Gift,
    title: "Completely free",
    body:
      "All 28 tools with no signup, no watermarks, no daily limits and no premium wall.",
  },
  {
    icon: Zap,
    title: "Fast on any device",
    body:
      "No upload queues, no waiting. Everything runs instantly on your phone, tablet or computer.",
  },
  {
    icon: WifiOff,
    title: "Works even offline",
    body:
      "Once a tool page has loaded, it keeps working without an internet connection.",
  },
];

function WhyChoose() {
  return (
    <section className="py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <h2
          className="text-center text-[24px] sm:text-[32px] font-bold"
          style={{ color: INK }}
        >
          Why people choose PDFfree
        </h2>
        <p
          className="mx-auto mt-3 max-w-[640px] text-center text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7 }}
        >
          No tricks, no accounts, no fine print — just tools that work.
        </p>

        <div className="mt-12 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl bg-white p-7 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                border: `1px solid ${BORDER}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#D1D5DB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER;
              }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(229,50,45,0.08)" }}
              >
                <Icon className="h-6 w-6" style={{ color: BRAND }} strokeWidth={2} />
              </div>
              <h3
                className="mt-5 text-[17px] font-semibold"
                style={{ color: INK }}
              >
                {title}
              </h3>
              <p
                className="mt-2 text-[14px]"
                style={{ color: MUTED, lineHeight: 1.6 }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── SECTION 3 ─────────────── */
const STEPS = [
  {
    n: 1,
    title: "Pick a tool",
    body:
      "Choose any of the 28 tools above — from merging and compressing to signing and redacting.",
  },
  {
    n: 2,
    title: "Add your file",
    body:
      "Drag and drop or tap to select. The file opens right in your browser and stays on your device.",
  },
  {
    n: 3,
    title: "Download the result",
    body:
      "Get your finished PDF instantly — clean output, no watermark, no signup screen.",
  },
];

function HowItWorks() {
  return (
    <section style={{ backgroundColor: BAND }} className="py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <h2
          className="text-center text-[24px] sm:text-[32px] font-bold"
          style={{ color: INK }}
        >
          Three steps. That's the whole process.
        </h2>

        <div className="relative mt-14">
          {/* Dashed connector, desktop only */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16%] right-[16%] top-[22px] hidden lg:block"
            style={{
              height: 1,
              backgroundImage:
                "linear-gradient(to right, #D1D5DB 50%, transparent 0%)",
              backgroundSize: "10px 1px",
              backgroundRepeat: "repeat-x",
            }}
          />
          <div className="relative grid gap-10 lg:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white text-[16px] font-semibold"
                  style={{
                    backgroundColor: BRAND,
                    boxShadow: "0 4px 12px -4px rgba(229,50,45,0.35)",
                  }}
                >
                  {s.n}
                </div>
                <h3
                  className="mt-5 text-[17px] font-semibold"
                  style={{ color: INK }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-2 max-w-[280px] text-[14px]"
                  style={{ color: MUTED, lineHeight: 1.6 }}
                >
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── SECTION 4 ─────────────── */
function SeoLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link
      to="/tools/$slug"
      params={{ slug }}
      className="underline decoration-[#F3B4B2] decoration-2 underline-offset-4 transition-colors hover:text-[#E5322D]"
      style={{ color: INK }}
    >
      {children}
    </Link>
  );
}

function SeoProse() {
  return (
    <section className="py-14 sm:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <h2
          className="text-center text-[24px] sm:text-[32px] font-bold"
          style={{ color: INK }}
        >
          One toolkit for every PDF task
        </h2>
        <div
          className="mx-auto mt-8 max-w-[760px] text-left text-[16px]"
          style={{ color: MUTED, lineHeight: 1.7 }}
        >
          <p>
            Organize documents by{" "}
            <SeoLink slug="merge">merging</SeoLink>, splitting, extracting,
            reordering or deleting pages. Convert{" "}
            <SeoLink slug="images-to-pdf">images to PDF</SeoLink> and PDF pages
            to images, pull the text out of any document, or turn plain text
            files into clean PDFs. Edit and annotate,{" "}
            <SeoLink slug="fill-forms">fill out forms</SeoLink>, add page
            numbers, headers and watermarks — all without installing anything.
          </p>
          <p className="mt-5">
            When documents get sensitive,{" "}
            <SeoLink slug="protect-pdf">protect them with a password</SeoLink>,{" "}
            <SeoLink slug="redact-pdf">redact private information</SeoLink>{" "}
            permanently, or remove hidden metadata before sharing. Every one of
            these free PDF tools runs in your browser, so the fastest way to
            finish a PDF task is also the most private one.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── SECTION 5 ─────────────── */
function FinalCta() {
  const scrollToTools = () => {
    const el = document.getElementById("tools");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <section style={{ backgroundColor: BAND }} className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 text-center">
        <h2
          className="text-[24px] sm:text-[32px] font-bold"
          style={{ color: INK }}
        >
          All 28 tools. All free. All private.
        </h2>
        <p className="mt-3 text-[16px]" style={{ color: MUTED }}>
          Every tool processes your file in your browser — start with any one.
        </p>
        <button
          type="button"
          onClick={scrollToTools}
          className="mt-8 inline-flex items-center gap-2 rounded-lg text-white text-[15px] font-semibold transition-colors"
          style={{
            backgroundColor: BRAND,
            padding: "14px 32px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c9241f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND;
          }}
        >
          Browse all tools
          <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </section>
  );
}
