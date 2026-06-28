<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Kontrak / MOU</h1>
        <p class="text-slate-500 text-sm mt-0.5">Kelola kontrak staff & freelancer.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Kontrak
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!contracts.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-file-text" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada kontrak.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="c in contracts" :key="c.id" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-slate-900 truncate">{{ c.title }}</div>
          <div class="text-xs text-slate-400">{{ c.member_name }} · {{ rateLabel(c.rate_type) }} Rp {{ fmt(c.rate) }}</div>
        </div>
        <a v-if="c.file_path" :href="c.file_path" target="_blank" class="text-slate-400 hover:text-[#3358ff]"><UIcon name="i-tabler-download" class="w-4 h-4" /></a>
        <button @click="del(c)" class="text-slate-400 hover:text-red-500"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Kontrak</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Anggota *">
                <select v-model="form.user_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Pilih —</option>
                  <option v-for="m in team" :key="m.id" :value="m.id">{{ m.name }} ({{ m.role === 'staff' ? 'Staff' : 'Freelancer' }})</option>
                </select>
              </UFormGroup>
              <UFormGroup label="Judul *"><UInput v-model="form.title" placeholder="MOU Freelance Desain 2026" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Tipe Rate">
                  <select v-model="form.rate_type" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                    <option value="per_task">Per tugas</option><option value="hourly">Per jam</option><option value="monthly">Bulanan</option>
                  </select>
                </UFormGroup>
                <UFormGroup label="Rate (Rp)"><UInput v-model.number="form.rate" type="number" min="0" /></UFormGroup>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Mulai"><UInput v-model="form.start_date" type="date" /></UFormGroup>
                <UFormGroup label="Berakhir"><UInput v-model="form.end_date" type="date" /></UFormGroup>
              </div>
              <UFormGroup label="Scope / Ruang Lingkup"><UTextarea v-model="form.scope" :rows="3" /></UFormGroup>
              <UFormGroup label="File MOU (PDF/DOC, opsional)">
                <button @click="fileInput?.click()" class="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
                  <UIcon name="i-tabler-upload" class="w-4 h-4" /> {{ fileName || 'Pilih File' }}
                </button>
                <input ref="fileInput" type="file" class="hidden" @change="onFile" />
              </UFormGroup>
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

const loading = ref(true)
const contracts = ref<any[]>([])
const team = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const file = ref<File | null>(null); const fileName = ref('')
const fileInput = ref<HTMLInputElement>()
const form = reactive<any>({ user_id: '', title: '', rate_type: 'per_task', rate: 0, start_date: '', end_date: '', scope: '' })

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const rateLabel = (t: string) => ({ hourly: 'Per jam', per_task: 'Per tugas', monthly: 'Bulanan' } as any)[t] || t

async function load() {
  loading.value = true
  try {
    const [c, t] = await Promise.all([$fetch<any>('/api/portal/contracts'), $fetch<any>('/api/portal/team')])
    contracts.value = c.data || []; team.value = t.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function onFile(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { file.value = f; fileName.value = f.name } }
function openCreate() {
  formError.value = ''; file.value = null; fileName.value = ''
  Object.assign(form, { user_id: '', title: '', rate_type: 'per_task', rate: 0, start_date: '', end_date: '', scope: '' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.user_id || !form.title.trim()) { formError.value = 'Anggota & judul wajib.'; return }
  saving.value = true
  try {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? '')))
    if (file.value) fd.append('file', file.value)
    await $fetch('/api/portal/contracts', { method: 'POST', body: fd })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal.' }
  finally { saving.value = false }
}

async function del(c: any) {
  if (!confirm(`Hapus kontrak "${c.title}"?`)) return
  try { await $fetch(`/api/portal/contracts/${c.id}`, { method: 'DELETE' }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}
</script>
