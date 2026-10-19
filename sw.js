// 七日世界·精校图纸对比 PWA Service Worker
// 应用是单文件构建，缓存入口页即可离线运行
const CACHE = 'oh-bp-v1'
const ENTRY = './'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(ENTRY))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (cached) =>
        cached ||
        fetch(e.request)
          .then((resp) => {
            if (resp.ok) {
              const copy = resp.clone()
              caches.open(CACHE).then((c) => c.put(e.request, copy))
            }
            return resp
          })
          .catch(() => caches.match(ENTRY)),
    ),
  )
})
