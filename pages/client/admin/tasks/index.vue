<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Tugas</h1>
        <p class="text-slate-500 text-sm mt-0.5">Assign & pantau tugas tim/freelancer.</p>
      </div>
      <button @click="openCreate()" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Tugas
      </button>
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
      <div v-for="t in shown" :key="t.id" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0"><UIcon :name="typeIcon(t.type)" class="w-5 h-5 text-slate-500" /></div>
        <NuxtLink :to="`/client/tasks/${t.id}`" class="min-w-0 flex-1">
          <div class="font-semibold text-slate-900 truncate hover:text-[#3358ff]">{{ t.title }}</div>
          <div class="text-xs text-slate-400 truncate">
            {{ typeLabel(t.type) }} · {{ t.assignee_name || 'Belum di-assign' }}
            <span v-if="t.company_name"> · {{ t.company_name }}</span>
            <span v-if="t.deadline"> · {{ t.deadline }}</span>
          </div>
        </NuxtLink>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span>
        <button @click="openCreate(t)" class="p-1.5 text-slate-400 hover:text-[#3358ff]"><UIcon name="i-tabler-pencil" class="w-4 h-4" /></button>
        <button @click="del(t)" class="p-1.5 text-slate-400 hover:text-red-500"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">{{ form.id ? 'Edit' : 'Buat' }} Tugas</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Judul *"><UInput v-model="form.title" placeholder="Desain feed promo Ramadhan" /></UFormGroup>
              <UFormGroup label="Brief / Deskripsi"><UTextarea v-model="form.description" :rows="3" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Tipe">
                  <select v-model="form.type" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="design">Desain</option><option value="writing">Content Writing</option><option value="uiux">UI/UX</option><option value="other">Lainnya</option>
                  </select>
                </UFormGroup>
                <UFormGroup label="Deadline"><UInput v-model="form.deadline" type="date" /></UFormGroup>
              </div>
              <UFormGroup label="Assign ke">
                <select v-model="form.assignee_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Belum di-assign —</option>
                  <option v-for="m in team" :key="m.id" :value="m.id">{{ m.name }} ({{ m.role === 'staff' ? 'Staff' : 'Freelancer' }})</option>
                </select>
              </UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Fee (Rp)" hint="0 untuk staff"><UInput v-model.number="form.fee" type="number" min="0" /></UFormGroup>
                <UFormGroup label="Klien (opsional)">
                  <select v-model="form.client_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">— Tidak ada —</option>
                    <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
                  </select>
                </UFormGroup>
              </div>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { taskType, taskStatus } from '~/composables/portalLabels'

const loading = ref(true)
const tasks = ref<any[]>([])
const team = ref<any[]>([])
const clients = ref<any[]>([])
const filter = ref('')
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive<any>({ id: '', title: '', description: '', type: 'design', deadline: '', assignee_id: '', fee: 0, client_id: '' })

const filters = [
  { label: 'Semua', value: '' }, { label: 'To Do', value: 'todo' }, { label: 'Dikerjakan', value: 'in_progress' },
  { label: 'Disubmit', value: 'submitted' }, { label: 'Revisi', value: 'revision' }, { label: 'Selesai', value: 'done' },
]
const typeIcon = (t: string) => taskType(t).icon
const typeLabel = (t: string) => taskType(t).label
const statusLabel = (s: string) => taskStatus(s).label
const statusClass = (s: string) => taskStatus(s).class
const shown = computed(() => filter.value ? tasks.value.filter(t => t.status === filter.value) : tasks.value)

async function load() {
  loading.value = true
  try {
    const [t, tm, c] = await Promise.all([
      $fetch<any>('/api/portal/tasks'),
      $fetch<any>('/api/portal/team'),
      $fetch<any>('/api/portal/clients').catch(() => ({ data: [] })),
    ])
    tasks.value = t.data || []; team.value = tm.data || []; clients.value = c.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate(t?: any) {
  formError.value = ''
  if (t) Object.assign(form, { id: t.id, title: t.title, description: t.description || '', type: t.type, deadline: t.deadline || '', assignee_id: t.assignee_id || '', fee: t.fee || 0, client_id: t.client_id || '' })
  else Object.assign(form, { id: '', title: '', description: '', type: 'design', deadline: '', assignee_id: '', fee: 0, client_id: '' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.title.trim()) { formError.value = 'Judul wajib.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/tasks', { method: 'POST', body: { action: form.id ? 'update' : 'create', ...form } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal.' }
  finally { saving.value = false }
}

async function del(t: any) {
  if (!confirm(`Hapus tugas "${t.title}"?`)) return
  try { await $fetch('/api/portal/tasks', { method: 'POST', body: { action: 'delete', id: t.id } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}
</script>
