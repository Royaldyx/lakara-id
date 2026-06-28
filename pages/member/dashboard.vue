<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Dashboard</h1>
      <p class="text-slate-500 text-sm mt-0.5">Selamat datang, <strong>{{ store?.name }}</strong> 👋</p>
    </div>

    <!-- Store status banner -->
    <div class="rounded-2xl p-5 mb-8 flex items-center gap-4"
      :style="{ background: store?.primary_color + '12', border: `1.5px solid ${store?.primary_color}30` }">
      <div class="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-white shadow-sm flex items-center justify-center">
        <img v-if="store?.logo" :src="store.logo" class="w-full h-full object-contain p-1" />
        <span v-else class="text-xl font-black" :style="{ color: store?.primary_color }">{{ store?.name?.[0] }}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-slate-900 truncate">{{ store?.name }}</div>
        <a v-if="store?.slug" :href="`/${store.slug}`" target="_blank"
          class="text-xs font-mono hover:underline block truncate" :style="{ color: store?.primary_color }">
          lakara.id/{{ store.slug }}
        </a>
        <p class="text-xs text-slate-500 mt-0.5 truncate">{{ store?.tagline }}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
        :class="store?.active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
        {{ store?.active !== false ? 'Aktif' : 'Nonaktif' }}
      </span>
    </div>

    <!-- Onboarding checklist (sembunyi otomatis kalau sudah lengkap) -->
    <div v-if="store && !onboarding.done" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
      <div class="flex items-center justify-between gap-3 mb-1">
        <div class="flex items-center gap-2">
          <UIcon name="i-tabler-rocket" class="w-5 h-5" :style="{ color: store?.primary_color }" />
          <h2 class="font-bold text-slate-900">Lengkapi tokomu</h2>
        </div>
        <span class="text-sm font-extrabold" :style="{ color: store?.primary_color }">{{ onboarding.filled }}/{{ onboarding.total }}</span>
      </div>
      <p class="text-xs text-slate-400 mb-4">Toko yang lengkap lebih dipercaya & gampang ditemukan. Selesaikan langkah di bawah 👇</p>

      <!-- Progress bar -->
      <div class="h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
        <div class="h-full rounded-full transition-all duration-500"
          :style="{ width: onboarding.pct + '%', background: store?.primary_color }" />
      </div>

      <div class="space-y-2">
        <component :is="step.done ? 'div' : 'NuxtLink'" v-for="step in onboarding.steps" :key="step.key"
          :to="step.done ? undefined : step.to"
          class="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
          :class="step.done ? 'opacity-60' : 'hover:bg-slate-50 cursor-pointer'">
          <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            :class="step.done ? 'bg-green-100' : 'bg-slate-100'">
            <UIcon :name="step.done ? 'i-tabler-check' : step.icon"
              class="w-3.5 h-3.5" :class="step.done ? 'text-green-600' : 'text-slate-400'" />
          </div>
          <span class="text-sm flex-1 min-w-0" :class="step.done ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'">{{ step.label }}</span>
          <UIcon v-if="!step.done" name="i-tabler-chevron-right" class="w-4 h-4 text-slate-300 flex-shrink-0" />
        </component>
      </div>
    </div>

    <!-- Banner sukses sekali lengkap -->
    <div v-else-if="store && onboarding.done && showDone"
      class="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
        <UIcon name="i-tabler-confetti" class="w-5 h-5 text-green-600" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-green-900 text-sm">Tokomu sudah lengkap! 🎉</div>
        <div class="text-xs text-green-700">Mantap. Sekarang fokus bagikan link bio kamu ke audiens.</div>
      </div>
      <button @click="showDone = false" class="p-1.5 rounded-lg hover:bg-green-100 text-green-500 flex-shrink-0">
        <UIcon name="i-tabler-x" class="w-4 h-4" />
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :class="stat.bg">
          <UIcon :name="stat.icon" class="w-5 h-5" :class="stat.color" />
        </div>
        <div class="text-2xl font-extrabold text-slate-900">{{ stat.value }}</div>
        <div class="text-xs text-slate-400 mt-0.5">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Referral -->
    <div v-if="store" class="rounded-2xl p-5 mb-8 bg-gradient-to-br from-[#3358ff] to-[#6d4aff] text-white">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><UIcon name="i-tabler-gift" class="w-5 h-5" /></div>
        <div class="min-w-0 flex-1">
          <h2 class="font-bold">Ajak teman, dapat Pro gratis</h2>
          <p class="text-xs text-white/80 mt-0.5">Tiap teman yang daftar lewat link kamu lalu upgrade, <strong>kalian berdua dapat +1 bulan Pro</strong>.</p>

          <div class="flex items-center gap-2 mt-3">
            <div class="flex-1 min-w-0 bg-white/15 rounded-lg px-3 py-2 text-xs font-mono truncate">{{ referralLink }}</div>
            <button @click="copyReferral" class="px-3 py-2 bg-white text-[#3358ff] text-xs font-bold rounded-lg hover:bg-white/90 transition flex-shrink-0">
              {{ copied ? 'Tersalin!' : 'Salin' }}
            </button>
          </div>

          <div v-if="referral" class="flex gap-4 mt-3 text-xs">
            <span><strong class="text-sm">{{ referral.total }}</strong> diundang</span>
            <span><strong class="text-sm">{{ referral.rewarded }}</strong> upgrade · dapat reward</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="grid md:grid-cols-3 gap-5">
      <NuxtLink to="/member/products/edit?action=add"
        class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          :style="{ background: store?.primary_color }">
          <UIcon name="i-tabler-plus" class="w-5 h-5 text-white" />
        </div>
        <div>
          <div class="font-bold text-slate-900 text-sm">Tambah Produk</div>
          <div class="text-xs text-slate-400">Tambah produk baru ke toko</div>
        </div>
      </NuxtLink>

      <NuxtLink to="/member/store"
        class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-50 transition-transform group-hover:scale-110">
          <UIcon name="i-tabler-pencil" class="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <div class="font-bold text-slate-900 text-sm">Edit Info Toko</div>
          <div class="text-xs text-slate-400">Logo, tagline, sosial media</div>
        </div>
      </NuxtLink>

      <a v-if="store?.slug" :href="`/${store.slug}`" target="_blank"
        class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-50 transition-transform group-hover:scale-110">
          <UIcon name="i-tabler-external-link" class="w-5 h-5 text-green-500" />
        </div>
        <div>
          <div class="font-bold text-slate-900 text-sm">Lihat Toko</div>
          <div class="text-xs text-slate-400">Buka halaman publik toko</div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store = computed(() => storeData.value)

