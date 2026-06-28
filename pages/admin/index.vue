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
          <h1 class="text-2xl font-extrabold text-gray-900">Lakara Admin</h1>
          <p class="text-gray-500 text-sm mt-1">Masuk untuk mengelola konten website</p>
        </div>

        <div v-if="admin.error.value" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
          {{ admin.error.value }}
        </div>

        <form @submit.prevent="doLogin" class="space-y-4">
          <UFormGroup label="Password">
            <UInput v-model="password" type="password" placeholder="••••••••" size="lg"
              autocomplete="current-password" required autofocus />
          </UFormGroup>
          <UButton type="submit" block size="lg" style="background-color: #3358ff;"
            class="font-bold" :loading="admin.isLoading.value">
            Masuk
          </UButton>
        </form>

        <p class="text-center text-xs text-gray-400 mt-6">
          <NuxtLink to="/" class="hover:text-[#3358ff] transition-colors">← Kembali ke lakara.id</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const admin    = useAdmin()
const password = ref('')

// Redirect if already logged in
onMounted(() => { if (admin.isLoggedIn.value) navigateTo('/admin/dashboard') })

async function doLogin() {
  const ok = await admin.login(password.value)
  if (ok) navigateTo('/admin/dashboard')
}
</script>
