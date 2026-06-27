const CACHE_NAME = 'pd-v1';
const assets = [
  './',
  './index.html',
  './dados.js',
  './app.js'
];

// Instala o Service Worker e guarda os arquivos no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Executa as requisições consumindo o cache quando offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});