import { Link } from "@tanstack/react-router";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="pdftoolconverteronline.com, home"
      className="inline-flex items-center gap-2.5 font-extrabold tracking-tight text-[26px] leading-none"
    >
      <LogoMark size={38} />

      <span className="inline-flex items-baseline gap-0.5">
        <span style={{ color: "#14142b" }}>FreePDF</span>
        <span style={{ color: "#e5322d" }}>Hub</span>
      </span>
    </Link>
  );
}

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="36" height="36" rx="8" fill="#E5322D" />
      <path d="M12 10 L22 10 L28 16 L28 30 L12 30 Z" fill="#ffffff" />
    </svg>
  );
}

