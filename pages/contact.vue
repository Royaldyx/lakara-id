<template>
  <div>
    <!-- SEO via useSeoPage('contact') → SEO Settings admin -->

    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 pt-20 pb-16">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-0 -left-16 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
      <UContainer class="relative text-center">
        <span class="inline-block bg-blue-50 text-[#3358ff] font-semibold text-sm uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Kontak</span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 mb-4">Yuk, Ngobrol dengan Kami!</h1>
        <p class="text-gray-500 max-w-xl mx-auto text-lg">Isi form di bawah , klik kirim, langsung terbuka WhatsApp dengan pesan terisi otomatis.</p>
        <!-- Trust badges -->
        <div class="flex flex-wrap justify-center gap-3 mt-8">
          <span class="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">⚡ Respons 1–2 jam</span>
          <span class="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">💬 Konsultasi gratis</span>
          <span class="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">🤝 Tanpa komitmen</span>
        </div>
      </UContainer>
    </section>

    <!-- Form + Info -->
    <section class="py-16 md:py-20 bg-white">
      <UContainer>
        <div class="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">

          <!-- Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
              <h2 class="text-xl font-bold text-gray-900 mb-1">Kirim Pesan via WhatsApp</h2>
              <p class="text-sm text-gray-500 mb-7">Akan dibuka langsung di WhatsApp dengan pesan terisi otomatis.</p>
              <form class="space-y-5" @submit.prevent="sendWA">
                <UFormGroup label="Nama Lengkap" required>
                  <UInput v-model="form.name" placeholder="Budi Santoso" size="lg" />
                </UFormGroup>
                <UFormGroup label="Nama Bisnis / Perusahaan">
                  <UInput v-model="form.business" placeholder="PT Contoh Maju (opsional)" size="lg" />
                </UFormGroup>
                <UFormGroup label="Layanan yang Diminati">
                  <USelect v-model="form.service" :options="serviceOptions" size="lg" placeholder="Pilih layanan..." />
                </UFormGroup>
                <UFormGroup label="Kebutuhan Anda" required>
                  <UTextarea
                    v-model="form.need"
                    placeholder="Ceritakan kebutuhan bisnis Anda, budget, dan timeline yang diinginkan..."
                    :rows="5"
                    size="lg"
                  />
                </UFormGroup>
                <UButton
                  type="submit"
                  block
                  size="lg"
                  style="background-color: #3358ff;"
                  icon="i-tabler-brand-whatsapp"
                  class="font-semibold"
                >
                  Kirim via WhatsApp
                </UButton>
              </form>
            </div>
          </div>

          <!-- Info sidebar -->
          <div class="flex flex-col gap-4">
            <div class="bg-gradient-to-br from-[#3358ff] to-[#6366f1] rounded-2xl p-6 text-white">
              <div class="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">Jam Operasional</div>
              <div class="text-lg font-bold mb-1">Senin – Sabtu</div>
              <div class="text-2xl font-extrabold mb-3">09.00 – 18.00 WIB</div>
              <p class="text-blue-100 text-sm leading-relaxed">Di luar jam kerja, pesan WA tetap diterima dan dibalas saat jam kerja.</p>
            </div>

            <div v-for="item in quickContactItems" :key="item.title"
              class="flex gap-4 items-start bg-gray-50 rounded-2xl border border-gray-100 p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
              <div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <UIcon :name="item.icon" class="w-5 h-5 text-[#3358ff]" />
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold text-gray-900">{{ item.title }}</div>
                <div class="text-xs text-gray-500 mt-0.5 break-words">{{ item.value }}</div>
              </div>
            </div>

            <div class="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <div class="text-sm font-bold text-gray-900 mb-2">💬 Konsultasi Gratis</div>
              <p class="text-xs text-gray-600 leading-relaxed">30 menit via Google Meet atau WhatsApp , tanpa komitmen, kami bantu tentukan solusi terbaik.</p>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Cara lain -->
    <section class="py-20 md:py-28 bg-gray-50 border-t border-gray-200">
      <UContainer>
        <div class="text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Cara Lain Menghubungi Kami</h2>
          <p class="text-gray-500">Pilih channel yang paling nyaman buat Anda.</p>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div v-for="item in contactItems" :key="item.title"
            class="flex gap-4 items-start bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <UIcon :name="item.icon" class="w-6 h-6 text-[#3358ff]" />
            </div>
            <div>
              <h4 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h4>
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
        <h2 class="text-3xl font-extrabold mb-4">Atau langsung hubungi kami di WhatsApp</h2>
        <p class="text-blue-100 mb-8">Tanpa form, langsung chat , respons 1–2 jam di jam kerja.</p>
        <UButton
          :to="`https://wa.me/${CONTACT.phone}`"
          target="_blank"
          size="xl"
          class="bg-white text-[#3358ff] hover:bg-blue-50 font-bold"
          icon="i-tabler-brand-whatsapp"
        >
          {{ CONTACT.phoneDisplay }}
        </UButton>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const { CONTACT } = useSiteConfig()
await useSeoPage('contact', { title: 'Kontak . Lakara', description: 'Konsultasi gratis dengan tim Lakara. Respons 1–2 jam via WhatsApp. Tanpa komitmen, tanpa biaya konsultasi.' })

const form = reactive({ name: '', business: '', service: '', need: '' })

const serviceOptions = [
  'Social Media Management',
  'Website Development',
  'SaaS / Aplikasi Custom',
  'Meta Ads / Google Ads',
  'SEO',
  'Konten TikTok / Reels',
  'Foto Produk',
  'Desain Grafis / Logo',
  'Manajemen Talenta Esports',
  'Lainnya',
]

const sendWA = () => {
  if (!form.name || !form.need) return
  const lines = [
    `Halo Lakara, saya ${form.name}${form.business ? ' dari ' + form.business : ''}.`,
    form.service ? `\nLayanan yang diminati: ${form.service}` : '',
    `\nKebutuhan saya:\n${form.need}`,
  ]
  window.open(`https://wa.me/${CONTACT.phone}?text=${encodeURIComponent(lines.join(''))}`, '_blank')
}

const quickContactItems = [
  { title: 'WhatsApp', value: CONTACT.phoneDisplay, icon: 'i-tabler-brand-whatsapp' },
  { title: 'Email', value: CONTACT.email, icon: 'i-tabler-mail' },
  { title: 'Instagram', value: '@wearelakara', icon: 'i-tabler-brand-instagram' },
  { title: 'Lokasi', value: 'Bogor, Jawa Barat', icon: 'i-tabler-map-pin' },
]

const contactItems = [
  { title: 'WhatsApp (Paling Cepat)', icon: 'i-tabler-brand-whatsapp', description: `Chat langsung di ${CONTACT.phoneDisplay} , respons 1–2 jam di jam kerja. Cara tercepat.` },
  { title: 'Email Formal', icon: 'i-tabler-mail', description: `${CONTACT.email} , untuk proposal, invoice, NDA, atau inquiry yang butuh dokumentasi.` },
  { title: 'Instagram @wearelakara', icon: 'i-tabler-brand-instagram', description: 'DM Instagram untuk pertanyaan singkat, kolaborasi konten, atau sekedar say hi.' },
  { title: 'Jam Operasional', icon: 'i-tabler-clock', description: 'Senin s/d Sabtu, pukul 09.00–18.00 WIB. Pesan di luar jam kerja tetap diterima.' },
  { title: 'Alamat Kantor', icon: 'i-tabler-map-pin', description: `${CONTACT.address}, Bogor, Jawa Barat, Indonesia.` },
  { title: 'Google Meet / Video Call', icon: 'i-tabler-video', description: 'Konsultasi 30 menit gratis via Google Meet , jadwal sesuai availability kedua pihak.' },
]
</script>
