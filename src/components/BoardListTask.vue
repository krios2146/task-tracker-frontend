<script setup lang="ts">
import { useMouseInElement, useMousePressed } from '@vueuse/core'
import { watch } from 'vue'
import { computed, ref } from 'vue'
import { useTemplateRef } from 'vue'

const taskElement = useTemplateRef('task')

const { x, y, elementX, elementY, isOutside } = useMouseInElement(taskElement)
const { pressed } = useMousePressed({ target: taskElement })

const dragging = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)

watch(pressed, (isPressed) => {
  if (!isPressed) {
    return
  }

  offsetX.value = elementX.value
  offsetY.value = elementY.value
})

watch([pressed, isOutside], ([mousePressed, mouseOtusideTask]) => {
  if (!mouseOtusideTask && mousePressed) {
    dragging.value = true
  }
  if (!mousePressed && dragging) {
    dragging.value = false
  }
})

const gripX = computed(() => x.value - offsetX.value)
const gripY = computed(() => y.value - offsetY.value)
</script>

<template>
  <div
    ref="task"
    :class="{ 'rotate-3 absolute dragging-card-w': dragging }"
    :style="dragging ? { top: gripY + 'px', left: gripX + 'px' } : {}"
    class="p-2 px-3 rounded-md bg-gray-950 shadow-xs shadow-black hover:cursor-pointer hover:ring-blue-500 hover:ring"
  >
    <p class="text-gray-200 select-none">
      <slot></slot>
    </p>
  </div>

  <div :class="{ hidden: !dragging }" class="p-2 px-3 rounded-md bg-gray-900">
    <p class="opacity-0">
      <slot></slot>
    </p>
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
