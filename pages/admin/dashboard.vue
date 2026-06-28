<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Dashboard</h1>
        <p class="text-slate-500 text-sm mt-0.5">Selamat datang kembali 👋</p>
      </div>
      <a href="/" target="_blank" class="flex items-center gap-2 text-sm text-[#3358ff] hover:opacity-80 font-medium">
        <UIcon name="i-tabler-external-link" class="w-4 h-4" />
        Lihat Website
      </a>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.bg">
            <UIcon :name="stat.icon" class="w-5 h-5" :class="stat.color" />
          </div>
        </div>
        <div class="text-3xl font-extrabold mb-1" :class="stat.color">{{ stat.value }}</div>
        <div class="text-sm text-slate-500">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <!-- Portofolio -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UIcon name="i-tabler-briefcase" class="w-5 h-5 text-[#3358ff]" /> Portofolio
        </h3>
        <div class="space-y-3">
          <NuxtLink to="/admin/portfolio/edit?action=add"
            class="flex items-center gap-3 p-3.5 bg-[#3358ff]/5 rounded-xl border border-[#3358ff]/15 hover:bg-[#3358ff]/10 transition-colors">
            <div class="w-9 h-9 bg-[#3358ff] rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-plus" class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Tambah Portofolio</div>
              <div class="text-xs text-slate-500">Tambah proyek baru</div>
            </div>
          </NuxtLink>
          <NuxtLink to="/admin/portfolio"
            class="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
            <div class="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-list" class="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Kelola Portofolio</div>
              <div class="text-xs text-slate-500">{{ portfolio.length }} item</div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Artikel -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UIcon name="i-tabler-article" class="w-5 h-5 text-[#3358ff]" /> Artikel
        </h3>
        <div class="space-y-3">
          <NuxtLink to="/admin/artikel/edit?action=add"
            class="flex items-center gap-3 p-3.5 bg-[#3358ff]/5 rounded-xl border border-[#3358ff]/15 hover:bg-[#3358ff]/10 transition-colors">
            <div class="w-9 h-9 bg-[#3358ff] rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-pencil-plus" class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Tulis Artikel Baru</div>
              <div class="text-xs text-slate-500">Blog post, tutorial, tips</div>
            </div>
          </NuxtLink>
          <NuxtLink to="/admin/artikel"
            class="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100">
            <div class="w-9 h-9 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-list" class="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Kelola Artikel</div>
              <div class="text-xs text-slate-500">{{ artikel.length }} artikel</div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- SEO -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UIcon name="i-tabler-search" class="w-5 h-5 text-[#3358ff]" /> SEO
        </h3>
        <div class="space-y-3">
          <NuxtLink to="/admin/seo"
            class="flex items-center gap-3 p-3.5 bg-[#3358ff]/5 rounded-xl border border-[#3358ff]/15 hover:bg-[#3358ff]/10 transition-colors">
            <div class="w-9 h-9 bg-[#3358ff] rounded-xl flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-pencil" class="w-5 h-5 text-white" />
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">Edit SEO Settings</div>
              <div class="text-xs text-slate-500">Title, description, og:image</div>
            </div>
          </NuxtLink>
          <div class="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <UIcon name="i-tabler-alert-triangle" class="w-4 h-4 flex-shrink-0 mt-0.5" />
            Perubahan SEO halaman statis aktif setelah rebuild & upload.
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Requests Banner (only if there are pending) -->
    <div v-if="pendingUpgrades.length"
      class="mb-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-5 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-tabler-crown" class="w-5 h-5 text-white" />
        </div>
        <div>
          <p class="text-white font-extrabold">{{ pendingUpgrades.length }} Request Upgrade Pending</p>
          <p class="text-amber-100 text-sm">Member menunggu aktivasi tier Pro</p>
        </div>
      </div>
      <NuxtLink to="/admin/upgrade-requests"
        class="bg-white text-amber-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-50 transition flex-shrink-0">
        Proses Sekarang →
      </NuxtLink>
    </div>

    <!-- Recent: Portofolio + Artikel side by side -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Recent Portfolio -->
      <div v-if="portfolio.length" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-900">Portofolio Terbaru</h3>
          <NuxtLink to="/admin/portfolio" class="text-xs text-[#3358ff] hover:underline">Lihat semua →</NuxtLink>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="item in portfolio.slice(0, 5)" :key="item.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
            <div class="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
              <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-briefcase" class="w-4 h-4 text-slate-300" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-900 truncate">{{ item.title }}</div>
              <div class="text-xs text-slate-400">{{ item.category }}</div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              :class="item.published !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
              {{ item.published !== false ? 'Publik' : 'Draft' }}
            </span>
            <NuxtLink :to="'/admin/portfolio/edit?action=edit&id=' + item.id"
              class="text-xs text-[#3358ff] hover:underline flex-shrink-0">Edit</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Recent Artikel -->
      <div v-if="artikel.length" class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-900">Artikel Terbaru</h3>
          <NuxtLink to="/admin/artikel" class="text-xs text-[#3358ff] hover:underline">Lihat semua →</NuxtLink>
        </div>
        <div class="divide-y divide-slate-50">
          <div v-for="item in artikel.slice(0, 5)" :key="item.id"
            class="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
            <div class="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-blue-50">
              <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <UIcon name="i-tabler-article" class="w-4 h-4 text-[#3358ff]" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-900 truncate">{{ item.title }}</div>
              <div class="text-xs text-slate-400">{{ item.category }}</div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
              :class="item.published !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
              {{ item.published !== false ? 'Publik' : 'Draft' }}
            </span>
            <NuxtLink :to="'/admin/artikel/edit?action=edit&id=' + item.id"
              class="text-xs text-[#3358ff] hover:underline flex-shrink-0">Edit</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty artikel placeholder -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 flex flex-col items-center justify-center text-center">
        <UIcon name="i-tabler-article" class="w-12 h-12 text-slate-200 mb-3" />
        <p class="text-sm text-slate-500 mb-4">Belum ada artikel. Mulai tulis sekarang!</p>
        <NuxtLink to="/admin/artikel/edit?action=add"
          class="text-sm bg-[#3358ff] text-white font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition">
          + Tulis Artikel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()

