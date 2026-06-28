<template>
  <div v-if="inv" class="inv-print max-w-2xl mx-auto p-8 bg-white text-slate-800">
    <div class="flex items-start justify-between mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 rounded-lg bg-[#3358ff] flex items-center justify-center">
            <span class="text-white font-black text-sm">L</span>
          </div>
          <span class="font-extrabold text-xl text-slate-900">Lakara</span>
        </div>
        <div class="text-xs text-slate-400">PT Lakara Solusi Kreatif</div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-extrabold text-slate-900">INVOICE</div>
        <div class="font-mono text-sm text-slate-500">{{ inv.invoice_number }}</div>
        <div class="mt-1 inline-block px-2 py-0.5 rounded text-xs font-bold" :class="statusCls(inv.status)">{{ statusLabel(inv.status) }}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-6 mb-8 text-sm">
      <div>
        <div class="text-xs uppercase tracking-wide text-slate-400 font-bold mb-1">Ditagihkan kepada</div>
        <div class="font-bold text-slate-900">{{ inv.company_name }}</div>
        <div v-if="inv.pic_name" class="text-slate-500">{{ inv.pic_name }}</div>
        <div v-if="inv.client_email" class="text-slate-500">{{ inv.client_email }}</div>
        <div v-if="inv.client_whatsapp" class="text-slate-500">{{ inv.client_whatsapp }}</div>
      </div>
      <div class="text-right">
        <div class="mb-2"><span class="text-slate-400">Tanggal Terbit:</span> <strong>{{ inv.issued_date || '—' }}</strong></div>
        <div><span class="text-slate-400">Jatuh Tempo:</span> <strong>{{ inv.due_date || '—' }}</strong></div>
      </div>
    </div>

    <table class="w-full text-sm mb-6">
      <thead>
        <tr class="border-b-2 border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
          <th class="py-2">Deskripsi</th>
          <th class="py-2 text-center">Qty</th>
          <th class="py-2 text-right">Harga</th>
          <th class="py-2 text-right">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(it, idx) in inv.items" :key="idx" class="border-b border-slate-100">
          <td class="py-2.5">{{ it.desc }}</td>
          <td class="py-2.5 text-center">{{ it.qty || 1 }}</td>
          <td class="py-2.5 text-right">Rp {{ fmt(Number(it.price || 0)) }}</td>
          <td class="py-2.5 text-right font-semibold">Rp {{ fmt(Number(it.qty || 1) * Number(it.price || 0)) }}</td>
        </tr>
        <tr v-if="!inv.items?.length"><td colspan="4" class="py-2.5 text-slate-500">{{ inv.notes || 'Layanan agency' }}</td></tr>
      </tbody>
    </table>

    <div class="flex justify-end mb-8">
      <div class="w-56">
        <div class="flex justify-between border-t-2 border-slate-900 pt-3">
          <span class="font-bold text-slate-900">TOTAL</span>
          <span class="font-extrabold text-slate-900">Rp {{ fmt(inv.amount) }}</span>
        </div>
      </div>
    </div>

    <p v-if="inv.notes && inv.items?.length" class="text-xs text-slate-500 border-t border-slate-100 pt-4">Catatan: {{ inv.notes }}</p>
    <p class="text-xs text-slate-400 mt-6 text-center">Terima kasih atas kepercayaan Anda kepada Lakara · lakara.id</p>

    <div class="no-print mt-8 text-center">
      <button @click="print" class="px-5 py-2.5 bg-[#3358ff] text-white text-sm font-bold rounded-xl">Cetak / Simpan PDF</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'portal' })
import { invoiceStatus } from '~/composables/portalLabels'

const route = useRoute()
const inv = ref<any>(null)
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const statusLabel = (s: string) => invoiceStatus(s).label
const statusCls = (s: string) => invoiceStatus(s).class

const print = () => window.print()

onMounted(async () => {
  try {
    const r = await $fetch<any>(`/api/portal/invoices/${route.params.id}`)
    inv.value = r.invoice
    await nextTick()
    setTimeout(() => window.print(), 400)
  } catch { /* ignore */ }
})
</script>

<style>
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
}
</style>
