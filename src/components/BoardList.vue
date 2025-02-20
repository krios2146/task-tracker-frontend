<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'

interface Task {
  id: number
  title: string
  list_id: number
}

const props = defineProps<{ tasks: Task[] }>()
</script>

<template>
  <div class="min-w-2xs max-w-2xs bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md h-fit">
    <h2 class="text-xl text-white font-bold">
      <slot></slot>
    </h2>

    <div class="flex flex-col gap-y-2 overflow-y-scroll p-0.5 scrollbar-hidden">
      <BoardListTask v-for="task in props.tasks" :key="task.id">{{ task.title }}</BoardListTask>
    </div>

    <BoardListAddButton />
  </div>
</template>
