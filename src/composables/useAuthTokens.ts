import { useStorage } from '@vueuse/core'
import { ref } from 'vue'

export function useAcessToken() {
  const token = useStorage('accessToken', '')
  const found = ref(false)

  if (token.value.length > 0) {
    found.value = true
  }

  return { token, found }
}

export function useIdToken() {
  const token = useStorage('idToken', '')
  const found = ref(false)

  if (token.value.length > 0) {
    found.value = true
  }

  return { token, found }
}

export function useRefreshToken() {
  const token = useStorage('refreshToken', '')
  const found = ref(false)

  if (token.value.length > 0) {
    found.value = true
  }
  return { token, found }
}
