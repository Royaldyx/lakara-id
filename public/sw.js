// Service worker Lakara — installable PWA + offline shell.
// Strategi: aset statis (cache-first), halaman/HTML (network-first + fallback cache),
// API (network-only → data nggak muncul offline, itu by design).
// Naikkan VERSION tiap ubah SW biar cache lama kebersihin.
const VERSION       = 'lakara-v2'
const STATIC_CACHE  = 'lakara-static-' + VERSION
const PAGE_CACHE    = 'lakara-pages-'  + VERSION

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Hapus cache versi lama
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  let url
  try { url = new URL(req.url) } catch { return }
  if (url.origin !== self.location.origin) return   // hanya same-origin
  if (url.pathname.startsWith('/api/')) return        // API: network-only (biar data fresh; offline = gagal, itu ok)

  // Aset statis (hashed /_nuxt, gambar, font, css/js) → cache-first + refresh background
  if (url.pathname.startsWith('/_nuxt/') || /\.(js|css|woff2?|ttf|png|jpe?g|svg|webp|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE))
    return
  }

  // Navigasi / HTML → network-first, fallback ke cache (biar tetap kebuka offline)
  const accept = req.headers.get('accept') || ''
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(networkFirst(req, PAGE_CACHE))
    return
  }
})

async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(req)
  if (cached) {
    // refresh di background (stale-while-revalidate)
    fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()) }).catch(() => {})
    return cached
  }
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch {
    return cached || Response.error()
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch {
    const cached = await cache.match(req)
    if (cached) return cached
    // fallback shell: halaman apa pun yang ter-cache (biar app skeleton muncul)
    const shell = (await cache.match('/member')) || (await cache.match('/'))
    if (shell) return shell
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<div style="font-family:system-ui;text-align:center;padding:20vh 24px;color:#334155">' +
      '<h1 style="font-size:22px">Kamu sedang offline</h1>' +
      '<p style="color:#64748b">Sambungkan internet lalu buka lagi.</p></div>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}
