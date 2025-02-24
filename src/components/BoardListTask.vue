<script setup lang="ts">
import { useMouseInElement } from '@vueuse/core'
import { watch } from 'vue'
import { computed, ref } from 'vue'
import { useTemplateRef } from 'vue'
import { useDragAndDropStore } from '@/stores/dragAndDropStore'
import { inject } from 'vue'
import type { MousePosition } from '@/types/mousePosition'
import type { Ref } from 'vue'

const props = defineProps<{ task: Task }>()

const mousePosition = inject<Ref<MousePosition>>('mousePosition')!
const mousePressed = inject<Ref<boolean>>('mousePressed')!

const dragAndDropStore = useDragAndDropStore()
const { elementX, elementY, isOutside } = useMouseInElement(useTemplateRef('task'))

const dragging = ref(false)

const elementOffsetX = ref(0)
const elementOffsetY = ref(0)

const elementAbsoluteX = computed(() => mousePosition.value.x - elementOffsetX.value)
const elementAbsoluteY = computed(() => mousePosition.value.y - elementOffsetY.value)

const draggingTask = computed(() => dragAndDropStore.getDraggingTask)

const mouseOnTask = computed(() => !isOutside.value)

watch(mousePressed, (mousePressed) => {
  if (mousePressed) {
    elementOffsetX.value = elementX.value
    elementOffsetY.value = elementY.value
  }
})

watch([mousePressed, mouseOnTask], ([mousePressed, mouseOnTask]) => {
  if (mouseOnTask && mousePressed && draggingTask.value === undefined) {
    dragAndDropStore.setDraggingTask(props.task)
    return
  }
  if (!mousePressed) {
    dragAndDropStore.removeDraggingTask()
    return
  }
})

watch(draggingTask, (draggingTask) => {
  if (draggingTask === undefined) {
    dragging.value = false
    return
  }
  if (draggingTask.id === props.task.id) {
    dragging.value = true
    return
  }
})
</script>

<template>
  <div
    ref="task"
    :class="{ 'rotate-3 absolute dragging-card-w': dragging }"
    :style="dragging ? { top: elementAbsoluteY + 'px', left: elementAbsoluteX + 'px' } : {}"
    class="p-2 px-3 rounded-md bg-gray-950 shadow-xs shadow-black hover:cursor-pointer hover:ring-blue-500 hover:ring"
  >
    <p class="text-gray-200 select-none">{{ task.title }}</p>
  </div>

  <div :class="{ hidden: !dragging }" class="p-2 px-3 rounded-md bg-gray-900">
    <p class="opacity-0">{{ task.title }}</p>
  </div>
</template>

<style lang="css">
.dragging-card-w {
  --w-2xs: var(--container-2xs);
  --p-3: (var(--spacing) * 3) * 2;
  --p-05: (var(--spacing) * 0.5) * 2;

  max-width: calc(var(--w-2xs) - (var(--p-3) + var(--p-05)));
  min-width: calc(var(--w-2xs) - (var(--p-3) + var(--p-05)));
}
</style>
