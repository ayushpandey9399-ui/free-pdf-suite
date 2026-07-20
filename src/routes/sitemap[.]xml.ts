import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { tools } from "@/tools/registry";
import { SITE_URL, LAST_UPDATED } from "@/lib/site";

const BASE_URL = SITE_URL;

// Convert human-readable LAST_UPDATED ("July 18, 2026") to ISO date (YYYY-MM-DD)
// for sitemap <lastmod>. Falls back to the literal string if parsing fails.
function toIsoDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toISOString().slice(0, 10);
}
const LASTMOD = toIsoDate(LAST_UPDATED);

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", lastmod: LASTMOD, changefreq: "weekly", priority: "1.0" },
          ...tools.map((t) => ({
            path: `/tools/${t.slug}`,
            lastmod: LASTMOD,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          { path: "/image-tools", lastmod: LASTMOD, changefreq: "monthly", priority: "0.7" },
          { path: "/image-tools/heic-to-jpg", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/heic-to-png", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/jpg-to-png", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/png-to-jpg", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/webp-to-jpg", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/webp-to-png", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/compress-image", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/image-resize", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/jpg-to-webp", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },
          { path: "/image-tools/png-to-webp", lastmod: LASTMOD, changefreq: "monthly", priority: "0.8" },

          { path: "/about", lastmod: LASTMOD, changefreq: "yearly", priority: "0.5" },

          { path: "/contact", lastmod: LASTMOD, changefreq: "yearly", priority: "0.5" },
          { path: "/privacy-policy", lastmod: LASTMOD, changefreq: "yearly", priority: "0.3" },
          { path: "/terms", lastmod: LASTMOD, changefreq: "yearly", priority: "0.3" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

