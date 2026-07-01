import { Show } from '@ilokesto/utilinent'

import { productService } from '@/entities/product'
import {
  useProductInteraction,
  useProductListSearchParams,
} from '@/features/product-list'
import { useAsync, useScrollToTopOnChange } from '@/shared/lib'
import { Pagination } from '@/shared/ui'
import {
  ProductGrid,
  ProductListFilterPanel,
  ProductListHeader,
  ProductListToolbar,
} from '@/widgets/product-list'

const PAGE_SIZE = 12

const loadingStateClassName = 'py-20 px-5 text-center text-[#555]'

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
    <div className="mx-auto max-w-300 p-6 font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      <ProductListHeader
        totalCount={totalCount}
        wishlistCount={wishlist.length}
      />

      <ProductListFilterPanel
        category={category}
        inStockOnly={inStockOnly}
        maxPrice={maxPrice}
        minPrice={minPrice}
        onCategoryChange={handleCategoryChange}
        onInStockToggle={handleInStockToggle}
        onMaxPriceChange={handleMaxPriceChange}
        onMinPriceChange={handleMinPriceChange}
        onResetFilters={handleResetFilters}
      />

      <ProductListToolbar
        searchQuery={searchQuery}
        sortBy={sortBy}
        viewMode={viewMode}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onViewModeChange={handleViewModeChange}
      />

      <ProductGrid
        products={products}
        searchQuery={searchQuery}
        viewMode={viewMode}
        wishlist={wishlist}
        onProductClick={handleProductClick}
        onWishlistToggle={handleWishlistToggle}
      />

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
