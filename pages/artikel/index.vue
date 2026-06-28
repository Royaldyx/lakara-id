<template>
  <div>
    <Head>
      <Title>Blog & Artikel — Lakara</Title>
      <Meta name="description" content="Tips, tutorial, dan insight seputar web development, digital marketing, esports, dan dunia kreatif dari tim Lakara." />
    </Head>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-24 pb-16">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative">
        <div class="max-w-2xl">
          <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Blog & Artikel
          </span>
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Tips, Insight &<br class="hidden md:block" /> Cerita dari Tim Lakara
          </h1>
          <p class="text-gray-500 text-lg leading-relaxed">
            Tutorial, opini, dan behind-the-scene seputar web development, digital marketing, dan esports Indonesia.
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Loading -->
    <section v-if="pending" class="py-20 bg-white">
      <UContainer>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-gray-100 rounded-2xl h-72 animate-pulse" />
        </div>
      </UContainer>
    </section>

    <section v-else class="py-14 bg-white">
      <UContainer>
        <!-- Filter kategori -->
        <div class="flex flex-wrap gap-2 mb-10">
          <button
            v-for="cat in ['Semua', ...categories]" :key="cat"
            @click="activeCategory = cat"
            class="px-4 py-2 rounded-full text-sm font-semibold border transition-all"
            :class="activeCategory === cat
              ? 'bg-[#3358ff] text-white border-[#3358ff] shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#3358ff] hover:text-[#3358ff]'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Featured artikel (jika ada) -->
        <div v-if="featuredItem && activeCategory === 'Semua'" class="mb-12">
          <NuxtLink :to="`/artikel/${featuredItem.slug}`"
            class="group grid md:grid-cols-2 gap-0 bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div class="relative h-64 md:h-auto bg-gray-100 overflow-hidden">
              <img v-if="featuredItem.image" :src="featuredItem.image" :alt="featuredItem.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-article" class="w-16 h-16 text-gray-200" />
              </div>
              <div class="absolute top-4 left-4">
                <span class="bg-[#3358ff] text-white text-xs font-bold px-3 py-1.5 rounded-full">⭐ Featured</span>
              </div>
            </div>
            <div class="p-8 flex flex-col justify-center">
              <span class="inline-block bg-blue-50 text-[#3358ff] text-xs font-semibold px-3 py-1 rounded-full mb-4 self-start">
                {{ featuredItem.category }}
              </span>
              <h2 class="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-[#3358ff] transition-colors leading-tight">
                {{ featuredItem.title }}
              </h2>
              <p class="text-gray-500 leading-relaxed mb-6 line-clamp-3">{{ featuredItem.excerpt }}</p>
              <div class="flex items-center gap-4 text-sm text-gray-400">
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-tabler-user" class="w-4 h-4" /> {{ featuredItem.author || 'Tim Lakara' }}
                </span>
                <span class="flex items-center gap-1.5">
                  <UIcon name="i-tabler-clock" class="w-4 h-4" /> {{ featuredItem.read_time || 5 }} menit baca
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Grid artikel -->
        <div v-if="filtered.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="item in gridItems"
            :key="item.id"
            :to="`/artikel/${item.slug}`"
            class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
          >
            <!-- Cover -->
            <div class="relative overflow-hidden h-48 bg-gray-100 flex-shrink-0">
              <img v-if="item.image" :src="item.image" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-article" class="w-12 h-12 text-gray-200" />
              </div>
              <div class="absolute top-3 left-3">
                <span class="bg-white/90 backdrop-blur text-[#3358ff] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {{ item.category }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5 flex flex-col flex-1">
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-[#3358ff] transition-colors line-clamp-2 leading-snug">
                {{ item.title }}
              </h3>
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4 flex-1">{{ item.excerpt }}</p>

              <div class="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-tabler-user" class="w-3.5 h-3.5" /> {{ item.author || 'Tim Lakara' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-tabler-clock" class="w-3.5 h-3.5" /> {{ item.read_time || 5 }} min
                  </span>
                </div>
                <span class="flex items-center gap-1 text-[#3358ff] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Baca <UIcon name="i-tabler-arrow-right" class="w-3 h-3" />
                </span>
              </div>

              <!-- Tags -->
              <div v-if="item.tags?.length" class="flex flex-wrap gap-1 mt-3">
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag"
                  class="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-20">
          <UIcon name="i-tabler-article-off" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p class="text-gray-500">Belum ada artikel di kategori ini.</p>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-[#3358ff]">
      <UContainer class="text-center">
        <h2 class="text-3xl font-extrabold text-white mb-3">Punya proyek atau kolaborasi?</h2>
        <p class="text-blue-100 mb-8">Kami terbuka untuk diskusi , konsultasi gratis, tanpa komitmen.</p>
        <UButton :to="wa('Halo Lakara, saya ingin konsultasi')" target="_blank" size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold" icon="i-tabler-brand-whatsapp">
          Chat WhatsApp
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()

const { data: res, pending } = await useFetch('/api/artikel', {
  server: true, default: () => ({ success: false, data: [] }),
})

const artikel = computed(() => (res.value?.data ?? []) as any[])

const categories = computed(() => {
  const cats = artikel.value.map((i: any) => i.category).filter(Boolean)
  return [...new Set(cats)] as string[]
})

const route          = useRoute()
const activeCategory = ref((route.query.category as string) || 'Semua')

const filtered = computed(() => {
  if (activeCategory.value === 'Semua') return artikel.value
  return artikel.value.filter((i: any) => i.category === activeCategory.value)
})

const featuredItem = computed(() => artikel.value.find((i: any) => i.featured))
const gridItems    = computed(() => {
  if (activeCategory.value === 'Semua' && featuredItem.value) {
    return filtered.value.filter((i: any) => i.id !== featuredItem.value?.id)
  }
  return filtered.value
})
</script>
