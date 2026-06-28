<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Kalender Saya</h1>
        <p class="text-slate-500 text-sm mt-0.5">Absensi & deadline tugas kamu dalam satu tampilan.</p>
      </div>
      <!-- Nav bulan -->
      <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
        <button @click="shift(-1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
          <UIcon name="i-tabler-chevron-left" class="w-4 h-4" />
        </button>
        <span class="text-sm font-bold text-slate-900 w-36 text-center">{{ monthLabel }}</span>
        <button @click="shift(1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500">
          <UIcon name="i-tabler-chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
      <button v-for="t in tabs" :key="t.value" @click="tab = t.value"
        class="px-4 py-1.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
        :class="tab === t.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'">
        <UIcon :name="t.icon" class="w-3.5 h-3.5 inline mr-1.5" />{{ t.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-slate-400">
      <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" />
    </div>

    <template v-else>

      <!-- ===== TAB ABSENSI ===== -->
      <template v-if="tab === 'absensi'">
        <!-- Stats bar -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-emerald-600">{{ absensiStats.hadir }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Hari Hadir</div>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-slate-700">{{ absensiStats.workdays }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Hari Kerja</div>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-[#3358ff]">{{ absensiStats.pct }}%</div>
            <div class="text-xs text-slate-400 mt-0.5">Kehadiran</div>
          </div>
        </div>

        <!-- Kalender grid absensi -->
        <div class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <!-- Header hari -->
          <div class="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            <div v-for="d in dayHeaders" :key="d"
              class="text-center text-[11px] font-bold text-slate-400 uppercase py-2.5">{{ d }}</div>
          </div>
          <!-- Sel kalender -->
          <div class="grid grid-cols-7">
            <template v-for="(cell, i) in absensiCells" :key="i">
              <div class="min-h-[76px] border-b border-r border-slate-100 p-1.5 last:border-r-0
                          relative flex flex-col items-center"
                :class="[
                  !cell.inMonth ? 'bg-slate-50/60' : '',
                  cell.isToday ? 'ring-2 ring-inset ring-[#3358ff]/30' : '',
                ]">
                <!-- Nomor hari -->
                <span class="text-[11px] font-semibold self-start"
                  :class="cell.isToday ? 'text-[#3358ff]' : cell.inMonth ? 'text-slate-500' : 'text-slate-300'">
                  {{ cell.day }}
                </span>

                <!-- Status absensi dari admin (prioritas) -->
                <div v-if="cell.att" class="mt-1 w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-0.5"
                  :class="(ATT_META[cell.att.status] || ATT_META.hadir).cls" :title="cell.att.note || ''">
                  <span class="text-[9px] font-bold leading-none">{{ (ATT_META[cell.att.status] || ATT_META.hadir).short }}</span>
                </div>

                <!-- Badge hadir (ada laporan) -->
                <button v-else-if="cell.report" @click="openReport(cell.report)"
                  class="mt-1 w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 transition flex flex-col items-center justify-center gap-0.5 group">
                  <UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-600" />
                  <span class="text-[9px] font-bold text-emerald-600 leading-none">HADIR</span>
                </button>

                <!-- Hari kerja tapi tidak ada laporan & sudah lewat -->
                <div v-else-if="cell.inMonth && cell.isWorkday && cell.isPast && !cell.isFuture"
                  class="mt-1 w-9 h-9 rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-0.5 opacity-60">
                  <UIcon name="i-tabler-minus" class="w-3.5 h-3.5 text-slate-400" />
                  <span class="text-[9px] font-bold text-slate-400 leading-none">ABSEN</span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Legend absensi -->
        <div class="flex flex-wrap gap-3 text-xs text-slate-500">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-200" /> Hadir</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-blue-100" /> Izin</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-amber-100" /> Sakit</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-red-100" /> Alpha</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-slate-100" /> Absen / belum lapor</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md border-2 border-[#3358ff]/30" /> Hari ini</span>
        </div>
      </template>

      <!-- ===== TAB TUGAS ===== -->
      <template v-if="tab === 'tugas'">
        <!-- Stats tugas bulan ini -->
        <div class="grid grid-cols-3 gap-3">
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-[#3358ff]">{{ taskStats.total }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Tugas Bulan Ini</div>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-amber-500">{{ taskStats.upcoming }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Deadline Mendatang</div>
          </div>
          <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
            <div class="text-2xl font-extrabold text-emerald-600">{{ taskStats.done }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Selesai</div>
          </div>
        </div>

        <!-- Kalender grid tugas (desktop) -->
        <div class="hidden sm:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div class="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
            <div v-for="d in dayHeaders" :key="d"
              class="text-center text-[11px] font-bold text-slate-400 uppercase py-2.5">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7">
            <template v-for="(cell, i) in taskCells" :key="i">
              <div class="min-h-[88px] border-b border-r border-slate-100 p-1.5 last:border-r-0"
                :class="[
                  !cell.inMonth ? 'bg-slate-50/60' : '',
                  cell.isToday ? 'ring-2 ring-inset ring-[#3358ff]/30' : '',
                ]">
                <span class="text-[11px] font-semibold block mb-1"
                  :class="cell.isToday ? 'text-[#3358ff]' : cell.inMonth ? 'text-slate-400' : 'text-slate-200'">
                  {{ cell.day }}
                </span>
                <div class="space-y-1">
                  <NuxtLink v-for="t in cell.tasks" :key="t.id" :to="`/client/tasks/${t.id}`"
                    class="block text-[10px] leading-tight px-1.5 py-1 rounded-md truncate font-semibold"
                    :class="taskStatusClass(t.status)" :title="t.title">
                    {{ t.title }}
                  </NuxtLink>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- List tugas (mobile) -->
        <div class="sm:hidden space-y-2">
          <div v-if="!tasksThisMonth.length"
            class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">
            Tidak ada deadline tugas bulan ini.
          </div>
          <NuxtLink v-for="t in tasksThisMonth" :key="t.id" :to="`/client/tasks/${t.id}`"
            class="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
            <div class="text-center w-10 flex-shrink-0">
              <div class="text-lg font-extrabold text-slate-900 leading-none">{{ deadlineDay(t) }}</div>
              <div class="text-[10px] text-slate-400 uppercase">{{ deadlineMonthShort(t) }}</div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-semibold text-slate-900 text-sm truncate">{{ t.title }}</div>
              <div class="text-xs text-slate-400">{{ taskTypeLabel(t.type) }}</div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
              :class="taskStatusClass(t.status)">{{ taskStatusText(t.status) }}</span>
          </NuxtLink>
        </div>

        <!-- Legend tugas -->
        <div class="flex flex-wrap gap-4 text-xs text-slate-500">
          <span v-for="s in taskLegend" :key="s.key" class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-md" :class="s.bg" />{{ s.label }}
          </span>
        </div>
      </template>

    </template>

    <!-- ===== MODAL detail laporan ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900">Laporan Harian</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ selectedReport?.report_date }}</p>
              </div>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <UIcon name="i-tabler-x" class="w-5 h-5" />
              </button>
            </div>
            <div class="p-5 space-y-3">
              <div v-if="selectedReport?.hours > 0" class="flex items-center gap-2 text-sm text-slate-600">
                <UIcon name="i-tabler-clock" class="w-4 h-4 text-slate-400" />
                <span>{{ selectedReport.hours }} jam kerja</span>
              </div>
              <div class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-xl p-3">{{ selectedReport?.summary }}</div>
              <a v-if="selectedReport?.links" :href="selectedReport.links" target="_blank"
                class="flex items-center gap-1.5 text-xs text-[#3358ff] hover:underline">
                <UIcon name="i-tabler-link" class="w-3.5 h-3.5" />{{ selectedReport.links }}
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { taskType as getTaskType, taskStatus as getTaskStatus } from '~/composables/portalLabels'

const loading = ref(true)
const tab = ref<'absensi' | 'tugas'>('absensi')
const cursor = ref(new Date())
const reports = ref<any[]>([])
const tasks = ref<any[]>([])
const attendance = ref<any[]>([])
const showModal = ref(false)
const selectedReport = ref<any>(null)

const ATT_META: Record<string, { short: string; cls: string }> = {
  hadir: { short: 'HADIR', cls: 'bg-emerald-100 text-emerald-600' },
  izin:  { short: 'IZIN',  cls: 'bg-blue-100 text-blue-600' },
  sakit: { short: 'SAKIT', cls: 'bg-amber-100 text-amber-600' },
  alpha: { short: 'ALPHA', cls: 'bg-red-100 text-red-600' },
  libur: { short: 'LIBUR', cls: 'bg-slate-100 text-slate-500' },
}

const tabs = [
  { value: 'absensi', label: 'Absensi', icon: 'i-tabler-calendar-check' },
  { value: 'tugas',   label: 'Tugas',   icon: 'i-tabler-checklist' },
]
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

// ── Navigasi bulan ──
const monthLabel = computed(() =>
  cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
)
function shift(n: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + n, 1)
}

// ── Helpers tanggal ──
const todayStr = new Date().toISOString().slice(0, 10)
function cellDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// ── Data load ──
onMounted(async () => {
  await loadAll()
})

async function loadAll() {
  loading.value = true
  try {
    const [r, t, a] = await Promise.all([
      $fetch<any>('/api/portal/daily-reports'),
      $fetch<any>('/api/portal/tasks'),
      $fetch<any>('/api/portal/attendance').catch(() => ({ data: [] })),
    ])
    reports.value = r.data || []
    tasks.value = t.data || []
    attendance.value = a.data || []
  } catch { /* ignore */ }
  loading.value = false
}

// ════ ABSENSI ════

// Map report_date → report object
const reportMap = computed(() => {
  const m: Record<string, any> = {}
  for (const r of reports.value) {
    const key = String(r.report_date).slice(0, 10)
    if (!m[key]) m[key] = r // ambil yang pertama jika ada double
  }
  return m
})

// Map date → attendance status (dari admin)
const attMap = computed(() => {
  const m: Record<string, any> = {}
  for (const a of attendance.value) m[String(a.date).slice(0, 10)] = a
  return m
})

// Sel kalender absensi
const absensiCells = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const first = new Date(y, m, 1)
  const startDay = first.getDay() // 0=Min
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: any[] = []

  // padding depan (bulan sebelumnya)
  const prevMonthDays = new Date(y, m, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inMonth: false })
  }

  // hari di bulan ini
  for (let d = 1; d <= daysInMonth; d++) {
    const key = cellDate(y, m, d)
    const dateObj = new Date(y, m, d)
    const dow = dateObj.getDay() // 0=Min,6=Sab
    const isWorkday = dow >= 1 && dow <= 5
    const isPast = key <= todayStr
    const isToday = key === todayStr
    cells.push({
      day: d, inMonth: true, isToday, isPast,
      isWorkday,
      isFuture: key > todayStr,
      report: reportMap.value[key] || null,
      att: attMap.value[key] || null,
    })
  }

  // padding belakang (genapi 42 sel = 6 baris)
  let next = 1
  while (cells.length < 42) cells.push({ day: next++, inMonth: false })
  return cells
})

