<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Input Analitik</h1>
      <p class="text-slate-500 text-sm mt-0.5">Catat snapshot metrik sosmed klien (manual).</p>
    </div>

    <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
      <UFormGroup label="Klien *">
        <select v-model="form.client_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
          <option value="">— Pilih klien —</option>
          <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name }}</option>
        </select>
      </UFormGroup>
      <div class="grid grid-cols-2 gap-3">
        <UFormGroup label="Platform">
          <select v-model="form.platform" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            <option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option>
          </select>
        </UFormGroup>
        <UFormGroup label="Tanggal"><UInput v-model="form.metric_date" type="date" /></UFormGroup>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <UFormGroup label="Followers"><UInput v-model.number="form.followers" type="number" /></UFormGroup>
        <UFormGroup label="Reach"><UInput v-model.number="form.reach" type="number" /></UFormGroup>
        <UFormGroup label="Impressions"><UInput v-model.number="form.impressions" type="number" /></UFormGroup>
        <UFormGroup label="Profile Visit"><UInput v-model.number="form.profile_visits" type="number" /></UFormGroup>
        <UFormGroup label="Engagement %"><UInput v-model.number="form.engagement_rate" type="number" step="0.1" /></UFormGroup>
      </div>
      <div v-if="msg" class="text-sm font-semibold" :class="msg.ok ? 'text-green-600' : 'text-red-500'">{{ msg.text }}</div>
      <button @click="submit" :disabled="saving" class="w-full py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan Snapshot</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const clients = ref<any[]>([])
const saving = ref(false)
const msg = ref<any>(null)
const form = reactive<any>({ client_id: '', platform: 'instagram', metric_date: new Date().toISOString().slice(0, 10), followers: 0, reach: 0, impressions: 0, profile_visits: 0, engagement_rate: 0 })

onMounted(async () => {
  try { const c = await $fetch<any>('/api/portal/clients'); clients.value = c.data || [] } catch { /* ignore */ }
})

async function submit() {
  msg.value = null
  if (!form.client_id) { msg.value = { ok: false, text: 'Pilih klien dulu.' }; return }
  saving.value = true
  try {
    await $fetch('/api/portal/analytics/metric', { method: 'POST', body: { ...form } })
    msg.value = { ok: true, text: 'Snapshot tersimpan.' }
  } catch (e: any) { msg.value = { ok: false, text: e?.data?.statusMessage || 'Gagal.' } }
  finally { saving.value = false }
}
</script>
