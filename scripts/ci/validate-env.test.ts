import { describe, expect, it } from 'vitest'

import { validateEnvironment } from './validate-env.mjs'

const valid = {
  APP_ENV: 'test',
  APP_ORIGIN: 'http://127.0.0.1:3000',
  AUTH_SESSION_SECRET: 'ci-fixture-only-not-a-production-secret',
}

describe('validateEnvironment', () => {
  it('validateEnvironment: explicit test configuration -> passes', () => {
    expect(validateEnvironment(valid)).toEqual([])
  })

  it.each([
    ['AUTH_SESSION_SECRET', ''],
    ['AUTH_SESSION_SECRET', 'loopers-week09-secret'],
    ['APP_ENV', 'unknown'],
    ['APP_ORIGIN', 'not-a-url'],
    ['APP_ORIGIN', 'https://user:pass@example.test'],
    ['APP_ORIGIN', 'https://example.test/path'],
    ['APP_ORIGIN', 'https://example.test?debug=1'],
    ['NEXT_PUBLIC_AUTH_SESSION_SECRET', 'do-not-expose'],
  ])(
    'validateEnvironment: invalid %s -> reports variable only',
    (name, value) => {
      const errors = validateEnvironment({ ...valid, [name]: value })
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.map((error) => error.variable)).toContain(name)
    },
  )

  it('validateEnvironment: preview points at production -> fails', () => {
    expect(
      validateEnvironment({
        ...valid,
        APP_ENV: 'preview',
        APP_ORIGIN: 'https://shop.example.test',
        PRODUCTION_APP_ORIGIN: 'https://shop.example.test',
      }).map((error) => error.variable),
    ).toContain('APP_ORIGIN')
  })

  it('validateEnvironment: public CI fixture used in production -> fails', () => {
    expect(
      validateEnvironment({
        APP_ENV: 'production',
        APP_ORIGIN: 'https://shop.example.test',
        AUTH_SESSION_SECRET: 'week10-ci-only-not-a-production-secret',
      }).map((error) => error.variable),
    ).toContain('AUTH_SESSION_SECRET')
  })

  it('validateEnvironment: preview omits production boundary -> fails', () => {
    expect(
      validateEnvironment({
        ...valid,
        APP_ENV: 'preview',
        APP_ORIGIN: 'https://preview.example.test',
      }).map((error) => error.variable),
    ).toContain('PRODUCTION_APP_ORIGIN')
  })

  it('validateEnvironment: isolated preview and HTTPS production -> pass', () => {
    expect(
      validateEnvironment({
        ...valid,
        APP_ENV: 'preview',
        APP_ORIGIN: 'https://preview.example.test',
        PRODUCTION_APP_ORIGIN: 'https://shop.example.test',
      }),
    ).toEqual([])
    expect(
      validateEnvironment({
        ...valid,
        APP_ENV: 'production',
        APP_ORIGIN: 'https://shop.example.test',
      }),
    ).toEqual([])
  })
})
