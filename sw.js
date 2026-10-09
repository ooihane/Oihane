const CACHE = 'oihane-v14';
const CORE = ['./', './index.html', './manifest.json', './icon.svg'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(async path => { try { const response = await fetch(path, {cache: 'reload'}); if (response.ok) await cache.put(path, response); } catch (_) {} }));
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('oihane-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const request = event.request;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) { const cache = await caches.open(CACHE); cache.put(request, response.clone()).catch(() => {}); }
      return response;
    } catch (_) {
      const cached = await caches.match(request);
      return cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    }
  })());
});
