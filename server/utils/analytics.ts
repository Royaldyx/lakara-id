// Helper analitik: normalisasi traffic source + deteksi device.

/** Ubah URL referrer → label sumber (hostname tanpa www). Kosong/invalid → 'direct'. */
export function refSource(ref?: string | null): string {
  if (!ref) return 'direct'
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '').toLowerCase()
    return (h || 'direct').slice(0, 100)
  } catch {
    return 'direct'
  }
}

/** Deteksi device kasar dari user-agent: mobile | tablet | desktop. */
export function detectDevice(ua?: string | null): string {
  const s = (ua || '').toLowerCase()
  if (/ipad|tablet|playbook|silk|kindle/.test(s)) return 'tablet'
  if (/mobi|android|iphone|ipod|phone/.test(s)) return 'mobile'
  return 'desktop'
}
