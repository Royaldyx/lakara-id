<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-[#3358ff] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <svg viewBox="115 87 145 120" fill="#ffffff" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
              <path d="M 168.03125 89.601562 C 179.832031 126.195312 185.574219 156.828125 174.195312 170.609375 C 174.195312 170.609375 235.757812 166.730469 243.664062 165.550781 C 251.570312 164.371094 203.644531 111.382812 168.03125 89.601562 Z"/>
              <path d="M 166.625 106.679688 L 171.574219 171.015625 C 171.574219 171.015625 140.480469 174.472656 132.320312 174.683594 C 124.164062 174.898438 139.582031 132.570312 166.625 106.679688 Z"/>
              <path d="M 122.691406 184.9375 C 125.238281 181.21875 258.019531 171.128906 258.019531 171.128906 C 259.707031 175.128906 243.644531 208.125 233.097656 198.046875 C 204.292969 167.339844 232.164062 199.910156 211.980469 200.652344 C 188.996094 201.496094 131.871094 202.660156 120.625 203.046875 C 115.921875 203.207031 120.050781 188.808594 122.695312 184.9375 Z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-extrabold text-gray-900">Daftar Member Portal</h1>
          <p class="text-gray-400 text-sm mt-1">Daftar gratis — cukup verifikasi email.</p>
        </div>

        <!-- Success state -->
        <div v-if="submitted" class="text-center py-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-tabler-mail-check" class="w-8 h-8 text-[#3358ff]" />
          </div>
          <h2 class="text-xl font-extrabold text-gray-900 mb-2">Cek Email Kamu!</h2>
          <p class="text-gray-500 text-sm mb-2">
            Kami sudah mengirim link verifikasi ke
            <strong class="text-gray-700">{{ form.email }}</strong>.
            Klik link itu untuk mengaktifkan akun, lalu login.
          </p>
          <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-left flex items-start gap-2.5">
            <UIcon name="i-tabler-info-circle" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p class="text-xs text-amber-800 leading-relaxed">
              Email tidak masuk dalam beberapa menit? <strong>Cek folder Spam / Promosi</strong> di emailmu, atau klik "Kirim ulang" di bawah.
            </p>
          </div>

          <div class="space-y-2.5">
            <NuxtLink to="/member">
              <UButton block size="lg" style="background-color: #3358ff;" class="font-bold">
                Ke Halaman Login
              </UButton>
            </NuxtLink>
            <button @click="resend" :disabled="resending || resent"
              class="w-full text-sm font-semibold text-[#3358ff] hover:underline disabled:opacity-50 disabled:no-underline py-1">
              {{ resent ? '✓ Link verifikasi dikirim ulang' : resending ? 'Mengirim…' : 'Kirim ulang email verifikasi' }}
            </button>
          </div>
        </div>

        <form v-else @submit.prevent="doRegister" class="space-y-4">
          <!-- Banner referral -->
          <div v-if="refCode" class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <UIcon name="i-tabler-gift" class="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p class="text-xs text-emerald-700">Kamu diundang oleh <strong>@{{ refCode }}</strong>. Kalian berdua dapat <strong>+1 bulan Pro gratis</strong> setelah upgrade pertamamu! 🎉</p>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
            {{ error }}
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <UFormGroup label="Nama Lengkap *">
              <UInput v-model="form.name" placeholder="John Doe" required autofocus />
            </UFormGroup>
            <UFormGroup label="Email *">
              <UInput v-model="form.email" type="email" placeholder="john@toko.com" required />
            </UFormGroup>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <UFormGroup label="Password *">
              <UInput v-model="form.password" type="password" placeholder="Min. 6 karakter" required />
            </UFormGroup>
            <UFormGroup label="Konfirmasi Password *">
              <UInput v-model="form.confirm" type="password" placeholder="Ulangi password" required />
            </UFormGroup>
          </div>

          <div class="border-t border-gray-100 pt-4">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Info Halaman</p>
          </div>

          <UFormGroup label="Nama Halaman / Brand *">
            <UInput v-model="form.store_name" placeholder="Nama kamu / brand / toko" required />
            <template #hint>
              <span class="text-xs text-gray-400">Bisa nama creator, brand, atau toko — tampil di link bio kamu.</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Username / URL *">
            <div class="flex">
              <span class="border border-r-0 border-gray-300 bg-gray-50 px-3 py-2.5 text-gray-400 text-sm rounded-l-md whitespace-nowrap">lakara.id/</span>
              <UInput v-model="form.store_slug" @input="slugManual = true"
                placeholder="namakamu" class="rounded-l-none flex-1 font-mono" required />
            </div>
            <template #hint>
              <span class="text-xs text-gray-400">Alamat link bio kamu. Tidak bisa diubah setelah daftar.</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Deskripsi Singkat (opsional)">
            <UTextarea v-model="form.description" :rows="2" placeholder="Creator gaming & esports · host & caster..." />
          </UFormGroup>

          <UFormGroup label="Pesan untuk Tim Lakara (opsional)">
            <UTextarea v-model="form.message" :rows="2" placeholder="Cerita singkat tentang bisnis kamu, atau pertanyaan yang ingin kamu tanyakan..." />
          </UFormGroup>

          <label class="flex items-start gap-2.5 cursor-pointer select-none">
            <input type="checkbox" v-model="agree" class="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#3358ff] focus:ring-[#3358ff]/30 flex-shrink-0" />
            <span class="text-xs text-gray-500 leading-relaxed">
              Saya sudah membaca dan setuju dengan
              <NuxtLink to="/member/terms" target="_blank" class="text-[#3358ff] font-semibold hover:underline">Syarat &amp; Ketentuan</NuxtLink>
              Lakara Bio &amp; Storefront.
            </span>
          </label>

          <UButton type="submit" block size="lg" style="background-color: #3358ff;"
            class="font-bold" :loading="loading" :disabled="!agree">
            Daftar Sekarang
          </UButton>

          <p class="text-center text-xs text-gray-400">
            Sudah punya akun?
            <NuxtLink to="/member" class="text-[#3358ff] hover:underline font-semibold">Login</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({
  name: '', email: '', password: '', confirm: '',
  store_name: '', store_slug: '', description: '', message: '',
})
const loading   = ref(false)
const error     = ref('')
const submitted = ref(false)
const agree     = ref(false)
const resending = ref(false)
const resent    = ref(false)

// Referral: ambil ?ref=slug dari URL undangan
const route   = useRoute()
const refCode = ref((route.query.ref || '').toString().trim().toLowerCase())

async function resend() {
  if (resending.value || resent.value) return
  resending.value = true
  try {
    await $fetch('/api/member/resend-verification', { method: 'POST', body: { email: form.email } })
    resent.value = true
  } catch { /* abaikan */ }
  finally { resending.value = false }
}

async function doRegister() {
  error.value = ''
  if (!agree.value)                   { error.value = 'Kamu harus menyetujui Syarat & Ketentuan dulu.'; return }
  if (form.password !== form.confirm) { error.value = 'Password dan konfirmasi tidak sama.'; return }
  if (form.password.length < 6)       { error.value = 'Password minimal 6 karakter.'; return }
  if (!form.store_slug)               { error.value = 'URL toko wajib diisi.'; return }

  loading.value = true
  try {
    await $fetch('/api/member/register', {
      method: 'POST',
      body: {
        name:        form.name,
        email:       form.email,
        password:    form.password,
        store_name:  form.store_name,
        store_slug:  form.store_slug,
        description: form.description,
        message:     form.message,
        ref:         refCode.value,
      },
    })
    submitted.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Pendaftaran gagal. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
