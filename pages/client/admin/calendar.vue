<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Kalender & Konten</h1>
        <p class="text-slate-500 text-sm mt-0.5">Buat, jadwalkan, dan kelola konten klien.</p>
      </div>
      <button @click="openCreate" :disabled="!clientId" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition disabled:opacity-40">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Konten
      </button>
    </div>

    <!-- Filter -->
    <div class="flex flex-wrap items-center gap-3">
      <select v-model="clientId" @change="load" class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
        <option value="">— Pilih klien —</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
      </select>
      <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
        <button @click="shiftMonth(-1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-left" class="w-4 h-4" /></button>
        <span class="text-sm font-bold text-slate-900 w-32 text-center">{{ monthLabel }}</span>
        <button @click="shiftMonth(1)" class="p-2 rounded-lg hover:bg-slate-50 text-slate-500"><UIcon name="i-tabler-chevron-right" class="w-4 h-4" /></button>
      </div>
    </div>

    <div v-if="!clientId" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">Pilih klien untuk melihat & mengelola konten.</div>
    <div v-else-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!items.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">Belum ada konten bulan ini.</div>

    <div v-else class="space-y-2">
      <div v-for="c in items" :key="c.id" class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div class="text-center w-12 flex-shrink-0">
          <div class="text-lg font-extrabold text-slate-900 leading-none">{{ dayOf(c) }}</div>
          <div class="text-[10px] text-slate-400 uppercase">{{ monthShort(c) }}</div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-slate-900 text-sm truncate">{{ c.title }}</div>
          <div class="text-xs text-slate-400">{{ typeLabel(c.type) }}<span v-if="c.brief_title"> · {{ c.brief_title }}</span></div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
        <div class="flex items-center gap-1">
          <button v-if="c.status === 'designing' || c.status === 'idea'" @click="setStatus(c, 'waiting_approval')" class="text-xs font-semibold text-amber-600 hover:underline px-2">Kirim Approval</button>
          <button v-if="c.status === 'approved'" @click="setStatus(c, 'scheduled')" class="text-xs font-semibold text-blue-600 hover:underline px-2">Jadwalkan</button>
          <button v-if="c.status === 'scheduled'" @click="setStatus(c, 'published')" class="text-xs font-semibold text-[#3358ff] hover:underline px-2">Tandai Tayang</button>
          <button @click="openEdit(c)" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><UIcon name="i-tabler-pencil" class="w-4 h-4" /></button>
          <button @click="del(c)" class="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
        </div>
      </div>
    </div>

    <!-- Modal create/edit -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">{{ form.id ? 'Edit Konten' : 'Buat Konten' }}</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Judul Konten *"><UInput v-model="form.title" placeholder="Reels promo produk A" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Tipe">
                  <select v-model="form.type" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                    <option v-for="(lbl, val) in typeOptions" :key="val" :value="val">{{ lbl }}</option>
                  </select>
                </UFormGroup>
                <UFormGroup label="Jadwal Tayang"><UInput v-model="form.scheduled_at" type="datetime-local" /></UFormGroup>
              </div>
              <UFormGroup label="Brief Terkait">
                <select v-model="form.brief_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                  <option value="">— Tanpa brief —</option>
                  <option v-for="b in briefs" :key="b.id" :value="b.id">{{ b.title }}</option>
                </select>
              </UFormGroup>
              <UFormGroup label="Caption"><UTextarea v-model="form.caption" :rows="3" /></UFormGroup>
              <UFormGroup label="Link Desain / File" hint="URL Drive / hasil upload">
                <UInput v-model="form.design_file" placeholder="https://…" />
              </UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center justify-center gap-2">
                <UIcon v-if="saving" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Simpan
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

const loading = ref(false)
const clients = ref<any[]>([])
const briefs = ref<any[]>([])
const items = ref<any[]>([])
const clientId = ref('')
const cursor = ref(new Date())
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const typeOptions = CONTENT_TYPE_LABEL
const typeLabel = (t: string) => CONTENT_TYPE_LABEL[t] || t

const blank = { id: '', title: '', type: 'feed', scheduled_at: '', brief_id: '', caption: '', design_file: '' }
const form = reactive({ ...blank })

const monthKey = computed(() => `${cursor.value.getFullYear()}-${String(cursor.value.getMonth() + 1).padStart(2, '0')}`)
const monthLabel = computed(() => cursor.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))
const dateOf = (c: any) => new Date(c.scheduled_at || c.created_at)
const dayOf = (c: any) => dateOf(c).getDate()
const monthShort = (c: any) => dateOf(c).toLocaleDateString('id-ID', { month: 'short' })

async function loadClients() {
  try { const r = await $fetch<any>('/api/portal/clients'); clients.value = r.data || [] } catch { /* ignore */ }
}
async function load() {
  if (!clientId.value) { items.value = []; return }
  loading.value = true
  try {
    const [c, b] = await Promise.all([
      $fetch<any>('/api/portal/contents', { query: { client_id: clientId.value, month: monthKey.value } }),
      $fetch<any>('/api/portal/briefs', { query: { client_id: clientId.value } }).catch(() => ({ data: [] })),
    ])
    items.value = c.data || []
    briefs.value = b.data || []
  } catch { items.value = [] }
  loading.value = false
}
function shiftMonth(n: number) { const d = new Date(cursor.value); d.setMonth(d.getMonth() + n); cursor.value = d; load() }
onMounted(loadClients)

function openCreate() { formError.value = ''; Object.assign(form, blank); showModal.value = true }
function openEdit(c: any) {
  formError.value = ''
  Object.assign(form, {
    id: c.id, title: c.title, type: c.type, brief_id: c.brief_id || '',
    caption: c.caption || '', design_file: c.design_file || '',
    scheduled_at: c.scheduled_at ? toLocalInput(c.scheduled_at) : '',
  })
  showModal.value = true
}
const toLocalInput = (s: string) => { const d = new Date(s); const off = d.getTimezoneOffset(); return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16) }

async function submit() {
  formError.value = ''
  if (!form.title.trim()) { formError.value = 'Judul konten wajib diisi.'; return }
  saving.value = true
  try {
    const body: any = { action: form.id ? 'update' : 'create', client_id: clientId.value, ...form }
    if (body.scheduled_at) body.scheduled_at = body.scheduled_at.replace('T', ' ') + ':00'
    await $fetch('/api/portal/contents', { method: 'POST', body })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal menyimpan.' }
  finally { saving.value = false }
}
async function setStatus(c: any, status: string) {
  try { await $fetch('/api/portal/contents', { method: 'POST', body: { action: 'set_status', id: c.id, status } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengubah status.') }
}
async function del(c: any) {
  if (!confirm(`Hapus konten "${c.title}"?`)) return
  try { await $fetch('/api/portal/contents', { method: 'POST', body: { action: 'delete', id: c.id } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal menghapus.') }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
