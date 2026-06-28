export const useMember = () => {
  const storeData   = useState<any>('memberStore', () => null)
  const isFetching  = useState<boolean>('memberFetching', () => false)
  const isLoading   = ref(false)
  const error       = ref('')
  const errorCode   = ref('')

  const isLoggedIn = computed(() => !!useCookie('lakara_member').value)

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    error.value     = ''
    errorCode.value = ''
    try {
      const res = await $fetch<{ ok: boolean; store: any }>('/api/member/auth', {
        method: 'POST',
        body:   { email, password },
      })
      storeData.value = res.store
      return true
    } catch (e: any) {
      error.value     = e?.data?.statusMessage || 'Login gagal.'
      errorCode.value = e?.data?.data?.code || ''
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await $fetch('/api/member/logout', { method: 'POST' }).catch(() => {})
    storeData.value  = null
    isFetching.value = false
    navigateTo('/member')
  }

  /** Fetch store — guarded against concurrent calls */
  async function fetchStore() {
    if (isFetching.value) return
    isFetching.value = true
    try {
      const res = await $fetch<{ ok: boolean; data: any }>('/api/member/store')
      storeData.value = res.data
    } catch (e: any) {
      storeData.value = null
      // Session invalid — clear cookie and redirect to login once
      const code = e?.statusCode ?? e?.data?.statusCode ?? e?.status
      if (code === 401) {
        useCookie('lakara_member').value = null
        await navigateTo('/member')
      }
    } finally {
      isFetching.value = false
    }
  }

  return { storeData, isLoggedIn, isLoading, error, errorCode, login, logout, fetchStore }
}
