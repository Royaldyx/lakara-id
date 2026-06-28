<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-2xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Laporan Harian</h1>
      <p class="text-slate-500 text-sm mt-0.5">Catat apa yang kamu kerjakan hari ini.</p>
    </div>

    <!-- Form -->
    <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
      <div v-if="msg" class="text-sm font-semibold" :class="msg.ok ? 'text-green-600' : 'text-red-500'">{{ msg.text }}</div>
      <div class="grid grid-cols-2 gap-3">
        <UFormGroup label="Tanggal"><UInput v-model="form.report_date" type="date" /></UFormGroup>
        <UFormGroup label="Jam Kerja"><UInput v-model.number="form.hours" type="number" step="0.5" min="0" placeholder="8" /></UFormGroup>
      </div>
      <UFormGroup label="Apa yang dikerjakan? *"><UTextarea v-model="form.summary" :rows="4" placeholder="- Revisi desain feed klien A&#10;- Riset referensi UI dashboard" /></UFormGroup>
      <UFormGroup label="Link hasil (opsional)"><UInput v-model="form.links" placeholder="Drive/Figma/dll" /></UFormGroup>
      <button @click="submit" :disabled="saving" class="w-full py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan Laporan</button>
    </div>

    <!-- History -->
    <div>
      <h2 class="font-bold text-slate-900 mb-3">Riwayat</h2>
      <div v-if="loading" class="text-center py-8 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-7 h-7 animate-spin mx-auto" /></div>
      <div v-else-if="!reports.length" class="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl text-sm">Belum ada laporan.</div>
      <div v-else class="space-y-2">
        <div v-for="r in reports" :key="r.id" class="bg-white border border-slate-100 rounded-2xl p-4">
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-slate-900 text-sm">{{ r.report_date }}</span>
            <span v-if="r.hours > 0" class="text-xs text-slate-400">{{ r.hours }} jam</span>
          </div>
          <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ r.summary }}</p>
          <a v-if="r.links" :href="r.links" target="_blank" class="text-xs text-[#3358ff] hover:underline mt-1 inline-block">{{ r.links }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const saving = ref(false)
const reports = ref<any[]>([])
const msg = ref<any>(null)
const form = reactive({ report_date: new Date().toISOString().slice(0, 10), hours: 0, summary: '', links: '' })

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/daily-reports'); reports.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function submit() {
  msg.value = null
  if (!form.summary.trim()) { msg.value = { ok: false, text: 'Isi laporan dulu.' }; return }
  saving.value = true
  try {
    await $fetch('/api/portal/daily-reports', { method: 'POST', body: { ...form } })
    msg.value = { ok: true, text: 'Laporan tersimpan.' }
    await load()
  } catch (e: any) { msg.value = { ok: false, text: e?.data?.statusMessage || 'Gagal.' } }
  finally { saving.value = false }
}
</script>
