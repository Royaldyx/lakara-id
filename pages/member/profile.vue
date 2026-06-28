<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Edit Profil</h1>
      <p class="text-slate-500 text-sm mt-0.5">Atur foto, nama, dan bio profil kamu.</p>
    </div>

    <div v-if="saved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> Perubahan berhasil disimpan!
    </div>
    <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ saveError }}
    </div>

    <!-- Foto Profil -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Foto Profil</p>
      <ProfilePhotoUploader />
    </div>

    <!-- Nama & Bio -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mt-5">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Identitas</p>
      <UFormGroup label="Nama Tampilan">
        <UInput v-model="form.name" placeholder="Nama kamu / nama toko..." />
      </UFormGroup>
      <UFormGroup label="Bio">
        <UTextarea v-model="form.description" :rows="3" placeholder="Cerita singkat tentang kamu..." />
      </UFormGroup>
      <UButton @click="save" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        💾 Simpan Perubahan
      </UButton>
    </div>

    <!-- Shortcut: Kelola Link Bio -->
    <NuxtLink to="/member/links"
      class="mt-5 flex items-center gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-[#3358ff]/40 hover:bg-[#3358ff]/5 transition group">
      <div class="w-10 h-10 rounded-xl bg-[#3358ff]/10 flex items-center justify-center flex-shrink-0">
        <UIcon name="i-tabler-link" class="w-5 h-5 text-[#3358ff]" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-bold text-slate-900 text-sm">Kelola Link Bio</div>
        <div class="text-xs text-slate-500">Atur link, template, warna & wallpaper halaman publik kamu</div>
      </div>
      <UIcon name="i-tabler-arrow-right" class="w-5 h-5 text-slate-300 group-hover:text-[#3358ff] transition-colors" />
    </NuxtLink>

    <p class="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
      <UIcon name="i-tabler-info-circle" class="w-3.5 h-3.5 flex-shrink-0" />
      Foto & nama ini sama dengan yang ada di <NuxtLink to="/member/store" class="text-[#3358ff] font-medium hover:underline">Info Toko</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store = computed(() => storeData.value)

const form = reactive({ name: '', description: '' })
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)

function populateForm() {
  const s = storeData.value
  if (!s) return
  form.name = s.name || ''
  form.description = s.description || ''
}

onMounted(async () => { await fetchStore(); populateForm() })
watch(storeData, populateForm)

async function save() {
  saveError.value = ''
  saving.value = true
  try {
    const res = await $fetch<{ ok: boolean; data: any }>('/api/member/store', {
      method: 'POST',
      body: { name: form.name, description: form.description },
    })
    storeData.value = res.data
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Gagal menyimpan. Coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>
