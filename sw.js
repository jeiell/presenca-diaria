const CACHE_NAME = 'presenca-diaria-v1';
const assets = [
  './',
  './index.html',
  './app.js',
  './dados.js',
  './manifest.json'
];

// Instala o service worker e guarda os arquivos no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Executa as requisições buscando no cache quando offline
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});