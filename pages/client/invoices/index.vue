<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Invoice</h1>
      <p class="text-slate-500 text-sm mt-0.5">Tagihan & riwayat pembayaran kamu.</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!invoices.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-file-invoice" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada invoice.</p>
    </div>

    <div v-else class="space-y-2">
      <NuxtLink v-for="i in invoices" :key="i.id" :to="`/client/invoices/${i.id}`"
        class="block bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-sm transition">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="statusBg(i.status)">
            <UIcon name="i-tabler-file-invoice" class="w-5 h-5" :class="statusText(i.status)" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 font-mono text-sm">{{ i.invoice_number }}</div>
            <div class="text-xs text-slate-400">Jatuh tempo: {{ i.due_date || '—' }}</div>
          </div>
          <div class="text-right">
            <div class="font-extrabold text-slate-900">Rp {{ fmt(i.amount) }}</div>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="statusCls(i.status)">{{ statusLabel(i.status) }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { invoiceStatus } from '~/composables/portalLabels'

const loading = ref(true)
const invoices = ref<any[]>([])
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const statusLabel = (s: string) => invoiceStatus(s).label
const statusCls = (s: string) => invoiceStatus(s).class
const statusBg = (s: string) => invoiceStatus(s).bg
const statusText = (s: string) => invoiceStatus(s).text

onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/invoices'); invoices.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
