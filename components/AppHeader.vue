<template>
  <header
    class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 transition-shadow"
    :class="{ 'shadow-sm': scrolled }"
  >
    <UContainer>
      <nav class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <LakasaLogo class="w-8 h-8" />
          <span class="text-xl font-bold text-gray-900">Lakara</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <ul class="hidden md:flex items-center gap-1">
          <!-- Layanan dropdown -->
          <li>
            <UDropdown :items="layananItems" :popper="{ placement: 'bottom-start' }">
              <UButton
                variant="ghost"
                color="gray"
                trailing-icon="i-tabler-chevron-down"
                class="font-medium"
              >
                Layanan
              </UButton>
            </UDropdown>
          </li>
          <li v-for="link in navLinks" :key="link.href">
            <UButton
              :to="link.href"
              variant="ghost"
              color="gray"
              class="font-medium"
            >
              {{ link.label }}
            </UButton>
          </li>
        </ul>

        <!-- CTA -->
        <div class="hidden md:flex items-center gap-3">
          <UButton
            :to="wa('Halo Lakara, saya ingin konsultasi')"
            target="_blank"
            color="primary"
            style="background-color: #3358ff;"
            class="font-semibold"
          >
            Konsultasi Gratis
          </UButton>
        </div>

        <!-- Mobile menu button -->
        <UButton
          class="md:hidden"
          variant="ghost"
          color="gray"
          :icon="mobileOpen ? 'i-tabler-x' : 'i-tabler-menu-2'"
          @click="mobileOpen = !mobileOpen"
        />
      </nav>

      <!-- Mobile menu -->
      <Transition name="slide-down">
        <div v-if="mobileOpen" class="md:hidden border-t border-gray-100 py-4 space-y-1">
          <UButton to="/#layanan" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Layanan</UButton>
          <UButton to="/showcase" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Showcase</UButton>
          <UButton to="/pricing" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Harga</UButton>
          <UButton to="/kalkulator" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Kalkulator Harga</UButton>
          <UButton to="/portfolio" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Portofolio</UButton>
          <UButton to="/artikel" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Blog</UButton>
          <UButton to="/about" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Tentang</UButton>
          <UButton to="/contact" variant="ghost" color="gray" block class="justify-start" @click="mobileOpen = false">Kontak</UButton>
          <div class="pt-3">
            <UButton
              :to="wa('Halo Lakara, saya ingin konsultasi')"
              target="_blank"
              block
              style="background-color: #3358ff;"
              class="font-semibold"
            >
              Konsultasi Gratis
            </UButton>
          </div>
        </div>
      </Transition>
    </UContainer>
  </header>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()

const scrolled = ref(false)
const mobileOpen = ref(false)

const onScroll = () => { scrolled.value = window.scrollY > 10 }

onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }) })
onUnmounted(() => { window.removeEventListener('scroll', onScroll) })

const layananItems = [
  [
    { label: 'Lakara Creative', icon: 'i-tabler-code', to: '/services#creative' },
    { label: 'Lakara Marketing', icon: 'i-tabler-trending-up', to: '/services#marketing' },
    { label: 'Lakara Talent', icon: 'i-tabler-microphone-2', to: '/services#talent' },
    { label: 'Semua Layanan', icon: 'i-tabler-apps', to: '/services' },
  ],
]

const navLinks = [
  { label: 'Showcase',    href: '/showcase' },
  { label: 'Harga',       href: '/pricing' },
  { label: 'Kalkulator',  href: '/kalkulator' },
  { label: 'Portofolio',  href: '/portfolio' },
  { label: 'Blog',        href: '/artikel' },
  { label: 'Tentang',     href: '/about' },
  { label: 'Kontak',      href: '/contact' },
]
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
