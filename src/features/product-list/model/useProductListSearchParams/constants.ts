export const PRODUCT_LIST_CATEGORIES = [
  'electronics',
  'fashion',
  'home',
  'beauty',
] as const

export const PRODUCT_LIST_SORT_OPTIONS = [
  'latest',
  'popular',
  'price-asc',
  'price-desc',
] as const

export const PRODUCT_LIST_VIEW_MODES = ['grid', 'list'] as const

export const DEFAULT_PRODUCT_LIST_SEARCH_PARAMS = {
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
  searchQuery: '',
  page: 1,
  inStockOnly: false,
  viewMode: 'grid',
} as const
