<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-5">
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">User Portal</h1>
        <p class="text-slate-500 text-sm mt-0.5">Kelola akun admin & super admin.</p>
      </div>
      <button @click="openCreate" class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Admin
      </button>
    </div>

    <div v-if="loading" class="text-center py-16 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto" /></div>

    <div v-else class="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th class="text-left font-semibold px-4 py-3">Nama</th>
              <th class="text-left font-semibold px-4 py-3">Email</th>
              <th class="text-left font-semibold px-4 py-3">Role</th>
              <th class="text-left font-semibold px-4 py-3">Status</th>
              <th class="text-right font-semibold px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-slate-50/60">
              <td class="px-4 py-3 font-semibold text-slate-900">{{ u.name }}</td>
              <td class="px-4 py-3 text-slate-500 font-mono text-xs">{{ u.email }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-md text-xs font-bold" :class="u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-[#3358ff]/10 text-[#3358ff]'">
                  {{ u.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold" :class="u.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">{{ u.active ? 'Aktif' : 'Nonaktif' }}</span>
              </td>
              <td class="px-4 py-3 text-right">
                <button @click="toggle(u)" class="text-xs font-semibold hover:underline" :class="u.active ? 'text-red-500' : 'text-green-600'">
                  {{ u.active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">Tambah Admin</h3>
              <button @click="showModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4">
              <div v-if="formError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{{ formError }}</div>
              <UFormGroup label="Nama *"><UInput v-model="form.name" /></UFormGroup>
              <UFormGroup label="Email *"><UInput v-model="form.email" type="email" /></UFormGroup>
              <UFormGroup label="Password *"><UInput v-model="form.password" type="password" placeholder="Min. 6 karakter" /></UFormGroup>
              <UFormGroup label="Role">
                <select v-model="form.role" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </UFormGroup>
            </div>
            <div class="border-t border-slate-100 px-5 py-4 flex gap-3">
              <button @click="showModal = false" class="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">Batal</button>
              <button @click="submit" :disabled="saving" class="flex-1 py-2.5 bg-[#3358ff] text-white rounded-xl text-sm font-bold hover:bg-[#2244ee] disabled:opacity-50">Simpan</button>
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
const users = ref<any[]>([])
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ name: '', email: '', password: '', role: 'admin' })

async function load() {
  loading.value = true
  try { const r = await $fetch<any>('/api/portal/users'); users.value = r.data || [] } catch { /* ignore */ }
  loading.value = false
}
onMounted(load)

function openCreate() {
  formError.value = ''
  Object.assign(form, { name: '', email: '', password: '', role: 'admin' })
  showModal.value = true
}

async function submit() {
  formError.value = ''
  if (!form.name || !form.email || !form.password) { formError.value = 'Semua field wajib diisi.'; return }
  saving.value = true
  try {
    await $fetch('/api/portal/users', { method: 'POST', body: { action: 'create', ...form } })
    showModal.value = false
    await load()
  } catch (e: any) { formError.value = e?.data?.statusMessage || 'Gagal menyimpan.' }
  finally { saving.value = false }
}

async function toggle(u: any) {
  try {
    await $fetch('/api/portal/users', { method: 'POST', body: { action: 'toggle_active', id: u.id, active: !u.active } })
    await load()
  } catch (e: any) { alert(e?.data?.statusMessage || 'Gagal mengubah status.') }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform 0.2s ease; }
.modal-enter-from .bg-white, .modal-leave-to .bg-white { transform: translateY(12px); }
</style>
