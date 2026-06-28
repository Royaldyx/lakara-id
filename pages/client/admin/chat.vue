<template>
  <div class="flex h-[calc(100vh-3.5rem)] lg:h-screen">
    <!-- Thread list -->
    <div class="w-full sm:w-72 border-r border-slate-100 bg-white flex flex-col" :class="active && 'hidden sm:flex'">
      <div class="px-4 py-4 border-b border-slate-100">
        <h1 class="font-extrabold text-slate-900">Chat Klien</h1>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="loadingThreads" class="text-center py-10 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-6 h-6 animate-spin mx-auto" /></div>
        <div v-else-if="!threads.length" class="text-center text-sm text-slate-400 py-10 px-4">Belum ada percakapan.</div>
        <button v-for="t in threads" :key="t.client_id" @click="openThread(t)"
          class="w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition flex items-center gap-3"
          :class="active === t.client_id && 'bg-[#3358ff]/5'">
          <div class="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">{{ t.company_name[0] }}</div>
          <div class="min-w-0 flex-1">
            <div class="font-semibold text-sm text-slate-900 truncate">{{ t.company_name }}</div>
            <div class="text-xs text-slate-400 truncate">{{ t.last_message || '—' }}</div>
          </div>
          <span v-if="t.unread > 0" class="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">{{ t.unread }}</span>
        </button>
      </div>
    </div>

    <!-- Conversation -->
    <div class="flex-1 flex flex-col" :class="!active && 'hidden sm:flex'">
      <div v-if="!active" class="flex-1 flex items-center justify-center text-slate-400 text-sm">Pilih percakapan</div>
      <template v-else>
        <div class="px-4 py-3 border-b border-slate-100 bg-white flex items-center gap-2">
          <button @click="active = ''" class="sm:hidden p-1.5 rounded-lg hover:bg-slate-100"><UIcon name="i-tabler-arrow-left" class="w-5 h-5" /></button>
          <span class="font-bold text-slate-900">{{ activeName }}</span>
        </div>
        <div ref="scroller" class="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50">
          <div v-for="m in messages" :key="m.id" class="flex" :class="m.sender_role === 'client' ? 'justify-start' : 'justify-end'">
            <div class="max-w-[75%]">
              <div class="rounded-2xl px-4 py-2.5 text-sm" :class="m.sender_role === 'client' ? 'bg-white border border-slate-100 text-slate-700' : 'bg-[#3358ff] text-white'">
                <p class="whitespace-pre-wrap">{{ m.body }}</p>
              </div>
              <div class="text-[10px] text-slate-400 mt-1" :class="m.sender_role === 'client' ? '' : 'text-right'">{{ fmtTime(m.created_at) }}</div>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-100 bg-white p-3 pb-24 lg:pb-3 flex gap-2">
          <textarea v-model="draft" rows="1" placeholder="Balas…" class="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm max-h-28 focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" @keydown.enter.exact.prevent="send" />
          <button @click="send" :disabled="sending || !draft.trim()" class="px-4 bg-[#3358ff] text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center">
            <UIcon :name="sending ? 'i-tabler-loader-2' : 'i-tabler-send'" :class="sending && 'animate-spin'" class="w-4 h-4" />
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const threads = ref<any[]>([])
const loadingThreads = ref(true)
const active = ref('')
const activeName = ref('')
const messages = ref<any[]>([])
const draft = ref('')
const sending = ref(false)
const scroller = ref<HTMLElement>()
let timer: any = null

const fmtTime = (d: string) => new Date(d).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })

async function loadThreads() {
  try { const r = await $fetch<any>('/api/portal/chat/threads'); threads.value = r.data || [] } catch { /* ignore */ }
  loadingThreads.value = false
}
async function loadMessages() {
  if (!active.value) return
  try {
    const r = await $fetch<any>('/api/portal/chat', { query: { client_id: active.value } })
    const changed = r.data.length !== messages.value.length
    messages.value = r.data || []
    if (changed) { await nextTick(); if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight }
  } catch { /* ignore */ }
}
function openThread(t: any) { active.value = t.client_id; activeName.value = t.company_name; messages.value = []; loadMessages() }

async function send() {
  if (!draft.value.trim()) return
  sending.value = true
  const body = draft.value; draft.value = ''
  try { await $fetch('/api/portal/chat', { method: 'POST', body: { body, client_id: active.value } }); await loadMessages() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.'); draft.value = body }
  finally { sending.value = false }
}

onMounted(() => { loadThreads(); timer = setInterval(() => { loadThreads(); loadMessages() }, 5000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
