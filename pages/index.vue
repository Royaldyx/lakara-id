<template>
  <div>
    <!-- Judul & meta SEO halaman ini diatur via useSeoPage('home') → SEO Settings admin -->

    <!-- ══════════════════════════════════════
         HERO
    ══════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-white pt-24 pb-28 md:pt-32 md:pb-36">
      <!-- background blob -->
      <div class="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div class="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <UContainer class="relative">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center gap-2 bg-blue-50 text-[#3358ff] text-sm font-semibold px-4 py-2 rounded-full mb-8 border border-blue-100">
              <UIcon name="i-tabler-sparkles" class="w-4 h-4" />
              PT Lakara Solusi Kreatif
            </div>
            <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Solusi Digital
              <span class="block text-gradient mt-1">Terpercaya</span>
              untuk Bisnis Anda
            </h1>
            <p class="text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
              Mitra pertumbuhan digital dengan tiga divisi: <strong class="text-gray-700">teknologi</strong>, <strong class="text-gray-700">talenta esports</strong>, dan <strong class="text-gray-700">SMM growth</strong>. Dipercaya instansi pemerintah, BUMN, dan 50+ klien lainnya.
            </p>
            <div class="flex flex-wrap gap-3">
              <UButton
                :to="wa('Halo Lakara, saya ingin konsultasi')"
                target="_blank"
                size="xl"
                style="background-color: #3358ff;"
                icon="i-tabler-message-circle"
                class="font-semibold shadow-lg shadow-blue-200"
              >
                Konsultasi Gratis
              </UButton>
              <UButton to="#layanan" size="xl" variant="outline" color="gray" class="font-semibold">
                Lihat Layanan
              </UButton>
              <UButton to="/member/register" size="xl" variant="outline" class="font-semibold" style="border-color: #7c3aed; color: #7c3aed;" icon="i-tabler-link">
                Buat Link Bio
              </UButton>
              <UButton to="/member/register" size="xl" variant="outline" class="font-semibold" style="border-color: #0ea5e9; color: #0ea5e9;" icon="i-tabler-shopping-bag">
                Buat Toko
              </UButton>
            </div>

            <!-- trust badges -->
            <div class="flex flex-wrap items-center gap-6 mt-10 pt-10 border-t border-gray-100">
              <div v-for="s in stats" :key="s.title" class="text-center">
                <div class="text-2xl font-extrabold text-[#3358ff]">{{ s.amount }}</div>
                <div class="text-xs text-gray-400 font-medium mt-0.5">{{ s.title }}</div>
              </div>
            </div>
          </div>
          <div class="hidden md:block">
            <div class="relative">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Tim Lakara bekerja"
                class="rounded-3xl shadow-2xl ring-1 ring-gray-100"
              />
              <!-- floating badge -->
              <div class="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 border border-gray-100">
                <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <UIcon name="i-tabler-check" class="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div class="text-xs text-gray-400">Proyek terbaru</div>
                  <div class="text-sm font-bold text-gray-900">100+ selesai</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         TAGLINE BANNER
    ══════════════════════════════════════ -->
    <div class="bg-[#3358ff] text-white py-4">
      <UContainer>
        <p class="text-center font-medium text-sm md:text-base tracking-wide">
          ✦ Innovating Creativity with Technology ✦
        </p>
      </UContainer>
    </div>

    <!-- ══════════════════════════════════════
         3 DIVISI
    ══════════════════════════════════════ -->
    <section id="layanan" class="py-20 bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Ekosistem Lakara</span>
          <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-5">Tiga Divisi, Satu Mitra</h2>
          <p class="text-gray-500 max-w-2xl mx-auto text-lg">Kami tidak sekadar vendor. Kami adalah ekosistem lengkap dari teknologi, talenta, dan pertumbuhan digital.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(divisi, i) in divisiItems"
            :key="divisi.title"
            class="relative rounded-3xl p-8 border-2 hover:border-[#3358ff] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
            :class="i === 1 ? 'border-[#3358ff] bg-[#3358ff] text-white shadow-xl shadow-blue-200' : 'border-gray-100 bg-white'"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
              :class="i === 1 ? 'bg-white/20' : 'bg-blue-50'"
            >
              <UIcon :name="divisi.icon" class="w-7 h-7" :class="i === 1 ? 'text-white' : 'text-[#3358ff]'" />
            </div>
            <h3 class="text-xl font-extrabold mb-3" :class="i === 1 ? 'text-white' : 'text-gray-900'">{{ divisi.title }}</h3>
            <p class="text-sm leading-relaxed" :class="i === 1 ? 'text-blue-100' : 'text-gray-500'">{{ divisi.description }}</p>
            <NuxtLink
              :to="divisi.href"
              class="inline-flex items-center gap-1 mt-6 text-sm font-semibold"
              :class="i === 1 ? 'text-white/80 hover:text-white' : 'text-[#3358ff] hover:text-blue-700'"
            >
              Lihat Layanan <UIcon name="i-tabler-arrow-right" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         KLIEN
    ══════════════════════════════════════ -->
    <section id="klien" class="py-20 bg-gray-50">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Klien terpercaya Lakara"
              class="rounded-3xl shadow-xl ring-1 ring-gray-100"
            />
          </div>
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Dipercaya sejak hari pertama</span>
            <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Melayani Berbagai Skala Bisnis</h2>
            <p class="text-gray-500 text-lg mb-8 leading-relaxed">Dari instansi pemerintah, BUMN, perbankan, hingga startup digital dan UMKM. Kami hadir untuk semua skala bisnis.</p>
            <div class="space-y-5">
              <div v-for="klien in klienItems" :key="klien.title" class="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <UIcon name="i-tabler-check" class="w-5 h-5 text-[#3358ff]" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">{{ klien.title }}</h4>
                  <p class="text-sm text-gray-500 mt-0.5">{{ klien.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         CARA KERJA
    ══════════════════════════════════════ -->
    <section class="py-20 bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Dari konsultasi sampai launch,<br class="hidden md:block" /> sesederhana ini.</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="space-y-6">
            <div v-for="(step, i) in steps" :key="i" class="flex gap-5">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-2xl bg-[#3358ff] text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-200">
                  {{ i + 1 }}
                </div>
              </div>
              <div class="pt-1">
                <h4 class="font-bold text-gray-900 text-lg mb-1" v-html="step.title" />
                <p class="text-gray-500">{{ step.description }}</p>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1531973576160-7125cd663d86?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Proses kerja Lakara"
              class="rounded-3xl shadow-xl ring-1 ring-gray-100"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         LAYANAN CREATIVE
    ══════════════════════════════════════ -->
    <section id="creative" class="py-20 bg-gray-50">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Lakara Creative</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Teknologi & Development</h2>
          <p class="text-gray-500 max-w-2xl mx-auto text-lg">Dari desain sampai deploy, semua dikerjakan in-house oleh tim berpengalaman.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="item in creativeItems"
            :key="item.title"
            class="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff]" />
            </div>
            <h4 class="font-bold text-gray-900 mb-2">{{ item.title }}</h4>
            <p class="text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         TALENT
    ══════════════════════════════════════ -->
    <section id="talent" class="py-20 bg-white">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Lakara Talent</span>
            <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-6">Esports Talent Management Profesional</h2>
            <div class="space-y-5">
              <div v-for="item in talentItems" :key="item.title" class="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all bg-gray-50">
                <UIcon name="i-tabler-check-circle" class="w-5 h-5 text-[#3358ff] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-bold text-gray-900">{{ item.title }}</h4>
                  <p class="text-sm text-gray-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Lakara Talent esports"
              class="rounded-3xl shadow-xl ring-1 ring-gray-100"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         EBOOST / MARKETING
    ══════════════════════════════════════ -->
    <section id="eboost" class="py-20 bg-gray-50">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="md:order-2">
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Lakara Marketing / EBoost</span>
            <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-6">Grow Faster di Semua Platform Digital</h2>
            <div class="space-y-5">
              <div v-for="item in eboostItems" :key="item.title" class="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                <UIcon name="i-tabler-check-circle" class="w-5 h-5 text-[#3358ff] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 class="font-bold text-gray-900">{{ item.title }}</h4>
                  <p class="text-sm text-gray-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="md:order-1">
            <img
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
              alt="EBoost social media growth"
              class="rounded-3xl shadow-xl ring-1 ring-gray-100 w-full max-h-[440px] object-cover"
            />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         LAKARA TOKO
    ══════════════════════════════════════ -->
    <section id="toko" class="py-20 bg-white">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Lakara</span>
            <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">
              Buat Toko Online Sederhana<br />dalam Hitungan Menit
            </h2>
            <p class="text-gray-500 text-lg mb-8 leading-relaxed">
              Punya produk tapi belum punya toko online? Daftar di Lakara dan langsung punya halaman katalog produk sendiri di <strong class="text-gray-700">lakara.id/namamu</strong>. Gratis untuk 10 produk pertama.
            </p>
            <div class="space-y-4 mb-10">
              <div v-for="f in tokoFeatures" :key="f.title" class="flex gap-4 items-start">
                <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon :name="f.icon" class="w-4 h-4 text-[#3358ff]" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ f.title }}</p>
                  <p class="text-sm text-gray-500 mt-0.5">{{ f.desc }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <UButton
                to="/member/register"
                size="lg"
                style="background-color: #3358ff;"
                icon="i-tabler-store"
                class="font-semibold shadow-lg shadow-blue-200"
              >
                Buat Toko Gratis
              </UButton>
              <UButton
                :to="wa('Halo Lakara, saya mau tanya soal bikin toko online')"
                target="_blank"
                size="lg"
                variant="outline"
                color="gray"
                class="font-semibold"
              >
                Tanya dulu
              </UButton>
            </div>
          </div>
          <div class="relative">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
              <!-- Mock storefront preview -->
              <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div class="h-2 bg-gradient-to-r from-[#3358ff] to-indigo-500" />
                <div class="p-5">
                  <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div class="w-10 h-10 rounded-xl bg-[#3358ff] flex items-center justify-center text-white font-black text-lg">T</div>
                    <div>
                      <div class="font-extrabold text-gray-900 text-sm">Toko Contoh</div>
                      <div class="text-xs text-[#3358ff] font-mono">lakara.id/toko-contoh</div>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-100 overflow-hidden">
                      <div class="h-20 bg-gradient-to-br"
                        :class="['from-blue-100 to-indigo-100','from-purple-100 to-pink-100','from-green-100 to-emerald-100','from-amber-100 to-orange-100'][i-1]" />
                      <div class="p-2">
                        <div class="h-2 bg-gray-200 rounded-full mb-1.5 w-3/4" />
                        <div class="h-2 bg-[#3358ff]/20 rounded-full w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Badge Free -->
            <div class="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg shadow-green-200 rotate-3">
              GRATIS mulai!
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         LINK BIO
    ══════════════════════════════════════ -->
    <section id="linkbio" class="py-20 bg-slate-50">
      <UContainer>
        <div class="grid md:grid-cols-2 gap-16 items-center">

          <!-- Right mockup on mobile shows first, left on desktop -->
          <div class="relative order-2 md:order-1">
            <div class="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-6 border border-violet-100">
              <!-- Phone-style link bio preview -->
              <div class="bg-white rounded-2xl shadow-lg overflow-hidden max-w-[260px] mx-auto">
                <!-- Header color bar -->
                <div class="h-2 bg-gradient-to-r from-violet-500 to-indigo-500" />
                <div class="p-5">
                  <!-- Avatar + name -->
                  <div class="text-center mb-4">
                    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-2">R</div>
                    <div class="font-extrabold text-gray-900 text-sm">@royaldy</div>
                    <div class="text-xs text-gray-400 mt-0.5">Streamer &middot; Esports Host</div>
                  </div>
                  <!-- Link buttons mock -->
                  <div class="space-y-2">
                    <div class="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <div class="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-tabler-brand-instagram" class="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <span class="text-xs font-semibold text-gray-700">Instagram</span>
                    </div>
                    <div class="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <div class="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <UIcon name="i-tabler-brand-tiktok" class="w-3.5 h-3.5 text-slate-700" />
                      </div>
                      <span class="text-xs font-semibold text-gray-700">TikTok</span>
                    </div>
                    <div class="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                      <div class="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <span class="text-[9px] font-black text-orange-500">SP</span>
                      </div>
                      <span class="text-xs font-semibold text-gray-700">Shopee</span>
                    </div>
                    <div class="flex items-center gap-2 bg-orange-500 rounded-xl px-3 py-2.5">
                      <div class="w-6 h-6 rounded-lg bg-white/25 flex items-center justify-center flex-shrink-0">
                        <span class="text-[9px] font-black text-white">🎁</span>
                      </div>
                      <span class="text-xs font-semibold text-white">Saweria</span>
                    </div>
                  </div>
                  <!-- Footer -->
                  <div class="mt-3 text-center">
                    <span class="text-[10px] text-gray-300 font-medium">lakara.id/royaldy</span>
                  </div>
                </div>
              </div>
            </div>
            <!-- Floating badge -->
            <div class="absolute -top-4 -right-4 bg-violet-600 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg shadow-violet-200 -rotate-2">
              GRATIS!
            </div>
          </div>

          <!-- Text content -->
          <div class="order-1 md:order-2">
            <span class="text-violet-600 font-semibold text-xs uppercase tracking-[0.2em]">Lakara Link</span>
            <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4 leading-tight">
              Semua Link-mu<br />dalam Satu Halaman
            </h2>
            <p class="text-gray-500 text-lg mb-8 leading-relaxed">
              Satu URL untuk semua. Bagikan <strong class="text-gray-700">lakara.id/namamu</strong> dan audiens langsung bisa pilih mau ke Instagram, TikTok, toko, atau donasi &mdash; semuanya di satu tempat.
            </p>
            <div class="space-y-4 mb-10">
              <div v-for="f in linkBioFeatures" :key="f.title" class="flex gap-4 items-start">
                <div class="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UIcon :name="f.icon" class="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ f.title }}</p>
                  <p class="text-sm text-gray-500 mt-0.5">{{ f.desc }}</p>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <UButton
                to="/member/register"
                size="lg"
                class="font-semibold shadow-lg shadow-violet-200"
                style="background-color: #7c3aed;"
                icon="i-tabler-link-plus"
              >
                Buat Link Bio Gratis
              </UButton>
              <UButton
                :to="wa('Halo Lakara, saya mau tanya soal fitur Link Bio')"
                target="_blank"
                size="lg"
                variant="outline"
                color="gray"
                class="font-semibold"
              >
                Tanya dulu
              </UButton>
            </div>
          </div>

        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         MEMBER SHOWCASE
    ══════════════════════════════════════ -->
    <section v-if="showcaseStores.length" id="showcase" class="py-20 bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Member Showcase</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Toko & Link Bio Member Kami</h2>
          <p class="text-gray-500 max-w-2xl mx-auto text-lg">Member Lakara membangun kehadiran digital mereka di sini. Bergabung dan tampilkan tokomu.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <NuxtLink
            v-for="store in showcaseStores"
            :key="store.slug"
            :to="`/${store.slug}`"
            target="_blank"
            class="group relative flex flex-col items-center bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-[#3358ff]/30 transition-all duration-200 text-center overflow-hidden"
          >
            <!-- Color bar -->
            <div class="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" :style="{ backgroundColor: store.primary_color || '#3358ff' }" />

            <!-- Logo / Avatar -->
            <div class="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-4 mt-2"
              :style="{ backgroundColor: (store.primary_color || '#3358ff') + '1a' }">
              <img v-if="store.logo" :src="store.logo" class="w-full h-full object-contain" />
              <span v-else class="text-2xl font-extrabold" :style="{ color: store.primary_color || '#3358ff' }">
                {{ (store.name || '?')[0].toUpperCase() }}
              </span>
            </div>

            <p class="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-1">{{ store.name }}</p>
            <p v-if="store.tagline" class="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{{ store.tagline }}</p>
            <p class="text-xs text-[#3358ff] font-mono opacity-60 group-hover:opacity-100 transition-opacity">lakara.id/{{ store.slug }}</p>
          </NuxtLink>
        </div>
        <div class="text-center mt-12">
          <UButton to="/member/register" size="lg" style="background-color: #3358ff;" class="font-bold">
            Daftar & Tampilkan Tokomu
          </UButton>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         PORTOFOLIO
    ══════════════════════════════════════ -->
    <section id="porto" class="py-20 bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Portofolio</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Proyek yang Sudah Kami Kerjakan</h2>
          <p class="text-gray-500 max-w-2xl mx-auto text-lg">Dari sistem skala nasional sampai landing page UMKM, semua dikerjakan in-house.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in portoItems"
            :key="item.title"
            class="group rounded-3xl p-7 border border-gray-100 hover:border-[#3358ff]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white"
          >
            <div class="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-[#3358ff] flex items-center justify-center mb-5 transition-colors">
              <UIcon :name="item.icon" class="w-6 h-6 text-[#3358ff] group-hover:text-white transition-colors" />
            </div>
            <h4 class="font-bold text-gray-900 mb-2">{{ item.title }}</h4>
            <p class="text-sm text-gray-500 leading-relaxed">{{ item.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         TESTIMONI
    ══════════════════════════════════════ -->
    <section id="testimoni" class="py-20 bg-gray-50">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Testimoni</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Kata Klien Kami</h2>
          <p class="text-gray-500 text-lg">Kepercayaan klien adalah ukuran keberhasilan kami.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="t in testimoniItems"
            :key="t.title"
            class="bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-200 flex flex-col"
          >
            <div class="flex gap-1 mb-5">
              <UIcon v-for="i in 5" :key="i" name="i-tabler-star-filled" class="w-4 h-4 text-yellow-400" />
            </div>
            <p class="text-gray-600 leading-relaxed flex-1 italic">"{{ t.description }}"</p>
            <div class="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#3358ff] to-indigo-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {{ t.title[0] }}
              </div>
              <p class="font-semibold text-gray-900 text-sm">{{ t.title }}</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         TIM
    ══════════════════════════════════════ -->
    <section id="tim" class="py-20 bg-white">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">Tim Kami</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Divisi yang Menggerakkan Lakara</h2>
          <p class="text-gray-500 max-w-xl mx-auto text-lg">Tiga divisi solid, satu tujuan: memberikan solusi digital terbaik untuk klien.</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            v-for="(divisi, i) in timItems"
            :key="divisi.title"
            class="rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-200 border-2 hover:border-[#3358ff]/30"
            :class="i === 1 ? 'bg-[#3358ff] text-white border-[#3358ff]' : 'bg-gray-50 border-gray-100'"
          >
            <div
              class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              :class="i === 1 ? 'bg-white/20' : 'bg-white border border-gray-200'"
            >
              <UIcon :name="divisi.icon" class="w-8 h-8" :class="i === 1 ? 'text-white' : 'text-[#3358ff]'" />
            </div>
            <h3 class="text-xl font-extrabold mb-3" :class="i === 1 ? 'text-white' : 'text-gray-900'">{{ divisi.title }}</h3>
            <p class="text-sm leading-relaxed" :class="i === 1 ? 'text-blue-100' : 'text-gray-500'">{{ divisi.description }}</p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         FAQ
    ══════════════════════════════════════ -->
    <section class="py-20 bg-gray-50">
      <UContainer>
        <div class="text-center mb-16">
          <span class="text-[#3358ff] font-semibold text-xs uppercase tracking-[0.2em]">FAQ</span>
          <h2 class="text-4xl font-extrabold text-gray-900 mt-3 mb-4">Pertanyaan yang Sering Ditanyakan</h2>
          <p class="text-gray-500 text-lg">Semua yang perlu Anda tahu sebelum mulai bekerja sama dengan Lakara.</p>
        </div>
        <div class="max-w-3xl mx-auto divide-y divide-gray-200">
          <div v-for="(f, i) in faqItems" :key="i">
            <button @click="openFaq = openFaq === i ? -1 : i"
              class="w-full flex items-center justify-between gap-4 py-5 text-left group">
              <span class="font-semibold text-gray-900 group-hover:text-[#3358ff] transition-colors">{{ f.label }}</span>
              <UIcon name="i-tabler-chevron-down" class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
                :class="openFaq === i && 'rotate-180 text-[#3358ff]'" />
            </button>
            <div v-show="openFaq === i" class="pb-5 -mt-1 text-gray-500 leading-relaxed">{{ f.content }}</div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ══════════════════════════════════════
         CTA
    ══════════════════════════════════════ -->
    <section class="py-20 bg-[#3358ff] relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#3358ff] to-indigo-600 pointer-events-none" />
      <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <UContainer class="relative text-center">
        <div class="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20">
          <UIcon name="i-tabler-phone" class="w-4 h-4" />
          Konsultasi gratis, tanpa komitmen
        </div>
        <h2 class="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
          Siap Membawa Bisnis Anda<br />ke Level Berikutnya?
        </h2>
        <p class="text-blue-100 text-xl mb-12 max-w-2xl mx-auto">
          Estimasi harga dalam 24 jam. Tim kami siap membantu Anda memilih solusi yang tepat.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <UButton
            :to="wa('Halo Lakara, saya ingin konsultasi gratis')"
            target="_blank"
            size="xl"
            class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold shadow-xl"
            icon="i-tabler-brand-whatsapp"
          >
            Chat WhatsApp Sekarang
          </UButton>
          <UButton
            :to="`mailto:${CONTACT.email}`"
            size="xl"
            variant="ghost"
            class="text-white border-2 border-white/30 hover:bg-white/10 font-semibold"
          >
            Kirim Email
          </UButton>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { CONTACT, wa } = useSiteConfig()

// SEO dari admin settings
await useSeoPage('home', {
  title:       'Lakara — Solusi Digital Terpercaya untuk Bisnis Anda',
  description: 'PT Lakara Solusi Kreatif — Mitra digital terpercaya untuk website development, mobile app, talent esports, dan social media growth. Dipercaya 50+ klien.',
})

// Testimoni & FAQ dinamis (fallback ke hardcoded jika API belum ada data)
const { data: testimoniRes } = await useFetch('/api/testimoni', { default: () => ({ success: false, data: [] }) })
const { data: faqRes }       = await useFetch('/api/faq',       { default: () => ({ success: false, data: [] }) })
const { data: showcaseRes }  = await useFetch('/api/public/showcase', { default: () => ({ success: false, data: [] }) })

const stats = [
  { title: 'Tahun Pengalaman', amount: '5+' },
  { title: 'Proyek Selesai', amount: '100+' },
  { title: 'Kota Terlayani', amount: '20+' },
  { title: 'Divisi Aktif', amount: '3' },
]

const divisiItems = [
  { title: 'Lakara Creative', icon: 'i-tabler-code', href: '#creative', description: 'Solusi teknologi full-stack: website, e-commerce, web app custom, mobile app Android & iOS, SaaS, UI/UX, grafis, hingga embedded system & IoT.' },
  { title: 'Lakara Talent', icon: 'i-tabler-microphone-2', href: '#talent', description: 'Manajemen talenta esports profesional: shoutcaster, host, content creator. Tersedia untuk event online maupun offline, rate mulai Rp 600rb/sesi.' },
  { title: 'Lakara Marketing', icon: 'i-tabler-trending-up', href: '#eboost', description: 'SMM panel, social media management, Meta Ads, Google Ads, SEO & e-commerce growth service untuk semua platform digital.' },
]

const klienItems = [
  { title: 'Instansi Pemerintah', description: 'Solusi web & sistem informasi untuk kementerian, pemerintah daerah, dan lembaga negara.' },
  { title: 'BUMN & Perusahaan Energi', description: 'Platform digital dan sistem custom untuk perusahaan energi dan korporasi nasional.' },
  { title: 'Perbankan & Keuangan', description: 'Website dan aplikasi untuk perusahaan keuangan, otomotif, dan perbankan regional.' },
  { title: 'UMKM & Startup Digital', description: 'Dari landing page sampai e-commerce, kami bantu bisnis kecil tumbuh di era digital.' },
]

const steps = [
  { title: 'Step 1: <span class="font-medium">Konsultasi Gratis</span>', description: 'Ceritakan kebutuhan Anda via WhatsApp atau email. Rekomendasi solusi terbaik dalam 24 jam, gratis.' },
  { title: 'Step 2: <span class="font-medium">Proposal & Estimasi</span>', description: 'Proposal lengkap dengan scope, timeline, dan harga transparan. Tidak ada biaya tersembunyi.' },
  { title: 'Step 3: <span class="font-medium">Eksekusi & Revisi</span>', description: 'Tim kami mulai bekerja dengan update progress berkala. Garansi revisi hingga Anda puas.' },
  { title: 'Launch & Support!', description: 'Proyek live, Anda punya aset digital yang bekerja untuk bisnis Anda.' },
]

const creativeItems = [
  { title: 'Landing Page & Company Profile', icon: 'i-tabler-layout-navbar', description: 'Website profesional fast-loading, mobile-friendly. Mulai Rp 500rb.' },
  { title: 'E-Commerce', icon: 'i-tabler-shopping-cart', description: 'Toko online WooCommerce / custom. Mulai Rp 1.5jt.' },
  { title: 'Web App Custom', icon: 'i-tabler-apps', description: 'Sistem akademik, LMS, job fair, inventory. Rp 3jt–7jt.' },
  { title: 'Mobile App', icon: 'i-tabler-device-mobile', description: 'Android & iOS: kasir, food order, inventory. Starting Rp 2jt.' },
  { title: 'SaaS Development', icon: 'i-tabler-cloud', description: 'Software berlangganan dari Rp 50k/bulan.' },
  { title: 'UI/UX & Branding', icon: 'i-tabler-palette', description: 'Design system, branding identity, konten sosmed. Mulai Rp 20k.' },
  { title: 'Desain Grafis & Logo', icon: 'i-tabler-vector', description: 'Logo profesional, poster, banner, dan identitas visual brand Anda.' },
  { title: 'Video Animasi', icon: 'i-tabler-movie', description: 'Video company profile, animasi produk, dan konten visual premium.' },
  { title: 'Embedded System & IoT', icon: 'i-tabler-cpu', description: 'Smart device, monitoring sensor, otomasi. Starting Rp 300k.' },
]

const talentItems = [
  { title: 'Shoutcasting & Hosting', description: 'Talent profesional online (Rp 600rb–1.6jt) maupun offline on-the-spot (Rp 1.6jt–2.2jt) per sesi.' },
  { title: 'Talent Scouting & Development', description: 'Rekrutmen, training, dan manajemen talent esports & content creator dari seluruh Indonesia.' },
  { title: 'Brand Collaboration & Endorsement', description: 'Kolaborasi brand dengan talent gaming yang punya reach jutaan audience.' },
  { title: 'Event Talent Supply', description: 'Paket lengkap host, shoutcaster, tim produksi untuk turnamen PUBG Mobile, Valorant, Mobile Legends.' },
]

const linkBioFeatures = [
  { icon: 'i-tabler-apps', title: '20+ platform siap pakai', desc: 'Instagram, TikTok, Shopee, Tokopedia, Saweria, Trakteer, WhatsApp, dan banyak lagi.' },
  { icon: 'i-tabler-palette', title: 'Custom warna dan tampilan', desc: 'Atur background, warna teks, dan aksen sesuai brand-mu.' },
  { icon: 'i-tabler-gift', title: 'Link donasi untuk kreator & streamer', desc: 'Pasang Saweria, Trakteer, Ko-fi, atau Karyakarsa langsung di halamanmu.' },
]

const tokoFeatures = [
  { icon: 'i-tabler-bolt', title: 'Setup dalam 5 menit', desc: 'Daftar, isi info toko, langsung online. Tidak perlu coding, tidak perlu domain sendiri.' },
  { icon: 'i-tabler-photo', title: 'Katalog produk lengkap', desc: 'Upload foto, tulis deskripsi, pasang harga, dan hubungkan ke Shopee/Tokopedia/TikTok Shop.' },
  { icon: 'i-tabler-link', title: 'URL toko kamu sendiri', desc: 'Bagikan link lakara.id/namamu ke customer. Simpel, mudah diingat, profesional.' },
  { icon: 'i-tabler-crown', title: 'Gratis 10 produk, Pro unlimited', desc: 'Mulai gratis. Upgrade ke Pro hanya Rp 20.000/bulan untuk produk tanpa batas.' },
]

const eboostItems = [
  { title: 'Social Media Management', description: 'Kelola Instagram, TikTok, dan platform lain. Konten, copywriting, jadwal posting, semua beres.' },
  { title: 'Meta Ads (FB & IG)', description: 'Iklan Facebook & Instagram yang tepat sasaran. Anggaran terukur, hasil nyata.' },
  { title: 'Google Ads', description: 'Tampil di pencarian Google untuk keyword yang paling relevan dengan bisnis Anda.' },
  { title: 'SEO', description: 'Website Anda di Page 1 Google. Organik, jangka panjang, tanpa biaya iklan terus-menerus.' },
  { title: 'Video TikTok & Reels', description: 'Konten video pendek viral untuk TikTok, Instagram Reels, dan YouTube Shorts.' },
  { title: 'E-Commerce Growth', description: 'Optimasi toko Shopee/Tokopedia: followers, reviews, product boost, dan livestream viewers.' },
]

const portoItems = [
  { title: 'Sistem Informasi Kementerian', icon: 'i-tabler-layout-dashboard', description: 'Web app & dashboard data untuk instansi pemerintah pusat. Stack: Laravel + Vue.js.' },
  { title: 'Platform E-Commerce FMCG', icon: 'i-tabler-shopping-cart', description: 'Toko online multi-produk dengan integrasi payment gateway dan manajemen stok real-time.' },
  { title: 'Aplikasi Kasir Mobile', icon: 'i-tabler-device-mobile', description: 'POS Android untuk jaringan restoran 10+ cabang. Offline-first, sync otomatis.' },
  { title: 'Dashboard Monitoring BUMN', icon: 'i-tabler-chart-bar', description: 'Sistem OEE dan logistik untuk perusahaan energi nasional. Real-time data visualisasi.' },
  { title: 'Turnamen Esports Nasional', icon: 'i-tabler-trophy', description: 'Host & shoutcaster untuk turnamen PUBG Mobile dengan 10.000+ peserta dari seluruh Indonesia.' },
  { title: 'SMM Growth 50+ Brand', icon: 'i-tabler-trending-up', description: 'Pertumbuhan followers & engagement untuk brand fashion, kuliner, dan retail di Instagram & TikTok.' },
]

const staticTestimoni = [
  { name: 'Owner, Brand Fashion Lokal', text: 'Website baru kami jauh lebih cepat dan konversinya naik signifikan. Tim Lakara responsif dan hasilnya melebihi ekspektasi.' },
  { name: 'Manager IT, Perusahaan Energi', text: 'Sistem dashboard yang dibangun Lakara sangat membantu monitoring operasional harian kami. Komunikasi lancar dari awal sampai akhir.' },
  { name: 'Founder, Startup Kuliner', text: 'Aplikasi kasir dari Lakara sudah dipakai di semua cabang kami. Stabil, mudah dipakai karyawan, dan support-nya cepat kalau ada masalah.' },
]
const testimoniItems = computed(() => {
  const api = (testimoniRes.value?.data ?? []) as any[]
  return api.length
    ? api.map((t: any) => ({ title: t.name, description: t.text }))
    : staticTestimoni.map(t => ({ title: t.name, description: t.text }))
})

const timItems = [
  { title: 'Lakara Creative', icon: 'i-tabler-code', description: 'Tim developer, UI/UX designer, dan mobile engineer berpengalaman di proyek skala enterprise hingga UMKM.' },
  { title: 'Lakara Talent', icon: 'i-tabler-microphone-2', description: 'Tim manajemen dan pengembangan talenta esports: shoutcaster, host, dan content creator profesional.' },
  { title: 'Lakara Marketing', icon: 'i-tabler-speakerphone', description: 'Tim spesialis digital marketing, SMM panel, e-commerce growth, dan social media optimization.' },
]

const staticFaq = [
  { label: 'Berapa lama pengerjaan website?', content: 'Landing page & company profile: 3–7 hari kerja. E-commerce: 7–14 hari. Web app custom: 2–8 minggu tergantung kompleksitas.' },
  { label: 'Apakah ada garansi revisi?', content: 'Ya, semua proyek mendapatkan garansi revisi sesuai paket yang dipilih. Kami pastikan Anda puas sebelum proyek dianggap selesai.' },
  { label: 'Bagaimana sistem pembayaran?', content: '50% DP di awal, 50% setelah proyek selesai dan Anda menyetujui hasilnya. Untuk proyek besar, bisa 3 tahap pembayaran.' },
  { label: 'Apakah Lakara bisa handle project remote?', content: 'Tentu. Mayoritas proyek kami dikerjakan remote via WhatsApp, email, dan video call. Sudah melayani klien dari Sabang sampai Merauke.' },
  { label: 'Teknologi apa yang digunakan?', content: 'Stack utama: Next.js, Nuxt.js, Laravel, Flutter, Spring Boot, Go, Python, PostgreSQL, MySQL, Docker, Nginx.' },
  { label: 'Apakah ada layanan maintenance setelah launch?', content: 'Ya. Ada paket bulanan untuk hosting management, update konten, bug fixing, dan penambahan fitur.' },
]
const faqItems = computed(() => {
  const api = (faqRes.value?.data ?? []) as any[]
  return api.length ? api.map((f: any) => ({ label: f.question, content: f.answer })) : staticFaq
})
const openFaq = ref(-1)

const showcaseStores = computed(() => (showcaseRes.value?.data ?? []) as any[])
</script>
