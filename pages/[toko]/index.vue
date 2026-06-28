<template>
  <div v-if="store" class="bio-root relative min-h-screen w-full flex justify-center transition-colors" :style="rootStyle">
    <Head>
      <Title>{{ bio.title || store.name }}</Title>
      <Meta name="description" :content="bio.bio || store.tagline" />
      <Meta property="og:title" :content="bio.title || store.name" />
      <Meta property="og:description" :content="bio.bio || store.tagline || ''" />
      <Meta property="og:type" content="profile" />
      <Meta v-if="ogImage" property="og:image" :content="ogImage" />
      <Meta v-if="ogLarge" property="og:image:width" content="1200" />
      <Meta v-if="ogLarge" property="og:image:height" content="630" />
      <Meta v-if="ogImage" name="twitter:card" :content="ogLarge ? 'summary_large_image' : 'summary'" />
      <Meta v-if="ogImage" name="twitter:image" :content="ogImage" />
      <Link v-if="fontHref" rel="stylesheet" :href="fontHref" />
    </Head>

    <!-- Desktop backdrop: blurred/dimmed copy of the bio background (Linktree-style) -->
    <div class="bio-backdrop hidden lg:block fixed inset-0 z-0 pointer-events-none" :style="backdropStyle" />
    <div class="hidden lg:block fixed inset-0 z-0 bg-black/50 pointer-events-none" />

    <!-- "View on mobile" QR (desktop only) -->
    <div class="hidden lg:flex fixed bottom-6 right-6 z-20 flex-col items-center gap-2 pointer-events-none select-none">
      <span class="text-xs font-semibold text-white/70">Buka di HP</span>
      <img :src="qrSrc" alt="QR" width="96" height="96"
        class="w-24 h-24 rounded-xl bg-white p-1.5 shadow-lg" loading="lazy" />
    </div>

    <!-- The phone column (mobile frame on desktop) -->
    <div class="bio-frame relative z-10 w-full lg:w-[480px] lg:max-w-[480px] min-h-screen overflow-hidden lg:shadow-2xl" :style="pageStyle">

      <!-- Video wallpaper (Premium) -->
      <video v-if="bio.bg_type === 'video' && bio.bg_video"
        :src="bio.bg_video" autoplay muted loop playsinline
        class="absolute inset-0 w-full h-full object-cover z-0" />
      <div v-if="(bio.bg_type === 'image' && bio.bg_image) || (bio.bg_type === 'video' && bio.bg_video)"
        class="absolute inset-0 bg-black/30 z-0" />

      <div class="relative z-10">
      <!-- GIF Banner -->
      <div v-if="gifLink" class="w-full max-h-52 overflow-hidden">
        <img :src="gifLink.url" alt="Banner" class="w-full h-52 object-cover" />
      </div>

      <div class="max-w-[480px] mx-auto px-5 py-10 pb-16" :style="contentFontStyle">

        <!-- Avatar + name + bio -->
        <div class="text-center mb-8">
          <div class="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 shadow-lg ring-4 ring-white/30"
            :style="{ background: bio.accent_color }">
            <img v-if="store.logo" :src="store.logo" class="w-full h-full object-cover" />
            <span v-else class="w-full h-full flex items-center justify-center text-white font-extrabold text-3xl">
              {{ (bio.title || store.name)[0]?.toUpperCase() }}
            </span>
          </div>
          <h1 v-if="bio.show_name !== false" class="text-2xl font-extrabold mb-2 flex items-center justify-center gap-1.5" :style="{ color: bio.title_color || bio.text_color }">
            {{ bio.title || store.name }}
            <UIcon v-if="bio.verified" name="i-tabler-rosette-discount-check-filled" class="w-5 h-5 text-[#3358ff] flex-shrink-0" />
          </h1>
          <p v-if="bio.bio && bio.show_bio !== false" class="text-sm max-w-xs mx-auto leading-relaxed" :style="{ color: bio.bio_color || bio.text_color }">{{ bio.bio }}</p>

          <!-- Social icon row -->
          <div v-if="socialList.length" class="flex flex-wrap justify-center gap-2.5 mt-4">
            <a v-for="s in socialList" :key="s.type" :href="socialHref(s)" target="_blank" rel="noopener"
              class="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              :style="socialStyle(s)" :title="s.type">
              <UIcon :name="socialIcon(s.type)" class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Links -->
        <div class="space-y-3">
          <a v-if="hasProducts" :href="`/${store.slug}/store`"
            class="flex items-center w-full py-4 px-5 font-bold text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            :class="[linkRadiusClass, animClass]"
            :style="{ background: bio.button_color || bio.accent_color, color: bio.button_text_color || '#fff' }">
            <span class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <UIcon name="i-tabler-shopping-bag" class="w-4 h-4" />
            </span>
            <span class="flex-1 text-center">Kunjungi Toko</span>
          </a>

          <!-- Featured link -->
          <a v-if="featuredLink"
            :href="featuredLink.url" target="_blank" rel="noopener noreferrer"
            class="relative flex items-center w-full overflow-hidden font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            :class="[linkRadiusClass, animClass, featuredLink.image ? 'py-7 px-5' : 'py-5 px-5']"
            :style="featuredStyle"
            @click="trackClick(featuredLink)">
            <img v-if="featuredLink.image" :src="featuredLink.image" alt=""
              class="absolute inset-0 w-full h-full object-cover z-0" />
            <div v-if="featuredLink.image" class="absolute inset-0 bg-black/45 z-0" />
            <span class="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
              :style="featuredLink.image ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : featuredIconStyle">
              <UIcon v-if="getMeta(featuredLink.type).icon" :name="getMeta(featuredLink.type).icon!" class="w-4 h-4" />
              <span v-else>{{ getMeta(featuredLink.type).emoji }}</span>
            </span>
            <span class="relative z-10 flex-1 text-center" :style="featuredLink.image ? { color: '#fff' } : {}">{{ featuredLink.label || featuredLink.type }}</span>
            <UIcon name="i-tabler-star-filled" class="relative z-10 w-4 h-4 opacity-70 ml-1" :style="featuredLink.image ? { color: '#fff' } : {}" />
          </a>

          <!-- Regular links -->
          <template v-for="link in activeLinks" :key="link.id">
            <a :href="link.url" target="_blank" rel="noopener noreferrer"
              class="relative flex items-center w-full overflow-hidden font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              :class="[linkRadiusClass, animClass, link.image ? 'py-7 px-5' : 'py-4 px-5']"
              :style="link.image ? {} : linkStyle(link)"
              @click="trackClick(link)">
              <img v-if="link.image" :src="link.image" alt="" loading="lazy"
                class="absolute inset-0 w-full h-full object-cover z-0" />
              <div v-if="link.image" class="absolute inset-0 bg-black/45 z-0" />
              <span class="relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                :style="link.image ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : iconStyle(link)">
                <UIcon v-if="getMeta(link.type).icon" :name="getMeta(link.type).icon!" class="w-4 h-4" />
                <span v-else>{{ getMeta(link.type).emoji }}</span>
              </span>
              <span class="relative z-10 flex-1 text-center" :style="link.image ? { color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' } : {}">{{ link.label || link.type }}</span>
            </a>
          </template>
        </div>

        <!-- YouTube video cards -->
        <div v-if="videoLinks.length" class="space-y-3 mt-3">
          <div v-for="v in videoLinks" :key="v.id" class="rounded-2xl overflow-hidden border border-white/15 bg-black/20">
            <div v-if="youtubeId(v.url)" class="relative w-full" style="aspect-ratio: 16 / 9;">
              <iframe :src="`https://www.youtube.com/embed/${youtubeId(v.url)}`" class="absolute inset-0 w-full h-full"
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen referrerpolicy="strict-origin-when-cross-origin" />
            </div>
            <a v-else :href="v.url" target="_blank" rel="noopener" class="block text-center py-4 text-sm font-semibold"
              :style="{ color: bio.bio_color || bio.text_color }">{{ v.label || 'Tonton Video' }} →</a>
            <div v-if="v.label && youtubeId(v.url)" class="px-4 py-2.5 text-xs font-semibold" :style="{ color: bio.bio_color || bio.text_color }">{{ v.label }}</div>
          </div>
        </div>

        <!-- Product spotlight -->
        <div v-if="bio.show_products && spotlightProducts.length" class="mt-9">
          <div class="text-xs font-bold uppercase tracking-widest mb-3 text-center opacity-80" :style="{ color: bio.bio_color || bio.text_color }">Produk</div>
          <div class="grid grid-cols-2 gap-3">
            <a v-for="p in spotlightProducts" :key="p.id" :href="`/${store.slug}/${p.slug}`"
              class="block rounded-2xl overflow-hidden border border-white/15 bg-white/10 backdrop-blur-sm transition-all hover:scale-[1.02]">
              <div class="aspect-[4/3] bg-black/10">
                <img v-if="p.images && p.images[0]" :src="p.images[0]" :alt="p.name" loading="lazy" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center"><UIcon name="i-tabler-photo" class="w-8 h-8 opacity-30" /></div>
              </div>
              <div class="p-2.5">
                <div class="text-xs font-semibold truncate" :style="{ color: bio.title_color || bio.text_color }">{{ p.name }}</div>
                <div class="text-xs font-extrabold mt-0.5" :style="{ color: bio.button_color || bio.accent_color }">{{ formatPrice(p.price) }}</div>
              </div>
            </a>
          </div>
          <a :href="`/${store.slug}/store`"
            class="mt-3 block text-center text-xs font-semibold py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition"
            :style="{ color: bio.bio_color || bio.text_color }">
            Lihat semua produk →
          </a>
        </div>

        <!-- Empty state -->
        <div v-if="!hasProducts && !activeLinks.length && !featuredLink" class="text-center py-8 opacity-40">
          <UIcon name="i-tabler-link-off" class="w-10 h-10 mx-auto mb-2" />
          <p class="text-sm">Belum ada link.</p>
        </div>

        <!-- Footer branding -->
        <div v-if="!bio.hide_branding" class="mt-14 text-center">
          <a href="https://lakara.id/member" target="_blank"
            class="inline-flex items-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity"
            :style="{ color: bio.bio_color || bio.text_color }">
            <svg viewBox="115 87 145 120" fill="currentColor" width="13" height="13" xmlns="http://www.w3.org/2000/svg">
              <path d="M168.031 89.601C179.832 126.195 183.808 146.016 165.808 171.012C180.21 152.008 206.007 138.008 236.007 136.008C200.003 136.004 177.832 123.195 168.031 89.601Z"/>
              <path d="M166.625 106.68L171.574 171.016C164.304 156.875 154.832 147.875 122.832 137.543C148.832 142.875 162.96 130.68 166.625 106.68Z"/>
            </svg>
            <span class="text-xs font-semibold">Buat link bio-mu di Lakara</span>
          </a>
        </div>
      </div>
      </div>
    </div>
  </div>

  <!-- 404 -->
  <div v-else class="min-h-screen flex items-center justify-center bg-white">
    <div class="text-center">
      <UIcon name="i-tabler-box-off" class="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Halaman tidak ditemukan</h1>
      <NuxtLink to="/" class="text-[#3358ff] font-semibold hover:underline">&#8592; Kembali ke Lakara</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route    = useRoute()
