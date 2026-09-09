import { describe, expect, it } from 'vitest'

import { expiredSessionCookie } from '../../../e2e/support/auth'
import { readSessionToken } from '../api/_data/auth'

describe('expiredSessionCookie', () => {
  it.each(['http://127.0.0.1:3000', 'https://shop.example.test:8443'])(
    'expiredSessionCookie: baseURL %s -> scopes an expired signed cookie to its host',
    (baseURL) => {
      const cookie = expiredSessionCookie('u1', baseURL)

      expect(cookie.domain).toBe(new URL(baseURL).hostname)
      expect(cookie.path).toBe('/')
      expect(readSessionToken(cookie.value)).toBeNull()
    },
  )
})
