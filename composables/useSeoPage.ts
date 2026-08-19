/**
 * useSeoPage — apply SEO meta ke halaman publik.
 *
 * PENTING (Juli 2026): dulu ini `await useFetch('/api/seo')` DULU baru `useHead`.
 * Akibatnya kalau fetch lambat/gagal di server, useHead nggak keburu jalan di SSR →
 * meta (og:title, description, canonical) HILANG dari HTML yang dibaca Google.
 *
 * FIX: useHead dipanggil SINKRON (langsung), fetch admin SEO dibuat `lazy` (non-blocking).
 * → SSR SELALU emit meta dari `defaults` (andal). Nilai dari admin (/api/seo) meng-update
 *   secara reaktif di client. Jadi pastikan `defaults` per halaman diisi bagus.
 */
export const useSeoPage = (
  pageKey: string,
  defaults: {
    title?:       string
    description?: string
    image?:       string
    canonical?:   string
  } = {}
) => {
  // Lazy = tidak memblok SSR. Data admin masuk reaktif di client.
  const { data: seoRes } = useFetch<{ success: boolean; data: Record<string, any> }>('/api/seo', {
    key:     'seo-all',
    lazy:    true,
    server:  false,
    default: () => ({ success: false, data: {} }),
  })

  const s = computed(() => (seoRes.value?.data ?? {})[pageKey] ?? {})
  const routeObj = useRoute()

  const title       = computed(() => s.value.title       || defaults.title       || 'Lakara Solusi Kreatif')
  const description = computed(() => s.value.description || defaults.description || 'PT Lakara Solusi Kreatif — Mitra digital terpercaya untuk website development, mobile app, talent esports, dan social media growth.')
  const ogImage     = computed(() => s.value.og_image    || defaults.image       || 'https://lakara.id/og-cover.png')
  // Self-referencing canonical selalu ada (best practice SEO) — fallback ke path saat ini.
  const canonical   = computed(() => s.value.canonical   || defaults.canonical   || `https://lakara.id${routeObj.path === '/' ? '' : routeObj.path}`)

  // useHead dipanggil SINKRON → meta pasti ke-render di SSR (pakai defaults dulu)
  useHead({
    title,
    meta: [
      { name: 'description',         content: description },
      { property: 'og:title',        content: title },
      { property: 'og:description',  content: description },
      { property: 'og:image',        content: ogImage },
      { property: 'og:url',          content: canonical },
      { name: 'twitter:title',       content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image',       content: ogImage },
    ],
    link: computed(() => canonical.value ? [{ rel: 'canonical', href: canonical.value }] : []),
  })
}
