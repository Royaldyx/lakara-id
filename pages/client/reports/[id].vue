<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <NuxtLink :to="isAdmin ? '/client/admin/reports' : '/client/reports'" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="r">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-extrabold text-slate-900">{{ r.title }}</h1>
          <div class="text-xs text-slate-400 mt-0.5">{{ r.period_start || '' }} {{ r.period_end ? '– ' + r.period_end : '' }} · {{ r.company_name }}</div>
        </div>
        <a :href="`/client/reports/${r.id}/print`" target="_blank" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] flex-shrink-0">
          <UIcon name="i-tabler-download" class="w-4 h-4" /> PDF
        </a>
      </div>

      <div v-if="r.kpi?.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="(k, idx) in r.kpi" :key="idx" class="bg-white border border-slate-100 rounded-2xl p-4 text-center">
          <div class="text-xl font-extrabold text-slate-900">{{ k.value }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ k.label }}</div>
        </div>
      </div>

      <div v-if="r.summary" class="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 class="font-bold text-slate-900 mb-2">Ringkasan</h3>
        <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ r.summary }}</p>
      </div>
      <div v-if="r.insight" class="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 class="font-bold text-slate-900 mb-2">Insight</h3>
        <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ r.insight }}</p>
      </div>
      <div v-if="r.recommendation" class="bg-[#3358ff]/5 border border-[#3358ff]/20 rounded-2xl p-5">
        <h3 class="font-bold text-[#3358ff] mb-2">Rekomendasi</h3>
        <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ r.recommendation }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
const route = useRoute()
const { isAdmin } = usePortal()
const loading = ref(true)
const r = ref<any>(null)
onMounted(async () => {
  try { const res = await $fetch<any>(`/api/portal/reports/${route.params.id}`); r.value = res.report } catch { /* ignore */ }
  loading.value = false
})
</script>
