<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 flex-wrap mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Member Portal</h1>
        <p class="text-slate-500 text-sm mt-0.5">
          {{ members.length }} akun aktif
          <span v-if="pendingCount" class="ml-2 bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {{ pendingCount }} pending
          </span>
        </p>
      </div>
      <UButton @click="openCreate" style="background-color: #3358ff;" icon="i-tabler-plus" class="font-semibold">
        Tambah Akun Member
      </UButton>
    </div>

    <!-- Toast -->
    <div v-if="toast.msg" class="rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2"
      :class="toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'">
      <UIcon :name="toast.type === 'success' ? 'i-tabler-check' : 'i-tabler-alert-circle'" class="w-4 h-4 flex-shrink-0" />
      {{ toast.msg }}
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-6">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        :class="activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
        {{ tab.label }}
        <span v-if="tab.id === 'pending' && pendingCount"
          class="ml-1.5 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
          {{ pendingCount }}
        </span>
      </button>
    </div>

    <!-- ── TAB: Akun Aktif ────────────────────── -->
    <div v-if="activeTab === 'active'">
      <div v-if="!dataLoaded" class="flex justify-center py-16">
        <div class="w-8 h-8 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="!members.length" class="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <UIcon name="i-tabler-users" class="w-14 h-14 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-500 text-sm">Belum ada akun member.</p>
        <button @click="openCreate" class="mt-4 text-sm text-[#3358ff] hover:underline font-semibold">+ Tambah Akun Member</button>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table class="w-full text-sm min-w-[560px]">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="text-left px-5 py-3 font-semibold text-slate-500">Toko</th>
              <th class="text-left px-5 py-3 font-semibold text-slate-500 hidden md:table-cell">Email Login</th>
              <th class="text-center px-5 py-3 font-semibold text-slate-500 hidden lg:table-cell">Tier</th>
              <th class="text-center px-5 py-3 font-semibold text-slate-500">Status</th>
              <th class="text-right px-5 py-3 font-semibold text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="m in members" :key="m.store_id" class="hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3.5">
                <div class="font-semibold text-slate-900">{{ m.store_name }}</div>
                <a :href="`/${m.store_slug}`" target="_blank"
                  class="text-xs text-[#3358ff] font-mono hover:underline">lakara.id/{{ m.store_slug }}</a>
                <div class="text-xs text-slate-400 mt-0.5">{{ m.product_count }} produk</div>
              </td>
              <td class="px-5 py-3.5 hidden md:table-cell">
                <div class="text-slate-700">{{ m.member_email }}</div>
                <div class="text-xs mt-0.5" :class="m.has_password ? 'text-green-600' : 'text-orange-500'">
                  {{ m.has_password ? '✓ Password aktif' : '⚠ Belum ada password' }}
                </div>
              </td>
              <td class="px-5 py-3.5 text-center hidden lg:table-cell">
                <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase" :class="tierBadgeClass(m.product_tier)">
                  {{ m.product_tier || 'free' }}
                </span>
                <div v-if="m.tier_expires_at && m.product_tier !== 'free'" class="text-[10px] text-slate-400 mt-1">
                  s/d {{ formatDateShort(m.tier_expires_at) }}
                </div>
              </td>
              <td class="px-5 py-3.5 text-center">
                <button @click="toggleActive(m)"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                  :class="m.member_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'">
                  {{ m.member_active ? '● Aktif' : '○ Nonaktif' }}
                </button>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-3 flex-wrap">
                  <button @click="openEdit(m)" class="text-xs text-[#3358ff] hover:opacity-70 font-medium">Edit</button>
                  <button @click="openTier(m)" class="text-xs text-purple-600 hover:text-purple-800 font-medium">Tier</button>
                  <NuxtLink :to="`/admin/stores/edit?action=edit&id=${m.store_id}`"
                    class="text-xs text-slate-400 hover:text-slate-700 font-medium">Toko</NuxtLink>
                  <button v-if="m.member_active" @click="toggleActive(m)" class="text-xs text-amber-500 hover:text-amber-700 font-medium">Nonaktifkan</button>
                  <template v-else>
                    <button @click="toggleActive(m)" class="text-xs text-green-600 hover:text-green-700 font-medium">Aktifkan</button>
                    <button @click="deleteMember(m)" class="text-xs text-red-500 hover:text-red-700 font-semibold">Hapus</button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── TAB: Pending ────────────────────────── -->
    <div v-if="activeTab === 'pending'">
      <div v-if="!dataLoaded" class="flex justify-center py-16">
        <div class="w-8 h-8 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="!pendingList.length" class="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <UIcon name="i-tabler-inbox" class="w-14 h-14 text-slate-200 mx-auto mb-3" />
        <p class="text-slate-500 text-sm">Tidak ada pendaftaran baru.</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in pendingList" :key="item.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden border"
          :class="item.status === 'pending' ? 'border-orange-200' : item.status === 'approved' ? 'border-green-200' : 'border-slate-100'">
          <div class="px-6 py-4 flex items-start justify-between gap-4 border-b border-slate-50">
            <div>
              <div class="font-bold text-slate-900">{{ item.name }}</div>
              <div class="text-sm text-slate-500">{{ item.email }}</div>
              <div class="text-xs text-slate-400 mt-0.5">{{ formatDate(item.created_at) }}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
              :class="{
                'bg-orange-100 text-orange-600': item.status === 'pending',
                'bg-green-100 text-green-700':   item.status === 'approved',
                'bg-slate-100 text-slate-500':   item.status === 'rejected',
              }">
              {{ item.status === 'pending' ? '⏳ Menunggu' : item.status === 'approved' ? '✓ Disetujui' : '✗ Ditolak' }}
            </span>
          </div>

          <div class="px-6 py-4 space-y-3">
            <div class="grid md:grid-cols-2 gap-3">
              <div>
                <p class="text-xs text-slate-400 font-medium mb-1">Nama Toko</p>
                <UInput v-if="item.status === 'pending'" v-model="item.store_name" size="sm" />
                <p v-else class="text-sm font-semibold text-slate-800">{{ item.store_name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 font-medium mb-1">URL Toko</p>
                <div v-if="item.status === 'pending'" class="flex">
                  <span class="border border-r-0 border-gray-300 bg-gray-50 px-2 py-1.5 text-gray-400 text-xs rounded-l-md whitespace-nowrap">lakara.id/</span>
                  <UInput v-model="item.store_slug" size="sm" class="rounded-l-none font-mono flex-1" />
                </div>
                <p v-else class="text-sm font-mono text-[#3358ff]">lakara.id/{{ item.store_slug }}</p>
              </div>
            </div>

            <div v-if="item.description" class="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              <strong>Deskripsi:</strong> {{ item.description }}
            </div>
            <div v-if="item.message" class="text-xs text-slate-600 bg-blue-50 rounded-lg px-3 py-2">
              <strong>Pesan:</strong> {{ item.message }}
            </div>
            <div v-if="item.status === 'rejected' && item.reject_reason" class="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <strong>Alasan ditolak:</strong> {{ item.reject_reason }}
            </div>

            <div v-if="item.status === 'pending'" class="flex gap-2 pt-1">
              <UButton @click="approve(item)" :loading="approving === item.id"
                size="sm" style="background-color: #3358ff;" class="font-semibold">
                ✓ Setujui & Buat Toko
              </UButton>
              <UButton @click="openReject(item)" variant="outline" color="red" size="sm" class="font-semibold">
                ✗ Tolak
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Tambah Akun Member ─────────── -->
    <div v-if="showCreate" @click.self="showCreate = false"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4">
        <h3 class="font-extrabold text-slate-900 text-lg">Tambah Akun Member</h3>
        <p class="text-sm text-slate-500 -mt-2">Berikan akses member portal ke toko yang sudah ada.</p>

        <UFormGroup label="Pilih Toko *">
          <USelect v-model="createForm.store_id"
            :options="storesWithoutMember.map(s => ({ label: s.name + ' (/' + s.slug + ')', value: s.id }))"
            placeholder="Pilih toko..." />
          <template #hint>
            <span class="text-xs text-slate-400">Hanya toko yang belum punya akun member</span>
          </template>
        </UFormGroup>

        <UFormGroup label="Email Login *">
          <UInput v-model="createForm.email" type="email" placeholder="owner@toko.com" />
        </UFormGroup>

        <UFormGroup label="Password *">
          <UInput v-model="createForm.password" type="password" placeholder="Min. 6 karakter" />
        </UFormGroup>

        <div v-if="createError" class="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{{ createError }}</div>

        <div class="flex gap-2 pt-2">
          <UButton @click="createMember" :loading="createSaving"
            style="background-color: #3358ff;" class="font-bold flex-1"
            :disabled="!createForm.store_id || !createForm.email || !createForm.password">
            Buat Akun Member
          </UButton>
          <UButton @click="showCreate = false" variant="outline" color="gray">Batal</UButton>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Edit Credentials ──────────── -->
    <div v-if="editTarget" @click.self="editTarget = null"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <h3 class="font-extrabold text-slate-900">Edit Credentials</h3>
        <p class="text-sm text-slate-500 -mt-2">{{ editTarget.store_name }}</p>
        <UFormGroup label="Email Login *">
          <UInput v-model="editForm.email" type="email" />
        </UFormGroup>
        <UFormGroup label="Password Baru">
          <UInput v-model="editForm.password" type="password" placeholder="Kosongkan = tidak diubah" />
        </UFormGroup>
        <div v-if="editError" class="text-xs text-red-500">{{ editError }}</div>
        <div class="flex gap-2 pt-2">
          <UButton @click="saveCreds" :loading="editSaving"
            style="background-color: #3358ff;" class="font-bold flex-1">Simpan</UButton>
          <UButton @click="editTarget = null" variant="outline" color="gray">Batal</UButton>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Set Tier ──────────────────── -->
    <div v-if="tierTarget" @click.self="tierTarget = null"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-extrabold text-slate-900">Set Tier Member</h3>
            <p class="text-sm text-slate-500 mt-0.5">{{ tierTarget.store_name }}</p>
          </div>
          <button @click="tierTarget = null" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><UIcon name="i-tabler-x" class="w-4 h-4" /></button>
        </div>

        <!-- Status saat ini -->
        <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
          <span class="text-slate-500">Tier saat ini</span>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-full text-xs font-bold uppercase" :class="tierBadgeClass(tierTarget.product_tier)">
              {{ tierTarget.product_tier || 'free' }}
            </span>
            <span v-if="tierTarget.tier_expires_at && tierTarget.product_tier !== 'free'" class="text-xs text-slate-400">
              s/d {{ formatDateShort(tierTarget.tier_expires_at) }}
            </span>
          </div>
        </div>

        <!-- Pilih Tier -->
        <div>
          <label class="text-sm font-semibold text-slate-700 block mb-2">Tier Baru</label>
          <div class="grid grid-cols-3 gap-2">
            <button v-for="t in tierOptions" :key="t.key" @click="tierForm.tier = t.key" type="button"
              class="py-3 text-sm font-bold rounded-xl border-2 transition-all"
              :class="tierForm.tier === t.key ? t.activeClass : 'border-slate-200 text-slate-500 hover:border-slate-300'">
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Durasi (hanya tampil jika bukan free) -->
        <div v-if="tierForm.tier !== 'free'">
          <label class="text-sm font-semibold text-slate-700 block mb-2">Durasi</label>
          <div class="grid grid-cols-4 gap-2">
            <button v-for="d in durationOptions" :key="d.months" @click="tierForm.months = d.months" type="button"
              class="py-2.5 text-xs font-bold rounded-xl border-2 transition-all"
              :class="tierForm.months === d.months ? 'border-[#3358ff] bg-[#3358ff]/5 text-[#3358ff]' : 'border-slate-200 text-slate-500 hover:border-slate-300'">
              {{ d.label }}
            </button>
          </div>
          <div class="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
            <UIcon name="i-tabler-calendar-check" class="w-3.5 h-3.5 text-[#3358ff]" />
            Aktif hingga: <span class="font-semibold text-slate-800">{{ previewExpiry }}</span>
          </div>
        </div>

        <div v-if="tierForm.tier === 'free'" class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <UIcon name="i-tabler-alert-triangle" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          Reset ke Free akan menghapus tier aktif member ini.
        </div>

        <div class="flex gap-2 pt-1">
          <UButton @click="saveTier" :loading="tierSaving"
            :style="tierForm.tier === 'premium' ? 'background-color: #7c3aed' : tierForm.tier === 'pro' ? 'background-color: #3358ff' : ''"
            :color="tierForm.tier === 'free' ? 'gray' : undefined"
            class="font-bold flex-1">
            {{ tierForm.tier === 'free' ? 'Reset ke Free' : `Aktifkan ${tierForm.tier} (${tierForm.months} bln)` }}
          </UButton>
          <UButton @click="tierTarget = null" variant="outline" color="gray">Batal</UButton>
        </div>
      </div>
    </div>

    <!-- ── MODAL: Tolak dengan alasan ───────── -->
    <div v-if="rejectTarget" @click.self="rejectTarget = null"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4">
        <h3 class="font-extrabold text-slate-900">Tolak Pendaftaran</h3>
        <p class="text-sm text-slate-500 -mt-2">{{ rejectTarget.name }} · {{ rejectTarget.email }}</p>
        <UFormGroup label="Alasan (opsional, akan disimpan)">
          <UTextarea v-model="rejectReason" :rows="3" placeholder="Misal: slug sudah dipakai, informasi kurang lengkap..." />
        </UFormGroup>
        <div class="flex gap-2 pt-2">
          <UButton @click="confirmReject" :loading="rejectSaving" color="red" class="font-bold flex-1">Tolak Pendaftaran</UButton>
          <UButton @click="rejectTarget = null" variant="outline" color="gray">Batal</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()

// ── Data ─────────────────────────────────────
const dataLoaded = ref(false)
const activeTab  = ref('pending')

const tabs = [
  { id: 'pending', label: 'Pendaftaran Masuk' },
  { id: 'active',  label: 'Akun Aktif' },
]

const { data: membersRes,  refresh: refreshMembers  } = await useFetch('/api/admin/members', {
  headers: authHeaders.value, server: false, default: () => ({ ok: false, data: [] }),
})
const { data: pendingRes,  refresh: refreshPending  } = await useFetch('/api/admin/pending-members', {
  headers: authHeaders.value, server: false, default: () => ({ ok: false, data: [] }),
})
const { data: allStoresRes } = await useFetch<any[]>('/api/admin/stores', {
  headers: authHeaders.value, server: false, default: () => [],
})

const members    = computed(() => (membersRes.value?.data ?? []) as any[])
const allPending = computed(() => (pendingRes.value?.data ?? []) as any[])

// Hanya count status 'pending' (Bug fix — tidak hitung approved/rejected)
const pendingCount = computed(() => allPending.value.filter((p: any) => p.status === 'pending').length)
const pendingList  = computed(() => [...allPending.value].reverse())

// Toko yang belum punya akun member (untuk dropdown create)
const storesWithoutMember = computed(() => {
  const withMember = new Set(members.value.map((m: any) => m.store_id))
  return ((allStoresRes.value ?? []) as any[]).filter((s: any) => !withMember.has(s.id))
})

// Set default tab dan loaded flag setelah data masuk
watch([members, allPending], () => {
  dataLoaded.value = true
  // Switch ke active jika tidak ada pending (hanya sekali saat pertama load)
  if (!dataLoaded.value && pendingCount.value === 0) activeTab.value = 'active'
}, { immediate: false })

onMounted(() => {
  // Fallback: set loaded setelah 2 detik
  setTimeout(() => dataLoaded.value = true, 2000)
})

// ── Toast ─────────────────────────────────────
const toast = reactive({ msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.msg  = msg
  toast.type = type
  setTimeout(() => toast.msg = '', 4000)
}

// ── Helpers ──────────────────────────────────
function formatDate(val: string) {
  if (!val) return ''
  return new Date(val).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
function formatDateShort(val: string) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
function tierBadgeClass(tier: string) {
  if (tier === 'pro')     return 'bg-[#3358ff]/10 text-[#3358ff]'
  if (tier === 'premium') return 'bg-purple-100 text-purple-700'
  return 'bg-slate-100 text-slate-500'
}

// ── Toggle active ────────────────────────────
async function toggleActive(m: any) {
  try {
    await $fetch('/api/admin/members', {
      method: 'POST', headers: authHeaders.value,
      body: { store_id: m.store_id, action: 'toggle_active', member_active: !m.member_active },
    })
    refreshMembers()
  } catch (e: any) {
    showToast(e?.data?.statusMessage || 'Gagal update.', 'error')
  }
}

// ── Delete member (permanen, hanya setelah nonaktif) ──────────────
async function deleteMember(m: any) {
  if (!confirm(`HAPUS PERMANEN "${m.store_name}"?\n\nToko, produk, link bio, dan akun member akan dihapus selamanya dan TIDAK bisa dibatalkan.`)) return
  try {
    await $fetch('/api/admin/members', {
      method: 'POST', headers: authHeaders.value,
      body: { store_id: m.store_id, action: 'delete' },
    })
    showToast(`"${m.store_name}" berhasil dihapus permanen.`)
    refreshMembers()
  } catch (e: any) {
    showToast(e?.data?.statusMessage || 'Gagal menghapus.', 'error')
  }
}

// ── Create member ─────────────────────────────
const showCreate  = ref(false)
const createForm  = reactive({ store_id: '', email: '', password: '' })
const createSaving = ref(false)
const createError  = ref('')

function openCreate() {
  createForm.store_id = ''
  createForm.email    = ''
  createForm.password = ''
  createError.value   = ''
  showCreate.value    = true
}

async function createMember() {
  createError.value  = ''
  if (createForm.password.length < 6) { createError.value = 'Password minimal 6 karakter.'; return }
  createSaving.value = true
  try {
    await $fetch('/api/admin/members', {
      method: 'POST', headers: authHeaders.value,
      body: { action: 'create', store_id: createForm.store_id, email: createForm.email, password: createForm.password },
    })
    showCreate.value = false
    showToast('Akun member berhasil dibuat!')
    activeTab.value = 'active'
    refreshMembers()
  } catch (e: any) {
    createError.value = e?.data?.statusMessage || 'Gagal membuat akun.'
  } finally {
    createSaving.value = false
  }
}

// ── Edit credentials ──────────────────────────
const editTarget  = ref<any>(null)
const editForm    = reactive({ email: '', password: '' })
const editSaving  = ref(false)
const editError   = ref('')

function openEdit(m: any) {
  editTarget.value  = m
  editForm.email    = m.member_email
  editForm.password = ''
  editError.value   = ''
}

async function saveCreds() {
  editError.value  = ''
  editSaving.value = true
  try {
    await $fetch('/api/admin/members', {
      method: 'POST', headers: authHeaders.value,
      body: { store_id: editTarget.value.store_id, action: 'update_creds', email: editForm.email, password: editForm.password || undefined },
    })
    editTarget.value = null
    showToast('Credentials berhasil diupdate!')
    refreshMembers()
  } catch (e: any) {
    editError.value = e?.data?.statusMessage || 'Gagal menyimpan.'
  } finally {
    editSaving.value = false
  }
}

// ── Tier management ──────────────────────────
const tierTarget  = ref<any>(null)
const tierForm    = reactive({ tier: 'pro', months: 1 })
const tierSaving  = ref(false)

const tierOptions = [
  { key: 'free',    label: 'Free',    activeClass: 'border-slate-500 bg-slate-50 text-slate-700' },
  { key: 'pro',     label: 'Pro',     activeClass: 'border-[#3358ff] bg-[#3358ff]/5 text-[#3358ff]' },
  { key: 'premium', label: 'Premium', activeClass: 'border-purple-500 bg-purple-50 text-purple-700' },
]
const durationOptions = [
  { months: 1,  label: '1 Bln' },
  { months: 3,  label: '3 Bln' },
  { months: 6,  label: '6 Bln' },
  { months: 12, label: '1 Thn' },
]
const previewExpiry = computed(() => {
  if (tierForm.tier === 'free') return ''
  const d = new Date()
  d.setMonth(d.getMonth() + tierForm.months)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
})

function openTier(m: any) {
  tierTarget.value = m
  tierForm.tier    = m.product_tier || 'free'
  tierForm.months  = 1
}

async function saveTier() {
  tierSaving.value = true
  try {
    await $fetch('/api/admin/members', {
      method: 'POST', headers: authHeaders.value,
      body: { store_id: tierTarget.value.store_id, action: 'set_tier', tier: tierForm.tier, months: tierForm.months },
    })
    const label = tierForm.tier === 'free' ? 'direset ke Free' : `diupgrade ke ${tierForm.tier} (${tierForm.months} bln)`
    showToast(`Tier "${tierTarget.value.store_name}" berhasil ${label}!`)
    tierTarget.value = null
    refreshMembers()
  } catch (e: any) {
    showToast(e?.data?.statusMessage || 'Gagal update tier.', 'error')
  } finally {
    tierSaving.value = false
  }
}

// ── Approve ───────────────────────────────────
const approving = ref('')

async function approve(item: any) {
  approving.value = item.id
  try {
    await $fetch('/api/admin/pending-members', {
      method: 'POST', headers: authHeaders.value,
      body: { id: item.id, action: 'approve', store_name: item.store_name, store_slug: item.store_slug },
    })
    showToast(`Toko "${item.store_name}" dibuat! Member bisa login.`)
    activeTab.value = 'active'
    refreshMembers()
    refreshPending()
  } catch (e: any) {
    showToast(e?.data?.statusMessage || 'Gagal approve.', 'error')
  } finally {
    approving.value = ''
  }
}

// ── Reject ────────────────────────────────────
const rejectTarget  = ref<any>(null)
const rejectReason  = ref('')
const rejectSaving  = ref(false)

function openReject(item: any) {
  rejectTarget.value = item
  rejectReason.value = ''
}

async function confirmReject() {
  rejectSaving.value = true
  try {
    await $fetch('/api/admin/pending-members', {
      method: 'POST', headers: authHeaders.value,
      body: { id: rejectTarget.value.id, action: 'reject', reject_reason: rejectReason.value },
    })
    rejectTarget.value = null
    showToast(`Pendaftaran "${rejectTarget.value?.name || ''}" ditolak.`)
    refreshPending()
  } catch (e: any) {
    showToast(e?.data?.statusMessage || 'Gagal tolak.', 'error')
  } finally {
    rejectSaving.value = false
  }
}
</script>
