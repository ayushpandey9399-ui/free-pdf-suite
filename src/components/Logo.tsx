import { Link } from "@tanstack/react-router";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="FreePDFHub — home"
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
  const gid = "freepdfhub-logo-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff5a5f" />
          <stop offset="100%" stopColor="#e5322d" />
        </linearGradient>
      </defs>
      {/* Document body with folded top-right corner */}
      <path
        d="M8 4 h18 l8 8 v24 a2 2 0 0 1 -2 2 h-24 a2 2 0 0 1 -2 -2 v-30 a2 2 0 0 1 2 -2 z"
        fill={`url(#${gid})`}
      />
      {/* Folded corner highlight */}
      <path d="M26 4 v6 a2 2 0 0 0 2 2 h6 z" fill="rgba(255,255,255,0.28)" />
      {/* Heart in the center */}
      <path
        d="M20 30 l-6.2 -6.2 a3.9 3.9 0 0 1 5.5 -5.5 l0.7 0.7 l0.7 -0.7 a3.9 3.9 0 0 1 5.5 5.5 z"
        fill="#ffffff"
      />
    </svg>
  );
}
