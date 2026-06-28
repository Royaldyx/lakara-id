<template>
  <div class="p-8 max-w-3xl">
    <div class="flex items-center gap-3 mb-8">
      <NuxtLink to="/admin/stores" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <h1 class="text-2xl font-extrabold text-slate-900">{{ isEdit ? 'Edit Toko' : 'Tambah Toko Baru' }}</h1>
    </div>

    <div v-if="errors.length" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 space-y-1">
      <div v-for="e in errors" :key="e" class="flex items-center gap-2">
        <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ e }}
      </div>
    </div>

    <div class="space-y-5">
      <!-- Info dasar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Toko</p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Nama Toko *">
            <UInput v-model="form.name" @input="autoSlug" placeholder="Grounds Studio" />
          </UFormGroup>
          <UFormGroup label="Slug (URL) *">
            <div class="flex">
              <span class="border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-400 text-xs rounded-l-md whitespace-nowrap">lakara.id/</span>
              <UInput v-model="form.slug" @input="slugManual = true" placeholder="grounds-studio" class="rounded-l-none font-mono" />
            </div>
          </UFormGroup>
        </div>
        <UFormGroup label="Tagline">
          <UInput v-model="form.tagline" placeholder="Daily bag for your productive life" />
        </UFormGroup>
        <UFormGroup label="Deskripsi Singkat">
          <UTextarea v-model="form.description" :rows="2" placeholder="Deskripsi toko..." />
        </UFormGroup>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Logo">
            <div class="space-y-2">
              <!-- Input row -->
              <div class="flex gap-2 items-center">
                <div class="flex-1 relative">
                  <UInput v-model="form.logo" type="url"
                    :placeholder="isUploadedLogo ? '' : 'https://...'"
                    :readonly="isUploadedLogo" />
                  <span v-if="isUploadedLogo"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    ✓ Uploaded
                  </span>
                </div>
                <!-- Upload button -->
                <label class="cursor-pointer flex-shrink-0">
                  <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors"
                    :class="logoUploading ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-[#3358ff] text-white hover:opacity-90'">
                    <span v-if="logoUploading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                    <UIcon v-else name="i-tabler-upload" class="w-3.5 h-3.5" />
                    {{ logoUploading ? 'Upload...' : 'Upload' }}
                  </span>
                  <input type="file" accept="image/*" class="hidden" :disabled="logoUploading"
                    @change="uploadLogo" />
                </label>
                <!-- Clear -->
                <button v-if="form.logo" @click="form.logo = ''" type="button"
                  class="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                  <UIcon name="i-tabler-x" class="w-4 h-4" />
                </button>
              </div>
              <!-- Error -->
              <p v-if="logoError" class="text-xs text-red-500 flex items-center gap-1">
                <UIcon name="i-tabler-alert-circle" class="w-3.5 h-3.5" /> {{ logoError }}
              </p>
              <!-- Preview -->
              <div v-if="form.logo" class="flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2">
                <img :src="form.logo" class="h-10 w-10 object-contain rounded-lg bg-white border border-slate-100" />
                <span class="text-xs text-slate-400 truncate">{{ form.logo }}</span>
              </div>
              <p class="text-xs text-slate-400">URL dari internet atau upload langsung · maks 1.5MB</p>
            </div>
          </UFormGroup>
          <UFormGroup label="Warna Utama (Primary Color)">
            <div class="flex gap-2 items-center">
              <input type="color" v-model="form.primary_color" class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <UInput v-model="form.primary_color" placeholder="#3358ff" class="font-mono" />
            </div>
          </UFormGroup>
        </div>
        <label class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="form.active" class="rounded border-gray-300 text-[#3358ff] w-4 h-4" />
          <span class="text-sm font-medium text-slate-700">Toko aktif (tampil di publik)</span>
        </label>
      </div>

      <!-- Sosial media -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Sosial Media & Kontak</p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Instagram URL">
            <UInput v-model="form.instagram" placeholder="https://instagram.com/..." />
          </UFormGroup>
          <UFormGroup label="TikTok URL">
            <UInput v-model="form.tiktok" placeholder="https://tiktok.com/@..." />
          </UFormGroup>
          <UFormGroup label="WhatsApp (nomor, tanpa +)">
            <UInput v-model="form.whatsapp" placeholder="6281234567890" />
          </UFormGroup>
          <UFormGroup label="YouTube URL">
            <UInput v-model="form.youtube" placeholder="https://youtube.com/..." />
          </UFormGroup>
        </div>
      </div>

      <!-- Why Buy section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Why Buy from Us (alasan beli)</p>
          <button @click="addWhyBuy" type="button"
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

      <!-- Member Login Credentials -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UIcon name="i-tabler-user-circle" class="w-4 h-4 text-[#3358ff]" /> Member Login
            </p>
            <p class="text-xs text-slate-400 mt-1">Credentials untuk klien login di <span class="font-mono text-[#3358ff]">lakara.id/member</span></p>
          </div>
          <span class="text-xs bg-[#3358ff]/10 text-[#3358ff] font-bold px-2.5 py-1 rounded-full flex-shrink-0">
            {{ creds.hasPassword ? '✓ Sudah di-set' : 'Belum di-set' }}
          </span>
        </div>

        <div v-if="credsSaved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
          <UIcon name="i-tabler-check" class="w-4 h-4" /> Credentials berhasil disimpan!
        </div>
        <div v-if="credsError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 flex items-center gap-2">
          <UIcon name="i-tabler-alert-circle" class="w-4 h-4" /> {{ credsError }}
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Email Login">
            <UInput v-model="creds.email" type="email" placeholder="owner@toko.com" />
          </UFormGroup>
          <UFormGroup label="Password">
            <UInput v-model="creds.password" type="password" placeholder="Kosongkan jika tidak ingin ubah" />
            <template #hint>
              <span class="text-xs text-slate-400">{{ creds.hasPassword ? 'Kosongkan = password lama tetap' : 'Wajib diisi untuk pertama kali' }}</span>
            </template>
          </UFormGroup>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <UButton @click="saveCreds" :loading="credsSaving"
            variant="outline" color="blue" size="sm" class="font-semibold" :disabled="!isEdit">
            <UIcon name="i-tabler-key" class="w-4 h-4 mr-1" />
            {{ creds.hasPassword ? 'Update Credentials' : 'Set Credentials' }}
          </UButton>
          <p v-if="!isEdit" class="text-xs text-slate-400 italic">Simpan toko dulu sebelum set credentials.</p>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="sticky bottom-0 bg-slate-100 border-t border-slate-200 py-4 -mx-8 px-8 mt-6 flex gap-3">
      <UButton @click="save" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        {{ isEdit ? '💾 Perbarui Toko' : '🚀 Buat Toko' }}
      </UButton>
      <NuxtLink to="/admin/stores" class="flex items-center text-sm text-slate-500 hover:text-slate-700 px-4 transition-colors">
        Batal
      </NuxtLink>
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
const { data: allStores } = await useFetch<any[]>('/api/admin/stores', {
  headers: authHeaders.value, default: () => [],
})

