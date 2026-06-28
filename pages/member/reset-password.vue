<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8">

        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#3358ff] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg viewBox="115 87 145 120" fill="white" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M168.031 89.601C179.832 126.195 183.808 146.016 165.808 171.012C180.21 152.008 206.007 138.008 236.007 136.008C200.003 136.004 177.832 123.195 168.031 89.601Z"/>
              <path d="M166.625 106.68L171.574 171.016C164.304 156.875 154.832 147.875 122.832 137.543C148.832 142.875 162.96 130.68 166.625 106.68Z"/>
              <path d="M172.238 171.238L260.238 184.238L172.238 171.238Z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-extrabold text-gray-900">Buat Password Baru</h1>
          <p class="text-gray-400 text-sm mt-1">Masukkan password baru untuk akunmu</p>
        </div>

        <!-- Loading / validating token -->
        <div v-if="validating" class="text-center py-6">
          <UIcon name="i-tabler-loader-2" class="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p class="text-gray-400 text-sm mt-3">Memverifikasi link…</p>
        </div>

        <!-- Token invalid / expired -->
        <div v-else-if="tokenError" class="text-center space-y-4">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <UIcon name="i-tabler-link-off" class="w-7 h-7 text-red-500" />
          </div>
          <h2 class="font-bold text-gray-800 text-lg">Link Tidak Valid</h2>
          <p class="text-gray-500 text-sm leading-relaxed">{{ tokenError }}</p>
          <NuxtLink to="/member/forgot-password">
            <UButton block size="lg" style="background-color: #3358ff;" class="font-bold mt-2">
              Kirim Link Baru
            </UButton>
          </NuxtLink>
          <NuxtLink to="/member" class="block">
            <UButton block size="lg" variant="outline" style="border-color: #3358ff; color: #3358ff;">
              Kembali ke Login
            </UButton>
          </NuxtLink>
        </div>

        <!-- Success state -->
        <div v-else-if="done" class="text-center space-y-4">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <UIcon name="i-tabler-circle-check" class="w-7 h-7 text-green-600" />
          </div>
          <h2 class="font-bold text-gray-800 text-lg">Password Berhasil Diubah!</h2>
          <p class="text-gray-500 text-sm">Silakan login dengan password baru kamu.</p>
          <NuxtLink to="/member">
            <UButton block size="lg" style="background-color: #3358ff;" class="font-bold mt-2">
              Login Sekarang
            </UButton>
          </NuxtLink>
        </div>

        <!-- Password form -->
        <template v-else>
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ errorMsg }}
          </div>

          <form @submit.prevent="doReset" class="space-y-4">
            <UFormGroup label="Password Baru">
              <UInput
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                placeholder="Minimal 6 karakter"
                size="lg"
                autocomplete="new-password"
                required
                :ui="{ trailing: { padding: { lg: 'pe-10' } } }"
              >
                <template #trailing>
                  <button type="button" @click="showPass = !showPass"
                    class="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <UIcon :name="showPass ? 'i-tabler-eye-off' : 'i-tabler-eye'" class="w-4 h-4" />
                  </button>
                </template>
              </UInput>
            </UFormGroup>
            <UFormGroup label="Konfirmasi Password">
              <UInput
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Ulangi password baru"
                size="lg"
                autocomplete="new-password"
                required
                :ui="{ trailing: { padding: { lg: 'pe-10' } } }"
              >
                <template #trailing>
                  <button type="button" @click="showConfirm = !showConfirm"
                    class="text-gray-400 hover:text-gray-600 focus:outline-none">
                    <UIcon :name="showConfirm ? 'i-tabler-eye-off' : 'i-tabler-eye'" class="w-4 h-4" />
                  </button>
                </template>
              </UInput>
            </UFormGroup>
            <UButton type="submit" block size="lg" style="background-color: #3358ff;"
              class="font-bold" :loading="loading">
              Simpan Password Baru
            </UButton>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route          = useRoute()
const token          = computed(() => (route.query.token as string) || '')

const validating     = ref(true)
const tokenError     = ref('')
const password       = ref('')
const confirmPassword = ref('')
const showPass       = ref(false)
const showConfirm    = ref(false)
const loading        = ref(false)
const errorMsg       = ref('')
const done           = ref(false)

// Validate token on mount
onMounted(async () => {
  if (!token.value) {
    tokenError.value = 'Link reset password tidak valid.'
    validating.value = false
    return
  }
  try {
    await $fetch('/api/member/validate-reset-token', {
      query: { token: token.value },
    })
    validating.value = false
  } catch (e: any) {
    tokenError.value = e?.data?.statusMessage || e?.statusMessage || 'Link tidak valid atau sudah kedaluwarsa.'
    validating.value = false
  }
})

async function doReset() {
  errorMsg.value = ''

  if (password.value.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Konfirmasi password tidak cocok.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/member/reset-password', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    done.value = true
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || 'Terjadi kesalahan. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
