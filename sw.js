/* GUARDIANA · service worker of the installable app (23 Oct 2026; the owner: «que pueda descargarla… como si fuera tipo
   aplicación»). It does only what an installed app needs: it keeps a copy of the offline page and shows it when there is
   no connection, instead of the browser's error. It records nothing about anyone, sends nothing anywhere, and leaves
   every other request to the browser as if it were not here. */
const VERSION = 'guardiana-app-2'; // 2: offline.html sin manejador en línea (CSP con hashes, 29 Oct 2026); la copia guardada se renueva
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.add('/offline.html')).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return; // pictures, data and scripts: straight to the network, untouched
  e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html')));
});
