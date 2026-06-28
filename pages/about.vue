<template>
  <div>
    <!-- SEO via useSeoPage('about') → SEO Settings admin -->

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-20 pb-24">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 -left-16 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative">
        <div class="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">Tentang Lakara</span>
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-6 leading-tight">
              Mitra Digital Terpercaya<br />
              <span class="text-gradient">untuk Indonesia</span>
            </h1>
            <p class="text-lg text-gray-600 leading-relaxed mb-8">
              PT Lakara Solusi Kreatif berdiri dengan satu misi: membantu bisnis dan individu tumbuh berkelanjutan di era digital melalui inovasi teknologi, pengembangan talenta, dan solusi pemasaran yang efektif.
            </p>
            <div class="flex flex-wrap gap-3">
              <span class="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">🚀 Est. 2020</span>
              <span class="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">📍 Bogor, Indonesia</span>
              <span class="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">💼 3 Divisi</span>
            </div>
          </div>
          <div class="relative">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Tim Lakara"
              class="rounded-3xl shadow-2xl w-full"
            />
            <div class="absolute bottom-5 left-5 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-100">
              <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div class="text-sm font-bold text-gray-900">50+ Klien Puas</div>
                <div class="text-xs text-gray-500">sejak 2020</div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Stats -->
    <section class="py-16 bg-white border-y border-gray-100">
      <UContainer>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.title"
            class="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div class="text-5xl font-extrabold text-[#3358ff] mb-2">{{ stat.amount }}</div>
            <div class="text-sm text-gray-500 font-medium">{{ stat.title }}</div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Visi Misi -->
    <section class="py-20 md:py-28 bg-gray-50">
      <UContainer>
        <div class="text-center mb-12">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Kenapa Kami Ada</span>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Visi & Misi</h2>
          <p class="text-gray-500 max-w-3xl mx-auto">Menjadi perusahaan kreatif dan teknologi terdepan yang menghubungkan inovasi digital, pengembangan talenta, dan solusi pemasaran untuk membantu bisnis serta individu tumbuh berkelanjutan di era digital.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="(item, i) in visiItems"
            :key="item.title"
            class="rounded-2xl p-7 flex flex-col items-center text-center border-2 transition-all"
            :class="i === 1 ? 'bg-[#3358ff] border-[#3358ff] text-white shadow-xl shadow-blue-200' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'"
          >
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              :class="i === 1 ? 'bg-white/20' : 'bg-blue-50'">
              <UIcon :name="item.icon" class="w-7 h-7"
                :class="i === 1 ? 'text-white' : 'text-[#3358ff]'" />
            </div>
            <h3 class="font-bold mb-2 text-lg"
              :class="i === 1 ? 'text-white' : 'text-gray-900'">{{ item.title }}</h3>
            <p class="text-sm leading-relaxed"
              :class="i === 1 ? 'text-blue-100' : 'text-gray-500'">{{ item.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Nilai Perusahaan -->
    <section class="py-20 md:py-28 bg-white border-t border-gray-100">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-14 items-center">
          <div class="relative">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
              alt="Tim Lakara bekerja"
              class="rounded-3xl shadow-xl w-full"
            />
            <div class="absolute bottom-5 right-5 bg-[#3358ff] rounded-2xl shadow-lg px-4 py-3 text-white text-center">
              <div class="text-2xl font-extrabold">5+</div>
              <div class="text-xs text-blue-200">Tahun</div>
            </div>
          </div>
          <div>
            <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">DNA Lakara</span>
            <h2 class="text-3xl font-extrabold text-gray-900 mb-8">Nilai-Nilai Kami</h2>
            <div class="grid grid-cols-2 gap-5">
              <div v-for="item in nilaiItems" :key="item.title"
                class="flex gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
                <div class="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <UIcon :name="item.icon" class="w-4 h-4 text-[#3358ff]" />
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 text-sm">{{ item.title }}</h4>
                  <p class="text-xs text-gray-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Cara Kerja -->
    <section class="py-20 md:py-28 bg-gray-50 border-t border-gray-100">
      <UContainer>
        <div class="text-center mb-12">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Prinsip Kami</span>
          <h2 class="text-3xl font-extrabold text-gray-900 mb-4">Cara Kami Bekerja</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Empat prinsip yang menjadi fondasi setiap proyek di Lakara.</p>
        </div>
        <div class="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div v-for="(item, i) in caraKerjaItems" :key="item.title"
            class="flex gap-4 items-start bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-[#3358ff] text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-200">
              {{ i + 1 }}
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-1">{{ item.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
            </div>
          </div>
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
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Siap Bekerja Sama dengan Lakara?</h2>
        <p class="text-blue-100 mb-8 max-w-lg mx-auto">Konsultasi gratis, tanpa komitmen. Kami senang dengarkan kebutuhan bisnis Anda.</p>
        <UButton
          :to="wa('Halo Lakara, saya ingin konsultasi')"
          target="_blank"
          size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold"
          icon="i-tabler-brand-whatsapp"
        >
          Hubungi Kami Sekarang
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
await useSeoPage('about', { title: 'Tentang Kami . Lakara', description: 'PT Lakara Solusi Kreatif , didirikan oleh praktisi digital berpengalaman. 5 tahun melayani 50+ klien dari instansi pemerintah, BUMN, hingga UMKM.' })

const stats = [
  { title: 'Klien Puas', amount: '50+' },
  { title: 'Tahun Pengalaman', amount: '5+' },
  { title: 'Proyek Selesai', amount: '100+' },
  { title: 'Kota Terlayani', amount: '20+' },
]

const visiItems = [
  { title: 'Ekosistem Talenta', icon: 'i-tabler-users', description: 'Mengembangkan ekosistem talenta kreatif di bidang esports dan konten digital Indonesia.' },
  { title: 'Performa Digital', icon: 'i-tabler-chart-bar', description: 'Memberikan layanan peningkatan performa e-commerce dan social media yang efektif dan terukur.' },
  { title: 'Solusi Teknologi', icon: 'i-tabler-device-laptop', description: 'Menciptakan solusi teknologi berbasis website, aplikasi mobile, dan digital marketing.' },
]

const nilaiItems = [
  { title: 'Fast Learner', icon: 'i-tabler-bolt', description: 'Cepat beradaptasi dengan teknologi dan tren terbaru.' },
  { title: 'Highly Adaptive', icon: 'i-tabler-refresh', description: 'Fleksibel menyesuaikan solusi dengan kebutuhan klien.' },
  { title: 'Strong Teamwork', icon: 'i-tabler-heart-handshake', description: 'Kolaborasi lintas divisi yang solid.' },
  { title: 'Design-Oriented', icon: 'i-tabler-palette', description: 'Estetika dan UX di setiap produk.' },
  { title: 'Always Learning', icon: 'i-tabler-bulb', description: 'Mengikuti perkembangan industri terus-menerus.' },
  { title: 'Active Communication', icon: 'i-tabler-message-circle', description: 'Update berkala, komunikasi terbuka.' },
]

const caraKerjaItems = [
  { title: 'Teamwork', icon: 'i-tabler-users-group', description: 'Memberikan hasil terbaik melalui kerja sama tim yang solid dan komunikasi yang transparan.' },
  { title: 'Problem Solvers', icon: 'i-tabler-bulb', description: 'Selalu memberi ide segar dan informasi terkini sebagai solusi , bukan hanya mengerjakan yang diminta.' },
  { title: 'Delivering Value', icon: 'i-tabler-star', description: 'Setiap proyek dikerjakan dengan standar tinggi untuk memberikan nilai nyata bagi klien.' },
  { title: 'Long-term Partnership', icon: 'i-tabler-handshake', description: 'Kami berpikir jangka panjang , membangun relasi yang saling menguntungkan, bukan hanya transaksi.' },
]
</script>
