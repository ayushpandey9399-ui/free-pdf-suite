/**
 * Architecture Notes
 * Google Analytics may only load after the visitor accepts cookies. The choice
 * is stored in localStorage and every caller goes through these helpers so the
 * banner, the footer "Cookie settings" link and the GA loader agree.
 */

export const CONSENT_KEY = "ptc-cookie-consent";
export const OPEN_CONSENT_EVENT = "ptc:open-cookie-settings";
const GA_ID = "G-2DDFKP33MW";

export type Consent = "accepted" | "declined";

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(v: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* storage blocked: choice applies to this page view only */
  }
}

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };

let loaded = false;
export function loadAnalytics() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  const w = window as GtagWindow;
  (w as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = false;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
}

/** Stops further GA hits on this page and clears GA cookies. */
export function disableAnalytics() {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = true;
  const host = window.location.hostname.replace(/^www\./, "");
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      for (const d of ["", `; domain=.${host}`, `; domain=${host}`]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
      }
    }
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
