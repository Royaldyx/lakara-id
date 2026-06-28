export default defineNuxtRouteMiddleware((to) => {
  // Skip cek auth di halaman login itu sendiri
  if (to.path === '/admin' || to.path === '/admin/') return

  if (to.path.startsWith('/admin')) {
    const cookie = useCookie('lakara_admin')

    // Cek cookie (server & client) ATAU localStorage (client fallback)
    const hasAccess = cookie.value ||
      (process.client && !!localStorage.getItem('lakara_admin'))

    if (!hasAccess) {
      return navigateTo('/admin')
    }
  }
})
