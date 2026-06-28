<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Syarat &amp; Ketentuan Member</h1>
      <p class="text-slate-500 text-sm mt-0.5">Terms untuk Lakara Bio &amp; Storefront. Tampil di /member/terms &amp; saat pendaftaran.</p>
    </div>

    <div v-if="saved" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> Tersimpan!
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Konten (HTML)</p>
        <button @click="showPreview = !showPreview" type="button" class="text-xs font-semibold text-[#3358ff] hover:underline">
          {{ showPreview ? 'Edit' : 'Preview' }}
        </button>
      </div>

      <textarea v-if="!showPreview" v-model="content" rows="22"
        class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30 focus:border-[#3358ff]"
        placeholder="<h2>1. Tentang Layanan</h2><p>...</p>" />

      <div v-else class="article-body prose max-w-none border border-slate-100 rounded-xl p-5 text-gray-700" v-html="content || '<p class=&quot;text-slate-400&quot;>Belum ada konten.</p>'" />

      <p class="text-xs text-slate-400">Pakai tag HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;a href='...'&gt;.</p>

      <UButton @click="save" :loading="saving" style="background-color: #3358ff;" class="font-bold">
        💾 Simpan Terms
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()
const content     = ref('')
const showPreview = ref(false)
const saving      = ref(false)
const saved       = ref(false)

const { data: res } = await useFetch<{ ok: boolean; content: string }>('/api/terms', {
  default: () => ({ ok: false, content: '' }),
})
onMounted(() => { content.value = res.value?.content || '' })

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/terms', { method: 'POST', headers: authHeaders.value, body: { content: content.value } })
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}
</script>

<style>
.article-body h2 { @apply text-xl font-extrabold text-gray-900 mt-6 mb-3; }
.article-body h3 { @apply text-lg font-bold text-gray-800 mt-5 mb-2; }
.article-body p  { @apply mb-3 leading-relaxed; }
.article-body ul { @apply list-disc list-inside mb-3 space-y-1 ml-2; }
.article-body a  { @apply text-[#3358ff] underline; }
.article-body strong { @apply font-bold text-gray-900; }
</style>
