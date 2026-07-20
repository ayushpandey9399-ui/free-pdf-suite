// SEO + consistency contract tests for the image-tools silo.
// - Walks the imageTools registry (source of truth).
// - Validates route meta constants, JSON-LD payloads, sitemap, llms.txt,
//   route render block, and SEO component file existence.
// - No browser: reads the route file as text and imports pure JSON-LD modules.

import { describe, it, expect } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { imageTools } from "../../src/lib/imageTools";
import { SITE_URL } from "../../src/lib/site";

const ROOT = join(import.meta.dir, "..", "..");
const ROUTE_SRC = readFileSync(join(ROOT, "src/routes/image-tools.$slug.tsx"), "utf8");
const SITEMAP_SRC = readFileSync(join(ROOT, "src/routes/sitemap[.]xml.ts"), "utf8");
const LLMS_SRC = readFileSync(join(ROOT, "public/llms.txt"), "utf8");

const live = imageTools.filter((t) => t.status === "live");

/** slug "heic-to-jpg" -> "HeicToJpg" */
function pascal(slug: string): string {
  return slug.split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join("");
}

/* -------- Extract TITLES / DESCS from the route file -------- */

function readMapFromRoute(mapName: string): Record<string, string> {
  // Match "const TITLES: Record<string,string> = { ... };"
  const re = new RegExp(`const\\s+${mapName}[^=]*=\\s*{([\\s\\S]*?)};`, "m");
  const m = ROUTE_SRC.match(re);
  if (!m) throw new Error(`Could not locate ${mapName} in route file`);
  const body = m[1];
  const out: Record<string, string> = {};
  // Each entry: "slug": IDENTIFIER,
  const entryRe = /"([a-z0-9-]+)":\s*([A-Z_]+)\s*,/g;
  let e: RegExpExecArray | null;
  while ((e = entryRe.exec(body)) !== null) {
    const constName = e[2];
    const constRe = new RegExp(`const\\s+${constName}\\s*=\\s*(?:\\r?\\n\\s*)?"((?:[^"\\\\]|\\\\.)*)"`, "m");
    const cm = ROUTE_SRC.match(constRe);
    if (!cm) throw new Error(`Constant ${constName} not found for slug ${e[1]}`);
    out[e[1]] = cm[1];
  }
  return out;
}

const TITLES = readMapFromRoute("TITLES");
const DESCS = readMapFromRoute("DESCS");

/* ==================== TITLE + DESCRIPTION ==================== */

describe("SEO: titles", () => {
  for (const t of live) {
    it(`${t.slug}: has a title`, () => {
      expect(TITLES[t.slug]).toBeTruthy();
    });
    it(`${t.slug}: title length is 50-65 chars`, () => {
      const len = TITLES[t.slug].length;
      expect(len).toBeGreaterThanOrEqual(50);
      expect(len).toBeLessThanOrEqual(65);
    });
    it(`${t.slug}: title has no em/en dash`, () => {
      expect(TITLES[t.slug]).not.toMatch(/[\u2013\u2014]/);
    });
  }
});

describe("SEO: meta descriptions", () => {
  for (const t of live) {
    it(`${t.slug}: has a description`, () => {
      expect(DESCS[t.slug]).toBeTruthy();
    });
    it(`${t.slug}: description length is 130-165 chars`, () => {
      const len = DESCS[t.slug].length;
      expect(len).toBeGreaterThanOrEqual(130);
      expect(len).toBeLessThanOrEqual(165);
    });
    it(`${t.slug}: description has no em/en dash`, () => {
      expect(DESCS[t.slug]).not.toMatch(/[\u2013\u2014]/);
    });
  }
});

/* ==================== JSON-LD PAYLOADS ==================== */