const tokoSlug = route.params.toko as string

const { data: res } = await useFetch('/api/stores', {
  query: { slug: tokoSlug }, server: true,
  default: () => ({ success: false, data: null }),
})

const store = computed(() => res.value?.data ?? null)

if (process.server && !res.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan.' })
}
watchEffect(() => {
  if (process.client && res.value && !res.value.data) {
    throw createError({ statusCode: 404, statusMessage: 'Halaman tidak ditemukan.' })
  }
})

const DEFAULT_BIO = {
  title: '', bio: '',
  bg_type: 'solid', bg_color: '#ffffff',
  gradient_from: '#3358ff', gradient_to: '#7c3aed', gradient_angle: 135,
  bg_image: '', bg_video: '',
  text_color: '#111111', accent_color: '#3358ff',
  title_color: '#111111', bio_color: '#111111',
  button_color: '#3358ff', button_text_color: '#ffffff',
  card_style: 'default', card_bg_color: null, card_radius: 'md',
  hide_branding: false, verified: false, show_products: false, button_animation: 'none',
  show_name: true, show_bio: true, font_family: 'default', social_style: 'outline', socials: [],
  links: [],
}

const FONT_MAP: Record<string, { family: string; css: string }> = {
  default:      { family: '', css: '' },
  inter:        { family: 'Inter', css: "'Inter', sans-serif" },
  poppins:      { family: 'Poppins', css: "'Poppins', sans-serif" },
  montserrat:   { family: 'Montserrat', css: "'Montserrat', sans-serif" },
  nunito:       { family: 'Nunito', css: "'Nunito', sans-serif" },
  spacegrotesk: { family: 'Space Grotesk', css: "'Space Grotesk', sans-serif" },
  oswald:       { family: 'Oswald', css: "'Oswald', sans-serif" },
  bebasneue:    { family: 'Bebas Neue', css: "'Bebas Neue', sans-serif" },
  playfair:     { family: 'Playfair Display', css: "'Playfair Display', serif" },
  lobster:      { family: 'Lobster', css: "'Lobster', cursive" },
  pacifico:     { family: 'Pacifico', css: "'Pacifico', cursive" },
  caveat:       { family: 'Caveat', css: "'Caveat', cursive" },
  quicksand:    { family: 'Quicksand', css: "'Quicksand', sans-serif" },
}

