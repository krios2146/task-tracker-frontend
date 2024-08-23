<script setup lang="ts">
import type IdToken from '@/api/responses/IdToken'
import RouterButton from '@/components/RouterButton.vue'
import { useIdToken } from '@/composables/useAuthTokens'
import { RouteNames } from '@/router/index'
import { jwtDecode } from 'jwt-decode'
import type { Ref } from 'vue'
import { ref } from 'vue'

const username: Ref<string | undefined> = ref()

const { token, found } = useIdToken()

if (found) {
  const idTokenPayload = jwtDecode<IdToken>(token.value)
  username.value = idTokenPayload.preferred_username
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-y-2 text-white">
    <h1 class="text-4xl">Home</h1>
    <p v-if="username">Hello, {{ username }}</p>
    <RouterButton :route-name="RouteNames.SIGN_IN">Sign in</RouterButton>
  </div>
</template>
