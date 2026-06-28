<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Approval Konten</h1>
      <p class="text-slate-500 text-sm mt-0.5">Tinjau dan setujui konten dari tim Lakara.</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else>
      <div v-if="waiting.length" class="space-y-3">
        <h2 class="text-xs font-bold uppercase tracking-wider text-amber-600">Menunggu persetujuan ({{ waiting.length }})</h2>
        <NuxtLink v-for="c in waiting" :key="c.id" :to="`/client/approvals/${c.id}`"
          class="flex items-center gap-3 bg-white border border-amber-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><UIcon name="i-tabler-clock" class="w-5 h-5 text-amber-500" /></div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 text-sm truncate">{{ c.title }}</div>
            <div class="text-xs text-slate-400">{{ typeLabel(c.type) }} · {{ fmtDate(c.scheduled_at || c.created_at) }}</div>
          </div>
          <UIcon name="i-tabler-chevron-right" class="w-5 h-5 text-slate-300" />
        </NuxtLink>
      </div>
      <div v-else class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
        <UIcon name="i-tabler-circle-check" class="w-10 h-10 mx-auto mb-2 text-emerald-400" />
        <p class="text-sm">Tidak ada konten yang menunggu persetujuan. 🎉</p>
      </div>

      <div v-if="recent.length" class="space-y-3 pt-2">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400">Riwayat terbaru</h2>
        <NuxtLink v-for="c in recent" :key="c.id" :to="`/client/approvals/${c.id}`"
          class="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
          <div class="min-w-0 flex-1">
            <div class="font-medium text-slate-700 text-sm truncate">{{ c.title }}</div>
            <div class="text-xs text-slate-400">{{ typeLabel(c.type) }}</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const all = ref<any[]>([])
const typeLabel = (t: string) => CONTENT_TYPE_LABEL[t] || t
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''

const waiting = computed(() => all.value.filter((c) => c.status === 'waiting_approval'))
const recent = computed(() => all.value.filter((c) => ['approved', 'scheduled', 'published', 'designing'].includes(c.status)).slice(0, 10))

onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/contents'); all.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
