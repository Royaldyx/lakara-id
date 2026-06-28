<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Knowledge Base</h1>
        <p class="text-slate-500 text-sm mt-0.5">Panduan, tutorial & FAQ penggunaan portal.</p>
      </div>
      <button v-if="isAdmin" @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee]">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Artikel
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <template v-else>
      <div v-for="cat in categories" :key="cat.key">
        <template v-if="grouped[cat.key]?.length">
          <h2 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 mt-4">{{ cat.label }}</h2>
          <div class="space-y-2">
            <div v-for="a in grouped[cat.key]" :key="a.id" class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
              <button @click="toggle(a.id)" class="w-full flex items-center justify-between px-5 py-4 text-left">
                <span class="font-semibold text-slate-900 flex items-center gap-2">
                  {{ a.title }}
                  <span v-if="isAdmin && !a.published" class="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold">DRAFT</span>
                </span>
                <UIcon :name="open === a.id ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down'" class="w-5 h-5 text-slate-400 flex-shrink-0" />
              </button>
              <div v-if="open === a.id" class="px-5 pb-4 -mt-1">
                <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ a.body }}</p>
                <div v-if="isAdmin" class="flex gap-3 mt-3 pt-3 border-t border-slate-100">
                  <button @click="edit(a)" class="text-xs font-semibold text-[#3358ff] hover:underline">Edit</button>
                  <button @click="del(a)" class="text-xs font-semibold text-red-400 hover:underline">Hapus</button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="!articles.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
        <UIcon name="i-tabler-book" class="w-10 h-10 mx-auto mb-2" /><p class="text-sm">Belum ada artikel.</p>
      </div>
    </template>

    <!-- Modal admin -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">{{ form.id ? 'Edit' : 'Tambah' }} Artikel</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <UFormGroup label="Kategori">
                <select v-model="form.category" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="faq">FAQ</option><option value="tutorial">Tutorial</option><option value="guide">Panduan</option>
                </select>
              </UFormGroup>
              <UFormGroup label="Judul *"><UInput v-model="form.title" /></UFormGroup>
              <UFormGroup label="Isi"><UTextarea v-model="form.body" :rows="6" /></UFormGroup>
              <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.published" class="w-4 h-4 rounded" /> Publikasikan</label>
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

const { isAdmin } = usePortal()
const loading = ref(true)
const articles = ref<any[]>([])
const open = ref('')
const showModal = ref(false)
const saving = ref(false)
const form = reactive<any>({ id: '', category: 'faq', title: '', body: '', published: true })

const categories = [
  { key: 'faq', label: 'FAQ' }, { key: 'tutorial', label: 'Tutorial' }, { key: 'guide', label: 'Panduan' },
]
const grouped = computed<Record<string, any[]>>(() => {
  const g: Record<string, any[]> = { faq: [], tutorial: [], guide: [] }
  for (const a of articles.value) (g[a.category] || g.faq).push(a)
  return g
})

function toggle(id: string) { open.value = open.value === id ? '' : id }

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/kb'); articles.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() { Object.assign(form, { id: '', category: 'faq', title: '', body: '', published: true }); showModal.value = true }
function edit(a: any) { Object.assign(form, { id: a.id, category: a.category, title: a.title, body: a.body, published: !!a.published }); showModal.value = true }

async function submit() {
  if (!form.title.trim()) return
  saving.value = true
  try { await $fetch('/api/portal/kb', { method: 'POST', body: { ...form } }); showModal.value = false; await load() }
  catch (e: any) { alert(e?.data?.statusMessage || 'Gagal.') }
  finally { saving.value = false }
}

async function del(a: any) {
  if (!confirm(`Hapus "${a.title}"?`)) return
  await $fetch(`/api/portal/kb/${a.id}`, { method: 'DELETE' }).catch(() => {})
  await load()
}
</script>
