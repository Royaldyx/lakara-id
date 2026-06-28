<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Artikel</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ artikel.length }} artikel terdaftar</p>
      </div>
      <NuxtLink to="/admin/artikel/edit?action=add"
        class="flex items-center gap-2 bg-[#3358ff] text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-sm">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tulis Artikel Baru
      </NuxtLink>
    </div>

    <!-- Success/Error toast -->
    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Filter bar -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <button
        v-for="cat in ['Semua', ...categoryList]" :key="cat"
        @click="filterCat = cat"
        class="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
        :class="filterCat === cat
          ? 'bg-[#3358ff] text-white border-[#3358ff]'
          : 'bg-white text-slate-600 border-slate-200 hover:border-[#3358ff] hover:text-[#3358ff]'"
      >
        {{ cat }}
      </button>
      <div class="ml-auto flex items-center gap-2">
        <UInput v-model="search" placeholder="Cari artikel..." size="sm" icon="i-tabler-search" class="w-52" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!filtered.length" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
      <UIcon name="i-tabler-article-off" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm mb-4">
        {{ search || filterCat !== 'Semua' ? 'Tidak ada artikel yang cocok.' : 'Belum ada artikel.' }}
      </p>
      <NuxtLink to="/admin/artikel/edit?action=add"
        class="bg-[#3358ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition inline-block">
        + Tulis Artikel Pertama
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-500">Artikel</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Kategori</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Tanggal</th>
            <th class="text-center px-5 py-3 font-semibold text-slate-500">Status</th>
            <th class="text-right px-5 py-3 font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in filtered" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div class="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <UIcon name="i-tabler-article" class="w-5 h-5 text-slate-300" />
                  </div>
                  <span v-if="item.featured" class="absolute top-0.5 right-0.5 w-2 h-2 bg-yellow-400 rounded-full" title="Featured" />
                </div>
                <div class="min-w-0">
                  <div class="font-semibold text-slate-900 truncate max-w-xs leading-tight">{{ item.title }}</div>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">/artikel/{{ item.slug }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 hidden md:table-cell">
              <span class="inline-block bg-blue-50 text-[#3358ff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ item.category }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{{ formatDate(item.created_at || item.date) }}</td>
            <td class="px-5 py-3.5 text-center">
              <button @click="togglePublish(item)"
                class="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                :class="item.published !== false
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                {{ item.published !== false ? '● Publik' : '○ Draft' }}
              </button>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-3">
                <a :href="'/artikel/' + item.slug" target="_blank"
                  class="text-slate-400 hover:text-slate-700 transition" title="Preview">
                  <UIcon name="i-tabler-external-link" class="w-4 h-4" />
                </a>
                <NuxtLink :to="'/admin/artikel/edit?action=edit&id=' + item.id"
                  class="text-sm text-[#3358ff] hover:opacity-70 font-medium transition">Edit</NuxtLink>
                <button @click="deleteItem(item)"
                  class="text-sm text-red-400 hover:text-red-600 font-medium transition">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()
const success  = ref('')
const search   = ref('')
const filterCat = ref('Semua')

const { data: res, refresh } = await useFetch('/api/admin/artikel', {
  headers: authHeaders.value, server: false, default: () => [],
})
const artikel = computed(() => [...((res.value ?? []) as any[])].reverse())

const categoryList = computed(() => {
  const cats = artikel.value.map((i: any) => i.category).filter(Boolean)
  return [...new Set(cats)] as string[]
})

const filtered = computed(() => {
  let list = artikel.value
  if (filterCat.value !== 'Semua') list = list.filter((i: any) => i.category === filterCat.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((i: any) => i.title?.toLowerCase().includes(q) || i.excerpt?.toLowerCase().includes(q))
  }
  return list
})

function formatDate(val: string) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function togglePublish(item: any) {
  const all = (res.value ?? []) as any[]
  const updated = all.map((i: any) =>
    i.id === item.id ? { ...i, published: !(i.published !== false) } : i
  )
  await $fetch('/api/admin/artikel', { method: 'POST', headers: authHeaders.value, body: updated })
  refresh()
}

async function deleteItem(item: any) {
  if (!confirm(`Hapus artikel "${item.title}"?`)) return
  const all = (res.value ?? []) as any[]
  const updated = all.filter((i: any) => i.id !== item.id)
  await $fetch('/api/admin/artikel', { method: 'POST', headers: authHeaders.value, body: updated })
  success.value = 'Artikel berhasil dihapus.'
  refresh()
  setTimeout(() => success.value = '', 3000)
}
</script>
