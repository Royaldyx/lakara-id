<template>
  <div>
    <!-- SEO via useSeoPage('pricing') → SEO Settings admin -->

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-20 pb-16">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 left-0 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative text-center">
        <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Harga Transparan</span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Harga Jelas, Kualitas Terukur</h1>
        <p class="text-gray-500 max-w-xl mx-auto text-lg">Pilih paket yang sesuai kebutuhan bisnis Anda. Tidak ada biaya tersembunyi.</p>
        <div class="flex flex-wrap justify-center gap-3 mt-8">
          <a v-for="nav in quickNav" :key="nav.id" :href="`#${nav.id}`"
            class="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#3358ff] hover:text-[#3358ff] transition-colors shadow-sm">
            {{ nav.label }}
          </a>
        </div>

        <!-- Billing toggle -->
        <div class="flex flex-col items-center gap-1.5 mt-8">
          <div class="inline-flex items-center gap-1 p-1 bg-white rounded-full border border-gray-200 shadow-sm">
            <button @click="billing = 'monthly'"
              class="px-5 py-1.5 rounded-full text-sm font-semibold transition-colors"
              :class="billing === 'monthly' ? 'bg-[#3358ff] text-white' : 'text-gray-600 hover:text-gray-900'">
              Bulanan
            </button>
            <button @click="billing = 'yearly'"
              class="px-5 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5"
              :class="billing === 'yearly' ? 'bg-[#3358ff] text-white' : 'text-gray-600 hover:text-gray-900'">
              Tahunan
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                :class="billing === 'yearly' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'">HEMAT 15%</span>
            </button>
          </div>
          <p class="text-xs text-gray-400">Diskon tahunan berlaku untuk paket berlangganan bulanan</p>
        </div>
      </UContainer>
    </section>

    <!-- ═══════ SMM MANAGEMENT ═══════ -->
    <section id="smm" class="section bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <span class="inline-block bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Paling Diminati</span>
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Social Media Management</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Kelola social media bisnis Anda secara profesional. Tim siap jadi partner , tanpa perlu hire sendiri.</p>
        </div>

        <!-- Savings breakdown -->
        <div class="max-w-3xl mx-auto mb-10 rounded-2xl bg-gradient-to-r from-[#3358ff] to-[#6366f1] text-white p-7 md:p-8">
          <div class="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">Kalau Hire Karyawan Sendiri</div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div v-for="s in smmSavingsBreakdown" :key="s.role" class="bg-white/10 rounded-xl p-3 text-center">
              <div class="text-xs text-blue-200 mb-1">{{ s.role }}</div>
              <div class="font-bold text-white text-sm">{{ s.amount }}/bln</div>
            </div>
          </div>
          <div class="flex flex-col md:flex-row md:items-center gap-4 bg-white/15 rounded-xl p-4">
            <div class="flex-1">
              <div class="text-blue-200 text-xs mb-1">Total pengeluaran/bulan untuk tim SMM</div>
              <div class="text-2xl font-extrabold">Rp 12.500.000/bulan</div>
              <div class="text-xs text-blue-200 mt-1">Belum termasuk training, tools, dan waktu manajemen</div>
            </div>
            <div class="flex-shrink-0 text-center">
              <div class="text-xs text-blue-200 mb-1">Pakai Lakara, mulai dari</div>
              <div class="text-3xl font-black text-white">Rp 1.5jt</div>
              <div class="text-xs text-blue-200">/bulan</div>
            </div>
          </div>
        </div>

        <!-- SMM packages -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          <div
            v-for="pkg in smmPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-6 flex flex-col transition-all hover:shadow-lg bg-white"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase whitespace-nowrap">⭐ Populer</span>
            </div>
            <div class="mb-5">
              <div class="text-xs font-semibold text-[#3358ff] uppercase tracking-wider mb-1.5">{{ pkg.level }}</div>
              <h3 class="text-xl font-extrabold text-gray-900">{{ pkg.title }}</h3>
              <p class="text-xs text-gray-500 mt-1.5">{{ pkg.target }}</p>
            </div>
            <div class="mb-6">
              <div v-if="pkg.price !== 'Custom'">
                <span class="text-3xl font-extrabold text-gray-900">Rp {{ displayMonthly(pkg.price) }}</span>
                <span class="text-sm text-gray-400">/bln</span>
                <div v-if="billing === 'yearly'" class="text-xs text-emerald-600 font-semibold mt-1">
                  Ditagih Rp {{ yearlyTotal(pkg.price) }}/tahun
                </div>
              </div>
              <div v-else class="text-3xl font-extrabold text-gray-900">Custom</div>
              <div class="text-xs text-[#3358ff] font-semibold mt-3 bg-blue-50 inline-block px-2.5 py-1 rounded-lg">{{ pkg.konten }}</div>
            </div>
            <ul class="space-y-2.5 mb-6 flex-1">
              <li v-for="f in pkg.fitur" :key="f" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ f }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket SMM ${pkg.title}`)"
              target="_blank"
              block
              :style="pkg.popular ? 'background-color: #3358ff;' : ''"
              :variant="pkg.popular ? undefined : 'outline'"
              :color="pkg.popular ? undefined : 'gray'"
              class="font-semibold text-sm"
            >
              Konsultasi Sekarang
            </UButton>
          </div>
        </div>
        <p class="text-center text-xs text-gray-400 mt-5">* Minimum kontrak 3 bulan untuk hasil yang terukur. Setup fee: Rp 500rb (gratis untuk Silver ke atas).</p>
      </UContainer>
    </section>

    <!-- ═══════ META ADS ═══════ -->
    <section id="meta-ads" class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Meta Ads (Facebook & Instagram)</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Iklan tampil kepada audiens yang benar-benar tertarik. Budget terukur, hasil termonitor real-time.</p>
        </div>

        <!-- Meta Ads features -->
        <div class="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          <div v-for="f in metaAdsFeatures" :key="f.title"
            class="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
            <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <UIcon :name="f.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <div class="font-semibold text-gray-900 text-sm mb-1">{{ f.title }}</div>
            <div class="text-xs text-gray-500">{{ f.desc }}</div>
          </div>
        </div>

        <!-- Meta Ads packages -->
        <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-4">
          <div
            v-for="pkg in metaAdsPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-7 flex flex-col bg-white transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populer</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-1">{{ pkg.title }}</h3>
            <p class="text-xs text-gray-500 mb-4">{{ pkg.subtitle }}</p>
            <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4">
              <div class="text-xs text-orange-600 font-medium mb-0.5">Budget iklan yang disiapkan klien</div>
              <div class="text-lg font-extrabold text-orange-700">{{ pkg.budget }}</div>
            </div>
            <ul class="space-y-2 mb-6 flex-1">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket Meta Ads ${pkg.title}`)"
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
        <p class="text-center text-xs text-gray-400">Budget iklan belum termasuk management fee. Management fee via konsultasi.</p>
      </UContainer>
    </section>

    <!-- ═══════ SEO ═══════ -->
    <section id="seo" class="section bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">SEO (Search Engine Optimization)</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Website Anda di Page 1 Google secara organik , traffic gratis, konversi berkelanjutan.</p>
        </div>

        <!-- SEO types -->
        <div class="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto mb-10">
          <div v-for="t in seoTypes" :key="t.title"
            class="bg-gray-50 rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <UIcon :name="t.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <div class="font-semibold text-gray-900 text-sm mb-1">{{ t.title }}</div>
            <div class="text-xs text-gray-500">{{ t.desc }}</div>
          </div>
        </div>

        <!-- SEO packages -->
        <div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div
            v-for="pkg in seoPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-7 flex flex-col bg-white transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populer</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-1">{{ pkg.title }}</h3>
            <p class="text-xs text-gray-400 mb-4">{{ pkg.period }}</p>
            <ul class="space-y-2.5 mb-6 flex-1">
              <li v-for="item in pkg.items" :key="item.text" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon :name="item.included ? 'i-tabler-check' : 'i-tabler-x'" class="w-4 h-4 flex-shrink-0 mt-0.5"
                  :class="item.included ? 'text-[#3358ff]' : 'text-gray-300'" />
                {{ item.text }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket SEO ${pkg.title}`)"
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

    <!-- ═══════ TIKTOK / REELS ═══════ -->
    <section id="tiktok" class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Video TikTok & Reels</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">Konten video pendek viral yang masuk FYP/Explore , talent, edit, caption, scheduling, semua dalam satu paket.</p>
        </div>

        <!-- TikTok stat -->
        <div class="flex flex-wrap justify-center gap-4 mb-10">
          <div v-for="stat in tiktokStats" :key="stat.label"
            class="bg-white rounded-2xl border border-gray-100 px-6 py-4 text-center shadow-sm min-w-[120px]">
            <div class="text-2xl font-extrabold text-[#3358ff]">{{ stat.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-4">
          <div
            v-for="pkg in tiktokPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-7 flex flex-col bg-white transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populer</span>
            </div>
            <h3 class="text-lg font-extrabold text-gray-900 mb-1">{{ pkg.title }}</h3>
            <p class="text-xs text-gray-500 mb-3">{{ pkg.subtitle }}</p>
            <div class="text-2xl font-extrabold text-[#3358ff] mb-4">{{ pkg.video }} video<span class="text-sm text-gray-400 font-medium">/bulan</span></div>
            <ul class="space-y-2 mb-6 flex-1">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
            <UButton
              :to="wa(`Halo Lakara, saya tertarik paket TikTok/Reels ${pkg.title}`)"
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
        <p class="text-center text-xs text-gray-400">Harga final via konsultasi , menyesuaikan kebutuhan talent, lokasi, dan platform.</p>
      </UContainer>
    </section>

    <!-- ═══════ WEBSITE DEVELOPMENT ═══════ -->
    <section id="web" class="section bg-white">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Website Development</h2>
          <p class="text-gray-500">Dari landing page sederhana hingga sistem enterprise</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            v-for="pkg in webPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-8 flex flex-col bg-white transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populer</span>
            </div>
            <div class="mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ pkg.title }}</h3>
              <p class="text-sm text-gray-500">{{ pkg.subtitle }}</p>
            </div>
            <div class="mb-6">
              <div class="text-xs text-gray-400 mb-1">mulai dari</div>
              <div class="text-4xl font-extrabold text-gray-900">Rp {{ pkg.period === 'per bulan' ? displayMonthly(pkg.price) : pkg.price }}</div>
              <div class="text-sm text-gray-400 mt-1">{{ pkg.period }}</div>
              <div v-if="billing === 'yearly' && pkg.period === 'per bulan'" class="text-xs text-emerald-600 font-semibold mt-1">Ditagih Rp {{ yearlyTotal(pkg.price) }}/tahun</div>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
            <UButton
              :to="pkg.href"
              target="_blank"
              block
              :style="pkg.popular ? 'background-color: #3358ff;' : ''"
              :variant="pkg.popular ? undefined : 'outline'"
              :color="pkg.popular ? undefined : 'gray'"
              class="font-semibold"
            >
              {{ pkg.cta }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ═══════ SAAS ═══════ -->
    <section id="saas" class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-10">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">SaaS Development</h2>
          <p class="text-gray-500">Software berlangganan untuk pertumbuhan jangka panjang</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            v-for="pkg in saasPricing"
            :key="pkg.title"
            class="relative rounded-2xl border-2 p-8 bg-white flex flex-col transition-all hover:shadow-lg"
            :class="pkg.popular ? 'border-[#3358ff] shadow-xl' : 'border-gray-200'"
          >
            <div v-if="pkg.popular" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-[#3358ff] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Populer</span>
            </div>
            <div class="mb-6">
              <h3 class="text-lg font-bold text-gray-900 mb-1">{{ pkg.title }}</h3>
              <p class="text-sm text-gray-500">{{ pkg.subtitle }}</p>
            </div>
            <div class="mb-6">
              <div class="text-xs text-gray-400 mb-1">mulai dari</div>
              <div class="text-4xl font-extrabold text-gray-900">Rp {{ pkg.period === 'per bulan' ? displayMonthly(pkg.price) : pkg.price }}</div>
              <div class="text-sm text-gray-400 mt-1">{{ pkg.period }}</div>
              <div v-if="billing === 'yearly' && pkg.period === 'per bulan'" class="text-xs text-emerald-600 font-semibold mt-1">Ditagih Rp {{ yearlyTotal(pkg.price) }}/tahun</div>
            </div>
            <ul class="space-y-3 mb-8 flex-1">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <UIcon name="i-tabler-check" class="w-4 h-4 text-[#3358ff] flex-shrink-0 mt-0.5" />
                {{ item }}
              </li>
            </ul>
            <UButton
              :to="pkg.href"
              target="_blank"
              block
              :style="pkg.popular ? 'background-color: #3358ff;' : ''"
              :variant="pkg.popular ? undefined : 'outline'"
              :color="pkg.popular ? undefined : 'gray'"
              class="font-semibold"
            >
              {{ pkg.cta }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Kenapa kompetitif -->
    <section class="section bg-white">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Kenapa Harga Kami Kompetitif?</h2>
          <p class="text-gray-500">Transparansi dan value yang nyata di setiap rupiah yang Anda investasikan.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div v-for="item in whyItems" :key="item.title"
            class="flex gap-4 items-start bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h4>
              <p class="text-sm text-gray-500">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- FAQ Harga -->
    <section class="section bg-gray-50">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">FAQ Harga</h2>
          <p class="text-gray-500">Pertanyaan umum seputar harga dan pembayaran.</p>
        </div>
        <div class="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
          <UAccordion :items="faqItems" />
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
        <span class="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">Konsultasi Gratis</span>
        <h2 class="text-3xl md:text-4xl font-extrabold mb-4">Tidak menemukan paket yang pas?</h2>
        <p class="text-blue-100 mb-8 max-w-xl mx-auto">Kami buatkan paket custom sesuai kebutuhan dan budget Anda. Gratis konsultasi, tanpa komitmen.</p>
        <UButton
          :to="wa('Halo Lakara, saya mau konsultasi harga paket custom')"
          target="_blank"
          size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold"
          icon="i-tabler-brand-whatsapp"
        >
          Chat WhatsApp Sekarang
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()
await useSeoPage('pricing', { title: 'Harga Layanan . Lakara', description: 'Harga transparan tanpa biaya tersembunyi. Website mulai Rp 500rb, SMM management mulai Rp 1.5jt/bulan, mobile app mulai Rp 2jt.' })

// Billing toggle (bulanan / tahunan -15%)
const billing = ref<'monthly' | 'yearly'>('monthly')
const YEARLY_DISCOUNT = 0.15
const parsePrice = (p: string) => parseInt(String(p).replace(/\D/g, ''), 10) || 0
const fmtRupiah  = (n: number) => n.toLocaleString('id-ID')
function displayMonthly(price: string) {
  const n = parsePrice(price)
  return billing.value === 'yearly' ? fmtRupiah(Math.round(n * (1 - YEARLY_DISCOUNT))) : fmtRupiah(n)
}
function yearlyTotal(price: string) {
  const n = parsePrice(price)
  return fmtRupiah(Math.round(n * (1 - YEARLY_DISCOUNT)) * 12)
}

const quickNav = [
  { id: 'smm', label: '📱 Social Media Management' },
  { id: 'meta-ads', label: '📣 Meta Ads' },
  { id: 'seo', label: '🔍 SEO' },
  { id: 'tiktok', label: '🎬 TikTok & Reels' },
  { id: 'web', label: '🌐 Website' },
  { id: 'saas', label: '⚙️ SaaS' },
]

const smmSavingsBreakdown = [
  { role: 'Graphic Designer', amount: 'Rp 3.000.000' },
  { role: 'Video Animator', amount: 'Rp 3.500.000' },
  { role: 'Copywriter', amount: 'Rp 3.000.000' },
  { role: 'Admin Sosmed', amount: 'Rp 3.000.000' },
]

const smmPricing = [
  {
    title: 'Bronze', level: 'Starter', target: 'UMKM & Personal Brand',
    price: '1.500.000', konten: '12 konten/bulan', popular: false,
    fitur: [
      '6 Feed + 3 Carousel + 3 Story',
      'Riset keyword & hashtag',
      'Copywriting caption + CTA',
      'Auto-scheduling jam peak',
      '1x revisi per desain',
      'Laporan bulanan',
    ],
  },
  {
    title: 'Silver', level: 'Growth', target: 'Perusahaan Menengah',
    price: '2.500.000', konten: '16 konten/bulan', popular: true,
    fitur: [
      '5 Feed + 5 Carousel + 3 Reels + 3 Story',
      'Reels live-action 15–30 detik',
      'Content pillar mapping bulanan',
      'Proactive engagement aktif',
      'Reply DM < 4 jam',
      'Story interactive (poll/quiz)',
      '2x revisi + konsultasi 1x/bulan',
      'Laporan performa 2x/bulan',
    ],
  },
  {
    title: 'Gold', level: 'Authority', target: 'Perusahaan Menengah-Besar',
    price: '4.000.000', konten: '20 konten/bulan', popular: false,
    fitur: [
      '5 Feed + 6 Carousel + 5 Reels + 4 Story',
      'Full engagement management',
      'Reply DM < 2 jam',
      'UGC curation & competitor monitoring',
      'Instagram Collab Post',
      '3x revisi + konsultasi 2x/bulan',
      'Monthly performance deck',
      'Free Meta Ads onboarding',
    ],
  },
  {
    title: 'Custom', level: 'Enterprise', target: 'Korporat & Multi-Brand',
    price: 'Custom', konten: 'All Gold +', popular: false,
    fitur: [
      'Dedicated Account Manager',
      'Multi-platform (IG + TikTok + FB)',
      'Photoshoot produk 1 sesi/bulan',
      'Meta Ads management terintegrasi',
      'Quarterly strategy review',
      'Crisis management protocol',
      'Influencer / KOL coordination',
      'Content approval workflow',
    ],
  },
]

const metaAdsFeatures = [
  { title: 'Targeting Presisi', icon: 'i-tabler-target', desc: 'Iklan hanya tampil ke audiens yang benar-benar relevan dengan bisnis Anda' },
  { title: 'Budget Fleksibel', icon: 'i-tabler-wallet', desc: 'Atur budget harian atau bulanan sendiri, tidak ada minimum yang ditetapkan' },
  { title: 'Laporan Real-Time', icon: 'i-tabler-chart-line', desc: 'Monitor CTR, CPC, konversi, dan ROI secara live setiap saat' },
]

const metaAdsPricing = [
  {
    title: 'Starter', subtitle: 'Untuk bisnis yang baru mulai beriklan', popular: false,
    budget: 'Rp 4.000.000/bulan',
    items: [
      'Durasi iklan 30 hari',
      'Tampil di Feed & Story IG + FB',
      'Maksimal 2 gambar/video iklan',
      '1x revisi iklan',
      'Laporan 1x/minggu',
      'Setup & instalasi pixel',
    ],
  },
  {
    title: 'Professional', subtitle: 'Untuk bisnis yang ingin skala lebih besar', popular: true,
    budget: 'Rp 7.000.000/bulan',
    items: [
      'Durasi iklan 30 hari',
      'Tampil di Feed & Story IG + FB',
      'Maksimal 5 gambar/video iklan',
      '1x revisi iklan',
      'Laporan 1x/minggu',
      'A/B testing & audience split',
      'Retargeting setup',
    ],
  },
  {
    title: 'Business', subtitle: 'Untuk bisnis dengan target konversi tinggi', popular: false,
    budget: 'Rp 10.000.000/bulan',
    items: [
      'Durasi iklan 30 hari',
      'Tampil di Feed & Story IG + FB',
      'Maksimal 5 gambar/video iklan',
      '4x revisi iklan',
      'Laporan 1x/minggu',
      'Full funnel: awareness → konversi',
      'Lookalike audience setup',
      'Katalog produk dinamis',
    ],
  },
]

const seoTypes = [
  { title: 'Technical SEO', icon: 'i-tabler-settings-2', desc: 'Kecepatan, responsif, struktur, dan indexing website dioptimasi penuh' },
  { title: 'Penulisan Artikel', icon: 'i-tabler-pencil', desc: 'Konten artikel SEO-friendly untuk traffic organik jangka panjang' },
  { title: 'Backlink Building', icon: 'i-tabler-link', desc: 'Backlink berkualitas dari website relevan untuk meningkatkan authority' },
]

const seoPricing = [
  {
    title: 'Bronze', period: 'Minimal kontrak 6 bulan', popular: false,
    items: [
      { text: 'Website Audit', included: true },
      { text: 'Competitor Analysis', included: true },
      { text: 'On-Page & Off-Page SEO', included: true },
      { text: '1 Keyword Utama', included: true },
      { text: '3 Keyword Pendukung', included: true },
      { text: '8 Konten Blog/bulan', included: true },
      { text: 'Optimasi Web Speed', included: true },
      { text: 'Laporan Bulanan', included: true },
      { text: 'Backlink Premium', included: false },
      { text: 'Local SEO (Google Maps)', included: false },
    ],
  },
  {
    title: 'Silver', period: 'Minimal kontrak 6 bulan', popular: true,
    items: [
      { text: 'Website Audit', included: true },
      { text: 'Competitor Analysis', included: true },
      { text: 'On-Page & Off-Page SEO', included: true },
      { text: '2 Keyword Utama', included: true },
      { text: '5 Keyword Pendukung', included: true },
      { text: '16 Konten Blog/bulan', included: true },
      { text: 'Optimasi Web Speed', included: true },
      { text: 'Laporan Bulanan', included: true },
      { text: 'Backlink Premium', included: true },
      { text: 'Local SEO (Google Maps)', included: false },
    ],
  },
  {
    title: 'Gold', period: 'Minimal kontrak 12 bulan', popular: false,
    items: [
      { text: 'Website Audit', included: true },
      { text: 'Competitor Analysis', included: true },
      { text: 'On-Page & Off-Page SEO', included: true },
      { text: '5 Keyword Utama', included: true },
      { text: '10 Keyword Pendukung', included: true },
      { text: '24 Konten Blog/bulan', included: true },
      { text: 'Optimasi Web Speed', included: true },
      { text: 'Laporan Bulanan', included: true },
      { text: 'Backlink Premium', included: true },
      { text: 'Local SEO (Google Maps)', included: true },
    ],
  },
]

const tiktokStats = [
  { value: '127Jt', label: 'Pengguna TikTok Indonesia' },
  { value: '95 mnt', label: 'Rata-rata waktu nonton/hari' },
  { value: '#1', label: 'Platform dengan engagement tertinggi' },
]

const tiktokPricing = [
  {
    title: 'Bronze', subtitle: 'Untuk brand yang baru mulai di video', popular: false, video: '5',
    items: [
      'Durasi 15–60 detik',
      'Talent profesional',
      'Caption & hashtag',
      'Scheduling post',
      '2x revisi per video',
      'Reporting performa',
    ],
  },
  {
    title: 'Silver', subtitle: 'Untuk brand yang ingin konsisten viral', popular: true, video: '10',
    items: [
      'Durasi 15–60 detik',
      'Talent profesional',
      'Caption & hashtag',
      'Scheduling post',
      '2x revisi per video',
      'Reporting performa',
      'Riset trending sound & hashtag',
      'Konsultasi strategi konten',
    ],
  },
  {
    title: 'Gold', subtitle: 'Full video content management', popular: false, video: '15',
    items: [
      'Durasi 15–60 detik',
      'Talent profesional',
      'Caption & hashtag',
      'Scheduling post',
      '2x revisi per video',
      'Reporting performa',
      'Riset trending sound & hashtag',
      'AI-powered content strategy',
      'Cross-platform (TikTok + Reels)',
    ],
  },
]

const webPricing = [
  {
    title: 'Starter', subtitle: 'Landing page & company profile', price: '500.000', period: 'one-time project', popular: false,
    cta: 'Konsultasi Sekarang', href: wa('Halo, saya tertarik paket Starter website'),
    items: ['Landing page / company profile', 'Mobile-friendly & fast loading', 'Desain profesional', 'Garansi revisi 3x', 'Domain & hosting guidance'],
  },
  {
    title: 'Business', subtitle: 'E-commerce & web app', price: '1.500.000', period: 'one-time project', popular: true,
    cta: 'Konsultasi Sekarang', href: wa('Halo, saya tertarik paket Business website'),
    items: ['E-commerce WooCommerce / custom', 'Sistem manajemen konten', 'Integrasi payment gateway', 'Garansi revisi 5x', 'Support 1 bulan pasca-launch', 'Training penggunaan CMS'],
  },
  {
    title: 'Enterprise', subtitle: 'Custom system & mobile app', price: '3.000.000', period: 'one-time project', popular: false,
    cta: 'Custom Quote', href: wa('Halo, saya butuh custom quote untuk project enterprise'),
    items: ['Web app & sistem custom', 'Mobile app Android/iOS', 'Integrasi API & third-party', 'Revisi tidak terbatas', 'Support 3 bulan pasca-launch', 'Dedicated project manager'],
  },
]

const saasPricing = [
  {
    title: 'Starter SaaS', subtitle: 'Untuk bisnis kecil & UMKM', price: '50.000', period: 'per bulan', popular: false,
    cta: 'Mulai Sekarang', href: wa('Halo, saya tertarik SaaS Starter'),
    items: ['Setup: Rp 500rb', 'Hosting termasuk', 'Update & maintenance rutin', 'Support via WhatsApp'],
  },
  {
    title: 'Business SaaS', subtitle: 'Untuk tim & bisnis berkembang', price: '100.000', period: 'per bulan', popular: true,
    cta: 'Mulai Sekarang', href: wa('Halo, saya tertarik SaaS Business'),
    items: ['Setup: Rp 1–1.5jt', 'Fitur lebih lengkap', 'Multi-user support', 'Priority support', 'Monthly report'],
  },
  {
    title: 'Enterprise SaaS', subtitle: 'Untuk perusahaan besar', price: '10.000.000', period: 'one-time setup', popular: false,
    cta: 'Hubungi Kami', href: wa('Halo, saya butuh Enterprise SaaS'),
    items: ['Setup: Rp 10jt+', 'Fully custom features', 'Dedicated server', 'SLA guarantee', 'On-site support tersedia'],
  },
]

const whyItems = [
  { title: 'Harga Transparan', icon: 'i-tabler-receipt', description: 'Semua harga sudah termasuk dalam paket. Tidak ada biaya tersembunyi atau biaya kejutan di akhir.' },
  { title: 'Garansi Revisi', icon: 'i-tabler-refresh', description: 'Setiap paket dilengkapi garansi revisi. Kami pastikan Anda puas sebelum proyek dinyatakan selesai.' },
  { title: 'Tim Berpengalaman', icon: 'i-tabler-users', description: 'Dikerjakan langsung oleh tim in-house yang sudah berpengalaman 5+ tahun di industri digital.' },
  { title: 'Support Pasca-Launch', icon: 'i-tabler-headset', description: 'Kami tidak menghilang setelah selesai. Ada masa support dan maintenance setelah project live.' },
  { title: 'Cicilan Fleksibel', icon: 'i-tabler-credit-card', description: 'DP 50% di awal, sisanya setelah project selesai. Proyek besar bisa dinegosiasikan 3 tahap.' },
  { title: 'Klien Terpercaya', icon: 'i-tabler-award', description: 'Sudah dipercaya 50+ klien dari BUMN, kementerian, hingga UMKM, kualitas sudah teruji.' },
]

const faqItems = [
  { label: 'Apakah harga bisa dinegosiasikan?', content: 'Ya, terutama untuk proyek besar atau klien dengan kebutuhan jangka panjang. Hubungi kami untuk diskusi lebih lanjut.' },
  { label: 'Bagaimana sistem DP-nya?', content: 'Standar kami adalah 50% DP di awal sebelum pengerjaan dimulai, dan 50% sisanya setelah Anda menyetujui hasil akhir. Paket SMM: 100% di muka.' },
  { label: 'Metode pembayaran apa yang diterima?', content: 'Transfer bank (semua bank), QRIS, GoPay, OVO, Dana, dan Shopee Pay. Invoice akan dikirim via email/WhatsApp.' },
  { label: 'Apakah ada biaya maintenance bulanan?', content: 'Tergantung paket. Untuk paket SaaS sudah termasuk maintenance. Untuk project one-time, ada opsi maintenance bulanan yang bisa diambil setelah proyek selesai.' },
  { label: 'Berapa lama setelah DP proyek mulai dikerjakan?', content: 'Maksimal 2-3 hari kerja setelah DP diterima, tim kami sudah mulai mengerjakan proyek Anda.' },
  { label: 'Untuk SMM, apakah bisa cancel sebelum kontrak berakhir?', content: 'Kontrak minimum 3 bulan agar hasil optimal. Perpanjangan bersifat fleksibel bulan ke bulan setelah periode awal selesai.' },
  { label: 'Untuk SEO, berapa lama sampai hasilnya kelihatan?', content: 'SEO butuh waktu. Biasanya 2-4 bulan untuk mulai melihat pergerakan ranking, dan 4-6 bulan untuk hasil signifikan di Page 1. Itu kenapa minimum kontrak 6 bulan.' },
  { label: 'Budget Meta Ads apakah sudah termasuk dalam harga paket?', content: 'Tidak. Budget iklan yang tertera adalah budget yang perlu disiapkan klien secara terpisah untuk belanja iklan ke Meta/Facebook. Management fee Lakara dibayar terpisah via konsultasi.' },
]
</script>