const referral = ref<any>(null)
const copied = ref(false)
const referralLink = computed(() =>
  `lakara.id/member/register?ref=${store.value?.slug || ''}`
)
async function copyReferral() {
  try {
    await navigator.clipboard.writeText('https://' + referralLink.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch { /* ignore */ }
}

onMounted(async () => {
  if (!store.value) await fetchStore()
  try { referral.value = await $fetch('/api/member/referral') } catch { /* ignore */ }
})

const showDone = ref(true)

const onboarding = computed(() => {
  const s = store.value || {}
  const lb = s.links_bio || {}
  const hasLogo    = !!s.logo
  const hasTagline = !!(s.tagline && s.tagline.trim())
  const hasLink    = Array.isArray(lb.links) && lb.links.some((l: any) => l?.enabled !== false && (l?.url || l?.type === 'gif'))
  const hasProduct = Array.isArray(s.products) && s.products.length > 0
  const hasSocial  = !!(s.instagram || s.tiktok || s.whatsapp || s.youtube ||
    (Array.isArray(lb.socials) && lb.socials.some((x: any) => x?.url)))

  const steps = [
    { key: 'logo',    label: 'Upload foto profil / logo', icon: 'i-tabler-photo',        done: hasLogo,    to: '/member/store' },
    { key: 'tagline', label: 'Tulis tagline toko',        icon: 'i-tabler-writing',      done: hasTagline, to: '/member/store' },
    { key: 'social',  label: 'Hubungkan sosial media',    icon: 'i-tabler-brand-instagram', done: hasSocial, to: '/member/store' },
    { key: 'link',    label: 'Tambah link bio pertama',   icon: 'i-tabler-link',         done: hasLink,    to: '/member/links' },
    { key: 'product', label: 'Tambah produk pertama',     icon: 'i-tabler-box',          done: hasProduct, to: '/member/products/edit?action=add' },
  ]
  const filled = steps.filter(s => s.done).length
  const total  = steps.length
  return { steps, filled, total, pct: Math.round((filled / total) * 100), done: filled === total }
})

const stats = computed(() => [
  {
    label: 'Total Produk', icon: 'i-tabler-box', color: 'text-[#3358ff]', bg: 'bg-blue-50',
    value: (store.value?.products || []).length,
  },
  {
    label: 'Produk Live', icon: 'i-tabler-eye', color: 'text-green-500', bg: 'bg-green-50',
    value: (store.value?.products || []).filter((p: any) => p.published !== false).length,
  },
  {
    label: 'Draft', icon: 'i-tabler-eye-off', color: 'text-slate-400', bg: 'bg-slate-50',
    value: (store.value?.products || []).filter((p: any) => p.published === false).length,
  },
  {
    label: 'Marketplace', icon: 'i-tabler-shopping-cart', color: 'text-orange-500', bg: 'bg-orange-50',
    value: (store.value?.products || []).reduce((acc: number, p: any) =>
      acc + Object.values(p.marketplace || {}).filter(Boolean).length, 0),
  },
])
</script>
