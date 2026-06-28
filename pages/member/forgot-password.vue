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
          <h1 class="text-2xl font-extrabold text-gray-900">Lupa Password?</h1>
          <p class="text-gray-400 text-sm mt-1">Masukkan email terdaftar untuk reset password</p>
        </div>

        <!-- Success state -->
        <div v-if="sent" class="text-center space-y-4">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <UIcon name="i-tabler-mail-check" class="w-7 h-7 text-green-600" />
          </div>
          <h2 class="font-bold text-gray-800 text-lg">Email Terkirim!</h2>
          <p class="text-gray-500 text-sm leading-relaxed">
            Jika email <strong>{{ submittedEmail }}</strong> terdaftar, kami sudah kirim link reset password.<br>
            Cek inbox (atau folder spam) kamu.
          </p>
          <p class="text-gray-400 text-xs">Link berlaku 1 jam.</p>
          <NuxtLink to="/member" class="block mt-4">
            <UButton block size="lg" variant="outline" style="border-color: #3358ff; color: #3358ff;">
              Kembali ke Login
            </UButton>
          </NuxtLink>
        </div>

        <!-- Form state -->
        <template v-else>
          <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
            <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ errorMsg }}
          </div>

          <form @submit.prevent="doSubmit" class="space-y-4">
            <UFormGroup label="Email Terdaftar">
              <UInput
                v-model="email"
                type="email"
                placeholder="email@toko.com"
                size="lg"
                autocomplete="email"
                required
                autofocus
              />
            </UFormGroup>
            <UButton type="submit" block size="lg" style="background-color: #3358ff;"
              class="font-bold" :loading="loading">
              Kirim Link Reset Password
            </UButton>
          </form>

          <div class="mt-6 text-center">
            <NuxtLink to="/member" class="text-xs text-[#3358ff] hover:underline">
              ← Kembali ke Login
            </NuxtLink>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const email          = ref('')
const submittedEmail = ref('')
const loading        = ref(false)
const errorMsg       = ref('')
const sent           = ref(false)

async function doSubmit() {
  errorMsg.value = ''
  loading.value  = true

  try {
    await $fetch('/api/member/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })
    submittedEmail.value = email.value
    sent.value = true
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || e?.statusMessage || 'Terjadi kesalahan. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
