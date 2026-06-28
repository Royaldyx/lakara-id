<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Newsletter Subscribers</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ items.length }} subscriber terdaftar</p>
      </div>
      <UButton @click="exportCSV" variant="outline" color="gray" icon="i-tabler-download" class="font-semibold">
        Export CSV
      </UButton>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>

    <!-- Empty -->
    <div v-if="!items.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-mail" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm">Belum ada subscriber. Form newsletter belum diisi siapapun.</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Stats row -->
      <div class="grid grid-cols-3 border-b border-slate-100">
        <div v-for="stat in stats" :key="stat.label" class="px-6 py-4 text-center">
          <div class="text-2xl font-extrabold text-slate-900">{{ stat.value }}</div>
          <div class="text-xs text-slate-400 mt-0.5">{{ stat.label }}</div>
        </div>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-100">
          <tr>
            <th class="text-left px-5 py-3 font-semibold text-slate-500">Email</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Sumber</th>
            <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Tanggal Daftar</th>
            <th class="text-right px-5 py-3 font-semibold text-slate-500">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-5 py-3.5">
              <div class="font-medium text-slate-900">{{ item.email }}</div>
              <div v-if="item.name" class="text-xs text-slate-400">{{ item.name }}</div>
            </td>
            <td class="px-5 py-3.5 hidden md:table-cell">
              <span class="bg-blue-50 text-[#3358ff] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ item.source || 'website' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">{{ formatDate(item.created_at) }}</td>
            <td class="px-5 py-3.5 text-right">
              <button @click="deleteItem(item)"
                class="text-sm text-red-400 hover:text-red-600 font-medium transition">Hapus</button>
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

const { data: res, refresh } = await useFetch('/api/admin/newsletter', {
  headers: authHeaders.value, server: false, default: () => ({ ok: false, data: [] }),
})
const items = computed(() => (res.value?.data ?? []) as any[])

const stats = computed(() => {
  const sources = items.value.reduce((acc: any, i: any) => {
    acc[i.source || 'website'] = (acc[i.source || 'website'] || 0) + 1
    return acc
  }, {})
  return [
    { label: 'Total Subscriber', value: items.value.length },
    { label: 'Sumber Terbanyak', value: Object.entries(sources).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || '—' },
    { label: 'Bulan Ini', value: items.value.filter((i: any) => i.created_at?.startsWith(new Date().toISOString().slice(0, 7))).length },
  ]
})

function formatDate(val: string) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function deleteItem(item: any) {
  if (!confirm(`Hapus subscriber "${item.email}"?`)) return
  await $fetch('/api/admin/newsletter', { method: 'DELETE', headers: authHeaders.value, body: { id: item.id } })
  success.value = `"${item.email}" berhasil dihapus.`
  refresh()
  setTimeout(() => success.value = '', 3000)
}

function exportCSV() {
  const rows  = [['Email', 'Nama', 'Sumber', 'Tanggal'], ...items.value.map((i: any) => [i.email, i.name || '', i.source || 'website', i.created_at?.split('T')[0] || ''])]
  const csv   = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const blob  = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url   = URL.createObjectURL(blob)
  const a     = document.createElement('a')
  a.href      = url
  a.download  = `newsletter-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
