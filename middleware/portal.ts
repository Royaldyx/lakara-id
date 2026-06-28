// Middleware portal — pastikan sudah login + RBAC akses per area.
// Dipakai per-halaman: definePageMeta({ middleware: 'portal' })
export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return // SPA only (routeRules ssr:false)

  const { user, fetchMe, homePath } = usePortal()
  if (!user.value) await fetchMe()

  // Belum login → ke login
  if (!user.value) {
    if (to.path !== '/client/login') return navigateTo('/client/login')
    return
  }

  const role = user.value.role
  const path = to.path
  const startsWith = (p: string) => path === p || path.startsWith(p + '/')

  // --- Area admin: hanya admin & super_admin ---
  if (path.startsWith('/client/admin')) {
    if (role !== 'admin' && role !== 'super_admin') return navigateTo(homePath())
    return
  }

  // --- Area team (staff/freelancer): tasks, daily report, kontrak, payout, kalender ---
  const teamPaths = ['/client/tasks', '/client/daily-report', '/client/my-calendar', '/client/my-contract', '/client/my-payouts']
  const isTeamArea = teamPaths.some(startsWith)
  if (isTeamArea) {
    if (role === 'client') return navigateTo('/client/dashboard') // klien tidak punya area team
    return // admin & team boleh
  }

  // --- Sisanya = area klien (dashboard, invoices, briefs, dll) ---
  // Staff/freelancer tidak boleh masuk area klien; kecuali halaman bersama (notifikasi).
  if (role === 'staff' || role === 'freelancer') {
    if (!startsWith('/client/notifications')) return navigateTo('/client/tasks')
  }
})
