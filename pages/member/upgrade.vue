<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-6 pb-10">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900">Upgrade Akun</h1>
      <p class="text-sm text-slate-500 mt-0.5">Pilih paket yang sesuai kebutuhanmu</p>
    </div>

    <!-- Current tier badge -->
    <div class="flex items-center gap-2 text-sm">
      <span class="text-slate-500">Paket aktif:</span>
      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
        :class="currentTierBadge">{{ currentTierLabel }}</span>
      <span v-if="upgradeStatus?.tier_expires_at" class="text-slate-400">
        · berlaku hingga {{ formatDate(upgradeStatus.tier_expires_at) }}
      </span>
    </div>

    <!-- ⚠️ Pending payment banner -->
    <div v-if="pendingPayment" ref="pendingBannerRef"
      class="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <UIcon name="i-tabler-clock" class="w-5 h-5 text-amber-600" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-amber-900 text-sm">Ada pembayaran yang belum selesai</p>
          <p class="text-xs text-amber-700 mt-0.5">
            Upgrade ke <span class="font-bold">{{ pendingPayment.tier_type === 'premium' ? 'Premium' : 'Pro' }}</span>
            · {{ pendingPayment.months }} bulan
            · Rp {{ formatRupiah(pendingPayment.amount) }}
            via {{ channelLabel(pendingPayment.method) }}
          </p>
        </div>
      </div>
      <div class="flex gap-2 pl-12">
        <NuxtLink :to="`/member/payment/${pendingPayment.id}`"
          class="flex-1 py-2 text-xs font-semibold text-center text-amber-800 bg-amber-100 border border-amber-300 rounded-xl hover:bg-amber-200 transition">
          Lanjut Bayar
        </NuxtLink>
        <button @click="confirmCancelPending"
          :disabled="cancellingPending"
          class="flex-1 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-1">
          <UIcon v-if="cancellingPending" name="i-tabler-loader-2" class="w-3 h-3 animate-spin" />
          {{ cancellingPending ? 'Membatalkan...' : 'Batalkan & Pilih Ulang' }}
        </button>
      </div>
    </div>

    <!-- Plan cards -->
    <div class="grid gap-4 sm:grid-cols-3">

      <!-- FREE -->
      <div class="border-2 rounded-2xl p-5 space-y-4"
        :class="currentTier === 'free' ? 'border-slate-300 bg-slate-50' : 'border-slate-200 bg-white'">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="font-extrabold text-slate-800 text-lg">Free</span>
            <span v-if="currentTier === 'free'"
              class="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">Aktif</span>
          </div>
          <div class="text-2xl font-extrabold text-slate-900">Rp 0</div>
          <div class="text-xs text-slate-400 mt-0.5">Selamanya gratis</div>
        </div>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> 5 link maksimal</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Tampilan default</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Halaman toko + produk</li>
          <li class="flex items-center gap-2 opacity-40"><UIcon name="i-tabler-x" class="w-4 h-4 flex-shrink-0" /> Custom card style</li>
          <li class="flex items-center gap-2 opacity-40"><UIcon name="i-tabler-x" class="w-4 h-4 flex-shrink-0" /> Analytics klik</li>
          <li class="flex items-center gap-2 opacity-40"><UIcon name="i-tabler-x" class="w-4 h-4 flex-shrink-0" /> Branding Lakara muncul</li>
        </ul>
      </div>

      <!-- PRO -->
      <div class="border-2 rounded-2xl p-5 space-y-4 relative overflow-hidden"
        :class="currentTier === 'pro' ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-[#3358ff]/30 bg-white'">
        <div class="absolute top-0 left-0 right-0 h-1 bg-[#3358ff]" />
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="font-extrabold text-[#3358ff] text-lg">Pro</span>
            <span v-if="currentTier === 'pro'"
              class="text-xs bg-[#3358ff] text-white px-2 py-0.5 rounded-full font-semibold">Aktif</span>
            <span v-else class="text-xs bg-[#3358ff]/10 text-[#3358ff] px-2 py-0.5 rounded-full font-semibold">Populer</span>
          </div>
          <div class="text-2xl font-extrabold text-slate-900">
            Rp {{ formatRupiah(upgradeStatus?.pro_price ?? 9000) }}
          </div>
          <div class="text-xs text-slate-400 mt-0.5">per bulan</div>
        </div>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Link <strong>tak terbatas</strong></li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Custom card style</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Warna & sudut tombol</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Link unggulan (featured)</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Analitik klik dasar</li>
          <li class="flex items-center gap-2 opacity-40"><UIcon name="i-tabler-x" class="w-4 h-4 flex-shrink-0" /> Branding Lakara muncul</li>
        </ul>
        <button v-if="currentTier === 'free'"
          @click="openPaymentModal('pro')"
          class="w-full py-2.5 bg-[#3358ff] text-white text-sm font-bold rounded-xl hover:bg-[#2244ee] transition">
          Upgrade ke Pro
        </button>
      </div>

      <!-- PREMIUM -->
      <div class="border-2 rounded-2xl p-5 space-y-4 relative overflow-hidden"
        :class="currentTier === 'premium' ? 'border-purple-500 bg-purple-50' : 'border-purple-200 bg-white'">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="font-extrabold text-purple-700 text-lg">Premium</span>
            <span v-if="currentTier === 'premium'"
              class="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold">Aktif</span>
          </div>
          <div class="text-2xl font-extrabold text-slate-900">
            Rp {{ formatRupiah(upgradeStatus?.premium_price ?? 35000) }}
          </div>
          <div class="text-xs text-slate-400 mt-0.5">per bulan</div>
        </div>
        <ul class="space-y-2 text-sm text-slate-600">
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Semua fitur Pro</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Hapus branding Lakara</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Analitik advanced (harian)</li>
          <li class="flex items-center gap-2"><UIcon name="i-tabler-check" class="w-4 h-4 text-emerald-500 flex-shrink-0" /> Prioritas support</li>
        </ul>
        <button v-if="currentTier === 'free' || currentTier === 'pro'"
          @click="openPaymentModal('premium')"
          class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold rounded-xl hover:opacity-90 transition">
          Upgrade ke Premium
        </button>
      </div>

    </div>

    <!-- ===== RIWAYAT TRANSAKSI ===== -->
    <div class="space-y-3 pt-2">
      <h2 class="text-base font-extrabold text-slate-900">Riwayat Transaksi</h2>

      <div v-if="historyLoading" class="flex items-center gap-2 text-sm text-slate-400 py-4">
        <div class="w-4 h-4 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin" />
        Memuat riwayat...
      </div>

      <div v-else-if="!paymentHistory.length"
        class="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-8 text-center text-slate-400 text-sm">
        Belum ada riwayat transaksi
      </div>

      <div v-else class="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
        <div v-for="p in paymentHistory" :key="p.id"
          class="flex items-center gap-3 px-4 py-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
            :class="p.tier_type === 'premium' ? 'bg-purple-100' : 'bg-[#3358ff]/10'">
            {{ p.tier_type === 'premium' ? '⭐' : '🚀' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-slate-800">
              {{ p.tier_type === 'premium' ? 'Premium' : 'Pro' }} · {{ p.months }} bulan
            </div>
            <div class="text-xs text-slate-400 mt-0.5">
              {{ formatDateTime(p.created_at) }} · {{ channelLabel(p.method) }}
            </div>
          </div>
          <div class="text-right flex-shrink-0 space-y-1">
            <div class="text-sm font-bold text-slate-800">Rp {{ formatRupiah(p.amount) }}</div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="historyStatusClass(p.status)">
              {{ historyStatusLabel(p.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== MODAL: Pilih Metode Pembayaran ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="closeModal">
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">

            <div class="border-b border-slate-100 px-5 py-4 flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="selectedTier === 'premium' ? 'bg-purple-100' : 'bg-[#3358ff]/10'">
                <UIcon name="i-tabler-credit-card" class="w-5 h-5"
                  :class="selectedTier === 'premium' ? 'text-purple-600' : 'text-[#3358ff]'" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-slate-900">Upgrade ke {{ selectedTier === 'premium' ? 'Premium' : 'Pro' }}</h3>
                <p class="text-xs text-slate-400">Rp {{ formatRupiah(selectedPrice) }}/bulan</p>
              </div>
              <button @click="closeModal" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                <UIcon name="i-tabler-x" class="w-5 h-5" />
              </button>
            </div>

            <div class="p-5 space-y-4">
              <!-- Pilih durasi -->
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700">Durasi Langganan</label>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="d in durationOptions" :key="d.months" @click="selectedMonths = d.months"
                    class="relative p-3 rounded-xl border-2 text-left transition"
                    :class="selectedMonths === d.months ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
                    <span v-if="d.badge" class="absolute -top-2 right-2 text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-md leading-none">{{ d.badge }}</span>
                    <div class="text-sm font-bold text-slate-800">{{ d.label }}</div>
                    <div class="text-[11px] mt-0.5" :class="d.months === 12 ? 'text-emerald-600 font-semibold' : 'text-slate-400'">{{ d.sub }}</div>
                  </button>
                </div>
              </div>

              <div class="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div class="text-sm text-slate-500">Total Pembayaran</div>
                  <div v-if="selectedMonths === 12" class="text-[11px] text-emerald-600 font-semibold">Akses 12 bulan · bayar 10</div>
                </div>
                <div class="text-lg font-extrabold" :class="selectedTier === 'premium' ? 'text-purple-700' : 'text-[#3358ff]'">
                  Rp {{ formatRupiah(totalPrice) }}
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-700">Pilih Metode Pembayaran</label>

                <p class="text-xs text-slate-400 uppercase tracking-widest mt-3 mb-1">E-Wallet & QRIS</p>
                <div class="space-y-2">
                  <button v-for="ch in availableChannels.filter(c => c.group === 'E-Wallet')" :key="ch.code"
                    @click="selectedMethod = ch.code"
                    class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition"
                    :class="selectedMethod === ch.code ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300 bg-white'">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="selectedMethod === ch.code ? 'bg-[#3358ff]/10' : 'bg-slate-100'">
                      <UIcon :name="channelIcon(ch.code)" class="w-4 h-4"
                        :class="selectedMethod === ch.code ? 'text-[#3358ff]' : 'text-slate-500'" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm font-semibold text-slate-800">{{ ch.name }}</div>
                      <div class="text-xs text-slate-400">{{ ch.type === 'direct' ? 'Scan QR' : 'Redirect ke aplikasi' }}</div>
                    </div>
                    <div v-if="selectedMethod === ch.code"
                      class="w-5 h-5 rounded-full bg-[#3358ff] flex items-center justify-center flex-shrink-0">
                      <UIcon name="i-tabler-check" class="w-3 h-3 text-white" />
                    </div>
                  </button>
                </div>

                <template v-if="availableChannels.some(c => c.group === 'Virtual Account')">
                  <p class="text-xs text-slate-400 uppercase tracking-widest mt-3 mb-1">Virtual Account</p>
                  <div class="space-y-2">
                    <button v-for="ch in availableChannels.filter(c => c.group === 'Virtual Account')" :key="ch.code"
                      @click="selectedMethod = ch.code"
                      class="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition"
                      :class="selectedMethod === ch.code ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300 bg-white'">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        :class="selectedMethod === ch.code ? 'bg-[#3358ff]/10' : 'bg-slate-100'">
                        <UIcon name="i-tabler-building-bank" class="w-4 h-4"
                          :class="selectedMethod === ch.code ? 'text-[#3358ff]' : 'text-slate-500'" />
                      </div>
                      <div class="flex-1">
                        <div class="text-sm font-semibold text-slate-800">{{ ch.name }}</div>
                        <div class="text-xs text-slate-400">Transfer via ATM / m-Banking</div>
                      </div>
                      <div v-if="selectedMethod === ch.code"
                        class="w-5 h-5 rounded-full bg-[#3358ff] flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-tabler-check" class="w-3 h-3 text-white" />
                      </div>
                    </button>
                  </div>
                </template>
              </div>

              <div v-if="payError" class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                <UIcon name="i-tabler-alert-circle" class="w-4 h-4 flex-shrink-0" />
                {{ payError }}
              </div>
            </div>

            <div class="px-5 pb-5 flex gap-2">
              <button @click="closeModal"
                class="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Batal
              </button>
              <button @click="submitPayment" :disabled="!selectedMethod || submitting"
                class="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                :class="selectedTier === 'premium' ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90' : 'bg-[#3358ff] hover:bg-[#2244ee]'">
                <UIcon v-if="submitting" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" />
                {{ submitting ? 'Memproses...' : 'Bayar Sekarang' }}
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== CANCEL PENDING CONFIRM ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCancelConfirm"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="showCancelConfirm = false">
          <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <UIcon name="i-tabler-alert-triangle" class="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900">Batalkan Pembayaran?</h3>
                <p class="text-sm text-slate-500 mt-1">
                  Jika kamu sudah membayar di tab lain, upgrade tetap akan diproses otomatis. Tutup tab pembayaran lama setelah membatalkan.
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="showCancelConfirm = false"
                class="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Kembali
              </button>
              <button @click="doCancelPending"
                :disabled="cancellingPending"
                class="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                <UIcon v-if="cancellingPending" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" />
                {{ cancellingPending ? 'Membatalkan...' : 'Ya, Batalkan' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast"
          class="fixed bottom-28 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <UIcon :name="toastType === 'error' ? 'i-tabler-x' : 'i-tabler-check'" class="w-4 h-4" />
          {{ toast }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member' })

const { storeData } = useMember()
const store       = computed(() => storeData.value)
const currentTier = computed(() => store.value?.product_tier || 'free')

const currentTierLabel = computed(() => ({ free: 'Free', pro: 'Pro', premium: 'Premium' }[currentTier.value] || 'Free'))
const currentTierBadge = computed(() => ({
  free:    'bg-slate-100 text-slate-500',
  pro:     'bg-[#3358ff]/10 text-[#3358ff]',
  premium: 'bg-purple-100 text-purple-700',
}[currentTier.value] || 'bg-slate-100 text-slate-500'))

// ─── Pricing ─────────────────────────────────────────────────────────────────
const { data: upgradeStatus } = await useFetch<any>('/api/member/upgrade-status')

// ─── Channels ────────────────────────────────────────────────────────────────
const ALL_CHANNELS = [
  { code: 'QRIS',      name: 'QRIS',                    group: 'E-Wallet',        type: 'direct',   minAmount: 1000  },
  { code: 'SHOPEEPAY', name: 'ShopeePay',               group: 'E-Wallet',        type: 'redirect', minAmount: 1000  },
  { code: 'DANA',      name: 'DANA',                    group: 'E-Wallet',        type: 'redirect', minAmount: 1000  },
  { code: 'BRIVA',     name: 'BRI Virtual Account',     group: 'Virtual Account', type: 'direct',   minAmount: 10000 },
  { code: 'BNIVA',     name: 'BNI Virtual Account',     group: 'Virtual Account', type: 'direct',   minAmount: 10000 },
  { code: 'MANDIRIVA', name: 'Mandiri Virtual Account',  group: 'Virtual Account', type: 'direct',   minAmount: 10000 },
  { code: 'BCAVA',     name: 'BCA Virtual Account',     group: 'Virtual Account', type: 'direct',   minAmount: 10000 },
]
const CHANNEL_NAMES: Record<string, string> = {
  QRIS: 'QRIS', SHOPEEPAY: 'ShopeePay', DANA: 'DANA', OVO: 'OVO',
  BRIVA: 'BRI VA', BNIVA: 'BNI VA', MANDIRIVA: 'Mandiri VA', BCAVA: 'BCA VA',
}
function channelLabel(code: string) { return CHANNEL_NAMES[code] || code }
function channelIcon(code: string)  {
  return { QRIS: 'i-tabler-qrcode', SHOPEEPAY: 'i-tabler-shopping-bag', DANA: 'i-tabler-wallet', OVO: 'i-tabler-wallet' }[code] || 'i-tabler-credit-card'
}

// ─── Pending payment ──────────────────────────────────────────────────────────
const pendingPayment    = ref<any>(null)
const pendingBannerRef  = ref<HTMLElement | null>(null)
const showCancelConfirm = ref(false)
const cancellingPending = ref(false)

async function fetchPendingPayment() {
  try {
    const res = await $fetch<any>('/api/member/payment/pending')
    pendingPayment.value = res.payment || null
  } catch { pendingPayment.value = null }
}

function confirmCancelPending() { showCancelConfirm.value = true }

async function doCancelPending() {
  if (!pendingPayment.value) return
  cancellingPending.value = true
  try {
    await $fetch('/api/member/payment/cancel', {
      method: 'POST',
      body:   { merchant_ref: pendingPayment.value.id },
    })
    pendingPayment.value    = null
    showCancelConfirm.value = false
    showToast('Pembayaran dibatalkan. Silakan pilih metode baru.')
  } catch (e: any) {
    showCancelConfirm.value = false
    showToast(e?.data?.statusMessage || 'Gagal membatalkan.', 'error')
  } finally {
    cancellingPending.value = false
  }
}

// ─── Payment history ──────────────────────────────────────────────────────────
const paymentHistory = ref<any[]>([])
const historyLoading = ref(false)

async function fetchPaymentHistory() {
  historyLoading.value = true
  try {
    const res = await $fetch<any>('/api/member/payments')
    paymentHistory.value = res.payments || []
  } catch { paymentHistory.value = [] }
  finally { historyLoading.value = false }
}

function historyStatusLabel(s: string) {
  return { paid: 'LUNAS', pending: 'MENUNGGU', cancelled: 'DIBATALKAN', expired: 'KEDALUWARSA', failed: 'GAGAL' }[s] || s.toUpperCase()
}
function historyStatusClass(s: string) {
  return {
    paid:      'bg-emerald-100 text-emerald-700',
    pending:   'bg-amber-100 text-amber-700',
    cancelled: 'bg-slate-100 text-slate-500',
    expired:   'bg-orange-100 text-orange-600',
    failed:    'bg-red-100 text-red-600',
  }[s] || 'bg-slate-100 text-slate-500'
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const showModal      = ref(false)
const selectedTier   = ref<'pro' | 'premium'>('pro')
const selectedMethod = ref('')
const submitting     = ref(false)
const payError       = ref('')
const toast          = ref('')
const toastType      = ref<'success' | 'error'>('success')

const selectedMonths = ref(1)
const selectedPrice = computed(() =>
  selectedTier.value === 'premium'
    ? (upgradeStatus.value?.premium_price ?? 35000)
    : (upgradeStatus.value?.pro_price     ?? 9000),
)
// Annual: bayar 10 bln, dapat 12 (hemat 2 bln)
const billedMonths = computed(() => selectedMonths.value === 12 ? 10 : selectedMonths.value)
const totalPrice = computed(() => selectedPrice.value * billedMonths.value)
const annualSaving = computed(() => selectedPrice.value * 2)
const durationOptions = computed(() => [
  { months: 1,  label: '1 Bulan',  sub: `Rp ${formatRupiah(selectedPrice.value)}/bln`, badge: '' },
  { months: 12, label: '12 Bulan', sub: `Hemat Rp ${formatRupiah(annualSaving.value)}`, badge: 'TERBAIK' },
])
const availableChannels = computed(() =>
  ALL_CHANNELS.filter(ch => totalPrice.value >= ch.minAmount),
)

function openPaymentModal(tier: 'pro' | 'premium') {
  if (pendingPayment.value) {
    pendingBannerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    showToast('Selesaikan atau batalkan pembayaran yang ada dulu.', 'error')
    return
  }
  selectedTier.value   = tier
  selectedMethod.value = 'QRIS'
  selectedMonths.value = 1
  payError.value       = ''
  showModal.value      = true
}

function closeModal() {
  if (submitting.value) return
  showModal.value = false
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value     = msg
  toastType.value = type
  setTimeout(() => { toast.value = '' }, 4000)
}

async function submitPayment() {
  if (!selectedMethod.value) return
  submitting.value = true
  payError.value   = ''
  try {
    const res = await $fetch<any>('/api/member/payment/create', {
      method: 'POST',
      body:   { tier_type: selectedTier.value, payment_method: selectedMethod.value, months: selectedMonths.value },
    })
    showModal.value = false
    if (res.method_type === 'redirect' && res.pay_url) window.open(res.pay_url, '_blank')
    await navigateTo(`/member/payment/${res.merchant_ref}`)
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.message || 'Gagal membuat transaksi.'
    if (msg.toLowerCase().includes('belum selesai')) {
      showModal.value = false
      await fetchPendingPayment()
      pendingBannerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      showToast('Selesaikan atau batalkan pembayaran yang ada dulu.', 'error')
    } else {
      payError.value = msg
    }
  } finally {
    submitting.value = false
  }
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatRupiah(n: number) { return new Intl.NumberFormat('id-ID').format(n) }
function formatDate(d: string)   { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }
function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  fetchPendingPayment()
  fetchPaymentHistory()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-from > *, .modal-leave-to > * { transform: translateY(20px); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
