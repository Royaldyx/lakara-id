<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Dashboard</h1>
      <p class="text-slate-500 text-sm mt-0.5">Halo, <strong>{{ user?.name }}</strong> 👋</p>
    </div>

    <div v-if="loading" class="text-center py-20 text-slate-400">
      <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" />
    </div>

    <template v-else>
      <!-- Onboarding: profil belum lengkap -->
      <NuxtLink v-if="onboarding && !onboarding.complete" to="/client/profile"
        class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 hover:bg-amber-100/70 transition">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"><UIcon name="i-tabler-user-exclamation" class="w-5 h-5 text-amber-600" /></div>
        <div class="min-w-0 flex-1">
          <div class="font-bold text-amber-900 text-sm">Lengkapi profil brand kamu</div>
          <div class="text-xs text-amber-700">Terisi {{ onboarding.filled }}/{{ onboarding.total }} — bantu tim kami bikin konten yang lebih pas.</div>
        </div>
        <UIcon name="i-tabler-chevron-right" class="w-5 h-5 text-amber-400" />
      </NuxtLink>

      <!-- Paket -->
      <div class="rounded-2xl p-5 bg-gradient-to-br from-[#3358ff] to-[#6d4aff] text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs uppercase tracking-widest opacity-80">Paket Aktif</div>
            <div class="text-2xl font-extrabold mt-1">{{ data?.package?.name || 'Belum ada paket' }}</div>
          </div>
          <span v-if="data?.package" class="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase">{{ data.package.status }}</span>
        </div>
        <div v-if="data?.package" class="flex gap-6 mt-4 text-sm">
          <div><span class="opacity-70">Kuota konten:</span> <strong>{{ data.package.content_quota }}/bln</strong></div>
          <div><span class="opacity-70">Limit revisi:</span> <strong>{{ data.package.revision_limit }}/konten</strong></div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="s in statCards" :key="s.label" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :class="s.bg">
            <UIcon :name="s.icon" class="w-5 h-5" :class="s.color" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900">{{ s.value }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ s.label }}</div>
        </div>
      </div>

      <!-- Performa sosial -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h2 class="font-bold text-slate-900 mb-4">Ringkasan Performa Media Sosial</h2>
        <div v-if="data?.social" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="m in socialCards" :key="m.label" class="text-center">
            <div class="text-xl font-extrabold text-slate-900">{{ m.value }}</div>
            <div class="text-xs text-slate-400 mt-0.5">{{ m.label }}</div>
          </div>
        </div>
        <div v-else class="text-sm text-slate-400 py-6 text-center">
          Belum ada data performa. Hubungkan akun media sosial atau tunggu laporan dari tim.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const { user } = usePortal()
const loading = ref(true)
const data = ref<any>(null)
const onboarding = ref<any>(null)
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)

onMounted(async () => {
  try {
    const [d, p] = await Promise.all([
      $fetch<any>('/api/portal/dashboard'),
      $fetch<any>('/api/portal/profile').catch(() => null),
    ])
    data.value = d
    onboarding.value = p?.completeness || null
  } catch { /* ignore */ }
  loading.value = false
})

const statCards = computed(() => {
  const s = data.value?.stats || {}
  return [
    { label: 'Konten Bulan Ini', value: s.content_this_month ?? 0, icon: 'i-tabler-calendar-event', color: 'text-[#3358ff]', bg: 'bg-blue-50' },
    { label: 'Konten Selesai',   value: s.content_completed ?? 0,  icon: 'i-tabler-circle-check',   color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Menunggu Approval', value: s.waiting_approval ?? 0,  icon: 'i-tabler-clock',          color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Invoice Belum Bayar', value: s.unpaid_invoices ?? 0, icon: 'i-tabler-file-invoice',   color: 'text-red-500',   bg: 'bg-red-50' },
  ]
})
const socialCards = computed(() => {
  const m = data.value?.social || {}
  return [
    { label: 'Followers',   value: fmt(m.followers) },
    { label: 'Reach',       value: fmt(m.reach) },
    { label: 'Impressions', value: fmt(m.impressions) },
    { label: 'Engagement',  value: (m.engagement_rate ?? 0) + '%' },
  ]
})
</script>
