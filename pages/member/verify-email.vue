<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8 text-center">

        <!-- Loading -->
        <div v-if="state === 'loading'" class="py-6">
          <UIcon name="i-tabler-loader-2" class="w-10 h-10 text-[#3358ff] animate-spin mx-auto mb-4" />
          <p class="text-gray-500 text-sm">Memverifikasi email kamu…</p>
        </div>

        <!-- Success -->
        <div v-else-if="state === 'success'" class="py-2">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-tabler-circle-check" class="w-9 h-9 text-green-500" />
          </div>
          <h1 class="text-xl font-extrabold text-gray-900 mb-2">Email Terverifikasi! 🎉</h1>
          <p class="text-gray-500 text-sm mb-6">Akun kamu sudah aktif. Silakan login untuk mulai kelola toko.</p>
          <NuxtLink to="/member">
            <UButton block size="lg" style="background-color: #3358ff;" class="font-bold">Login Sekarang</UButton>
          </NuxtLink>
        </div>

        <!-- Error / expired -->
        <div v-else class="py-2">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-tabler-alert-triangle" class="w-9 h-9 text-red-500" />
          </div>
          <h1 class="text-xl font-extrabold text-gray-900 mb-2">Verifikasi Gagal</h1>
          <p class="text-gray-500 text-sm mb-5">{{ errorMsg }}</p>

          <form @submit.prevent="resend" class="space-y-3 text-left">
            <UFormGroup label="Email kamu">
              <UInput v-model="email" type="email" placeholder="email@toko.com" size="lg" required />
            </UFormGroup>
            <UButton type="submit" block size="lg" style="background-color: #3358ff;"
              class="font-bold" :loading="resending" :disabled="resent">
              {{ resent ? '✓ Link verifikasi dikirim ulang' : 'Kirim Ulang Link Verifikasi' }}
            </UButton>
          </form>
          <p v-if="resent" class="text-xs text-green-600 mt-3">Cek inbox/spam kamu untuk link verifikasi baru.</p>
          <NuxtLink to="/member" class="inline-block mt-5 text-xs text-gray-400 hover:underline">← Kembali ke login</NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const state = ref<'loading' | 'success' | 'error'>('loading')
const errorMsg = ref('Link verifikasi tidak valid atau sudah kedaluwarsa.')
const email = ref('')
const resending = ref(false)
const resent = ref(false)

onMounted(async () => {
  const token = (route.query.token || '').toString()
  if (!token) {
    state.value = 'error'
    errorMsg.value = 'Token verifikasi tidak ditemukan di link.'
    return
  }
  try {
    await $fetch('/api/member/verify-email', { query: { token } })
    state.value = 'success'
  } catch (e: any) {
    state.value = 'error'
    errorMsg.value = e?.data?.statusMessage || errorMsg.value
  }
})

async function resend() {
  if (resending.value || resent.value || !email.value) return
  resending.value = true
  try {
    await $fetch('/api/member/resend-verification', { method: 'POST', body: { email: email.value } })
    resent.value = true
  } catch { /* abaikan */ }
  finally { resending.value = false }
}
</script>
