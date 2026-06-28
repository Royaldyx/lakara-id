<template>
  <div class="min-h-screen flex items-center justify-center bg-white">
    <UContainer class="text-center py-24">
      <div class="text-8xl font-extrabold text-[#3358ff] mb-4">{{ error?.statusCode }}</div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        {{ error?.statusCode === 404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan' }}
      </h1>
      <p class="text-gray-500 mb-8">{{ error?.message || 'Halaman yang Anda cari tidak ada atau telah dipindahkan.' }}</p>
      <UButton to="/" style="background-color: #3358ff;" size="lg" class="font-semibold">
        Kembali ke Beranda
      </UButton>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } | null }>()
</script>