const { data: portfolioRes } = await useFetch('/api/admin/portfolio', {
  headers: authHeaders.value, server: false, default: () => [],
})
const { data: artikelRes } = await useFetch('/api/admin/artikel', {
  headers: authHeaders.value, server: false, default: () => [],
})
const { data: upgradeRes } = await useFetch<{ ok: boolean; data: any[] }>('/api/admin/upgrade-requests', {
  headers: authHeaders.value, server: false, default: () => ({ ok: false, data: [] }),
})

const portfolio      = computed(() => [...((portfolioRes.value ?? []) as any[])].reverse())
const artikel        = computed(() => [...((artikelRes.value ?? []) as any[])].reverse())
const pendingUpgrades = computed(() => (upgradeRes.value?.data ?? []).filter((r: any) => r.status === 'pending'))

const stats = computed(() => [
  { label: 'Total Portofolio',   value: portfolio.value.length,                                             color: 'text-[#3358ff]', bg: 'bg-blue-50',   icon: 'i-tabler-briefcase' },
  { label: 'Total Artikel',      value: artikel.value.length,                                               color: 'text-purple-500', bg: 'bg-purple-50', icon: 'i-tabler-article' },
  { label: 'Konten Dipublish',   value: portfolio.value.filter((i: any) => i.published !== false).length + artikel.value.filter((i: any) => i.published !== false).length, color: 'text-green-500', bg: 'bg-green-50', icon: 'i-tabler-check' },
  { label: 'Upgrade Pending',    value: pendingUpgrades.value.length,                                       color: 'text-amber-500',  bg: 'bg-amber-50',  icon: 'i-tabler-crown' },
])
</script>
