const CACHE_NAME = 'helium-notes-v4'; // Increment this version when you update any of the cached files
const urlsToCache = [
  './',
  './index.html', // Landing page
  './landing.css',
  './app.html',   // Main application
  './styles.css',
  './app.js',
  './pwa-init.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './templates/index.json',
  './templates/artist-visualseed.json',
  './templates/author-idea.json',
  './templates/brain-dump-seed.json',
  './templates/brain.json',
  './templates/goal.json',
  './templates/problem.json',
  './templates/study.json',
  './templates/passing-thought.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install the service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Use a "Stale-While-Revalidate" strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the request is for an external resource (like the CDN),
          // ensure we only cache valid responses to avoid errors.
          if (event.request.url.startsWith(self.location.origin) || (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic')) {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        // Return cached version immediately, then update cache in background
        return response || fetchPromise;
      })
    })
  )
});