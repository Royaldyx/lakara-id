<template>
  <div class="bg-white min-h-screen">
    <Head>
      <Title>Syarat & Ketentuan Member — Lakara</Title>
      <Meta name="description" content="Syarat & Ketentuan penggunaan Lakara Bio & Storefront." />
    </Head>

    <section class="max-w-3xl mx-auto px-5 py-16">
      <NuxtLink to="/member" class="text-sm text-[#3358ff] font-semibold hover:underline inline-flex items-center gap-1 mb-6">
        <UIcon name="i-tabler-arrow-left" class="w-4 h-4" /> Kembali
      </NuxtLink>

      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Syarat &amp; Ketentuan Member</h1>
      <p class="text-sm text-gray-400 mb-8">
        Lakara Bio &amp; Storefront
        <span v-if="updatedAt"> · Diperbarui {{ formatDate(updatedAt) }}</span>
      </p>

      <div v-if="content" class="article-body prose max-w-none text-gray-700 leading-relaxed" v-html="content" />
      <p v-else class="text-gray-500">Syarat &amp; Ketentuan belum tersedia. Hubungi admin Lakara.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: res } = await useFetch<{ ok: boolean; content: string; updated_at: string }>('/api/terms', {
  default: () => ({ ok: false, content: '', updated_at: '' }),
})
const content   = computed(() => res.value?.content || '')
const updatedAt = computed(() => res.value?.updated_at || '')

function formatDate(val: string) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style>
.article-body h2 { @apply text-xl font-extrabold text-gray-900 mt-8 mb-3; }
.article-body h3 { @apply text-lg font-bold text-gray-800 mt-6 mb-2; }
.article-body p  { @apply mb-4 leading-relaxed; }
.article-body ul { @apply list-disc list-inside mb-4 space-y-1.5 ml-2; }
.article-body ol { @apply list-decimal list-inside mb-4 space-y-1.5 ml-2; }
.article-body li { @apply text-gray-700; }
.article-body a  { @apply text-[#3358ff] underline underline-offset-2 hover:opacity-80; }
.article-body strong { @apply font-bold text-gray-900; }
</style>
