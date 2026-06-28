<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-3 flex-wrap mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Manajemen Foto Upload</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ files.length }} file · Total {{ totalSizeMB }} MB digunakan</p>
      </div>
      <UButton @click="cleanupUnused" :loading="cleaning" color="red" variant="soft" icon="i-tabler-trash-x" class="font-semibold">
        Hapus File Tak Terpakai
      </UButton>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Empty -->
    <div v-if="!files.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-photo" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm">Belum ada foto yang diupload.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div v-for="file in files" :key="file.filename"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
        <!-- Image preview -->
        <div class="aspect-square bg-slate-50 overflow-hidden relative cursor-pointer" @click="preview = file.url">
          <img :src="file.url" :alt="file.filename" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <UIcon name="i-tabler-zoom-in" class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div class="p-2.5">
          <p class="text-xs text-slate-500 truncate font-mono" :title="file.filename">{{ file.filename }}</p>
          <div class="flex items-center justify-between mt-1">
            <span class="text-xs text-slate-400">{{ (file.size / 1024).toFixed(0) }} KB</span>
            <div class="flex gap-1">
              <button @click="copyUrl(file.url)" :title="'Copy URL'" class="text-slate-400 hover:text-[#3358ff] transition-colors p-0.5">
                <UIcon name="i-tabler-copy" class="w-3.5 h-3.5" />
              </button>
              <button @click="deleteFile(file)" :title="'Hapus'" class="text-slate-400 hover:text-red-500 transition-colors p-0.5">
                <UIcon name="i-tabler-trash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p class="text-xs text-slate-300 mt-0.5">{{ formatDate(file.created) }}</p>
        </div>
      </div>
    </div>

    <!-- Lightbox preview -->
    <div v-if="preview" @click="preview = ''"
      class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out">
      <img :src="preview" class="max-w-full max-h-[85vh] rounded-2xl object-contain" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()
const success = ref('')
const preview = ref('')

const { data: res, refresh } = await useFetch('/api/admin/uploads', {
  headers: authHeaders.value, server: false, default: () => ({ ok: false, data: [] }),
})
const files = computed(() => (res.value?.data ?? []) as any[])
const totalSizeMB = computed(() => (files.value.reduce((acc: number, f: any) => acc + f.size, 0) / 1024 / 1024).toFixed(1))

function formatDate(val: string) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

async function copyUrl(url: string) {
  const full = `${window.location.origin}${url}`
  await navigator.clipboard.writeText(full).catch(() => {})
  success.value = 'URL disalin ke clipboard!'
  setTimeout(() => success.value = '', 2000)
}

async function deleteFile(file: any) {
  if (!confirm(`Hapus foto "${file.filename}"?\n\nPerhatian: foto yang sudah dipakai di produk akan rusak.`)) return
  await $fetch('/api/admin/uploads', { method: 'DELETE', headers: authHeaders.value, body: { filename: file.filename } })
  success.value = 'File berhasil dihapus.'
  refresh()
  setTimeout(() => success.value = '', 3000)
}

const cleaning = ref(false)
async function cleanupUnused() {
  if (!confirm('Hapus semua file yang TIDAK dipakai toko/produk/link mana pun?\n\nFile yang masih terpakai aman, tidak akan dihapus.')) return
  cleaning.value = true
  try {
    const r = await $fetch<{ ok: boolean; deleted: number; kept: number }>('/api/admin/uploads.cleanup', {
      method: 'POST', headers: authHeaders.value,
    })
    success.value = `Selesai. ${r.deleted} file orphan dihapus, ${r.kept} file terpakai dipertahankan.`
    refresh()
    setTimeout(() => success.value = '', 5000)
  } catch (e: any) {
    success.value = e?.data?.statusMessage || 'Gagal membersihkan file.'
    setTimeout(() => success.value = '', 4000)
  } finally {
    cleaning.value = false
  }
}
</script>
