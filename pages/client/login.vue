<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#3358ff] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <UIcon name="i-tabler-layout-grid" class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-2xl font-extrabold text-gray-900">Client Portal</h1>
          <p class="text-gray-400 text-sm mt-1">Masuk ke dashboard Lakara kamu</p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
          <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ error }}
        </div>

        <form @submit.prevent="doLogin" class="space-y-4">
          <UFormGroup label="Email">
            <UInput v-model="email" type="email" placeholder="email@perusahaan.com" size="lg" autocomplete="email" required autofocus />
          </UFormGroup>
          <UFormGroup label="Password">
            <UInput v-model="password" type="password" placeholder="••••••••" size="lg" autocomplete="current-password" required />
          </UFormGroup>
          <UButton type="submit" block size="lg" style="background-color: #3358ff;" class="font-bold" :loading="portal.isLoading.value">
            Masuk
          </UButton>
        </form>

        <p class="text-center text-xs text-gray-400 mt-6">
          Belum punya akses? Hubungi tim Lakara via
          <a href="https://wa.me/6285161313693" class="text-[#3358ff] hover:underline">WhatsApp</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const portal   = usePortal()
const email    = ref('')
const password = ref('')
const error    = ref('')

onMounted(async () => {
  const u = await portal.fetchMe()
  if (u) navigateTo(portal.homePath(u))
})

async function doLogin() {
  error.value = ''
  const ok = await portal.login(email.value, password.value)
  if (ok) navigateTo(portal.homePath())
  else error.value = portal.error.value
}
</script>
