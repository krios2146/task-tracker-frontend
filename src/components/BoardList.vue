<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import { nextTick, ref } from 'vue'
import { watch } from 'vue'
import { useTemplateRefsList } from '@vueuse/core'
import { watchEffect } from 'vue'
import { watchPostEffect } from 'vue'

type MouseCoordinates = {
  x: number
  y: number
}

interface List {
  id: number
  name: string
}

const props = defineProps<{ tasks: Task[]; list: List; mouseCoordinates: MouseCoordinates }>()

const tasks = ref<Task[]>(props.tasks)

const sortedTasks = ref<Task[]>([])

watchEffect(() => (tasks.value = props.tasks))

watch(
  tasks,
  (updatedTasks) => {
    sortedTasks.value = updatedTasks.sort((a, b) => {
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

const taskElements = useTemplateRefsList<HTMLDivElement>()

function atDragging(taskId: number) {
  console.debug(`User dragging task ${taskId}`)
}

function atReleased(taskId: number) {
  console.debug(`User released task ${taskId}`)
}

function atMouseAbove(taskId: number) {
  console.debug(`Mouse above task ${taskId}`)
}

function atMouseBelow(taskId: number) {
  console.debug(`Mouse below task ${taskId}`)
}
</script>

<template>
  <div class="min-w-2xs max-w-2xs">
    <div class="bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md h-fit max-h-full">
      <h2 class="text-xl text-white font-bold">{{ list.name }}</h2>

      <div class="flex flex-col gap-y-2 overflow-y-scroll p-0.5 scrollbar-hidden">
        <BoardListTask
          v-for="task in sortedTasks"
          :key="task.id"
          :ref="taskElements.set"
          :data-id="task.id"
          :task="task"
          :mouse-coordinates="mouseCoordinates"
          @dragging="atDragging"
          @released="atReleased"
          @mouse-above="atMouseAbove"
          @mouse-below="atMouseBelow"
        />
      </div>

      <BoardListAddButton />
    </div>
  </div>
</template>
