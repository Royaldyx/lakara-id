/**
 * useSeoPage — apply SEO meta dari admin settings ke halaman publik.
 * Fallback ke defaults jika admin belum set.
 */
export const useSeoPage = async (
  pageKey: string,
  defaults: {
    title?:       string
    description?: string
    image?:       string
    canonical?:   string
  } = {}
) => {
  const { data: seoRes } = await useFetch<{ success: boolean; data: Record<string, any> }>('/api/seo', {
    key:     'seo-all',
    default: () => ({ success: false, data: {} }),
  })

  const s = computed(() => (seoRes.value?.data ?? {})[pageKey] ?? {})

  // Pass computed refs (TIDAK .value) ke useHead agar reaktif
  const title       = computed(() => s.value.title       || defaults.title       || 'Lakara Solusi Kreatif')
  const description = computed(() => s.value.description || defaults.description || 'PT Lakara Solusi Kreatif — Mitra digital terpercaya untuk website development, mobile app, talent esports, dan social media growth.')
  const ogImage     = computed(() => s.value.og_image    || defaults.image       || '')
  const canonical   = computed(() => s.value.canonical   || defaults.canonical   || '')

  useHead({
    title,
    meta: [
      { name: 'description',         content: description },
      { property: 'og:title',        content: title },
      { property: 'og:description',  content: description },
      { property: 'og:image',        content: ogImage },
      { name: 'twitter:title',       content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image',       content: ogImage },
    ],
    link: computed(() => canonical.value ? [{ rel: 'canonical', href: canonical.value }] : []),
  })
}
