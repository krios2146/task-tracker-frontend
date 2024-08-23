<script setup lang="ts">
import RouterButton from '@/components/RouterButton.vue'
import CryptoJS from 'crypto-js'
import { useStorage } from '@vueuse/core'
import { RouteNames } from '@/router'

function base64UrlEncode(input: string): string {
  return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function generateCodeVerifier(length: number = 43): string {
  const randomArray = crypto.getRandomValues(new Uint8Array(length))
  const randomString = String.fromCharCode(...randomArray)

  return base64UrlEncode(btoa(randomString)).slice(0, length)
}

function generateCodeChallenge(codeVerifier: string): string {
  const sha256Hash = CryptoJS.SHA256(codeVerifier)
  const base64Hash = CryptoJS.enc.Base64.stringify(sha256Hash)
  return base64UrlEncode(base64Hash)
}

function generateKeycloackAuthLink(): string {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)

  console.log(`Saving code verifier ${codeVerifier} to the local storage`)
  useStorage('codeVerifier', codeVerifier)

  const keycloakHost = import.meta.env.VITE_KEYCLOAK_HOST
  const frontendHost = import.meta.env.VITE_FRONTEND_HOST
  const realmName = import.meta.env.VITE_REALM_NAME
  const clientId = import.meta.env.VITE_CLIENT_ID

  return (
    `${keycloakHost}/realms/${realmName}/protocol/openid-connect/auth?` +
    'scope=openid&' +
    'response_type=code&' +
    `client_id=${clientId}&` +
    `redirect_uri=${frontendHost}/auth/keycloak/callback&` +
    `code_challenge=${codeChallenge}&` +
    'code_challenge_method=S256'
  )
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-y-2">
    <h1 class="text-4xl text-white">Sign in</h1>
    <RouterButton :route-name="RouteNames.HOME">Home</RouterButton>
    <a class="bg-blue-500 rounded-md px-3 py-2" :href="generateKeycloackAuthLink()">
      Auth by Keycloak
    </a>
  </div>
</template>
