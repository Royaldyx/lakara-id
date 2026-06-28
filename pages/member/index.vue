<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo Lakara -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#3358ff] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg viewBox="115 87 145 120" fill="white" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
              <path d="M168.031 89.601C179.832 126.195 183.808 146.016 165.808 171.012C180.21 152.008 206.007 138.008 236.007 136.008C200.003 136.004 177.832 123.195 168.031 89.601Z"/>
              <path d="M166.625 106.68L171.574 171.016C164.304 156.875 154.832 147.875 122.832 137.543C148.832 142.875 162.96 130.68 166.625 106.68Z"/>
              <path d="M172.238 171.238L260.238 184.238L172.238 171.238Z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-extrabold text-gray-900">Member Portal</h1>
          <p class="text-gray-400 text-sm mt-1">Login untuk kelola toko kamu</p>
        </div>

        <div v-if="member.error.value && member.errorCode.value !== 'EMAIL_NOT_VERIFIED'"
          class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ member.error.value }}
        </div>

        <!-- Email belum diverifikasi -->
        <div v-if="member.errorCode.value === 'EMAIL_NOT_VERIFIED'"
          class="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 mb-5 space-y-2">
          <div class="flex items-start gap-2">
            <UIcon name="i-tabler-mail-exclamation" class="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Email kamu belum diverifikasi. Cek inbox/spam, atau kirim ulang link verifikasi.</span>
          </div>
          <button @click="resendVerif" :disabled="resending || resent"
            class="text-sm font-bold text-amber-900 hover:underline disabled:opacity-50 disabled:no-underline">
            {{ resent ? '✓ Link verifikasi dikirim ulang' : resending ? 'Mengirim…' : 'Kirim ulang link verifikasi' }}
          </button>
        </div>

        <form @submit.prevent="doLogin" class="space-y-4">
          <UFormGroup label="Email">
            <UInput v-model="email" type="email" placeholder="email@toko.com" size="lg"
              autocomplete="email" required autofocus />
          </UFormGroup>
          <UFormGroup label="Password">
            <UInput v-model="password" type="password" placeholder="••••••••" size="lg"
              autocomplete="current-password" required />
          </UFormGroup>
          <UButton type="submit" block size="lg" style="background-color: #3358ff;"
            class="font-bold" :loading="member.isLoading.value">
            Masuk
          </UButton>
        </form>

        <div class="mt-6 space-y-2 text-center">
          <p class="text-xs text-gray-400">
            Belum punya akun?
            <NuxtLink to="/member/register" class="text-[#3358ff] hover:underline font-semibold">Daftar di sini</NuxtLink>
          </p>
          <p class="text-xs text-gray-400">
            <NuxtLink to="/member/forgot-password" class="text-[#3358ff] hover:underline">Lupa password?</NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const member   = useMember()
const email    = ref('')
const password = ref('')
const resending = ref(false)
const resent    = ref(false)

onMounted(() => {
  if (member.isLoggedIn.value) navigateTo('/member/dashboard')
})

async function doLogin() {
  resent.value = false
  const ok = await member.login(email.value, password.value)
  if (ok) navigateTo('/member/dashboard')
}

async function resendVerif() {
  if (resending.value || resent.value) return
  resending.value = true
  try {
    await $fetch('/api/member/resend-verification', { method: 'POST', body: { email: email.value } })
    resent.value = true
  } catch { /* abaikan */ }
  finally { resending.value = false }
}
</script>
