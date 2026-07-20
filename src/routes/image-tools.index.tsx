import { createFileRoute, Link } from "@tanstack/react-router";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL } from "@/lib/site";

const TITLE = "Free Image Tools, Convert HEIC, JPG, PNG | FreePDFHub";
const DESC =
  "Free browser-based image tools. Convert HEIC to JPG, and more coming soon. 100% client-side, no signup, no upload, your files stay on your device.";

export const Route = createFileRoute("/image-tools/")({
  head: () => {
    const url = `${SITE_URL}/image-tools`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/og-cover.png` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ImageToolsHub,
});

function ImageToolsHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-[#6B7280]">
        <ol className="flex items-center gap-[6px]">
          <li><Link to="/" className="hover:text-[#e5322d]">Home</Link></li>
          <li aria-hidden>›</li>
          <li aria-current="page" style={{ color: "#4B5563" }}>Image Tools</li>
        </ol>
      </nav>

      <header className="mt-6 text-center">
        <h1 className="text-[32px] sm:text-[44px] font-bold text-[#383E45]" style={{ letterSpacing: "-0.02em" }}>
          Free image tools, in your browser
        </h1>
        <p className="mx-auto mt-4 max-w-[640px] text-[15px] sm:text-[17px] text-[#6B7280]">
          Convert HEIC iPhone photos to JPG and more, without signup and without uploading a single byte. Everything runs client-side on your device.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {imageTools.map((t) =>
          t.status === "live" ? (
            <li key={t.slug}>
              <Link
                to="/image-tools/$slug"
                params={{ slug: t.slug }}
                className="block rounded-xl border border-[#ececef] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#e5322d] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                <div className="text-[17px] font-semibold text-[#1F2937]">{t.name}</div>
                <p className="mt-2 text-[13.5px] text-[#5a5a66]">{t.description}</p>
              </Link>
            </li>
          ) : (
            <li key={t.slug}>
              <div className="rounded-xl border border-[#ececef] bg-[#f9fafb] p-5 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-[17px] font-semibold text-[#1F2937]">{t.name}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#5a5a66]">
                    Coming soon
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] text-[#5a5a66]">{t.description}</p>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
