import type { ChangeEvent } from 'react'

import { useSearchParams } from '@/shared/lib'

import { DEFAULT_PRODUCT_LIST_SEARCH_PARAMS } from './constants'
import { ProductListSearchParamsUtils } from './searchParams'
import type {
  ProductListCategoryFilter,
  ProductListUrlSearchParams,
  ProductListUrlSearchParamsPatch,
  UseProductListSearchParamsOptions,
  UseProductListSearchParamsReturn,
} from './types'

export function useProductListSearchParams({
  pageSize,
}: UseProductListSearchParamsOptions): UseProductListSearchParamsReturn {
  const [searchParams, setSearchParams] =
    useSearchParams<ProductListUrlSearchParams>()
  const state = ProductListSearchParamsUtils.toState(searchParams)
  const apiQueryString = ProductListSearchParamsUtils.toApiQueryString(
    state,
    pageSize,
  )

  const updateSearchParams = (patch: ProductListUrlSearchParamsPatch) => {
    setSearchParams(patch, { history: 'replace' })
  }

  const handleCategoryChange = (category: ProductListCategoryFilter) => {
    updateSearchParams({
      category: category === 'all' ? null : category,
      page: null,
    })
  }

  const handleMinPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({
      minPrice: ProductListSearchParamsUtils.toPricePatch(event.target.value),
      page: null,
    })
  }

  const handleMaxPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({
      maxPrice: ProductListSearchParamsUtils.toPricePatch(event.target.value),
      page: null,
    })
  }

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSortBy = event.target.value

    if (!ProductListSearchParamsUtils.isSortBy(nextSortBy)) {
      return
    }

    updateSearchParams({ sort: nextSortBy, page: null })
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ q: event.target.value || null, page: null })
  }

  const handleInStockToggle = (event: ChangeEvent<HTMLInputElement>) => {
    updateSearchParams({ inStock: event.target.checked || null, page: null })
  }

  const handleViewModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextViewMode = event.target.value

    if (!ProductListSearchParamsUtils.isViewMode(nextViewMode)) {
      return
    }

    updateSearchParams({
      viewMode:
        nextViewMode === DEFAULT_PRODUCT_LIST_SEARCH_PARAMS.viewMode
          ? null
          : nextViewMode,
    })
  }

  const handlePageChange = (nextPage: number) => {
    updateSearchParams({
      page:
        nextPage === DEFAULT_PRODUCT_LIST_SEARCH_PARAMS.page ? null : nextPage,
    })
  }

  const handleResetFilters = () => {
    updateSearchParams({
      category: null,
      q: null,
      page: null,
      sort: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      viewMode: null,
    })
  }

  return {
    ...state,
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
  }
}
