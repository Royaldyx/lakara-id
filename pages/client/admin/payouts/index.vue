<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Payout</h1>
        <p class="text-slate-500 text-sm mt-0.5">Pembayaran ke staff & freelancer.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Buat Payout
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>
    <div v-else-if="!payouts.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-cash" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada payout.</p>
    </div>
    <div v-else class="space-y-2">
      <div v-for="p in payouts" :key="p.id" class="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <div class="font-extrabold text-slate-900">Rp {{ fmt(p.amount) }} <span class="text-xs font-normal text-slate-400">→ {{ p.member_name }}</span></div>
          <div class="text-xs text-slate-400">{{ p.period_start || '' }} {{ p.period_end ? '– ' + p.period_end : '' }}</div>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">{{ p.status === 'paid' ? 'Dibayar' : 'Pending' }}</span>
        <button v-if="p.status !== 'paid'" @click="markPaid(p)" class="text-xs font-semibold text-green-600 hover:underline">Tandai Dibayar</button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Buat Payout</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Anggota *">
                <select v-model="form.user_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Pilih —</option>
                  <option v-for="m in team" :key="m.id" :value="m.id">{{ m.name }} ({{ m.role === 'staff' ? 'Staff' : 'Freelancer' }})</option>
                </select>
              </UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Periode Mulai"><UInput v-model="form.period_start" type="date" /></UFormGroup>
                <UFormGroup label="Periode Akhir"><UInput v-model="form.period_end" type="date" /></UFormGroup>
              </div>
              <button @click="suggest" :disabled="!form.user_id || suggesting" class="text-xs font-semibold text-[#3358ff] hover:underline disabled:opacity-50">
                {{ suggesting ? 'Menghitung…' : 'Hitung dari tugas selesai (fee)' }}
              </button>
              <UFormGroup label="Nominal (Rp) *"><UInput v-model.number="form.amount" type="number" min="0" /></UFormGroup>
              <p v-if="suggestNote" class="text-xs text-slate-500">{{ suggestNote }}</p>
              <UFormGroup label="Catatan"><UInput v-model="form.notes" placeholder="mis. Honor Januari" /></UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const payouts = ref<any[]>([])
const team = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const suggesting = ref(false)
const suggestNote = ref('')
const formError = ref('')
const form = reactive<any>({ user_id: '', period_start: '', period_end: '', amount: 0, items: [], notes: '' })

const fmt = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0)

async function load() {
  loading.value = true
  try {
    const [p, t] = await Promise.all([$fetch<any>('/api/portal/payouts'), $fetch<any>('/api/portal/team')])
    payouts.value = p.data || []; team.value = t.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() {
  formError.value = ''; suggestNote.value = ''
  Object.assign(form, { user_id: '', period_start: '', period_end: '', amount: 0, items: [], notes: '' })
  showModal.value = true
}

async function suggest() {
  if (!form.user_id) return
  suggesting.value = true
  try {
    const r = await $fetch<any>('/api/portal/payouts/suggest', { query: { user_id: form.user_id, from: form.period_start, to: form.period_end } })
    form.amount = r.total
    form.items = (r.tasks || []).map((t: any) => ({ task_id: t.id, title: t.title, fee: t.fee }))
    suggestNote.value = `${r.tasks.length} tugas selesai · total Rp ${fmt(r.total)}`
  } catch (e: any) { suggestNote.value = e?.data?.statusMessage || 'Gagal menghitung.' }
  finally { suggesting.value = false }
}

async function submit() {
  formError.value = ''
  if (!form.user_id) { formError.value = 'Pilih anggota.'; return }
  if (form.amount <= 0) { formError.value = 'Nominal harus > 0.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/payouts', { method: 'POST', body: { ...form } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal.' }
  finally { saving.value = false }
}

async function markPaid(p: any) {
  if (!confirm(`Tandai payout Rp ${fmt(p.amount)} ke ${p.member_name} sebagai dibayar?`)) return
  try { await $fetch(`/api/portal/payouts/${p.id}/status`, { method: 'POST', body: { status: 'paid' } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
}
</script>
