import type IdToken from './IdToken'

export default interface KeycloakTokensResponse {
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
  id_token: IdToken
  session_state: string
}
