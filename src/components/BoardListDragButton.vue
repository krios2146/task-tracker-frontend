<script setup lang="ts">
import { inject, type Ref, useTemplateRef, ref, watch } from 'vue'
import { useMouseInElement } from '@vueuse/core'
import { Bars3Icon } from '@heroicons/vue/16/solid'

const emit = defineEmits(['pressed', 'released'])

const mousePressed = inject<Ref<boolean>>('mousePressed')!

const { isOutside } = useMouseInElement(useTemplateRef('icon'))

const dragging = ref<boolean>(false)

watch(
  () => mousePressed.value,
  (mousePressed, mousePressedBefore) => {
    if (mousePressedBefore && mousePressed) {
      return
    }
    if (mousePressed && !isOutside.value) {
      dragging.value = true
      return
    }
    if (!mousePressed) {
      dragging.value = false
      return
    }
  }
)

watch(dragging, (dragging) => (dragging ? emit('pressed') : emit('released')))
</script>

<template>
  <div class="hover:cursor-grab" :class="{ 'cursor-grabbing!': dragging }" ref="icon">
    <Bars3Icon class="size-5 fill-gray-500" />
  </div>
</template>
