<script setup lang="ts">
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'
import { ref, type Ref, watch, inject } from 'vue'
import { useDraggingStore } from '@/stores/draggingStore'
import { useTemplateRefsList, useElementBounding } from '@vueuse/core'
import type { MousePosition } from '@/types/mousePosition'
import { useTemplateRef } from 'vue'
import { computed } from 'vue'

type ElementBoundaries = {
  top: number
  bot: number
  right: number
  left: number
}

type TaskBoundaries = {
  taskId: number
  boundaries: ElementBoundaries
}

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

const listContainerElement = useTemplateRef<HTMLDivElement>('list-container')

const mousePosition = inject<Ref<MousePosition>>('mousePosition')!

const taskElements = useTemplateRefsList<HTMLDivElement>()

const draggingStore = useDraggingStore()

const localTasks = ref<Task[]>([])
const sortedTasks = ref<Task[]>([])

const draggingTask = ref<Task | undefined>()

const taskBoundaries = ref<TaskBoundaries[]>()

const taskAbove = ref<number>()
const taskBelow = ref<number>()

const listContainerBoundaries = computed<ElementBoundaries>(() => {
  const { top, bottom, right, left } = useElementBounding(listContainerElement)
  return { top: top.value, bot: bottom.value, right: right.value, left: left.value }
})

watch(
  () => taskElements.value,
  (taskElements) => {
    const boundaries = calculateTasksBoundaries(taskElements)

    console.debug(`Task boundaries: ${JSON.stringify(boundaries)}`)

    taskBoundaries.value = boundaries
  },
  { deep: true }
)

watch(
  () => props.tasks,
  (tasks) => {
    console.debug(`List ${props.list.id} updating local tasks from props tasks`)
    localTasks.value = tasks
  },
  { immediate: true, deep: true }
)

watch(
  () => props.tasks,
  (tasks) => {
    console.debug(`List ${props.list.id} updating sorted tasks from props tasks`)
    sortedTasks.value = sortTasks(tasks)
  },
  { immediate: true, deep: true }
)

watch(
  () => draggingStore.get,
  (task) => {
    // console.debug(`List ${props.list.id} setting local draggingTask to ${task?.id}`)
    draggingTask.value = task
  }
)

watch(
  () => mousePosition.value,
  (mousePosition) => {
    if (draggingTask.value === undefined) {
      return
    }

    // Outside current list
    if (
      mousePosition.x < listContainerBoundaries.value.left ||
      mousePosition.x > listContainerBoundaries.value.right
    ) {
      return
    }

    taskBoundaries.value?.forEach((taskBoundary) => {
      if (taskBoundary.taskId === draggingTask.value?.id) {
        return
      }

      const top = taskBoundary.boundaries.top
      const middle = middleOf(taskBoundary)
      const bot = taskBoundary.boundaries.bot

      if (mousePosition.y > top && mousePosition.y < middle) {
        // console.debug(`middle: ${middle} > Mouse y: ${mousePosition.y} > top: ${top}`)
        taskAbove.value = taskBoundary.taskId
      }
      if (mousePosition.y > middle && mousePosition.y < bot) {
        // console.debug(`bot: ${bot} > Mouse y: ${mousePosition.y} > middle: ${middle}`)
        taskBelow.value = taskBoundary.taskId
      }
    })
  }
)

watch(taskAbove, (taskAbove) => {
  if (taskAbove !== undefined) {
    atMouseAbove(taskAbove)
    taskBelow.value = undefined
  }
})
watch(taskBelow, (taskBelow) => {
  if (taskBelow !== undefined) {
    atMouseBelow(taskBelow)
    taskAbove.value = undefined
  }
})

function middleOf(task: TaskBoundaries): number {
  const height = Math.abs(task.boundaries.top - task.boundaries.bot)
  const middle = task.boundaries.top + height / 2

  return middle
}

function calculateTasksBoundaries(taskElements: HTMLDivElement[]): TaskBoundaries[] {
  return taskElements.map((taskElement) => {
    const taskId = Number(taskElement.dataset.id)

    const { top, bottom, right, left } = useElementBounding(taskElement)
    const boundaries: ElementBoundaries = {
      top: top.value,
      bot: bottom.value,
      right: right.value,
      left: left.value
    }

    return { taskId: taskId, boundaries: boundaries }
  })
}

