<script setup lang="ts">
import { useKeycloakAuth } from '@/composables/useKeycloakAuth'
import RouterButton from '@/components/RouterButton.vue'
import router, { RouteNames } from '@/router'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

console.log('Authenticating using Keycloak')

const query = useRouter().currentRoute.value.query
const sessionState = query.session_state
const code = query.code

const { isAuthSucceeded, isAuthFailed, isAuthInPorgress } = useKeycloakAuth(
  code?.toString(),
  sessionState?.toString()
)

watch(isAuthSucceeded, (authSucceeded) => {
  if (authSucceeded) {
    router.push({ name: RouteNames.HOME })
  }
})
</script>

<template>
  <div class="flex flex-col gap-y-4 text-white justify-center items-center">
    <h1 class="text-3xl">Keycloak Auth</h1>

    <div v-if="isAuthFailed" class="flex flex-col justify-center items-center">
      <p class="mb-3">Auth failed, please try again</p>
      <RouterButton :route-name="RouteNames.SIGN_IN">Sign in</RouterButton>
    </div>

    <p v-if="isAuthInPorgress">Auth in progress, please wait...</p>
    <p v-if="isAuthSucceeded">Auth successful, redirecting to the home page...</p>
  </div>
</template>
