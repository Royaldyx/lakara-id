<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Info Toko</h1>
      <p class="text-slate-500 text-sm mt-0.5">Edit tampilan dan info toko kamu.</p>
    </div>

    <div v-if="saved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> Perubahan berhasil disimpan!
    </div>
    <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ saveError }}
    </div>

    <div class="space-y-5">
      <!-- Info dasar -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Toko</p>
        <UFormGroup label="Nama Toko">
          <UInput v-model="form.name" placeholder="Nama tokomu..." />
        </UFormGroup>
        <UFormGroup label="Tagline">
          <UInput v-model="form.tagline" placeholder="Satu kalimat yang menggambarkan toko..." />
        </UFormGroup>
        <UFormGroup label="Deskripsi">
          <UTextarea v-model="form.description" :rows="3" placeholder="Cerita singkat tentang toko..." />
        </UFormGroup>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Logo / Foto Profil -->
          <UFormGroup label="Logo / Foto Profil" hint="Juga jadi foto profil">
            <div class="space-y-2">
              <p class="text-xs text-slate-400 -mt-1">Foto ini tampil sebagai foto profil di sidebar & halaman Link Bio kamu. Bisa juga diatur di <NuxtLink to="/member/profile" class="text-[#3358ff] font-medium hover:underline">Edit Profil</NuxtLink>.</p>
              <div class="flex gap-2 items-center">
                <UInput v-model="form.logo" type="url"
                  :placeholder="isUploadedLogo ? '' : 'https://...'"
                  :readonly="isUploadedLogo" class="flex-1" />
                <label class="cursor-pointer flex-shrink-0">
                  <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#3358ff] text-white hover:opacity-90 transition-opacity"
                    :class="logoUploading ? 'opacity-60 cursor-wait' : ''">
                    <span v-if="logoUploading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    <UIcon v-else name="i-tabler-upload" class="w-3.5 h-3.5" />
                    {{ logoUploading ? '...' : 'Upload' }}
                  </span>
                  <input type="file" accept="image/*" class="hidden" :disabled="logoUploading" @change="uploadLogo" />
                </label>
                <button v-if="form.logo" @click="form.logo = ''" type="button" class="text-slate-300 hover:text-red-500 transition-colors">
                  <UIcon name="i-tabler-x" class="w-4 h-4" />
                </button>
              </div>
              <p v-if="logoError" class="text-xs text-red-500">{{ logoError }}</p>
              <img v-if="form.logo" :src="form.logo" class="h-12 w-12 rounded-xl object-contain border border-slate-100 bg-slate-50" />
            </div>
          </UFormGroup>
          <UFormGroup label="Warna Brand">
            <div class="flex gap-2 items-center">
              <input type="color" v-model="form.primary_color" class="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
              <UInput v-model="form.primary_color" placeholder="#3358ff" class="font-mono flex-1" />
            </div>
          </UFormGroup>
        </div>
      </div>

      <!-- Sosmed -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sosial Media & Kontak</p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Instagram URL">
            <UInput v-model="form.instagram" placeholder="https://instagram.com/..." />
          </UFormGroup>
          <UFormGroup label="TikTok URL">
            <UInput v-model="form.tiktok" placeholder="https://tiktok.com/@..." />
          </UFormGroup>
          <UFormGroup label="WhatsApp (tanpa +)">
            <UInput v-model="form.whatsapp" placeholder="6281234567890" />
          </UFormGroup>
          <UFormGroup label="YouTube URL">
            <UInput v-model="form.youtube" placeholder="https://youtube.com/..." />
          </UFormGroup>
        </div>
      </div>

      <!-- Why Buy -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Alasan Beli (Why Buy)</p>
          <button @click="form.why_buy.push({ title: '', desc: '' })" type="button"
            class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70">
            <UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
        <div v-for="(item, i) in form.why_buy" :key="i" class="flex gap-3 items-start">
          <div class="flex-1 space-y-2">
            <UInput v-model="item.title" placeholder="1-Year Guarantee" />
            <UTextarea v-model="item.desc" :rows="2" placeholder="Deskripsi singkat..." />
          </div>
          <button @click="form.why_buy.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600 mt-2">
            <UIcon name="i-tabler-trash" class="w-4 h-4" />
          </button>
        </div>
        <p v-if="!form.why_buy.length" class="text-sm text-slate-400 italic">Belum ada. Klik "+ Tambah"</p>
      </div>
    </div>

      <!-- Rasio Gambar Produk -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rasio Gambar Produk</p>
          <p class="text-sm text-slate-600">Samakan ukuran semua foto produk di storefront & halaman produk.</p>
        </div>
        <div class="grid grid-cols-2 gap-3 max-w-xs">
          <button v-for="r in imageRatios" :key="r.key" @click="form.product_image_ratio = r.key" type="button"
            class="flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all"
            :class="form.product_image_ratio === r.key ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
            <div class="bg-slate-200 rounded-lg" :class="r.preview" />
            <span class="text-xs font-semibold text-slate-700">{{ r.label }}</span>
          </button>
        </div>
      </div>

      <!-- Ubah URL Toko -->
      <div class="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 space-y-4">
        <p class="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
          <UIcon name="i-tabler-alert-triangle" class="w-4 h-4" />
          Ubah URL Toko
        </p>
        <p class="text-sm text-slate-500 leading-relaxed break-words">
          URL saat ini: <span class="font-mono text-[#3358ff] font-semibold break-all">lakara.id/{{ store?.slug }}</span><br>
          <span class="text-amber-600 text-xs">Setelah diubah, link lama tidak akan berfungsi lagi.</span>
        </p>
        <div>
          <label class="text-sm font-medium text-slate-700 block mb-1.5">URL Baru</label>
          <div class="flex">
            <span class="border border-r-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 text-sm rounded-l-xl whitespace-nowrap">lakara.id/</span>
            <input v-model="newSlug" type="text" maxlength="60"
              placeholder="url-baru-kamu"
              :class="['flex-1 border rounded-r-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 transition',
                slugError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#3358ff]/30 focus:border-[#3358ff]']"
              @input="slugError = ''" />
          </div>
          <p v-if="slugError" class="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <UIcon name="i-tabler-alert-circle" class="w-3.5 h-3.5 flex-shrink-0" />{{ slugError }}
          </p>
        </div>
        <UButton @click="changeSlug" color="amber" variant="outline" class="font-semibold" :loading="slugSaving">
          Ubah URL
        </UButton>
      </div>

    <div class="sticky bottom-24 lg:bottom-0 bg-slate-50 border-t border-slate-200 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-6 flex gap-3 rounded-2xl lg:rounded-none">
      <UButton @click="save" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        💾 Simpan Perubahan
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store = computed(() => storeData.value)

