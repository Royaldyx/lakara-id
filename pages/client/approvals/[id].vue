<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
    <NuxtLink to="/client/approvals" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali ke Approval
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="content">
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-extrabold text-slate-900">{{ content.title }}</h1>
            <p class="text-sm text-slate-400 mt-0.5">{{ typeLabel(content.type) }}<span v-if="content.brief_title"> · Brief: {{ content.brief_title }}</span></p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap" :class="statusClass(content.status)">{{ statusLabel(content.status) }}</span>
        </div>

        <!-- Preview desain -->
        <div v-if="content.design_file">
          <a :href="content.design_file" target="_blank" rel="noopener">
            <img v-if="isImage(content.design_file)" :src="content.design_file" class="w-full rounded-xl border border-slate-100 max-h-[480px] object-contain bg-slate-50" />
            <div v-else class="flex items-center gap-2 text-sm text-[#3358ff] border border-slate-100 rounded-xl px-4 py-3 hover:bg-slate-50">
              <UIcon name="i-tabler-external-link" class="w-4 h-4" /> Buka file desain
            </div>
          </a>
        </div>

        <PortalField v-if="content.caption" label="Caption" :value="content.caption" />
        <div v-if="content.scheduled_at" class="text-sm text-slate-500 flex items-center gap-1.5">
          <UIcon name="i-tabler-calendar" class="w-4 h-4" /> Jadwal tayang: <strong>{{ fmtDateTime(content.scheduled_at) }}</strong>
        </div>
      </div>

      <!-- Aksi approval (client only, status waiting_approval) -->
      <div v-if="canReview" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="flex items-center justify-between text-sm">
          <span class="font-bold text-slate-900">Tinjau Konten</span>
          <span class="text-slate-400">Sisa revisi: <strong :class="revisionLeft > 0 ? 'text-slate-700' : 'text-red-500'">{{ revisionLeft }}/{{ revisionLimit }}</strong></span>
        </div>

        <div v-if="!revising" class="flex gap-3">
          <button @click="revising = true" :disabled="revisionLeft <= 0" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
            Minta Revisi
          </button>
          <button @click="approve" :disabled="busy" class="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
            <UIcon v-if="busy" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-tabler-check" class="w-4 h-4" /> Setujui
          </button>
        </div>

        <div v-else class="space-y-3">
          <UTextarea v-model="reason" :rows="3" placeholder="Jelaskan revisi yang diinginkan…" />
          <div class="flex gap-3">
            <button @click="revising = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
            <button @click="revise" :disabled="busy" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center justify-center gap-2">
              <UIcon v-if="busy" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Kirim Revisi
            </button>
          </div>
        </div>

        <p v-if="revisionLeft <= 0" class="text-xs text-red-500">Kuota revisi habis. Untuk revisi tambahan, silakan buat tiket support.</p>
      </div>

      <!-- Timeline revisi -->
      <div v-if="revisions.length" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h2 class="font-bold text-slate-900 text-sm mb-4">Riwayat Revisi</h2>
        <div class="space-y-4">
          <div v-for="r in revisions" :key="r.id" class="flex gap-3">
            <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" :class="revIcon(r.action).bg">
              <UIcon :name="revIcon(r.action).icon" class="w-4 h-4" :class="revIcon(r.action).color" />
            </div>
            <div class="min-w-0 flex-1 pb-1">
              <div class="text-sm font-medium text-slate-800">{{ revLabel(r.action) }} <span class="text-slate-400 font-normal">· v{{ r.version }}</span></div>
              <div v-if="r.reason" class="text-sm text-slate-600 mt-0.5 bg-slate-50 rounded-lg px-3 py-2">{{ r.reason }}</div>
              <div class="text-xs text-slate-400 mt-0.5">{{ r.user_name || 'Sistem' }} · {{ fmtDateTime(r.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-16 text-slate-400">Konten tidak ditemukan.</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const route = useRoute()
const { isClient } = usePortal()
const loading = ref(true)
const busy = ref(false)
const revising = ref(false)
const reason = ref('')
const content = ref<any>(null)
const revisions = ref<any[]>([])
const revisionLimit = ref(0)
const revisionLeft = ref(0)

const typeLabel = (t: string) => CONTENT_TYPE_LABEL[t] || t
const isImage = (u: string) => /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(u)
const fmtDateTime = (s: string) => s ? new Date(s).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const canReview = computed(() => isClient.value && content.value?.status === 'waiting_approval')

const revLabel = (a: string) => ({ uploaded: 'Konten diunggah', approved: 'Disetujui', rejected: 'Ditolak', revision_requested: 'Revisi diminta' } as any)[a] || a
const revIcon = (a: string) => ({
  uploaded: { icon: 'i-tabler-upload', bg: 'bg-blue-50', color: 'text-blue-500' },
  approved: { icon: 'i-tabler-check', bg: 'bg-emerald-50', color: 'text-emerald-500' },
  rejected: { icon: 'i-tabler-x', bg: 'bg-red-50', color: 'text-red-500' },
  revision_requested: { icon: 'i-tabler-refresh', bg: 'bg-amber-50', color: 'text-amber-500' },
} as any)[a] || { icon: 'i-tabler-point', bg: 'bg-slate-100', color: 'text-slate-400' }

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>(`/api/portal/contents/${route.params.id}`)
    content.value = r.data
    revisions.value = r.revisions || []
    revisionLimit.value = r.revision_limit || 0
    revisionLeft.value = r.revision_left || 0
  } catch { content.value = null }
  loading.value = false
}
onMounted(load)

async function approve() {
  busy.value = true
  try { await $fetch(`/api/portal/contents/${route.params.id}/review`, { method: 'POST', body: { decision: 'approve' } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal menyetujui.') }
  finally { busy.value = false }
}
async function revise() {
  if (!reason.value.trim()) { alert('Alasan revisi wajib diisi.'); return }
  busy.value = true
  try {
    await $fetch(`/api/portal/contents/${route.params.id}/review`, { method: 'POST', body: { decision: 'revise', reason: reason.value } })
    revising.value = false; reason.value = ''
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengirim revisi.') }
  finally { busy.value = false }
}
</script>
