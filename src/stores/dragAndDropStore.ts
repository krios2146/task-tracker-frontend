import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDragAndDropStore = defineStore('dragAndDrop', () => {
  const draggingTask = ref<Task | undefined>()
  const draggingTaskOffsetX = ref<number | undefined>()
  const draggingTaskOffsetY = ref<number | undefined>()
  const taskOfAnotherList = ref<Task | undefined>()
  const needToExclude = ref<boolean>(false)

  const getDraggingTask = computed<Task | undefined>(() => draggingTask.value)
  const taskToExclude = computed<Task | undefined>(() =>
    needToExclude.value ? taskOfAnotherList.value : undefined
  )
  const getDraggingTaskOffsetX = computed<number | undefined>(() => draggingTaskOffsetX.value)
  const getDraggingTaskOffsetY = computed<number | undefined>(() => draggingTaskOffsetY.value)

  function setDraggingTask(task: Task): void {
    draggingTask.value = { ...task }
  }
  function setDraggingTaskOffsets(x: number, y: number): void {
    draggingTaskOffsetX.value = x
    draggingTaskOffsetY.value = y
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
    draggingTaskOffsetX,
    draggingTaskOffsetY,
    taskOfAnotherList,
    needToExclude,
    getDraggingTask,
    taskToExclude,
    getDraggingTaskOffsetX,
    getDraggingTaskOffsetY,
    setDraggingTask,
    setDraggingTaskOffsets,
    removeDraggingTask,
    setTaskFromAnotherList,
    triggerAnotherListTaskExclusion,
    taskExcluded
  }
})
