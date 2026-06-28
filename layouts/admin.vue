<template>
  <div class="flex min-h-screen bg-slate-100">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-30 select-none overflow-y-auto">
      <div class="px-5 py-4 border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        <div class="w-8 h-8 bg-[#3358ff] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg viewBox="115 87 145 120" fill="white" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M168.031 89.601C179.832 126.195 183.808 146.016 165.808 171.012C180.21 152.008 206.007 138.008 236.007 136.008C200.003 136.004 177.832 123.195 168.031 89.601Z"/>
            <path d="M166.625 106.68L171.574 171.016C164.304 156.875 154.832 147.875 122.832 137.543C148.832 142.875 162.96 130.68 166.625 106.68Z"/>
            <path d="M172.238 171.238L260.238 184.238L172.238 171.238Z"/>
          </svg>
        </div>
        <div>
          <div class="text-white font-bold text-sm leading-tight">Lakara Admin</div>
          <div class="text-slate-500 text-xs">Content Manager</div>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4">

        <!-- Content -->
        <p class="text-slate-600 text-xs uppercase tracking-widest font-semibold px-3 mb-2">Konten</p>
        <div class="space-y-0.5 mb-4">
          <NuxtLink v-for="item in contentNav" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isActive(item.to) ? 'text-white bg-[#3358ff]/20 border-l-[3px] border-[#3358ff] pl-[9px]' : 'text-slate-400 hover:text-white hover:bg-white/10'"
          >
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </div>

        <!-- Website -->
        <p class="text-slate-600 text-xs uppercase tracking-widest font-semibold px-3 mb-2">Website</p>
        <div class="space-y-0.5 mb-4">
          <NuxtLink v-for="item in websiteNav" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isActive(item.to) ? 'text-white bg-[#3358ff]/20 border-l-[3px] border-[#3358ff] pl-[9px]' : 'text-slate-400 hover:text-white hover:bg-white/10'"
          >
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
            {{ item.label }}
          </NuxtLink>
        </div>

        <!-- System -->
        <p class="text-slate-600 text-xs uppercase tracking-widest font-semibold px-3 mb-2">Sistem</p>
        <div class="space-y-0.5">
          <NuxtLink v-for="item in systemNav" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isActive(item.to) ? 'text-white bg-[#3358ff]/20 border-l-[3px] border-[#3358ff] pl-[9px]' : 'text-slate-400 hover:text-white hover:bg-white/10'"
          >
            <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
            {{ item.label }}
          </NuxtLink>
          <!-- Upgrade History -->
          <NuxtLink to="/admin/upgrade-requests"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            :class="isActive('/admin/upgrade-requests') ? 'text-white bg-[#3358ff]/20 border-l-[3px] border-[#3358ff] pl-[9px]' : 'text-slate-400 hover:text-white hover:bg-white/10'"
          >
            <UIcon name="i-tabler-crown" class="w-4 h-4 flex-shrink-0" />
            Upgrade History
          </NuxtLink>
        </div>

        <div class="pt-4 mt-4 border-t border-white/10 space-y-0.5">
          <a href="/" target="_blank"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
            <UIcon name="i-tabler-external-link" class="w-4 h-4 flex-shrink-0" />
            Lihat Website
          </a>
          <button @click="logout"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm font-medium">
            <UIcon name="i-tabler-logout" class="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        </div>
      </nav>
    </aside>

    <main class="ml-60 flex-1 min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { logout, isLoggedIn, authHeaders } = useAdmin()
const route = useRoute()

const contentNav = [
  { to: '/admin/dashboard', label: 'Dashboard',      icon: 'i-tabler-layout-dashboard' },
  { to: '/admin/stores',    label: 'Toko Klien',     icon: 'i-tabler-building-store' },
  { to: '/admin/portfolio', label: 'Portofolio',     icon: 'i-tabler-briefcase' },
  { to: '/admin/artikel',   label: 'Artikel',        icon: 'i-tabler-article' },
]

const websiteNav = [
  { to: '/admin/testimoni',   label: 'Testimoni',    icon: 'i-tabler-quote' },
  { to: '/admin/faq',         label: 'FAQ',           icon: 'i-tabler-help-circle' },
  { to: '/admin/seo',         label: 'SEO Settings',  icon: 'i-tabler-search' },
]

const systemNav = [
  { to: '/admin/members',     label: 'Member Portal',  icon: 'i-tabler-users' },
  { to: '/admin/newsletter',  label: 'Newsletter',     icon: 'i-tabler-mail' },
  { to: '/admin/uploads',     label: 'Foto Upload',    icon: 'i-tabler-photo' },
  { to: '/admin/terms',       label: 'Terms Member',   icon: 'i-tabler-file-text' },
  { to: '/admin/settings',    label: 'Global Settings', icon: 'i-tabler-settings' },
]

const isActive = (to: string) => route.path.startsWith(to + '/') || route.path === to

onMounted(() => {
  if (!isLoggedIn.value) navigateTo('/admin')
})
</script>
