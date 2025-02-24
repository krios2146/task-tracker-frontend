<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import { ref, type Ref, watch, inject, computed, useTemplateRef } from 'vue'
import {
  useTemplateRefsList,
  useElementBounding,
  refAutoReset,
  watchDeep,
  tryOnMounted
} from '@vueuse/core'
import { useDraggingStore } from '@/stores/draggingStore'
import type { MousePosition } from '@/types/mousePosition'

type ElementBoundaries = {
  top: number
  bot: number
  right: number
  left: number
}

type TaskBoundaries = {
  taskId: number
} & ElementBoundaries

type List = {
  id: number
  name: string
}

const props = defineProps<{
  tasks: Task[]
  list: List
}>()
const emit = defineEmits<{
  tasksReordered: [tasks: Task[]]
}>()

const mousePosition = inject<Ref<MousePosition>>('mousePosition')!

const taskElements = useTemplateRefsList<HTMLDivElement>()
const listContainerElement = useTemplateRef<HTMLDivElement>('list-container')

const localTasks = ref<Task[]>([])
const sortedTasks = ref<Task[]>([])

const taskBoundaries = ref<TaskBoundaries[]>()

const taskAboveId = refAutoReset<number | undefined>(undefined, 100)
const taskBelowId = refAutoReset<number | undefined>(undefined, 100)

const draggingTask = computed<Task | undefined>(() => useDraggingStore().get)
const isDragging = computed<boolean>(() => draggingTask.value !== undefined)

const listContainerBoundaries = computed<ElementBoundaries>(() => {
  const { top, bottom, right, left } = useElementBounding(listContainerElement)
  return { top: top.value, bot: bottom.value, right: right.value, left: left.value }
})

const isMouseInsideList = computed<boolean>(() => {
  if (mousePosition.value.x < listContainerBoundaries.value.left) {
    return false
  }
  if (mousePosition.value.x > listContainerBoundaries.value.right) {
    return false
  }
  return true
})

watchDeep(
  () => taskElements.value,
  (taskElements) => (taskBoundaries.value = calculateTasksBoundaries(taskElements))
)

watchDeep(
  () => props.tasks,
  (tasks) => {
    localTasks.value = tasks
    sortedTasks.value = sortTasks(tasks)
  }
)

watch(
  () => mousePosition.value,
  (mousePosition) => {
    if (!isDragging.value || !isMouseInsideList.value) {
      return
    }

    taskBoundaries.value?.forEach((taskBoundary) => {
      if (taskBoundary.taskId === draggingTask.value?.id) {
        return
      }

      const top = taskBoundary.top
      const middle = middleOf(taskBoundary)
      const bot = taskBoundary.bot

      if (mousePosition.y > top && mousePosition.y < middle) {
        taskAboveId.value = taskBoundary.taskId
      }
      if (mousePosition.y > middle && mousePosition.y < bot) {
        taskBelowId.value = taskBoundary.taskId
      }
    })
  }
)

watch([taskAboveId, taskBelowId], ([taskAboveId, taskBelowId]) => {
  atMouseAbove(taskAboveId)
  atMouseBelow(taskBelowId)
})

tryOnMounted(() => {
  localTasks.value = props.tasks
  sortedTasks.value = sortTasks(props.tasks)
})

function middleOf(task: TaskBoundaries): number {
  const height = Math.abs(task.top - task.bot)
  const middle = task.top + height / 2

  return middle
}

function calculateTasksBoundaries(taskElements: HTMLDivElement[]): TaskBoundaries[] {
  return taskElements.map((taskElement) => {
    const taskId = Number(taskElement.dataset.id)

    const { top, bottom, right, left } = useElementBounding(taskElement)

    return {
      taskId: taskId,
      top: top.value,
      bot: bottom.value,
      right: right.value,
      left: left.value
    }
  })
}

function sortTasks(tasks: Task[]): Task[] {
  const tasksMap = new Map(
    tasks.filter((task) => task.list_id === props.list.id).map((task) => [task.id, task])
  )

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
    currentTask = currentTask.next_id ? tasksMap.get(currentTask.next_id) : undefined
  }

  return sortedTasks
}

function findTask(taskId: number | undefined): Task | undefined {
  if (taskId === undefined) {
    return undefined
  }
  return localTasks.value.find((task) => task.id === taskId)
}

function atMouseAbove(taskId: number | undefined): void {
  if (taskId === undefined) {
    return
  }

  const targetNextTask = findTask(taskId)
  const targetPrevTask = findTask(targetNextTask?.prev_id)

  reorderTasks(targetNextTask, targetPrevTask)
}

function atMouseBelow(taskId: number | undefined): void {
  if (taskId === undefined) {
    return
  }

  const targetPrevTask = findTask(taskId)
  const targetNextTask = findTask(targetPrevTask?.next_id)

  reorderTasks(targetNextTask, targetPrevTask)
}

function reorderTasks(targetNextTask: Task | undefined, targetPrevTask: Task | undefined): void {
  if (!isDragging.value) {
    return
  }
  const reorderedTasks = new Set<Task>()

  const targetTask = draggingTask.value!

  const originPrevTask = findTask(targetTask.prev_id)
  const originNextTask = findTask(targetTask.next_id)

  // Stops dragging task from being placed right next to its original position
  if (targetNextTask?.id === targetTask.id) {
    return
  }
  if (targetPrevTask?.id === targetTask.id) {
    return
  }

  // Updating links of tasks from which the dragged task was removed
  if (originPrevTask !== undefined) {
    originPrevTask.next_id = targetTask.next_id
    reorderedTasks.add(originPrevTask)
  }
  if (originNextTask !== undefined) {
    originNextTask.prev_id = targetTask.prev_id
    reorderedTasks.add(originNextTask)
  }

  // Updating links of tasks where the dragged task is inserted
  if (targetNextTask !== undefined) {
    targetNextTask.prev_id = targetTask.id
    reorderedTasks.add(targetNextTask)
  }
  if (targetPrevTask !== undefined) {
    targetPrevTask.next_id = targetTask.id
    reorderedTasks.add(targetPrevTask)
  }

  targetTask.prev_id = targetPrevTask?.id
  targetTask.next_id = targetNextTask?.id

  reorderedTasks.add(targetTask)

  useDraggingStore().set(targetTask)

  emit('tasksReordered', [...reorderedTasks])
}
</script>

<template>
  <div class="min-w-2xs max-w-2xs" ref="list-container">
    <div class="bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md h-fit max-h-full">
      <h2 class="text-xl text-white font-bold">{{ list.name }}</h2>

      <div class="flex flex-col gap-y-2 overflow-y-scroll p-0.5 scrollbar-hidden">
        <div v-for="task in sortedTasks" :key="task.id" :data-id="task.id" :ref="taskElements.set">
          <BoardListTask :task="task" />
        </div>
      </div>

      <BoardListAddButton />
    </div>
  </div>
</template>
