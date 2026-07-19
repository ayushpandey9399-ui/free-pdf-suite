// Guarded service-worker registration. Registers ONLY in the real published
// browser context; unregisters any stale SW in dev / preview / iframe / bots.

const SW_URL = "/sw.js";
const SW_SCOPE = "/";

function isBotUA(ua: string): boolean {
  return /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|whatsapp|telegrambot|twitterbot|linkedinbot|discordbot|slackbot|redditbot/i.test(
    ua,
  );
}

function isPreviewHost(hostname: string): boolean {
  if (hostname.startsWith("id-preview--") || hostname.startsWith("preview--")) return true;
  return (
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    hostname.endsWith(".lovable.app")
  );
}

function shouldRegister(): boolean {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  if (!import.meta.env.PROD) return false;

  try {
    if (window.top !== window.self) return false;
  } catch {
    return false;
  }

  const url = new URL(window.location.href);
  const swParam = url.searchParams.get("sw");
  if (swParam === "off" || swParam === "kill") return false;

  if (isPreviewHost(window.location.hostname)) return false;
  if (isBotUA(navigator.userAgent || "")) return false;

  return true;
}

async function unregisterExisting(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs
        .filter((r) => (r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "").endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export type UpdateReadyHandler = (activate: () => void) => void;

export async function registerServiceWorker(onUpdateReady?: UpdateReadyHandler): Promise<void> {
  if (!shouldRegister()) {
    await unregisterExisting();
    return;
  }

  const swUrl = new URL(window.location.href).searchParams.get("sw");
  if (swUrl) {
    // Any other explicit ?sw=... value: don't register.
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });

    // If a waiting worker is already sitting there on load, surface the update.
    if (registration.waiting && navigator.serviceWorker.controller) {
      notifyReady(registration, onUpdateReady);
    }

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          notifyReady(registration, onUpdateReady);
        }
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });
  } catch {
    /* registration errors are non-fatal */
  }
}

function notifyReady(reg: ServiceWorkerRegistration, onUpdateReady?: UpdateReadyHandler) {
  if (!onUpdateReady) return;
  onUpdateReady(() => {
    reg.waiting?.postMessage({ type: "SKIP_WAITING" });
  });
}
