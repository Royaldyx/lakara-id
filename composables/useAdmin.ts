export const useAdmin = () => {
  const token     = useState<string>('adminToken', () => '')
  const isLoading = ref(false)
  const error     = ref('')

  // Restore token from localStorage on client
  if (process.client && !token.value) {
    token.value = localStorage.getItem('lakara_admin') || ''
  }

  const isLoggedIn = computed(() => !!token.value)

  /** Auth headers for API calls */
  const authHeaders = computed(() => ({ 'x-admin-token': token.value }))

  /** Login — POST to /api/auth */
  async function login(password: string): Promise<boolean> {
    isLoading.value = true
    error.value     = ''
    try {
      const res = await $fetch<{ ok: boolean; token: string }>('/api/auth', {
        method: 'POST',
        body:   { password },
      })
      token.value = res.token
      if (process.client) localStorage.setItem('lakara_admin', token.value)
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Username atau password salah.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    token.value = ''
    if (process.client) localStorage.removeItem('lakara_admin')
    navigateTo('/admin')
  }

  return { token, isLoggedIn, isLoading, error, login, logout, authHeaders }
}
