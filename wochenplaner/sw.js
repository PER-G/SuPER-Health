// SuPER Küche – Offline-Cache (App-Shell + Rezeptbilder bei Bedarf)
const V = 'sk-v3';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/ingredients.js', 'js/core.js', 'js/packs.js', 'js/recipes/fruehstueck.js', 'js/recipes/mediterran.js', 'js/recipes/asiatisch.js', 'js/recipes/familie.js', 'js/recipes/z-extra.js', 'js/recipes/protein.js', 'js/image-credits.js', 'js/app.js', 'img/icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  // Netzwerk zuerst (immer aktuell), Cache als Offline-Fallback
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
});
