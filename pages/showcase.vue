<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Hero -->
    <section class="max-w-5xl mx-auto px-5 pt-16 pb-8 text-center">
      <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#3358ff] bg-[#3358ff]/10 px-3 py-1.5 rounded-full mb-4">
        <UIcon name="i-tabler-sparkles" class="w-3.5 h-3.5" /> Showcase
      </span>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Dibuat dengan Lakara</h1>
      <p class="text-slate-500 max-w-xl mx-auto leading-relaxed">
        Link bio & toko keren dari creator dan brand di seluruh Indonesia. Bikin punyamu juga — gratis.
      </p>
      <NuxtLink to="/member/register"
        class="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-[#3358ff] text-white text-sm font-bold rounded-xl hover:bg-[#2244ee] transition shadow-lg shadow-[#3358ff]/30">
        <UIcon name="i-tabler-rocket" class="w-4 h-4" /> Buat Link Bio Gratis
      </NuxtLink>
    </section>

    <!-- Grid -->
    <section class="max-w-5xl mx-auto px-5 pb-20">
      <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="n in 8" :key="n" class="bg-white rounded-2xl border border-slate-100 h-56 animate-pulse" />
      </div>

      <div v-else-if="!stores.length" class="text-center py-20 text-slate-400">
        <UIcon name="i-tabler-mood-empty" class="w-12 h-12 mx-auto mb-3" />
        <p class="text-sm">Belum ada toko di showcase. Jadilah yang pertama!</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <a v-for="s in stores" :key="s.slug" :href="`/${s.slug}`" target="_blank" rel="noopener"
          class="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
          <!-- Cover -->
          <div class="h-24 relative overflow-hidden" :style="{ background: `linear-gradient(135deg, ${s.primary_color}, ${shade(s.primary_color)})` }">
            <!-- glow accents -->
            <div class="absolute -top-8 -right-6 w-24 h-24 rounded-full bg-white/15 blur-2xl"></div>
            <div class="absolute -bottom-10 -left-4 w-24 h-24 rounded-full bg-black/10 blur-2xl"></div>
            <!-- tier badge -->
            <span v-if="s.tier && s.tier !== 'free'"
              class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full bg-white/95 shadow-sm"
              :class="s.tier === 'premium' ? 'text-purple-600' : 'text-[#3358ff]'">
              <UIcon :name="s.tier === 'premium' ? 'i-tabler-crown' : 'i-tabler-bolt'" class="w-3 h-3" />
              {{ s.tier }}
            </span>
          </div>

          <!-- Body -->
          <div class="relative z-10 px-4 pb-4 -mt-10">
            <!-- Avatar -->
            <div class="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white bg-white shadow-md flex items-center justify-center mb-3"
              :style="{ background: s.primary_color + '15' }">
              <img v-if="s.logo" :src="s.logo" :alt="s.name" loading="lazy" class="w-full h-full object-cover" />
              <span v-else class="text-2xl font-black" :style="{ color: s.primary_color }">{{ s.name[0]?.toUpperCase() }}</span>
            </div>

            <!-- Name -->
            <div class="flex items-center gap-1 min-w-0">
              <h3 class="font-extrabold text-slate-900 truncate group-hover:text-[#3358ff] transition-colors">{{ s.name }}</h3>
              <UIcon v-if="s.verified" name="i-tabler-rosette-discount-check-filled" class="w-4 h-4 text-[#3358ff] flex-shrink-0" />
            </div>
            <p class="text-xs text-slate-400 font-mono truncate mt-0.5">lakara.id/{{ s.slug }}</p>
            <p v-if="s.tagline" class="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed min-h-[2rem]">{{ s.tagline }}</p>

            <!-- Footer: socials + CTA -->
            <div class="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
              <span v-if="s.socials.instagram" class="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-pink-500 transition-colors"><UIcon name="i-tabler-brand-instagram" class="w-3.5 h-3.5" /></span>
              <span v-if="s.socials.tiktok" class="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors"><UIcon name="i-tabler-brand-tiktok" class="w-3.5 h-3.5" /></span>
              <span v-if="s.socials.youtube" class="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors"><UIcon name="i-tabler-brand-youtube" class="w-3.5 h-3.5" /></span>
              <span v-if="s.socials.whatsapp" class="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-green-500 transition-colors"><UIcon name="i-tabler-brand-whatsapp" class="w-3.5 h-3.5" /></span>
              <span class="ml-auto inline-flex items-center gap-0.5 text-[11px] font-bold text-[#3358ff] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
                Lihat <UIcon name="i-tabler-arrow-right" class="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Showcase — Link Bio & Toko Keren | Lakara',
  description: 'Kumpulan link bio dan toko online keren yang dibuat dengan Lakara. Bikin punyamu gratis di lakara.id.',
  ogTitle: 'Showcase Lakara — Dibuat oleh Creator Indonesia',
  ogDescription: 'Lihat link bio & toko keren dari creator dan brand di seluruh Indonesia.',
})

const { data, pending } = await useFetch<{ success: boolean; data: any[] }>('/api/public/showcase', {
  default: () => ({ success: false, data: [] }),
})
const stores = computed(() => data.value?.data || [])

// Bikin warna gradient kedua sedikit lebih gelap dari primary_color
function shade(hex: string) {
  try {
    const h = (hex || '#3358ff').replace('#', '')
    const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
    const r = Math.max(0, (num >> 16 & 255) - 40)
    const g = Math.max(0, (num >> 8 & 255) - 40)
    const b = Math.max(0, (num & 255) - 40)
    return `rgb(${r},${g},${b})`
  } catch { return hex }
}
</script>
