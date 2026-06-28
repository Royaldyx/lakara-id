<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/admin/stores" class="text-slate-400 hover:text-slate-700 transition-colors">
        <UIcon name="i-tabler-arrow-left" class="w-5 h-5" />
      </NuxtLink>
      <div class="flex items-center gap-3 flex-1">
        <div v-if="store" class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          :style="{ background: store.primary_color || '#3358ff' }">
          <img v-if="store.logo" :src="store.logo" class="w-8 h-8 object-contain rounded-lg" />
          <span v-else class="text-white font-bold text-sm">{{ store?.name?.[0] }}</span>
        </div>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900">{{ store?.name }}</h1>
          <a :href="`/${store?.slug}`" target="_blank" class="text-xs text-[#3358ff] hover:underline font-mono">
            lakara.id/{{ store?.slug }}
          </a>
        </div>
      </div>
      <div class="flex gap-2">
        <NuxtLink :to="`/admin/stores/edit?action=edit&id=${storeId}`"
          class="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition">
          <UIcon name="i-tabler-pencil" class="w-4 h-4" /> Edit Toko
        </NuxtLink>
        <NuxtLink :to="`/admin/stores/${storeId}/products/edit?action=add`"
          class="flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-[#3358ff] text-white rounded-xl hover:opacity-90 transition">
          <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Produk
        </NuxtLink>
      </div>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Produk kosong -->
    <div v-if="!products.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-box" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm mb-4">Belum ada produk di toko ini.</p>
      <NuxtLink :to="`/admin/stores/${storeId}/products/edit?action=add`"
        class="bg-[#3358ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition inline-block">
        + Tambah Produk Pertama
      </NuxtLink>
    </div>

    <!-- Grid produk -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="product in products" :key="product.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div class="h-48 bg-gray-100 overflow-hidden relative">
          <img v-if="product.images?.[0]" :src="product.images[0]"
            class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-tabler-photo" class="w-12 h-12 text-gray-200" />
          </div>
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="product.published !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
            {{ product.published !== false ? 'Live' : 'Draft' }}
          </span>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{{ product.name }}</h3>
          <p class="text-xs text-slate-400 mb-1 font-mono">{{ store?.slug }}/{{ product.slug }}</p>
          <p class="text-sm font-bold text-[#3358ff] mb-3">{{ formatPrice(product.price) }}</p>
          <div class="flex gap-2">
            <a :href="`/${store?.slug}/${product.slug}`" target="_blank"
              class="flex-shrink-0 p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition">
              <UIcon name="i-tabler-external-link" class="w-4 h-4 text-slate-600" />
            </a>
            <NuxtLink :to="`/admin/stores/${storeId}/products/edit?action=edit&pid=${product.id}`"
              class="flex-1 text-center bg-[#3358ff]/10 text-[#3358ff] text-xs font-semibold py-2 rounded-lg hover:bg-[#3358ff]/20 transition">
              Edit
            </NuxtLink>
            <button @click="deleteProduct(product)"
              class="px-3 py-2 bg-red-50 text-red-400 text-xs rounded-lg hover:bg-red-100 transition">
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

const route   = useRoute()
const storeId = computed(() => route.params.id as string)
const { authHeaders } = useAdmin()
const success = ref('')

const { data: allStores, refresh } = await useFetch<any[]>('/api/admin/stores', {
  headers: authHeaders.value, server: false, default: () => [],
})
const store    = computed(() => (allStores.value ?? []).find((s: any) => s.id === storeId.value))
const products = computed(() => store.value?.products || [])

function formatPrice(val: number) {
  if (!val) return '—'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

async function deleteProduct(product: any) {
  if (!confirm(`Hapus produk "${product.name}"?`)) return
  const updated = (allStores.value ?? []).map((s: any) => {
    if (s.id !== storeId.value) return s
    return { ...s, products: (s.products || []).filter((p: any) => p.id !== product.id) }
  })
  await $fetch('/api/admin/stores', { method: 'POST', headers: authHeaders.value, body: updated })
  success.value = 'Produk berhasil dihapus.'
  refresh()
  setTimeout(() => success.value = '', 3000)
}
</script>
