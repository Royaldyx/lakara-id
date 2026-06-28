<template>
  <div>
    <!-- SEO via useSeoPage('services') → SEO Settings admin -->

    <!-- Hero -->
    <section class="relative overflow-hidden bg-white pt-24 pb-20">
      <div class="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <UContainer class="relative">
        <div class="max-w-3xl mx-auto text-center">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Layanan</span>
          <h1 class="text-5xl font-extrabold text-gray-900 mt-3 mb-5 leading-tight">Semua Layanan Lakara</h1>
          <p class="text-xl text-gray-500 mb-10">Tiga divisi, satu ekosistem , kami cover semua kebutuhan digital bisnis Anda.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <UButton v-for="d in divisiTabs" :key="d.id" :to="'#' + d.id" variant="outline" color="gray" size="sm" class="rounded-full">
              {{ d.label }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══ LAKARA CREATIVE ══ -->
    <section id="creative" class="py-24 bg-gray-50">
      <UContainer>
        <div class="flex items-start gap-6 mb-14">
          <div class="w-14 h-14 rounded-2xl bg-[#3358ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            <UIcon name="i-tabler-code" class="w-7 h-7 text-white" />
          </div>
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Divisi 1</span>
            <h2 class="text-3xl font-extrabold text-gray-900 mt-1">Lakara Creative</h2>
            <p class="text-gray-500 mt-2 max-w-2xl">Solusi teknologi full-stack , dari desain hingga deploy, semua dikerjakan in-house oleh tim berpengalaman.</p>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink
            v-for="item in creativeServices"
            :key="item.title"
            :to="item.link"
            class="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#3358ff]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 block"
          >
            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-[#3358ff] transition-colors">
              <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff] group-hover:text-white transition-colors" />
            </div>
            <h4 class="font-bold text-gray-900 mb-2">{{ item.title }}</h4>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ item.description }}</p>
            <div class="flex items-center justify-between">
              <div v-if="item.price" class="inline-flex items-center gap-1 bg-blue-50 text-[#3358ff] text-xs font-semibold px-3 py-1 rounded-full">
                <UIcon name="i-tabler-tag" class="w-3 h-3" />
                {{ item.price }}
              </div>
              <span class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                Detail <UIcon name="i-tabler-arrow-right" class="w-3 h-3" />
              </span>
            </div>
          </NuxtLink>
        </div>
        <div class="mt-10 text-center">
          <UButton :to="wa('Halo Lakara, saya butuh layanan dari Lakara Creative')" target="_blank" style="background-color: #3358ff;" icon="i-tabler-brand-whatsapp" class="font-semibold shadow-lg shadow-blue-200">
            Konsultasi Lakara Creative
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- ══ LAKARA MARKETING ══ -->
    <section id="marketing" class="py-24 bg-white">
      <UContainer>
        <div class="flex items-start gap-6 mb-14">
          <div class="w-14 h-14 rounded-2xl bg-[#3358ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            <UIcon name="i-tabler-trending-up" class="w-7 h-7 text-white" />
          </div>
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Divisi 2</span>
            <h2 class="text-3xl font-extrabold text-gray-900 mt-1">Lakara Marketing (EBoost)</h2>
            <p class="text-gray-500 mt-2 max-w-2xl">Digital marketing, SMM panel, dan e-commerce growth service untuk semua platform , organik maupun berbayar.</p>
          </div>
        </div>

        <!-- SMM Management highlight -->
        <div class="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 md:p-10 mb-10">
          <div class="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            ⭐ Layanan Unggulan
          </div>
          <h3 class="text-2xl font-extrabold mb-3">Jasa Social Media Management</h3>
          <p class="text-blue-100 mb-7 leading-relaxed max-w-3xl">Lakara siap jadi partner terbaik untuk menaikkan traffic sosial media bisnis Anda , tanpa perlu hire admin, desainer, dan copywriter sendiri. Fokus jualan, urusan konten serahkan pada ahlinya.</p>

          <!-- Savings row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div v-for="saving in smmSavings" :key="saving.role" class="bg-white/10 rounded-xl p-3 text-center">
              <div class="text-xs text-blue-200 mb-1">Hire {{ saving.role }}</div>
              <div class="font-bold text-white text-sm">{{ saving.amount }}/bln</div>
            </div>
          </div>
          <div class="bg-white/15 rounded-xl p-4 mb-8">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <div class="text-blue-200 text-xs mb-1">Total pengeluaran/bulan kalau hire karyawan sendiri</div>
                <div class="text-2xl font-extrabold">Rp 12.500.000/bulan</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-blue-200 mb-1">Pakai Lakara, mulai</div>
                <div class="text-2xl font-extrabold">Rp 1.500.000/bln</div>
              </div>
            </div>
          </div>

          <!-- 4 Strategi Konten -->
          <div class="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">4 Strategi Konten Unggulan Kami</div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div v-for="strategy in smmStrategies" :key="strategy.title" class="bg-white/10 rounded-2xl p-4">
              <div class="font-bold text-white text-sm mb-1.5">{{ strategy.title }}</div>
              <div class="text-blue-100 text-xs leading-relaxed">{{ strategy.desc }}</div>
            </div>
          </div>
        </div>

        <!-- Paket SMM -->
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Paket Social Media Management</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          <div
            v-for="pkg in smmPackages"
            :key="pkg.name"
            class="rounded-2xl border-2 p-6 flex flex-col"
            :class="pkg.popular ? 'border-[#3358ff] bg-[#3358ff] text-white shadow-xl shadow-blue-200' : 'border-gray-200 bg-white'"
          >
            <div v-if="pkg.popular" class="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full self-start mb-3">⭐ Paling Populer</div>
            <div class="text-xs font-semibold uppercase tracking-wider mb-2" :class="pkg.popular ? 'text-blue-200' : 'text-[#3358ff]'">{{ pkg.level }}</div>
            <h4 class="text-xl font-extrabold mb-1" :class="pkg.popular ? 'text-white' : 'text-gray-900'">{{ pkg.name }}</h4>
            <div class="text-sm mb-4" :class="pkg.popular ? 'text-blue-100' : 'text-gray-500'">{{ pkg.target }}</div>
            <div class="font-bold mb-4" :class="pkg.popular ? 'text-white' : 'text-gray-700'">{{ pkg.konten }}</div>
            <ul class="space-y-2 mb-6 flex-1">
              <li v-for="f in pkg.fitur" :key="f" class="flex items-start gap-2 text-sm" :class="pkg.popular ? 'text-blue-100' : 'text-gray-500'">
                <UIcon name="i-tabler-check" class="w-4 h-4 flex-shrink-0 mt-0.5" :class="pkg.popular ? 'text-white' : 'text-[#3358ff]'" />
                {{ f }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket SMM ${pkg.name}`)"
              target="_blank"
              block
              :class="pkg.popular ? 'bg-white text-[#3358ff] hover:bg-blue-50 font-bold' : 'font-semibold'"
              :style="!pkg.popular ? 'background-color: #3358ff;' : ''"
            >
              Konsultasi Sekarang
            </UButton>
          </div>
        </div>

        <!-- Marketing services grid -->
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Layanan Marketing Lainnya</h3>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="item in marketingServices"
            :key="item.title"
            class="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#3358ff]/40 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <h4 class="font-bold text-gray-900 mb-2">{{ item.title }}</h4>
            <p class="text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>

        <!-- Platform Produk Kami -->
        <div class="mt-14">
          <div class="text-center mb-8">
            <span class="inline-block bg-blue-50 text-[#3358ff] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">Platform Produk Kami</span>
            <h3 class="text-xl font-extrabold text-gray-900">Coba langsung platform yang kami kelola</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <a href="https://ecommercebooster.id" target="_blank" rel="noopener"
              class="group flex items-start gap-4 bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-[#3358ff] hover:shadow-lg transition-all">
              <div class="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-tabler-shopping-bag" class="w-6 h-6 text-orange-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                  ecommercebooster.id
                  <UIcon name="i-tabler-external-link" class="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3358ff] transition-colors" />
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">Platform growth e-commerce , boost produk, followers toko, review, dan layanan marketplace lainnya.</p>
              </div>
            </a>
            <a href="https://sosmedneeds.com" target="_blank" rel="noopener"
              class="group flex items-start gap-4 bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-[#3358ff] hover:shadow-lg transition-all">
              <div class="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center flex-shrink-0">
                <UIcon name="i-tabler-heart" class="w-6 h-6 text-pink-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                  sosmedneeds.com
                  <UIcon name="i-tabler-external-link" class="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3358ff] transition-colors" />
                </div>
                <p class="text-xs text-gray-500 leading-relaxed">SMM panel terpercaya , followers, likes, views, dan engagement untuk semua platform sosial media.</p>
              </div>
            </a>
          </div>
        </div>

        <div class="mt-10 text-center">
          <UButton :to="wa('Halo Lakara, saya butuh layanan dari Lakara Marketing')" target="_blank" style="background-color: #3358ff;" icon="i-tabler-brand-whatsapp" class="font-semibold shadow-lg shadow-blue-200">
            Konsultasi Lakara Marketing
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- ══ LAKARA TALENT ══ -->
    <section id="talent" class="py-24 bg-gray-50">
      <UContainer>
        <div class="flex items-start gap-6 mb-10">
          <div class="w-14 h-14 rounded-2xl bg-[#3358ff] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            <UIcon name="i-tabler-microphone-2" class="w-7 h-7 text-white" />
          </div>
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Divisi 3</span>
            <h2 class="text-3xl font-extrabold text-gray-900 mt-1">Lakara Talent</h2>
            <p class="text-gray-500 mt-2 max-w-2xl">Manajemen talenta esports profesional untuk event online & offline di seluruh Indonesia.</p>
          </div>
        </div>

        <!-- talent.lakara.id shortcut -->
        <a href="https://talent.lakara.id" target="_blank" rel="noopener"
          class="group flex flex-col md:flex-row items-start md:items-center gap-5 bg-gradient-to-r from-[#3358ff] to-[#6366f1] text-white rounded-2xl p-6 mb-10 hover:shadow-xl transition-shadow">
          <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-tabler-trophy" class="w-6 h-6 text-white" />
          </div>
          <div class="flex-1">
            <div class="font-extrabold text-lg mb-1">talent.lakara.id</div>
            <p class="text-blue-100 text-sm leading-relaxed">Platform dedicated untuk talent esports, shoutcaster, dan event host , booking langsung, jadwal tersedia, profil talent lengkap.</p>
          </div>
          <div class="flex items-center gap-2 bg-white text-[#3358ff] font-bold text-sm px-5 py-2.5 rounded-xl group-hover:bg-blue-50 transition-colors flex-shrink-0">
            Kunjungi <UIcon name="i-tabler-arrow-right" class="w-4 h-4" />
          </div>
        </a>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="item in talentServices"
            :key="item.title"
            class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#3358ff]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <h4 class="font-bold text-gray-900 mb-2">{{ item.title }}</h4>
            <p class="text-sm text-gray-500 leading-relaxed mb-3">{{ item.description }}</p>
            <div v-if="item.price" class="inline-flex items-center gap-1 bg-blue-50 text-[#3358ff] text-xs font-semibold px-3 py-1 rounded-full">
              <UIcon name="i-tabler-tag" class="w-3 h-3" />
              {{ item.price }}
            </div>
          </div>
        </div>
        <div class="mt-10 text-center">
          <UButton :to="wa('Halo Lakara, saya butuh layanan dari Lakara Talent')" target="_blank" style="background-color: #3358ff;" icon="i-tabler-brand-whatsapp" class="font-semibold shadow-lg shadow-blue-200">
            Konsultasi Lakara Talent
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-[#3358ff]">
      <UContainer class="text-center">
        <h2 class="text-4xl font-extrabold text-white mb-4">Tidak yakin layanan mana yang tepat?</h2>
        <p class="text-blue-100 text-lg mb-10">Konsultasi gratis 30 menit , kami bantu tentukan solusi terbaik untuk bisnis Anda.</p>
        <UButton
          :to="wa('Halo Lakara, saya butuh rekomendasi layanan yang tepat')"
          target="_blank"
          size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold shadow-xl"
          icon="i-tabler-message-circle"
        >
          Konsultasi Gratis Sekarang
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
await useSeoPage('services', { title: 'Layanan . Lakara', description: 'Tiga divisi solusi digital: Lakara Creative (web & app), Lakara Marketing (SMM & ads), Lakara Talent (esports host & shoutcaster).' })

const divisiTabs = [
  { id: 'creative', label: '💻 Lakara Creative' },
  { id: 'marketing', label: '📈 Lakara Marketing' },
  { id: 'talent', label: '🎙️ Lakara Talent' },
]

const creativeServices = [
  { title: 'Landing Page & Company Profile', icon: 'i-tabler-layout-navbar', price: 'Mulai Rp 500rb', link: '/layanan/landing-page', description: 'Website profesional fast-loading, mobile-friendly, dan SEO-optimized.' },
  { title: 'E-Commerce', icon: 'i-tabler-shopping-cart', price: 'Mulai Rp 1.5jt', link: '/layanan/ecommerce', description: 'Toko online WooCommerce atau custom dengan integrasi payment gateway.' },
  { title: 'Web App Custom', icon: 'i-tabler-apps', price: 'Rp 3jt–7jt', link: '/layanan/web-app', description: 'Sistem akademik, LMS, job fair, inventory, QR menu, dan lainnya.' },
  { title: 'Mobile App (Android & iOS)', icon: 'i-tabler-device-mobile', price: 'Starting Rp 2jt', link: '/layanan/mobile-app', description: 'Aplikasi kasir, food order, inventory, dan custom app sesuai kebutuhan.' },
  { title: 'SaaS Development', icon: 'i-tabler-cloud', price: 'Mulai Rp 50k/bln', link: '/layanan/saas', description: 'Software berlangganan dengan model Starter, Business, Enterprise tier.' },
  { title: 'UI/UX Design', icon: 'i-tabler-palette', price: 'Custom quote', link: '/layanan/uiux', description: 'Design system, wireframe, prototype, dan user experience research.' },
  { title: 'Desain Grafis', icon: 'i-tabler-vector', price: 'Mulai Rp 20k', link: '/layanan/desain-grafis', description: 'Banner, poster, feed sosmed, infografis, dan materi pemasaran digital.' },
  { title: 'Desain Logo & Branding', icon: 'i-tabler-diamond', price: 'Custom quote', link: '/layanan/desain-logo', description: 'Logo profesional, brand guideline, dan identitas visual yang konsisten.' },
  { title: 'Video Animasi', icon: 'i-tabler-movie', price: 'Custom quote', link: '/layanan/video-animasi', description: 'Video company profile, animasi explainer, dan konten visual premium.' },
  { title: 'Sistem & Dashboard', icon: 'i-tabler-chart-bar', price: 'Custom quote', link: '/layanan/sistem-dashboard', description: 'OEE, logistik, warehouse management, POS enterprise, dan monitoring system.' },
  { title: 'Embedded System & IoT', icon: 'i-tabler-cpu', price: 'Starting Rp 300k', link: '/layanan/embedded-iot', description: 'Smart device, sensor monitoring, dan sistem otomasi berbasis hardware.' },
  { title: 'Foto Produk Profesional', icon: 'i-tabler-camera', price: 'Custom quote', link: '/layanan/foto-produk', description: 'Foto produk berkualitas tinggi untuk marketplace, website, dan iklan digital.' },
]

const smmSavings = [
  { role: 'Graphic Designer', amount: 'Rp 3.000.000' },
  { role: 'Video Animator', amount: 'Rp 3.500.000' },
  { role: 'Copywriter', amount: 'Rp 3.000.000' },
  { role: 'Admin Sosmed', amount: 'Rp 3.000.000' },
]

const smmProcess = [
  'Riset konten mendalam & ide relevan',
  'Konsultasi strategi gratis di awal',
  'Copywriting kuat + CTA yang persuasif',
  'Riset hashtag paling efektif',
  'Desain konten profesional & estetis',
  'Revisi gratis setiap desain',
]

const smmStrategies = [
  {
    title: '1. Konten Konsisten & Bernilai',
    desc: 'Setiap unggahan direncanakan berdasarkan kalender konten dan strategi branding , relevan dan bernilai bagi target market, mulai dari tips, edukasi, hingga storytelling.',
  },
  {
    title: '2. Fokus Reels/Carousel untuk Jangkauan',
    desc: 'Carousel mencatat engagement rate 10.15% vs single image hanya 1-3%. Setiap konten dikemas dengan format paling efektif mengikuti tren algoritma terkini.',
  },
  {
    title: '3. Copywriting, Hashtag & Timing',
    desc: 'Copywriting yang tepat mengubah penonton jadi pelanggan. Hashtag relevan memperluas jangkauan. Timing disesuaikan dengan perilaku audiens untuk engagement tinggi.',
  },
  {
    title: '4. Rasio Format Terbaru (4:5)',
    desc: 'Instagram mengubah rasio tampilan feed dari 1:1 menjadi 4:5. Tim kami selalu update dengan perubahan ini dan memaksimalkan setiap fitur terbaru untuk engagement optimal.',
  },
]

const smmPackages = [
  {
    level: 'Starter', name: 'Bronze', target: 'UMKM & Personal Brand', konten: '12 konten/bulan', popular: false,
    fitur: ['6 Feed + 3 Carousel + 3 Story', 'Riset hashtag', 'Copywriting + CTA', 'Auto-scheduling', '1x revisi', 'Laporan bulanan'],
  },
  {
    level: 'Growth', name: 'Silver', target: 'Perusahaan Menengah', konten: '16 konten/bulan', popular: true,
    fitur: ['5 Feed + 5 Carousel + 3 Reels + 3 Story', 'Reels 15–30 detik', 'Content pillar mapping', 'Reply DM < 4 jam', 'Story interactive', '2x revisi', 'Konsultasi 1x/bulan'],
  },
  {
    level: 'Authority', name: 'Gold', target: 'Perusahaan Menengah-Besar', konten: '20 konten/bulan', popular: false,
    fitur: ['5 Feed + 6 Carousel + 5 Reels + 4 Story', 'Full engagement management', 'Reply DM < 2 jam', 'Competitor monitoring', '3x revisi', 'Konsultasi 2x/bulan', 'Free Meta Ads onboarding'],
  },
  {
    level: 'Enterprise', name: 'Custom', target: 'Korporat & Multi-Brand', konten: 'All Gold +', popular: false,
    fitur: ['Dedicated Account Manager', 'Multi-platform (IG + TikTok/FB)', 'Photoshoot 1 sesi/bulan', 'Meta Ads management', 'Quarterly strategy review', 'Crisis management protocol'],
  },
]

const marketingServices = [
  {
    title: 'Meta Ads (Facebook & Instagram)',
    icon: 'i-tabler-brand-meta',
    description: 'Coba-coba sendiri, hasilnya sering boncos? Serahkan ke tim kami. Iklan dirancang dengan teknik AIDA, retargeting, dan lookalike audience , tampil ke audiens yang benar-benar tertarik, bukan buang budget percuma.',
  },
  {
    title: 'Google Ads',
    icon: 'i-tabler-brand-google',
    description: 'Bisnis Anda muncul tepat saat calon pelanggan mencari produk/jasa di Google. Kami tangani Search, Display, Shopping, dan YouTube Ads , strategi keyword, quality score, dan CPC optimal.',
  },
  {
    title: 'SEO (Search Engine Optimization)',
    icon: 'i-tabler-search',
    description: 'Sudah 2026 dan website Anda belum Page 1? Kami pakai 6 metode: Technical SEO, Keyword Research, Competitor Analysis, On-Page, Off-Page, dan Backlink Building. Traffic organik = iklan gratis selamanya.',
  },
  {
    title: 'Video TikTok & Reels',
    icon: 'i-tabler-brand-tiktok',
    description: '127 juta pengguna TikTok Indonesia . 95 menit/hari rata-rata menonton. Kami produksi konten video dengan talent, riset trending audio & hashtag, plus strategi agar masuk FYP dan Explore.',
  },
  {
    title: 'E-Commerce Growth (Shopee/Tokopedia)',
    icon: 'i-tabler-shopping-bag',
    description: 'Optimasi toko end-to-end: product boost, review management, rating, followers toko, dan livestream viewers. Konversi lebih tinggi, ranking produk naik, penjualan meningkat.',
  },
  {
    title: 'SMM Panel (Followers, Likes, Views)',
    icon: 'i-tabler-chart-line',
    description: 'Pertumbuhan sosial proof terukur untuk Instagram, TikTok, YouTube, Facebook, Spotify, dan platform lain. Organik maupun panel service dengan kualitas terjaga.',
  },
]

const talentServices = [
  { title: 'Shoutcasting Online', icon: 'i-tabler-broadcast', price: 'Rp 600rb–1.6jt/sesi', description: 'Talent shoutcaster profesional untuk event online, turnamen streaming, dan esports digital.' },
  { title: 'Shoutcasting Offline', icon: 'i-tabler-microphone', price: 'Rp 1.6jt–2.2jt/sesi', description: 'On-the-spot di venue event. Siap tampil di seluruh kota Indonesia.' },
  { title: 'Event Hosting', icon: 'i-tabler-presentation', price: 'Custom quote', description: 'Host profesional untuk turnamen, peluncuran produk, dan acara gaming.' },
  { title: 'Talent Scouting', icon: 'i-tabler-search', price: 'Custom quote', description: 'Rekrutmen dan talent hunting untuk esports team, content creator, dan brand ambassador gaming.' },
  { title: 'Talent Development', icon: 'i-tabler-school', price: 'Custom quote', description: 'Training, mentoring, dan program pengembangan untuk talent muda di industri esports.' },
  { title: 'Brand Collaboration', icon: 'i-tabler-handshake', price: 'Custom quote', description: 'Endorsement dan kolaborasi brand dengan talent gaming yang punya reach jutaan audience Indonesia.' },
]
</script>
