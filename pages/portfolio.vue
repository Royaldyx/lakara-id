<template>
  <div>
    <Head><Title>Portofolio Lakara — Proyek Digital Terpilih</Title></Head>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-20 pb-16">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative text-center">
        <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Portofolio</span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Hasil Kerja Nyata Lakara</h1>
        <p class="text-gray-500 text-lg max-w-xl mx-auto">Website, social media, mobile app, dan berbagai proyek digital untuk klien dari berbagai industri.</p>
      </UContainer>
    </section>

    <!-- Loading -->
    <section v-if="pending" class="section bg-white">
      <UContainer>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div v-for="i in 6" :key="i" class="bg-gray-100 rounded-2xl h-72 animate-pulse" />
        </div>
      </UContainer>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="section bg-white">
      <UContainer class="text-center">
        <p class="text-gray-500">Gagal memuat portofolio. Silakan coba lagi.</p>
        <UButton @click="refresh()" class="mt-4" variant="outline" color="gray">Coba Lagi</UButton>
      </UContainer>
    </section>

    <!-- Portfolio grid -->
    <section v-else class="section bg-white">
      <UContainer>
        <!-- Category filter -->
        <div class="flex flex-wrap justify-center gap-2 mb-12">
          <button
            v-for="cat in ['Semua', ...categories]"
            :key="cat"
            @click="activeCategory = cat"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
            :class="activeCategory === cat
              ? 'bg-[#3358ff] text-white border-[#3358ff] shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-[#3358ff] hover:text-[#3358ff]'"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Grid -->
        <div v-if="filtered.length" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <NuxtLink
            v-for="item in filtered"
            :key="item.id"
            :to="`/portfolio/${item.slug}`"
            class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <!-- Image -->
            <div class="relative overflow-hidden h-48 bg-gray-100">
              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-photo" class="w-12 h-12 text-gray-300" />
              </div>
              <!-- Category badge -->
              <div class="absolute top-3 left-3">
                <span class="bg-white/90 backdrop-blur text-[#3358ff] text-xs font-semibold px-3 py-1 rounded-full">
                  {{ item.category }}
                </span>
              </div>
              <div v-if="item.featured" class="absolute top-3 right-3">
                <span class="bg-[#3358ff] text-white text-xs font-bold px-2.5 py-1 rounded-full">⭐ Featured</span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5">
              <h3 class="font-bold text-gray-900 mb-2 group-hover:text-[#3358ff] transition-colors line-clamp-2">
                {{ item.title }}
              </h3>
              <p class="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">{{ item.excerpt }}</p>

              <!-- Meta -->
              <div class="flex items-center justify-between">
                <div class="text-xs text-gray-400">
                  <span v-if="item.client">{{ item.client }}</span>
                  <span v-if="item.client && item.date"> · </span>
                  <span v-if="item.date">{{ formatDate(item.date) }}</span>
                </div>
                <div class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Detail <UIcon name="i-tabler-arrow-right" class="w-3 h-3" />
                </div>
              </div>

              <!-- Tags -->
              <div v-if="item.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag"
                  class="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state for filtered -->
        <div v-else class="text-center py-20">
          <UIcon name="i-tabler-folder-off" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p class="text-gray-500">Tidak ada portofolio di kategori ini.</p>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden py-24 bg-gradient-to-br from-[#3358ff] to-[#6366f1] text-white">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>
      <UContainer class="relative text-center">
        <h2 class="text-3xl font-extrabold mb-4">Mau jadi proyek berikutnya?</h2>
        <p class="text-blue-100 mb-8">Konsultasi gratis, tanpa komitmen. Kami bantu wujudkan ide digital Anda.</p>
        <UButton :to="wa('Halo Lakara, saya ingin diskusi project')" target="_blank" size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold" icon="i-tabler-brand-whatsapp">
          Konsultasi Sekarang
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()

const { data: res, pending, error, refresh } = await useFetch('/api/portfolio', {
  server: false,
  default: () => ({ success: false, data: [] }),
})

const portfolio = computed(() => (res.value?.data ?? []) as any[])

const categories = computed(() => {
  const cats = portfolio.value.map((i: any) => i.category).filter(Boolean)
  return [...new Set(cats)] as string[]
})

const activeCategory = ref('Semua')

const filtered = computed(() => {
  if (activeCategory.value === 'Semua') return portfolio.value
  return portfolio.value.filter((i: any) => i.category === activeCategory.value)
})

function formatDate(date: string) {
  if (!date) return ''
  const [y, m] = date.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
  return `${months[+m - 1] || ''} ${y}`
}
</script>
