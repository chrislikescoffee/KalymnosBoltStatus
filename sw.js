const CACHE_NAME = 'rebolt-kaly-v4';
const SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // BYPASS: If the request is NOT to your own github.io domain, ignore it completely
  if (url.origin !== self.location.origin) {
    return; // This forces the browser to handle the request, not the worker
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
