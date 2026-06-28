<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Laporan</h1>
        <p class="text-slate-500 text-sm mt-0.5">Buat laporan performa untuk klien.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Laporan
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!reports.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-report-analytics" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada laporan.</p>
    </div>
    <div v-else class="space-y-2">
      <NuxtLink v-for="r in reports" :key="r.id" :to="`/client/reports/${r.id}`" class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#3358ff]/10 flex items-center justify-center flex-shrink-0"><UIcon name="i-tabler-report-analytics" class="w-5 h-5 text-[#3358ff]" /></div>
        <div class="min-w-0 flex-1"><div class="font-semibold text-slate-900 truncate">{{ r.title }}</div><div class="text-xs text-slate-400">{{ r.company_name }} · {{ r.period_start || '' }}</div></div>
      </NuxtLink>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Laporan</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Klien *">
                <select v-model="form.client_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                  <option value="">— Pilih klien —</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
                </select>
              </UFormGroup>
              <UFormGroup label="Judul *"><UInput v-model="form.title" placeholder="Laporan Bulanan Januari 2026" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Periode Mulai"><UInput v-model="form.period_start" type="date" /></UFormGroup>
                <UFormGroup label="Periode Akhir"><UInput v-model="form.period_end" type="date" /></UFormGroup>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700">KPI</label>
                <div v-for="(k, idx) in form.kpi" :key="idx" class="flex gap-2">
                  <input v-model="k.label" placeholder="Followers" class="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm" />
                  <input v-model="k.value" placeholder="+1.200" class="w-32 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm" />
                  <button @click="form.kpi.splice(idx, 1)" class="text-red-400 hover:text-red-600"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
                </div>
                <button @click="form.kpi.push({ label: '', value: '' })" class="text-xs font-semibold text-[#3358ff] hover:underline">+ Tambah KPI</button>
              </div>
              <UFormGroup label="Ringkasan"><UTextarea v-model="form.summary" :rows="3" /></UFormGroup>
              <UFormGroup label="Insight"><UTextarea v-model="form.insight" :rows="3" /></UFormGroup>
              <UFormGroup label="Rekomendasi"><UTextarea v-model="form.recommendation" :rows="3" /></UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan & Kirim</button>
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
const reports = ref<any[]>([])
const clients = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive<any>({ client_id: '', title: '', period_start: '', period_end: '', kpi: [{ label: '', value: '' }], summary: '', insight: '', recommendation: '' })

async function load() {
  loading.value = true
  try {
    const [r, c] = await Promise.all([$fetch<any>('/api/portal/reports'), $fetch<any>('/api/portal/clients')])
    reports.value = r.data || []; clients.value = c.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() {
  formError.value = ''
  Object.assign(form, { client_id: '', title: '', period_start: '', period_end: '', kpi: [{ label: '', value: '' }], summary: '', insight: '', recommendation: '' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.client_id || !form.title.trim()) { formError.value = 'Klien & judul wajib.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/reports', { method: 'POST', body: { ...form, kpi: form.kpi.filter((k: any) => k.label) } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal.' }
  finally { saving.value = false }
}
</script>
