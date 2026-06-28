<template>
  <div class="p-8 max-w-5xl">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin/artikel" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">{{ isEdit ? 'Edit Artikel' : 'Tulis Artikel Baru' }}</h1>
        <p v-if="form.slug" class="text-xs text-slate-400 font-mono mt-0.5">/artikel/{{ form.slug }}</p>
      </div>
    </div>

    <!-- Errors -->
    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 space-y-1">
      <div v-for="e in errors" :key="e" class="flex items-center gap-2">
        <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ e }}
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- ── MAIN COLUMN (2/3) ── -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Info utama -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Konten Artikel</p>

          <UFormGroup label="Judul Artikel *">
            <UInput v-model="form.title" @input="autoSlug" placeholder="Judul artikel yang menarik..." size="lg" />
          </UFormGroup>

          <UFormGroup label="Slug (URL) *">
            <div class="flex">
              <span class="border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-400 text-sm rounded-l-md whitespace-nowrap">/artikel/</span>
              <UInput v-model="form.slug" @input="slugManual = true"
                placeholder="judul-artikel-saya" class="rounded-l-none flex-1 font-mono" />
            </div>
          </UFormGroup>

          <UFormGroup label="Ringkasan / Excerpt *">
            <UTextarea v-model="form.excerpt" :rows="2"
              placeholder="Deskripsi singkat 1-2 kalimat yang tampil di list artikel dan meta description..." />
            <template #hint>
              <span :class="form.excerpt.length > 160 ? 'text-red-400' : 'text-slate-400'">
                {{ form.excerpt.length }}/160 karakter
              </span>
            </template>
          </UFormGroup>

          <UFormGroup label="Isi Artikel *">
            <div class="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#3358ff]/30 focus-within:border-[#3358ff] transition-all">
              <!-- Mini toolbar -->
              <div class="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-gray-200 flex-wrap">
                <button v-for="btn in toolbar" :key="btn.label" type="button"
                  @click="insertFormat(btn.before, btn.after)"
                  class="px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  :title="btn.title">
                  {{ btn.label }}
                </button>
                <div class="w-px h-4 bg-slate-300 mx-1" />
                <button type="button" @click="previewMode = !previewMode"
                  class="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded transition-colors"
                  :class="previewMode ? 'bg-[#3358ff] text-white' : 'text-slate-600 hover:bg-slate-200'">
                  <UIcon name="i-tabler-eye" class="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>
              <!-- Editor / Preview -->
              <div v-if="!previewMode">
                <textarea
                  ref="editorRef"
                  v-model="form.content"
                  rows="18"
                  placeholder="Tulis konten artikel di sini...&#10;&#10;Gunakan toolbar di atas untuk format teks, atau tulis HTML langsung.&#10;&#10;Contoh:&#10;<h2>Subjudul</h2>&#10;<p>Paragraf pertama...</p>&#10;<ul><li>Poin satu</li><li>Poin dua</li></ul>"
                  class="w-full px-4 py-3 text-sm text-slate-800 font-mono resize-y focus:outline-none bg-white leading-relaxed"
                  style="min-height: 300px;"
                />
              </div>
              <div v-else
                class="prose prose-sm max-w-none px-5 py-4 min-h-[300px] text-slate-700 leading-relaxed"
                v-html="form.content || '<p class=\'text-slate-400 italic\'>Konten artikel akan tampil di sini...</p>'" />
            </div>
            <template #hint>
              <span class="text-slate-400 text-xs">Mendukung HTML. Gunakan &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;strong&gt;, &lt;a&gt;, &lt;img&gt;, dll.</span>
            </template>
          </UFormGroup>
        </div>

        <!-- SEO Preview -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preview Google Search</p>
          <div class="bg-slate-50 rounded-xl p-4 text-sm space-y-0.5">
            <div class="text-[#3358ff] font-medium">{{ form.title || 'Judul Artikel' }} — Lakara Blog</div>
            <div class="text-xs text-slate-400">lakara.id › artikel › {{ form.slug || 'slug' }}</div>
            <div class="text-slate-600 text-xs mt-1 line-clamp-2">{{ form.excerpt || 'Ringkasan artikel akan tampil di sini...' }}</div>
          </div>
        </div>

      </div>

      <!-- ── SIDEBAR (1/3) ── -->
      <div class="space-y-5">

        <!-- Publish -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Publish</p>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.published"
              class="rounded border-gray-300 text-[#3358ff] cursor-pointer w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Tampil di website</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.featured"
              class="rounded border-gray-300 text-[#3358ff] cursor-pointer w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Featured (highlight)</span>
          </label>
          <div class="space-y-2 pt-2">
            <UButton @click="save('published')" block style="background-color: #3358ff;"
              class="font-bold" :loading="saving">
              {{ isEdit ? '💾 Perbarui' : '🚀 Publish' }}
            </UButton>
            <UButton @click="save('draft')" block variant="outline" color="gray"
              class="font-medium text-slate-600" :loading="saving && draftMode">
              Simpan sebagai Draft
            </UButton>
            <NuxtLink to="/admin/artikel"
              class="block text-center text-sm text-slate-500 hover:text-slate-700 py-1.5 transition-colors">
              Batal
            </NuxtLink>
          </div>
        </div>

        <!-- Meta artikel -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Artikel</p>

          <UFormGroup label="Kategori *">
            <USelect v-model="form.category" :options="categories" placeholder="Pilih kategori..." />
          </UFormGroup>

          <UFormGroup label="Penulis">
            <UInput v-model="form.author" placeholder="Nama penulis" />
          </UFormGroup>

          <UFormGroup label="Tags (pisah koma)">
            <UInput v-model="form.tagsRaw" placeholder="PUBG Mobile, Esports, Tips" />
          </UFormGroup>

          <UFormGroup label="Estimasi Baca (menit)">
            <UInput v-model.number="form.read_time" type="number" min="1" max="60" placeholder="5" />
          </UFormGroup>
        </div>

        <!-- Gambar cover -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gambar Cover</p>
          <UFormGroup label="URL Gambar">
            <UInput v-model="form.image" type="url" placeholder="https://..." />
          </UFormGroup>
          <div v-if="form.image" class="relative rounded-xl overflow-hidden border border-gray-100">
            <img :src="form.image" :alt="form.title" class="w-full h-32 object-cover" />
            <button @click="form.image = ''"
              class="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center text-slate-400 hover:text-red-500 transition">
              <UIcon name="i-tabler-x" class="w-3.5 h-3.5" />
            </button>
          </div>
          <div v-else class="h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1">
            <UIcon name="i-tabler-photo" class="w-7 h-7 text-slate-300" />
            <p class="text-xs text-slate-400">Masukkan URL gambar di atas</p>
          </div>
          <p class="text-xs text-slate-400">Gunakan Unsplash, Cloudinary, atau link gambar publik.</p>
        </div>

        <!-- Related / OG -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">SEO Tambahan</p>
          <UFormGroup label="OG Image (opsional)">
            <UInput v-model="form.og_image" type="url" placeholder="https://... (default: cover image)" />
          </UFormGroup>
          <UFormGroup label="Canonical URL (opsional)">
            <UInput v-model="form.canonical" type="url"
              :placeholder="`https://lakara.id/artikel/${form.slug || 'slug'}`" />
          </UFormGroup>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route  = useRoute()
