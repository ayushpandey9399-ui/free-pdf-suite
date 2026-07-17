import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t" style={{ backgroundColor: "#fbfbfd", borderColor: "#ececef" }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo />
        <p
          className="text-[13.5px] text-center md:text-left"
          style={{ color: "#7a7a86" }}
        >
          No file size limits · No signup required · Files never uploaded · 100% free, forever.
        </p>
      </div>
      <div className="border-t" style={{ borderColor: "#ececef" }}>
        <p
          className="mx-auto max-w-[1200px] px-4 sm:px-6 py-5 text-center text-[12.5px]"
          style={{ color: "#7a7a86" }}
        >
          © PDFfree 2026 — Every PDF tool you need, 100% free.
        </p>
      </div>
    </footer>
  );
}
