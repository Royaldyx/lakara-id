<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Invoice</h1>
        <p class="text-slate-500 text-sm mt-0.5">Buat & kelola tagihan klien.</p>
      </div>
      <div class="flex gap-2">
        <button @click="generateRecurring" :disabled="generating" class="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-50">
          <UIcon :name="generating ? 'i-tabler-loader-2' : 'i-tabler-calendar-repeat'" :class="generating && 'animate-spin'" class="w-4 h-4" /> Generate Bulanan
        </button>
        <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
          <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Invoice
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!invoices.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-file-invoice" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada invoice.</p>
    </div>

    <div v-else class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-left font-semibold px-4 py-3">No. Invoice</th>
              <th class="text-left font-semibold px-4 py-3">Klien</th>
              <th class="text-right font-semibold px-4 py-3">Nominal</th>
              <th class="text-left font-semibold px-4 py-3">Status</th>
              <th class="text-right font-semibold px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="i in invoices" :key="i.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3 font-mono text-xs">{{ i.invoice_number }}</td>
              <td class="px-4 py-3 text-slate-700">{{ i.company_name }}</td>
              <td class="px-4 py-3 text-right font-semibold">Rp {{ fmt(i.amount) }}</td>
              <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="statusCls(i.status)">{{ statusLabel(i.status) }}</span></td>
              <td class="px-4 py-3 text-right"><NuxtLink :to="`/client/invoices/${i.id}`" class="text-xs font-semibold text-[#3358ff] hover:underline">Detail</NuxtLink></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Invoice</h3>
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

              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700">Item</label>
                <div v-for="(it, idx) in form.items" :key="idx" class="flex gap-2">
                  <input v-model="it.desc" placeholder="Deskripsi" class="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm" />
                  <input v-model.number="it.qty" type="number" min="1" placeholder="Qty" class="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                  <input v-model.number="it.price" type="number" min="0" placeholder="Harga" class="w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                  <button @click="form.items.splice(idx, 1)" class="text-red-400 hover:text-red-600"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
                </div>
                <button @click="form.items.push({ desc: '', qty: 1, price: 0 })" class="text-xs font-semibold text-[#3358ff] hover:underline">+ Tambah item</button>
              </div>

              <div class="flex justify-between text-sm font-bold border-t border-slate-100 pt-3">
                <span>Total</span><span class="text-[#3358ff]">Rp {{ fmt(total) }}</span>
              </div>
              <UFormGroup label="Jatuh Tempo"><UInput v-model="form.due_date" type="date" /></UFormGroup>
              <UFormGroup label="Catatan"><UTextarea v-model="form.notes" :rows="2" /></UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Buat & Kirim</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { invoiceStatus } from '~/composables/portalLabels'

const loading = ref(true)
const invoices = ref<any[]>([])
const clients = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const generating = ref(false)
const formError = ref('')

async function generateRecurring() {
  if (!confirm('Generate invoice langganan bulan ini untuk semua klien dengan paket aktif?')) return
  generating.value = true
  try {
    const r = await $fetch<any>('/api/portal/invoices/generate-recurring', { method: 'POST' })
    alert(`Selesai: ${r.created} invoice dibuat, ${r.skipped} dilewati (sudah ada / tanpa paket).`)
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal generate.') }
  finally { generating.value = false }
}
const form = reactive<any>({ client_id: '', items: [{ desc: '', qty: 1, price: 0 }], due_date: '', notes: '' })

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const statusLabel = (s: string) => invoiceStatus(s).label
const statusCls = (s: string) => invoiceStatus(s).class
const total = computed(() => form.items.reduce((s: number, it: any) => s + (Number(it.qty || 1) * Number(it.price || 0)), 0))

async function load() {
  loading.value = true
  try {
    const [i, c] = await Promise.all([$fetch<any>('/api/portal/invoices'), $fetch<any>('/api/portal/clients')])
    invoices.value = i.data || []
    clients.value = c.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() {
  formError.value = ''
  Object.assign(form, { client_id: '', items: [{ desc: '', qty: 1, price: 0 }], due_date: '', notes: '' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.client_id) { formError.value = 'Pilih klien dulu.'; return }
  if (total.value <= 0) { formError.value = 'Total harus lebih dari 0.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/invoices', { method: 'POST', body: { ...form, items: form.items.filter((it: any) => it.desc) } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal.' }
  finally { saving.value = false }
}
</script>
