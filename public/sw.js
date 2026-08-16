/*
 * pdftoolconverteronline.com — Service Worker
 * ---------------------------------------------------------------------------
 * EMERGENCY RECOVERY (3 documented paths to unstick a broken deployment)
 *
 * 1. In-app kill message (from any page under our origin):
 *      navigator.serviceWorker.controller?.postMessage({ type: "SW_KILL" });
 *    The SW deletes every cache it owns, unregisters itself, and reloads
 *    all open clients. Use when a broken JS/CSS chunk is cached but users
 *    are still online.
 *
 * 2. Per-visitor URL kill switch:
 *      https://pdftoolconverteronline.com/?sw=kill
 *    Loading any page with ?sw=kill triggers the same cleanup as (1),
 *    scoped to that visitor. Also supports ?sw=off which only skips
 *    registration on that load (does not unregister). Share ?sw=kill
 *    with a stuck user for a one-click fix.
 *
 * 3. Nuclear rollback — replace this file's content wholesale with the
 *    "no-op kill sw.js" block shown at the bottom of this comment, then
 *    redeploy. Every returning visitor will have their SW self-destruct
 *    on next visit. This is the safest recovery when caches or a broken
 *    SW are causing sitewide problems.
 *
 * ---- BEGIN NO-OP KILL sw.js (copy from here) --------------------------
 * self.addEventListener("install", () => self.skipWaiting());
 * self.addEventListener("activate", (event) => {
 *   event.waitUntil((async () => {
 *     try {
 *       const names = await caches.keys();
 *       await Promise.allSettled(names.map((n) => caches.delete(n)));
 *       await self.clients.claim();
 *       const clients = await self.clients.matchAll({ type: "window" });
 *       await Promise.allSettled(clients.map((c) => c.navigate(c.url)));
 *     } finally {
 *       await self.registration.unregister();
 *     }
 *   })());
 * });
 * self.addEventListener("fetch", () => {});
 * ---- END NO-OP KILL sw.js ---------------------------------------------
 */

const CACHE_VERSION = "v1";
const HTML_CACHE    = `html-${CACHE_VERSION}`;
const STATIC_CACHE  = `static-${CACHE_VERSION}`;
const FONTS_CACHE   = `fonts-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const WASM_CACHE    = `wasm-${CACHE_VERSION}`;
const OWNED_CACHES  = [HTML_CACHE, STATIC_CACHE, FONTS_CACHE, RUNTIME_CACHE, WASM_CACHE];

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/icons/apple-touch-icon-180.png",
];

// ---------- install: precache shell + offline fallback --------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(HTML_CACHE);
      // Best-effort: individual failures shouldn't abort install.
      await Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: "reload" })
            .then((res) => (res.ok ? cache.put(url, res.clone()) : null))
            .catch(() => null),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

// ---------- activate: drop caches from older versions ---------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.allSettled(
        names
          .filter((n) => !OWNED_CACHES.includes(n) && looksLikeOurCache(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

function looksLikeOurCache(name) {
  return /^(html|static|fonts|runtime|wasm)-v\d+$/.test(name);
}

// ---------- messaging: skip waiting + kill switch -------------------------
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }
  if (data.type === "SW_KILL") {
    event.waitUntil(killAndUnregister());
  }
});

async function killAndUnregister() {
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.map((n) => caches.delete(n)));
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.allSettled(clients.map((c) => c.navigate(c.url)));
  } finally {
    await self.registration.unregister();
  }
}

// ---------- fetch: strategies + third-party bypass ------------------------
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Bypass ALL cross-origin (AdSense, analytics, Google Fonts, etc.).
  if (url.origin !== self.location.origin) return;

  // Bypass the OCR runtime assets (tesseract worker + WASM + traineddata).
  // These are large, downloaded only on opt-in, and served from our own
  // origin | rely on normal HTTP caching, never touch SW-owned caches.
  if (url.pathname.startsWith("/ocr/")) return;

  // Per-visitor kill switch via ?sw=kill on any navigation.
  if (req.mode === "navigate" && url.searchParams.get("sw") === "kill") {
    event.respondWith(
      (async () => {
        await killAndUnregister();
        return fetch(req).catch(
          () =>
            new Response(
              "<!doctype html><meta charset=utf-8><title>Service worker cleared</title><p style=\"font:16px system-ui;padding:2rem\">Service worker cleared. Reload the page.</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            ),
        );
      })(),
    );
    return;
  }

  // 1) HTML navigations: network-first with 3s timeout, then cache, then /offline.
  if (req.mode === "navigate") {
    event.respondWith(navigationStrategy(req));
    return;
  }

  const dest = req.destination;
  const path = url.pathname;

  // 2) Fonts (self-hosted): cache-first.
  if (dest === "font" || /\.(?:woff2?|ttf|otf)$/i.test(path)) {
    event.respondWith(cacheFirst(req, FONTS_CACHE));
    return;
  }

  // 3) Wasm: runtime cache-first, on first use only.
  if (/\.wasm$/i.test(path)) {
    event.respondWith(cacheFirst(req, WASM_CACHE));
    return;
  }

  // 4) Hashed built assets: cache-first (immutable).
  if (isHashedAsset(path)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // 5) Same-origin JS/CSS/workers/images: stale-while-revalidate.
  if (
    dest === "script" ||
    dest === "style" ||
    dest === "worker" ||
    dest === "image" ||
    /\.(?:js|mjs|css|map|json|png|jpg|jpeg|gif|webp|svg|ico)$/i.test(path)
  ) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }

  // Everything else: passthrough.
});

function isHashedAsset(pathname) {
  if (pathname.startsWith("/_build/") || pathname.startsWith("/assets/")) return true;
  // e.g. name.a1b2c3d4.js — 8+ hex chars sandwiched by dots.
  return /\.[0-9a-f]{8,}\.[a-z0-9]+$/i.test(pathname);
}

async function navigationStrategy(req) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const net = await fetchWithTimeout(req, 3000);
    if (net && net.ok) {
      cache.put(req, net.clone()).catch(() => {});
      return net;
    }
    if (net) return net;
  } catch {
    /* offline or timeout */
  }
  const cached = (await cache.match(req)) || (await cache.match("/"));
  if (cached) return cached;
  const offline = await cache.match(OFFLINE_URL);
  return (
    offline ||
    new Response("You are offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

function fetchWithTimeout(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(req).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => null);
  return hit || (await network) || new Response("", { status: 504 });
}
