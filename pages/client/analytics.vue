<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Analitik Sosial Media</h1>
        <p class="text-slate-500 text-sm mt-0.5">Performa akun yang dikelola tim Lakara.</p>
      </div>
      <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
        <button v-for="d in [7,30,90]" :key="d" @click="days = d; load()" class="px-3 py-1.5 text-xs font-semibold rounded-lg transition" :class="days === d ? 'bg-[#3358ff] text-white' : 'text-slate-500 hover:bg-slate-100'">{{ d }} Hari</button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else>
      <!-- KPI -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="k in kpis" :key="k.label" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="text-2xl font-extrabold text-slate-900">{{ k.value }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ k.label }}</div>
        </div>
      </div>

      <!-- Akun -->
      <div class="bg-white rounded-2xl p-5 border border-slate-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-slate-900">Akun Terhubung</h3>
          <button @click="showAcc = true" class="text-xs font-semibold text-[#3358ff] hover:underline">+ Tambah Akun</button>
        </div>
        <div v-if="!accounts.length" class="text-sm text-slate-400">Belum ada akun. Tambahkan username sosmedmu.</div>
        <div v-else class="flex flex-wrap gap-2">
          <span v-for="a in accounts" :key="a.id" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm">
            <UIcon :name="platIcon(a.platform)" class="w-4 h-4 text-slate-500" /> {{ a.handle }}
          </span>
        </div>
      </div>

      <!-- Snapshot history -->
      <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <h3 class="font-bold text-slate-900 px-5 pt-5 pb-3">Riwayat Snapshot</h3>
        <div v-if="!metrics.length" class="text-sm text-slate-400 px-5 pb-5">Belum ada data. Tim Lakara akan mengisi laporan metrik berkala.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr><th class="text-left px-4 py-2.5">Tanggal</th><th class="text-left px-4 py-2.5">Platform</th><th class="text-right px-4 py-2.5">Followers</th><th class="text-right px-4 py-2.5">Reach</th><th class="text-right px-4 py-2.5">Impr.</th><th class="text-right px-4 py-2.5">ER</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="m in metrics" :key="m.id">
                <td class="px-4 py-2.5">{{ m.metric_date }}</td>
                <td class="px-4 py-2.5 capitalize">{{ m.platform }}</td>
                <td class="px-4 py-2.5 text-right">{{ fmt(m.followers) }}</td>
                <td class="px-4 py-2.5 text-right">{{ fmt(m.reach) }}</td>
                <td class="px-4 py-2.5 text-right">{{ fmt(m.impressions) }}</td>
                <td class="px-4 py-2.5 text-right">{{ m.engagement_rate }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal tambah akun -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAcc" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAcc = false">
          <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
            <h3 class="font-bold text-slate-900">Tambah Akun</h3>
            <select v-model="acc.platform" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option>
            </select>
            <input v-model="acc.handle" placeholder="@username" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <div class="flex gap-2">
              <button @click="showAcc = false" class="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600">Batal</button>
              <button @click="addAccount" class="flex-1 py-2 bg-[#3358ff] text-white rounded-xl text-sm font-bold">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const days = ref(30)
const accounts = ref<any[]>([])
const metrics = ref<any[]>([])
const latest = ref<any>(null)
const showAcc = ref(false)
const acc = reactive({ platform: 'instagram', handle: '' })

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const platIcon = (p: string) => ({ instagram: 'i-tabler-brand-instagram', facebook: 'i-tabler-brand-facebook', tiktok: 'i-tabler-brand-tiktok' } as any)[p] || 'i-tabler-world'

const kpis = computed(() => {
  const l = latest.value || {}
  return [
    { label: 'Followers', value: fmt(l.followers) },
    { label: 'Reach', value: fmt(l.reach) },
    { label: 'Impressions', value: fmt(l.impressions) },
    { label: 'Profile Visit', value: fmt(l.profile_visits) },
    { label: 'Engagement', value: (l.engagement_rate ?? 0) + '%' },
  ]
})

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/analytics', { query: { days: days.value } })
    accounts.value = r.accounts || []; metrics.value = r.metrics || []; latest.value = r.latest || null
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function addAccount() {
  if (!acc.handle.trim()) return
  try { await $fetch('/api/portal/analytics/account', { method: 'POST', body: { ...acc } }); showAcc.value = false; acc.handle = ''; await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}
</script>
