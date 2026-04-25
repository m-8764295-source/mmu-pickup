// MIDI Service Worker v1.0
const CACHE = 'midi-v1';
const ASSETS = [
  './soy-and-oden.html',
  './manifest.json',
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip Firebase & API calls — always go to network
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('anthropic') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('gstatic')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh copy
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
