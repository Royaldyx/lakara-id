<template>
  <div>
    <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">{{ label }}</dt>
    <dd class="mt-0.5 text-slate-700 whitespace-pre-line break-words">
      <a v-if="link && value" :href="value" target="_blank" rel="noopener" class="text-[#3358ff] hover:underline break-all">{{ value }}</a>
      <span v-else>{{ value || '—' }}</span>
    </dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value?: string | null; link?: boolean }>()
</script>
