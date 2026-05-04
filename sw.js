// Service Worker — caches the app shell for full offline use
const CACHE = 'rebolt-kaly-v1';
const SHELL = [
  './',
  './index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first for Google Fonts and external resources (when online)
  // Cache-first for the app shell
  const url = new URL(e.request.url);

  if (SHELL.some(s => url.pathname.endsWith(s.replace('./', ''))) || url.pathname === '/') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  } else {
    // Pass through everything else (API calls, fonts)
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
  }
});
