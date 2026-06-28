<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <UIcon name="i-tabler-loader-2" class="w-8 h-8 text-[#3358ff] animate-spin" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

// Redirect ke tujuan sesuai status login & role
const portal = usePortal()
onMounted(async () => {
  const u = await portal.fetchMe()
  navigateTo(u ? portal.homePath(u) : '/client/login')
})
</script>
