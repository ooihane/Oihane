const ICONS=['./icons/compras.png','./icons/calendario.png','./icons/wishlist.png','./icons/regalos.png','./icons/hogar.png','./icons/plantas.png','./icons/recetas.png','./icons/estudio.png','./icons/viajes.png','./icons/cultura.png','./icons/planes.png','./icons/tareas.png','./icons/mas.png'];
const CACHE = 'oihane-v5328';
const CORE = ['./', './index.html', './manifest.json', './icon.png', ...ICONS];
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
      const response = await fetch(request, request.mode === 'navigate' ? { cache: 'no-store' } : undefined);
      if (response && response.ok) { const cache = await caches.open(CACHE); cache.put(request, response.clone()).catch(() => {}); }
      return response;
    } catch (_) {
      const cached = await caches.match(request);
      return cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    }
  })());
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Oihane';
  const options = { body: data.body || 'Tienes un recordatorio.', icon: './icon.png', badge: './icon.png', tag: data.tag || 'oihane-reminder', data: { url: data.url || './' }, renotify: false };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url || './', self.registration.scope);
  if (target.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) { if (new URL(client.url).origin === self.location.origin) { await client.focus(); if ('navigate' in client && client.url !== target.href) await client.navigate(target.href); return; } }
    await self.clients.openWindow(target.href);
  })());
});
