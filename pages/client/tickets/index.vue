<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Tiket Support</h1>
        <p class="text-slate-500 text-sm mt-0.5">Butuh bantuan? Buat tiket, semua tercatat rapi.</p>
      </div>
      <button @click="showModal = true" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Tiket
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!tickets.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-ticket-off" class="w-10 h-10 mx-auto mb-2" />
      <p class="text-sm">Belum ada tiket.</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink v-for="t in tickets" :key="t.id" :to="`/client/tickets/${t.id}`"
        class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <UIcon :name="catIcon(t.category)" class="w-5 h-5 text-slate-500" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 truncate">{{ t.subject }}</div>
            <div class="text-xs text-slate-400">{{ catLabel(t.category) }} · {{ t.msg_count }} pesan</div>
          </div>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span>
        </div>
      </NuxtLink>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Tiket Baru</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Subjek *"><UInput v-model="form.subject" placeholder="Contoh: Revisi desain feed minggu ini" /></UFormGroup>
              <UFormGroup label="Kategori">
                <select v-model="form.category" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                  <option value="general">Pertanyaan Umum</option>
                  <option value="revision">Revisi</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Teknis</option>
                </select>
              </UFormGroup>
              <UFormGroup label="Pesan"><UTextarea v-model="form.message" :rows="4" placeholder="Jelaskan kebutuhanmu…" /></UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Kirim</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { ticketCat, ticketStatus } from '~/composables/portalLabels'

const loading = ref(true)
const tickets = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ subject: '', category: 'general', message: '' })

const catIcon = (c: string) => ticketCat(c).icon
const catLabel = (c: string) => ticketCat(c).label
const statusLabel = (s: string) => ticketStatus(s).label
const statusClass = (s: string) => ticketStatus(s).class

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/tickets'); tickets.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function submit() {
  formError.value = ''
  if (!form.subject.trim()) { formError.value = 'Subjek wajib diisi.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/tickets', { method: 'POST', body: { ...form } })
    showModal.value = false
    Object.assign(form, { subject: '', category: 'general', message: '' })
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal mengirim.' }
  finally { saving.value = false }
}
</script>
