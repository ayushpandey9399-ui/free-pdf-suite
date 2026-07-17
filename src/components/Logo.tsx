import { Link } from "@tanstack/react-router";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="PDFfree — home"
      className="inline-flex items-center gap-1 font-extrabold tracking-tight text-[22px] leading-none"
    >
      <span style={{ color: "#33333c" }}>PDF</span>
      <span style={{ color: "#e5322d" }} aria-hidden>♥</span>
      <span
        className="rounded-md px-1.5 py-0.5 text-white"
        style={{ backgroundColor: "#e5322d", fontSize: "18px" }}
      >
        free
      </span>
    </Link>
  );
}
