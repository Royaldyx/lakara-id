<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Laporan Performa</h1>
      <p class="text-slate-500 text-sm mt-0.5">Hasil & insight dari tim Lakara.</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!reports.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-report-analytics" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada laporan.</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink v-for="r in reports" :key="r.id" :to="`/client/reports/${r.id}`"
        class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#3358ff]/10 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-tabler-report-analytics" class="w-5 h-5 text-[#3358ff]" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-slate-900 truncate">{{ r.title }}</div>
          <div class="text-xs text-slate-400">{{ r.period_start || '' }} {{ r.period_end ? '– ' + r.period_end : '' }}</div>
        </div>
        <UIcon name="i-tabler-chevron-right" class="w-5 h-5 text-slate-300" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
const loading = ref(true)
const reports = ref<any[]>([])
onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/reports'); reports.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
