<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Absensi Tim</h1>
        <p class="text-slate-500 text-sm mt-0.5">Pantau & input absensi staff/freelancer. Klik tanggal untuk set status.</p>
      </div>
      <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
        <button @click="shift(-1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-left" class="w-4 h-4" /></button>
        <span class="text-sm font-bold text-slate-900 w-36 text-center">{{ monthLabel }}</span>
        <button @click="shift(1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-right" class="w-4 h-4" /></button>
      </div>
    </div>

    <!-- Pilih anggota -->
    <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
      <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Anggota Tim</label>
      <select v-model="selectedUser" class="mt-1.5 w-full sm:w-80 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
        <option value="">— Pilih anggota —</option>
        <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }} ({{ m.role === 'staff' ? 'Staff' : 'Freelancer' }})</option>
      </select>
    </div>

    <div v-if="!selectedUser" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-user-search" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Pilih anggota tim untuk lihat absensinya.</p>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div class="text-2xl font-extrabold text-emerald-600">{{ stats.hadir }}</div><div class="text-xs text-slate-400 mt-0.5">Hadir</div>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div class="text-2xl font-extrabold text-blue-500">{{ stats.izin + stats.sakit }}</div><div class="text-xs text-slate-400 mt-0.5">Izin / Sakit</div>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div class="text-2xl font-extrabold text-red-500">{{ stats.alpha }}</div><div class="text-xs text-slate-400 mt-0.5">Alpha</div>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
          <div class="text-2xl font-extrabold text-[#3358ff]">{{ stats.pct }}%</div><div class="text-xs text-slate-400 mt-0.5">Kehadiran</div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-7 h-7 animate-spin mx-auto" /></div>

      <!-- Kalender -->
      <div v-else class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div class="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          <div v-for="d in dayHeaders" :key="d" class="text-center text-[11px] font-bold text-slate-400 uppercase py-2.5">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7">
          <template v-for="(cell, i) in cells" :key="i">
            <button v-if="cell.inMonth" @click="openDay(cell)"
              class="min-h-[72px] border-b border-r border-slate-100 p-1.5 last:border-r-0 relative flex flex-col items-center hover:bg-slate-50 transition text-left"
              :class="cell.isToday ? 'ring-2 ring-inset ring-[#3358ff]/30' : ''">
              <span class="text-[11px] font-semibold self-start" :class="cell.isToday ? 'text-[#3358ff]' : 'text-slate-500'">{{ cell.day }}</span>
              <span v-if="cell.att" class="mt-1 px-2 py-1 rounded-lg text-[10px] font-bold leading-none" :class="statusMeta(cell.att.status).cls">
                {{ statusMeta(cell.att.status).short }}
              </span>
              <span v-else-if="cell.hasReport" class="mt-1 px-2 py-1 rounded-lg text-[10px] font-bold leading-none bg-emerald-50 text-emerald-500" title="Ada laporan harian">LAPOR</span>
            </button>
            <div v-else class="min-h-[72px] border-b border-r border-slate-100 bg-slate-50/60 last:border-r-0" />
          </template>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-3 text-xs text-slate-500">
        <span v-for="s in STATUSES" :key="s.key" class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-md" :class="s.dot" />{{ s.label }}
        </span>
        <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-md bg-emerald-50 border border-emerald-200" /> Ada laporan</span>
      </div>
    </template>

    <!-- Modal set status -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="dayModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="dayModal = null">
          <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900">Set Absensi</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ dayModal.label }} · {{ memberName }}</p>
              </div>
              <button @click="dayModal = null" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <button v-for="s in STATUSES" :key="s.key" @click="setStatus(s.key)" :disabled="saving"
                  class="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition disabled:opacity-50"
                  :class="dayModal.current === s.key ? 'border-[#3358ff] bg-[#3358ff]/5 text-[#3358ff]' : 'border-slate-200 text-slate-600 hover:border-slate-300'">
                  <span class="w-2.5 h-2.5 rounded-full" :class="s.dot" />{{ s.label }}
                </button>
              </div>
              <input v-model="noteInput" type="text" maxlength="255" placeholder="Catatan (opsional, mis. alasan izin)"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" />
              <button v-if="dayModal.current" @click="setStatus('clear')" :disabled="saving"
                class="w-full py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition disabled:opacity-50">
                Hapus catatan absen
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const STATUSES = [
  { key: 'hadir', label: 'Hadir', short: 'HADIR', dot: 'bg-emerald-500', cls: 'bg-emerald-100 text-emerald-700' },
  { key: 'izin',  label: 'Izin',  short: 'IZIN',  dot: 'bg-blue-500',    cls: 'bg-blue-100 text-blue-700' },
  { key: 'sakit', label: 'Sakit', short: 'SAKIT', dot: 'bg-amber-500',   cls: 'bg-amber-100 text-amber-700' },
  { key: 'alpha', label: 'Alpha', short: 'ALPHA', dot: 'bg-red-500',     cls: 'bg-red-100 text-red-700' },
  { key: 'libur', label: 'Libur', short: 'LIBUR', dot: 'bg-slate-400',   cls: 'bg-slate-100 text-slate-600' },
]
const statusMeta = (s: string) => STATUSES.find(x => x.key === s) || STATUSES[0]
const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const members = ref<any[]>([])
const selectedUser = ref('')
const cursor = ref(new Date())
const att = ref<any[]>([])
const reports = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const dayModal = ref<any>(null)
const noteInput = ref('')

