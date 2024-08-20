<script setup lang="ts">
import RouterButton from '@/components/RouterButton.vue'
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-y-2">
    <h1 class="text-4xl text-white">Home</h1>
    <RouterButton route-name="sign-in">Sign in</RouterButton>
  </div>
</template>
