<script setup lang="ts">
import BoardListTaskPlaceholder from './BoardListTaskPlaceholder.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import BoardListDragButton from './BoardListDragButton.vue'
import type { Task } from '@/api/Task'

const props = defineProps<{
  tasks: Task[]
  listTitle: string
  visible: boolean
}>()
</script>

<template>
  <div
    class="bg-gray-950 opacity-40 p-3 flex-col gap-y-4 rounded-md h-fit max-h-full pointer-events-none select-none"
    :class="{ flex: props.visible, hidden: !props.visible }"
  >
    <div class="flex flex-row justify-between items-center -z-50">
      <h2 class="text-xl text-white font-bold">{{ listTitle }}</h2>
      <BoardListDragButton />
    </div>

    <div class="flex flex-col gap-y-2 p-0.5 -z-50">
      <div v-for="task in tasks" :key="task.id" :data-id="task.id">
        <BoardListTaskPlaceholder :task="task" :visible="true" />
      </div>
    </div>

    <BoardListAddButton class="-z-50" />
  </div>
</template>
