// SuPER Küche – Offline-Cache (App-Shell + Rezeptbilder bei Bedarf)
const V = 'sk-muztj65j';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/ingredients.js', 'js/core.js', 'js/packs.js', 'js/recipes/fruehstueck.js', 'js/recipes/mediterran.js', 'js/recipes/asiatisch.js', 'js/recipes/familie.js', 'js/recipes/z-extra.js', 'js/recipes/protein.js', 'js/recipes/dessert-quark.js', 'js/recipes/dessert-backen.js', 'js/recipes/snacks.js', 'js/recipes/fruehstueck2.js', 'js/recipes/gefluegel.js', 'js/recipes/fleisch.js', 'js/recipes/fisch.js', 'js/recipes/veggie.js', 'js/image-credits.js', 'js/app.js', 'img/icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  // Netzwerk zuerst (immer aktuell, HTML/JS/CSS ohne Browser-Cache), Cache nur als Offline-Fallback
  const fresh = /\.(html|js|css|webmanifest)$|\/$/.test(u.pathname);
  e.respondWith(fetch(e.request, fresh ? { cache: 'no-cache' } : {}).then(r => { const c = r.clone(); caches.open(V).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
