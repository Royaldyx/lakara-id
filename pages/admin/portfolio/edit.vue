<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin/portfolio" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">{{ isEdit ? 'Edit Portofolio' : 'Tambah Portofolio Baru' }}</h1>
        <p v-if="form.slug" class="text-xs text-slate-400 font-mono mt-0.5">/portfolio/{{ form.slug }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
      <div v-for="e in errors" :key="e">⚠️ {{ e }}</div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Main (2/3) -->
      <div class="lg:col-span-2 space-y-5">

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Utama</p>

          <UFormGroup label="Judul Proyek *">
            <UInput v-model="form.title" @input="autoSlug" placeholder="Website E-Commerce Toko Fashion" size="lg" />
          </UFormGroup>

          <UFormGroup label="Slug (URL) *">
            <div class="flex">
              <span class="border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-400 text-sm rounded-l-md whitespace-nowrap">/portfolio/</span>
              <UInput v-model="form.slug" @input="slugManual = true" placeholder="nama-proyek" class="rounded-l-none flex-1 font-mono" />
            </div>
          </UFormGroup>

          <UFormGroup label="Ringkasan (Excerpt)">
            <UTextarea v-model="form.excerpt" :rows="2" placeholder="Deskripsi singkat 1-2 kalimat..." />
          </UFormGroup>

          <UFormGroup label="Konten Lengkap">
            <UTextarea v-model="form.content" :rows="12"
              placeholder="Tulis deskripsi lengkap, fitur yang dibangun, hasil yang dicapai...&#10;&#10;Tekan Enter 2x untuk paragraf baru." />
          </UFormGroup>
        </div>

        <!-- SEO Preview -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Preview di Google</p>
          <div class="bg-slate-50 rounded-xl p-4 text-sm">
            <div class="text-[#3358ff] font-medium">{{ form.title || 'Judul Proyek' }} — Lakara</div>
            <div class="text-xs text-slate-400 mt-0.5">lakara.id › portfolio › {{ form.slug || 'slug' }}</div>
            <div class="text-slate-600 text-xs mt-1 line-clamp-2">{{ form.excerpt || 'Ringkasan akan tampil di sini...' }}</div>
          </div>
        </div>

      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-5">

        <!-- Publish -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Publish</p>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.published" class="rounded border-gray-300 text-[#3358ff] cursor-pointer w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Tampil di website</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.featured" class="rounded border-gray-300 text-[#3358ff] cursor-pointer w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Featured (tampil di homepage)</span>
          </label>
          <div class="space-y-2 pt-2">
            <UButton @click="save" block style="background-color: #3358ff;" class="font-bold" :loading="saving">
              {{ isEdit ? '💾 Perbarui' : '💾 Simpan' }}
            </UButton>
            <NuxtLink to="/admin/portfolio" class="block text-center text-sm text-slate-500 hover:text-slate-700 py-1.5 transition-colors">
              Batal
            </NuxtLink>
          </div>
        </div>

        <!-- Detail -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Proyek</p>

          <UFormGroup label="Kategori *">
            <USelect v-model="form.category" :options="categories" placeholder="Pilih kategori..." />
          </UFormGroup>

          <UFormGroup label="Nama Klien">
            <UInput v-model="form.client" placeholder="PT Nama Klien" />
          </UFormGroup>

          <UFormGroup label="Tanggal">
            <UInput v-model="form.date" type="month" />
          </UFormGroup>

          <UFormGroup label="Link Project (opsional)">
            <UInput v-model="form.link" type="url" placeholder="https://..." />
          </UFormGroup>

          <UFormGroup label="Tags (pisah koma)">
            <UInput v-model="form.tagsRaw" placeholder="Laravel, Vue.js, Tailwind" />
          </UFormGroup>
        </div>

        <!-- Image -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gambar Cover</p>
          <UFormGroup label="URL Gambar">
            <UInput v-model="form.image" type="url" placeholder="https://..." />
          </UFormGroup>
          <img v-if="form.image" :src="form.image" :alt="form.title" class="w-full h-28 object-cover rounded-xl border border-gray-100" />
          <p class="text-xs text-slate-400">Gunakan Unsplash, Cloudinary, atau link publik.</p>
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
const { data: allPortfolio } = await useFetch<any[]>('/api/admin/portfolio', {
  headers: authHeaders.value, server: false, default: () => [],
})

const form = reactive({
  title: '', slug: '', category: '', client: '', date: '',
  image: '', excerpt: '', content: '', link: '', tagsRaw: '',
  published: true, featured: false,
})

const slugManual = ref(false)
const saving     = ref(false)
const errors     = ref<string[]>([])

const categories = [
  'Web Development','Mobile App','SaaS / Software','Desain Grafis',
  'Desain Logo & Branding','Video & Animasi','Foto Produk','Social Media',
  'Meta Ads / Google Ads','SEO','Esports & Talent','Lainnya',
]

// Load existing item for edit
if (isEdit.value && id.value) {
  const item = (allPortfolio.value ?? []).find((i: any) => i.id === id.value)
  if (item) {
    Object.assign(form, item)
    form.tagsRaw = (item.tags || []).join(', ')
    slugManual.value = true
  }
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function autoSlug() {
  if (!slugManual.value) form.slug = slugify(form.title)
}

async function save() {
  errors.value = []
  if (!form.title)    errors.value.push('Judul wajib diisi.')
  if (!form.slug)     errors.value.push('Slug wajib diisi.')
  if (!form.category) errors.value.push('Kategori wajib dipilih.')

  const existing = (allPortfolio.value ?? []).find((i: any) => i.slug === form.slug && i.id !== id.value)
  if (existing) errors.value.push(`Slug "${form.slug}" sudah digunakan.`)

  if (errors.value.length) return

  saving.value = true
  const tags   = form.tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)
  const newItem = {
    id:         id.value || String(Date.now()),
    slug:       form.slug,
    title:      form.title,
    category:   form.category,
    client:     form.client,
    image:      form.image,
    excerpt:    form.excerpt,
    content:    form.content,
    tags,
    link:       form.link,
    date:       form.date,
    featured:   form.featured,
    published:  form.published,
    created_at: isEdit.value ? ((allPortfolio.value ?? []).find((i:any) => i.id === id.value)?.created_at || new Date().toISOString()) : new Date().toISOString(),
  }

  let updated: any[]
  if (isEdit.value) {
    updated = (allPortfolio.value ?? []).map((i: any) => i.id === id.value ? newItem : i)
  } else {
    updated = [...(allPortfolio.value ?? []), newItem]
  }

  await $fetch('/api/admin/portfolio', { method: 'POST', headers: authHeaders.value, body: updated })
  saving.value = false
  router.push('/admin/portfolio')
}
</script>
