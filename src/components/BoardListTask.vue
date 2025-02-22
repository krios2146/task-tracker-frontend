<script setup lang="ts">
import { useMouseInElement, useMousePressed } from '@vueuse/core'
import { watch } from 'vue'
import { computed, ref } from 'vue'
import { useTemplateRef } from 'vue'
import { useDraggingStore } from '@/stores/draggingStore'

type MouseCoordinates = {
  x: number
  y: number
}

const props = defineProps<{
  mouseCoordinates: MouseCoordinates
  task: Task
}>()
const emit = defineEmits<{
  mouseAbove: [taskId: number]
  mouseBelow: [taskId: number]
}>()

const taskElement = useTemplateRef('task')

const { elementPositionY, elementHeight, elementX, elementY, isOutside } =
  useMouseInElement(taskElement)
const { pressed } = useMousePressed({ target: taskElement })

const draggingStore = useDraggingStore()

const dragging = ref(false)

const elementOffsetX = ref(0)
const elementOffsetY = ref(0)

const elementAbsoluteX = computed(() => props.mouseCoordinates.x - elementOffsetX.value)
const elementAbsoluteY = computed(() => props.mouseCoordinates.y - elementOffsetY.value)

const elementHorizontalBreakpoint = computed(() => elementPositionY.value + elementHeight.value / 2)

const isMouseAboveTask = computed(() => {
  if (isOutside.value) {
    return false
  }
  return props.mouseCoordinates.y < elementHorizontalBreakpoint.value
})
const isMouseBelowTask = computed(() => {
  if (isOutside.value) {
    return false
  }
  return props.mouseCoordinates.y > elementHorizontalBreakpoint.value
})

watch(pressed, (mousePressed) => {
  if (!mousePressed) {
    return
  }

  elementOffsetX.value = elementX.value
  elementOffsetY.value = elementY.value
})

watch([pressed, isOutside], ([mousePressed, mouseOtusideTask]) => {
  if (!mouseOtusideTask && mousePressed) {
    dragging.value = true
  }
  if (!mousePressed && dragging) {
    dragging.value = false
  }
})

watch(dragging, (dragging) => {
  if (dragging) {
    console.debug(`Setting dragging task to ${props.task.id}`)
    draggingStore.set(props.task)
  }
  if (!dragging) {
    console.debug(`Removing dragging task`)
    draggingStore.remove()
  }
})

watch([isMouseAboveTask, isMouseBelowTask], ([isMouseAboveTask, isMouseBelowTask]) => {
  if (isMouseAboveTask && draggingStore.get?.id !== props.task.id) {
    console.debug(`Emitting mouseAbove for task ${props.task.id}`)
    emit('mouseAbove', props.task.id)
  }
  if (isMouseBelowTask && draggingStore.get?.id !== props.task.id) {
    console.debug(`Emitting mouseBelow for task ${props.task.id}`)
    emit('mouseBelow', props.task.id)
  }
})
</script>

<template>
  <div
    v-bind="$attrs"
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
