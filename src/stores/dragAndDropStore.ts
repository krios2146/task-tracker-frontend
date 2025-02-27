import type { List } from '@/api/List'
import type { Task } from '@/api/Task'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDragAndDropStore = defineStore('dragAndDrop', () => {
  const draggingTask = ref<Task | undefined>()
  const draggingList = ref<List | undefined>()

  const draggingTaskOffsetX = ref<number | undefined>()
  const draggingTaskOffsetY = ref<number | undefined>()
  const draggingListOffsetX = ref<number | undefined>()
  const draggingListOffsetY = ref<number | undefined>()

  const taskOfAnotherList = ref<Task | undefined>()
  const needToExclude = ref<boolean>(false)

  const getDraggingTask = computed<Task | undefined>(() => draggingTask.value)
  const getDraggingList = computed<List | undefined>(() => draggingList.value)

  const taskToExclude = computed<Task | undefined>(() =>
    needToExclude.value ? taskOfAnotherList.value : undefined
  )

  const getDraggingTaskOffsetX = computed<number | undefined>(() => draggingTaskOffsetX.value)
  const getDraggingTaskOffsetY = computed<number | undefined>(() => draggingTaskOffsetY.value)
  const getDraggingListOffsetX = computed<number | undefined>(() => draggingListOffsetX.value)
  const getDraggingListOffsetY = computed<number | undefined>(() => draggingListOffsetY.value)

  function setDraggingTask(task: Task): void {
    draggingTask.value = { ...task }
  }
  function setDraggingList(list: List): void {
    draggingList.value = { ...list }
  }

  function setDraggingTaskOffsets(x: number, y: number): void {
    draggingTaskOffsetX.value = x
    draggingTaskOffsetY.value = y
  }
  function setDraggingListOffsets(x: number, y: number): void {
    draggingListOffsetX.value = x
    draggingListOffsetY.value = y
  }

  function removeDraggingTask(): void {
    draggingTask.value = undefined
  }
  function setTaskFromAnotherList(task: Task): void {
    taskOfAnotherList.value = { ...task }
  }
  function triggerAnotherListTaskExclusion(): void {
    if (taskOfAnotherList.value !== undefined) {
      needToExclude.value = true
    }
  }
  function taskExcluded(): void {
    taskOfAnotherList.value = undefined
    needToExclude.value = false
  }

  return {
    draggingTask,
    draggingList,

    draggingTaskOffsetX,
    draggingTaskOffsetY,
    draggingListOffsetX,
    draggingListOffsetY,

    taskOfAnotherList,
    needToExclude,

    getDraggingTask,
    getDraggingList,

    taskToExclude,

    getDraggingTaskOffsetX,
    getDraggingTaskOffsetY,
    getDraggingListOffsetX,
    getDraggingListOffsetY,

    setDraggingTask,
    setDraggingList,

    setDraggingTaskOffsets,
    setDraggingListOffsets,

    removeDraggingTask,
    setTaskFromAnotherList,
    triggerAnotherListTaskExclusion,
    taskExcluded
  }
})
