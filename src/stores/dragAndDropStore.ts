import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDragAndDropStore = defineStore('dragAndDrop', () => {
  const draggingTask = ref<Task | undefined>()
  const taskOfAnotherList = ref<Task | undefined>()
  const needToExclude = ref<boolean>(false)

  const getDraggingTask = computed<Task | undefined>(() => draggingTask.value)
  const taskToExclude = computed<Task | undefined>(() =>
    needToExclude.value ? taskOfAnotherList.value : undefined
  )

  function setDraggingTask(task: Task): void {
    draggingTask.value = { ...task }
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
    taskOfAnotherList,
    needToExclude,
    getDraggingTask,
    taskToExclude,
    setDraggingTask,
    removeDraggingTask,
    setTaskFromAnotherList,
    triggerAnotherListTaskExclusion,
    taskExcluded
  }
})
