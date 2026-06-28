<template>
  <div class="p-8 max-w-3xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Global Settings</h1>
      <p class="text-slate-500 text-sm mt-0.5">Kontak, sosial media, Google Analytics, dan Meta Pixel.</p>
    </div>

    <div v-if="saved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> Pengaturan berhasil disimpan!
    </div>

    <div class="space-y-6">

      <!-- Kontak -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UIcon name="i-tabler-phone" class="w-4 h-4 text-[#3358ff]" /> Kontak
        </p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Nomor WhatsApp (tanpa +)">
            <UInput v-model="form.phone" placeholder="6285161313693" />
          </UFormGroup>
          <UFormGroup label="Tampilan Nomor">
            <UInput v-model="form.phone_display" placeholder="+62 851-6131-3693" />
          </UFormGroup>
          <UFormGroup label="Email">
            <UInput v-model="form.email" type="email" placeholder="lakarasolusikreatif@gmail.com" />
          </UFormGroup>
          <UFormGroup label="Alamat">
            <UInput v-model="form.address" placeholder="Jl. Animan No. 03..." />
          </UFormGroup>
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <UIcon name="i-tabler-alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          Setelah simpan, nomor WA & email di konten website akan update otomatis. Tidak perlu rebuild.
        </div>
      </div>

      <!-- Sosial media -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UIcon name="i-tabler-share" class="w-4 h-4 text-[#3358ff]" /> Sosial Media
        </p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Instagram URL">
            <UInput v-model="form.instagram" placeholder="https://instagram.com/wearelakara" />
          </UFormGroup>
          <UFormGroup label="YouTube URL">
            <UInput v-model="form.youtube" placeholder="https://youtube.com/@lakaracreative" />
          </UFormGroup>
          <UFormGroup label="TikTok URL">
            <UInput v-model="form.tiktok" placeholder="https://tiktok.com/@lakara.id" />
          </UFormGroup>
          <UFormGroup label="LinkedIn URL">
            <UInput v-model="form.linkedin" placeholder="https://linkedin.com/company/lakara" />
          </UFormGroup>
        </div>
      </div>

      <!-- Analytics -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UIcon name="i-tabler-chart-bar" class="w-4 h-4 text-[#3358ff]" /> Analytics & Tracking
        </p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Google Analytics 4 ID">
            <UInput v-model="form.ga_id" placeholder="G-XXXXXXXXXX" />
            <template #hint>
              <span class="text-xs text-slate-400">Kosongkan jika tidak pakai GA4</span>
            </template>
          </UFormGroup>
          <UFormGroup label="Meta Pixel ID">
            <UInput v-model="form.pixel_id" placeholder="123456789012345" />
            <template #hint>
              <span class="text-xs text-slate-400">Kosongkan jika tidak pakai Meta Pixel</span>
            </template>
          </UFormGroup>
        </div>
        <!-- Status indicators -->
        <div class="grid md:grid-cols-2 gap-3">
          <div class="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            :class="form.ga_id ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'">
            <div class="w-2 h-2 rounded-full" :class="form.ga_id ? 'bg-green-500' : 'bg-slate-300'" />
            Google Analytics {{ form.ga_id ? 'aktif' : 'belum dikonfigurasi' }}
          </div>
          <div class="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            :class="form.pixel_id ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'">
            <div class="w-2 h-2 rounded-full" :class="form.pixel_id ? 'bg-green-500' : 'bg-slate-300'" />
            Meta Pixel {{ form.pixel_id ? 'aktif' : 'belum dikonfigurasi' }}
          </div>
        </div>
      </div>

      <!-- Informasi site -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UIcon name="i-tabler-building" class="w-4 h-4 text-[#3358ff]" /> Informasi Perusahaan
        </p>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Nama Perusahaan">
            <UInput v-model="form.company_name" placeholder="PT Lakara Solusi Kreatif" />
          </UFormGroup>
          <UFormGroup label="Tagline">
            <UInput v-model="form.tagline" placeholder="Innovating Creativity with Technology" />
          </UFormGroup>
          <UFormGroup label="Domain Website">
            <UInput v-model="form.domain" placeholder="https://lakara.id" />
          </UFormGroup>
          <UFormGroup label="Google Search Console Verification">
            <UInput v-model="form.gsc_meta" placeholder="google-site-verification content" />
          </UFormGroup>
        </div>
      </div>

      <!-- Upgrade Pro — Bank & Pricing -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <UIcon name="i-tabler-crown" class="w-4 h-4 text-amber-500" /> Upgrade Pro — Rekening & Harga
        </p>
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
          <UIcon name="i-tabler-info-circle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
          Info ini ditampilkan ke member saat mereka request upgrade ke Pro (unlimited produk).
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <UFormGroup label="Nama Bank">
            <UInput v-model="form.bank_name" placeholder="BCA / BNI / Mandiri / DANA" />
          </UFormGroup>
          <UFormGroup label="Nomor Rekening / Dompet">
            <UInput v-model="form.bank_account" placeholder="1234567890" />
          </UFormGroup>
          <UFormGroup label="Nama Pemilik Rekening">
            <UInput v-model="form.bank_holder" placeholder="PT Lakara Solusi Kreatif" />
          </UFormGroup>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
          <UFormGroup label="Harga Normal (Rp/bulan)">
            <UInput v-model.number="form.upgrade_price" type="number" min="0" placeholder="20000" />
          </UFormGroup>
          <UFormGroup label="Harga Promo (Rp/bulan) — kosongkan jika tidak ada promo">
            <UInput v-model.number="form.upgrade_promo" type="number" min="0" placeholder="10000" />
            <template #hint>
              <span class="text-xs text-slate-400">Isi 0 atau kosongkan untuk menonaktifkan promo</span>
            </template>
          </UFormGroup>
        </div>
      </div>

    </div>

    <!-- Save -->
    <div class="sticky bottom-0 bg-slate-100 border-t border-slate-200 py-4 -mx-8 px-8 mt-6">
      <UButton @click="saveSettings" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        💾 Simpan Semua Settings
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()
const { data: raw } = await useFetch<Record<string, any>>('/api/admin/settings', {
  headers: authHeaders.value, default: () => ({}),
})

const form = reactive({
  phone:          '',
  phone_display:  '',
  email:          '',
  address:        '',
  instagram:      '',
  youtube:        '',
  tiktok:         '',
  linkedin:       '',
  ga_id:          '',
  pixel_id:       '',
  company_name:   'PT Lakara Solusi Kreatif',
  tagline:        'Innovating Creativity with Technology',
  domain:         'https://lakara.id',
  gsc_meta:       '',
  bank_name:      '',
  bank_account:   '',
  bank_holder:    '',
  upgrade_price:  20000,
  upgrade_promo:  null as number | null,
  ...raw.value,
})

const saving = ref(false)
const saved  = ref(false)

async function saveSettings() {
  saving.value = true
  await $fetch('/api/admin/settings', { method: 'POST', headers: authHeaders.value, body: { ...form } })
  saving.value = false
  saved.value  = true
  setTimeout(() => saved.value = false, 4000)
}
</script>
