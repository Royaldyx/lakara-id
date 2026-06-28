<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Brief Masuk</h1>
      <p class="text-slate-500 text-sm mt-0.5">Kelola brief campaign dari semua klien.</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <select v-model="fClient" @change="load" class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
        <option value="">Semua klien</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
      </select>
      <select v-model="fStatus" @change="load" class="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
        <option value="">Semua status</option>
        <option value="submitted">Dikirim</option>
        <option value="in_progress">Diproses</option>
        <option value="completed">Selesai</option>
        <option value="draft">Draft</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!briefs.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">Belum ada brief.</div>

    <div v-else class="space-y-2">
      <div v-for="b in briefs" :key="b.id" class="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/client/briefs/${b.id}`" class="font-semibold text-slate-900 text-sm hover:text-[#3358ff] truncate block">{{ b.title }}</NuxtLink>
          <div class="text-xs text-slate-400">{{ b.company_name }}<span v-if="b.deadline"> · deadline {{ fmtDate(b.deadline) }}</span></div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap" :class="statusClass(b.status)">{{ statusLabel(b.status) }}</span>
        <select :value="b.status" @change="(e:any) => setStatus(b, e.target.value)"
          class="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
          <option value="submitted">Dikirim</option>
          <option value="in_progress">Diproses</option>
          <option value="completed">Selesai</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const briefs = ref<any[]>([])
const clients = ref<any[]>([])
const fClient = ref('')
const fStatus = ref('')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''

async function loadClients() {
  try { const r = await $fetch<any>('/api/portal/clients'); clients.value = r.data || [] } catch { /* ignore */ }
}
async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/briefs', { query: { client_id: fClient.value, status: fStatus.value } })
    briefs.value = r.data || []
  } catch { briefs.value = [] }
  loading.value = false
}
onMounted(() => { loadClients(); load() })

async function setStatus(b: any, status: string) {
  try { await $fetch('/api/portal/briefs', { method: 'POST', body: { action: 'set_status', id: b.id, status } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengubah status.'); await load() }
}
</script>