// Stats absensi bulan ini
const absensiStats = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  let workdays = 0, hadir = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const key = cellDate(y, m, d)
    if (key > todayStr) break // hanya hitung sampai hari ini
    const dow = new Date(y, m, d).getDay()
    const a = attMap.value[key]
    if (a?.status === 'libur') continue // libur tidak dihitung hari kerja
    if (dow >= 1 && dow <= 5) {
      workdays++
      if (a ? a.status === 'hadir' : !!reportMap.value[key]) hadir++
    }
  }
  return {
    hadir,
    workdays,
    pct: workdays > 0 ? Math.round((hadir / workdays) * 100) : 0,
  }
})

function openReport(report: any) {
  selectedReport.value = report
  showModal.value = true
}

// ════ TUGAS ════

// Tasks dengan deadline di bulan ini
const tasksThisMonth = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  return tasks.value.filter(t => {
    if (!t.deadline) return false
    const d = new Date(t.deadline)
    return d.getFullYear() === y && d.getMonth() === m
  })
})

// Map deadline → tasks[]
const taskByDate = computed(() => {
  const map: Record<string, any[]> = {}
  for (const t of tasksThisMonth.value) {
    const key = String(t.deadline).slice(0, 10)
    ;(map[key] ||= []).push(t)
  }
  return map
})

