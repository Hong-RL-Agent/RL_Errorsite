// Flaw 1: Service Worker Navigation Preload Conflict
// Simulating an anti-pattern where navigationPreload is enabled but not properly awaited in fetch,
// or conflicts by causing a synthetic delay to simulate preload congestion.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Enable navigation preload
  event.waitUntil(
    self.registration.navigationPreload.enable()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only apply to HTML navigation requests to simulate preload conflict
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt to use preload response
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Anti-pattern logic: Intentionally delaying the network fallback
          // to simulate a conflict between the preload resolution and network queue
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return await fetch(event.request);
        } catch (error) {
          // Catch and fallback
          return await fetch(event.request);
        }
      })()
    );
  }
});
