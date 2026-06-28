<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-lg mx-auto space-y-6 pb-12">

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <div class="w-8 h-8 border-2 border-[#3358ff] border-t-transparent rounded-full animate-spin" />
      <span class="text-sm">Memuat data pembayaran...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error || !payment" class="text-center py-20 space-y-3">
      <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
        <UIcon name="i-tabler-alert-circle" class="w-7 h-7 text-red-500" />
      </div>
      <p class="font-semibold text-slate-800">Transaksi tidak ditemukan</p>
      <NuxtLink to="/member/upgrade" class="text-sm text-[#3358ff] hover:underline">← Kembali ke Upgrade</NuxtLink>
    </div>

    <template v-else>

      <!-- Header status -->
      <div class="text-center space-y-1">
        <h1 class="text-xl font-extrabold text-slate-900">
          {{ statusTitle }}
        </h1>
        <p class="text-sm text-slate-500">
          Upgrade ke
          <span class="font-semibold" :class="payment.tier_type === 'premium' ? 'text-purple-600' : 'text-[#3358ff]'">
            {{ payment.tier_type === 'premium' ? 'Premium' : 'Pro' }}
          </span>
          — {{ payment.months }} bulan
        </p>
      </div>

      <!-- Status PAID -->
      <div v-if="payment.status === 'paid'"
        class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
          <UIcon name="i-tabler-circle-check" class="w-8 h-8 text-emerald-500" />
        </div>
        <p class="font-bold text-emerald-800">Pembayaran Berhasil! 🎉</p>
        <p class="text-sm text-emerald-700">Akun kamu sudah diupgrade. Nikmati fitur {{ payment.tier_type === 'premium' ? 'Premium' : 'Pro' }}!</p>
        <NuxtLink to="/member/links"
          class="inline-flex items-center gap-2 mt-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
          <UIcon name="i-tabler-arrow-right" class="w-4 h-4" />
          Mulai Edit Link Bio
        </NuxtLink>
      </div>

      <!-- Status FAILED / EXPIRED / CANCELLED -->
      <div v-else-if="['failed', 'expired', 'cancelled'].includes(payment.status)"
        class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
          <UIcon name="i-tabler-circle-x" class="w-8 h-8 text-red-500" />
        </div>
        <p class="font-bold text-red-800">
          {{ payment.status === 'expired' ? 'Transaksi Kedaluwarsa' : payment.status === 'cancelled' ? 'Transaksi Dibatalkan' : 'Pembayaran Gagal' }}
        </p>
        <p class="text-sm text-red-700">Silakan coba lagi dari halaman upgrade.</p>
        <NuxtLink to="/member/upgrade"
          class="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition">
          Coba Lagi
        </NuxtLink>
      </div>

      <!-- Status PENDING -->
      <template v-else>

        <!-- Countdown -->
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-800">
          <UIcon name="i-tabler-clock" class="w-5 h-5 flex-shrink-0" />
          <div>
            Selesaikan pembayaran sebelum:
            <span class="font-bold ml-1">{{ countdown }}</span>
          </div>
        </div>

        <!-- QRIS -->
        <div v-if="payment.method === 'QRIS' && (payment.qr_url || payment.qr_string)"
          class="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <p class="font-bold text-slate-800 flex items-center justify-center gap-2">
            <UIcon name="i-tabler-qrcode" class="w-5 h-5" />
            Scan QR Code
          </p>
          <img v-if="payment.qr_url" :src="payment.qr_url" alt="QR Code" class="w-48 h-48 mx-auto rounded-xl" />
          <div v-else class="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center">
            <UIcon name="i-tabler-qrcode" class="w-20 h-20 text-slate-400" />
          </div>
          <p class="text-xs text-slate-500">Buka aplikasi GoPay, OVO, DANA, ShopeePay, atau mobile banking apapun</p>
          <div class="bg-slate-50 rounded-xl p-3 text-center">
            <div class="text-xs text-slate-400 mb-0.5">Nominal</div>
            <div class="text-xl font-extrabold text-[#3358ff]">Rp {{ formatRupiah(payment.amount) }}</div>
          </div>
        </div>

        <!-- Virtual Account -->
        <div v-else-if="payment.pay_code && payment.method_type === 'direct'"
          class="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <p class="font-bold text-slate-800 flex items-center gap-2">
            <UIcon name="i-tabler-building-bank" class="w-5 h-5 text-[#3358ff]" />
            {{ channelName }}
          </p>
          <div class="bg-slate-50 rounded-xl p-4 space-y-3">
            <div>
              <div class="text-xs text-slate-400 mb-1">Nomor Virtual Account</div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-mono font-extrabold text-slate-900 tracking-wider flex-1 min-w-0 break-all">
                  {{ payment.pay_code }}
                </span>
                <button @click="copyVA" class="p-2 rounded-lg hover:bg-slate-200 transition" title="Salin">
                  <UIcon :name="copied ? 'i-tabler-check' : 'i-tabler-copy'" class="w-4 h-4" :class="copied ? 'text-emerald-500' : 'text-slate-500'" />
                </button>
              </div>
            </div>
            <div class="border-t border-slate-200 pt-3">
              <div class="text-xs text-slate-400 mb-0.5">Nominal Transfer</div>
              <div class="text-lg font-extrabold text-[#3358ff]">Rp {{ formatRupiah(payment.amount) }}</div>
              <div class="text-xs text-amber-600 mt-0.5">⚠️ Transfer TEPAT sesuai nominal di atas</div>
            </div>
          </div>
        </div>

        <!-- Redirect (e-wallet) -->
        <div v-else-if="payment.pay_url || payment.checkout_url"
          class="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-[#3358ff]/10 flex items-center justify-center mx-auto">
            <UIcon name="i-tabler-external-link" class="w-7 h-7 text-[#3358ff]" />
          </div>
          <p class="font-bold text-slate-800">Selesaikan Pembayaran</p>
          <p class="text-sm text-slate-500">Klik tombol di bawah untuk membayar via {{ channelName }}</p>
          <div class="bg-slate-50 rounded-xl p-3">
            <div class="text-xs text-slate-400 mb-0.5">Nominal</div>
            <div class="text-xl font-extrabold text-[#3358ff]">Rp {{ formatRupiah(payment.amount) }}</div>
          </div>
          <a :href="payment.pay_url || payment.checkout_url" target="_blank"
            class="inline-flex items-center gap-2 bg-[#3358ff] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#2244ee] transition w-full justify-center">
            <UIcon name="i-tabler-external-link" class="w-4 h-4" />
            Bayar Sekarang
          </a>
        </div>

        <!-- Polling indicator -->
        <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
          <div class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          Mengecek status pembayaran otomatis...
        </div>

        <!-- Checkout URL fallback -->
        <div v-if="payment.checkout_url" class="text-center">
          <a :href="payment.checkout_url" target="_blank"
            class="text-xs text-slate-400 hover:text-slate-600 underline">
            Lihat di halaman Tripay →
          </a>
        </div>

        <!-- Ganti Metode -->
        <div class="border-t border-slate-100 pt-4 space-y-2">
          <button @click="showCancelConfirm = true"
            :disabled="cancelling"
            class="w-full py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50">
            Batalkan & Pilih Metode Lain
          </button>
          <p class="text-xs text-slate-400 text-center">
            Setelah membatalkan, tutup tab ini sebelum memilih metode baru.
          </p>
        </div>

      </template>

      <!-- Info footer -->
      <div class="border-t border-slate-100 pt-4 text-xs text-slate-400 space-y-1">
        <div class="flex justify-between">
          <span>Referensi</span>
          <span class="font-mono text-slate-600">{{ payment.merchant_ref }}</span>
        </div>
        <div class="flex justify-between">
          <span>Metode</span>
          <span class="text-slate-600">{{ channelName }}</span>
        </div>
        <div class="flex justify-between">
          <span>Status</span>
          <span :class="statusBadgeClass" class="font-semibold">{{ statusLabel }}</span>
        </div>
      </div>

      <NuxtLink to="/member/upgrade" class="block text-center text-sm text-slate-400 hover:text-slate-600">
        ← Kembali ke Upgrade
      </NuxtLink>

    </template>
  </div>

  <!-- ===== CELEBRATION MODAL ===== -->
  <Teleport to="body">
    <Transition name="celebrate">
      <div v-if="showCelebration"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div class="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

          <!-- Gradient header -->
          <div class="relative px-6 pt-10 pb-8 text-center"
            :class="celebrationTier === 'premium'
              ? 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-[#3358ff] via-blue-500 to-emerald-400'">
            <!-- Confetti dots -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
              <span v-for="i in 12" :key="i"
                class="absolute w-2 h-2 rounded-full opacity-70 animate-confetti"
                :style="confettiStyle(i)" />
            </div>
            <!-- Animated check -->
            <div class="relative w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center mx-auto mb-4 animate-pop">
              <UIcon name="i-tabler-circle-check" class="w-11 h-11 text-white" />
            </div>
            <h2 class="text-2xl font-extrabold text-white leading-tight">Upgrade Berhasil!</h2>
            <p class="text-white/80 text-sm mt-1">🎉 Akun kamu sekarang</p>
          </div>

          <!-- Body -->
          <div class="px-6 py-6 space-y-4">
            <div class="flex items-center justify-center">
              <span class="text-lg font-extrabold px-6 py-2 rounded-full"
                :class="celebrationTier === 'premium'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-[#3358ff]/10 text-[#3358ff]'">
                {{ celebrationTier === 'premium' ? '⭐ Premium' : '🚀 Pro' }}
              </span>
            </div>

            <div class="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Durasi</span>
                <span class="font-semibold text-slate-800">{{ celebrationMonths }} bulan</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Total dibayar</span>
                <span class="font-semibold text-slate-800">Rp {{ formatRupiah(celebrationAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Aktif hingga ±</span>
                <span class="font-semibold text-emerald-600">{{ celebrationExpiry }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <button @click="goEditLinks"
                class="w-full py-3 font-bold text-sm text-white rounded-xl transition"
                :class="celebrationTier === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90'
                  : 'bg-[#3358ff] hover:bg-[#2244ee]'">
                ✨ Mulai Edit Link Bio
              </button>
              <button @click="goUpgradePage"
                class="w-full py-2.5 font-medium text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
                Lihat Detail Akun
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ===== CANCEL CONFIRM DIALOG ===== -->
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
                Jika kamu sudah membayar di tab atau aplikasi lain, upgrade tetap akan diproses otomatis.
              </p>
              <p class="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                ⚠️ Tutup tab pembayaran lama setelah membatalkan agar tidak terjadi pembayaran ganda.
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="showCancelConfirm = false"
              class="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              Kembali
            </button>
            <button @click="cancelPayment"
              :disabled="cancelling"
              class="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-1.5">
              <UIcon v-if="cancelling" name="i-tabler-loader-2" class="w-4 h-4 animate-spin" />
              {{ cancelling ? 'Membatalkan...' : 'Ya, Batalkan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member' })

const route       = useRoute()
const merchantRef = route.params.ref as string
const { fetchStore } = useMember()

// ─── Payment data ─────────────────────────────────────────────────────────────
const { data: paymentRes, pending, error, refresh } = await useFetch<any>(
  `/api/member/payment/${merchantRef}`,
  { default: () => null },
)
const payment = computed(() => paymentRes.value)

// ─── Celebration modal ────────────────────────────────────────────────────────
const showCelebration   = ref(false)
const celebrationTier   = ref<'pro' | 'premium'>('pro')
const celebrationMonths = ref(1)
const celebrationAmount = ref(0)
const celebrationExpiry = ref('')
const celebrationFired  = ref(false)

function triggerCelebration() {
  if (!payment.value) return
  celebrationTier.value   = payment.value.tier_type || 'pro'
  celebrationMonths.value = payment.value.months    || 1
  celebrationAmount.value = payment.value.amount    || 0
  const exp = new Date()
  exp.setMonth(exp.getMonth() + celebrationMonths.value)
  celebrationExpiry.value = exp.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  showCelebration.value   = true
  fetchStore()   // refresh tier badge sidebar
}

function confettiStyle(i: number) {
  const colors = ['#fff', '#fde68a', '#86efac', '#a5b4fc', '#f9a8d4', '#67e8f9']
  return {
    background:      colors[i % colors.length],
    left:            `${(i * 8.3) % 100}%`,
    top:             `${(i * 13 + 10) % 80}%`,
    animationDelay:  `${(i * 0.15) % 1}s`,
  }
}

function goEditLinks()  { showCelebration.value = false; navigateTo('/member/links') }
function goUpgradePage() { showCelebration.value = false; navigateTo('/member/upgrade') }

// ─── Polling ──────────────────────────────────────────────────────────────────
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // Halaman dibuka dan sudah paid → langsung tampilkan celebration
  if (payment.value?.status === 'paid' && !celebrationFired.value) {
    celebrationFired.value = true
    triggerCelebration()
  }

  if (payment.value?.status === 'pending') {
    pollTimer = setInterval(async () => {
      await refresh()
      if (payment.value?.status !== 'pending') {
        if (pollTimer) clearInterval(pollTimer)
        if (payment.value?.status === 'paid' && !celebrationFired.value) {
          celebrationFired.value = true
          triggerCelebration()
        }
      }
    }, 5000)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

watch(() => payment.value?.status, (s) => {
  if (s !== 'pending' && pollTimer) { clearInterval(pollTimer); pollTimer = null }
  if (s === 'paid' && !celebrationFired.value) {
    celebrationFired.value = true
    triggerCelebration()
  }
})

// ─── Cancel & change method ───────────────────────────────────────────────────
const showCancelConfirm = ref(false)
const cancelling        = ref(false)

async function cancelPayment() {
  cancelling.value = true
  try {
    await $fetch('/api/member/payment/cancel', {
      method: 'POST',
      body:   { merchant_ref: merchantRef },
    })
    showCancelConfirm.value = false
    await navigateTo('/member/upgrade')
  } catch {
    showCancelConfirm.value = false
    await refresh()
  } finally {
    cancelling.value = false
  }
}

// ─── Countdown ────────────────────────────────────────────────────────────────
const countdown = ref('')
function updateCountdown() {
  if (!payment.value?.expired_at) { countdown.value = ''; return }
  const diff = new Date(payment.value.expired_at).getTime() - Date.now()
  if (diff <= 0) { countdown.value = 'Kedaluwarsa'; return }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  countdown.value = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}
let cdTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => { updateCountdown(); cdTimer = setInterval(updateCountdown, 1000) })
onUnmounted(() => { if (cdTimer) clearInterval(cdTimer) })

// ─── Copy VA ─────────────────────────────────────────────────────────────────
const copied = ref(false)
function copyVA() {
  if (!payment.value?.pay_code) return
  navigator.clipboard.writeText(payment.value.pay_code)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Computed helpers ─────────────────────────────────────────────────────────
const CHANNEL_NAMES: Record<string, string> = {
  QRIS: 'QRIS', SHOPEEPAY: 'ShopeePay', DANA: 'DANA', OVO: 'OVO',
  BRIVA: 'BRI Virtual Account', BNIVA: 'BNI Virtual Account',
  MANDIRIVA: 'Mandiri Virtual Account', BCAVA: 'BCA Virtual Account',
}
const channelName = computed(() =>
  payment.value?.method ? (CHANNEL_NAMES[payment.value.method] || payment.value.method) : '-',
)

const statusTitle = computed(() => ({
  paid:      'Pembayaran Berhasil!',
  failed:    'Pembayaran Gagal',
  expired:   'Transaksi Kedaluwarsa',
  cancelled: 'Transaksi Dibatalkan',
}[payment.value?.status] || 'Menunggu Pembayaran'))

const statusLabel = computed(() => ({
  paid:      'LUNAS',
  failed:    'GAGAL',
  expired:   'KEDALUWARSA',
  cancelled: 'DIBATALKAN',
}[payment.value?.status] || 'MENUNGGU'))

const statusBadgeClass = computed(() => ({
  paid:      'text-emerald-600',
  failed:    'text-red-500',
  expired:   'text-orange-500',
  cancelled: 'text-slate-400',
}[payment.value?.status] || 'text-amber-600'))

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID').format(n)
}
</script>

<style scoped>
/* Celebration overlay */
.celebrate-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.celebrate-leave-active { transition: all 0.2s ease; }
.celebrate-enter-from, .celebrate-leave-to { opacity: 0; }
.celebrate-enter-from > * { transform: scale(0.85) translateY(20px); }

/* Animated check icon */
@keyframes pop {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
.animate-pop { animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }

/* Confetti dots in header */
@keyframes confetti-fall {
  0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
}
.animate-confetti { animation: confetti-fall 1.5s ease-in infinite; }

/* Cancel confirm dialog */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-from > *, .modal-leave-to > * { transform: translateY(20px); }
</style>
