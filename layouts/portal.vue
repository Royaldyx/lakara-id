<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Mobile top bar -->
    <div class="lg:hidden fixed top-0 inset-x-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#3358ff] flex items-center justify-center">
          <UIcon name="i-tabler-layout-grid" class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-sm text-slate-900">Client Portal</span>
      </div>
      <div class="flex items-center gap-1">
        <NuxtLink to="/client/notifications" class="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <UIcon name="i-tabler-bell" class="w-5 h-5" />
          <span v-if="unread > 0" class="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ unread > 9 ? '9+' : unread }}</span>
        </NuxtLink>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
          <UIcon :name="sidebarOpen ? 'i-tabler-x' : 'i-tabler-menu-2'" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <Transition name="fade-overlay">
      <div v-if="sidebarOpen" @click="sidebarOpen = false" class="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" />
    </Transition>

    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-50 shadow-sm
                  transition-transform duration-200 -translate-x-full lg:translate-x-0"
      :class="sidebarOpen ? '!translate-x-0' : ''">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-[#3358ff] flex items-center justify-center flex-shrink-0">
          <UIcon name="i-tabler-layout-grid" class="w-5 h-5 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-bold text-sm text-slate-900 truncate">{{ user?.name || '...' }}</div>
          <span class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md leading-none"
            :class="roleBadge">{{ roleLabel }}</span>
        </div>
        <NuxtLink to="/client/notifications" class="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex-shrink-0" title="Notifikasi">
          <UIcon name="i-tabler-bell" class="w-5 h-5" />
          <span v-if="unread > 0" class="absolute top-0 right-0 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{{ unread > 9 ? '9+' : unread }}</span>
        </NuxtLink>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="sidebarOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isActive(item.to) ? 'bg-[#3358ff]/10 text-[#3358ff] font-semibold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'">
          <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1">{{ item.label }}</span>
        </NuxtLink>

        <div class="pt-4 mt-4 border-t border-slate-100">
          <button @click="doLogout" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
            <UIcon name="i-tabler-logout" class="w-4 h-4" /> Logout
          </button>
        </div>
      </nav>
    </aside>

    <!-- Main -->
    <main class="lg:ml-64 flex-1 min-w-0 min-h-screen pt-14 lg:pt-0 pb-28 lg:pb-0 overflow-x-clip">
      <slot />
    </main>

    <!-- Floating bottom nav (mobile) -->
    <div v-if="bottomNav.length" class="lg:hidden fixed inset-x-0 bottom-0 z-50 px-4 pointer-events-none"
      :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }">
      <nav class="pointer-events-auto mx-auto max-w-md bg-white/95 backdrop-blur border border-slate-100 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-stretch justify-around">
        <NuxtLink v-for="item in bottomNav" :key="item.to" :to="item.to"
          class="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl transition-colors"
          :class="isActive(item.to) ? 'text-[#3358ff]' : 'text-slate-400'">
          <UIcon :name="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-semibold leading-none">{{ item.shortLabel || item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAdmin, isSuperAdmin, isTeam, fetchMe, logout } = usePortal()
const route = useRoute()
const sidebarOpen = ref(false)
watch(() => route.path, () => { sidebarOpen.value = false })

const unread = useState<number>('portalUnread', () => 0)
let pollTimer: any = null

async function refreshUnread() {
  try {
    const r = await $fetch<any>('/api/portal/notifications', { query: { unread: '1' } })
    unread.value = r.unread || 0
  } catch { /* ignore */ }
}

onMounted(async () => {
  if (!user.value) await fetchMe()
  await refreshUnread()
  pollTimer = setInterval(refreshUnread, 30000) // poll tiap 30 detik
})
onBeforeUnmount(() => { if (pollTimer) clearInterval(pollTimer) })

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin', admin: 'Admin', client: 'Client', staff: 'Staff', freelancer: 'Freelancer',
}
const roleLabel = computed(() => ROLE_LABELS[user.value?.role || ''] || 'Client')
const roleBadge = computed(() =>
  user.value?.role === 'super_admin' ? 'bg-purple-100 text-purple-700'
  : user.value?.role === 'admin' ? 'bg-[#3358ff]/10 text-[#3358ff]'
  : user.value?.role === 'staff' ? 'bg-indigo-100 text-indigo-700'
  : user.value?.role === 'freelancer' ? 'bg-teal-100 text-teal-700'
  : 'bg-emerald-100 text-emerald-700')

const teamNav = [
  { to: '/client/tasks',         label: 'Tugas Saya',    shortLabel: 'Tugas',    icon: 'i-tabler-checklist' },
  { to: '/client/my-calendar',   label: 'Kalender',      shortLabel: 'Kalender', icon: 'i-tabler-calendar-event' },
  { to: '/client/daily-report',  label: 'Laporan Harian', shortLabel: 'Lapor',  icon: 'i-tabler-report' },
  { to: '/client/my-contract',   label: 'Kontrak',       shortLabel: 'Kontrak',  icon: 'i-tabler-file-text' },
  { to: '/client/my-payouts',    label: 'Pembayaran',    shortLabel: 'Bayar',    icon: 'i-tabler-cash' },
  { to: '/client/notifications', label: 'Notifikasi',    shortLabel: 'Notif',    icon: 'i-tabler-bell' },
]

