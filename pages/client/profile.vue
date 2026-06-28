<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Profil & Brand</h1>
      <p class="text-slate-500 text-sm mt-0.5">Lengkapi info brand supaya tim kami bikin konten yang pas.</p>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else>
      <!-- Progress kelengkapan -->
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-semibold text-slate-700">Kelengkapan profil</span>
          <span class="font-bold" :class="comp.complete ? 'text-emerald-600' : 'text-amber-600'">{{ comp.filled }}/{{ comp.total }}</span>
        </div>
        <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-full rounded-full transition-all" :class="comp.complete ? 'bg-emerald-500' : 'bg-[#3358ff]'" :style="{ width: pct + '%' }" />
        </div>
      </div>

      <div v-if="saved" class="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
        <UIcon name="i-tabler-circle-check" class="w-4 h-4" /> Profil tersimpan.
      </div>
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ error }}</div>

      <form @submit.prevent="save" class="space-y-5">
        <!-- Info dasar -->
        <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 class="font-bold text-slate-900 text-sm">Informasi Dasar</h2>
          <div class="grid sm:grid-cols-2 gap-4">
            <UFormGroup label="Nama Perusahaan *"><UInput v-model="form.company_name" /></UFormGroup>
            <UFormGroup label="Nama Brand"><UInput v-model="form.brand_name" /></UFormGroup>
            <UFormGroup label="Industri"><UInput v-model="form.industry" placeholder="F&B, Fashion, Jasa…" /></UFormGroup>
            <UFormGroup label="Website"><UInput v-model="form.website" placeholder="https://…" /></UFormGroup>
            <UFormGroup label="Nama PIC"><UInput v-model="form.pic_name" /></UFormGroup>
            <UFormGroup label="WhatsApp"><UInput v-model="form.whatsapp" placeholder="628…" /></UFormGroup>
            <UFormGroup label="Email"><UInput v-model="form.email" type="email" /></UFormGroup>
            <UFormGroup label="Logo (URL)"><UInput v-model="form.logo" placeholder="https://…" /></UFormGroup>
          </div>
        </div>

        <!-- Brand brief -->
        <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 class="font-bold text-slate-900 text-sm">Brand Brief</h2>
          <UFormGroup label="Deskripsi Brand" hint="Ceritakan tentang brand/produk kamu">
            <UTextarea v-model="form.brand_description" :rows="3" />
          </UFormGroup>
          <UFormGroup label="Target Audience" hint="Siapa pelanggan ideal kamu?">
            <UTextarea v-model="form.target_audience" :rows="2" placeholder="Wanita 20-35, urban, suka traveling…" />
          </UFormGroup>
          <UFormGroup label="Tone of Voice" hint="Gaya komunikasi brand">
            <UInput v-model="form.tone_of_voice" placeholder="Santai & friendly / Premium & elegan…" />
          </UFormGroup>
          <UFormGroup label="Kompetitor" hint="Pisahkan dengan koma">
            <UTextarea v-model="form.competitor" :rows="2" />
          </UFormGroup>
          <UFormGroup label="Goals Bisnis" hint="Apa yang ingin dicapai dari media sosial?">
            <UTextarea v-model="form.business_goals" :rows="2" placeholder="Naikkan penjualan online, awareness produk baru…" />
          </UFormGroup>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="saving" class="px-6 py-2.5 bg-[#3358ff] text-white text-sm font-bold rounded-xl hover:bg-[#2244ee] disabled:opacity-50 flex items-center gap-2">
            <UIcon v-if="saving" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Simpan Profil
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const comp = reactive({ filled: 0, total: 6, complete: false })
const form = reactive({
  company_name: '', brand_name: '', pic_name: '', email: '', whatsapp: '', website: '',
  industry: '', logo: '', brand_description: '', target_audience: '', competitor: '', tone_of_voice: '', business_goals: '',
})
const pct = computed(() => Math.round((comp.filled / comp.total) * 100))

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/profile')
    Object.assign(form, Object.fromEntries(Object.keys(form).map((k) => [k, r.data?.[k] ?? ''])))
    if (r.completeness) Object.assign(comp, r.completeness)
  } catch (e: any) { error.value = e?.data?.statusMessage || 'Gagal memuat profil.' }
  loading.value = false
}
onMounted(load)

async function save() {
  error.value = ''; saved.value = false
  if (!form.company_name.trim()) { error.value = 'Nama perusahaan wajib diisi.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/profile', { method: 'POST', body: { ...form } })
    saved.value = true
    await load()
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) { error.value = e?.data?.statusMessage || 'Gagal menyimpan.' }
  finally { saving.value = false }
}
</script>