const router = useRouter()
const id     = computed(() => route.query.id as string | undefined)
const isEdit = computed(() => !!id.value)

const { authHeaders } = useAdmin()
const { data: allArtikel } = await useFetch<any[]>('/api/admin/artikel', {
  headers: authHeaders.value, server: false, default: () => [],
})

const form = reactive({
  title: '', slug: '', category: '', author: 'Tim Lakara',
  image: '', og_image: '', canonical: '', excerpt: '',
  content: '', tagsRaw: '', read_time: 5,
  published: true, featured: false,
})

const slugManual  = ref(false)
const saving      = ref(false)
const draftMode   = ref(false)
const previewMode = ref(false)
const errors      = ref<string[]>([])
const editorRef   = ref<HTMLTextAreaElement | null>(null)

const categories = [
  'Tutorial & Tips', 'Berita Esports', 'Web Development',
  'Digital Marketing', 'Mobile App', 'Behind The Scene',
  'Update Lakara', 'Opini', 'Lainnya',
]

const toolbar = [
  { label: 'H2', title: 'Heading 2', before: '<h2>', after: '</h2>' },
  { label: 'H3', title: 'Heading 3', before: '<h3>', after: '</h3>' },
  { label: 'B', title: 'Bold', before: '<strong>', after: '</strong>' },
  { label: 'I', title: 'Italic', before: '<em>', after: '</em>' },
  { label: 'P', title: 'Paragraf', before: '<p>', after: '</p>' },
  { label: 'UL', title: 'Unordered List', before: '<ul>\n  <li>', after: '</li>\n</ul>' },
  { label: 'OL', title: 'Ordered List', before: '<ol>\n  <li>', after: '</li>\n</ol>' },
  { label: 'A', title: 'Link', before: '<a href="URL">', after: '</a>' },
  { label: 'IMG', title: 'Gambar', before: '<img src="', after: '" alt="deskripsi" class="rounded-xl w-full" />' },
  { label: '---', title: 'Divider', before: '<hr class="my-6" />', after: '' },
]

