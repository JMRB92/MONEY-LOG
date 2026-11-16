// v1.02 revisada: para el documento, primero red; si no hay conexión, caché.
const CACHE = 'moneylog-v102-revisada-2';
const CORE = ['./index.html','./styles.css?v=102r2','./app.js?v=102r2','./manifest.webmanifest?v=102r2','./icon.svg?v=102r2'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('moneylog-') && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if(event.request.mode === 'navigate') {
    event.respondWith(fetch(new Request(event.request,{cache:'no-store'})).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put('./index.html',copy)));}return response;
    }).catch(()=>caches.match('./index.html')));
  } else {
    event.respondWith(fetch(new Request(event.request,{cache:'no-cache'})).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}return response;
    }).catch(()=>caches.match(event.request)));
  }
});
