'use client'

import type { UseQueryResult } from '@tanstack/react-query'

import type { ProductListResponse } from '@/entities/product/model/types'
import { InlineQueryError } from '@/shared/ui/InlineQueryError'
import { useInlineQueryRetry } from '@/shared/ui/useInlineQueryRetry'
import { ProductGrid } from '@/widgets/product-list/ui/ProductGrid'

type ProductListSectionProps = {
  readonly query: UseQueryResult<ProductListResponse>
}

export function ProductListSection({ query }: ProductListSectionProps) {
  const inlineQueryRetry = useInlineQueryRetry({
    isFetching: query.isFetching,
    refetch: query.refetch,
  })
  const retryErrorMessage = inlineQueryRetry.message

  if (retryErrorMessage !== null) {
    return (
      <section aria-label="상품 검색 결과">
        <InlineQueryError
          message={retryErrorMessage}
          isRetrying={inlineQueryRetry.isRetrying}
          onRetry={() => {
            inlineQueryRetry.retry(retryErrorMessage)
          }}
        />
      </section>
    )
  }

  switch (query.status) {
    case 'pending':
      return (
        <section aria-label="상품 검색 결과">
          <div className="py-20 text-center text-(--color-muted)">
            상품을 불러오는 중…
          </div>
        </section>
      )
    case 'error':
      return (
        <section aria-label="상품 검색 결과">
          <InlineQueryError
            message={query.error.message}
            isRetrying={query.isFetching}
            onRetry={() => {
              inlineQueryRetry.retry(query.error.message)
            }}
          />
        </section>
      )
    case 'success':
      return (
        <section aria-label="상품 검색 결과">
          <p className="mb-4 text-sm text-(--color-muted)">
            총 {String(query.data.totalCount)}개
          </p>
          <ProductGrid products={query.data.products} />
        </section>
      )
    default: {
      const unreachableQuery: never = query
      return unreachableQuery
    }
  }
}
