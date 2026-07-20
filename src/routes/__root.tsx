import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { CookieBanner } from "../components/CookieBanner";
import { Toaster } from "../components/ui/sonner";
import { PwaRegister } from "../components/pwa/PwaRegister";
import { InstallPrompt } from "../components/pwa/InstallPrompt";

function NotFoundComponent() {
  useEffect(() => {
    const prevStatus = document.querySelector<HTMLMetaElement>('meta[name="prerender-status-code"]');
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-notfound", "true");
    document.head.appendChild(meta);
    const status = document.createElement("meta");
    status.name = "prerender-status-code";
    status.content = "404";
    status.setAttribute("data-notfound", "true");
    if (!prevStatus) document.head.appendChild(status);
    return () => {
      document.querySelectorAll('meta[data-notfound="true"]').forEach((el) => el.remove());
    };
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Back to home
          </Link>
          <Link
            to="/"
            hash="tools"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            All tools
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FreePDFHub | Every PDF tool, 100% free" },
      {
        name: "description",
        content:
          "Free PDF tools that run in your browser. Merge, split, convert, compress, edit, and organize PDFs, no signup, no upload step, no limits.",
      },
      { property: "og:title", content: "FreePDFHub | Every PDF tool, 100% free" },
      {
        property: "og:description",
        content: "Free PDF tools that run in your browser. Merge, split, convert, compress, edit, and organize PDFs, no signup, no upload step, no limits.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FreePDFHub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "FreePDFHub | Every PDF tool, 100% free" },
      { name: "twitter:description", content: "Free PDF tools that run in your browser. Merge, split, convert, compress, edit, and organize PDFs, no signup, no upload step, no limits." },
      { name: "google-site-verification", content: "Hvu09ArzP_NwJvEh6EiU9tR2F6u9cHMtjMKCmNrQvoY" },
      { name: "theme-color", content: "#e5322d" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "FreePDFHub" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon-180.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CookieBanner />
      <Toaster richColors position="top-center" />
      <PwaRegister />
      <InstallPrompt />
    </QueryClientProvider>
  );
}
