<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Klien</h1>
        <p class="text-slate-500 text-sm mt-0.5">Kelola seluruh klien agency.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Klien
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else-if="!clients.length" class="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
      <UIcon name="i-tabler-users-group" class="w-10 h-10 mx-auto mb-2" />
      <p class="text-sm">Belum ada klien. Klik "Tambah Klien".</p>
    </div>

    <div v-else class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-left font-semibold px-4 py-3">Perusahaan</th>
              <th class="text-left font-semibold px-4 py-3">PIC</th>
              <th class="text-left font-semibold px-4 py-3">Paket</th>
              <th class="text-left font-semibold px-4 py-3">Login</th>
              <th class="text-left font-semibold px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="c in clients" :key="c.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3">
                <div class="font-semibold text-slate-900">{{ c.company_name }}</div>
                <div class="text-xs text-slate-400">{{ c.brand_name || c.industry || '—' }}</div>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ c.pic_name || '—' }}</td>
              <td class="px-4 py-3">
                <span v-if="c.package_name" class="px-2 py-0.5 rounded-md bg-[#3358ff]/10 text-[#3358ff] text-xs font-bold">{{ c.package_name }}</span>
                <span v-else class="text-slate-300 text-xs">—</span>
              </td>
              <td class="px-4 py-3 text-xs text-slate-500 font-mono">{{ c.login_email || '—' }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold"
                  :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">{{ c.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal create -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Tambah Klien Baru</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>

              <UFormGroup label="Nama Perusahaan *"><UInput v-model="form.company_name" placeholder="PT Contoh Jaya" /></UFormGroup>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Nama Brand"><UInput v-model="form.brand_name" /></UFormGroup>
                <UFormGroup label="Industri"><UInput v-model="form.industry" placeholder="F&B, Fashion…" /></UFormGroup>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <UFormGroup label="Nama PIC"><UInput v-model="form.pic_name" /></UFormGroup>
                <UFormGroup label="WhatsApp"><UInput v-model="form.whatsapp" placeholder="628…" /></UFormGroup>
              </div>
              <UFormGroup label="Paket">
                <select v-model="form.package_id" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                  <option value="">— Tanpa paket —</option>
                  <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </UFormGroup>

              <div class="border-t border-slate-100 pt-4">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Akun Login Klien (opsional)</p>
                <div class="grid grid-cols-2 gap-3">
                  <UFormGroup label="Email Login"><UInput v-model="form.login_email" type="email" /></UFormGroup>
                  <UFormGroup label="Password"><UInput v-model="form.login_password" type="password" placeholder="Min. 6 karakter" /></UFormGroup>
                </div>
              </div>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50 flex items-center justify-center gap-2">
                <UIcon v-if="saving" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" /> Simpan
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'portal' })

const loading = ref(true)
const clients = ref<any[]>([])
const packages = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ company_name: '', brand_name: '', industry: '', pic_name: '', whatsapp: '', package_id: '', login_email: '', login_password: '' })

async function load() {
  loading.value = true
  try {
    const [c, p] = await Promise.all([
      $fetch<any>('/api/portal/clients'),
      $fetch<any>('/api/portal/packages').catch(() => ({ data: [] })),
    ])
    clients.value = c.data || []
    packages.value = p.data || []
  } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() {
  formError.value = ''
  Object.assign(form, { company_name: '', brand_name: '', industry: '', pic_name: '', whatsapp: '', package_id: '', login_email: '', login_password: '' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.company_name.trim()) { formError.value = 'Nama perusahaan wajib diisi.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/clients', { method: 'POST', body: { ...form } })
    showModal.value = false
    await load()
  } catch (e: any) {
    formError.value = e?.data?.statusMessage || 'Gagal menyimpan.'
  } finally { saving.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
