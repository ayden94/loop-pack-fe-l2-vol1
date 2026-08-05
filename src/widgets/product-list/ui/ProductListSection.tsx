'use client'

import type { UseQueryResult } from '@tanstack/react-query'

import type { ProductListResponse } from '@/entities/product/model/types'
import { InlineQueryError } from '@/shared/ui/InlineQueryError'
import { useInlineQueryRetry } from '@/shared/ui/useInlineQueryRetry'
import { ProductGrid } from '@/widgets/product-list/ui/ProductGrid'
import { ProductListSkeleton } from '@/widgets/product-list/ui/ProductListSkeleton'

type ProductListSectionProps = {
  readonly query: UseQueryResult<ProductListResponse>
  readonly displayedData: ProductListResponse | undefined
  readonly scope: string
}

export function ProductListSection({
  query,
  displayedData,
  scope,
}: ProductListSectionProps) {
  const inlineQueryRetry = useInlineQueryRetry({
    scope,
    isFetching: query.isFetching,
    refetch: query.refetch,
  })
  const retryErrorMessage = inlineQueryRetry.message
  const errorMessage = retryErrorMessage ?? query.error?.message ?? null
  const isEmpty = displayedData?.products.length === 0
  const emptyMessage =
    displayedData !== undefined && displayedData.totalCount > 0
      ? '현재 페이지에 표시할 상품이 없습니다.'
      : '검색 결과가 없습니다.'

  return (
    <section aria-label="상품 검색 결과" aria-busy={query.isFetching}>
      <div className="mb-4 min-h-5 text-sm text-(--color-muted)">
        {displayedData === undefined ? (
          <p
            role="status"
            aria-live="polite"
            aria-hidden={!query.isPending}
            className={query.isPending ? undefined : 'invisible'}
          >
            상품을 불러오는 중…
          </p>
        ) : (
          <p>
            총{' '}
            <span className="inline-block min-w-8 text-left tabular-nums">
              {String(displayedData.totalCount)}
            </span>
            개
          </p>
        )}
        {query.isFetching && displayedData !== undefined && (
          <p role="status" aria-live="polite" className="sr-only">
            상품 목록을 갱신하는 중…
          </p>
        )}
      </div>

      <div className="relative">
        {displayedData === undefined && query.isPending ? (
          <ProductListSkeleton />
        ) : (
          <ProductGrid
            products={displayedData?.products ?? []}
            reserveTwelveSlots
          />
        )}

        {isEmpty && errorMessage === null && (
          <p
            role="status"
            className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-(--color-muted)"
          >
            {emptyMessage}
          </p>
        )}

        {errorMessage !== null && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <InlineQueryError
              message={errorMessage}
              isRetrying={inlineQueryRetry.isRetrying}
              onRetry={() => {
                inlineQueryRetry.retry(errorMessage)
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