describe("SEO: JSON-LD payloads", () => {
  for (const t of live) {
    it(`${t.slug}: SEO module exports valid HowTo / FAQ / Software LDs`, async () => {
      const mod = await import(`../../src/components/${pascal(t.slug)}Seo.tsx`);
      const cam = pascal(t.slug);
      const camelLead = cam.charAt(0).toLowerCase() + cam.slice(1);

      const software = mod[`${camelLead}SoftwareJsonLd`];
      const howto = mod[`${camelLead}HowToJsonLd`];
      const faq = mod[`${camelLead}FaqJsonLd`];

      expect(software, "software LD present").toBeDefined();
      expect(howto, "howto LD present").toBeDefined();
      expect(faq, "faq LD present").toBeDefined();

      // Round-trip through JSON to verify serializability.
      const softwareParsed = JSON.parse(JSON.stringify(software));
      const howtoParsed = JSON.parse(JSON.stringify(howto));
      const faqParsed = JSON.parse(JSON.stringify(faq));

      expect(softwareParsed["@type"]).toBe("SoftwareApplication");
      expect(softwareParsed.url).toBe(`${SITE_URL}/image-tools/${t.slug}`);
      expect(typeof softwareParsed.name).toBe("string");

      expect(howtoParsed["@type"]).toBe("HowTo");
      expect(Array.isArray(howtoParsed.step)).toBe(true);
      expect(howtoParsed.step.length).toBeGreaterThanOrEqual(3);
      for (const s of howtoParsed.step) {
        expect(s["@type"]).toBe("HowToStep");
        expect(typeof s.name).toBe("string");
        expect(typeof s.text).toBe("string");
      }

      expect(faqParsed["@type"]).toBe("FAQPage");
      expect(Array.isArray(faqParsed.mainEntity)).toBe(true);
      expect(faqParsed.mainEntity.length).toBeGreaterThanOrEqual(6);
      for (const q of faqParsed.mainEntity) {
        expect(q["@type"]).toBe("Question");
        expect(typeof q.name).toBe("string");
        expect(q.acceptedAnswer["@type"]).toBe("Answer");
        expect(typeof q.acceptedAnswer.text).toBe("string");
      }
    });
  }
});

/* ==================== CONSISTENCY CONTRACT ==================== */

describe("contract: every live registry entry is fully wired", () => {
  for (const t of live) {
    it(`${t.slug}: has a render branch in route file`, () => {
      expect(ROUTE_SRC).toContain(`tool.slug === "${t.slug}"`);
    });
    it(`${t.slug}: has a canonical/software URL entry`, () => {
      expect(TITLES[t.slug]).toBeTruthy();
      expect(DESCS[t.slug]).toBeTruthy();
    });
    it(`${t.slug}: SEO component file exists`, () => {
      expect(existsSync(join(ROOT, "src/components", `${pascal(t.slug)}Seo.tsx`))).toBe(true);
    });
    it(`${t.slug}: is listed in the sitemap`, () => {
      expect(SITEMAP_SRC).toContain(`/image-tools/${t.slug}`);
    });
    it(`${t.slug}: is listed in llms.txt`, () => {
      expect(LLMS_SRC).toContain(`(/image-tools/${t.slug})`);
    });
  }
});

describe("contract: nothing in sitemap/llms lacks a live registry entry", () => {
  const knownExtras = new Set(["/image-tools"]); // hub page is allowed
  const liveSlugs = new Set(live.map((t) => `/image-tools/${t.slug}`));

  it("sitemap has no orphan image-tool paths", () => {
    const re = /\/image-tools(?:\/[a-z0-9-]+)?/g;
    const found = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(SITEMAP_SRC)) !== null) found.add(m[0]);
    for (const p of found) {
      if (knownExtras.has(p)) continue;
      expect(liveSlugs.has(p), `sitemap path ${p} has no live registry entry`).toBe(true);
    }
  });

  it("llms.txt has no orphan image-tool paths", () => {
    const re = /\(\/image-tools(?:\/[a-z0-9-]+)?\)/g;
    const found = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(LLMS_SRC)) !== null) found.add(m[0].slice(1, -1));
    for (const p of found) {
      if (knownExtras.has(p)) continue;
      expect(liveSlugs.has(p), `llms.txt path ${p} has no live registry entry`).toBe(true);
    }
  });
});

/* ==================== NO DASHES IN USER-FACING COPY ==================== */

describe("copy hygiene: no em/en dashes in image SEO components", () => {
  for (const t of live) {
    it(`${t.slug}Seo.tsx has no em/en dashes`, () => {
      const src = readFileSync(join(ROOT, "src/components", `${pascal(t.slug)}Seo.tsx`), "utf8");
      expect(src).not.toMatch(/[\u2013\u2014]/);
    });
  }
});
