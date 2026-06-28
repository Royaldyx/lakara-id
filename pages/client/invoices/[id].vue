<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <NuxtLink :to="isAdmin ? '/client/admin/invoices' : '/client/invoices'" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="inv">
      <div class="bg-white border border-slate-100 rounded-2xl p-6">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-mono font-bold text-lg text-slate-900">{{ inv.invoice_number }}</div>
            <div class="text-xs text-slate-400 mt-0.5">Tagihan untuk {{ inv.company_name }}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold" :class="statusCls(inv.status)">{{ statusLabel(inv.status) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-5 text-sm">
          <div><div class="text-slate-400 text-xs">Tanggal Terbit</div><div class="font-semibold">{{ inv.issued_date || '—' }}</div></div>
          <div><div class="text-slate-400 text-xs">Jatuh Tempo</div><div class="font-semibold">{{ inv.due_date || '—' }}</div></div>
        </div>

        <div v-if="inv.items?.length" class="mt-5 border-t border-slate-100 pt-4 space-y-2">
          <div v-for="(it, idx) in inv.items" :key="idx" class="flex justify-between text-sm">
            <span class="text-slate-600">{{ it.desc }} <span v-if="it.qty > 1" class="text-slate-400">×{{ it.qty }}</span></span>
            <span class="font-semibold">Rp {{ fmt(Number(it.qty || 1) * Number(it.price || 0)) }}</span>
          </div>
        </div>

        <div class="mt-4 border-t border-slate-100 pt-4 flex justify-between items-center">
          <span class="font-bold text-slate-900">Total</span>
          <span class="text-2xl font-extrabold text-[#3358ff]">Rp {{ fmt(inv.amount) }}</span>
        </div>
        <p v-if="inv.notes" class="text-xs text-slate-500 mt-3">{{ inv.notes }}</p>
      </div>

      <div class="flex gap-2 flex-wrap">
        <a :href="`/client/invoices/${inv.id}/print`" target="_blank"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee]">
          <UIcon name="i-tabler-download" class="w-4 h-4" /> Download / Cetak PDF
        </a>
        <!-- Admin: ubah status -->
        <template v-if="isAdmin">
          <button v-if="inv.status !== 'paid'" @click="setStatus('paid')" class="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600">
            <UIcon name="i-tabler-check" class="w-4 h-4" /> Tandai Lunas
          </button>
          <button v-if="inv.status !== 'overdue' && inv.status !== 'paid'" @click="setStatus('overdue')" class="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">Tandai Jatuh Tempo</button>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { invoiceStatus } from '~/composables/portalLabels'

const route = useRoute()
const { isAdmin } = usePortal()
const id = route.params.id as string
const loading = ref(true)
const inv = ref<any>(null)
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const statusLabel = (s: string) => invoiceStatus(s).label
const statusCls = (s: string) => invoiceStatus(s).class

async function load() {
  loading.value = true
  try { const r = await $fetch<any>(`/api/portal/invoices/${id}`); inv.value = r.invoice } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function setStatus(status: string) {
  try { await $fetch(`/api/portal/invoices/${id}/status`, { method: 'POST', body: { status } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}
</script>
