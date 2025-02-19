<script setup lang="ts"></script>

<template>
  <div
    class="p-2 px-3 rounded-md bg-gray-950 shadow-xs shadow-black hover:cursor-pointer hover:ring-blue-500 hover:ring"
  >
    <p class="text-gray-200 select-none">
      <slot></slot>
    </p>
  </div>
</template>
