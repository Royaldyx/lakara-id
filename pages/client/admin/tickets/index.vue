<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Tiket Support</h1>
      <p class="text-slate-500 text-sm mt-0.5">Semua tiket dari klien.</p>
    </div>

    <div class="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl">
      <button v-for="f in filters" :key="f.value" @click="activeFilter = f.value; load()"
        class="px-3.5 py-1.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors"
        :class="activeFilter === f.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">{{ f.label }}</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!tickets.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-ticket-off" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Tidak ada tiket.</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink v-for="t in tickets" :key="t.id" :to="`/client/tickets/${t.id}`"
        class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <UIcon :name="catIcon(t.category)" class="w-5 h-5 text-slate-500" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 truncate">{{ t.subject }}</div>
            <div class="text-xs text-slate-400">{{ t.company_name }} · {{ catLabel(t.category) }} · {{ t.msg_count }} pesan</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { ticketCat, ticketStatus } from '~/composables/portalLabels'

const loading = ref(true)
const tickets = ref<any[]>([])
const activeFilter = ref('')
const filters = [
  { label: 'Semua', value: '' }, { label: 'Open', value: 'open' },
  { label: 'Diproses', value: 'in_progress' }, { label: 'Menunggu Klien', value: 'waiting_client' },
  { label: 'Selesai', value: 'closed' },
]
const catIcon = (c: string) => ticketCat(c).icon
const catLabel = (c: string) => ticketCat(c).label
const statusLabel = (s: string) => ticketStatus(s).label
const statusClass = (s: string) => ticketStatus(s).class

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/tickets', { query: activeFilter.value ? { status: activeFilter.value } : {} })
    tickets.value = r.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)
</script>
