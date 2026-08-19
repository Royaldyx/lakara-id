<template>
  <div>
    <!-- Toko/produk pages: no layout wrapper -->
    <NuxtPage v-if="isTokoRoute" />
    <!-- Semua halaman Lakara lainnya: pakai default layout -->
    <NuxtLayout v-else>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// Prefix halaman resmi Lakara (bukan toko member)
const SITE_PREFIXES = [
  '/admin', '/member', '/client', '/layanan', '/artikel', '/portfolio',
  '/pricing', '/contact', '/about', '/kalkulator', '/privacy', '/terms', '/services',
  '/showcase', '/hapus-akun',
]

// Route toko: bukan homepage + bukan prefix site resmi
const isTokoRoute = computed(() => {
  const path = route.path
  if (path === '/') return false
  return !SITE_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + '/'))
})

// ===== Structured data global: Organization + WebSite (JSON-LD, zero-dep) =====
// Hanya untuk halaman resmi Lakara (bukan halaman toko member).
if (!isTokoRoute.value) {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://lakara.id/#organization',
            name: 'PT Lakara Solusi Kreatif',
            alternateName: 'Lakara',
            url: 'https://lakara.id',
            logo: 'https://lakara.id/apple-touch-icon.png',
            description: 'Platform digital all-in-one: jasa website, social media management, Meta Ads, SEO, video TikTok, talent esports, plus link bio & storefront gratis.',
            sameAs: [
              'https://instagram.com/wearelakara',
              'https://youtube.com/@lakaracreative',
              'https://wa.me/6285161313693',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+6285161313693',
              contactType: 'customer service',
              areaServed: 'ID',
              availableLanguage: ['Indonesian'],
            },
          },
          {
            '@type': 'WebSite',
            '@id': 'https://lakara.id/#website',
            url: 'https://lakara.id',
            name: 'Lakara Solusi Kreatif',
            inLanguage: 'id-ID',
            publisher: { '@id': 'https://lakara.id/#organization' },
          },
        ],
      }),
    }],
  })
}
</script>
