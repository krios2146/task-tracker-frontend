<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import { computed, ref } from 'vue'
import { watch } from 'vue'

interface Task {
  id: number
  title: string
  list_id: number
  next_id: number | undefined
  prev_id: number | undefined
}

interface List {
  id: number
  name: string
}

const props = defineProps<{ tasks: Task[]; list: List }>()

const sortedTasks = ref([] as Task[])

watch(
  props,
  (newProps) => {
    sortedTasks.value = newProps.tasks.sort((a, b) => {
      if (a.next_id == b.id || b.prev_id == a.id) {
        return -1
      }
      if (a.prev_id == b.id || b.next_id == a.id) {
        return 1
      }
      return 0
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="min-w-2xs max-w-2xs bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md h-fit">
    <h2 class="text-xl text-white font-bold">{{ list.name }}</h2>

    <div class="flex flex-col gap-y-2 overflow-y-scroll p-0.5 scrollbar-hidden">
      <BoardListTask v-for="task in sortedTasks" :key="task.id">{{ task.title }}</BoardListTask>
    </div>

    <BoardListAddButton />
  </div>
</template>