function sortTasks(tasks: Task[]): Task[] {
  console.debug(`List ${props.list.id} start sorting ${tasks.length} tasks`)

  tasks = tasks.filter((task) => task.list_id === props.list.id)

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

  console.debug(`Sorted tasks length = ${sortedTasks.length}`)

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

  console.debug(
    `List ${props.list.id} handling mouse above for task ${taskId} with draggingTask = ${draggingTask.value.id}`
  )

  const reorderedTasks = []

  const originPrevTask = findTask(draggingTask.value.prev_id)
  const originNextTask = findTask(draggingTask.value.next_id)

  const targetNextTask = findTask(taskId)
  const targetPrevTask = findTask(targetNextTask?.prev_id)

  // console.debug(`Origin prev task: ${JSON.stringify(originPrevTask)}`)
  // console.debug(`Origin next task: ${JSON.stringify(originNextTask)}`)
  //
  // console.debug(`Target prev task: ${JSON.stringify(targetPrevTask)}`)
  // console.debug(`Target next task: ${JSON.stringify(targetNextTask)}`)

  if (targetNextTask?.id === draggingTask.value.id) {
    // console.debug(`Target next task ${targetNextTask.id} == dragging task, will not proceed`)
    return
  }
  if (targetPrevTask?.id === draggingTask.value.id) {
    // console.debug(`Target prev task ${targetPrevTask.id} == dragging task, will not proceed`)
    return
  }

  if (originPrevTask !== undefined) {
    originPrevTask.next_id = draggingTask.value.next_id
    // console.debug(`Updated origin prev task: ${JSON.stringify(originPrevTask)}`)
    reorderedTasks.push(originPrevTask)
  }
  if (originNextTask !== undefined) {
    originNextTask.prev_id = draggingTask.value.prev_id
    // console.debug(`Updated origin next task: ${JSON.stringify(originNextTask)}`)
    reorderedTasks.push(originNextTask)
  }

  if (targetNextTask !== undefined) {
    targetNextTask.prev_id = draggingTask.value.id
    // console.debug(`Updated target next task: ${JSON.stringify(targetNextTask)}`)
    reorderedTasks.push(targetNextTask)
  }
  if (targetPrevTask !== undefined) {
    targetPrevTask.next_id = draggingTask.value.id
    // console.debug(`Updated target prev task: ${JSON.stringify(targetPrevTask)}`)
    reorderedTasks.push(targetPrevTask)
  }

  draggingTask.value.prev_id = targetPrevTask?.id
  draggingTask.value.next_id = targetNextTask?.id

  // console.debug(`Updated dragging task: ${JSON.stringify(draggingTask.value)}`)

  reorderedTasks.push(draggingTask.value)

  draggingStore.set(draggingTask.value)

  console.debug(
    `List ${props.list.id} emitting tasksReordered with following tasks ${JSON.stringify(reorderedTasks)}`
  )

  emit('tasksReordered', reorderedTasks)
}

function atMouseBelow(taskId: number) {
  if (draggingTask.value === undefined) {
    return
  }

  console.debug(
    `List ${props.list.id} handling mouse below for task ${taskId} with draggingTask = ${draggingTask.value.id}`
  )

  const reorderedTasks = []

  const originPrevTask = findTask(draggingTask.value.prev_id)
  const originNextTask = findTask(draggingTask.value.next_id)

  const targetPrevTask = findTask(taskId)
  const targetNextTask = findTask(targetPrevTask?.next_id)

  // console.debug(`Origin prev task: ${JSON.stringify(originPrevTask)}`)
  // console.debug(`Origin next task: ${JSON.stringify(originNextTask)}`)
  //
  // console.debug(`Target prev task: ${JSON.stringify(targetPrevTask)}`)
  // console.debug(`Target next task: ${JSON.stringify(targetNextTask)}`)

  if (targetNextTask?.id === draggingTask.value.id) {
    // console.debug(`Target next task ${targetNextTask.id} == dragging task, will not proceed`)
    return
  }
  if (targetPrevTask?.id === draggingTask.value.id) {
    // console.debug(`Target prev task ${targetPrevTask.id} == dragging task, will not proceed`)
    return
  }

  if (originPrevTask !== undefined) {
    originPrevTask.next_id = draggingTask.value.next_id
    // console.debug(`Updated origin prev task: ${JSON.stringify(originPrevTask)}`)
    reorderedTasks.push(originPrevTask)
  }
  if (originNextTask !== undefined) {
    originNextTask.prev_id = draggingTask.value.prev_id
    // console.debug(`Updated origin next task: ${JSON.stringify(originNextTask)}`)
    reorderedTasks.push(originNextTask)
  }

  if (targetNextTask !== undefined) {
    targetNextTask.prev_id = draggingTask.value.id
    // console.debug(`Updated target next task: ${JSON.stringify(targetNextTask)}`)
    reorderedTasks.push(targetNextTask)
  }
  if (targetPrevTask !== undefined) {
    targetPrevTask.next_id = draggingTask.value.id
    // console.debug(`Updated target prev task: ${JSON.stringify(targetPrevTask)}`)
    reorderedTasks.push(targetPrevTask)
  }

  draggingTask.value.prev_id = targetPrevTask?.id
  draggingTask.value.next_id = targetNextTask?.id

  // console.debug(`Updated dragging task: ${JSON.stringify(draggingTask.value)}`)

  reorderedTasks.push(draggingTask.value)

  draggingStore.set(draggingTask.value)

  console.debug(
    `List ${props.list.id} emitting tasksReordered with following tasks ${JSON.stringify(reorderedTasks)}`
  )

  taskBelow.value = undefined
  taskAbove.value = undefined
  emit('tasksReordered', reorderedTasks)
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
  <div class="fixed right-5 top-15 bg-black text-white py-1 px-2 rounded-md flex flex-col">
    <div :class="{ hidden: !taskAbove }">aboveTask: {{ taskAbove }}</div>
    <div :class="{ hidden: !taskBelow }">belowTask: {{ taskBelow }}</div>
  </div>
</template>
