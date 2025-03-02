import type { Task } from '@/api/Task'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useNewTaskStore = defineStore('newTaskStore', () => {
  const task = ref<Task | undefined>()
  const creationFailed = ref<boolean>(false)

  const getTask = computed<Task | undefined>(() => task.value)
  const isCreationFailed = computed<boolean>(() => task.value !== undefined && creationFailed.value)

  function setTask(taskToAdd: Task): void {
    task.value = { ...taskToAdd }
  }
  function markFailed(): void {
    if (task.value !== undefined) {
      creationFailed.value = true
    }
  }
  function reset(): void {
    task.value = undefined
    creationFailed.value = false
  }

  return { task, creationFailed, getTask, isCreationFailed, setTask, markFailed, reset }
})
