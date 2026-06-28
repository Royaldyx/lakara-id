export type PortalRole = 'super_admin' | 'admin' | 'client' | 'staff' | 'freelancer'

export interface PortalUser {
  id: string
  role: PortalRole
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  client_id?: string | null
}

export const usePortal = () => {
  const user      = useState<PortalUser | null>('portalUser', () => null)
  const fetching  = useState<boolean>('portalFetching', () => false)
  const isLoading = ref(false)
  const error     = ref('')

  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin')
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin')
  const isClient = computed(() => user.value?.role === 'client')
  const isTeam = computed(() => user.value?.role === 'staff' || user.value?.role === 'freelancer')

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value = ''
    try {
      const res = await $fetch<{ ok: boolean; user: PortalUser }>('/api/portal/auth/login', {
        method: 'POST', body: { email, password },
      })
      user.value = res.user
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Login gagal.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** Ambil user dari session. Return null jika belum login. */
  async function fetchMe(): Promise<PortalUser | null> {
    if (fetching.value) return user.value
    fetching.value = true
    try {
      const res = await $fetch<{ ok: boolean; user: PortalUser }>('/api/portal/auth/me')
      user.value = res.user
    } catch {
      user.value = null
    } finally {
      fetching.value = false
    }
    return user.value
  }

  async function logout() {
    await $fetch('/api/portal/auth/logout', { method: 'POST' }).catch(() => {})
    user.value = null
    await navigateTo('/client/login')
  }

  /** Landing path sesuai role */
  function homePath(u: PortalUser | null = user.value): string {
    if (!u) return '/client/login'
    if (u.role === 'client') return '/client/dashboard'
    if (u.role === 'staff' || u.role === 'freelancer') return '/client/tasks'
    return '/client/admin/dashboard'
  }

  return { user, isLoading, error, isAdmin, isSuperAdmin, isClient, isTeam, login, fetchMe, logout, homePath }
}
