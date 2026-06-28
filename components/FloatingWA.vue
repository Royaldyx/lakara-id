<template>
  <div>
    <!-- Floating WA Button -->
    <Transition name="wa-pop">
      <a
        v-show="visible"
        :href="waLink"
        target="_blank"
        rel="noopener"
        class="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
        aria-label="Chat WhatsApp"
        @mouseenter="showLabel = true"
        @mouseleave="showLabel = false"
      >
        <!-- Label tooltip -->
        <Transition name="wa-label">
          <div v-if="showLabel"
            class="bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap">
            {{ labelText }}
          </div>
        </Transition>

        <!-- Button circle -->
        <div class="relative w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full shadow-lg shadow-green-500/40 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/50">
          <!-- Ping animation -->
          <span class="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-30" />
          <!-- WA icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      </a>
    </Transition>

    <!-- Scroll to top button (muncul saat scroll) -->
    <Transition name="wa-pop">
      <button
        v-show="scrolled"
        @click="scrollToTop"
        class="fixed bottom-6 right-24 z-50 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
        aria-label="Scroll to top"
      >
        <UIcon name="i-tabler-arrow-up" class="w-4 h-4" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { wa } = useSiteConfig()

const waLink   = wa('Halo Lakara, saya ingin konsultasi')
const visible  = ref(false)
const scrolled = ref(false)
const showLabel = ref(false)
const labelText = 'Chat Konsultasi Gratis 👋'

const onScroll = () => { scrolled.value = window.scrollY > 300 }

onMounted(() => {
  setTimeout(() => visible.value = true, 1500)
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => { window.removeEventListener('scroll', onScroll) })

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.wa-pop-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.wa-pop-leave-active { transition: all 0.2s ease; }
.wa-pop-enter-from, .wa-pop-leave-to { opacity: 0; transform: scale(0.5) translateY(20px); }

.wa-label-enter-active { transition: all 0.2s ease; }
.wa-label-leave-active { transition: all 0.15s ease; }
.wa-label-enter-from, .wa-label-leave-to { opacity: 0; transform: translateX(10px); }
</style>
