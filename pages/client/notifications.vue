<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Notifikasi</h1>
        <p class="text-slate-500 text-sm mt-0.5">Update terbaru untukmu.</p>
      </div>
      <button v-if="items.length" @click="markAll" class="text-sm font-semibold text-[#3358ff] hover:underline">Tandai semua dibaca</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!items.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-bell-off" class="w-10 h-10 mx-auto mb-2" />
      <p class="text-sm">Belum ada notifikasi.</p>
    </div>

    <div v-else class="space-y-2">
      <component :is="n.link ? 'NuxtLink' : 'div'" v-for="n in items" :key="n.id" :to="n.link || undefined"
        @click="open(n)"
        class="block bg-white border rounded-2xl p-4 transition hover:shadow-sm cursor-pointer"
        :class="n.read_at ? 'border-slate-100' : 'border-[#3358ff]/30 bg-[#3358ff]/[0.03]'">
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" :class="n.read_at ? 'bg-slate-100 text-slate-400' : 'bg-[#3358ff]/10 text-[#3358ff]'">
            <UIcon :name="iconFor(n.type)" class="w-5 h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-slate-900 text-sm">{{ n.title }}</div>
            <div v-if="n.body" class="text-xs text-slate-500 mt-0.5">{{ n.body }}</div>
            <div class="text-[11px] text-slate-400 mt-1">{{ timeAgo(n.created_at) }}</div>
          </div>
          <span v-if="!n.read_at" class="w-2 h-2 rounded-full bg-[#3358ff] flex-shrink-0 mt-1.5" />
        </div>
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const items = ref<any[]>([])
const unread = useState<number>('portalUnread')

const ICONS: Record<string, string> = {
  content_approval: 'i-tabler-photo', revision_done: 'i-tabler-refresh',
  ticket_reply: 'i-tabler-message', ticket_new: 'i-tabler-ticket',
  invoice: 'i-tabler-file-invoice', brief_update: 'i-tabler-file-text',
  status_change: 'i-tabler-arrows-exchange',
}
const iconFor = (t: string) => ICONS[t] || 'i-tabler-bell'

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/notifications')
    items.value = r.data || []
    if (unread) unread.value = r.unread || 0
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function open(n: any) {
  if (n.read_at) return
  n.read_at = new Date().toISOString()
  if (unread && unread.value > 0) unread.value--
  await $fetch('/api/portal/notifications/read', { method: 'POST', body: { id: n.id } }).catch(() => {})
}

async function markAll() {
  items.value.forEach(n => { if (!n.read_at) n.read_at = new Date().toISOString() })
  if (unread) unread.value = 0
  await $fetch('/api/portal/notifications/read', { method: 'POST', body: { all: true } }).catch(() => {})
}
</script>
