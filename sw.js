/* Service worker: la app abre sin conexión. Cambia VERSION al publicar una actualización. */
const VERSION = 'facturacion-v1';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "lib/xlsx.full.min.js",
  "fonts/fonts.css",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "fonts/barlow-semi-condensed-latin-500-normal.woff2",
  "fonts/barlow-semi-condensed-latin-600-normal.woff2",
  "fonts/barlow-semi-condensed-latin-700-normal.woff2",
  "fonts/ibm-plex-mono-latin-400-normal.woff2",
  "fonts/ibm-plex-mono-latin-500-normal.woff2",
  "fonts/ibm-plex-mono-latin-600-normal.woff2",
  "fonts/inter-latin-400-normal.woff2",
  "fonts/inter-latin-500-normal.woff2",
  "fonts/inter-latin-600-normal.woff2",
  "fonts/inter-latin-700-normal.woff2"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Responde desde la caché y actualiza en segundo plano (la versión nueva se ve al volver a abrir). */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (req.mode === 'navigate' ? cache.match('index.html') : Response.error());
  }));
});
