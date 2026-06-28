<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Asset Library</h1>
        <p class="text-slate-500 text-sm mt-0.5">Logo, foto produk, brand asset — semua di satu tempat.</p>
      </div>
      <div class="flex gap-2">
        <button @click="newFolder" class="flex items-center gap-2 px-3.5 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50">
          <UIcon name="i-tabler-folder-plus" class="w-4 h-4" /> Folder
        </button>
        <button @click="fileInput?.click()" :disabled="uploading" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition disabled:opacity-50">
          <UIcon :name="uploading ? 'i-tabler-loader-2' : 'i-tabler-upload'" :class="uploading && 'animate-spin'" class="w-4 h-4" /> Upload
        </button>
        <input ref="fileInput" type="file" multiple class="hidden" @change="onUpload" />
      </div>
    </div>

    <!-- Search + folder filter -->
    <div class="flex items-center gap-2 flex-wrap">
      <div class="relative flex-1 min-w-[180px]">
        <UIcon name="i-tabler-search" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input v-model="search" placeholder="Cari file…" class="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" />
      </div>
    </div>
    <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      <button @click="activeFolder = ''" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" :class="activeFolder === '' ? 'bg-[#3358ff] text-white' : 'bg-slate-100 text-slate-500'">Semua</button>
      <button v-for="f in folders" :key="f.id" @click="activeFolder = f.id" class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap" :class="activeFolder === f.id ? 'bg-[#3358ff] text-white' : 'bg-slate-100 text-slate-500'">{{ f.name }}</button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!filtered.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-folder-open" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada file.</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="a in filtered" :key="a.id" class="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition">
        <a :href="a.file_path" target="_blank" class="block aspect-square bg-slate-50 flex items-center justify-center">
          <img v-if="isImage(a)" :src="a.file_path" :alt="a.name" loading="lazy" class="w-full h-full object-cover" />
          <UIcon v-else :name="fileIcon(a)" class="w-10 h-10 text-slate-300" />
        </a>
        <div class="p-2.5">
          <div class="text-xs font-semibold text-slate-700 truncate">{{ a.name }}</div>
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-slate-400">{{ fmtSize(a.size) }}</span>
            <div class="flex gap-1.5">
              <a :href="a.file_path" :download="a.name" class="text-slate-400 hover:text-[#3358ff]"><UIcon name="i-tabler-download" class="w-3.5 h-3.5" /></a>
              <button @click="del(a)" class="text-slate-400 hover:text-red-500"><UIcon name="i-tabler-trash" class="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const uploading = ref(false)
const assets = ref<any[]>([])
const folders = ref<any[]>([])
const activeFolder = ref('')
const search = ref('')
const fileInput = ref<HTMLInputElement>()

const IMG = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']
const isImage = (a: any) => IMG.some(e => (a.file_path || '').toLowerCase().endsWith(e))
function fileIcon(a: any) {
  const p = (a.file_path || '').toLowerCase()
  if (p.endsWith('.pdf')) return 'i-tabler-file-type-pdf'
  if (p.endsWith('.mp4') || p.endsWith('.webm')) return 'i-tabler-video'
  if (p.match(/\.(doc|docx)$/)) return 'i-tabler-file-text'
  if (p.match(/\.(xls|xlsx)$/)) return 'i-tabler-file-spreadsheet'
  if (p.endsWith('.zip')) return 'i-tabler-file-zip'
  return 'i-tabler-file'
}
const fmtSize = (b: number) => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.ceil((b || 0) / 1024) + ' KB'

const filtered = computed(() => assets.value.filter(a =>
  (!activeFolder.value || a.folder_id === activeFolder.value) &&
  (!search.value || (a.name || '').toLowerCase().includes(search.value.toLowerCase()))
))

async function load() {
  loading.value = true
  try {
    const r = await $fetch<any>('/api/portal/assets')
    assets.value = r.assets || []
    folders.value = r.folders || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

async function onUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  uploading.value = true
  try {
    const fd = new FormData()
    if (activeFolder.value) fd.append('folder_id', activeFolder.value)
    for (const f of Array.from(files)) fd.append('file', f)
    await $fetch('/api/portal/assets', { method: 'POST', body: fd })
    await load()
  } catch (err: any) { alert(err?.data?.statusMessage || 'Upload gagal.') }
  finally { uploading.value = false; if (fileInput.value) fileInput.value.value = '' }
}

async function newFolder() {
  const name = prompt('Nama folder:')
  if (!name?.trim()) return
  try { await $fetch('/api/portal/folders', { method: 'POST', body: { name } }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal buat folder.') }
}

async function del(a: any) {
  if (!confirm(`Hapus "${a.name}"?`)) return
  try { await $fetch(`/api/portal/assets/${a.id}`, { method: 'DELETE' }); await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal hapus.') }
}
</script>
