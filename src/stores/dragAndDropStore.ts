import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDragAndDropStore = defineStore('dragAndDrop', () => {
  const task = ref<Task | undefined>()

  const getDraggingTask = computed(() => task.value)

  function setDraggingTask(t: Task) {
    task.value = t
  }
  function removeDraggingTask() {
    task.value = undefined
  }

  return { task, getDraggingTask, setDraggingTask, removeDraggingTask }
})
