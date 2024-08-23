import { createRouter, createWebHistory } from 'vue-router'
import SignInView from '@/views/auth/SignInView.vue'
import KeycloakView from '@/views/auth/KeycloakView.vue'
import HomeView from '@/views/HomeView.vue'

export const enum RouteNames {
  HOME = 'home',
  SIGN_IN = 'sign-in',
  KEYCLOAK_AUTH = 'keycloak-auth'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: RouteNames.HOME, component: HomeView },
    { path: '/auth/sign-in', name: RouteNames.SIGN_IN, component: SignInView },
    {
      path: '/auth/keycloak/callback',
      name: RouteNames.KEYCLOAK_AUTH,
      component: KeycloakView
    }
  ]
})

export default router
