const CACHE = 'claude-pwa-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('fetch', (e) => {
  // Don't cache API calls
  if (e.request.url.includes('api.anthropic.com')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => {
      // Offline fallback - return cached version if available
      return caches.match('/index.html');
    })
  );
});
