<template>
  <div v-if="store" class="min-h-screen bg-white">
    <Head>
      <Title>{{ store.name }} — {{ store.tagline }}</Title>
      <Meta name="description" :content="store.description || store.tagline" />
      <Meta property="og:title" :content="store.name" />
      <Meta property="og:description" :content="store.description || store.tagline || ''" />
      <Meta property="og:type" content="profile" />
      <Meta v-if="ogImage" property="og:image" :content="ogImage" />
      <Meta v-if="ogImage" name="twitter:card" content="summary" />
      <Meta v-if="ogImage" name="twitter:image" :content="ogImage" />
    </Head>

    <!-- Minimal header -->
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <NuxtLink :to="`/${store.slug}`" class="flex items-center gap-2 hover:opacity-80 transition">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
              :style="{ background: store.primary_color }">
              <img v-if="store.logo" :src="store.logo" class="w-full h-full object-cover" />
              <span v-else class="text-white font-bold text-xs">{{ store.name[0] }}</span>
            </div>
            <span class="font-bold text-gray-900 text-sm">{{ store.name }}</span>
          </NuxtLink>
        </div>
        <div class="flex gap-3">
          <a v-if="store.instagram" :href="store.instagram" target="_blank" class="text-gray-400 hover:text-pink-500 transition">
            <UIcon name="i-tabler-brand-instagram" class="w-5 h-5" />
          </a>
          <a v-if="store.tiktok" :href="store.tiktok" target="_blank" class="text-gray-400 hover:text-black transition">
            <UIcon name="i-tabler-brand-tiktok" class="w-5 h-5" />
          </a>
          <a v-if="store.youtube" :href="store.youtube" target="_blank" class="text-gray-400 hover:text-red-500 transition">
            <UIcon name="i-tabler-brand-youtube" class="w-5 h-5" />
          </a>
          <a v-if="store.whatsapp" :href="`https://wa.me/${store.whatsapp}`" target="_blank" class="text-gray-400 hover:text-green-500 transition">
            <UIcon name="i-tabler-brand-whatsapp" class="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>

    <!-- Hero banner -->
    <section class="py-20 text-center" :style="{ background: store.primary_color + '15' }">
      <div class="max-w-2xl mx-auto px-4">
        <div class="w-24 h-24 rounded-3xl overflow-hidden mx-auto mb-6 shadow-xl border-4 border-white"
          :style="{ background: store.primary_color }">
          <img v-if="store.logo" :src="store.logo" class="w-full h-full object-cover" />
          <span v-else class="w-full h-full flex items-center justify-center text-white font-extrabold text-4xl">
            {{ store.name[0] }}
          </span>
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{{ store.name }}</h1>
        <p class="text-xl text-gray-500 mb-6">{{ store.tagline }}</p>
        <p v-if="store.description" class="text-gray-600 max-w-lg mx-auto leading-relaxed">{{ store.description }}</p>
      </div>
    </section>

    <!-- Divider banner -->
    <div class="py-3 text-white text-center text-sm font-semibold" :style="{ background: store.primary_color }">
      {{ store.tagline }}
    </div>

    <!-- Products grid -->
    <section class="py-20 bg-white">
      <div class="max-w-5xl mx-auto px-4">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-widest mb-2 block" :style="{ color: store.primary_color }">Koleksi</span>
          <h2 class="text-3xl font-extrabold text-gray-900">Produk Kami</h2>
        </div>

        <div v-if="products.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink v-for="product in products" :key="product.id"
            :to="`/${store.slug}/${product.slug}`"
            class="group block">
            <div class="rounded-2xl overflow-hidden bg-gray-100 mb-4 relative" :class="imgAspectClass">
              <img v-if="product.images?.[0]" :src="product.images[0]" :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-photo" class="w-12 h-12 text-gray-300" />
              </div>
              <div v-if="product.price_original" class="absolute top-3 left-3">
                <span class="text-white text-xs font-bold px-2.5 py-1 rounded-full"
                  :style="{ background: store.primary_color }">SALE</span>
              </div>
            </div>
            <h3 class="font-bold text-gray-900 mb-1 group-hover:opacity-70 transition-opacity">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 mb-2 line-clamp-1">{{ product.tagline }}</p>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-lg" :style="{ color: store.primary_color }">
                {{ formatPrice(product.price) }}
              </span>
              <span v-if="product.price_original" class="text-sm text-gray-400 line-through">
                {{ formatPrice(product.price_original) }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-center py-20">
          <UIcon name="i-tabler-box-off" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p class="text-gray-500">Belum ada produk tersedia.</p>
        </div>
      </div>
    </section>

    <!-- Why Buy -->
    <section v-if="store.why_buy?.length" class="py-20 bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <span class="text-xs font-bold uppercase tracking-widest mb-2 block" :style="{ color: store.primary_color }">Kenapa Kami?</span>
        <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Kenapa Beli dari {{ store.name }}?</h2>
        <p class="text-gray-500 mb-14 max-w-xl mx-auto">{{ store.description }}</p>
        <div class="grid md:grid-cols-3 gap-6 text-left">
          <div v-for="(item, i) in store.why_buy" :key="i"
            class="bg-white rounded-2xl p-7 shadow-sm hover:shadow-md transition-all border border-gray-100">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white text-xl font-extrabold"
              :style="{ background: store.primary_color }">{{ i + 1 }}</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ item.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 text-white text-center" :style="{ background: store.primary_color }">
      <div class="max-w-2xl mx-auto px-4">
        <h2 class="text-3xl font-extrabold mb-4">Temukan Produk Favoritmu!</h2>
        <p class="text-white/80 mb-10">Pilih koleksi yang cocok untukmu dan beli langsung di marketplace.</p>
        <div class="flex flex-wrap justify-center gap-3">
          <a v-if="store.instagram" :href="store.instagram" target="_blank"
            class="flex items-center gap-2 bg-white/20 hover:bg-white/30 font-semibold px-5 py-3 rounded-xl text-sm transition">
            <UIcon name="i-tabler-brand-instagram" class="w-4 h-4" /> Instagram
          </a>
          <a v-if="store.tiktok" :href="store.tiktok" target="_blank"
            class="flex items-center gap-2 bg-white/20 hover:bg-white/30 font-semibold px-5 py-3 rounded-xl text-sm transition">
            <UIcon name="i-tabler-brand-tiktok" class="w-4 h-4" /> TikTok
          </a>
          <a v-if="store.youtube" :href="store.youtube" target="_blank"
            class="flex items-center gap-2 bg-white/20 hover:bg-white/30 font-semibold px-5 py-3 rounded-xl text-sm transition">
            <UIcon name="i-tabler-brand-youtube" class="w-4 h-4" /> YouTube
          </a>
          <a v-if="store.whatsapp" :href="`https://wa.me/${store.whatsapp}`" target="_blank"
            class="flex items-center gap-2 bg-white font-bold px-5 py-3 rounded-xl text-sm transition hover:bg-gray-50"
            :style="{ color: store.primary_color }">
            <UIcon name="i-tabler-brand-whatsapp" class="w-4 h-4" /> Chat Kami
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 bg-white border-t border-gray-100 text-center">
      <p class="text-sm text-gray-400">
        &copy; {{ new Date().getFullYear() }} {{ store.name }} &middot; Landing page by
        <a href="https://lakara.id" class="text-[#3358ff] font-semibold hover:underline">Lakara</a>
      </p>
    </footer>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-tabler-box-off" class="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Toko tidak ditemukan</h1>
      <NuxtLink to="/" class="text-[#3358ff] font-semibold hover:underline">&#8592; Kembali ke Lakara</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route    = useRoute()
const tokoSlug = route.params.toko as string

const { data: res } = await useFetch('/api/stores', {
  query: { slug: tokoSlug }, server: true,
  default: () => ({ success: false, data: null }),
})

const store    = computed(() => res.value?.data ?? null)
const products = computed(() => store.value?.products ?? [])
const imgAspectClass = computed(() => store.value?.product_image_ratio === '3:4' ? 'aspect-[3/4]' : 'aspect-square')
const ogImage = computed(() => {
  const logo = store.value?.logo
  if (!logo) return ''
  if (/^https?:\/\//i.test(logo)) return logo
  return 'https://lakara.id' + (logo.startsWith('/') ? logo : '/' + logo)
})

if (process.server && !res.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Toko tidak ditemukan.' })
}
watchEffect(() => {
  if (process.client && res.value && !res.value.data) {
    throw createError({ statusCode: 404, statusMessage: 'Toko tidak ditemukan.' })
  }
})

function formatPrice(val: number) {
  if (!val) return 'Hubungi kami'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
</script>
