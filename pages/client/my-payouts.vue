<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Pembayaran Saya</h1>
      <p class="text-slate-500 text-sm mt-0.5">Riwayat & status payout dari Lakara.</p>
    </div>

    <div v-if="!loading && payouts.length" class="grid grid-cols-2 gap-4">
      <div class="bg-white border border-slate-100 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Sudah dibayar</div>
        <div class="text-xl font-extrabold text-green-600">Rp {{ fmt(totalPaid) }}</div>
      </div>
      <div class="bg-white border border-slate-100 rounded-2xl p-4">
        <div class="text-xs text-slate-400">Menunggu</div>
        <div class="text-xl font-extrabold text-amber-600">Rp {{ fmt(totalPending) }}</div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!payouts.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-cash" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada pembayaran.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="p in payouts" :key="p.id" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="p.status === 'paid' ? 'bg-green-50' : 'bg-amber-50'">
          <UIcon name="i-tabler-cash" class="w-5 h-5" :class="p.status === 'paid' ? 'text-green-500' : 'text-amber-500'" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-extrabold text-slate-900">Rp {{ fmt(p.amount) }}</div>
          <div class="text-xs text-slate-400">{{ p.period_start || '' }} {{ p.period_end ? '– ' + p.period_end : '' }}<span v-if="p.notes"> · {{ p.notes }}</span></div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">{{ p.status === 'paid' ? 'Dibayar' : 'Pending' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
const loading = ref(true)
const payouts = ref<any[]>([])
const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const totalPaid = computed(() => payouts.value.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0))
const totalPending = computed(() => payouts.value.filter(p => p.status !== 'paid').reduce((s, p) => s + Number(p.amount || 0), 0))
onMounted(async () => {
  try { const r = await $fetch<any>('/api/portal/payouts'); payouts.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
})
</script>
