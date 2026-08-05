import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import type { DiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import type { ProductListQuery } from '@/entities/product/model/types'

import { ProductRepository } from './ProductRepository'
import { ProductService } from './ProductService'

const scenarioCases = [
  {},
  { scenario: 'slow' },
  { scenario: 'empty' },
  { scenario: 'error' },
] as const satisfies ReadonlyArray<DiagnosticScenario>
const normalScenario = scenarioCases[0]
const slowScenario = scenarioCases[1]

const baseQuery: ProductListQuery = {
  q: '',
  category: 'all',
  sort: 'latest',
  page: 1,
  pageSize: 12,
}

describe('ProductService.queryKeyFactory.home', () => {
  it.each(scenarioCases)(
    'contains the diagnostic scenario descriptor',
    (diagnosticScenario) => {
      expect(
        ProductService.queryKeyFactory.home.all(diagnosticScenario),
      ).toEqual(['home', diagnosticScenario])
    },
  )

  it('produces equal normal keys for equal descriptors', () => {
    expect(ProductService.queryKeyFactory.home.all(normalScenario)).toEqual(
      ProductService.queryKeyFactory.home.all({}),
    )
  })
})

describe('ProductService.queryKeyFactory.product.list', () => {
  it('contains the full query and diagnostic scenario descriptor', () => {
    expect(
      ProductService.queryKeyFactory.product.list(baseQuery, slowScenario),
    ).toEqual(['products', 'list', baseQuery, slowScenario])
  })

  it.each([
    ['q', { q: 'stanley' }],
    ['category', { category: 'fashion' as const }],
    ['sort', { sort: 'popular' as const }],
    ['page', { page: 2 }],
    ['pageSize', { pageSize: 24 }],
  ])('reflects %s changes in the key', (_field, patch) => {
    const current = ProductService.queryKeyFactory.product.list(
      baseQuery,
      normalScenario,
    )
    const changed = ProductService.queryKeyFactory.product.list(
      { ...baseQuery, ...patch },
      normalScenario,
    )

    expect(current).not.toEqual(changed)
  })

  it.each(scenarioCases.slice(1))(
    'reflects diagnostic scenario changes in the key',
    (diagnosticScenario) => {
      expect(
        ProductService.queryKeyFactory.product.list(baseQuery, normalScenario),
      ).not.toEqual(
        ProductService.queryKeyFactory.product.list(
          baseQuery,
          diagnosticScenario,
        ),
      )
    },
  )

  it('produces equal keys for equal queries and descriptors', () => {
    expect(
      ProductService.queryKeyFactory.product.list(baseQuery, slowScenario),
    ).toEqual(
      ProductService.queryKeyFactory.product.list(
        { ...baseQuery },
        { ...slowScenario },
      ),
    )
  })
})

describe('ProductService query functions', () => {
  it.each(scenarioCases)(
    'forwards the home diagnostic descriptor to the repository',
    async (diagnosticScenario) => {
      const repository = new ProductRepository()
      const getHome = vi.spyOn(repository, 'getHome').mockResolvedValue({
        banner: {
          title: 'title',
          description: 'description',
          image: '/hero.jpg',
        },
        categories: [],
        popularProducts: [],
        newProducts: [],
      })
      const service = new ProductService(repository)
      const queryClient = new QueryClient()

      await queryClient.fetchQuery(service.getHome(diagnosticScenario))

      expect(getHome).toHaveBeenCalledWith(diagnosticScenario)
    },
  )

  it.each(scenarioCases)(
    'forwards product filters and descriptor to the repository',
    async (diagnosticScenario) => {
      const repository = new ProductRepository()
      const getProductList = vi
        .spyOn(repository, 'getProductList')
        .mockResolvedValue({
          products: [],
          categories: [],
          totalCount: 0,
          page: 1,
          pageSize: 12,
        })
      const service = new ProductService(repository)
      const queryClient = new QueryClient()

      await queryClient.fetchQuery(
        service.getProductList(baseQuery, diagnosticScenario),
      )

      expect(getProductList).toHaveBeenCalledWith(
        baseQuery,
        diagnosticScenario,
        expect.any(AbortSignal),
      )
    },
  )

  it('forwards the browser query signal to the repository', async () => {
    const repository = new ProductRepository()
    const getProductList = vi
      .spyOn(repository, 'getProductList')
      .mockResolvedValue({
        products: [],
        categories: [],
        totalCount: 0,
        page: 1,
        pageSize: 12,
      })
    const service = new ProductService(repository)
    const queryClient = new QueryClient()

    await queryClient.fetchQuery(
      service.getProductList(baseQuery, slowScenario),
    )

    expect(getProductList).toHaveBeenCalledWith(
      baseQuery,
      slowScenario,
      expect.any(AbortSignal),
    )
  })

  it.each(scenarioCases)(
    'keeps the server product query signal-free for each descriptor',
    async (diagnosticScenario) => {
      const repository = new ProductRepository()
      const getProductList = vi
        .spyOn(repository, 'getProductList')
        .mockResolvedValue({
          products: [],
          categories: [],
          totalCount: 0,
          page: 1,
          pageSize: 12,
        })
      const service = new ProductService(repository)
      const queryClient = new QueryClient()

      await queryClient.fetchQuery(
        service.getServerProductList(baseQuery, diagnosticScenario),
      )

      expect(getProductList).toHaveBeenCalledWith(baseQuery, diagnosticScenario)
    },
  )

  it.each(scenarioCases)(
    'keeps browser and server product cache semantics equal',
    (diagnosticScenario) => {
      const service = new ProductService()
      const browserOptions = service.getProductList(
        baseQuery,
        diagnosticScenario,
      )
      const serverOptions = service.getServerProductList(
        baseQuery,
        diagnosticScenario,
      )

      expect(browserOptions.queryKey).toEqual(serverOptions.queryKey)
      expect(browserOptions.staleTime).toBe(serverOptions.staleTime)
    },
  )
})
