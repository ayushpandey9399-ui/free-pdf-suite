// Central site constants used across legal pages, footer, meta, and sitemap.
// Change these in one place to update site-wide.
export const SITE_NAME = "PDFToolConverter";
export const SITE_URL = "https://pdftoolconverteronline.com";
export const CONTACT_EMAIL = "hello@pdftoolconverteronline.com";
export const LAST_UPDATED = "August 18, 2026";

/**
 * Tool pages hidden from search. Add a slug (for example "pdf-to-word") to
 * mark that page noindex AND drop it from sitemap.xml in one change.
 * Currently empty: nothing is hidden.
 */
export const NOINDEX_TOOL_SLUGS: readonly string[] = [];
