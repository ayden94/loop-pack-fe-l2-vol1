import { describe, expect, it, vi } from 'vitest'
import * as z from 'zod'

import type { DiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import { apiClient } from '@/shared/api/ApiClient'

import { ProductRepository } from './ProductRepository'

describe('ProductRepository successful response boundary', () => {
  it('throws a schema error without another attempt for malformed 2xx data', async () => {
    let attemptCount = 0
    const api = apiClient.extend({
      baseUrl: 'https://example.test/',
      fetch: () => {
        attemptCount += 1
        return Promise.resolve(
          new Response(JSON.stringify({ unexpected: true }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      },
    })
    const repository = new ProductRepository(api)

    await expect(repository.getHome({})).rejects.toBeInstanceOf(z.ZodError)
    expect(attemptCount).toBe(1)
  })
})

const scenarioCases = [
  [{}, null],
  [{ scenario: 'slow' }, 'slow'],
  [{ scenario: 'empty' }, 'empty'],
  [{ scenario: 'error' }, 'error'],
] as const satisfies ReadonlyArray<readonly [DiagnosticScenario, string | null]>

describe('ProductRepository diagnostic scenario requests', () => {
  it('keeps the product GET request shape signal-free by default', async () => {
    let requestedMethod = ''
    let requestedUrl = ''
    const api = apiClient.extend({
      baseUrl: 'https://example.test/',
      fetch: (request) => {
        const productRequest = new Request(request)
        requestedMethod = productRequest.method
        requestedUrl = productRequest.url
        return Promise.resolve(
          Response.json({
            products: [],
            categories: [],
            totalCount: 0,
            page: 2,
            pageSize: 12,
          }),
        )
      },
    })
    const get = vi.spyOn(api, 'get')

    await new ProductRepository(api).getProductList(
      {
        q: 'stanley',
        category: 'home',
        sort: 'price-asc',
        page: 2,
        pageSize: 12,
      },
      { scenario: 'slow' },
    )

    expect(requestedMethod).toBe('GET')
    expect(requestedUrl).toBe(
      'https://example.test/api/products?q=stanley&category=home&sort=price-asc&page=2&pageSize=12&scenario=slow',
    )
    expect(get).toHaveBeenCalledWith('api/products', {
      searchParams: {
        q: 'stanley',
        category: 'home',
        sort: 'price-asc',
        page: 2,
        pageSize: 12,
        scenario: 'slow',
      },
    })
    const requestOptions = get.mock.calls[0]?.[1]
    expect(Object.hasOwn(requestOptions ?? {}, 'signal')).toBe(false)
  })

  it('keeps the signaled product request URL aligned with the signal-free request', async () => {
    const requestedUrls: Array<string> = []
    const api = apiClient.extend({
      baseUrl: 'https://example.test/',
      fetch: (request) => {
        requestedUrls.push(new Request(request).url)
        return Promise.resolve(
          Response.json({
            products: [],
            categories: [],
            totalCount: 0,
            page: 2,
            pageSize: 12,
          }),
        )
      },
    })
    const get = vi.spyOn(api, 'get')
    const repository = new ProductRepository(api)
    const query = {
      q: 'stanley',
      category: 'home',
      sort: 'price-asc',
      page: 2,
      pageSize: 12,
    } as const
    const diagnosticScenario = { scenario: 'slow' } as const
    const controller = new AbortController()

    await repository.getProductList(query, diagnosticScenario)
    await repository.getProductList(
      query,
      diagnosticScenario,
      controller.signal,
    )

    expect(requestedUrls).toHaveLength(2)
    expect(requestedUrls[0]).toBe(requestedUrls[1])
    const signalFreeOptions = get.mock.calls[0]?.[1]
    const signaledOptions = get.mock.calls[1]?.[1]
    expect(Object.hasOwn(signalFreeOptions ?? {}, 'signal')).toBe(false)
    expect(Object.hasOwn(signaledOptions ?? {}, 'signal')).toBe(true)
    expect(signaledOptions?.signal).toBe(controller.signal)
  })

  it('aborts the Ky product request when the transport signal aborts', async () => {
    let requestSignal: AbortSignal | undefined
    let markRequestStarted = () => {}
    const requestStarted = new Promise<void>((resolve) => {
      markRequestStarted = resolve
    })
    const api = apiClient.extend({
      baseUrl: 'https://example.test/',
      fetch: (request) => {
        const transportRequest = new Request(request)
        requestSignal = transportRequest.signal
        markRequestStarted()
        return new Promise<Response>((_resolve, reject) => {
          transportRequest.signal.addEventListener(
            'abort',
            () => {
              reject(new DOMException('The request was aborted.', 'AbortError'))
            },
            { once: true },
          )
        })
      },
    })
    const controller = new AbortController()
    const productRequest = new ProductRepository(api).getProductList(
      {
        q: 'stanley',
        category: 'home',
        sort: 'price-asc',
        page: 1,
        pageSize: 12,
      },
      { scenario: 'slow' },
      controller.signal,
    )

    await requestStarted
    controller.abort()

    await expect(productRequest).rejects.toHaveProperty('name', 'AbortError')
    expect(requestSignal?.aborted).toBe(true)
  })

  it.each(scenarioCases)(
    'keeps the home GET scenario aligned with the descriptor',
    async (diagnosticScenario, expectedScenario) => {
      let requestedUrl = ''
      const api = apiClient.extend({
        baseUrl: 'https://example.test/',
        fetch: (request) => {
          requestedUrl = new Request(request).url
          return Promise.resolve(
            Response.json({
              banner: {
                title: 'title',
                description: 'description',
                image: '/hero.jpg',
              },
              categories: [],
              popularProducts: [],
              newProducts: [],
            }),
          )
        },
      })

      await new ProductRepository(api).getHome(diagnosticScenario)

      expect(new URL(requestedUrl).searchParams.get('scenario')).toBe(
        expectedScenario,
      )
    },
  )

  it.each(scenarioCases)(
    'keeps product filters and GET scenario aligned with the descriptor',
    async (diagnosticScenario, expectedScenario) => {
      let requestedUrl = ''
      const api = apiClient.extend({
        baseUrl: 'https://example.test/',
        fetch: (request) => {
          requestedUrl = new Request(request).url
          return Promise.resolve(
            Response.json({
              products: [],
              categories: [],
              totalCount: 0,
              page: 2,
              pageSize: 12,
            }),
          )
        },
      })

      await new ProductRepository(api).getProductList(
        {
          q: 'stanley',
          category: 'home',
          sort: 'price-asc',
          page: 2,
          pageSize: 12,
        },
        diagnosticScenario,
      )

      const searchParams = new URL(requestedUrl).searchParams
      expect(searchParams.get('q')).toBe('stanley')
      expect(searchParams.get('category')).toBe('home')
      expect(searchParams.get('sort')).toBe('price-asc')
      expect(searchParams.get('page')).toBe('2')
      expect(searchParams.get('pageSize')).toBe('12')
      expect(searchParams.get('scenario')).toBe(expectedScenario)
    },
  )
})