const SOCIAL_META: Record<string, { icon: string; color: string }> = {
  instagram: { icon: 'i-tabler-brand-instagram', color: '#E1306C' },
  tiktok:    { icon: 'i-tabler-brand-tiktok',    color: '#010101' },
  youtube:   { icon: 'i-tabler-brand-youtube',   color: '#FF0000' },
  twitter:   { icon: 'i-tabler-brand-x',          color: '#000000' },
  facebook:  { icon: 'i-tabler-brand-facebook',  color: '#1877F2' },
  twitch:    { icon: 'i-tabler-brand-twitch',    color: '#9146FF' },
  discord:   { icon: 'i-tabler-brand-discord',   color: '#5865F2' },
  telegram:  { icon: 'i-tabler-brand-telegram',  color: '#229ED9' },
  whatsapp:  { icon: 'i-tabler-brand-whatsapp',  color: '#25D366' },
  threads:   { icon: 'i-tabler-brand-threads',   color: '#000000' },
  linkedin:  { icon: 'i-tabler-brand-linkedin',  color: '#0A66C2' },
  snapchat:  { icon: 'i-tabler-brand-snapchat',  color: '#FFB800' },
  pinterest: { icon: 'i-tabler-brand-pinterest', color: '#E60023' },
  spotify:   { icon: 'i-tabler-brand-spotify',   color: '#1DB954' },
  soundcloud:{ icon: 'i-tabler-brand-soundcloud', color: '#FF5500' },
  email:     { icon: 'i-tabler-mail',             color: '#EA4335' },
  website:   { icon: 'i-tabler-world',            color: '#3358ff' },
  github:    { icon: 'i-tabler-brand-github',     color: '#181717' },
}

