<template>
  <!-- Hanya tampil untuk admin/super_admin. Catatan internal TIDAK pernah dilihat client. -->
  <div v-if="isAdmin" class="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
    <div class="flex items-center gap-2 mb-3">
      <UIcon name="i-tabler-lock" class="w-4 h-4 text-amber-600" />
      <h3 class="font-bold text-amber-900 text-sm">Catatan Internal</h3>
      <span class="text-[10px] text-amber-600 font-semibold">(hanya tim)</span>
    </div>

    <div class="space-y-2 mb-3">
      <div v-if="!notes.length" class="text-xs text-amber-700/70">Belum ada catatan.</div>
      <div v-for="n in notes" :key="n.id" class="bg-white rounded-xl p-3 border border-amber-100">
        <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ n.body }}</p>
        <div class="flex items-center justify-between mt-1.5">
          <span class="text-[11px] text-slate-400">{{ n.author || 'Admin' }} · {{ fmtDate(n.created_at) }}</span>
          <button @click="del(n.id)" class="text-[11px] text-red-400 hover:text-red-600 hover:underline">Hapus</button>
        </div>
      </div>
    </div>

    <div class="flex gap-2">
      <input v-model="draft" @keyup.enter="add" placeholder="Tulis catatan internal…"
        class="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" />
      <button @click="add" :disabled="saving || !draft.trim()" class="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50">Simpan</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ entityType: 'client' | 'brief' | 'content' | 'ticket'; entityId: string }>()
const { isAdmin } = usePortal()

const notes = ref<any[]>([])
const draft = ref('')
const saving = ref(false)

const fmtDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

async function load() {
  if (!isAdmin.value || !props.entityId) return
  try {
    const r = await $fetch<any>('/api/portal/notes', { query: { entity_type: props.entityType, entity_id: props.entityId } })
    notes.value = r.data || []
  } catch { /* ignore */ }
}

async function add() {
  if (!draft.value.trim()) return
  saving.value = true
  try {
    await $fetch('/api/portal/notes', { method: 'POST', body: { entity_type: props.entityType, entity_id: props.entityId, body: draft.value } })
    draft.value = ''
    await load()
  } catch { /* ignore */ }
  finally { saving.value = false }
}

async function del(id: string) {
  await $fetch(`/api/portal/notes/${id}`, { method: 'DELETE' }).catch(() => {})
  await load()
}

watch(() => props.entityId, load, { immediate: true })
</script>
