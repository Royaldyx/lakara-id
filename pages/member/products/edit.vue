<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-4xl">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/member/products" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-extrabold text-slate-900">{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h1>
    </div>

    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 space-y-1">
      <div v-for="e in errors" :key="e" class="flex items-center gap-2">
        <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ e }}
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-5">
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Produk</p>
          <UFormGroup label="Nama Produk *">
            <UInput v-model="form.name" @input="autoSlug" placeholder="Nama produk..." size="lg" />
          </UFormGroup>
          <UFormGroup label="Slug (URL) *">
            <div class="flex">
              <span class="border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-400 text-sm rounded-l-md whitespace-nowrap">{{ store?.slug }}/</span>
              <UInput v-model="form.slug" @input="slugManual = true" placeholder="nama-produk" class="rounded-l-none flex-1 font-mono" />
            </div>
          </UFormGroup>
          <UFormGroup label="Tagline">
            <UInput v-model="form.tagline" placeholder="Satu kalimat singkat..." />
          </UFormGroup>
          <UFormGroup label="Deskripsi">
            <UTextarea v-model="form.description" :rows="4" placeholder="Deskripsi lengkap produk..." />
          </UFormGroup>
        </div>

        <!-- Foto -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
          :class="isDragging ? 'border-[#3358ff] bg-blue-50/30 border-2' : ''"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Foto Produk</p>
              <p class="text-xs text-slate-400 mt-0.5">Maks 1.5MB · kompres di <a href="https://squoosh.app" target="_blank" class="text-[#3358ff] hover:underline">squoosh.app</a></p>
            </div>
            <div class="flex gap-2">
              <button @click="form.images.push('')" type="button"
                class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-[#3358ff] hover:text-[#3358ff] transition-colors">
                <UIcon name="i-tabler-link" class="w-3.5 h-3.5" /> URL
              </button>
              <label class="cursor-pointer">
                <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#3358ff] text-white hover:opacity-90 transition-opacity">
                  <UIcon name="i-tabler-upload" class="w-3.5 h-3.5" /> Upload
                </span>
                <input type="file" accept="image/*" multiple class="hidden" @change="handleFileInput" />
              </label>
            </div>
          </div>
          <!-- Upload progress -->
          <div v-if="uploading" class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div class="w-4 h-4 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <p class="text-sm font-semibold text-[#3358ff]">Mengupload foto...</p>
          </div>
          <p v-if="uploadError" class="text-xs text-red-500">{{ uploadError }}</p>
          <!-- Image list -->
          <div v-if="!isDragging" class="space-y-2">
            <div v-for="(img, i) in form.images" :key="i" class="flex gap-2 items-center bg-slate-50 rounded-xl px-3 py-2">
              <div class="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                <img v-if="img" :src="img" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <span v-if="img.startsWith('/api/file/')" class="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">✓ Uploaded</span>
                <UInput v-else v-model="form.images[i]" type="url" :placeholder="`URL foto ${i + 1}...`" size="sm" class="w-full" />
              </div>
              <label class="cursor-pointer flex-shrink-0" title="Ganti dengan upload">
                <span class="text-slate-400 hover:text-[#3358ff] transition-colors"><UIcon name="i-tabler-replace" class="w-4 h-4" /></span>
                <input type="file" accept="image/*" class="hidden" @change="(e) => replaceImage(e, i)" />
              </label>
              <button @click="form.images.splice(i, 1)" type="button" class="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="!form.images.length" class="text-sm text-slate-400 italic text-center py-4">Belum ada foto.</p>
          </div>
          <!-- Preview -->
          <div v-if="form.images.filter(Boolean).length && !isDragging" class="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            <div v-for="(img, i) in form.images.filter(Boolean)" :key="i" class="rounded-xl overflow-hidden aspect-square bg-slate-100">
              <img :src="img" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <!-- Marketplace -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Link Marketplace</p>
          <p class="text-xs text-slate-400">Tempel link produk di marketplace. Centang ⭐ = tampil di bar bawah halaman (maks 2).</p>
          <div class="space-y-3">
            <div v-for="mp in marketplaces" :key="mp.key" class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-600 w-24 flex-shrink-0">{{ mp.label }}</span>
              <UInput v-model="form.marketplace[mp.key]" type="url" placeholder="https://..." class="flex-1" />
              <button type="button" @click="toggleFeatured(mp.key)" :disabled="!form.marketplace[mp.key]"
                :title="form.marketplace_featured.includes(mp.key) ? 'Tampil di bar bawah' : 'Tampilkan di bar bawah'"
                class="p-2 rounded-lg transition-colors flex-shrink-0 disabled:opacity-30"
                :class="form.marketplace_featured.includes(mp.key) ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'">
                <UIcon :name="form.marketplace_featured.includes(mp.key) ? 'i-tabler-star-filled' : 'i-tabler-star'" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <UFormGroup label="Link Beli Utama (opsional)">
            <UInput v-model="form.buy_link" type="url" placeholder="https://... (WA / Shopee / link apapun)" />
            <template #hint><span class="text-xs text-slate-400">Dipakai tombol "Beli Sekarang". Kosong = pakai marketplace pertama.</span></template>
          </UFormGroup>
        </div>

        <!-- FAQ -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">FAQ Produk</p>
            <button @click="form.faq.push({ q: '', a: '' })" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div v-for="(item, i) in form.faq" :key="i" class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex justify-between">
              <span class="text-xs font-semibold text-slate-400">FAQ {{ i + 1 }}</span>
              <button @click="form.faq.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <UInput v-model="item.q" placeholder="Pertanyaan?" />
            <UTextarea v-model="item.a" :rows="2" placeholder="Jawaban..." />
          </div>
          <p v-if="!form.faq.length" class="text-sm text-slate-400 italic">Belum ada FAQ.</p>
        </div>

        <!-- Review Produk -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Review Produk</p>
              <p class="text-xs text-slate-400 mt-0.5">Rating & ulasan yang tampil di halaman produk</p>
            </div>
            <button @click="addReviewItem" type="button" class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah Ulasan
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <UFormGroup label="Rating Rata-rata (0-5)">
              <UInput v-model.number="form.reviews.rating" type="number" min="0" max="5" step="0.1" placeholder="4.8" />
            </UFormGroup>
            <UFormGroup label="Total Review">
              <UInput v-model.number="form.reviews.total" type="number" min="0" placeholder="128" />
            </UFormGroup>
          </div>
          <div v-for="(rev, i) in form.reviews.items" :key="i" class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-400">Ulasan {{ i + 1 }}</span>
              <button @click="form.reviews.items.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <UInput v-model="rev.name" placeholder="Nama pembeli" />
              <UInput v-model="rev.location" placeholder="Kota (opsional)" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">Bintang</span>
              <button v-for="s in 5" :key="s" type="button" @click="rev.rating = s">
                <UIcon :name="s <= rev.rating ? 'i-tabler-star-filled' : 'i-tabler-star'" class="w-5 h-5" :class="s <= rev.rating ? 'text-yellow-400' : 'text-slate-300'" />
              </button>
            </div>
            <UTextarea v-model="rev.text" :rows="2" placeholder="Isi ulasan..." />
          </div>
          <p v-if="!form.reviews.items.length" class="text-sm text-slate-400 italic">Belum ada ulasan. Klik "Tambah Ulasan".</p>
        </div>

        <!-- Fitur / Introducing -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur Produk (Introducing)</p>
              <p class="text-xs text-slate-400 mt-0.5">Tampil sebagai section alternating di halaman produk</p>
            </div>
            <button @click="form.features.push({ title: '', desc: '', image: '' })" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div v-for="(feat, i) in form.features" :key="i"
            class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-xs font-semibold text-slate-400">Fitur {{ i + 1 }}</span>
              <button @click="form.features.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <UFormGroup label="Judul Fitur">
              <UInput v-model="feat.title" placeholder="Water-Resistant Material" />
            </UFormGroup>
            <UFormGroup label="Deskripsi">
              <UTextarea v-model="feat.desc" :rows="2" placeholder="Penjelasan fitur ini..." />
            </UFormGroup>
            <UFormGroup label="Gambar (URL atau upload)">
              <div class="flex gap-2 items-center">
                <UInput v-model="feat.image" type="url" placeholder="https://..." class="flex-1" />
                <label class="cursor-pointer flex-shrink-0">
                  <span class="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-lg bg-[#3358ff] text-white hover:opacity-90 transition-opacity">
                    <UIcon name="i-tabler-upload" class="w-3.5 h-3.5" />
                  </span>
                  <input type="file" accept="image/*" class="hidden" @change="(e) => uploadFeatImage(e, i)" />
                </label>
              </div>
              <img v-if="feat.image" :src="feat.image" class="mt-2 rounded-xl h-24 object-cover w-full" />
            </UFormGroup>
          </div>
          <p v-if="!form.features.length" class="text-sm text-slate-400 italic">Belum ada fitur.</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-5">
        <!-- Publish -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Publish</p>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.published" class="rounded border-gray-300 text-[#3358ff] w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Tampil di toko</span>
          </label>
          <div class="space-y-2 pt-2">
            <UButton @click="save" block style="background-color: #3358ff;" class="font-bold" :loading="saving">
              {{ isEdit ? '💾 Perbarui' : '💾 Simpan' }}
            </UButton>
            <NuxtLink to="/member/products" class="block text-center text-sm text-slate-500 hover:text-slate-700 py-1.5">Batal</NuxtLink>
          </div>
        </div>

        <!-- Harga -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Harga</p>
          <UFormGroup label="Harga Jual (Rp)">
            <UInput v-model.number="form.price" type="number" min="0" placeholder="150000" />
          </UFormGroup>
          <UFormGroup label="Harga Coret (opsional)">
            <UInput v-model.number="form.price_original" type="number" min="0" placeholder="200000" />
          </UFormGroup>
        </div>

        <!-- Badge & Stok -->
        <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Label</p>
          <UFormGroup label="Badge">
            <USelect v-model="form.badge" :options="['', 'Best Seller', 'New', 'Limited', 'Hot', 'Sale', 'Promo']" />
          </UFormGroup>
          <UFormGroup label="Info Stok">
            <UInput v-model="form.stock_label" placeholder="Tersisa 10 pcs" />
          </UFormGroup>
        </div>
      </div>
    </div>

    <!-- Bottom save button (visible all screen sizes, prominent CTA) -->
    <div class="mt-6 pt-6 border-t border-slate-100">
      <UButton @click="save" block style="background-color: #3358ff;" class="font-bold py-3 text-base" :loading="saving">
        {{ isEdit ? '💾 Perbarui Produk' : '💾 Simpan Produk' }}
      </UButton>
      <NuxtLink to="/member/products" class="block text-center text-sm text-slate-400 hover:text-slate-600 mt-3">Batal</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const route  = useRoute()
const router = useRouter()
const pid    = computed(() => route.query.pid as string | undefined)
const isEdit = computed(() => !!pid.value)

const { storeData, fetchStore } = useMember()
const store    = computed(() => storeData.value)
const products = computed(() => (store.value?.products || []) as any[])

const marketplaces = [
  { key: 'shopee',      label: 'Shopee'      },
  { key: 'tokopedia',   label: 'Tokopedia'   },
  { key: 'lazada',      label: 'Lazada'      },
  { key: 'blibli',      label: 'Blibli'      },
  { key: 'tiktok_shop', label: 'TikTok Shop' },
]

const form = reactive({
  name: '', slug: '', tagline: '', description: '', badge: '', stock_label: '',
  price: 0, price_original: 0, published: true,
  images:   [] as string[],
  features: [] as { title: string; desc: string; image: string }[],
  marketplace: { shopee: '', tokopedia: '', lazada: '', blibli: '', tiktok_shop: '' } as Record<string, string>,
  marketplace_featured: [] as string[],
  buy_link: '',
  faq: [] as { q: string; a: string }[],
  reviews: { rating: 0, total: 0, items: [] as { name: string; location: string; rating: number; text: string }[] },
})

function addReviewItem() {
  form.reviews.items.push({ name: '', location: '', rating: 5, text: '' })
}

function toggleFeatured(key: string) {
  const i = form.marketplace_featured.indexOf(key)
  if (i >= 0) { form.marketplace_featured.splice(i, 1); return }
  if (form.marketplace_featured.length >= 2) return  // maks 2
  form.marketplace_featured.push(key)
}

const slugManual  = ref(false)
const saving      = ref(false)
const errors      = ref<string[]>([])
const uploading   = ref(false)
const uploadError = ref('')
const isDragging  = ref(false)
const formLoaded  = ref(false)

// Populate form reaktif — handles race condition jika store belum ada saat mount
watchEffect(() => {
  if (isEdit.value && pid.value && store.value && !formLoaded.value) {
    const p = products.value.find((p: any) => p.id === pid.value)
    if (p) {
      Object.assign(form, p)
      form.marketplace = { shopee: '', tokopedia: '', lazada: '', blibli: '', tiktok_shop: '', ...(p.marketplace || {}) }
      form.faq         = p.faq      ? [...p.faq]      : []
      form.images      = p.images   ? [...p.images]   : []
      form.features    = p.features ? [...p.features] : []
      form.marketplace_featured = p.marketplace_featured ? [...p.marketplace_featured] : []
      form.buy_link    = p.buy_link || ''
      form.reviews     = {
        rating: p.reviews?.rating || 0,
        total:  p.reviews?.total  || 0,
        items:  p.reviews?.items ? p.reviews.items.map((r: any) => ({ name: r.name || '', location: r.location || '', rating: r.rating || 5, text: r.text || '' })) : [],
      }
      slugManual.value = true
      formLoaded.value = true
    }
  }
})

onMounted(async () => {
  if (!store.value) await fetchStore()
})

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
const autoSlug = () => { if (!slugManual.value) form.slug = slugify(form.name) }

const { compress } = useImageCompress()

async function uploadFile(rawFile: File): Promise<string | null> {
  try {
    uploadError.value = ''
    const file = await compress(rawFile, 512)
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ ok: boolean; url: string }>('/api/member/upload', { method: 'POST', body: fd })
    return res.url
  } catch (e: any) {
    uploadError.value = e?.data?.statusMessage || e?.message || 'Upload gagal.'
    return null
  }
}

async function handleFileInput(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  uploadError.value = ''
  uploading.value   = true
  for (const f of files) { const url = await uploadFile(f); if (url) form.images.push(url) }
  uploading.value = false
  ;(e.target as HTMLInputElement).value = ''
}

async function uploadFeatImage(e: Event, i: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  const url = await uploadFile(file)
  if (url) form.features[i].image = url
  uploading.value = false
  ;(e.target as HTMLInputElement).value = ''
}

async function replaceImage(e: Event, i: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  const url = await uploadFile(file)
  if (url) form.images[i] = url
  uploading.value = false
  ;(e.target as HTMLInputElement).value = ''
}

async function handleDrop(e: DragEvent) {
  isDragging.value  = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (!files.length) return
  uploading.value = true
  for (const f of files) { const url = await uploadFile(f); if (url) form.images.push(url) }
  uploading.value = false
}

async function save() {
  errors.value = []
  if (!store.value) { errors.value.push('Data toko belum termuat. Tunggu sebentar dan coba lagi.'); return }
  if (!form.name)   errors.value.push('Nama produk wajib diisi.')
  if (!form.slug)   errors.value.push('Slug wajib diisi.')
  const RESERVED_PRODUCT_SLUGS = ['store', 'links', 'api']
  if (RESERVED_PRODUCT_SLUGS.includes(form.slug)) errors.value.push(`Slug "${form.slug}" tidak bisa digunakan. Pilih nama lain.`)
  const dup = products.value.find((p: any) => p.slug === form.slug && p.id !== pid.value)
  if (dup) errors.value.push(`Slug "${form.slug}" sudah dipakai.`)

  // Tier check — blokir tambah produk baru jika free & sudah 10
  if (!isEdit.value && store.value.product_tier !== 'pro' && products.value.length >= 10) {
    errors.value.push('Paket Free hanya bisa menyimpan 10 produk. Upgrade ke Pro untuk produk unlimited.')
    return
  }

  if (errors.value.length) return

  saving.value = true

  // Preserve fields that member can't edit from the original product (features, specs, reviews)
  const existingProduct = isEdit.value
    ? (products.value.find((p: any) => p.id === pid.value) || {})
    : {}

  const newProduct = {
    ...existingProduct,                    // ← preserve features, specs, reviews, dll
    id:             pid.value || String(Date.now()),
    name:           form.name,
    slug:           form.slug,
    tagline:        form.tagline,
    description:    form.description,
    badge:          form.badge,
    stock_label:    form.stock_label,
    price:          form.price || 0,
    price_original: form.price_original || 0,
    images:         form.images.filter(Boolean),
    marketplace:    Object.fromEntries(Object.entries(form.marketplace).filter(([, v]) => v)),
    marketplace_featured: form.marketplace_featured.filter(k => form.marketplace[k]),
    buy_link:       form.buy_link.trim(),
    features:       form.features.filter(f => f.title),
    faq:            form.faq.filter(f => f.q),
    reviews: {
      rating: Number(form.reviews.rating) || 0,
      total:  Number(form.reviews.total)  || 0,
      items:  form.reviews.items.filter(r => (r.name && r.name.trim()) || (r.text && r.text.trim())),
    },
    published:      form.published,
  }

  const updated = isEdit.value
    ? products.value.map((p: any) => p.id === pid.value ? newProduct : p)
    : [...products.value, newProduct]

  try {
    await $fetch('/api/member/products', { method: 'POST', body: { products: updated } })
    storeData.value = { ...store.value, products: updated }
    router.push('/member/products')
  } catch (e: any) {
    errors.value = [e?.data?.statusMessage || 'Gagal menyimpan. Coba lagi.']
  } finally {
    saving.value = false
  }
}
</script>
