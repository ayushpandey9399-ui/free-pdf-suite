import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { tools } from "@/tools/registry";
import { imageTools } from "@/lib/imageTools";
import { SITE_URL, LAST_UPDATED } from "@/lib/site";

const BASE_URL = SITE_URL;

// Specific dates provided by the user for indexing status
const CUSTOM_DATES: Record<string, string> = {
  "/privacy-policy": "2026-08-18",
  "/tools/edit-pdf": "2026-08-18",
  "/tools/scan-to-pdf": "2026-08-18",
  "/image-tools/png-to-webp": "2026-08-18",
  "/image-tools/jpg-to-png": "2026-08-18",
  "/tools/header-footer": "2026-08-18",
  "/tools/images-to-pdf": "2026-08-18",
  "/image-tools/rotate-image": "2026-08-18",
  "/tools/pdf-to-text": "2026-08-18",
  "/about": "2026-08-18",
  "/tools/fill-forms": "2026-08-18",
  "/tools/compress": "2026-08-18",
  "/tools/extract-images": "2026-08-18",
  "/tools/pdf-to-images": "2026-08-18",
  "/tools/page-numbers": "2026-08-18",
  "/image-tools/photo-editor": "2026-08-18",
  "/tools/extract-pages": "2026-08-18",
  "/tools/watermark": "2026-08-18",
  "/image-tools/heic-to-jpg": "2026-08-18",
  "/image-tools": "2026-08-18",
  "/tools/split": "2026-08-18",
  "/tools/merge": "2026-08-17",
  "/": "2026-08-17",
  "/tools/add-blank-pages": "2026-08-17",
};

function toIsoDate(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toISOString().slice(0, 10);
}
const DEFAULT_LASTMOD = toIsoDate(LAST_UPDATED);

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
          { path: "/", lastmod: CUSTOM_DATES["/"] || DEFAULT_LASTMOD, changefreq: "weekly", priority: "1.0" },

          ...tools.map((t) => ({
            path: `/tools/${t.slug}`,
            lastmod: CUSTOM_DATES[`/tools/${t.slug}`] || DEFAULT_LASTMOD,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),

          { path: "/image-tools", lastmod: CUSTOM_DATES["/image-tools"] || DEFAULT_LASTMOD, changefreq: "monthly", priority: "0.7" },
          ...imageTools.map((t) => ({
            path: `/image-tools/${t.slug}`,
            lastmod: CUSTOM_DATES[`/image-tools/${t.slug}`] || DEFAULT_LASTMOD,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),

          { path: "/about", lastmod: CUSTOM_DATES["/about"] || DEFAULT_LASTMOD, changefreq: "yearly", priority: "0.5" },
          { path: "/contact", lastmod: CUSTOM_DATES["/contact"] || DEFAULT_LASTMOD, changefreq: "yearly", priority: "0.5" },
          { path: "/privacy-policy", lastmod: CUSTOM_DATES["/privacy-policy"] || DEFAULT_LASTMOD, changefreq: "yearly", priority: "0.3" },
          { path: "/terms", lastmod: CUSTOM_DATES["/terms"] || DEFAULT_LASTMOD, changefreq: "yearly", priority: "0.3" },
        ];

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
            "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
          },
        });
      },
    },
  },
});
