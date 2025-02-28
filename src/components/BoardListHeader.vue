<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  name: string
}>()
const emit = defineEmits<{
  nameChanged: [name: string]
}>()

const name = ref(props.name)
const inputElement = ref<HTMLInputElement>()

function atChange() {
  emit('nameChanged', name.value.trim())

  if (inputElement.value !== undefined) {
    inputElement.value.scrollLeft = 0
  }
}
</script>

<template>
  <div>
    <input
      type="text"
      ref="inputElement"
      class="text-white font-bold text-lg appearance-none w-full cursor-pointer focus:cursor-auto truncate"
      v-model="name"
      @change="atChange"
    />
  </div>
</template>
