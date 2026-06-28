<template>
  <div>
    <Head>
      <Title>Kalkulator Estimasi Harga — Lakara</Title>
      <Meta name="description" content="Hitung estimasi biaya proyek digital Anda secara instan. Website, mobile app, social media management, esports talent , transparan & tanpa biaya tersembunyi." />
    </Head>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-24 pb-16">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative text-center">
        <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Kalkulator Harga
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Estimasi Biaya Proyek<br class="hidden md:block" /> Anda dalam 60 Detik
        </h1>
        <p class="text-gray-500 text-lg max-w-xl mx-auto">
          Pilih layanan dan fitur yang dibutuhkan , dapatkan estimasi harga transparan langsung di sini.
        </p>
      </UContainer>
    </section>

    <section class="py-10 bg-white">
      <UContainer>
        <div class="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">

          <!-- ── FORM (2/3) ── -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Step 1: Kategori -->
            <div class="bg-white rounded-2xl border-2 border-gray-100 p-6 space-y-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-7 h-7 bg-[#3358ff] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <h2 class="font-extrabold text-gray-900">Pilih Jenis Layanan</h2>
              </div>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="cat in categories" :key="cat.id"
                  @click="selectedCat = cat.id; selectedFeatures = []; selectedOptions = {}"
                  class="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200"
                  :class="selectedCat === cat.id
                    ? 'border-[#3358ff] bg-[#3358ff]/5 shadow-md'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'"
                >
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    :class="selectedCat === cat.id ? 'bg-[#3358ff]' : 'bg-gray-100'">
                    <UIcon :name="cat.icon" class="w-5 h-5" :class="selectedCat === cat.id ? 'text-white' : 'text-gray-500'" />
                  </div>
                  <div>
                    <div class="font-bold text-sm" :class="selectedCat === cat.id ? 'text-[#3358ff]' : 'text-gray-900'">{{ cat.label }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ cat.desc }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Step 2: Fitur (conditional) -->
            <div v-if="selectedCat && currentFeatures.length" class="bg-white rounded-2xl border-2 border-gray-100 p-6 space-y-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-7 h-7 bg-[#3358ff] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <h2 class="font-extrabold text-gray-900">Pilih Fitur yang Dibutuhkan</h2>
              </div>
              <div class="space-y-2">
                <label
                  v-for="feat in currentFeatures" :key="feat.id"
                  class="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all"
                  :class="selectedFeatures.includes(feat.id)
                    ? 'border-[#3358ff] bg-[#3358ff]/5'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'"
                >
                  <input type="checkbox" :value="feat.id" v-model="selectedFeatures"
                    class="mt-0.5 rounded border-gray-300 text-[#3358ff] cursor-pointer w-4 h-4 flex-shrink-0" />
                  <div class="flex-1">
                    <div class="font-semibold text-sm text-gray-900">{{ feat.label }}</div>
                    <div class="text-xs text-gray-500 mt-0.5">{{ feat.desc }}</div>
                  </div>
                  <div class="text-sm font-bold text-[#3358ff] flex-shrink-0">+{{ formatRp(feat.price) }}</div>
                </label>
              </div>
            </div>

            <!-- Step 3: Options -->
            <div v-if="selectedCat && currentOptions.length" class="bg-white rounded-2xl border-2 border-gray-100 p-6 space-y-5">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-7 h-7 bg-[#3358ff] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <h2 class="font-extrabold text-gray-900">Detail Tambahan</h2>
              </div>
              <div v-for="opt in currentOptions" :key="opt.id" class="space-y-2">
                <label class="text-sm font-semibold text-gray-700">{{ opt.label }}</label>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button
                    v-for="choice in opt.choices" :key="choice.id"
                    @click="selectedOptions[opt.id] = choice.id"
                    type="button"
                    class="p-3 rounded-xl border-2 text-left transition-all text-sm"
                    :class="selectedOptions[opt.id] === choice.id
                      ? 'border-[#3358ff] bg-[#3358ff]/5 text-[#3358ff] font-semibold'
                      : 'border-gray-100 text-gray-700 hover:border-gray-200'"
                  >
                    <div class="font-medium">{{ choice.label }}</div>
                    <div v-if="choice.price" class="text-xs mt-0.5 opacity-70">+{{ formatRp(choice.price) }}</div>
                    <div v-else class="text-xs mt-0.5 opacity-50">Termasuk</div>
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- ── RESULT SIDEBAR (1/3) ── -->
          <div class="space-y-5">
            <div class="sticky top-24">

              <!-- Estimasi -->
              <div class="bg-gradient-to-br from-[#3358ff] to-indigo-600 rounded-2xl p-6 text-white mb-5 shadow-xl shadow-blue-200">
                <div class="text-sm font-semibold text-blue-200 mb-1">Estimasi Harga</div>
                <div v-if="!selectedCat" class="text-3xl font-extrabold text-white/50">Pilih layanan dulu</div>
                <div v-else>
                  <div class="text-3xl font-extrabold leading-tight">{{ formatRp(estimate.min) }}</div>
                  <div class="text-sm text-blue-200 mt-1">s/d {{ formatRp(estimate.max) }}</div>
                </div>
                <div class="mt-4 pt-4 border-t border-white/20 text-xs text-blue-200 space-y-1">
                  <div v-if="!selectedCat">Estimasi akan muncul setelah pilih layanan</div>
                  <div v-else>
                    <div>Harga sudah termasuk:</div>
                    <div v-for="inc in estimate.includes" :key="inc" class="flex items-center gap-1 mt-1">
                      <UIcon name="i-tabler-check" class="w-3 h-3" /> {{ inc }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Breakdown -->
              <div v-if="selectedCat && estimate.breakdown.length" class="bg-gray-50 rounded-2xl p-4 space-y-2 mb-5">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Rincian</p>
                <div v-for="b in estimate.breakdown" :key="b.label" class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">{{ b.label }}</span>
                  <span class="font-semibold text-gray-900">{{ formatRp(b.price) }}</span>
                </div>
                <div class="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-bold">
                  <span class="text-gray-900">Total min.</span>
                  <span class="text-[#3358ff]">{{ formatRp(estimate.min) }}</span>
                </div>
              </div>

              <!-- CTA -->
              <a
                v-if="selectedCat"
                :href="waLink"
                target="_blank"
                class="block w-full bg-[#3358ff] hover:opacity-90 text-white font-bold text-center py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mb-3"
              >
                <UIcon name="i-tabler-brand-whatsapp" class="w-5 h-5" />
                Konsultasi Estimasi Ini
              </a>
              <p class="text-xs text-center text-gray-400">Gratis konsultasi · Tidak ada komitmen</p>
            </div>
          </div>

        </div>
      </UContainer>
    </section>

    <!-- Note -->
    <section class="py-12 bg-gray-50">
      <UContainer>
        <div class="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 flex items-start gap-4">
          <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <UIcon name="i-tabler-info-circle" class="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">Catatan Penting</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              Estimasi di atas merupakan perkiraan awal. Harga final tergantung kompleksitas, jumlah revisi, dan kebutuhan spesifik.
              Hubungi tim kami untuk proposal resmi dengan harga lebih akurat , <strong>konsultasi gratis, tanpa komitmen</strong>.
            </p>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()

const selectedCat      = ref<string>('')
const selectedFeatures = ref<string[]>([])
const selectedOptions  = ref<Record<string, string>>({})

const categories = [
  { id: 'landing',  icon: 'i-tabler-layout-navbar',    label: 'Landing Page / Company Profile', desc: 'Website profesional, fast & SEO-optimized' },
  { id: 'ecommerce',icon: 'i-tabler-shopping-cart',    label: 'Website E-Commerce',              desc: 'Toko online dengan payment gateway' },
  { id: 'webapp',   icon: 'i-tabler-apps',             label: 'Web App / Sistem Custom',         desc: 'LMS, HRIS, inventory, booking, dll.' },
  { id: 'mobile',   icon: 'i-tabler-device-mobile',    label: 'Mobile App',                      desc: 'Android & iOS: kasir, delivery, dll.' },
  { id: 'smm',      icon: 'i-tabler-trending-up',      label: 'Social Media Management',         desc: 'Kelola konten, copywriting, jadwal' },
  { id: 'talent',   icon: 'i-tabler-microphone-2',     label: 'Esports Talent',                  desc: 'Shoutcaster & host untuk event' },
  { id: 'desain',   icon: 'i-tabler-palette',          label: 'Desain Grafis & Branding',        desc: 'Logo, banner, konten sosmed, video' },
  { id: 'ads',      icon: 'i-tabler-speakerphone',     label: 'Meta Ads / Google Ads',           desc: 'Iklan berbayar yang tepat sasaran' },
]

const featureMap: Record<string, any[]> = {
  landing: [
    { id: 'domain', label: 'Domain .com setahun', desc: 'Registrasi domain baru', price: 150000 },
    { id: 'hosting', label: 'Hosting setahun', desc: 'Shared hosting cPanel', price: 200000 },
    { id: 'seo', label: 'SEO On-Page', desc: 'Optimasi meta, heading, schema', price: 300000 },
    { id: 'cms', label: 'CMS / Admin Panel', desc: 'Kelola konten mandiri', price: 500000 },
    { id: 'chat', label: 'Live Chat / WA Widget', desc: 'Tombol floating WhatsApp', price: 100000 },
    { id: 'blog', label: 'Halaman Blog', desc: 'Artikel & konten marketing', price: 400000 },
    { id: 'multilang', label: 'Multi-bahasa', desc: 'Indonesia + English', price: 500000 },
  ],
  ecommerce: [
    { id: 'payment', label: 'Payment Gateway', desc: 'Midtrans / Xendit integrasi', price: 500000 },
    { id: 'inventory', label: 'Manajemen Stok', desc: 'Real-time inventory', price: 400000 },
    { id: 'promo', label: 'Voucher & Promo', desc: 'Kode diskon, flash sale', price: 300000 },
    { id: 'review', label: 'Review Produk', desc: 'Rating & ulasan pembeli', price: 200000 },
    { id: 'mobile_app', label: 'Mobile App (Android)', desc: 'Versi app untuk pembeli', price: 2500000 },
    { id: 'multi_seller', label: 'Multi-seller', desc: 'Marketplace dengan banyak penjual', price: 3000000 },
  ],
  webapp: [
    { id: 'auth', label: 'Autentikasi & Role', desc: 'Login, role admin/user/dll.', price: 500000 },
    { id: 'dashboard', label: 'Dashboard & Chart', desc: 'Visualisasi data real-time', price: 800000 },
    { id: 'api', label: 'REST API', desc: 'API untuk integrasi pihak ketiga', price: 1000000 },
    { id: 'notif', label: 'Notifikasi Email/WA', desc: 'Alert otomatis via email & WA', price: 400000 },
    { id: 'export', label: 'Export Excel/PDF', desc: 'Download laporan', price: 300000 },
    { id: 'mobile', label: 'Versi Mobile App', desc: 'Android companion app', price: 3000000 },
  ],
  mobile: [
    { id: 'ios', label: 'iOS (iPhone)', desc: 'Tambah platform iOS', price: 1500000 },
    { id: 'push', label: 'Push Notification', desc: 'Notifikasi ke HP pengguna', price: 300000 },
    { id: 'payment', label: 'In-App Payment', desc: 'Bayar langsung dari app', price: 500000 },
    { id: 'maps', label: 'Maps & Lokasi', desc: 'Google Maps integrasi', price: 400000 },
    { id: 'offline', label: 'Offline Mode', desc: 'Bisa dipakai tanpa internet', price: 800000 },
    { id: 'publish', label: 'Upload ke Play Store', desc: 'Bantu proses publish', price: 200000 },
  ],
  smm: [
    { id: 'reels', label: 'Reels / Video TikTok', desc: 'Video 15–60 detik', price: 500000 },
    { id: 'story', label: 'Instagram Story', desc: 'Story interaktif & IG Ads ready', price: 200000 },
    { id: 'dm', label: 'DM Management', desc: 'Balas pesan masuk', price: 300000 },
    { id: 'ads_link', label: 'Link ke Meta Ads', desc: 'Konten siap boost iklan', price: 200000 },
    { id: 'report', label: 'Laporan Bulanan', desc: 'Report engagement & pertumbuhan', price: 150000 },
  ],
  talent: [
    { id: 'offline', label: 'Offline (On-Site)', desc: 'Hadir langsung di venue', price: 600000 },
    { id: 'stream', label: 'Live Stream Setup', desc: 'Bantu setup streaming', price: 300000 },
    { id: 'host', label: 'Host MC', desc: 'Bukan shoutcaster tapi MC', price: 400000 },
    { id: 'package', label: 'Paket Full Event', desc: 'Shoutcaster + Host + Produksi', price: 2000000 },
  ],
  desain: [
    { id: 'logo', label: 'Logo Profesional', desc: 'Dengan brand guideline', price: 500000 },
    { id: 'brand', label: 'Brand Identity Lengkap', desc: 'Logo + palette + typography', price: 1500000 },
    { id: 'sosmed', label: 'Template Konten Sosmed', desc: '10 template editable', price: 300000 },
    { id: 'video', label: 'Video Animasi Intro', desc: 'Animasi 15–30 detik', price: 500000 },
  ],
  ads: [
    { id: 'creative', label: 'Desain Kreatif Iklan', desc: 'Banner, video untuk ads', price: 300000 },
    { id: 'copy', label: 'Copywriting Iklan', desc: 'Teks iklan konversi tinggi', price: 200000 },
    { id: 'report', label: 'Laporan & Optimasi', desc: 'Weekly report + adjustment', price: 400000 },
  ],
}

const optionMap: Record<string, any[]> = {
  landing: [
    {
      id: 'pages', label: 'Jumlah Halaman', choices: [
        { id: 'p1', label: '1 Halaman (Landing)', price: 0 },
        { id: 'p5', label: '3–5 Halaman', price: 500000 },
        { id: 'p10', label: '6–10 Halaman', price: 1000000 },
      ]
    },
    {
      id: 'design', label: 'Desain', choices: [
        { id: 'template', label: 'Template Siap Pakai', price: 0 },
        { id: 'custom', label: 'Custom Design (Figma)', price: 500000 },
        { id: 'premium', label: 'Premium Custom', price: 1500000 },
      ]
    },
  ],
  ecommerce: [
    {
      id: 'products', label: 'Jumlah Produk Awal', choices: [
        { id: 'lt50',   label: 'Hingga 50 Produk',   price: 0 },
        { id: 'lt200',  label: '50–200 Produk',       price: 500000 },
        { id: 'more',   label: '200+ Produk',         price: 1000000 },
      ]
    },
  ],
  webapp: [
    {
      id: 'complexity', label: 'Kompleksitas Sistem', choices: [
        { id: 'simple',  label: 'Sederhana (CRUD dasar)', price: 0 },
        { id: 'medium',  label: 'Menengah (reporting, workflow)', price: 1500000 },
        { id: 'complex', label: 'Kompleks (integrasi, AI, dll.)', price: 4000000 },
      ]
    },
  ],
  smm: [
    {
      id: 'platform', label: 'Platform', choices: [
        { id: 'ig',    label: 'Instagram Only', price: 0 },
        { id: 'igtk',  label: 'IG + TikTok',    price: 500000 },
        { id: 'multi', label: 'IG + TikTok + FB', price: 800000 },
      ]
    },
  ],
  talent: [
    {
      id: 'duration', label: 'Durasi Event', choices: [
        { id: 'half', label: 'Half Day (4 jam)',    price: 0 },
        { id: 'full', label: 'Full Day (8 jam)',    price: 600000 },
        { id: 'multi', label: 'Multi Hari',         price: 1200000 },
      ]
    },
  ],
}

const basePriceMap: Record<string, { min: number; max: number; includes: string[] }> = {
  landing:   { min: 500000,   max: 1500000,  includes: ['Desain mobile-friendly', 'Hosting 1 tahun', 'SSL gratis', 'Garansi revisi'] },
  ecommerce: { min: 1500000,  max: 4000000,  includes: ['Payment gateway', 'Admin panel', 'Mobile responsive', 'Garansi revisi'] },
  webapp:    { min: 3000000,  max: 7000000,  includes: ['Auth & role', 'Admin dashboard', 'API ready', 'Dokumentasi'] },
  mobile:    { min: 2000000,  max: 6000000,  includes: ['Android native', 'UI/UX custom', 'Publish Play Store', 'Testing QA'] },
  smm:       { min: 1500000,  max: 5000000,  includes: ['Content calendar', 'Desain konten', 'Copywriting', 'Jadwal posting'] },
  talent:    { min: 600000,   max: 2200000,  includes: ['Talent profesional', 'Koordinasi event', 'Briefing pra-event'] },
  desain:    { min: 200000,   max: 3000000,  includes: ['File vector (AI/SVG)', 'Format PNG/JPG', 'Unlimited revisi minor'] },
  ads:       { min: 1000000,  max: 5000000,  includes: ['Setup campaign', 'Targeting audience', 'A/B testing', 'Laporan mingguan'] },
}

const currentFeatures = computed(() => featureMap[selectedCat.value] || [])
const currentOptions  = computed(() => optionMap[selectedCat.value]  || [])

const estimate = computed(() => {
  if (!selectedCat.value) return { min: 0, max: 0, includes: [], breakdown: [] }

  const base     = basePriceMap[selectedCat.value]
  let addMin     = 0
  let addMax     = 0
  const breakdown: any[] = [{ label: 'Harga dasar', price: base.min }]

  // Feature prices
  selectedFeatures.value.forEach(fid => {
    const f = currentFeatures.value.find((f: any) => f.id === fid)
    if (f) { addMin += f.price; addMax += f.price; breakdown.push({ label: f.label, price: f.price }) }
  })

  // Option prices
  Object.entries(selectedOptions.value).forEach(([optId, choiceId]) => {
    const opt    = currentOptions.value.find((o: any) => o.id === optId)
    const choice = opt?.choices?.find((c: any) => c.id === choiceId)
    if (choice?.price) { addMin += choice.price; addMax += choice.price; breakdown.push({ label: choice.label, price: choice.price }) }
  })

  return {
    min:       base.min + addMin,
    max:       base.max + addMax,
    includes:  base.includes,
    breakdown,
  }
})

const waLink = computed(() => {
  const cat     = categories.find(c => c.id === selectedCat.value)
  const features = selectedFeatures.value
    .map(fid => currentFeatures.value.find((f: any) => f.id === fid)?.label)
    .filter(Boolean).join(', ')
  const msg = cat
    ? `Halo Lakara, saya tertarik layanan *${cat.label}*${features ? ` dengan fitur: ${features}` : ''}. Estimasi saya ${formatRp(estimate.value.min)}–${formatRp(estimate.value.max)}. Bisa minta proposal resminya?`
    : 'Halo Lakara, saya ingin konsultasi estimasi harga'
  return wa(msg)
})

function formatRp(val: number) {
  if (!val) return 'Rp 0'
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1)}jt`
  if (val >= 1000)    return `Rp ${(val / 1000).toFixed(0)}rb`
  return `Rp ${val.toLocaleString('id-ID')}`
}
</script>
