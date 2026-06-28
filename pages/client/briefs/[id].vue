<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
    <NuxtLink to="/client/briefs" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
      <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali ke Brief
    </NuxtLink>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else-if="brief">
      <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-extrabold text-slate-900">{{ brief.title }}</h1>
            <p v-if="brief.company_name" class="text-sm text-slate-400 mt-0.5">{{ brief.company_name }}</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap" :class="statusClass(brief.status)">{{ statusLabel(brief.status) }}</span>
        </div>

        <dl class="grid sm:grid-cols-2 gap-4 text-sm">
          <PortalField label="Objective" :value="brief.objective" />
          <PortalField label="Deadline" :value="brief.deadline ? fmtDate(brief.deadline) : ''" />
          <PortalField label="Promo" :value="brief.promo" />
          <PortalField label="Call to Action" :value="brief.cta" />
          <div class="sm:col-span-2"><PortalField label="Detail" :value="brief.description" /></div>
          <div class="sm:col-span-2"><PortalField label="Referensi" :value="brief.reference" link /></div>
        </dl>
      </div>

      <div v-if="canSubmit" class="flex justify-end">
        <button @click="submitBrief" :disabled="busy" class="px-5 py-2.5 bg-[#3358ff] text-white text-sm font-bold rounded-xl hover:bg-[#2244ee] disabled:opacity-50 flex items-center gap-2">
          <UIcon v-if="busy" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" />
          <UIcon v-else name="i-tabler-send" class="w-4 h-4" /> Kirim Brief ke Tim
        </button>
      </div>
    </template>

    <div v-else class="text-center py-16 text-slate-400">Brief tidak ditemukan.</div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const route = useRoute()
const { isClient } = usePortal()
const loading = ref(true)
const busy = ref(false)
const brief = ref<any>(null)

const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const canSubmit = computed(() => isClient.value && brief.value?.status === 'draft')

async function load() {
  loading.value = true
  try { const r = await $fetch<any>(`/api/portal/briefs/${route.params.id}`); brief.value = r.data } catch { brief.value = null }
  loading.value = false
}
onMounted(load)

async function submitBrief() {
  busy.value = true
  try {
    await $fetch('/api/portal/briefs', { method: 'POST', body: { action: 'set_status', id: brief.value.id, status: 'submitted' } })
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengirim brief.') }
  finally { busy.value = false }
}
</script>
