<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Kontrak / MOU</h1>
      <p class="text-slate-500 text-sm mt-0.5">Detail kerja sama kamu dengan Lakara.</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!contracts.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-file-text" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada kontrak.</p>
    </div>
    <div v-else class="space-y-3">
      <div v-for="c in contracts" :key="c.id" class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-bold text-slate-900">{{ c.title }}</h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">{{ c.status === 'active' ? 'Aktif' : 'Berakhir' }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-3 text-sm">
          <div><span class="text-slate-400 text-xs">Rate</span><div class="font-semibold">{{ rateLabel(c.rate_type) }} · Rp {{ fmt(c.rate) }}</div></div>
          <div><span class="text-slate-400 text-xs">Periode</span><div class="font-semibold">{{ c.start_date || '—' }} – {{ c.end_date || 'sekarang' }}</div></div>
        </div>
        <p v-if="c.scope" class="text-sm text-slate-600 mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3">{{ c.scope }}</p>
        <a v-if="c.file_path" :href="c.file_path" target="_blank" class="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-[#3358ff] hover:underline">
          <UIcon name="i-tabler-download" class="w-4 h-4" /> Unduh dokumen MOU
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
const loading = ref(true)
const contracts = ref<any[]>([])
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const rateLabel = (t: string) => ({ hourly: 'Per jam', per_task: 'Per tugas', monthly: 'Bulanan' } as any)[t] || t
onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/contracts'); contracts.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
