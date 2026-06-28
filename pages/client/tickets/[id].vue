<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <NuxtLink :to="isAdmin ? '/client/admin/tickets' : '/client/tickets'" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="ticket">
      <!-- Header -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h1 class="text-lg font-extrabold text-slate-900">{{ ticket.subject }}</h1>
            <div class="text-xs text-slate-400 mt-0.5">
              {{ catLabel(ticket.category) }}<span v-if="isAdmin"> · {{ ticket.company_name }}</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(ticket.status)">{{ statusLabel(ticket.status) }}</span>
        </div>
        <!-- Admin: ubah status -->
        <div v-if="isAdmin" class="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
          <span class="text-xs font-semibold text-slate-500">Ubah status:</span>
          <select v-model="statusSel" @change="changeStatus" class="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
            <option value="open">Open</option>
            <option value="in_progress">Diproses</option>
            <option value="waiting_client">Menunggu Klien</option>
            <option value="closed">Selesai</option>
          </select>
        </div>
      </div>

      <!-- Internal notes (admin only) -->
      <PortalNotes entity-type="ticket" :entity-id="ticket.id" />

      <!-- Thread -->
      <div class="space-y-3">
        <div v-for="m in messages" :key="m.id" class="flex gap-3"
          :class="m.sender_role === 'client' ? '' : 'flex-row-reverse'">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            :class="m.sender_role === 'client' ? 'bg-emerald-500' : 'bg-[#3358ff]'">
            {{ (m.sender_name || '?')[0]?.toUpperCase() }}
          </div>
          <div class="max-w-[75%]">
            <div class="rounded-2xl px-4 py-2.5 text-sm"
              :class="m.sender_role === 'client' ? 'bg-white border border-slate-100 text-slate-700' : 'bg-[#3358ff] text-white'">
              <p class="whitespace-pre-wrap">{{ m.message }}</p>
            </div>
            <div class="text-[11px] text-slate-400 mt-1" :class="m.sender_role === 'client' ? '' : 'text-right'">
              {{ m.sender_name }} · {{ fmtTime(m.created_at) }}
            </div>
          </div>
        </div>
        <div v-if="!messages.length" class="text-center text-sm text-slate-400 py-6">Belum ada pesan.</div>
      </div>

      <!-- Reply box -->
      <div v-if="ticket.status !== 'closed'" class="sticky bottom-24 lg:bottom-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-lg flex gap-2">
        <textarea v-model="reply" rows="1" placeholder="Tulis balasan…"
          class="flex-1 resize-none border-0 focus:ring-0 text-sm px-2 py-1.5 max-h-32" @keydown.enter.exact.prevent="send" />
        <button @click="send" :disabled="sending || !reply.trim()" class="px-4 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center gap-1.5">
          <UIcon :name="sending ? 'i-tabler-loader-2' : 'i-tabler-send'" :class="sending && 'animate-spin'" class="w-4 h-4" />
        </button>
      </div>
      <div v-else class="text-center text-sm text-slate-400 py-3 bg-slate-50 rounded-xl">Tiket sudah ditutup.</div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { ticketCat, ticketStatus } from '~/composables/portalLabels'

const route = useRoute()
const { isAdmin } = usePortal()
const id = route.params.id as string

const loading = ref(true)
const ticket = ref<any>(null)
const messages = ref<any[]>([])
const reply = ref('')
const sending = ref(false)
const statusSel = ref('')

const catLabel = (c: string) => ticketCat(c).label
const statusLabel = (s: string) => ticketStatus(s).label
const statusClass = (s: string) => ticketStatus(s).class
const fmtTime = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>(`/api/portal/tickets/${id}`)
    ticket.value = r.ticket
    messages.value = r.messages || []
    statusSel.value = r.ticket?.status || 'open'
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function send() {
  if (!reply.value.trim()) return
  sending.value = true
  try {
    await $fetch(`/api/portal/tickets/${id}/reply`, { method: 'POST', body: { message: reply.value } })
    reply.value = ''
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengirim.') }
  finally { sending.value = false }
}

async function changeStatus() {
  try {
    await $fetch(`/api/portal/tickets/${id}/status`, { method: 'POST', body: { status: statusSel.value } })
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal ubah status.') }
}
</script>
