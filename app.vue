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
</script>
