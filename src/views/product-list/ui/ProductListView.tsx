'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { productEntity } from '@/entities/product/api/ProductService'
import {
  categorySchema,
  sortSchema,
} from '@/entities/product/model/ProductQuerySchema'
import type { Product } from '@/entities/product/model/types'
import type { ProductFilters } from '@/features/product-filter/model/useProductFilters'
import { useProductFilters } from '@/features/product-filter/model/useProductFilters'
import { DebouncedInput } from '@/shared/ui/DebouncedInput'
import { ProductCard } from '@/widgets/product-card/ui/ProductCard'

const categoryOptions = [
  { value: 'all', label: '전체' },
  { value: 'casual', label: '캐주얼' },
  { value: 'fashion', label: '패션' },
  { value: 'goods', label: '뷰티·잡화' },
  { value: 'home', label: '홈' },
  { value: 'digital', label: '디지털' },
] as const satisfies ReadonlyArray<{
  value: ProductFilters['category']
  label: string
}>

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
] as const satisfies ReadonlyArray<{
  value: ProductFilters['sort']
  label: string
}>

const parseCategory = (value: string): ProductFilters['category'] => {
  const result = categorySchema.safeParse(value)
  return result.success ? result.data : 'all'
}

const parseSort = (value: string): ProductFilters['sort'] => {
  const result = sortSchema.safeParse(value)
  return result.success ? result.data : 'latest'
}

function FilterBar({
  filters,
  totalCount,
  pageSize,
  updateFilter,
  updatePage,
}: {
  filters: ProductFilters
  totalCount: number
  pageSize: number
  updateFilter: (
    patch: Partial<Pick<ProductFilters, 'q' | 'category' | 'sort'>>,
  ) => void
  updatePage: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <DebouncedInput
        key={filters.q}
        initialValue={filters.q}
        label="검색"
        name="q"
        placeholder="상품명 또는 브랜드"
        onDebouncedChange={(value) => {
          updateFilter({ q: value })
        }}
      />
      <label className="flex flex-col gap-1">
        <span className="text-xs text-(--color-subtle)">카테고리</span>
        <select
          name="category"
          value={filters.category}
          onChange={(e) => {
            updateFilter({ category: parseCategory(e.target.value) })
          }}
          className="min-h-10 rounded border border-(--color-border) px-3 py-2 text-sm text-(--color-text)"
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-(--color-subtle)">정렬</span>
        <select
          name="sort"
          value={filters.sort}
          onChange={(e) => {
            updateFilter({ sort: parseSort(e.target.value) })
          }}
          className="min-h-10 rounded border border-(--color-border) px-3 py-2 text-sm text-(--color-text)"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <nav aria-label="페이지 이동" className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            updatePage(Math.max(1, filters.page - 1))
          }}
          disabled={filters.page <= 1}
          className="rounded border border-(--color-border) px-3 py-2 text-sm text-(--color-text) disabled:opacity-40"
        >
          이전
        </button>
        <span className="text-sm text-(--color-muted)">
          {String(filters.page)} / {String(totalPages)}
        </span>
        <button
          type="button"
          onClick={() => {
            updatePage(filters.page + 1)
          }}
          disabled={filters.page >= totalPages}
          className="rounded border border-(--color-border) px-3 py-2 text-sm text-(--color-text) disabled:opacity-40"
        >
          다음
        </button>
      </nav>
    </form>
  )
}

function ProductGrid({ products }: { products: Array<Product> }) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-(--color-muted)">
        검색 결과가 없습니다.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function ProductListView() {
  const { filters, updateFilter, updatePage } = useProductFilters()

  const { data, isPending, isError, error } = useQuery(
    productEntity.getProductList({
      ...filters,
      pageSize: 12,
    }),
  )

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-(--color-ink)">
        상품 목록
      </h1>

      <section className="mb-6">
        <FilterBar
          filters={filters}
          totalCount={data?.totalCount ?? 0}
          pageSize={12}
          updateFilter={updateFilter}
          updatePage={updatePage}
        />
      </section>

      <section aria-label="상품 검색 결과">
        {isPending ? (
          <div className="py-20 text-center text-(--color-muted)">
            상품을 불러오는 중…
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-(--color-muted)">
            {error instanceof Error
              ? error.message
              : '상품 목록을 불러오지 못했습니다.'}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-(--color-muted)">
              총 {String(data.totalCount)}개
            </p>
            <ProductGrid products={data.products} />
          </>
        )}
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-(--color-text) hover:text-(--color-ink)"
        >
          ← 홈으로
        </Link>
      </div>
    </main>
  )
}
