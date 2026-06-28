<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Kalender Konten</h1>
        <p class="text-slate-500 text-sm mt-0.5">Jadwal konten media sosial kamu.</p>
      </div>
      <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
        <button @click="shiftMonth(-1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-left" class="w-4 h-4" /></button>
        <span class="text-sm font-bold text-slate-900 w-32 text-center">{{ monthLabel }}</span>
        <button @click="shiftMonth(1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-right" class="w-4 h-4" /></button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else>
      <!-- Grid kalender (desktop) -->
      <div class="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div class="grid grid-cols-7 bg-slate-50 text-xs font-bold text-slate-400 uppercase">
          <div v-for="d in ['Min','Sen','Sel','Rab','Kam','Jum','Sab']" :key="d" class="px-2 py-2 text-center">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7">
          <div v-for="(cell, i) in cells" :key="i" class="min-h-[96px] border-t border-r border-slate-100 p-1.5 last:border-r-0"
            :class="cell.inMonth ? '' : 'bg-slate-50/50'">
            <div v-if="cell.day" class="text-[11px] font-semibold mb-1" :class="cell.isToday ? 'text-[#3358ff]' : 'text-slate-400'">{{ cell.day }}</div>
            <div class="space-y-1">
              <NuxtLink v-for="c in cell.items" :key="c.id" :to="`/client/approvals/${c.id}`"
                class="block text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-medium" :class="statusClass(c.status)">
                {{ c.title }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- List (mobile + fallback) -->
      <div class="md:hidden space-y-2">
        <div v-if="!items.length" class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">Belum ada konten bulan ini.</div>
        <NuxtLink v-for="c in items" :key="c.id" :to="`/client/approvals/${c.id}`" class="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
          <div class="text-center w-10 flex-shrink-0">
            <div class="text-lg font-extrabold text-slate-900 leading-none">{{ dayOf(c) }}</div>
            <div class="text-[10px] text-slate-400 uppercase">{{ monthShort(c) }}</div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 text-sm truncate">{{ c.title }}</div>
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
const items = ref<any[]>([])
const cursor = ref(new Date())

const monthKey = computed(() => `${cursor.value.getFullYear()}-${String(cursor.value.getMonth() + 1).padStart(2, '0')}`)
const monthLabel = computed(() => cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const typeLabel = (t: string) => CONTENT_TYPE_LABEL[t] || t

const dateOf = (c: any) => new Date(c.scheduled_at || c.created_at)
const dayOf = (c: any) => dateOf(c).getDate()
const monthShort = (c: any) => dateOf(c).toLocaleDateString('id-ID', { month: 'short' })

const cells = computed(() => {
  const y = cursor.value.getFullYear(), m = cursor.value.getMonth()
  const first = new Date(y, m, 1)
  const start = new Date(first); start.setDate(1 - first.getDay()) // mulai Minggu
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const out: any[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    const inMonth = d.getMonth() === m
    const items2 = items.value.filter((c) => { const cd = dateOf(c); return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth() && cd.getDate() === d.getDate() })
    out.push({ day: d.getDate(), inMonth, isToday: d.getTime() === today.getTime(), items: items2 })
  }
  return out
})

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/contents', { query: { month: monthKey.value } }); items.value = r.data || [] } catch { items.value = [] }
  loading.value = false
}
function shiftMonth(n: number) { const d = new Date(cursor.value); d.setMonth(d.getMonth() + n); cursor.value = d; load() }
onMounted(load)
</script>
