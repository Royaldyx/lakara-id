// Fix mobile: pas input/textarea di-fokus, keyboard sering nutupin field.
// Scroll field ke tengah viewport (di atas keyboard). Hanya di layar kecil (mobile).
export default defineNuxtPlugin(() => {
  if (typeof document === 'undefined') return

  document.addEventListener('focusin', (e) => {
    const el = e.target as HTMLElement | null
    if (!el) return
    const tag = el.tagName
    if (tag !== 'INPUT' && tag !== 'TEXTAREA') return
    if (window.innerWidth >= 1024) return // desktop: skip (nggak ada keyboard nutup)

    // Delay biar keyboard sempat muncul dulu, baru scroll
    setTimeout(() => {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } catch { /* ignore */ }
    }, 300)
  })
})
