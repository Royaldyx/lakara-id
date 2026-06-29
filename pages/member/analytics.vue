<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Analitik</h1>
        <p class="text-slate-500 text-sm mt-0.5">Performa link bio kamu secara real-time.</p>
      </div>
      <div v-if="tier !== 'free'" class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
        <button v-for="opt in rangeOptions" :key="opt.value" @click="changeRange(opt.value)"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition"
          :class="days === opt.value ? 'bg-[#3358ff] text-white' : 'text-slate-500 hover:bg-slate-100'">
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- FREE: upsell -->
    <div v-if="tier === 'free'" class="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3 max-w-lg mx-auto mt-8">
      <div class="w-16 h-16 bg-[#3358ff]/10 rounded-2xl flex items-center justify-center mx-auto"><UIcon name="i-tabler-chart-arcs" class="w-8 h-8 text-[#3358ff]" /></div>
      <h3 class="font-bold text-slate-800 text-lg">Buka Analitik Lengkap</h3>
      <p class="text-sm text-slate-500">Pantau jumlah kunjungan, klik per link, CTR, dan tren harian. Tersedia untuk member Pro &amp; Premium.</p>
      <NuxtLink to="/member/upgrade" class="inline-flex items-center gap-2 px-6 py-3 bg-[#3358ff] text-white text-sm font-bold rounded-xl hover:bg-[#2244ee] transition"><UIcon name="i-tabler-arrow-up-circle" class="w-4 h-4" /> Upgrade Sekarang</NuxtLink>
    </div>

    <!-- PRO / PREMIUM -->
    <template v-else>
      <div v-if="loading" class="text-center py-20 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto mb-2" /> Memuat data...</div>

      <template v-else-if="data">
        <!-- KPI cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div v-for="kpi in kpis" :key="kpi.label" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="kpi.bg">
                <UIcon :name="kpi.icon" class="w-5 h-5" :class="kpi.color" />
              </div>
              <span v-if="kpi.growth !== null"
                class="text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                :class="kpi.growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
                <UIcon :name="kpi.growth >= 0 ? 'i-tabler-trending-up' : 'i-tabler-trending-down'" class="w-3 h-3" />
                {{ Math.abs(kpi.growth) }}%
              </span>
            </div>
            <div class="text-2xl font-extrabold text-slate-900">{{ kpi.value }}</div>
            <div class="text-xs text-slate-400 mt-0.5">{{ kpi.label }}</div>
          </div>
        </div>

        <!-- Trend chart -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-900">Tren Harian</h3>
            <div class="flex items-center gap-4 text-xs">
              <span class="flex items-center gap-1.5 text-slate-500"><span class="w-2.5 h-2.5 rounded-full bg-[#3358ff]" /> Klik</span>
              <span class="flex items-center gap-1.5 text-slate-500"><span class="w-2.5 h-2.5 rounded-full bg-slate-300" /> Kunjungan</span>
            </div>
          </div>

          <div v-if="!hasChartData" class="text-sm text-slate-400 py-12 text-center">Belum ada data pada periode ini.</div>
          <div v-else class="overflow-x-auto">
            <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="w-full h-auto" :style="{ minWidth: chart.points.length > 14 ? '600px' : '100%' }">
              <!-- gridlines -->
              <line v-for="g in 4" :key="g" :x1="padL" :x2="chartW - padR"
                :y1="padT + (g - 1) * (plotH / 3)" :y2="padT + (g - 1) * (plotH / 3)"
                stroke="#f1f5f9" stroke-width="1" />
              <!-- views area -->
              <polyline :points="chart.viewsLine" fill="none" stroke="#cbd5e1" stroke-width="2"
                stroke-linejoin="round" stroke-linecap="round" />
              <!-- clicks line -->
              <polyline :points="chart.clicksLine" fill="none" stroke="#3358ff" stroke-width="2.5"
                stroke-linejoin="round" stroke-linecap="round" />
              <!-- click dots -->
              <circle v-for="(p, i) in chart.points" :key="i" :cx="p.x" :cy="p.yClicks" r="3" fill="#3358ff" />
            </svg>
            <div class="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>{{ chart.firstLabel }}</span>
              <span>{{ chart.lastLabel }}</span>
            </div>
          </div>
          <p v-if="tier === 'pro'" class="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
            <UIcon name="i-tabler-info-circle" class="w-3.5 h-3.5" /> Tren harian Pro dibatasi 7 hari. Upgrade Premium untuk riwayat penuh 90 hari.
          </p>
        </div>

        <!-- Top links -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 class="font-bold text-slate-900 mb-4">Klik per Link</h3>
          <div v-if="!byLink.length" class="text-sm text-slate-400 py-6 text-center">Belum ada klik pada periode ini.</div>
          <div v-else class="space-y-3.5">
            <div v-for="(item, i) in byLink" :key="item.link_id" class="space-y-1.5">
              <div class="flex items-center justify-between text-sm gap-3">
                <span class="font-medium text-slate-700 flex items-center gap-2 min-w-0">
                  <span class="text-xs font-bold text-slate-300 w-4 flex-shrink-0">{{ i + 1 }}</span>
                  <span class="truncate">{{ labelFor(item.link_id) }}</span>
                </span>
                <span class="font-bold text-slate-900 flex-shrink-0">{{ item.total }}</span>
              </div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-[#3358ff] rounded-full transition-all" :style="{ width: `${(item.total / maxLinkClicks) * 100}%` }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sumber kunjungan + Perangkat -->
        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 class="font-bold text-slate-900 mb-4">Sumber Kunjungan</h3>
            <div v-if="!sources.length" class="text-sm text-slate-400 py-6 text-center">Belum ada data.</div>
            <div v-else class="space-y-3">
              <div v-for="s in sources" :key="s.source" class="space-y-1">
                <div class="flex items-center justify-between text-sm gap-2">
                  <span class="font-medium text-slate-700 flex items-center gap-2 min-w-0"><UIcon :name="sourceIcon(s.source)" class="w-4 h-4 text-slate-400 flex-shrink-0" /> <span class="truncate">{{ sourceLabel(s.source) }}</span></span>
                  <span class="font-bold text-slate-900 flex-shrink-0">{{ s.total }}</span>
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-emerald-500 rounded-full" :style="{ width: (s.total / maxSource * 100) + '%' }" /></div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 class="font-bold text-slate-900 mb-4">Perangkat</h3>
            <div v-if="!devices.length" class="text-sm text-slate-400 py-6 text-center">Belum ada data.</div>
            <div v-else class="space-y-4">
              <div v-for="d in devices" :key="d.device" class="flex items-center gap-3">
                <UIcon :name="deviceIcon(d.device)" class="w-5 h-5 text-slate-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between text-sm mb-1"><span class="font-medium text-slate-700 capitalize">{{ d.device }}</span><span class="font-bold text-slate-900">{{ devicePct(d.total) }}%</span></div>
                  <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-[#3358ff] rounded-full" :style="{ width: devicePct(d.total) + '%' }" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Jam ramai -->
        <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mt-6">
          <h3 class="font-bold text-slate-900 mb-1">Jam Ramai</h3>
          <p class="text-xs text-slate-400 mb-4">Waktu terbaik buat posting & bagikan link bio.</p>
          <div v-if="!hasHourly" class="text-sm text-slate-400 py-6 text-center">Belum ada data.</div>
          <template v-else>
            <div class="flex items-end gap-0.5 h-28">
              <div v-for="h in hourly" :key="h.hour" class="flex-1 flex flex-col justify-end">
                <div class="w-full rounded-t bg-[#3358ff]/80 hover:bg-[#3358ff] transition-all" :style="{ height: Math.max(2, h.total / maxHour * 100) + '%' }" :title="`${h.hour}:00 — ${h.total}`" />
              </div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400 mt-1.5"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
            <p v-if="peakHour !== null" class="text-xs text-slate-500 mt-3">⏰ Paling ramai sekitar jam <strong>{{ peakHour }}:00</strong></p>
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store = computed(() => storeData.value)
const tier = computed(() => store.value?.product_tier || 'free')

const loading = ref(false)
const data = ref<any>(null)
const days = ref(30)
const linkLabels = ref<Record<string, string>>({})

const rangeOptions = [
  { value: 7,  label: '7 Hari'  },
  { value: 30, label: '30 Hari' },
  { value: 90, label: '90 Hari' },
]

async function loadLabels() {
  try {
    const res = await $fetch<{ ok: boolean; data: any }>('/api/member/links')
    const map: Record<string, string> = {}
    for (const l of (res.data?.links || [])) map[l.id] = l.label || l.type || l.id
    linkLabels.value = map
  } catch { /* ignore */ }
}

async function loadAnalytics() {
  if (tier.value === 'free') return
  loading.value = true
  try { data.value = await $fetch('/api/member/analytics', { query: { days: days.value } }) }
  catch { data.value = null }
  loading.value = false
}

function changeRange(v: number) {
  if (days.value === v) return
  days.value = v
  loadAnalytics()
}

function labelFor(id: string) {
  return linkLabels.value[id] || (id.length > 10 ? id.slice(0, 10) + '…' : id)
}

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n)

const kpis = computed(() => {
  const t = data.value?.totals || {}
  return [
    { label: 'Kunjungan',      value: fmt(t.views || 0),        growth: t.views_growth ?? null,  icon: 'i-tabler-eye',          color: 'text-slate-500', bg: 'bg-slate-100' },
    { label: 'Total Klik',     value: fmt(t.clicks || 0),       growth: t.clicks_growth ?? null, icon: 'i-tabler-click',        color: 'text-[#3358ff]', bg: 'bg-blue-50' },
    { label: 'CTR',            value: (t.ctr ?? 0) + '%',       growth: null,                    icon: 'i-tabler-target-arrow', color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Klik Hari Ini',  value: fmt(t.clicks_today || 0), growth: null,                    icon: 'i-tabler-bolt',         color: 'text-amber-500', bg: 'bg-amber-50' },
  ]
})

const byLink = computed(() =>
  [...(data.value?.by_link || [])].sort((a: any, b: any) => b.total - a.total))
const maxLinkClicks = computed(() =>
  byLink.value.reduce((m: number, r: any) => Math.max(m, r.total), 0) || 1)

const hasChartData = computed(() => (data.value?.daily || []).length > 0)

// Sumber kunjungan
const sources = computed<any[]>(() => data.value?.sources || [])
const maxSource = computed(() => sources.value.reduce((m, s) => Math.max(m, s.total), 0) || 1)
const sourceLabel = (s: string) => s === 'direct' ? 'Langsung / lainnya' : s
const sourceIcon = (s: string) => {
  if (s.includes('instagram')) return 'i-tabler-brand-instagram'
  if (s.includes('tiktok')) return 'i-tabler-brand-tiktok'
  if (s.includes('youtube') || s.includes('youtu.be')) return 'i-tabler-brand-youtube'
  if (s.includes('facebook') || s.includes('fb.')) return 'i-tabler-brand-facebook'
  if (s.includes('google')) return 'i-tabler-brand-google'
  if (s.includes('whatsapp') || s.includes('wa.me')) return 'i-tabler-brand-whatsapp'
  if (s.includes('t.co') || s.includes('twitter') || s.includes('x.com')) return 'i-tabler-brand-x'
  if (s.includes('telegram') || s.includes('t.me')) return 'i-tabler-brand-telegram'
  if (s === 'direct') return 'i-tabler-link'
  return 'i-tabler-world'
}

// Perangkat
const devices = computed<any[]>(() => data.value?.devices || [])
const deviceTotal = computed(() => devices.value.reduce((a, d) => a + d.total, 0) || 1)
const devicePct = (n: number) => Math.round(n / deviceTotal.value * 100)
const deviceIcon = (d: string) =>
  d === 'mobile' ? 'i-tabler-device-mobile'
  : d === 'tablet' ? 'i-tabler-device-tablet'
  : d === 'desktop' ? 'i-tabler-device-desktop'
  : 'i-tabler-device-unknown'

// Jam ramai
const hourly = computed<any[]>(() => data.value?.hourly || [])
const maxHour = computed(() => hourly.value.reduce((m, h) => Math.max(m, h.total), 0) || 1)
const hasHourly = computed(() => hourly.value.some(h => h.total > 0))
const peakHour = computed(() => {
  if (!hasHourly.value) return null
  let best = hourly.value[0]
  for (const h of hourly.value) if (h.total > best.total) best = h
  return best.hour
})

// SVG chart geometry
const chartW = 700, chartH = 220
const padL = 8, padR = 8, padT = 12, padB = 12
const plotH = chartH - padT - padB

const chart = computed(() => {
  const daily = data.value?.daily || []
  const n = daily.length
  const max = Math.max(1, ...daily.map((d: any) => Math.max(d.clicks, d.views)))
  const innerW = chartW - padL - padR
  const stepX = n > 1 ? innerW / (n - 1) : 0
  const y = (v: number) => padT + plotH - (v / max) * plotH
  const points = daily.map((d: any, i: number) => ({
    x: padL + (n > 1 ? i * stepX : innerW / 2),
    yClicks: y(d.clicks),
    yViews: y(d.views),
  }))
  const toLine = (key: 'yClicks' | 'yViews') => points.map((p: any) => `${p.x.toFixed(1)},${p[key].toFixed(1)}`).join(' ')
  const lbl = (s: string) => { const d = new Date(s); return `${d.getDate()}/${d.getMonth() + 1}` }
  return {
    points,
    clicksLine: toLine('yClicks'),
    viewsLine:  toLine('yViews'),
    firstLabel: n ? lbl(daily[0].date) : '',
    lastLabel:  n ? lbl(daily[n - 1].date) : '',
  }
})

onMounted(async () => {
  if (!store.value) await fetchStore()
  await loadLabels()
  await loadAnalytics()
})
</script>
