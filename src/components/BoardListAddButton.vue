<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/16/solid'

const emit = defineEmits(['pressed'])
</script>

<template>
  <div
    class="flex flex-row items-center gap-x-2 hover:cursor-pointer p-1 rounded-md hover:bg-gray-950"
    @click="emit('pressed')"
  >
    <PlusIcon class="size-6 fill-gray-200" />
    <p class="text-gray-200">Add a task</p>
  </div>
</template>
