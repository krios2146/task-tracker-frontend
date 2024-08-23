import type KeycloakTokensResponse from '@/api/responses/KeycloakTokensResponse'
import { useAxios } from '@vueuse/integrations/useAxios'
import { ref, toValue, watch, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'

export function useKeycloakAuth(
  code: string | undefined,
  sessionState: string | undefined
): { isAuthSucceeded: Ref<boolean>; isAuthFailed: Ref<boolean>; isAuthInPorgress: Ref<boolean> } {
  console.log('Making HTTP call to the Keycloak to exchange auth code for tokens')

  const isAuthSucceeded: Ref<boolean> = ref(false)
  const isAuthFailed: Ref<boolean> = ref(false)
  const isAuthInPorgress: Ref<boolean> = ref(true)

  function failAuth(reason: string) {
    console.error(reason)

    isAuthInPorgress.value = false
    isAuthFailed.value = true
    isAuthSucceeded.value = false

    return { isAuthSucceeded, isAuthFailed, isAuthInPorgress }
  }

  if (!toValue(code)) {
    return failAuth('Auth code is missing')
  }
  if (!toValue(sessionState)) {
    return failAuth('Session state is missing')
  }

  const keycloakHost = import.meta.env.VITE_KEYCLOAK_HOST
  const frontendHost = import.meta.env.VITE_FRONTEND_HOST
  const realmName = import.meta.env.VITE_REALM_NAME
  const redirectUri = `${frontendHost}/auth/keycloak/callback`
  const grantType = 'authorization_code'
  const clientId = import.meta.env.VITE_CLIENT_ID
  const codeVerifier = useStorage('codeVerifier', undefined)

  if (!codeVerifier) {
    return failAuth(
      'Code verifier is not found in the local storage, cannot proceed with authentication'
    )
  }

  const { error, response, isFinished } = useAxios<KeycloakTokensResponse>('/token', {
    method: 'post',
    baseURL: `${keycloakHost}/realms/${realmName}/protocol/openid-connect`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      redirect_uri: redirectUri,
      grant_type: grantType,
      client_id: clientId,
      code: toValue(code),
      code_verifier: toValue(codeVerifier)
    }
  })

  watch(
    () => isFinished.value,
    (isFinished) => {
      if (!isFinished) {
        return
      }

      if (error.value) {
        return failAuth('Keycloak responded with an error')
      }

      const keycloakResponse = response.value?.data

      if (keycloakResponse === undefined) {
        return failAuth('Keycloak response is empty')
      }
      if (keycloakResponse.session_state !== sessionState) {
        return failAuth('Keycloak session states are not matching')
      }

      useStorage('accessToken', keycloakResponse.access_token)
      useStorage('idToken', keycloakResponse.id_token)
      useStorage('refreshToken', keycloakResponse.refresh_token)

      console.info('Keycloak auth is successfull, tokens are saved to the local storage')

      isAuthSucceeded.value = true
      isAuthFailed.value = false
      isAuthInPorgress.value = false
    }
  )

  return { isAuthSucceeded, isAuthFailed, isAuthInPorgress }
}
