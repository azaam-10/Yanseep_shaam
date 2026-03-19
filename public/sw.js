const CACHE_NAME = 'naseeb-cash-v10';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://img.icons8.com/color/192/gold-bars.png',
  'https://img.icons8.com/color/512/gold-bars.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for API calls and dynamic content
  // Cache-first for static assets
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache successful GET requests
            if (event.request.method === 'GET' && fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      }).catch(() => {
        // Fallback for offline mode
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
