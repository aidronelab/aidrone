// AI DRONE LAB — Service Worker (PWA 설치/오프라인 지원)
const CACHE = 'aidronelab-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // 같은 출처: 캐시 우선, 없으면 네트워크 후 캐시 저장
  if (new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  }
  // 외부(CDN 등): 네트워크 우선, 실패 시 캐시
  else {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
