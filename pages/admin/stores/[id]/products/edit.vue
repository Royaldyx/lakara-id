<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink :to="`/admin/stores/${storeId}`" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">{{ isEdit ? 'Edit Produk' : 'Tambah Produk Baru' }}</h1>
        <p v-if="store" class="text-xs text-slate-400 mt-0.5">
          Toko: <span class="font-semibold text-[#3358ff]">{{ store.name }}</span>
        </p>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 space-y-1">
      <div v-for="e in errors" :key="e" class="flex items-center gap-2">
        <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ e }}
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Main (2/3) -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Info utama -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
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

          <UFormGroup label="Tagline (1 kalimat singkat)">
            <UInput v-model="form.tagline" placeholder="Daily bag for your productive life" />
          </UFormGroup>

          <UFormGroup label="Deskripsi Lengkap">
            <UTextarea v-model="form.description" :rows="4" placeholder="Deskripsi produk yang menarik..." />
          </UFormGroup>
        </div>

        <!-- Badge & Stok -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Label & Stok</p>
          <div class="grid md:grid-cols-2 gap-4">
            <UFormGroup label="Badge Label">
              <USelect v-model="form.badge" :options="badgeOptions" placeholder="Pilih badge..." />
              <template #hint><span class="text-xs text-slate-400">Tampil di pojok foto produk</span></template>
            </UFormGroup>
            <UFormGroup label="Info Stok (teks bebas)">
              <UInput v-model="form.stock_label" placeholder="Tersisa 23 pcs — order sekarang!" />
              <template #hint><span class="text-xs text-slate-400">Tampil dengan dot hijau di hero</span></template>
            </UFormGroup>
          </div>
        </div>

        <!-- Spesifikasi -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Spesifikasi Produk</p>
            <button @click="addSpec" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah Baris
            </button>
          </div>
          <div v-for="(spec, i) in form.specs" :key="i" class="flex gap-3 items-center">
            <UInput v-model="spec.label" placeholder="Dimensi" class="w-36 flex-shrink-0" />
            <UInput v-model="spec.value" placeholder="30 × 15 × 45 cm" class="flex-1" />
            <button @click="form.specs.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600 flex-shrink-0">
              <UIcon name="i-tabler-trash" class="w-4 h-4" />
            </button>
          </div>
          <!-- Preview -->
          <div v-if="form.specs.length" class="rounded-xl overflow-hidden border border-slate-100 mt-2">
            <div v-for="(spec, i) in form.specs.filter(s => s.label)" :key="i"
              class="flex justify-between px-4 py-2.5 text-sm gap-4"
              :class="i % 2 === 0 ? 'bg-white' : 'bg-slate-50'">
              <span class="text-slate-500 font-medium flex-shrink-0">{{ spec.label }}</span>
              <span class="text-slate-900 font-bold text-right">{{ spec.value }}</span>
            </div>
          </div>
          <p v-if="!form.specs.length" class="text-sm text-slate-400 italic">Belum ada spesifikasi. Klik "+ Tambah Baris"</p>
        </div>

        <!-- Gambar -->
        <div
          class="bg-white rounded-2xl shadow-sm border-2 border-slate-100 p-6 space-y-4 transition-colors"
          :class="isDragging ? 'border-[#3358ff] bg-blue-50/30' : ''"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop">

          <!-- Header -->
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Foto Produk</p>
              <p class="text-xs text-slate-400 mt-0.5">
                Maks <strong>1.5MB</strong> per foto · Kompres dulu di
                <a href="https://squoosh.app" target="_blank" class="text-[#3358ff] hover:underline font-semibold">squoosh.app</a>
                (gratis, bisa sampai 90% lebih kecil)
              </p>
            </div>
            <div class="flex gap-2">
              <button @click="addImage" type="button"
                class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-[#3358ff] hover:text-[#3358ff] transition-colors">
                <UIcon name="i-tabler-link" class="w-3.5 h-3.5" /> Tambah URL
              </button>
              <label class="cursor-pointer">
                <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#3358ff] text-white hover:opacity-90 transition-opacity">
                  <UIcon name="i-tabler-upload" class="w-3.5 h-3.5" />
                  Upload Foto
                  <span class="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">PRO</span>
                </span>
                <input ref="fileInputMultiple" type="file" accept="image/*" multiple class="hidden"
                  @change="handleFileInputChange" />
              </label>
            </div>
          </div>

          <!-- Upload progress -->
          <div v-if="uploading" class="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <div class="w-4 h-4 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-[#3358ff]">Mengupload foto...</p>
              <div class="mt-1 bg-blue-100 rounded-full h-1.5">
                <div class="bg-[#3358ff] h-full rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Upload error -->
          <div v-if="uploadError" class="bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-red-600">
            <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ uploadError }}
            <button @click="uploadError = ''" class="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>

          <!-- Drag overlay hint -->
          <div v-if="isDragging" class="border-2 border-dashed border-[#3358ff] rounded-xl py-8 text-center">
            <UIcon name="i-tabler-upload" class="w-8 h-8 text-[#3358ff] mx-auto mb-2" />
            <p class="text-sm font-semibold text-[#3358ff]">Lepas untuk upload</p>
          </div>

          <!-- Image list -->
          <div v-if="!isDragging" class="space-y-2">
            <div v-for="(img, i) in form.images" :key="i"
              class="flex gap-2 items-center bg-slate-50 rounded-xl px-3 py-2">
              <!-- Thumbnail -->
              <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                <img v-if="img" :src="img" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-tabler-photo" class="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <!-- URL input or uploaded label -->
              <div class="flex-1 min-w-0">
                <div v-if="isUploadedUrl(img)" class="flex items-center gap-2">
                  <span class="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full flex-shrink-0">✓ Uploaded</span>
                  <span class="text-xs text-slate-400 truncate font-mono">{{ img }}</span>
                </div>
                <UInput v-else v-model="form.images[i]" type="url" :placeholder="`URL foto ${i + 1}...`" size="sm" class="w-full" />
              </div>
              <!-- Replace upload button -->
              <label class="cursor-pointer flex-shrink-0" :title="'Ganti dengan upload'">
                <span class="text-slate-400 hover:text-[#3358ff] transition-colors">
                  <UIcon name="i-tabler-replace" class="w-4 h-4" />
                </span>
                <input type="file" accept="image/*" class="hidden" @change="(e) => replaceWithUpload(e, i)" />
              </label>
              <!-- Delete -->
              <button @click="form.images.splice(i, 1)" type="button" class="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <p v-if="!form.images.length" class="text-sm text-slate-400 italic text-center py-4">
              Belum ada foto. Klik "Tambah URL" atau "Upload Foto"
            </p>
          </div>

          <!-- Preview grid -->
          <div v-if="form.images.filter(Boolean).length && !isDragging" class="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
            <div v-for="(img, i) in form.images.filter(Boolean)" :key="i"
              class="rounded-xl overflow-hidden aspect-square bg-slate-100 relative group cursor-pointer"
              @click="previewImg = img">
              <img :src="img" class="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UIcon name="i-tabler-zoom-in" class="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <p v-if="form.images.filter(Boolean).length" class="text-xs text-slate-400 text-center">
            {{ form.images.filter(Boolean).length }} foto · Klik thumbnail untuk preview
          </p>
        </div>

        <!-- Image preview modal -->
        <div v-if="previewImg" @click="previewImg = ''"
          class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out">
          <img :src="previewImg" class="max-w-full max-h-[85vh] rounded-2xl object-contain" />
        </div>

        <!-- Marketplace links -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Link Marketplace</p>
          <div class="space-y-3">
            <div v-for="mp in marketplaces" :key="mp.key" class="flex items-center gap-3">
              <span class="text-sm font-medium text-slate-600 w-28 flex-shrink-0">{{ mp.label }}</span>
              <UInput v-model="form.marketplace[mp.key]" type="url" placeholder="https://..." class="flex-1" />
            </div>
          </div>
        </div>

        <!-- Fitur produk -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Fitur Produk (Introducing)</p>
            <button @click="addFeature" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah Fitur
            </button>
          </div>
          <div v-for="(feat, i) in form.features" :key="i"
            class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">Fitur {{ i + 1 }}</span>
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
            <UFormGroup label="Gambar Fitur (URL)">
              <UInput v-model="feat.image" type="url" placeholder="https://..." />
            </UFormGroup>
          </div>
          <p v-if="!form.features.length" class="text-sm text-slate-400 italic">Belum ada fitur. Klik "+ Tambah Fitur"</p>
        </div>

        <!-- FAQ produk -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">FAQ Produk</p>
            <button @click="addFaq" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah FAQ
            </button>
          </div>
          <div v-for="(item, i) in form.faq" :key="i"
            class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-500">FAQ {{ i + 1 }}</span>
              <button @click="form.faq.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <UFormGroup label="Pertanyaan">
              <UInput v-model="item.q" placeholder="Apakah ada garansi?" />
            </UFormGroup>
            <UFormGroup label="Jawaban">
              <UTextarea v-model="item.a" :rows="2" placeholder="Ya, produk kami bergaransi..." />
            </UFormGroup>
          </div>
          <p v-if="!form.faq.length" class="text-sm text-slate-400 italic">Belum ada FAQ.</p>
        </div>

        <!-- Reviews / Social Proof -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Reviews & Social Proof</p>
          <div class="grid md:grid-cols-2 gap-4">
            <UFormGroup label="Total Reviews (angka)">
              <UInput v-model.number="form.reviews.total" type="number" min="0" placeholder="500" />
              <template #hint><span class="text-xs text-slate-400">Tampil sebagai "500+ Reviews"</span></template>
            </UFormGroup>
            <UFormGroup label="Rating (1.0 – 5.0)">
              <UInput v-model.number="form.reviews.rating" type="number" min="1" max="5" step="0.1" placeholder="4.8" />
            </UFormGroup>
          </div>

          <!-- Preview -->
          <div v-if="form.reviews.total" class="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3">
            <div class="flex gap-0.5">
              <span v-for="i in 5" :key="i" class="text-lg" :class="i <= Math.round(form.reviews.rating) ? 'text-yellow-400' : 'text-slate-200'">★</span>
            </div>
            <span class="text-sm font-bold text-slate-800">{{ form.reviews.rating }}</span>
            <span class="text-sm text-slate-400">· {{ form.reviews.total }}+ Reviews</span>
          </div>

          <!-- Testimonial items -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs font-semibold text-slate-500">Kutipan Testimoni (tampil di halaman produk)</span>
            <button @click="addReview" type="button"
              class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
              <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div v-for="(rev, i) in form.reviews.items" :key="i"
            class="border border-slate-100 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex gap-0.5">
                <button v-for="s in 5" :key="s" @click="rev.rating = s" type="button"
                  class="text-lg transition-colors" :class="s <= (rev.rating || 5) ? 'text-yellow-400' : 'text-slate-200'">★</button>
              </div>
              <button @click="form.reviews.items.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600">
                <UIcon name="i-tabler-trash" class="w-4 h-4" />
              </button>
            </div>
            <UFormGroup label="Teks Review">
              <UTextarea v-model="rev.text" :rows="2" placeholder="Produknya bagus banget, recommended!" />
            </UFormGroup>
            <div class="grid grid-cols-2 gap-3">
              <UFormGroup label="Nama">
                <UInput v-model="rev.name" placeholder="Budi S." />
              </UFormGroup>
              <UFormGroup label="Lokasi (opsional)">
                <UInput v-model="rev.location" placeholder="Jakarta" />
              </UFormGroup>
            </div>
          </div>
          <p v-if="!form.reviews.items.length" class="text-sm text-slate-400 italic">Belum ada kutipan review.</p>
        </div>

      </div>

      <!-- Sidebar (1/3) -->
      <div class="space-y-5">

        <!-- Publish & Save -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Publish</p>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" v-model="form.published" class="rounded border-gray-300 text-[#3358ff] w-4 h-4" />
            <span class="text-sm font-medium text-slate-700">Tampil di toko</span>
          </label>
          <div class="space-y-2 pt-2">
            <UButton @click="save" block style="background-color: #3358ff;" class="font-bold" :loading="saving">
              {{ isEdit ? '💾 Perbarui' : '💾 Simpan' }}
            </UButton>
            <NuxtLink :to="`/admin/stores/${storeId}`"
              class="block text-center text-sm text-slate-500 hover:text-slate-700 py-1.5 transition-colors">
              Batal
            </NuxtLink>
          </div>
        </div>

        <!-- Harga -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Harga</p>
          <UFormGroup label="Harga Jual (Rp) *">
            <UInput v-model.number="form.price" type="number" min="0" placeholder="150000" />
            <template #hint>
              <span class="text-xs text-slate-400">0 = "Hubungi kami"</span>
            </template>
          </UFormGroup>
          <UFormGroup label="Harga Coret (opsional)">
            <UInput v-model.number="form.price_original" type="number" min="0" placeholder="200000" />
            <template #hint>
              <span class="text-xs text-slate-400">Isi jika ada diskon</span>
            </template>
          </UFormGroup>
          <div v-if="form.price" class="bg-slate-50 rounded-xl p-3 flex items-center gap-3 flex-wrap">
            <span class="font-extrabold text-lg text-[#3358ff]">{{ formatPrice(form.price) }}</span>
            <span v-if="form.price_original" class="text-sm text-slate-400 line-through">{{ formatPrice(form.price_original) }}</span>
            <span v-if="form.price_original && form.price < form.price_original"
              class="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              {{ Math.round((1 - form.price / form.price_original) * 100) }}% OFF
            </span>
          </div>
        </div>

        <!-- Preview link -->
        <div v-if="isEdit && store" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</p>
          <a :href="`/${store.slug}/${form.slug}`" target="_blank"
            class="flex items-center gap-2 text-sm text-[#3358ff] hover:underline font-medium">
            <UIcon name="i-tabler-external-link" class="w-4 h-4" />
            Lihat halaman produk
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route   = useRoute()
const router  = useRouter()
const storeId = computed(() => route.params.id as string)
const pid     = computed(() => route.query.pid as string | undefined)
const isEdit  = computed(() => !!pid.value)

const { authHeaders } = useAdmin()
const { data: allStores } = await useFetch<any[]>('/api/admin/stores', {
  headers: authHeaders.value, server: false, default: () => [],
})

const store = computed(() => (allStores.value ?? []).find((s: any) => s.id === storeId.value))

const marketplaces = [
  { key: 'shopee',      label: 'Shopee' },
  { key: 'tokopedia',   label: 'Tokopedia' },
  { key: 'lazada',      label: 'Lazada' },
  { key: 'blibli',      label: 'Blibli' },
  { key: 'tiktok_shop', label: 'TikTok Shop' },
  { key: 'website',     label: 'Website' },
]

const badgeOptions = ['', 'Best Seller', 'New', 'Limited', 'Hot', 'Sale', 'Promo']

const form = reactive({
  name:           '',
  slug:           '',
  tagline:        '',
  description:    '',
  badge:          '',
  stock_label:    '',
  price:          0,
  price_original: 0,
  images:         [] as string[],
  specs:          [] as { label: string; value: string }[],
  marketplace:    { shopee: '', tokopedia: '', lazada: '', blibli: '', tiktok_shop: '', website: '' } as Record<string, string>,
  features:       [] as { title: string; desc: string; image: string }[],
  faq:            [] as { q: string; a: string }[],
  reviews:        { total: 0, rating: 5.0, items: [] as { name: string; text: string; rating: number; location: string }[] },
  published:      true,
})

const slugManual       = ref(false)
const saving           = ref(false)
const errors           = ref<string[]>([])

// Upload state
const uploading        = ref(false)
const uploadProgress   = ref(0)
const uploadError      = ref('')
const isDragging       = ref(false)
const previewImg       = ref('')
const fileInputMultiple = ref<HTMLInputElement | null>(null)

const isUploadedUrl = (url: string) => url.startsWith('/api/file/')

async function uploadFile(file: File): Promise<string | null> {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!ALLOWED.includes(file.type)) {
    uploadError.value = `"${file.name}" bukan format gambar yang didukung (JPG, PNG, WebP).`
    return null
  }
  if (file.size > 1.5 * 1024 * 1024) {
    uploadError.value = `"${file.name}" terlalu besar (maks 1.5MB). Kompres dulu di squoosh.app — gratis & mudah.`
    return null
  }
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await $fetch<{ ok: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      headers: authHeaders.value,
      body: fd,
    })
    return res.url
  } catch (e: any) {
    uploadError.value = e?.data?.statusMessage || `Gagal upload "${file.name}". Coba lagi.`
    return null
  }
}

