const CACHE_NAME = 'waste-mgmt-stale-v0';
const STALE_APP_SHELL = ['/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STALE_APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Fault simulation: old caches are intentionally retained to model broken update logic.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(event.request))
    );
  }
});
