<template>
  <div v-if="r" class="max-w-2xl mx-auto p-8 bg-white text-slate-800">
    <div class="flex items-center gap-2 mb-1">
      <div class="w-8 h-8 rounded-lg bg-[#3358ff] flex items-center justify-center"><span class="text-white font-black text-sm">L</span></div>
      <span class="font-extrabold text-xl text-slate-900">Lakara</span>
    </div>
    <div class="text-xs text-slate-400 mb-6">Laporan Performa Media Sosial</div>

    <h1 class="text-2xl font-extrabold text-slate-900">{{ r.title }}</h1>
    <div class="text-sm text-slate-500 mb-6">{{ r.company_name }} · {{ r.period_start || '' }} {{ r.period_end ? '– ' + r.period_end : '' }}</div>

    <div v-if="r.kpi?.length" class="grid grid-cols-4 gap-3 mb-6">
      <div v-for="(k, idx) in r.kpi" :key="idx" class="border border-slate-200 rounded-xl p-3 text-center">
        <div class="text-lg font-extrabold text-slate-900">{{ k.value }}</div>
        <div class="text-[10px] text-slate-400">{{ k.label }}</div>
      </div>
    </div>

    <template v-for="sec in sections" :key="sec.key">
      <div v-if="r[sec.key]" class="mb-5">
        <h3 class="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">{{ sec.label }}</h3>
        <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ r[sec.key] }}</p>
      </div>
    </template>

    <p class="text-xs text-slate-400 mt-8 text-center">Dibuat oleh Lakara · lakara.id</p>
    <div class="no-print mt-8 text-center"><button @click="print" class="px-5 py-2.5 bg-[#3358ff] text-white text-sm font-bold rounded-xl">Cetak / Simpan PDF</button></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'portal' })
const route = useRoute()
const r = ref<any>(null)
const print = () => window.print()
const sections = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'insight', label: 'Insight' },
  { key: 'recommendation', label: 'Rekomendasi' },
]
onMounted(async () => {
  try {
    const res = await $fetch<any>(`/api/portal/reports/${route.params.id}`)
    r.value = res.report
    await nextTick(); setTimeout(() => window.print(), 400)
  } catch { /* ignore */ }
})
</script>

<style>
@media print { .no-print { display: none !important; } body { background: white !important; } }
</style>