async function handleFileInputChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (!files.length) return
  uploadError.value   = ''
  uploading.value     = true
  uploadProgress.value = 10
  for (let i = 0; i < files.length; i++) {
    const url = await uploadFile(files[i])
    if (url) form.images.push(url)
    uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
  }
  uploading.value = false
  uploadProgress.value = 0
  ;(e.target as HTMLInputElement).value = ''
}

async function replaceWithUpload(e: Event, index: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadError.value   = ''
  uploading.value     = true
  uploadProgress.value = 50
  const url = await uploadFile(file)
  if (url) form.images[index] = url
  uploading.value      = false
  uploadProgress.value = 0
  ;(e.target as HTMLInputElement).value = ''
}

async function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (!files.length) return
  uploadError.value    = ''
  uploading.value      = true
  uploadProgress.value = 10
  for (let i = 0; i < files.length; i++) {
    const url = await uploadFile(files[i])
    if (url) form.images.push(url)
    uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
  }
  uploading.value      = false
  uploadProgress.value = 0
}

// Load existing product for edit
watchEffect(() => {
  if (isEdit.value && pid.value && store.value) {
    const product = (store.value.products || []).find((p: any) => p.id === pid.value)
    if (product) {
      Object.assign(form, product)
      form.marketplace   = { shopee: '', tokopedia: '', lazada: '', blibli: '', tiktok_shop: '', website: '', ...(product.marketplace || {}) }
      form.features      = product.features ? [...product.features] : []
      form.faq           = product.faq ? [...product.faq] : []
      form.images        = product.images ? [...product.images] : []
      form.specs         = product.specs ? [...product.specs] : []
      form.reviews       = { total: 0, rating: 5.0, items: [], ...(product.reviews || {}) }
      form.reviews.items = product.reviews?.items ? [...product.reviews.items] : []
      slugManual.value   = true
    }
  }
})

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
function autoSlug() { if (!slugManual.value) form.slug = slugify(form.name) }

