<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Kalender Deadline</h1>
        <p class="text-slate-500 text-sm mt-0.5">Semua deadline tugas tim dalam satu kalender.</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="shift(-1)" class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><UIcon name="i-tabler-chevron-left" class="w-4 h-4" /></button>
        <span class="font-bold text-slate-900 text-sm w-32 text-center">{{ monthLabel }}</span>
        <button @click="shift(1)" class="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><UIcon name="i-tabler-chevron-right" class="w-4 h-4" /></button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else class="bg-white border border-slate-100 rounded-2xl p-3 sm:p-4 overflow-x-auto">
      <div class="min-w-[560px]">
        <div class="grid grid-cols-7 mb-2">
          <div v-for="d in ['Min','Sen','Sel','Rab','Kam','Jum','Sab']" :key="d" class="text-center text-xs font-bold text-slate-400 py-1">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1.5">
          <div v-for="(cell, i) in cells" :key="i"
            class="min-h-[88px] rounded-xl border p-1.5 text-left align-top"
            :class="cell.date ? (cell.isToday ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-100') : 'border-transparent'">
            <template v-if="cell.date">
              <div class="text-xs font-bold mb-1" :class="cell.isToday ? 'text-[#3358ff]' : 'text-slate-400'">{{ cell.day }}</div>
              <div class="space-y-1">
                <NuxtLink v-for="t in cell.tasks" :key="t.id" :to="`/client/tasks/${t.id}`"
                  class="block px-1.5 py-1 rounded-md text-[10px] font-semibold truncate" :class="dotClass(t.status)" :title="`${t.title} · ${t.assignee_name || '-'}`">
                  {{ t.title }}
                </NuxtLink>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3 text-xs text-slate-500">
      <span v-for="s in legend" :key="s.key" class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" :class="s.dot" /> {{ s.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const tasks = ref<any[]>([])
const cursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

const monthLabel = computed(() => cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
function shift(n: number) { cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + n, 1) }

const STATUS_BG: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-600', in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-amber-100 text-amber-700', revision: 'bg-red-100 text-red-700', done: 'bg-green-100 text-green-700',
}
const dotClass = (s: string) => STATUS_BG[s] || STATUS_BG.todo
const legend = [
  { key: 'todo', label: 'To Do', dot: 'bg-slate-300' }, { key: 'in_progress', label: 'Dikerjakan', dot: 'bg-blue-400' },
  { key: 'submitted', label: 'Disubmit', dot: 'bg-amber-400' }, { key: 'revision', label: 'Revisi', dot: 'bg-red-400' },
  { key: 'done', label: 'Selesai', dot: 'bg-green-400' },
]

const byDate = computed(() => {
  const map: Record<string, any[]> = {}
  for (const t of tasks.value) {
    if (!t.deadline) continue
    const key = String(t.deadline).slice(0, 10)
    ;(map[key] ||= []).push(t)
  }
  return map
})

const cells = computed(() => {
  const y = cursor.value.getFullYear(), m = cursor.value.getMonth()
  const firstDay = new Date(y, m, 1).getDay() // 0=Min
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const todayStr = new Date().toISOString().slice(0, 10)
  const arr: any[] = []
  for (let i = 0; i < firstDay; i++) arr.push({ date: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    arr.push({ date: key, day: d, isToday: key === todayStr, tasks: byDate.value[key] || [] })
  }
  return arr
})

onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/tasks'); tasks.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
