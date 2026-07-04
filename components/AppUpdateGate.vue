<template>
  <Teleport to="body">
    <div v-if="outdated"
      class="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center text-center p-6"
      :style="gateStyle">
      <div class="w-20 h-20 rounded-3xl bg-[#3358ff]/10 flex items-center justify-center mb-6">
        <UIcon name="i-tabler-rocket" class="w-10 h-10 text-[#3358ff]" />
      </div>
      <h1 class="text-2xl font-extrabold text-slate-900">Update Aplikasi</h1>
      <p class="text-slate-500 text-sm mt-2 max-w-xs">
        Versi aplikasi kamu sudah usang. Update ke versi terbaru untuk melanjutkan.
      </p>
      <a v-if="updateUrl" :href="updateUrl"
        class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#3358ff] text-white font-bold rounded-2xl hover:bg-[#2244ee] transition">
        <UIcon name="i-tabler-download" class="w-5 h-5" /> Update Sekarang
      </a>
      <p v-else class="mt-6 text-xs text-slate-400">Silakan update lewat Play Store / sumber instalasi kamu.</p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// Gate versi minimum aplikasi mobile. Web baca ?appVersion=x.y.z+build,
// bandingkan dgn /api/app-config → kalau di bawah min, tampilkan layar update (blocking).
const outdated  = ref(false)
const updateUrl = ref('')

const gateStyle = {
  paddingTop:    'max(env(safe-area-inset-top, 0px), var(--safe-area-inset-top, 0px))',
  paddingBottom: 'max(env(safe-area-inset-bottom, 0px), var(--safe-area-inset-bottom, 0px))',
}

// Parse "1.2.3+45" → {major,minor,patch,build}
function parseVer(v: string) {
  const [semver, build] = String(v || '').split('+')
  const p = String(semver || '').split('.').map((n) => parseInt(n, 10) || 0)
  return { major: p[0] || 0, minor: p[1] || 0, patch: p[2] || 0, build: parseInt(build, 10) || 0 }
}
// true kalau a < b
function isLess(a: ReturnType<typeof parseVer>, b: ReturnType<typeof parseVer>) {
  if (a.major !== b.major) return a.major < b.major
  if (a.minor !== b.minor) return a.minor < b.minor
  if (a.patch !== b.patch) return a.patch < b.patch
  return a.build < b.build
}

onMounted(async () => {
  let appVersion = ''
  try {
    const q = new URLSearchParams(location.search).get('appVersion')
    if (q) sessionStorage.setItem('appVersion', q) // persist (query hilang saat SPA nav)
    appVersion = q || sessionStorage.getItem('appVersion') || ''
  } catch { /* ignore */ }

  if (!appVersion) return // bukan dari app mobile → skip (browser biasa)

  try {
    const cfg = await $fetch<any>('/api/app-config')
    updateUrl.value = cfg.update_url || ''
    if (cfg.min_version && isLess(parseVer(appVersion), parseVer(cfg.min_version))) {
      outdated.value = true
    }
  } catch { /* config gagal → jangan blokir */ }
})
</script>
