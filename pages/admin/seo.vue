<template>
  <div class="p-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">SEO Settings</h1>
      <p class="text-slate-500 text-sm mt-0.5">Atur title, description, og:image untuk setiap halaman.</p>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-700 flex items-start gap-2">
      <UIcon name="i-tabler-alert-triangle" class="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <strong>Catatan:</strong> SEO halaman statis (beranda, layanan, dll.) baru aktif setelah rebuild &amp; upload ulang Nuxt.
        SEO halaman portofolio langsung aktif karena dibaca dari API.
      </div>
    </div>

    <!-- Success -->
    <div v-if="saved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> Pengaturan SEO berhasil disimpan!
    </div>

    <div class="space-y-4">
      <div v-for="(label, key) in pages" :key="key"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <!-- Accordion header -->
        <button type="button" @click="toggle(key)"
          class="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[#3358ff]/10 rounded-lg flex items-center justify-center">
              <UIcon name="i-tabler-file-text" class="w-4 h-4 text-[#3358ff]" />
            </div>
            <div>
              <div class="font-bold text-slate-900 text-sm">{{ label }}</div>
              <div class="text-xs text-slate-400 font-mono">/{{ key === 'home' ? '' : key }}</div>
            </div>
          </div>
          <UIcon :name="open[key] ? 'i-tabler-chevron-up' : 'i-tabler-chevron-down'" class="w-4 h-4 text-slate-400" />
        </button>

        <!-- Accordion body -->
        <div v-show="open[key]" class="border-t border-slate-100 px-6 py-5 space-y-4">
          <!-- Live preview -->
          <div class="bg-slate-50 rounded-xl p-3 text-xs">
            <div class="text-[#3358ff] font-medium text-sm">{{ seoForm[key]?.title || label + ' — Lakara' }}</div>
            <div class="text-slate-400 mt-0.5">lakara.id{{ key !== 'home' ? '/' + key : '' }}</div>
            <div class="text-slate-600 mt-1 line-clamp-2">{{ seoForm[key]?.description || 'Meta description...' }}</div>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <UFormGroup label="Meta Title (50-60 karakter)">
              <UInput v-model="seoForm[key].title" :placeholder="label + ' — Lakara'" maxlength="80" />
            </UFormGroup>
            <UFormGroup label="OG Image URL">
              <UInput v-model="seoForm[key].og_image" type="url" placeholder="https://..." />
            </UFormGroup>
          </div>

          <UFormGroup label="Meta Description (120-160 karakter)">
            <UTextarea v-model="seoForm[key].description" :rows="2"
              :placeholder="'Deskripsi halaman ' + label + ' untuk Google...'" maxlength="200" />
          </UFormGroup>

          <UFormGroup label="Canonical URL">
            <UInput v-model="seoForm[key].canonical" type="url"
              :placeholder="'https://lakara.id' + (key !== 'home' ? '/' + key : '')" />
          </UFormGroup>
        </div>
      </div>
    </div>

    <!-- Sticky save button -->
    <div class="sticky bottom-0 bg-slate-100 border-t border-slate-200 py-4 -mx-8 px-8 mt-6">
      <UButton @click="saveAll" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        💾 Simpan Semua SEO Settings
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const pages = {
  home: 'Beranda', services: 'Layanan', pricing: 'Harga',
  about: 'Tentang', contact: 'Kontak', portfolio: 'Portofolio',
}

const { authHeaders } = useAdmin()
const { data: rawSeo } = await useFetch<Record<string, any>>('/api/admin/seo', {
  headers: authHeaders.value, default: () => ({}),
})

// Build reactive form
const seoForm = reactive<Record<string, any>>(
  Object.fromEntries(
    Object.keys(pages).map(key => [
      key, { title: '', description: '', og_image: '', canonical: '', ...((rawSeo.value ?? {})[key] || {}) }
    ])
  )
)

const open   = reactive<Record<string, boolean>>(Object.fromEntries(Object.keys(pages).map((k, i) => [k, i === 0])))
const saving = ref(false)
const saved  = ref(false)

function toggle(key: string) { open[key] = !open[key] }

async function saveAll() {
  saving.value = true
  saved.value  = false
  await $fetch('/api/admin/seo', { method: 'POST', headers: authHeaders.value, body: seoForm })
  saving.value = false
  saved.value  = true
  setTimeout(() => saved.value = false, 4000)
}
</script>