const memberName = computed(() => members.value.find(m => m.id === selectedUser.value)?.name || '')
const monthLabel = computed(() => cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const todayStr = new Date().toISOString().slice(0, 10)
function shift(n: number) { cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + n, 1) }
function cellDate(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }

onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/team'); members.value = r.data || [] } catch { /* ignore */ }
})

const range = computed(() => {
  const y = cursor.value.getFullYear(), m = cursor.value.getMonth()
  return { from: cellDate(y, m, 1), to: cellDate(y, m, new Date(y, m + 1, 0).getDate()) }
})

async function load() {
  if (!selectedUser.value) return
  loading.value = true
  try {
    const [a, rep] = await Promise.all([
      $fetch<any>('/api/portal/attendance', { params: { user_id: selectedUser.value, from: range.value.from, to: range.value.to } }),
      $fetch<any>('/api/portal/daily-reports', { params: { user_id: selectedUser.value } }).catch(() => ({ data: [] })),
    ])
    att.value = a.data || []
    reports.value = rep.data || []
  } catch { /* ignore */ }
  loading.value = false
}
watch([selectedUser, cursor], load)

const attMap = computed(() => {
  const m: Record<string, any> = {}
  for (const a of att.value) m[String(a.date).slice(0, 10)] = a
  return m
})
const reportDates = computed(() => new Set(reports.value.map(r => String(r.report_date).slice(0, 10))))

const cells = computed(() => {
  const y = cursor.value.getFullYear(), m = cursor.value.getMonth()
  const startDay = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const arr: any[] = []
  for (let i = 0; i < startDay; i++) arr.push({ inMonth: false })
  for (let d = 1; d <= daysInMonth; d++) {
    const key = cellDate(y, m, d)
    arr.push({ inMonth: true, day: d, key, isToday: key === todayStr, att: attMap.value[key] || null, hasReport: reportDates.value.has(key) })
  }
  while (arr.length < 42) arr.push({ inMonth: false })
  return arr
})

const stats = computed(() => {
  const c = { hadir: 0, izin: 0, sakit: 0, alpha: 0, libur: 0, workdays: 0 }
  const y = cursor.value.getFullYear(), m = cursor.value.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const key = cellDate(y, m, d)
    if (key > todayStr) break
    const dow = new Date(y, m, d).getDay()
    const a = attMap.value[key]
    if (a) { (c as any)[a.status]++ }
    // hari kerja Sen–Jum utk hitung kehadiran
    if (dow >= 1 && dow <= 5 && a?.status !== 'libur') c.workdays++
  }
  // hadir efektif = status hadir + hari ada laporan tanpa status
  const hadirReport = reports.value.filter(r => {
    const k = String(r.report_date).slice(0, 10)
    return k >= range.value.from && k <= range.value.to && k <= todayStr && !attMap.value[k]
  }).length
  const hadirTotal = c.hadir + hadirReport
  return { ...c, hadir: hadirTotal, pct: c.workdays > 0 ? Math.round((hadirTotal / c.workdays) * 100) : 0 }
})

function openDay(cell: any) {
  dayModal.value = {
    key: cell.key,
    label: new Date(cell.key).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
    current: cell.att?.status || '',
  }
  noteInput.value = cell.att?.note || ''
}

async function setStatus(status: string) {
  if (!dayModal.value) return
  saving.value = true
  try {
    await $fetch('/api/portal/attendance', { method: 'POST', body: { user_id: selectedUser.value, date: dayModal.value.key, status, note: noteInput.value } })
    dayModal.value = null
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal menyimpan.') }
  finally { saving.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
