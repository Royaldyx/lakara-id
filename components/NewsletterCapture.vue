<template>
  <div class="bg-gradient-to-br from-[#3358ff] to-indigo-600 rounded-3xl p-8 text-white">
    <div class="flex flex-col md:flex-row md:items-center gap-6">
      <div class="flex-1">
        <div class="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
          <UIcon name="i-tabler-mail" class="w-3.5 h-3.5" /> Newsletter Lakara
        </div>
        <h3 class="text-xl md:text-2xl font-extrabold mb-2">Tips & Update Terbaru dari Lakara</h3>
        <p class="text-blue-100 text-sm leading-relaxed">
          Dapatkan insight digital marketing, web dev tips, dan berita esports langsung di inbox kamu. Gratis, no spam.
        </p>
      </div>

      <!-- Form -->
      <div class="md:w-72 flex-shrink-0">
        <div v-if="success" class="bg-white/20 rounded-2xl p-4 text-center">
          <UIcon name="i-tabler-circle-check" class="w-8 h-8 text-white mx-auto mb-2" />
          <p class="font-semibold text-white text-sm">{{ success }}</p>
          <p class="text-blue-200 text-xs mt-1">Terima kasih sudah subscribe!</p>
        </div>
        <form v-else @submit.prevent="subscribe" class="space-y-3">
          <UInput
            v-model="email"
            type="email"
            placeholder="email@kamu.com"
            size="lg"
            required
            class="bg-white/10 border-white/20 text-white placeholder-blue-200"
          />
          <div v-if="error" class="text-red-300 text-xs">{{ error }}</div>
          <UButton
            type="submit"
            block
            size="lg"
            class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold shadow-xl"
            :loading="loading"
          >
            Subscribe Gratis
          </UButton>
          <p class="text-blue-300 text-xs text-center">Unsubscribe kapan saja · No spam</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ source?: string }>()

const email   = ref('')
const loading = ref(false)
const success = ref('')
const error   = ref('')

async function subscribe() {
  error.value   = ''
  loading.value = true
  try {
    const res = await $fetch<{ ok: boolean; message: string }>('/api/newsletter', {
      method: 'POST',
      body: { email: email.value, source: props.source || 'website' },
    })
    success.value = res.message || 'Berhasil subscribe!'
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal subscribe. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
