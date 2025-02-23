import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useDraggingStore = defineStore('dragging', () => {
  const task = ref<Task | undefined>()

  const get = computed(() => task.value)

  function set(t: Task) {
    task.value = t
  }
  function remove() {
    task.value = undefined
  }

  return { task, get, set, remove }
})
