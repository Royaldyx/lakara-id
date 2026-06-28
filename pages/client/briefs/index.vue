<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Brief Campaign</h1>
        <p class="text-slate-500 text-sm mt-0.5">Kirim brief campaign ke tim Lakara.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Brief
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!briefs.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-file-text" class="w-10 h-10 mx-auto mb-2" />
      <p class="text-sm">Belum ada brief. Klik "Buat Brief" untuk mulai.</p>
    </div>

    <div v-else class="grid sm:grid-cols-2 gap-4">
      <NuxtLink v-for="b in briefs" :key="b.id" :to="`/client/briefs/${b.id}`"
        class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition block">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-slate-900 line-clamp-2">{{ b.title }}</h3>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
        </div>
        <p v-if="b.objective" class="text-sm text-slate-500 mt-1.5 line-clamp-2">{{ b.objective }}</p>
        <div class="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span v-if="b.deadline" class="flex items-center gap-1"><UIcon name="i-tabler-calendar" class="w-3.5 h-3.5" /> {{ fmtDate(b.deadline) }}</span>
          <span class="flex items-center gap-1"><UIcon name="i-tabler-photo" class="w-3.5 h-3.5" /> {{ b.content_count }} konten</span>
        </div>
      </NuxtLink>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Brief Baru</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Judul Brief *"><UInput v-model="form.title" placeholder="Promo Ramadan 2026" /></UFormGroup>
              <UFormGroup label="Objective / Tujuan"><UTextarea v-model="form.objective" :rows="2" placeholder="Naikkan awareness produk baru…" /></UFormGroup>
              <UFormGroup label="Detail / Deskripsi"><UTextarea v-model="form.description" :rows="3" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Promo / Penawaran"><UInput v-model="form.promo" placeholder="Diskon 30%" /></UFormGroup>
                <UFormGroup label="Call to Action"><UInput v-model="form.cta" placeholder="Order via WA" /></UFormGroup>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Deadline"><UInput v-model="form.deadline" type="date" /></UFormGroup>
                <UFormGroup label="Referensi (link)"><UInput v-model="form.reference" placeholder="Link Drive / Pinterest" /></UFormGroup>
              </div>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="submit('draft')" :disabled="saving" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Simpan Draft</button>
              <button @click="submit('submitted')" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center justify-center gap-2">
                <UIcon v-if="saving" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Kirim Brief
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

const loading = ref(true)
const briefs = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const blank = { title: '', objective: '', description: '', promo: '', cta: '', deadline: '', reference: '' }
const form = reactive({ ...blank })

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/briefs'); briefs.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() { formError.value = ''; Object.assign(form, blank); showModal.value = true }

async function submit(status: string) {
  formError.value = ''
  if (!form.title.trim()) { formError.value = 'Judul brief wajib diisi.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/briefs', { method: 'POST', body: { action: 'create', status, ...form } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal menyimpan.' }
  finally { saving.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
