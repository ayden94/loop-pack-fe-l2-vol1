import {
  QueryClient,
  QueryObserver,
  type QueryObserverOptions,
} from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { ProductService } from '@/entities/product/api/ProductService'
import type {
  ProductListQuery,
  ProductListResponse,
} from '@/entities/product/model/types'

import { ProductListStatePolicy } from './ProductListStatePolicy'

type ProductListKey = ReturnType<
  typeof ProductService.queryKeyFactory.product.list
>
type ProductListObserver = QueryObserver<
  ProductListResponse,
  Error,
  ProductListResponse,
  ProductListResponse,
  ProductListKey
>

const firstPageQuery = {
  q: '',
  category: 'all',
  sort: 'latest',
  page: 1,
  pageSize: 12,
} as const satisfies ProductListQuery
const firstPage = {
  products: [],
  categories: [],
  totalCount: 30,
  page: 1,
  pageSize: 12,
} satisfies ProductListResponse

function errorOptions(
  query: ProductListQuery,
  queryFn: () => Promise<ProductListResponse>,
): QueryObserverOptions<
  ProductListResponse,
  Error,
  ProductListResponse,
  ProductListResponse,
  ProductListKey
> {
  return {
    queryKey: ProductService.queryKeyFactory.product.list(query, {}),
    queryFn,
    placeholderData: (previousData) => previousData,
    retry: 1,
    retryDelay: 0,
    throwOnError: false,
  }
}

function waitForError(observer: ProductListObserver) {
  return new Promise<ReturnType<typeof observer.getCurrentResult>>(
    (resolve) => {
      const unsubscribe = observer.subscribe((result) => {
        if (result.isError) {
          unsubscribe()
          resolve(result)
        }
      })
    },
  )
}

describe('ProductListStatePolicy error transitions', () => {
  it('retains cached success and retries the current key', async () => {
    const queryClient = new QueryClient()
    const firstKey = ProductService.queryKeyFactory.product.list(
      firstPageQuery,
      {},
    )
    queryClient.setQueryData(firstKey, firstPage)
    const errorQuery = { ...firstPageQuery, q: 'stanley' }
    const errorKey = ProductService.queryKeyFactory.product.list(errorQuery, {})
    let attempts = 0
    const observer = new QueryObserver<
      ProductListResponse,
      Error,
      ProductListResponse,
      ProductListResponse,
      ProductListKey
    >(
      queryClient,
      errorOptions(errorQuery, () => {
        attempts += 1
        return Promise.reject(new Error('상품 목록 요청 실패'))
      }),
    )

    const result = await waitForError(observer)
    const state = ProductListStatePolicy.resolve({
      query: result,
      currentKey: errorKey,
      lastSuccessfulKey: firstKey,
      queryClient,
    })

    expect(attempts).toBe(2)
    expect(state.displayedData).toBe(firstPage)
    expect(state.lastSuccessfulKey).toBe(firstKey)
    await observer.refetch()
    expect(attempts).toBe(4)
    expect(observer.getCurrentQuery().queryKey).toEqual(errorKey)
  })

  it('keeps a cold error data-free after two attempts', async () => {
    const queryClient = new QueryClient()
    const currentKey = ProductService.queryKeyFactory.product.list(
      firstPageQuery,
      { scenario: 'error' },
    )
    let attempts = 0
    const observer = new QueryObserver<
      ProductListResponse,
      Error,
      ProductListResponse,
      ProductListResponse,
      ProductListKey
    >(queryClient, {
      ...errorOptions(firstPageQuery, () => {
        attempts += 1
        return Promise.reject(new Error('상품 목록 요청 실패'))
      }),
      queryKey: currentKey,
    })

    const result = await waitForError(observer)
    const state = ProductListStatePolicy.resolve({
      query: result,
      currentKey,
      lastSuccessfulKey: null,
      queryClient,
    })

    expect(attempts).toBe(2)
    expect(state.displayedData).toBeUndefined()
    expect(state.lastSuccessfulKey).toBeNull()
  })
})
