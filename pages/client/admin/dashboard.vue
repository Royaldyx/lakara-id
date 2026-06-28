<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Dashboard Admin</h1>
      <p class="text-slate-500 text-sm mt-0.5">Ringkasan operasional seluruh klien.</p>
    </div>

    <div v-if="loading" class="text-center py-20 text-slate-400">
      <UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" />
    </div>

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="s in cards" :key="s.label" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :class="s.bg">
            <UIcon :name="s.icon" class="w-5 h-5" :class="s.color" />
          </div>
          <div class="text-2xl font-extrabold text-slate-900">{{ s.value }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ s.label }}</div>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <NuxtLink to="/client/admin/clients" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-[#3358ff] flex items-center justify-center"><UIcon name="i-tabler-users" class="w-5 h-5 text-white" /></div>
          <div><div class="font-bold text-slate-900 text-sm">Kelola Klien</div><div class="text-xs text-slate-400">Tambah & atur data klien</div></div>
        </NuxtLink>
        <NuxtLink v-if="isSuperAdmin" to="/client/admin/users" class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-purple-500 flex items-center justify-center"><UIcon name="i-tabler-user-shield" class="w-5 h-5 text-white" /></div>
          <div><div class="font-bold text-slate-900 text-sm">User Portal</div><div class="text-xs text-slate-400">Kelola admin & super admin</div></div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const { isSuperAdmin } = usePortal()
const loading = ref(true)
const data = ref<any>(null)

onMounted(async () => {
  try { data.value = await $fetch('/api/portal/dashboard') } catch { /* ignore */ }
  loading.value = false
})

const cards = computed(() => {
  const s = data.value?.stats || {}
  return [
    { label: 'Total Klien',     value: s.total_clients ?? 0,    icon: 'i-tabler-building',     color: 'text-[#3358ff]', bg: 'bg-blue-50' },
    { label: 'Langganan Aktif', value: s.active_subs ?? 0,      icon: 'i-tabler-rosette',      color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Perlu Approval',  value: s.waiting_approval ?? 0, icon: 'i-tabler-clock',        color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Tiket Terbuka',   value: s.open_tickets ?? 0,     icon: 'i-tabler-ticket',       color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Invoice Belum Bayar', value: s.unpaid_invoices ?? 0, icon: 'i-tabler-file-invoice', color: 'text-red-500', bg: 'bg-red-50' },
  ]
})
</script>
