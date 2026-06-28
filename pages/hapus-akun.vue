<template>
  <div class="min-h-screen bg-slate-50">
    <section class="max-w-xl mx-auto px-5 py-16">
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-tabler-trash" class="w-7 h-7 text-red-500" />
        </div>
        <h1 class="text-2xl font-extrabold text-slate-900">Hapus Akun Lakara</h1>
        <p class="text-slate-500 text-sm mt-2 leading-relaxed">
          Ajukan penghapusan akun & data kamu dari Lakara (lakara.id). Permintaan diproses dalam maksimal 30 hari.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 class="font-bold text-slate-900 text-sm mb-3">Data yang akan dihapus</h2>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Profil & info toko (nama, logo, deskripsi, sosial media)</li>
          <li class="flex gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Link bio, produk, dan kustomisasi halaman</li>
          <li class="flex gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Statistik klik & kunjungan</li>
          <li class="flex gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Email & kredensial akun</li>
        </ul>
        <p class="text-xs text-slate-400 mt-4 leading-relaxed">
          Catatan: riwayat transaksi pembayaran dapat disimpan terbatas sesuai kewajiban hukum & akuntansi yang berlaku.
        </p>
      </div>

      <!-- Form -->
      <div v-if="!submitted" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form @submit.prevent="submit" class="space-y-4">
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ error }}
          </div>
          <UFormGroup label="Email akun kamu *">
            <UInput v-model="email" type="email" placeholder="email@toko.com" size="lg" required />
          </UFormGroup>
          <UFormGroup label="Alasan (opsional)">
            <UTextarea v-model="reason" :rows="3" placeholder="Boleh ceritakan kenapa kamu ingin menghapus akun…" />
          </UFormGroup>
          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" v-model="confirm" class="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-300 flex-shrink-0" />
            <span class="text-xs text-slate-500 leading-relaxed">
              Saya paham penghapusan ini permanen dan data tidak bisa dikembalikan.
            </span>
          </label>
          <button type="submit" :disabled="loading || !confirm"
            class="w-full py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
            <UIcon v-if="loading" name="i-tabler-loader-2" class="w-5 h-5 animate-spin" />
            {{ loading ? 'Mengirim…' : 'Ajukan Penghapusan Akun' }}
          </button>
        </form>
      </div>

      <!-- Success -->
      <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-tabler-mail-check" class="w-8 h-8 text-green-500" />
        </div>
        <h2 class="text-lg font-extrabold text-slate-900 mb-2">Permintaan Terkirim</h2>
        <p class="text-slate-500 text-sm">
          Jika email kamu terdaftar, kami akan mengirim konfirmasi dan memproses penghapusan dalam maksimal 30 hari.
        </p>
        <NuxtLink to="/" class="inline-block mt-5 text-sm font-semibold text-[#3358ff] hover:underline">← Kembali ke beranda</NuxtLink>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        Butuh bantuan? <a href="https://wa.me/6285161313693" class="text-[#3358ff] hover:underline">Hubungi via WhatsApp</a>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Hapus Akun — Lakara',
  description: 'Ajukan penghapusan akun dan data kamu dari Lakara.',
  robots: 'noindex, follow',
})

const email = ref('')
const reason = ref('')
const confirm = ref(false)
const loading = ref(false)
const error = ref('')
const submitted = ref(false)

async function submit() {
  error.value = ''
  if (!confirm.value) { error.value = 'Centang konfirmasi dulu ya.'; return }
  loading.value = true
  try {
    await $fetch('/api/public/delete-account-request', { method: 'POST', body: { email: email.value, reason: reason.value } })
    submitted.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal mengirim. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
