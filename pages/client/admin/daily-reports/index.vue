<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Laporan Harian Tim</h1>
      <p class="text-slate-500 text-sm mt-0.5">Rekap aktivitas harian staff & freelancer.</p>
    </div>

    <div class="flex gap-2 flex-wrap">
      <input v-model="dateFilter" type="date" @change="load" class="border border-slate-200 rounded-xl px-3 py-2 text-sm" />
      <button v-if="dateFilter" @click="dateFilter = ''; load()" class="text-sm text-slate-500 hover:underline">Reset</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!reports.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-report" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada laporan.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="r in reports" :key="r.id" class="bg-white border border-slate-100 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-900 text-sm">{{ r.author }}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" :class="r.author_role === 'staff' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'">{{ r.author_role === 'staff' ? 'Staff' : 'Freelancer' }}</span>
          </div>
          <span class="text-xs text-slate-400">{{ r.report_date }}<span v-if="r.hours > 0"> · {{ r.hours }} jam</span></span>
        </div>
        <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ r.summary }}</p>
        <a v-if="r.links" :href="r.links" target="_blank" class="text-xs text-[#3358ff] hover:underline mt-1 inline-block">{{ r.links }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const reports = ref<any[]>([])
const dateFilter = ref('')

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/daily-reports', { query: dateFilter.value ? { date: dateFilter.value } : {} }); reports.value = r.data || [] }
  catch { /* ignore */ }
  loading.value = false
}
onMounted(load)
</script>
