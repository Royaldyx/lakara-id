<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Portofolio</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ portfolio.length }} item terdaftar</p>
      </div>
      <NuxtLink to="/admin/portfolio/edit?action=add"
        class="flex items-center gap-2 bg-[#3358ff] text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-sm">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Baru
      </NuxtLink>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Empty -->
    <div v-if="!portfolio.length" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
      <UIcon name="i-tabler-briefcase-off" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm mb-4">Belum ada portofolio.</p>
      <NuxtLink to="/admin/portfolio/edit?action=add"
        class="bg-[#3358ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition inline-block">
        + Tambah Pertama
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-500">Proyek</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Kategori</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Tanggal</th>
            <th class="text-center px-5 py-3 font-semibold text-slate-500">Status</th>
            <th class="text-right px-5 py-3 font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in portfolio" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <img v-if="item.image" :src="item.image" class="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                <div v-else class="w-10 h-10 bg-slate-100 rounded-lg flex-shrink-0" />
                <div>
                  <div class="font-semibold text-slate-900 leading-tight">{{ item.title }}</div>
                  <div class="text-xs text-slate-400 font-mono">/portfolio/{{ item.slug }}</div>
                </div>
              </div>
            </td>
            <td class="px-5 py-3.5 text-slate-500 hidden md:table-cell">{{ item.category }}</td>
            <td class="px-5 py-3.5 text-slate-500 hidden lg:table-cell">{{ item.date || '—' }}</td>
            <td class="px-5 py-3.5 text-center">
              <button @click="togglePublish(item)"
                class="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                :class="item.published !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                {{ item.published !== false ? '● Publik' : '○ Draft' }}
              </button>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center justify-end gap-3">
                <NuxtLink :to="'/admin/portfolio/edit?action=edit&id=' + item.id"
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
const success = ref('')

const { data: res, refresh } = await useFetch('/api/portfolio', {
  headers: authHeaders.value, server: false, default: () => ({ success: false, data: [] }),
})
const portfolio = computed(() => [...((res.value?.data ?? []) as any[])].reverse())

async function togglePublish(item: any) {
  await $fetch('/api/portfolio', {
    method: 'POST',
    headers: authHeaders.value,
    body: { action: 'toggle_publish', id: item.id },
  })
  refresh()
}

async function deleteItem(item: any) {
  if (!confirm(`Hapus "${item.title}"?`)) return
  await $fetch('/api/portfolio', {
    method: 'POST',
    headers: authHeaders.value,
    body: { action: 'delete', id: item.id },
  })
  success.value = 'Portofolio berhasil dihapus.'
  refresh()
  setTimeout(() => success.value = '', 3000)
}
</script>
