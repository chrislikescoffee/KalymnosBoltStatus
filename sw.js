const CACHE = 'rebolt-kaly-v2';
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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

// ── FIXED FETCH HANDLER ──────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. BYPASS for external API calls (Syncing)
  // Let these go directly to the network without SW interference
  if (url.hostname.includes('allorigins') || url.hostname.includes('corsproxy') || url.hostname.includes('climbkalymnos')) {
    return; // Do nothing, let the browser handle it naturally
  }

  // 2. Handle the App Shell (index.html, etc.)
  if (SHELL.some(s => url.pathname.endsWith(s.replace('./', ''))) || url.pathname === '/') {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
