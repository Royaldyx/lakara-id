<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-3xl space-y-5 pb-10">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900">Link Bio</h1>
        <p class="text-sm text-slate-500 mt-0.5">Atur halaman bio link publik kamu</p>
      </div>
      <a :href="`/${store?.slug}`" target="_blank"
        class="flex items-center gap-2 text-sm font-semibold text-[#3358ff] hover:underline">
        <UIcon name="i-tabler-external-link" class="w-4 h-4" /> Lihat Bio
      </a>
    </div>

    <div class="flex items-center gap-2">
      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest" :class="tierBadgeClass">{{ tierLabel }}</span>
      <NuxtLink v-if="tier === 'free'" to="/member/upgrade" class="text-xs text-[#3358ff] font-semibold hover:underline flex items-center gap-1">
        <UIcon name="i-tabler-arrow-up-circle" class="w-3.5 h-3.5" /> Upgrade untuk lebih banyak fitur
      </NuxtLink>
    </div>

    <!-- TABS -->
    <div class="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
      <div class="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
          class="px-4 py-2 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          :class="activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ===== TAB: PROFIL ===== -->
    <div v-if="activeTab === 'profil'" class="space-y-5">
      <!-- Photo -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <h2 class="font-bold text-slate-900">Foto Profil</h2>
        <ProfilePhotoUploader />
      </div>

      <!-- Colors (granular) -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <h2 class="font-bold text-slate-900">Warna</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div v-for="cf in colorFields" :key="cf.key" class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">{{ cf.label }}</label>
            <div class="flex items-center gap-2">
              <label class="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow cursor-pointer flex-shrink-0" :style="{ background: form[cf.key] }">
                <input type="color" v-model="form[cf.key]" class="sr-only" />
              </label>
              <input v-model="form[cf.key]" type="text" maxlength="7"
                class="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" />
            </div>
          </div>
        </div>
      </div>

      <!-- Name & Bio -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <h2 class="font-bold text-slate-900">Profil</h2>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">Nama / Judul</label>
          <input v-model="form.title" type="text" maxlength="60" placeholder="Nama kamu"
            class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30 focus:border-[#3358ff]" />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">Bio <span class="text-slate-400 font-normal">(maks. 150)</span></label>
          <textarea v-model="form.bio" maxlength="150" rows="2" placeholder="Deskripsi singkat..."
            class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30 focus:border-[#3358ff]" />
          <div class="text-right text-xs text-slate-400">{{ form.bio.length }}/150</div>
        </div>
      </div>

      <!-- Tampilkan Nama & Bio -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <h2 class="font-bold text-slate-900">Tampilkan di Halaman</h2>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">Nama / Judul</span>
          <button @click="form.show_name = !form.show_name" type="button" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="form.show_name ? 'bg-[#3358ff]' : 'bg-slate-200'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="form.show_name ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-700">Bio</span>
          <button @click="form.show_bio = !form.show_bio" type="button" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="form.show_bio ? 'bg-[#3358ff]' : 'bg-slate-200'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="form.show_bio ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>

      <!-- Font (Pro & Premium) -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-900">Font</h2>
          <span v-if="tier === 'free'" class="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Pro</span>
        </div>
        <div :class="tier === 'free' && 'opacity-50 pointer-events-none'" class="space-y-3">
          <!-- Live Preview -->
          <div class="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100" :style="selectedFontStyle">
            <div class="text-xl font-bold text-slate-900 leading-tight">{{ form.title || 'Nama Bio Kamu' }}</div>
            <div class="text-sm text-slate-500 mt-1">Bio singkat di sini — tampilan halaman bio</div>
            <div class="mt-2 text-base font-medium text-slate-700 tracking-wide">Aa Bb Cc 1 2 3</div>
          </div>
          <!-- Font Grid -->
          <div class="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-0.5">
            <button v-for="f in fontOptions" :key="f.key" @click="form.font_family = f.key" type="button"
              class="p-3 border-2 rounded-xl text-left transition-all overflow-hidden"
              :class="form.font_family === f.key ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
              <div class="text-xl font-bold text-slate-800 leading-none" :style="getFontStyle(f.key)">Aa</div>
              <div class="text-[10px] text-slate-500 mt-1 truncate" style="font-family: system-ui, sans-serif">{{ f.label }}</div>
            </button>
          </div>
        </div>
        <div v-if="tier === 'free'" class="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">Pilihan font untuk <NuxtLink to="/member/upgrade" class="font-bold underline">member Pro</NuxtLink>.</div>
      </div>

      <!-- Ikon Sosial -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-bold text-slate-900">Ikon Sosial</h2>
            <p class="text-sm text-slate-500 mt-0.5">Baris ikon di bawah nama (maks 12)</p>
          </div>
          <button @click="addSocial" type="button" class="text-xs text-[#3358ff] font-semibold flex items-center gap-1 hover:opacity-70"><UIcon name="i-tabler-plus" class="w-3.5 h-3.5" /> Tambah</button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Gaya:</span>
          <button @click="form.social_style = 'outline'" type="button" class="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors" :class="form.social_style === 'outline' ? 'border-[#3358ff] text-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 text-slate-600'">Outline</button>
          <button @click="form.social_style = 'color'" type="button" class="px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-colors" :class="form.social_style === 'color' ? 'border-[#3358ff] text-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 text-slate-600'">Berwarna</button>
        </div>
        <div v-for="(s, i) in form.socials" :key="i" class="flex items-center gap-2">
          <select v-model="s.type" class="w-32 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30 flex-shrink-0">
            <option v-for="p in socialPlatforms" :key="p.key" :value="p.key">{{ p.label }}</option>
          </select>
          <input v-model="s.url" type="text" :placeholder="s.type === 'email' ? 'email@kamu.com' : 'https://...'" class="flex-1 min-w-0 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" />
          <button @click="form.socials.splice(i, 1)" type="button" class="text-red-400 hover:text-red-600 flex-shrink-0"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
        </div>
        <p v-if="!form.socials.length" class="text-sm text-slate-400 italic">Belum ada ikon sosial. Klik "Tambah".</p>
      </div>

      <!-- Verified Badge (Premium) -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-tabler-rosette-discount-check-filled" class="w-5 h-5 text-[#3358ff]" />
            <div>
              <h2 class="font-bold text-slate-900">Verified Badge</h2>
              <p class="text-sm text-slate-500 mt-0.5">Centang biru di sebelah nama kamu</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="tier !== 'premium'" class="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Premium</span>
            <button v-else @click="form.verified = !form.verified"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="form.verified ? 'bg-[#3358ff]' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="form.verified ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>
        <div v-if="tier !== 'premium'" class="mt-3 text-xs text-purple-700 bg-purple-50 rounded-xl p-3">Verified badge untuk <NuxtLink to="/member/upgrade" class="font-bold underline">member Premium</NuxtLink>.</div>
      </div>
    </div>

    <!-- ===== TAB: LINK ===== -->
    <div v-if="activeTab === 'links'" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-500">
          <span class="font-semibold text-slate-800">{{ form.links.length }}</span>
          <span v-if="tier === 'free'"> / 5 link</span><span v-else> link</span>
        </div>
        <button @click="showAddModal = true" :disabled="tier === 'free' && form.links.length >= 5"
          class="flex items-center gap-2 px-4 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition disabled:opacity-40 disabled:cursor-not-allowed">
          <UIcon name="i-tabler-plus" class="w-4 h-4" /> Tambah Link
        </button>
      </div>

      <div v-if="tier === 'free' && form.links.length >= 5" class="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <UIcon name="i-tabler-lock" class="w-5 h-5 flex-shrink-0" />
        <div>Batas 5 link untuk Free. <NuxtLink to="/member/upgrade" class="font-bold underline">Upgrade ke Pro</NuxtLink> untuk link tak terbatas.</div>
      </div>

      <div v-if="!form.links.length" class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
        <UIcon name="i-tabler-link-off" class="w-10 h-10 mx-auto mb-3" />
        <p class="font-medium">Belum ada link</p>
        <p class="text-sm mt-1">Klik "Tambah Link" untuk mulai</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="(link, idx) in form.links" :key="link.id"
          class="relative flex items-center gap-3 p-3 border rounded-xl transition-colors min-w-0 overflow-hidden"
          :class="link.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50/60'">
          <div v-if="link.featured && tier !== 'free'" class="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full" />
          <img v-if="link.image" :src="link.image" alt="" class="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-100" />
          <div v-else class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black"
            :style="{ background: getLinkMeta(link.type).color + '20', color: getLinkMeta(link.type).color }">
            <UIcon v-if="getLinkMeta(link.type).icon" :name="getLinkMeta(link.type).icon || ''" class="w-5 h-5" />
            <span v-else>{{ getLinkMeta(link.type).emoji }}</span>
          </div>
          <div class="flex-1 min-w-0 overflow-hidden">
            <div class="flex items-center gap-1.5 min-w-0" :class="!link.enabled && 'opacity-40'">
              <span class="font-semibold text-sm text-slate-900 truncate">{{ clip(link.label || getLinkMeta(link.type).label, 28) }}</span>
              <UIcon v-if="link.featured" name="i-tabler-star-filled" class="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            </div>
            <div class="text-xs text-slate-400 truncate">{{ link.type === 'gif' ? 'GIF Banner' : (link.url ? clip(link.url, 34) : 'Belum ada URL') }}</div>
          </div>
          <div class="flex items-center gap-0.5 flex-shrink-0">
            <button @click="moveUp(idx)" :disabled="idx === 0" title="Naik" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-20"><UIcon name="i-tabler-chevron-up" class="w-4 h-4" /></button>
            <button @click="moveDown(idx)" :disabled="idx === form.links.length - 1" title="Turun" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-20"><UIcon name="i-tabler-chevron-down" class="w-4 h-4" /></button>
            <button @click="editLink(idx)" title="Edit" class="p-1.5 rounded-lg text-slate-400 hover:text-[#3358ff] hover:bg-[#3358ff]/10 transition"><UIcon name="i-tabler-pencil" class="w-4 h-4" /></button>
            <button @click="link.enabled = !link.enabled" :title="link.enabled ? 'Sembunyikan' : 'Tampilkan'" class="p-1.5 rounded-lg transition" :class="link.enabled ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'"><UIcon :name="link.enabled ? 'i-tabler-eye' : 'i-tabler-eye-off'" class="w-4 h-4" /></button>
            <button @click="deleteLink(idx)" title="Hapus" class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><UIcon name="i-tabler-trash" class="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 flex gap-3">
        <UIcon name="i-tabler-info-circle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div class="min-w-0 break-words">Punya produk? Tombol <strong>Kunjungi Toko</strong> otomatis muncul di <span class="font-mono break-all">lakara.id/{{ store?.slug }}</span></div>
      </div>
    </div>

    <!-- ===== TAB: TAMPILAN ===== -->
    <div v-if="activeTab === 'tampilan'" class="space-y-5">

      <!-- Template -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div>
          <h2 class="font-bold text-slate-900">Template</h2>
          <p class="text-sm text-slate-500 mt-0.5">Pilih gaya siap pakai. Warna & wallpaper otomatis diatur.</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button v-for="t in templates" :key="t.key" @click="applyTemplate(t)"
            class="rounded-xl border-2 overflow-hidden text-left transition-all"
            :class="form.template === t.key ? 'border-[#3358ff] ring-2 ring-[#3358ff]/20' : 'border-slate-200 hover:border-slate-300'">
            <div class="h-16 flex flex-col items-center justify-center gap-1" :style="templatePreviewBg(t)">
              <span class="text-[11px] font-bold leading-none" :style="{ ...getFontStyle(t.font_family), color: t.title_color }">Aa</span>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-md" :style="templatePreviewBtn(t)">Link</span>
            </div>
            <div class="px-2.5 py-2 text-xs font-semibold text-slate-700">{{ t.label }}</div>
          </button>
        </div>
      </div>

      <!-- Wallpaper -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <h2 class="font-bold text-slate-900">Wallpaper</h2>
        <div class="grid grid-cols-4 gap-2">
          <button v-for="bt in bgTypes" :key="bt.key" @click="selectBgType(bt)"
            class="flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl transition-all relative"
            :class="form.bg_type === bt.key ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
            <UIcon :name="bt.icon" class="w-5 h-5 text-slate-600" />
            <span class="text-xs font-semibold text-slate-700">{{ bt.label }}</span>
            <span v-if="bt.premium && tier !== 'premium'" class="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-md leading-none">PRO+</span>
          </button>
        </div>

        <!-- Solid -->
        <div v-if="form.bg_type === 'solid'" class="flex items-center gap-3">
          <label class="w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow cursor-pointer" :style="{ background: form.bg_color }">
            <input type="color" v-model="form.bg_color" class="sr-only" />
          </label>
          <input v-model="form.bg_color" type="text" maxlength="7" class="w-28 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30" />
        </div>

        <!-- Gradient -->
        <div v-else-if="form.bg_type === 'gradient'" class="space-y-3">
          <div class="h-16 rounded-xl" :style="{ background: gradientCss }" />
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-xs text-slate-500">Dari</label>
              <label class="w-8 h-8 rounded-lg border-2 border-white shadow cursor-pointer" :style="{ background: form.gradient_from }"><input type="color" v-model="form.gradient_from" class="sr-only" /></label>
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs text-slate-500">Ke</label>
              <label class="w-8 h-8 rounded-lg border-2 border-white shadow cursor-pointer" :style="{ background: form.gradient_to }"><input type="color" v-model="form.gradient_to" class="sr-only" /></label>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <label class="text-xs text-slate-500 whitespace-nowrap">Arah {{ form.gradient_angle }}°</label>
            <input type="range" min="0" max="360" step="5" v-model.number="form.gradient_angle" class="flex-1 accent-[#3358ff]" />
          </div>
        </div>

        <!-- Image (Premium) -->
        <div v-else-if="form.bg_type === 'image'" class="space-y-3">
          <div v-if="form.bg_image" class="relative h-28 rounded-xl overflow-hidden">
            <img :src="form.bg_image" alt="" class="w-full h-full object-cover" />
            <button @click="form.bg_image = ''" class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">Hapus</button>
          </div>
          <label class="cursor-pointer inline-block">
            <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-white hover:opacity-90 transition" :class="bgUploading ? 'opacity-60 cursor-wait' : ''">
              <UIcon name="i-tabler-photo-up" class="w-3.5 h-3.5" /> Upload Foto
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="bgUploading" @change="uploadBgImage" />
          </label>
          <p v-if="bgError" class="text-xs text-red-500">{{ bgError }}</p>
          <p v-else class="text-xs text-slate-400">Foto maks 2 MB (auto-kompres).</p>
        </div>

        <!-- Video (Premium) -->
        <div v-else-if="form.bg_type === 'video'" class="space-y-3">
          <div v-if="form.bg_video" class="relative h-28 rounded-xl overflow-hidden bg-black">
            <video :src="form.bg_video" autoplay muted loop playsinline class="w-full h-full object-cover" />
            <button @click="form.bg_video = ''" class="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">Hapus</button>
          </div>
          <label class="cursor-pointer inline-block">
            <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90 transition" :class="bgUploading ? 'opacity-60 cursor-wait' : ''">
              <UIcon name="i-tabler-video" class="w-3.5 h-3.5" /> Upload Video
            </span>
            <input type="file" accept="video/mp4,video/webm" class="hidden" :disabled="bgUploading" @change="uploadBgVideo" />
          </label>
          <p v-if="bgError" class="text-xs text-red-500">{{ bgError }}</p>
          <p v-else class="text-xs text-slate-400">Video MP4/WebM maks 8 MB. Pakai klip pendek biar ringan.</p>
        </div>

        <span v-if="bgUploading" class="text-xs text-slate-400 flex items-center gap-1"><UIcon name="i-tabler-loader-2" class="w-3.5 h-3.5 animate-spin" /> Mengunggah...</span>
      </div>

      <!-- Card Style -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-900">Gaya Kartu Link</h2>
          <span v-if="tier === 'free'" class="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Pro</span>
        </div>
        <div :class="tier === 'free' && 'opacity-50 pointer-events-none'" class="grid grid-cols-4 gap-3">
          <button v-for="style in cardStyles" :key="style.key" @click="form.card_style = style.key"
            class="flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all text-center"
            :class="form.card_style === style.key ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
            <div class="w-full h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" :style="previewCardStyle(style.key)">Link</div>
            <span class="text-xs font-semibold text-slate-700">{{ style.label }}</span>
          </button>
        </div>
        <div v-if="tier === 'free'" class="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">Gaya kartu custom untuk <NuxtLink to="/member/upgrade" class="font-bold underline">member Pro</NuxtLink>.</div>
      </div>

      <!-- Radius -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-900">Sudut Tombol</h2>
          <span v-if="tier === 'free'" class="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Pro</span>
        </div>
        <div :class="tier === 'free' && 'opacity-50 pointer-events-none'" class="grid grid-cols-4 gap-3">
          <button v-for="r in radiusOptions" :key="r.key" @click="form.card_radius = r.key"
            class="flex flex-col items-center gap-1.5 p-2 border-2 rounded-xl transition-all"
            :class="form.card_radius === r.key ? 'border-[#3358ff] bg-[#3358ff]/5' : 'border-slate-200 hover:border-slate-300'">
            <div class="w-8 h-5 bg-[#3358ff]/30" :class="r.preview" />
            <span class="text-xs font-medium text-slate-600">{{ r.label }}</span>
          </button>
        </div>
      </div>

      <!-- Hide Branding -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-bold text-slate-900">Sembunyikan Branding</h2>
            <p class="text-sm text-slate-500 mt-0.5">Hapus tulisan "Buat link bio di Lakara"</p>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="tier !== 'premium'" class="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Premium</span>
            <button v-else @click="form.hide_branding = !form.hide_branding" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="form.hide_branding ? 'bg-[#3358ff]' : 'bg-slate-200'">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="form.hide_branding ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>
        <div v-if="tier !== 'premium'" class="mt-3 text-xs text-purple-700 bg-purple-50 rounded-xl p-3">Fitur untuk <NuxtLink to="/member/upgrade" class="font-bold underline">member Premium</NuxtLink>.</div>
      </div>

      <!-- Animasi Tombol (Premium) -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-900">Animasi Tombol</h2>
          <span v-if="tier !== 'premium'" class="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3.5 h-3.5" /> Premium</span>
        </div>
        <div :class="tier !== 'premium' && 'opacity-50 pointer-events-none'" class="grid grid-cols-3 sm:grid-cols-5 gap-2">
          <button v-for="a in buttonAnimations" :key="a.key" @click="form.button_animation = a.key"
            class="px-2 py-2.5 text-xs font-semibold rounded-xl border-2 transition-all"
            :class="form.button_animation === a.key ? 'border-[#3358ff] bg-[#3358ff]/5 text-[#3358ff]' : 'border-slate-200 text-slate-600 hover:border-slate-300'">
            {{ a.label }}
          </button>
        </div>
        <div v-if="tier !== 'premium'" class="text-xs text-purple-700 bg-purple-50 rounded-xl p-3">Animasi tombol untuk <NuxtLink to="/member/upgrade" class="font-bold underline">member Premium</NuxtLink>.</div>
      </div>

      <!-- Preview Share (OG image) -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-bold text-slate-900">Preview Saat Dibagikan</h2>
            <p class="text-sm text-slate-500 mt-0.5">Gambar yang muncul pas link kamu di-share ke WhatsApp / Instagram / Facebook.</p>
          </div>
          <UIcon name="i-tabler-share-2" class="w-5 h-5 text-slate-300 flex-shrink-0" />
        </div>

        <div v-if="form.og_image" class="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img :src="form.og_image" alt="Preview share" class="w-full aspect-[1200/630] object-cover" />
        </div>
        <div v-else class="rounded-xl border-2 border-dashed border-slate-200 aspect-[1200/630] flex flex-col items-center justify-center text-slate-400 gap-1.5">
          <UIcon name="i-tabler-photo-off" class="w-8 h-8" />
          <p class="text-xs">Belum ada. Klik tombol di bawah untuk buat.</p>
        </div>

        <button @click="regenerateOg" :disabled="ogBusy" type="button"
          class="w-full py-2.5 rounded-xl border border-[#3358ff]/30 bg-[#3358ff]/5 text-[#3358ff] text-sm font-semibold hover:bg-[#3358ff]/10 transition disabled:opacity-50 flex items-center justify-center gap-2">
          <UIcon :name="ogBusy ? 'i-tabler-loader-2' : 'i-tabler-refresh'" class="w-4 h-4" :class="ogBusy && 'animate-spin'" />
          {{ ogBusy ? 'Membuat preview...' : (form.og_image ? 'Buat Ulang Preview' : 'Buat Preview Share') }}
        </button>
        <p class="text-xs text-slate-400">Otomatis diperbarui tiap kamu simpan jika tampilan berubah. Tombol ini untuk paksa buat ulang sekarang.</p>
      </div>

      <!-- Tampilkan Produk -->
      <div class="bg-white border border-slate-100 rounded-2xl p-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-bold text-slate-900">Tampilkan Produk</h2>
            <p class="text-sm text-slate-500 mt-0.5">Pajang produk storefront-mu di halaman link bio</p>
          </div>
          <button @click="form.show_products = !form.show_products"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ml-4"
            :class="form.show_products ? 'bg-[#3358ff]' : 'bg-slate-200'">
            <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="form.show_products ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>
    </div>

    <!-- ===== TAB: ANALITIK ===== -->
    <div v-if="activeTab === 'analitik'" class="space-y-5">
      <div v-if="tier === 'free'" class="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
        <div class="w-14 h-14 bg-[#3358ff]/10 rounded-2xl flex items-center justify-center mx-auto"><UIcon name="i-tabler-chart-bar" class="w-7 h-7 text-[#3358ff]" /></div>
        <h3 class="font-bold text-slate-800">Analitik Klik</h3>
        <p class="text-sm text-slate-500">Lihat berapa kali setiap link diklik. Tersedia untuk Pro & Premium.</p>
        <NuxtLink to="/member/upgrade" class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3358ff] text-white text-sm font-semibold rounded-xl hover:bg-[#2244ee] transition"><UIcon name="i-tabler-arrow-up-circle" class="w-4 h-4" /> Upgrade Sekarang</NuxtLink>
      </div>
      <template v-else>
        <div v-if="analyticsLoading" class="text-center py-10 text-slate-400"><UIcon name="i-tabler-loader-2" class="w-8 h-8 animate-spin mx-auto mb-2" /> Memuat data...</div>
        <template v-else>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white border border-slate-100 rounded-2xl p-5 text-center"><div class="text-3xl font-extrabold text-[#3358ff]">{{ totalClicks }}</div><div class="text-sm text-slate-500 mt-1">Total Klik (30 hari)</div></div>
            <div class="bg-white border border-slate-100 rounded-2xl p-5 text-center"><div class="text-3xl font-extrabold text-slate-800">{{ analyticsData?.by_link?.length || 0 }}</div><div class="text-sm text-slate-500 mt-1">Link Aktif</div></div>
          </div>
          <div class="bg-white border border-slate-100 rounded-2xl p-5 space-y-3">
            <h3 class="font-bold text-slate-900">Klik per Link</h3>
            <div v-if="!analyticsData?.by_link?.length" class="text-sm text-slate-400 py-4 text-center">Belum ada data klik 30 hari terakhir.</div>
            <div v-for="item in sortedAnalytics" :key="item.link_id" class="space-y-1">
              <div class="flex items-center justify-between text-sm"><span class="font-medium text-slate-700 truncate flex-1 min-w-0">{{ getLabelForLinkId(item.link_id) }}</span><span class="font-bold text-slate-900 ml-3 flex-shrink-0">{{ item.total }}</span></div>
              <div class="h-2 bg-slate-100 rounded-full overflow-hidden"><div class="h-full bg-[#3358ff] rounded-full transition-all" :style="{ width: `${(item.total / (totalClicks || 1)) * 100}%` }" /></div>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- SAVE -->
    <div class="sticky bottom-24 lg:bottom-4 pt-2">
      <button @click="save" :disabled="saving" class="w-full py-3.5 bg-[#3358ff] text-white font-bold rounded-2xl hover:bg-[#2244ee] transition shadow-lg shadow-[#3358ff]/30 disabled:opacity-60 flex items-center justify-center gap-2">
        <UIcon v-if="saving" name="i-tabler-loader-2" class="w-5 h-5 animate-spin" /><UIcon v-else name="i-tabler-device-floppy" class="w-5 h-5" />
        {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </button>
    </div>

    <!-- MODAL: Pilih Tipe -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showAddModal = false">
          <div class="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h3 class="font-bold text-slate-900">Pilih Tipe Link</h3>
              <button @click="showAddModal = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-4 space-y-5 overflow-y-auto">
              <div v-for="cat in linkCategories" :key="cat.key">
                <div class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">{{ cat.label }}</div>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="lt in getLinksByCategory(cat.key)" :key="lt.type" @click="selectLinkType(lt.type)"
                    class="flex items-center gap-2.5 p-3 border border-slate-200 rounded-xl hover:border-[#3358ff]/40 hover:bg-[#3358ff]/5 transition text-left">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-black" :style="{ background: lt.color + '20', color: lt.color }">
                      <UIcon v-if="lt.icon" :name="lt.icon || ''" class="w-4 h-4" /><span v-else>{{ lt.emoji }}</span>
                    </div>
                    <span class="text-sm font-medium text-slate-700 leading-tight">{{ lt.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- MODAL: Edit Link -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="editingLink" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="editingLink = null">
          <div class="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
            <div class="border-b border-slate-100 px-5 py-4 flex items-center gap-3 flex-shrink-0">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0" :style="{ background: getLinkMeta(editingLink.type).color + '20', color: getLinkMeta(editingLink.type).color }">
                <UIcon v-if="getLinkMeta(editingLink.type).icon" :name="getLinkMeta(editingLink.type).icon || ''" class="w-5 h-5" /><span v-else>{{ getLinkMeta(editingLink.type).emoji }}</span>
              </div>
              <h3 class="font-bold text-slate-900 flex-1">Edit {{ getLinkMeta(editingLink.type).label }}</h3>
              <button @click="editingLink = null" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"><UIcon name="i-tabler-x" class="w-5 h-5" /></button>
            </div>
            <div class="p-5 space-y-4 overflow-y-auto">
              <div>
                <label class="text-sm font-medium text-slate-700 block mb-1.5">Label Tombol</label>
                <input v-model="editingLink.label" type="text" maxlength="50" :placeholder="getLinkMeta(editingLink.type).label" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3358ff]/30 focus:border-[#3358ff]" />
              </div>
              <div>
                <label class="text-sm font-medium text-slate-700 block mb-1.5">{{ editingLink.type === 'gif' ? 'URL GIF' : 'URL / Link' }}</label>
                <input v-model="editingLink.url" type="url" :placeholder="getLinkMeta(editingLink.type).placeholder"
                  :class="['w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition', urlError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-[#3358ff]/30 focus:border-[#3358ff]']" @input="urlError = ''" />
                <p v-if="urlError" class="text-xs text-red-500 mt-1.5 flex items-center gap-1"><UIcon name="i-tabler-alert-circle" class="w-3.5 h-3.5 flex-shrink-0" /> {{ urlError }}</p>
                <p v-else-if="editingLink.type === 'gif'" class="text-xs text-slate-400 mt-1.5">Paste URL dari Giphy/Tenor. GIF tampil sebagai banner atas halaman.</p>
              </div>

              <!-- Card Image -->
              <div v-if="editingLink.type !== 'gif' && editingLink.type !== 'youtube_video'" class="border-t border-slate-100 pt-4 space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-medium text-slate-700">Gambar Card <span class="text-xs text-slate-400 font-normal">(jadi latar penuh kartu)</span></label>
                  <span v-if="tier === 'free'" class="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-medium"><UIcon name="i-tabler-lock" class="w-3 h-3" /> Upload Pro</span>
                </div>
                <div v-if="editingLink.image" class="flex items-center gap-3">
                  <img :src="editingLink.image" alt="" class="w-14 h-14 rounded-xl object-cover border border-slate-200" />
                  <button type="button" @click="removeCardImage" class="text-xs font-semibold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">Hapus gambar</button>
                </div>
                <div>
                  <p class="text-xs text-slate-400 mb-1.5">Pilih dari stok:</p>
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="s in stockImages" :key="s.key" type="button" @click="pickStock(s.url)"
                      class="aspect-square rounded-lg overflow-hidden border-2 transition-all"
                      :class="editingLink.image === s.url ? 'border-[#3358ff] ring-2 ring-[#3358ff]/20' : 'border-slate-200 hover:border-slate-300'">
                      <img :src="s.url" :alt="s.label" class="w-full h-full object-cover" />
                    </button>
                  </div>
                </div>
                <div v-if="tier !== 'free'" class="flex flex-wrap items-center gap-2">
                  <label class="cursor-pointer">
                    <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 text-white hover:opacity-90 transition" :class="cardImgUploading ? 'opacity-60 cursor-wait' : ''"><UIcon name="i-tabler-upload" class="w-3.5 h-3.5" /> Upload gambar</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="cardImgUploading" @change="uploadCardImage" />
                  </label>
                  <label v-if="tier === 'premium'" class="cursor-pointer">
                    <span class="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-600 text-white hover:opacity-90 transition" :class="cardImgUploading ? 'opacity-60 cursor-wait' : ''"><UIcon name="i-tabler-gif" class="w-3.5 h-3.5" /> Upload GIF</span>
                    <input type="file" accept="image/gif" class="hidden" :disabled="cardImgUploading" @change="uploadCardGif" />
                  </label>
                  <span v-if="cardImgUploading" class="text-xs text-slate-400 flex items-center gap-1"><UIcon name="i-tabler-loader-2" class="w-3.5 h-3.5 animate-spin" /> Mengunggah...</span>
                </div>
                <div v-else class="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5">Upload gambar untuk <NuxtLink to="/member/upgrade" class="font-bold underline">Pro</NuxtLink>, GIF untuk <span class="font-bold">Premium</span>.</div>
                <p v-if="cardImgError" class="text-xs text-red-500">{{ cardImgError }}</p>
                <p v-else class="text-xs text-slate-400">Gambar statis maks 2 MB · GIF maks 5 MB (Premium).</p>
              </div>

              <!-- Featured -->
              <div v-if="tier !== 'free' && editingLink.type !== 'gif'" class="flex items-center justify-between border-t border-slate-100 pt-4">
                <div><div class="text-sm font-medium text-slate-700">Link Unggulan</div><div class="text-xs text-slate-400">Tampil lebih besar di halaman bio</div></div>
                <button @click="editingLink.featured = !editingLink.featured" class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="editingLink.featured ? 'bg-yellow-400' : 'bg-slate-200'">
                  <span class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform" :class="editingLink.featured ? 'translate-x-6' : 'translate-x-1'" />
                </button>
              </div>
            </div>
            <div class="px-5 pb-5 pt-2 flex gap-2 flex-shrink-0 border-t border-slate-100">
              <button @click="editingLink = null" class="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">Batal</button>
              <button @click="saveEditLink" class="flex-1 py-2.5 text-sm font-semibold text-white bg-[#3358ff] rounded-xl hover:bg-[#2244ee] transition">Simpan</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast" class="fixed bottom-28 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <UIcon :name="toastType === 'error' ? 'i-tabler-x' : 'i-tabler-check'" class="w-4 h-4" /> {{ toast }}
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'member' })

const { storeData } = useMember()
const store = computed(() => storeData.value)
const tier  = computed(() => store.value?.product_tier || 'free')
const { compress } = useImageCompress()

const tierLabel = computed(() => ({ free: 'Free', pro: 'Pro', premium: 'Premium' }[tier.value] || 'Free'))
const tierBadgeClass = computed(() => ({ free: 'bg-slate-100 text-slate-500', pro: 'bg-[#3358ff]/10 text-[#3358ff]', premium: 'bg-purple-100 text-purple-700' }[tier.value] || 'bg-slate-100 text-slate-500'))

const tabs = [
  { key: 'links',    label: 'Link'     },
  { key: 'tampilan', label: 'Tampilan' },
  { key: 'profil',   label: 'Profil'   },
  { key: 'analitik', label: 'Analitik' },
]
const activeTab = ref<string>('links')

// Templates
const templates = [
  { key: 'gaming',    label: 'Esports / Gaming', font_family: 'oswald',       bg_type: 'gradient', gradient_from: '#0f0524', gradient_to: '#3a0a5e', gradient_angle: 135, bg_color: '#0f0524', title_color: '#ffffff', bio_color: '#cbb6e6', button_color: '#a855f7', button_text_color: '#ffffff', card_style: 'ghost',   card_radius: 'lg'   },
  { key: 'minimal',   label: 'Minimal Mono',     font_family: 'dmsans',       bg_type: 'solid',    gradient_from: '#fafafa', gradient_to: '#e5e5e5', gradient_angle: 135, bg_color: '#fafafa', title_color: '#111111', bio_color: '#555555', button_color: '#111111', button_text_color: '#ffffff', card_style: 'outline', card_radius: 'md'   },
  { key: 'gradient',  label: 'Bold Gradient',    font_family: 'poppins',      bg_type: 'gradient', gradient_from: '#ff3366', gradient_to: '#7c3aed', gradient_angle: 135, bg_color: '#1a1a2e', title_color: '#ffffff', bio_color: '#ffe0ec', button_color: '#ffffff', button_text_color: '#1a1a2e', card_style: 'filled',  card_radius: 'full' },
  { key: 'pastel',    label: 'Soft Pastel',      font_family: 'quicksand',    bg_type: 'gradient', gradient_from: '#fbc2eb', gradient_to: '#a6c1ee', gradient_angle: 135, bg_color: '#fdf2f8', title_color: '#831843', bio_color: '#9d174d', button_color: '#ec4899', button_text_color: '#ffffff', card_style: 'filled',  card_radius: 'lg'   },
  { key: 'neon',      label: 'Dark Neon',        font_family: 'spacegrotesk', bg_type: 'solid',    gradient_from: '#0d1117', gradient_to: '#161b22', gradient_angle: 135, bg_color: '#0d1117', title_color: '#e6edf3', bio_color: '#8b949e', button_color: '#00ffa3', button_text_color: '#0d1117', card_style: 'ghost',   card_radius: 'md'   },
  { key: 'business',  label: 'Clean Business',   font_family: 'inter',        bg_type: 'solid',    gradient_from: '#ffffff', gradient_to: '#f1f5f9', gradient_angle: 135, bg_color: '#ffffff', title_color: '#1e293b', bio_color: '#64748b', button_color: '#3358ff', button_text_color: '#ffffff', card_style: 'filled',  card_radius: 'md'   },
  { key: 'sunset',    label: 'Sunset',           font_family: 'fredoka',      bg_type: 'gradient', gradient_from: '#ff6a3d', gradient_to: '#f9486a', gradient_angle: 160, bg_color: '#ff6a3d', title_color: '#ffffff', bio_color: '#ffe8d6', button_color: '#ffffff', button_text_color: '#c2410c', card_style: 'filled',  card_radius: 'lg'   },
  { key: 'ocean',     label: 'Ocean',            font_family: 'nunito',       bg_type: 'gradient', gradient_from: '#1fa2ff', gradient_to: '#12d8fa', gradient_angle: 135, bg_color: '#1fa2ff', title_color: '#ffffff', bio_color: '#e0f7ff', button_color: '#ffffff', button_text_color: '#0369a1', card_style: 'filled',  card_radius: 'lg'   },
  { key: 'midnight',  label: 'Midnight',         font_family: 'montserrat',   bg_type: 'gradient', gradient_from: '#0f2027', gradient_to: '#2c5364', gradient_angle: 160, bg_color: '#0f2027', title_color: '#ffffff', bio_color: '#a7c0cd', button_color: '#38bdf8', button_text_color: '#04222e', card_style: 'ghost',   card_radius: 'md'   },
  { key: 'vaporwave', label: 'Vaporwave',        font_family: 'righteous',    bg_type: 'gradient', gradient_from: '#f857a6', gradient_to: '#5f72ff', gradient_angle: 135, bg_color: '#5f72ff', title_color: '#ffffff', bio_color: '#ffe0f5', button_color: '#22d3ee', button_text_color: '#3b0764', card_style: 'filled',  card_radius: 'full' },
  { key: 'forest',    label: 'Forest',           font_family: 'josefin',      bg_type: 'gradient', gradient_from: '#0b3d2e', gradient_to: '#1f8a5b', gradient_angle: 135, bg_color: '#0b3d2e', title_color: '#ffffff', bio_color: '#bbf7d0', button_color: '#7CFFB2', button_text_color: '#06281b', card_style: 'ghost',   card_radius: 'lg'   },
  { key: 'elegant',   label: 'Elegant Serif',    font_family: 'playfair',     bg_type: 'gradient', gradient_from: '#1a1410', gradient_to: '#3d2c1e', gradient_angle: 160, bg_color: '#1a1410', title_color: '#f5e9d6', bio_color: '#cbb89a', button_color: '#d4af37', button_text_color: '#1a1410', card_style: 'outline', card_radius: 'sm'   },
  { key: 'candy',     label: 'Candy Pop',        font_family: 'pacifico',     bg_type: 'gradient', gradient_from: '#ff9a9e', gradient_to: '#fecfef', gradient_angle: 135, bg_color: '#ffe0ec', title_color: '#9d174d', bio_color: '#be185d', button_color: '#ec4899', button_text_color: '#ffffff', card_style: 'filled',  card_radius: 'full' },
]

function templatePreviewBg(t: any) {
  if (t.bg_type === 'gradient') return { background: `linear-gradient(${t.gradient_angle}deg, ${t.gradient_from}, ${t.gradient_to})` }
  return { background: t.bg_color }
}
function templatePreviewBtn(t: any) {
  if (t.card_style === 'outline') return { color: t.button_color, border: '2px solid ' + t.button_color }
  if (t.card_style === 'ghost')   return { color: t.title_color, background: 'rgba(255,255,255,0.15)' }
  return { background: t.button_color, color: t.button_text_color }
}

function applyTemplate(t: any) {
  form.bg_type = t.bg_type
  form.bg_color = t.bg_color
  form.gradient_from = t.gradient_from
  form.gradient_to = t.gradient_to
  form.gradient_angle = t.gradient_angle
  form.title_color = t.title_color
  form.bio_color = t.bio_color
  form.text_color = t.bio_color
  form.button_color = t.button_color
  form.button_text_color = t.button_text_color
  form.accent_color = t.button_color
  if (tier.value !== 'free') {
    form.card_style = t.card_style
    form.card_radius = t.card_radius
    if (t.font_family) form.font_family = t.font_family
  }
  form.template = t.key
  showToast(tier.value === 'free' ? `Template ${t.label} diterapkan` : `Template ${t.label} diterapkan (warna + font + gaya)`)
}

// Wallpaper bg types
const bgTypes = [
  { key: 'solid',    label: 'Solid',    icon: 'i-tabler-square-rounded',  premium: false },
  { key: 'gradient', label: 'Gradient', icon: 'i-tabler-color-swatch',    premium: false },
  { key: 'image',    label: 'Foto',     icon: 'i-tabler-photo',           premium: true  },
  { key: 'video',    label: 'Video',    icon: 'i-tabler-movie',           premium: true  },
]
const gradientCss = computed(() => `linear-gradient(${form.gradient_angle}deg, ${form.gradient_from}, ${form.gradient_to})`)

function selectBgType(bt: any) {
  if (bt.premium && tier.value !== 'premium') {
    showToast('Foto & video wallpaper khusus Premium', 'error')
    return
  }
  form.bg_type = bt.key
}

// Stock images
const stockImages = [
  { key: 'gaming-neon',  url: '/stock/gaming-neon.svg',  label: 'Gaming' },
  { key: 'sunset',       url: '/stock/sunset.svg',       label: 'Sunset' },
  { key: 'ocean',        url: '/stock/ocean.svg',        label: 'Ocean'  },
  { key: 'dark-minimal', url: '/stock/dark-minimal.svg', label: 'Dark'   },
  { key: 'pastel',       url: '/stock/pastel.svg',       label: 'Pastel' },
  { key: 'mesh',         url: '/stock/mesh.svg',         label: 'Mesh'   },
  { key: 'mono-light',   url: '/stock/mono-light.svg',   label: 'Mono'   },
  { key: 'forest',       url: '/stock/forest.svg',       label: 'Forest' },
]

const cardStyles = [
  { key: 'default', label: 'Default' }, { key: 'filled', label: 'Solid' },
  { key: 'outline', label: 'Outline' }, { key: 'ghost', label: 'Ghost' },
]
const radiusOptions = [
  { key: 'sm', label: 'Kecil', preview: 'rounded-sm' }, { key: 'md', label: 'Normal', preview: 'rounded-xl' },
  { key: 'lg', label: 'Besar', preview: 'rounded-2xl' }, { key: 'full', label: 'Penuh', preview: 'rounded-full' },
]
function previewCardStyle(style: string) {
  const btn = form.button_color || '#3358ff'
  if (style === 'filled')  return { background: btn, color: form.button_text_color || '#fff' }
  if (style === 'outline') return { background: 'transparent', color: btn, border: `2px solid ${btn}` }
  if (style === 'ghost')   return { background: 'rgba(120,120,120,0.15)', color: '#333', border: '1.5px solid rgba(0,0,0,0.1)' }
  return { background: '#ffffff', color: '#111', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
}

const colorFields = [
  { key: 'title_color'       as const, label: 'Judul'       },
  { key: 'bio_color'         as const, label: 'Teks / Bio'  },
  { key: 'button_color'      as const, label: 'Tombol'      },
  { key: 'button_text_color' as const, label: 'Teks Tombol' },
  { key: 'accent_color'      as const, label: 'Aksen Avatar' },
]

const LINK_TYPES = [
  { type: 'instagram',  label: 'Instagram',    icon: 'i-tabler-brand-instagram', emoji: 'IG', color: '#E1306C', placeholder: 'https://instagram.com/username',     category: 'social'      },
  { type: 'tiktok',     label: 'TikTok',        icon: 'i-tabler-brand-tiktok',    emoji: 'TT', color: '#010101', placeholder: 'https://tiktok.com/@username',       category: 'social'      },
  { type: 'facebook',   label: 'Facebook',      icon: 'i-tabler-brand-facebook',  emoji: 'FB', color: '#1877F2', placeholder: 'https://facebook.com/username',      category: 'social'      },
  { type: 'youtube',    label: 'YouTube',       icon: 'i-tabler-brand-youtube',   emoji: 'YT', color: '#FF0000', placeholder: 'https://youtube.com/@channel',       category: 'social'      },
  { type: 'twitter',    label: 'Twitter / X',   icon: 'i-tabler-brand-x',         emoji: 'X',  color: '#000000', placeholder: 'https://x.com/username',             category: 'social'      },
  { type: 'whatsapp',   label: 'WhatsApp',      icon: 'i-tabler-brand-whatsapp',  emoji: 'WA', color: '#25D366', placeholder: 'https://wa.me/628xxxxxxxxxx',        category: 'social'      },
  { type: 'telegram',   label: 'Telegram',      icon: 'i-tabler-brand-telegram',  emoji: 'TG', color: '#229ED9', placeholder: 'https://t.me/username',              category: 'social'      },
  { type: 'threads',    label: 'Threads',       icon: null,                       emoji: '⊛',  color: '#000000', placeholder: 'https://threads.net/@username',      category: 'social'      },
  { type: 'line',       label: 'Line',          icon: null,                       emoji: 'L',  color: '#00C300', placeholder: 'https://line.me/ti/p/~username',     category: 'social'      },
  { type: 'shopee',     label: 'Shopee',        icon: null,                       emoji: 'SP', color: '#EE4D2D', placeholder: 'https://shopee.co.id/username',      category: 'marketplace' },
  { type: 'tokopedia',  label: 'Tokopedia',     icon: null,                       emoji: 'TP', color: '#03AC0E', placeholder: 'https://tokopedia.com/username',     category: 'marketplace' },
  { type: 'lazada',     label: 'Lazada',        icon: null,                       emoji: 'LZ', color: '#0F146D', placeholder: 'https://lazada.co.id/shop/...',      category: 'marketplace' },
  { type: 'tiktokshop', label: 'TikTok Shop',   icon: 'i-tabler-brand-tiktok',    emoji: 'TS', color: '#EE1D52', placeholder: 'https://tiktok.com/@username/shop',  category: 'marketplace' },
  { type: 'blibli',     label: 'Blibli',        icon: null,                       emoji: 'BB', color: '#0095DA', placeholder: 'https://blibli.com/merchant/...',    category: 'marketplace' },
  { type: 'saweria',    label: 'Saweria',       icon: null,                       emoji: '🎁', color: '#FF6B1B', placeholder: 'https://saweria.co/username',        category: 'donate'      },
  { type: 'trakteer',   label: 'Trakteer',      icon: null,                       emoji: '☕', color: '#E5163B', placeholder: 'https://trakteer.id/username',       category: 'donate'      },
  { type: 'karyakarsa', label: 'Karyakarsa',    icon: null,                       emoji: '💡', color: '#FF6900', placeholder: 'https://karyakarsa.com/username',    category: 'donate'      },
  { type: 'kofi',       label: 'Ko-fi',         icon: null,                       emoji: '☕', color: '#29ABE0', placeholder: 'https://ko-fi.com/username',         category: 'donate'      },
  { type: 'gif',           label: 'GIF Banner',    icon: 'i-tabler-gif',          emoji: 'GIF', color: '#6366F1', placeholder: 'https://media.giphy.com/media/...', category: 'special' },
  { type: 'youtube_video', label: 'Video YouTube', icon: 'i-tabler-brand-youtube', emoji: 'YT', color: '#FF0000', placeholder: 'https://youtube.com/watch?v=...',  category: 'special' },
  { type: 'custom',        label: 'Custom Link',   icon: 'i-tabler-link',         emoji: '🔗', color: '#64748B', placeholder: 'https://...',                       category: 'special' },
]
const linkCategories = [
  { key: 'social', label: 'Media Sosial' }, { key: 'marketplace', label: 'Marketplace' },
  { key: 'donate', label: 'Donasi & Support' }, { key: 'special', label: 'Lainnya' },
]
const getLinkMeta = (type: string) => LINK_TYPES.find(l => l.type === type) ?? LINK_TYPES[LINK_TYPES.length - 1]
const getLinksByCategory = (cat: string) => LINK_TYPES.filter(l => l.category === cat)

// Form
const form = reactive({
  title: '', bio: '',
  bg_type: 'solid', bg_color: '#ffffff',
  gradient_from: '#3358ff', gradient_to: '#7c3aed', gradient_angle: 135,
  bg_image: '', bg_video: '',
  text_color: '#111111', accent_color: '#3358ff',
  title_color: '#111111', bio_color: '#111111',
  button_color: '#3358ff', button_text_color: '#ffffff',
  template: 'none',
  card_style: 'default', card_bg_color: '', card_radius: 'md',
  hide_branding: false,
  verified: false, show_products: false, button_animation: 'none',
  show_name: true, show_bio: true, font_family: 'default', social_style: 'outline',
  socials: [] as { type: string; url: string }[],
  links: [] as any[],
  og_image: '', og_sig: '',
})

const buttonAnimations = [
  { key: 'none',   label: 'Tidak ada' },
  { key: 'pulse',  label: 'Pulse'     },
  { key: 'bounce', label: 'Bounce'    },
  { key: 'shake',  label: 'Shake'     },
  { key: 'glow',   label: 'Glow'      },
]

const FONT_MAP: Record<string, string> = {
  'default':       'inherit',
  'inter':         '"Inter", sans-serif',
  'poppins':       '"Poppins", sans-serif',
  'montserrat':    '"Montserrat", sans-serif',
  'raleway':       '"Raleway", sans-serif',
  'nunito':        '"Nunito", sans-serif',
  'quicksand':     '"Quicksand", sans-serif',
  'dmsans':        '"DM Sans", sans-serif',
  'spacegrotesk':  '"Space Grotesk", sans-serif',
  'josefin':       '"Josefin Sans", sans-serif',
  'ubuntu':        '"Ubuntu", sans-serif',
  'lato':          '"Lato", sans-serif',
  'roboto':        '"Roboto", sans-serif',
  'exo2':          '"Exo 2", sans-serif',
  'oswald':        '"Oswald", sans-serif',
  'righteous':     '"Righteous", sans-serif',
  'bebasneue':     '"Bebas Neue", cursive',
  'fredoka':       '"Fredoka One", cursive',
  'playfair':      '"Playfair Display", serif',
  'merriweather':  '"Merriweather", serif',
  'cinzel':        '"Cinzel", serif',
  'dancingscript': '"Dancing Script", cursive',
  'lobster':       '"Lobster", cursive',
  'pacifico':      '"Pacifico", cursive',
  'caveat':        '"Caveat", cursive',
}

const fontOptions = [
  { key: 'default',       label: 'Default' },
  { key: 'inter',         label: 'Inter' },
  { key: 'poppins',       label: 'Poppins' },
  { key: 'montserrat',    label: 'Montserrat' },
  { key: 'raleway',       label: 'Raleway' },
  { key: 'nunito',        label: 'Nunito' },
  { key: 'quicksand',     label: 'Quicksand' },
  { key: 'dmsans',        label: 'DM Sans' },
  { key: 'spacegrotesk',  label: 'Space Grotesk' },
  { key: 'josefin',       label: 'Josefin Sans' },
  { key: 'ubuntu',        label: 'Ubuntu' },
  { key: 'lato',          label: 'Lato' },
  { key: 'roboto',        label: 'Roboto' },
  { key: 'exo2',          label: 'Exo 2' },
  { key: 'oswald',        label: 'Oswald' },
  { key: 'righteous',     label: 'Righteous' },
  { key: 'bebasneue',     label: 'Bebas Neue' },
  { key: 'fredoka',       label: 'Fredoka One' },
  { key: 'playfair',      label: 'Playfair Display' },
  { key: 'merriweather',  label: 'Merriweather' },
  { key: 'cinzel',        label: 'Cinzel' },
  { key: 'dancingscript', label: 'Dancing Script' },
  { key: 'lobster',       label: 'Lobster' },
  { key: 'pacifico',      label: 'Pacifico' },
  { key: 'caveat',        label: 'Caveat' },
]

const selectedFontStyle = computed(() => ({ fontFamily: FONT_MAP[form.font_family] || 'inherit' }))
function getFontStyle(key: string) { return { fontFamily: FONT_MAP[key] || 'inherit' } }

useHead({
  link: [{
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&family=Montserrat:wght@400;600;700&family=Raleway:wght@400;600;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;600;700&family=DM+Sans:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&family=Josefin+Sans:wght@400;600;700&family=Ubuntu:wght@400;700&family=Lato:wght@400;700&family=Roboto:wght@400;700&family=Exo+2:wght@400;600;700&family=Oswald:wght@400;600;700&family=Righteous&family=Bebas+Neue&family=Fredoka+One&family=Playfair+Display:wght@400;600;700&family=Merriweather:wght@400;700&family=Cinzel:wght@400;600;700&family=Dancing+Script:wght@400;600;700&family=Lobster&family=Pacifico&family=Caveat:wght@400;600;700&display=swap',
  }],
})

const socialPlatforms = [
  { key: 'instagram', label: 'Instagram' }, { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' }, { key: 'twitter', label: 'Twitter / X' },
  { key: 'facebook', label: 'Facebook' }, { key: 'twitch', label: 'Twitch' },
  { key: 'discord', label: 'Discord' }, { key: 'telegram', label: 'Telegram' },
  { key: 'whatsapp', label: 'WhatsApp' }, { key: 'threads', label: 'Threads' },
  { key: 'linkedin', label: 'LinkedIn' }, { key: 'snapchat', label: 'Snapchat' },
  { key: 'pinterest', label: 'Pinterest' }, { key: 'spotify', label: 'Spotify' },
  { key: 'soundcloud', label: 'SoundCloud' }, { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' }, { key: 'github', label: 'GitHub' },
]
function addSocial() { if (form.socials.length < 12) form.socials.push({ type: 'instagram', url: '' }) }

const saving = ref(false)
const showAddModal = ref(false)
const editingLink = ref<any>(null)
const editingIdx = ref(-1)
const urlError = ref('')
const toast = ref('')
const toastType = ref<'success' | 'error'>('success')
const cardImgUploading = ref(false)
const cardImgError = ref('')
const bgUploading = ref(false)
const bgError = ref('')

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = msg; toastType.value = type
  setTimeout(() => { toast.value = '' }, 3000)
}

const { data: res } = await useFetch<{ ok: boolean; data: any }>('/api/member/links')

onMounted(() => {
  const d = res.value?.data
  if (d) {
    form.title = d.title ?? store.value?.name ?? ''
    form.bio = d.bio ?? ''
    form.bg_type = d.bg_type ?? 'solid'
    form.bg_color = d.bg_color ?? '#ffffff'
    form.gradient_from = d.gradient_from ?? '#3358ff'
    form.gradient_to = d.gradient_to ?? '#7c3aed'
    form.gradient_angle = d.gradient_angle ?? 135
    form.bg_image = d.bg_image ?? ''
    form.bg_video = d.bg_video ?? ''
    form.text_color = d.text_color ?? '#111111'
    form.accent_color = d.accent_color ?? store.value?.primary_color ?? '#3358ff'
    form.title_color = d.title_color ?? d.text_color ?? '#111111'
    form.bio_color = d.bio_color ?? d.text_color ?? '#111111'
    form.button_color = d.button_color ?? d.accent_color ?? '#3358ff'
    form.button_text_color = d.button_text_color ?? '#ffffff'
    form.template = d.template ?? 'none'
    form.card_style = d.card_style ?? 'default'
    form.card_bg_color = d.card_bg_color ?? ''
    form.card_radius = d.card_radius ?? 'md'
    form.hide_branding = d.hide_branding ?? false
    form.verified = d.verified ?? false
    form.show_products = d.show_products ?? false
    form.button_animation = d.button_animation ?? 'none'
    form.show_name = d.show_name !== false
    form.show_bio = d.show_bio !== false
    form.font_family = d.font_family ?? 'default'
    form.social_style = d.social_style ?? 'outline'
    form.socials = Array.isArray(d.socials) ? d.socials.map((s: any) => ({ type: s.type || 'instagram', url: s.url || '' })) : []
    form.links = (d.links ?? []).map((l: any) => ({ image: '', ...l }))
    form.og_image = d.og_image ?? ''
    form.og_sig = d.og_sig ?? ''
  } else if (store.value) {
    form.title = store.value.name
    form.accent_color = store.value.primary_color || '#3358ff'
    form.button_color = store.value.primary_color || '#3358ff'
  }
})

// Analytics
const analyticsLoading = ref(false)
const analyticsData = ref<any>(null)
const totalClicks = computed(() => (analyticsData.value?.by_link || []).reduce((s: number, r: any) => s + r.total, 0))
const sortedAnalytics = computed(() => [...(analyticsData.value?.by_link || [])].sort((a, b) => b.total - a.total))
function getLabelForLinkId(linkId: string) {
  const link = form.links.find(l => l.id === linkId)
  if (link) return link.label || getLinkMeta(link.type).label
  return linkId.slice(0, 8) + '...'
}

// Potong teks panjang secara fisik agar tidak pernah memanjang di preview
function clip(s: string, n = 34): string {
  const str = (s || '').toString()
  return str.length > n ? str.slice(0, n) + '…' : str
}
watch(activeTab, async (tab) => {
  if (tab === 'analitik' && tier.value !== 'free' && !analyticsData.value) {
    analyticsLoading.value = true
    try { analyticsData.value = await $fetch('/api/member/analytics') } catch { /* ignore */ }
    analyticsLoading.value = false
  }
})

// Wallpaper upload
async function uploadBgImage(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  bgError.value = ''; bgUploading.value = true
  try {
    const file = await compress(raw, 2048, 1600)
    const fd = new FormData(); fd.append('file', file)
    const r = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    form.bg_image = r.url
  } catch (err: any) {
    bgError.value = err?.data?.statusMessage || err?.message || 'Upload gagal.'
  } finally { bgUploading.value = false; input.value = '' }
}
async function uploadBgVideo(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw) return
  bgError.value = ''
  if (raw.size > 8 * 1024 * 1024) { bgError.value = 'Video melebihi 8 MB.'; input.value = ''; return }
  bgUploading.value = true
  try {
    const fd = new FormData(); fd.append('file', raw)
    const r = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    form.bg_video = r.url
  } catch (err: any) {
    bgError.value = err?.data?.statusMessage || err?.message || 'Upload video gagal.'
  } finally { bgUploading.value = false; input.value = '' }
}

// Card image
function pickStock(url: string) { if (editingLink.value) { editingLink.value.image = url; cardImgError.value = '' } }
function removeCardImage() { if (editingLink.value) editingLink.value.image = '' }
async function uploadCardImage(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw || !editingLink.value) return
  cardImgError.value = ''; cardImgUploading.value = true
  try {
    const file = await compress(raw, 2048, 800)
    const fd = new FormData(); fd.append('file', file)
    const r = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    editingLink.value.image = r.url
  } catch (err: any) {
    cardImgError.value = err?.data?.statusMessage || err?.message || 'Upload gagal.'
  } finally { cardImgUploading.value = false; input.value = '' }
}
async function uploadCardGif(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = input.files?.[0]
  if (!raw || !editingLink.value) return
  cardImgError.value = ''
  if (raw.size > 5 * 1024 * 1024) { cardImgError.value = 'GIF melebihi 5 MB.'; input.value = ''; return }
  cardImgUploading.value = true
  try {
    const fd = new FormData(); fd.append('file', raw)
    const r = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    editingLink.value.image = r.url
  } catch (err: any) {
    cardImgError.value = err?.data?.statusMessage || err?.message || 'Upload GIF gagal.'
  } finally { cardImgUploading.value = false; input.value = '' }
}

// Link actions
function selectLinkType(type: string) {
  showAddModal.value = false; editingIdx.value = -1; urlError.value = ''; cardImgError.value = ''
  editingLink.value = { id: crypto.randomUUID(), type, label: getLinkMeta(type).label, url: '', image: '', enabled: true, featured: false }
}
function editLink(idx: number) {
  editingIdx.value = idx; urlError.value = ''; cardImgError.value = ''
  editingLink.value = { image: '', ...form.links[idx] }
}
function saveEditLink() {
  if (!editingLink.value) return
  urlError.value = ''
  const url = editingLink.value.url?.trim()
  if (url && editingLink.value.type !== 'gif') {
    const dup = form.links.find((l: any, i: number) => l.url?.trim() === url && i !== editingIdx.value)
    if (dup) { urlError.value = `URL ini sudah dipakai "${dup.label || dup.type}"`; return }
  }
  if (editingIdx.value === -1) form.links.push({ ...editingLink.value })
  else form.links[editingIdx.value] = { ...editingLink.value }
  editingLink.value = null
}
function deleteLink(idx: number) { form.links.splice(idx, 1) }
function moveUp(idx: number) { if (idx === 0) return; [form.links[idx - 1], form.links[idx]] = [form.links[idx], form.links[idx - 1]] }
function moveDown(idx: number) { if (idx === form.links.length - 1) return; [form.links[idx], form.links[idx + 1]] = [form.links[idx + 1], form.links[idx]] }

// ── OG image dinamis: gambar kartu share 1200x630 di browser, lalu upload ──
function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

// Tanda tangan: regenerate hanya kalau salah satu elemen visual berubah
const ogSignature = computed(() => [
  store.value?.name, store.value?.slug, store.value?.logo,
  form.title, form.bio, form.bg_type, form.bg_color,
  form.gradient_from, form.gradient_to, form.gradient_angle,
  form.title_color, form.bio_color, form.button_color,
].join('|'))

async function generateOgImage(): Promise<string | null> {
  try {
    const W = 1200, H = 630
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // ── Helpers warna ──
    const hexToRgb = (hex: string) => {
      let h = (hex || '').replace('#', '')
      if (h.length === 3) h = h.split('').map(c => c + c).join('')
      const n = parseInt(h || '333333', 16)
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    }
    const lum = (hex: string) => { const { r, g, b } = hexToRgb(hex); return (0.2126 * r + 0.7152 * g + 0.114 * b) / 255 }
    const darken = (hex: string, amt: number) => {
      const { r, g, b } = hexToRgb(hex)
      const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * (1 - amt))))
      return `rgb(${f(r)},${f(g)},${f(b)})`
    }

    // Warna dasar untuk background kartu (selalu brand, walau wallpaper foto/video)
    const c1 = (form.bg_type === 'solid' ? form.bg_color : form.gradient_from) || form.button_color || '#3358ff'
    const c2 = (form.bg_type === 'solid' ? darken(form.bg_color || '#3358ff', 0.25) : form.gradient_to) || '#7c3aed'

    // Background gradient diagonal
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, c1); g.addColorStop(1, c2)
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // Kontras teks berdasar terang/gelap background
    const bgLum = (lum(c1) + lum(c2)) / 2
    const dark = bgLum > 0.6
    const textMain = dark ? '#111418' : '#ffffff'
    const textSub = dark ? 'rgba(20,24,30,0.7)' : 'rgba(255,255,255,0.85)'

    // Glow accents halus
    ctx.globalAlpha = dark ? 0.10 : 0.14; ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(W - 80, -40, 260, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(-60, H + 40, 240, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1

    // ── Komposisi tengah ──
    const cx = W / 2
    const logoUrl = store.value?.logo
    const img = logoUrl ? await loadImg(logoUrl.startsWith('http') ? logoUrl : (location.origin + logoUrl)) : null
    const r = 110, ay = 210

    // Avatar bulat (ring putih + shadow)
    ctx.save()
    ctx.beginPath(); ctx.arc(cx, ay, r, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'; ctx.shadowColor = 'rgba(0,0,0,0.30)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 8; ctx.fill()
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    ctx.beginPath(); ctx.arc(cx, ay, r - 8, 0, Math.PI * 2); ctx.clip()
    if (img) {
      // cover crop (jaga rasio)
      const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height
      const side = Math.min(iw, ih), sx = (iw - side) / 2, sy = (ih - side) / 2
      ctx.drawImage(img, sx, sy, side, side, cx - (r - 8), ay - (r - 8), (r - 8) * 2, (r - 8) * 2)
    } else {
      ctx.fillStyle = form.button_color || '#3358ff'; ctx.fillRect(cx - r, ay - r, r * 2, r * 2)
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 110px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText((store.value?.name?.[0] || 'L').toUpperCase(), cx, ay + 6)
    }
    ctx.restore()

    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'

    // Nama
    const name = (form.title || store.value?.name || '').slice(0, 28)
    ctx.fillStyle = textMain
    ctx.font = 'bold 68px Inter, system-ui, sans-serif'
    ctx.fillText(name, cx, ay + r + 90)

    // Tagline (1 baris, auto potong)
    const tagline = (form.bio || store.value?.tagline || '').trim()
    if (tagline) {
      ctx.fillStyle = textSub
      ctx.font = '34px Inter, system-ui, sans-serif'
      let t = tagline
      while (ctx.measureText(t).width > W - 200 && t.length > 4) t = t.slice(0, -2)
      ctx.fillText(t + (t.length < tagline.length ? '…' : ''), cx, ay + r + 150)
    }

    // URL pill
    const url = 'lakara.id/' + (store.value?.slug || '')
    ctx.font = 'bold 32px Inter, system-ui, sans-serif'
    const pw = ctx.measureText(url).width + 64, ph = 64, py = H - 110
    ctx.fillStyle = dark ? 'rgba(17,20,24,0.08)' : 'rgba(255,255,255,0.18)'
    const rx = cx - pw / 2
    ctx.beginPath()
    ctx.roundRect ? ctx.roundRect(rx, py, pw, ph, 32) : ctx.rect(rx, py, pw, ph)
    ctx.fill()
    ctx.fillStyle = textMain
    ctx.textBaseline = 'middle'
    ctx.fillText(url, cx, py + ph / 2 + 2)

    const blob: Blob | null = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.85))
    if (!blob) return null
    const file = new File([blob], 'og.jpg', { type: 'image/jpeg' })
    const fd = new FormData(); fd.append('file', file)
    const up = await $fetch<{ url: string }>('/api/member/upload', { method: 'POST', body: fd })
    return up.url
  } catch { return null }
}

const ogBusy = ref(false)
async function regenerateOg() {
  ogBusy.value = true
  try {
    const url = await generateOgImage()
    if (!url) { showToast('Gagal buat preview. Pastikan foto profil sudah diatur.', 'error'); return }
    form.og_image = url
    form.og_sig = ogSignature.value
    // Persist langsung biar kebawa walau belum klik Simpan utama
    await $fetch('/api/member/links', { method: 'POST', body: { ...form, text_color: form.bio_color, links: form.links.map(l => ({ ...l })) } })
    showToast('Preview share diperbarui!')
  } catch { showToast('Gagal buat preview. Coba lagi.', 'error') }
  finally { ogBusy.value = false }
}

async function save() {
  saving.value = true
  try {
    // Regenerate OG image kalau tampilan berubah (atau belum ada)
    const sig = ogSignature.value
    if (sig !== form.og_sig || !form.og_image) {
      const url = await generateOgImage()
      if (url) { form.og_image = url; form.og_sig = sig }
    }
    await $fetch('/api/member/links', { method: 'POST', body: { ...form, text_color: form.bio_color, links: form.links.map(l => ({ ...l })) } })
    showToast('Link bio berhasil disimpan!')
  } catch { showToast('Gagal menyimpan. Coba lagi.', 'error') }
  finally { saving.value = false }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > *, .modal-leave-to > * { transform: translateY(20px); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