const bio = computed(() => {
  const s = store.value
  if (!s) return DEFAULT_BIO
  const lb = s.links_bio
  if (!lb) {
    return { ...DEFAULT_BIO, title: s.name, bio: s.tagline || '', accent_color: s.primary_color || '#3358ff', button_color: s.primary_color || '#3358ff' }
  }
  const m: any = { ...DEFAULT_BIO, ...lb }
  // Backward-compat for data saved before the color overhaul
  m.bg_type = lb.bg_type ?? 'solid'
  m.title_color = lb.title_color ?? lb.text_color ?? m.title_color
  m.bio_color = lb.bio_color ?? lb.text_color ?? m.bio_color
  m.button_color = lb.button_color ?? lb.card_bg_color ?? lb.accent_color ?? m.button_color
  m.button_text_color = lb.button_text_color ?? '#ffffff'
  return m
})

const allLinks    = computed(() => (bio.value.links as any[] || []))
const gifLink     = computed(() => allLinks.value.find((l: any) => l.type === 'gif' && l.enabled && l.url))
const featuredLink = computed(() => allLinks.value.find((l: any) => l.featured && l.enabled && l.url && l.type !== 'gif'))
const activeLinks = computed(() =>
  allLinks.value.filter((l: any) => l.type !== 'gif' && l.type !== 'youtube_video' && l.enabled && l.url && !(l.featured))
)
const videoLinks = computed(() =>
  allLinks.value.filter((l: any) => l.type === 'youtube_video' && l.enabled && l.url)
)
function youtubeId(url: string): string {
  if (!url) return ''
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  return m ? m[1] : ''
}
const hasProducts = computed(() => (store.value?.products?.length ?? 0) > 0)

// Font (Pro/Premium)
const fontHref = computed(() => {
  const f = FONT_MAP[bio.value.font_family]
  if (!f || !f.family) return ''
  return `https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g, '+')}:wght@400;600;800&display=swap`
})
const contentFontStyle = computed(() => {
  const f = FONT_MAP[bio.value.font_family]
  return f && f.css ? { fontFamily: f.css } : {}
})