function addImage()   { form.images.push('') }
function addSpec()    { form.specs.push({ label: '', value: '' }) }
function addFeature() { form.features.push({ title: '', desc: '', image: '' }) }
function addFaq()     { form.faq.push({ q: '', a: '' }) }
function addReview()  { form.reviews.items.push({ name: '', text: '', rating: 5, location: '' }) }

function formatPrice(val: number) {
  if (!val) return 'Hubungi kami'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

async function save() {
  errors.value = []
  if (!form.name) errors.value.push('Nama produk wajib diisi.')
  if (!form.slug) errors.value.push('Slug wajib diisi.')

  const currentProducts = (store.value?.products || []) as any[]
  const dupSlug = currentProducts.find((p: any) => p.slug === form.slug && p.id !== pid.value)
  if (dupSlug) errors.value.push(`Slug "${form.slug}" sudah dipakai di toko ini.`)

  if (errors.value.length) return

  saving.value = true

  const newProduct = {
    id:             pid.value || String(Date.now()),
    name:           form.name,
    slug:           form.slug,
    tagline:        form.tagline,
    description:    form.description,
    badge:          form.badge || '',
    stock_label:    form.stock_label || '',
    price:          form.price || 0,
    price_original: form.price_original || 0,
    images:         form.images.filter(Boolean),
    specs:          form.specs.filter(s => s.label),
    marketplace:    Object.fromEntries(
      Object.entries(form.marketplace).filter(([, v]) => v)
    ),
    features:       form.features.filter(f => f.title),
    faq:            form.faq.filter(f => f.q),
    reviews: {
      total:  form.reviews.total || 0,
      rating: form.reviews.rating || 5,
      items:  form.reviews.items.filter(r => r.text),
    },
    published:      form.published,
  }

  const updatedProducts = isEdit.value
    ? currentProducts.map((p: any) => p.id === pid.value ? newProduct : p)
    : [...currentProducts, newProduct]

  const updatedStores = (allStores.value ?? []).map((s: any) =>
    s.id === storeId.value ? { ...s, products: updatedProducts } : s
  )

  await $fetch('/api/admin/stores', {
    method:  'POST',
    headers: authHeaders.value,
    body:    updatedStores,
  })

  saving.value = false
  router.push(`/admin/stores/${storeId.value}`)
}
</script>
