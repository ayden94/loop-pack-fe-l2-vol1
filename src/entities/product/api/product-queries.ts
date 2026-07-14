import { queryOptions } from '@tanstack/react-query'

import type { ProductListQuery } from '@/types/commerce'

import { fetchHome, fetchProductList } from './product-fetch'

export const homeQueryKeys = {
  all: ['home'] as const,
}

export const productListQueryKeys = {
  all: ['products'] as const,
  list: (query: ProductListQuery) =>
    [...productListQueryKeys.all, 'list', query] as const,
}

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: homeQueryKeys.all,
    queryFn: fetchHome,
    staleTime: 60_000,
  })

export const productListQueryOptions = (query: ProductListQuery) =>
  queryOptions({
    queryKey: productListQueryKeys.list(query),
    queryFn: () => fetchProductList(query),
    staleTime: 30_000,
  })
