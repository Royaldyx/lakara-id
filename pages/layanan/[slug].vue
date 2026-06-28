<template>
  <div>
    <Head><Title>{{ service.title }} — Lakara</Title></Head>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-20 pb-20">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 -left-16 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative text-center">
        <div class="max-w-3xl mx-auto">
          <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            {{ service.badge }}
          </span>
          <div class="w-16 h-16 rounded-2xl bg-[#3358ff] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <UIcon :name="service.icon" class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">{{ service.title }}</h1>
          <p class="text-lg text-[#3358ff] font-semibold mb-5">{{ service.tagline }}</p>
          <p class="text-gray-500 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">{{ service.description }}</p>
          <div class="flex flex-wrap justify-center gap-4">
            <UButton
              :to="waLink"
              target="_blank"
              size="lg"
              style="background-color: #3358ff;"
              icon="i-tabler-brand-whatsapp"
              class="font-bold shadow-lg shadow-blue-200"
            >
              Konsultasi Gratis
            </UButton>
            <UButton
              to="/services"
              size="lg"
              variant="outline"
              color="gray"
              icon="i-tabler-apps"
              class="font-semibold"
            >
              Semua Layanan
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Benefits -->
    <section class="section bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Kenapa Layanan Ini</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Manfaat untuk Bisnis Anda</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div
            v-for="b in service.benefits"
            :key="b.title"
            class="text-center bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UIcon :name="b.icon" class="w-6 h-6 text-[#3358ff]" />
            </div>
            <h3 class="font-bold text-gray-900 mb-2 text-sm">{{ b.title }}</h3>
            <p class="text-xs text-gray-500 leading-relaxed">{{ b.desc }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Process -->
    <section class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-16">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Proses Kerja</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Transparan dari Awal hingga Akhir</h2>
        </div>
        <div class="max-w-3xl mx-auto space-y-5">
          <div
            v-for="(step, i) in service.process"
            :key="step.title"
            class="flex gap-5 items-start bg-white rounded-2xl border border-gray-100 p-7 shadow-sm"
          >
            <div class="w-12 h-12 rounded-2xl bg-[#3358ff] text-white flex items-center justify-center font-extrabold text-lg flex-shrink-0 shadow-md shadow-blue-200">
              {{ i + 1 }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-1">{{ step.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Pricing packages (if available) -->
    <section v-if="service.packages" class="section bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Pilih Paket</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900">Harga Transparan, Tanpa Biaya Tersembunyi</h2>
        </div>
        <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            v-for="pkg in service.packages"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-7 flex flex-col bg-white transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase whitespace-nowrap">Paling Dipilih</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-1">{{ pkg.title }}</h3>
            <p v-if="pkg.subtitle" class="text-xs text-gray-500 mb-4 leading-relaxed">{{ pkg.subtitle }}</p>
            <div class="mb-4">
              <span v-if="pkg.price !== 'Custom'" class="text-2xl font-extrabold text-gray-900">{{ pkg.price }}</span>
              <span v-else class="text-2xl font-extrabold text-gray-900">Custom</span>
              <div class="text-xs text-gray-400 mt-1">{{ pkg.period }}</div>
            </div>
            <ul class="space-y-2 mb-6 flex-1">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket ${pkg.title} untuk ${service.title}`)"
              target="_blank"
              block
              :style="pkg.popular ? 'background-color: #3358ff;' : ''"
              :variant="pkg.popular ? undefined : 'outline'"
              :color="pkg.popular ? undefined : 'gray'"
              class="font-semibold"
            >
              Konsultasi Sekarang
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Custom quote (no packages) -->
    <section v-else class="section bg-white">
      <UContainer>
        <div class="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-3xl border border-blue-100 p-10 text-center">
          <div class="w-14 h-14 bg-[#3358ff] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
            <UIcon name="i-tabler-calculator" class="w-7 h-7 text-white" />
          </div>
          <h2 class="text-2xl font-extrabold text-gray-900 mb-3">Harga via Konsultasi</h2>
          <p class="text-gray-600 mb-6 leading-relaxed">Setiap project punya kebutuhan berbeda. Kami berikan estimasi yang fair dan transparan setelah memahami scope Anda , tanpa biaya tersembunyi.</p>
          <div class="flex flex-wrap justify-center gap-3 mb-7">
            <span class="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm">✅ Konsultasi gratis</span>
            <span class="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm">✅ Estimasi transparan</span>
            <span class="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm">✅ DP 50% di awal</span>
          </div>
          <UButton :to="waLink" target="_blank" size="lg" style="background-color: #3358ff;" icon="i-tabler-brand-whatsapp" class="font-bold">
            Dapatkan Estimasi Harga
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- FAQ -->
    <section class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">FAQ</h2>
          <p class="text-gray-500">Pertanyaan yang sering ditanyakan seputar layanan ini</p>
        </div>
        <div class="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
          <UAccordion :items="service.faq" />
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="relative overflow-hidden py-24 bg-gradient-to-br from-[#3358ff] to-[#6366f1] text-white">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-16 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
        <div class="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>
      <UContainer class="relative text-center">
        <span class="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">Mulai Sekarang</span>
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Siap mulai project {{ service.title }}?</h2>
        <p class="text-blue-100 mb-8 max-w-xl mx-auto">Konsultasi gratis, tanpa komitmen. Kami bantu tentukan solusi dan anggaran yang tepat untuk Anda.</p>
        <UButton :to="waLink" target="_blank" size="xl" class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold" icon="i-tabler-brand-whatsapp">
          Konsultasi Gratis Sekarang
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
const route = useRoute()
const slug = route.params.slug as string

interface Pkg { title: string; subtitle?: string; price: string; period: string; popular?: boolean; items: string[] }
interface Benefit { icon: string; title: string; desc: string }
interface Step { title: string; desc: string }
interface FAQ { label: string; content: string }
interface ServiceData {
  title: string; tagline: string; description: string
  icon: string; badge: string
  benefits: Benefit[]; process: Step[]
  packages?: Pkg[]; faq: FAQ[]; waMsg: string
}

const services: Record<string, ServiceData> = {
  'landing-page': {
    title: 'Landing Page & Company Profile',
    tagline: 'Tingkatkan konversi bisnis hingga 40%',
    description: 'Website profesional yang dirancang khusus untuk mempromosikan produk atau layanan bisnis Anda , fast loading, mobile-friendly, dan dioptimalkan untuk konversi iklan.',
    icon: 'i-tabler-layout-navbar', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-trending-up', title: 'Konversi +40%', desc: 'Landing page terstruktur terbukti meningkatkan konversi bisnis hingga 40% dibanding toko biasa.' },
      { icon: 'i-tabler-clock', title: 'Online 24/7', desc: 'Website bekerja tanpa henti, menerima leads dan inquiry bahkan saat Anda tidur.' },
      { icon: 'i-tabler-ad-2', title: 'Integrasi Iklan', desc: 'Dioptimalkan sebagai landing page untuk Meta Ads, Google Ads, dan TikTok Ads.' },
      { icon: 'i-tabler-message-circle', title: 'Live Chat Built-in', desc: 'Pengunjung langsung bisa hubungi via WhatsApp atau live chat tanpa berganti platform.' },
    ],
    process: [
      { title: 'Brief & Konsultasi', desc: 'Diskusi kebutuhan, target audiens, tujuan halaman, dan tone branding yang sesuai.' },
      { title: 'Wireframe', desc: 'Kerangka halaman disusun dengan urutan informasi logis dari headline hingga CTA.' },
      { title: 'Design', desc: 'Eksekusi visual berdasarkan wireframe , tipografi, warna, dan layout profesional.' },
      { title: 'Development', desc: 'Build halaman yang responsive, fast-loading, dan terintegrasi tool analitik.' },
      { title: 'Launch & Delivery', desc: 'Go-live dalam 3–7 hari kerja. Revisi gratis 2x setelah review Anda.' },
    ],
    packages: [
      { title: 'Silver', subtitle: 'Sudah punya domain & hosting sendiri', price: 'Mulai Rp 500rb', period: 'one-time', popular: false, items: ['1 halaman landing page', 'Desain profesional', 'Copywriting menjual', 'Mobile-friendly', 'Revisi 2x', 'Format file JSON'] },
      { title: 'Gold', subtitle: 'Termasuk domain, hosting, dan SSL', price: 'Mulai Rp 1jt', period: 'one-time', popular: true, items: ['1 halaman landing page', 'Desain profesional', 'Copywriting menjual', 'Mobile-friendly', 'Revisi 2x', 'Domain .com 1 tahun', 'Hosting 1 tahun', 'SSL Certificate'] },
      { title: 'Company Profile', subtitle: 'Website multi-halaman', price: 'Custom', period: 'one-time', popular: false, items: ['3–7 halaman', 'Desain full custom', 'Blog / News section', 'Galeri & portofolio', 'Contact form', 'Domain + Hosting + SSL'] },
    ],
    faq: [
      { label: 'Apa yang perlu disiapkan?', content: 'Nama website, logo, informasi bisnis, foto/video produk, dan teks konten utama jika ada.' },
      { label: 'Berapa lama proses pembuatannya?', content: '3–7 hari kerja tergantung paket dan kompleksitas konten. Estimasi pasti diberikan saat konsultasi awal.' },
      { label: 'Apakah ada garansi revisi?', content: '2x revisi gratis setelah review. Berlaku untuk perubahan teks, warna, dan gambar , tidak termasuk perubahan konsep desain total.' },
      { label: 'Cocok untuk landing page iklan Meta/Google?', content: 'Ya. Struktur AIDA, CTA yang jelas, dan load speed dioptimasi untuk Quality Score tinggi di Meta Ads dan Google Ads.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Landing Page & Company Profile',
  },

  'ecommerce': {
    title: 'E-Commerce',
    tagline: 'Toko online profesional yang menjual 24/7',
    description: 'Website toko online lengkap dengan manajemen produk, keranjang belanja, dan integrasi payment gateway , siap menjual tanpa perlu toko fisik.',
    icon: 'i-tabler-shopping-cart', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-clock', title: 'Toko Buka 24/7', desc: 'Terima pesanan kapan saja, tanpa jam operasional dan tanpa ketergantungan toko fisik.' },
      { icon: 'i-tabler-credit-card', title: 'Payment Gateway', desc: 'Integrasi Midtrans, Xendit, atau payment gateway pilihan , kartu kredit, transfer, QRIS, e-wallet.' },
      { icon: 'i-tabler-package', title: 'CMS Mudah', desc: 'Tambah, edit, dan kelola ribuan produk sendiri tanpa perlu developer.' },
      { icon: 'i-tabler-search', title: 'SEO-Optimized', desc: 'Produk Anda ditemukan di Google oleh calon pembeli yang sedang aktif mencari.' },
    ],
    process: [
      { title: 'Discovery & Brief', desc: 'Diskusi kebutuhan fitur, kategori produk, payment method, dan target pasar.' },
      { title: 'UI/UX Design', desc: 'Wireframe dan mockup desain yang berfokus pada conversion dan kemudahan belanja.' },
      { title: 'Development', desc: 'Build toko dengan WooCommerce atau sistem custom sesuai kebutuhan.' },
      { title: 'Testing & QA', desc: 'Uji semua fitur di berbagai device dan browser , checkout, payment, manajemen produk.' },
      { title: 'Launch & Training', desc: 'Go-live dan training penggunaan CMS sehingga Anda bisa kelola toko mandiri.' },
    ],
    packages: [
      { title: 'WooCommerce', subtitle: 'Untuk toko standard dengan plugin', price: 'Mulai Rp 1.5jt', period: 'one-time', popular: false, items: ['WooCommerce setup', 'Desain tema profesional', 'Kategori & manajemen produk', 'Payment gateway', 'SEO on-page', 'Training CMS'] },
      { title: 'Custom', subtitle: 'Untuk toko dengan fitur spesifik', price: 'Mulai Rp 3jt', period: 'one-time', popular: true, items: ['Build dari scratch', 'Desain 100% custom', 'Fitur custom sesuai kebutuhan', 'API integrasi', 'Multi-warehouse support', 'Laporan penjualan custom'] },
      { title: 'Enterprise', subtitle: 'Marketplace-level features', price: 'Custom', period: 'one-time', popular: false, items: ['Multi-vendor marketplace', 'Dashboard admin lengkap', 'Mobile app buyer & seller', 'Laporan & analytics', 'Dedicated project manager', 'Support 3 bulan'] },
    ],
    faq: [
      { label: 'Bisa integrasi dengan Shopee/Tokopedia?', content: 'Bisa. Kami support integrasi API untuk sinkronisasi stok dan pesanan dengan marketplace.' },
      { label: 'Apakah saya bisa kelola produk sendiri?', content: 'Ya. Semua paket termasuk training CMS sehingga Anda bisa tambah, edit, dan hapus produk secara mandiri.' },
      { label: 'Berapa lama pengerjaannya?', content: 'WooCommerce standard: 7–14 hari. Custom system: 3–8 minggu tergantung kompleksitas fitur.' },
      { label: 'Apakah ada fitur kode promo atau diskon?', content: 'Ya, semua termasuk manajemen diskon, kupon, dan promo untuk setiap paket.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan E-Commerce Website',
  },

  'web-app': {
    title: 'Web App Custom',
    tagline: 'Sistem digital yang dibangun persis sesuai bisnis Anda',
    description: 'Dari sistem akademik, LMS, job fair, inventory, hingga dashboard analytics , kami bangun web app yang fully custom, scalable, dan terintegrasi dengan sistem yang sudah ada.',
    icon: 'i-tabler-apps', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-adjustments', title: 'Fully Custom', desc: 'Setiap fitur dirancang sesuai alur kerja bisnis Anda , bukan template yang dipaksakan.' },
      { icon: 'i-tabler-chart-bar', title: 'Scalable', desc: 'Arsitektur yang siap tumbuh dari puluhan ke ribuan user tanpa perlu rebuild.' },
      { icon: 'i-tabler-plug', title: 'Integrasi API', desc: 'Terhubung dengan sistem yang sudah ada . ERP, payment, notifikasi, third-party.' },
      { icon: 'i-tabler-users', title: 'Multi-User & Role', desc: 'Manajemen hak akses berdasarkan peran user yang flexible dan aman.' },
    ],
    process: [
      { title: 'Discovery & Requirements', desc: 'Analisis mendalam terhadap alur bisnis, kebutuhan fitur, dan user persona.' },
      { title: 'System Architecture', desc: 'Rancang struktur database, API, dan arsitektur frontend yang optimal.' },
      { title: 'Development', desc: 'Pengembangan iteratif dengan milestone dan demo progress berkala.' },
      { title: 'QA & Testing', desc: 'Pengujian menyeluruh: unit test, integration test, dan UAT bersama stakeholder.' },
      { title: 'Deploy & Training', desc: 'Deploy ke server dan training tim Anda untuk menggunakan sistem.' },
    ],
    faq: [
      { label: 'Teknologi apa yang digunakan?', content: 'Kami menggunakan Vue.js/Nuxt, React, Laravel, atau teknologi yang paling sesuai dengan kebutuhan project.' },
      { label: 'Berapa estimasi biaya?', content: 'Mulai dari Rp 3jt–7jt untuk web app standar. Project yang lebih kompleks di-quote setelah discovery session.' },
      { label: 'Apakah bisa integrasi dengan sistem yang sudah ada?', content: 'Ya. Kami berpengalaman integrasi dengan berbagai sistem . ERP, HRIS, payment gateway, dan API pihak ketiga.' },
      { label: 'Bagaimana maintenance setelah launch?', content: 'Tersedia paket maintenance bulanan. Kami juga provide dokumentasi teknis untuk tim internal Anda.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Web App Custom',
  },

  'mobile-app': {
    title: 'Mobile App (Android & iOS)',
    tagline: 'Aplikasi mobile yang memudahkan pelanggan Anda',
    description: 'Dari aplikasi kasir, food order, loyalty program, hingga marketplace , kami bangun mobile app yang performant, beautiful, dan siap publish ke Play Store & App Store.',
    icon: 'i-tabler-device-mobile', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-device-mobile', title: 'Android & iOS', desc: 'Satu codebase untuk dua platform dengan React Native , hemat waktu, hemat biaya.' },
      { icon: 'i-tabler-bell', title: 'Push Notification', desc: 'Engagement langsung ke pelanggan via push notification yang dipersonalisasi.' },
      { icon: 'i-tabler-wifi-off', title: 'Offline Mode', desc: 'Fitur utama tetap berjalan bahkan tanpa koneksi internet.' },
      { icon: 'i-tabler-layout', title: 'UI Native Feel', desc: 'Desain yang terasa natural di Android dan iOS , bukan terasa seperti web dibungkus app.' },
    ],
    process: [
      { title: 'Brief & Wireframe', desc: 'Diskusi fitur utama, user flow, dan wireframe screen by screen.' },
      { title: 'UI Design', desc: 'Desain antarmuka yang beautiful dan intuitif di Android dan iOS.' },
      { title: 'Development', desc: 'Build app dengan React Native atau Flutter, milestone mingguan.' },
      { title: 'Testing', desc: 'Uji di berbagai device , iPhone, Samsung, OPPO, dan lainnya.' },
      { title: 'Publish to Store', desc: 'Submit ke Google Play Store dan Apple App Store beserta guidelines mereka.' },
    ],
    faq: [
      { label: 'Apakah satu aplikasi bisa untuk Android dan iOS?', content: 'Ya. Kami menggunakan React Native atau Flutter yang memungkinkan satu codebase untuk dua platform.' },
      { label: 'Berapa estimasi biaya?', content: 'Starting Rp 2jt untuk app sederhana. Estimasi lengkap diberikan setelah diskusi fitur.' },
      { label: 'Berapa lama proses pembuatannya?', content: 'Minimal 4 minggu untuk app sederhana, 2–4 bulan untuk app dengan fitur kompleks.' },
      { label: 'Apakah bisa terintegrasi dengan website?', content: 'Ya. App dan website bisa sharing backend API yang sama untuk data yang sinkron.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Mobile App',
  },

  'saas': {
    title: 'SaaS Development',
    tagline: 'Software berlangganan yang menghasilkan recurring revenue',
    description: 'Bangun software-as-a-service yang scalable dengan model subscription , dari setup, hosting, maintenance, hingga update semua kami handle.',
    icon: 'i-tabler-cloud', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-repeat', title: 'Recurring Revenue', desc: 'Model bisnis subscription yang menghasilkan pendapatan berkelanjutan setiap bulan.' },
      { icon: 'i-tabler-server', title: 'Managed Hosting', desc: 'Infrastruktur cloud yang kami kelola , uptime tinggi, auto-backup, maintenance termasuk.' },
      { icon: 'i-tabler-layers', title: 'Multi-Tier Pricing', desc: 'Monetisasi dengan paket Starter / Business / Enterprise yang fleksibel.' },
      { icon: 'i-tabler-refresh', title: 'Auto-Update', desc: 'Fitur baru bisa dideploy tanpa mengganggu pengguna yang sedang aktif.' },
    ],
    process: [
      { title: 'Planning & Scoping', desc: 'Definisikan core features, target user, pricing model, dan roadmap.' },
      { title: 'System Architecture', desc: 'Desain multi-tenant architecture yang aman dan scalable.' },
      { title: 'MVP Development', desc: 'Build minimum viable product dengan fitur core yang paling penting.' },
      { title: 'Beta Testing', desc: 'Uji dengan pengguna awal untuk feedback sebelum launch penuh.' },
      { title: 'Launch & Grow', desc: 'Go-live dengan monitoring performa, usage analytics, dan support.' },
    ],
    packages: [
      { title: 'Starter SaaS', subtitle: 'Untuk bisnis kecil & UMKM', price: 'Rp 50rb/bln', period: 'per bulan (setup Rp 500rb)', popular: false, items: ['Setup: Rp 500rb', 'Hosting termasuk', 'Update & maintenance rutin', 'Support via WhatsApp'] },
      { title: 'Business SaaS', subtitle: 'Untuk tim & bisnis berkembang', price: 'Rp 100rb/bln', period: 'per bulan (setup Rp 1–1.5jt)', popular: true, items: ['Setup: Rp 1–1.5jt', 'Fitur lebih lengkap', 'Multi-user support', 'Priority support', 'Monthly performance report'] },
      { title: 'Enterprise SaaS', subtitle: 'Untuk perusahaan besar', price: 'Custom', period: 'custom', popular: false, items: ['Fully custom features', 'Dedicated server', 'SLA guarantee', 'On-site support tersedia', 'Quarterly review meeting'] },
    ],
    faq: [
      { label: 'Apa bedanya SaaS dengan website biasa?', content: 'SaaS adalah software yang diakses via browser dengan model subscription bulanan. Pengguna bayar per bulan, Anda dapat recurring revenue , bukan one-time payment.' },
      { label: 'Siapa yang cocok pakai layanan ini?', content: 'Pengusaha yang ingin membangun produk software dengan revenue berulang . HR tools, e-learning, POS, manajemen, dll.' },
      { label: 'Apakah saya bisa tambah fitur setelah launch?', content: 'Ya, pengembangan iteratif sangat dianjurkan. Kami bisa bantu roadmap fitur setelah MVP live.' },
      { label: 'Bagaimana sistem penagihannya?', content: 'Kami bantu setup billing otomatis menggunakan Midtrans atau Xendit untuk collect subscription tiap bulan.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan SaaS Development',
  },

  'uiux': {
    title: 'UI/UX Design',
    tagline: 'Desain yang mengkonversi , bukan hanya terlihat indah',
    description: 'Design system, wireframe, prototype, dan riset user experience untuk produk digital Anda , dari mobile app, web app, hingga brand identity yang konsisten.',
    icon: 'i-tabler-palette', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-user-check', title: 'User-Centered', desc: 'Setiap keputusan desain berbasis riset pengguna nyata , bukan asumsi.' },
      { icon: 'i-tabler-trending-up', title: 'Conversion-Optimized', desc: 'UI yang dirancang untuk mengkonversi pengunjung jadi pengguna aktif.' },
      { icon: 'i-tabler-layout-grid', title: 'Design System', desc: 'Komponen yang konsisten, scalable, dan mudah di-handoff ke developer.' },
      { icon: 'i-tabler-vector', title: 'Brand Consistent', desc: 'Identitas visual yang kohesif di semua touchpoint , web, app, marketing.' },
    ],
    process: [
      { title: 'Research & Discovery', desc: 'Riset pengguna, kompetitor, dan analisis existing product jika ada.' },
      { title: 'Wireframe & IA', desc: 'Arsitektur informasi dan wireframe low-fidelity untuk validasi alur.' },
      { title: 'Visual Design', desc: 'High-fidelity mockup dengan sistem warna, tipografi, dan komponen konsisten.' },
      { title: 'Interactive Prototype', desc: 'Prototype yang bisa diklik untuk user testing sebelum development.' },
      { title: 'Dev Handoff', desc: 'File Figma yang rapi dengan design token, anotasi, dan documentation.' },
    ],
    faq: [
      { label: 'Tool apa yang digunakan?', content: 'Kami menggunakan Figma sebagai tool utama , bisa diakses dan di-comment langsung oleh tim Anda.' },
      { label: 'Apakah termasuk design untuk dark mode?', content: 'Bisa disepakati di awal. Dark mode bisa termasuk dalam scope dengan biaya yang disesuaikan.' },
      { label: 'Apakah desain bisa langsung di-handoff ke developer?', content: 'Ya. File Figma disiapkan dengan komponen, design token, dan dokumentasi yang lengkap untuk developer.' },
      { label: 'Berapa estimasi biaya?', content: 'Mulai dari Rp 500rb untuk halaman tunggal, hingga Rp 3jt+ untuk design system lengkap. Estimasi berdasarkan scope.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan UI/UX Design',
  },

  'desain-grafis': {
    title: 'Desain Grafis Profesional',
    tagline: 'Visual yang menjual , otak 60.000× lebih cepat memproses gambar vs teks',
    description: 'Banner, poster, feed sosmed, company profile, merchandise, brosur , semua kebutuhan visual bisnis Anda dikerjakan tim desainer berpengalaman dengan standar eksklusif.',
    icon: 'i-tabler-vector', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-eye', title: 'Mudah Dikenal', desc: 'Desain yang terkonsep membantu bisnis lebih mudah dikenal dan diingat oleh audiens.' },
      { icon: 'i-tabler-shield-check', title: 'Meningkatkan Kepercayaan', desc: 'Desain profesional meningkatkan kepercayaan calon customer terhadap bisnis Anda.' },
      { icon: 'i-tabler-trophy', title: 'Daya Saing Lebih Tinggi', desc: 'Tampil lebih profesional dari kompetitor di setiap media pemasaran.' },
      { icon: 'i-tabler-clock', title: 'Tepat Waktu', desc: 'Komitmen deadline yang ketat , desain selalu siap sesuai timeline yang disepakati.' },
    ],
    process: [
      { title: 'Brief & Riset Mendalam', desc: 'Memahami bisnis, target audiens, kompetitor, dan kebutuhan visual secara menyeluruh.' },
      { title: 'Konsep & Brainstorm', desc: 'Tim kreatif mengembangkan berbagai ide dan konsep berdasarkan brief.' },
      { title: 'Design Execution', desc: 'Eksekusi visual dengan detail penuh: layout, tipografi, warna, dan elemen visual.' },
      { title: 'Revisi & Refinement', desc: 'Menerima feedback klien secara terbuka dan merevisi hingga memuaskan.' },
      { title: 'Final Delivery', desc: 'File dalam format yang sesuai (print/digital) + brand guideline sederhana.' },
    ],
    faq: [
      { label: 'Apa saja yang bisa didesain?', content: 'Banner, poster, feed Instagram, brosur, company profile, kartu nama, kop surat, merchandise, spanduk, katalog, dan semua kebutuhan desain bisnis.' },
      { label: 'Format file apa yang diterima?', content: 'File master dalam format AI/CDR/EPS dan export JPEG/PNG siap pakai.' },
      { label: 'Berapa kali revisi yang didapat?', content: 'Minimal 2x revisi gratis untuk setiap desain. Revisi berlaku untuk perubahan minor, tidak untuk perubahan konsep total.' },
      { label: 'Berapa lama waktu pengerjaan?', content: '2–7 hari kerja tergantung jenis dan kompleksitas desain. Estimasi diberikan saat konsultasi awal.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Desain Grafis Profesional',
  },

  'desain-logo': {
    title: 'Desain Logo & Branding',
    tagline: 'Identitas visual pertama yang dilihat calon pelanggan Anda',
    description: 'Logo profesional yang unik, memorable, dan mencerminkan nilai brand Anda , dilengkapi brand guideline untuk konsistensi di semua media cetak dan digital.',
    icon: 'i-tabler-diamond', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-eye', title: 'First Impression Kuat', desc: 'Logo yang memikat membantu brand menarik minat calon konsumen sejak pandangan pertama.' },
      { icon: 'i-tabler-fingerprint', title: 'Brand Identity', desc: 'Membangun identitas bisnis yang kuat, unik, dan mudah diingat oleh audiens.' },
      { icon: 'i-tabler-file', title: 'File Master Lengkap', desc: 'File AI/CDR/EPS untuk semua kebutuhan , cetak skala besar hingga digital.' },
      { icon: 'i-tabler-book', title: 'Brand Guideline', desc: 'Panduan penggunaan logo, warna, dan tipografi agar brand tetap konsisten di semua media.' },
    ],
    process: [
      { title: 'Riset Brand & Audiens', desc: 'Memahami visi & misi brand, target audiens, dan keunikan yang membedakan dari kompetitor.' },
      { title: 'Konsep & Sketsa Awal', desc: 'Tim desainer menuangkan ide ke dalam bentuk visual , eksplorasi bentuk, tipografi, dan simbol.' },
      { title: 'Presentasi Desain', desc: 'Presentasikan pilihan desain sesuai paket yang dipilih untuk Anda review.' },
      { title: 'Revisi & Refinement', desc: 'Penyesuaian berdasarkan feedback hingga desain benar-benar sesuai visi Anda.' },
      { title: 'Finalisasi & Delivery', desc: 'File master + panduan penggunaan brand dikirimkan dalam semua format yang dibutuhkan.' },
    ],
    packages: [
      { title: 'Bronze', subtitle: '1 pilihan desain', price: 'Mulai Rp 300rb', period: 'one-time', popular: false, items: ['1 Pilihan Desain Logo', '2x Revisi', '3–4 Hari Pengerjaan', 'File Master AI/CDR/EPS', 'Export JPEG/PNG'] },
      { title: 'Silver', subtitle: '2 pilihan desain + mockup', price: 'Mulai Rp 500rb', period: 'one-time', popular: true, items: ['2 Pilihan Desain Logo', '3x Revisi', '3–5 Hari Pengerjaan', 'File Master AI/CDR/EPS', 'Export JPEG/PNG', 'Free Desain Mockup 3D'] },
      { title: 'Gold', subtitle: 'Paket branding lengkap', price: 'Mulai Rp 800rb', period: 'one-time', popular: false, items: ['3 Pilihan Desain Logo', '5x Revisi', '3–7 Hari Pengerjaan', 'File Master + Mockup 3D', 'Desain Stempel', 'Desain Kartu Nama', 'Desain Kop Surat', 'Graphic Brand Guideline'] },
    ],
    faq: [
      { label: 'Jenis logo apa yang bisa dibuat?', content: 'Logo Monogram, Wordmark, Gambar, Abstrak, Maskot, Kombinasi, Lambang, Font in Shape , semua jenis logo bisa dikerjakan.' },
      { label: 'Apakah ada garansi?', content: 'Kami memberikan garansi 100% uang kembali jika terbukti hasil karya kami menjiplak karya orang lain.' },
      { label: 'Apakah saya bisa request desain untuk industri spesifik?', content: 'Ya, dan kami sangat menyarankannya. Brief industri dan target audiens yang detail akan menghasilkan logo yang jauh lebih tepat sasaran.' },
      { label: 'Format file apa yang diterima?', content: 'File master AI/CDR/EPS (bisa diprint ukuran berapa pun tanpa pecah) + export JPEG/PNG untuk kebutuhan digital.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Desain Logo & Branding',
  },

  'video-animasi': {
    title: 'Video Animasi & Company Profile',
    tagline: '90% audiens Indonesia lebih mudah ingat pesan lewat video',
    description: 'Video explainer 2D, animasi company profile, dan konten visual premium yang meningkatkan brand awareness, kepercayaan, dan konversi bisnis Anda secara signifikan.',
    icon: 'i-tabler-movie', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-broadcast', title: 'Brand Awareness', desc: 'Video adalah format paling mudah diingat , konten video dioptimasi platform seperti IG, YouTube, TikTok.' },
      { icon: 'i-tabler-shield-check', title: 'Meningkatkan Kepercayaan', desc: 'Video company profile membangun kredibilitas dan kepercayaan di mata calon klien.' },
      { icon: 'i-tabler-trending-up', title: 'Meningkatkan Konversi', desc: 'Video promosi yang menarik mendorong audiens untuk mengambil tindakan pembelian.' },
      { icon: 'i-tabler-hd', title: 'Kualitas Hingga 4K', desc: 'Setiap video dirender minimal Full HD 1080p hingga 4K , siap untuk semua platform.' },
    ],
    process: [
      { title: 'Brief & Konsep', desc: 'Anda memberikan konsep dan gambar pendukung/logo , kami kembangkan menjadi brief video yang matang.' },
      { title: 'Scriptwriting', desc: 'Penulisan naskah yang kuat, persuasif, dan sesuai dengan karakter brand Anda.' },
      { title: 'Storyboard', desc: 'Visualisasi adegan per adegan sebelum masuk ke produksi . Anda review dulu sebelum animasi dibuat.' },
      { title: 'Produksi & Animasi', desc: 'Eksekusi animasi 2D dengan backsound gratis yang matching dengan mood video.' },
      { title: 'Review & Delivery', desc: 'Anda review dan bisa request revisi 3x. File final dikirim dalam format MP4 resolusi tinggi.' },
    ],
    faq: [
      { label: 'Apa yang perlu disiapkan?', content: 'Cukup berikan konsep video (atau brief singkat tentang bisnis Anda), logo, dan gambar-gambar pendukung produk/layanan.' },
      { label: 'Berapa kali revisi yang didapat?', content: '3x revisi , khusus untuk perubahan tulisan atau penggantian gambar. Tidak untuk perubahan konsep desain total.' },
      { label: 'Berapa lama proses pembuatannya?', content: 'Tergantung durasi dan kompleksitas. Video explainer 60–90 detik biasanya 7–14 hari kerja.' },
      { label: 'Apakah tersedia voice over?', content: 'Ya, tersedia sebagai add-on dengan biaya tambahan. Voice over membuat pesan lebih mudah diserap penonton.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Video Animasi & Company Profile',
  },

  'foto-produk': {
    title: 'Foto Produk Profesional',
    tagline: 'Foto yang menjual , tingkatkan persepsi nilai produk Anda',
    description: 'Foto produk berkualitas tinggi yang membuat produk Anda terlihat premium dan profesional , untuk marketplace, website, iklan digital, dan katalog bisnis.',
    icon: 'i-tabler-camera', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-trending-up', title: 'Konversi Lebih Tinggi', desc: 'Foto produk berkualitas terbukti meningkatkan hasrat beli dan konversi calon customer.' },
      { icon: 'i-tabler-check', title: 'Diterima Platform', desc: 'Foto berkualitas lebih mudah diterima sebagai konten terbaik di marketplace, Facebook & Google.' },
      { icon: 'i-tabler-star', title: 'Terlihat Premium', desc: 'Produk Anda tampak jauh lebih profesional dan elegan , meningkatkan persepsi nilai.' },
      { icon: 'i-tabler-coin', title: 'Mark-up Harga Lebih Tinggi', desc: 'Foto premium memungkinkan Anda pasang harga lebih tinggi karena perceived value yang meningkat.' },
    ],
    process: [
      { title: 'Brief & Konsultasi Awal', desc: 'Memahami kebutuhan visual produk, target pasar, dan platform tujuan (marketplace/sosmed/iklan).' },
      { title: 'Set Up & Lighting', desc: 'Menyiapkan studio, props, latar belakang, dan sistem pencahayaan sesuai karakter produk.' },
      { title: 'Sesi Pemotretan', desc: 'Pengambilan foto multi-angle (Flat Lay, 45°, Close Up, Low Angle, High Angle) dengan alat profesional.' },
      { title: 'Retouching & Editing', desc: 'Foto diproses dengan teknologi retouch premium , hasilnya estetis, konsisten, dan siap pakai.' },
      { title: 'QA & Delivery', desc: 'Review internal untuk quality check. File final dikirim dalam format JPEG dan PNG siap upload.' },
    ],
    faq: [
      { label: 'Apakah bisa menggunakan model?', content: 'Bisa, namun memerlukan persiapan lebih dan dikenakan biaya tambahan. Informasikan kebutuhan ini saat konsultasi.' },
      { label: 'Berapa produk yang bisa difoto per sesi?', content: 'Tergantung paket. Paket Bronze untuk 1–3 produk, Silver 4–7 produk, Gold 8–12 produk.' },
      { label: 'Apakah tersedia untuk produk makanan?', content: 'Ya, tersedia Artistic Food Styling untuk produk hidangan dan makanan di Paket B.' },
      { label: 'Format file apa yang diterima?', content: 'JPEG dan PNG dalam resolusi tinggi , siap upload ke Shopee, Tokopedia, website, dan media sosial.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Foto Produk Profesional',
  },

  'sistem-dashboard': {
    title: 'Sistem & Dashboard Custom',
    tagline: 'Semua data bisnis Anda, satu layar, real-time',
    description: 'OEE manufacturing, sistem logistik, warehouse management, POS enterprise, monitoring dashboard , kami bangun sistem yang membuat operasional bisnis Anda efisien dan terukur.',
    icon: 'i-tabler-chart-bar', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-activity', title: 'Real-Time Monitoring', desc: 'Pantau semua metrik bisnis dalam satu dashboard yang update otomatis.' },
      { icon: 'i-tabler-report', title: 'Custom Report', desc: 'Laporan yang dirancang sesuai KPI spesifik bisnis Anda , bukan report template.' },
      { icon: 'i-tabler-users', title: 'Multi-User Access', desc: 'Role-based access control untuk tim operasional yang besar dan tersebar.' },
      { icon: 'i-tabler-plug', title: 'Integrasi IoT & API', desc: 'Terhubung dengan sensor, mesin, dan sistem third-party via API atau MQTT.' },
    ],
    process: [
      { title: 'Requirements Analysis', desc: 'Analisis mendalam terhadap kebutuhan data, KPI, dan alur operasional bisnis.' },
      { title: 'System Architecture', desc: 'Desain arsitektur yang optimal untuk real-time data processing dan visualisasi.' },
      { title: 'Development', desc: 'Build dashboard dengan framework modern , chart interaktif, tabel data, dan notifikasi.' },
      { title: 'Integration & Testing', desc: 'Integrasi dengan sumber data (database, sensor, API) dan pengujian menyeluruh.' },
      { title: 'Training & Deploy', desc: 'Training tim Anda dan deploy ke server production dengan dokumentasi lengkap.' },
    ],
    faq: [
      { label: 'Sistem apa saja yang bisa dibangun?', content: 'OEE monitoring, warehouse management, logistik tracking, POS enterprise, HR dashboard, financial monitoring, dan sistem custom lainnya.' },
      { label: 'Apakah bisa integrasi dengan mesin/sensor?', content: 'Ya. Kami mendukung integrasi dengan sensor via MQTT, Modbus, atau API , terkoneksi langsung ke dashboard.' },
      { label: 'Berapa estimasi biaya?', content: 'Mulai Rp 3jt untuk dashboard sederhana, hingga Rp 10jt+ untuk sistem enterprise. Estimasi setelah requirements analysis.' },
      { label: 'Apakah bisa diakses dari mobile?', content: 'Ya, semua dashboard kami buat responsive sehingga bisa diakses dari browser di smartphone maupun tablet.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Sistem & Dashboard Custom',
  },

  'embedded-iot': {
    title: 'Embedded System & IoT',
    tagline: 'Otomasi fisik yang cerdas untuk bisnis Anda',
    description: 'Smart device, sensor monitoring, sistem kontrol mesin, dan otomasi berbasis hardware , solusi IoT yang menghubungkan dunia fisik dengan sistem digital bisnis Anda.',
    icon: 'i-tabler-cpu', badge: 'Lakara Creative',
    benefits: [
      { icon: 'i-tabler-robot', title: 'Smart Automation', desc: 'Otomasi proses berulang untuk mengurangi human error dan efisiensi biaya operasional.' },
      { icon: 'i-tabler-wifi', title: 'Remote Monitoring', desc: 'Pantau kondisi mesin, sensor, dan lingkungan dari mana saja via internet.' },
      { icon: 'i-tabler-bell', title: 'Real-Time Alerts', desc: 'Notifikasi otomatis ke WhatsApp/email saat ada anomali atau kondisi kritis.' },
      { icon: 'i-tabler-bolt', title: 'Energy Efficient', desc: 'Hardware dioptimasi untuk konsumsi daya rendah dan performa tinggi.' },
    ],
    process: [
      { title: 'Requirements & Feasibility', desc: 'Analisis kebutuhan teknis, pemilihan hardware yang sesuai, dan estimasi biaya.' },
      { title: 'Hardware Design', desc: 'Desain skema rangkaian, PCB, dan pemilihan komponen optimal.' },
      { title: 'Firmware Development', desc: 'Pemrograman microcontroller (Arduino, ESP32, STM32, Raspberry Pi, dll.).' },
      { title: 'Integration & Testing', desc: 'Integrasi dengan cloud/backend dan pengujian di kondisi nyata.' },
      { title: 'Deployment & Support', desc: 'Instalasi di lokasi dan training penggunaan serta maintenance.' },
    ],
    faq: [
      { label: 'Hardware apa yang biasa digunakan?', content: 'Arduino, ESP32, ESP8266, Raspberry Pi, STM32, dan berbagai modul sensor (suhu, kelembaban, tekanan, gas, dll.).' },
      { label: 'Apakah bisa koneksi ke internet (IoT)?', content: 'Ya. Kami support koneksi WiFi, MQTT, HTTP, dan Bluetooth untuk integrasi dengan cloud platform.' },
      { label: 'Berapa estimasi biaya?', content: 'Starting Rp 300rb untuk prototype sederhana. Project IoT skala penuh mulai Rp 2jt+ tergantung kompleksitas hardware.' },
      { label: 'Apakah tersedia maintenance hardware?', content: 'Ya, tersedia kontrak maintenance untuk kalibrasi sensor, update firmware, dan penggantian komponen.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Embedded System & IoT',
  },

  'meta-ads': {
    title: 'Meta Ads (Facebook & Instagram)',
    tagline: 'Iklan yang tampil tepat kepada yang paling tertarik membeli',
    description: 'Coba-coba iklan sendiri hasilnya sering boncos? Tim kami merancang kampanye dengan teknik AIDA, retargeting, dan lookalike audience . ROI terukur, budget tidak terbuang.',
    icon: 'i-tabler-brand-meta', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-target', title: 'Targeting Presisi', desc: 'Iklan hanya tampil ke audiens yang benar-benar relevan , berdasarkan demografi, minat, dan perilaku.' },
      { icon: 'i-tabler-wallet', title: 'Budget Fleksibel', desc: 'Atur anggaran sendiri, tidak ada minimum. Budget iklan Anda dipakai seefisien mungkin.' },
      { icon: 'i-tabler-chart-line', title: 'Laporan Real-Time', desc: 'Monitor CTR, CPC, konversi, dan ROAS secara live kapan saja.' },
      { icon: 'i-tabler-refresh', title: 'Retargeting Cerdas', desc: 'Tarik kembali pengunjung yang mampir tapi belum beli , peluang konversi lebih tinggi.' },
    ],
    process: [
      { title: 'Konsultasi & Audit', desc: 'Analisis akun, tujuan campaign, dan strategi yang paling sesuai bisnis Anda.' },
      { title: 'Riset Audiens & Materi', desc: 'Riset targeting, buat copywriting iklan dan kreatif yang menarik perhatian.' },
      { title: 'Setup Campaign', desc: 'Konfigurasi campaign, ad set, tracking pixel, dan konversi yang akurat.' },
      { title: 'Monitoring & Optimasi', desc: 'Monitoring harian, A/B testing, dan penyesuaian untuk meningkatkan ROAS.' },
      { title: 'Laporan Mingguan', desc: 'Laporan performa lengkap beserta rekomendasi perbaikan untuk periode berikutnya.' },
    ],
    faq: [
      { label: 'Apakah saya perlu berbagi password?', content: 'Tidak. Anda cukup jadikan tim Lakara sebagai admin di Facebook Page Anda. Password tidak perlu dibagikan.' },
      { label: 'Berapa budget iklan minimum?', content: 'Tidak ada minimum dari Lakara. Namun kami rekomendasikan minimal Rp 1.5jt/bulan budget iklan untuk hasil yang terukur.' },
      { label: 'Apakah saya perlu punya kartu kredit?', content: 'Tidak. Anda bisa bayar via bank transfer ke Lakara, dan kami yang handle pembayaran ke Meta.' },
      { label: 'Berapa lama sampai hasilnya kelihatan?', content: 'Iklan biasanya mulai berjalan dalam 1–3 hari setelah setup. Hasil optimal biasanya terlihat di minggu 2–4.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Meta Ads (Facebook & Instagram)',
  },

  'google-ads': {
    title: 'Google Ads',
    tagline: 'Tampil di halaman 1 Google saat pelanggan mencari produk Anda',
    description: 'Bisnis Anda muncul tepat saat calon pelanggan aktif mencari di Google. Kami kelola Search, Display, Shopping, dan YouTube Ads dengan strategi keyword dan CPC optimal.',
    icon: 'i-tabler-brand-google', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-target', title: 'Intent-Based', desc: 'Muncul saat calon pelanggan sedang aktif mencari produk/jasa Anda , bukan audiens pasif.' },
      { icon: 'i-tabler-layout-grid', title: '4 Jenis Iklan', desc: 'Search Ads, Display Ads, Shopping Ads, dan YouTube Ads untuk semua stage funnel.' },
      { icon: 'i-tabler-calculator', title: 'Bayar per Klik', desc: 'Budget hanya terpakai saat iklan diklik , tidak ada biaya untuk tayangan yang tidak relevan.' },
      { icon: 'i-tabler-star', title: 'Quality Score Optimal', desc: 'Tim kami optimasi Quality Score untuk CPC lebih murah dan posisi iklan yang lebih baik.' },
    ],
    process: [
      { title: 'Konsultasi & Audit', desc: 'Analisis bisnis, target market, dan strategi keyword yang paling menguntungkan.' },
      { title: 'Riset Keyword', desc: 'Riset komprehensif keyword dengan volume tinggi dan CPC yang efisien.' },
      { title: 'Setup Campaign', desc: 'Buat campaign yang terstruktur dengan pesan iklan persuasif dan tracking konversi.' },
      { title: 'Learning Phase & Optimasi', desc: 'A/B testing, refinement keyword, dan penyesuaian bidding strategy.' },
      { title: 'Monitoring & Laporan', desc: 'Analisis performa bulanan + rekomendasi scaling untuk hasil ROI maksimal.' },
    ],
    faq: [
      { label: 'Apakah saya harus punya website?', content: 'Idealnya ya. Landing page yang relevan sangat membantu konversi. Kami juga bisa bantu buatkan landing page-nya.' },
      { label: 'Apakah Google Ads mahal?', content: 'Tidak. Anda hanya bayar saat diklik (CPC), tidak saat tayang. Budget bisa dimulai dari Rp 500rb/hari.' },
      { label: 'Apa itu Quality Score dan kenapa penting?', content: 'Quality Score (1–10) menentukan biaya iklan Anda. Semakin tinggi, semakin murah biayanya dan semakin atas posisi iklan.' },
      { label: 'Apakah bisa untuk toko di marketplace juga?', content: 'Google Shopping Ads sangat cocok untuk e-commerce , produk Anda tampil dengan gambar, harga, dan review langsung di Google.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Google Ads',
  },

  'seo': {
    title: 'SEO (Search Engine Optimization)',
    tagline: 'Traffic organik gratis dari Google , investasi yang tidak perlu diulang',
    description: 'Website Anda di Page 1 Google secara organik. Kami gunakan 6 metode: Technical SEO, Keyword Research, Competitor Analysis, On-Page, Off-Page, dan Backlink Building.',
    icon: 'i-tabler-search', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-trending-up', title: 'Traffic Gratis', desc: 'Setelah ranking, setiap klik tidak ada biayanya , iklan organik yang berlangsung selamanya.' },
      { icon: 'i-tabler-clock', title: 'Long-Term Results', desc: 'Berbeda dengan iklan berbayar, ranking SEO yang sudah dibangun bertahan dalam jangka panjang.' },
      { icon: 'i-tabler-shield-check', title: 'Kepercayaan Lebih Tinggi', desc: 'Website di Page 1 Google dianggap lebih kredibel dan terpercaya oleh calon customer.' },
      { icon: 'i-tabler-robot', title: 'AI-Ready SEO', desc: 'Dioptimasi untuk AI Overview Google , standar E-E-A-T yang relevan di 2026 dan seterusnya.' },
    ],
    process: [
      { title: 'Website Audit', desc: 'Analisis mendalam terhadap kondisi teknis, konten, dan otoritas website Anda saat ini.' },
      { title: 'Keyword & Competitor Research', desc: 'Riset kata kunci high-value dan analisis strategi SEO kompetitor.' },
      { title: 'On-Page Optimization', desc: 'Optimasi meta tags, heading, konten, internal link, dan kecepatan halaman.' },
      { title: 'Pembuatan Konten Blog', desc: 'Penulisan artikel SEO-friendly sesuai target keyword dan standar E-E-A-T Google.' },
      { title: 'Off-Page & Backlink', desc: 'Pembangunan backlink berkualitas dari website relevan dan berautoritas tinggi.' },
      { title: 'Monitoring & Laporan', desc: 'Pantau pergerakan ranking, traffic, dan konversi setiap bulan dengan laporan detail.' },
    ],
    packages: [
      { title: 'Bronze', subtitle: 'Minimum kontrak 6 bulan', price: 'via Konsultasi', period: '1 KU + 3 KP + 8 artikel/bln', popular: false, items: ['Website Audit', 'Competitor Analysis', 'On-Page & Off-Page SEO', '1 Keyword Utama', '3 Keyword Pendukung', '8 Konten Blog/bulan', 'Optimasi Web Speed', 'Laporan Bulanan'] },
      { title: 'Silver', subtitle: 'Minimum kontrak 6 bulan', price: 'via Konsultasi', period: '2 KU + 5 KP + 16 artikel/bln', popular: true, items: ['Website Audit', 'Competitor Analysis', 'On-Page & Off-Page SEO', '2 Keyword Utama', '5 Keyword Pendukung', '16 Konten Blog/bulan', 'Backlink Premium', 'Laporan Bulanan'] },
      { title: 'Gold', subtitle: 'Minimum kontrak 12 bulan', price: 'via Konsultasi', period: '5 KU + 10 KP + 24 artikel/bln', popular: false, items: ['Website Audit', 'Competitor Analysis', 'On-Page & Off-Page SEO', '5 Keyword Utama', '10 Keyword Pendukung', '24 Konten Blog/bulan', 'Backlink Premium', 'Local SEO (Google Maps)', 'Laporan Bulanan'] },
    ],
    faq: [
      { label: 'Berapa lama sampai hasilnya kelihatan?', content: '2–4 bulan untuk mulai melihat pergerakan ranking, 4–6 bulan untuk masuk Page 1. SEO butuh waktu , itu kenapa minimum kontrak 6 bulan.' },
      { label: 'Apakah website saya akan dapat backlink?', content: 'Ya. Tim kami bekerjasama dengan banyak blogger dan web profesional yang siap memberikan backlink berkualitas.' },
      { label: 'Apakah ada optimasi Google My Business?', content: 'Ya, Local SEO termasuk dalam paket Gold. Kami aktif konfigurasi agar bisnis Anda mudah ditemukan di Google Maps.' },
      { label: 'Apakah SEO aman? Tidak kena penalti Google?', content: 'Ya. Kami hanya menggunakan white-hat SEO yang sesuai guideline Google. Tidak ada teknik manipulatif yang berisiko penalti.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan SEO',
  },

  'tiktok-reels': {
    title: 'Video TikTok & Reels',
    tagline: '127 juta pengguna TikTok Indonesia , ada yang menunggu konten Anda',
    description: 'Konten video pendek yang masuk FYP dan Explore , dengan talent, riset trending sound & hashtag, editing profesional, dan strategi terukur berbasis AI.',
    icon: 'i-tabler-brand-tiktok', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-broadcast', title: 'Reach Masif', desc: 'TikTok & Reels menjangkau audiens baru yang belum follow , jangkauan organik tertinggi.' },
      { icon: 'i-tabler-flame', title: 'Viral Potential', desc: 'Algoritma organik yang jauh lebih powerful dibanding Facebook atau Instagram biasa.' },
      { icon: 'i-tabler-user', title: 'Talent Profesional', desc: 'Tim talent siap di depan kamera . Anda fokus bisnis, konten kami yang handle.' },
      { icon: 'i-tabler-robot', title: 'AI-Powered Strategy', desc: 'Riset trending audio, hashtag, dan timing upload berbasis data AI tools untuk hasil maksimal.' },
    ],
    process: [
      { title: 'Konsultasi & Brief', desc: 'Diskusi target audience, tone brand, jenis konten, dan goals yang ingin dicapai.' },
      { title: 'Riset Trend & Strategi', desc: 'Tim kami riset trending sound, hashtag performa tinggi, dan waktu posting optimal menggunakan AI tools.' },
      { title: 'Produksi Konten', desc: 'Shooting dan editing video dengan talent profesional, caption menjual, dan hashtag teroptimasi.' },
      { title: 'Review & Revisi', desc: 'Anda review setiap video sebelum posting . 2x revisi tersedia per video.' },
    ],
    packages: [
      { title: 'Bronze', subtitle: 'Untuk brand yang baru mulai', price: 'via Konsultasi', period: '5 video/bulan', popular: false, items: ['5 Video/bulan', 'Durasi 15–60 detik', 'Talent profesional', 'Caption & hashtag', 'Scheduling post', '2x revisi/video', 'Reporting performa'] },
      { title: 'Silver', subtitle: 'Untuk konsistensi konten', price: 'via Konsultasi', period: '10 video/bulan', popular: true, items: ['10 Video/bulan', 'Durasi 15–60 detik', 'Talent profesional', 'Caption & hashtag', 'Scheduling post', '2x revisi/video', 'Riset trending audio & hashtag', 'Konsultasi strategi', 'Reporting performa'] },
      { title: 'Gold', subtitle: 'Full management video', price: 'via Konsultasi', period: '15 video/bulan', popular: false, items: ['15 Video/bulan', 'Durasi 15–60 detik', 'Talent profesional', 'Caption & hashtag', 'Scheduling post', '2x revisi/video', 'AI-powered content strategy', 'Cross-platform (TikTok + Reels)', 'Monthly performance review'] },
    ],
    faq: [
      { label: 'Apakah saya perlu menyediakan talent sendiri?', content: 'Tidak. Tim kami menyediakan talent profesional. Tapi jika Anda ingin muncul sendiri atau pakai talent tertentu, bisa diatur.' },
      { label: 'Jenis konten apa yang bisa dibuat?', content: 'Katalog produk, tutorial, behind-the-scene, testimonial, storytelling, promo, Q&A, unboxing . 16+ jenis video bisa dibuat.' },
      { label: 'Apakah di-posting oleh tim Lakara?', content: 'Ya, termasuk scheduling dan posting. Anda cukup berikan akses tim kami, sisanya kami handle.' },
      { label: 'Apakah ada garansi masuk FYP?', content: 'Tidak ada yang bisa garansi FYP karena itu ditentukan algoritma. Tapi strategi berbasis data kami secara konsisten meningkatkan peluang.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan Video TikTok & Reels',
  },

  'ecommerce-growth': {
    title: 'E-Commerce Growth',
    tagline: 'Toko Shopee/Tokopedia Anda tampil lebih tinggi, konversi lebih besar',
    description: 'Optimasi toko marketplace end-to-end , product boost, review management, rating, followers toko, dan livestream viewers untuk meningkatkan konversi dan ranking produk.',
    icon: 'i-tabler-shopping-bag', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-trending-up', title: 'Ranking Produk Naik', desc: 'Produk Anda muncul lebih tinggi di pencarian Shopee dan Tokopedia.' },
      { icon: 'i-tabler-star', title: 'Social Proof Kuat', desc: 'Review, rating, dan followers toko yang tinggi meningkatkan kepercayaan calon pembeli.' },
      { icon: 'i-tabler-mouse-pointer', title: 'Konversi Lebih Tinggi', desc: 'Lebih banyak pengunjung toko yang berakhir transaksi.' },
      { icon: 'i-tabler-layout-grid', title: 'Multi-Platform', desc: 'Shopee, Tokopedia, Lazada, Bukalapak , semua marketplace tercover.' },
    ],
    process: [
      { title: 'Audit Toko', desc: 'Analisis kondisi toko, produk, dan pesaing untuk identifikasi area improvement.' },
      { title: 'Optimasi Listing', desc: 'Update foto, deskripsi, keyword, dan kategori produk untuk maksimalkan discoverability.' },
      { title: 'Growth Strategy', desc: 'Rancang strategi boost produk, pengelolaan review, dan program promosi toko.' },
      { title: 'Eksekusi & Monitoring', desc: 'Jalankan strategi dan pantau hasilnya , adjustment cepat berdasarkan data.' },
    ],
    faq: [
      { label: 'Platform marketplace apa yang didukung?', content: 'Shopee, Tokopedia, Lazada, Bukalapak, dan platform marketplace lokal lainnya.' },
      { label: 'Apakah ada garansi peningkatan penjualan?', content: 'Tidak ada jaminan angka spesifik karena dipengaruhi banyak faktor. Kami berkomitmen pada eksekusi strategi yang data-driven.' },
      { label: 'Berapa lama kontrak minimum?', content: 'Kami rekomendasikan minimum 2–3 bulan untuk melihat hasil yang signifikan dari optimasi organik.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan E-Commerce Growth',
  },

  'smm-panel': {
    title: 'SMM Panel Service',
    tagline: 'Social proof instan untuk semua platform',
    description: 'Pertumbuhan followers, likes, views, dan engagement terukur untuk Instagram, TikTok, YouTube, Facebook, Spotify, dan platform lain , kualitas terjaga, pengiriman cepat.',
    icon: 'i-tabler-chart-line', badge: 'Lakara Marketing',
    benefits: [
      { icon: 'i-tabler-layout-grid', title: 'Multi-Platform', desc: 'Instagram, TikTok, YouTube, Facebook, Spotify, Twitter/X, dan banyak lagi.' },
      { icon: 'i-tabler-bolt', title: 'Delivery Cepat', desc: 'Proses pengiriman otomatis , mulai dalam hitungan menit hingga jam.' },
      { icon: 'i-tabler-shield-check', title: 'Quality Terjaga', desc: 'Followers dan engagement yang natural , tidak ada akun bot yang berisiko ban.' },
      { icon: 'i-tabler-coin', title: 'Harga Kompetitif', desc: 'Harga panel terbaik dengan kualitas premium , transparan, tidak ada hidden fee.' },
    ],
    process: [
      { title: 'Pilih Layanan', desc: 'Pilih platform dan jenis layanan yang dibutuhkan (followers, likes, views, dll).' },
      { title: 'Input Detail', desc: 'Masukkan username atau URL konten yang ingin di-boost.' },
      { title: 'Konfirmasi & Bayar', desc: 'Konfirmasi order dan lakukan pembayaran via transfer atau e-wallet.' },
    ],
    faq: [
      { label: 'Apakah aman untuk akun saya?', content: 'Ya, kami menggunakan metode yang aman dan tidak melanggar TOS platform. Pengiriman gradual untuk keamanan akun.' },
      { label: 'Berapa lama proses delivery?', content: 'Tergantung layanan , biasanya 1–24 jam. Beberapa layanan premium membutuhkan 2–3 hari untuk delivery yang lebih natural.' },
      { label: 'Bagaimana cara order?', content: 'Hubungi WhatsApp kami untuk list harga lengkap dan proses order yang mudah.' },
    ],
    waMsg: 'Halo Lakara, saya tertarik layanan SMM Panel',
  },
}

const service = services[slug]
if (!service) {
  throw createError({ statusCode: 404, statusMessage: 'Layanan tidak ditemukan' })
}

const waLink = wa(service.waMsg)
</script>
