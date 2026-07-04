<template>
  <UInput
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :type="show ? 'text' : 'password'"
    v-bind="$attrs">
    <template #trailing>
      <button type="button" tabindex="-1" @click="show = !show"
        :aria-label="show ? 'Sembunyikan password' : 'Lihat password'"
        class="pointer-events-auto text-slate-400 hover:text-slate-600 focus:outline-none">
        <UIcon :name="show ? 'i-tabler-eye-off' : 'i-tabler-eye'" class="w-4 h-4" />
      </button>
    </template>
  </UInput>
</template>

<script setup lang="ts">
// Input password dengan tombol lihat/sembunyikan (auto-import: <PasswordInput>)
defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
const show = ref(false)
</script>
