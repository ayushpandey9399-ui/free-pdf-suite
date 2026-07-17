import { Link } from "@tanstack/react-router";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="PDFfree — home"
      className="inline-flex items-center gap-1 font-extrabold tracking-tight text-[22px] leading-none"
    >
      <span style={{ color: "#14142b" }}>PDF</span>
      <span style={{ color: "#e5322d" }} aria-hidden>♥</span>
      <span
        className="rounded-md px-1.5 py-0.5 text-white shadow-[0_6px_18px_-6px_rgba(229,50,45,0.6)]"
        style={{
          backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)",
          fontSize: "18px",
        }}
      >
        free
      </span>
    </Link>
  );
}
