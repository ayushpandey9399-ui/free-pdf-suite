import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { tools } from "@/tools/registry";
import { imageTools } from "@/lib/imageTools";
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
        // Build the sitemap from the SAME registries the site renders from,
        // so a newly added tool is picked up automatically and can never be
        // forgotten here. No hardcoded per-tool duplicate lists.
        const entries: SitemapEntry[] = [
          { path: "/", lastmod: LASTMOD, changefreq: "weekly", priority: "1.0" },

          ...tools.map((t) => ({
            path: `/tools/${t.slug}`,
            lastmod: LASTMOD,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),

          { path: "/image-tools", lastmod: LASTMOD, changefreq: "monthly", priority: "0.7" },
          ...imageTools.map((t) => ({
            path: `/image-tools/${t.slug}`,
            lastmod: LASTMOD,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),

          { path: "/about", lastmod: LASTMOD, changefreq: "yearly", priority: "0.5" },
          { path: "/contact", lastmod: LASTMOD, changefreq: "yearly", priority: "0.5" },
          { path: "/privacy-policy", lastmod: LASTMOD, changefreq: "yearly", priority: "0.3" },
          { path: "/terms", lastmod: LASTMOD, changefreq: "yearly", priority: "0.3" },
        ];

        // De-dupe defensively in case a slug ever appears in two registries.
        const seen = new Set<string>();
        const unique = entries.filter((e) => {
          if (seen.has(e.path)) return false;
          seen.add(e.path);
          return true;
        });

        const urls = unique.map((e) =>
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
            "Content-Type": "application/xml; charset=utf-8",
            // Short edge cache so newly added tools appear within an hour,
            // with SWR so crawlers never see a stale-blocking response.
            "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
