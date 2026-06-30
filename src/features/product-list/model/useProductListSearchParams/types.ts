import type { ChangeEvent } from 'react'

import type {
  PRODUCT_LIST_CATEGORIES,
  PRODUCT_LIST_SORT_OPTIONS,
  PRODUCT_LIST_VIEW_MODES,
} from './constants'

export type ProductListCategory = (typeof PRODUCT_LIST_CATEGORIES)[number]
export type ProductListCategoryFilter = 'all' | ProductListCategory
export type ProductListSortBy = (typeof PRODUCT_LIST_SORT_OPTIONS)[number]
export type ProductListViewMode = (typeof PRODUCT_LIST_VIEW_MODES)[number]
export type ProductListPriceFilter = number | ''

export type ProductListUrlSearchParams = {
  readonly category?: ProductListCategory
  readonly q?: string
  readonly page?: number
  readonly sort?: ProductListSortBy
  readonly minPrice?: number
  readonly maxPrice?: number
  readonly inStock?: boolean
  readonly viewMode?: ProductListViewMode
}

export type ProductListUrlSearchParamsPatch = Readonly<{
  readonly [Key in keyof ProductListUrlSearchParams]?:
    | ProductListUrlSearchParams[Key]
    | null
    | undefined
}>

export type ProductListSearchParamsState = {
  readonly category: ProductListCategoryFilter
  readonly minPrice: ProductListPriceFilter
  readonly maxPrice: ProductListPriceFilter
  readonly sortBy: ProductListSortBy
  readonly searchQuery: string
  readonly page: number
  readonly inStockOnly: boolean
  readonly viewMode: ProductListViewMode
}

export type UseProductListSearchParamsOptions = {
  readonly pageSize: number
}

export type UseProductListSearchParamsReturn = ProductListSearchParamsState & {
  readonly apiQueryString: string
  readonly handleCategoryChange: (category: ProductListCategoryFilter) => void
  readonly handleMinPriceChange: (event: ChangeEvent<HTMLInputElement>) => void
  readonly handleMaxPriceChange: (event: ChangeEvent<HTMLInputElement>) => void
  readonly handleSortChange: (event: ChangeEvent<HTMLSelectElement>) => void
  readonly handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
  readonly handleInStockToggle: (event: ChangeEvent<HTMLInputElement>) => void
  readonly handleViewModeChange: (event: ChangeEvent<HTMLSelectElement>) => void
  readonly handlePageChange: (nextPage: number) => void
  readonly handleResetFilters: () => void
}
