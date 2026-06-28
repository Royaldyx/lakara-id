<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Produk</h1>
        <p class="text-slate-500 text-sm mt-0.5">{{ products.length }} produk di toko kamu</p>
      </div>
      <button
        v-if="canAddProduct"
        @click="$router.push('/member/products/edit?action=add')"
        class="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-sm"
        style="background-color: #3358ff;">
        <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Produk
      </button>
      <button
        v-else
        @click="showUpgradeModal = true"
        class="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition shadow-sm"
        style="background: linear-gradient(135deg, #f59e0b, #d97706);">
        <UIcon name="i-tabler-crown" class="w-4 h-4" /> Upgrade Pro
      </button>
    </div>

    <!-- Tier Banner -->
    <div v-if="upgradeStatus" class="mb-6">
      <!-- Free tier — progress bar -->
      <div v-if="upgradeStatus.tier === 'free'"
        class="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 shadow-sm">
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-semibold text-slate-600">
              Paket Free — {{ products.length }}/10 produk
            </span>
            <button v-if="!upgradeStatus.has_pending" @click="showUpgradeModal = true"
              class="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
              <UIcon name="i-tabler-crown" class="w-3.5 h-3.5" /> Upgrade ke Pro
            </button>
            <span v-else class="text-xs font-medium text-amber-600 flex items-center gap-1">
              <UIcon name="i-tabler-clock" class="w-3.5 h-3.5" /> Menunggu konfirmasi admin
            </span>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2">
            <div class="h-2 rounded-full transition-all duration-500"
              :class="products.length >= 10 ? 'bg-red-500' : products.length >= 7 ? 'bg-amber-500' : 'bg-[#3358ff]'"
              :style="{ width: `${Math.min((products.length / 10) * 100, 100)}%` }" />
          </div>
        </div>
      </div>

      <!-- Pro tier -->
      <div v-else
        class="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-tabler-crown" class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1">
          <span class="text-sm font-extrabold text-amber-700">Paket Pro — Unlimited Produk</span>
          <p v-if="upgradeStatus.tier_expires_at" class="text-xs text-amber-600 mt-0.5">
            Aktif s/d {{ formatDate(upgradeStatus.tier_expires_at) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-check" class="w-4 h-4" /> {{ success }}
    </div>
    <div v-if="apiError" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
      <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" /> {{ apiError }}
    </div>

    <!-- Empty -->
    <div v-if="!products.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-box" class="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <p class="text-slate-500 text-sm mb-4">Belum ada produk. Tambah produk pertamamu!</p>
      <NuxtLink to="/member/products/edit?action=add"
        class="bg-[#3358ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition inline-block">
        + Tambah Produk
      </NuxtLink>
    </div>

    <!-- Grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="product in products" :key="product.id"
        class="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div class="h-48 bg-gray-100 overflow-hidden relative">
          <img v-if="product.images?.[0]" :src="product.images[0]" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-tabler-photo" class="w-12 h-12 text-gray-200" />
          </div>
          <span class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold"
            :class="product.published !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
            {{ product.published !== false ? 'Live' : 'Draft' }}
          </span>
          <span v-if="product.badge" class="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style="background-color: #3358ff;">{{ product.badge }}</span>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{{ product.name }}</h3>
          <p class="text-sm font-bold text-[#3358ff] mb-3">
            {{ product.price ? formatPrice(product.price) : 'Hubungi kami' }}
          </p>
          <div class="flex gap-2">
            <button @click="togglePublish(product)"
              class="flex-1 text-center text-xs font-semibold py-2 rounded-lg transition border"
              :class="product.published !== false
                ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'">
              {{ product.published !== false ? 'Jadikan Draft' : 'Publish' }}
            </button>
            <NuxtLink :to="`/member/products/edit?action=edit&pid=${product.id}`"
              class="px-3 py-2 bg-[#3358ff]/10 text-[#3358ff] text-xs font-semibold rounded-lg hover:bg-[#3358ff]/20 transition">
              Edit
            </NuxtLink>
            <button @click="deleteProduct(product)"
              class="px-3 py-2 bg-red-50 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 transition">
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Upgrade Modal ───────────────────────── -->
    <div v-if="showUpgradeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showUpgradeModal = false">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-white">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <UIcon name="i-tabler-crown" class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-extrabold">Upgrade ke Pro</h2>
              <p class="text-amber-100 text-sm">Produk unlimited, tanpa batas!</p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">

          <!-- Harga -->
          <div class="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
            <div v-if="upgradeStatus?.upgrade_promo" class="flex items-center justify-center gap-3 mb-1">
              <span class="text-lg text-slate-400 line-through">{{ formatPrice(upgradeStatus.upgrade_price) }}</span>
              <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">PROMO</span>
            </div>
            <div class="text-3xl font-extrabold text-amber-700">
              {{ formatPrice(upgradeStatus?.upgrade_promo || upgradeStatus?.upgrade_price || 20000) }}
            </div>
            <div class="text-sm text-amber-600 mt-1">per bulan</div>
          </div>

          <!-- Fitur Pro -->
          <div class="space-y-2">
            <div v-for="f in proFeatures" :key="f" class="flex items-center gap-2 text-sm text-slate-700">
              <UIcon name="i-tabler-check-circle" class="w-4 h-4 text-green-500 flex-shrink-0" />
              {{ f }}
            </div>
          </div>

          <!-- Info rekening -->
          <div v-if="upgradeStatus?.bank_account" class="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Transfer ke:</p>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Bank / E-Wallet</span>
              <span class="font-bold text-slate-900">{{ upgradeStatus.bank_name }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">No. Rekening</span>
              <span class="font-bold text-slate-900 font-mono">{{ upgradeStatus.bank_account }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Atas Nama</span>
              <span class="font-bold text-slate-900">{{ upgradeStatus.bank_holder }}</span>
            </div>
          </div>
          <div v-else class="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 text-center border border-amber-200">
            Hubungi admin untuk info pembayaran.
          </div>

          <!-- Catatan -->
          <div>
            <label class="text-xs font-semibold text-slate-500 block mb-1.5">Catatan (opsional — misal: sudah transfer)</label>
            <UTextarea v-model="upgradeNote" placeholder="Saya sudah transfer Rp 20.000 ke BCA atas nama Lakara..." :rows="2" />
          </div>

          <!-- CTA -->
          <div v-if="upgradeStatus?.has_pending" class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <UIcon name="i-tabler-clock" class="w-4 h-4 text-amber-600 inline mr-1" />
            <span class="text-sm font-semibold text-amber-700">Request kamu sedang diproses admin.</span>
          </div>
          <div v-else class="flex gap-3">
            <UButton
              @click="submitUpgradeRequest"
              :loading="submittingUpgrade"
              block
              class="font-bold bg-amber-500 hover:bg-amber-600 text-white">
              <UIcon name="i-tabler-send" class="w-4 h-4 mr-1" />
              Kirim Request Upgrade
            </UButton>
          </div>

          <button @click="showUpgradeModal = false"
            class="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-1">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member', middleware: 'member' })

const { storeData, fetchStore } = useMember()
const store    = computed(() => storeData.value)
const products = computed(() => (store.value?.products || []) as any[])
const success  = ref('')
const apiError = ref('')

const showUpgradeModal  = ref(false)
const upgradeNote       = ref('')
const submittingUpgrade = ref(false)

const { data: upgradeStatus, refresh: refreshUpgrade } = await useFetch<any>(
  '/api/member/upgrade-status',
  { server: false, default: () => null }
)

const canAddProduct = computed(() => {
  if (!upgradeStatus.value) return products.value.length < 10
  if (upgradeStatus.value.tier === 'pro') return true
  return products.value.length < 10
})

const proFeatures = [
  'Produk unlimited — tidak ada batas',
  'Semua fitur toko tetap aktif',
  'Priority support via WhatsApp',
]

onMounted(async () => { if (!store.value) await fetchStore() })

function formatPrice(val: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
}

async function submitUpgradeRequest() {
  submittingUpgrade.value = true
  try {
    await $fetch('/api/member/upgrade-request', {
      method: 'POST',
      body: { note: upgradeNote.value },
    })
    await refreshUpgrade()
    showUpgradeModal.value = false
    success.value = 'Request upgrade terkirim! Admin akan memproses dalam 1x24 jam.'
    setTimeout(() => success.value = '', 6000)
  } catch (e: any) {
    apiError.value = e?.data?.statusMessage || 'Gagal mengirim request.'
    setTimeout(() => apiError.value = '', 5000)
  } finally {
    submittingUpgrade.value = false
  }
}

async function saveProducts(updated: any[]): Promise<boolean> {
  apiError.value = ''
  try {
    await $fetch('/api/member/products', { method: 'POST', body: { products: updated } })
    storeData.value = { ...store.value, products: updated }
    return true
  } catch (e: any) {
    apiError.value = e?.data?.statusMessage || 'Gagal menyimpan. Coba lagi.'
    return false
  }
}

async function togglePublish(product: any) {
  const updated = products.value.map((p: any) =>
    p.id === product.id ? { ...p, published: !(p.published !== false) } : p
  )
  await saveProducts(updated)
}

async function deleteProduct(product: any) {
  if (!confirm(`Hapus produk "${product.name}"?`)) return
  const updated = products.value.filter((p: any) => p.id !== product.id)
  const ok = await saveProducts(updated)
  if (ok) {
    success.value = 'Produk berhasil dihapus.'
    setTimeout(() => success.value = '', 3000)
  }
}
</script>
