const PUBLIC_PATHS = [
  '/member', '/member/',
  '/member/register',
  '/member/forgot-password',
  '/member/reset-password',
]

export default defineNuxtRouteMiddleware((to) => {
  if (PUBLIC_PATHS.includes(to.path)) return

  if (to.path.startsWith('/member')) {
    const cookie = useCookie('lakara_member')
    if (!cookie.value) return navigateTo('/member')
  }
})
