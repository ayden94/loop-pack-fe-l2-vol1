import { For, Show } from '@ilokesto/utilinent'

import {
  type Product,
  ProductList,
  type ProductListResponse,
  productRepository,
} from '@/entities/product'
import {
  useProductInteraction,
  useProductListSearchParams,
} from '@/features/product-list'
import { useAsync, useScrollToTopOnChange } from '@/shared/lib'

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
const categoryButtonClassName =
  'cursor-pointer rounded-2xl border border-[#ddd] bg-white px-3 py-1.5 text-[13px]'
const activeButtonClassName = 'border-[#111] bg-[#111] text-white'
const priceInputClassName =
  'w-[100px] rounded-md border border-[#ddd] px-2.5 py-1.5 text-[13px]'
const selectClassName =
  'rounded-md border border-[#ddd] bg-white px-3.5 py-2.5 text-sm'
const badgeClassName =
  'absolute rounded px-2 py-1 text-[11px] font-semibold text-white'
const paginationButtonClassName =
  'h-9 min-w-9 cursor-pointer rounded-md border border-[#ddd] bg-white text-[13px] disabled:cursor-not-allowed disabled:opacity-40'

// 검색어를 정규식에 안전하게 넣기 위한 escape (특수문자로 인한 RegExp 크래시 방지)
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
  } = useAsync({
    asyncFn: async () => {
      await productRepository.getProductList(apiQueryString)
    },
    deps: [apiQueryString],
    keepPreviousData: true,
    selectFn: (data: unknown): ProductListResponse => {
      const parsedData = new ProductList(data)

      return {
        products: inStockOnly
          ? parsedData.products.filter((product) => product.stock > 0)
          : parsedData.products,
        totalCount: parsedData.totalCount,
      }
    },
    selectDeps: [inStockOnly],
  })

  const products = productListData?.products ?? []
  const totalCount = productListData?.totalCount ?? 0

  // ─── 페이지가 바뀔 때 스크롤 맨 위로 ────────────────────
  useScrollToTopOnChange(page, { enabled: page > 0 })

  // ─── 페이지네이션 계산 (인라인) ─────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const pageNumbers: Array<number> = []
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)

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
                  className={`${categoryButtonClassName} ${category === cat.value ? activeButtonClassName : ''}`}
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
        className={`mb-8 grid gap-5 ${
          viewMode === 'list'
            ? 'grid-cols-1'
            : 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]'
        }`}
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
              // ─── 검색어 하이라이팅 로직 인라인 ──────────
              const highlightMatch = (text: string) => {
                if (!searchQuery) return <>{text}</>
                const escapedSearchQuery = escapeRegExp(searchQuery)
                const parts = text.split(
                  new RegExp(`(${escapedSearchQuery})`, 'gi'),
                )
                return (
                  <>
                    <For each={parts}>
                      {(part, index) => (
                        <Show
                          key={`${part}-${String(index)}`}
                          when={
                            part.toLowerCase() === searchQuery.toLowerCase()
                          }
                          fallback={part}
                        >
                          <mark className="bg-[#fff176] p-0">{part}</mark>
                        </Show>
                      )}
                    </For>
                  </>
                )
              }

              // ─── 도메인 규칙 인라인 계산 ─────────────────
              const discountRate = product.originalPrice
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0
              const formattedPrice = `${product.price.toLocaleString()}원`
              const formattedOriginal = product.originalPrice
                ? `${product.originalPrice.toLocaleString()}원`
                : null
              const isAlmostSoldOut = product.stock > 0 && product.stock <= 5
              const isSoldOut = product.stock === 0
              const isHot = discountRate >= 30
              const isBest = product.rating >= 4.5 && product.reviewCount >= 100
              const isFreeShipping = product.price >= 50000

              // ─── 날짜 포맷팅 인라인 ─────────────────────
              const createdDate = new Date(product.createdAt)
              const now = new Date()
              const daysSinceCreated = Math.floor(
                (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
              )
              const isNew = daysSinceCreated <= 7

              // ─── 위시리스트 여부 ────────────────────────
              const isWished = wishlist.includes(product.id)

              return (
                <div
                  key={product.id}
                  className="relative overflow-hidden rounded-lg border border-[#eee] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                >
                  <button
                    type="button"
                    className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
                    onClick={() => {
                      handleProductClick(product.id)
                    }}
                    aria-label={`${product.name} 최근 본 상품에 추가`}
                  />
                  <div className="relative aspect-square bg-[#f0f0f0]">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="block size-full object-cover"
                    />
                    <Show when={discountRate > 0}>
                      <span
                        className={`${badgeClassName} top-2 left-2 bg-[#e53935]`}
                      >
                        {discountRate}% 할인
                      </span>
                    </Show>
                    <Show when={isNew}>
                      <span
                        className={`${badgeClassName} top-2 right-2 bg-[#1e88e5]`}
                      >
                        NEW
                      </span>
                    </Show>
                    <Show when={isHot}>
                      <span
                        className={`${badgeClassName} top-9 left-2 bg-[#d81b60]`}
                      >
                        특가
                      </span>
                    </Show>
                    <Show when={isBest}>
                      <span
                        className={`${badgeClassName} top-9 right-2 bg-[#6a1b9a]`}
                      >
                        BEST
                      </span>
                    </Show>
                    <Show when={isSoldOut}>
                      <span
                        className={`${badgeClassName} bottom-2 left-2 bg-[#555]`}
                      >
                        품절
                      </span>
                    </Show>
                    <Show when={!isSoldOut && isAlmostSoldOut}>
                      <span
                        className={`${badgeClassName} bottom-2 left-2 bg-[#fb8c00]`}
                      >
                        품절 임박
                      </span>
                    </Show>
                  </div>

                  <div className="p-3">
                    <h3 className="m-0 mb-2 text-sm leading-[1.35] font-medium">
                      {highlightMatch(product.name)}
                    </h3>
                    <div className="mb-1.5 flex flex-col gap-0.5">
                      <Show when={formattedOriginal}>
                        <span className="text-xs text-[#999] line-through">
                          {formattedOriginal}
                        </span>
                      </Show>
                      <span className="text-base font-bold text-[#111]">
                        {formattedPrice}
                      </span>
                      <Show when={isFreeShipping}>
                        <span className="ml-1.5 text-[11px] font-semibold text-[#2e7d32]">
                          무료배송
                        </span>
                      </Show>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#666]">
                      <span className="font-semibold text-[#f9a825]">
                        ★ {product.rating.toFixed(1)}
                      </span>
                      <span>({product.reviewCount.toLocaleString()})</span>
                      <button
                        type="button"
                        className="relative z-20 ml-auto cursor-pointer border-0 bg-transparent text-base"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWishlistToggle(product.id)
                        }}
                        aria-label={`${product.name} 위시리스트 ${isWished ? '제거' : '추가'}`}
                        aria-pressed={isWished}
                      >
                        <Show when={isWished} fallback="♡">
                          ♥
                        </Show>
                      </button>
                    </div>
                  </div>
                </div>
              )
            }}
          </For>
        </Show>
      </section>

      {/* ─── 페이지네이션 ───────────────────────────────── */}
      <Show when={totalPages > 1}>
        <nav className="mb-6 flex justify-center gap-1">
          <button
            type="button"
            className={paginationButtonClassName}
            onClick={() => {
              handlePageChange(1)
            }}
            disabled={page === 1}
            aria-label="첫 페이지"
          >
            «
          </button>
          <button
            type="button"
            className={paginationButtonClassName}
            onClick={() => {
              handlePageChange(page - 1)
            }}
            disabled={page === 1}
            aria-label="이전 페이지"
          >
            ‹
          </button>
          <For each={pageNumbers}>
            {(p) => (
              <button
                type="button"
                key={p}
                className={`${paginationButtonClassName} ${
                  p === page ? activeButtonClassName : ''
                }`}
                onClick={() => {
                  handlePageChange(p)
                }}
              >
                {p}
              </button>
            )}
          </For>
          <button
            type="button"
            className={paginationButtonClassName}
            onClick={() => {
              handlePageChange(page + 1)
            }}
            disabled={page === totalPages}
            aria-label="다음 페이지"
          >
            ›
          </button>
          <button
            type="button"
            className={paginationButtonClassName}
            onClick={() => {
              handlePageChange(totalPages)
            }}
            disabled={page === totalPages}
            aria-label="마지막 페이지"
          >
            »
          </button>
        </nav>
      </Show>

      {/* ─── 백그라운드 로딩 인디케이터 ─────────────────── */}
      <Show when={isLoading && products.length > 0}>
        <div className="fixed right-5 bottom-5 rounded-[20px] bg-black/75 px-3.5 py-2 text-xs text-white">
          데이터 갱신 중...
        </div>
      </Show>
    </div>
  )
}
