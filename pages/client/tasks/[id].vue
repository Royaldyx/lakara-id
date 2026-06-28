<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <NuxtLink :to="isAdmin ? '/client/admin/tasks' : '/client/tasks'" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="task">
      <!-- Header -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-lg font-extrabold text-slate-900">{{ task.title }}</h1>
            <div class="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-400">
              <span class="flex items-center gap-1"><UIcon :name="typeIcon(task.type)" class="w-3.5 h-3.5" /> {{ typeLabel(task.type) }}</span>
              <span v-if="task.deadline" class="flex items-center gap-1"><UIcon name="i-tabler-clock" class="w-3.5 h-3.5" /> {{ task.deadline }}</span>
              <span v-if="task.fee > 0" class="font-semibold text-emerald-600">Fee Rp {{ fmt(task.fee) }}</span>
              <span v-if="isAdmin && task.assignee_name" class="flex items-center gap-1"><UIcon name="i-tabler-user" class="w-3.5 h-3.5" /> {{ task.assignee_name }}</span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0" :class="statusClass(task.status)">{{ statusLabel(task.status) }}</span>
        </div>
        <p v-if="task.description" class="text-sm text-slate-600 mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4">{{ task.description }}</p>
      </div>

      <!-- Deliverable -->
      <div v-if="task.deliverable" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <UIcon name="i-tabler-paperclip" class="w-5 h-5 text-[#3358ff]" />
        <a :href="task.deliverable" target="_blank" class="text-sm font-semibold text-[#3358ff] hover:underline truncate flex-1">Lihat hasil/deliverable</a>
      </div>

      <!-- Team: submit hasil -->
      <div v-if="isTeam && task.status !== 'done'" class="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <h3 class="font-bold text-slate-900 text-sm">{{ task.deliverable ? 'Kirim Ulang / Revisi' : 'Submit Hasil' }}</h3>
        <input v-model="link" placeholder="Link hasil (Drive/Figma/dll) — opsional" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        <div class="flex items-center gap-2">
          <button @click="fileInput?.click()" class="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
            <UIcon name="i-tabler-upload" class="w-4 h-4" /> {{ fileName || 'Pilih File' }}
          </button>
          <input ref="fileInput" type="file" class="hidden" @change="onFile" />
        </div>
        <textarea v-model="note" rows="2" placeholder="Catatan untuk admin (opsional)" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
        <button @click="submitWork" :disabled="submitting" class="w-full py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center justify-center gap-2">
          <UIcon v-if="submitting" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Submit
        </button>
      </div>

      <!-- Admin: aksi review -->
      <div v-if="isAdmin" class="flex gap-2 flex-wrap">
        <button v-if="task.status === 'submitted'" @click="setStatus('done')" class="px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600">✓ Setujui</button>
        <button v-if="task.status === 'submitted'" @click="setStatus('revision')" class="px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600">Minta Revisi</button>
        <button v-if="task.status !== 'done'" @click="setStatus('done')" class="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">Tandai Selesai</button>
      </div>

      <!-- Diskusi -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <h3 class="font-bold text-slate-900 text-sm mb-3">Diskusi</h3>
        <div class="space-y-2 mb-3">
          <div v-if="!messages.length" class="text-xs text-slate-400">Belum ada pesan.</div>
          <div v-for="m in messages" :key="m.id" class="flex gap-2" :class="m.user_id === user?.id ? 'flex-row-reverse' : ''">
            <div class="max-w-[80%] rounded-2xl px-3 py-2 text-sm" :class="m.user_id === user?.id ? 'bg-[#3358ff] text-white' : 'bg-slate-100 text-slate-700'">
              <p class="whitespace-pre-wrap">{{ m.body }}</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <input v-model="msg" @keyup.enter="sendMsg" placeholder="Tulis pesan…" class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <button @click="sendMsg" :disabled="!msg.trim()" class="px-3 bg-[#3358ff] text-white rounded-lg disabled:opacity-50"><UIcon name="i-tabler-send" class="w-4 h-4" /></button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })
import { taskType, taskStatus } from '~/composables/portalLabels'

const route = useRoute()
const { user, isAdmin, isTeam } = usePortal()
const id = route.params.id as string

const loading = ref(true)
const task = ref<any>(null)
const messages = ref<any[]>([])
const link = ref(''); const note = ref(''); const msg = ref('')
const file = ref<File | null>(null); const fileName = ref('')
const fileInput = ref<HTMLInputElement>()
const submitting = ref(false)

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)
const typeIcon = (t: string) => taskType(t).icon
const typeLabel = (t: string) => taskType(t).label
const statusLabel = (s: string) => taskStatus(s).label
const statusClass = (s: string) => taskStatus(s).class

async function load() {
  loading.value = true
  try { const r = await $fetch<any>(`/api/portal/tasks/${id}`); task.value = r.task; messages.value = r.messages || [] }
  catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function onFile(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) { file.value = f; fileName.value = f.name } }

async function submitWork() {
  if (!file.value && !link.value.trim()) { alert('Lampirkan file atau link hasil.'); return }
  submitting.value = true
  try {
    const fd = new FormData()
    if (file.value) fd.append('file', file.value)
    if (link.value) fd.append('link', link.value)
    if (note.value) fd.append('note', note.value)
    await $fetch(`/api/portal/tasks/${id}/submit`, { method: 'POST', body: fd })
    link.value = ''; note.value = ''; file.value = null; fileName.value = ''
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal submit.') }
  finally { submitting.value = false }
}

async function setStatus(status: string) {
  try { await $fetch('/api/portal/tasks', { method: 'POST', body: { action: 'set_status', id, status } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}

async function sendMsg() {
  if (!msg.value.trim()) return
  const body = msg.value; msg.value = ''
  try { await $fetch(`/api/portal/tasks/${id}/message`, { method: 'POST', body: { body } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.'); msg.value = body }
}
</script>
