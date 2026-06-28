// Service worker minimal Lakara — cukup untuk kriteria "installable" PWA.
// Sengaja TIDAK meng-cache HTML/API agar konten selalu fresh (SSR + data realtime).
const VERSION = 'lakara-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Network-first, tanpa cache statis — biar tidak ada konten basi.
self.addEventListener('fetch', (event) => {
  // Biarkan browser menangani request seperti biasa.
  // Handler kosong ini sudah memenuhi syarat fetch handler untuk installability.
})
