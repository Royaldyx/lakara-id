<template>
  <footer class="bg-gray-950 text-gray-400">
    <!-- Newsletter -->
    <div class="border-b border-gray-800">
      <UContainer class="py-10">
        <NewsletterCapture source="footer" />
      </UContainer>
    </div>
    <UContainer class="py-14">
      <!-- Top grid -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
        <!-- Brand col -->
        <div class="col-span-2">
          <NuxtLink to="/" class="flex items-center gap-2 mb-4">
            <LakasaLogo class="w-8 h-8" />
            <span class="text-white text-xl font-bold">Lakara</span>
          </NuxtLink>
          <p class="text-sm leading-relaxed mb-5 max-w-xs">
            PT Lakara Solusi Kreatif — mitra digital terpercaya untuk teknologi, talenta esports, dan pertumbuhan digital.
          </p>
          <div class="flex gap-3">
            <UButton
              :to="SOCIAL.instagram"
              target="_blank"
              variant="ghost"
              color="gray"
              icon="i-tabler-brand-instagram"
              size="sm"
              class="text-gray-400 hover:text-white"
            />
            <UButton
              :to="SOCIAL.youtube"
              target="_blank"
              variant="ghost"
              color="gray"
              icon="i-tabler-brand-youtube"
              size="sm"
              class="text-gray-400 hover:text-white"
            />
            <UButton
              :to="SOCIAL.whatsapp"
              target="_blank"
              variant="ghost"
              color="gray"
              icon="i-tabler-brand-whatsapp"
              size="sm"
              class="text-gray-400 hover:text-white"
            />
          </div>

          <!-- Download app -->
          <a :href="PLAYSTORE_URL" target="_blank" rel="noopener"
            class="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl px-4 py-2.5 mt-5 transition">
            <UIcon name="i-tabler-brand-google-play" class="w-6 h-6 text-white" />
            <span class="text-left leading-tight">
              <span class="block text-[10px] text-gray-400 tracking-wide">DOWNLOAD DI</span>
              <span class="block text-sm font-semibold text-white -mt-0.5">Google Play</span>
            </span>
          </a>
        </div>

        <!-- Link cols -->
        <div v-for="col in footerLinks" :key="col.title">
          <h4 class="text-white font-semibold text-sm mb-4">{{ col.title }}</h4>
          <ul class="space-y-2">
            <li v-for="link in col.links" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="text-sm hover:text-white transition-colors"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-sm">
          © {{ new Date().getFullYear() }} <span class="text-white font-semibold">PT Lakara Solusi Kreatif</span> · All rights reserved.
        </p>
        <div class="flex gap-4 text-sm">
          <NuxtLink to="/terms" class="hover:text-white transition-colors">Terms</NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-white transition-colors">Privacy Policy</NuxtLink>
          <NuxtLink to="/hapus-akun" class="hover:text-white transition-colors">Hapus Akun</NuxtLink>
        </div>
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
const { SOCIAL } = useSiteConfig()

const PLAYSTORE_URL = 'https://play.google.com/store/apps/details?id=id.lakara.member'

const footerLinks = [
  {
    title: 'Divisi',
    links: [
      { label: 'Lakara Creative', href: '/#creative' },
      { label: 'Lakara Talent', href: '/#talent' },
      { label: 'EBoost', href: '/#eboost' },
    ],
  },
  {
    title: 'Layanan',
    links: [
      { label: 'Website Development', href: '/services' },
      { label: 'Mobile App', href: '/services' },
      { label: 'Shoutcasting & Host', href: '/services' },
      { label: 'SMM Panel', href: '/services' },
      { label: 'UI/UX & Grafis', href: '/services' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang Kami',  href: '/about' },
      { label: 'Harga',         href: '/pricing' },
      { label: 'Kalkulator',    href: '/kalkulator' },
      { label: 'Blog',          href: '/artikel' },
      { label: 'Kontak',        href: '/contact' },
    ],
  },
]
</script>
