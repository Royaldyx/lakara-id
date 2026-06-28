<template>
  <div class="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
    <div class="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-100 bg-white">
      <h1 class="text-lg font-extrabold text-slate-900">Chat dengan Tim Lakara</h1>
      <p class="text-xs text-slate-400">Tanya apa saja, kami balas secepatnya.</p>
    </div>

    <div ref="scroller" class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
      <div v-if="loading" class="text-center py-10 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-7 h-7 animate-spin mx-auto" /></div>
      <template v-else>
        <div v-if="!messages.length" class="text-center text-sm text-slate-400 py-10">Belum ada pesan. Sapa tim kami 👋</div>
        <div v-for="m in messages" :key="m.id" class="flex" :class="m.sender_role === 'client' ? 'justify-end' : 'justify-start'">
          <div class="max-w-[75%]">
            <div class="rounded-2xl px-4 py-2.5 text-sm" :class="m.sender_role === 'client' ? 'bg-[#3358ff] text-white' : 'bg-white border border-slate-100 text-slate-700'">
              <p class="whitespace-pre-wrap">{{ m.body }}</p>
            </div>
            <div class="text-[10px] text-slate-400 mt-1" :class="m.sender_role === 'client' ? 'text-right' : ''">{{ fmtTime(m.created_at) }}</div>
          </div>
        </div>
      </template>
    </div>

    <div class="border-t border-slate-100 bg-white p-3 pb-24 lg:pb-3 flex gap-2">
      <textarea v-model="draft" rows="1" placeholder="Ketik pesan…" class="flex-1 resize-none border border-slate-200 rounded-xl px-3 py-2 text-sm max-h-28 focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" @keydown.enter.exact.prevent="send" />
      <button @click="send" :disabled="sending || !draft.trim()" class="px-4 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center">
        <UIcon :name="sending ? 'i-tabler-loader-2' : 'i-tabler-send'" :class="sending && 'animate-spin'" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const sending = ref(false)
const messages = ref<any[]>([])
const draft = ref('')
const scroller = ref<HTMLElement>()
let timer: any = null

const fmtTime = (d: string) => new Date(d).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })

async function load(scroll = false) {
  try {
    const r = await $fetch<any>('/api/portal/chat')
    const changed = r.data.length !== messages.value.length
    messages.value = r.data || []
    if (scroll || changed) await scrollDown()
  } catch { /* ignore */ }
  loading.value = false
}
async function scrollDown() { await nextTick(); if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight }

async function send() {
  if (!draft.value.trim()) return
  sending.value = true
  const body = draft.value; draft.value = ''
  try { await $fetch('/api/portal/chat', { method: 'POST', body: { body } }); await load(true) }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal kirim.'); draft.value = body }
  finally { sending.value = false }
}

onMounted(async () => { await load(true); timer = setInterval(() => load(), 5000) })
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
