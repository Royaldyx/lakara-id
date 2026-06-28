<template>
  <div class="p-8 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Upgrade History</h1>
        <p class="text-slate-500 text-sm mt-0.5">Riwayat seluruh upgrade tier dari semua member.</p>
      </div>
      <button @click="refresh" class="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 bg-white rounded-xl px-4 py-2 hover:border-[#3358ff] hover:text-[#3358ff] transition">
        <UIcon name="i-tabler-refresh" class="w-4 h-4" />
        Refresh
      </button>
    </div>

    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Upgrade</div>
        <div class="text-2xl font-extrabold text-slate-900">{{ stats.total }}</div>
      </div>
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Bulan Ini</div>
        <div class="text-2xl font-extrabold text-[#3358ff]">{{ stats.thisMonth }}</div>
      </div>
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Total Revenue</div>
        <div class="text-xl font-extrabold text-emerald-600">Rp {{ formatRupiah(stats.totalRevenue) }}</div>
      </div>
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div class="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Pro / Premium</div>
        <div class="text-xl font-extrabold text-slate-900">{{ stats.proCount }} / {{ stats.premiumCount }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="relative">
        <UIcon name="i-tabler-search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input v-model="search" placeholder="Cari toko..."
          class="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3358ff] transition w-52" />
      </div>

      <!-- Method tabs -->
      <div class="flex gap-1.5">
        <button v-for="f in methodFilters" :key="f.key"
          @click="activeMethod = f.key"
          class="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition"
          :class="activeMethod === f.key
            ? 'bg-[#3358ff] text-white shadow-sm'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-[#3358ff]'">
          {{ f.label }}
        </button>
      </div>

      <!-- Tier filter -->
      <div class="flex gap-1.5">
        <button v-for="t in tierFilters" :key="t.key"
          @click="activeTier = t.key"
          class="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition"
          :class="activeTier === t.key
            ? 'bg-slate-800 text-white shadow-sm'
            : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'">
          {{ t.label }}
        </button>
      </div>

      <span class="text-xs text-slate-400 ml-auto">{{ filtered.length }} entri</span>
    </div>

    <!-- Empty state -->
    <div v-if="!filtered.length" class="bg-white rounded-2xl border border-slate-100 p-16 text-center">
      <UIcon name="i-tabler-inbox" class="w-14 h-14 text-slate-200 mx-auto mb-3" />
      <p class="text-slate-400 text-sm">Tidak ada data untuk filter ini.</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-100">
            <th class="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Toko</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Tier</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Durasi</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Amount</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Metode</th>
            <th class="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="row in filtered" :key="row.id"
            class="hover:bg-slate-50/70 transition-colors">

            <!-- Toko -->
            <td class="px-5 py-3.5">
              <div class="font-semibold text-slate-900 leading-tight">{{ row.store_name || '-' }}</div>
              <div class="text-xs text-slate-400 font-mono">/{{ row.store_slug || '?' }}</div>
            </td>

            <!-- Tier -->
            <td class="px-4 py-3.5">
              <span class="px-2 py-1 rounded-full text-xs font-bold"
                :class="row.tier_type === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-[#3358ff]/10 text-[#3358ff]'">
                {{ row.tier_type === 'premium' ? '⭐ Premium' : '🚀 Pro' }}
              </span>
            </td>

            <!-- Durasi -->
            <td class="px-4 py-3.5 hidden sm:table-cell">
              <span class="text-slate-700 font-medium">{{ row.months }} bln</span>
            </td>

            <!-- Amount -->
            <td class="px-4 py-3.5 hidden md:table-cell">
              <span v-if="row.amount > 0" class="font-semibold text-emerald-700">
                Rp {{ formatRupiah(row.amount) }}
              </span>
              <span v-else class="text-slate-400 text-xs italic">—</span>
            </td>

            <!-- Metode -->
            <td class="px-4 py-3.5">
              <span v-if="isAdminMethod(row.method)"
                class="flex items-center gap-1.5 w-fit">
                <span class="px-2 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700">
                  🛡 Admin
                </span>
              </span>
              <span v-else class="flex items-center gap-1.5 w-fit">
                <span class="px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                  {{ methodLabel(row.method) }}
                </span>
              </span>
            </td>

            <!-- Tanggal -->
            <td class="px-4 py-3.5 hidden lg:table-cell">
              <span class="text-slate-500 text-xs">{{ formatDate(row.paid_at || row.created_at) }}</span>
            </td>

            <!-- Action -->
            <td class="px-4 py-3.5 text-right">
              <button v-if="!isAdminMethod(row.method)"
                @click="openDetail(row)"
                class="text-xs font-semibold text-[#3358ff] hover:underline whitespace-nowrap">
                Lihat Detail
              </button>
              <span v-else class="text-xs text-slate-400 italic whitespace-nowrap">
                Upgraded by Admin
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- ===== PAYMENT DETAIL MODAL ===== -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="detailRow"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="detailRow = null">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">

          <!-- Header -->
          <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="detailRow.tier_type === 'premium' ? 'bg-purple-100' : 'bg-[#3358ff]/10'">
                <UIcon name="i-tabler-receipt" class="w-5 h-5"
                  :class="detailRow.tier_type === 'premium' ? 'text-purple-600' : 'text-[#3358ff]'" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900 leading-tight">Detail Pembayaran</h3>
                <p class="text-xs text-slate-400 font-mono">{{ detailRow.id }}</p>
              </div>
            </div>
            <button @click="detailRow = null" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
              <UIcon name="i-tabler-x" class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-5 space-y-4">

            <!-- Store info -->
            <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Toko</span>
                <span class="font-semibold text-slate-800">{{ detailRow.store_name || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Slug</span>
                <span class="font-mono text-slate-600">/{{ detailRow.store_slug || '?' }}</span>
              </div>
            </div>

            <!-- Tier info -->
            <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Tier</span>
                <span class="font-bold"
                  :class="detailRow.tier_type === 'premium' ? 'text-purple-700' : 'text-[#3358ff]'">
                  {{ detailRow.tier_type === 'premium' ? '⭐ Premium' : '🚀 Pro' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Durasi</span>
                <span class="font-semibold text-slate-800">{{ detailRow.months }} bulan</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Nominal</span>
                <span class="font-bold text-emerald-700">
                  {{ detailRow.amount > 0 ? `Rp ${formatRupiah(detailRow.amount)}` : '— (admin)' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Metode</span>
                <span class="font-semibold text-slate-800">{{ methodLabel(detailRow.method) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Tanggal</span>
                <span class="text-slate-600">{{ formatDate(detailRow.paid_at || detailRow.created_at) }}</span>
              </div>
            </div>

            <!-- Tripay-specific details -->
            <div v-if="detailRow.pay_code || detailRow.checkout_url || detailRow.qr_url"
              class="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Info Pembayaran</p>
              <div v-if="detailRow.pay_code" class="flex justify-between items-center">
                <span class="text-slate-500">Kode Bayar</span>
                <span class="font-mono font-bold text-slate-800">{{ detailRow.pay_code }}</span>
              </div>
              <div v-if="detailRow.checkout_url" class="flex justify-between items-center gap-2">
                <span class="text-slate-500">Checkout URL</span>
                <a :href="detailRow.checkout_url" target="_blank"
                  class="text-[#3358ff] text-xs font-medium hover:underline truncate max-w-[180px]">
                  Lihat di Tripay →
                </a>
              </div>
              <div v-if="detailRow.qr_url" class="text-center pt-2">
                <img :src="detailRow.qr_url" alt="QR Code" class="w-32 h-32 mx-auto rounded-xl border border-slate-200" />
              </div>
            </div>

          </div>

          <div class="px-5 pb-5">
            <button @click="detailRow = null"
              class="w-full py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              Tutup
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { authHeaders } = useAdmin()

const { data: res, refresh } = await useFetch<{ ok: boolean; data: any[]; stats: any }>(
  '/api/admin/upgrade-history',
  {
    headers: authHeaders.value,
    default: () => ({ ok: false, data: [], stats: { total: 0, thisMonth: 0, proCount: 0, premiumCount: 0, totalRevenue: 0 } }),
  },
)

const history = computed(() => res.value?.data ?? [])
const stats   = computed(() => res.value?.stats ?? { total: 0, thisMonth: 0, proCount: 0, premiumCount: 0, totalRevenue: 0 })

// ─── Filters ─────────────────────────────────────────────────────────────────
const search       = ref('')
const activeMethod = ref('all')
const activeTier   = ref('all')

const methodFilters = [
  { key: 'all',   label: 'Semua' },
  { key: 'user',  label: 'Tripay (User)' },
  { key: 'admin', label: 'Admin' },
]
const tierFilters = [
  { key: 'all',     label: 'Semua Tier' },
  { key: 'pro',     label: '🚀 Pro' },
  { key: 'premium', label: '⭐ Premium' },
]

function isAdminMethod(method: string) {
  return method === 'ADMIN' || method === 'MANUAL'
}

const filtered = computed(() => {
  let list = history.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(r =>
      (r.store_name || '').toLowerCase().includes(q) ||
      (r.store_slug || '').toLowerCase().includes(q),
    )
  }

  if (activeMethod.value === 'user')  list = list.filter(r => !isAdminMethod(r.method))
  if (activeMethod.value === 'admin') list = list.filter(r => isAdminMethod(r.method))

  if (activeTier.value !== 'all') list = list.filter(r => r.tier_type === activeTier.value)

  return list
})

// ─── Detail modal ─────────────────────────────────────────────────────────────
const detailRow = ref<any>(null)
function openDetail(row: any) { detailRow.value = row }

// ─── Helpers ─────────────────────────────────────────────────────────────────
const METHOD_LABELS: Record<string, string> = {
  QRIS:      'QRIS',
  SHOPEEPAY: 'ShopeePay',
  DANA:      'DANA',
  OVO:       'OVO',
  BRIVA:     'BRI VA',
  BNIVA:     'BNI VA',
  MANDIRIVA: 'Mandiri VA',
  BCAVA:     'BCA VA',
  ADMIN:     'Admin Panel',
  MANUAL:    'Manual (Disetujui Admin)',
}
function methodLabel(m: string) { return METHOD_LABELS[m] || m }

function formatRupiah(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-from > *, .modal-leave-to > * { transform: translateY(20px); }
</style>
