import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/offline")({
  component: OfflinePage,
  head: () => ({
    meta: [
      { title: "Offline | FreePDFHub" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content:
          "You are offline. Tools you have already opened still work, your files never needed the internet anyway.",
      },
    ],
  }),
});

function OfflinePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div
        aria-hidden
        className="mb-8 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "linear-gradient(135deg, #ff5a5f, #e5322d)" }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-[#14142b] sm:text-4xl">
        You are offline
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-[#4b5563]">
        Tools you have already opened still work, your files never needed the internet anyway.
        Reconnect to load any tool you have not visited yet.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center rounded-md bg-[#e5322d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c8271f]"
        >
          Back to home
        </Link>
        <button
          type="button"
          onClick={() => (typeof window !== "undefined" ? window.location.reload() : undefined)}
          className="inline-flex items-center rounded-md border border-[#e5e7eb] bg-white px-5 py-2.5 text-sm font-semibold text-[#14142b] transition hover:bg-[#f9fafb]"
        >
          Try again
        </button>
      </div>
    </section>
  );
}
