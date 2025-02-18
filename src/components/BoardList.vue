<script setup lang="ts">
import { ref } from 'vue'
import BoardListTask from './BoardListTask.vue'
import BoardListAddButton from './BoardListAddButton.vue'

const tasks = ref([
  'Test task one very long title which continues to another line and even further',
  'Test task two',
  'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam aut voluptas numquam quam totam sequi! Praesentium vitae assumenda dolor eaque nesciunt, velit illum expedita minima omnis beatae molestias consectetur. Blanditiis?',
  'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam aut voluptas numquam quam totam sequi! Praesentium vitae assumenda dolor eaque nesciunt, velit illum expedita minima omnis beatae molestias consectetur. Blanditiis?',
  'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laboriosam aut voluptas numquam quam totam sequi! Praesentium vitae assumenda dolor eaque nesciunt, velit illum expedita minima omnis beatae molestias consectetur. Blanditiis?'
])
</script>

<template>
  <div class="min-w-2xs max-w-2xs bg-gray-800 p-3 flex flex-col gap-y-4 rounded-md">
    <h2 class="text-xl text-white font-bold">
      <slot></slot>
    </h2>

    <div class="flex flex-col gap-y-2 overflow-y-scroll pb-1 scrollbar-hidden">
      <BoardListTask v-for="task in tasks" :key="task">{{ task }} </BoardListTask>
    </div>

    <BoardListAddButton />
  </div>
</template>
