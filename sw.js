const CACHE = 'claude-pwa-v2';
const ROOT = self.location.pathname.replace(/\/[^/]*$/, '') || '';

self.addEventListener('install', (e) => {
  const base = ROOT || '.';
  const assets = [`${base}/`, `${base}/index.html`, `${base}/manifest.json`];
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(assets)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Don't cache API calls
  const url = e.request.url;
  if (url.includes('api.anthropic.com') || url.includes('api.deepseek.com')) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      });
    }).catch(() => caches.match(`${ROOT}/index.html`))
  );
});
