<script setup lang="ts">
import type { Task } from '@/api/Task'

const props = defineProps<{
  visible: boolean
  task: Task
}>()
</script>

<template>
  <div
    :class="{ hidden: !props.visible, flex: props.visible }"
    class="p-2 px-3 rounded-md bg-gray-900 pointer-events-none select-none"
  >
    <p class="opacity-0">{{ task.title }}</p>
  </div>
</template>
