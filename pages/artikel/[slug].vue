<template>
  <div v-if="artikel">
    <Head>
      <Title>{{ artikel.title }} — Lakara Blog</Title>
      <Meta name="description" :content="artikel.excerpt" />
      <Meta property="og:title" :content="artikel.title + ' . Lakara Blog'" />
      <Meta property="og:description" :content="artikel.excerpt" />
      <Meta property="og:image" :content="artikel.og_image || artikel.image || ''" />
      <Meta property="og:type" content="article" />
      <Link v-if="artikel.canonical" rel="canonical" :href="artikel.canonical" />
    </Head>

    <!-- Hero artikel -->
    <section class="bg-white pt-20 pb-0">
      <UContainer>
        <div class="max-w-3xl mx-auto">
          <!-- Breadcrumb -->
          <nav class="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <NuxtLink to="/" class="hover:text-gray-700 transition-colors">Beranda</NuxtLink>
            <UIcon name="i-tabler-chevron-right" class="w-3.5 h-3.5" />
            <NuxtLink to="/artikel" class="hover:text-gray-700 transition-colors">Blog</NuxtLink>
            <UIcon name="i-tabler-chevron-right" class="w-3.5 h-3.5" />
            <span class="text-gray-600 truncate max-w-xs">{{ artikel.title }}</span>
          </nav>

          <!-- Category badge -->
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <NuxtLink :to="`/artikel?category=${artikel.category}`"
              class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors">
              {{ artikel.category }}
            </NuxtLink>
            <span v-if="artikel.featured"
              class="inline-block bg-yellow-50 text-yellow-600 font-semibold text-sm px-3 py-1.5 rounded-full">
              ⭐ Featured
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            {{ artikel.title }}
          </h1>

          <!-- Meta -->
          <div class="flex flex-wrap items-center gap-5 text-sm text-gray-400 pb-8 border-b border-gray-100">
            <span class="flex items-center gap-1.5">
              <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#3358ff] to-indigo-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {{ (artikel.author || 'T')[0] }}
              </div>
              <span class="font-medium text-gray-700">{{ artikel.author || 'Tim Lakara' }}</span>
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-tabler-calendar" class="w-4 h-4" />
              {{ formatDate(artikel.created_at) }}
            </span>
            <span v-if="artikel.updated_at && artikel.updated_at !== artikel.created_at"
              class="flex items-center gap-1.5 text-xs">
              <UIcon name="i-tabler-refresh" class="w-3.5 h-3.5" />
              Diperbarui {{ formatDate(artikel.updated_at) }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-tabler-clock" class="w-4 h-4" />
              {{ artikel.read_time || 5 }} menit baca
            </span>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Cover image -->
    <section v-if="artikel.image" class="bg-white py-8">
      <UContainer>
        <div class="max-w-3xl mx-auto">
          <div class="rounded-3xl overflow-hidden shadow-xl border border-gray-100 h-72 md:h-96">
            <img :src="artikel.image" :alt="artikel.title" class="w-full h-full object-cover" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Konten artikel + sidebar -->
    <section class="py-10 bg-white">
      <UContainer>
        <div class="max-w-5xl mx-auto grid lg:grid-cols-4 gap-10">

          <!-- Konten utama -->
          <div class="lg:col-span-3">
            <!-- Excerpt / lead -->
            <p class="text-xl text-gray-600 leading-relaxed font-medium border-l-4 border-[#3358ff] pl-5 mb-8 italic">
              {{ artikel.excerpt }}
            </p>

            <!-- Body -->
            <div
              class="article-body prose max-w-none text-gray-700 leading-relaxed"
              v-html="artikel.content"
            />

            <!-- Tags -->
            <div v-if="artikel.tags?.length" class="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-100">
              <span class="text-sm text-gray-500 font-medium mr-1">Tags:</span>
              <NuxtLink
                v-for="tag in artikel.tags" :key="tag"
                :to="`/artikel?tag=${tag}`"
                class="bg-gray-100 hover:bg-blue-50 hover:text-[#3358ff] text-gray-600 text-sm px-3 py-1 rounded-full transition-colors">
                #{{ tag }}
              </NuxtLink>
            </div>

            <!-- Author card -->
            <div class="mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start gap-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#3358ff] to-indigo-400 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {{ (artikel.author || 'T')[0] }}
              </div>
              <div>
                <div class="font-bold text-gray-900">{{ artikel.author || 'Tim Lakara' }}</div>
                <div class="text-sm text-gray-500 mt-0.5">PT Lakara Solusi Kreatif . Innovating Creativity with Technology</div>
                <NuxtLink to="/about" class="text-sm text-[#3358ff] hover:underline mt-1 inline-block">Tentang Lakara →</NuxtLink>
              </div>
            </div>

            <!-- Share -->
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <span class="text-sm font-semibold text-gray-600">Bagikan:</span>
              <a :href="`https://wa.me/?text=${encodeURIComponent(artikel.title + ' — ' + pageUrl)}`"
                target="_blank"
                class="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <UIcon name="i-tabler-brand-whatsapp" class="w-4 h-4" /> WhatsApp
              </a>
              <a :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(artikel.title)}&url=${encodeURIComponent(pageUrl)}`"
                target="_blank"
                class="flex items-center gap-2 bg-sky-50 text-sky-600 hover:bg-sky-100 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <UIcon name="i-tabler-brand-x" class="w-4 h-4" /> Twitter/X
              </a>
              <button @click="copyLink"
                class="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <UIcon :name="copied ? 'i-tabler-check' : 'i-tabler-link'" class="w-4 h-4" />
                {{ copied ? 'Tersalin!' : 'Salin Link' }}
              </button>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="hidden lg:block">
            <div class="sticky top-24 space-y-6">

              <!-- Related articles -->
              <div v-if="related.length" class="bg-gray-50 rounded-2xl p-5">
                <h4 class="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
                  <UIcon name="i-tabler-books" class="w-4 h-4 text-[#3358ff]" /> Artikel Terkait
                </h4>
                <div class="space-y-4">
                  <NuxtLink v-for="rel in related" :key="rel.id" :to="`/artikel/${rel.slug}`"
                    class="flex gap-3 group">
                    <div class="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                      <img v-if="rel.image" :src="rel.image" :alt="rel.title" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-semibold text-gray-800 group-hover:text-[#3358ff] transition-colors line-clamp-2 leading-tight">{{ rel.title }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ rel.read_time || 5 }} min</p>
                    </div>
                  </NuxtLink>
                </div>
              </div>

              <!-- CTA sidebar -->
              <div class="bg-[#3358ff] rounded-2xl p-5 text-white">
                <h4 class="font-bold text-sm mb-2">Butuh Solusi Digital?</h4>
                <p class="text-blue-100 text-xs leading-relaxed mb-4">Konsultasi gratis dengan tim Lakara , web, app, marketing, & esports.</p>
                <NuxtLink :to="wa('Halo Lakara, saya ingin konsultasi setelah baca artikel ' + artikel.title)"
                  target="_blank"
                  class="block bg-white text-[#3358ff] text-xs font-bold px-4 py-2.5 rounded-xl text-center hover:bg-blue-50 transition-colors">
                  Chat WhatsApp
                </NuxtLink>
              </div>
            </div>
          </div>

        </div>
      </UContainer>
    </section>

    <!-- More articles -->
    <section v-if="moreArtikel.length" class="py-16 bg-gray-50">
      <UContainer>
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-extrabold text-gray-900">Artikel Lainnya</h2>
          <NuxtLink to="/artikel" class="text-sm text-[#3358ff] font-semibold hover:underline">Lihat semua →</NuxtLink>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink v-for="item in moreArtikel" :key="item.id" :to="`/artikel/${item.slug}`"
            class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="h-44 bg-gray-100 overflow-hidden">
              <img v-if="item.image" :src="item.image" :alt="item.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-article" class="w-10 h-10 text-gray-200" />
              </div>
            </div>
            <div class="p-5">
              <span class="text-xs font-semibold text-[#3358ff] bg-blue-50 px-2.5 py-0.5 rounded-full">{{ item.category }}</span>
              <h3 class="font-bold text-gray-900 mt-2 mb-1 group-hover:text-[#3358ff] transition-colors line-clamp-2 text-sm leading-snug">{{ item.title }}</h3>
              <p class="text-xs text-gray-400">{{ item.read_time || 5 }} menit baca</p>
            </div>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

  </div>

  <!-- 404 -->
  <div v-else class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center">
      <UIcon name="i-tabler-article-off" class="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Artikel tidak ditemukan</h1>
      <p class="text-gray-500 mb-6">Artikel yang Anda cari tidak ada atau sudah dihapus.</p>
      <NuxtLink to="/artikel" class="bg-[#3358ff] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition">
        ← Kembali ke Blog
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
const route  = useRoute()
const slug   = computed(() => route.params.slug as string)

const { data: res } = await useFetch('/api/artikel', {
  query:   { slug },   // pass computed ref, bukan .value , reaktif saat navigasi antar artikel
  server:  true,
  default: () => ({ success: false, data: null }),
})

const artikel = computed(() => res.value?.data as any || null)

const { data: allRes } = await useFetch('/api/artikel', {
  server: true, default: () => ({ success: false, data: [] }),
})
const allArtikel = computed(() => (allRes.value?.data ?? []) as any[])

const related = computed(() =>
  allArtikel.value
    .filter((i: any) => i.id !== artikel.value?.id && i.category === artikel.value?.category)
    .slice(0, 3)
)

const moreArtikel = computed(() =>
  allArtikel.value
    .filter((i: any) => i.id !== artikel.value?.id)
    .slice(0, 3)
)

const copied  = ref(false)
const pageUrl = computed(() => `https://lakara.id/artikel/${slug.value}`)

