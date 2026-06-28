<template>
  <div class="p-8 max-w-3xl">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">FAQ</h1>
        <p class="text-slate-500 text-sm mt-0.5">Kelola pertanyaan yang tampil di homepage.</p>
      </div>
      <UButton @click="addNew" style="background-color: #3358ff;" icon="i-tabler-plus" class="font-semibold" :loading="adding">
        Tambah FAQ
      </UButton>
    </div>

    <div v-if="toast" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ toast }}
    </div>
    <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
      {{ errorMsg }}
    </div>

    <div v-if="!items.length" class="bg-white rounded-2xl border border-slate-100 p-12 text-center">
      <UIcon name="i-tabler-help-circle" class="w-12 h-12 text-slate-200 mx-auto mb-3" />
      <p class="text-slate-500 text-sm">Belum ada FAQ. Klik "Tambah FAQ".</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="(item) in items" :key="item.id"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">

        <!-- Header row -->
        <div class="flex items-center justify-between gap-3">
          <span class="text-xs font-mono text-slate-300">#{{ item.sort_order }}</span>
          <div class="flex items-center gap-3">
            <!-- Active toggle -->
            <button @click="toggleActive(item)" type="button"
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
              :class="item.active ? 'bg-[#3358ff]' : 'bg-slate-200'">
              <span class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                :class="item.active ? 'translate-x-[18px]' : 'translate-x-[3px]'" />
            </button>
            <span class="text-xs text-slate-400">{{ item.active ? 'Aktif' : 'Nonaktif' }}</span>
            <button @click="deleteItem(item.id)" class="text-red-400 hover:text-red-600 transition">
              <UIcon name="i-tabler-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <UFormGroup label="Pertanyaan">
          <UInput v-model="item.question" placeholder="Berapa lama pengerjaan website?" />
        </UFormGroup>
        <UFormGroup label="Jawaban">
          <UTextarea v-model="item.answer" :rows="3" placeholder="Jawaban lengkap..." />
        </UFormGroup>
        <div class="flex items-center gap-3">
          <UFormGroup label="Urutan" class="w-24">
            <UInput v-model.number="item.sort_order" type="number" min="0" />
          </UFormGroup>
          <div class="flex-1" />
          <UButton @click="saveItem(item)" size="sm" style="background-color: #3358ff;"
            class="font-semibold mt-5" :loading="savingId === item.id">
            Simpan
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()

const toast    = ref('')
const errorMsg = ref('')
const savingId = ref<number | null>(null)
const adding   = ref(false)

const { data: raw, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/admin/faq', {
  headers: authHeaders.value,
})
const items = ref<any[]>([...(raw.value?.data ?? [])])

watch(raw, (v) => { items.value = [...(v?.data ?? [])] })

function showToast(msg: string) {
  toast.value = msg
  errorMsg.value = ''
  setTimeout(() => toast.value = '', 3000)
}
function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => errorMsg.value = '', 4000)
}

async function addNew() {
  adding.value = true
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/admin/faq', {
      method: 'POST', headers: authHeaders.value,
      body: { action: 'create', question: 'Pertanyaan baru', answer: 'Jawaban...' },
    })
    items.value = res.data
    showToast('FAQ baru ditambahkan.')
  } catch (e: any) {
    showError(e?.data?.statusMessage || 'Gagal menambah FAQ.')
  } finally {
    adding.value = false
  }
}

async function saveItem(item: any) {
  savingId.value = item.id
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/admin/faq', {
      method: 'POST', headers: authHeaders.value,
      body: { action: 'update', id: item.id, question: item.question, answer: item.answer, sort_order: item.sort_order, active: item.active ? 1 : 0 },
    })
    items.value = res.data
    showToast('Tersimpan!')
  } catch (e: any) {
    showError(e?.data?.statusMessage || 'Gagal menyimpan.')
  } finally {
    savingId.value = null
  }
}

async function toggleActive(item: any) {
  item.active = !item.active
  await saveItem(item)
}

async function deleteItem(id: number) {
  if (!confirm('Hapus FAQ ini?')) return
  try {
    const res = await $fetch<{ success: boolean; data: any[] }>('/api/admin/faq', {
      method: 'POST', headers: authHeaders.value,
      body: { action: 'delete', id },
    })
    items.value = res.data
    showToast('FAQ dihapus.')
  } catch (e: any) {
    showError(e?.data?.statusMessage || 'Gagal menghapus.')
  }
}
</script>
