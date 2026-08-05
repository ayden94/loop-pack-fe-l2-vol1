import { QueryObserver } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { createQueryClient } from '@/app/providers'
import { ProductService } from '@/entities/product/api/ProductService'
import type { ProductListResponse } from '@/entities/product/model/types'
import { resolveProductListDiagnosticScenario } from '@/views/product-list/ui/ProductListView'

const retainedResponse = {
  products: [],
  categories: [],
  totalCount: 30,
  page: 1,
  pageSize: 12,
} satisfies ProductListResponse

const finalResponse = {
  products: [],
  categories: [],
  totalCount: 3,
  page: 1,
  pageSize: 12,
} satisfies ProductListResponse

describe('same-document product scenario transition', () => {
  it('re-resolves the URL scenario while retaining data in one QueryClient', async () => {
    const queryClient = createQueryClient()
    const providerQueryClient = queryClient
    const service = new ProductService()
    const query = {
      q: 'stanley',
      category: 'all' as const,
      sort: 'latest' as const,
      page: 1,
      pageSize: 12,
    }
    const serverScenario = { scenario: 'empty' as const }
    const initialSearchParams = new URLSearchParams('scenario=empty')
    const nextSearchParams = new URLSearchParams('scenario=slow')
    const initialScenario = resolveProductListDiagnosticScenario(
      initialSearchParams.get('scenario'),
      serverScenario,
    )
    const nextScenario = resolveProductListDiagnosticScenario(
      nextSearchParams.get('scenario'),
      serverScenario,
    )
    const initialOptions = service.getProductList(query, initialScenario)
    const nextOptions = service.getProductList(query, nextScenario)
    let resolveNext: (response: ProductListResponse) => void = () => undefined
    const nextResponse = new Promise<ProductListResponse>((resolve) => {
      resolveNext = resolve
    })

    queryClient.setQueryData(initialOptions.queryKey, retainedResponse)
    const observer = new QueryObserver(queryClient, {
      ...initialOptions,
      queryFn: () => Promise.resolve(retainedResponse),
    })
    const unsubscribe = observer.subscribe(() => undefined)

    observer.setOptions({
      ...nextOptions,
      queryFn: () => nextResponse,
    })
    const placeholderResult = observer.getCurrentResult()

    expect(initialScenario).toBe(serverScenario)
    expect(nextScenario).toEqual({ scenario: 'slow' })
    expect(nextOptions.queryKey).not.toEqual(initialOptions.queryKey)
    expect(queryClient).toBe(providerQueryClient)
    expect(placeholderResult.isPlaceholderData).toBe(true)
    expect(placeholderResult.data).toBe(retainedResponse)
    expect(queryClient.getQueryData(initialOptions.queryKey)).toBe(
      retainedResponse,
    )

    const settledResult = new Promise<ProductListResponse>((resolve) => {
      const stopWaiting = observer.subscribe((result) => {
        if (result.isSuccess && !result.isPlaceholderData) {
          stopWaiting()
          resolve(result.data)
        }
      })
    })
    resolveNext(finalResponse)

    await expect(settledResult).resolves.toBe(finalResponse)
    expect(queryClient).toBe(providerQueryClient)
    expect(queryClient.getQueryData(initialOptions.queryKey)).toBe(
      retainedResponse,
    )
    expect(queryClient.getQueryData(nextOptions.queryKey)).toBe(finalResponse)
    unsubscribe()
  })
})