// Load existing item for edit
if (isEdit.value && id.value) {
  const item = (allArtikel.value ?? []).find((i: any) => i.id === id.value)
  if (item) {
    Object.assign(form, item)
    form.tagsRaw = (item.tags || []).join(', ')
    slugManual.value = true
  }
}

function slugify(str: string) {
  return str.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function autoSlug() {
  if (!slugManual.value) form.slug = slugify(form.title)
}

function insertFormat(before: string, after: string) {
  const el = editorRef.value
  if (!el) {
    form.content += before + (after ? 'teks' + after : '')
    return
  }
  const start = el.selectionStart
  const end   = el.selectionEnd
  const sel   = form.content.substring(start, end) || 'teks'
  form.content = form.content.substring(0, start) + before + sel + after + form.content.substring(end)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + before.length, start + before.length + sel.length)
  })
}

async function save(mode: 'published' | 'draft') {
  errors.value = []
  draftMode.value = mode === 'draft'

  if (!form.title)    errors.value.push('Judul wajib diisi.')
  if (!form.slug)     errors.value.push('Slug wajib diisi.')
  if (!form.category) errors.value.push('Kategori wajib dipilih.')
  if (!form.excerpt)  errors.value.push('Ringkasan wajib diisi.')
  if (!form.content)  errors.value.push('Isi artikel wajib diisi.')

  const existing = (allArtikel.value ?? []).find((i: any) => i.slug === form.slug && i.id !== id.value)
  if (existing) errors.value.push(`Slug "${form.slug}" sudah digunakan.`)

  if (errors.value.length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }

  saving.value = true
  const tags   = form.tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)

  const newItem = {
    id:         id.value || String(Date.now()),
    slug:       form.slug,
    title:      form.title,
    category:   form.category,
    author:     form.author || 'Tim Lakara',
    image:      form.image,
    og_image:   form.og_image,
    canonical:  form.canonical,
    excerpt:    form.excerpt,
    content:    form.content,
    tags,
    read_time:  form.read_time || 5,
    featured:   form.featured,
    published:  mode === 'published' ? form.published : false,
    created_at: isEdit.value
      ? ((allArtikel.value ?? []).find((i: any) => i.id === id.value)?.created_at || new Date().toISOString())
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  let updated: any[]
  if (isEdit.value) {
    updated = (allArtikel.value ?? []).map((i: any) => i.id === id.value ? newItem : i)
  } else {
    updated = [...(allArtikel.value ?? []), newItem]
  }

  await $fetch('/api/admin/artikel', { method: 'POST', headers: authHeaders.value, body: updated })
  saving.value = false
  router.push('/admin/artikel')
}
</script>

<style scoped>
.prose h2 { @apply text-lg font-bold text-slate-900 mt-6 mb-2; }
.prose h3 { @apply text-base font-bold text-slate-800 mt-4 mb-1; }
.prose p  { @apply mb-3 text-slate-700 leading-relaxed; }
.prose ul { @apply list-disc list-inside mb-3 space-y-1; }
.prose ol { @apply list-decimal list-inside mb-3 space-y-1; }
.prose a  { @apply text-[#3358ff] underline; }
.prose strong { @apply font-bold; }
.prose hr { @apply border-slate-200 my-6; }
.prose img { @apply rounded-xl w-full my-4; }
</style>
