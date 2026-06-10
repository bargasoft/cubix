const CACHE_NAME = 'cubix-store-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate eventi: Eski cache'leri temizler
self.addEventListener('activate', (e) => {
  e.waitUntil(
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

// Network First, fallback to cache stratejisi (Her zaman en güncel dosyayı çeker)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Ağa ulaşılabiliyorsa yeni veriyi cache'e de kaydet
        if(response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // İnternet yoksa cache'den dön
        return caches.match(e.request);
      })
  );
});
