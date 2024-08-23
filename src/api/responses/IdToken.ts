export default interface IdToken {
  exp: number
  iat: number
  jti: string
  iss: string
  aud: string
  sub: string
  typ: string
  azp: string
  sid: string
  email_verified: boolean
  preferred_username: string
  email: string
}
