<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Toko Klien</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ stores.length }} toko terdaftar</p>
      </div>
      <NuxtLink to="/admin/stores/edit?action=add"
        class="flex items-center gap-2 bg-[#3358ff] text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-sm">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Toko
      </NuxtLink>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Empty -->
    <div v-if="!stores.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-building-store" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm mb-4">Belum ada toko. Buat toko pertama!</p>
      <NuxtLink to="/admin/stores/edit?action=add"
        class="bg-[#3358ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition inline-block">
        + Tambah Toko
      </NuxtLink>
    </div>

    <!-- Grid toko -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="store in stores" :key="store.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <!-- Header toko -->
        <div class="h-16 flex items-center justify-center relative" :style="{ background: store.primary_color || '#3358ff' }">
          <img v-if="store.logo" :src="store.logo" class="h-10 object-contain" />
          <span v-else class="text-white font-extrabold text-xl">{{ store.name[0] }}</span>
        </div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 class="font-bold text-slate-900">{{ store.name }}</h3>
              <a :href="`/${store.slug}`" target="_blank" class="text-xs text-[#3358ff] font-mono hover:underline">
                lakara.id/{{ store.slug }}
              </a>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
              :class="store.active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
              {{ store.active !== false ? 'Aktif' : 'Nonaktif' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mb-3 line-clamp-2">{{ store.tagline || '—' }}</p>

          <!-- Toggle Showcase -->
          <button @click="toggleShowcase(store)" :disabled="store._busy"
            class="w-full flex items-center justify-between gap-2 mb-4 px-3 py-2 rounded-lg border text-xs font-semibold transition disabled:opacity-50"
            :class="store.show_on_showcase ? 'border-[#3358ff]/30 bg-[#3358ff]/5 text-[#3358ff]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'">
            <span class="flex items-center gap-1.5"><UIcon name="i-tabler-sparkles" class="w-3.5 h-3.5" /> Tampil di Showcase</span>
            <span class="relative inline-flex h-4 w-7 items-center rounded-full transition" :class="store.show_on_showcase ? 'bg-[#3358ff]' : 'bg-slate-300'">
              <span class="inline-block h-3 w-3 transform rounded-full bg-white transition" :class="store.show_on_showcase ? 'translate-x-3.5' : 'translate-x-0.5'" />
            </span>
          </button>
          <div class="flex items-center justify-between text-xs text-slate-400 mb-4">
            <span class="flex items-center gap-1">
              <UIcon name="i-tabler-box" class="w-3.5 h-3.5" />
              {{ (store.products || []).length }} produk
            </span>
            <span>{{ formatDate(store.created_at) }}</span>
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/admin/stores/${store.id}`"
              class="flex-1 text-center bg-[#3358ff]/10 text-[#3358ff] text-xs font-semibold py-2 rounded-lg hover:bg-[#3358ff]/20 transition">
              Kelola Produk
            </NuxtLink>
            <NuxtLink :to="`/admin/stores/edit?action=edit&id=${store.id}`"
              class="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition">
              Edit
            </NuxtLink>
            <button @click="deleteStore(store)"
              class="px-3 py-2 bg-red-50 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 transition">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()
const success = ref('')

const { data: raw, refresh } = await useFetch<any[]>('/api/admin/stores', {
  headers: authHeaders.value, server: false, default: () => [],
})
const stores = computed(() => (raw.value ?? []) as any[])

function formatDate(val: string) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function toggleShowcase(store: any) {
  const next = store.show_on_showcase ? 0 : 1
  store._busy = true
  try {
    await $fetch('/api/admin/stores/showcase', {
      method: 'POST', headers: authHeaders.value, body: { id: store.id, value: next },
    })
    store.show_on_showcase = next
    success.value = next ? `"${store.name}" ditampilkan di showcase.` : `"${store.name}" disembunyikan dari showcase.`
    setTimeout(() => success.value = '', 3000)
  } catch {
    alert('Gagal mengubah status showcase.')
  } finally {
    store._busy = false
  }
}

async function deleteStore(store: any) {
  if (!confirm(`Hapus toko "${store.name}" beserta semua produknya?`)) return
  const updated = (raw.value ?? []).filter((s: any) => s.id !== store.id)
  await $fetch('/api/admin/stores', { method: 'POST', headers: authHeaders.value, body: updated })
  success.value = `Toko "${store.name}" berhasil dihapus.`
  refresh()
  setTimeout(() => success.value = '', 3000)
}
</script>
