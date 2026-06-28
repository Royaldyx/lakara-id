<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Tugas Saya</h1>
      <p class="text-slate-500 text-sm mt-0.5">Tugas yang diberikan tim Lakara untukmu.</p>
    </div>

    <!-- Mini dashboard -->
    <div v-if="!loading" class="grid grid-cols-3 gap-3">
      <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-2"><UIcon name="i-tabler-clipboard-list" class="w-4 h-4 text-[#3358ff]" /></div>
        <div class="text-2xl font-extrabold text-slate-900">{{ activeCount }}</div>
        <div class="text-[11px] text-slate-400">Tugas Aktif</div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2"><UIcon name="i-tabler-clock" class="w-4 h-4 text-amber-500" /></div>
        <div class="text-sm font-extrabold" :class="nearest.overdue ? 'text-red-500' : 'text-slate-900'">{{ nearest.label }}</div>
        <div class="text-[11px] text-slate-400">Deadline Terdekat</div>
      </div>
      <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mb-2"><UIcon name="i-tabler-cash" class="w-4 h-4 text-emerald-500" /></div>
        <div class="text-base font-extrabold text-slate-900">Rp {{ fmt(earningMonth) }}</div>
        <div class="text-[11px] text-slate-400">Earning Bln Ini</div>
      </div>
    </div>

    <div class="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl">
      <button v-for="f in filters" :key="f.value" @click="filter = f.value"
        class="px-3.5 py-1.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors"
        :class="filter === f.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">{{ f.label }}</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!shown.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-checklist" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada tugas.</p>
    </div>

    <div v-else class="space-y-2.5">
      <NuxtLink v-for="t in shown" :key="t.id" :to="`/client/tasks/${t.id}`"
        class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <UIcon :name="typeIcon(t.type)" class="w-5 h-5 text-slate-500" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 truncate">{{ t.title }}</div>
            <div class="flex items-center gap-x-2 gap-y-1 mt-1 flex-wrap min-w-0">
              <span class="text-xs text-slate-400">{{ typeLabel(t.type) }}</span>
              <span v-if="t.deadline" class="text-xs flex items-center gap-1 whitespace-nowrap" :class="overdue(t) ? 'text-red-500 font-semibold' : 'text-slate-400'">
                <UIcon name="i-tabler-clock" class="w-3.5 h-3.5 flex-shrink-0" /> {{ fmtDate(t.deadline) }}
              </span>
              <span v-if="t.fee > 0" class="text-xs font-semibold text-emerald-600 whitespace-nowrap">Rp {{ fmt(t.fee) }}</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { taskType, taskStatus } from '~/composables/portalLabels'

const loading = ref(true)
const tasks = ref<any[]>([])
const filter = ref('active')
const filters = [
  { label: 'Aktif', value: 'active' }, { label: 'Dikerjakan', value: 'in_progress' },
  { label: 'Revisi', value: 'revision' }, { label: 'Selesai', value: 'done' }, { label: 'Semua', value: '' },
]
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const fmtDate = (d: string) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
const typeIcon = (t: string) => taskType(t).icon
const typeLabel = (t: string) => taskType(t).label
const statusLabel = (s: string) => taskStatus(s).label
const statusClass = (s: string) => taskStatus(s).class
const overdue = (t: any) => t.deadline && t.status !== 'done' && new Date(t.deadline) < new Date(new Date().toDateString())

const shown = computed(() => {
  if (filter.value === 'active') return tasks.value.filter(t => t.status !== 'done')
  if (!filter.value) return tasks.value
  return tasks.value.filter(t => t.status === filter.value)
})

// Mini dashboard
const activeCount = computed(() => tasks.value.filter(t => t.status !== 'done').length)
const nearest = computed(() => {
  const upcoming = tasks.value
    .filter(t => t.status !== 'done' && t.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  if (!upcoming.length) return { label: '—', overdue: false }
  const d = upcoming[0].deadline
  const today = new Date(new Date().toDateString())
  const dd = new Date(d)
  const days = Math.round((dd.getTime() - today.getTime()) / 86400000)
  const label = days < 0 ? `Telat ${Math.abs(days)}h` : days === 0 ? 'Hari ini' : days === 1 ? 'Besok' : `${days} hari`
  return { label, overdue: days < 0 }
})
const earningMonth = computed(() => {
  const now = new Date()
  return tasks.value
    .filter(t => t.status === 'done' && t.fee > 0 && t.updated_at &&
      new Date(t.updated_at).getMonth() === now.getMonth() &&
      new Date(t.updated_at).getFullYear() === now.getFullYear())
    .reduce((s, t) => s + Number(t.fee || 0), 0)
})

onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/tasks'); tasks.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
