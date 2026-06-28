// Daftarkan service worker untuk PWA (installable / TWA).
export default defineNuxtPlugin(() => {
  if (process.client && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[Lakara PWA] Service worker gagal didaftarkan:', err)
      })
    })
  }
})