const { compress } = useImageCompress()

const form = reactive({
  name: '', tagline: '', description: '', logo: '',
  primary_color: '#3358ff',
  instagram: '', tiktok: '', whatsapp: '', youtube: '',
  why_buy: [] as { title: string; desc: string }[],
  show_on_showcase: false as boolean,
  product_image_ratio: '1:1' as string,
})

const imageRatios = [
  { key: '1:1', label: '1:1 (Kotak)',  preview: 'w-10 h-10' },
  { key: '3:4', label: '3:4 (Potret)', preview: 'w-9 h-12' },
]

const saving         = ref(false)
const saveError      = ref('')
const saved          = ref(false)
const logoUploading  = ref(false)
const logoError      = ref('')
const isUploadedLogo = ref(false)

// Ubah URL Toko
const newSlug    = ref('')
const slugSaving = ref(false)
const slugError  = ref('')

function populateForm() {
  const s = storeData.value
  if (!s) return
  form.name          = s.name          || ''
  form.tagline       = s.tagline       || ''
  form.description   = s.description  || ''
  form.logo          = s.logo          || ''
  form.primary_color = s.primary_color || '#3358ff'
  form.instagram     = s.instagram     || ''
  form.tiktok        = s.tiktok        || ''
  form.whatsapp      = s.whatsapp      || ''
  form.youtube       = s.youtube       || ''
  form.why_buy          = s.why_buy ? [...s.why_buy] : []
  form.show_on_showcase = !!(s.show_on_showcase)
  form.product_image_ratio = s.product_image_ratio || '1:1'
  isUploadedLogo.value  = !!(s.logo && s.logo.includes('/uploads/'))
}

onMounted(async () => {
  await fetchStore()
  populateForm()
})

watch(storeData, populateForm)

async function uploadLogo(e: Event) {
  const raw = (e.target as HTMLInputElement).files?.[0]
  if (!raw) return
  logoError.value    = ''
  logoUploading.value = true
  try {
    // Compress to 512 KB before upload (server will enforce tier limit)
    const file = await compress(raw, 512)
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    form.logo = res.url
    isUploadedLogo.value = true
  } catch (err: any) {
    logoError.value = err?.data?.statusMessage || err?.message || 'Upload gagal. Coba lagi.'
  } finally {
    logoUploading.value = false
  }
}

async function changeSlug() {
  slugError.value = ''
  if (!newSlug.value.trim()) { slugError.value = 'URL tidak boleh kosong.'; return }
  slugSaving.value = true
  try {
    const res = await $fetch<{ ok: boolean; data: any }>('/api/member/change-slug', {
      method: 'POST', body: { slug: newSlug.value.trim() },
    })
    storeData.value = res.data
    newSlug.value   = ''
    saved.value     = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e: any) {
    slugError.value = e?.data?.statusMessage || 'Gagal mengubah URL.'
  } finally {
    slugSaving.value = false
  }
}

async function save() {
  saveError.value = ''
  saving.value = true
  try {
    const res = await $fetch<{ ok: boolean; data: any }>('/api/member/store', {
      method: 'POST',
      body: {
        name:          form.name,
        tagline:       form.tagline,
        description:   form.description,
        logo:          form.logo,
        primary_color: form.primary_color,
        instagram:     form.instagram,
        tiktok:        form.tiktok,
        whatsapp:      form.whatsapp,
        youtube:       form.youtube,
        why_buy:          form.why_buy,
        show_on_showcase: form.show_on_showcase,
        product_image_ratio: form.product_image_ratio,
      },
    })
    storeData.value = res.data
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e: any) {
    saveError.value = e?.data?.statusMessage || 'Gagal menyimpan. Coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>
