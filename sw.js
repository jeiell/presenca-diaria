const CACHE_NAME = 'mana-diario-v4';
const assets = [
  './',
  './index.html',
  './app.js',
  './dados.js',
  './manifest.json',
  './splash.jpg' // Certifique-se que sua imagem tenha este nome
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});