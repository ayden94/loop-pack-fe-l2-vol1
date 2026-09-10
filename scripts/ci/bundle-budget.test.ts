import { once } from 'node:events'
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import { isWithinBudget, measureRoutes } from './bundle-budget.mjs'

describe('isWithinBudget', () => {
  it.each([
    [100, 100, true],
    [99, 100, true],
    [101, 100, false],
    [-1, 100, false],
    [Number.NaN, 100, false],
    [1.5, 100, false],
    [100, Number.POSITIVE_INFINITY, false],
  ])('isWithinBudget: %s bytes / %s limit -> %s', (bytes, limit, expected) => {
    expect(isWithinBudget(bytes, limit)).toBe(expected)
  })
})

it('measureRoutes: duplicate scripts -> sums actual encoded response once', async () => {
  const javascript = gzipSync('const greeting = "hello";'.repeat(100))
  const server = createServer((request, response) => {
    if (request.url === '/chunk.js') {
      response.writeHead(200, { 'Content-Encoding': 'gzip' })
      response.end(javascript)
    } else if (request.url === '/empty') {
      response.end('<html></html>')
    } else {
      response.end(
        '<script src="/chunk.js"></script><script src="/chunk.js"></script>',
      )
    }
  })
  const listening = once(server, 'listening')
  server.listen(0, '127.0.0.1')
  await listening
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Missing fixture address')
  try {
    const base = `http://127.0.0.1:${String(address.port)}`
    await expect(
      measureRoutes(base, [{ path: '/', limitBytes: javascript.length }]),
    ).resolves.toEqual([
      {
        path: '/',
        bytes: javascript.length,
        limitBytes: javascript.length,
        overageBytes: 0,
        scripts: 1,
        passed: true,
      },
    ])
    await expect(
      measureRoutes(base, [{ path: '/', limitBytes: 1 }]),
    ).resolves.toEqual([
      {
        path: '/',
        bytes: javascript.length,
        limitBytes: 1,
        overageBytes: javascript.length - 1,
        scripts: 1,
        passed: false,
      },
    ])
    await expect(
      measureRoutes(base, [{ path: '/empty', limitBytes: 100 }]),
    ).rejects.toThrow()
    await expect(measureRoutes(base, [])).rejects.toThrow()
    await expect(
      measureRoutes(base, [{ path: '//external.invalid', limitBytes: 100 }]),
    ).rejects.toThrow()
  } finally {
    const closed = once(server, 'close')
    server.close()
    await closed
  }
})
