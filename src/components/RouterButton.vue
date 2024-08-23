<script setup lang="ts">
const props = defineProps<{
  routeName: string
}>()
</script>

<template>
  <RouterLink
    class="bg-green-500 rounded-md p-2 hover:bg-green-600 transition text-gray-900 cursor-pointer"
    :to="{ name: props.routeName }"
  >
    <slot></slot>
  </RouterLink>
</template>