// Sel kalender tugas
const taskCells = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const first = new Date(y, m, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: any[] = []
  const prevMonthDays = new Date(y, m, 0).getDate()

  for (let i = startDay - 1; i >= 0; i--)
    cells.push({ day: prevMonthDays - i, inMonth: false, tasks: [] })

  for (let d = 1; d <= daysInMonth; d++) {
    const key = cellDate(y, m, d)
    cells.push({ day: d, inMonth: true, isToday: key === todayStr, tasks: taskByDate.value[key] || [] })
  }

  let next = 1
  while (cells.length < 42) cells.push({ day: next++, inMonth: false, tasks: [] })
  return cells
})

// Stats tugas bulan ini
const taskStats = computed(() => ({
  total: tasksThisMonth.value.length,
  upcoming: tasksThisMonth.value.filter(t => t.status !== 'done' && String(t.deadline).slice(0, 10) >= todayStr).length,
  done: tasksThisMonth.value.filter(t => t.status === 'done').length,
}))

const deadlineDay = (t: any) => new Date(t.deadline).getDate()
const deadlineMonthShort = (t: any) => new Date(t.deadline).toLocaleDateString('id-ID', { month: 'short' })

// Task labels — pakai portalLabels sebagai source of truth
const taskTypeLabel = (t: string) => getTaskType(t).label
const taskStatusClass = (s: string) => getTaskStatus(s).class
const taskStatusText = (s: string) => getTaskStatus(s).label

const taskLegend = [
  { key: 'todo',        label: 'To Do',       bg: 'bg-slate-200' },
  { key: 'in_progress', label: 'Dikerjakan',  bg: 'bg-blue-400' },
  { key: 'submitted',   label: 'Disubmit',    bg: 'bg-amber-400' },
  { key: 'revision',    label: 'Revisi',       bg: 'bg-red-400' },
  { key: 'done',        label: 'Selesai',      bg: 'bg-green-400' },
]
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
