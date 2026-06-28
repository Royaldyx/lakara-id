<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-xl">
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900">Akun & Password</h1>
      <p class="text-slate-500 text-sm mt-0.5">Ganti foto profil & password login kamu.</p>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ error }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mb-5">
      <div class="flex items-center justify-between">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Foto Profil</p>
        <NuxtLink to="/member/profile" class="text-xs text-[#3358ff] font-semibold hover:underline flex items-center gap-1">
          Edit Profil <UIcon name="i-tabler-arrow-right" class="w-3.5 h-3.5" />
        </NuxtLink>
      </div>
      <ProfilePhotoUploader />
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Info Akun</p>
      <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3">
        <UIcon name="i-tabler-mail" class="w-4 h-4 text-slate-400" />
        <span class="text-sm text-slate-700 font-medium">{{ store?.member_email || '—' }}</span>
        <span class="ml-auto text-xs text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">Email login</span>
      </div>
      <p class="text-xs text-slate-400">Email tidak bisa diubah sendiri. Hubungi admin Lakara jika perlu ganti email.</p>
    </div>

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 mt-5">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Ganti Password</p>
      <UFormGroup label="Password Saat Ini">
        <UInput v-model="form.current" type="password" placeholder="••••••••" autocomplete="current-password" />
      </UFormGroup>
      <UFormGroup label="Password Baru">
        <UInput v-model="form.newPass" type="password" placeholder="Min. 6 karakter" autocomplete="new-password" />
      </UFormGroup>
      <UFormGroup label="Konfirmasi Password Baru">
        <UInput v-model="form.confirm" type="password" placeholder="Ulangi password baru" autocomplete="new-password" />
      </UFormGroup>
      <UButton @click="changePassword" style="background-color: #3358ff;" class="font-bold" :loading="saving">
        🔒 Ganti Password
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store = computed(() => storeData.value)

const form    = reactive({ current: '', newPass: '', confirm: '' })
const saving  = ref(false)
const success = ref('')
const error   = ref('')

onMounted(async () => { if (!store.value) await fetchStore() })

async function changePassword() {
  error.value   = ''
  success.value = ''
  if (!form.current || !form.newPass || !form.confirm) { error.value = 'Semua field wajib diisi.'; return }
  if (form.newPass !== form.confirm) { error.value = 'Password baru dan konfirmasi tidak sama.'; return }
  if (form.newPass.length < 6) { error.value = 'Password baru minimal 6 karakter.'; return }

  saving.value = true
  try {
    await $fetch('/api/member/password', {
      method: 'POST',
      body: { current_password: form.current, new_password: form.newPass },
    })
    success.value = 'Password berhasil diubah!'
    form.current  = ''
    form.newPass  = ''
    form.confirm  = ''
    setTimeout(() => success.value = '', 4000)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Gagal mengubah password.'
  } finally {
    saving.value = false
  }
}
</script>
