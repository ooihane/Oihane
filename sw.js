const ICONS=['./icons/compras.png','./icons/calendario.png','./icons/wishlist.png','./icons/regalos.png','./icons/hogar.png','./icons/plantas.png','./icons/recetas.png','./icons/estudio.png','./icons/viajes.png','./icons/cultura.png','./icons/planes.png','./icons/tareas.png','./icons/mas.png','./icons/pedidos.png'];
const CACHE = 'oihane-v5597';
const CORE = ['./', './index.html', './styles/base.css', './styles/generated.css', './styles/interface.css', './js/core/sync-runtime.js', './js/core/foundation.js', './js/features/01-home-shopping.js', './js/features/02-tasks-hogar.js', './js/features/03-recipes-study.js', './js/features/04-travel-culture.js', './js/features/05-plans.js', './js/features/06-product-ui.js', './js/features/07-local-assistant.js', './js/features/08-settings.js', './js/features/09-cloud-account.js', './js/features/10-shopping-improvements.js', './js/features/11-ai-integration.js', './js/features/12-ai-actions.js', './js/features/13-calendar-gifts.js', './js/features/14-interface-voice.js', './js/features/15-orders-invitations.js','./js/features/16-personalization.js', './js/features/17-oihane-wake-listener.js', './js/features/19-assistant-reliability.js', './js/features/18-work-calendar.js', './manifest.json', './shared.js', './shared-modules.js', './account-settings.js', './mixed-shared.js', './icon.png', ...ICONS];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const required = path => path === './index.html' || /\.(?:js|css)$/.test(path);
    const results = await Promise.all(CORE.map(async path => {
      try {
        const response = await fetch(path, {cache: 'reload'});
        if (!response || !response.ok) return {path, ok:false};
        await cache.put(path, response);
        return {path, ok:true};
      } catch (_) { return {path, ok:false}; }
    }));
    // No reemplazar un Service Worker funcional si faltan scripts, estilos
    // o el HTML de la nueva versión. Los iconos pueden recuperarse después.
    const missing = results.filter(result => required(result.path) && !result.ok);
    if (missing.length) {
      await caches.delete(CACHE);
      throw new Error('Oihane: recursos esenciales sin precargar: '+missing.map(x=>x.path).join(', '));
    }
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
      const cached = (await caches.match(request)) || (await caches.match(request, { ignoreSearch: true }));
      return cached || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
    }
  })());
});
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : '' }; }
  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Recordatorio';
  const options = { icon: './icon.png', badge: './icon.png', tag: data.tag || 'oihane-reminder', data: { url: data.url || './' }, renotify: false };
  if (typeof data.body === 'string' && data.body.trim()) options.body = data.body.trim();
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