function formatDate(val: string) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(pageUrl.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch {}
}

// Hapus double 404 — sudah ada inline v-else block di template
</script>

<style>
.article-body h2 { @apply text-2xl font-extrabold text-gray-900 mt-10 mb-4; }
.article-body h3 { @apply text-xl font-bold text-gray-800 mt-8 mb-3; }
.article-body h4 { @apply text-lg font-bold text-gray-800 mt-6 mb-2; }
.article-body p  { @apply mb-4 leading-relaxed; }
.article-body ul { @apply list-disc list-inside mb-4 space-y-1.5 ml-2; }
.article-body ol { @apply list-decimal list-inside mb-4 space-y-1.5 ml-2; }
.article-body li { @apply text-gray-700; }
.article-body a  { @apply text-[#3358ff] underline underline-offset-2 hover:opacity-80; }
.article-body strong { @apply font-bold text-gray-900; }
.article-body em { @apply italic text-gray-600; }
.article-body blockquote { @apply border-l-4 border-[#3358ff] pl-5 py-2 my-6 bg-blue-50 rounded-r-xl italic text-gray-600; }
.article-body hr  { @apply border-gray-200 my-8; }
.article-body img { @apply rounded-2xl w-full my-6 shadow-md; }
.article-body pre { @apply bg-slate-900 text-slate-100 rounded-2xl p-5 overflow-x-auto text-sm my-6 leading-relaxed; }
.article-body code { @apply bg-slate-100 text-[#3358ff] px-1.5 py-0.5 rounded text-sm font-mono; }
.article-body table { @apply w-full border-collapse my-6 text-sm; }
.article-body th { @apply bg-gray-50 font-bold text-gray-700 px-4 py-2.5 border border-gray-200 text-left; }
.article-body td { @apply px-4 py-2.5 border border-gray-200 text-gray-600; }
</style>
