<template>
  <div class="flex items-center gap-4">
    <!-- Avatar preview -->
    <div class="relative flex-shrink-0">
      <div class="w-20 h-20 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center"
        :style="store ? { background: store.primary_color + '15' } : {}">
        <img v-if="store?.logo" :src="store.logo" class="w-full h-full object-cover" />
        <span v-else-if="store?.name" class="font-black text-2xl" :style="{ color: store.primary_color }">
          {{ store.name[0] }}
        </span>
        <UIcon v-else name="i-tabler-user" class="w-8 h-8 text-slate-300" />
      </div>
      <div v-if="uploading" class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
        <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
      </div>
    </div>

    <!-- Actions -->
    <div class="space-y-1.5">
      <div class="flex items-center gap-2 flex-wrap">
        <label class="cursor-pointer">
          <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#3358ff] text-white hover:opacity-90 transition-opacity"
            :class="uploading ? 'opacity-60 cursor-wait' : ''">
            <UIcon name="i-tabler-upload" class="w-3.5 h-3.5" />
            {{ store?.logo ? 'Ganti Foto' : 'Upload Foto' }}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="uploading" @change="onUpload" />
        </label>

        <!-- GIF avatar (Premium) -->
        <label v-if="isPremium" class="cursor-pointer">
          <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90 transition-opacity"
            :class="uploading ? 'opacity-60 cursor-wait' : ''">
            <UIcon name="i-tabler-gif" class="w-3.5 h-3.5" /> GIF
          </span>
          <input type="file" accept="image/gif" class="hidden" :disabled="uploading" @change="onUploadGif" />
        </label>

        <button v-if="store?.logo" type="button" :disabled="uploading" @click="removePhoto"
          class="text-xs font-semibold px-3 py-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
          Hapus
        </button>
      </div>
      <p class="text-xs text-slate-400">
        JPG/PNG otomatis dikompres.
        <span v-if="isPremium">GIF (animasi) maks 5 MB.</span>
        <NuxtLink v-else to="/member/upgrade" class="text-[#3358ff] font-medium hover:underline">Premium</NuxtLink>
        <span v-if="!isPremium"> bisa pakai GIF avatar.</span>
        Tampil di sidebar & halaman Link Bio.
      </p>
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
      <p v-if="ok" class="text-xs text-green-600 flex items-center gap-1">
        <UIcon name="i-tabler-check" class="w-3.5 h-3.5" /> Foto profil tersimpan.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { storeData } = useMember()
const store = computed(() => storeData.value)
const isPremium = computed(() => store.value?.product_tier === 'premium')

const { compress } = useImageCompress()

const uploading = ref(false)
const error     = ref('')
const ok        = ref(false)

async function persist(logoUrl: string) {
  const res = await $fetch<{ ok: boolean; data: any }>('/api/member/store', {
    method: 'POST',
    body: { logo: logoUrl },
  })
  storeData.value = res.data
  ok.value = true
  setTimeout(() => (ok.value = false), 3000)
}

async function onUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  error.value = ''; ok.value = false; uploading.value = true
  try {
    const file = await compress(raw, 512)
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    await persist(res.url)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Upload gagal. Coba lagi.'
  } finally {
    uploading.value = false; input.value = ''
  }
}

async function onUploadGif(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  error.value = ''; ok.value = false
  if (raw.size > 5 * 1024 * 1024) { error.value = 'GIF melebihi 5 MB.'; input.value = ''; return }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', raw) // raw, keep animation
    const res = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    await persist(res.url)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Upload GIF gagal. Coba lagi.'
  } finally {
    uploading.value = false; input.value = ''
  }
}

async function removePhoto() {
  error.value = ''; uploading.value = true
  try {
    await persist('')
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Gagal menghapus foto.'
  } finally {
    uploading.value = false
  }
}
</script>