const clientNav = [
  { to: '/client/dashboard', label: 'Dashboard', shortLabel: 'Home',     icon: 'i-tabler-home' },
  { to: '/client/briefs',    label: 'Brief',     shortLabel: 'Brief',    icon: 'i-tabler-file-text' },
  { to: '/client/calendar',  label: 'Kalender',  shortLabel: 'Kalender', icon: 'i-tabler-calendar-event' },
  { to: '/client/approvals', label: 'Approval',  shortLabel: 'Approval', icon: 'i-tabler-checkup-list' },
  { to: '/client/analytics', label: 'Analitik',  shortLabel: 'Analitik', icon: 'i-tabler-chart-bar' },
  { to: '/client/assets',    label: 'Asset',     shortLabel: 'Asset',    icon: 'i-tabler-photo' },
  { to: '/client/invoices',  label: 'Invoice',   shortLabel: 'Invoice',  icon: 'i-tabler-file-invoice' },
  { to: '/client/reports',   label: 'Laporan',   shortLabel: 'Laporan',  icon: 'i-tabler-report-analytics' },
  { to: '/client/chat',      label: 'Chat',      shortLabel: 'Chat',     icon: 'i-tabler-message-circle' },
  { to: '/client/tickets',   label: 'Tiket Support', shortLabel: 'Tiket', icon: 'i-tabler-ticket' },
  { to: '/client/knowledge-base', label: 'Bantuan', shortLabel: 'Bantuan', icon: 'i-tabler-book' },
  { to: '/client/profile',   label: 'Profil & Brand', shortLabel: 'Profil', icon: 'i-tabler-user-circle' },
]
const adminNav = computed(() => {
  const items = [
    { to: '/client/admin/dashboard', label: 'Dashboard', shortLabel: 'Home',     icon: 'i-tabler-home' },
    { to: '/client/admin/clients',   label: 'Klien',     shortLabel: 'Klien',    icon: 'i-tabler-users' },
    { to: '/client/admin/briefs',    label: 'Brief',     shortLabel: 'Brief',    icon: 'i-tabler-file-text' },
    { to: '/client/admin/calendar',  label: 'Kalender',  shortLabel: 'Konten',   icon: 'i-tabler-calendar-event' },
    { to: '/client/admin/tasks',     label: 'Tugas',     shortLabel: 'Tugas',    icon: 'i-tabler-checklist' },
    { to: '/client/admin/deadlines', label: 'Kalender Deadline', shortLabel: 'Deadline', icon: 'i-tabler-calendar-due' },
    { to: '/client/admin/team',      label: 'Tim & Freelancer', shortLabel: 'Tim', icon: 'i-tabler-users-group' },
    { to: '/client/admin/daily-reports', label: 'Laporan Harian', shortLabel: 'Lapor', icon: 'i-tabler-report' },
    { to: '/client/admin/attendance', label: 'Absensi Tim', shortLabel: 'Absensi', icon: 'i-tabler-calendar-check' },
    { to: '/client/admin/contracts', label: 'Kontrak',   shortLabel: 'Kontrak',  icon: 'i-tabler-file-text' },
    { to: '/client/admin/payouts',   label: 'Payout',    shortLabel: 'Payout',   icon: 'i-tabler-cash' },
    { to: '/client/admin/invoices',  label: 'Invoice',   shortLabel: 'Invoice',  icon: 'i-tabler-file-invoice' },
    { to: '/client/admin/reports',   label: 'Laporan',   shortLabel: 'Laporan',  icon: 'i-tabler-report-analytics' },
    { to: '/client/admin/analytics', label: 'Input Analitik', shortLabel: 'Analitik', icon: 'i-tabler-chart-bar' },
    { to: '/client/admin/chat',      label: 'Chat',      shortLabel: 'Chat',     icon: 'i-tabler-message-circle' },
    { to: '/client/admin/tickets',   label: 'Tiket',     shortLabel: 'Tiket',    icon: 'i-tabler-ticket' },
    { to: '/client/knowledge-base',  label: 'Knowledge Base', shortLabel: 'KB',  icon: 'i-tabler-book' },
  ]
  if (isSuperAdmin.value)
    items.push({ to: '/client/admin/users', label: 'User Portal', shortLabel: 'User', icon: 'i-tabler-user-shield' })
  return items
})

const navItems = computed<any[]>(() => isAdmin.value ? adminNav.value : isTeam.value ? teamNav : clientNav)
const bottomNav = computed(() => navItems.value.slice(0, 4))

const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')

async function doLogout() { await logout() }
</script>

<style scoped>
.fade-overlay-enter-active, .fade-overlay-leave-active { transition: opacity 0.2s ease; }
.fade-overlay-enter-from, .fade-overlay-leave-to { opacity: 0; }
</style>
