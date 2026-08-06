import { describe, expect, it, vi } from 'vitest'
import * as z from 'zod'

import { ProductListRequestModel } from '@/entities/product/model/ProductListRequest'
import { ApiClientError } from '@/shared/api/ApiClientError'
import { parseAppOrigin } from '@/shared/config/AppOrigin'

import { ProductServerRepository } from './ProductServerRepository'

const origin = parseAppOrigin('https://shop.example')
const request = ProductListRequestModel.normalize({
  q: 'stanley',
  category: 'home',
  page: 2,
  scenario: 'slow',
})
const validResponse = {
  products: [],
  categories: [],
  totalCount: 0,
  page: 2,
  pageSize: 12,
} as const

describe('ProductServerRepository success boundary', () => {
  it('uses native fetch once with the exact absolute signal-free descriptor', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(Response.json(validResponse)),
    )

    await expect(
      new ProductServerRepository(fetch).getProductList(request, origin),
    ).resolves.toEqual(validResponse)

    expect(fetch).toHaveBeenCalledTimes(1)
    const [input, init] = fetch.mock.calls[0] ?? []
    expect(input).toBeInstanceOf(URL)
    if (!(input instanceof URL)) {
      return
    }
    expect(input.href).toBe(
      'https://shop.example/api/products?q=stanley&category=home&sort=latest&page=2&pageSize=12&scenario=slow',
    )
    expect(init).toEqual({ method: 'GET' })
    expect(Object.hasOwn(init ?? {}, 'signal')).toBe(false)
  })

  it('passes through malformed success JSON as SyntaxError', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(
        new Response('{', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    await expect(
      new ProductServerRepository(fetch).getProductList(request, origin),
    ).rejects.toBeInstanceOf(SyntaxError)
  })

  it('passes through parsed invalid success data as ZodError', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(Response.json({ unexpected: true })),
    )

    await expect(
      new ProductServerRepository(fetch).getProductList(request, origin),
    ).rejects.toBeInstanceOf(z.ZodError)
  })

  it('passes through native fetch rejection identity', async () => {
    const networkError = new TypeError('fetch failed')
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.reject(networkError),
    )

    await expect(
      new ProductServerRepository(fetch).getProductList(request, origin),
    ).rejects.toBe(networkError)
  })
})

describe('ProductServerRepository HTTP error boundary', () => {
  it('uses a valid API error message and status after reading text once', async () => {
    const response = new Response(JSON.stringify({ message: '재고 없음' }), {
      status: 409,
    })
    const text = vi.spyOn(response, 'text')
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(response),
    )

    const error = await new ProductServerRepository(fetch)
      .getProductList(request, origin)
      .catch((reason: unknown) => reason)

    expect(error).toEqual(new ApiClientError('재고 없음', 409))
    expect(text).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['empty', ''],
    ['malformed JSON', '{'],
    ['schema-invalid JSON', JSON.stringify({ message: '' })],
  ])('uses the fallback for %s error text', async (_label, body) => {
    const fetch = vi.fn<typeof globalThis.fetch>(() =>
      Promise.resolve(new Response(body, { status: 503 })),
    )

    await expect(
      new ProductServerRepository(fetch).getProductList(request, origin),
    ).rejects.toEqual(new ApiClientError('요청 중 오류가 발생했습니다.', 503))
  })
})