// Social icon row
const socialList = computed(() => ((bio.value.socials as any[]) || []).filter((s: any) => s && s.type && s.url))
function socialIcon(type: string) { return SOCIAL_META[type]?.icon || 'i-tabler-link' }
function socialHref(s: any) {
  const url = (s.url || '').toString().trim()
  if (s.type === 'email') return url.startsWith('mailto:') ? url : 'mailto:' + url
  if (/^https?:\/\//i.test(url)) return url
  return 'https://' + url
}
function socialStyle(s: any) {
  if (bio.value.social_style === 'color') {
    return { background: SOCIAL_META[s.type]?.color || '#3358ff', color: '#ffffff' }
  }
  const c = bio.value.title_color || bio.value.text_color || '#111111'
  return { color: c, border: '1.5px solid ' + c, background: 'transparent' }
}
const spotlightProducts = computed(() => (store.value?.products ?? []).slice(0, 6))

// OG image untuk preview share — utamakan kartu OG 1200x630 hasil generate, fallback ke logo
const abs = (u: string) => /^https?:\/\//i.test(u) ? u : 'https://lakara.id' + (u.startsWith('/') ? u : '/' + u)
const ogImage = computed(() => {
  const card = bio.value?.og_image
  if (card) return abs(card)
  const logo = store.value?.logo
  if (!logo) return ''
  return abs(logo)
})
// Kartu generate selalu 1200x630 → large card; logo fallback → summary biasa
const ogLarge = computed(() => !!bio.value?.og_image)

const animClass = computed(() => {
  const a = bio.value.button_animation
  return a && a !== 'none' ? 'anim-' + a : ''
})

const RADIUS_CLASS: Record<string, string> = {
  sm: 'rounded-lg', md: 'rounded-2xl', lg: 'rounded-3xl', full: 'rounded-full',
}
const linkRadiusClass = computed(() => RADIUS_CLASS[bio.value.card_radius || 'md'] || 'rounded-2xl')

const LINK_META: Record<string, { icon?: string; emoji: string; color: string; isDonate?: boolean }> = {
  instagram:  { icon: 'i-tabler-brand-instagram', emoji: 'IG', color: '#E1306C'  },
  tiktok:     { icon: 'i-tabler-brand-tiktok',    emoji: 'TT', color: '#010101'  },
  facebook:   { icon: 'i-tabler-brand-facebook',  emoji: 'FB', color: '#1877F2'  },
  youtube:    { icon: 'i-tabler-brand-youtube',   emoji: 'YT', color: '#FF0000'  },
  twitter:    { icon: 'i-tabler-brand-x',          emoji: 'X',  color: '#000000'  },
  whatsapp:   { icon: 'i-tabler-brand-whatsapp',  emoji: 'WA', color: '#25D366'  },
  telegram:   { icon: 'i-tabler-brand-telegram',  emoji: 'TG', color: '#229ED9'  },
  threads:    {                                    emoji: '⊛',  color: '#000000'  },
  line:       {                                    emoji: 'L',  color: '#00C300'  },
  shopee:     {                                    emoji: 'SP', color: '#EE4D2D'  },
  tokopedia:  {                                    emoji: 'TP', color: '#03AC0E'  },
  lazada:     {                                    emoji: 'LZ', color: '#0F146D'  },
  tiktokshop: { icon: 'i-tabler-brand-tiktok',    emoji: 'TS', color: '#EE1D52'  },
  blibli:     {                                    emoji: 'BB', color: '#0095DA'  },
  saweria:    {                                    emoji: '🎁', color: '#FF6B1B', isDonate: true },
  trakteer:   {                                    emoji: '☕', color: '#E5163B', isDonate: true },
  karyakarsa: {                                    emoji: '💡', color: '#FF6900', isDonate: true },
  kofi:       {                                    emoji: '☕', color: '#29ABE0', isDonate: true },
  custom:     { icon: 'i-tabler-link',             emoji: '🔗', color: '#64748B'  },
}
const FALLBACK = { icon: 'i-tabler-link', emoji: '🔗', color: '#64748B' }
const getMeta = (type: string) => LINK_META[type] ?? FALLBACK

const pageStyle = computed(() => {
  const b = bio.value
  const base: Record<string, string> = { color: b.text_color || '#111111' }
  if (b.bg_type === 'gradient')
    return { ...base, background: `linear-gradient(${b.gradient_angle || 135}deg, ${b.gradient_from || '#3358ff'}, ${b.gradient_to || '#7c3aed'})` }
  if (b.bg_type === 'image' && b.bg_image)
    return { ...base, backgroundImage: `url(${b.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (b.bg_type === 'video')
    return { ...base, backgroundColor: b.bg_color || '#0d0d0d' }
  return { ...base, backgroundColor: b.bg_color || '#ffffff' }
})

// Warna dasar untuk area di luar "frame" (desktop)
const baseBgColor = computed(() => {
  const b = bio.value
  if (b.bg_type === 'gradient') return b.gradient_from || '#3358ff'
  if (b.bg_type === 'video')    return b.bg_color || '#0d0d0d'
  if (b.bg_type === 'image')    return '#111111'
  return b.bg_color || '#ffffff'
})

// Style root (mobile: tidak terlihat karena frame full-width; desktop: tertutup backdrop)
const rootStyle = computed(() => ({ backgroundColor: baseBgColor.value }))

// Backdrop desktop — blur/redup dari background bio agar mirip Linktree
const backdropStyle = computed(() => {
  const b = bio.value
  if (b.bg_type === 'image' && b.bg_image)
    return {
      backgroundImage: `url(${b.bg_image})`, backgroundSize: 'cover', backgroundPosition: 'center',
      filter: 'blur(48px) brightness(0.6)', transform: 'scale(1.2)',
    }
  if (b.bg_type === 'gradient')
    return { background: `linear-gradient(${b.gradient_angle || 135}deg, ${b.gradient_from || '#3358ff'}, ${b.gradient_to || '#7c3aed'})`, filter: 'brightness(0.55)' }
  return { backgroundColor: baseBgColor.value, filter: 'brightness(0.55)' }
})

// QR "Buka di HP" untuk desktop — pakai URL kanonik (stabil SSR & client)
const pageUrl = computed(() => `https://lakara.id/${store.value?.slug || ''}`)
const qrSrc = computed(() =>
  `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(pageUrl.value)}`)

function resolveCardStyle(link: any) {
  const cardStyle = bio.value.card_style || 'default'
  const btn       = bio.value.button_color || bio.value.accent_color || '#3358ff'
  const btnText   = bio.value.button_text_color || '#ffffff'
  const meta      = getMeta(link.type)
  const textColor = bio.value.text_color || '#111111'

  if (meta.isDonate) {
    return { style: { background: meta.color, color: '#ffffff' }, icon: { background: 'rgba(255,255,255,0.25)', color: '#ffffff' } }
  }
  if (cardStyle === 'filled') {
    return { style: { background: btn, color: btnText, boxShadow: `0 2px 12px ${btn}40` }, icon: { background: 'rgba(255,255,255,0.2)', color: btnText } }
  }
  if (cardStyle === 'outline') {
    return { style: { background: 'transparent', color: btn, border: `2px solid ${btn}` }, icon: { background: btn + '15', color: btn } }
  }
  if (cardStyle === 'ghost') {
    return { style: { background: 'rgba(255,255,255,0.10)', color: textColor, border: '1px solid rgba(255,255,255,0.18)' }, icon: { background: meta.color + '33', color: meta.color } }
  }
  return { style: { background: 'rgba(255,255,255,0.92)', color: '#111111', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }, icon: { background: meta.color + '22', color: meta.color } }
}

function linkStyle(link: any) { return resolveCardStyle(link).style }
function iconStyle(link: any) { return resolveCardStyle(link).icon }

const featuredStyle = computed(() => {
  if (!featuredLink.value) return {}
  if (featuredLink.value.image) return {}
  return resolveCardStyle(featuredLink.value).style
})
const featuredIconStyle = computed(() => {
  if (!featuredLink.value) return {}
  return resolveCardStyle(featuredLink.value).icon
})

function formatPrice(val: number) {
  if (!val) return 'Lihat'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}

function trackClick(link: any) {
  if (!store.value?.id || !link?.id) return
  $fetch('/api/public/record-click', {
    method: 'POST',
    body:   { store_id: store.value.id, link_id: link.id },
  }).catch(() => {})
}

// Catat kunjungan halaman (page view) sekali per load di sisi client
onMounted(() => {
  if (!store.value?.id) return
  $fetch('/api/public/record-view', {
    method: 'POST',
    body:   { store_id: store.value.id },
  }).catch(() => {})
})
</script>
