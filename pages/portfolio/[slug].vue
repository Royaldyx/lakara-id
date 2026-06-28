<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-8 h-8 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-gray-500 text-sm">Memuat...</p>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!item" class="min-h-screen flex items-center justify-center">
      <UContainer class="text-center py-24">
        <div class="text-6xl font-extrabold text-[#3358ff] mb-4">404</div>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Proyek tidak ditemukan</h1>
        <UButton to="/portfolio" style="background-color: #3358ff;" class="font-semibold">← Kembali ke Portofolio</UButton>
      </UContainer>
    </div>

    <!-- Item found -->
    <div v-else>
      <Head>
        <Title>{{ item.title }} — Portofolio Lakara</Title>
        <Meta name="description" :content="item.excerpt" />
        <Meta property="og:title" :content="item.title + ' — Lakara'" />
        <Meta property="og:description" :content="item.excerpt" />
        <Meta v-if="item.image" property="og:image" :content="item.image" />
      </Head>

      <!-- Hero -->
      <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 pt-20 pb-12">
        <UContainer>
          <!-- Breadcrumb -->
          <div class="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <NuxtLink to="/" class="hover:text-[#3358ff] transition-colors">Beranda</NuxtLink>
            <span>/</span>
            <NuxtLink to="/portfolio" class="hover:text-[#3358ff] transition-colors">Portofolio</NuxtLink>
            <span>/</span>
            <span class="text-gray-600 truncate max-w-[200px]">{{ item.title }}</span>
          </div>

          <div class="grid lg:grid-cols-3 gap-10 items-start">
            <div class="lg:col-span-2">
              <span class="inline-block bg-blue-50 text-[#3358ff] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">{{ item.category }}</span>
              <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{{ item.title }}</h1>
              <p v-if="item.excerpt" class="text-lg text-gray-500 leading-relaxed">{{ item.excerpt }}</p>
            </div>

            <!-- Meta card -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div v-if="item.client" class="flex items-start gap-3">
                <div class="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-tabler-building" class="w-4 h-4 text-[#3358ff]" />
                </div>
                <div>
                  <div class="text-xs text-gray-400 font-medium">Klien</div>
                  <div class="text-sm font-semibold text-gray-900">{{ item.client }}</div>
                </div>
              </div>
              <div v-if="item.date" class="flex items-start gap-3">
                <div class="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon name="i-tabler-calendar" class="w-4 h-4 text-[#3358ff]" />
                </div>
                <div>
                  <div class="text-xs text-gray-400 font-medium">Tanggal</div>
                  <div class="text-sm font-semibold text-gray-900">{{ formatDate(item.date) }}</div>
                </div>
              </div>
              <div v-if="item.tags?.length" class="flex flex-wrap gap-1.5 pt-1">
                <span v-for="tag in item.tags" :key="tag"
                  class="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full">{{ tag }}</span>
              </div>
              <div v-if="item.link" class="pt-2">
                <a :href="item.link" target="_blank" rel="noopener"
                  class="flex items-center gap-2 text-sm text-[#3358ff] font-semibold hover:underline">
                  <UIcon name="i-tabler-external-link" class="w-4 h-4" />
                  Lihat Project
                </a>
              </div>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- Cover image -->
      <section v-if="item.image" class="bg-gray-50">
        <UContainer>
          <img :src="item.image" :alt="item.title"
            class="w-full max-h-[500px] object-cover rounded-2xl shadow-lg" loading="lazy" />
        </UContainer>
      </section>

      <!-- Content -->
      <section class="section bg-white">
        <UContainer>
          <div class="max-w-3xl mx-auto">
            <div class="prose prose-gray prose-lg max-w-none">
              <div v-if="item.content" v-html="formattedContent" />
              <p v-else class="text-gray-400 italic">Deskripsi belum tersedia.</p>
            </div>
          </div>
        </UContainer>
      </section>

      <!-- Navigation -->
      <section class="py-12 bg-gray-50 border-t border-gray-100">
        <UContainer>
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <UButton to="/portfolio" variant="outline" color="gray" icon="i-tabler-arrow-left" class="font-semibold">
              Semua Portofolio
            </UButton>
            <UButton :to="wa(`Halo Lakara, saya tertarik dengan proyek ${item.title}`)" target="_blank"
              style="background-color: #3358ff;" icon="i-tabler-brand-whatsapp" class="font-semibold">
              Diskusi Proyek Serupa
            </UButton>
          </div>
        </UContainer>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
const route  = useRoute()
const slug   = route.params.slug as string

const { data: res, pending } = await useFetch('/api/portfolio', {
  query:   { slug },
  server:  false,
  default: () => ({ success: false, data: null }),
})

const item = computed(() => (res.value?.data ?? null) as any)

const formattedContent = computed(() => {
  if (!item.value?.content) return ''
  return item.value.content
    .split('\n\n')
    .map((p: string) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
})

function formatDate(date: string) {
  if (!date) return ''
  const [y, m] = date.split('-')
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  return `${months[+m - 1] || ''} ${y}`
}
</script>
