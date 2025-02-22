<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import { ref } from 'vue'
import { watch } from 'vue'
import { useDraggingStore } from '@/stores/draggingStore'

type MouseCoordinates = {
  x: number
  y: number
}

interface List {
  id: number
  name: string
}

const props = defineProps<{
  tasks: Task[]
  list: List
  mouseCoordinates: MouseCoordinates
}>()
const emit = defineEmits<{
  tasksReordered: [tasks: Task[]]
}>()

const draggingStore = useDraggingStore()

const localTasks = ref<Task[]>([])
const sortedTasks = ref<Task[]>([])

const draggingTask = ref<Task | undefined>()

watch(
  props.tasks,
  (tasks) => {
    localTasks.value = tasks
  },
  { immediate: true }
)

watch(
  localTasks.value,
  (localTasks) => {
    sortedTasks.value = sortTasks(localTasks)
  },
  { immediate: true }
)

watch(
  () => draggingStore.get,
  (task) => (draggingTask.value = task)
)

function sortTasks(tasks: Task[]): Task[] {
  const tasksMap = new Map(tasks.map((task) => [task.id, task]))

  const firstTask = tasks.find((task) => {
    if (task.prev_id === undefined) {
      return task
    }
    if (tasksMap.get(task.prev_id) === undefined) {
      return task
    }
  })

  let currentTask = firstTask

  const sortedTasks = []

  while (currentTask !== undefined) {
    sortedTasks.push(currentTask)

    if (currentTask.next_id === undefined) {
      break
    }

    currentTask = tasksMap.get(currentTask.next_id) || undefined
  }

  return sortedTasks
}

function findTask(taskId: number | undefined): Task | undefined {
  if (taskId === undefined) {
    return undefined
  }
  return localTasks.value.find((task) => task.id === taskId)
}

function atMouseAbove(taskId: number) {
  if (draggingTask.value === undefined) {
    return
  }

  const reorderedTasks = []

  const aboveDraggingTask = findTask(draggingTask.value.prev_id)
  const belowDraggingTask = findTask(draggingTask.value.next_id)

  if (aboveDraggingTask !== undefined) {
    aboveDraggingTask.next_id = belowDraggingTask?.id
    reorderedTasks.push(aboveDraggingTask)
  }
  if (belowDraggingTask !== undefined) {
    belowDraggingTask.prev_id = aboveDraggingTask?.id
    reorderedTasks.push(belowDraggingTask)
  }

  const taskBelow = findTask(taskId)!
  const taskAbove = findTask(taskBelow.prev_id)

  if (taskAbove === undefined) {
    draggingTask.value.prev_id = taskBelow.prev_id
  }

  taskBelow.prev_id = draggingTask.value.id

  if (taskAbove !== undefined && taskAbove.id !== draggingTask.value.id) {
    taskAbove.next_id = draggingTask.value.id
    draggingTask.value.prev_id = taskAbove.id
    reorderedTasks.push(taskAbove)
  }

  draggingTask.value.next_id = taskBelow.id

  reorderedTasks.push(draggingTask.value)

  emit('tasksReordered', reorderedTasks)
}

function atMouseBelow(taskId: number) {
  if (draggingTask.value === undefined) {
    return
  }

  const reorderedTasks = []

  const aboveDraggingTask = findTask(draggingTask.value.prev_id)
  const belowDraggingTask = findTask(draggingTask.value.next_id)

  if (aboveDraggingTask !== undefined) {
    aboveDraggingTask.next_id = belowDraggingTask?.id
    reorderedTasks.push(aboveDraggingTask)
  }
  if (belowDraggingTask !== undefined) {
    belowDraggingTask.prev_id = aboveDraggingTask?.id
    reorderedTasks.push(belowDraggingTask)
  }

  const taskAbove = findTask(taskId)!
  const taskBelow = findTask(taskAbove.next_id)

  if (taskBelow === undefined) {
    draggingTask.value.next_id = taskAbove.next_id
  }

  taskAbove.next_id = draggingTask.value.id

  if (taskBelow !== undefined && taskBelow.id !== draggingTask.value.id) {
    taskBelow.prev_id = draggingTask.value.id
    draggingTask.value.next_id = taskBelow.id
    reorderedTasks.push(taskBelow)
  }

  draggingTask.value.prev_id = taskAbove.id

  reorderedTasks.push(draggingTask.value)

  emit('tasksReordered', reorderedTasks)
}
</script>

<template>
  <div class="min-w-2xs max-w-2xs">
    <div class="bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md h-fit max-h-full" ref="list">
      <h2 class="text-xl text-white font-bold">{{ list.name }}</h2>

      <div class="flex flex-col gap-y-2 overflow-y-scroll p-0.5 scrollbar-hidden">
        <BoardListTask
          v-for="task in sortedTasks"
          :key="task.id"
          :data-id="task.id"
          :task="task"
          :mouse-coordinates="mouseCoordinates"
          @mouse-above="atMouseAbove"
          @mouse-below="atMouseBelow"
        />
      </div>

      <BoardListAddButton />
    </div>
  </div>
</template>