const form = reactive({
  name: '', slug: '', tagline: '', description: '', logo: '',
  primary_color: '#3358ff', active: true,
  instagram: '', tiktok: '', whatsapp: '', youtube: '',
  why_buy: [] as { title: string; desc: string }[],
})

const slugManual   = ref(false)
const saving       = ref(false)
const errors       = ref<string[]>([])

// Member credentials
const creds = reactive({
  email:       '',
  password:    '',
  hasPassword: false,
})
const credsSaving = ref(false)
const credsSaved  = ref(false)
const credsError  = ref('')

if (isEdit.value && id.value) {
  const store = (allStores.value ?? []).find((s: any) => s.id === id.value)
  if (store) {
    creds.email       = store.member_email || ''
    creds.hasPassword = !!store.member_password
  }
}

async function saveCreds() {
  credsError.value  = ''
  credsSaved.value  = false
  if (!creds.email) { credsError.value = 'Email wajib diisi.'; return }
  if (!creds.hasPassword && !creds.password) { credsError.value = 'Password wajib diisi untuk pertama kali.'; return }
  credsSaving.value = true
  try {
    await $fetch('/api/admin/member-creds', {
      method: 'POST',
      headers: authHeaders.value,
      body: { storeId: id.value, email: creds.email, password: creds.password || undefined },
    })
    creds.hasPassword = true
    creds.password    = ''
    credsSaved.value  = true
    setTimeout(() => credsSaved.value = false, 3000)
  } catch (e: any) {
    credsError.value = e?.data?.statusMessage || 'Gagal menyimpan credentials.'
  } finally {
    credsSaving.value = false
  }
}

// Logo upload
const logoUploading = ref(false)
const logoError     = ref('')
const isUploadedLogo = computed(() => form.logo.startsWith('/api/file/'))

async function uploadLogo(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  logoError.value = ''
  if (!file.type.startsWith('image/')) {
    logoError.value = 'File harus berupa gambar.'
    return
  }
  if (file.size > 1.5 * 1024 * 1024) {
    logoError.value = 'Maks 1.5MB. Kompres dulu di squoosh.app.'
    return
  }
  logoUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ ok: boolean; url: string }>('/api/admin/upload', {
      method: 'POST',
      headers: authHeaders.value,
      body: fd,
    })
    form.logo = res.url
  } catch (err: any) {
    logoError.value = err?.data?.statusMessage || 'Upload gagal. Coba lagi.'
  } finally {
    logoUploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

if (isEdit.value && id.value) {
  const store = (allStores.value ?? []).find((s: any) => s.id === id.value)
  if (store) {
    Object.assign(form, store)
    form.why_buy = store.why_buy || []
    slugManual.value = true
  }
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
function autoSlug() { if (!slugManual.value) form.slug = slugify(form.name) }
function addWhyBuy() { form.why_buy.push({ title: '', desc: '' }) }

async function save() {
  errors.value = []
  if (!form.name) errors.value.push('Nama toko wajib diisi.')
  if (!form.slug) errors.value.push('Slug wajib diisi.')
  const dup = (allStores.value ?? []).find((s: any) => s.slug === form.slug && s.id !== id.value)
  if (dup) errors.value.push(`Slug "${form.slug}" sudah dipakai.`)
  if (errors.value.length) return

  saving.value = true
  const newStore = {
    id:         id.value || String(Date.now()),
    slug:       form.slug,
    name:       form.name,
    tagline:    form.tagline,
    description: form.description,
    logo:       form.logo,
    primary_color: form.primary_color || '#3358ff',
    active:     form.active,
    instagram:  form.instagram,
    tiktok:     form.tiktok,
    whatsapp:   form.whatsapp,
    youtube:    form.youtube,
    why_buy:    form.why_buy.filter(w => w.title),
    products:   isEdit.value ? ((allStores.value ?? []).find((s: any) => s.id === id.value)?.products || []) : [],
    created_at: isEdit.value
      ? ((allStores.value ?? []).find((s: any) => s.id === id.value)?.created_at || new Date().toISOString())
      : new Date().toISOString(),
  }

  const updated = isEdit.value
    ? (allStores.value ?? []).map((s: any) => s.id === id.value ? newStore : s)
    : [...(allStores.value ?? []), newStore]

  await $fetch('/api/admin/stores', { method: 'POST', headers: authHeaders.value, body: updated })
  saving.value = false
  router.push('/admin/stores')
}
</script>
