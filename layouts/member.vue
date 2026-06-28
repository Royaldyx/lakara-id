<template>
  <div class="flex min-h-screen bg-slate-50">

    <!-- Mobile top bar -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
      <NuxtLink to="/member/profile" @click="sidebarOpen = false" class="flex items-center gap-2.5" title="Edit profil">
        <div class="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
          :style="store ? { background: store.primary_color + '20' } : { background: '#f1f5f9' }">
          <img v-if="store?.logo" :src="store.logo" class="w-full h-full object-contain" />
          <span v-else-if="store" class="font-black text-xs" :style="{ color: store.primary_color }">{{ store.name[0] }}</span>
          <div v-else class="w-4 h-4 bg-slate-200 rounded animate-pulse" />
        </div>
        <span class="font-bold text-sm text-slate-900 truncate max-w-[160px]">{{ store?.name || '...' }}</span>
      </NuxtLink>
      <button @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
        <UIcon :name="sidebarOpen ? 'i-tabler-x' : 'i-tabler-menu-2'" class="w-5 h-5" />
      </button>
    </div>

    <!-- Mobile overlay -->
    <Transition name="fade-overlay">
      <div v-if="sidebarOpen" @click="sidebarOpen = false"
        class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-50 shadow-sm
             transition-transform duration-200 ease-in-out
             -translate-x-full lg:translate-x-0"
      :class="sidebarOpen ? '!translate-x-0' : ''">

      <!-- Store branding -->
      <NuxtLink to="/member/profile" @click="sidebarOpen = false"
        class="px-5 py-4 border-b border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-colors group" title="Edit profil">
        <div class="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center"
          :style="store ? { background: store.primary_color + '15' } : {}">
          <img v-if="store?.logo" :src="store.logo" class="w-full h-full object-contain" />
          <span v-else-if="store" class="font-black text-sm" :style="{ color: store.primary_color }">
            {{ store.name[0] }}
          </span>
          <div v-else class="w-5 h-5 bg-slate-200 rounded animate-pulse" />
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <UIcon name="i-tabler-pencil" class="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div class="min-w-0">
          <div class="font-bold text-sm text-slate-900 truncate group-hover:text-[#3358ff] transition-colors">{{ store?.name || '...' }}</div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md leading-none"
              :class="{
                'bg-slate-100 text-slate-500':   tier === 'free',
                'bg-[#3358ff]/10 text-[#3358ff]': tier === 'pro',
                'bg-purple-100 text-purple-700':  tier === 'premium',
              }">
              {{ tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : 'Premium' }}
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to"
          @click="sidebarOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="[
            isActive(item.to)
              ? 'bg-[#3358ff]/10 text-[#3358ff] font-semibold'
              : (item.to === '/member/upgrade' && tier === 'free')
                ? 'text-[#3358ff] bg-[#3358ff]/5 hover:bg-[#3358ff]/10'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50',
          ]">
          <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1">{{ item.label }}</span>
          <span v-if="item.to === '/member/upgrade' && tier === 'free'"
            class="text-[10px] font-bold bg-[#3358ff] text-white px-1.5 py-0.5 rounded-md leading-none">
            PRO
          </span>
          <span v-if="item.to === '/member/upgrade' && tier === 'pro'"
            class="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-md leading-none">
            ✦
          </span>
        </NuxtLink>

        <div class="pt-4 mt-4 border-t border-slate-100 space-y-0.5">
          <a v-if="store" :href="`/${store.slug}`" target="_blank"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <UIcon name="i-tabler-external-link" class="w-4 h-4" />
            Lihat Link Bio
          </a>
          <a v-if="store" :href="`/${store.slug}/store`" target="_blank"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <UIcon name="i-tabler-shopping-bag" class="w-4 h-4" />
            Lihat Storefront
          </a>
          <NuxtLink to="/member/terms"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <UIcon name="i-tabler-file-text" class="w-4 h-4" />
            Syarat &amp; Ketentuan
          </NuxtLink>
          <button @click="doLogout"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
            <UIcon name="i-tabler-logout" class="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <!-- Bottom badge -->
      <div class="px-5 py-3 border-t border-slate-100">
        <a href="https://lakara.id" target="_blank" class="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity">
          <svg viewBox="115 87 145 120" fill="#3358ff" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
            <path d="M168.031 89.601C179.832 126.195 183.808 146.016 165.808 171.012C180.21 152.008 206.007 138.008 236.007 136.008C200.003 136.004 177.832 123.195 168.031 89.601Z"/>
            <path d="M166.625 106.68L171.574 171.016C164.304 156.875 154.832 147.875 122.832 137.543C148.832 142.875 162.96 130.68 166.625 106.68Z"/>
          </svg>
          <span class="text-xs font-semibold text-slate-500">Powered by Lakara</span>
        </a>
      </div>
    </aside>

    <!-- Main content -->
    <main class="lg:ml-64 flex-1 min-w-0 min-h-screen pt-14 lg:pt-0 pb-28 lg:pb-0 overflow-x-clip">
      <slot />
    </main>

    <!-- Bottom navigation (mobile only, floating pill — app-style) -->
    <div class="lg:hidden fixed inset-x-0 bottom-0 z-50 px-4 pointer-events-none"
      :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }">
      <nav class="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur border border-slate-100
                  rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-stretch justify-around">
        <NuxtLink v-for="item in bottomNav" :key="item.to" :to="item.to"
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-colors"
          :class="isActive(item.to) ? 'text-[#3358ff]' : 'text-slate-400'">
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-semibold leading-none">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const { storeData, logout, fetchStore } = useMember()
const route = useRoute()

const store = computed(() => storeData.value)
const sidebarOpen = ref(false)

watch(() => route.path, () => { sidebarOpen.value = false })

const navItems = [
  { to: '/member/dashboard', label: 'Dashboard',       icon: 'i-tabler-layout-dashboard' },
  { to: '/member/profile',   label: 'Edit Profil',      icon: 'i-tabler-user-edit'        },
  { to: '/member/links',     label: 'Link Bio',         icon: 'i-tabler-link'             },
  { to: '/member/analytics', label: 'Analitik',         icon: 'i-tabler-chart-arcs'       },
  { to: '/member/products',  label: 'Produk',           icon: 'i-tabler-box'              },
  { to: '/member/store',     label: 'Info Toko',        icon: 'i-tabler-building-store'   },
  { to: '/member/upgrade',   label: 'Upgrade',          icon: 'i-tabler-arrow-up-circle'  },
  { to: '/member/account',   label: 'Akun & Password', icon: 'i-tabler-user-circle'      },
]

// Tab utama untuk bottom navigation mobile (item lain via tombol "Menu")
const bottomNav = [
  { to: '/member/dashboard', label: 'Home',     icon: 'i-tabler-home'       },
  { to: '/member/links',     label: 'Link Bio',  icon: 'i-tabler-link'       },
  { to: '/member/analytics', label: 'Analitik',  icon: 'i-tabler-chart-arcs' },
  { to: '/member/products',  label: 'Produk',    icon: 'i-tabler-box'        },
]

const tier = computed(() => store.value?.product_tier || 'free')

const isActive = (to: string) => route.path.startsWith(to) || route.path === to

onMounted(async () => {
  if (!storeData.value) await fetchStore()
  if (!storeData.value) navigateTo('/member')
})

async function doLogout() {
  await logout()
}
</script>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>
