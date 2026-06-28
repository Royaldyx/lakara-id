<template>
  <div v-if="product && store" class="min-h-screen bg-white" style="font-family: 'Inter', system-ui, sans-serif;">
    <Head>
      <Title>{{ product.name }} — {{ store.name }}</Title>
      <Meta name="description" :content="product.description || product.tagline" />
      <Meta property="og:title" :content="product.name + ' , ' + store.name" />
      <Meta property="og:description" :content="product.description || product.tagline" />
      <Meta property="og:image" :content="ogImage" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:image" :content="ogImage" />
      <Meta property="og:type" content="product" />
      <Script type="application/ld+json" :children="JSON.stringify(jsonLd)" />
    </Head>

    <!-- ── STICKY BOTTOM CTA BAR ─────────────────────── -->
    <Transition name="slide-up">
      <div v-show="showStickyBar"
        class="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-gray-100 shadow-2xl">
        <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-400 truncate leading-tight">{{ store.name }}</p>
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="font-black text-xl leading-tight" :style="{ color: store.primary_color }">{{ formatPrice(product.price) }}</span>
              <span v-if="product.price_original" class="text-sm text-gray-400 line-through">{{ formatPrice(product.price_original) }}</span>
            </div>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <a v-for="mp in barMarketplaces" :key="mp.key"
              :href="mp.url" target="_blank" rel="noopener"
              class="text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition hover:opacity-85 whitespace-nowrap"
              :style="{ background: store.primary_color }">
              {{ mp.label }}
            </a>
            <a v-if="!activeMarketplaces.length" :href="`https://wa.me/${store.whatsapp}`" target="_blank"
              class="text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition hover:opacity-85"
              :style="{ background: store.primary_color }">
              Chat WA
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── LIGHTBOX ──────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="lightbox" @click="lightbox = ''"
        class="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 cursor-zoom-out">
        <button @click.stop="lightbox = ''" class="absolute top-4 right-4 text-white/60 hover:text-white text-3xl leading-none">×</button>
        <img :src="lightbox" class="max-w-full max-h-[90vh] rounded-2xl object-contain" />
      </div>
    </Transition>

    <!-- ── STICKY TOP BAR ────────────────────────────── -->
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 py-3">
      <div class="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <a :href="`/${store.slug}`" class="flex items-center gap-2 group">
          <img v-if="store.logo" :src="store.logo" class="h-8 object-contain rounded-md" />
          <span v-else class="font-black text-lg tracking-tight" :style="{ color: store.primary_color }">{{ store.name }}</span>
        </a>
        <div class="flex items-center gap-3">
          <a v-if="store.instagram" :href="store.instagram" target="_blank" class="text-gray-400 hover:text-pink-500 transition hidden sm:block">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a :href="ctaLink" target="_blank"
            class="text-white text-sm font-bold px-5 py-2 rounded-full transition hover:opacity-85"
            :style="{ background: store.primary_color }">
            Beli Sekarang
          </a>
        </div>
      </div>
    </header>

    <!-- ── HERO ──────────────────────────────────────── -->
    <section ref="heroRef" class="max-w-5xl mx-auto px-4 pt-10 pb-10 grid md:grid-cols-2 gap-10 items-start">

      <!-- Left: Gallery -->
      <div class="md:sticky md:top-20">
        <!-- Main image -->
        <div class="rounded-3xl overflow-hidden bg-gray-50 cursor-zoom-in relative" @click="lightbox = activeImage">
          <img :src="activeImage" :alt="product.name"
            class="w-full object-cover hover:scale-105 transition-transform duration-700" :class="imgAspectClass" />
          <!-- Badge -->
          <div v-if="product.badge" class="absolute top-4 left-4">
            <span class="text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide"
              :style="{ background: store.primary_color }">{{ product.badge }}</span>
          </div>
          <!-- Discount badge -->
          <div v-else-if="product.price_original && product.price < product.price_original" class="absolute top-4 left-4">
            <span class="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full">
              -{{ Math.round((1 - product.price / product.price_original) * 100) }}%
            </span>
          </div>
          <!-- Zoom hint -->
          <div class="absolute bottom-3 right-3 bg-white/80 backdrop-blur rounded-xl px-2 py-1 text-xs text-gray-600 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
            Klik untuk zoom
          </div>
        </div>
        <!-- Thumbnails -->
        <div v-if="product.images?.length > 1" class="grid grid-cols-4 gap-2 mt-3">
          <div v-for="(img, i) in product.images" :key="i"
            @click="activeImage = img"
            class="rounded-2xl overflow-hidden cursor-pointer aspect-square transition-all duration-200"
            :style="activeImage === img
              ? { outline: `2.5px solid ${store.primary_color}`, outlineOffset: '2px' }
              : { opacity: 0.5 }">
            <img :src="img" :alt="product.name + ' ' + (i+1)" class="w-full h-full object-cover hover:opacity-100 transition-opacity" loading="lazy" />
          </div>
        </div>
      </div>

      <!-- Right: Info -->
      <div class="space-y-5">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-40">{{ store.name }}</p>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] mb-3">{{ product.name }}</h1>
          <p class="text-lg text-gray-500 leading-relaxed">{{ product.tagline }}</p>
        </div>

        <!-- Stars -->
        <div v-if="product.reviews?.rating" class="flex items-center gap-2">
          <div class="flex gap-0.5">
            <svg v-for="i in 5" :key="i" class="w-4 h-4" :fill="i <= Math.round(product.reviews.rating) ? '#FBBF24' : '#E5E7EB'" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          </div>
          <span class="text-sm font-bold text-gray-800">{{ product.reviews.rating }}</span>
          <span class="text-sm text-gray-400">({{ product.reviews.total }}+ reviews)</span>
        </div>

        <!-- Price -->
        <div class="flex items-end gap-3 py-4 border-y border-gray-100">
          <span class="text-4xl font-black" :style="{ color: store.primary_color }">{{ formatPrice(product.price) }}</span>
          <span v-if="product.price_original" class="text-xl text-gray-400 line-through pb-0.5">{{ formatPrice(product.price_original) }}</span>
        </div>

        <!-- Stock label -->
        <div v-if="product.stock_label" class="flex items-center gap-2 text-sm">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
          <span class="text-gray-600 font-medium">{{ product.stock_label }}</span>
        </div>

        <!-- CTA -->
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Beli di:</p>
          <div class="flex flex-wrap gap-2.5" id="cta">
            <a v-for="mp in activeMarketplaces" :key="mp.key"
              :href="mp.url" target="_blank" rel="noopener"
              class="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm border-2 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              :style="{ borderColor: store.primary_color, color: store.primary_color, background: store.primary_color + '08' }">
              {{ mp.label }}
            </a>
          </div>
          <p v-if="!activeMarketplaces.length && store.whatsapp" class="mt-3">
            <a :href="`https://wa.me/${store.whatsapp}?text=Halo, saya tertarik dengan ${product.name}`" target="_blank"
              class="inline-flex items-center gap-2 text-white font-bold px-6 py-3 rounded-2xl transition hover:opacity-85"
              :style="{ background: store.primary_color }">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Chat WhatsApp
            </a>
          </p>
        </div>

        <!-- Trust badges -->
        <div class="grid grid-cols-3 gap-2 pt-2">
          <div v-for="trust in trustBadges" :key="trust.label"
            class="flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3 text-center">
            <span class="text-xl">{{ trust.icon }}</span>
            <span class="text-xs font-semibold text-gray-600 leading-tight">{{ trust.label }}</span>
          </div>
        </div>

        <!-- Short description -->
        <p v-if="product.description" class="text-gray-600 leading-relaxed text-sm border-l-4 pl-4"
          :style="{ borderColor: store.primary_color + '60' }">
          {{ product.description }}
        </p>
      </div>
    </section>

    <!-- ── BRAND STRIP ────────────────────────────────── -->
    <div class="py-4 text-center text-sm font-bold tracking-[0.3em] uppercase text-white"
      :style="{ background: store.primary_color }">
      {{ store.tagline || store.name }}
    </div>

    <!-- ── SPECS TABLE ────────────────────────────────── -->
    <section v-if="product.specs?.length" class="py-16 bg-white">
      <div class="max-w-3xl mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-center mb-2 opacity-40">Detail Produk</p>
        <h2 class="text-2xl md:text-3xl font-black text-gray-900 text-center mb-10">Spesifikasi</h2>
        <div class="rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div v-for="(spec, i) in product.specs" :key="i"
            class="flex items-start justify-between px-6 py-4 gap-4"
            :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'">
            <span class="text-sm font-semibold text-gray-500 flex-shrink-0 w-36">{{ spec.label }}</span>
            <span class="text-sm font-bold text-gray-900 text-right">{{ spec.value }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── WHY BUY ────────────────────────────────────── -->
    <section v-if="store.why_buy?.length" class="py-20 bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <p class="text-xs font-bold uppercase tracking-[0.25em] mb-3 opacity-40">Kenapa {{ store.name }}?</p>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-14">{{ store.description || 'Kualitas yang bisa kamu percaya.' }}</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div v-for="(item, i) in store.why_buy" :key="i"
            class="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-white text-xl font-black transition-transform group-hover:scale-110"
              :style="{ background: store.primary_color }">{{ i + 1 }}</div>
            <h3 class="text-lg font-black text-gray-900 mb-2">{{ item.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── INTRODUCING FEATURES ──────────────────────── -->
    <section v-if="product.features?.length">
      <div class="max-w-5xl mx-auto px-4 py-20 text-center">
        <p class="text-xs font-bold tracking-[0.3em] text-gray-400 uppercase mb-3">introducing</p>
        <h2 class="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{{ product.name }}</h2>
        <p class="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">{{ product.tagline }}</p>
      </div>

      <div v-for="(feat, i) in product.features" :key="i" class="border-t border-gray-100">
        <div class="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div :class="i % 2 === 1 ? 'md:order-2' : ''">
            <p class="text-xs font-bold uppercase tracking-widest mb-4 opacity-40">Feature 0{{ i + 1 }}</p>
            <h3 class="text-2xl md:text-3xl font-black text-gray-900 mb-5 leading-tight">{{ feat.title }}</h3>
            <p class="text-gray-500 leading-relaxed text-lg mb-8">{{ feat.desc }}</p>
            <a :href="ctaLink" target="_blank"
              class="inline-flex items-center gap-2 font-bold px-8 py-3.5 rounded-full text-white text-sm transition hover:opacity-85 hover:shadow-xl group"
              :style="{ background: store.primary_color }">
              Beli Sekarang
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
          <div :class="i % 2 === 1 ? 'md:order-1' : ''">
            <div v-if="feat.image" class="rounded-3xl overflow-hidden shadow-2xl cursor-zoom-in" @click="lightbox = feat.image">
              <img :src="feat.image" :alt="feat.title" class="w-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
            <div v-else class="rounded-3xl aspect-square flex items-center justify-center border-2 border-dashed border-gray-200"
              :style="{ background: store.primary_color + '08' }">
              <svg class="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" :style="{ color: store.primary_color }">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA REPEAT ─────────────────────────────────── -->
    <section class="py-20 border-t border-gray-100 text-center" :style="{ background: store.primary_color + '08' }">
      <div class="max-w-3xl mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-widest opacity-40 mb-3">Siap order?</p>
        <h2 class="text-3xl md:text-4xl font-black text-gray-900 mb-3 leading-tight">Jangan sampai kehabisan stok.</h2>
        <p class="text-gray-500 mb-2 text-lg">Stok terbatas , pesan sekarang, nikmati besok.</p>
        <div class="text-5xl font-black mb-8 mt-6" :style="{ color: store.primary_color }">{{ formatPrice(product.price) }}</div>
        <div class="flex flex-wrap justify-center gap-3">
          <a v-for="mp in activeMarketplaces" :key="mp.key"
            :href="mp.url" target="_blank" rel="noopener"
            class="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm border-2 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
            :style="{ borderColor: store.primary_color, color: store.primary_color }">
            {{ mp.label }}
          </a>
        </div>
      </div>
    </section>

    <!-- ── REVIEWS ─────────────────────────────────────── -->
    <section v-if="product.reviews?.total" class="py-20 bg-white border-t border-gray-100">
      <div class="max-w-5xl mx-auto px-4">
        <div class="grid md:grid-cols-3 gap-12 mb-14 items-center">
          <!-- Aggregate -->
          <div class="text-center md:text-left">
            <p class="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-40">Customer Reviews</p>
            <div class="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span class="text-7xl font-black text-gray-900 leading-none">{{ product.reviews.rating }}</span>
              <div>
                <div class="flex gap-0.5 mb-1">
                  <svg v-for="i in 5" :key="i" class="w-5 h-5" :fill="i <= Math.round(product.reviews.rating) ? '#FBBF24' : '#E5E7EB'" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <p class="text-gray-400 text-sm">{{ product.reviews.total }}+ Reviews</p>
              </div>
            </div>
            <!-- Rating bars -->
            <div class="space-y-1.5">
              <div v-for="star in [5,4,3,2,1]" :key="star" class="flex items-center gap-2">
                <span class="text-xs text-gray-400 w-3">{{ star }}</span>
                <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                <div class="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700"
                    :style="{ width: ratingPercent(star) + '%', background: store.primary_color }"></div>
                </div>
                <span class="text-xs text-gray-400 w-6 text-right">{{ ratingPercent(star) }}%</span>
              </div>
            </div>
          </div>

          <!-- Review cards -->
          <div v-if="product.reviews.items?.length" class="md:col-span-2 grid sm:grid-cols-2 gap-4">
            <div v-for="(rev, i) in product.reviews.items" :key="i"
              class="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <div class="flex gap-0.5 mb-3">
                <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :fill="s <= (rev.rating || 5) ? '#FBBF24' : '#E5E7EB'" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <p class="text-gray-700 text-sm leading-relaxed mb-4 italic">"{{ rev.text }}"</p>
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  :style="{ background: store.primary_color }">{{ (rev.name || '?')[0] }}</div>
                <div>
                  <p class="font-bold text-gray-900 text-xs">{{ rev.name }}</p>
                  <p v-if="rev.location" class="text-xs text-gray-400">{{ rev.location }} · Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FAQ ───────────────────────────────────────── -->
    <section v-if="product.faq?.length" class="py-20 bg-gray-50 border-t border-gray-100">
      <div class="max-w-3xl mx-auto px-4">
        <p class="text-xs font-bold uppercase tracking-[0.25em] text-center mb-3 opacity-40">FAQ</p>
        <h2 class="text-3xl font-black text-gray-900 text-center mb-12">Ada Pertanyaan?</h2>
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div v-for="(item, i) in product.faq" :key="i"
            class="border-b border-gray-100 last:border-b-0">
            <button @click="openFaq = openFaq === i ? -1 : i" type="button"
              class="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition-colors">
              <span class="font-bold text-gray-900 text-sm leading-snug">{{ item.q }}</span>
              <span class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-lg font-light leading-none transition-transform duration-200"
                :class="openFaq === i ? 'rotate-45' : ''"
                :style="{ background: store.primary_color }">+</span>
            </button>
            <div v-show="openFaq === i" class="px-6 pb-5 text-gray-500 text-sm leading-relaxed">{{ item.a }}</div>
          </div>
        </div>
        <div class="text-center mt-10">
          <a :href="ctaLink" target="_blank"
            class="inline-flex items-center gap-2 font-bold px-10 py-4 rounded-full text-white transition hover:opacity-85 hover:shadow-2xl text-base group"
            :style="{ background: store.primary_color }">
            Beli Sekarang <span class="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ── RELATED PRODUCTS ───────────────────────────── -->
    <section v-if="relatedProducts.length" class="py-20 bg-white border-t border-gray-100">
      <div class="max-w-5xl mx-auto px-4">
        <div class="flex items-center justify-between mb-10">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] mb-1 opacity-40">Dari Toko yang Sama</p>
            <h2 class="text-2xl font-black text-gray-900">Produk Lainnya</h2>
          </div>
          <a :href="`/${store.slug}/store`" class="text-sm font-semibold hover:underline" :style="{ color: store.primary_color }">
            Lihat semua →
          </a>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <NuxtLink v-for="rel in relatedProducts" :key="rel.id"
            :to="`/${store.slug}/${rel.slug}`"
            class="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
            <div class="overflow-hidden bg-gray-50" :class="imgAspectClass">
              <img v-if="rel.images?.[0]" :src="rel.images[0]" :alt="rel.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01"/></svg>
              </div>
            </div>
            <div class="p-5">
              <p v-if="rel.badge" class="text-xs font-bold uppercase tracking-wide mb-1" :style="{ color: store.primary_color }">{{ rel.badge }}</p>
              <h3 class="font-black text-gray-900 mb-1 group-hover:opacity-70 transition-opacity leading-tight">{{ rel.name }}</h3>
              <p class="text-sm text-gray-400 mb-3 line-clamp-1">{{ rel.tagline }}</p>
              <div class="flex items-center gap-2">
                <span class="font-black text-base" :style="{ color: store.primary_color }">{{ formatPrice(rel.price) }}</span>
                <span v-if="rel.price_original" class="text-sm text-gray-400 line-through">{{ formatPrice(rel.price_original) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ── FOOTER ─────────────────────────────────────── -->
    <footer class="border-t border-gray-100 py-10">
      <div class="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-5">
        <div class="flex items-center gap-3">
          <img v-if="store.logo" :src="store.logo" class="h-8 object-contain rounded-md" />
          <span v-else class="font-black text-xl" :style="{ color: store.primary_color }">{{ store.name }}</span>
        </div>
        <div class="flex gap-4 items-center">
          <a v-if="store.instagram" :href="store.instagram" target="_blank" class="text-gray-400 hover:text-pink-500 transition">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a v-if="store.tiktok" :href="store.tiktok" target="_blank" class="text-gray-400 hover:text-black transition">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
          <a v-if="store.whatsapp" :href="`https://wa.me/${store.whatsapp}`" target="_blank" class="text-gray-400 hover:text-green-500 transition">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </a>
        </div>
        <p class="text-xs text-gray-400 text-center">
          © {{ new Date().getFullYear() }} {{ store.name }} · Landing page by
          <a href="https://lakara.id" class="font-bold hover:underline" :style="{ color: store.primary_color }">Lakara</a>
        </p>
      </div>
    </footer>

    <!-- Bottom padding for sticky bar -->
    <div class="h-20"></div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-6xl mb-4">📦</p>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Produk tidak ditemukan</h1>
      <NuxtLink to="/" class="text-[#3358ff] font-semibold hover:underline">← Kembali ke Lakara</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route      = useRoute()
const tokoSlug   = route.params.toko as string
const produkSlug = route.params.produk as string

const { data: res } = await useFetch('/api/stores', {
  query: { slug_store: tokoSlug, slug_product: produkSlug },
  server: true,
  default: () => ({ success: false, data: null }),
})

// Fetch all store products for related products section
const { data: storeRes } = await useFetch('/api/stores', {
  query: { slug: tokoSlug },
  server: true,
  default: () => ({ success: false, data: null }),
})

const store   = computed(() => res.value?.data?.store   ?? null)
const product = computed(() => res.value?.data?.product ?? null)

const relatedProducts = computed(() => {
  const all = (storeRes.value?.data?.products ?? []) as any[]
  return all.filter((p: any) => p.id !== product.value?.id && p.published !== false).slice(0, 3)
})

const activeImage    = ref('')
const openFaq        = ref(-1)
const lightbox       = ref('')
const showStickyBar  = ref(false)
const heroRef        = ref<HTMLElement | null>(null)

watchEffect(() => {
  if (product.value?.images?.length) activeImage.value = product.value.images[0]
})

// Show sticky bar after scrolling past hero
onMounted(() => {
  const onScroll = () => {
    const heroHeight = heroRef.value?.offsetHeight ?? 400
    showStickyBar.value = window.scrollY > heroHeight
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})

// Marketplace config
const marketplaceConfig = [
  { key: 'shopee',      label: 'Shopee'      },
  { key: 'tokopedia',   label: 'Tokopedia'   },
  { key: 'lazada',      label: 'Lazada'      },
  { key: 'blibli',      label: 'Blibli'      },
  { key: 'tiktok_shop', label: 'TikTok Shop' },
]

const activeMarketplaces = computed(() =>
  marketplaceConfig
    .filter(mp => product.value?.marketplace?.[mp.key])
    .map(mp => ({ ...mp, url: product.value!.marketplace[mp.key] }))
)

const ctaLink = computed(() => (product.value?.buy_link?.trim()) || activeMarketplaces.value[0]?.url || '#cta')

// OG image (absolute) untuk preview share — foto produk, fallback logo toko
const ogImage = computed(() => {
  const img = product.value?.images?.[0] || store.value?.logo || ''
  if (!img) return ''
  if (/^https?:\/\//i.test(img)) return img
  return 'https://lakara.id' + (img.startsWith('/') ? img : '/' + img)
})

// Sticky bar: marketplace yang dipilih member (maks 2), fallback ke 2 pertama
const barMarketplaces = computed(() => {
  const feat = (product.value?.marketplace_featured ?? []) as string[]
  const featured = activeMarketplaces.value.filter(mp => feat.includes(mp.key))
  return (featured.length ? featured : activeMarketplaces.value).slice(0, 2)
})

// Rasio gambar produk seragam (per toko)
const imgAspectClass = computed(() => store.value?.product_image_ratio === '3:4' ? 'aspect-[3/4]' : 'aspect-square')

// JSON-LD structured data for Google rich snippets
const jsonLd = computed(() => {
  if (!product.value || !store.value) return {}
  const base: any = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.value.name,
    description: product.value.description || product.value.tagline || '',
    image:       product.value.images || [],
    brand:       { '@type': 'Brand', name: store.value.name },
    offers: {
      '@type':        'Offer',
      priceCurrency:  'IDR',
      price:          product.value.price || 0,
      availability:   product.value.published !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url:            ctaLink.value !== '#cta' ? ctaLink.value : undefined,
    },
  }
  if (product.value.reviews?.rating && product.value.reviews?.total) {
    base.aggregateRating = {
      '@type':       'AggregateRating',
      ratingValue:   product.value.reviews.rating,
      reviewCount:   product.value.reviews.total,
      bestRating:    5,
      worstRating:   1,
    }
  }
  return base
})

// Trust badges — auto from store data
const trustBadges = computed(() => {
  const badges = [
    { icon: '🛡️', label: 'Garansi Resmi' },
    { icon: '🚚', label: 'Pengiriman Cepat' },
    { icon: '💬', label: 'CS Responsif' },
  ]
  return badges
})

// Rating bar calculation — distribute based on overall rating
function ratingPercent(star: number): number {
  const rating = product.value?.reviews?.rating ?? 0
  if (!rating) return 0
  // Simple distribution formula
  const dist: Record<number, number> = {
    5: Math.max(0, Math.round((rating - 3) / 2 * 80)),
    4: Math.round((1 - Math.abs(rating - 4) / 2) * 60),
    3: Math.round((1 - Math.abs(rating - 3) / 2) * 20),
    2: Math.round(Math.max(0, (4 - rating) / 2) * 10),
    1: Math.round(Math.max(0, (3 - rating) / 2) * 5),
  }
  // If actual review items exist, use those
  const items = product.value?.reviews?.items ?? []
  if (items.length > 0) {
    const count = items.filter((r: any) => (r.rating || 5) === star).length
    return Math.round(count / items.length * 100)
  }
  return dist[star] ?? 0
}

function formatPrice(val: number) {
  if (!val) return 'Hubungi Kami'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease, opacity 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
