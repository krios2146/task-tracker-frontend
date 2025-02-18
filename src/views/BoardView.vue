<script setup lang="ts">
import BoardList from '@/components/BoardList.vue'
import { ref } from 'vue'

const boards = ref(['Backlog', 'TODO', 'In Progress', 'In Review', 'Done'])
</script>

<template>
  <div class="p-3 h-screen">
    <div class="flex flex-row gap-4 justify-center max-h-full">
      <BoardList v-for="board in boards" :key="board">{{ board }}</BoardList>
    </div>
  </div>
</template>
