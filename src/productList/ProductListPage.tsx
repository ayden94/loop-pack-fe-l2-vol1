import { For, Show } from '@ilokesto/utilinent'
import { cn, tv } from 'tailwind-variants'

import { type Product, productService } from '@/entities/product'
import {
  ProductCard,
  useProductInteraction,
  useProductListSearchParams,
} from '@/features/product-list'
import { useAsync, useScrollToTopOnChange } from '@/shared/lib'
import { Pagination } from '@/shared/ui'

type SortBy = 'latest' | 'popular' | 'price-asc' | 'price-desc'

// ─────────────────────────────────────────────────────────
// 카테고리 / 정렬 옵션 — 컴포넌트 안에 들고 다닌다
// ─────────────────────────────────────────────────────────

const CATEGORIES: Array<{ value: 'all' | Product['category']; label: string }> =
  [
    { value: 'all', label: '전체' },
    { value: 'electronics', label: '전자제품' },
    { value: 'fashion', label: '패션' },
    { value: 'home', label: '홈' },
    { value: 'beauty', label: '뷰티' },
  ]

const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'price-asc', label: '가격 낮은순' },
  { value: 'price-desc', label: '가격 높은순' },
]

const PAGE_SIZE = 12

const loadingStateClassName = 'py-20 px-5 text-center text-[#555]'
const filterLabelClassName = 'text-[13px] font-semibold text-[#444]'
const categoryButton = tv({
  base: 'cursor-pointer rounded-2xl border border-[#ddd] bg-white px-3 py-1.5 text-[13px]',
  variants: {
    active: {
      false: '',
      true: 'border-[#111] bg-[#111] text-white',
    },
  },
  defaultVariants: {
    active: false,
  },
})
const priceInputClassName =
  'w-[100px] rounded-md border border-[#ddd] px-2.5 py-1.5 text-[13px]'
const selectClassName =
  'rounded-md border border-[#ddd] bg-white px-3.5 py-2.5 text-sm'

// ─────────────────────────────────────────────────────────
// 500줄+ 컴포넌트 — UI, 비즈니스 로직, API, 포맷, 도메인 규칙이 한 파일에
// ─────────────────────────────────────────────────────────

export function ProductListPage() {
  const {
    category,
    minPrice,
    maxPrice,
    sortBy,
    searchQuery,
    page,
    inStockOnly,
    viewMode,
    apiQueryString,
    handleCategoryChange,
    handleMinPriceChange,
    handleMaxPriceChange,
    handleSortChange,
    handleSearchChange,
    handleInStockToggle,
    handleViewModeChange,
    handlePageChange,
    handleResetFilters,
  } = useProductListSearchParams({ pageSize: PAGE_SIZE })

  const { wishlist, handleWishlistToggle, handleProductClick } =
    useProductInteraction()

  const {
    data: productListData,
    error,
    isLoading,
    refetch: refetchProducts,
  } = useAsync(
    productService.getProductListOptions({ apiQueryString, inStockOnly }),
  )

  const products = productListData?.products ?? []
  const totalCount = productListData?.totalCount ?? 0

  // ─── 페이지가 바뀔 때 스크롤 맨 위로 ────────────────────
  useScrollToTopOnChange(page, { enabled: page > 0 })

  // ─── 로딩/에러는 early return ───────────────────────────
  if (isLoading && products.length === 0) {
    return <div className={loadingStateClassName}>로딩 중...</div>
  }

  if (error) {
    return (
      <div className={loadingStateClassName}>
        <p>오류가 발생했습니다: {error.message}</p>
        <button
          type="button"
          className="mt-3 cursor-pointer rounded-md border border-[#ddd] bg-white px-4 py-2"
          onClick={() => {
            void refetchProducts()
          }}
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px] p-6 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      <header className="mb-6">
        <h1 className="m-0 mb-1 text-[28px]">상품 목록</h1>
        <p className="m-0 text-sm text-[#666]">
          총 {totalCount.toLocaleString()}개의 상품
          <Show when={wishlist.length > 0}>
            <span> · 위시리스트 {wishlist.length}개</span>
          </Show>
        </p>
      </header>

      {/* ─── 필터 패널 ──────────────────────────────────── */}
      <section className="mb-4 flex flex-wrap items-end gap-6 rounded-lg bg-[#f7f7f8] p-4">
        <div className="flex flex-col gap-2">
          <span className={filterLabelClassName}>카테고리</span>
          <div className="flex flex-wrap gap-1.5">
            <For each={CATEGORIES}>
              {(cat) => (
                <button
                  type="button"
                  key={cat.value}
                  className={categoryButton({ active: category === cat.value })}
                  onClick={() => {
                    handleCategoryChange(cat.value)
                  }}
                >
                  {cat.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={filterLabelClassName}>가격 범위</span>
          <div className="flex items-center gap-2">
            <input
              aria-label="최소 가격"
              type="number"
              placeholder="최소"
              value={minPrice}
              onChange={handleMinPriceChange}
              min={0}
              className={priceInputClassName}
            />
            <span>~</span>
            <input
              aria-label="최대 가격"
              type="number"
              placeholder="최대"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              min={0}
              className={priceInputClassName}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className={filterLabelClassName}>옵션</span>
          <label className="flex items-center gap-1.5 text-[13px] font-normal">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={handleInStockToggle}
            />
            재고 있는 것만
          </label>
        </div>

        <button
          type="button"
          className="ml-auto cursor-pointer rounded-md border border-[#ddd] bg-white px-4 py-2 text-[13px]"
          onClick={handleResetFilters}
        >
          필터 초기화
        </button>
      </section>

      {/* ─── 검색 + 정렬 + 보기 모드 ───────────────────── */}
      <section className="mb-6 flex gap-3">
        <input
          aria-label="상품 검색"
          type="search"
          placeholder="상품 검색..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-1 rounded-md border border-[#ddd] px-3.5 py-2.5 text-sm"
        />
        <select
          aria-label="정렬 방식"
          className={selectClassName}
          value={sortBy}
          onChange={handleSortChange}
        >
          <For each={SORT_OPTIONS}>
            {(opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )}
          </For>
        </select>
        <select
          aria-label="보기 방식"
          className={selectClassName}
          value={viewMode}
          onChange={handleViewModeChange}
        >
          <option value="grid">그리드</option>
          <option value="list">리스트</option>
        </select>
      </section>

      {/* ─── 상품 그리드 ────────────────────────────────── */}
      <section
        className={cn(
          'mb-8 grid gap-5',
          viewMode === 'list' && 'grid-cols-1',
          viewMode !== 'list' &&
            'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]',
        )}
      >
        <Show
          when={products.length > 0}
          fallback={
            <div className="col-span-full py-[60px] text-center text-[#888]">
              조건에 맞는 상품이 없습니다.
            </div>
          }
        >
          <For each={products}>
            {(product) => {
              // ─── 위시리스트 여부 ────────────────────────
              const isWished = wishlist.includes(product.id)

              return (
                <ProductCard
                  key={product.id}
                  isWished={isWished}
                  product={product}
                  searchQuery={searchQuery}
                  onProductClick={handleProductClick}
                  onWishlistToggle={handleWishlistToggle}
                />
              )
            }}
          </For>
        </Show>
      </section>

      <Pagination
        currentPage={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />

      {/* ─── 백그라운드 로딩 인디케이터 ─────────────────── */}
      <Show when={isLoading && products.length > 0}>
        <div className="fixed right-5 bottom-5 rounded-[20px] bg-black/75 px-3.5 py-2 text-xs text-white">
          데이터 갱신 중...
        </div>
      </Show>
    </div>
  )
}
