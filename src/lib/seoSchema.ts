import { SITE_URL } from "@/lib/site";

type Json = Record<string, unknown>;

function absolutize(value: unknown): unknown {
  if (typeof value !== "string") return value;
  if (value.startsWith("/")) return `${SITE_URL}${value}`;
  return value;
}

/**
 * Normalizes a JSON-LD block before it is emitted:
 * - HowTo step urls become absolute (https://host/tools/merge#step-1)
 * - SoftwareApplication gets a url when the caller knows the page URL
 * Shared by the PDF and image tool routes so the per tool SEO modules stay simple.
 */
export function normalizeToolJsonLd(node: unknown, pageUrl: string): unknown {
  if (Array.isArray(node)) return node.map((n) => normalizeToolJsonLd(n, pageUrl));
  if (!node || typeof node !== "object") return node;

  const input = node as Json;
  const out: Json = { ...input };
  const type = out["@type"];

  if (type === "HowTo" || type === "HowToStep" || type === "HowToSection") {
    if ("url" in out) out.url = absolutize(out.url);
  }
  if (type === "HowTo" && !out.url) out.url = pageUrl;

  if (type === "SoftwareApplication" && !out.url) out.url = pageUrl;
  if (type === "FAQPage" && !out.url) out.url = pageUrl;

  for (const key of Object.keys(out)) {
    const value = out[key];
    if (Array.isArray(value) || (value && typeof value === "object")) {
      out[key] = normalizeToolJsonLd(value, pageUrl);
    }
  }
  return out;
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
