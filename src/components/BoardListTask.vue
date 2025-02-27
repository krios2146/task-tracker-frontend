<script setup lang="ts">
import BoardListTaskPlaceholder from '@/components/BoardListTaskPlaceholder.vue'
import { useMouseInElement } from '@vueuse/core'
import { watch, computed, useTemplateRef, inject, type Ref } from 'vue'
import { useDragAndDropStore } from '@/stores/dragAndDropStore'
import type { MousePosition } from '@/types/MousePosition'
import type { Task } from '@/api/Task'

const props = defineProps<{ task: Task }>()

const mousePosition = inject<Ref<MousePosition>>('mousePosition')!
const mousePressed = inject<Ref<boolean>>('mousePressed')!

const dragAndDropStore = useDragAndDropStore()
const { elementX, elementY, isOutside } = useMouseInElement(useTemplateRef('task'))

const taskAbsoluteX = computed(
  () => mousePosition.value.x - (dragAndDropStore.getDraggingTaskOffsetX ?? 0)
)
const taskAbsoluteY = computed(
  () => mousePosition.value.y - (dragAndDropStore.getDraggingTaskOffsetY ?? 0)
)

const draggingTask = computed(() => dragAndDropStore.getDraggingTask)
const isDragging = computed(() => (draggingTask.value?.id === props.task.id ? true : false))

const mouseOnTask = computed(() => !isOutside.value)

watch([mousePressed, mouseOnTask], ([mousePressed, mouseOnTask], [mousePressedBefore, _]) => {
  if (mousePressedBefore && mousePressed) {
    return
  }

  if (mouseOnTask && mousePressed && draggingTask.value === undefined) {
    dragAndDropStore.setDraggingTask(props.task)
    dragAndDropStore.setDraggingTaskOffsets(elementX.value, elementY.value)
    return
  }
  if (!mousePressed) {
    dragAndDropStore.removeDraggingTask()
    return
  }
})
</script>

<template>
  <div
    ref="task"
    :class="{ 'rotate-3 absolute dragging-task-w cursor-grabbing! ring-blue-500': isDragging }"
    :style="isDragging ? { top: taskAbsoluteY + 'px', left: taskAbsoluteX + 'px' } : {}"
    class="p-2 px-3 rounded-md bg-gray-950 shadow-xs shadow-black hover:cursor-pointer hover:ring-blue-500 ring"
  >
    <p class="text-gray-200 select-none">{{ task.title }}</p>
  </div>

  <BoardListTaskPlaceholder :task="task" :visible="isDragging" />
</template>

<style lang="css">
.dragging-task-w {
  --w-2xs: var(--container-2xs);
  --p-3: (var(--spacing) * 3) * 2;
  --p-05: (var(--spacing) * 0.5) * 2;

  max-width: calc(var(--w-2xs) - (var(--p-3) + var(--p-05)));
  min-width: calc(var(--w-2xs) - (var(--p-3) + var(--p-05)));
}
</style>
